# TypeScript Project Configuration Examples

This document shows example configuration files for the TypeScript version of the AnyList integration.

> **Note**: These are example configurations that will be implemented during the TypeScript conversion. They are provided here for documentation purposes and to help users understand what the final TypeScript setup will look like.

## package.json

```json
{
  "name": "@hacs/anylist",
  "version": "2.0.0",
  "description": "TypeScript client for AnyList integration with comprehensive type support",
  "main": "dist/commonjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/commonjs/index.js",
      "types": "./dist/types/index.d.ts"
    }
  },
  "files": [
    "dist/",
    "src/",
    "README.md",
    "CHANGELOG.md"
  ],
  "scripts": {
    "build": "npm run build:clean && npm run build:commonjs && npm run build:esm && npm run build:types",
    "build:clean": "rimraf dist",
    "build:commonjs": "tsc -p tsconfig.commonjs.json",
    "build:esm": "tsc -p tsconfig.esm.json",
    "build:types": "tsc -p tsconfig.types.json",
    "dev": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm test && npm run lint",
    "docs": "typedoc src/index.ts"
  },
  "keywords": [
    "anylist",
    "shopping-list",
    "grocery",
    "typescript",
    "nodejs",
    "home-assistant",
    "automation",
    "api-client"
  ],
  "author": "HACS AnyList Contributors",
  "license": "GPL-3.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/tdorsey/hacs-anylist.git"
  },
  "bugs": {
    "url": "https://github.com/tdorsey/hacs-anylist/issues"
  },
  "homepage": "https://github.com/tdorsey/hacs-anylist#readme",
  "engines": {
    "node": ">=16.0.0"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "axios-retry": "^3.8.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.7.0",
    "prettier": "^3.0.0",
    "rimraf": "^5.0.0",
    "ts-jest": "^29.1.0",
    "typedoc": "^0.25.0",
    "typescript": "^5.2.0"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist/commonjs",
    "rootDir": "./src",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

## tsconfig.esm.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ES2020",
    "outDir": "./dist/esm"
  }
}
```

## tsconfig.types.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist/types"
  }
}
```

## .eslintrc.js

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error'
  },
  env: {
    node: true,
    es6: true
  }
};
```

## .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
```

## jest.config.js

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

## .gitignore

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Coverage reports
coverage/
*.lcov

# Environment variables
.env
.env.local
.env.*.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Temporary folders
tmp/
temp/
```

## GitHub Actions Workflow Example

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run typecheck
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Build project
      run: npm run build
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
        registry-url: 'https://registry.npmjs.org'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
    
    - name: Publish to npm
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Docker Configuration Example

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S anylist -u 1001

USER anylist

EXPOSE 3000

CMD ["node", "dist/commonjs/index.js"]
```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── client.ts             # AnyListClient class
├── types.ts              # TypeScript type definitions
├── errors.ts             # Custom error classes
├── utils.ts              # Utility functions
└── constants.ts          # Constants and enums

tests/
├── unit/                 # Unit tests
│   ├── client.test.ts
│   ├── utils.test.ts
│   └── errors.test.ts
├── integration/          # Integration tests
│   └── anylist.test.ts
└── setup.ts              # Test setup

dist/                     # Build output
├── commonjs/             # CommonJS build
├── esm/                  # ES modules build
└── types/                # Type declarations

docs/                     # Documentation
├── README.md
├── typescript.md
├── migration.md
└── examples.md
```

This configuration provides a solid foundation for the TypeScript version with:

- **Dual Module Support**: Both CommonJS and ES modules
- **Type Safety**: Comprehensive TypeScript configuration
- **Quality Tools**: ESLint, Prettier, Jest for code quality
- **CI/CD**: GitHub Actions for testing and publishing
- **Docker Support**: Containerized deployment
- **Documentation**: TypeDoc generation support

The actual implementation will follow this structure when the TypeScript conversion is complete.