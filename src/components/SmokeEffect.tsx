import { useEffect, useRef } from 'react';
import { wheelController } from '../lib/wheelController';

/**
 * Burnout-Rauch in drei räumlichen Ebenen (Canvas 2D, prozedurale Texturen).
 *
 *  Ebene 1 – Hintergrund (Canvas hinten, hinter Reifen + Kreis):
 *            grosse, dünnere Schwaden, werden von der Luftströmung weit nach
 *            links getragen (bei langer Rotation bis in die linke Hälfte).
 *  Ebene 2 – Mitte (Canvas hinten): dichte, kontrastreiche Wolken direkt am
 *            Reifenaufstandspunkt, unterhalb und seitlich des Reifens.
 *  Ebene 3 – Vordergrund (zweites Canvas NUR über dem Reifenbereich, über dem
 *            Reifen, unter Kreis/UI): halbtransparente Schleier, die vor der
 *            Felge vorbeiziehen und sie stellenweise verdecken.
 *
 * Realismus:
 *  - Rauch-Texturen werden beim Start prozedural erzeugt (fraktales Rauschen)
 *    und SELBSTVERSCHATTET: Licht von oben links → dunkle Kerne, helle Kanten.
 *  - Zusätzliche Kantenlicht-Textur: Schwaden nahe am Elfenbein-Kreis bekommen
 *    dezent hellere Kanten (Lichtschein des Kreises).
 *  - Wirbelfeld + Drall um den Reifen + Luftströmung nach links, die mit der
 *    Rotationsdauer zunimmt; Auftrieb; Bodenkontakt am unteren Rand.
 *  - Nach dem Stopp: keine neue Produktion, vorhandener Rauch zieht weiter,
 *    verteilt sich und löst sich langsam auf.
 *
 * Warum kein WebGL/Three.js? Die Qualität entsteht hier vor allem durch die
 * Texturen und die Bewegung; ein WebGL-Fluid-Solver wäre deutlich schwerer
 * (Bundle + GPU) bei ähnlichem Eindruck. Gerendert wird mit halber Auflösung.
 */

type Layer = 'back' | 'mid' | 'front';

interface P {
  layer: Layer;
  x: number; y: number; vx: number; vy: number;
  size: number; grow: number; rot: number; vr: number;
  life: number; max: number; alpha: number;
  sprite: number; dark: boolean; drift: number; seed: number;
}

const SPRITE = 224;
const VARIANTS = 6;

