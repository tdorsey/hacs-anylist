/**
 * AnyList Home Assistant Integration - TypeScript Implementation
 *
 * This is the main entry point for the TypeScript version of the AnyList
 * Home Assistant integration. This file will serve as the foundation for
 * the conversion from the existing Python implementation.
 */

import type { AnyListConfig } from './types';

// Version information
export const VERSION = '1.5.9';

// Domain constant
export const DOMAIN = 'anylist';

/**
 * Main integration class that will be implemented as the TypeScript conversion progresses
 * This serves as a placeholder and architectural foundation
 */
export class AnyListIntegration {
  private config: AnyListConfig;

  constructor(config: AnyListConfig) {
    this.config = config;
  }

  public async initialize(): Promise<void> {
    // Implementation will be added during the conversion process
    throw new Error('TypeScript implementation not yet complete');
  }

  public getConfig(): AnyListConfig {
    return { ...this.config };
  }
}

// Export everything for use by other modules
export * from './types';
export * from './utils';
