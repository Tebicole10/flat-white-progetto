import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Fallback a 100dvh: en Safari/iOS instalada como app, dvh a veces reporta
// mal en el primer pintado (bug conocido de WebKit) y deja un resto de
// fondo abajo. Medimos el alto real con JS y lo pisamos por variable CSS.
const setAppHeight = () => {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
};
setAppHeight();
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