/** Value-Noise */
function makeNoise(seed: number) {
  const N = 64;
  const g = new Float32Array(N * N);
  let s = seed;
  for (let i = 0; i < g.length; i++) { s = (s * 16807) % 2147483647; g[i] = s / 2147483647; }
  const at = (x: number, y: number) => g[((y & (N - 1)) * N) + (x & (N - 1))];
  const sm = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = sm(x - xi), yf = sm(y - yi);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

interface SpriteBank { main: HTMLCanvasElement[]; dark: HTMLCanvasElement[]; rim: HTMLCanvasElement[] }

/**
 * Erzeugt die Texturen schrittweise (eine Variante pro Frame), damit der
 * Hauptthread beim Laden nicht blockiert und Reifen/Intro sofort starten.
 */
function makeSpritesAsync(bank: SpriteBank, isCancelled: () => boolean) {
  let k = 0;
  const step = () => {
    if (isCancelled() || k >= VARIANTS) return;
    makeVariant(bank, k++);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function makeVariant(bank: SpriteBank, k: number) {
  const S = SPRITE;
  {
    const noise = makeNoise(7919 * (k + 3));
    const wispy = k >= 4;
    // 1) Dichtefeld
    //    k < 4: "Blumenkohl"-Schwaden aus vielen überlappenden Kugeln (dichter Reifenrauch)
    //    k ≥ 4: fasrige Schleier aus fraktalem Rauschen (dünner, weiter getragener Rauch)
    const d = new Float32Array(S * S);
    let seed = 1234 + k * 977;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const lobes = Array.from({ length: wispy ? 0 : 16 + Math.floor(rand() * 8) }, () => {
      const a = rand() * Math.PI * 2, rr = Math.pow(rand(), 0.7) * 0.27;
      return { x: 0.5 + Math.cos(a) * rr, y: 0.54 + Math.sin(a) * rr * 0.8, r: 0.07 + rand() * 0.13 };
    });
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const nx = x / S, ny = y / S;
        const wx = nx + (noise(nx * 3 + 11, ny * 3) - 0.5) * (wispy ? 0.35 : 0.08);
        const wy = ny + (noise(nx * 3, ny * 3 + 7) - 0.5) * (wispy ? 0.35 : 0.08);
        let f = 0, amp = 0.55, freq = wispy ? 2.6 : 5;
        for (let o = 0; o < 5; o++) { f += noise(wx * freq + k * 17, wy * freq + k * 5) * amp; amp *= 0.5; freq *= 2.1; }
        let v: number;
        if (wispy) {
          const dx = wx - 0.5, dy = (wy - 0.5) * 1.5;
          const dist = Math.sqrt(dx * dx + dy * dy) * 2;
          v = dist >= 1 ? 0 : (f - 0.4) * 2.1 * Math.pow(1 - dist, 2.3);
        } else {
          let sum = 0;
          for (const l of lobes) {
            const q = 1 - Math.hypot(wx - l.x, wy - l.y) / l.r;
            if (q > 0) sum += q * q * (3 - 2 * q);
          }
          const edge = Math.max(0, 1 - Math.hypot(nx - 0.5, ny - 0.5) * 2.05);
          v = Math.min(1, sum) * (0.62 + 0.55 * (f - 0.25)) * Math.min(1, edge * 4);
        }
        d[y * S + x] = Math.max(0, Math.min(1, v));
      }
    }
    const D = (x: number, y: number) => {
      const xi = Math.max(0, Math.min(S - 1, Math.round(x))), yi = Math.max(0, Math.min(S - 1, Math.round(y)));
      return d[yi * S + xi];
    };
    // 2) Selbstverschattung: Licht von oben links
    const mk = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
    const cm = mk(), cd = mk(), cr = mk();
    const im = cm.getContext('2d')!.createImageData(S, S);
    const id = cd.getContext('2d')!.createImageData(S, S);
    const ir = cr.getContext('2d')!.createImageData(S, S);
    const lx = -0.72, ly = -0.69;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const v = d[y * S + x];
        if (v <= 0.002) continue;
        const occl = (D(x + lx * 6, y + ly * 6) * 1.2 + D(x + lx * 13, y + ly * 13) + D(x + lx * 24, y + ly * 24) * 0.8) / 3;
        const b = Math.max(0.06, Math.min(1, 1.08 - occl * 1.6 - v * 0.18));
        const gray = 26 + b * 210;
        const i = (y * S + x) * 4;
        const a = Math.min(255, v * 255 * 1.05);
        im.data[i] = gray; im.data[i + 1] = gray - 1; im.data[i + 2] = gray - 4; im.data[i + 3] = a;
        const dg = gray * 0.52;
        id.data[i] = dg; id.data[i + 1] = dg; id.data[i + 2] = dg - 2; id.data[i + 3] = a;
        // Kantenlicht von links (für die Nähe zum Kreis)
        const edge = Math.max(0, v - D(x - 11, y) * 1.15);
        ir.data[i] = 246; ir.data[i + 1] = 240; ir.data[i + 2] = 228; ir.data[i + 3] = Math.min(255, edge * 255 * 1.6);
      }
    }
    cm.getContext('2d')!.putImageData(im, 0, 0);
    cd.getContext('2d')!.putImageData(id, 0, 0);
    cr.getContext('2d')!.putImageData(ir, 0, 0);
    bank.main[k] = cm; bank.dark[k] = cd; bank.rim[k] = cr;
  }
}

