import { useId } from 'react';
import { motion, type MotionValue } from 'motion/react';
import type { Vehicle, PlaceholderBody } from '../data/vehicles';

/**
 * PLATZHALTER-Fahrzeuggrafik (generische Silhouette, bewusst KEINE Nachbildung
 * des echten Modells). Wird automatisch durch `vehicle.showroomImage` ersetzt,
 * sobald dort ein freigestelltes Bild liegt (siehe VehicleImage.tsx). Koordinatensystem: viewBox 0 0 800 300, Front links.
 */

interface BodyDef {
  front: number; // x Vorderrad
  rear: number; // x Hinterrad
  body: string;
  glass: string;
  pillar: number; // x der B-Säule
  headlight: string;
  taillight: string;
  extra?: (accent: string) => JSX.Element;
}

const arches = (front: number, rear: number, tailX: number, noseX: number) =>
  `L ${tailX} 226 L ${rear + 62} 226 A 62 62 0 0 0 ${rear - 62} 226 L ${front + 62} 226 A 62 62 0 0 0 ${front - 62} 226 L ${noseX} 226 Z`;

const BODIES: Record<PlaceholderBody, BodyDef> = {
  midengine: {
    front: 190, rear: 600, pillar: 470,
    body:
      'M 40 222 C 34 205, 40 192, 62 186 C 120 176, 190 168, 262 158 C 300 150, 330 118, 372 104 C 410 94, 470 94, 512 104 C 560 116, 650 136, 722 150 C 756 156, 768 170, 766 196 ' +
      arches(190, 600, 764, 44),
    glass: 'M 318 150 C 345 124, 365 110, 392 106 L 486 104 C 520 110, 545 124, 566 144 C 480 146, 400 148, 318 150 Z',
    headlight: 'M 56 190 C 80 184, 110 180, 142 177 L 138 185 C 110 188, 82 192, 58 197 Z',
    taillight: 'M 738 158 L 765 170 L 764 180 L 734 168 Z',
    extra: (accent) => (
      <path d="M 512 154 C 528 176, 534 200, 532 226 L 552 226 C 552 196, 546 172, 532 152 Z" fill={accent} opacity="0.85" />
    ),
  },
  coupe: {
    front: 186, rear: 600, pillar: 500,
    body:
      'M 36 220 C 32 200, 40 188, 66 182 C 130 172, 220 164, 300 156 C 340 150, 372 116, 420 104 C 460 96, 520 96, 560 104 C 600 112, 640 132, 690 146 L 748 150 C 762 154, 770 168, 768 194 ' +
      arches(186, 600, 766, 40),
    glass: 'M 362 150 C 392 124, 410 112, 436 108 L 552 106 C 590 114, 620 130, 650 146 C 560 148, 460 149, 362 150 Z',
    headlight: 'M 60 186 C 84 180, 112 176, 146 174 L 142 182 C 112 184, 86 188, 62 193 Z',
    taillight: 'M 744 154 L 768 160 L 768 172 L 742 166 Z',
    extra: () => <path d="M 40 198 L 64 194 L 66 208 L 42 212 Z" fill="#0d0d0d" opacity="0.8" />,
  },
  rearengine: {
    front: 190, rear: 596, pillar: 466,
    body:
      'M 40 222 C 34 204, 42 192, 66 186 C 120 178, 180 168, 250 160 C 300 152, 330 120, 380 104 C 420 92, 480 92, 520 102 C 590 118, 680 142, 740 162 C 762 170, 770 186, 766 204 ' +
      arches(190, 596, 764, 44),
    glass: 'M 322 150 C 350 124, 372 110, 400 106 L 490 104 C 540 112, 590 130, 630 148 C 520 150, 420 150, 322 150 Z',
    headlight: 'M 66 182 C 72 172, 96 170, 104 178 C 100 186, 76 190, 66 182 Z',
    taillight: 'M 730 164 L 766 180 L 766 190 L 728 174 Z',
  },
  wedge: {
    front: 194, rear: 600, pillar: 500,
    body:
      'M 32 216 C 30 204, 38 196, 60 192 C 140 178, 230 162, 300 150 C 340 140, 372 112, 420 100 C 460 92, 510 92, 548 100 C 600 112, 660 132, 730 150 C 760 156, 772 170, 770 194 ' +
      arches(194, 600, 768, 36),
    glass: 'M 360 146 C 390 120, 410 108, 440 104 L 540 102 C 570 110, 600 124, 624 140 C 530 142, 445 144, 360 146 Z',
    headlight: 'M 48 196 C 80 188, 120 182, 160 176 L 156 182 C 120 188, 82 194, 50 201 Z',
    taillight: 'M 724 152 L 770 166 L 770 174 L 722 160 Z',
    extra: (accent) => (
      <>
        <path d="M 258 204 C 360 196, 460 192, 540 196 L 538 206 C 460 202, 360 206, 260 212 Z" fill="#5d86a6" opacity="0.9" />
        <path d="M 600 128 C 640 136, 690 146, 728 152 L 726 160 C 680 154, 640 146, 604 138 Z" fill={accent} opacity="0.9" />
      </>
    ),
  },
  hatch: {
    front: 178, rear: 612, pillar: 450,
    body:
      'M 30 218 C 26 198, 36 184, 60 178 C 110 170, 160 164, 220 156 C 270 140, 310 104, 370 88 C 420 80, 470 82, 520 90 C 600 104, 680 128, 740 146 L 760 150 C 772 160, 774 180, 772 200 ' +
      arches(178, 612, 770, 34),
    glass: 'M 292 146 C 320 120, 346 100, 382 94 L 512 94 C 580 106, 640 124, 690 142 C 560 144, 420 145, 292 146 Z',
    headlight: 'M 46 182 C 80 174, 120 170, 160 166 L 156 174 C 120 176, 82 182, 48 188 Z',
    taillight: 'M 736 150 L 772 158 L 772 166 L 734 160 Z',
  },
};

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `rgb(${r},${g},${b})`;
}

