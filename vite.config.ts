import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run dev`          -> normaler Dev-Server
// `npm run build:single` -> eine einzige HTML-Datei (zum Teilen/Testen ohne Server)
export default defineConfig(({ mode }) => ({
  plugins: mode === 'single' ? [react(), viteSingleFile()] : [react()],
  // relative Pfade im Einzeldatei-Build, damit /cars/... auch als Artefakt funktioniert
  base: mode === 'single' ? './' : '/',
  build: mode === 'single' ? { outDir: 'dist-single' } : undefined,
}));
