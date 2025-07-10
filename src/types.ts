/**
 * Type definitions for the AnyList Home Assistant Integration
 */

// Core types and interfaces that will be used throughout the integration
export interface AnyListConfig {
  serverAddr: string;
  defaultList?: string;
  refreshInterval?: number;
}

export interface AnyListItem {
  id: string;
  name: string;
  notes?: string;
  checked: boolean;
  list: string;
}

export interface AnyListService {
  addItem(name: string, notes?: string, list?: string): Promise<void>;
  removeItem(name: string, list?: string): Promise<void>;
  checkItem(name: string, list?: string): Promise<void>;
  uncheckItem(name: string, list?: string): Promise<void>;
  getItems(list?: string): Promise<AnyListItem[]>;
  getAllItems(list?: string): Promise<{
    uncheckedItems: AnyListItem[];
    checkedItems: AnyListItem[];
  }>;
}

// Configuration types
export interface ServerConfig {
  addr: string;
  email?: string;
  password?: string;
  binary?: string;
}

export interface IntegrationOptions {
  defaultList: string;
  refreshInterval: number;
}

// Service response types
export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ItemResponse {
  items: string[];
}

export interface AllItemsResponse {
  uncheckedItems: string[];
  checkedItems: string[];
}

// Home Assistant specific types
export interface HomeAssistantContext {
  domain: string;
  service: string;
  data: Record<string, unknown>;
}

export interface ConfigFlowResult {
  type: 'form' | 'create_entry' | 'abort';
  step_id?: string;
  data?: Record<string, unknown>;
  errors?: Record<string, string>;
  description_placeholders?: Record<string, string>;
}

// Intent and automation types
export interface IntentRequest {
  text: string;
  language: string;
  context: HomeAssistantContext;
}

export interface IntentResponse {
  speech: {
    plain: {
      speech: string;
    };
  };
  card?: {
    type: string;
    title: string;
    content: string;
  };
}

// TODO entity types for Home Assistant integration
export interface TodoEntity {
  entity_id: string;
  name: string;
  state: 'unknown' | number;
  attributes: {
    items: TodoItem[];
    friendly_name: string;
  };
}

export interface TodoItem {
  uid: string;
  summary: string;
  status: 'needs_action' | 'completed';
  description?: string;
  due?: string;
}
