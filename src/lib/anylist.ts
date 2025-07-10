import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AnyListConfig,
  AnyListItem,
  AddItemRequest,
  RemoveItemByNameRequest,
  RemoveItemByIdRequest,
  UpdateItemRequest,
  CheckItemRequest,
  GetDetailedItemsResponse,
  GetListsResponse,
  AnyListError,
  AnyListErrorType
} from '../types';

/**
 * Main AnyList client class for interacting with AnyList server
 * 
 * Provides methods for managing lists, items, authentication, and credentials.
 * Converted from Python Home Assistant integration to TypeScript.
 */
export class AnyList {
  private config: AnyListConfig;
  private httpClient: AxiosInstance;
  private binaryServer?: any; // Will be typed when AnyListServer is implemented

  /**
   * Creates a new AnyList client instance
   * 
   * @param config - Configuration options for the client
   */
  constructor(config: AnyListConfig) {
    this.config = config;
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Populates item updates from provided data
   * 
   * @param item - Target item object to update
   * @param updates - Updates to apply
   */
  private populateItemUpdates(
    item: Record<string, unknown>, 
    updates?: Record<string, unknown>
  ): void {
    if (!updates) {
      return;
    }

    if ('name' in updates && typeof updates['name'] === 'string') {
      item['name'] = updates['name'].trim();
    }

    if ('checked' in updates && typeof updates['checked'] === 'boolean') {
      item['checked'] = updates['checked'];
    }

    if ('notes' in updates && typeof updates['notes'] === 'string') {
      item['notes'] = updates['notes'];
    }
  }

  /**
   * Adds an item to a list
   * 
   * @param itemName - Name of the item to add
   * @param updates - Optional additional item properties
   * @param listName - Name of the list (uses default if not provided)
   * @returns Promise resolving to the HTTP status code
   */
  public async addItem(
    itemName: string, 
    updates?: Record<string, unknown>, 
    listName?: string
  ): Promise<number> {
    try {
      const body = {
        name: itemName.trim(),
        list: this.getListName(listName),
        checked: false
      } as Record<string, unknown>;

      this.populateItemUpdates(body, updates);

      const response: AxiosResponse = await this.httpClient.post(
        this.getServerUrl('add'), 
        body as unknown as AddItemRequest
      );

      const code = response.status;
      if (code !== 200 && code !== 304) {
        throw new AnyListError(
          `Failed to add item. Received error code ${code}`,
          AnyListErrorType.SERVER_ERROR,
          code
        );
      }

      return code;
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      throw new AnyListError(
        'Network error while adding item',
        AnyListErrorType.NETWORK_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Removes an item from a list by name
   * 
   * @param itemName - Name of the item to remove
   * @param listName - Name of the list (uses default if not provided)
   * @returns Promise resolving to the HTTP status code
   */
  public async removeItemByName(itemName: string, listName?: string): Promise<number> {
    try {
      const body: RemoveItemByNameRequest = {
        name: itemName.trim(),
        list: this.getListName(listName)
      };

      const response: AxiosResponse = await this.httpClient.post(
        this.getServerUrl('remove'), 
        body
      );

      const code = response.status;
      if (code !== 200 && code !== 304) {
        throw new AnyListError(
          `Failed to remove item. Received error code ${code}`,
          AnyListErrorType.SERVER_ERROR,
          code
        );
      }

      return code;
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      throw new AnyListError(
        'Network error while removing item',
        AnyListErrorType.NETWORK_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Removes an item from a list by ID
   * 
   * @param itemId - ID of the item to remove
   * @param listName - Name of the list (uses default if not provided)
   * @returns Promise resolving to the HTTP status code
   */
  public async removeItemById(itemId: string, listName?: string): Promise<number> {
    try {
      const body: RemoveItemByIdRequest = {
        id: itemId,
        list: this.getListName(listName)
      };

      const response: AxiosResponse = await this.httpClient.post(
        this.getServerUrl('remove'), 
        body
      );

      const code = response.status;
      if (code !== 200 && code !== 304) {
        throw new AnyListError(
          `Failed to remove item. Received error code ${code}`,
          AnyListErrorType.SERVER_ERROR,
          code
        );
      }

      return code;
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      throw new AnyListError(
        'Network error while removing item',
        AnyListErrorType.NETWORK_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Updates an existing item
   * 
   * @param itemId - ID of the item to update
   * @param updates - Updates to apply to the item
   * @param listName - Name of the list (uses default if not provided)
   * @returns Promise resolving to the HTTP status code
   */
  public async updateItem(
    itemId: string, 
    updates: Record<string, unknown>, 
    listName?: string
  ): Promise<number> {
    try {
      const body = {
        id: itemId,
        list: this.getListName(listName)
      } as Record<string, unknown>;

      this.populateItemUpdates(body, updates);

      const response: AxiosResponse = await this.httpClient.post(
        this.getServerUrl('update'), 
        body as unknown as UpdateItemRequest
      );

      const code = response.status;
      if (code !== 200) {
        throw new AnyListError(
          `Failed to update item. Received error code ${code}`,
          AnyListErrorType.SERVER_ERROR,
          code
        );
      }

      return code;
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      throw new AnyListError(
        'Network error while updating item',
        AnyListErrorType.NETWORK_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Checks or unchecks an item
   * 
   * @param itemName - Name of the item
   * @param listName - Name of the list (uses default if not provided)
   * @param checked - Whether to check (true) or uncheck (false) the item
   * @returns Promise resolving to the HTTP status code
   */
  public async checkItem(
    itemName: string, 
    listName?: string, 
    checked: boolean = true
  ): Promise<number> {
    try {
      const body: CheckItemRequest = {
        name: itemName.trim(),
        list: this.getListName(listName),
        checked
      };

      const response: AxiosResponse = await this.httpClient.post(
        this.getServerUrl('check'), 
        body
      );

      const code = response.status;
      if (code !== 200 && code !== 304) {
        throw new AnyListError(
          `Failed to update item status. Received error code ${code}`,
          AnyListErrorType.SERVER_ERROR,
          code
        );
      }

      return code;
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      throw new AnyListError(
        'Network error while checking item',
        AnyListErrorType.NETWORK_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Gets detailed items from a list
   * 
   * @param listName - Name of the list (uses default if not provided)
   * @returns Promise resolving to [status_code, items_array]
   */
  public async getDetailedItems(listName?: string): Promise<[number, AnyListItem[]]> {
    try {
      const params = this.getListName(listName) 
        ? { list: this.getListName(listName) } 
        : undefined;

      const response: AxiosResponse<GetDetailedItemsResponse> = await this.httpClient.get(
        this.getServerUrl('items'), 
        { params }
      );

      const code = response.status;
      if (code === 200) {
        return [code, response.data.items || []];
      } else {
        throw new AnyListError(
          `Failed to get items. Received error code ${code}`,
          AnyListErrorType.SERVER_ERROR,
          code
        );
      }
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      const axiosError = error as any;
      return [axiosError.response?.status || 500, []];
    }
  }

  /**
   * Gets unchecked items from a list
   * 
   * @param listName - Name of the list (uses default if not provided)
   * @returns Promise resolving to [status_code, item_names_array]
   */
  public async getItems(listName?: string): Promise<[number, string[]]> {
    const [code, items] = await this.getDetailedItems(listName);
    if (code === 200) {
      const uncheckedItems = items
        .filter(item => !item.checked)
        .map(item => item.name);
      return [code, uncheckedItems];
    } else {
      return [code, []];
    }
  }

  /**
   * Gets all items (both checked and unchecked) from a list
   * 
   * @param listName - Name of the list (uses default if not provided)
   * @returns Promise resolving to [status_code, [unchecked_items, checked_items]]
   */
  public async getAllItems(listName?: string): Promise<[number, [string[], string[]]]> {
    const [code, items] = await this.getDetailedItems(listName);
    if (code === 200) {
      const uncheckedItems = items
        .filter(item => !item.checked)
        .map(item => item.name);
      
      const checkedItems = items
        .filter(item => item.checked)
        .map(item => item.name);

      return [code, [uncheckedItems, checkedItems]];
    } else {
      return [code, [[], []]];
    }
  }

  /**
   * Gets all available lists
   * 
   * @returns Promise resolving to [status_code, lists_array]
   */
  public async getLists(): Promise<[number, string[]]> {
    try {
      const response: AxiosResponse<GetListsResponse> = await this.httpClient.get(
        this.getServerUrl('lists')
      );

      const code = response.status;
      if (code === 200) {
        return [code, response.data.lists || []];
      } else {
        throw new AnyListError(
          `Failed to get lists. Received error code ${code}`,
          AnyListErrorType.SERVER_ERROR,
          code
        );
      }
    } catch (error) {
      if (error instanceof AnyListError) {
        throw error;
      }
      const axiosError = error as any;
      return [axiosError.response?.status || 500, []];
    }
  }

  /**
   * Gets the server address from configuration or binary server
   * 
   * @returns Server address URL
   * @throws AnyListError if no server is available
   */
  private getServerAddress(): string {
    if (this.config.serverAddress) {
      return this.config.serverAddress;
    }

    if (this.binaryServer?.available) {
      return `http://127.0.0.1:28597`;
    }

    throw new AnyListError(
      'Binary server is not running',
      AnyListErrorType.SERVER_ERROR
    );
  }

  /**
   * Constructs a full server URL for an endpoint
   * 
   * @param endpoint - API endpoint name
   * @returns Full URL to the endpoint
   */
  private getServerUrl(endpoint: string): string {
    const address = this.getServerAddress();
    return `${address}/${endpoint}`;
  }

  /**
   * Gets the list name, using default if none provided
   * 
   * @param listName - Optional list name
   * @returns List name to use
   */
  private getListName(listName?: string): string {
    return listName || this.config.defaultList || '';
  }

  /**
   * Sets the binary server instance
   * 
   * @param server - AnyListServer instance
   */
  public setBinaryServer(server: any): void {
    this.binaryServer = server;
  }

  /**
   * Gets the current configuration
   * 
   * @returns Current configuration object
   */
  public getConfig(): AnyListConfig {
    return { ...this.config };
  }

  /**
   * Updates the configuration
   * 
   * @param newConfig - New configuration to merge with existing
   */
  public updateConfig(newConfig: Partial<AnyListConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}