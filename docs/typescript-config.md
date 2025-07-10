# TypeScript Configuration Documentation

## Overview

This document outlines the TypeScript configuration decisions and rationale for the Anylist Home Assistant Integration. The setup provides a modern, type-safe SDK that supports dual module output (CommonJS + ES modules) for maximum compatibility.

## Configuration Strategy

### Build Tool Choice: tsup

**Decision**: We chose [tsup](https://tsup.egoist.dev/) as our build tool over alternatives like tsdx, rollup, or manual webpack configuration.

**Rationale**:
- **Zero-config**: Minimal setup with sensible defaults
- **Fast builds**: Powered by esbuild for excellent performance
- **Dual module support**: Built-in CommonJS and ES module output
- **Type generation**: Automatic .d.ts file generation
- **Modern**: Active maintenance and modern TypeScript support
- **Bundle optimization**: Tree-shaking and code splitting out of the box

### TypeScript Configuration

#### tsconfig.json

Our TypeScript configuration uses modern settings optimized for dual module output:

```typescript
{
  "compilerOptions": {
    "target": "ES2022",           // Modern JavaScript features
    "module": "ESNext",           // Use latest module system
    "moduleResolution": "bundler", // Modern bundler resolution
    "strict": true,               // Full type safety
    "declaration": true,          // Generate type definitions
    "sourceMap": true,            // Debug support
    // ... additional strict type checking options
  }
}
```

**Key decisions**:
- **ES2022 target**: Balances modern features with broad Node.js compatibility
- **Bundler module resolution**: Optimized for modern tooling
- **Strict mode**: Maximum type safety to catch errors early
- **Path mapping**: Clean imports with `@/` aliases

#### Dual Module Output

**CommonJS Support** (`dist/index.cjs`):
- Required for Node.js environments and older tooling
- Ensures compatibility with existing Home Assistant integrations
- Fallback for environments that don't support ES modules

**ES Modules Support** (`dist/index.js`):
- Modern standard for JavaScript modules
- Enables tree-shaking for smaller bundle sizes
- Future-proof for modern JavaScript environments

**Type Definitions** (`dist/index.d.ts`):
- Full TypeScript support in consuming projects
- Enables IDE autocompletion and type checking
- Generated automatically from source code

### Project Structure

```
src/
├── types/           # Type definitions and interfaces
├── client/          # Main API client implementation
├── utils/           # Utility functions and helpers
└── index.ts         # Main entry point with exports

dist/                # Built output (generated)
├── index.js         # ES module bundle
├── index.cjs        # CommonJS bundle
├── index.d.ts       # Type definitions
└── *.map            # Source maps

examples/            # Usage examples
tests/               # Test files (future)
```

**Benefits**:
- **Clear separation**: Types, client logic, and utilities are organized
- **Scalable**: Easy to add new modules and features
- **Maintainable**: Logical grouping makes code easier to find and modify

### Package.json Configuration

#### Dual Module Package Setup

```json
{
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

This configuration ensures:
- **Modern ESM by default**: `"type": "module"` makes ES modules the default
- **Backwards compatibility**: CommonJS still available via `require()`
- **Tool compatibility**: Both `main` and `module` fields for older tools
- **Type support**: TypeScript definitions always available

#### Scripts and Tooling

- **`npm run build`**: Production build with optimizations
- **`npm run dev`**: Development build with watch mode
- **`npm run type-check`**: TypeScript compilation check without emit
- **`npm run lint`**: ESLint code quality checks

### Code Quality and Standards

#### ESLint Configuration

Strict TypeScript ESLint rules ensure code quality:
- **No explicit any**: Prevents type safety bypass
- **Unused variable detection**: Keeps code clean
- **Consistent naming**: Enforces TypeScript conventions
- **Modern JavaScript**: Encourages ES2022+ features

#### Type Safety Features

- **Strict null checks**: Prevents null/undefined runtime errors
- **No unused locals**: Catches potential bugs
- **Exact optional properties**: Prevents typos in object properties
- **No implicit returns**: Ensures all code paths return values

## Usage Examples

### Basic Client Usage

```typescript
import { createAnylistClient } from '@tdorsey/hacs-anylist';

const client = createAnylistClient({
  serverAddr: 'http://127.0.0.1:28597',
  defaultList: 'Shopping'
});

await client.addItem({ name: 'Milk', notes: 'Organic' });
const items = await client.getItems();
```

### CommonJS Usage (Legacy)

```javascript
const { createAnylistClient } = require('@tdorsey/hacs-anylist');

const client = createAnylistClient({
  serverAddr: 'http://127.0.0.1:28597'
});
```

## Migration Path

This TypeScript SDK is designed to complement the existing Python Home Assistant integration:

1. **Phase 1 (Current)**: TypeScript SDK for external consumers
2. **Phase 2 (Future)**: Gradual Python-to-TypeScript conversion
3. **Phase 3 (Future)**: Full TypeScript Home Assistant integration

The dual module output ensures compatibility throughout this migration process.

## Performance Considerations

- **Bundle size**: Tree-shaking eliminates unused code
- **Build speed**: esbuild provides fast compilation
- **Runtime performance**: Modern ES2022 features are optimized
- **Memory usage**: Efficient module loading with ES modules

## Development Workflow

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev` (watch mode)
3. **Type checking**: `npm run type-check`
4. **Linting**: `npm run lint`
5. **Build**: `npm run build`
6. **Test**: `npm test` (when tests are added)

## Future Considerations

- **Testing framework**: Vitest is configured for future test development
- **Documentation**: JSDoc comments provide inline documentation
- **Publishing**: Ready for npm publishing with proper package configuration
- **CI/CD**: Package.json scripts are compatible with GitHub Actions

This configuration provides a solid foundation for TypeScript development while maintaining compatibility with existing Python infrastructure.