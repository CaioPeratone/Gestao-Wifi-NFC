/**
 * Generates an unguessable, cryptographically secure random publicId
 * e.g. "a8K92mP4x" (~13.5 trillion possible combinations)
 */
export function generatePublicId(length = 9): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Validates format of publicId
 */
export function isValidPublicIdFormat(id: string): boolean {
  return /^[a-zA-Z0-9_-]{6,64}$/.test(id);
}
