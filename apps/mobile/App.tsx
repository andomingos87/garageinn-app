/**
 * Gapp Mobile - Main App Entry
 * 
 * Aplicativo mobile Garageinn para operações de campo.
 * Inclui navegação, tema, observabilidade e autenticação.
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Navigation
import { NavigationContainer, RootNavigator } from './src/navigation';

// Auth
import { AuthProvider, useSession } from './src/modules/auth';

// Observability
import { 
  initSentry, 
  withSentry, 
  logger, 
  useAppStateTracking,
} from './src/lib/observability';

// Theme
import { colors } from './src/theme';

// Initialize Sentry before any rendering
initSentry();

/**
 * Componente interno que usa o AuthContext
 */
function AppNavigator() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, isInitialized } = useSession();

  // Track app state changes (foreground/background)
  useAppStateTracking();

  useEffect(() => {
    logger.info('App starting', { colorScheme });
  }, [colorScheme]);

  useEffect(() => {
    if (isInitialized) {
      logger.info('Auth initialized', { isAuthenticated });
    }
  }, [isInitialized, isAuthenticated]);

  // Loading state while checking auth
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { 
        backgroundColor: colorScheme === 'dark' ? colors.dark.background : colors.light.background 
      }]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator isAuthenticated={isAuthenticated} />
    </NavigationContainer>
  );
}

/**
 * Componente principal do App
 */
function AppContent() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Wrap with Sentry for error boundary
export default withSentry(AppContent);
