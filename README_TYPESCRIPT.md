# TypeScript Development

This directory contains the TypeScript implementation of the AnyList Home Assistant Integration.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Watch mode for development
npm run dev
```

## Project Structure

```
src/
├── index.ts          # Main entry point and core classes
├── types.ts          # TypeScript type definitions
├── utils.ts          # Utility functions and helpers
└── __tests__/        # Test files
    └── index.test.ts # Main test suite
```

## Available Scripts

- `npm run build` - Build for production (CommonJS + ES Modules + Types)
- `npm run dev` - Development watch mode
- `npm test` - Run test suite
- `npm run lint` - Check code quality
- `npm run format` - Format code

## Documentation

See [TYPESCRIPT_TOOLCHAIN.md](./TYPESCRIPT_TOOLCHAIN.md) for detailed documentation about the build toolchain, architecture decisions, and development workflow.

## Integration with Python Implementation

This TypeScript implementation is designed to coexist with the existing Python Home Assistant integration during the conversion process. The TypeScript code provides:

- Type-safe interfaces matching the Python implementation
- Utility functions for data conversion and validation  
- Foundation for incremental conversion from Python to TypeScript
- Testing infrastructure to ensure compatibility

## Related Issues

- Issue #1: [WIP] Add GitHub Actions CI/CD and Automation for TypeScript Conversion