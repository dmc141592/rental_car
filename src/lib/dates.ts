/** Kleine, abhängigkeitsfreie Datums-Helfer. Alle Daten werden als lokale Tage (00:00) behandelt. */

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const diffDays = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);
export const today = () => startOfDay(new Date());

/** yyyy-mm-dd (lokal) */
export const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];
export const WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const formatShort = (d: Date) =>
  d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
export const formatLong = (d: Date) =>
  d.toLocaleDateString('de-CH', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });

export const formatCHF = (n: number) => `CHF ${n.toLocaleString('de-CH')}`;

/** Halbstündliche Zeiten für Abhol-/Rückgabezeit (Demo-Öffnungszeiten 08:00–20:00). */
export const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const h = 8 + Math.floor(i / 2);
  return `${String(h).padStart(2, '0')}:${i % 2 ? '30' : '00'}`;
});

/** Mindestens 1 Miettag; ein Tag = Kalendertag zwischen Abholung und Rückgabe. */
export const rentalDays = (start: Date, end: Date) => Math.max(1, diffDays(start, end));
