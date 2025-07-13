# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - TypeScript Conversion

### Added
- Comprehensive TypeScript API documentation ([docs/typescript.md](docs/typescript.md))
- Migration guide from Python to TypeScript ([docs/migration.md](docs/migration.md))
- Extensive TypeScript usage examples ([docs/examples.md](docs/examples.md))
- Documentation index and navigation ([docs/README.md](docs/README.md))
- TypeScript usage preview in main README
- Migration timeline and phase tracking
- Links to TypeScript conversion issue (#1) throughout documentation

### Changed
- Enhanced README.md with TypeScript introduction and migration information
- Restructured documentation to support both Python and TypeScript versions
- Added clear navigation between Python (current) and TypeScript (future) documentation

### In Progress (TypeScript Conversion)
- Phase 1: ✅ Infrastructure Setup (PRs #1-#4)
- Phase 2: ⏳ TypeScript Configuration & Types (PRs #5-#6)
- Phase 3: ⏳ Core API Implementation (PR #7)
- Phase 4: ⏳ Package & Build System (PR #8)
- Phase 5: ⏳ Testing & CI/CD (PRs #9-#10)
- Phase 6: ⏳ Documentation & Examples (PR #11)

## [1.5.9] - Current Python Version

### Features
- Home Assistant custom component for AnyList integration
- Service calls for managing list items (add, remove, check, uncheck)
- To-do list integration with Home Assistant UI
- Voice assistant support through custom sentences
- Automation blueprints for common tasks
- Category matching and learning capabilities

### Supported Operations
- `anylist.add_item` - Add items to lists
- `anylist.remove_item` - Remove items from lists
- `anylist.check_item` - Mark items as completed
- `anylist.uncheck_item` - Mark items as incomplete
- `anylist.get_items` - Get unchecked items
- `anylist.get_all_items` - Get all items (checked and unchecked)

### Requirements
- Home Assistant 2024.1.0+
- [Home Assistant Addon For Anylist](https://github.com/kevdliu/hassio-addon-anylist)

## TypeScript Version Preview

### Planned Features (Coming Soon)
- Full TypeScript API with comprehensive type definitions
- Cross-platform support (Node.js, browsers, React Native)
- Modern async/await patterns
- Enhanced error handling and retry logic
- Direct API access without Home Assistant dependency
- npm package distribution
- CommonJS and ES modules support
- Built-in testing utilities
- Extensive documentation and examples

### TypeScript API Preview
```typescript
import { AnyListClient } from '@hacs/anylist';

const client = new AnyListClient({
  serverUrl: 'http://127.0.0.1:1234',
  defaultList: 'Shopping'
});

// Same functionality, better types!
await client.addItem({ name: 'milk', notes: 'Skim milk' });
await client.checkItem({ name: 'milk' });
const items = await client.getItems();
```

### Migration Benefits
- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: IntelliSense, auto-completion, refactoring
- **Modern JavaScript**: Latest ES features and patterns
- **Cross-Platform**: Works beyond Home Assistant
- **Better Testing**: Comprehensive testing utilities
- **Performance**: Optimized for modern JavaScript engines

## Contributing to TypeScript Conversion

We welcome contributions to the TypeScript conversion project! Here's how you can help:

1. **Review Documentation**: Check the TypeScript documentation for accuracy
2. **Test Migration Examples**: Try the migration examples and report issues
3. **Contribute Examples**: Add your own TypeScript integration examples
4. **Report Issues**: Found bugs or have suggestions? Create an issue
5. **Code Contributions**: Help with the TypeScript implementation

See [Issue #1](https://github.com/tdorsey/hacs-anylist/issues/1) for current progress and ways to contribute.

## Support

- **Current Python Version**: Continue using existing Home Assistant integration
- **TypeScript Questions**: See [TypeScript Documentation](docs/typescript.md)
- **Migration Help**: Check [Migration Guide](docs/migration.md)
- **Examples**: Browse [TypeScript Examples](docs/examples.md)
- **Issues**: [GitHub Issues](https://github.com/tdorsey/hacs-anylist/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tdorsey/hacs-anylist/discussions)