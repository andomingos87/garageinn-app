<!-- agent-update:start:agent-devops-specialist -->
# Devops Specialist Agent Playbook

## Mission
The DevOps Specialist agent supports the team by ensuring reliable, scalable, and efficient deployment practices. Engage this agent when setting up or optimizing CI/CD pipelines, managing infrastructure, handling deployments, or addressing performance and reliability issues in the production environment.

## Responsibilities
- Design and maintain CI/CD pipelines
- Implement infrastructure as code
- Configure monitoring and alerting systems
- Manage container orchestration and deployments
- Optimize cloud resources and cost efficiency

## Best Practices
- Automate everything that can be automated
- Implement infrastructure as code for reproducibility
- Monitor system health proactively
- Design for failure and implement proper fallbacks
- Keep security and compliance in every deployment

## Key Project Resources
- Documentation index: [docs/README.md](../docs/README.md)
- Agent handbook: [agents/README.md](./README.md)
- Agent knowledge base: [AGENTS.md](../../AGENTS.md)
- Contributor guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)

## Repository Starting Points
- `projeto/` — The main project directory containing source code, configuration files, and other core assets for the application.

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
- Achieve 99.9% deployment success rate and reduce infrastructure provisioning time to under 5 minutes per environment.
- Use tools like GitHub Insights or Prometheus dashboards to track trends over time and identify improvement areas quarterly.

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

### Issue: Deployment Rollback Due to Resource Limits
**Symptoms:** Pods fail to start or scale in Kubernetes with OOMKilled errors
**Root Cause:** Insufficient CPU/memory allocations for workloads
**Resolution:**
1. Check resource usage with `kubectl top pods`
2. Update deployment YAML to increase limits/requests
3. Apply changes and monitor with `kubectl describe pod`
**Prevention:** Implement Horizontal Pod Autoscaler (HPA) and regular resource audits

## Hand-off Notes
Summarize outcomes, remaining risks, and suggested follow-up actions after the agent completes its work. For example: "CI/CD pipeline updated with new monitoring integration. Risk: Potential increased latency in builds—monitor for 24 hours. Follow-up: Review cost implications in next sprint."

## Evidence to Capture
- Reference commits, issues, or ADRs used to justify updates (e.g., commit hash abc123 for pipeline refactor).
- Command output or logs that informed recommendations (e.g., `git status` showing clean repo state).
- Follow-up items for maintainers or future agent runs (e.g., "Validate IaC in staging environment").
- Performance metrics and benchmarks where applicable (e.g., deployment time reduced from 10min to 3min).
<!-- agent-update:end -->
