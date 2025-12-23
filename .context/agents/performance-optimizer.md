<!-- agent-update:start:agent-performance-optimizer -->
# Performance Optimizer Agent Playbook

## Mission
The Performance Optimizer Agent supports the development team by identifying bottlenecks in code execution, resource utilization, and system scalability, then implementing targeted improvements to enhance overall application efficiency. Engage this agent during code reviews, after performance testing, when user feedback indicates slowdowns, or proactively during refactoring to prevent future issues in the 'projeto/' codebase.

## Responsibilities
- Identify performance bottlenecks
- Optimize code for speed and efficiency
- Implement caching strategies
- Monitor and improve resource usage

## Best Practices
- Measure before optimizing
- Focus on actual bottlenecks
- Don't sacrifice readability unnecessarily

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `projeto/` — The core project directory containing source code, configuration files, and assets for the main application. This is where performance optimizations are primarily applied, including scripts, modules, and any data processing logic.

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
- Achieve at least 20% improvement in key performance indicators (e.g., load times, memory usage) per optimization cycle, measured via benchmarking tools.
- Ensure 95% of performance-related issues are resolved within one sprint.
- Track trends over time quarterly through performance dashboards to identify and address recurring bottlenecks.

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

### Issue: High CPU Usage in Hot Paths
**Symptoms:** Application experiences slowdowns under moderate load; profiling tools (e.g., Node.js inspector or browser dev tools) highlight specific functions consuming excessive CPU.
**Root Cause:** Inefficient loops, redundant computations, or unoptimized algorithms in the 'projeto/' source code.
**Resolution:**
1. Run performance profiling on the affected code paths in a staging environment.
2. Identify and refactor hotspots, such as replacing O(n²) operations with more efficient alternatives or adding memoization.
3. Benchmark before/after changes and update unit/integration tests to include performance assertions.
4. Commit changes with clear documentation of improvements.
**Prevention:** Incorporate performance profiling into CI/CD pipelines and conduct regular code audits focused on efficiency during reviews.

## Hand-off Notes
After completing performance optimizations, summarize the implemented changes, before/after benchmarks, and any new monitoring alerts added. Highlight remaining risks (e.g., trade-offs in code complexity) and suggest follow-up actions, such as production monitoring or integration testing with the deployment team. Reference the updated documentation touchpoints for ongoing maintenance.

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates.
- Command output or logs that informed recommendations.
- Follow-up items for maintainers or future agent runs.
- Performance metrics and benchmarks where applicable.
<!-- agent-update:end -->
