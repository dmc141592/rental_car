import { AnimatePresence, motion } from 'motion/react';
import type { Vehicle } from '../data/vehicles';
import { AnimatedWheel } from './AnimatedWheel';
import { SmokeEffect } from './SmokeEffect';
import { SearchCircle } from './SearchCircle';
import { SearchTabs, type SearchMode } from './SearchTabs';
import { DateSearch, type SearchResult } from './DateSearch';
import { VehicleShowroom } from './VehicleShowroom';
import { VehicleList } from './VehicleList';
import type { PartialRange } from './AvailabilityCalendar';
import { useViewport } from '../lib/useViewport';
import { circleDiameters } from './SearchCircle';

interface Props {
  mode: SearchMode;
  onModeChange: (m: SearchMode) => void;
  vehicles: Vehicle[];
  selected: Vehicle;
  onSelect: (id: string) => void;
  onStep: (delta: number) => void;
  range: PartialRange;
  onRangeChange: (r: PartialRange) => void;
  filterLabel: string | null;
  onClearFilter: () => void;
  notice: string | null;
  onSearchResult: (r: SearchResult) => void;
  onRent: () => void;
  onOpenGallery: () => void;
  galleryCount: number;
  galleryButtonRef: React.Ref<HTMLButtonElement>;
}

/**
 * Reifengeometrie (Seitenansicht): Das Rad ist in voller Höhe sichtbar, aber
 * nur ca. ein Viertel seiner Breite ragt von rechts ins Bild (Radmitte liegt
 * 0.5·r rechts ausserhalb des Viewports). Radius: möglichst gross (fast volle
 * Hero-Höhe), ohne den runden Showroom-Kreis im grössten Zustand zu berühren.
 */
const VISIBLE_FRACTION = 0.25; // sichtbarer Anteil des Durchmessers

function useWheelGeometry(): React.CSSProperties {
  const { w, h, isMobile } = useViewport();
  const out = 1 - 2 * VISIBLE_FRACTION; // Radmitte liegt out·r rechts vom Rand
  if (isMobile) {
    const r = Math.round(Math.min(w * 0.55, 260));
    return { width: r * 2, height: r * 2, right: -r * (1 + out), bottom: -r * 0.35 };
  }
  const { showD } = circleDiameters(w, h);
  const ccx = w / 2, ccy = h / 2, cR = showD / 2;
  const gap = 32;
  const maxR = h * 0.47; // volle Höhe sichtbar, kleiner Rand oben/unten
  const fits = (r: number) => Math.hypot(w + out * r - ccx, h - r * 1.04 - ccy) >= cR + r + gap;
  let lo = 120, hi = maxR;
  for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; }
  const r = Math.round(lo);
  const top = h - r * 2.04; // steht knapp über dem unteren Rand
  return { width: r * 2, height: r * 2, right: -r * (1 + out), top };
}

export function HeroSection(p: Props) {
  const wheelStyle = useWheelGeometry();
  return (
    <section className={`hero mode-${p.mode}`} id="home">
      {/* Ebene 0–1: Reifen + Rauch (hinter dem Kreis) */}
      {/* Ebenen: Rauch hinten/mittel → Reifen → Rauch vorne → Kreis → UI */}
      <SmokeEffect />
      <AnimatedWheel style={wheelStyle} />

      {/* Fahrzeugliste links ausserhalb des Kreises */}
      <AnimatePresence>
        {p.mode === 'cars' && (
          <VehicleList
            key="list"
            vehicles={p.vehicles}
            selectedId={p.selected.id}
            onSelect={p.onSelect}
            filterLabel={p.filterLabel}
            onClearFilter={p.onClearFilter}
          />
        )}
      </AnimatePresence>

      {/* Ebene 2: der Kreis */}
      <SearchCircle mode={p.mode}>
        <SearchTabs mode={p.mode} onChange={p.onModeChange} />
        <AnimatePresence mode="wait" initial={false}>
          {p.mode === 'date' ? (
            <motion.div
              key="date"
              className="circle-pane"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.35 } }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.25 } }}
            >
              <DateSearch onResult={p.onSearchResult} />
            </motion.div>
          ) : (
            <motion.div
              key="cars"
              className="circle-pane"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.5, delay: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              <VehicleShowroom
                vehicle={p.selected}
                range={p.range}
                onRangeChange={p.onRangeChange}
                onPrev={() => p.onStep(-1)}
                onNext={() => p.onStep(1)}
                canNavigate={p.vehicles.length > 1}
                notice={p.notice}
                onRent={p.onRent}
                onOpenGallery={p.onOpenGallery}
                galleryCount={p.galleryCount}
                galleryButtonRef={p.galleryButtonRef}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </SearchCircle>
    </section>
  );
}
