/**
 * ============================================================
 *  BUCHUNGS-SERVICE (DEMO)
 * ============================================================
 *  Löst KEINE echte Zahlung und KEINE rechtsverbindliche Buchung aus.
 *  Später ersetzen durch: POST /api/bookings → Datenbank,
 *  anschliessend Zahlungs-Session (z. B. Stripe / Datatrans / Twint).
 * ============================================================
 */
import type { Vehicle } from '../data/vehicles';
import { rentalDays } from '../lib/dates';

export const EXTRA_DRIVER_PER_DAY = 25; // DEMO-Preis

export interface BookingDraft {
  vehicle: Vehicle;
  start: Date;
  end: Date;
  pickupTime: string;
  returnTime: string;
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  licenseNumber?: string;
  licenseIssued?: string;
  extraDriver?: { name: string; birthDate: string } | null;
  remarks?: string;
}

export function calculatePrice(draft: BookingDraft, extraDriver: boolean) {
  const days = rentalDays(draft.start, draft.end);
  const base = days * draft.vehicle.pricePerDay;
  const extras = extraDriver ? days * EXTRA_DRIVER_PER_DAY : 0;
  return { days, base, extras, total: base + extras };
}

export async function submitDemoBooking(
  _draft: BookingDraft,
  _customer: CustomerData,
): Promise<{ reference: string }> {
  await new Promise((r) => setTimeout(r, 1100));
  const reference = 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  return { reference };
}
