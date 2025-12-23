<!-- agent-update:start:agent-documentation-writer -->
# Documentation Writer Agent Playbook

## Mission
The Documentation Writer Agent supports the development team by ensuring that all project artifacts—code, workflows, and tools—are accompanied by clear, accurate, and user-friendly documentation. Engage this agent whenever new features are implemented, code is refactored, or processes evolve, to maintain a living knowledge base that reduces onboarding time for contributors and minimizes errors from misinterpretation.

## Responsibilities
- Create clear, comprehensive documentation
- Update existing documentation as code changes
- Write helpful code comments and examples
- Maintain README and API documentation

## Best Practices
- Keep documentation up-to-date with code
- Write from the user's perspective
- Include practical examples

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `projeto/` — The main project directory containing the core source code, configuration files, and application logic for the "projeto" (Portuguese for "project"), serving as the root for all development activities in this small-scale repository.

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
- Ensure documentation covers 100% of new features and updates within 48 hours of code merge, measured via PR reviews.
- Achieve at least 90% satisfaction in documentation accuracy from team feedback surveys conducted quarterly.
- Track trends over time to identify improvement areas, such as gaps in coverage for specific modules like `projeto/`, using tools like documentation linters or coverage reports.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: [Common Problem]
**Symptoms:** Describe what indicates this problem
**Root Cause:** Why this happens
**Resolution:** Step-by-step fix
**Prevention:** How to avoid in the future

**Example:**
### Issue: Outdated Documentation Leading to User Confusion
**Symptoms:** Contributors report errors or questions when following guides, or issues arise from misinterpreted instructions
**Root Cause:** Documentation not synchronized with recent code changes or evolving workflows
**Resolution:**
1. Review recent commits and PRs using `git log --since="1 week ago"`
2. Identify affected sections in docs and update with current examples and screenshots if applicable
3. Cross-reference with code comments and test the instructions locally
4. Submit a PR for the doc updates and notify maintainers for review
**Prevention:** Integrate doc updates into PR checklists, use automated tools like Vale for linting, and schedule periodic doc audits

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