export function SmokeEffect() {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (wheelController.reducedMotion) return;
    const back = backRef.current!;
    const front = frontRef.current!;
    const bctx = back.getContext('2d')!;
    const fctx = front.getContext('2d')!;
    const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 1024;
    const SCALE = lowPower ? 0.4 : 0.5;
    const MAX = lowPower ? 170 : 320;
    const sprites: SpriteBank = { main: [], dark: [], rim: [] };
    let cancelled = false;
    makeSpritesAsync(sprites, () => cancelled);
    const ps: P[] = [];

    let w = 0, h = 0, u = 1;
    let wheel = { cx: 0, cy: 0, r: 200 };
    // sichtbarer Teil des Rades (Schnitt mit dem Viewport) – dort entsteht der Rauch
    let vis = { l: 0, r: 0, t: 0, b: 0, w: 1, h: 1 };
    let circle = { cx: 0, cy: 0, r: 0 };
    let fr = { x: 0, y: 0, w: 1, h: 1 }; // Frontbereich (Hero-Koordinaten)
    let raf = 0, last = performance.now(), carry = 0, wind = 0;

    /** Setzt die Canvas-Grösse NUR bei echter Änderung – jede Zuweisung löscht den Inhalt. */
    const sizeCanvas = (c: HTMLCanvasElement, cw: number, ch: number) => {
      const W = Math.max(1, Math.round(cw * SCALE)), H = Math.max(1, Math.round(ch * SCALE));
      if (c.width !== W) c.width = W;
      if (c.height !== H) c.height = H;
    };

    /** Kreis nur für das Kantenlicht lesen – ändert keine Canvas-Grössen. */
    const measureCircle = () => {
      const hero = back.getBoundingClientRect();
      const cEl = document.querySelector('.circle');
      if (cEl) {
        const r = cEl.getBoundingClientRect();
        circle = { cx: r.left - hero.left + r.width / 2, cy: r.top - hero.top + r.height / 2, r: Math.min(r.width, r.height) / 2 };
      }
    };

    /** Layout von Hero + Rad (nur bei Fenster-/Radgrössen-Änderung). */
    const measure = () => {
      const hero = back.getBoundingClientRect();
      w = hero.width; h = hero.height;
      sizeCanvas(back, w, h);
      u = Math.min(1.35, Math.max(0.5, w / 1440));
      const wEl = document.querySelector('.wheel');
      if (wEl) {
        const r = wEl.getBoundingClientRect();
        wheel = { cx: r.left - hero.left + r.width / 2, cy: r.top - hero.top + r.height / 2, r: r.width / 2 };
        const l = Math.max(0, r.left - hero.left), rr = Math.min(w, r.right - hero.left);
        const t = Math.max(0, r.top - hero.top), b = Math.min(h, r.bottom - hero.top);
        vis = { l, r: rr, t, b, w: Math.max(1, rr - l), h: Math.max(1, b - t) };
      }
      measureCircle();
      // Vordergrund-Bereich hängt nur vom Rad ab (nicht vom animierten Kreis);
      // der Kreis liegt per z-index ohnehin darüber.
      const minX = Math.max(w * 0.5, vis.l - vis.w * 1.8);
      const minY = Math.max(0, vis.t + vis.h * 0.1);
      const nfr = { x: Math.round(minX), y: Math.round(minY), w: Math.max(1, Math.round(w - minX)), h: Math.max(1, Math.round(h - minY)) };
      if (nfr.x !== fr.x || nfr.y !== fr.y || nfr.w !== fr.w || nfr.h !== fr.h) {
        fr = nfr;
        Object.assign(front.style, { left: `${fr.x}px`, top: `${fr.y}px`, width: `${fr.w}px`, height: `${fr.h}px` });
      }
      sizeCanvas(front, fr.w, fr.h);
    };

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const spawn = (layer: Layer, speed: number, reach: number) => {
      if (ps.length >= MAX) return;
      const { r } = wheel;
      // Aufstandsbereich: unterer Rand des sichtbaren Radteils
      const contactX = vis.l + vis.w * 0.45, contactY = Math.min(h - 4, vis.b - vis.h * 0.03);
      let p: P;
      if (layer === 'mid') {
        p = {
          layer, x: contactX + rnd(-0.9, 0.9) * vis.w * 0.6, y: contactY - rnd(0, 0.1) * r,
          vx: -rnd(140, 340) * u * (0.6 + speed * 0.5), vy: -rnd(0, 70) * u,
          size: rnd(42, 95) * u, grow: rnd(16, 34) * u, rot: rnd(-0.25, 0.25), vr: rnd(-0.1, 0.1),
          life: 0, max: rnd(3.5, 6.5) + reach * 2.5, alpha: rnd(0.8, 1),
          sprite: Math.floor(Math.random() * 4), dark: Math.random() < 0.35, drift: rnd(0.45, 0.8), seed: Math.random() * 1000,
        };
      } else if (layer === 'back') {
        p = {
          layer, x: vis.l + rnd(0, 0.9) * vis.w, y: vis.b - rnd(0.03, 0.45) * vis.h,
          vx: -rnd(60, 200) * u, vy: -rnd(30, 95) * u,
          size: rnd(70, 130) * u, grow: rnd(22, 46) * u, rot: rnd(-0.25, 0.25), vr: rnd(-0.08, 0.08),
          life: 0, max: rnd(7, 11) + reach * 7, alpha: rnd(0.5, 0.85),
          sprite: Math.random() < 0.6 ? Math.floor(Math.random() * 4) : 4 + Math.floor(Math.random() * 2), dark: Math.random() < 0.5, drift: rnd(0.85, 1.25), seed: Math.random() * 1000,
        };
      } else {
        // Vordergrund: dichtere Schwaden direkt vor Reifen und Felge, die
        // aufsteigen und nach links vor dem Rad vorbeiziehen
        const dense = Math.random() < 0.55;
        p = {
          layer, x: vis.l + rnd(0.0, 1) * vis.w, y: vis.b - rnd(0.02, dense ? 0.35 : 0.7) * vis.h,
          vx: -rnd(25, 130) * u, vy: -rnd(20, 80) * u,
          size: rnd(dense ? 60 : 80, dense ? 120 : 150) * u, grow: rnd(22, 48) * u, rot: rnd(-0.25, 0.25), vr: rnd(-0.1, 0.1),
          life: 0, max: rnd(3.2, 6.5) + reach * 1.5, alpha: dense ? rnd(0.55, 0.85) : rnd(0.3, 0.5),
          sprite: dense ? Math.floor(Math.random() * 4) : 4 + Math.floor(Math.random() * 2),
          dark: false, drift: rnd(0.25, 0.55), seed: Math.random() * 1000,
        };
      }
      ps.push(p);
    };

    const draw = (ctx: CanvasRenderingContext2D, p: P, a: number, ox: number, oy: number, nearCircle: number) => {
      const s = p.size * 2.3;
      const flat = p.y > h - p.size * 0.4 ? 0.62 : 0.86;
      const img = (p.dark ? sprites.dark : sprites.main)[p.sprite];
      if (!img) return; // Textur noch nicht erzeugt (nur in den ersten Frames)
      ctx.save();
      ctx.translate(p.x - ox, p.y - oy);
      ctx.rotate(p.rot);
      ctx.globalAlpha = a;
      ctx.drawImage(img, -s / 2, (-s / 2) * flat, s, s * flat);
      if (nearCircle > 0.02) {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = a * nearCircle * 0.55;
        ctx.drawImage(sprites.rim[p.sprite], -s / 2, (-s / 2) * flat, s, s * flat);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.restore();
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      const speed = wheelController.currentSpeed;
      const emitting = wheelController.isActive && speed > 0.1;
      const reach = Math.min(1, wheelController.activeSeconds / 7);
      wind += ((22 + 190 * reach) * u - wind) * Math.min(1, dt * 0.55);

      if (emitting) {
        // je länger die Rotation, desto mehr Rauch
        const rate = (26 + 44 * Math.min(1, wheelController.activeSeconds / 5)) * speed;
        carry += dt * rate;
        while (carry > 1) {
          const q = Math.random();
          spawn(q < 0.36 ? 'mid' : q < 0.6 ? 'back' : 'front', speed, reach);
          carry -= 1;
        }
      } else carry = 0;

      bctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      bctx.clearRect(0, 0, w, h);
      fctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      fctx.clearRect(0, 0, fr.w, fr.h);

      const density = 1 / (1 + Math.max(0, ps.length - MAX * 0.45) / (MAX * 0.5));
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        const k = p.life / p.max;
        if (k >= 1 || p.x < -p.size * 2.5 || p.y < -p.size * 2) { ps.splice(i, 1); continue; }

        // Turbulenz
        const sx = p.x * 0.0032, sy = p.y * 0.0042;
        const tx = Math.sin(sy * 2.3 + t * 0.6 + p.seed) + Math.sin(sx * 1.4 - t * 0.37) * 0.6;
        const ty = Math.cos(sx * 1.8 + t * 0.48 + p.seed * 0.5) + Math.cos(sy * 1.2 + t * 0.33) * 0.5;
        const turb = (16 + 34 * k) * u;
        // Drall um den rotierenden Reifen (im Uhrzeigersinn)
        const dx = p.x - wheel.cx, dy = p.y - wheel.cy;
        const dist = Math.hypot(dx, dy) || 1;
        const swirlF = speed * Math.max(0, 1 - dist / (wheel.r * 1.5)) * 120 * u;
        const swx = (-dy / dist) * swirlF, swy = (dx / dist) * swirlF;

        p.vx += (-wind * p.drift - p.vx) * 0.85 * dt;
        const nearFloor = p.y > h - p.size * 0.35;
        p.vy += (-(13 + 12 * (1 - k)) * u * (nearFloor ? 0.2 : 1) - p.vy) * 0.6 * dt;
        p.x += (p.vx + tx * turb + swx) * dt;
        p.y += (p.vy + ty * turb * 0.55 + swy) * dt;
        if (p.y > h - 6) { p.y = h - 6; p.vy = Math.min(0, p.vy); }
        p.size += p.grow * dt * (1 - k * 0.55);
        p.rot += p.vr * dt;

        const fadeIn = Math.min(1, p.life / 0.4);
        let a = p.alpha * fadeIn * Math.pow(1 - k, 1.6);
        if (p.layer === 'back') a *= 0.3;
        else if (p.layer === 'mid') a *= 0.72;
        else a *= 0.66;
        // je mehr Rauch gleichzeitig existiert, desto transparenter jede Schwade
        // → dichte Wolken bleiben strukturiert statt zu flächigem Grau zu verschmelzen
        a *= density;
        if (a < 0.004) continue;

        // Nähe zum Kreisrand → Kantenlicht
        const dc = Math.hypot(p.x - circle.cx, p.y - circle.cy) - circle.r;
        const near = circle.r > 0 ? Math.max(0, 1 - Math.max(0, dc) / 260) : 0;

        if (p.layer === 'front') {
          // nur innerhalb des Reifenbereichs, weich ausgeblendet zu den Rändern
          if (p.x < fr.x - p.size * 1.2) continue;
          draw(fctx, p, a, fr.x, fr.y, 0);
        } else draw(bctx, p, a, 0, 0, near);
      }

      // Vordergrund-Ebene weich zu ihren Rändern ausblenden → keine sichtbare Kante
      if (fr.w > 1) {
        fctx.save();
        fctx.globalCompositeOperation = 'destination-in';
        const gx = fctx.createLinearGradient(0, 0, fr.w, 0);
        gx.addColorStop(0, 'rgba(0,0,0,0)');
        gx.addColorStop(0.45, 'rgba(0,0,0,1)');
        fctx.fillStyle = gx;
        fctx.fillRect(0, 0, fr.w, fr.h);
        const gy = fctx.createLinearGradient(0, 0, 0, fr.h);
        gy.addColorStop(0, 'rgba(0,0,0,0)');
        gy.addColorStop(0.35, 'rgba(0,0,0,1)');
        fctx.fillStyle = gy;
        fctx.fillRect(0, 0, fr.w, fr.h);
        fctx.restore();
      }

      if (emitting || ps.length > 0 || speed > 0) raf = requestAnimationFrame(frame);
      else raf = 0;
    };

    const start = () => {
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(back);
    const wEl = document.querySelector('.wheel');
    if (wEl) ro.observe(wEl);
    // Kreis animiert beim Menüwechsel → nur Position fürs Kantenlicht nachführen
    const roCircle = new ResizeObserver(measureCircle);
    const cEl = document.querySelector('.circle');
    if (cEl) roCircle.observe(cEl);
    window.addEventListener('resize', measure);
    const unsub = wheelController.subscribe((s) => { if (s > 0) start(); });
    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      roCircle.disconnect();
      window.removeEventListener('resize', measure);
      unsub();
    };
  }, []);

  return (
    <>
      <canvas ref={backRef} className="smoke-canvas" aria-hidden="true" />
      <canvas ref={frontRef} className="smoke-canvas smoke-canvas--front" aria-hidden="true" />
    </>
  );
}
