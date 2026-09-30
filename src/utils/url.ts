/**
 * URL utility designed for GitHub Pages + Firebase architecture.
 *
 * Public Wi-Fi link format:
 * https://USUARIO.github.io/REPOSITORIO/?wifi=PUBLIC_ID
 *
 * Example:
 * https://usuario.github.io/linknfc/?wifi=PWyRj6rpV
 */

/**
 * Returns the configured base URL for public Wi-Fi links.
 * Priority order:
 * 1. User custom domain saved in localStorage (from panel settings)
 * 2. VITE_PUBLIC_BASE_URL environment variable (e.g. 'https://USUARIO.github.io/REPOSITORIO/')
 * 3. Current browser origin + pathname (without query or hash)
 */
export function getPublicBaseUrl(): string {
  // 1. Check if user configured a custom base URL in the admin UI
  try {
    const savedDomain = localStorage.getItem('nfc_custom_base_url');
    if (savedDomain && savedDomain.trim()) {
      return normalizeBaseUrl(savedDomain.trim());
    }
  } catch {
    // ignore
  }

  // 2. Check Vite environment variable
  const envUrl = import.meta.env.VITE_PUBLIC_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return normalizeBaseUrl(envUrl.trim());
  }

  // 3. Fallback to current browser location (clean path without queries or hash)
  if (typeof window !== 'undefined') {
    const cleanPath = window.location.pathname.replace(/\/+$/, '');
    return `${window.location.origin}${cleanPath}/`;
  }

  return 'https://usuario.github.io/linknfc/';
}

/**
 * Normalizes a base URL ensuring it ends cleanly for query appending
 */
function normalizeBaseUrl(url: string): string {
  const noQuery = url.split('?')[0].split('#')[0];
  // Ensure trailing slash if it looks like a directory / repository
  return noQuery.endsWith('/') ? noQuery : `${noQuery}/`;
}

/**
 * Sets a custom production domain in localStorage
 */
export function setCustomBaseUrl(url: string): void {
  try {
    const clean = url.trim();
    if (clean) {
      localStorage.setItem('nfc_custom_base_url', clean);
    } else {
      localStorage.removeItem('nfc_custom_base_url');
    }
  } catch (e) {
    console.error('Erro ao salvar domínio customizado:', e);
  }
}

/**
 * Centralized function to generate the definitive public Wi-Fi URL for GitHub Pages.
 *
 * Format:
 * `${PUBLIC_BASE_URL}?wifi=${publicId}`
 *
 * Example:
 * https://usuario.github.io/linknfc/?wifi=PWyRj6rpV
 */
export function getPublicWifiUrl(publicId: string): string {
  if (!publicId) return '';
  const baseUrl = getPublicBaseUrl();
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/?wifi=${encodeURIComponent(publicId)}`;
}

/**
 * Returns the local query path for testing
 */
export function getLocalWifiPath(publicId: string): string {
  if (!publicId) return '';
  return `/?wifi=${encodeURIComponent(publicId)}`;
}

/**
 * Returns the admin panel URL for GitHub Pages (HashRouter compatible)
 *
 * Format:
 * `${PUBLIC_BASE_URL}#/admin`
 */
export function getAdminPanelUrl(): string {
  const baseUrl = getPublicBaseUrl();
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/#/admin`;
}
