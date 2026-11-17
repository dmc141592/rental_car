import { useEffect, useRef, type CSSProperties } from 'react';
import { wheelController } from '../lib/wheelController';
import { WHEEL_ASSET } from '../data/assets';

/**
 * Sportwagenrad in Seitenansicht (frontal auf die Felge).
 * Inspiration: satinschwarze Schmiedefelge mit 10 Y-Speichen, gelochte
 * Bremsscheibe, roter Bremssattel, Zentralverschluss (ohne Markenlogo).
 *
 * Aufbau in Ebenen (jede Ebene ein eigenes, GPU-transformiertes Element):
 *   Reifen (rotiert) → Felgenbett (statisch) → Bremsscheibe (rotiert)
 *   → Bremssattel (statisch) → Speichen-Nachzieher (Unschärfe) → Speichen (rotiert)
 *   → Felgenhorn + Licht (statisch: Glanz bleibt stehen wie in echt)
 *
 * Asset-Slot: src/data/assets.ts → WHEEL_ASSET ersetzt nur die Speichen-Ebene.
 */
export function AnimatedWheel({ style }: { style?: CSSProperties }) {
  const tireRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const spokesRef = useRef<HTMLDivElement>(null);
  const g1 = useRef<HTMLDivElement>(null);
  const g2 = useRef<HTMLDivElement>(null);
  const g3 = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wheelController.attach(
      [{ el: tireRef.current! }, { el: discRef.current! }, { el: spokesRef.current! }],
      blurRef.current,
      [
        { el: g1.current!, lag: 6, opacity: 0.55 },
        { el: g2.current!, lag: 12, opacity: 0.36 },
        { el: g3.current!, lag: 19, opacity: 0.2 },
      ],
    );
    return () => wheelController.attach([], null, []);
  }, []);

  useEffect(() => () => wheelController.release('wheel'), []);

  return (
    <div
      className="wheel"
      style={style}
      onPointerEnter={() => wheelController.hold('wheel')}
      onPointerLeave={() => wheelController.release('wheel')}
      aria-hidden="true"
    >
      <div ref={tireRef} className="wl"><Tire /></div>

      {/* Felgenbett – tiefschwarz, rotationssymmetrisch */}
      <div className="wl">
        <svg viewBox="-500 -500 1000 1000" className="wl-svg">
          <defs>
            <radialGradient id="wbBarrel" r="0.5">
              <stop offset="0.5" stopColor="#050505" />
              <stop offset="0.9" stopColor="#141416" />
              <stop offset="1" stopColor="#060606" />
            </radialGradient>
          </defs>
          <circle r="384" fill="url(#wbBarrel)" />
        </svg>
      </div>

      <div ref={discRef} className="wl"><BrakeDisc /></div>

      {/* Bremssattel – steht still */}
      <div className="wl"><Caliper /></div>

      {[g3, g2, g1].map((ref, i) => (
        <div key={i} ref={ref} className="wl" style={{ opacity: 0 }}>
          <Spokes ghost />
        </div>
      ))}

      <div ref={spokesRef} className="wl">
        {WHEEL_ASSET ? <img src={WHEEL_ASSET} alt="" className="wheel-asset" /> : <Spokes />}
      </div>

      <div ref={blurRef} className="wl" style={{ opacity: 0 }}>
        <div className="wheel-blur" />
      </div>

      {/* Felgenhorn + feststehendes Licht */}
      <div className="wl">
        <svg viewBox="-500 -500 1000 1000" className="wl-svg">
          <defs>
            <linearGradient id="wbLip" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor="#2c2e32" />
              <stop offset="0.3" stopColor="#0d0d0f" />
              <stop offset="0.7" stopColor="#070708" />
              <stop offset="1" stopColor="#1c1d20" />
            </linearGradient>
            <radialGradient id="wbGlare" cx="0.28" cy="0.3" r="0.6">
              <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
              <stop offset="0.6" stopColor="#fff" stopOpacity="0.015" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="wbVig" cx="0.4" cy="0.4" r="0.72">
              <stop offset="0.6" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.5" />
            </radialGradient>
          </defs>
          <circle r="380" fill="none" stroke="url(#wbLip)" strokeWidth="15" />
          {/* gedrehte Kante: feiner, heller Ring wie bei geschmiedeten Felgen */}
          <circle r="388" fill="none" stroke="#6b7078" strokeOpacity="0.35" strokeWidth="1.8" />
          <path d="M -333 -196 A 388 388 0 0 1 -100 -375" fill="none" stroke="#e8ecf0" strokeOpacity="0.45" strokeWidth="2.6" />
          <circle r="378" fill="url(#wbGlare)" />
          <circle r="500" fill="url(#wbVig)" />
        </svg>
      </div>
    </div>
  );
}

