// Cliente de Firebase. La config viene de variables de entorno (.env) — nunca
// hardcodeada, a diferencia de como estaba antes con Supabase.
import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const faltantes = Object.entries(config)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (faltantes.length > 0) {
  throw new Error(
    `Falta configurar Firebase en el archivo .env (campos vacíos: ${faltantes.join(', ')}). ` +
    `Copiá .env.example a .env y pegá los valores de la consola de Firebase.`
  );
}

const app = initializeApp(config);

// Caché local persistente: evita volver a bajar las fotos en cada carga y deja
// que la app funcione offline. multipleTabManager permite varias pestañas.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
