/**
 * AnyList TypeScript Client Library
 * 
 * A TypeScript client library for interacting with AnyList servers.
 * Converted from Python Home Assistant integration to provide cross-platform
 * support with proper type safety.
 * 
 * @packageDocumentation
 */

// Export main classes
export { AnyList } from './lib/anylist';
export { AnyListServer } from './lib/server';
export { AuthManager, createDefaultAuthManager, validateConfigQuick } from './lib/auth';

// Export all types and interfaces
export * from './types';

// Import for internal use
import { AnyList } from './lib/anylist';
import { AnyListServer } from './lib/server';
import { AuthManager } from './lib/auth';
import type { AnyListConfig, ServerConfig } from './types';

// Export version information
export const VERSION = '1.0.0';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  /** Default server port for binary server */
  DEFAULT_PORT: '28597',
  /** Default refresh interval in minutes */
  DEFAULT_REFRESH_INTERVAL: 30,
  /** Default timeout for HTTP requests in milliseconds */
  DEFAULT_TIMEOUT: 10000,
  /** Default IP filter for binary server */
  DEFAULT_IP_FILTER: '127.0.0.1'
} as const;

/**
 * Quick factory function to create AnyList client with validation
 * 
 * @param config - Client configuration
 * @returns Configured AnyList client instance
 * @throws AnyListError if configuration is invalid
 * 
 * @example
 * ```typescript
 * import { createAnyListClient } from 'anylist-client';
 * 
 * const client = createAnyListClient({
 *   serverAddress: 'http://localhost:28597',
 *   defaultList: 'Shopping'
 * });
 * 
 * // Add an item
 * await client.addItem('Milk', { notes: 'Skim milk' });
 * ```
 */
export function createAnyListClient(config: AnyListConfig): AnyList {
  // Validate configuration
  AuthManager.validateConfig(config);
  
  return new AnyList(config);
}

/**
 * Quick factory function to create AnyList server with validation
 * 
 * @param serverConfig - Server configuration
 * @returns Configured AnyListServer instance
 * @throws AnyListError if configuration is invalid
 * 
 * @example
 * ```typescript
 * import { createAnyListServer } from 'anylist-client';
 * 
 * const server = createAnyListServer({
 *   binary: '/path/to/anylist-server',
 *   port: '28597',
 *   email: 'user@example.com',
 *   password: 'password',
 *   credentialsFile: '/path/to/credentials'
 * });
 * 
 * server.start();
 * ```
 */
export function createAnyListServer(serverConfig: ServerConfig): AnyListServer {
  // Validate configuration
  AnyListServer.validateConfig(serverConfig);
  
  return new AnyListServer(serverConfig);
}

/**
 * Utility function to create a complete AnyList setup with binary server
 * 
 * @param config - Combined configuration for client and server
 * @returns Object containing both client and server instances
 * @throws AnyListError if configuration is invalid
 * 
 * @example
 * ```typescript
 * import { createAnyListSetup } from 'anylist-client';
 * 
 * const { client, server } = createAnyListSetup({
 *   serverBinary: '/path/to/anylist-server',
 *   email: 'user@example.com',
 *   password: 'password',
 *   defaultList: 'Shopping'
 * });
 * 
 * // Start server
 * server.start();
 * 
 * // Connect client to server
 * client.setBinaryServer(server);
 * 
 * // Use client
 * await client.addItem('Bread');
 * ```
 */
export function createAnyListSetup(config: {
  serverBinary: string;
  email: string;
  password: string;
  defaultList?: string;
  refreshInterval?: number;
  credentialsFile?: string;
  port?: string;
  ipFilter?: string;
}): { client: AnyList; server: AnyListServer } {
  const {
    serverBinary,
    email,
    password,
    credentialsFile = '.anylist_credentials',
    port = DEFAULT_CONFIG.DEFAULT_PORT,
    ipFilter = DEFAULT_CONFIG.DEFAULT_IP_FILTER,
    ...clientConfig
  } = config;

  // Create server configuration
  const serverConfig: ServerConfig = {
    binary: serverBinary,
    port,
    email,
    password,
    credentialsFile,
    ipFilter
  };

  // Create client configuration
  const anylistConfig: AnyListConfig = {
    email,
    password,
    ...clientConfig
  };

  // Create instances
  const server = createAnyListServer(serverConfig);
  const client = createAnyListClient(anylistConfig);

  // Link them together
  client.setBinaryServer(server);

  return { client, server };
}