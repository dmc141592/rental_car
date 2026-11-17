/**
 * Zentrale Steuerung für Reifenrotation + Rauch – bewusst ausserhalb von React,
 * damit Hover keine Re-Renders auslöst. Ein einziger rAF-Loop berechnet
 * Drehzahl & Winkel und schreibt die Transforms direkt ins DOM.
 *
 * Zustandsmodell (keine setTimeout-Timer → nichts kann sich überlappen):
 *   active = introUntil > now  ODER  mindestens ein Hover-Hold aktiv
 *
 *   - Erstes Laden:          startIntro(6000) – einmalig, exakt 6 s
 *   - Hover DATUM/AUTOS:     hold('tab-date' | 'tab-cars') / release(...)
 *   - Hover Reifen:          hold('wheel') / release('wheel')
 *   - Klick DATUM/AUTOS:     löst NICHTS aus (nur Menüwechsel)
 *
 * Holds sind ein Set mit festen Schlüsseln: schnelles Hin- und Herwechseln
 * zwischen Menüpunkten kann weder doppelte Starts noch "hängende" Zustände
 * erzeugen. Nach dem letzten release läuft der Reifen sanft aus.
 */

type Listener = (speed: number) => void;

const MAX_DEG_PER_SEC = 1500; // ~4 Umdrehungen/s bei Vollgas
const ACCEL = 1.8; // Anteil/s → ~0.55 s bis Vollgas
const DECEL = 1.25; // Anteil/s → ~0.8 s sanftes Auslaufen

/** Ein rotierendes Element; `base` ist seine feste 3D-Lage (z. B. translateZ). */
export interface Spinner {
  el: HTMLElement | SVGElement;
  base?: string;
}

interface Ghost {
  el: HTMLElement | SVGElement;
  base?: string;
  /** Winkel-Nachlauf in Grad bei voller Drehzahl */
  lag: number;
  /** maximale Deckkraft */
  opacity: number;
}

class WheelController {
  private holds = new Set<string>();
  private introUntil = 0;
  private speed = 0; // 0..1
  private angle = 0;
  private raf = 0;
  private last = 0;
  private els: Spinner[] = [];
  private ghosts: Ghost[] = [];
  private blurEl: HTMLElement | SVGElement | null = null;
  private listeners = new Set<Listener>();
  /** Wie lange (s) der Reifen ununterbrochen aktiv ist – steuert die Rauchausbreitung. */
  activeSeconds = 0;
  readonly reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  attach(els: Spinner[], blurEl: HTMLElement | SVGElement | null, ghosts: Ghost[] = []) {
    this.els = els.filter((e) => e.el);
    this.blurEl = blurEl;
    this.ghosts = ghosts;
    this.apply();
  }

  get isActive() {
    return this.holds.size > 0 || performance.now() < this.introUntil;
  }
  get currentSpeed() {
    return this.speed;
  }

  /** Nur für das erste Laden gedacht. */
  startIntro(ms: number) {
    this.introUntil = performance.now() + ms;
    this.kick();
  }
  hold(key: string) {
    this.holds.add(key);
    this.kick();
  }
  release(key: string) {
    this.holds.delete(key);
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private kick() {
    if (this.reducedMotion) return;
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const active = this.isActive;
    if (active) {
      this.speed = Math.min(1, this.speed + ACCEL * dt);
      this.activeSeconds += dt;
    } else {
      this.speed = Math.max(0, this.speed - DECEL * dt * (0.4 + this.speed));
      // Ausbreitungs-"Gedächtnis" baut langsam ab
      this.activeSeconds = Math.max(0, this.activeSeconds - dt * 0.6);
    }
    this.angle = (this.angle + MAX_DEG_PER_SEC * ease(this.speed) * dt) % 360;
    this.apply();
    this.listeners.forEach((l) => l(this.speed));

    if (active || this.speed > 0.0005 || this.activeSeconds > 0) this.raf = requestAnimationFrame(this.tick);
    else {
      this.speed = 0;
      this.raf = 0;
      this.listeners.forEach((l) => l(0));
    }
  };

  private apply() {
    const t = `rotate(${this.angle}deg)`;
    for (const e of this.els) e.el.style.transform = e.base ? `${e.base} ${t}` : t;
    const s = ease(this.speed);
    for (const g of this.ghosts) {
      g.el.style.transform = `${g.base ?? ''} rotate(${this.angle - g.lag * s}deg)`;
      g.el.style.opacity = String(g.opacity * Math.max(0, s - 0.08));
    }
    if (this.blurEl) this.blurEl.style.opacity = String(Math.max(0, s - 0.55) * 1.4);
  }
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export const wheelController = new WheelController();
