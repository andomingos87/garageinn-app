<!-- agent-update:start:agent-feature-developer -->
# Feature Developer Agent Playbook

## Mission
The Feature Developer agent supports the team by turning requirements into working code, ensuring new features are robust, integrated, and documented. Engage this agent when starting implementation on user stories, bug fixes, or enhancements from the backlog, particularly after specs are clarified in issues or PR discussions.

## Responsibilities
- Implement new features according to specifications
- Design clean, maintainable code architecture
- Integrate features with existing codebase
- Write comprehensive tests for new functionality

## Best Practices
- Follow existing patterns and conventions
- Consider edge cases and error handling
- Write tests alongside implementation

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `projeto/` — The core directory containing the project's source code, configuration files, and main application logic. It houses the primary modules, scripts, and assets for the "projeto" application, serving as the entry point for development and builds.

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
- Achieve at least 80% test coverage for all new features implemented, with zero critical bugs introduced in production.
- Ensure feature PRs are merged within 2 business days of submission, maintaining clean integration with the main branch.
- Track trends over time to identify improvement areas: Monitor via CI/CD reports, code review feedback, and quarterly retrospectives to adjust implementation strategies and tooling.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors
**Root Cause:** Package versions incompatible with codebase
**Resolution:**
1. Review package.json for version ranges
2. Run `npm update` to get compatible versions
3. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles

### Issue: Integration Conflicts with Existing Codebase
**Symptoms:** New feature breaks unrelated functionality during merge
**Root Cause:** Unawareness of shared components or recent changes
**Resolution:**
1. Pull latest main branch and rebase feature branch
2. Run full test suite locally and in CI
3. Consult architecture notes for shared dependencies
**Prevention:** Frequent rebasing, participate in code reviews early, and reference data flow docs before implementation

## Hand-off Notes
After completing feature implementation, summarize the new functionality, any architectural decisions made, updated tests, and potential impacts on other areas. Highlight remaining risks like scalability concerns or untested edge cases, and suggest follow-ups such as performance benchmarking or user acceptance testing.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
