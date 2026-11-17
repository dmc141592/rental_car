import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { Vehicle } from '../data/vehicles';
import { searchAvailableVehicles, type DateRange } from '../services/availabilityService';
import { TIME_SLOTS, diffDays, fromKey, rentalDays, toKey, today } from '../lib/dates';

export interface SearchResult {
  range: DateRange;
  vehicles: Vehicle[];
  pickupTime: string;
  returnTime: string;
}

export function DateSearch({ onResult }: { onResult: (r: SearchResult) => void }) {
  const [pickup, setPickup] = useState('');
  const [ret, setRet] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');
  const [error, setError] = useState<string | null>(null);
  const [noResult, setNoResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const pickupRef = useRef<HTMLInputElement>(null);
  const minDate = toKey(today());

  const days = pickup && ret && diffDays(fromKey(pickup), fromKey(ret)) >= 0 ? rentalDays(fromKey(pickup), fromKey(ret)) : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoResult(false);
    if (!pickup || !ret) return setError('Bitte Abhol- und Rückgabedatum wählen.');
    const start = fromKey(pickup);
    const end = fromKey(ret);
    if (diffDays(today(), start) < 0) return setError('Das Abholdatum liegt in der Vergangenheit.');
    if (diffDays(start, end) < 0) return setError('Die Rückgabe muss nach der Abholung liegen.');
    if (diffDays(start, end) === 0 && returnTime <= pickupTime)
      return setError('Bei Rückgabe am selben Tag muss die Rückgabezeit später sein.');
    if (diffDays(start, end) > 60) return setError('Demo: maximal 60 Tage Mietdauer.');
    setError(null);
    setLoading(true);
    const vehicles = await searchAvailableVehicles({ start, end });
    setLoading(false);
    if (!vehicles.length) return setNoResult(true);
    onResult({ range: { start, end }, vehicles, pickupTime, returnTime });
  };

  return (
    <form className="date-search" onSubmit={submit} noValidate>
      <h1 className="ds-title">
        Your drive
        <br />
        starts here
      </h1>
      <p className="ds-sub">Wähle deinen Zeitraum – wir zeigen dir, was bereitsteht.</p>

      <div className="ds-grid">
        <label className="field">
          <span>Abholdatum</span>
          <input ref={pickupRef} type="date" min={minDate} value={pickup} onChange={(e) => { setPickup(e.target.value); setError(null); }} />
        </label>
        <label className="field">
          <span>Rückgabedatum</span>
          <input type="date" min={pickup || minDate} value={ret} onChange={(e) => { setRet(e.target.value); setError(null); }} />
        </label>
        <label className="field">
          <span>Abholzeit</span>
          <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}>
            {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Rückgabezeit</span>
          <select value={returnTime} onChange={(e) => setReturnTime(e.target.value)}>
            {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>

      <button className="btn-primary btn-find" type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 size={16} className="spin" /> Prüfe Verfügbarkeit
          </>
        ) : (
          <>
            Find your drive <ArrowRight size={16} strokeWidth={1.6} />
          </>
        )}
      </button>

      <div className="ds-msg" aria-live="polite">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.span key="err" className="msg-error" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {error}
            </motion.span>
          ) : noResult ? (
            <motion.span key="none" className="msg-error" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              Für diesen Zeitraum ist leider kein Fahrzeug frei.{' '}
              <button type="button" className="link-btn" onClick={() => { setNoResult(false); pickupRef.current?.focus(); try { pickupRef.current?.showPicker?.(); } catch { /* ignore */ } }}>
                Zeitraum ändern
              </button>
            </motion.span>
          ) : days ? (
            <motion.span key="days" className="msg-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Mietdauer: {days} {days === 1 ? 'Tag' : 'Tage'}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}
