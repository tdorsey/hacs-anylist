# TypeScript Examples

This document provides practical examples of using the AnyList TypeScript client in various scenarios.

## Basic Examples

### Simple Item Management

```typescript
import { AnyListClient } from '@hacs/anylist';

const client = new AnyListClient({
  serverUrl: 'http://127.0.0.1:1234',
  defaultList: 'Shopping'
});

async function basicUsage() {
  // Add items
  await client.addItem({ name: 'milk' });
  await client.addItem({ name: 'bread', notes: 'Whole wheat' });
  
  // Get current items
  const items = await client.getItems();
  console.log('Current items:', items.items);
  
  // Check off an item
  await client.checkItem({ name: 'milk' });
  
  // Get all items (checked and unchecked)
  const allItems = await client.getAllItems();
  console.log('Unchecked:', allItems.uncheckedItems);
  console.log('Checked:', allItems.checkedItems);
  
  // Remove an item
  await client.removeItem({ name: 'bread' });
}

basicUsage().catch(console.error);
```

### Error Handling

```typescript
import { AnyListClient, AnyListError } from '@hacs/anylist';

const client = new AnyListClient({
  serverUrl: 'http://127.0.0.1:1234'
});

async function robustItemManagement() {
  try {
    await client.addItem({ name: 'eggs', list: 'Shopping' });
    console.log('Item added successfully');
  } catch (error) {
    if (error instanceof AnyListError) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          console.error('Network connection failed. Check server.');
          break;
        case 'ITEM_EXISTS':
          console.warn('Item already exists on the list');
          break;
        case 'LIST_NOT_FOUND':
          console.error('The specified list does not exist');
          break;
        default:
          console.error('AnyList error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

## Advanced Examples

### Batch Operations

```typescript
import { AnyListClient } from '@hacs/anylist';

const client = new AnyListClient({
  serverUrl: 'http://127.0.0.1:1234'
});

async function batchOperations() {
  const groceryItems = [
    { name: 'milk', notes: 'Whole milk' },
    { name: 'bread', notes: 'Sourdough' },
    { name: 'eggs', notes: 'Free range' },
    { name: 'cheese', notes: 'Cheddar' }
  ];

  // Add multiple items with error handling
  const results = await Promise.allSettled(
    groceryItems.map(item => 
      client.addItem({ ...item, list: 'Shopping' })
    )
  );

  // Check results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`✓ Added ${groceryItems[index].name}`);
    } else {
      console.error(`✗ Failed to add ${groceryItems[index].name}:`, result.reason);
    }
  });

  // Batch check items
  const itemsToCheck = ['milk', 'bread'];
  await Promise.all(
    itemsToCheck.map(name => 
      client.checkItem({ name, list: 'Shopping' })
    )
  );

  console.log('Batch operations completed');
}
```

### Multiple Lists Management

```typescript
import { AnyListClient } from '@hacs/anylist';

class MultiListManager {
  private client: AnyListClient;

  constructor(serverUrl: string) {
    this.client = new AnyListClient({ serverUrl });
  }

  async addToGroceryList(items: string[]) {
    const promises = items.map(item => 
      this.client.addItem({ name: item, list: 'Groceries' })
    );
    await Promise.all(promises);
  }

  async addToHardwareList(items: string[]) {
    const promises = items.map(item => 
      this.client.addItem({ name: item, list: 'Hardware Store' })
    );
    await Promise.all(promises);
  }

  async getAllLists() {
    const [groceries, hardware] = await Promise.all([
      this.client.getAllItems({ list: 'Groceries' }),
      this.client.getAllItems({ list: 'Hardware Store' })
    ]);

    return {
      groceries,
      hardware
    };
  }

  async getShoppingSummary() {
    const lists = await this.getAllLists();
    
    return {
      totalItems: lists.groceries.uncheckedItems.length + lists.hardware.uncheckedItems.length,
      completedItems: lists.groceries.checkedItems.length + lists.hardware.checkedItems.length,
      lists: {
        groceries: {
          pending: lists.groceries.uncheckedItems.length,
          completed: lists.groceries.checkedItems.length
        },
        hardware: {
          pending: lists.hardware.uncheckedItems.length,
          completed: lists.hardware.checkedItems.length
        }
      }
    };
  }
}

// Usage
async function useMultiListManager() {
  const manager = new MultiListManager('http://127.0.0.1:1234');

  await manager.addToGroceryList(['milk', 'bread', 'apples']);
  await manager.addToHardwareList(['screws', 'paint', 'brushes']);

  const summary = await manager.getShoppingSummary();
  console.log('Shopping Summary:', summary);
}
```

## Integration Examples

### Express.js API Server

```typescript
import express from 'express';
import { AnyListClient } from '@hacs/anylist';

const app = express();
app.use(express.json());

const client = new AnyListClient({
  serverUrl: process.env.ANYLIST_SERVER_URL || 'http://127.0.0.1:1234',
  defaultList: process.env.DEFAULT_LIST || 'Shopping'
});

