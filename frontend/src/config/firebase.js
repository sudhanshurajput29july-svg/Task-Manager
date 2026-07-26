import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

let app = null;
let auth = null;
let googleProvider = null;

if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_')) {
  try {
    app = getApps().length === 0 ? initializeApp({
      apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    }) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.error('Firebase init error:', err.message);
  }
}

export { auth, googleProvider, signInWithPopup };
