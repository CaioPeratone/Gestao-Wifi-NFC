import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase/config';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates file type and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato inválido. Envie uma imagem PNG, JPG, JPEG, WEBP ou SVG.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'O arquivo excede o limite máximo permitido de 5 MB.',
    };
  }

  return { valid: true };
}

/**
 * Compresses an image client-side before upload to optimize mobile loading speed
 */
export async function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.85): Promise<Blob> {
  // SVG does not need raster compression
  if (file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Erro ao processar imagem para compressão'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads client logo to Firebase Storage.
 * Falls back to high-quality compressed Base64 Data URL if storage encounters CORS or bucket errors.
 */
export async function uploadLogo(
  clientId: string,
  file: File
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  try {
    const compressedBlob = await compressImage(file);
    const extension = file.type === 'image/svg+xml' ? 'svg' : 'webp';
    const timestamp = Date.now();
    const storagePath = `logos/${clientId}/${timestamp}_logo.${extension}`;
    const storageRef = ref(storage, storagePath);

    const uploadPromise = (async () => {
      const snapshot = await uploadBytes(storageRef, compressedBlob, {
        contentType: file.type === 'image/svg+xml' ? 'image/svg+xml' : 'image/webp',
      });
      return await getDownloadURL(snapshot.ref);
    })();

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Storage timeout')), 2500)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (storageError) {
    console.warn(
      'Upload no Firebase Storage falhou. Ativando fallback seguro em Base64 Data URL:',
      storageError
    );

    // Fallback to Data URL so user is never blocked
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Falha ao converter imagem'));
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Deletes a logo from Firebase Storage if it's a storage URL
 */
export async function deleteLogo(logoUrl?: string): Promise<void> {
  if (!logoUrl || !logoUrl.includes('firebasestorage.googleapis.com')) {
    return;
  }

  try {
    const fileRef = ref(storage, logoUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn('Erro ao remover arquivo do Firebase Storage:', error);
  }
}
