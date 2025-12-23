<!-- agent-update:start:agent-bug-fixer -->
# Bug Fixer Agent Playbook

## Mission
The Bug Fixer Agent supports the development team by systematically identifying, diagnosing, and resolving defects in the codebase. Engage this agent when a bug report is filed, an error occurs during testing or production, or when code reviews uncover potential issues. It ensures fixes are reliable, well-tested, and documented to maintain project stability.

## Responsibilities
- Analyze bug reports and error messages
- Identify root causes of issues
- Implement targeted fixes with minimal side effects
- Test fixes thoroughly before deployment

## Best Practices
- Reproduce the bug before fixing
- Write tests to prevent regression
- Document the fix for future reference

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `projeto/` — The main project directory containing source code, configuration files, assets, and other core resources for the application.

## Documentation Touchpoints
- [Documentation Index](../docs/README.md) — agent-update:docs-index
- [Project Overview](../docs/project-overview.md) — agent-update:project-overview
- [Architecture Notes](../docs/architecture.md) — agent-update:architecture-notes
- [Development Workflow](../docs/development-workflow.md) — agent-update:development-workflow
- [Testing Strategy](../docs/testing-strategy.md) — agent-update:testing-strategy
- [Glossary & Domain Concepts](../docs/glossary.md) — agent-update:glossary
- [Data Flow & Integrations](../docs/data-flow.md) — agent-update:data-flow
- [Security & Compliance Notes](../docs/security.md) — agent-update:security
- [Tooling & Productivity Guide](../docs/tooling.md) — agent-update:tooling

<!-- agent-readonly:guidance -->
## Collaboration Checklist
1. Confirm assumptions with issue reporters or maintainers.
2. Review open pull requests affecting this area.
3. Update the relevant doc section listed above and remove any resolved `agent-fill` placeholders.
4. Capture learnings back in [docs/README.md](../docs/README.md) or the appropriate task marker.

## Success Metrics
Track effectiveness of this agent's contributions:
- **Code Quality:** Reduced bug count, improved test coverage, decreased technical debt
- **Velocity:** Time to complete typical tasks, deployment frequency
- **Documentation:** Coverage of features, accuracy of guides, usage by team
- **Collaboration:** PR review turnaround time, feedback quality, knowledge sharing

**Target Metrics:**
- Reduce bug resolution time by 30% for high-priority issues.
- Achieve 95% test coverage on fixed modules to prevent regressions.
- Track trends over time to identify improvement areas, such as through bi-weekly bug trend reports and quarterly retrospectives on common failure patterns.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: [Common Problem]
**Symptoms:** Describe what indicates this problem
**Root Cause:** Why this happens
**Resolution:** Step-by-step fix
**Prevention:** How to avoid in the future

**Example:**
### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors
**Root Cause:** Package versions incompatible with codebase
**Resolution:**
1. Review package.json for version ranges
2. Run `npm update` to get compatible versions
3. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles

### Issue: Integration Test Flakiness in CI
**Symptoms:** Tests pass locally but fail intermittently in CI pipelines
**Root Cause:** Environment differences, such as network latency or resource constraints in CI runners
**Resolution:**
1. Isolate the test and run it multiple times locally to reproduce
2. Mock external dependencies to reduce variability
3. Update CI configuration to increase timeouts or use dedicated runners
4. Commit and re-run the pipeline to verify
**Prevention:** Implement retry logic for flaky tests and standardize CI environments with Docker

## Hand-off Notes
After completing a fix, the agent should summarize: the bug description and root cause; changes made (including new tests); verification steps performed; any remaining risks (e.g., performance impacts); and suggested follow-ups like monitoring post-deployment or updating related docs.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., "Fixed based on issue #45 and commit abc123").
- Command output or logs that informed recommendations (e.g., "Error logs from failing build: [paste snippet]").
- Follow-up items for maintainers or future agent runs (e.g., "Monitor deployment for side effects in production").
- Performance metrics and benchmarks where applicable (e.g., "Pre-fix load time: 2s; Post-fix: 1.2s").
<!-- agent-update:end -->
