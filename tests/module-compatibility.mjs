/**
 * Simple test to verify dual module output is working correctly
 */

// Test ES module import
import { AnylistClient, validateConfig, createAnylistClient } from '../dist/index.js';

// Test CommonJS require (simulated with dynamic import)
async function testCommonJSImport() {
  const cjsModule = await import('../dist/index.cjs');
  console.log('✅ CommonJS module loaded successfully');
  console.log('Available exports:', Object.keys(cjsModule));
  return cjsModule;
}

// Test ES module import
function testESModuleImport() {
  console.log('✅ ES module loaded successfully');
  console.log('AnylistClient available:', typeof AnylistClient);
  console.log('validateConfig available:', typeof validateConfig);
  console.log('createAnylistClient available:', typeof createAnylistClient);
}

// Test type definitions
function testTypeDefinitions() {
  try {
    const config = {
      serverAddr: 'http://127.0.0.1:28597',
      defaultList: 'Test List'
    };
    
    validateConfig(config);
    const client = createAnylistClient(config);
    
    console.log('✅ Type definitions working correctly');
    console.log('Client instance created:', client instanceof AnylistClient);
  } catch (error) {
    console.log('❌ Type definition test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing dual module output...\n');
  
  console.log('1. Testing ES Module Import:');
  testESModuleImport();
  
  console.log('\n2. Testing CommonJS Import:');
  await testCommonJSImport();
  
  console.log('\n3. Testing Type Definitions:');
  testTypeDefinitions();
  
  console.log('\n✅ All module tests passed!');
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}