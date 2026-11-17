import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Images } from 'lucide-react';
import { useShowroomImage } from './VehicleImage';
import type { Vehicle } from '../data/vehicles';
import { VehicleDisplay } from './VehicleDisplay';
import { VehicleSpecifications } from './VehicleSpecifications';
import { AvailabilityCalendar, type PartialRange } from './AvailabilityCalendar';
import { formatCHF, formatShort, rentalDays } from '../lib/dates';

export function VehicleShowroom({
  vehicle,
  range,
  onRangeChange,
  onPrev,
  onNext,
  canNavigate,
  notice,
  onRent,
  onOpenGallery,
  galleryCount,
  galleryButtonRef,
}: {
  vehicle: Vehicle;
  range: PartialRange;
  onRangeChange: (r: PartialRange) => void;
  onPrev: () => void;
  onNext: () => void;
  canNavigate: boolean;
  notice: string | null;
  onRent: () => void;
  onOpenGallery: () => void;
  galleryCount: number;
  galleryButtonRef: React.Ref<HTMLButtonElement>;
}) {
  const imageStatus = useShowroomImage(vehicle);
  const complete = range.start && range.end;
  const days = complete ? rentalDays(range.start!, range.end!) : 0;

  return (
    <div className="showroom">
      <div className="sr-title">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <span className="sr-brand">
              {vehicle.brand} <i>·</i> {vehicle.category}
            </span>
            <h2 className="sr-model">{vehicle.model}</h2>
            <span className="sr-price">
              {formatCHF(vehicle.pricePerDay)} <small>/ Tag</small>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <VehicleDisplay vehicle={vehicle} onPrev={onPrev} onNext={onNext} canNavigate={canNavigate} />
      <span className={`sr-placeholder-note${imageStatus === 'missing' ? ' show' : ''}`}>
        Platzhalter-Grafik · Modellbild folgt
      </span>

      <div className="sr-bottom">
        <VehicleSpecifications vehicle={vehicle} />
        <AvailabilityCalendar vehicleId={vehicle.id} range={range} onChange={onRangeChange} />
      </div>

      <div className="sr-cta">
        <span className="sr-summary" aria-live="polite">
          {notice ? (
            <em>{notice}</em>
          ) : complete ? (
            <>
              {formatShort(range.start!)} – {formatShort(range.end!)} · {days} {days === 1 ? 'Tag' : 'Tage'} ·{' '}
              <b>{formatCHF(days * vehicle.pricePerDay)}</b>
            </>
          ) : range.start ? (
            <>Start {formatShort(range.start)} · jetzt Rückgabedatum wählen</>
          ) : (
            <>Wähle deinen Mietzeitraum im Kalender</>
          )}
        </span>
        <div className="sr-actions">
          <button
            ref={galleryButtonRef}
            className="btn-outline"
            onClick={onOpenGallery}
            disabled={galleryCount === 0}
            aria-haspopup="dialog"
          >
            <Images size={15} strokeWidth={1.5} /> Fotos ansehen
          </button>
          <button className="btn-primary" disabled={!complete} onClick={onRent}>
            Rent this car <ArrowRight size={16} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
}
