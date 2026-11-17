import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Check, Loader2, ShieldCheck } from 'lucide-react';
import { VehicleImage } from './VehicleImage';
import {
  EXTRA_DRIVER_PER_DAY,
  calculatePrice,
  submitDemoBooking,
  type BookingDraft,
  type CustomerData,
} from '../services/bookingService';
import { TIME_SLOTS, diffDays, formatCHF, formatLong, today } from '../lib/dates';

type Fields = {
  firstName: string; lastName: string; birthDate: string; email: string; phone: string;
  street: string; zip: string; city: string; country: string;
  licenseNumber: string; licenseIssued: string;
  extraName: string; extraBirth: string; remarks: string; accept: boolean;
};

const EMPTY: Fields = {
  firstName: '', lastName: '', birthDate: '', email: '', phone: '',
  street: '', zip: '', city: '', country: 'Schweiz',
  licenseNumber: '', licenseIssued: '', extraName: '', extraBirth: '', remarks: '', accept: false,
};

const MIN_AGE = 23; // DEMO-Regel

const ageOf = (iso: string) => {
  const b = new Date(iso);
  const t = today();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a;
};

function validate(f: Fields, extraDriver: boolean, licenseCheck: boolean) {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (!f.firstName.trim()) e.firstName = 'Vorname fehlt';
  if (!f.lastName.trim()) e.lastName = 'Nachname fehlt';
  if (!f.birthDate) e.birthDate = 'Geburtsdatum fehlt';
  else if (ageOf(f.birthDate) < MIN_AGE) e.birthDate = `Mindestalter ${MIN_AGE} Jahre`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) e.email = 'Gültige E-Mail angeben';
  if (f.phone.replace(/[^\d]/g, '').length < 9) e.phone = 'Gültige Telefonnummer angeben';
  if (!/\d/.test(f.street) || f.street.trim().length < 4) e.street = 'Strasse und Hausnummer';
  if (!/^[A-Za-z0-9 -]{4,10}$/.test(f.zip.trim())) e.zip = 'PLZ prüfen';
  if (!f.city.trim()) e.city = 'Ort fehlt';
  if (!f.country) e.country = 'Land wählen';
  if (licenseCheck) {
    if (f.licenseNumber.trim().length < 5) e.licenseNumber = 'Ausweisnummer prüfen';
    if (!f.licenseIssued) e.licenseIssued = 'Ausstellungsdatum fehlt';
  }
  if (extraDriver) {
    if (!f.extraName.trim()) e.extraName = 'Name fehlt';
    if (!f.extraBirth) e.extraBirth = 'Geburtsdatum fehlt';
    else if (ageOf(f.extraBirth) < MIN_AGE) e.extraBirth = `Mindestalter ${MIN_AGE} Jahre`;
  }
  if (!f.accept) e.accept = 'Bitte bestätigen';
  return e;
}