// Add item endpoint
app.post('/api/items', async (req, res) => {
  try {
    const { name, notes, list } = req.body;
    await client.addItem({ name, notes, list });
    res.json({ success: true, message: `Added ${name} to list` });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get items endpoint
app.get('/api/items', async (req, res) => {
  try {
    const { list } = req.query;
    const items = await client.getAllItems({ list: list as string });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check item endpoint
app.patch('/api/items/:name/check', async (req, res) => {
  try {
    const { name } = req.params;
    const { list } = req.body;
    await client.checkItem({ name, list });
    res.json({ success: true, message: `Checked ${name}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Uncheck item endpoint
app.patch('/api/items/:name/uncheck', async (req, res) => {
  try {
    const { name } = req.params;
    const { list } = req.body;
    await client.uncheckItem({ name, list });
    res.json({ success: true, message: `Unchecked ${name}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item endpoint
app.delete('/api/items/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { list } = req.body;
    await client.removeItem({ name, list });
    res.json({ success: true, message: `Removed ${name}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('AnyList API server running on port 3000');
});
```

### Discord Bot

```typescript
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { AnyListClient } from '@hacs/anylist';

const discord = new Client({ 
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] 
});

const anylist = new AnyListClient({
  serverUrl: process.env.ANYLIST_SERVER_URL!,
  defaultList: 'Shopping'
});

discord.on('messageCreate', async (message: Message) => {
  if (message.author.bot || !message.content.startsWith('!list')) return;

  const args = message.content.slice(5).trim().split(' ');
  const command = args[0];

  try {
    switch (command) {
      case 'add':
        const itemName = args.slice(1).join(' ');
        if (!itemName) {
          message.reply('Please specify an item to add');
          return;
        }
        await anylist.addItem({ name: itemName });
        message.reply(`✅ Added "${itemName}" to the shopping list`);
        break;

      case 'remove':
        const removeItem = args.slice(1).join(' ');
        if (!removeItem) {
          message.reply('Please specify an item to remove');
          return;
        }
        await anylist.removeItem({ name: removeItem });
        message.reply(`🗑️ Removed "${removeItem}" from the shopping list`);
        break;

      case 'check':
        const checkItem = args.slice(1).join(' ');
        if (!checkItem) {
          message.reply('Please specify an item to check');
          return;
        }
        await anylist.checkItem({ name: checkItem });
        message.reply(`✅ Checked off "${checkItem}"`);
        break;

      case 'show':
        const items = await anylist.getAllItems();
        const unchecked = items.uncheckedItems;
        const checked = items.checkedItems;
        
        let response = '📝 **Shopping List**\n\n';
        
        if (unchecked.length > 0) {
          response += '**To Buy:**\n';
          response += unchecked.map(item => `• ${item}`).join('\n');
        }
        
        if (checked.length > 0) {
          response += '\n\n**Completed:**\n';
          response += checked.map(item => `• ~~${item}~~`).join('\n');
        }
        
        if (unchecked.length === 0 && checked.length === 0) {
          response += 'The list is empty!';
        }
        
        message.reply(response);
        break;

      default:
        message.reply('Available commands: `!list add <item>`, `!list remove <item>`, `!list check <item>`, `!list show`');
    }
  } catch (error) {
    message.reply(`❌ Error: ${error.message}`);
  }
});

discord.login(process.env.DISCORD_TOKEN);
```

### Scheduled Tasks with node-cron

```typescript
import { schedule } from 'node-cron';
import { AnyListClient } from '@hacs/anylist';

const client = new AnyListClient({
  serverUrl: 'http://127.0.0.1:1234'
});

// Weekly grocery planning
schedule('0 9 * * 0', async () => { // Every Sunday at 9 AM
  console.log('Adding weekly staples to grocery list...');
  
  const weeklyItems = ['milk', 'bread', 'eggs', 'bananas'];
  
  for (const item of weeklyItems) {
    try {
      await client.addItem({ name: item, list: 'Groceries' });
      console.log(`Added ${item}`);
    } catch (error) {
      console.error(`Failed to add ${item}:`, error.message);
    }
  }
});

// Monthly household items
schedule('0 10 1 * *', async () => { // First day of month at 10 AM
  console.log('Adding monthly household items...');
  
  const monthlyItems = [
    'laundry detergent',
    'dish soap',
    'paper towels',
    'toilet paper'
  ];
  
  for (const item of monthlyItems) {
    try {
      await client.addItem({ name: item, list: 'Household' });
      console.log(`Added ${item}`);
    } catch (error) {
      console.error(`Failed to add ${item}:`, error.message);
    }
  }
});

// Daily list cleanup (remove completed items older than 7 days)
schedule('0 23 * * *', async () => { // Every day at 11 PM
  console.log('Performing daily list cleanup...');
  
  try {
    const allItems = await client.getAllItems();
    
    // In a real implementation, you'd need to track when items were completed
    // This is a simplified example
    if (allItems.checkedItems.length > 20) {
      for (const item of allItems.checkedItems.slice(0, 10)) {
        await client.removeItem({ name: item });
        console.log(`Cleaned up completed item: ${item}`);
      }
    }
  } catch (error) {
    console.error('Failed to perform cleanup:', error.message);
  }
});

console.log('Scheduled tasks initialized');
```

### React Native Mobile App

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { AnyListClient } from '@hacs/anylist';

const client = new AnyListClient({
  serverUrl: 'http://your-anylist-server.com:1234' // Replace with your server
});

interface Item {
  name: string;
  checked: boolean;
}

export default function ShoppingListApp() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await client.getAllItems();
      
      const allItems: Item[] = [
        ...response.uncheckedItems.map(name => ({ name, checked: false })),
        ...response.checkedItems.map(name => ({ name, checked: true }))
      ];
      
      setItems(allItems);
    } catch (error) {
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    
    try {
      await client.addItem({ name: newItem.trim() });
      setNewItem('');
      loadItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const toggleItem = async (itemName: string, isChecked: boolean) => {
    try {
      if (isChecked) {
        await client.uncheckItem({ name: itemName });
      } else {
        await client.checkItem({ name: itemName });
      }
      loadItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const removeItem = async (itemName: string) => {
    try {
      await client.removeItem({ name: itemName });
      loadItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <TouchableOpacity 
        onPress={() => toggleItem(item.name, item.checked)}
        style={{ marginRight: 10 }}
      >
        <Text style={{ fontSize: 20 }}>
          {item.checked ? '✅' : '⭕'}
        </Text>
      </TouchableOpacity>
      
      <Text style={{ 
        flex: 1, 
        textDecorationLine: item.checked ? 'line-through' : 'none',
        color: item.checked ? '#999' : '#000'
      }}>
        {item.name}
      </Text>
      
      <TouchableOpacity 
        onPress={() => removeItem(item.name)}
        style={{ marginLeft: 10 }}
      >
        <Text style={{ color: 'red', fontSize: 18 }}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Shopping List
      </Text>
      
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <TextInput
          style={{ 
            flex: 1, 
            borderWidth: 1, 
            borderColor: '#ccc', 
            padding: 10, 
            marginRight: 10 
          }}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add new item..."
          onSubmitEditing={addItem}
        />
        <TouchableOpacity 
          onPress={addItem}
          style={{ 
            backgroundColor: '#007AFF', 
            padding: 10, 
            borderRadius: 5 
          }}
        >
          <Text style={{ color: 'white' }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        refreshing={loading}
        onRefresh={loadItems}
      />
    </View>
  );
}
```

## Testing Examples

### Unit Tests with Jest

```typescript
// anylist.test.ts
import { AnyListClient } from '@hacs/anylist';

// Mock the HTTP client
jest.mock('axios');

describe('AnyListClient', () => {
  let client: AnyListClient;

  beforeEach(() => {
    client = new AnyListClient({
      serverUrl: 'http://localhost:1234'
    });
  });

  test('should add item successfully', async () => {
    const mockResponse = { status: 200, data: {} };
    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    await expect(client.addItem({ name: 'milk' })).resolves.not.toThrow();
    
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:1234/add',
      { name: 'milk' }
    );
  });

  test('should handle network errors', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

    await expect(client.addItem({ name: 'milk' }))
      .rejects
      .toThrow('Network Error');
  });

  test('should get items successfully', async () => {
    const mockResponse = {
      status: 200,
      data: { items: ['milk', 'bread'] }
    };
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await client.getItems();
    
    expect(result.items).toEqual(['milk', 'bread']);
    expect(axios.get).toHaveBeenCalledWith('http://localhost:1234/items');
  });
});
```

### Integration Tests

```typescript
// integration.test.ts
import { AnyListClient } from '@hacs/anylist';

describe('AnyList Integration Tests', () => {
  let client: AnyListClient;
  const testItem = `test-item-${Date.now()}`;

  beforeAll(() => {
    client = new AnyListClient({
      serverUrl: process.env.TEST_ANYLIST_URL || 'http://localhost:1234',
      defaultList: 'Test List'
    });
  });

  afterEach(async () => {
    // Cleanup: remove test items
    try {
      await client.removeItem({ name: testItem });
    } catch (error) {
      // Item might not exist, ignore error
    }
  });

  test('full item lifecycle', async () => {
    // Add item
    await client.addItem({ name: testItem, notes: 'Test notes' });

    // Verify item was added
    const items = await client.getItems();
    expect(items.items).toContain(testItem);

    // Check item
    await client.checkItem({ name: testItem });

    // Verify item was checked
    const allItems = await client.getAllItems();
    expect(allItems.checkedItems).toContain(testItem);
    expect(allItems.uncheckedItems).not.toContain(testItem);

    // Uncheck item
    await client.uncheckItem({ name: testItem });

    // Verify item was unchecked
    const updatedItems = await client.getAllItems();
    expect(updatedItems.uncheckedItems).toContain(testItem);
    expect(updatedItems.checkedItems).not.toContain(testItem);

    // Remove item
    await client.removeItem({ name: testItem });

    // Verify item was removed
    const finalItems = await client.getItems();
    expect(finalItems.items).not.toContain(testItem);
  });
});
```

These examples demonstrate the flexibility and power of the TypeScript AnyList client across different platforms and use cases. The type safety and modern JavaScript features make it easy to build robust applications that integrate with AnyList.