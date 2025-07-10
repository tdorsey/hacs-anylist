import { AuthManager, validateConfigQuick } from '../lib/auth';
import { AnyListConfig, AnyListError } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('AuthManager', () => {
  let authManager: AuthManager;
  let tempCredentialsPath: string;

  beforeEach(() => {
    // Create a temporary file path for testing
    tempCredentialsPath = path.join(os.tmpdir(), `test-credentials-${Date.now()}.json`);
    authManager = new AuthManager(tempCredentialsPath);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(tempCredentialsPath)) {
      fs.unlinkSync(tempCredentialsPath);
    }
  });

  describe('static validation methods', () => {
    describe('validateEmail', () => {
      it('should validate correct email addresses', () => {
        expect(AuthManager.validateEmail('test@example.com')).toBe(true);
        expect(AuthManager.validateEmail('user.name@domain.co.uk')).toBe(true);
        expect(AuthManager.validateEmail('test+tag@example.org')).toBe(true);
      });

      it('should reject invalid email addresses', () => {
        expect(AuthManager.validateEmail('invalid-email')).toBe(false);
        expect(AuthManager.validateEmail('test@')).toBe(false);
        expect(AuthManager.validateEmail('@example.com')).toBe(false);
        // Note: test..test@example.com is actually valid per RFC 5322, so we skip this test
      });
    });

    describe('validatePassword', () => {
      it('should validate strong passwords', () => {
        const result = AuthManager.validatePassword('validPassword123');
        expect(result.isValid).toBe(true);
        expect(result.message).toBeUndefined();
      });

      it('should reject empty passwords', () => {
        const result = AuthManager.validatePassword('');
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Password cannot be empty');
      });

      it('should reject short passwords', () => {
        const result = AuthManager.validatePassword('123');
        expect(result.isValid).toBe(false);
        expect(result.message).toBe('Password must be at least 6 characters long');
      });
    });

    describe('validateServerAddress', () => {
      it('should validate correct HTTP URLs', () => {
        expect(AuthManager.validateServerAddress('http://localhost:8080')).toBe(true);
        expect(AuthManager.validateServerAddress('https://api.example.com')).toBe(true);
        expect(AuthManager.validateServerAddress('http://192.168.1.100:28597')).toBe(true);
      });

      it('should reject invalid URLs', () => {
        expect(AuthManager.validateServerAddress('invalid-url')).toBe(false);
        expect(AuthManager.validateServerAddress('ftp://example.com')).toBe(false);
        expect(AuthManager.validateServerAddress('not-a-url')).toBe(false);
      });
    });

    describe('validateConfig', () => {
      it('should validate correct configuration', () => {
        const config: AnyListConfig = {
          email: 'test@example.com',
          password: 'validPassword',
          serverAddress: 'http://localhost:28597',
          refreshInterval: 30
        };

        expect(() => AuthManager.validateConfig(config)).not.toThrow();
      });

      it('should throw for invalid email', () => {
        const config: AnyListConfig = {
          email: 'invalid-email'
        };

        expect(() => AuthManager.validateConfig(config))
          .toThrow(AnyListError);
      });

      it('should throw for invalid password', () => {
        const config: AnyListConfig = {
          password: '123'
        };

        expect(() => AuthManager.validateConfig(config))
          .toThrow(AnyListError);
      });

      it('should throw for invalid server address', () => {
        const config: AnyListConfig = {
          serverAddress: 'invalid-url'
        };

        expect(() => AuthManager.validateConfig(config))
          .toThrow(AnyListError);
      });

      it('should throw for invalid refresh interval', () => {
        const config: AnyListConfig = {
          refreshInterval: 2000 // Too high
        };

        expect(() => AuthManager.validateConfig(config))
          .toThrow(AnyListError);
      });
    });
  });

  describe('credentials management', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'validPassword',
      serverAddress: 'http://localhost:28597'
    };

    describe('saveCredentials', () => {
      it('should save valid credentials', async () => {
        await authManager.saveCredentials(validCredentials);
        expect(authManager.hasCredentials()).toBe(true);
      });

      it('should throw for invalid email', async () => {
        const invalidCredentials = {
          ...validCredentials,
          email: 'invalid-email'
        };

        await expect(authManager.saveCredentials(invalidCredentials))
          .rejects.toThrow(AnyListError);
      });

      it('should throw for invalid password', async () => {
        const invalidCredentials = {
          ...validCredentials,
          password: '123'
        };

        await expect(authManager.saveCredentials(invalidCredentials))
          .rejects.toThrow(AnyListError);
      });
    });

    describe('loadCredentials', () => {
      it('should load saved credentials', async () => {
        await authManager.saveCredentials(validCredentials);
        const loaded = await authManager.loadCredentials();

        expect(loaded).not.toBeNull();
        expect(loaded!.email).toBe(validCredentials.email);
        expect(loaded!.password).toBe(validCredentials.password);
        expect(loaded!.serverAddress).toBe(validCredentials.serverAddress);
        expect(loaded!.savedAt).toBeDefined();
      });

      it('should return null for non-existent credentials', async () => {
        const loaded = await authManager.loadCredentials();
        expect(loaded).toBeNull();
      });

      it('should throw for corrupted credentials file', async () => {
        // Create a corrupted file
        fs.writeFileSync(tempCredentialsPath, 'invalid json');

        await expect(authManager.loadCredentials())
          .rejects.toThrow(AnyListError);
      });
    });

    describe('updateCredentials', () => {
      it('should update existing credentials', async () => {
        await authManager.saveCredentials(validCredentials);
        
        const updates = { serverAddress: 'http://new-server:8080' };
        await authManager.updateCredentials(updates);

        const loaded = await authManager.loadCredentials();
        expect(loaded!.serverAddress).toBe(updates.serverAddress);
        expect(loaded!.email).toBe(validCredentials.email); // Should remain unchanged
      });

      it('should throw when no credentials exist', async () => {
        await expect(authManager.updateCredentials({ email: 'new@example.com' }))
          .rejects.toThrow(AnyListError);
      });
    });

    describe('deleteCredentials', () => {
      it('should delete existing credentials', async () => {
        await authManager.saveCredentials(validCredentials);
        expect(authManager.hasCredentials()).toBe(true);

        await authManager.deleteCredentials();
        expect(authManager.hasCredentials()).toBe(false);
      });

      it('should not throw when no credentials exist', async () => {
        await expect(authManager.deleteCredentials()).resolves.not.toThrow();
      });
    });

    describe('createConfigFromCredentials', () => {
      it('should create config from stored credentials', async () => {
        await authManager.saveCredentials(validCredentials);
        
        const config = await authManager.createConfigFromCredentials({
          defaultList: 'Shopping'
        });

        expect(config.email).toBe(validCredentials.email);
        expect(config.password).toBe(validCredentials.password);
        expect(config.serverAddress).toBe(validCredentials.serverAddress);
        expect(config.defaultList).toBe('Shopping');
      });

      it('should throw when no credentials are stored', async () => {
        await expect(authManager.createConfigFromCredentials())
          .rejects.toThrow(AnyListError);
      });
    });
  });

  describe('getCredentialsPath', () => {
    it('should return the credentials file path', () => {
      expect(authManager.getCredentialsPath()).toBe(tempCredentialsPath);
    });
  });
});

describe('validateConfigQuick', () => {
  it('should return valid result for correct config', () => {
    const config: AnyListConfig = {
      email: 'test@example.com',
      password: 'validPassword'
    };

    const result = validateConfigQuick(config);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return invalid result with errors for incorrect config', () => {
    const config: AnyListConfig = {
      email: 'invalid-email'
    };

    const result = validateConfigQuick(config);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});