# Contributing to Traceplane

Thank you for your interest in contributing to Traceplane! This document provides guidelines to help you get started.

## Code of Conduct

Please be respectful and considerate in all interactions. We are committed to providing a welcoming and inclusive environment.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/jaxxchen003/Traceplane/issues) to avoid duplicates
2. Open a new issue with a clear title and description
3. Include steps to reproduce, expected behavior, and actual behavior
4. Add relevant logs, screenshots, or error messages

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the use case and why this feature would be valuable
3. If possible, provide a rough design or API proposal

### Submitting Pull Requests

1. **Fork** the repository and create your branch from `main`
2. Use a descriptive branch name: `feat/your-feature` or `fix/your-bug`
3. Make your changes and ensure tests pass
4. Follow the code style (ESLint is configured)
5. Write or update tests as needed
6. Open a PR with a clear description of what changed and why

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Traceplane.git
cd Traceplane

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Set up database
npm run db:setup

# Start development server
npm run dev
```

## Running Tests

```bash
# Unit tests (Agent SDK)
cd packages/agent-sdk && npm test

# API integration tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Code Style

- TypeScript is required for all new code
- Run `npm run lint` before submitting a PR
- Follow existing patterns in the codebase
- Keep functions small and focused
- Add JSDoc comments for public APIs

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve a bug
docs: update documentation
refactor: code change without feature/fix
test: add or update tests
chore: maintenance tasks
```

## Project Structure

See [README.md](./README.md) for a full directory overview.

## Questions?

Open an issue or reach us at hello@traceplane.io
