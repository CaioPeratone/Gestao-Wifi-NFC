import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore directly for the specified database
const dbId =
  !firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === '(default)'
    ? undefined
    : firebaseConfig.firestoreDatabaseId;

export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Whitelist of authorized administrator Google accounts
export const DEFAULT_ADMIN_EMAILS: string[] = [
  'caioperatone.beiral@gmail.com'
];

export default app;
