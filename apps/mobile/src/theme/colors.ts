/**
 * Gapp Mobile - Color Tokens
 * 
 * Baseado no design-system.md do projeto web.
 * Cor primária: Vermelho vibrante Garageinn (hsl(0, 95%, 60%) → #FF3D3D)
 */

export const colors = {
  // === Cores Principais ===
  primary: {
    DEFAULT: '#FF3D3D',      // hsl(0, 95%, 60%) - Vermelho Garageinn
    foreground: '#FFFFFF',
    50: '#FFF5F5',
    100: '#FFE5E5',
    200: '#FFCCCC',
    300: '#FFA3A3',
    400: '#FF7070',
    500: '#FF3D3D',          // Base
    600: '#E62E2E',
    700: '#CC2020',
    800: '#A31919',
    900: '#7A1313',
  },

  // === Cores Semânticas ===
  success: {
    DEFAULT: '#22C55E',      // hsl(142, 76%, 36%)
    foreground: '#FFFFFF',
    light: '#86EFAC',
    dark: '#166534',
  },
  warning: {
    DEFAULT: '#F59E0B',      // hsl(38, 92%, 50%)
    foreground: '#FFFFFF',
    light: '#FCD34D',
    dark: '#B45309',
  },
  info: {
    DEFAULT: '#0EA5E9',      // hsl(199, 89%, 48%)
    foreground: '#FFFFFF',
    light: '#7DD3FC',
    dark: '#0369A1',
  },
  destructive: {
    DEFAULT: '#EF4444',      // hsl(0, 84%, 60%)
    foreground: '#FFFFFF',
    light: '#FCA5A5',
    dark: '#B91C1C',
  },

  // === Cores de Superfície - Light Mode ===
  light: {
    background: '#FAFAFA',       // hsl(0, 0%, 98%)
    foreground: '#1A1A1A',       // hsl(0, 0%, 10%)
    card: '#FFFFFF',             // hsl(0, 0%, 100%)
    cardForeground: '#1A1A1A',
    muted: '#F5F5F5',            // hsl(0, 0%, 96%)
    mutedForeground: '#737373',  // hsl(0, 0%, 45%)
    border: '#E5E5E5',           // hsl(0, 0%, 90%)
    input: '#E5E5E5',
    ring: '#FF3D3D',             // Primária
  },

  // === Cores de Superfície - Dark Mode ===
  dark: {
    background: '#141414',       // hsl(0, 0%, 8%)
    foreground: '#FAFAFA',       // hsl(0, 0%, 98%)
    card: '#1A1A1A',             // hsl(0, 0%, 10%)
    cardForeground: '#FAFAFA',
    muted: '#262626',            // hsl(0, 0%, 15%)
    mutedForeground: '#A6A6A6',  // hsl(0, 0%, 65%)
    border: '#333333',           // hsl(0, 0%, 20%)
    input: '#333333',
    ring: '#FF3D3D',             // Primária
  },

  // === Cores Neutras ===
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
} as const;

export type ColorToken = typeof colors;

