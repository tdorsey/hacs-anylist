# AnyList TypeScript Client

A TypeScript client library for interacting with AnyList servers. This library is converted from the Python Home Assistant integration to provide cross-platform support with proper type safety.

## Features

- 🔍 **Full TypeScript support** with comprehensive type definitions
- 🛡️ **Authentication and credential management** with secure storage
- 📋 **Complete list and item management** (add, remove, update, check items)
- 🖥️ **Binary server management** for self-hosted AnyList servers
- 🔌 **Backward compatibility** for JavaScript users
- 📖 **Comprehensive documentation** with JSDoc annotations
- ✅ **Well tested** with Jest test suite

## Installation

```bash
npm install anylist-client
```

## Quick Start

### Basic Usage with Server Address

```typescript
import { createAnyListClient } from 'anylist-client';

const client = createAnyListClient({
  serverAddress: 'http://localhost:28597',
  defaultList: 'Shopping'
});

// Add an item
await client.addItem('Milk', { notes: 'Skim milk' });

// Check an item
await client.checkItem('Milk');

// Get all items
const [code, [unchecked, checked]] = await client.getAllItems();
console.log('Unchecked:', unchecked);
console.log('Checked:', checked);
```

### Using with Binary Server

```typescript
import { createAnyListSetup } from 'anylist-client';

const { client, server } = createAnyListSetup({
  serverBinary: '/path/to/anylist-server',
  email: 'your-email@example.com',
  password: 'your-password',
  defaultList: 'Shopping'
});

// Start the server
server.start();

// Listen for server events
server.on('started', () => {
  console.log('Server started successfully');
});

server.on('output', (data) => {
  console.log('Server output:', data);
});

// Use the client
await client.addItem('Bread');
```

### Authentication Management

```typescript
import { createDefaultAuthManager } from 'anylist-client';

const authManager = createDefaultAuthManager();

// Save credentials
await authManager.saveCredentials({
  email: 'your-email@example.com',
  password: 'your-password',
  serverAddress: 'http://localhost:28597'
});

// Create client from saved credentials
const config = await authManager.createConfigFromCredentials({
  defaultList: 'Shopping'
});

const client = createAnyListClient(config);
```

## API Reference

### AnyList Client

#### Methods

- `addItem(name, updates?, listName?)` - Add an item to a list
- `removeItemByName(name, listName?)` - Remove an item by name
- `removeItemById(id, listName?)` - Remove an item by ID
- `updateItem(id, updates, listName?)` - Update an existing item
- `checkItem(name, listName?, checked?)` - Check/uncheck an item
- `getItems(listName?)` - Get unchecked items
- `getAllItems(listName?)` - Get all items (checked and unchecked)
- `getDetailedItems(listName?)` - Get detailed item objects
- `getLists()` - Get all available lists

#### Configuration

```typescript
interface AnyListConfig {
  serverAddress?: string;
  email?: string;
  password?: string;
  serverBinary?: string;
  defaultList?: string;
  refreshInterval?: number;
}
```

### AnyList Server

#### Methods

- `start()` - Start the server process
- `stop(signal?, timeout?)` - Stop the server process
- `restart()` - Restart the server process

#### Events

- `started` - Server has started successfully
- `stopped` - Server has stopped
- `error` - Server encountered an error
- `output` - Server produced output

### Authentication Manager

#### Methods

- `saveCredentials(credentials)` - Save credentials to file
- `loadCredentials()` - Load credentials from file
- `updateCredentials(updates)` - Update existing credentials
- `deleteCredentials()` - Delete stored credentials
- `createConfigFromCredentials(additional?)` - Create client config from credentials

#### Static Validation Methods

- `AuthManager.validateEmail(email)` - Validate email format
- `AuthManager.validatePassword(password)` - Validate password strength
- `AuthManager.validateServerAddress(address)` - Validate server address
- `AuthManager.validateConfig(config)` - Validate complete configuration

## Error Handling

The library provides comprehensive error handling with typed error objects:

```typescript
import { AnyListError, AnyListErrorType } from 'anylist-client';

try {
  await client.addItem('Test Item');
} catch (error) {
  if (error instanceof AnyListError) {
    console.log('Error type:', error.type);
    console.log('HTTP code:', error.code);
    console.log('Original error:', error.originalError);
    
    switch (error.type) {
      case AnyListErrorType.NETWORK_ERROR:
        console.log('Network connection issue');
        break;
      case AnyListErrorType.AUTH_ERROR:
        console.log('Authentication problem');
        break;
      case AnyListErrorType.SERVER_ERROR:
        console.log('Server returned an error');
        break;
    }
  }
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Development Mode

```bash
npm run dev
```

## TypeScript Support

This library is written in TypeScript and includes complete type definitions. You get full IntelliSense support and compile-time type checking:

```typescript
import { AnyListItem, AnyListConfig } from 'anylist-client';

const config: AnyListConfig = {
  serverAddress: 'http://localhost:28597',
  defaultList: 'Shopping',
  refreshInterval: 30
};

const items: AnyListItem[] = [
  {
    id: '1',
    name: 'Milk',
    checked: false,
    notes: 'Skim milk'
  }
];
```

## Compatibility

- **Node.js**: 16.x, 18.x, 20.x
- **TypeScript**: 5.x
- **JavaScript**: Full backward compatibility

## Migration from Python

If you're migrating from the Python Home Assistant integration, the API is very similar:

| Python | TypeScript |
|--------|------------|
| `anylist.add_item()` | `client.addItem()` |
| `anylist.remove_item_by_name()` | `client.removeItemByName()` |
| `anylist.check_item()` | `client.checkItem()` |
| `anylist.get_items()` | `client.getItems()` |
| `anylist.get_all_items()` | `client.getAllItems()` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Related Projects

- [Home Assistant AnyList Integration](https://github.com/kevdliu/hacs-anylist) - Original Python integration
- [AnyList Home Assistant Addon](https://github.com/kevdliu/hassio-addon-anylist) - Home Assistant addon

## Support

For issues related to this TypeScript client, please open an issue on GitHub.
For issues with the original Home Assistant integration, please refer to the [original repository](https://github.com/kevdliu/hacs-anylist).