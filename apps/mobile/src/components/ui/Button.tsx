/**
 * Gapp Mobile - Button Component
 * 
 * Botão base com variantes seguindo o design system.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'default' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'default',
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? colors.primary.DEFAULT : colors.primary.foreground}
        />
      ) : (
        <Text style={[styles.text, textVariantStyles[variant], textSizeStyles[size]]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  text: {
    fontWeight: typography.weights.medium,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  default: {
    backgroundColor: colors.primary.DEFAULT,
  },
  secondary: {
    backgroundColor: colors.light.muted,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.destructive.DEFAULT,
  },
};

const textVariantStyles: Record<ButtonVariant, TextStyle> = {
  default: {
    color: colors.primary.foreground,
  },
  secondary: {
    color: colors.light.foreground,
  },
  outline: {
    color: colors.light.foreground,
  },
  ghost: {
    color: colors.light.foreground,
  },
  destructive: {
    color: colors.destructive.foreground,
  },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    height: 36,
    paddingHorizontal: spacing[3],
  },
  default: {
    height: 40,
    paddingHorizontal: spacing[4],
  },
  lg: {
    height: 44,
    paddingHorizontal: spacing[8],
  },
};

const textSizeStyles: Record<ButtonSize, TextStyle> = {
  sm: {
    fontSize: typography.sizes.sm,
  },
  default: {
    fontSize: typography.sizes.sm,
  },
  lg: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
};

