/**
 * Gapp Mobile - Theme System
 * 
 * Exporta todos os tokens de design e utilitários de tema.
 */

import { useColorScheme } from 'react-native';
import { colors } from './colors';
import { typography, textPresets } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export { colors, typography, textPresets, spacing, borderRadius, shadows };

// === Theme Object ===
export const theme = {
  colors,
  typography,
  textPresets,
  spacing,
  borderRadius,
  shadows,
} as const;

// === Color Scheme Types ===
export type ColorScheme = 'light' | 'dark';

// === Theme Colors Helper ===
export function getThemeColors(scheme: ColorScheme = 'light') {
  const surface = scheme === 'dark' ? colors.dark : colors.light;
  
  return {
    ...surface,
    primary: colors.primary.DEFAULT,
    primaryForeground: colors.primary.foreground,
    success: colors.success.DEFAULT,
    successForeground: colors.success.foreground,
    warning: colors.warning.DEFAULT,
    warningForeground: colors.warning.foreground,
    info: colors.info.DEFAULT,
    infoForeground: colors.info.foreground,
    destructive: colors.destructive.DEFAULT,
    destructiveForeground: colors.destructive.foreground,
  };
}

// === useThemeColors Hook ===
export function useThemeColors() {
  const colorScheme = useColorScheme();
  return getThemeColors(colorScheme === 'dark' ? 'dark' : 'light');
}

export type Theme = typeof theme;
export type ThemeColors = ReturnType<typeof getThemeColors>;

