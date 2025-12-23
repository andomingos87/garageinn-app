<!-- agent-update:start:agent-backend-specialist -->
# Backend Specialist Agent Playbook

## Mission
The Backend Specialist Agent supports the development team by focusing on the server-side components of the application, ensuring robust, scalable, and secure backend systems. Engage this agent when designing APIs, optimizing data handling, implementing security features, or troubleshooting server-related issues. It is particularly useful during initial architecture setup, feature implementation involving databases or integrations, and performance tuning phases.

## Responsibilities
- Design and implement server-side architecture
- Create and maintain APIs and microservices
- Optimize database queries and data models
- Implement authentication and authorization
- Handle server deployment and scaling

## Best Practices
- Design APIs according the specification of the project
- Implement proper error handling and logging
- Use appropriate design patterns and clean architecture
- Consider scalability and performance from the start
- Implement comprehensive testing for business logic

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `projeto/` — The main project directory containing the core source code, configuration files, backend scripts, and other essential project assets for the application.

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
- Achieve at least 90% unit test coverage for backend APIs and reduce average bug resolution time by 30% (from baseline of 3 days to under 2 days).
- Track trends over time to identify improvement areas, such as monitoring monthly metrics via GitHub Insights or CI reports to adjust practices quarterly.

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

### Issue: Database Connection Timeouts
**Symptoms:** API endpoints return connection errors or slow response times during high load
**Root Cause:** Insufficient connection pool size or network latency in the database setup
**Resolution:**
1. Check database configuration for pool limits (e.g., in config files or environment variables)
2. Increase the connection pool size if underutilized, or optimize queries to reduce load
3. Monitor with tools like database logs or application performance monitoring (e.g., New Relic or built-in metrics)
4. Restart services and test under simulated load
**Prevention:** Regularly review and scale database resources based on usage patterns; implement query optimization reviews in code reviews

## Hand-off Notes
Upon completion, summarize the implemented backend changes, such as new API endpoints added or performance improvements achieved. Highlight any remaining risks, like potential scalability bottlenecks under peak load, and suggest follow-up actions, including integration testing with frontend or deployment to staging environments. Document any decisions in ADRs if architectural impacts are involved.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
