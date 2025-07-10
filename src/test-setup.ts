// Test setup file for Jest
// This file is run before each test suite

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};

// Set up test environment
process.env.NODE_ENV = 'test';
