/**
 * Gapp Mobile - Observability Hooks
 * 
 * Hooks React para integração de observabilidade nas telas.
 */

import { useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { logger } from './logger';
import { addBreadcrumb, setTag } from './sentry';

/**
 * Hook para rastrear montagem/desmontagem de telas.
 * Adiciona breadcrumbs automaticamente para debugging.
 * 
 * @example
 * ```typescript
 * function MyScreen() {
 *   useScreenTracking('MyScreen');
 *   return <View>...</View>;
 * }
 * ```
 */
export function useScreenTracking(screenName: string): void {
  useEffect(() => {
    logger.info(`Screen mounted: ${screenName}`);
    addBreadcrumb({
      category: 'navigation',
      message: `Entered ${screenName}`,
      level: 'info',
    });
    setTag('current_screen', screenName);

    return () => {
      logger.info(`Screen unmounted: ${screenName}`);
      addBreadcrumb({
        category: 'navigation',
        message: `Left ${screenName}`,
        level: 'info',
      });
    };
  }, [screenName]);
}

/**
 * Hook para rastrear ações do usuário.
 * Retorna uma função para registrar ações com contexto.
 * 
 * @example
 * ```typescript
 * function MyScreen() {
 *   const trackAction = useActionTracking('MyScreen');
 *   
 *   const handlePress = () => {
 *     trackAction('button_pressed', { buttonId: 'submit' });
 *     // ... rest of handler
 *   };
 * }
 * ```
 */
export function useActionTracking(screenName: string) {
  return useCallback((action: string, data?: Record<string, unknown>) => {
    logger.info(`Action: ${action}`, { screen: screenName, ...data });
    addBreadcrumb({
      category: 'user_action',
      message: `${screenName}: ${action}`,
      data,
      level: 'info',
    });
  }, [screenName]);
}

/**
 * Hook para rastrear estado do app (foreground/background).
 * Útil para analytics e gerenciamento de recursos.
 * 
 * @example
 * ```typescript
 * function App() {
 *   useAppStateTracking();
 *   return <Navigation />;
 * }
 * ```
 */
export function useAppStateTracking(): void {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        logger.info('App came to foreground');
        addBreadcrumb({
          category: 'app_state',
          message: 'App became active',
          level: 'info',
        });
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        logger.info('App went to background');
        addBreadcrumb({
          category: 'app_state',
          message: 'App went to background',
          level: 'info',
        });
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

/**
 * Hook para medir performance de operações.
 * 
 * @example
 * ```typescript
 * function MyScreen() {
 *   const measurePerformance = usePerformanceTracking('MyScreen');
 *   
 *   const loadData = async () => {
 *     const endMeasure = measurePerformance('data_load');
 *     await fetchData();
 *     endMeasure(); // Logs duration automatically
 *   };
 * }
 * ```
 */
export function usePerformanceTracking(context: string) {
  return useCallback((operationName: string) => {
    const startTime = performance.now();
    logger.debug(`Performance: ${operationName} started`, { context });

    return () => {
      const duration = performance.now() - startTime;
      logger.info(`Performance: ${operationName} completed`, { 
        context, 
        durationMs: Math.round(duration),
      });
      addBreadcrumb({
        category: 'performance',
        message: `${context}: ${operationName}`,
        data: { durationMs: Math.round(duration) },
        level: 'info',
      });
    };
  }, [context]);
}

/**
 * Hook para rastrear erros em componentes.
 * 
 * @example
 * ```typescript
 * function MyScreen() {
 *   const trackError = useErrorTracking('MyScreen');
 *   
 *   const handleSubmit = async () => {
 *     try {
 *       await submitData();
 *     } catch (error) {
 *       trackError(error as Error, { action: 'submit' });
 *     }
 *   };
 * }
 * ```
 */
export function useErrorTracking(context: string) {
  return useCallback((error: Error, additionalData?: Record<string, unknown>) => {
    logger.error(`Error in ${context}: ${error.message}`, {
      errorName: error.name,
      stack: error.stack,
      ...additionalData,
    });
    addBreadcrumb({
      category: 'error',
      message: `${context}: ${error.message}`,
      data: additionalData,
      level: 'error',
    });
  }, [context]);
}

