# Assets, Quellen & Nutzungsrechte

Stand: 17.11.2026 · Alle Angaben ohne Gewähr – vor dem Livegang juristisch prüfen.

## 1. Markenlogos (Fahrzeugliste)

Datei: `src/data/brandLogos.ts` – Original-Geometrie, unverändert, einfarbig (Warmweiss) für den schwarzen Hintergrund.

| Marke | Herkunft der SVG-Daten | Herstellerquelle / Richtlinien |
|---|---|---|
| Audi | Simple Icons v16.38.0 | https://www.audi.com/ci/en/intro/basics/rings.html |
| BMW | Simple Icons v16.38.0 | https://bmw.com |
| Porsche | Simple Icons v16.38.0 | https://www.porsche.com |
| Toyota | Simple Icons v16.38.0 | https://www.toyota.com/brandguidelines/logo/ |

**Rechte:** Die SVG-Sammlung Simple Icons steht unter CC0-1.0. Das gilt **nicht** für die Marken selbst: Die Logos sind eingetragene Marken der AUDI AG, BMW AG, Dr. Ing. h.c. F. Porsche AG und Toyota Motor Corporation. Sie werden hier nur verwendet, um die vermieteten Fahrzeuge zu kennzeichnen (beschreibende Nutzung). Das ist bei Vermietern verbreitet, ersetzt aber keine Rechtsberatung. Vor allem darf kein Eindruck einer offiziellen Partnerschaft entstehen.
→ Ohne Freigabe: In `vehicles.ts` den `brandKey` leeren. Dann erscheint automatisch das neutrale Monogramm.

## 2. Showroom-Fahrzeugbilder (`public/cars/<id>.webp`)

**Eingebunden (17.11.2026):** fünf vom Kunden gelieferte Bilder (Dreiviertel-Frontansicht, Front links):

| Datei | Modell laut Bild |
|---|---|
| `audi-r8.webp` | Audi R8 Coupé (Typ 4S, Facelift) |
| `bmw-m4.webp` | BMW M4 Competition Coupé (G82) |
| `porsche-911.webp` | Porsche 911 Carrera (992) |
| `bmw-i8.webp` | BMW i8 Coupé (I12) |
| `toyota-prius.webp` | Toyota Prius (4. Generation XW50, Facelift) |

**Bearbeitung:** Die Originale hatten halbtransparente graue Flächen/Schatten und Reste anderer Fahrzeuge. Sie wurden mit dem KI-Freisteller *rembg* (Modell *isnet-general-use*) sauber freigestellt, auf das Fahrzeug zugeschnitten, auf 1800 px Breite skaliert und als WebP gespeichert (je ca. 85–105 KB). Den Bodenschatten erzeugt die Website per CSS.

**Rechte:** Die Herkunft der Bilder ist dem Kunden bekannt und von ihm zu verantworten. Bei Hersteller-Pressebildern ist die Nutzung oft auf redaktionelle Zwecke beschränkt, das bitte vor dem Livegang prüfen.

**Austauschen:** neue Datei mit gleichem Namen ablegen. Vorgaben: transparenter Hintergrund, Front nach links, gleiche Perspektive, ca. 2400 px breit.

## 3. Galerie (`src/data/gallery.ts`)

- `kind: 'rental'` = **echte Fotos des konkreten Mietfahrzeugs** (z. B. `public/gallery/audi-r8/01.jpg`), noch keine vorhanden.
- `kind: 'reference'` = Demo-Platzhalter: frei lizenzierte Referenzfotos des Modells von Wikimedia Commons. In der Galerie sind sie sichtbar als „Referenzfotos des Modells – nicht das Mietfahrzeug“ gekennzeichnet, mit Urheber, Lizenz und Quelllink.

Die Bilder werden zur Laufzeit von Wikimedia Commons geladen (`Special:FilePath`). In der Online-Vorschau sind externe Bilder blockiert. Dort erscheint ein Hinweis, lokal mit `npm run dev` laden sie normal.

