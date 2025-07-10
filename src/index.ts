/**
 * @fileoverview Main entry point for the Anylist Home Assistant Integration TypeScript SDK
 * 
 * This module provides a comprehensive TypeScript interface for interacting with
 * the Anylist Home Assistant Integration. It supports both CommonJS and ES modules
 * for maximum compatibility.
 * 
 * @version 1.5.9
 * @author tdorsey
 */

// Type exports
export type {
  AnylistConfig,
  AnylistItem,
  AnylistList,
  AddItemParams,
  RemoveItemParams,
  CheckItemParams,
  GetItemsParams,
  ServiceResponse,
  GetItemsResponse,
  GetAllItemsResponse,
  ServiceCallContext,
} from './types/index.js';

// Error class exports
export {
  AnylistError,
  ConfigurationError,
  NetworkError,
} from './types/index.js';

// Client exports
export {
  AnylistClient,
  createAnylistClient,
} from './client/index.js';

// Utility exports
export {
  validateConfig,
  sanitizeItemName,
  filterItemsByStatus,
  groupItemsByList,
  itemNamesToString,
  getDefaultServerAddress,
  validateItemName,
  createNormalizedItem,
  debounce,
  retryOperation,
  isValidUrl,
  formatItemsForDisplay,
} from './utils/index.js';

// Version constant
export const VERSION = '1.5.9';

// Default export for convenience
export { AnylistClient as default } from './client/index.js';