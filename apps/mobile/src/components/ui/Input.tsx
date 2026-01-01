/**
 * Gapp Mobile - Input Component
 * 
 * Campo de entrada de texto seguindo o design system.
 */

import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerStyle, style, ...props }, ref) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.light.mutedForeground}
          {...props}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.light.foreground,
    marginBottom: spacing[1.5],
  },
  input: {
    height: 40,
    width: '100%',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.light.input,
    backgroundColor: colors.light.background,
    paddingHorizontal: spacing[3],
    fontSize: typography.sizes.base,
    color: colors.light.foreground,
  },
  inputError: {
    borderColor: colors.destructive.DEFAULT,
  },
  error: {
    fontSize: typography.sizes.sm,
    color: colors.destructive.DEFAULT,
    marginTop: spacing[1],
  },
});

