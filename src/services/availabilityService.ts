/**
 * ============================================================
 *  VERFÜGBARKEITS-SERVICE (DEMO)
 * ============================================================
 *  Erzeugt deterministische, künstliche Buchungen pro Fahrzeug
 *  relativ zum heutigen Datum. Gleiche Eingaben → gleiche Daten.
 *
 *  Für ein echtes Backend nur die Implementierung der exportierten
 *  Funktionen ersetzen (z. B. fetch('/api/availability?...')).
 *  Die UI nutzt ausschliesslich diese Schnittstelle.
 * ============================================================
 */
import { VEHICLES, type Vehicle } from '../data/vehicles';
import { addDays, diffDays, toKey, today } from '../lib/dates';

export interface DateRange {
  start: Date;
  end: Date;
}

/** Simple seeded PRNG (mulberry32), damit Demo-Daten stabil bleiben. */
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

const DEMO_HORIZON_DAYS = 200;
const blockedCache = new Map<string, Set<string>>();

/** DEMO: generiert gebuchte Tage für ein Fahrzeug. */
function getBlockedDays(vehicle: Vehicle): Set<string> {
  const cached = blockedCache.get(vehicle.id);
  if (cached) return cached;

  const base = today();
  const rand = seeded(hash(vehicle.id) ^ (base.getFullYear() * 400 + base.getMonth() * 31));
  const blocked = new Set<string>();
  let cursor = Math.floor(rand() * 4); // erste Buchung bald
  while (cursor < DEMO_HORIZON_DAYS) {
    // Lücke zwischen Buchungen: je höher die Auslastung, desto kürzer
    const gap = Math.floor(2 + rand() * 9 * (1.2 - vehicle.demoUtilisation));
    cursor += gap;
    const length = 1 + Math.floor(rand() * (2 + vehicle.demoUtilisation * 6));
    for (let i = 0; i < length; i++) blocked.add(toKey(addDays(base, cursor + i)));
    cursor += length;
  }
  blockedCache.set(vehicle.id, blocked);
  return blocked;
}

export function isDayAvailable(vehicleId: string, day: Date): boolean {
  const vehicle = VEHICLES.find((v) => v.id === vehicleId);
  if (!vehicle) return false;
  if (diffDays(today(), day) < 0) return false;
  return !getBlockedDays(vehicle).has(toKey(day));
}

/** Ein Mietzeitraum ist nur gültig, wenn ALLE Tage inkl. Start und Ende frei sind. */
export function isRangeAvailable(vehicleId: string, range: DateRange): boolean {
  const days = diffDays(range.start, range.end);
  if (days < 0) return false;
  for (let i = 0; i <= days; i++) {
    if (!isDayAvailable(vehicleId, addDays(range.start, i))) return false;
  }
  return true;
}

/** Async – simuliert eine Backend-Abfrage für die Datumssuche. */
export async function searchAvailableVehicles(range: DateRange): Promise<Vehicle[]> {
  await new Promise((r) => setTimeout(r, 650));
  return VEHICLES.filter((v) => isRangeAvailable(v.id, range));
}
