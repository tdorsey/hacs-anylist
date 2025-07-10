# Documentation Index

This directory contains comprehensive documentation for the AnyList integration, covering both the current Python-based Home Assistant integration and the new TypeScript/Node.js library.

## Documentation Structure

### TypeScript/Node.js Documentation

- **[TypeScript Usage Guide](typescript.md)** - Complete guide to using the TypeScript API
  - Installation and setup
  - API reference with full type definitions
  - Basic and advanced usage examples
  - Development and contribution guidelines

- **[Migration Guide](migration.md)** - Detailed migration from Python to TypeScript
  - Step-by-step migration process
  - Before/after code comparisons
  - Common migration scenarios
  - Troubleshooting guide

- **[Examples Collection](examples.md)** - Practical examples and integrations
  - Basic usage patterns
  - Express.js API server
  - Discord bot integration
  - React Native mobile app
  - Testing examples

### Current Python/Home Assistant Documentation

The main [README.md](../README.md) contains documentation for the current Python-based Home Assistant integration, including:
- Installation via HACS
- Home Assistant configuration
- Service calls and automation examples
- Voice assistant integration
- To-do list functionality

## Quick Navigation

### For TypeScript Developers
1. Start with [TypeScript Usage Guide](typescript.md) for API overview
2. Check [Examples](examples.md) for your specific use case
3. Refer to [Migration Guide](migration.md) if converting from Python

### For Home Assistant Users
1. Continue using the main [README.md](../README.md) for current functionality
2. Review [Migration Guide](migration.md) to understand future changes
3. Explore [TypeScript Examples](examples.md) for advanced automation ideas

### For Contributors
1. Review [TypeScript Usage Guide](typescript.md) for API standards
2. Check existing [Examples](examples.md) for code style
3. See [Issue #1](https://github.com/tdorsey/hacs-anylist/issues/1) for conversion progress

## TypeScript Conversion Status

The AnyList integration is being converted from Python to TypeScript in phases:

- ✅ **Phase 1**: Infrastructure Setup (Docker, CI/CD)
- ⏳ **Phase 2**: TypeScript Configuration & Types
- ⏳ **Phase 3**: Core API Implementation
- ⏳ **Phase 4**: Package & Build System
- ⏳ **Phase 5**: Testing & Quality Assurance
- ⏳ **Phase 6**: Documentation & Examples (This Phase)

Track progress in [Issue #1](https://github.com/tdorsey/hacs-anylist/issues/1).

## Contributing to Documentation

Help improve our documentation:

1. **Report Issues**: Found something unclear? [Create an issue](https://github.com/tdorsey/hacs-anylist/issues/new)
2. **Add Examples**: Have a cool integration? Add it to [examples.md](examples.md)
3. **Improve Guides**: Better explanations welcome via pull request
4. **Test Instructions**: Try the migration guide and report issues

### Documentation Standards

- Use clear, concise language
- Include working code examples
- Provide both basic and advanced examples
- Link related concepts
- Keep examples up-to-date with API changes

## Getting Help

- **General Questions**: [GitHub Discussions](https://github.com/tdorsey/hacs-anylist/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/tdorsey/hacs-anylist/issues)
- **Migration Help**: [Issue #1](https://github.com/tdorsey/hacs-anylist/issues/1)
- **TypeScript API**: See [typescript.md](typescript.md#api-reference)