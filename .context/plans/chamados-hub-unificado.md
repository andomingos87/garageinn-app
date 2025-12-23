---
id: plan-chamados-hub-unificado
ai_update_goal: "Define the stages, owners, and evidence required to complete Página de Chamados - Hub Unificado."
required_inputs:
  - "Task summary from entrega1_tarefas.md"
  - "Database schema for tickets, departments, and units"
  - "Existing chamados/compras and chamados/manutencao implementations as reference"
success_criteria:
  - "Mock data replaced with real Supabase data from all departments"
  - "Navigation to ticket details working for all departments"
  - "New ticket creation modal with department selection"
  - "Filters for department, status, priority, and unit working"
  - "Server-side pagination implemented"
related_agents:
  - "feature-developer"
  - "backend-specialist"
  - "frontend-specialist"
  - "database-specialist"
---

<!-- agent-update:start:plan-chamados-hub-unificado -->
# Página de Chamados - Hub Unificado Plan

> Transformar a página `/chamados` em um hub funcional que exibe todos os chamados de todos os departamentos (Compras, Manutenção, RH) com dados reais do Supabase, navegação para detalhes, abertura de novos chamados, filtros avançados e paginação server-side.

## Task Snapshot
- **Primary goal:** Substituir dados mock da página `/chamados` por consultas reais ao Supabase, implementando um hub central para visualização e gestão de todos os chamados.
- **Success signal:** Página exibe chamados reais de todos os departamentos com filtros funcionais, navegação para detalhes e paginação server-side.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Chamados Compras Plan](./chamados-compras.md)
  - [Chamados Manutenção Plan](./chamados-manutencao.md)
  - [Dashboard Dados Reais Plan](./dashboard-dados-reais.md)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Feature Developer | Lead implementation | [Feature Developer](../agents/feature-developer.md) | Update ChamadosPage with data fetching logic |
| Backend Specialist | Query design | [Backend Specialist](../agents/backend-specialist.md) | Design unified query for all departments |
| Frontend Specialist | UI components | [Frontend Specialist](../agents/frontend-specialist.md) | Implement filters, table, and navigation |
| Database Specialist | Schema validation | [Database Specialist](../agents/database-specialist.md) | Verify indices and RLS policies |

## Documentation Touchpoints
| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Hub requirements from PRD |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | Next.js Server Components strategy |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | Supabase query patterns |

## Risk Assessment
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Query performance with multiple departments | Medium | Medium | Use single optimized query with JOIN | Backend Specialist |
| RLS blocking cross-department views | Low | High | Verify RLS policies allow user access | Database Specialist |

### Dependencies
- **Internal:** Access to `tickets`, `departments`, and `units` tables.
- **Technical:** Supabase client configured in `lib/supabase`.
- **Reference:** Existing implementations in `/chamados/compras` and `/chamados/manutencao`.

## Working Phases

### Phase 1 — Discovery & Requirements Analysis
**Owner:** Feature Developer

**Steps**
1. Analisar estrutura atual da página `/chamados`:
   - Arquivo: `apps/web/src/app/(app)/chamados/page.tsx`
   - Estado atual: Dados mock estáticos
   - Componentes: Card, Table, Badge, Button

2. Analisar implementações de referência:
   - `apps/web/src/app/(app)/chamados/compras/page.tsx` - modelo funcional
   - `apps/web/src/app/(app)/chamados/compras/actions.ts` - server actions
   - `apps/web/src/app/(app)/chamados/compras/components/` - componentes reutilizáveis

3. Mapear estrutura do banco de dados:
   - Tabela `tickets`: id, ticket_number, title, description, department_id, status, priority, unit_id, created_at
   - Tabela `departments`: id, name (Compras, Manutenção, RH, etc.)
   - Tabela `units`: id, name, code
   - Tabela `profiles`: id, full_name (para assigned_to)

4. Documentar requisitos funcionais:
   - [x] Listagem de todos os chamados de todos os departamentos
   - [x] Filtros: departamento, status, prioridade, unidade, busca por texto
   - [x] Ordenação por data de criação (mais recentes primeiro)
   - [x] Paginação server-side (20 itens por página)
   - [x] Navegação para detalhes baseada no departamento
   - [x] Botão de novo chamado com seleção de tipo

**Análise Concluída:**
- View `tickets_with_details` disponível com todos os campos necessários
- Departamentos com chamados: Compras, Manutenção, RH (principais)
- Padrão de referência: Server Components + Suspense + Server Actions

**Commit Checkpoint**
- `git commit -m "chore(plan): document chamados hub requirements"` [done]

---

### Phase 2 — Backend Implementation
**Owner:** Backend Specialist

**Steps**
1. Criar arquivo `apps/web/src/app/(app)/chamados/actions.ts`:

