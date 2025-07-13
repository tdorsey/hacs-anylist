# TypeScript Usage and Migration Guide

This document provides comprehensive information about using the AnyList integration with TypeScript and the migration from the Python-based Home Assistant custom component.

## Table of Contents

1. [Overview](#overview)
2. [TypeScript API Usage](#typescript-api-usage)
3. [Installation](#installation)
4. [Migration from Python](#migration-from-python)
5. [API Reference](#api-reference)
6. [Examples](#examples)
7. [Development](#development)

## Overview

The AnyList integration is being converted from a Python-based Home Assistant custom component to a TypeScript/Node.js library that can be used in various JavaScript and TypeScript applications. This conversion provides:

- **Better Type Safety**: Full TypeScript support with comprehensive type definitions
- **Modern JavaScript**: ES6+ features and async/await patterns
- **Node.js Ecosystem**: Access to the rich npm ecosystem
- **Cross-Platform**: Works in Node.js, browsers (with appropriate bundling), and other JavaScript runtimes

> **Note**: This TypeScript version is currently in development. The Python-based Home Assistant integration remains the primary version until the TypeScript conversion is complete. See [Issue #1](https://github.com/tdorsey/hacs-anylist/issues/1) for conversion progress.

## TypeScript API Usage

### Basic Usage

```typescript
import { AnyListClient } from '@hacs/anylist';

// Create a client instance
const client = new AnyListClient({
  serverUrl: 'http://127.0.0.1:1234',
  timeout: 30000
});

// Add an item to a list
await client.addItem({
  name: 'milk',
  notes: 'Skim milk',
  list: 'Shopping'
});

// Get all items from a list
const items = await client.getItems({ list: 'Shopping' });
console.log('Shopping list items:', items);
```

### TypeScript Configuration

Ensure your `tsconfig.json` includes the following configuration:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  }
}
```

## Installation

### npm

```bash
npm install @hacs/anylist
```

### yarn

```bash
yarn add @hacs/anylist
```

### pnpm

```bash
pnpm add @hacs/anylist
```

## Migration from Python

### Python to TypeScript Equivalents

| Python (Home Assistant) | TypeScript/Node.js |
|-------------------------|---------------------|
| `service: anylist.add_item` | `client.addItem()` |
| `service: anylist.remove_item` | `client.removeItem()` |
| `service: anylist.check_item` | `client.checkItem()` |
| `service: anylist.uncheck_item` | `client.uncheckItem()` |
| `service: anylist.get_items` | `client.getItems()` |
| `service: anylist.get_all_items` | `client.getAllItems()` |

### Migration Steps

1. **Install the TypeScript package** in your Node.js project
2. **Replace Home Assistant service calls** with direct API calls
3. **Update configuration** to use direct server connection instead of Home Assistant
4. **Add proper error handling** using try/catch blocks with async/await
5. **Leverage TypeScript types** for better development experience

### Example Migration

**Before (Python/Home Assistant):**
```yaml
# automation.yaml
- service: anylist.add_item
  data:
    name: milk
    notes: Skim milk
    list: Shopping
```

**After (TypeScript/Node.js):**
```typescript
try {
  await client.addItem({
    name: 'milk',
    notes: 'Skim milk',
    list: 'Shopping'
  });
} catch (error) {
  console.error('Failed to add item:', error);
}
```

## API Reference

### AnyListClient

The main client class for interacting with the AnyList API.

#### Constructor

```typescript
constructor(options: AnyListOptions)
```

#### Options

```typescript
interface AnyListOptions {
  serverUrl: string;          // URL of the AnyList server
  timeout?: number;           // Request timeout in milliseconds (default: 30000)
  defaultList?: string;       // Default list name for operations
  retries?: number;           // Number of retry attempts (default: 3)
}
```

#### Methods

##### `addItem(item: AddItemRequest): Promise<void>`

Adds an item to a list.

```typescript
interface AddItemRequest {
  name: string;               // Item name
  notes?: string;             // Optional notes
  list?: string;              // List name (uses default if not specified)
}
```

##### `removeItem(item: RemoveItemRequest): Promise<void>`

Removes an item from a list.

```typescript
interface RemoveItemRequest {
  name: string;               // Item name
  list?: string;              // List name (uses default if not specified)
}
```

##### `checkItem(item: CheckItemRequest): Promise<void>`

Marks an item as checked (completed).

```typescript
interface CheckItemRequest {
  name: string;               // Item name
  list?: string;              // List name (uses default if not specified)
}
```

##### `uncheckItem(item: UncheckItemRequest): Promise<void>`

Marks an item as unchecked (incomplete).

```typescript
interface UncheckItemRequest {
  name: string;               // Item name
  list?: string;              // List name (uses default if not specified)
}
```

##### `getItems(options?: GetItemsRequest): Promise<GetItemsResponse>`

Gets unchecked items from a list.

```typescript
interface GetItemsRequest {
  list?: string;              // List name (uses default if not specified)
}

interface GetItemsResponse {
  items: string[];            // Array of unchecked item names
}
```

##### `getAllItems(options?: GetAllItemsRequest): Promise<GetAllItemsResponse>`

Gets all items (checked and unchecked) from a list.

```typescript
interface GetAllItemsRequest {
  list?: string;              // List name (uses default if not specified)
}

interface GetAllItemsResponse {
  uncheckedItems: string[];   // Array of unchecked item names
  checkedItems: string[];     // Array of checked item names
}
```

## Examples

### Home Automation with TypeScript

```typescript
import { AnyListClient } from '@hacs/anylist';
import { schedule } from 'node-cron';

const client = new AnyListClient({
  serverUrl: process.env.ANYLIST_SERVER_URL || 'http://127.0.0.1:1234',
  defaultList: 'Shopping'
});

// Add weekly recurring items
schedule('0 9 * * 1', async () => {
  const weeklyItems = ['milk', 'bread', 'eggs'];
  
  for (const item of weeklyItems) {
    try {
      await client.addItem({ name: item });
      console.log(`Added ${item} to shopping list`);
    } catch (error) {
      console.error(`Failed to add ${item}:`, error);
    }
  }
});

// Voice assistant integration
async function handleVoiceCommand(command: string, item: string) {
  try {
    switch (command) {
      case 'add':
        await client.addItem({ name: item });
        return `Added ${item} to your list`;
      
      case 'remove':
        await client.removeItem({ name: item });
        return `Removed ${item} from your list`;
      
      case 'check':
        await client.checkItem({ name: item });
        return `Marked ${item} as completed`;
      
      default:
        return 'Unknown command';
    }
  } catch (error) {
    return `Failed to ${command} ${item}: ${error.message}`;
  }
}
```

### React Integration

```typescript
import React, { useState, useEffect } from 'react';
import { AnyListClient } from '@hacs/anylist';

const client = new AnyListClient({
  serverUrl: process.env.REACT_APP_ANYLIST_SERVER_URL!
});

interface ShoppingListProps {
  listName?: string;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ listName = 'Shopping' }) => {
  const [items, setItems] = useState<{ unchecked: string[]; checked: string[] }>({
    unchecked: [],
    checked: []
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadItems();
  }, [listName]);

  const loadItems = async () => {
    try {
      const response = await client.getAllItems({ list: listName });
      setItems({
        unchecked: response.uncheckedItems,
        checked: response.checkedItems
      });
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    
    try {
      await client.addItem({ name: newItem, list: listName });
      setNewItem('');
      loadItems();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const toggleItem = async (itemName: string, isChecked: boolean) => {
    try {
      if (isChecked) {
        await client.uncheckItem({ name: itemName, list: listName });
      } else {
        await client.checkItem({ name: itemName, list: listName });
      }
      loadItems();
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  return (
    <div>
      <h2>{listName}</h2>
      
      <div>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item..."
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>

      <div>
        <h3>To Do</h3>
        {items.unchecked.map(item => (
          <div key={item}>
            <input
              type="checkbox"
              onChange={() => toggleItem(item, false)}
            />
            {item}
          </div>
        ))}
      </div>

      <div>
        <h3>Completed</h3>
        {items.checked.map(item => (
          <div key={item}>
            <input
              type="checkbox"
              checked
              onChange={() => toggleItem(item, true)}
            />
            <s>{item}</s>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/tdorsey/hacs-anylist.git
cd hacs-anylist

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Project Structure

```
src/
├── client.ts           # Main AnyListClient class
├── types.ts           # TypeScript type definitions
├── errors.ts          # Custom error classes
└── utils.ts           # Utility functions

dist/                  # Compiled JavaScript output
├── commonjs/          # CommonJS build
├── esm/              # ES modules build
└── types/            # Type definitions

docs/                 # Documentation
└── typescript.md    # This file

tests/               # Test files
├── unit/           # Unit tests
└── integration/    # Integration tests
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add my feature'`
7. Push to the branch: `git push origin feature/my-feature`
8. Create a Pull Request

For questions or issues, please refer to [Issue #1](https://github.com/tdorsey/hacs-anylist/issues/1) or create a new issue.