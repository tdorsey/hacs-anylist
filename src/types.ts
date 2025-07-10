/**
 * Type definitions for AnyList integration
 */

export interface AnyListItem {
  id?: string;
  name: string;
  notes?: string;
  checked: boolean;
}

export interface AnyListList {
  id?: string;
  name: string;
}

export interface AnyListConfig {
  serverAddress: string;
  email?: string;
  password?: string;
  defaultList?: string;
}

export interface AnyListResponse<T = unknown> {
  code: number;
  data?: T;
  error?: string;
}

export interface ItemsResponse {
  items: AnyListItem[];
}

export interface ListsResponse {
  lists: AnyListList[];
}

export interface ServiceCallData {
  name?: string;
  notes?: string;
  list?: string;
  checked?: boolean;
}