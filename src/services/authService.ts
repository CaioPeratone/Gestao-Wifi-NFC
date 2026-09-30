import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, DEFAULT_ADMIN_EMAILS } from '../firebase/config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const ONLY_ADMIN_EMAIL = 'caioperatone.beiral@gmail.com';

/**
 * Checks whether an email address is authorized.
 * ONLY caioperatone.beiral@gmail.com is permitted. No other email can access.
 */
export async function isEmailAuthorized(user: User): Promise<boolean> {
  if (!user.email) return false;
  const normalizedEmail = user.email.toLowerCase().trim();
  return normalizedEmail === ONLY_ADMIN_EMAIL.toLowerCase();
}

/**
 * Initiates Google Sign-In with popup.
 * Automatically verifies whitelist. If unauthorized, signs out and throws error.
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const authorized = await isEmailAuthorized(user);
  if (!authorized) {
    await signOut(auth);
    throw new Error(
      `Acesso negado: o e-mail "${user.email}" não possui permissão administrativa no sistema. Entre em contato com o administrador.`
    );
  }

  return user;
}

/**
 * Signs out the current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribes to auth state changes with whitelist validation
 */
export function subscribeToAuth(
  onAuthorized: (user: User | null) => void,
  onUnauthorized: (email: string | null) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      onAuthorized(null);
      return;
    }

    const authorized = await isEmailAuthorized(user);
    if (authorized) {
      onAuthorized(user);
    } else {
      const email = user.email;
      await signOut(auth);
      onUnauthorized(email);
    }
  });
}
