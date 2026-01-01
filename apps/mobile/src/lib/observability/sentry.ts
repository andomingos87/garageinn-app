/**
 * Gapp Mobile - Sentry Integration
 * 
 * Configuração do Sentry para crash reporting e monitoramento de erros.
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Configuração do Sentry
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';

interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
  enableAutoSessionTracking: boolean;
  debug: boolean;
}

function getSentryConfig(): SentryConfig {
  const isProduction = !__DEV__;
  
  return {
    dsn: SENTRY_DSN,
    environment: isProduction ? 'production' : 'development',
    release: `gapp-mobile@${Constants.expoConfig?.version || '0.1.0'}`,
    // Performance monitoring
    tracesSampleRate: isProduction ? 0.2 : 1.0,
    profilesSampleRate: isProduction ? 0.1 : 1.0,
    // Session tracking
    enableAutoSessionTracking: true,
    // Debug mode apenas em desenvolvimento
    debug: !isProduction,
  };
}

/**
 * Inicializa o Sentry para crash reporting.
 * Deve ser chamado no início do app (antes de qualquer render).
 */
export function initSentry(): void {
  const config = getSentryConfig();
  
  // Não inicializar se não houver DSN configurado
  if (!config.dsn) {
    console.warn('[Sentry] DSN not configured. Crash reporting disabled.');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    tracesSampleRate: config.tracesSampleRate,
    profilesSampleRate: config.profilesSampleRate,
    enableAutoSessionTracking: config.enableAutoSessionTracking,
    debug: config.debug,
    // Integrations
    integrations: [
      Sentry.mobileReplayIntegration({
        maskAllText: true,
        maskAllImages: true,
      }),
    ],
    // Replay apenas para erros em produção
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: __DEV__ ? 0.1 : 0,
  });

  console.info('[Sentry] Initialized successfully', { 
    environment: config.environment,
    release: config.release,
  });
}

/**
 * Captura uma exceção manualmente.
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
}

/**
 * Captura uma mensagem manualmente.
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Define informações do usuário para contexto de erros.
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (user) {
    Sentry.setUser(user);
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Adiciona breadcrumb para rastreamento de ações.
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Define tag para filtrar eventos.
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * HOC para wrapping do componente raiz com Sentry.
 */
export const withSentry = Sentry.wrap;

// Re-export Sentry types
export type { Breadcrumb, SeverityLevel } from '@sentry/react-native';

