/**
 * ============================================================
 *  DEMO-DATEN – FAHRZEUGFLOTTE
 * ============================================================
 *  Alle Angaben (Leistung, Preise, Farben …) sind Platzhalter
 *  für den Prototyp und NICHT verbindlich.
 *
 *  Bildtypen (bitte nicht vermischen):
 *   - `showroomImage` → freigestellte Showroom-Darstellung (public/cars/<id>.webp,
 *                        vom Kunden geliefert 17.11.2026, freigestellt mit rembg
 *                        isnet-general-use). Fehlt die Datei, wird automatisch die
 *                        SVG-Platzhalter-Silhouette (`placeholder`) gezeigt.
 *   - Galerie-Fotos  → src/data/gallery.ts (echte Fotos des Mietfahrzeugs)
 *   - `brandKey`     → Logo aus src/data/brandLogos.ts
 *   - `pricePerDay`, `specs` → echte Werte aus Backend / CMS.
 * ============================================================
 */

export type VehicleCategory = 'SPORT' | 'HYBRID' | 'DAILY';

/** Silhouetten-Typ für die Platzhaltergrafik (nur relevant ohne `image`). */
export type PlaceholderBody = 'midengine' | 'coupe' | 'rearengine' | 'wedge' | 'hatch';

export interface VehicleSpecs {
  powerPs: number;
  zeroToHundred: number; // Sekunden
  topSpeed: number; // km/h
  transmission: string;
  drive: string;
  seats: number;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  /** Schlüssel in BRAND_LOGOS (src/data/brandLogos.ts) */
  brandKey: string;
  /** Kurzes Monogramm als Fallback, falls kein Logo hinterlegt ist. */
  brandMonogram: string;
  /** Generation / Modellvariante, auf die sich Bilder & Daten beziehen */
  generation: string;
  category: VehicleCategory;
  pricePerDay: number; // CHF
  currency: 'CHF';
  specs: VehicleSpecs;
  showroomImage?: string;
  placeholder: { body: PlaceholderBody; color: string; accent: string };
  /** DEMO: Steuert, wie stark das Auto in den generierten Demo-Buchungen ausgelastet ist (0–1). */
  demoUtilisation: number;
}

export const VEHICLES: Vehicle[] = [
  {
    id: 'audi-r8',
    brandKey: 'audi',
    generation: 'R8 Coupé V10 (Typ 4S)',
    showroomImage: `${import.meta.env.BASE_URL}cars/audi-r8.webp`,
    brand: 'Audi',
    model: 'R8',
    brandMonogram: 'AU',
    category: 'SPORT',
    pricePerDay: 490,
    currency: 'CHF',
    specs: { powerPs: 570, zeroToHundred: 3.4, topSpeed: 324, transmission: 'Automatik', drive: 'AWD', seats: 2 },
    placeholder: { body: 'midengine', color: '#4b5157', accent: '#1d1f22' },
    demoUtilisation: 0.42,
  },
  {
    id: 'bmw-m4',
    brandKey: 'bmw',
    generation: 'M4 Competition Coupé (G82)',
    showroomImage: `${import.meta.env.BASE_URL}cars/bmw-m4.webp`,
    brand: 'BMW',
    model: 'M4',
    brandMonogram: 'BM',
    category: 'SPORT',
    pricePerDay: 360,
    currency: 'CHF',
    specs: { powerPs: 530, zeroToHundred: 3.9, topSpeed: 290, transmission: 'Automatik', drive: 'RWD', seats: 4 },
    placeholder: { body: 'coupe', color: '#2f4a3c', accent: '#14201a' },
    demoUtilisation: 0.35,
  },
  {
    id: 'porsche-911',
    brandKey: 'porsche',
    generation: '911 Carrera S (992)',
    showroomImage: `${import.meta.env.BASE_URL}cars/porsche-911.webp`,
    brand: 'Porsche',
    model: '911',
    brandMonogram: 'PO',
    category: 'SPORT',
    pricePerDay: 450,
    currency: 'CHF',
    specs: { powerPs: 450, zeroToHundred: 3.5, topSpeed: 308, transmission: 'PDK', drive: 'RWD', seats: 4 },
    placeholder: { body: 'rearengine', color: '#7a2a26', accent: '#2a0f0e' },
    demoUtilisation: 0.5,
  },
  {
    id: 'bmw-i8',
    brandKey: 'bmw',
    generation: 'i8 Coupé (I12)',
    showroomImage: `${import.meta.env.BASE_URL}cars/bmw-i8.webp`,
    brand: 'BMW',
    model: 'i8',
    brandMonogram: 'BM',
    category: 'HYBRID',
    pricePerDay: 380,
    currency: 'CHF',
    specs: { powerPs: 374, zeroToHundred: 4.4, topSpeed: 250, transmission: 'Automatik', drive: 'AWD', seats: 4 },
    placeholder: { body: 'wedge', color: '#d9dcdf', accent: '#1f2a33' },
    demoUtilisation: 0.3,
  },
  {
    id: 'toyota-prius',
    brandKey: 'toyota',
    generation: 'Prius Hybrid (XW50, Facelift)',
    showroomImage: `${import.meta.env.BASE_URL}cars/toyota-prius.webp`,
    brand: 'Toyota',
    model: 'Prius',
    brandMonogram: 'TO',
    category: 'DAILY',
    pricePerDay: 89,
    currency: 'CHF',
    specs: { powerPs: 122, zeroToHundred: 10.6, topSpeed: 180, transmission: 'e-CVT', drive: 'FWD', seats: 5 },
    placeholder: { body: 'hatch', color: '#3b3f45', accent: '#18191b' },
    demoUtilisation: 0.18,
  },
];

export const getVehicleById = (id: string) => VEHICLES.find((v) => v.id === id);
