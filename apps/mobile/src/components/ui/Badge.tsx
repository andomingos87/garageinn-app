/**
 * Gapp Mobile - Badge Component
 * 
 * Badge/tag para status e categorias.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Badge({ variant = 'default', children, style }: BadgeProps) {
  return (
    <View style={[styles.base, variantStyles[variant], style]}>
      <Text style={[styles.text, textVariantStyles[variant]]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[0.5],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});

const variantStyles: Record<BadgeVariant, ViewStyle> = {
  default: {
    backgroundColor: colors.primary.DEFAULT,
  },
  secondary: {
    backgroundColor: colors.light.muted,
  },
  destructive: {
    backgroundColor: colors.destructive.DEFAULT,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  success: {
    backgroundColor: colors.success.DEFAULT,
  },
  warning: {
    backgroundColor: colors.warning.DEFAULT,
  },
  info: {
    backgroundColor: colors.info.DEFAULT,
  },
};

const textVariantStyles: Record<BadgeVariant, TextStyle> = {
  default: {
    color: colors.primary.foreground,
  },
  secondary: {
    color: colors.light.foreground,
  },
  destructive: {
    color: colors.destructive.foreground,
  },
  outline: {
    color: colors.light.foreground,
  },
  success: {
    color: colors.success.foreground,
  },
  warning: {
    color: colors.warning.foreground,
  },
  info: {
    color: colors.info.foreground,
  },
};

