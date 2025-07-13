# Migration Guide: Python to TypeScript

This guide helps users migrate from the Python-based Home Assistant integration to the new TypeScript/Node.js library.

## Overview

The AnyList integration is being modernized from a Python-based Home Assistant custom component to a TypeScript/Node.js library. This change provides:

- Better type safety with full TypeScript support
- Modern JavaScript features and patterns
- Cross-platform compatibility (Node.js, browsers, etc.)
- Direct API access without Home Assistant dependency
- Rich npm ecosystem integration

## Migration Scenarios

### 1. Home Assistant Users (Staying with Home Assistant)

If you want to continue using Home Assistant, **no immediate action is required**. The Python integration will continue to work. However, consider the benefits of the TypeScript version:

- Better performance
- More reliable error handling
- Enhanced automation capabilities

### 2. Node.js/JavaScript Developers

If you're building applications outside of Home Assistant, the TypeScript version provides a direct API client.

### 3. Hybrid Approach

You can use both integrations simultaneously during the transition period.

## Step-by-Step Migration

### Step 1: Install TypeScript Version

```bash
# Install the TypeScript package
npm install @hacs/anylist

# Or with yarn
yarn add @hacs/anylist

# Or with pnpm
pnpm add @hacs/anylist
```

### Step 2: Update Configuration

**Before (Home Assistant configuration.yaml):**
```yaml
# configuration.yaml
anylist:
  server_address: "http://127.0.0.1:1234"
  default_list: "Shopping"
```

**After (TypeScript configuration):**
```typescript
// config.ts
import { AnyListClient } from '@hacs/anylist';

export const client = new AnyListClient({
  serverUrl: 'http://127.0.0.1:1234',
  defaultList: 'Shopping',
  timeout: 30000
});
```

### Step 3: Convert Service Calls to API Calls

#### Adding Items

**Before (Home Assistant automation):**
```yaml
# automations.yaml
- alias: "Add weekly groceries"
  trigger:
    platform: time
    at: "09:00:00"
  condition:
    condition: time
    weekday:
      - mon
  action:
    - service: anylist.add_item
      data:
        name: "milk"
        notes: "Skim milk"
        list: "Shopping"
    - service: anylist.add_item
      data:
        name: "bread"
        list: "Shopping"
```

**After (TypeScript with cron job):**
```typescript
import { AnyListClient } from '@hacs/anylist';
import { schedule } from 'node-cron';

const client = new AnyListClient({
  serverUrl: 'http://127.0.0.1:1234',
  defaultList: 'Shopping'
});

// Add weekly groceries every Monday at 9 AM
schedule('0 9 * * 1', async () => {
  try {
    await client.addItem({
      name: 'milk',
      notes: 'Skim milk'
    });
    
    await client.addItem({
      name: 'bread'
    });
    
    console.log('Weekly groceries added successfully');
  } catch (error) {
    console.error('Failed to add weekly groceries:', error);
  }
});
```

#### Checking Items

**Before (Home Assistant):**
```yaml
- service: anylist.check_item
  data:
    name: "milk"
    list: "Shopping"
```

**After (TypeScript):**
```typescript
await client.checkItem({
  name: 'milk',
  list: 'Shopping'
});
```

#### Getting Items

**Before (Home Assistant):**
```yaml
- service: anylist.get_items
  data:
    list: "Shopping"
  response_variable: shopping_items
```

**After (TypeScript):**
```typescript
const response = await client.getItems({ list: 'Shopping' });
const shoppingItems = response.items;
```

### Step 4: Error Handling

**Before (Home Assistant had limited error handling):**
```yaml
- service: anylist.add_item
  data:
    name: "{{ item_name }}"
  # Limited error handling options
```

**After (TypeScript with comprehensive error handling):**
```typescript
try {
  await client.addItem({ name: itemName });
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    console.error('Network connection failed:', error.message);
    // Retry logic
  } else if (error.code === 'ITEM_EXISTS') {
    console.warn('Item already exists:', itemName);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Migration Examples

### Example 1: Voice Assistant Integration

**Before (Home Assistant with voice assistant):**
```yaml
# intents.yaml
AddItemIntent:
  - "Add {item} to my list"
  - "Put {item} on my shopping list"

# automations.yaml
- alias: "Handle add item intent"
  trigger:
    platform: conversation
    command: "AddItemIntent"
  action:
    - service: anylist.add_item
      data:
        name: "{{ trigger.slots.item.value }}"
```

**After (TypeScript with voice assistant SDK):**
```typescript
import { AnyListClient } from '@hacs/anylist';

const client = new AnyListClient({
  serverUrl: process.env.ANYLIST_SERVER_URL!
});

