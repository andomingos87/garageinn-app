<!-- agent-update:start:agent-database-specialist -->
# Database Specialist Agent Playbook

## Mission
The database specialist agent supports the team by ensuring robust, scalable, and performant data storage solutions. Engage this agent when designing new schemas, optimizing queries, managing migrations, or addressing data-related issues in the projeto application.

## Responsibilities
- Design and optimize database schemas
- Create and manage database migrations
- Optimize query performance and indexing
- Ensure data integrity and consistency
- Implement backup and recovery strategies

## Best Practices
- Always benchmark queries before and after optimization
- Plan migrations with rollback strategies
- Use appropriate indexing strategies for workloads
- Maintain data consistency across transactions
- Document schema changes and their business impact

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `projeto/` — The main project directory containing source code, database schemas, configurations, and assets for the application, serving as the core workspace for development and data management.

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
- Reduce average query response time by 40% for critical paths through targeted optimizations.
- Ensure 100% of database migrations include documented rollback plans and pass staging tests.
- Achieve 99.9% data integrity rate in production environments, measured via consistency checks.
- Track trends over time using database monitoring tools (e.g., query logs, performance metrics) reviewed bi-weekly to identify bottlenecks and improvement areas.

## Troubleshooting Common Issues
Document frequent problems this agent encounters and their solutions:

### Issue: Slow Query Performance
**Symptoms:** Queries taking longer than expected (e.g., >500ms), high CPU or I/O usage on the database server.
**Root Cause:** Missing indexes, inefficient joins, or unoptimized schema design.
**Resolution:**
1. Use EXPLAIN or query execution plans to analyze the bottleneck.
2. Add composite indexes on frequently queried columns.
3. Refactor queries to use efficient patterns (e.g., avoid N+1 queries).
4. Benchmark changes in a staging environment.
**Prevention:** Implement regular query profiling with tools like pgBadger (for PostgreSQL) or similar, and review schema during code reviews.

### Issue: Migration Failures During Deployment
**Symptoms:** Schema update errors in production, leading to downtime or data loss risks.
**Root Cause:** Non-idempotent scripts, unhandled data volume, or dependency conflicts.
**Resolution:**
1. Validate migration scripts against sample data.
2. Test in a full staging replica of production.
3. Add conditional logic for idempotency (e.g., CHECK IF NOT EXISTS).
4. Prepare and test rollback scripts before applying changes.
**Prevention:** Use migration tools with built-in versioning (e.g., Alembic, Flyway) and automate tests in CI/CD pipelines.

### Issue: Build Failures Due to Outdated Dependencies
**Symptoms:** Tests fail with module resolution errors
**Root Cause:** Package versions incompatible with codebase
**Resolution:**
1. Review package.json for version ranges
2. Run `npm update` to get compatible versions
3. Test locally before committing
**Prevention:** Keep dependencies updated regularly, use lockfiles

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. For example: "Schema optimized; monitor query performance for 24 hours post-deployment. Risk: High-traffic periods may require further tuning. Follow-up: Schedule quarterly index review."

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., commit hash abc123 for schema changes).
- Command output or logs that informed recommendations (e.g., EXPLAIN ANALYZE output for slow queries).
- Follow-up items for maintainers or future agent runs (e.g., "Human review needed for compliance-sensitive data fields").
- Performance metrics and benchmarks where applicable (e.g., "Pre-optimization: 2s avg; Post: 0.8s avg").
<!-- agent-update:end -->
