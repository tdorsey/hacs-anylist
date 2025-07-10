/**
 * Service layer for AnyList operations
 * 
 * This module provides service functions that wrap the client operations
 * for use in Home Assistant and other integrations.
 */

import { AnyListClient } from './client';
import { ServiceCallData, AnyListResponse } from './types';

export class AnyListService {
  private client: AnyListClient;

  constructor(client: AnyListClient) {
    this.client = client;
  }

  /**
   * Service call to add an item
   */
  async addItemService(data: ServiceCallData): Promise<AnyListResponse> {
    if (!data.name) {
      return { code: 400, error: 'Item name is required' };
    }

    return this.client.addItem(
      {
        name: data.name,
        notes: data.notes || '',
      },
      data.list
    );
  }

  /**
   * Service call to remove an item
   */
  async removeItemService(data: ServiceCallData): Promise<AnyListResponse> {
    if (!data.name) {
      return { code: 400, error: 'Item name is required' };
    }

    return this.client.removeItem(data.name, data.list);
  }

  /**
   * Service call to check an item
   */
  async checkItemService(data: ServiceCallData): Promise<AnyListResponse> {
    if (!data.name) {
      return { code: 400, error: 'Item name is required' };
    }

    return this.client.checkItem(data.name, data.checked ?? true, data.list);
  }

  /**
   * Service call to uncheck an item
   */
  async uncheckItemService(data: ServiceCallData): Promise<AnyListResponse> {
    if (!data.name) {
      return { code: 400, error: 'Item name is required' };
    }

    return this.client.checkItem(data.name, false, data.list);
  }

  /**
   * Service call to get items
   */
  async getItemsService(data: ServiceCallData): Promise<AnyListResponse> {
    return this.client.getItems(data.list);
  }

  /**
   * Service call to get all items (checked and unchecked)
   */
  async getAllItemsService(data: ServiceCallData): Promise<AnyListResponse> {
    // This will need to be implemented to return both checked and unchecked items
    const response = await this.client.getItems(data.list);
    
    if (response.code === 200 && response.data) {
      // Transform the response to match the expected format
      const items = response.data.items;
      const uncheckedItems = items.filter(item => !item.checked).map(item => item.name);
      const checkedItems = items.filter(item => item.checked).map(item => item.name);
      
      return {
        code: 200,
        data: {
          uncheckedItems,
          checkedItems,
        },
      };
    }

    return response;
  }
}