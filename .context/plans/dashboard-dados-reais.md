---
id: plan-dashboard-dados-reais
ai_update_goal: "Define the stages, owners, and evidence required to complete Dashboard com Dados Reais."
required_inputs:
  - "Task summary from entrega1_tarefas.md"
  - "Database schema for tickets, units, and checklist_executions"
success_criteria:
  - "Mock data replaced with real Supabase data"
  - "Accurate counters for open tickets, checklists today, and active units"
  - "Recent tickets and pending checklists lists updated dynamically"
  - "Performance optimized with efficient queries"
related_agents:
  - "feature-developer"
  - "backend-specialist"
  - "frontend-specialist"
  - "database-specialist"
---

<!-- agent-update:start:plan-dashboard-dados-reais -->
# Dashboard com Dados Reais Plan

> Substituir dados mock por dados reais do banco de dados (Supabase) no dashboard principal, incluindo métricas, chamados recentes e checklists pendentes.

## Task Snapshot
- **Primary goal:** Implement dynamic dashboard powered by Supabase real-time data or efficient server-side fetching.
- **Success signal:** The dashboard reflects the actual state of the database for all 4 KPI cards and both activity lists.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Database Schema](../lib/supabase/database.types.ts)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Feature Developer | Lead implementation | [Feature Developer](../agents/feature-developer.md) | Update DashboardPage with data fetching logic |
| Backend Specialist | Query optimization | [Backend Specialist](../agents/backend-specialist.md) | Ensure efficient SQL/Supabase queries for dashboard metrics |
| Frontend Specialist | UI integration | [Frontend Specialist](../agents/frontend-specialist.md) | Handle loading states and error handling in dashboard cards |
| Database Specialist | Schema validation | [Database Specialist](../agents/database-specialist.md) | Verify data relations and indices for performance |

## Documentation Touchpoints
| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Dashboard requirements from PRD |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | Next.js Server Components vs Client Components strategy |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | Supabase query patterns |

## Risk Assessment
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Slow dashboard load due to complex counts | Medium | High | Use consolidated RPC or optimized parallel queries | Backend Specialist |
| Data inconsistency between cards | Low | Medium | Use consistent timestamps for "today" metrics | Frontend Specialist |

### Dependencies
- **Internal:** Access to `tickets`, `units`, and `checklist_executions` tables.
- **Technical:** Supabase client configured and available in `lib/supabase`.

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Finalized SQL queries for each KPI:
   - **Chamados Abertos**: `SELECT count(*) FROM tickets WHERE status NOT IN ('resolved', 'closed', 'cancelled')`.
   - **Checklists Hoje**: 
     - Realizados: `SELECT count(*) FROM checklist_executions WHERE started_at >= CURRENT_DATE`.
     - Total Esperado: `SELECT count(*) FROM unit_checklist_templates`.
   - **Unidades Ativas**: `SELECT count(*) FROM units WHERE status = 'active'`.
   - **Taxa de Resolução**: `(resolved_count / total_count) * 100` where queries filter by `created_at >= (now() - interval '30 days')`.
2. Data structure for Activity Lists:
   - **Chamados Recentes**: `SELECT t.ticket_number, t.title, t.status, d.name as department_name FROM tickets t JOIN departments d ON t.department_id = d.id ORDER BY t.created_at DESC LIMIT 5`.
   - **Checklists Pendentes**: Query units with templates but no executions today using a `LEFT JOIN` on `checklist_executions`.

**Commit Checkpoint**
- `git commit -m "chore(plan): define dashboard queries and data mapping"` [completed]

### Phase 2 — Implementation & Iteration
**Steps**
1. Implement server-side data fetching in `apps/web/src/app/(app)/page.tsx` using `createClient` from `@/lib/supabase/server`.
2. Update the `DashboardPage` to use `Promise.all` for parallel fetching of KPIs and lists.
3. Map database status strings to user-friendly labels (e.g., `in_progress` -> `Em Andamento`).
4. Replace mock UI with dynamic components.

**Commit Checkpoint**
- `git commit -m "feat(dashboard): replace mock data with real supabase data"` [completed]

### Phase 3 — Validation & Handoff
**Steps**
1. Verify counts against raw database queries using `mcp_supabase_execute_sql`. [completed]
2. Check for visual regressions in the dashboard layout. [completed]
3. Ensure error boundaries or fallback UI is in place for database connection issues. [completed]

**Commit Checkpoint**
- `git commit -m "chore(plan): dashboard validation complete"` [completed]

## Rollback Plan
### Rollback Triggers
- Dashboard fails to load or shows infinite loading.
- Extreme performance degradation (> 3s load time).
- Incorrect data displayed to users.

### Rollback Procedures
- Revert changes to `apps/web/src/app/(app)/page.tsx`.
- Estimated Time: < 15 mins.

## Evidence & Follow-up
- Screenshot of the dashboard with real data (captured via manual verification).
- Query performance: All queries are executed in parallel on the server-side.
- Follow-up: Add real-time subscriptions if high frequency of updates is needed.
<!-- agent-update:end -->
