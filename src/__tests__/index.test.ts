import { AnylistIntegration, AnylistConfig } from '../index';

describe('AnylistIntegration', () => {
  let integration: AnylistIntegration;
  const mockConfig: AnylistConfig = {
    serverAddress: 'http://localhost:28597',
    defaultList: 'Shopping',
  };

  beforeEach(() => {
    integration = new AnylistIntegration(mockConfig);
  });

  describe('getServerUrl', () => {
    it('should return correct server URL with endpoint', () => {
      const url = integration.getServerUrl('add');
      expect(url).toBe('http://localhost:28597/add');
    });

    it('should use default server address when not configured', () => {
      const integrationWithoutAddress = new AnylistIntegration({});
      const url = integrationWithoutAddress.getServerUrl('items');
      expect(url).toBe('http://127.0.0.1:28597/items');
    });
  });

  describe('getListName', () => {
    it('should return provided list name', () => {
      const listName = integration.getListName('Custom List');
      expect(listName).toBe('Custom List');
    });

    it('should return default list name when none provided', () => {
      const listName = integration.getListName();
      expect(listName).toBe('Shopping');
    });

    it('should return empty string when no default and none provided', () => {
      const integrationWithoutDefault = new AnylistIntegration({});
      const listName = integrationWithoutDefault.getListName();
      expect(listName).toBe('');
    });
  });

  describe('addItem', () => {
    it('should return success code', async () => {
      const result = await integration.addItem('Test Item');
      expect(result).toBe(200);
    });
  });

  describe('removeItem', () => {
    it('should return success code', async () => {
      const result = await integration.removeItem('Test Item');
      expect(result).toBe(200);
    });
  });

  describe('getItems', () => {
    it('should return empty items array', async () => {
      const result = await integration.getItems();
      expect(result.code).toBe(200);
      expect(result.items).toEqual([]);
    });
  });
});