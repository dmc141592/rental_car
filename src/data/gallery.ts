/**
 * ============================================================
 *  GALERIE-BILDER PRO FAHRZEUG
 * ============================================================
 *  Zwei Bildtypen werden bewusst getrennt:
 *
 *   kind: 'rental'     → ECHTE Fotos des konkret vermieteten Fahrzeugs
 *                        (eigene Aufnahmen, z. B. '/gallery/audi-r8/01.jpg').
 *                        Aktuell noch KEINE vorhanden.
 *
 *   kind: 'reference'  → DEMO-Platzhalter: frei lizenzierte Referenzfotos
 *                        desselben Modells von Wikimedia Commons. Sie zeigen
 *                        NICHT das Mietfahrzeug und werden in der Galerie
 *                        entsprechend gekennzeichnet (inkl. Urheber/Lizenz).
 *
 *  Die Showroom-Grafiken (vehicles.ts → showroomImage) sind davon
 *  unabhängig und werden hier nie verwendet.
 *
 *  `licenseVerified: false` = Lizenz/Urheber wurde nur über Sekundärquellen
 *  ermittelt → vor Livegang auf der Commons-Dateiseite prüfen.
 * ============================================================
 */

export interface GalleryImage {
  kind: 'rental' | 'reference';
  src: string;
  thumb: string;
  alt: string;
  caption: string;
  author?: string;
  license?: string;
  sourceUrl?: string;
  licenseVerified?: boolean;
}

/** Wikimedia Commons liefert über Special:FilePath skalierte Versionen. */
const commons = (file: string, opts: Omit<GalleryImage, 'kind' | 'src' | 'thumb' | 'sourceUrl'>): GalleryImage => {
  const name = encodeURIComponent(file.replace(/ /g, '_'));
  return {
    kind: 'reference',
    src: `https://commons.wikimedia.org/wiki/Special:FilePath/${name}?width=1800`,
    thumb: `https://commons.wikimedia.org/wiki/Special:FilePath/${name}?width=320`,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${name}`,
    ...opts,
  };
};

export const GALLERIES: Record<string, GalleryImage[]> = {
  'audi-r8': [
    commons('2015 Audi R8 Coupé 5.2 FSI quattro (19409896583).jpg', {
      alt: 'Audi R8 Coupé (Typ 4S), Referenzfoto',
      caption: 'Audi R8 Coupé V10 (Typ 4S)',
      author: 'Edvvc',
      license: 'CC BY 2.0',
      licenseVerified: true,
    }),
    commons('Audi R8 (52576526220).jpg', {
      alt: 'Audi R8, Referenzfoto',
      caption: 'Audi R8',
      author: 'Flickr-Upload (siehe Quelle)',
      license: 'siehe Commons-Dateiseite',
      licenseVerified: false,
    }),
  ],
  'bmw-m4': [
    commons('BMW G82 M4 Competition 16.08.21 JM (1).jpg', {
      alt: 'BMW M4 Competition (G82), Referenzfoto',
      caption: 'BMW M4 Competition Coupé (G82)',
      author: 'Johannes Maximilian',
      license: 'GFDL 1.2',
      licenseVerified: true,
    }),
  ],
  'porsche-911': [
    commons('Porsche 992 Carrera S coupe IMG 5838.jpg', {
      alt: 'Porsche 911 Carrera S (992), Referenzfoto',
      caption: 'Porsche 911 Carrera S Coupé (992)',
      author: 'Alexander Migl',
      license: 'CC BY-SA 4.0',
      licenseVerified: true,
    }),
    commons('Porsche 992 Carrera 4S IMG 2942.jpg', {
      alt: 'Porsche 911 Carrera 4S (992), Referenzfoto',
      caption: 'Porsche 911 Carrera 4S Coupé (992)',
      license: 'siehe Commons-Dateiseite',
      licenseVerified: false,
    }),
    commons('2019 Porsche 911 Carrera S S-A 3.0 Rear.jpg', {
      alt: 'Porsche 911 Carrera S (992) Heckansicht, Referenzfoto',
      caption: 'Porsche 911 Carrera S (992) – Heck',
      license: 'siehe Commons-Dateiseite',
      licenseVerified: false,
    }),
  ],
  'bmw-i8': [
    commons('BMW i8 IAA 2013 04.jpg', {
      alt: 'BMW i8 auf der IAA 2013, Referenzfoto',
      caption: 'BMW i8 (I12) – IAA 2013',
      license: 'siehe Commons-Dateiseite',
      licenseVerified: false,
    }),
    commons('Photography by David Adam Kess (BMW i8).jpg', {
      alt: 'BMW i8, Referenzfoto',
      caption: 'BMW i8 (I12)',
      author: 'David Adam Kess',
      license: 'CC BY-SA (Version siehe Quelle)',
      licenseVerified: false,
    }),
  ],
  'toyota-prius': [
    commons('Toyota Prius (XW60) Plug-in Hybrid Auto Zuerich 2023 1X7A1226.jpg', {
      alt: 'Toyota Prius (XW60) an der Auto Zürich 2023, Referenzfoto',
      caption: 'Toyota Prius Plug-in Hybrid (XW60) – Auto Zürich 2023',
      license: 'siehe Commons-Dateiseite',
      licenseVerified: false,
    }),
    commons('Toyota Prius (XW60) Plug-in Hybrid Auto Zuerich 2023 1X7A1228.jpg', {
      alt: 'Toyota Prius (XW60), Referenzfoto',
      caption: 'Toyota Prius Plug-in Hybrid (XW60)',
      license: 'siehe Commons-Dateiseite',
      licenseVerified: false,
    }),
    commons('Toyota Prius (XW60) Plug-in Hybrid 1X7A1864.jpg', {
      alt: 'Toyota Prius (XW60), Referenzfoto',
      caption: 'Toyota Prius Plug-in Hybrid (XW60)',
      license: 'siehe Commons-Dateiseite',
      licenseVerified: false,
    }),
  ],
};

export const getGallery = (vehicleId: string) => GALLERIES[vehicleId] ?? [];
