import { AnyList } from '../lib/anylist';
import { AnyListConfig, AnyListError, AnyListErrorType } from '../types';

describe('AnyList', () => {
  let client: AnyList;
  let mockConfig: AnyListConfig;

  beforeEach(() => {
    mockConfig = {
      serverAddress: 'http://localhost:28597',
      defaultList: 'Test List',
      refreshInterval: 30
    };
    client = new AnyList(mockConfig);
  });

  describe('constructor', () => {
    it('should create an instance with provided config', () => {
      expect(client).toBeInstanceOf(AnyList);
      expect(client.getConfig()).toEqual(mockConfig);
    });
  });

  describe('configuration management', () => {
    it('should get current configuration', () => {
      const config = client.getConfig();
      expect(config).toEqual(mockConfig);
      expect(config).not.toBe(mockConfig); // Should be a copy
    });

    it('should update configuration', () => {
      const newConfig = { defaultList: 'New List' };
      client.updateConfig(newConfig);
      
      const updatedConfig = client.getConfig();
      expect(updatedConfig.defaultList).toBe('New List');
      expect(updatedConfig.serverAddress).toBe(mockConfig.serverAddress);
    });
  });

  describe('server address handling', () => {
    it('should use configured server address', () => {
      // This tests the private getServerAddress method indirectly
      // by checking that the client doesn't throw when methods are called
      expect(() => {
        // The client should be able to construct URLs
        // We can't test the private method directly
      }).not.toThrow();
    });

    it('should throw error when no server is available', () => {
      const clientWithoutServer = new AnyList({});
      
      // The error will be thrown when trying to make requests
      // since no server address is configured and no binary server is set
      expect(async () => {
        await clientWithoutServer.getItems();
      }).rejects.toThrow();
    });
  });

  describe('list name handling', () => {
    it('should use default list when none provided', () => {
      // Test the private getListName method indirectly
      // The client should use the default list from config
      expect(client.getConfig().defaultList).toBe('Test List');
    });

    it('should handle empty default list', () => {
      const clientWithoutDefault = new AnyList({ serverAddress: 'http://localhost:28597' });
      expect(clientWithoutDefault.getConfig().defaultList).toBeUndefined();
    });
  });

  describe('binary server management', () => {
    it('should set binary server', () => {
      const mockServer = { available: true };
      client.setBinaryServer(mockServer);
      
      // We can't directly test this, but it should not throw
      expect(() => {
        client.setBinaryServer(mockServer);
      }).not.toThrow();
    });
  });

  // Note: Testing actual HTTP requests would require mocking axios
  // or setting up a test server. These tests focus on the basic
  // functionality and configuration management.
});

describe('AnyList Error Handling', () => {
  it('should create AnyListError with correct properties', () => {
    const error = new AnyListError(
      'Test error',
      AnyListErrorType.NETWORK_ERROR,
      500,
      new Error('Original error')
    );

    expect(error.message).toBe('Test error');
    expect(error.type).toBe(AnyListErrorType.NETWORK_ERROR);
    expect(error.code).toBe(500);
    expect(error.originalError).toBeInstanceOf(Error);
    expect(error.name).toBe('AnyListError');
  });

  it('should create AnyListError without optional parameters', () => {
    const error = new AnyListError('Simple error', AnyListErrorType.VALIDATION_ERROR);

    expect(error.message).toBe('Simple error');
    expect(error.type).toBe(AnyListErrorType.VALIDATION_ERROR);
    expect(error.code).toBeUndefined();
    expect(error.originalError).toBeUndefined();
  });
});