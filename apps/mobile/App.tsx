/**
 * Gapp Mobile - Main App Entry
 * 
 * Aplicativo mobile Garageinn para operações de campo.
 * Inclui navegação, tema e observabilidade.
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Navigation
import { NavigationContainer, RootNavigator } from './src/navigation';

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

function AppContent() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Track app state changes (foreground/background)
  useAppStateTracking();

  useEffect(() => {
    logger.info('App starting', { colorScheme });
    
    // Simular verificação de autenticação
    const checkAuth = async () => {
      try {
        // TODO: Implementar verificação real de autenticação
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Por enquanto, sempre autenticado para testes de navegação
        setIsAuthenticated(true);
        logger.info('Auth check completed', { isAuthenticated: true });
      } catch (error) {
        logger.error('Auth check failed', { error: (error as Error).message });
        setIsAuthenticated(false);
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  // Loading state
  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, { 
        backgroundColor: colorScheme === 'dark' ? colors.dark.background : colors.light.background 
      }]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <RootNavigator isAuthenticated={isAuthenticated} />
      </NavigationContainer>
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
