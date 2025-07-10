/**
 * Basic tests for the TypeScript build toolchain
 */

import { AnyListIntegration, VERSION, DOMAIN } from '../index';
import {
  validateServerAddress,
  normalizeListName,
  createServiceResponse,
  sanitizeItemName,
  createLogger,
} from '../utils';

describe('AnyList Integration Core', () => {
  test('exports version and domain constants', () => {
    expect(VERSION).toBe('1.5.9');
    expect(DOMAIN).toBe('anylist');
  });

  test('AnyListIntegration can be instantiated', () => {
    const config = { serverAddr: 'http://localhost:1234' };
    const integration = new AnyListIntegration(config);
    expect(integration).toBeInstanceOf(AnyListIntegration);
    expect(integration.getConfig()).toEqual(config);
  });

  test('initialize throws error for incomplete implementation', async () => {
    const config = { serverAddr: 'http://localhost:1234' };
    const integration = new AnyListIntegration(config);
    await expect(integration.initialize()).rejects.toThrow(
      'TypeScript implementation not yet complete'
    );
  });
});

describe('Utility Functions', () => {
  describe('validateServerAddress', () => {
    test('validates correct HTTP URLs', () => {
      expect(validateServerAddress('http://localhost:1234')).toBe(true);
      expect(validateServerAddress('https://example.com')).toBe(true);
    });

    test('rejects invalid URLs', () => {
      expect(validateServerAddress('not-a-url')).toBe(false);
      expect(validateServerAddress('ftp://example.com')).toBe(false);
      expect(validateServerAddress('')).toBe(false);
    });
  });

  describe('normalizeListName', () => {
    test('returns default list for undefined input', () => {
      expect(normalizeListName()).toBe('Shopping');
      expect(normalizeListName(undefined)).toBe('Shopping');
    });

    test('trims whitespace from list names', () => {
      expect(normalizeListName('  Groceries  ')).toBe('Groceries');
    });
  });

  describe('createServiceResponse', () => {
    test('creates successful response with data', () => {
      const response = createServiceResponse(true, { items: ['milk'] });
      expect(response).toEqual({
        success: true,
        data: { items: ['milk'] },
        error: undefined,
      });
    });

    test('creates error response', () => {
      const response = createServiceResponse(false, undefined, 'Server error');
      expect(response).toEqual({
        success: false,
        data: undefined,
        error: 'Server error',
      });
    });
  });

  describe('sanitizeItemName', () => {
    test('removes dangerous characters', () => {
      expect(sanitizeItemName('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
    });

    test('trims whitespace', () => {
      expect(sanitizeItemName('  milk  ')).toBe('milk');
    });
  });

  describe('Logger', () => {
    test('creates logger with domain', () => {
      const logger = createLogger();
      expect(logger).toBeDefined();

      // Test that methods exist and don't throw
      expect(() => logger.info('test')).not.toThrow();
      expect(() => logger.warn('test')).not.toThrow();
      expect(() => logger.error('test')).not.toThrow();
      expect(() => logger.debug('test')).not.toThrow();
    });
  });
});
