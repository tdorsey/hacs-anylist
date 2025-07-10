/**
 * Utility functions for the AnyList integration
 */

import type { ServiceResponse } from './types';

/**
 * Validates a server address format
 */
export function validateServerAddress(addr: string): boolean {
  try {
    const url = new URL(addr);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes a list name for consistent handling
 */
export function normalizeListName(listName?: string): string {
  if (!listName) {
    return 'Shopping'; // Default list name
  }
  return listName.trim();
}

/**
 * Creates a standardized service response
 */
export function createServiceResponse<T>(
  success: boolean,
  data?: T,
  error?: string
): ServiceResponse<T> {
  const response: ServiceResponse<T> = {
    success,
  };
  if (data !== undefined) {
    response.data = data;
  }
  if (error !== undefined) {
    response.error = error;
  }
  return response;
}

/**
 * Generates a unique ID for items
 */
export function generateItemId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitizes item names for safe handling
 */
export function sanitizeItemName(name: string): string {
  return name.trim().replace(/[<>]/g, '');
}

/**
 * Formats item notes for display
 */
export function formatItemNotes(notes?: string): string | undefined {
  if (!notes) return undefined;
  return notes.trim() || undefined;
}

/**
 * Converts Python-style service data to TypeScript format
 * This will be useful during the conversion process
 */
export function convertServiceData(data: Record<string, unknown>): {
  name?: string;
  notes?: string;
  list?: string;
} {
  const result: { name?: string; notes?: string; list?: string } = {};

  if (typeof data['name'] === 'string') {
    result.name = data['name'];
  }
  if (typeof data['notes'] === 'string') {
    result.notes = data['notes'];
  }
  if (typeof data['list'] === 'string') {
    result.list = data['list'];
  }

  return result;
}

/**
 * Logger utility for consistent logging across the integration
 */
export class Logger {
  private domain: string;

  constructor(domain: string) {
    this.domain = domain;
  }

  public info(message: string, ...args: unknown[]): void {
    console.log(`[${this.domain}] INFO: ${message}`, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    console.warn(`[${this.domain}] WARN: ${message}`, ...args);
  }

  public error(message: string, ...args: unknown[]): void {
    console.error(`[${this.domain}] ERROR: ${message}`, ...args);
  }

  public debug(message: string, ...args: unknown[]): void {
    console.debug(`[${this.domain}] DEBUG: ${message}`, ...args);
  }
}

/**
 * Creates a logger instance for the AnyList domain
 */
export function createLogger(): Logger {
  return new Logger('anylist');
}
