import {
  collection,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Client, ClientFormData, PublicWifiData } from '../types';
import { generatePublicId } from '../utils/idGenerator';
import { deleteLogo } from './storageService';

const CLIENTS_COLLECTION = 'clients';
const PUBLIC_PAGES_COLLECTION = 'publicWifiPages';

/**
 * Generates an unguessable unique publicId (~54 trillion combinations)
 */
export function generateUniquePublicId(): string {
  return generatePublicId(9);
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 10000,
  errorMsg = 'Tempo limite excedido ao salvar no Firestore. Verifique sua conexão.'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
    ),
  ]);
}

/**
 * Creates a new client and atomically publishes its public NFC Wi-Fi page
 */
export async function createClient(
  data: ClientFormData
): Promise<{ id: string; publicId: string }> {
  const publicId = generateUniquePublicId();
  const clientRef = doc(collection(db, CLIENTS_COLLECTION));
  const publicRef = doc(db, PUBLIC_PAGES_COLLECTION, publicId);

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
  if (data.logoUrl !== undefined && data.logoUrl.trim() !== '') {
    cleanData.logoUrl = data.logoUrl.trim();
  }
  if (data.customTitle !== undefined && data.customTitle.trim() !== '') {
    cleanData.customTitle = data.customTitle.trim();
  }
  if (data.instructions !== undefined && data.instructions.trim() !== '') {
    cleanData.instructions = data.instructions.trim();
  }

  const publicData: Record<string, any> = {
    publicId,
    businessName: cleanData.businessName,
    ssid: cleanData.ssid,
    backgroundColor: cleanData.backgroundColor,
    active: cleanData.active,
    updatedAt: serverTimestamp(),
  };

  if (cleanData.wifiPassword) publicData.wifiPassword = cleanData.wifiPassword;
  if (cleanData.logoUrl) publicData.logoUrl = cleanData.logoUrl;
  if (cleanData.customTitle) publicData.customTitle = cleanData.customTitle;
  if (cleanData.instructions) publicData.instructions = cleanData.instructions;

  try {
    const batch = writeBatch(db);
    batch.set(clientRef, cleanData);
    batch.set(publicRef, publicData);
    await withTimeout(batch.commit());

    return { id: clientRef.id, publicId };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CLIENTS_COLLECTION);
  }
}

/**
 * Updates an existing client while strictly preserving the immutable publicId and createdAt
 */
export async function updateClient(
  clientId: string,
  publicId: string,
  data: ClientFormData
): Promise<void> {
  const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
  const publicRef = doc(db, PUBLIC_PAGES_COLLECTION, publicId);

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
  if (data.logoUrl !== undefined) {
    cleanData.logoUrl = data.logoUrl.trim();
  }
  if (data.customTitle !== undefined) {
    cleanData.customTitle = data.customTitle.trim();
  }
  if (data.instructions !== undefined) {
    cleanData.instructions = data.instructions.trim();
  }

  const publicData: Record<string, any> = {
    publicId,
    businessName: cleanData.businessName,
    ssid: cleanData.ssid,
    backgroundColor: cleanData.backgroundColor,
    active: cleanData.active,
    updatedAt: serverTimestamp(),
  };

  if (cleanData.wifiPassword) publicData.wifiPassword = cleanData.wifiPassword;
  if (cleanData.logoUrl) publicData.logoUrl = cleanData.logoUrl;
  if (cleanData.customTitle) publicData.customTitle = cleanData.customTitle;
  if (cleanData.instructions) publicData.instructions = cleanData.instructions;

  try {
    const batch = writeBatch(db);
    batch.update(clientRef, cleanData);
    batch.set(publicRef, publicData, { merge: true });
    await withTimeout(batch.commit());
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CLIENTS_COLLECTION}/${clientId}`);
  }
}

/**
 * Toggles a client's active status
 */
export async function toggleClientStatus(
  clientId: string,
  publicId: string,
  currentStatus: boolean
): Promise<boolean> {
  const newStatus = !currentStatus;
  const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
  const publicRef = doc(db, PUBLIC_PAGES_COLLECTION, publicId);

  try {
    const batch = writeBatch(db);
    batch.update(clientRef, {
      active: newStatus,
      updatedAt: serverTimestamp(),
    });
    batch.update(publicRef, {
      active: newStatus,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return newStatus;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CLIENTS_COLLECTION}/${clientId}`);
  }
}

/**
 * Deletes a client, its public NFC page, and stored logo
 */
export async function deleteClient(
  clientId: string,
  publicId: string,
  logoUrl?: string
): Promise<void> {
  const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
  const publicRef = doc(db, PUBLIC_PAGES_COLLECTION, publicId);

  try {
    const batch = writeBatch(db);
    batch.delete(clientRef);
    batch.delete(publicRef);
    await batch.commit();

    // Async clean up of storage asset
    if (logoUrl) {
      deleteLogo(logoUrl).catch((err) =>
        console.warn('Erro ao remover logo após exclusão:', err)
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CLIENTS_COLLECTION}/${clientId}`);
  }
}

/**
 * Subscribes to real-time client list updates for the admin dashboard
 */
export function subscribeClients(
  onData: (clients: Client[]) => void,
  onError: (error: Error) => void
): () => void {
  const clientsQuery = query(
    collection(db, CLIENTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    clientsQuery,
    (snapshot) => {
      const items: Client[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          publicId: data.publicId,
          businessName: data.businessName,
          ssid: data.ssid,
          wifiPassword: data.wifiPassword || '',
          logoUrl: data.logoUrl || '',
          backgroundColor: data.backgroundColor || '#0f172a',
          active: data.active ?? true,
          customTitle: data.customTitle || '',
          instructions: data.instructions || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });
      onData(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, CLIENTS_COLLECTION);
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
    const publicRef = doc(db, PUBLIC_PAGES_COLLECTION, publicId);
    const snap = await getDoc(publicRef);

    if (snap.exists()) {
      return snap.data() as PublicWifiData;
    }
    return null;
  } catch (error) {
    console.warn(`Página pública não encontrada ou inacessível para ID ${publicId}:`, error);
    return null;
  }
}
