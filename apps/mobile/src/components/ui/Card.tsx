/**
 * Gapp Mobile - Card Component
 * 
 * Container card seguindo o design system.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

// === Card Container ===
export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

// === Card Header ===
export interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

export function CardHeader({ children, style, ...props }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
}

// === Card Title ===
export interface CardTitleProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardTitle({ children, style }: CardTitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

// === Card Description ===
export interface CardDescriptionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

// === Card Content ===
export interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

export function CardContent({ children, style, ...props }: CardContentProps) {
  return (
    <View style={[styles.content, style]} {...props}>
      {children}
    </View>
  );
}

// === Card Footer ===
export interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
}

export function CardFooter({ children, style, ...props }: CardFooterProps) {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.DEFAULT,
    borderWidth: 1,
    borderColor: colors.light.border,
    ...shadows.sm,
  },
  header: {
    padding: spacing[6],
    gap: spacing[1.5],
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.light.foreground,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.light.mutedForeground,
  },
  content: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
  },
});

