/**
 * Gapp Mobile - Root Navigator
 * 
 * Navigator raiz que gerencia autenticação e navegação principal.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useThemeColors, typography } from '../theme';

// Navigators
import { MainTabNavigator } from './MainTabNavigator';

// Auth Screens
import { LoginScreen } from '../modules/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '../modules/auth/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../modules/auth/screens/ResetPasswordScreen';

// Modal Screens
import { NotificationsScreen } from '../modules/notifications/screens/NotificationsScreen';
import { SettingsScreen } from '../modules/settings/screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  isAuthenticated: boolean;
}

export function RootNavigator({ isAuthenticated }: RootNavigatorProps) {
  const colors = useThemeColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: typography.weights.semibold as '600',
          fontSize: typography.sizes.lg,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {isAuthenticated ? (
        // Authenticated screens
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              title: 'Notificações',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Configurações',
              presentation: 'modal',
            }}
          />
        </>
      ) : (
        // Auth screens
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: 'Recuperar Senha' }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ title: 'Redefinir Senha' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

