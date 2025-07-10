/**
 * Common types for the Anylist Home Assistant Integration
 */

/**
 * Configuration for the Anylist integration
 */
export interface AnylistConfig {
  /** Server address (e.g., http://127.0.0.1:1234) */
  serverAddr?: string;
  /** Email for authentication */
  email?: string;
  /** Password for authentication */
  password?: string;
  /** Path to server binary */
  serverBinary?: string;
  /** Default list name to use when none specified */
  defaultList?: string;
}

/**
 * Anylist item representation
 */
export interface AnylistItem {
  /** Unique identifier for the item */
  id?: string;
  /** Display name of the item */
  name: string;
  /** Whether the item is checked/completed */
  checked: boolean;
  /** Optional notes for the item */
  notes?: string;
  /** List name this item belongs to */
  list?: string;
}

/**
 * Anylist list representation
 */
export interface AnylistList {
  /** Unique identifier for the list */
  id: string;
  /** Display name of the list */
  name: string;
  /** Items in this list */
  items?: AnylistItem[];
}

/**
 * Service call parameters for adding items
 */
export interface AddItemParams {
  /** Name of the item to add */
  name: string;
  /** Optional notes for the item */
  notes?: string;
  /** Optional list name (uses default if not specified) */
  list?: string;
}

/**
 * Service call parameters for removing items
 */
export interface RemoveItemParams {
  /** Name of the item to remove */
  name: string;
  /** Optional list name (uses default if not specified) */
  list?: string;
}

/**
 * Service call parameters for checking/unchecking items
 */
export interface CheckItemParams {
  /** Name of the item to check/uncheck */
  name: string;
  /** Optional list name (uses default if not specified) */
  list?: string;
}

/**
 * Service call parameters for getting items
 */
export interface GetItemsParams {
  /** Optional list name (uses default if not specified) */
  list?: string;
}

/**
 * Response from service calls
 */
export interface ServiceResponse<T = unknown> {
  /** HTTP status code */
  code: number;
  /** Response data */
  data?: T;
}

/**
 * Response from get_items service
 */
export interface GetItemsResponse extends ServiceResponse<string[]> {
  /** Array of unchecked item names */
  items: string[];
}

/**
 * Response from get_all_items service
 */
export interface GetAllItemsResponse extends ServiceResponse {
  /** Array of unchecked item names */
  uncheckedItems: string[];
  /** Array of checked item names */
  checkedItems: string[];
}

/**
 * Home Assistant service call context
 */
export interface ServiceCallContext {
  /** Domain of the service */
  domain: string;
  /** Service name */
  service: string;
  /** Service data */
  data: Record<string, unknown>;
}

/**
 * Error types that can occur during API calls
 */
export class AnylistError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AnylistError';
    // Use properties to avoid unused parameter warnings
    void this.code;
    void this.cause;
  }
}

/**
 * Configuration validation error
 */
export class ConfigurationError extends AnylistError {
  constructor(message: string, cause?: unknown) {
    super(message, undefined, cause);
    this.name = 'ConfigurationError';
  }
}

/**
 * Network/HTTP error
 */
export class NetworkError extends AnylistError {
  constructor(message: string, code?: number, cause?: unknown) {
    super(message, code, cause);
    this.name = 'NetworkError';
  }
}