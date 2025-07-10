/**
 * Main entry point for the HACS AnyList TypeScript library
 */

export interface AnyListConfig {
  serverUrl: string;
  timeout?: number;
}

export interface AnyListItem {
  name: string;
  notes?: string;
  list?: string;
  checked?: boolean;
}

export interface AnyListResponse {
  items?: string[];
  uncheckedItems?: string[];
  checkedItems?: string[];
}

/**
 * AnyList client for Home Assistant integration
 */
export class AnyListClient {
  private config: AnyListConfig;

  constructor(config: AnyListConfig) {
    this.config = config;
  }

  /**
   * Add an item to a list
   */
  async addItem(item: AnyListItem): Promise<void> {
    // Implementation will be added during conversion
    throw new Error('Not implemented yet - this is infrastructure setup');
  }

  /**
   * Remove an item from a list
   */
  async removeItem(name: string, list?: string): Promise<void> {
    // Implementation will be added during conversion
    throw new Error('Not implemented yet - this is infrastructure setup');
  }

  /**
   * Get items from a list
   */
  async getItems(list?: string): Promise<AnyListResponse> {
    // Implementation will be added during conversion
    throw new Error('Not implemented yet - this is infrastructure setup');
  }
}

export default AnyListClient;