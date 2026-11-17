import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isDayAvailable, isRangeAvailable } from '../services/availabilityService';
import { MONTHS_DE, WEEKDAYS_DE, addDays, diffDays, isSameDay, today } from '../lib/dates';

export interface PartialRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Kompakter Monatskalender mit fahrzeugabhängiger Demo-Verfügbarkeit.
 * Auswahl: 1. Klick = Start, 2. Klick = Ende. Zeiträume mit belegten Tagen werden abgelehnt.
 */
export function AvailabilityCalendar({
  vehicleId,
  range,
  onChange,
}: {
  vehicleId: string;
  range: PartialRange;
  onChange: (r: PartialRange) => void;
}) {
  const now = today();
  const [month, setMonth] = useState(() => {
    const d = range.start ?? now;
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [hover, setHover] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dir, setDir] = useState(1);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Montag zuerst
    return Array.from({ length: 42 }, (_, i) => addDays(first, i - offset));
  }, [month]);

  const isCurrentMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();

  const previewEnd =
    range.start && !range.end && hover && diffDays(range.start, hover) > 0 &&
    isRangeAvailable(vehicleId, { start: range.start, end: hover })
      ? hover
      : null;

  const pick = (day: Date) => {
    setError(null);
    if (!isDayAvailable(vehicleId, day)) return;
    if (!range.start || range.end) return onChange({ start: day, end: null });
    if (diffDays(range.start, day) < 0) return onChange({ start: day, end: null });
    if (isRangeAvailable(vehicleId, { start: range.start, end: day })) return onChange({ start: range.start, end: day });
    setError('Zeitraum enthält belegte Tage – neuer Start gesetzt.');
    onChange({ start: day, end: null });
  };

  const shift = (delta: number) => {
    setDir(delta);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  return (
    <div className="calendar">
      <div className="cal-head">
        <button className="cal-nav" onClick={() => shift(-1)} disabled={isCurrentMonth} aria-label="Vorheriger Monat">
          <ChevronLeft size={15} strokeWidth={1.6} />
        </button>
        <span className="cal-title">
          {MONTHS_DE[month.getMonth()]} {month.getFullYear()}
        </span>
        <button className="cal-nav" onClick={() => shift(1)} aria-label="Nächster Monat">
          <ChevronRight size={15} strokeWidth={1.6} />
        </button>
      </div>
      <div className="cal-grid cal-weekdays">
        {WEEKDAYS_DE.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="cal-body" onMouseLeave={() => setHover(null)}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.div
            key={`${vehicleId}-${month.getTime()}`}
            className="cal-grid"
            custom={dir}
            initial={{ opacity: 0, x: dir * 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -dir * 18 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {days.map((day) => {
              const inMonth = day.getMonth() === month.getMonth();
              const past = diffDays(now, day) < 0;
              const available = !past && isDayAvailable(vehicleId, day);
              const end = range.end ?? previewEnd;
              const isStart = !!range.start && isSameDay(day, range.start);
              const isEnd = !!end && isSameDay(day, end);
              const inRange =
                !!range.start && !!end && diffDays(range.start, day) >= 0 && diffDays(day, end) >= 0;
              const cls = [
                'cal-day',
                !inMonth && 'out',
                past ? 'past' : available ? 'free' : 'blocked',
                inRange && 'in-range',
                inRange && !range.end && 'preview',
                isStart && 'start',
                isEnd && 'end',
                isSameDay(day, now) && 'today',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={day.getTime()}
                  className={cls}
                  disabled={!available}
                  onClick={() => pick(day)}
                  onMouseEnter={() => setHover(day)}
                  aria-label={`${day.toLocaleDateString('de-CH')} ${available ? 'verfügbar' : 'nicht verfügbar'}`}
                  aria-pressed={inRange}
                >
                  <span>{day.getDate()}</span>
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="cal-foot">
        {error ? (
          <span className="cal-error">{error}</span>
        ) : (
          <>
            <span className="lg lg-free">Verfügbar</span>
            <span className="lg lg-blocked">Belegt</span>
            <span className="lg lg-sel">Auswahl</span>
          </>
        )}
      </div>
    </div>
  );
}
