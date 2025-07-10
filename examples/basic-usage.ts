/**
 * Example usage of the Anylist TypeScript SDK
 * 
 * This demonstrates how to use the TypeScript client to interact
 * with the Anylist Home Assistant Integration.
 */

import { AnylistClient, createAnylistClient, validateConfig } from '../src/index.js';
import type { AnylistConfig } from '../src/index.js';

async function demonstrateBasicUsage() {
  // Configure the client
  const config: AnylistConfig = {
    serverAddr: 'http://127.0.0.1:28597',
    defaultList: 'Shopping',
  };

  // Validate configuration
  validateConfig(config);

  // Create client instance
  const client = createAnylistClient(config);

  try {
    // Add items to the list
    console.log('Adding items...');
    await client.addItem({ 
      name: 'Milk', 
      notes: 'Organic whole milk' 
    });
    
    await client.addItem({ 
      name: 'Bread',
      notes: 'Whole grain'
    });

    await client.addItem({ 
      name: 'Eggs',
      list: 'Shopping' // Explicit list name
    });

    // Get all items
    console.log('Getting items...');
    const items = await client.getItems();
    console.log('Unchecked items:', items.items);

    // Check an item
    console.log('Checking milk...');
    await client.checkItem({ name: 'Milk' });

    // Get all items (checked and unchecked)
    const allItems = await client.getAllItems();
    console.log('All items:', {
      unchecked: allItems.uncheckedItems,
      checked: allItems.checkedItems,
    });

    // Get available lists
    const lists = await client.getLists();
    console.log('Available lists:', lists.map(list => list.name));

  } catch (error) {
    console.error('Error:', error);
  }
}

async function demonstrateErrorHandling() {
  try {
    // This should throw a configuration error
    const invalidClient = new AnylistClient({
      serverAddr: '', // Invalid empty server address
    });
  } catch (error) {
    console.log('Caught configuration error:', error.message);
  }

  try {
    // This should throw a network error
    const client = createAnylistClient({
      serverAddr: 'http://invalid-server:9999',
    });
    
    await client.getItems();
  } catch (error) {
    console.log('Caught network error:', error.message);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('=== Basic Usage Example ===');
  await demonstrateBasicUsage();
  
  console.log('\n=== Error Handling Example ===');
  await demonstrateErrorHandling();
}