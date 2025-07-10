# Contributing to HACS Anylist

Thank you for your interest in contributing to the HACS Anylist integration!

## Development Setup

### Prerequisites

- Node.js 16.x, 18.x, or 20.x
- npm (comes with Node.js)

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/hacs-anylist.git`
3. Install dependencies: `npm install`
4. Run tests: `npm test`
5. Start development: `npm run build:watch`

### Code Style

We use ESLint and Prettier for code formatting. Before committing:

```bash
npm run lint:fix
npm run type-check
npm test
```

### Commit Messages

We use [Conventional Commits](https://conventionalcommits.org/) for automatic versioning:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for maintenance tasks
- `test:` for test-related changes

### Pull Request Process

1. Create a feature branch from `develop`
2. Make your changes
3. Ensure all tests pass
4. Update documentation if needed
5. Submit a pull request to `develop`

## TypeScript Conversion

This project is transitioning from Python to TypeScript. When contributing:

- Follow the existing TypeScript patterns
- Maintain compatibility with the existing Python integration
- Add comprehensive tests for new functionality
- Update type definitions as needed

## Questions?

Feel free to open an issue for any questions about contributing!