<plan>
---
id: plan-modulo-sinistros
ai_update_goal: "Define the stages, owners, and evidence required to complete Plano de Desenvolvimento: Módulo de Sinistros."
required_inputs:
  - "Task summary or issue link describing the goal"
  - "Relevant documentation sections from docs/README.md"
  - "Matching agent playbooks from agents/README.md"
success_criteria:
  - "Stages list clear owners, deliverables, and success signals"
  - "Plan references documentation and agent resources that exist today"
  - "Follow-up actions and evidence expectations are recorded"
related_agents:
  - "code-reviewer"
  - "bug-fixer"
  - "feature-developer"
  - "refactoring-specialist"
  - "test-writer"
  - "documentation-writer"
  - "performance-optimizer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
  - "architect-specialist"
  - "devops-specialist"
  - "database-specialist"
  - "mobile-specialist"
---

<!-- agent-update:start:plan-modulo-sinistros -->
# Plano de Desenvolvimento: Módulo de Sinistros Plan

> Implementação completa do módulo de gestão de sinistros, incluindo banco de dados, fluxos de status, formulários de abertura e visualização de detalhes, conforme Entrega 2 do projeto.

## Task Snapshot
- **Primary goal:** Develop and integrate a comprehensive claims management module (Módulo de Sinistros) that handles database schema for claims data, status workflows (e.g., pending, approved, rejected), user forms for initiating claims and viewing details, ensuring seamless integration with the existing `projeto/` structure.
- **Success signal:** The module is fully functional with end-to-end tests passing at 90%+ coverage, documentation updated in relevant guides, a successful staging deployment, and stakeholder approval via demo or review.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
  - [Project Overview](../docs/project-overview.md) for Entrega 2 specifications
  - Repository structure in `projeto/` for integration points

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Ensures code quality across the module's backend, frontend, and integration layers by catching issues early in PRs. | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | Addresses any defects identified during development or testing of claims workflows and forms. | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | Builds core features like claims forms and status flows based on project specs. | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | Improves existing code in `projeto/` to accommodate the new module without introducing technical debt. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | Creates tests for claims data handling, UI interactions, and workflow validations. | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | Updates guides with module-specific details, such as new domain concepts and usage instructions. | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | Tunes database queries and UI rendering for efficient claims processing. | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | Reviews data handling in claims for compliance with privacy and access controls. | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | Designs and implements server-side logic for claims status and integrations. | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Develops responsive forms and detail views for claims management. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | Ensures the module aligns with overall system patterns and scalability needs. | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | Sets up CI/CD pipelines for module deployment and monitoring. | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | Models schemas for claims data, including relationships to existing entities in `projeto/`. | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | Adapts claims viewing and submission for mobile interfaces if cross-platform support is required. | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

## Documentation Touchpoints
| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | agent-update:development-workflow | Branching rules, CI config, contributing guide |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | agent-update:testing-strategy | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | agent-update:glossary | Business terminology, user personas, domain rules |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | [security.md](../docs/security.md) | agent-update:security | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | agent-update:tooling | CLI scripts, IDE configs, automation workflows |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Integration conflicts with existing `projeto/` services | Medium | High | Conduct early API compatibility checks and mock integrations | Architect Specialist |
| Data privacy issues in claims handling | High | High | Perform security audit in Phase 1 and apply encryption standards | Security Auditor |
| Scope creep from stakeholder feedback on forms | Low | Medium | Lock requirements in discovery phase with signed-off specs | Feature Developer |

### Dependencies
- **Internal:** Alignment with core `projeto/` team for shared services; access to staging environment.
- **External:** Third-party libraries for form validation if not in-house; compliance with insurance regulations via legal review.
- **Technical:** Stable database version; updated CI/CD tools as per [tooling.md](../docs/tooling.md).

### Assumptions
- Current API schema in `projeto/` remains stable for integrations.
- Team has access to stakeholder notes for Entrega 2 details.
- If assumptions prove false: Escalate to project lead for spec revisions, adding 2-3 days to timeline.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 3 person-days | 3-5 days | 1-2 people |
| Phase 2 - Implementation | 10 person-days | 2-3 weeks | 3-4 people |
| Phase 3 - Validation | 4 person-days | 5-7 days | 2 people |
| **Total** | **17 person-days** | **3-5 weeks** | **-** |

### Required Skills
- Backend development (e.g., Node.js/Python for server logic), frontend (React/Vue for forms), database design (SQL/NoSQL optimization).
- Identify skill gaps: If mobile expertise lacking, outsource or train; review team profiles against [development-workflow.md](../docs/development-workflow.md).

