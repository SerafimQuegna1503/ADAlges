// firebaseConfig.js
// ─────────────────────────────────────────────────────────────
// 1. Vai a https://console.firebase.google.com
// 2. Cria um projeto > Adiciona uma app Web
// 3. Copia as credenciais e substitui os valores abaixo
// 4. No Firebase Console: Authentication > Sign-in method
//    → Ativa "E-mail/Senha" e "Google"
// ─────────────────────────────────────────────────────────────

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDozsсK5Ucms-0yKslocBu2zaX8wpHeKLQ',
  authDomain: 'adalges15.firebaseapp.com',
  projectId: 'adalges15',
  storageBucket: 'adalges15.firebasestorage.app',
  messagingSenderId: '56783599410',
  appId: '1:56783599410:web:f4c0204c936b7c9fa7092b',
  measurementId: 'G-B3MHJPDJES',
};

// Evita reinicializar a app em hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);

export default app;
