import { motion } from 'motion/react';
import type { Vehicle } from '../data/vehicles';
import { BRAND_LOGOS } from '../data/brandLogos';

/**
 * Markenlogo (Original-Geometrie aus brandLogos.ts, einfarbig in Warmweiss für
 * den schwarzen Hintergrund). Alle Logos sitzen in derselben 44×34-Box;
 * `scale` gleicht unterschiedliche Proportionen optisch aus – ohne Verzerrung.
 */
export function BrandLogo({ vehicle }: { vehicle: Vehicle }) {
  const logo = BRAND_LOGOS[vehicle.brandKey];
  if (!logo) {
    return (
      <span className="brand-logo brand-logo--fallback" aria-hidden="true">
        {vehicle.brandMonogram}
      </span>
    );
  }
  return (
    <span className="brand-logo" aria-hidden="true">
      <svg viewBox="0 0 24 24" style={{ height: `${26 * logo.scale}px` }} role="img">
        <path d={logo.path} fill="currentColor" />
      </svg>
    </span>
  );
}

export function VehicleList({
  vehicles,
  selectedId,
  onSelect,
  filterLabel,
  onClearFilter,
}: {
  vehicles: Vehicle[];
  selectedId: string;
  onSelect: (id: string) => void;
  filterLabel?: string | null;
  onClearFilter?: () => void;
}) {
  return (
    <motion.nav
      className="vehicle-list"
      aria-label="Fahrzeugliste"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30, transition: { duration: 0.3 } }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="vl-head">
        <span className="label">{filterLabel ? 'Verfügbar' : 'Unsere Flotte'}</span>
        {filterLabel && (
          <>
            <span className="vl-range">{filterLabel}</span>
            <button className="vl-clear" onClick={onClearFilter}>
              Alle Fahrzeuge
            </button>
          </>
        )}
      </div>
      <ul>
        {vehicles.map((v, i) => {
          const active = v.id === selectedId;
          return (
            <motion.li
              key={v.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.06, duration: 0.45, ease: 'easeOut' }}
            >
              <button className={`vl-item${active ? ' active' : ''}`} onClick={() => onSelect(v.id)} aria-current={active}>
                {active && <motion.span layoutId="vl-line" className="vl-line" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                <BrandLogo vehicle={v} />
                <span className="vl-name">
                  <span className="vl-brand">{v.brand}</span> <span className="vl-model">{v.model}</span>
                </span>
                <span className="vl-cat">{v.category}</span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
