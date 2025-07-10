# TypeScript Library Development

This document describes the TypeScript project structure and development workflow for the AnyList library.

## Project Structure

```
├── src/                 # TypeScript source code
│   ├── __tests__/      # Test files
│   ├── client.ts       # Main client class
│   ├── services.ts     # Service layer
│   ├── types.ts        # Type definitions
│   └── index.ts        # Library entry point
├── dist/               # Compiled output (generated)
├── types/              # Additional type definitions
├── custom_components/  # Home Assistant integration (Python)
└── custom_sentences/   # Home Assistant sentences
```

## Development Workflow

### Setup
```bash
npm install
```

### Development
```bash
npm run dev          # Watch mode compilation
npm run lint         # Run ESLint
npm run test:watch   # Watch mode testing
```

### Building
```bash
npm run build        # Build for production
npm run clean        # Clean build artifacts
```

### Testing
```bash
npm test             # Run tests
npm run test:coverage # Run tests with coverage
```

## Dual Module Output

This library is configured to output both CommonJS and ESM modules:

- **CommonJS**: `dist/index.js` - For Node.js applications using `require()`
- **ESM**: `dist/index.mjs` - For modern applications using `import`
- **Types**: `dist/index.d.ts` - TypeScript type definitions

## TypeScript Configuration

- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.build.json` - Build-specific configuration
- Strict type checking enabled
- Modern ES2020 target with Node.js compatibility

## Code Quality

- **ESLint**: TypeScript-aware linting with recommended rules
- **Jest**: Unit testing with TypeScript support
- **Prettier**: Code formatting (configure as needed)

## Publishing

The library is configured for npm publishing with:
- Proper package.json exports for dual module support
- Type definitions included
- Only essential files included in the package