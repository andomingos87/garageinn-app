<!-- agent-update:start:testing-strategy -->
# Testing Strategy

Document how quality is maintained across the codebase.

## Test Types
- **Unit**: Tests focus on individual functions and components in isolation. The project uses Jest as the primary framework for unit testing. Test files follow the naming convention `*.test.js` or `*.spec.js` and are placed alongside source files or in a `__tests__` directory.
- **Integration**: Tests verify interactions between multiple modules or external dependencies, such as API calls or database connections. Scenarios include testing service layers with mocked external services using Jest and Supertest for HTTP integrations. Tooling includes Jest for assertions and Node.js built-in modules for setup.
- **End-to-end**: Currently not implemented due to the project's small scale (11 files, 0.05 MB). Future E2E testing could use tools like Cypress or Playwright in a dedicated staging environment; no harnesses are set up at present.

## Running Tests
- Execute all tests with `npm run test`.
- Use watch mode locally: `npm run test -- --watch`.
- Add coverage runs before releases: `npm run test -- --coverage`.

## Quality Gates
- Minimum code coverage must be at least 80% for new code changes, enforced via CI checks. This threshold is configurable in `jest.config.js` if present.
- Linting is required using ESLint with rules defined in `.eslintrc.json`; all checks must pass before merging (e.g., `npm run lint`).
- Formatting uses Prettier; run `npm run format` to auto-fix issues. CI workflows block merges on linting or formatting failures.

## Troubleshooting
- No known flaky suites at present, given the repository's minimal size and lack of complex async operations.
- Long-running tests: Unit tests run under 1 second on average; monitor integration tests involving external mocks.
- Environment quirks: Ensure Node.js version matches `package.json` engines (e.g., >=14). For coverage reports, install `nyc` or use Jest's built-in if discrepancies arise. Link to open issues: None currently labeled "testing" or "flaky" in the repository.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Review test scripts and CI workflows to confirm command accuracy.
2. Update Quality Gates with current thresholds (coverage %, lint rules, required checks).
3. Document new test categories or suites introduced since the last update.
4. Record known flaky areas and link to open issues for visibility.
5. Confirm troubleshooting steps remain valid with current tooling.

<!-- agent-readonly:sources -->
## Acceptable Sources
- `package.json` scripts and testing configuration files.
- CI job definitions (GitHub Actions, CircleCI, etc.).
- Issue tracker items labelled “testing” or “flaky” with maintainer confirmation.

<!-- agent-update:end -->
