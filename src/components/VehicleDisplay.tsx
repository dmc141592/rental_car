import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Vehicle } from '../data/vehicles';
import { VehicleImage } from './VehicleImage';

const REDUCED =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Ein Fahrzeug, das physikalisch plausibel "fährt":
 *  - x in Pixeln, Radrotation wird direkt aus x abgeleitet (Abrollen ohne Rutschen)
 *  - horizontale Bewegungsunschärfe (SVG feGaussianBlur nur in x-Richtung) –
 *    als CSS-Filter auf dem Wrapper, funktioniert für SVG-Platzhalter UND echte Bilder
 *  - beim Abbremsen kurzes Eintauchen der Front (Nicken) + Ausfedern
 */
function MovingCar({ vehicle, stageWidth, stageHeight }: { vehicle: Vehicle; stageWidth: number; stageHeight: number }) {
  const [isPresent, safeToRemove] = usePresence();
  const x = useMotionValue(REDUCED ? 0 : stageWidth * 1.05);
  const pitch = useMotionValue(0);
  const blur = useMotionValue(REDUCED ? 0 : 9);
  const blurRef = useRef<SVGFEGaussianBlurElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const filterId = 'mb' + useId().replace(/:/g, '');
  // Breite durch Bühnenbreite UND -höhe begrenzt (Fotos sind ca. 2.3 : 1),
  // damit das Auto nie in Modellname/Preis darüber ragt; bewusst mit Luft
  // nach oben/unten (≈ 0.5 cm kleiner als die maximal mögliche Grösse)
  const carWidth = Math.min(stageWidth * 0.76, stageHeight * 1.98, 820);
  const wheelR = (50 / 800) * carWidth;
  const wheelRotate = useTransform(x, (v) => (v / wheelR) * (180 / Math.PI));

  useEffect(() => {
    const apply = (v: number) => {
      blurRef.current?.setAttribute('stdDeviation', `${v.toFixed(2)} 0`);
      // Filter nur aktiv, solange Unschärfe sichtbar ist → gestochen scharf im Stand
      if (wrapRef.current) wrapRef.current.style.filter = v > 0.05 ? `url(#${filterId})` : 'none';
    };
    apply(blur.get());
    return blur.on('change', apply);
  }, [blur, filterId]);

  useEffect(() => {
    if (REDUCED) {
      if (!isPresent) safeToRemove?.();
      return;
    }
    if (isPresent) {
      const delay = 0.22;
      const c1 = animate(x, 0, { duration: 1.25, delay, ease: [0.12, 0.85, 0.3, 1] });
      const c2 = animate(blur, [9, 6, 0], { duration: 0.9, delay, times: [0, 0.5, 1], ease: 'easeOut' });
      const c3 = animate(pitch, [0, 0, 1.6, -0.5, 0.15, 0], {
        duration: 1.6, delay, times: [0, 0.48, 0.66, 0.8, 0.9, 1], ease: 'easeInOut',
      });
      return () => { c1.stop(); c2.stop(); c3.stop(); };
    }
    // Ausfahren nach links (beschleunigen)
    const c1 = animate(x, -stageWidth * 1.15, { duration: 0.75, ease: [0.6, 0, 0.9, 0.5] });
    const c2 = animate(blur, [0, 10], { duration: 0.6, ease: 'easeIn' });
    const c3 = animate(pitch, [0, -1.2, -0.6], { duration: 0.5 });
    c1.then(() => safeToRemove?.());
    return () => { c1.stop(); c2.stop(); c3.stop(); };
  }, [isPresent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div className="moving-car" style={{ x, rotate: pitch, width: carWidth, left: (stageWidth - carWidth) / 2, originX: 0.3, originY: 0.85 }}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur ref={blurRef} in="SourceGraphic" stdDeviation="0 0" />
        </filter>
      </svg>
      <div ref={wrapRef}>
        <VehicleImage vehicle={vehicle} wheelRotate={wheelRotate} />
      </div>
    </motion.div>
  );
}

export function VehicleDisplay({
  vehicle,
  onPrev,
  onNext,
  canNavigate,
}: {
  vehicle: Vehicle;
  onPrev: () => void;
  onNext: () => void;
  canNavigate: boolean;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(700);
  const [height, setHeight] = useState(280);

  useEffect(() => {
    const el = stageRef.current!;
    const ro = new ResizeObserver(([e]) => {
      setWidth(e.contentRect.width);
      setHeight(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="vehicle-display">
      <button className="arrow-btn" onClick={onPrev} disabled={!canNavigate} aria-label="Vorheriges Fahrzeug">
        <ChevronLeft size={22} strokeWidth={1.4} />
      </button>
      <div className="car-stage" ref={stageRef}>
        <AnimatePresence initial={true}>
          <MovingCar key={vehicle.id} vehicle={vehicle} stageWidth={width} stageHeight={height} />
        </AnimatePresence>
      </div>
      <button className="arrow-btn" onClick={onNext} disabled={!canNavigate} aria-label="Nächstes Fahrzeug">
        <ChevronRight size={22} strokeWidth={1.4} />
      </button>
    </div>
  );
}
