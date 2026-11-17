import { useEffect } from 'react';
import { motion } from 'motion/react';
import { wheelController } from '../lib/wheelController';

export type SearchMode = 'date' | 'cars';

const TABS: { id: SearchMode; label: string }[] = [
  { id: 'date', label: 'Datum' },
  { id: 'cars', label: 'Autos' },
];

const HOLD_KEY = 'tabs';

/**
 * DATUM | AUTOS
 *
 * Reifen dreht, solange die Maus über einem der beiden Menüpunkte ist.
 * Der Hover-Zustand wird bewusst über ECHTE Mausbewegungen bestimmt (globaler
 * pointermove) statt über pointerenter/-leave: Beim Menüwechsel wächst der
 * Kreis und die Menüpunkte verschieben sich unter dem Mauszeiger – das soll
 * das Rad nicht stoppen. Es läuft weiter, bis die Maus tatsächlich bewegt wird
 * und dann nicht mehr über einem Menüpunkt steht.
 * Ein Klick startet keinen Timer; er wechselt nur den Modus.
 * Touch-Geräte haben keinen Hover → dort keine Rotation durch die Tabs.
 */
export function SearchTabs({ mode, onChange }: { mode: SearchMode; onChange: (m: SearchMode) => void }) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const overTab = e.target instanceof Element && !!e.target.closest('.tab');
      if (overTab) wheelController.hold(HOLD_KEY);
      else wheelController.release(HOLD_KEY);
    };
    const onLeaveWindow = () => wheelController.release(HOLD_KEY);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeaveWindow);
    window.addEventListener('blur', onLeaveWindow);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow);
      window.removeEventListener('blur', onLeaveWindow);
      wheelController.release(HOLD_KEY);
    };
  }, []);

  return (
    <div className="tabs" role="tablist">
      {TABS.map((t, i) => (
        <span key={t.id} className="tab-wrap">
          {i > 0 && <span className="tab-sep" aria-hidden="true" />}
          <button
            role="tab"
            aria-selected={mode === t.id}
            className={`tab${mode === t.id ? ' active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
            {mode === t.id && <motion.span layoutId="tab-underline" className="tab-underline" />}
          </button>
        </span>
      ))}
    </div>
  );
}
