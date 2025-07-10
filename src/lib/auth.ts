import * as fs from 'fs';
import * as path from 'path';
import { AnyListConfig, AnyListError, AnyListErrorType } from '../types';

/**
 * Credential storage interface
 */
export interface Credentials {
  /** User email */
  email: string;
  /** User password (should be encrypted in production) */
  password: string;
  /** Server address */
  serverAddress?: string;
  /** Timestamp when credentials were saved */
  savedAt: string;
}

/**
 * Authentication utilities for AnyList
 * 
 * Provides methods for credential management, validation, and storage.
 * Converted from Python implementation with enhanced TypeScript features.
 */
export class AuthManager {
  private credentialsPath: string;

  /**
   * Creates a new authentication manager
   * 
   * @param credentialsPath - Path to store credentials file
   */
  constructor(credentialsPath: string) {
    this.credentialsPath = credentialsPath;
  }

  /**
   * Validates email format
   * 
   * @param email - Email address to validate
   * @returns True if email format is valid
   */
  public static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates password strength
   * 
   * @param password - Password to validate
   * @returns Object with validation result and message
   */
  public static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (!password || password.length === 0) {
      return { isValid: false, message: 'Password cannot be empty' };
    }

    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }

    return { isValid: true };
  }

  /**
   * Validates server address format
   * 
   * @param serverAddress - Server address to validate
   * @returns True if server address format is valid
   */
  public static validateServerAddress(serverAddress: string): boolean {
    try {
      const url = new URL(serverAddress);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validates a complete configuration object
   * 
   * @param config - Configuration to validate
   * @throws AnyListError if configuration is invalid
   */
  public static validateConfig(config: AnyListConfig): void {
    // Validate email if provided
    if (config.email && !AuthManager.validateEmail(config.email)) {
      throw new AnyListError(
        'Invalid email format',
        AnyListErrorType.VALIDATION_ERROR
      );
    }

    // Validate password if provided
    if (config.password) {
      const passwordValidation = AuthManager.validatePassword(config.password);
      if (!passwordValidation.isValid) {
        throw new AnyListError(
          passwordValidation.message || 'Invalid password',
          AnyListErrorType.VALIDATION_ERROR
        );
      }
    }

    // Validate server address if provided
    if (config.serverAddress && !AuthManager.validateServerAddress(config.serverAddress)) {
      throw new AnyListError(
        'Invalid server address format. Must be a valid HTTP/HTTPS URL',
        AnyListErrorType.VALIDATION_ERROR
      );
    }

    // Validate refresh interval if provided
    if (config.refreshInterval !== undefined) {
      if (config.refreshInterval < 1 || config.refreshInterval > 1440) {
        throw new AnyListError(
          'Refresh interval must be between 1 and 1440 minutes',
          AnyListErrorType.VALIDATION_ERROR
        );
      }
    }

    // Validate server binary path if provided
    if (config.serverBinary && !fs.existsSync(config.serverBinary)) {
      throw new AnyListError(
        'Server binary file does not exist',
        AnyListErrorType.VALIDATION_ERROR
      );
    }
  }

  /**
   * Saves credentials to file
   * 
   * @param credentials - Credentials to save
   * @throws AnyListError if credentials cannot be saved
   */
  public async saveCredentials(credentials: Omit<Credentials, 'savedAt'>): Promise<void> {
    try {
      // Validate credentials before saving
      if (!AuthManager.validateEmail(credentials.email)) {
        throw new AnyListError(
          'Invalid email format',
          AnyListErrorType.VALIDATION_ERROR
        );
      }

      const passwordValidation = AuthManager.validatePassword(credentials.password);
      if (!passwordValidation.isValid) {
        throw new AnyListError(
          passwordValidation.message || 'Invalid password',
          AnyListErrorType.VALIDATION_ERROR
        );
      }

      // Create credentials object with timestamp
      const credentialsWithTimestamp: Credentials = {
        ...credentials,
        savedAt: new Date().toISOString()
      };

      // Ensure directory exists
      const directory = path.dirname(this.credentialsPath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // Write credentials to file
      // Note: In production, consider encrypting the password
      await fs.promises.writeFile(
        this.credentialsPath,
        JSON.stringify(credentialsWithTimestamp, null, 2),
        { encoding: 'utf8', mode: 0o600 } // Readable only by owner
      );
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      throw new AnyListError(
        'Failed to save credentials',
        AnyListErrorType.AUTH_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Loads credentials from file
   * 
   * @returns Promise resolving to credentials or null if not found
   * @throws AnyListError if credentials file is corrupted
   */
  public async loadCredentials(): Promise<Credentials | null> {
    try {
      if (!fs.existsSync(this.credentialsPath)) {
        return null;
      }

      const credentialsData = await fs.promises.readFile(this.credentialsPath, 'utf8');
      const credentials = JSON.parse(credentialsData) as Credentials;

      // Validate loaded credentials
      if (!credentials.email || !credentials.password) {
        throw new AnyListError(
          'Corrupted credentials file: missing required fields',
          AnyListErrorType.AUTH_ERROR
        );
      }

      return credentials;
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new AnyListError(
          'Corrupted credentials file: invalid JSON',
          AnyListErrorType.AUTH_ERROR,
          undefined,
          error
        );
      }
      throw new AnyListError(
        'Failed to load credentials',
        AnyListErrorType.AUTH_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Deletes credentials file
   * 
   * @throws AnyListError if file cannot be deleted
   */
  public async deleteCredentials(): Promise<void> {
    try {
      if (fs.existsSync(this.credentialsPath)) {
        await fs.promises.unlink(this.credentialsPath);
      }
    } catch (error) {
      throw new AnyListError(
        'Failed to delete credentials',
        AnyListErrorType.AUTH_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Checks if credentials file exists
   * 
   * @returns True if credentials file exists
   */
  public hasCredentials(): boolean {
    return fs.existsSync(this.credentialsPath);
  }

  /**
   * Updates existing credentials with new values
   * 
   * @param updates - Partial credentials to update
   * @throws AnyListError if no credentials exist or update fails
   */
  public async updateCredentials(updates: Partial<Omit<Credentials, 'savedAt'>>): Promise<void> {
    const existingCredentials = await this.loadCredentials();
    if (!existingCredentials) {
      throw new AnyListError(
        'No existing credentials to update',
        AnyListErrorType.AUTH_ERROR
      );
    }

    const updatedCredentials = {
      ...existingCredentials,
      ...updates
    };

    // Remove savedAt so it gets regenerated
    const { savedAt, ...credentialsToSave } = updatedCredentials;
    await this.saveCredentials(credentialsToSave);
  }

  /**
   * Creates configuration from stored credentials
   * 
   * @param additionalConfig - Additional configuration options
   * @returns Promise resolving to AnyList configuration
   * @throws AnyListError if no credentials are stored
   */
  public async createConfigFromCredentials(
    additionalConfig: Partial<AnyListConfig> = {}
  ): Promise<AnyListConfig> {
    const credentials = await this.loadCredentials();
    if (!credentials) {
      throw new AnyListError(
        'No stored credentials found',
        AnyListErrorType.AUTH_ERROR
      );
    }

    // Create client configuration
    const config: AnyListConfig = {
      email: credentials.email,
      password: credentials.password,
      ...(credentials.serverAddress && { serverAddress: credentials.serverAddress }),
      ...additionalConfig
    };

    // Validate the final configuration
    AuthManager.validateConfig(config);

    return config;
  }

  /**
   * Gets the credentials file path
   * 
   * @returns Path to credentials file
   */
  public getCredentialsPath(): string {
    return this.credentialsPath;
  }
}

/**
 * Default credentials file name
 */
export const DEFAULT_CREDENTIALS_FILE = '.anylist_credentials';

/**
 * Creates an AuthManager with default credentials file in home directory
 * 
 * @param homeDirectory - Home directory path (defaults to process.env.HOME or os.homedir())
 * @returns AuthManager instance
 */
export function createDefaultAuthManager(homeDirectory?: string): AuthManager {
  const home = homeDirectory || process.env['HOME'] || require('os').homedir();
  const credentialsPath = path.join(home, DEFAULT_CREDENTIALS_FILE);
  return new AuthManager(credentialsPath);
}

/**
 * Quick validation helper for configuration objects
 * 
 * @param config - Configuration to validate
 * @returns Validation result with details
 */
export function validateConfigQuick(config: AnyListConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  try {
    AuthManager.validateConfig(config);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof AnyListError) {
      errors.push(error.message);
    } else {
      errors.push('Unknown validation error');
    }
    return { isValid: false, errors };
  }
}