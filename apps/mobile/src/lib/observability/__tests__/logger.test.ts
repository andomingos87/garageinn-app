/**
 * Logger Tests
 * 
 * Tests for the structured logging system.
 */

import { logger, LogLevel } from '../logger';

// Mock __DEV__ to be true for tests
declare const global: { __DEV__: boolean };
(global as any).__DEV__ = true;

describe('Logger', () => {
  let consoleSpy: {
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log levels', () => {
    it('logs debug messages', () => {
      logger.debug('Debug message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('logs info messages', () => {
      logger.info('Info message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('logs warn messages', () => {
      logger.warn('Warning message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('logs error messages', () => {
      logger.error('Error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('message formatting', () => {
    it('includes timestamp in log output', () => {
      logger.info('Test message');
      const logCall = consoleSpy.info.mock.calls[0][0];
      // Should contain ISO date format
      expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('includes log level in output', () => {
      logger.info('Test message');
      const logCall = consoleSpy.info.mock.calls[0][0];
      expect(logCall).toContain('INFO');
    });

    it('includes message in output', () => {
      logger.info('My test message');
      const logCall = consoleSpy.info.mock.calls[0][0];
      expect(logCall).toContain('My test message');
    });
  });

  describe('with context data', () => {
    it('logs additional data in formatted string', () => {
      logger.info('User action', { userId: '123', action: 'login' });
      const logCall = consoleSpy.info.mock.calls[0][0];
      // Context is included in the formatted string
      expect(logCall).toContain('userId');
      expect(logCall).toContain('123');
    });

    it('handles undefined data', () => {
      logger.info('Simple message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('handles complex nested data', () => {
      const complexData = {
        user: { id: '1', name: 'Test' },
        items: [1, 2, 3],
      };
      logger.info('Complex log', complexData);
      const logCall = consoleSpy.info.mock.calls[0][0];
      expect(logCall).toContain('user');
    });
  });

  describe('error logging', () => {
    it('logs error with stack trace', () => {
      const error = new Error('Test error');
      logger.error('An error occurred', { error: error.message, stack: error.stack });
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('withContext', () => {
    it('creates a logger with base context', () => {
      const moduleLogger = logger.withContext({ module: 'auth' });
      moduleLogger.info('Login attempt');
      const logCall = consoleSpy.info.mock.calls[0][0];
      expect(logCall).toContain('module');
      expect(logCall).toContain('auth');
    });

    it('merges base context with call context', () => {
      const moduleLogger = logger.withContext({ module: 'auth' });
      moduleLogger.info('Login success', { userId: '123' });
      const logCall = consoleSpy.info.mock.calls[0][0];
      expect(logCall).toContain('module');
      expect(logCall).toContain('userId');
    });
  });
});

