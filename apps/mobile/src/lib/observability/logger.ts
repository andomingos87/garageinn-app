/**
 * Gapp Mobile - Logger
 * 
 * Sistema de logging estruturado para debugging e monitoramento.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  source: string;
}

// Configuração do logger
const config = {
  enabled: __DEV__, // Logs habilitados apenas em desenvolvimento
  minLevel: 'debug' as LogLevel,
  source: 'GappMobile',
};

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const levelColors: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
};

const resetColor = '\x1b[0m';

function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) return false;
  return levelPriority[level] >= levelPriority[config.minLevel];
}

function formatLog(entry: LogEntry): string {
  const color = levelColors[entry.level];
  const levelStr = entry.level.toUpperCase().padEnd(5);
  const contextStr = entry.context 
    ? ` ${JSON.stringify(entry.context)}` 
    : '';
  
  return `${color}[${entry.timestamp}] [${levelStr}] [${entry.source}]${resetColor} ${entry.message}${contextStr}`;
}

function createLogEntry(level: LogLevel, message: string, context?: LogContext): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    source: config.source,
  };
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return;

  const entry = createLogEntry(level, message, context);
  const formatted = formatLog(entry);

  switch (level) {
    case 'debug':
      console.debug(formatted);
      break;
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
}

/**
 * Logger estruturado para o app mobile.
 * 
 * @example
 * ```typescript
 * import { logger } from '../lib/observability';
 * 
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to fetch data', { error: err.message });
 * ```
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  
  /**
   * Cria um logger com contexto fixo (útil para módulos específicos).
   */
  withContext: (baseContext: LogContext) => ({
    debug: (message: string, context?: LogContext) => 
      log('debug', message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) => 
      log('info', message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext) => 
      log('warn', message, { ...baseContext, ...context }),
    error: (message: string, context?: LogContext) => 
      log('error', message, { ...baseContext, ...context }),
  }),
};

export type { LogLevel, LogContext, LogEntry };

