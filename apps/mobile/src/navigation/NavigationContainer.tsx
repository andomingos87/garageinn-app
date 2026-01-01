/**
 * Gapp Mobile - Navigation Container
 * 
 * Container de navegação com tema customizado Garageinn.
 */

import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer as RNNavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { colors } from '../theme';

interface NavigationContainerProps {
  children: React.ReactNode;
}

// Tema claro customizado Garageinn
const GarageinnLightTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary.DEFAULT,
    background: colors.light.background,
    card: colors.light.card,
    text: colors.light.foreground,
    border: colors.light.border,
    notification: colors.primary.DEFAULT,
  },
};

// Tema escuro customizado Garageinn
const GarageinnDarkTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary.DEFAULT,
    background: colors.dark.background,
    card: colors.dark.card,
    text: colors.dark.foreground,
    border: colors.dark.border,
    notification: colors.primary.DEFAULT,
  },
};

export function NavigationContainer({ children }: NavigationContainerProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? GarageinnDarkTheme : GarageinnLightTheme;

  return (
    <RNNavigationContainer theme={theme}>
      {children}
    </RNNavigationContainer>
  );
}

