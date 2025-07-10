/**
 * Example usage of AnyList TypeScript client
 */

import { 
  createAnyListClient, 
  createAnyListSetup, 
  createDefaultAuthManager,
  AnyListError,
  AnyListErrorType 
} from './src/index';

// Example 1: Basic client usage
async function basicExample(): Promise<void> {
  console.log('=== Basic Client Example ===');
  
  const client = createAnyListClient({
    serverAddress: 'http://localhost:28597',
    defaultList: 'Shopping'
  });

  try {
    // Add items
    await client.addItem('Milk', { notes: 'Skim milk' });
    await client.addItem('Bread');
    await client.addItem('Eggs', { notes: 'Large, organic' });

    // Get items
    const [code, items] = await client.getItems();
    console.log('Unchecked items:', items);

    // Check an item
    await client.checkItem('Milk');

    // Get all items (checked and unchecked)
    const [allCode, [unchecked, checked]] = await client.getAllItems();
    console.log('Unchecked items:', unchecked);
    console.log('Checked items:', checked);

  } catch (error) {
    if (error instanceof AnyListError) {
      console.error('AnyList error:', error.type, error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Example 2: Using with binary server
async function binaryServerExample(): Promise<void> {
  console.log('=== Binary Server Example ===');
  
  const { client, server } = createAnyListSetup({
    serverBinary: '/path/to/anylist-server',
    email: 'your-email@example.com',
    password: 'your-password',
    defaultList: 'Shopping',
    refreshInterval: 30
  });

  // Set up server event listeners
  server.on('started', () => {
    console.log('✅ Server started successfully');
  });

  server.on('stopped', (code) => {
    console.log(`🛑 Server stopped with code: ${code}`);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
  });

  server.on('output', (data) => {
    console.log('📝 Server output:', data);
  });

  try {
    // Start the server
    console.log('Starting server...');
    server.start();

    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Use the client
    await client.addItem('Server Test Item');
    console.log('Item added successfully');

    // Stop the server gracefully
    await server.stop();

  } catch (error) {
    console.error('Error in binary server example:', error);
  }
}

// Example 3: Authentication management
async function authExample(): Promise<void> {
  console.log('=== Authentication Example ===');
  
  const authManager = createDefaultAuthManager();

  try {
    // Save credentials
    await authManager.saveCredentials({
      email: 'test@example.com',
      password: 'testpassword123',
      serverAddress: 'http://localhost:28597'
    });
    console.log('✅ Credentials saved');

    // Load and use credentials
    const credentials = await authManager.loadCredentials();
    if (credentials) {
      console.log('📧 Loaded email:', credentials.email);
      console.log('🔗 Server address:', credentials.serverAddress);
    }

    // Create client config from credentials
    const config = await authManager.createConfigFromCredentials({
      defaultList: 'Shopping',
      refreshInterval: 30
    });

    const client = createAnyListClient(config);
    console.log('✅ Client created from stored credentials');

    // Clean up
    await authManager.deleteCredentials();
    console.log('🗑️ Credentials deleted');

  } catch (error) {
    if (error instanceof AnyListError) {
      console.error('Auth error:', error.type, error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Example 4: Error handling
async function errorHandlingExample(): Promise<void> {
  console.log('=== Error Handling Example ===');
  
  // Create client with invalid server address
  const client = createAnyListClient({
    serverAddress: 'http://invalid-server:99999',
    defaultList: 'Test'
  });

  try {
    await client.addItem('This will fail');
  } catch (error) {
    if (error instanceof AnyListError) {
      console.log('Error type:', error.type);
      console.log('Error message:', error.message);
      console.log('HTTP code:', error.code);
      
      switch (error.type) {
        case AnyListErrorType.NETWORK_ERROR:
          console.log('💔 Network connection failed');
          break;
        case AnyListErrorType.AUTH_ERROR:
          console.log('🔐 Authentication failed');
          break;
        case AnyListErrorType.SERVER_ERROR:
          console.log('🚨 Server returned an error');
          break;
        case AnyListErrorType.VALIDATION_ERROR:
          console.log('⚠️ Invalid input provided');
          break;
        default:
          console.log('❓ Unknown error type');
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Example 5: Working with lists
async function listsExample(): Promise<void> {
  console.log('=== Lists Example ===');
  
  const client = createAnyListClient({
    serverAddress: 'http://localhost:28597'
  });

  try {
    // Get all available lists
    const [code, lists] = await client.getLists();
    console.log('Available lists:', lists);

    // Add items to different lists
    for (const listName of lists.slice(0, 2)) { // Use first 2 lists
      await client.addItem(`Item for ${listName}`, {}, listName);
      console.log(`Added item to ${listName}`);
    }

    // Get items from each list
    for (const listName of lists.slice(0, 2)) {
      const [itemCode, items] = await client.getItems(listName);
      console.log(`Items in ${listName}:`, items);
    }

  } catch (error) {
    console.error('Lists example error:', error);
  }
}

// Main function to run all examples
async function main(): Promise<void> {
  console.log('🚀 AnyList TypeScript Client Examples\n');

  // Note: These examples assume you have a running AnyList server
  // Comment out examples that require specific setup

  try {
    await basicExample();
    console.log('\n');
    
    // await binaryServerExample(); // Requires binary server path
    // console.log('\n');
    
    await authExample();
    console.log('\n');
    
    await errorHandlingExample();
    console.log('\n');
    
    // await listsExample(); // Requires running server
    // console.log('\n');
    
  } catch (error) {
    console.error('Main error:', error);
  }

  console.log('✅ Examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  basicExample,
  binaryServerExample,
  authExample,
  errorHandlingExample,
  listsExample
};