### Resource Availability
- **Available:** Core team (Backend Specialist, Frontend Specialist, Database Specialist) full-time; others on-call.
- **Blocked:** Devops Specialist shared with another project—schedule 2 days/week.
- **Escalation:** Project lead (contact via Slack #projeto-channel) if resources drop below 80% allocation.

## Working Phases
### Phase 1 — Discovery & Alignment
**Owner:** Architect Specialist  
**Deliverables:** Requirements doc, initial schema draft, risk log.  
**Evidence Expectations:** Meeting notes, wireframes for forms, updated glossary entries.  

**Steps**  
1. Review Entrega 2 specs and `projeto/` structure; map claims workflows to existing data flows (consult [data-flow.md](../docs/data-flow.md)).  
2. Coordinate with stakeholders for clarifications on status flows and form fields; capture in shared doc.  
3. Draft database schema and architecture decisions (reference [architecture.md](../docs/architecture.md)).  

**Commit Checkpoint**  
- After completing this phase, capture the agreed context and create a commit (for example, `git commit -m "chore(plan): complete phase 1 discovery"`).

### Phase 2 — Implementation & Iteration
**Owner:** Feature Developer (with Backend/Frontend Specialists)  
**Deliverables:** Working prototype of claims module, including DB migrations, API endpoints, and UI forms.  
**Evidence Expectations:** Code diffs, integration test results, performance benchmarks.  

**Steps**  
1. Implement backend logic and database schema (use [backend-specialist.md](../agents/backend-specialist.md) playbook); pair with Database Specialist for optimizations.  
2. Build frontend forms and status views (follow [frontend-specialist.md](../agents/frontend-specialist.md)); iterate based on daily standups.  
3. Integrate with `projeto/` services; conduct code reviews every 2 days (involve Code Reviewer).  
4. Refactor any conflicts and add initial tests (consult [refactoring-specialist.md](../agents/refactoring-specialist.md) and [test-writer.md](../agents/test-writer.md)).  

**Commit Checkpoint**  
- Summarize progress, update cross-links, and create a commit documenting the outcomes of this phase (for example, `git commit -m "chore(plan): complete phase 2 implementation"`).

### Phase 3 — Validation & Handoff
**Owner:** Test Writer (with Security Auditor and Devops Specialist)  
**Deliverables:** Fully tested module, updated docs, deployment scripts.  
**Evidence Expectations:** Test reports (90%+ coverage), security scan results, deployment logs.  

**Steps**  
1. Run comprehensive tests including unit, integration, and E2E for claims flows (per [testing-strategy.md](../docs/testing-strategy.md)); fix bugs with Bug Fixer.  
2. Audit for security and performance (use [security-auditor.md](../agents/security-auditor.md) and [performance-optimizer.md](../agents/performance-optimizer.md)).  
3. Update documentation (e.g., add to [glossary.md](../docs/glossary.md) and [security.md](../docs/security.md)); deploy to staging via CI/CD ([devops-specialist.md](../agents/devops-specialist.md)).  
4. Demo to stakeholders and gather feedback for minor tweaks.  

**Commit Checkpoint**  
- Record the validation evidence and create a commit signalling the handoff completion (for example, `git commit -m "chore(plan): complete phase 3 validation"`).

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Critical bugs affecting core functionality
- Performance degradation beyond acceptable thresholds
- Data integrity issues detected
- Security vulnerabilities introduced
- User-facing errors exceeding alert thresholds

### Rollback Procedures
#### Phase 1 Rollback
- Action: Discard discovery branch, restore previous documentation state
- Data Impact: None (no production changes)
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: Revert commits via git reset, restore database to pre-migration snapshot using backups
- Data Impact: Minimal—rollback migrations before data population; no loss if caught early
- Estimated Time: 2-4 hours

#### Phase 3 Rollback
- Action: Full deployment rollback via CI/CD revert to previous tag, sync data from backup
- Data Impact: Temporary downtime; ensure claims data backups to avoid loss
- Estimated Time: 1-2 hours

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

<!-- agent-readonly:guidance -->
## Agent Playbook Checklist
1. Pick the agent that matches your task.
2. Enrich the template with project-specific context or links.
3. Share the final prompt with your AI assistant.
4. Capture learnings in the relevant documentation file so future runs improve.

## Evidence & Follow-up
- **Artifacts to collect:** PR links for code changes, test run reports (e.g., Jest/Cypress outputs), deployment logs from staging, updated docs diffs, stakeholder sign-off email.
- **Follow-up actions:** Schedule post-implementation review in 2 weeks (owner: Project lead); monitor production metrics for claims module; escalate any unresolved risks to architect.

<!-- agent-update:end -->

</plan>
