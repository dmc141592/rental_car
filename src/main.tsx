import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Nur im Dev-Modus: erlaubt automatisierte Tests der Reifenlogik
import { wheelController } from './lib/wheelController';
if (import.meta.env.DEV) (window as unknown as { __wheel: typeof wheelController }).__wheel = wheelController;
