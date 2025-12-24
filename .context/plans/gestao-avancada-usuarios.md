<plan>
---
id: plan-gestao-avancada-usuarios
ai_update_goal: "Define the stages, owners, and evidence required to complete Gestão Avançada de Usuários (Admin)."
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

<!-- agent-update:start:plan-gestao-avancada-usuarios -->
# Gestão Avançada de Usuários (Admin) Plan

> Implementar funcionalidades administrativas para gerenciamento de usuários: exclusão (soft delete), reenvio de convite, edição de email e indicadores visuais de status do convite.

## Task Snapshot
- **Primary goal:** Deliver admin tools for advanced user management, including soft deletion of users, resending invitations, editing user emails, and frontend visual indicators for invitation statuses, ensuring secure and performant integration with the existing auth and database systems.
- **Success signal:** Features are fully implemented, pass all security and performance checks, achieve 90%+ test coverage, are documented in relevant guides, and are deployed via CI/CD without regressions.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Ensure all code changes meet quality standards, adhere to architecture patterns, and follow security best practices during PR reviews. | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | Identify and resolve any bugs arising from user management logic, such as invitation resend failures or soft delete inconsistencies. | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | Build the core admin features, including API endpoints for user actions and UI components for status indicators. | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | Refactor existing user model and admin interfaces to support soft delete without disrupting current workflows. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | Create unit, integration, and E2E tests for user management features, focusing on edge cases like concurrent edits. | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | Update docs with new admin workflows, API specs, and user guides for the advanced features. | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | Optimize database queries for user listings and soft deletes to handle large user bases efficiently. | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | Audit user actions for vulnerabilities, such as unauthorized email edits or invitation leaks. | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | Implement server-side logic for soft delete, invitation resend, and email updates, integrating with auth services. | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Develop admin UI for user management, including visual indicators for invitation statuses. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | Design the overall integration of new features into the system architecture, ensuring scalability. | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | Update CI/CD pipelines to include new tests and deployment scripts for admin features. | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | Modify schema for soft delete flags and invitation status fields, with migration scripts. | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | If mobile admin interfaces are needed, adapt features for cross-platform compatibility; otherwise, support web-to-mobile data sync. | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

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
| Security vulnerabilities in user data handling (e.g., improper soft delete exposing data) | High | High | Conduct early security audit and implement role-based access controls | Security Auditor |
| Database migration issues causing downtime | Medium | High | Test migrations in staging environment with rollback scripts | Database Specialist |
| Integration conflicts with existing auth system | Medium | Medium | Align with architecture notes and conduct integration testing early | Architect Specialist |

### Dependencies
- **Internal:** Existing user auth service in `projeto/`; database schema from current user model.
- **External:** Email service provider for invitation resends (e.g., if using SendGrid or similar).
- **Technical:** Node.js backend stability; frontend framework (e.g., React) for UI updates.

### Assumptions
- Current user model includes fields for email and invitation status that can be extended without full redesign.
- Soft delete will use a flag rather than physical removal to comply with data retention policies.
- If assumptions prove false (e.g., schema incompatible), escalate to Architect Specialist for redesign and add 2-3 days to timeline.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 3 person-days | 3-5 days | 1-2 people |
| Phase 2 - Implementation | 8 person-days | 1-2 weeks | 3-4 people |
| Phase 3 - Validation | 4 person-days | 5-7 days | 2-3 people |
| **Total** | **15 person-days** | **2-4 weeks** | **-** |

### Required Skills
- Backend development (Node.js/Express, API design)
- Database management (SQL migrations, indexing)
- Frontend UI/UX (React/Vue for admin panels)
- Security auditing (OWASP principles)
- Identify skill gaps and training needs: If mobile integration needed, provide cross-platform training for Mobile Specialist.

### Resource Availability
- **Available:** Core team including Backend Specialist, Frontend Specialist, and Database Specialist (full-time next sprint).
- **Blocked:** Security Auditor available only part-time due to other audits.
- **Escalation:** Project lead (human maintainer) if resources insufficient for deadline.

## Working Phases
### Phase 1 — Discovery & Alignment
**Owner:** Architect Specialist  
**Deliverables:** Requirements doc, schema design, updated glossary entries for user statuses.  
**Evidence Expectations:** Design diagrams (e.g., ERD for soft delete), meeting notes with stakeholder sign-off, initial risk log.  

**Steps**  
1. Review current user management code in `projeto/` and align requirements with [Security & Compliance Notes](../docs/security.md) and [Glossary & Domain Concepts](../docs/glossary.md). Owner: Architect Specialist.  
2. Design database changes for soft delete and invitation fields; capture open questions on email service integration. Owner: Database Specialist.  

**Commit Checkpoint**  
- After completing this phase, capture the agreed context and create a commit (for example, `git commit -m "chore(plan): complete phase 1 discovery"`).

### Phase 2 — Implementation & Iteration
**Owner:** Feature Developer (with pairing from Backend and Frontend Specialists)  
**Deliverables:** Working API endpoints, admin UI prototypes, initial tests; refactored user model.  
**Evidence Expectations:** Code diffs in feature branch, performance benchmarks pre/post changes, integration test results.  

**Steps**  
1. Implement backend logic for soft delete, resend invitation, and email edit using [Backend Specialist](../agents/backend-specialist.md) playbook; pair with Database Specialist for migrations. Owner: Backend Specialist.  
2. Build frontend admin interface with visual indicators per [Frontend Specialist](../agents/frontend-specialist.md); iterate based on daily reviews. Owner: Frontend Specialist.  
3. Refactor existing code for compatibility and optimize queries. Owner: Refactoring Specialist and Performance Optimizer.  

**Commit Checkpoint**  
- Summarize progress, update cross-links, and create a commit documenting the outcomes of this phase (for example, `git commit -m "chore(plan): complete phase 2 implementation"`).

### Phase 3 — Validation & Handoff
**Owner:** Test Writer (with reviews from Code Reviewer and Security Auditor)  
**Deliverables:** Full test suite, updated docs, deployment artifacts; security audit report.  
**Evidence Expectations:** Test coverage report (>90%), PR approval logs, deployment success in staging, user acceptance notes.  

**Steps**  
1. Write and run tests for all features using [Testing Strategy](../docs/testing-strategy.md); fix bugs iteratively. Owner: Test Writer and Bug Fixer.  
2. Conduct code reviews, security audits, and documentation updates per [Development Workflow](../docs/development-workflow.md). Owner: Code Reviewer, Security Auditor, Documentation Writer.  
3. Deploy to staging via CI/CD and verify end-to-end functionality. Owner: Devops Specialist.  

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
- Action: Revert feature branch commits, rollback database migrations to previous schema
- Data Impact: Minimal; soft deletes are reversible, no permanent data loss if caught early
- Estimated Time: 2-4 hours

#### Phase 3 Rollback
- Action: Full deployment rollback via CI/CD to previous version, restore staging data snapshot
- Data Impact: Sync invitation statuses from backups; monitor for email queue backlogs
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
- List artifacts to collect: PR links for implementation and docs updates, test run reports (e.g., Jest/Cypress outputs), security scan results, deployment logs from CI/CD, updated sections in [Data Flow & Integrations](../docs/data-flow.md) and [Security & Compliance Notes](../docs/security.md).
- Record follow-up actions or owners: Monitor production user management metrics for 1 week post-deploy (Owner: Devops Specialist); schedule user feedback session if visual indicators need tweaks (Owner: Frontend Specialist); escalate any unresolved assumptions to project lead.

<!-- agent-update:end -->

</plan>
