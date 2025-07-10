import { AnyListClient, AnyListConfig } from '../index';

describe('AnyListClient', () => {
  const testConfig: AnyListConfig = {
    serverUrl: 'http://localhost:1234',
    timeout: 5000
  };

  let client: AnyListClient;

  beforeEach(() => {
    client = new AnyListClient(testConfig);
  });

  it('should create an instance with config', () => {
    expect(client).toBeInstanceOf(AnyListClient);
  });

  it('should throw not implemented error for addItem', async () => {
    await expect(client.addItem({ name: 'test' })).rejects.toThrow('Not implemented yet');
  });

  it('should throw not implemented error for removeItem', async () => {
    await expect(client.removeItem('test')).rejects.toThrow('Not implemented yet');
  });

  it('should throw not implemented error for getItems', async () => {
    await expect(client.getItems()).rejects.toThrow('Not implemented yet');
  });
});