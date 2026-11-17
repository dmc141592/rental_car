import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { VEHICLES } from './data/vehicles';
import { getGallery } from './data/gallery';
import { isRangeAvailable } from './services/availabilityService';
import type { BookingDraft } from './services/bookingService';
import { wheelController } from './lib/wheelController';
import { formatShort } from './lib/dates';
import { Header, type NavTarget } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BookingForm } from './components/BookingForm';
import { PhotoGallery } from './components/PhotoGallery';
import { preloadShowroomImages } from './components/VehicleImage';
import type { SearchMode } from './components/SearchTabs';
import type { SearchResult } from './components/DateSearch';
import type { PartialRange } from './components/AvailabilityCalendar';

export default function App() {
  const [mode, setMode] = useState<SearchMode>('date');
  const [search, setSearch] = useState<SearchResult | null>(null);
  const [selectedId, setSelectedId] = useState(VEHICLES[0].id);
  const [range, setRange] = useState<PartialRange>({ start: null, end: null });
  const [times, setTimes] = useState({ pickup: '10:00', ret: '10:00' });
  const [notice, setNotice] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDraft | null>(null);
  const [activeNav, setActiveNav] = useState<NavTarget>('home');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const galleryButtonRef = useRef<HTMLButtonElement>(null);

  // Erstes Laden: Reifen + Rauch exakt 6 Sekunden (einziger zeitgesteuerter Trigger)
  useEffect(() => {
    wheelController.startIntro(6000);
    preloadShowroomImages(VEHICLES);
  }, []);

  const shown = search ? search.vehicles : VEHICLES;
  const selected = shown.find((v) => v.id === selectedId) ?? shown[0];
  // Galerie richtet sich immer nach dem aktuell gewählten Fahrzeug
  const gallery = useMemo(() => getGallery(selected.id), [selected.id]);

  const select = useCallback(
    (id: string) => {
      if (id === selectedId) return;
      setSelectedId(id);
      // Gewählter Zeitraum nur übernehmen, wenn er auch für das neue Fahrzeug frei ist
      setRange((r) => {
        if (r.start && r.end && !isRangeAvailable(id, { start: r.start, end: r.end })) {
          setNotice('Zeitraum ist für dieses Fahrzeug belegt – bitte neu wählen.');
          return { start: null, end: null };
        }
        if (r.start && !r.end && !isRangeAvailable(id, { start: r.start, end: r.start })) return { start: null, end: null };
        setNotice(null);
        return r;
      });
    },
    [selectedId],
  );

  const step = useCallback(
    (delta: number) => {
      const i = shown.findIndex((v) => v.id === selected.id);
      select(shown[(i + delta + shown.length) % shown.length].id);
    },
    [shown, selected.id, select],
  );

  const changeMode = (m: SearchMode) => {
    setMode(m);
    if (m === 'cars' && !search) setSelectedId((id) => id ?? VEHICLES[0].id);
  };

  const onSearchResult = (r: SearchResult) => {
    setSearch(r);
    setSelectedId(r.vehicles[0].id);
    setRange({ start: r.range.start, end: r.range.end });
    setTimes({ pickup: r.pickupTime, ret: r.returnTime });
    setNotice(null);
    setMode('cars');
  };

  const filterLabel = useMemo(
    () => (search ? `${formatShort(search.range.start)} – ${formatShort(search.range.end)}` : null),
    [search],
  );

  const navigate = (t: NavTarget) => {
    setActiveNav(t);
    if (t === 'home' || t === 'fleet') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (t === 'fleet') {
        setSearch(null);
        setMode('cars');
      }
      return;
    }
    document.getElementById(t)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Tastatur: Pfeiltasten im Showroom
  useEffect(() => {
    if (mode !== 'cars' || booking || galleryOpen) return;
    const on = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [mode, booking, galleryOpen, step]);

  return (
    <>
      <Header active={activeNav} onNavigate={navigate} />
      <main>
        <HeroSection
          mode={mode}
          onModeChange={changeMode}
          vehicles={shown}
          selected={selected}
          onSelect={select}
          onStep={step}
          range={range}
          onRangeChange={(r) => { setNotice(null); setRange(r); }}
          filterLabel={filterLabel}
          onClearFilter={() => setSearch(null)}
          notice={notice}
          onSearchResult={onSearchResult}
          onOpenGallery={() => setGalleryOpen(true)}
          galleryCount={gallery.length}
          galleryButtonRef={galleryButtonRef}
          onRent={() =>
            range.start && range.end &&
            setBooking({ vehicle: selected, start: range.start, end: range.end, pickupTime: times.pickup, returnTime: times.ret })
          }
        />

        <section className="info" id="about">
          <span className="label">About</span>
          <h2>Kein Mietwagen.<br />Ein Moment.</h2>
          <p>
            APEX ist ein junges Rental-Studio für Menschen, die Fahren als Erlebnis verstehen. Eine kleine, kuratierte Flotte,
            persönliche Übergabe und Fahrzeuge in Showroom-Zustand.
          </p>
          <div className="info-stats">
            <div><b>5</b><span>Fahrzeuge</span></div>
            <div><b>24 h</b><span>Concierge</span></div>
            <div><b>0</b><span>Kompromisse</span></div>
          </div>
        </section>

        <section className="info" id="contact">
          <span className="label">Contact</span>
          <h2>Sprich mit uns.</h2>
          <div className="contact-row">
            {/* PLATZHALTER-Kontaktdaten */}
            <a href="mailto:drive@apex-rentals.example"><Mail size={18} strokeWidth={1.4} /> drive@apex-rentals.example</a>
            <a href="tel:+41440000000"><Phone size={18} strokeWidth={1.4} /> +41 44 000 00 00</a>
            <span><MapPin size={18} strokeWidth={1.4} /> Musterstrasse 1, 8000 Zürich</span>
          </div>
        </section>

        <footer className="footer">
          <span>© {new Date().getFullYear()} APEX Rentals</span>
          <span>Prototyp · alle Fahrzeugdaten, Preise und Verfügbarkeiten sind Demo-Daten</span>
        </footer>
      </main>

      <AnimatePresence>
        {galleryOpen && (
          <PhotoGallery
            key="gallery"
            vehicle={selected}
            images={gallery}
            onClose={() => setGalleryOpen(false)}
            returnFocusTo={galleryButtonRef}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {booking && <BookingForm key="booking" draft={booking} onClose={() => setBooking(null)} />}
      </AnimatePresence>
    </>
  );
}
