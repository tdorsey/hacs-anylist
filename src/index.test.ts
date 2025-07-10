import { AnylistClient, AnylistConfig, AnylistItem } from './index';

describe('AnylistClient', () => {
  const mockConfig: AnylistConfig = {
    serverUrl: 'http://localhost:1234',
    timeout: 5000,
  };

  let client: AnylistClient;

  beforeEach(() => {
    client = new AnylistClient(mockConfig);
  });

  describe('constructor', () => {
    it('should create a client with valid config', () => {
      expect(client).toBeInstanceOf(AnylistClient);
    });

    it('should store the server URL', () => {
      expect(client.getServerUrl()).toBe(mockConfig.serverUrl);
    });
  });

  describe('addItem', () => {
    it('should add an item to a list', async () => {
      const item: AnylistItem = {
        name: 'Test Item',
        notes: 'Test Notes',
        checked: false,
      };

      // Mock console.log to verify it's called
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await client.addItem('Shopping', item);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Adding item Test Item to list Shopping'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('removeItem', () => {
    it('should remove an item from a list', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await client.removeItem('Shopping', 'Test Item');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Removing item Test Item from list Shopping'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getItems', () => {
    it('should return empty array initially', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const items = await client.getItems('Shopping');

      expect(items).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Getting items from list Shopping'
      );

      consoleSpy.mockRestore();
    });
  });
});