```typescript
// Server Actions para o Hub de Chamados
'use server'

import { createClient } from '@/lib/supabase/server'

export interface HubTicketFilters {
  search?: string
  department_id?: string
  status?: string
  priority?: string
  unit_id?: string
  page?: number
  limit?: number
}

export interface HubTicket {
  id: string
  ticket_number: number
  title: string
  department: { id: string; name: string }
  unit: { id: string; name: string } | null
  status: string
  priority: string | null
  created_at: string
  assigned_to: { id: string; full_name: string } | null
}

export async function getHubTickets(filters: HubTicketFilters) {
  const supabase = await createClient()
  const page = filters.page || 1
  const limit = filters.limit || 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('tickets')
    .select(`
      id,
      ticket_number,
      title,
      status,
      priority,
      created_at,
      department:departments!inner(id, name),
      unit:units(id, name),
      assigned_to:profiles!tickets_assigned_to_fkey(id, full_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,ticket_number.eq.${parseInt(filters.search) || 0}`)
  }
  if (filters.department_id) {
    query = query.eq('department_id', filters.department_id)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }
  if (filters.unit_id) {
    query = query.eq('unit_id', filters.unit_id)
  }

  const { data, count, error } = await query

  if (error) throw error

  return {
    data: data as HubTicket[],
    count: count || 0,
    page,
    limit,
  }
}

export async function getHubStats() {
  const supabase = await createClient()
  
  const [openResult, inProgressResult, resolvedResult, totalResult] = await Promise.all([
    supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'awaiting_triage'),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['in_progress', 'prioritized', 'quoted', 'approved']),
    supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['resolved', 'closed']),
    supabase.from('tickets').select('*', { count: 'exact', head: true }),
  ])

  return {
    awaiting_triage: openResult.count || 0,
    in_progress: inProgressResult.count || 0,
    resolved: resolvedResult.count || 0,
    total: totalResult.count || 0,
  }
}

export async function getDepartments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .select('id, name')
    .in('name', ['Compras', 'Manutenção', 'RH'])
    .order('name')
  
  if (error) throw error
  return data
}

export async function getUnits() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('units')
    .select('id, name, code')
    .eq('status', 'active')
    .order('name')
  
  if (error) throw error
  return data
}
```

2. Verificar índices no banco de dados:
   - [x] Índice em `tickets.department_id` (`idx_tickets_department_id`)
   - [x] Índice em `tickets.status` (`idx_tickets_status`)
   - [x] Índice em `tickets.created_at` (`idx_tickets_created_at` DESC)
   - [x] Índice em `tickets.unit_id` (`idx_tickets_unit_id`)

**Validação realizada:**
- Query `getHubTickets` testada: retorna chamados com todos os campos
- Query `getHubStats` testada: contagem por status funcionando
- Query `getDepartments` testada: retorna Compras, Manutenção, RH
- Query `getUnits` testada: retorna unidades ativas

**Commit Checkpoint**
- `git commit -m "feat(chamados): add server actions for hub page"` [done]

---

### Phase 3 — Frontend Implementation
**Owner:** Frontend Specialist

**Steps**
1. Criar estrutura de componentes em `apps/web/src/app/(app)/chamados/components/`:

```
chamados/
├── actions.ts                    # Server actions
├── page.tsx                      # Main page (updated)
├── loading.tsx                   # Loading skeleton
└── components/
    ├── index.ts                  # Barrel exports
    ├── hub-stats-cards.tsx       # Cards de estatísticas
    ├── hub-filters.tsx           # Filtros (departamento, status, etc.)
    ├── hub-table.tsx             # Tabela de chamados
    ├── hub-pagination.tsx        # Paginação
    ├── new-ticket-dialog.tsx     # Modal de novo chamado
    └── status-badge.tsx          # Badge de status unificado
```

2. Atualizar `apps/web/src/app/(app)/chamados/page.tsx`:

```typescript
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Ticket } from 'lucide-react'
import {
  getHubTickets,
  getHubStats,
  getDepartments,
  getUnits,
  type HubTicketFilters,
} from './actions'
import {
  HubStatsCards,
  HubFilters,
  HubTable,
  HubPagination,
  NewTicketDialog,
} from './components'

interface PageProps {
  searchParams: Promise<{
    search?: string
    department_id?: string
    status?: string
    priority?: string
    unit_id?: string
    page?: string
  }>
}

// Loading skeletons
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-[120px] rounded-lg" />
      ))}
    </div>
  )
}

function TableSkeleton() {
  return <Skeleton className="h-[400px] rounded-lg" />
}

// Server components
async function StatsSection() {
  const stats = await getHubStats()
  return <HubStatsCards stats={stats} />
}

async function FiltersSection() {
  const [departments, units] = await Promise.all([
    getDepartments(),
    getUnits(),
  ])
  return <HubFilters departments={departments} units={units} />
}

async function TicketsListSection({ filters }: { filters: HubTicketFilters }) {
  const result = await getHubTickets(filters)
  
  return (
    <>
      <HubTable tickets={result.data} />
      <HubPagination
        currentPage={result.page}
        totalCount={result.count}
        limit={result.limit}
      />
    </>
  )
}

export default async function ChamadosHubPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  const filters: HubTicketFilters = {
    search: params.search,
    department_id: params.department_id,
    status: params.status,
    priority: params.priority,
    unit_id: params.unit_id,
    page: params.page ? parseInt(params.page) : 1,
    limit: 20,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Chamados</h2>
          </div>
          <p className="text-muted-foreground mt-1">
            Hub central de chamados de todos os departamentos
          </p>
        </div>
        <NewTicketDialog />
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsSection />
      </Suspense>

      {/* Filters */}
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <FiltersSection />
      </Suspense>

      {/* Tickets Table */}
      <Suspense fallback={<TableSkeleton />}>
        <TicketsListSection filters={filters} />
      </Suspense>
    </div>
  )
}
```

3. Implementar componente `HubTable` com navegação para detalhes:
   - Ao clicar em um chamado de Compras → `/chamados/compras/[ticketId]`
   - Ao clicar em um chamado de Manutenção → `/chamados/manutencao/[ticketId]`
   - Ao clicar em um chamado de RH → `/chamados/rh/[ticketId]` (quando implementado)

4. Implementar `NewTicketDialog`:
   - Modal com seleção de departamento
   - Ao selecionar departamento, redirecionar para:
     - Compras → `/chamados/compras/novo`
     - Manutenção → `/chamados/manutencao/novo`
     - RH → `/chamados/rh/novo`

5. Status mapping (unificado para todos os departamentos):
   ```typescript
   const STATUS_MAP: Record<string, { label: string; variant: string }> = {
     awaiting_triage: { label: 'Aguardando Triagem', variant: 'outline' },
     prioritized: { label: 'Priorizado', variant: 'default' },
     in_progress: { label: 'Em Andamento', variant: 'default' },
     quoted: { label: 'Cotado', variant: 'secondary' },
     approved: { label: 'Aprovado', variant: 'default' },
     executing: { label: 'Em Execução', variant: 'default' },
     resolved: { label: 'Resolvido', variant: 'success' },
     closed: { label: 'Encerrado', variant: 'secondary' },
     cancelled: { label: 'Cancelado', variant: 'destructive' },
     denied: { label: 'Negado', variant: 'destructive' },
   }
   ```

**Commit Checkpoint**
- `git commit -m "feat(chamados): implement hub page with real data"` [pending]

---

### Phase 4 — Validation & Testing
**Owner:** Feature Developer

**Steps**
1. Testar listagem de chamados:
   - [ ] Verifica se todos os chamados aparecem (todos os departamentos)
   - [ ] Verifica se os dados são reais (não mock)
   - [ ] Verifica ordenação por data (mais recentes primeiro)

2. Testar filtros:
   - [ ] Filtro por departamento funciona
   - [ ] Filtro por status funciona
   - [ ] Filtro por prioridade funciona
   - [ ] Filtro por unidade funciona
   - [ ] Busca por título/número funciona
   - [ ] Múltiplos filtros combinados funcionam

3. Testar navegação:
   - [ ] Clique em chamado de Compras navega para `/chamados/compras/[id]`
   - [ ] Clique em chamado de Manutenção navega para `/chamados/manutencao/[id]`
   - [ ] Botão "Novo Chamado" abre modal com opções

4. Testar paginação:
   - [ ] Paginação funciona corretamente
   - [ ] URLs preservam filtros ao mudar página
   - [ ] Contagem total está correta

5. Verificar performance:
   - [ ] Página carrega em < 2 segundos
   - [ ] Queries otimizadas (verificar via Supabase dashboard)

6. Verificar segurança:
   - [ ] RLS permite acesso correto aos chamados
   - [ ] Usuários só veem chamados permitidos para seu perfil

**Commit Checkpoint**
- `git commit -m "test(chamados): validate hub page functionality"` [pending]

---

## Rollback Plan

### Rollback Triggers
- Página não carrega ou exibe erros críticos
- Performance degradada (> 5s de carregamento)
- Dados incorretos exibidos aos usuários

### Rollback Procedures
- Restaurar versão anterior de `apps/web/src/app/(app)/chamados/page.tsx`
- Reverter arquivos em `apps/web/src/app/(app)/chamados/components/`
- Remover `apps/web/src/app/(app)/chamados/actions.ts`
- Estimated Time: < 15 mins

## Evidence & Follow-up

### Artifacts to Collect
- [ ] Screenshot da página com dados reais
- [ ] Screenshot dos filtros funcionando
- [ ] Log de queries no Supabase dashboard
- [ ] Métricas de performance

### Follow-up Actions
- [ ] Implementar página de RH quando for priorizada
- [ ] Considerar adicionar export de chamados (CSV)
- [ ] Avaliar real-time updates via Supabase subscriptions

### Checklist de Tarefas (entrega1_tarefas.md)
- [ ] Analisar e documentar requisitos para página "Chamados" funcional → Phase 1
- [ ] Substituir dados mock por consulta real ao banco (todos os departamentos) → Phase 2 & 3
- [ ] Implementar navegação para detalhes ao clicar no chamado → Phase 3
- [ ] Implementar ação de abertura de novo chamado (escolha de tipo: Compras, Manutenção, RH) → Phase 3
- [ ] Implementar filtros (departamento, status, prioridade, unidade) → Phase 3
- [ ] Implementar paginação server-side → Phase 2 & 3

<!-- agent-update:end -->
