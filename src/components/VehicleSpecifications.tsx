import { AnimatePresence, motion } from 'motion/react';
import type { Vehicle } from '../data/vehicles';

export function VehicleSpecifications({ vehicle }: { vehicle: Vehicle }) {
  const s = vehicle.specs;
  const items: [string, string, string?][] = [
    ['Leistung', String(s.powerPs), 'PS'],
    ['0–100 km/h', s.zeroToHundred.toFixed(1), 's'],
    ['Vmax', String(s.topSpeed), 'km/h'],
    ['Getriebe', s.transmission],
    ['Antrieb', s.drive],
    ['Sitzplätze', String(s.seats)],
  ];
  return (
    <div className="specs">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={vehicle.id}
          className="specs-grid"
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05, delayChildren: 0.35 } },
            exit: { transition: { staggerChildren: 0.02 } },
          }}
        >
          {items.map(([label, value, unit]) => (
            <motion.div
              key={label}
              className="spec"
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
                exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
              }}
            >
              <span className="spec-label">{label}</span>
              <span className="spec-value">
                {value}
                {unit && <small> {unit}</small>}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
