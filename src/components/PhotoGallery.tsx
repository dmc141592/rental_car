import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight, ExternalLink, ImageOff, Info, Loader2, X } from 'lucide-react';
import type { Vehicle } from '../data/vehicles';
import type { GalleryImage } from '../data/gallery';

/**
 * Lightbox-Galerie für die Fotos des aktuell gewählten Fahrzeugs.
 * - Bilder werden erst beim Öffnen geladen (nur aktuelles + Nachbarn vorgeladen)
 * - feste Bühnenhöhe → keine Layoutsprünge beim Wechsel
 * - Schliessen: X, Escape, Klick auf den Hintergrund
 * - Navigation: Pfeile, Pfeiltasten, Thumbnails, Swipe (Touch/Maus-Drag)
 * - Fokus bleibt im Dialog (Focus-Trap) und kehrt danach zum Auslöser zurück
 * - Referenzfotos (kind: 'reference') werden sichtbar als solche gekennzeichnet
 */
export function PhotoGallery({
  vehicle,
  images,
  onClose,
  returnFocusTo,
}: {
  vehicle: Vehicle;
  images: GalleryImage[];
  onClose: () => void;
  returnFocusTo: React.RefObject<HTMLButtonElement | null>;
}) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [loaded, setLoaded] = useState<Record<string, 'ok' | 'error'>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;
  const img = images[index];
  const isReference = img?.kind === 'reference';

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      setDir(delta);
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );
  const goTo = (i: number) => {
    setDir(i > index ? 1 : -1);
    setIndex(i);
  };

  // Scroll-Lock + Fokus setzen / zurückgeben
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const target = returnFocusTo.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      target?.focus();
    };
  }, [returnFocusTo]);

  // Tastatur: Escape, Pfeile, Focus-Trap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [go, onClose]);

  // Nachbarn vorladen (erst wenn Galerie offen ist)
  useEffect(() => {
    [1, -1].forEach((d) => {
      const n = images[(index + d + count) % count];
      if (n) { const pre = new Image(); pre.src = n.src; }
    });
  }, [index, images, count]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  const state = img ? loaded[img.src] : undefined;

  return createPortal(
    <motion.div
      className="gallery-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        ref={dialogRef}
        className="gallery"
        role="dialog"
        aria-modal="true"
        aria-label={`Fotos ${vehicle.brand} ${vehicle.model}`}
        initial={{ opacity: 0, scale: 0.965, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <header className="g-head">
          <div className="g-title">
            <span className="label">{vehicle.brand} · {vehicle.generation}</span>
            {isReference && (
              <span className="g-badge" title="Demo: Referenzfotos des Modells, nicht des konkreten Mietfahrzeugs">
                <Info size={12} strokeWidth={1.8} /> Demo · Referenzfotos des Modells – nicht das Mietfahrzeug
              </span>
            )}
          </div>
          <span className="g-count" aria-live="polite">{index + 1} / {count}</span>
          <button ref={closeRef} className="g-close" onClick={onClose} aria-label="Galerie schliessen">
            <X size={22} strokeWidth={1.4} />
          </button>
        </header>

        <div className="g-stage" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <button className="g-arrow left" onClick={() => go(-1)} disabled={count < 2} aria-label="Vorheriges Foto">
            <ChevronLeft size={26} strokeWidth={1.3} />
          </button>

          <div className="g-frame">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={img.src}
                className="g-slide"
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -dir * 40 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                drag={count > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={onDragEnd}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  draggable={false}
                  className={state === 'ok' ? 'is-loaded' : ''}
                  onLoad={() => setLoaded((l) => ({ ...l, [img.src]: 'ok' }))}
                  onError={() => setLoaded((l) => ({ ...l, [img.src]: 'error' }))}
                />
              </motion.div>
            </AnimatePresence>
            {!state && (
              <div className="g-status" role="status">
                <Loader2 size={22} className="spin" /> Foto wird geladen
              </div>
            )}
            {state === 'error' && (
              <div className="g-status g-error" role="status">
                <ImageOff size={24} strokeWidth={1.3} />
                <span>Foto konnte nicht geladen werden.</span>
                <small>In der Online-Vorschau sind externe Bilder blockiert – lokal mit „npm run dev“ werden sie angezeigt.</small>
              </div>
            )}
          </div>

          <button className="g-arrow right" onClick={() => go(1)} disabled={count < 2} aria-label="Nächstes Foto">
            <ChevronRight size={26} strokeWidth={1.3} />
          </button>
        </div>

        <footer className="g-foot">
          <p className="g-caption">
            {img.caption}
            {isReference && (
              <span className="g-credit">
                Foto: {img.author ?? 'siehe Quelle'} · {img.license ?? 'Lizenz siehe Quelle'}
                {img.sourceUrl && (
                  <a href={img.sourceUrl} target="_blank" rel="noreferrer noopener">
                    Wikimedia Commons <ExternalLink size={11} />
                  </a>
                )}
              </span>
            )}
          </p>
          {count > 1 && (
            <div className="g-thumbs" role="tablist" aria-label="Vorschaubilder">
              {images.map((t, i) => (
                <button
                  key={t.src}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Foto ${i + 1}`}
                  className={`g-thumb${i === index ? ' active' : ''}`}
                  onClick={() => goTo(i)}
                >
                  <img
                    src={t.thumb}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                  />
                  <span className="g-thumb-n" aria-hidden="true">{i + 1}</span>
                </button>
              ))}
            </div>
          )}
        </footer>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
