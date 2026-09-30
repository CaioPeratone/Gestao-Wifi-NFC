/**
 * Parses a hex color (e.g. #000, #FFFFFF, #111111) to RGB components.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleanHex.length !== 6) {
    return { r: 15, g: 23, b: 42 }; // fallback default slate-900
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;

  return { r, g, b };
}

/**
 * Calculates relative luminance according to WCAG 2.1 specifications.
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const [sR, sG, sB] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/**
 * Returns true if the background is dark (luminance < 0.35)
 */
export function isDarkColor(hex: string): boolean {
  return getLuminance(hex) < 0.38;
}

/**
 * Provides comprehensive contrast theme properties for the public Wi-Fi card.
 */
export function getContrastTheme(hexColor: string) {
  const isDark = isDarkColor(hexColor);

  return {
    isDark,
    // Text colors
    textPrimary: isDark ? '#ffffff' : '#0f172a',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.72)' : '#475569',
    textMuted: isDark ? 'rgba(255, 255, 255, 0.45)' : '#94a3b8',
    
    // Card container styles
    cardBg: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.85)',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    cardShadow: isDark
      ? '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
      : '0 20px 40px -15px rgba(15, 23, 42, 0.12)',

    // Input/badge containers
    fieldBg: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
    fieldBorder: isDark ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0',

    // Primary CTA Button
    buttonBg: isDark ? '#ffffff' : '#0f172a',
    buttonText: isDark ? '#0f172a' : '#ffffff',
    buttonHover: isDark ? '#f1f5f9' : '#1e293b',
    buttonRing: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.4)',

    // Secondary Action Button
    secondaryButtonBg: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
    secondaryButtonText: isDark ? '#ffffff' : '#0f172a',
    secondaryButtonHover: isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1',
  };
}
