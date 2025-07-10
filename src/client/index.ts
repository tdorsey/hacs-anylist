/**
 * TypeScript client for Anylist Home Assistant Integration
 * Provides a type-safe interface to interact with the Anylist API
 */

import type {
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
} from '../types/index.js';
import { AnylistError, NetworkError, ConfigurationError } from '../types/index.js';

/**
 * TypeScript client for the Anylist Home Assistant Integration
 * 
 * This client provides a modern, type-safe interface to interact with
 * the Anylist API, supporting both CommonJS and ES modules.
 * 
 * @example
 * ```typescript
 * const client = new AnylistClient({
 *   serverAddr: 'http://127.0.0.1:1234',
 *   defaultList: 'Shopping'
 * });
 * 
 * await client.addItem({ name: 'Milk', notes: 'Organic' });
 * const items = await client.getItems();
 * ```
 */
export class AnylistClient {
  private readonly config: {
    serverAddr: string;
    defaultList?: string;
  };

  constructor(config: AnylistConfig) {
    if (!config.serverAddr) {
      throw new ConfigurationError('serverAddr is required');
    }

    this.config = {
      serverAddr: config.serverAddr,
    };
    
    if (config.defaultList !== undefined) {
      this.config.defaultList = config.defaultList;
    }
  }

  /**
   * Add a new item to a list
   */
  async addItem(params: AddItemParams): Promise<ServiceResponse> {
    const body = {
      name: params.name.trim(),
      list: this.getListName(params.list),
      notes: params.notes || '',
      checked: false,
    };

    const response = await this.makeRequest('add', body);
    return { code: response.status };
  }

  /**
   * Remove an item from a list by name
   */
  async removeItem(params: RemoveItemParams): Promise<ServiceResponse> {
    const body = {
      name: params.name.trim(),
      list: this.getListName(params.list),
    };

    const response = await this.makeRequest('remove', body);
    return { code: response.status };
  }

  /**
   * Check (mark as completed) an item
   */
  async checkItem(params: CheckItemParams): Promise<ServiceResponse> {
    return this.updateItemStatus(params, true);
  }

  /**
   * Uncheck (mark as incomplete) an item
   */
  async uncheckItem(params: CheckItemParams): Promise<ServiceResponse> {
    return this.updateItemStatus(params, false);
  }

  /**
   * Get unchecked items from a list
   */
  async getItems(params: GetItemsParams = {}): Promise<GetItemsResponse> {
    const detailedItems = await this.getDetailedItems(params.list);
    const uncheckedItems = detailedItems
      .filter(item => !item.checked)
      .map(item => item.name);

    return {
      code: 200,
      items: uncheckedItems,
    };
  }

  /**
   * Get all items (both checked and unchecked) from a list
   */
  async getAllItems(params: GetItemsParams = {}): Promise<GetAllItemsResponse> {
    const detailedItems = await this.getDetailedItems(params.list);
    
    const uncheckedItems = detailedItems
      .filter(item => !item.checked)
      .map(item => item.name);
    
    const checkedItems = detailedItems
      .filter(item => item.checked)
      .map(item => item.name);

    return {
      code: 200,
      uncheckedItems,
      checkedItems,
    };
  }

  /**
   * Get all available lists
   */
  async getLists(): Promise<AnylistList[]> {
    const response = await this.makeRequest('lists', undefined, 'GET');
    
    if (!response.ok) {
      throw new NetworkError(
        `Failed to get lists: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json() as { lists: AnylistList[] };
    return data.lists || [];
  }

  /**
   * Get detailed items from a list
   */
  private async getDetailedItems(listName?: string): Promise<AnylistItem[]> {
    const params = listName ? { list: this.getListName(listName) } : undefined;
    const url = new URL(this.getServerUrl('items'));
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new NetworkError(
        `Failed to get items: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json() as { items: AnylistItem[] };
    return data.items || [];
  }

  /**
   * Update the checked status of an item
   */
  private async updateItemStatus(
    params: CheckItemParams, 
    checked: boolean
  ): Promise<ServiceResponse> {
    const body = {
      name: params.name.trim(),
      list: this.getListName(params.list),
      checked,
    };

    const response = await this.makeRequest('check', body);
    return { code: response.status };
  }

  /**
   * Make an HTTP request to the Anylist server
   */
  private async makeRequest(
    endpoint: string,
    body?: Record<string, unknown>,
    method: string = 'POST'
  ): Promise<Response> {
    const url = this.getServerUrl(endpoint);
    
    try {
      const requestInit: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        requestInit.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestInit);

      if (!response.ok && response.status !== 304) {
        throw new NetworkError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return response;
    } catch (error) {
      if (error instanceof NetworkError) {
        throw error;
      }
      throw new AnylistError(
        `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        error
      );
    }
  }

  /**
   * Get the full server URL for an endpoint
   */
  private getServerUrl(endpoint: string): string {
    const baseUrl = this.config.serverAddr.replace(/\/$/, '');
    return `${baseUrl}/${endpoint}`;
  }

  /**
   * Get the list name to use, falling back to default if not specified
   */
  private getListName(listName?: string): string {
    return listName || this.config.defaultList || '';
  }
}

/**
 * Factory function to create an AnylistClient instance
 */
export function createAnylistClient(config: AnylistConfig): AnylistClient {
  return new AnylistClient(config);
}