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
import {
  handleFirestoreError,
  OperationType,
} from '../firebase/errors';

import {
  Client,
  ClientFormData,
  PublicWifiData,
} from '../types';

import { generatePublicId } from '../utils/idGenerator';

const CLIENTS_COLLECTION = 'clients';
const PUBLIC_PAGES_COLLECTION = 'publicWifiPages';

/**
 * Gera um ID público aleatório para cada cliente.
 */
export function generateUniquePublicId(): string {
  return generatePublicId(9);
}

/**
 * Evita que uma operação do Firestore fique carregando eternamente.
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 8000,
  errorMsg =
    'Tempo limite excedido ao salvar no Firestore. Verifique sua conexão e a configuração do Firebase.'
): Promise<T> {
  return Promise.race([
    promise,

    new Promise<T>((_, reject) =>
      setTimeout(() => {
        reject(new Error(errorMsg));
      }, timeoutMs)
    ),
  ]);
}

/**
 * Cria um novo cliente.
 *
 * Também cria a página pública correspondente.
 *
 * NÃO existe mais logo personalizada.
 * Todos os clientes usam a imagem padrão:
 *
 * public/default-wifi.png
 */
export async function createClient(
  data: ClientFormData
): Promise<{
  id: string;
  publicId: string;
}> {
  const publicId = generateUniquePublicId();

  const clientRef = doc(
    collection(db, CLIENTS_COLLECTION)
  );

  const publicRef = doc(
    db,
    PUBLIC_PAGES_COLLECTION,
    publicId
  );

  const cleanData: Record<string, any> = {
    publicId,

    businessName:
      data.businessName.trim(),

    ssid:
      data.ssid.trim(),

    backgroundColor:
      data.backgroundColor || '#0f172a',

    active:
      Boolean(data.active),

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  /**
   * Senha
   */
  if (
    data.wifiPassword !== undefined &&
    data.wifiPassword.trim() !== ''
  ) {
    cleanData.wifiPassword =
      data.wifiPassword.trim();
  }

  /**
   * Título personalizado
   */
  if (
    data.customTitle !== undefined &&
    data.customTitle.trim() !== ''
  ) {
    cleanData.customTitle =
      data.customTitle.trim();
  }

  /**
   * Instruções
   */
  if (
    data.instructions !== undefined &&
    data.instructions.trim() !== ''
  ) {
    cleanData.instructions =
      data.instructions.trim();
  }

  /**
   * Dados disponíveis na página pública.
   */
  const publicData: Record<string, any> = {
    publicId,

    businessName:
      cleanData.businessName,

    ssid:
      cleanData.ssid,

    backgroundColor:
      cleanData.backgroundColor,

    active:
      cleanData.active,

    updatedAt:
      serverTimestamp(),
  };

  if (cleanData.wifiPassword) {
    publicData.wifiPassword =
      cleanData.wifiPassword;
  }

  if (cleanData.customTitle) {
    publicData.customTitle =
      cleanData.customTitle;
  }

  if (cleanData.instructions) {
    publicData.instructions =
      cleanData.instructions;
  }

  try {
    const batch = writeBatch(db);

    batch.set(
      clientRef,
      cleanData
    );

    batch.set(
      publicRef,
      publicData
    );

    await withTimeout(
      batch.commit()
    );

    return {
      id: clientRef.id,
      publicId,
    };
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.CREATE,
      CLIENTS_COLLECTION
    );

    throw error;
  }
}

/**
 * Atualiza um cliente existente.
 *
 * O publicId NÃO muda.
 */
export async function updateClient(
  clientId: string,
  publicId: string,
  data: ClientFormData
): Promise<void> {
  const clientRef = doc(
    db,
    CLIENTS_COLLECTION,
    clientId
  );

  const publicRef = doc(
    db,
    PUBLIC_PAGES_COLLECTION,
    publicId
  );

  const cleanData: Record<string, any> = {
    businessName:
      data.businessName.trim(),

    ssid:
      data.ssid.trim(),

    backgroundColor:
      data.backgroundColor || '#0f172a',

    active:
      Boolean(data.active),

    updatedAt:
      serverTimestamp(),
  };

  /**
   * Aqui salvamos a senha mesmo se estiver vazia.
   *
   * Isso é importante para permitir trocar
   * uma rede protegida por uma rede aberta.
   */
  if (data.wifiPassword !== undefined) {
    cleanData.wifiPassword =
      data.wifiPassword.trim();
  }

  if (data.customTitle !== undefined) {
    cleanData.customTitle =
      data.customTitle.trim();
  }

  if (data.instructions !== undefined) {
    cleanData.instructions =
      data.instructions.trim();
  }

  const publicData: Record<string, any> = {
    publicId,

    businessName:
      cleanData.businessName,

    ssid:
      cleanData.ssid,

    backgroundColor:
      cleanData.backgroundColor,

    active:
      cleanData.active,

    wifiPassword:
      cleanData.wifiPassword || '',

    customTitle:
      cleanData.customTitle || '',

    instructions:
      cleanData.instructions || '',

    updatedAt:
      serverTimestamp(),
  };

  try {
    const batch = writeBatch(db);

    batch.update(
      clientRef,
      cleanData
    );

    batch.set(
      publicRef,
      publicData,
      {
        merge: true,
      }
    );

    await withTimeout(
      batch.commit()
    );
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `${CLIENTS_COLLECTION}/${clientId}`
    );

    throw error;
  }
}

