/**
 * Gapp Mobile - Loading Component
 * 
 * Indicadores de carregamento.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export type LoadingSize = 'small' | 'large';

export interface LoadingProps {
  size?: LoadingSize;
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export function Loading({
  size = 'large',
  message,
  fullScreen = false,
  style,
}: LoadingProps) {
  const content = (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={size}
        color={colors.primary.DEFAULT}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return content;
}

// === Skeleton Loader ===
export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.background,
  },
  message: {
    marginTop: spacing[3],
    fontSize: typography.sizes.sm,
    color: colors.light.mutedForeground,
  },
  skeleton: {
    backgroundColor: colors.light.muted,
  },
});

