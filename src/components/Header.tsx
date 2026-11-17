import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

export type NavTarget = 'home' | 'fleet' | 'about' | 'contact';

const NAV: { id: NavTarget; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'fleet', label: 'Our Fleet' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

/** PLATZHALTER-Logo – später durch das echte Firmenlogo (SVG) ersetzen. */
function Logo() {
  return (
    <span className="logo">
      <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9 22 L16 8 L23 22" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 17 H20" stroke="#A8C5A0" strokeWidth="1.4" />
      </svg>
      <span className="logo-text">
        APEX<small>Rentals</small>
      </span>
    </span>
  );
}

export function Header({ active, onNavigate }: { active: NavTarget; onNavigate: (t: NavTarget) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <button className="logo-btn" onClick={() => onNavigate('home')} aria-label="Zur Startseite">
        <Logo />
      </button>
      <nav className="nav-desktop">
        {NAV.map((n) => (
          <button key={n.id} className={`nav-link${active === n.id ? ' active' : ''}`} onClick={() => onNavigate(n.id)}>
            {n.label}
          </button>
        ))}
      </nav>
      <button className="nav-toggle" onClick={() => setOpen((o) => !o)} aria-label="Menü" aria-expanded={open}>
        {open ? <X size={20} strokeWidth={1.4} /> : <Menu size={20} strokeWidth={1.4} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav-mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {NAV.map((n) => (
              <button key={n.id} className="nav-link" onClick={() => { setOpen(false); onNavigate(n.id); }}>
                {n.label}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