export function BookingForm({ draft, onClose }: { draft: BookingDraft; onClose: () => void }) {
  const [f, setF] = useState<Fields>(EMPTY);
  const [pickupTime, setPickupTime] = useState(draft.pickupTime);
  const [returnTime, setReturnTime] = useState(draft.returnTime);
  const [extraDriver, setExtraDriver] = useState(false);
  const [licenseCheck, setLicenseCheck] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const price = calculatePrice(draft, extraDriver);
  const errors = validate(f, extraDriver, licenseCheck);
  const sameDayTimeError = diffDays(draft.start, draft.end) === 0 && returnTime <= pickupTime;
  const v = draft.vehicle;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !sending && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, sending]);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
  const blur = (k: keyof Fields) => () => setTouched((t) => ({ ...t, [k]: true }));
  const err = (k: keyof Fields) => ((submitted || touched[k]) && errors[k]) || null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length || sameDayTimeError) {
      const first = document.querySelector('.bf-form .has-error input, .bf-form .has-error select');
      (first as HTMLElement | null)?.focus();
      return;
    }
    setSending(true);
    const customer: CustomerData = {
      firstName: f.firstName, lastName: f.lastName, birthDate: f.birthDate, email: f.email, phone: f.phone,
      street: f.street, zip: f.zip, city: f.city, country: f.country,
      licenseNumber: licenseCheck ? f.licenseNumber : undefined,
      licenseIssued: licenseCheck ? f.licenseIssued : undefined,
      extraDriver: extraDriver ? { name: f.extraName, birthDate: f.extraBirth } : null,
      remarks: f.remarks || undefined,
    };
    const res = await submitDemoBooking({ ...draft, pickupTime, returnTime }, customer);
    setSending(false);
    setReference(res.reference);
  };

  const Field = ({ k, label, type = 'text', span = 1, ...rest }: { k: keyof Fields; label: string; type?: string; span?: number } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className={`bf-field span-${span}${err(k) ? ' has-error' : ''}`}>
      <span>{label}</span>
      <input type={type} value={f[k] as string} onChange={set(k)} onBlur={blur(k)} {...rest} />
      <em>{err(k)}</em>
    </label>
  );

  return (
    <motion.div
      className="booking"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      transition={{ duration: 0.45 }}
      role="dialog"
      aria-modal="true"
      aria-label="Buchungsformular"
    >
      <motion.div
        className="booking-inner"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      >
        <button className="bf-back" onClick={onClose} disabled={sending}>
          <ArrowLeft size={16} strokeWidth={1.5} /> Zurück zum Showroom
        </button>

        <div className="bf-layout">
          {/* Zusammenfassung */}
          <aside className="bf-summary">
            <span className="label dark">Deine Auswahl</span>
            <div className="bf-car">
              <VehicleImage vehicle={v} />
            </div>
            <span className="sr-brand">{v.brand} · {v.category}</span>
            <h2 className="bf-model">{v.model}</h2>
            <dl className="bf-dl">
              <div><dt>Abholung</dt><dd>{formatLong(draft.start)}</dd></div>
              <div>
                <dt>Abholzeit</dt>
                <dd>
                  <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} disabled={!!reference}>
                    {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </dd>
              </div>
              <div><dt>Rückgabe</dt><dd>{formatLong(draft.end)}</dd></div>
              <div>
                <dt>Rückgabezeit</dt>
                <dd>
                  <select value={returnTime} onChange={(e) => setReturnTime(e.target.value)} disabled={!!reference}>
                    {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </dd>
              </div>
              <div><dt>Mietdauer</dt><dd>{price.days} {price.days === 1 ? 'Tag' : 'Tage'}</dd></div>
              <div><dt>{price.days} × {formatCHF(v.pricePerDay)}</dt><dd>{formatCHF(price.base)}</dd></div>
              {extraDriver && <div><dt>Zusatzfahrer</dt><dd>{formatCHF(price.extras)}</dd></div>}
            </dl>
            {sameDayTimeError && <p className="bf-warn">Rückgabezeit muss nach der Abholzeit liegen.</p>}
            <div className="bf-total">
              <span>Total <small>(Demo-Preis inkl. MwSt.)</small></span>
              <b>{formatCHF(price.total)}</b>
            </div>
          </aside>

          {/* Formular / Bestätigung */}
          <div className="bf-main">
            <AnimatePresence mode="wait">
              {reference ? (
                <motion.div
                  key="ok"
                  className="bf-confirm"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.span className="bf-check" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.15 }}>
                    <Check size={30} strokeWidth={1.6} />
                  </motion.span>
                  <h2>Anfrage erhalten</h2>
                  <p>
                    Danke, {f.firstName}. Deine <b>Demo-Buchung</b> für den {v.brand} {v.model} wurde registriert.
                  </p>
                  <div className="bf-ref">
                    <span className="label">Referenz</span>
                    <b>{reference}</b>
                  </div>
                  <p className="bf-note">
                    Prototyp: Es wurde keine Zahlung ausgelöst und keine verbindliche Buchung erstellt. Eine Bestätigung an{' '}
                    {f.email} würde in der Live-Version per E-Mail folgen.
                  </p>
                  <button className="btn-ghost" onClick={onClose}>Zurück zum Showroom</button>
                </motion.div>
              ) : (
                <motion.form key="form" className="bf-form" onSubmit={submit} noValidate exit={{ opacity: 0, y: -10 }}>
                  <h2 className="bf-heading">Persönliche Angaben</h2>
                  <div className="bf-grid">
                    {Field({ k: 'firstName', label: 'Vorname', autoComplete: 'given-name' })}
                    {Field({ k: 'lastName', label: 'Nachname', autoComplete: 'family-name' })}
                    {Field({ k: 'birthDate', label: 'Geburtsdatum', type: 'date', autoComplete: 'bday' })}
                    {Field({ k: 'email', label: 'E-Mail', type: 'email', autoComplete: 'email' })}
                    {Field({ k: 'phone', label: 'Telefon', type: 'tel', autoComplete: 'tel', placeholder: '+41 79 000 00 00' })}
                    {Field({ k: 'street', label: 'Strasse und Nr.', autoComplete: 'street-address' })}
                    {Field({ k: 'zip', label: 'PLZ', autoComplete: 'postal-code' })}
                    {Field({ k: 'city', label: 'Ort', autoComplete: 'address-level2' })}
                    <label className={`bf-field span-2${err('country') ? ' has-error' : ''}`}>
                      <span>Land</span>
                      <select value={f.country} onChange={set('country')} onBlur={blur('country')}>
                        {['Schweiz', 'Deutschland', 'Österreich', 'Liechtenstein', 'Frankreich', 'Italien', 'Andere'].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      <em>{err('country')}</em>
                    </label>
                  </div>

                  <div className="bf-options">
                    <label className="toggle">
                      <input type="checkbox" checked={licenseCheck} onChange={(e) => setLicenseCheck(e.target.checked)} />
                      <span className="toggle-ui" />
                      <span>
                        Führerausweis vorab prüfen <small>schnellere Übergabe</small>
                      </span>
                    </label>
                    <AnimatePresence initial={false}>
                      {licenseCheck && (
                        <motion.div className="bf-grid bf-sub" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                          {Field({ k: 'licenseNumber', label: 'Ausweisnummer' })}
                          {Field({ k: 'licenseIssued', label: 'Ausgestellt am', type: 'date' })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <label className="toggle">
                      <input type="checkbox" checked={extraDriver} onChange={(e) => setExtraDriver(e.target.checked)} />
                      <span className="toggle-ui" />
                      <span>
                        Zusätzlicher Fahrer <small>+ {formatCHF(EXTRA_DRIVER_PER_DAY)} / Tag</small>
                      </span>
                    </label>
                    <AnimatePresence initial={false}>
                      {extraDriver && (
                        <motion.div className="bf-grid bf-sub" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                          {Field({ k: 'extraName', label: 'Name Zusatzfahrer' })}
                          {Field({ k: 'extraBirth', label: 'Geburtsdatum', type: 'date' })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <label className="bf-field span-2">
                    <span>Bemerkungen (optional)</span>
                    <textarea rows={3} value={f.remarks} onChange={set('remarks')} placeholder="z. B. Lieferung an Hoteladresse" />
                  </label>

                  <label className={`check${err('accept') ? ' has-error' : ''}`}>
                    <input type="checkbox" checked={f.accept} onChange={set('accept')} />
                    <span>Mir ist bewusst, dass dies ein Prototyp ist und keine echte Buchung oder Zahlung ausgelöst wird.</span>
                  </label>

                  <div className="bf-submit">
                    <span className="bf-secure"><ShieldCheck size={15} strokeWidth={1.5} /> Keine Zahlung im Demo-Modus</span>
                    <button className="btn-primary light" type="submit" disabled={sending}>
                      {sending ? <><Loader2 size={16} className="spin" /> Wird gesendet</> : <>Buchung anfragen · {formatCHF(price.total)}</>}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
