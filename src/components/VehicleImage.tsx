import { useEffect, useState } from 'react';
import type { MotionValue } from 'motion/react';
import type { Vehicle } from '../data/vehicles';
import { CarIllustration } from './CarIllustration';

/**
 * Showroom-Darstellung eines Fahrzeugs.
 * 1. Liegt unter `vehicle.showroomImage` eine Datei (z. B. public/cars/audi-r8.png),
 *    wird sie angezeigt – freigestellt, transparenter Hintergrund.
 * 2. Sonst: generische SVG-Platzhalter-Silhouette (klar als Platzhalter gekennzeichnet).
 */
type Status = 'unknown' | 'ok' | 'missing';
const status = new Map<string, Status>();
const listeners = new Set<() => void>();

function probe(src: string) {
  if (status.has(src)) return;
  status.set(src, 'unknown');
  const img = new Image();
  img.onload = () => { status.set(src, 'ok'); listeners.forEach((l) => l()); };
  img.onerror = () => { status.set(src, 'missing'); listeners.forEach((l) => l()); };
  img.src = src;
}

/** Beim App-Start einmal aufrufen, damit Bilder vor dem Einfahren bekannt sind. */
export function preloadShowroomImages(vehicles: Vehicle[]) {
  vehicles.forEach((v) => v.showroomImage && probe(v.showroomImage));
}

export function useShowroomImage(vehicle: Vehicle): Status {
  const src = vehicle.showroomImage;
  const [, force] = useState(0);
  useEffect(() => {
    if (!src) return;
    probe(src);
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, [src]);
  return src ? status.get(src) ?? 'unknown' : 'missing';
}

export function VehicleImage({ vehicle, wheelRotate }: { vehicle: Vehicle; wheelRotate?: MotionValue<number> }) {
  const s = useShowroomImage(vehicle);
  if (s === 'ok') {
    return (
      <div className="car-photo">
        <span className="car-ground" aria-hidden="true" />
        <img
          src={vehicle.showroomImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="car-img"
          draggable={false}
          decoding="async"
        />
      </div>
    );
  }
  if (s === 'unknown') return <div className="car-img-pending" aria-hidden="true" />;
  return <CarIllustration vehicle={vehicle} wheelRotate={wheelRotate} />;
}
