import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import type { SearchMode } from './SearchTabs';
import { useViewport } from '../lib/useViewport';

/**
 * Der zentrale, elfenbeinfarbene Kreis.
 * Desktop: perfekter Kreis, Durchmesser animiert (900 ms, ease-in-out).
 * Mobile: abgerundete, vertikal wachsende Fläche (Lesbarkeit vor Kreisform).
 */
export const circleDiameters = (w: number, h: number) => ({
  searchD: Math.round(Math.min(h * 0.76, 680, w * 0.86)),
  showD: Math.round(Math.min(h * 0.95, 1000, w * 0.58)),
});

export function SearchCircle({ mode, children }: { mode: SearchMode; children: ReactNode }) {
  const { w, h, isMobile } = useViewport();
  const { searchD, showD } = circleDiameters(w, h);
  const d = mode === 'cars' ? showD : searchD;

  return (
    <motion.div
      className={`circle ${mode === 'cars' ? 'is-showroom' : 'is-search'}${isMobile ? ' is-mobile' : ''}`}
      initial={false}
      animate={isMobile ? { width: w - 24, height: 'auto', borderRadius: 34 } : { width: d, height: d, borderRadius: d / 2 }}
      transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
    >
      <div className="circle-glow" aria-hidden="true" />
      <div className="circle-inner">{children}</div>
    </motion.div>
  );
}
