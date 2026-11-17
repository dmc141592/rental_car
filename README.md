# APEX – Premium Sports Car Rental · Interaktiver Prototyp

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Produktions-Build nach dist/
npm run build:single  # alles in einer HTML-Datei (dist-single/index.html)
```

Stack: React 18 · TypeScript · Vite · Motion for React · Lucide · CSS (Container Queries, kein Tailwind nötig)

Reifen: SVG-Ebenen in Seitenansicht (¼ sichtbar), GPU-Rotation · Rauch: Canvas 2D mit prozeduralen, selbstverschatteten Texturen in 3 Ebenen (hinten / mittel / vorne über dem Reifen). Auf Geräten mit ≤ 4 Kernen und auf Mobile wird automatisch eine leichtere Variante genutzt; bei `prefers-reduced-motion` stehen Reifen und Rauch still.

## Struktur
```
src/
  data/vehicles.ts               DEMO-Flotte (Specs, Preise, Bild-/Logo-Slots)
  services/availabilityService.ts DEMO-Verfügbarkeit (deterministisch generiert) – Backend-Schnittstelle
  services/bookingService.ts      DEMO-Buchung + Preisberechnung – Backend/Payment-Schnittstelle
  lib/wheelController.ts          Reifen-/Rauch-Steuerung ausserhalb von React (6-s-Intro + Hover)
  lib/dates.ts, lib/useViewport.ts
  components/
    Header, HeroSection, SearchCircle, SearchTabs, DateSearch,
    VehicleShowroom, VehicleList, VehicleDisplay, VehicleSpecifications,
    AvailabilityCalendar, BookingForm, AnimatedWheel, SmokeEffect, CarIllustration,
    VehicleImage, PhotoGallery
  data/gallery.ts, data/brandLogos.ts, data/assets.ts
```

## Später ersetzen
| Was | Wo | Wie |
|---|---|---|
| Showroom-Fahrzeugbilder | `public/cars/<id>.png` | einfach ablegen – fehlt die Datei, erscheint die Platzhalter-Silhouette. Vorgaben & Prompts: `ASSETS.md` |
| Galerie (echte Fotos) | `src/data/gallery.ts` | Einträge mit `kind: 'rental'` ersetzen die Demo-Referenzfotos |
| Reifen-Foto | `src/data/assets.ts` → `WHEEL_ASSET` | frontales, freigestelltes Rad; sonst SVG-Felge |
| Markenlogos | `src/data/brandLogos.ts` | Quellen & Rechte: `ASSETS.md` |
| Specs & Preise | `vehicles.ts` | echte Werte oder aus CMS/API laden |
| Verfügbarkeit | `availabilityService.ts` | Funktionen gegen API austauschen (Signaturen beibehalten) |
| Buchung/Zahlung | `bookingService.ts` → `submitDemoBooking` | POST an Backend, danach Payment-Session |
| Firmenlogo, Name, Kontaktdaten | `Header.tsx`, `App.tsx` | Platzhalter „APEX“ |
| Mindestalter, Zusatzfahrerpreis | `BookingForm.tsx`, `bookingService.ts` | Geschäftsregeln |
