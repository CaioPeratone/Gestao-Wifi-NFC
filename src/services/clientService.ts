import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Client, ClientFormData, PublicWifiData, PublicPixData } from '../types';
import { generatePublicId } from '../utils/idGenerator';

const CLIENTS_COLLECTION = 'clients';
const PUBLIC_WIFI_COLLECTION = 'publicWifiPages';
const PUBLIC_PIX_COLLECTION = 'publicPixPages';

/**
 * Generates an unguessable unique publicId (~54 trillion combinations) for Wi-Fi
 */
export function generateUniquePublicId(): string {
  return generatePublicId(9);
}

/**
 * Generates an unguessable unique publicId (~218 billion combinations) for PIX
 */
export function generatePixPublicId(): string {
  return generatePublicId(8);
}

/**
 * Creates a new client with modules (Wi-Fi and optional PIX)
 */
export async function createClient(
  data: ClientFormData
): Promise<{ id: string; publicId: string; pixPublicId?: string }> {
  const publicId = generateUniquePublicId();
  const clientRef = doc(collection(db, CLIENTS_COLLECTION));
  const publicWifiRef = doc(db, PUBLIC_WIFI_COLLECTION, publicId);

  // 1. Prepare clean client document
  const cleanData: Record<string, any> = {
    publicId,
    businessName: data.businessName.trim(),
    ssid: data.ssid.trim(),
    backgroundColor: data.backgroundColor || '#0f172a',
    active: Boolean(data.active),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (data.wifiPassword !== undefined && data.wifiPassword.trim() !== '') {
    cleanData.wifiPassword = data.wifiPassword.trim();
  }
  if (data.customTitle !== undefined && data.customTitle.trim() !== '') {
    cleanData.customTitle = data.customTitle.trim();
  }
  if (data.instructions !== undefined && data.instructions.trim() !== '') {
    cleanData.instructions = data.instructions.trim();
  }

  // 2. Prepare Public Wi-Fi Page document
  const publicWifiData: Record<string, any> = {
    publicId,
    businessName: cleanData.businessName,
    ssid: cleanData.ssid,
    backgroundColor: cleanData.backgroundColor,
    active: cleanData.active,
    updatedAt: serverTimestamp(),
  };

  if (cleanData.wifiPassword) publicWifiData.wifiPassword = cleanData.wifiPassword;
  if (cleanData.customTitle) publicWifiData.customTitle = cleanData.customTitle;
  if (cleanData.instructions) publicWifiData.instructions = cleanData.instructions;

  // 3. Prepare PIX module if enabled
  let finalPixPublicId: string | undefined = undefined;
  let publicPixPromise: Promise<void> | null = null;

  if (data.pixEnabled) {
    finalPixPublicId = data.pixPublicId || generatePixPublicId();
    cleanData.pixEnabled = true;
    cleanData.pixPublicId = finalPixPublicId;
    cleanData.pixKey = data.pixKey?.trim() || '';
    cleanData.pixKeyType = data.pixKeyType || 'ALEATORIA';
    cleanData.pixReceiverName = data.pixReceiverName?.trim() || cleanData.businessName;
    cleanData.pixCity = data.pixCity?.trim() || 'SAO PAULO';
    cleanData.pixAmount = data.pixAmount?.trim() || '';
    cleanData.pixDescription = data.pixDescription?.trim() || '';
    cleanData.pixBackgroundColor = data.pixBackgroundColor || '#00BFA5';

    const publicPixRef = doc(db, PUBLIC_PIX_COLLECTION, finalPixPublicId);
    const publicPixData: Record<string, any> = {
      pixPublicId: finalPixPublicId,
      businessName: cleanData.businessName,
      pixKey: cleanData.pixKey,
      pixKeyType: cleanData.pixKeyType,
      pixReceiverName: cleanData.pixReceiverName,
      pixCity: cleanData.pixCity,
      pixAmount: cleanData.pixAmount,
      pixDescription: cleanData.pixDescription,
      pixBackgroundColor: cleanData.pixBackgroundColor,
      active: true,
      updatedAt: serverTimestamp(),
    };
    publicPixPromise = setDoc(publicPixRef, publicPixData);
  } else {
    cleanData.pixEnabled = false;
  }

  try {
    const writes: Promise<void>[] = [
      setDoc(clientRef, cleanData),
      setDoc(publicWifiRef, publicWifiData),
    ];
    if (publicPixPromise) {
      writes.push(publicPixPromise);
    }

    // Fast-path: wait up to 800ms for network ack.
    await Promise.race([
      Promise.all(writes),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);

    return { id: clientRef.id, publicId, pixPublicId: finalPixPublicId };
  } catch (error) {
    console.error('[createClient] Error creating client:', error);
    return { id: clientRef.id, publicId, pixPublicId: finalPixPublicId };
  }
}

/**
 * Updates an existing client while strictly preserving immutable publicId and pixPublicId
 */
export async function updateClient(
  clientId: string,
  publicId: string,
  data: ClientFormData
): Promise<void> {
  const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
  const publicWifiRef = doc(db, PUBLIC_WIFI_COLLECTION, publicId);

  // 1. Prepare updated client record
  const cleanData: Record<string, any> = {
    businessName: data.businessName.trim(),
    ssid: data.ssid.trim(),
    backgroundColor: data.backgroundColor || '#0f172a',
    active: Boolean(data.active),
    updatedAt: serverTimestamp(),
  };

  if (data.wifiPassword !== undefined) {
    cleanData.wifiPassword = data.wifiPassword.trim();
  }
  if (data.customTitle !== undefined) {
    cleanData.customTitle = data.customTitle.trim();
  }
  if (data.instructions !== undefined) {
    cleanData.instructions = data.instructions.trim();
  }

  // 2. Prepare Public Wi-Fi update
  const publicWifiData: Record<string, any> = {
    publicId,
    businessName: cleanData.businessName,
    ssid: cleanData.ssid,
    backgroundColor: cleanData.backgroundColor,
    active: cleanData.active,
    updatedAt: serverTimestamp(),
  };

  if (cleanData.wifiPassword) publicWifiData.wifiPassword = cleanData.wifiPassword;
  if (cleanData.customTitle) publicWifiData.customTitle = cleanData.customTitle;
  if (cleanData.instructions) publicWifiData.instructions = cleanData.instructions;

  // 3. Prepare PIX update
  let pixPromise: Promise<void> | null = null;
  const isPixEnabled = Boolean(data.pixEnabled);
  cleanData.pixEnabled = isPixEnabled;

  // If client is enabling PIX and doesn't have a pixPublicId yet, generate one
  let effectivePixPublicId = data.pixPublicId;
  if (isPixEnabled && !effectivePixPublicId) {
    effectivePixPublicId = generatePixPublicId();
  }

  if (effectivePixPublicId) {
    cleanData.pixPublicId = effectivePixPublicId;
    cleanData.pixKey = data.pixKey?.trim() || '';
    cleanData.pixKeyType = data.pixKeyType || 'ALEATORIA';
    cleanData.pixReceiverName = data.pixReceiverName?.trim() || cleanData.businessName;
    cleanData.pixCity = data.pixCity?.trim() || 'SAO PAULO';
    cleanData.pixAmount = data.pixAmount?.trim() || '';
    cleanData.pixDescription = data.pixDescription?.trim() || '';
    cleanData.pixBackgroundColor = data.pixBackgroundColor || '#00BFA5';

    const publicPixRef = doc(db, PUBLIC_PIX_COLLECTION, effectivePixPublicId);
    const publicPixData: Record<string, any> = {
      pixPublicId: effectivePixPublicId,
      businessName: cleanData.businessName,
      pixKey: cleanData.pixKey,
      pixKeyType: cleanData.pixKeyType,
      pixReceiverName: cleanData.pixReceiverName,
      pixCity: cleanData.pixCity,
      pixAmount: cleanData.pixAmount,
      pixDescription: cleanData.pixDescription,
      pixBackgroundColor: cleanData.pixBackgroundColor,
      active: isPixEnabled,
      updatedAt: serverTimestamp(),
    };
    pixPromise = setDoc(publicPixRef, publicPixData, { merge: true });
  }

  try {
    const writes: Promise<void>[] = [
      updateDoc(clientRef, cleanData),
      setDoc(publicWifiRef, publicWifiData, { merge: true }),
    ];
    if (pixPromise) {
      writes.push(pixPromise);
    }

    await Promise.race([
      Promise.all(writes),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch (error) {
    console.error('[updateClient] Error:', error);
  }
}

/**
 * Toggles a client's Wi-Fi active status (does NOT touch PIX)
 */
export async function toggleClientStatus(
  clientId: string,
  publicId: string,
  currentStatus: boolean
): Promise<boolean> {
  const newStatus = !currentStatus;
  const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
  const publicWifiRef = doc(db, PUBLIC_WIFI_COLLECTION, publicId);

  try {
    const togglePromise = Promise.all([
      updateDoc(clientRef, {
        active: newStatus,
        updatedAt: serverTimestamp(),
      }),
      updateDoc(publicWifiRef, {
        active: newStatus,
        updatedAt: serverTimestamp(),
      }),
    ]);

    await Promise.race([
      togglePromise,
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);

    return newStatus;
  } catch (error) {
    console.error('[toggleClientStatus] Error:', error);
    return newStatus;
  }
}

/**
 * Toggles a client's PIX active status (does NOT touch Wi-Fi)
 */
export async function togglePixModule(
  clientId: string,
  pixPublicId: string,
  currentStatus: boolean
): Promise<boolean> {
  const newStatus = !currentStatus;
  const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
  const publicPixRef = doc(db, PUBLIC_PIX_COLLECTION, pixPublicId);

  try {
    const togglePromise = Promise.all([
      updateDoc(clientRef, {
        pixEnabled: newStatus,
        updatedAt: serverTimestamp(),
      }),
      updateDoc(publicPixRef, {
        active: newStatus,
        updatedAt: serverTimestamp(),
      }),
    ]);

    await Promise.race([
      togglePromise,
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);

    return newStatus;
  } catch (error) {
    console.error('[togglePixModule] Error:', error);
    return newStatus;
  }
}

/**
 * Deletes a client, its public Wi-Fi page, and its public PIX page (if existing)
 */
export async function deleteClient(
  clientId: string,
  publicId: string,
  pixPublicId?: string
): Promise<void> {
  const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
  const publicWifiRef = doc(db, PUBLIC_WIFI_COLLECTION, publicId);

  try {
    const deletes: Promise<void>[] = [
      deleteDoc(clientRef),
      deleteDoc(publicWifiRef),
    ];
    if (pixPublicId) {
      deletes.push(deleteDoc(doc(db, PUBLIC_PIX_COLLECTION, pixPublicId)));
    }

    await Promise.race([
      Promise.all(deletes),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch (error) {
    console.error('[deleteClient] Error:', error);
  }
}

/**
 * Subscribes to real-time client list updates for the admin dashboard
 */
export function subscribeClients(
  onData: (clients: Client[]) => void,
  onError: (error: Error) => void
): () => void {
  const clientsCol = collection(db, CLIENTS_COLLECTION);

  return onSnapshot(
    clientsCol,
    (snapshot) => {
      const items: Client[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          publicId: data.publicId,
          businessName: data.businessName,
          ssid: data.ssid,
          wifiPassword: data.wifiPassword || '',
          backgroundColor: data.backgroundColor || '#0f172a',
          active: data.active ?? true,
          customTitle: data.customTitle || '',
          instructions: data.instructions || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,

          // Módulo PIX (Opcional - Retrocompatível)
          pixEnabled: data.pixEnabled ?? false,
          pixPublicId: data.pixPublicId || '',
          pixKey: data.pixKey || '',
          pixKeyType: data.pixKeyType || 'ALEATORIA',
          pixReceiverName: data.pixReceiverName || '',
          pixCity: data.pixCity || '',
          pixAmount: data.pixAmount || '',
          pixDescription: data.pixDescription || '',
          pixBackgroundColor: data.pixBackgroundColor || '#00BFA5',
        };
      });

      // Sort in memory so missing or pending serverTimestamp never hides items
      items.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      onData(items);
    },
    (err) => {
      console.warn('[subscribeClients] Realtime error:', err);
      onError(err);
    }
  );
}

/**
 * Retrieves public Wi-Fi details by exact publicId (Single document get - No list query)
 */
export async function getPublicWifiData(
  publicId: string
): Promise<PublicWifiData | null> {
  if (!publicId) return null;

  try {
    const publicRef = doc(db, PUBLIC_WIFI_COLLECTION, publicId);
    const snap = await getDoc(publicRef);

    if (snap.exists()) {
      return snap.data() as PublicWifiData;
    }
    return null;
  } catch (error) {
    console.warn(`Página pública Wi-Fi não encontrada para ID ${publicId}:`, error);
    return null;
  }
}

/**
 * Retrieves public PIX details by exact pixPublicId (Single document get - No list query)
 */
export async function getPublicPixData(
  pixPublicId: string
): Promise<PublicPixData | null> {
  if (!pixPublicId) return null;

  try {
    const publicRef = doc(db, PUBLIC_PIX_COLLECTION, pixPublicId);
    const snap = await getDoc(publicRef);

    if (snap.exists()) {
      return snap.data() as PublicPixData;
    }
    return null;
  } catch (error) {
    console.warn(`Página pública PIX não encontrada para ID ${pixPublicId}:`, error);
    return null;
  }
}