// Voice assistant intent handler
export async function handleAddItemIntent(slots: any) {
  const itemName = slots.item.value;
  
  try {
    await client.addItem({ name: itemName });
    return {
      speech: `Added ${itemName} to your shopping list`,
      success: true
    };
  } catch (error) {
    return {
      speech: `Sorry, I couldn't add ${itemName} to your list`,
      success: false,
      error: error.message
    };
  }
}
```

### Example 2: Web Dashboard

**Before (Limited to Home Assistant dashboard):**
```yaml
# dashboard.yaml
type: entities
entities:
  - entity_id: sensor.anylist_items
```

**After (Custom React dashboard):**
```typescript
import React, { useState, useEffect } from 'react';
import { AnyListClient } from '@hacs/anylist';

const client = new AnyListClient({
  serverUrl: process.env.REACT_APP_ANYLIST_SERVER_URL!
});

export function ShoppingListDashboard() {
  const [items, setItems] = useState({ unchecked: [], checked: [] });

  useEffect(() => {
    loadItems();
    const interval = setInterval(loadItems, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadItems = async () => {
    try {
      const response = await client.getAllItems();
      setItems({
        unchecked: response.uncheckedItems,
        checked: response.checkedItems
      });
    } catch (error) {
      console.error('Failed to load items:', error);
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
      console.error('Failed to toggle item:', error);
    }
  };

  return (
    <div className="shopping-list">
      <h2>Shopping List</h2>
      <div>
        <h3>To Buy ({items.unchecked.length})</h3>
        {items.unchecked.map(item => (
          <label key={item}>
            <input
              type="checkbox"
              onChange={() => toggleItem(item, false)}
            />
            {item}
          </label>
        ))}
      </div>
      <div>
        <h3>Completed ({items.checked.length})</h3>
        {items.checked.map(item => (
          <label key={item}>
            <input
              type="checkbox"
              checked
              onChange={() => toggleItem(item, true)}
            />
            <s>{item}</s>
          </label>
        ))}
      </div>
    </div>
  );
}
```

## Migration Checklist

### Pre-Migration
- [ ] Review current Home Assistant automations using AnyList
- [ ] Identify which automations can be converted to TypeScript
- [ ] Set up Node.js development environment
- [ ] Install TypeScript and related tools

### During Migration
- [ ] Install the TypeScript AnyList package
- [ ] Create configuration for TypeScript client
- [ ] Convert one automation at a time
- [ ] Test each converted automation thoroughly
- [ ] Implement proper error handling
- [ ] Add logging and monitoring

### Post-Migration
- [ ] Remove or disable old Home Assistant automations
- [ ] Update documentation for your setup
- [ ] Monitor performance and reliability
- [ ] Consider additional features now available with TypeScript

## Troubleshooting

### Common Issues

#### 1. Connection Errors
```typescript
// Add retry logic for network issues
const client = new AnyListClient({
  serverUrl: 'http://127.0.0.1:1234',
  retries: 3,
  timeout: 10000
});
```

#### 2. Type Errors
```typescript
// Ensure proper typing
interface AddItemOptions {
  name: string;
  notes?: string;
  list?: string;
}

const itemOptions: AddItemOptions = {
  name: 'milk',
  notes: 'Skim milk'
};

await client.addItem(itemOptions);
```

#### 3. Environment Variables
```typescript
// Use environment variables for configuration
const client = new AnyListClient({
  serverUrl: process.env.ANYLIST_SERVER_URL || 'http://127.0.0.1:1234',
  defaultList: process.env.ANYLIST_DEFAULT_LIST || 'Shopping'
});
```

## Benefits After Migration

### For Developers
- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: IntelliSense, auto-completion, refactoring
- **Modern JavaScript**: Async/await, destructuring, modules
- **Testing**: Better unit testing capabilities
- **Deployment**: More deployment options (Docker, serverless, etc.)

### For End Users
- **Performance**: Faster response times
- **Reliability**: Better error handling and recovery
- **Features**: Access to more advanced features
- **Customization**: Easier to customize behavior

## Getting Help

- **TypeScript Documentation**: [docs/typescript.md](typescript.md)
- **GitHub Issues**: [Create an issue](https://github.com/tdorsey/hacs-anylist/issues/new)
- **Migration Support**: [Issue #1](https://github.com/tdorsey/hacs-anylist/issues/1)
- **Examples Repository**: [hacs-anylist-examples](https://github.com/tdorsey/hacs-anylist-examples) (coming soon)

## Contributing

Help improve this migration guide by:
- Reporting issues with the migration process
- Contributing example conversions
- Improving documentation
- Testing the TypeScript version

See our [Contributing Guide](../CONTRIBUTING.md) for more information.