/** Reifen mit Lauffläche am Rand und erhabener Flankenschrift. */
function Tire() {
  const treads = Array.from({ length: 96 }, (_, i) => (i * 360) / 96);
  const text = 'APEX SPORTCONTACT · 305/30 ZR21 (104Y) XL · N0 · APEX SPORTCONTACT · 305/30 ZR21 (104Y) XL · N0 ·';
  return (
    <svg viewBox="-500 -500 1000 1000" className="wl-svg">
      <defs>
        <radialGradient id="wtR" r="0.5">
          <stop offset="0.77" stopColor="#0a0a0b" />
          <stop offset="0.85" stopColor="#151517" />
          <stop offset="0.92" stopColor="#1a1a1c" />
          <stop offset="0.965" stopColor="#0d0d0e" />
          <stop offset="1" stopColor="#040404" />
        </radialGradient>
        <path id="wtTxt" d="M -446 0 A 446 446 0 1 1 446 0 A 446 446 0 1 1 -446 0" />
      </defs>
      <circle r="498" fill="url(#wtR)" />
      {treads.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M -9 -499 L 9 -499 L 7 -476 L -7 -476 Z" fill="#030303" />
          <path d="M -9 -499 L -7 -476" stroke="#232325" strokeWidth="1.2" />
        </g>
      ))}
      <circle r="470" fill="none" stroke="#060606" strokeWidth="3" />
      <circle r="410" fill="none" stroke="#1d1d1f" strokeWidth="4" />
      <circle r="394" fill="none" stroke="#050505" strokeWidth="6" />
      <text fontSize="24" letterSpacing="8" fontWeight="800" fontFamily="Manrope, sans-serif" fill="#040404" transform="translate(1.6 1.6)">
        <textPath href="#wtTxt">{text}</textPath>
      </text>
      <text fontSize="24" letterSpacing="8" fontWeight="800" fontFamily="Manrope, sans-serif" fill="#2a2a2d">
        <textPath href="#wtTxt">{text}</textPath>
      </text>
    </svg>
  );
}

/** Gelochte, innenbelüftete Bremsscheibe mit Topf. */
function BrakeDisc() {
  const holes: JSX.Element[] = [];
  // 3 versetzte Lochreihen in 24 Gruppen (typisches Bohrbild)
  for (let g = 0; g < 24; g++) {
    for (let row = 0; row < 3; row++) {
      const a = ((g * 15 + row * 5) * Math.PI) / 180;
      const r = 200 + row * 30;
      holes.push(<circle key={`${g}-${row}`} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r="6" fill="#0a0a0b" />);
    }
  }
  return (
    <svg viewBox="-500 -500 1000 1000" className="wl-svg">
      <g transform="scale(1.11)">
      <defs>
        <radialGradient id="wdD" r="0.5">
          <stop offset="0.55" stopColor="#3a3b3e" />
          <stop offset="0.7" stopColor="#5f6165" />
          <stop offset="0.86" stopColor="#4c4e51" />
          <stop offset="0.97" stopColor="#2a2b2d" />
          <stop offset="1" stopColor="#151516" />
        </radialGradient>
        <linearGradient id="wdBrush" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <circle r="300" fill="url(#wdD)" />
      <circle r="300" fill="url(#wdBrush)" />
      {holes}
      <circle r="170" fill="#141416" />
      <circle r="170" fill="none" stroke="#2b2c2f" strokeWidth="3" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        return <circle key={i} cx={Math.cos(a) * 185} cy={Math.sin(a) * 185} r="7" fill="#2e2f32" />;
      })}
      </g>
    </svg>
  );
}

