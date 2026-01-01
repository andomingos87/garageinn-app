/**
 * Gapp Mobile - Observability Module
 * 
 * Sistema de observabilidade unificado para logging, crash reporting e analytics.
 */

// Logger
export { logger } from './logger';
export type { LogLevel, LogContext, LogEntry } from './logger';

// Sentry
export {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  setTag,
  withSentry,
} from './sentry';
export type { Breadcrumb, SeverityLevel } from './sentry';

// Hooks
export {
  useScreenTracking,
  useActionTracking,
  useAppStateTracking,
  usePerformanceTracking,
  useErrorTracking,
} from './hooks';

