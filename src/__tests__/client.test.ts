/**
 * Tests for AnyList Client
 */

import { AnyListClient } from '../client';

describe('AnyListClient', () => {
  let client: AnyListClient;

  beforeEach(() => {
    client = new AnyListClient({
      serverAddress: 'http://localhost:3000',
      defaultList: 'Test List',
    });
  });

  describe('constructor', () => {
    it('should create a client instance', () => {
      expect(client).toBeInstanceOf(AnyListClient);
    });
  });

  describe('addItem', () => {
    it('should throw not implemented error', async () => {
      await expect(client.addItem({ name: 'Test Item' })).rejects.toThrow('Not implemented yet');
    });
  });

  describe('removeItem', () => {
    it('should throw not implemented error', async () => {
      await expect(client.removeItem('Test Item')).rejects.toThrow('Not implemented yet');
    });
  });

  describe('checkItem', () => {
    it('should throw not implemented error', async () => {
      await expect(client.checkItem('Test Item', true)).rejects.toThrow('Not implemented yet');
    });
  });

  describe('getItems', () => {
    it('should throw not implemented error', async () => {
      await expect(client.getItems()).rejects.toThrow('Not implemented yet');
    });
  });

  describe('getLists', () => {
    it('should throw not implemented error', async () => {
      await expect(client.getLists()).rejects.toThrow('Not implemented yet');
    });
  });
});