/** Roter 6-Kolben-Festsattel – auf der sichtbaren linken Seite (≈ 9 Uhr). */
function Caliper() {
  return (
    <svg viewBox="-500 -500 1000 1000" className="wl-svg">
      <g transform="scale(1.11)">
      <defs>
        <linearGradient id="wcC" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a0d0b" />
          <stop offset="0.35" stopColor="#c4231b" />
          <stop offset="0.6" stopColor="#a5170f" />
          <stop offset="1" stopColor="#4a0a08" />
        </linearGradient>
      </defs>
      <g transform="rotate(-72)">
        <path d="M -84 -322 Q 0 -348 84 -322 L 72 -236 Q 0 -254 -72 -236 Z" fill="url(#wcC)" />
        <path d="M -68 -317 Q 0 -339 68 -317" fill="none" stroke="#ff8f80" strokeOpacity="0.35" strokeWidth="2.5" />
        <path d="M -72 -236 Q 0 -254 72 -236" fill="none" stroke="#2a0504" strokeOpacity="0.8" strokeWidth="4" />
        <circle cx="-52" cy="-298" r="6" fill="#3a0705" />
        <circle cx="52" cy="-298" r="6" fill="#3a0705" />
      </g>
      </g>
    </svg>
  );
}

/** Satinschwarze Schmiedefelge: 10 Y-Speichen, Zentralverschluss. */
function Spokes({ ghost }: { ghost?: boolean }) {
  const id = ghost ? 'wsg' : 'wsm';
  const spokes = Array.from({ length: 10 }, (_, i) => i * 36);
  return (
    <svg viewBox="-500 -500 1000 1000" className="wl-svg">
      <g transform="scale(1.11)">
      <defs>
        <linearGradient id={`${id}F`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#060607" />
          <stop offset="0.35" stopColor="#17181b" />
          <stop offset="0.52" stopColor="#2b2d32" />
          <stop offset="0.7" stopColor="#141518" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
        <radialGradient id={`${id}H`} r="0.5">
          <stop offset="0" stopColor="#1e1f23" />
          <stop offset="0.75" stopColor="#0c0c0e" />
          <stop offset="1" stopColor="#24262a" />
        </radialGradient>
      </defs>

      {spokes.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          {/* Seitenwand (Tiefe), leicht versetzt */}
          <path
            d="M -19 -100 L -14 -232 L -38 -336 L -24 -340 L 0 -250 L 24 -340 L 38 -336 L 14 -232 L 19 -100 Z"
            fill="#000"
            transform="translate(6 3)"
          />
          {/* Sichtfläche: Stamm teilt sich in zwei Arme */}
          <path
            d="M -20 -100 L -14 -232 L -39 -337 L -24 -341 L 0 -252 L 24 -341 L 39 -337 L 14 -232 L 20 -100 Z"
            fill={`url(#${id}F)`}
          />
          {!ghost && (
            <>
              {/* Grat in der Speichenmitte + Kantenreflexe */}
              <path d="M 0 -108 L 0 -246" stroke="#7d838c" strokeOpacity="0.28" strokeWidth="2" />
              <path d="M -2 -254 L -30 -334" stroke="#7d838c" strokeOpacity="0.22" strokeWidth="1.6" />
              <path d="M 2 -254 L 30 -334" stroke="#7d838c" strokeOpacity="0.14" strokeWidth="1.6" />
              <path d="M -20 -102 L -14 -230" stroke="#3a3e45" strokeOpacity="0.6" strokeWidth="1.2" />
            </>
          )}
        </g>
      ))}

      {/* Nabe + Zentralverschluss */}
      <circle r="118" fill={`url(#${id}H)`} />
      {!ghost && (
        <>
          <circle r="118" fill="none" stroke="#33363c" strokeOpacity="0.7" strokeWidth="2" />
          {/* gezahnter Sicherungsring */}
          {Array.from({ length: 36 }, (_, i) => (
            <rect key={i} x="-2.2" y="-86" width="4.4" height="10" fill="#2a2c31" transform={`rotate(${i * 10})`} />
          ))}
          <circle r="74" fill="#0b0b0d" stroke="#3b3e44" strokeWidth="2.5" />
          {/* Sechskant der Zentralmutter */}
          <polygon points="0,-58 50,-29 50,29 0,58 -50,29 -50,-29" fill="#111215" stroke="#454850" strokeWidth="2" />
          <circle r="34" fill="#070708" stroke="#2c2e33" strokeWidth="2" />
          {/* dezenter roter Sicherungsring */}
          <circle r="40" fill="none" stroke="#b3241c" strokeOpacity="0.85" strokeWidth="3" />
          <path d="M -11 6 L 0 -12 L 11 6" fill="none" stroke="#a8c5a0" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      </g>
    </svg>
  );
}
