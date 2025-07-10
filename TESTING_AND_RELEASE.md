# Testing and Release Workflow

This document describes the testing and release workflow for the TypeScript conversion of the Anylist Home Assistant integration.

## Overview

The project uses modern TypeScript tooling with automated testing, linting, formatting, and release processes. All tools are integrated with pre-commit hooks and CI/CD pipelines to ensure code quality and streamlined releases.

## Development Tools

### TypeScript Configuration

- **TypeScript 5.4+**: Strict type checking with modern ES2020 target
- **Source maps**: Enabled for debugging
- **Declaration files**: Generated for library usage

### Code Quality Tools

#### ESLint

- Lints TypeScript files with custom rules
- Enforces explicit return types and module boundaries
- Prevents unused variables and requires strict typing
- Integrated with Prettier for consistent formatting

```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Fix auto-fixable linting issues
```

#### Prettier

- Enforces consistent code formatting
- Configured with single quotes, semicolons, and 80-character line width
- Formats TypeScript, JSON, and Markdown files

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

### Testing Framework

#### Jest with ts-jest

- **Test runner**: Jest with TypeScript support via ts-jest
- **Coverage reporting**: lcov, HTML, and text formats
- **Test patterns**: `*.test.ts` and `*.spec.ts` files
- **Setup**: Custom test setup file for environment configuration

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

#### Test Structure

```
src/
├── index.ts          # Main source file
├── index.test.ts     # Test file
└── test-setup.ts     # Jest setup configuration
```

### Pre-commit Hooks

#### Husky + lint-staged

- **Pre-commit validation**: Runs on staged files before commit
- **Automated formatting**: Applies Prettier formatting
- **Linting**: Fixes ESLint issues automatically
- **Type checking**: Ensures TypeScript compilation

Configuration in `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

## Build Process

### TypeScript Compilation

```bash
npm run build         # Compile TypeScript to JavaScript
npm run build:watch   # Compile in watch mode
npm run clean         # Remove build artifacts
```

### Build Output

- **Output directory**: `dist/`
- **Declaration files**: `.d.ts` files for TypeScript consumers
- **Source maps**: For debugging compiled code
- **ES2020 modules**: Modern JavaScript output

## Release Process

### Semantic Release

Automated versioning and publishing using semantic-release:

- **Conventional Commits**: Uses commit message conventions
- **Automatic versioning**: Semantic version bumping
- **Changelog generation**: Automated CHANGELOG.md updates
- **GitHub releases**: Automated release notes
- **NPM publishing**: Automated package publishing

#### Release Branches

- **main**: Production releases
- **beta**: Pre-release versions

#### Release Plugins

1. **@semantic-release/commit-analyzer**: Analyzes commits for version bumps
2. **@semantic-release/release-notes-generator**: Generates release notes
3. **@semantic-release/changelog**: Updates CHANGELOG.md
4. **@semantic-release/npm**: Publishes to NPM registry
5. **@semantic-release/github**: Creates GitHub releases
6. **@semantic-release/git**: Commits release artifacts

### Commit Convention

Follow conventional commits for automatic versioning:

```
feat: add new feature (minor version bump)
fix: bug fix (patch version bump)
perf: performance improvement (patch version bump)
docs: documentation changes (no version bump)
style: formatting changes (no version bump)
refactor: code refactoring (no version bump)
test: add tests (no version bump)
chore: maintenance tasks (no version bump)

BREAKING CHANGE: in footer (major version bump)
```

## CI/CD Pipeline

### GitHub Actions Workflow

Located in `.github/workflows/ci.yml`

#### Triggers

- **Push**: to `main` and `beta` branches
- **Pull Request**: to `main` branch

#### Jobs

##### 1. Test Matrix

- **Node.js versions**: 16.x, 18.x, 20.x
- **Operating system**: Ubuntu Latest
- **Steps**:
  1. Checkout code
  2. Setup Node.js with cache
  3. Install dependencies
  4. Type check
  5. Lint
  6. Format check
  7. Test with coverage
  8. Upload coverage to Codecov (Node.js 20.x only)

##### 2. Build

- **Dependencies**: Requires test job to pass
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20.x
  3. Install dependencies
  4. Build TypeScript
  5. Upload build artifacts

##### 3. Release

- **Dependencies**: Requires test and build jobs to pass
- **Condition**: Only on `main` or `beta` branches
- **Steps**:
  1. Checkout code with full history
  2. Setup Node.js 20.x
  3. Install dependencies
  4. Build project
  5. Run semantic-release

### Environment Variables

Required secrets in GitHub repository:

- `GITHUB_TOKEN`: For GitHub releases (automatically provided)
- `NPM_TOKEN`: For NPM publishing (must be configured)

## Development Workflow

### Setting Up Development Environment

```bash
# Clone repository
git clone https://github.com/tdorsey/hacs-anylist.git
cd hacs-anylist

# Install dependencies
npm install

# Set up git hooks
npm run prepare
```

### Daily Development

```bash
# Start development with type checking
npm run build:watch

# Run tests in watch mode
npm run test:watch

# Before committing (hooks will run automatically)
npm run lint
npm run format
npm run test
npm run type-check
```

### Making Changes

1. Create feature branch from `main`
2. Make changes with proper commit messages
3. Pre-commit hooks ensure code quality
4. Push changes and create pull request
5. CI pipeline validates changes
6. Merge to `main` triggers automatic release

## Integration with TypeScript Conversion

This testing and release infrastructure supports the ongoing TypeScript conversion project (Issue #1):

### Current State

- ✅ Testing infrastructure (Jest + ts-jest)
- ✅ Code quality tools (ESLint + Prettier)
- ✅ Pre-commit hooks (Husky + lint-staged)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Automated releases (semantic-release)
- ✅ Documentation

### Next Steps for TypeScript Conversion

1. **Gradual Migration**: Convert Python modules to TypeScript incrementally
2. **API Compatibility**: Maintain backward compatibility during transition
3. **Integration Testing**: Add integration tests for Home Assistant compatibility
4. **Performance Testing**: Validate TypeScript performance vs Python
5. **Documentation Updates**: Update integration documentation

### Monitoring and Maintenance

- **Dependency Updates**: Automated via Dependabot (can be configured)
- **Security Scanning**: GitHub security advisories
- **Performance Monitoring**: Test execution time tracking
- **Coverage Tracking**: Codecov integration for coverage trends

## Troubleshooting

### Common Issues

#### ESLint Configuration

If ESLint fails to find TypeScript configurations:

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

#### Husky Hooks Not Running

Ensure hooks are installed:

```bash
npx husky install
```

#### Type Checking Errors

Ensure TypeScript configuration is correct:

```bash
npm run type-check
```

#### Test Failures

Run tests with verbose output:

```bash
npm test -- --verbose
```

For more detailed information, see the individual configuration files and GitHub Actions workflow.
