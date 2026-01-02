/**
 * Gapp Mobile - Auth Service Tests
 * 
 * Testes unitários para o serviço de autenticação.
 */

import { validateEmail, validatePassword, normalizeAuthError } from '../services/authService';
import { AUTH_ERROR_MESSAGES } from '../types/auth.types';

describe('authService', () => {
  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user.name@example.com')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
      expect(validateEmail('user@subdomain.example.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('user')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@example')).toBe(false);
      expect(validateEmail('user example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for passwords with 6+ characters', () => {
      expect(validatePassword('123456')).toBe(true);
      expect(validatePassword('password')).toBe(true);
      expect(validatePassword('a'.repeat(100))).toBe(true);
    });

    it('should return false for passwords with less than 6 characters', () => {
      expect(validatePassword('')).toBe(false);
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('abc')).toBe(false);
    });
  });

  describe('normalizeAuthError', () => {
    it('should normalize network errors', () => {
      const networkError = new TypeError('Network request failed');
      const result = normalizeAuthError(networkError);
      
      expect(result.code).toBe('network_error');
      expect(result.message).toBe(AUTH_ERROR_MESSAGES.network_error);
    });

    it('should normalize invalid credentials error', () => {
      const error = { message: 'Invalid login credentials' };
      const result = normalizeAuthError(error);
      
      expect(result.code).toBe('invalid_credentials');
      expect(result.message).toBe(AUTH_ERROR_MESSAGES.invalid_credentials);
    });

    it('should normalize invalid email error', () => {
      const error = { message: 'Invalid email format' };
      const result = normalizeAuthError(error);
      
      expect(result.code).toBe('invalid_email');
      expect(result.message).toBe(AUTH_ERROR_MESSAGES.invalid_email);
    });

    it('should normalize rate limit error', () => {
      const error = { message: 'Too many requests' };
      const result = normalizeAuthError(error);
      
      expect(result.code).toBe('too_many_requests');
      expect(result.message).toBe(AUTH_ERROR_MESSAGES.too_many_requests);
    });

    it('should normalize email not confirmed error', () => {
      const error = { message: 'Email not confirmed' };
      const result = normalizeAuthError(error);
      
      expect(result.code).toBe('email_not_confirmed');
      expect(result.message).toBe(AUTH_ERROR_MESSAGES.email_not_confirmed);
    });

    it('should return unknown for unrecognized errors', () => {
      const error = { message: 'Some random error' };
      const result = normalizeAuthError(error);
      
      expect(result.code).toBe('unknown');
      expect(result.message).toBe(AUTH_ERROR_MESSAGES.unknown);
    });

    it('should handle null/undefined errors', () => {
      const result = normalizeAuthError(null);
      
      expect(result.code).toBe('unknown');
      expect(result.message).toBe(AUTH_ERROR_MESSAGES.unknown);
    });
  });
});

