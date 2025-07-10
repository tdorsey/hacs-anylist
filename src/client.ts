/**
 * AnyList Client
 * 
 * Main client class for interacting with AnyList services
 */

import axios, { AxiosInstance } from 'axios';
import { AnyListConfig, AnyListItem, AnyListResponse, ItemsResponse, ListsResponse } from './types';

export class AnyListClient {
  private httpClient: AxiosInstance;
  private config: AnyListConfig;

  constructor(config: AnyListConfig) {
    this.config = config;
    this.httpClient = axios.create({
      baseURL: config.serverAddress,
      timeout: 10000,
    });
  }

  /**
   * Add an item to a list
   */
  async addItem(_item: Omit<AnyListItem, 'id' | 'checked'>, _listName?: string): Promise<AnyListResponse> {
    // Implementation will be added during TypeScript conversion
    throw new Error('Not implemented yet - placeholder for TypeScript conversion');
  }

  /**
   * Remove an item from a list
   */
  async removeItem(_itemName: string, _listName?: string): Promise<AnyListResponse> {
    // Implementation will be added during TypeScript conversion
    throw new Error('Not implemented yet - placeholder for TypeScript conversion');
  }

  /**
   * Check/uncheck an item
   */
  async checkItem(_itemName: string, _checked: boolean, _listName?: string): Promise<AnyListResponse> {
    // Implementation will be added during TypeScript conversion
    throw new Error('Not implemented yet - placeholder for TypeScript conversion');
  }

  /**
   * Get all items from a list
   */
  async getItems(_listName?: string): Promise<AnyListResponse<ItemsResponse>> {
    // Implementation will be added during TypeScript conversion
    throw new Error('Not implemented yet - placeholder for TypeScript conversion');
  }

  /**
   * Get all lists
   */
  async getLists(): Promise<AnyListResponse<ListsResponse>> {
    // Implementation will be added during TypeScript conversion
    throw new Error('Not implemented yet - placeholder for TypeScript conversion');
  }

  private getListName(listName?: string): string {
    return listName || this.config.defaultList || '';
  }
}