| Fahrzeug | Datei (Commons) | Urheber | Lizenz | geprüft |
|---|---|---|---|---|
| Audi R8 | 2015 Audi R8 Coupé 5.2 FSI quattro (19409896583).jpg | Edvvc | CC BY 2.0 | ja |
| Audi R8 | Audi R8 (52576526220).jpg | Flickr-Upload | siehe Dateiseite | nein |
| BMW M4 | BMW G82 M4 Competition 16.08.21 JM (1).jpg | Johannes Maximilian | GFDL 1.2 | ja |
| Porsche 911 | Porsche 992 Carrera S coupe IMG 5838.jpg | Alexander Migl | CC BY-SA 4.0 | ja |
| Porsche 911 | Porsche 992 Carrera 4S IMG 2942.jpg | – | siehe Dateiseite | nein |
| Porsche 911 | 2019 Porsche 911 Carrera S S-A 3.0 Rear.jpg | – | siehe Dateiseite | nein |
| BMW i8 | BMW i8 IAA 2013 04.jpg | – | siehe Dateiseite | nein |
| BMW i8 | Photography by David Adam Kess (BMW i8).jpg | David Adam Kess | CC BY-SA (Version prüfen) | nein |
| Toyota Prius | Toyota Prius (XW60) Plug-in Hybrid Auto Zuerich 2023 1X7A1226.jpg | – | siehe Dateiseite | nein |
| Toyota Prius | Toyota Prius (XW60) Plug-in Hybrid Auto Zuerich 2023 1X7A1228.jpg | – | siehe Dateiseite | nein |
| Toyota Prius | Toyota Prius (XW60) Plug-in Hybrid 1X7A1864.jpg | – | siehe Dateiseite | nein |

„geprüft = nein“: Dateiname über Sekundärquellen gefunden, Urheber/Lizenz auf der Commons-Dateiseite noch bestätigen. CC BY/BY-SA verlangt Namensnennung + Lizenzlink (in der Galerie umgesetzt). GFDL ist für Websites unpraktisch, im Zweifel ersetzen.

## 4. Reifen (`src/components/AnimatedWheel.tsx`, `src/data/assets.ts`)

**Umgesetzt (ohne externes Bild):** Seitenansicht. In voller Höhe sichtbar ist nur ca. ein Viertel der Radbreite, der Rest liegt hinter dem rechten Rand. Das Rad hat einen Niederquerschnittsreifen mit Profil und erhabener Flankenschrift. Die satinschwarze Schmiedefelge hat 10 Y-Speichen, eine gedrehte Felgenhornkante und einen Zentralverschluss (ohne Markenlogo). Dazu kommen eine gelochte Bremsscheibe und ein stehender roter Bremssattel. Glanz und Licht stehen still, und bei hoher Drehzahl verwischen die Speichen.

**Optional fotorealistischer:** `WHEEL_ASSET` ersetzt **nur die Speichen-Ebene** (Reifen, Bremse und Rotation bleiben). Benötigt wird ein **frontal (0°) aufgenommenes Felgenbild ohne Reifen**, freigestellt, quadratisch, Radmitte exakt im Bildzentrum, Felgenhorn bis ca. 76 % des Bildradius, mind. 1600 × 1600 px, ohne Bremssattel und ohne Bremsscheibe (beide sind eigene Ebenen).

> Photorealistic studio photo of a gloss black forged 10-spoke sports car alloy rim (no tyre, no brake disc, no caliper), seen exactly head-on, perfectly centered, isolated on transparent background, subtle cool reflections on spoke edges, square format.

Datei z. B. nach `public/wheel/rim.webp` legen und in `assets.ts` `WHEEL_ASSET = '/wheel/rim.webp'` setzen.

**Referenzbilder des Kunden** (Reifen/Rauch, Chat vom 17.11.2026) wurden nur als visuelle Vorlage genutzt und **nicht** eingebunden. Ihre Herkunft und Rechte sind unbekannt, und eines zeigt ein Porsche-Wappen.

## 5. Rauch (`src/components/SmokeEffect.tsx`)

Keine externen Dateien. Alle Rauchtexturen werden beim Laden prozedural erzeugt (eine pro Frame, blockiert den Start nicht), daher gibt es keine Bildrechte-Fragen.