/**
 * Ativa ou desativa a página pública do cliente.
 */
export async function toggleClientStatus(
  clientId: string,
  publicId: string,
  currentStatus: boolean
): Promise<boolean> {
  const newStatus =
    !currentStatus;

  const clientRef = doc(
    db,
    CLIENTS_COLLECTION,
    clientId
  );

  const publicRef = doc(
    db,
    PUBLIC_PAGES_COLLECTION,
    publicId
  );

  try {
    const batch = writeBatch(db);

    batch.update(
      clientRef,
      {
        active:
          newStatus,

        updatedAt:
          serverTimestamp(),
      }
    );

    batch.update(
      publicRef,
      {
        active:
          newStatus,

        updatedAt:
          serverTimestamp(),
      }
    );

    await withTimeout(
      batch.commit()
    );

    return newStatus;
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.UPDATE,
      `${CLIENTS_COLLECTION}/${clientId}`
    );

    throw error;
  }
}

/**
 * Exclui um cliente e sua página pública.
 *
 * Não existe mais tentativa de excluir logo
 * do Firebase Storage.
 */
export async function deleteClient(
  clientId: string,
  publicId: string
): Promise<void> {
  const clientRef = doc(
    db,
    CLIENTS_COLLECTION,
    clientId
  );

  const publicRef = doc(
    db,
    PUBLIC_PAGES_COLLECTION,
    publicId
  );

  try {
    const batch = writeBatch(db);

    batch.delete(
      clientRef
    );

    batch.delete(
      publicRef
    );

    await withTimeout(
      batch.commit()
    );
  } catch (error) {
    handleFirestoreError(
      error,
      OperationType.DELETE,
      `${CLIENTS_COLLECTION}/${clientId}`
    );

    throw error;
  }
}

/**
 * Atualiza automaticamente a lista de clientes
 * no painel administrativo.
 */
export function subscribeClients(
  onData: (clients: Client[]) => void,
  onError: (error: Error) => void
): () => void {
  const clientsQuery = query(
    collection(
      db,
      CLIENTS_COLLECTION
    ),

    orderBy(
      'createdAt',
      'desc'
    )
  );

  return onSnapshot(
    clientsQuery,

    (snapshot) => {
      const items: Client[] =
        snapshot.docs.map((d) => {
          const data = d.data();

          return {
            id:
              d.id,

            publicId:
              data.publicId,

            businessName:
              data.businessName,

            ssid:
              data.ssid,

            wifiPassword:
              data.wifiPassword || '',

            backgroundColor:
              data.backgroundColor ||
              '#0f172a',

            active:
              data.active ?? true,

            customTitle:
              data.customTitle || '',

            instructions:
              data.instructions || '',

            createdAt:
              data.createdAt,

            updatedAt:
              data.updatedAt,
          };
        });

      onData(items);
    },

    (err) => {
      handleFirestoreError(
        err,
        OperationType.LIST,
        CLIENTS_COLLECTION
      );

      onError(err);
    }
  );
}

/**
 * Busca os dados públicos do Wi-Fi.
 *
 * Essa função NÃO exige login.
 *
 * Ela procura diretamente o documento:
 *
 * publicWifiPages/{publicId}
 */
export async function getPublicWifiData(
  publicId: string
): Promise<PublicWifiData | null> {
  if (!publicId) {
    return null;
  }

  try {
    const publicRef = doc(
      db,
      PUBLIC_PAGES_COLLECTION,
      publicId
    );

    const snapshot =
      await getDoc(publicRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as PublicWifiData;
  } catch (error) {
    console.warn(
      `Página pública não encontrada ou inacessível para ID ${publicId}:`,
      error
    );

    return null;
  }
}
