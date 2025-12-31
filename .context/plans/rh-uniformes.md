---
id: plan-rh-uniformes
ai_update_goal: "Define the stages, owners, and evidence required to complete Implementação de Chamados de RH e Gestão de Uniformes."
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

<!-- agent-update:start:plan-rh-uniformes -->
# Implementação de Chamados de RH e Gestão de Uniformes Plan

> Este plano detalha a implementação das funcionalidades de RH no sistema GAPP, incluindo a abertura e listagem de chamados de RH, o fluxo de execução e a gestão completa de uniformes (compra, estoque e retirada).

## Task Snapshot
- **Primary goal:** Implementar o sistema de chamados do departamento de RH e a gestão completa de uniformes (estoque, compra e retirada).
- **Success signal:** Usuários conseguem abrir chamados de RH (gerais e de uniformes), o departamento de RH consegue triar e executar esses chamados, e a retirada de uniformes atualiza automaticamente o estoque e gera registros de transação.
- **Key references:**
  - [PRD](../projeto/PRD.md)
  - [Entrega 1 - Tarefas](../projeto/entregaveis/entrega1_tarefas.md)
  - [Abertura de Chamados](../projeto/chamados/abertura.md)
  - [Execuções de Chamados](../projeto/chamados/execuções.md)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | TODO: Describe why this agent is involved. | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Bug Fixer | TODO: Describe why this agent is involved. | [Bug Fixer](../agents/bug-fixer.md) | Analyze bug reports and error messages |
| Feature Developer | TODO: Describe why this agent is involved. | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |
| Refactoring Specialist | TODO: Describe why this agent is involved. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Identify code smells and improvement opportunities |
| Test Writer | TODO: Describe why this agent is involved. | [Test Writer](../agents/test-writer.md) | Write comprehensive unit and integration tests |
| Documentation Writer | TODO: Describe why this agent is involved. | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |
| Performance Optimizer | TODO: Describe why this agent is involved. | [Performance Optimizer](../agents/performance-optimizer.md) | Identify performance bottlenecks |
| Security Auditor | TODO: Describe why this agent is involved. | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Backend Specialist | TODO: Describe why this agent is involved. | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | TODO: Describe why this agent is involved. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Architect Specialist | TODO: Describe why this agent is involved. | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Devops Specialist | TODO: Describe why this agent is involved. | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Database Specialist | TODO: Describe why this agent is involved. | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Mobile Specialist | TODO: Describe why this agent is involved. | [Mobile Specialist](../agents/mobile-specialist.md) | Develop native and cross-platform mobile applications |

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
| TODO: Dependency on external team | Medium | High | Early coordination meeting, clear requirements | TODO: Name |
| TODO: Insufficient test coverage | Low | Medium | Allocate time for test writing in Phase 2 | TODO: Name |

### Dependencies
- **Internal:** TODO: List dependencies on other teams, services, or infrastructure
- **External:** TODO: List dependencies on third-party services, vendors, or partners
- **Technical:** TODO: List technical prerequisites or required upgrades

### Assumptions
- TODO: Document key assumptions being made (e.g., "Assume current API schema remains stable")
- TODO: Note what happens if assumptions prove false

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | TODO: e.g., 2 person-days | 3-5 days | 1-2 people |
| Phase 2 - Implementation | TODO: e.g., 5 person-days | 1-2 weeks | 2-3 people |
| Phase 3 - Validation | TODO: e.g., 2 person-days | 3-5 days | 1-2 people |
| **Total** | **TODO: total** | **TODO: total** | **-** |

### Required Skills
- TODO: List required expertise (e.g., "React experience", "Database optimization", "Infrastructure knowledge")
- TODO: Identify skill gaps and training needs

### Resource Availability
- **Available:** TODO: List team members and their availability
- **Blocked:** TODO: Note any team members with conflicting priorities
- **Escalation:** TODO: Name of person to contact if resources are insufficient

## Working Phases
### Phase 1 — Discovery & Database Schema
**Steps**
1. Mapear todos os tipos de chamados de RH e campos específicos (Salários, Benefícios, Uniformes, etc.).
2. Definir o schema das tabelas `uniforms`, `uniform_transactions` e `ticket_rh_details`.
3. Criar migrations no Supabase para as novas tabelas e políticas de RLS.
4. Gerar tipos TypeScript atualizados.

**Commit Checkpoint**
- Migrations aplicadas e tipos gerados. `git commit -m "feat(db): add rh tickets and uniforms schema"`

### Phase 2 — Implementation of RH Tickets
**Steps**
1. Implementar `Server Actions` para criação e listagem de chamados de RH em `apps/web/src/app/(app)/chamados/rh/actions.ts`.
2. Criar a tela de abertura de chamado de RH (`novo/page.tsx`) com formulário dinâmico baseado no tipo de solicitação.
3. Criar a tela de listagem de chamados de RH (`page.tsx`) integrada ao Hub Unificado.
4. Implementar a tela de detalhes e triagem de chamados de RH.

**Commit Checkpoint**
- Fluxo básico de chamados de RH funcional. `git commit -m "feat(rh): implement rh ticket creation and listing"`

### Phase 3 — Uniform Management & Execution
**Steps**
1. Implementar a interface de gestão de estoque de uniformes (CRUD e visualização de transações).
2. Implementar o fluxo de execução de chamados de uniforme:
   - Ao marcar como "Entregue", dar baixa no estoque automaticamente.
   - Gerar registro na tabela `uniform_transactions`.
3. Adicionar validações de estoque mínimo e alertas visuais.
4. Testar o fluxo completo de ponta a ponta.

**Commit Checkpoint**
- Gestão de uniformes concluída. `git commit -m "feat(rh): implement uniform management and execution flow"`

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
- Action: TODO: Revert commits, restore database to pre-migration snapshot
- Data Impact: TODO: Describe any data loss or consistency concerns
- Estimated Time: TODO: e.g., 2-4 hours

#### Phase 3 Rollback
- Action: TODO: Full deployment rollback, restore previous version
- Data Impact: TODO: Document data synchronization requirements
- Estimated Time: TODO: e.g., 1-2 hours

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
- **Evidências:**
  - Screenshots das novas telas (Abertura, Listagem, Detalhes).
  - Logs do banco de dados mostrando transações de uniformes.
  - Testes de ponta a ponta simulando abertura e entrega de uniforme.
- **Follow-ups:**
  - Integrar alertas de estoque baixo com sistema de notificações (futuro).
  - Gerar relatórios de consumo de uniformes por unidade/usuário.

<!-- agent-update:end -->
