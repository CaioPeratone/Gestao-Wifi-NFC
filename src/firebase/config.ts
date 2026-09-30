import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore: use default database if (default) or not specified, otherwise use specific ID
export const db =
  !firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === '(default)'
    ? getFirestore(app)
    : getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Whitelist of authorized administrator Google accounts
// Even if an unlisted Google account signs in, they are blocked and logged out
export const DEFAULT_ADMIN_EMAILS: string[] = [
  'caioperatone.beiral@gmail.com'
];

/**
 * Validates connection to Firestore at app initialization
 */
export async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Verifique a conexão de rede ou configuração do Firestore:', error.message);
    }
  }
}

// Run connection test on module load
testFirestoreConnection();

export default app;
