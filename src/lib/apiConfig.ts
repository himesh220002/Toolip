/**
 * Centralized API & Socket URL configuration helper.
 * Prevents mobile devices from failing with "Failed to fetch" due to hardcoded localhost URLs
 * or mixed-content (HTTP vs HTTPS) restrictions when deployed on Vercel / Render.
 */

export const DEFAULT_RENDER_BACKEND = 'https://toolip-r2ve.onrender.com';

export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    const isLocalHost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.');

    if (envUrl && envUrl.trim() !== '') {
      let cleanedUrl = envUrl.trim().replace(/\/+$/, '');

      // Auto-upgrade http:// to https:// if front-end is served over HTTPS to avoid Mixed Content block
      if (
        window.location.protocol === 'https:' &&
        cleanedUrl.startsWith('http://') &&
        !cleanedUrl.includes('localhost') &&
        !cleanedUrl.includes('127.0.0.1')
      ) {
        cleanedUrl = cleanedUrl.replace(/^http:\/\//, 'https://');
      }

      // If user is accessing from mobile/remote device, but envUrl points to localhost, fall back to Render backend
      if (!isLocalHost && (cleanedUrl.includes('localhost') || cleanedUrl.includes('127.0.0.1'))) {
        return DEFAULT_RENDER_BACKEND;
      }

      return cleanedUrl;
    }

    // Fallback when NEXT_PUBLIC_API_URL is not explicitly set
    if (isLocalHost) {
      return 'http://localhost:5000';
    }

    // In production web client (e.g. Vercel deployment), fallback to Render backend server
    return DEFAULT_RENDER_BACKEND;
  }

  // SSR or Node environment
  return envUrl && envUrl.trim() !== '' ? envUrl.trim().replace(/\/+$/, '') : DEFAULT_RENDER_BACKEND;
}

export function getSocketUrl(): string {
  const envSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (envSocketUrl && envSocketUrl.trim() !== '') {
    let cleaned = envSocketUrl.trim().replace(/\/+$/, '');
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      cleaned.startsWith('http://') &&
      !cleaned.includes('localhost') &&
      !cleaned.includes('127.0.0.1')
    ) {
      cleaned = cleaned.replace(/^http:\/\//, 'https://');
    }
    return cleaned;
  }

  return getApiBaseUrl();
}
