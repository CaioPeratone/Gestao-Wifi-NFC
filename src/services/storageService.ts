import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase/config';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const UPLOAD_TIMEOUT_MS = 15000; // 15 segundos

/**
 * Valida tipo e tamanho da imagem
 */
export function validateImageFile(
  file: File
): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato inválido. Envie PNG, JPG, JPEG ou WEBP.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'A imagem deve possuir no máximo 5 MB.',
    };
  }

  return { valid: true };
}

/**
 * Comprime a imagem antes do upload
 */
export async function compressImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    const timeout = window.setTimeout(() => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Tempo limite ao processar a imagem.'));
    }, 8000);

    img.onload = () => {
      window.clearTimeout(timeout);

      try {
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (!width || !height) {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Não foi possível identificar o tamanho da imagem.'));
          return;
        }

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);

          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(imageUrl);
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(imageUrl);

            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      } catch (error) {
        URL.revokeObjectURL(imageUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timeout);
      URL.revokeObjectURL(imageUrl);

      reject(new Error('Não foi possível processar a imagem selecionada.'));
    };

    img.src = imageUrl;
  });
}

/**
 * Faz upload da logo para o Firebase Storage
 */
export async function uploadLogo(
  clientId: string,
  file: File
): Promise<string> {
  const validation = validateImageFile(file);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Primeiro comprime
  const compressedBlob = await compressImage(file);

  const timestamp = Date.now();

  const storagePath =
    `logos/${clientId}/${timestamp}_logo.webp`;

  const storageRef = ref(storage, storagePath);

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(
      storageRef,
      compressedBlob,
      {
        contentType: 'image/webp',
        cacheControl: 'public,max-age=31536000',
      }
    );

    const timeout = window.setTimeout(() => {
      uploadTask.cancel();

      reject(
        new Error(
          'O upload da imagem demorou demais. Verifique a configuração do Firebase Storage.'
        )
      );
    }, UPLOAD_TIMEOUT_MS);

    uploadTask.on(
      'state_changed',

      // progresso
      () => {},

      // erro
      (error) => {
        window.clearTimeout(timeout);

        console.error('Erro no upload da logo:', error);

        reject(
          new Error(
            `Não foi possível enviar a logo para o Firebase Storage. ${error.message}`
          )
        );
      },

      // concluído
      async () => {
        window.clearTimeout(timeout);

        try {
          const downloadUrl = await getDownloadURL(
            uploadTask.snapshot.ref
          );

          resolve(downloadUrl);
        } catch (error) {
          console.error(
            'Erro ao obter URL da logo:',
            error
          );

          reject(
            new Error(
              'A imagem foi enviada, mas não foi possível obter a URL.'
            )
          );
        }
      }
    );
  });
}

/**
 * Remove logo do Firebase Storage
 */
export async function deleteLogo(
  logoUrl?: string
): Promise<void> {
  if (
    !logoUrl ||
    !logoUrl.includes('firebasestorage.googleapis.com')
  ) {
    return;
  }

  try {
    const fileRef = ref(storage, logoUrl);

    await deleteObject(fileRef);
  } catch (error) {
    console.warn(
      'Erro ao remover logo:',
      error
    );
  }
}