function Wheel({ cx, rotate }: { cx: number; rotate?: MotionValue<number> }) {
  return (
    <g>
      <circle cx={cx} cy="222" r="50" fill="#121212" />
      <circle cx={cx} cy="222" r="46" fill="none" stroke="#1d1d1d" strokeWidth="3" />
      <motion.g style={{ rotate, originX: `${cx}px`, originY: '222px' }}>
        <circle cx={cx} cy="222" r="34" fill="#9a9c9e" />
        <circle cx={cx} cy="222" r="31" fill="#2a2b2d" />
        {[0, 72, 144, 216, 288].map((a) => (
          <path
            key={a}
            d={`M ${cx - 4} 222 L ${cx - 7} 192 L ${cx + 7} 192 L ${cx + 4} 222 Z`}
            fill="#b9bbbd"
            transform={`rotate(${a} ${cx} 222)`}
          />
        ))}
        <circle cx={cx} cy="222" r="8" fill="#5a5c5e" />
      </motion.g>
    </g>
  );
}

export function CarIllustration({
  vehicle,
  wheelRotate,
}: {
  vehicle: Vehicle;
  wheelRotate?: MotionValue<number>;
}) {
  const uid = useId().replace(/:/g, '');
  const def = BODIES[vehicle.placeholder.body];
  const { color, accent } = vehicle.placeholder;

  return (
    <svg viewBox="0 0 800 300" className="car-svg" role="img" aria-label={`${vehicle.brand} ${vehicle.model} (Platzhalter)`}>
      <defs>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.25" stopColor={shade(color, 0.28)} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={shade(color, -0.55)} />
        </linearGradient>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a4248" />
          <stop offset="0.5" stopColor="#14181b" />
          <stop offset="1" stopColor="#262c30" />
        </linearGradient>
        <radialGradient id={`s${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`c${uid}`}>
          <path d={def.body} />
        </clipPath>
      </defs>

      {/* Bodenschatten */}
      <ellipse cx="400" cy="272" rx="380" ry="16" fill={`url(#s${uid})`} />

      <g>
        <path d={def.body} fill={`url(#b${uid})`} />
        <g clipPath={`url(#c${uid})`}>
          {/* Schulterlinie / Glanz */}
          <path d="M 0 170 C 200 150, 600 150, 800 172 L 800 178 C 600 160, 200 160, 0 180 Z" fill="#fff" opacity="0.18" />
          <ellipse cx="420" cy="120" rx="300" ry="36" fill="#fff" opacity="0.08" />
          {/* Schweller */}
          <rect x="0" y="208" width="800" height="20" fill={accent} opacity="0.55" />
          {/* Türfuge */}
          <path d={`M ${def.pillar - 150} 156 C ${def.pillar - 154} 180, ${def.pillar - 150} 200, ${def.pillar - 140} 214`} stroke="#000" strokeOpacity="0.28" strokeWidth="2" fill="none" />
          <path d={`M ${def.pillar} 152 C ${def.pillar + 6} 180, ${def.pillar + 8} 200, ${def.pillar + 4} 214`} stroke="#000" strokeOpacity="0.28" strokeWidth="2" fill="none" />
          {def.extra?.(accent)}
        </g>
        <path d={def.glass} fill={`url(#g${uid})`} />
        <path d={`M ${def.pillar} 104 L ${def.pillar + 8} 104 L ${def.pillar + 4} 150 L ${def.pillar - 4} 150 Z`} fill={shade(color, -0.4)} opacity="0.9" />
        {/* Spiegel */}
        <path d={`M ${def.pillar - 150} 146 l 26 -6 l 6 10 l -28 4 Z`} fill={shade(color, -0.25)} />
        <path d={def.headlight} fill="#eef2ec" opacity="0.92" />
        <path d={def.taillight} fill="#8b2420" opacity="0.95" />
        <Wheel cx={def.front} rotate={wheelRotate} />
        <Wheel cx={def.rear} rotate={wheelRotate} />
      </g>
    </svg>
  );
}
