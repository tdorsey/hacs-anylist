/**
 * Utility functions for the Anylist Home Assistant Integration
 */

import type { AnylistItem, AnylistConfig } from '../types/index.js';
import { ConfigurationError } from '../types/index.js';

/**
 * Validates an Anylist configuration object
 */
export function validateConfig(config: AnylistConfig): void {
  if (!config.serverAddr) {
    throw new ConfigurationError('serverAddr is required');
  }

  try {
    new URL(config.serverAddr);
  } catch {
    throw new ConfigurationError('serverAddr must be a valid URL');
  }

  if (config.serverAddr.endsWith('/')) {
    throw new ConfigurationError('serverAddr should not end with a trailing slash');
  }
}

/**
 * Sanitizes item names by trimming whitespace
 */
export function sanitizeItemName(name: string): string {
  return name.trim();
}

/**
 * Filters items by checked status
 */
export function filterItemsByStatus(
  items: AnylistItem[], 
  checked: boolean
): AnylistItem[] {
  return items.filter(item => item.checked === checked);
}

/**
 * Groups items by list name
 */
export function groupItemsByList(items: AnylistItem[]): Record<string, AnylistItem[]> {
  return items.reduce((groups, item) => {
    const listName = item.list || 'default';
    if (!groups[listName]) {
      groups[listName] = [];
    }
    groups[listName].push(item);
    return groups;
  }, {} as Record<string, AnylistItem[]>);
}

/**
 * Converts item names to a comma-separated string
 */
export function itemNamesToString(items: AnylistItem[] | string[]): string {
  const names = Array.isArray(items) && items.length > 0 && typeof items[0] === 'object'
    ? (items as AnylistItem[]).map(item => item.name)
    : items as string[];
  
  return names.join(', ');
}

/**
 * Creates a default server address for local development
 */
export function getDefaultServerAddress(port: number = 28597): string {
  return `http://127.0.0.1:${port}`;
}

/**
 * Validates that an item name is not empty
 */
export function validateItemName(name: string): void {
  if (!name || !name.trim()) {
    throw new ConfigurationError('Item name cannot be empty');
  }
}

/**
 * Creates a normalized item object with default values
 */
export function createNormalizedItem(
  name: string,
  options: Partial<AnylistItem> = {}
): AnylistItem {
  validateItemName(name);
  
  return {
    name: sanitizeItemName(name),
    checked: false,
    notes: '',
    list: '',
    ...options,
  };
}

/**
 * Debounce function for API calls to prevent excessive requests
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...funcArgs: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...funcArgs: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...funcArgs);
    }, wait);
  };
}

/**
 * Retry wrapper for network operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  
  throw lastError!;
}

/**
 * Checks if a string is a valid HTTP URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Formats a list of items for display
 */
export function formatItemsForDisplay(
  items: string[] | AnylistItem[],
  options: {
    maxItems?: number;
    separator?: string;
    emptyMessage?: string;
  } = {}
): string {
  const {
    maxItems = 10,
    separator = ', ',
    emptyMessage = 'No items'
  } = options;

  if (!items || items.length === 0) {
    return emptyMessage;
  }

  const names = Array.isArray(items) && items.length > 0 && typeof items[0] === 'object'
    ? (items as AnylistItem[]).map(item => item.name)
    : items as string[];

  if (names.length <= maxItems) {
    return names.join(separator);
  }

  const visible = names.slice(0, maxItems);
  const remaining = names.length - maxItems;
  return `${visible.join(separator)}... and ${remaining} more`;
}