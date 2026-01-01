/**
 * Gapp Mobile - Typography Tokens
 * 
 * Baseado no design-system.md do projeto web.
 * Família: Inter (ou system font como fallback)
 */

import { Platform, TextStyle } from 'react-native';

// Sistema de fontes nativas
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  // === Font Families ===
  fonts: {
    regular: fontFamily,
    medium: fontFamily,
    semibold: fontFamily,
    bold: fontFamily,
  },

  // === Font Weights ===
  weights: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },

  // === Font Sizes (em px) ===
  sizes: {
    xs: 12,      // 0.75rem - Badges, captions
    sm: 14,      // 0.875rem - Labels, texto auxiliar
    base: 16,    // 1rem - Corpo de texto
    lg: 18,      // 1.125rem - Subtítulos
    xl: 20,      // 1.25rem - Títulos de seção
    '2xl': 24,   // 1.5rem - Títulos de página
    '3xl': 30,   // 1.875rem - Títulos grandes
    '4xl': 36,   // 2.25rem - Headlines
  },

  // === Line Heights ===
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // === Letter Spacing ===
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// === Text Presets (estilos prontos) ===
export const textPresets: Record<string, TextStyle> = {
  // Títulos
  h1: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.sizes['2xl'] * typography.lineHeights.tight,
  },
  h2: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    letterSpacing: typography.letterSpacing.tight,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  h3: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
  },

  // Corpo
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  bodySmall: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },

  // Labels e auxiliares
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  caption: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
  },

  // Botões
  button: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    letterSpacing: typography.letterSpacing.wide,
  },
  buttonLarge: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
};

export type TypographyToken = typeof typography;
export type TextPreset = keyof typeof textPresets;

