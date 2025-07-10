/**
 * Type definitions for HACS Anylist TypeScript Application
 * These types will support the TypeScript conversion of the Python integration
 */

// Anylist Item types
export interface AnylistItem {
  id: string;
  name: string;
  checked: boolean;
  notes?: string;
  category?: string;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Anylist List types
export interface AnylistList {
  id: string;
  name: string;
  items: AnylistItem[];
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface AddItemRequest {
  name: string;
  notes?: string;
  list?: string;
}

export interface RemoveItemRequest {
  name?: string;
  id?: string;
  list?: string;
}

export interface UpdateItemRequest {
  id: string;
  name?: string;
  checked?: boolean;
  notes?: string;
  list?: string;
}

export interface GetItemsRequest {
  list?: string;
}

export interface ItemsResponse {
  code: number;
  items: string[];
}

export interface AllItemsResponse {
  code: number;
  uncheckedItems: string[];
  checkedItems: string[];
}

// Configuration types
export interface AppConfig {
  port: number;
  nodeEnv: string;
  logLevel: string;
  anylist: {
    email: string;
    password: string;
    serverPort: number;
    defaultList: string;
  };
  database?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
}

// Home Assistant Integration types
export interface HomeAssistantConfig {
  url: string;
  token: string;
}

export interface HomeAssistantService {
  name: string;
  domain: string;
  service: string;
  data: Record<string, any>;
}

// Service Response types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code: number;
}

// Error types
export interface AnylistError {
  code: number;
  message: string;
  details?: any;
}

// Logger types
export interface LoggerConfig {
  level: string;
  format: string;
  transports: string[];
}

// API Error Response
export interface ApiErrorResponse {
  error: string;
  message: string;
  code: number;
  timestamp: string;
}