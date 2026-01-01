/**
 * Gapp Mobile - TextArea Component
 * 
 * Campo de texto multilinha seguindo o design system.
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

export interface TextAreaProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rows?: number;
}

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  ({ label, error, containerStyle, rows = 4, style, ...props }, ref) => {
    const minHeight = rows * 24 + spacing[3] * 2; // linha + padding

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { minHeight },
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.light.mutedForeground}
          multiline
          textAlignVertical="top"
          {...props}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
);

TextArea.displayName = 'TextArea';

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
    width: '100%',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.light.input,
    backgroundColor: colors.light.background,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
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

