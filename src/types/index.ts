/**
 * Core interfaces and types for AnyList integration
 */

/**
 * Configuration options for AnyList client
 */
export interface AnyListConfig {
  /** Server address (e.g., "http://127.0.0.1:28597") */
  serverAddress?: string;
  /** Email for authentication */
  email?: string;
  /** Password for authentication */
  password?: string;
  /** Path to server binary (for binary server mode) */
  serverBinary?: string;
  /** Default list name to use when none specified */
  defaultList?: string;
  /** Refresh interval in minutes for data updates */
  refreshInterval?: number;
}

/**
 * AnyList item interface
 */
export interface AnyListItem {
  /** Unique identifier for the item */
  id: string;
  /** Item name/title */
  name: string;
  /** Whether the item is checked/completed */
  checked: boolean;
  /** Optional notes for the item */
  notes?: string;
  /** List name the item belongs to */
  list?: string;
}

/**
 * AnyList list interface
 */
export interface AnyListList {
  /** Unique identifier for the list */
  id: string;
  /** List name */
  name: string;
  /** Items in the list */
  items?: AnyListItem[];
}

/**
 * Request body for adding items
 */
export interface AddItemRequest {
  /** Item name */
  name: string;
  /** List name */
  list: string;
  /** Whether item starts as checked */
  checked: boolean;
  /** Optional notes */
  notes?: string;
}

/**
 * Request body for removing items by name
 */
export interface RemoveItemByNameRequest {
  /** Item name */
  name: string;
  /** List name */
  list: string;
}

/**
 * Request body for removing items by ID
 */
export interface RemoveItemByIdRequest {
  /** Item ID */
  id: string;
  /** List name */
  list: string;
}

/**
 * Request body for updating items
 */
export interface UpdateItemRequest {
  /** Item ID */
  id: string;
  /** List name */
  list: string;
  /** Item name */
  name?: string;
  /** Whether item is checked */
  checked?: boolean;
  /** Item notes */
  notes?: string;
}

/**
 * Request body for checking/unchecking items
 */
export interface CheckItemRequest {
  /** Item name */
  name: string;
  /** List name */
  list: string;
  /** Whether to check or uncheck */
  checked: boolean;
}

/**
 * Response from server operations
 */
export interface AnyListResponse<T = unknown> {
  /** HTTP status code */
  code: number;
  /** Response data */
  data?: T;
  /** Error message if any */
  error?: string;
}

/**
 * Response from get_items endpoint
 */
export interface GetItemsResponse {
  /** List of item names */
  items: string[];
}

/**
 * Response from get_all_items endpoint
 */
export interface GetAllItemsResponse {
  /** Unchecked item names */
  uncheckedItems: string[];
  /** Checked item names */
  checkedItems: string[];
}

/**
 * Response from get_detailed_items endpoint
 */
export interface GetDetailedItemsResponse {
  /** Detailed item objects */
  items: AnyListItem[];
}

/**
 * Response from get_lists endpoint
 */
export interface GetListsResponse {
  /** List names */
  lists: string[];
}

/**
 * Server process configuration
 */
export interface ServerConfig {
  /** Server binary path */
  binary: string;
  /** Server port */
  port: string;
  /** User email */
  email: string;
  /** User password */
  password: string;
  /** Credentials file path */
  credentialsFile: string;
  /** IP filter (default: 127.0.0.1) */
  ipFilter?: string;
}

/**
 * Error types that can occur
 */
export enum AnyListErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  BINARY_ERROR = 'BINARY_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

/**
 * Custom error class for AnyList operations
 */
export class AnyListError extends Error {
  public readonly type: AnyListErrorType;
  public readonly code?: number | undefined;
  public readonly originalError?: Error | undefined;

  constructor(
    message: string, 
    type: AnyListErrorType, 
    code?: number, 
    originalError?: Error
  ) {
    super(message);
    this.name = 'AnyListError';
    this.type = type;
    this.code = code;
    this.originalError = originalError;
  }
}