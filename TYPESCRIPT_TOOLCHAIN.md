# TypeScript Build Toolchain Documentation

This document describes the TypeScript build toolchain setup for the AnyList Home Assistant Integration project.

## Overview

The project has been equipped with a robust TypeScript build toolchain to support the conversion from the existing Python implementation to TypeScript. This toolchain provides:

- **Dual module output** (CommonJS and ES Modules)
- **Comprehensive type checking** with strict TypeScript settings
- **Code quality enforcement** via ESLint and Prettier
- **Automated testing** with Jest
- **Build automation** with conventional npm scripts

## Architecture Decisions

### Build System
- **TypeScript Compiler (tsc)**: Used directly instead of bundlers for maximum compatibility and type safety
- **Dual module output**: Supports both CommonJS (`dist/cjs/`) and ES Modules (`dist/esm/`) for broad compatibility
- **Separate type declarations**: Types are output to `dist/types/` for optimal TypeScript integration

### Code Quality Tools

#### TypeScript Configuration (`tsconfig.json`)
- **Target**: ES2020 for modern JavaScript features while maintaining compatibility
- **Strict mode**: All strict TypeScript checks enabled for maximum type safety
- **Module resolution**: Node.js style for compatibility with existing ecosystems
- **Source maps**: Enabled for debugging support
- **Decorators**: Enabled for potential Home Assistant integration patterns

#### ESLint Configuration (`.eslintrc.json`)
- **Parser**: `@typescript-eslint/parser` for TypeScript support
- **Extends**: `@typescript-eslint/recommended` for proven TypeScript rules
- **Integration**: Prettier integration for consistent formatting
- **Rules**: Balanced between code quality and developer experience
- **Complexity limits**: Function complexity and line limits for maintainability

#### Prettier Configuration (`.prettierrc.json`)
- **Single quotes**: For consistency with TypeScript/JavaScript conventions
- **Semicolons**: Required for clarity and ASI safety
- **Print width**: 100 characters for readability
- **Trailing commas**: ES5-compatible for better diffs

### Testing Framework

#### Jest Configuration (`jest.config.json`)
- **ts-jest preset**: Native TypeScript support without compilation step
- **Coverage reporting**: Multiple formats (text, lcov, html)
- **Coverage thresholds**: 70% minimum across all metrics
- **Test discovery**: Automatic detection of test files

## Package Scripts

The following npm scripts are available:

### Build Scripts
- `npm run build` - Complete build process (clean + types + cjs + esm)
- `npm run build:types` - Generate TypeScript declaration files
- `npm run build:cjs` - Build CommonJS modules
- `npm run build:esm` - Build ES Modules
- `npm run clean` - Remove all build artifacts

### Development Scripts
- `npm run dev` - Watch mode for development
- `npm run test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality Scripts
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - TypeScript type checking without output
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted

### Release Scripts
- `npm run prepare` - Runs before npm publish (builds the project)
- `npm run prepublishOnly` - Full validation before publishing (lint + type-check + test + build)

## Package.json Configuration

### Exports
The package supports both CommonJS and ES Module imports:

```json
{
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    }
  }
}
```

### Files
Only the `dist` directory is included in the published package to keep it lightweight.

## Dependencies

### Production Dependencies
- `tslib`: TypeScript runtime library for helper functions

### Development Dependencies
- `typescript`: TypeScript compiler
- `@typescript-eslint/*`: TypeScript-specific ESLint rules and parser
- `eslint`: JavaScript/TypeScript linting
- `prettier`: Code formatting
- `jest` & `ts-jest`: Testing framework with TypeScript support
- `@types/jest`: TypeScript definitions for Jest
- `rimraf`: Cross-platform file deletion utility

## CI/CD Integration

The toolchain is designed to integrate seamlessly with CI/CD pipelines:

1. **Validation**: `npm run lint && npm run type-check && npm run test`
2. **Build**: `npm run build`
3. **Verification**: All build outputs are tested and validated

### Recommended CI Pipeline Steps
1. Install dependencies: `npm ci`
2. Lint code: `npm run lint`
3. Type check: `npm run type-check`
4. Run tests: `npm run test:coverage`
5. Build project: `npm run build`
6. Verify build outputs work correctly

## Future Conversion Strategy

This toolchain provides the foundation for converting the Python Home Assistant integration to TypeScript:

1. **Gradual conversion**: Individual modules can be converted incrementally
2. **Type safety**: Strict TypeScript settings ensure type safety throughout conversion
3. **Testing**: Jest setup allows for comprehensive testing of converted code
4. **Quality gates**: ESLint and Prettier ensure consistent code quality
5. **Module compatibility**: Dual output ensures compatibility with various import systems

## Maintenance

### Updating Dependencies
- Regular updates of TypeScript and tooling dependencies
- Monitor compatibility between ESLint, TypeScript, and Prettier versions
- Update coverage thresholds as codebase grows

### Configuration Evolution
- Adjust ESLint rules based on team preferences and project needs
- Update TypeScript target as browser/Node.js support evolves
- Refine Prettier settings for optimal formatting

## Links to Related Issues

This toolchain setup relates to the main TypeScript conversion project tracked in:
- Issue #1: [WIP] Add GitHub Actions CI/CD and Automation for TypeScript Conversion