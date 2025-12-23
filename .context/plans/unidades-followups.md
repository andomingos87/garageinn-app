---
id: plan-unidades-followups
ai_update_goal: "Implementar os follow-ups pendentes do módulo de Gestão de Unidades: campo email, métricas (chamados/checklists), audit log e vinculação de supervisores."
required_inputs:
  - "Checklist da entrega: projeto/entregaveis/entrega1_tarefas.md (Follow-ups Gestão de Unidades — linhas 50-55)"
  - "PRD: projeto/PRD.md (seção 3.3 Gestão de Unidades)"
  - "Tabelas existentes: units, user_units, tickets, checklist_executions, audit_logs"
  - "Design System: design-system.md (tokens e componentes)"
  - "Plano original: .context/plans/gestao-unidades.md"
success_criteria:
  - "Campo email adicionado e funcional no formulário de unidades"
  - "Card de métricas exibindo contagem de chamados e checklists por unidade"
  - "Histórico de alterações visível na página de detalhes da unidade"
  - "Vinculação automática de supervisores baseada em supervisor_name do CSV"
related_agents:
  - "database-specialist"
  - "backend-specialist"
  - "frontend-specialist"
  - "feature-developer"
---

<!-- agent-update:start:plan-unidades-followups -->
# Follow-ups de Gestão de Unidades — Plano de Implementação

> Implementar as tarefas de follow-up pendentes para o módulo de Gestão de Unidades: adicionar campo de email, implementar métricas da unidade (chamados/checklists), histórico de alterações (audit log), e vincular supervisores após importar CSV.

## Checklist de Tarefas

| # | Tarefa | Status | Prioridade | Arquivos Principais |
|---|--------|--------|------------|---------------------|
| 1 | Adicionar campo de email na unidade | ✅ Concluída | Baixa | Migration, `unit-form.tsx`, `database.types.ts` |
| 2 | Implementar métricas da unidade | ✅ Concluída | Média | `unit-metrics.tsx`, `actions.ts` |
| 3 | Histórico de alterações (audit log) | ⏳ Pendente | Alta | `unit-history.tsx`, `audit_logs` table |
| 4 | Vincular supervisores após importar | ⏳ Pendente | Média | `actions.ts`, função de vinculação |

---

## Task Snapshot

- **Primary goal:** Completar os follow-ups pendentes do módulo de Gestão de Unidades para aumentar a visibilidade operacional e rastreabilidade de alterações.
- **Success signal:**
  - Campo email disponível no formulário e detalhes da unidade
  - Métricas (chamados abertos, checklists executados) visíveis no card de resumo
  - Aba/seção de histórico mostrando alterações da unidade
  - Supervisores do CSV vinculados automaticamente às unidades correspondentes
- **Key references:**
  - [Plano Original de Gestão de Unidades](./gestao-unidades.md)
  - [PRD do GAPP](../../projeto/PRD.md) — Seção 3.3 Gestão de Unidades
  - [Design System](../../design-system.md)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
- **Out of scope:** Upload de foto da fachada, coordenadas GPS (lat/long), exportação CSV

---

## Estrutura de Dados Existente

### Tabelas Relevantes (Supabase)

```
units (78 rows)
├── id: uuid (PK)
├── name: text
├── code: text (UNIQUE)
├── address: text
├── city, state, zip_code, phone: text (nullable)
├── capacity: integer (nullable)
├── status: text ('active'|'inactive')
├── cnpj, neighborhood, region, administrator: text (nullable)
├── supervisor_name: text (nullable) -- Para vinculação posterior
├── created_at, updated_at: timestamptz
└── email: text (A ADICIONAR)

tickets (4+ rows)
├── id: uuid (PK)
├── unit_id: uuid (FK → units.id)
├── status: text
└── ... (outros campos)

checklist_executions (1+ rows)
├── id: uuid (PK)
├── unit_id: uuid (FK → units.id)
├── status: text ('in_progress'|'completed')
└── ... (outros campos)

audit_logs (6 rows) — JÁ EXISTE
├── id: uuid (PK)
├── user_id: uuid (FK → profiles.id)
├── action: text
├── entity_type: text
├── entity_id: uuid
├── old_data: jsonb
├── new_data: jsonb
├── metadata: jsonb
└── created_at: timestamptz

profiles (4+ rows)
├── full_name: text
└── ... (para match com supervisor_name)
```

---

## Tarefa 1: Adicionar Campo de Email na Unidade

### Objetivo
Adicionar campo `email` na tabela `units` para contato direto com a unidade.

### Subtarefas

#### 1.1 Migration: Adicionar Coluna
```sql
-- Migration: add_units_email_field
ALTER TABLE public.units
ADD COLUMN IF NOT EXISTS email TEXT;

COMMENT ON COLUMN public.units.email IS 'Email de contato da unidade';

-- Índice para busca (opcional)
CREATE INDEX IF NOT EXISTS idx_units_email ON public.units(email);
```

#### 1.2 Atualizar TypeScript Types
```bash
# Regenerar types após migration
mcp_supabase_generate_typescript_types
```

#### 1.3 Atualizar Formulário de Unidade
- **Arquivo:** `apps/web/src/app/(app)/unidades/components/unit-form.tsx`
- Adicionar campo `email` com validação de formato de email
- Posicionar após o campo `phone`

```typescript
// Adicionar no formulário
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    name="email"
    type="email"
    placeholder="contato@unidade.com.br"
    defaultValue={unit?.email || ''}
  />
</div>
```

#### 1.4 Atualizar Server Actions
- **Arquivo:** `apps/web/src/app/(app)/unidades/actions.ts`
- Adicionar `email` nos métodos `createUnit` e `updateUnit`

#### 1.5 Atualizar Página de Detalhes
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/page.tsx`
- Exibir email no card de informações gerais
- Adicionar ícone `Mail` do Lucide

### Critérios de Aceite
- [x] Coluna `email` existe na tabela `units`
- [x] Campo email aparece no formulário de criação/edição
- [x] Email é exibido na página de detalhes
- [x] Validação de formato de email funciona
- [x] TypeScript types atualizados

---

## Tarefa 2: Implementar Métricas da Unidade

### Objetivo
Exibir métricas operacionais na página de detalhes da unidade: quantidade de chamados e checklists.

### Subtarefas

#### 2.1 Criar Server Action para Métricas
- **Arquivo:** `apps/web/src/app/(app)/unidades/actions.ts`

```typescript
export interface UnitMetrics {
  // Chamados
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  
  // Checklists
  totalChecklists: number
  completedChecklists: number
  checklistsThisMonth: number
  
  // Conformidade
  nonConformityRate: number // % de checklists com não-conformidades
}

export async function getUnitMetrics(unitId: string): Promise<UnitMetrics> {
  const supabase = await createClient()
  
  // Buscar chamados da unidade
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id, status')
    .eq('unit_id', unitId)
  
  // Buscar execuções de checklist da unidade
  const { data: checklists } = await supabase
    .from('checklist_executions')
    .select('id, status, has_non_conformities, completed_at')
    .eq('unit_id', unitId)
  
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const openStatuses = ['awaiting_triage', 'in_triage', 'awaiting_approval', 'in_progress', 'awaiting_quotation']
  
  return {
    totalTickets: tickets?.length || 0,
    openTickets: tickets?.filter(t => openStatuses.includes(t.status)).length || 0,
    resolvedTickets: tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0,
    
    totalChecklists: checklists?.length || 0,
    completedChecklists: checklists?.filter(c => c.status === 'completed').length || 0,
    checklistsThisMonth: checklists?.filter(c => 
      c.completed_at && new Date(c.completed_at) >= firstDayOfMonth
    ).length || 0,
    
    nonConformityRate: checklists?.length 
      ? Math.round((checklists.filter(c => c.has_non_conformities).length / checklists.length) * 100)
      : 0,
  }
}
```

#### 2.2 Criar Componente de Métricas
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/components/unit-metrics.tsx`

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Ticket, 
  CheckSquare, 
  AlertTriangle,
  TrendingUp,
  Calendar
} from 'lucide-react'
import type { UnitMetrics } from '../../actions'

interface UnitMetricsCardProps {
  metrics: UnitMetrics
}

export function UnitMetricsCard({ metrics }: UnitMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Métricas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chamados */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Ticket className="h-4 w-4" />
            Chamados
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted p-2">
              <p className="text-lg font-bold">{metrics.totalTickets}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <p className="text-lg font-bold text-yellow-600">{metrics.openTickets}</p>
              <p className="text-xs text-muted-foreground">Abertos</p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-2">
              <p className="text-lg font-bold text-green-600">{metrics.resolvedTickets}</p>
              <p className="text-xs text-muted-foreground">Resolvidos</p>
            </div>
          </div>
        </div>

        {/* Checklists */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckSquare className="h-4 w-4" />
            Checklists
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-lg bg-muted p-2">
              <p className="text-lg font-bold">{metrics.completedChecklists}</p>
              <p className="text-xs text-muted-foreground">Concluídos</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <p className="text-lg font-bold text-blue-600">{metrics.checklistsThisMonth}</p>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </div>
          </div>
        </div>

        {/* Taxa de não-conformidade */}
        {metrics.totalChecklists > 0 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Não-conformidades</span>
            </div>
            <span className={`font-medium ${
              metrics.nonConformityRate > 20 ? 'text-red-500' : 'text-green-500'
            }`}>
              {metrics.nonConformityRate}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

#### 2.3 Integrar na Página de Detalhes
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/page.tsx`
- Adicionar fetch de métricas no Promise.all
- Renderizar `UnitMetricsCard` na sidebar

### Critérios de Aceite
- [x] Métricas são calculadas corretamente
- [x] Card de métricas exibido na página de detalhes
- [x] Dados atualizados em tempo real (revalidação)
- [x] Design consistente com o sistema

---

## Tarefa 3: Histórico de Alterações (Audit Log)

### Objetivo
Exibir histórico de alterações da unidade na página de detalhes, utilizando a tabela `audit_logs` existente.

### Subtarefas

#### 3.1 Criar Trigger de Auditoria para Unidades
```sql
-- Migration: add_units_audit_trigger

-- Função de auditoria (se não existir)
CREATE OR REPLACE FUNCTION public.log_units_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, new_data)
    VALUES (auth.uid(), 'unit.insert', 'unit', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_data, new_data)
    VALUES (auth.uid(), 'unit.update', 'unit', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_data)
    VALUES (auth.uid(), 'unit.delete', 'unit', OLD.id, to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS units_audit_trigger ON public.units;
CREATE TRIGGER units_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.log_units_changes();
```

#### 3.2 Criar Server Action para Histórico
- **Arquivo:** `apps/web/src/app/(app)/unidades/actions.ts`

```typescript
export interface UnitHistoryEntry {
  id: string
  action: string
  user_name: string | null
  user_avatar: string | null
  changes: {
    field: string
    old_value: string | null
    new_value: string | null
  }[]
  created_at: string
}

export async function getUnitHistory(unitId: string): Promise<UnitHistoryEntry[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      old_data,
      new_data,
      created_at,
      user:profiles!audit_logs_user_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq('entity_type', 'unit')
    .eq('entity_id', unitId)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) {
    console.error('Error fetching unit history:', error)
    return []
  }
  
  // Mapear campos alterados para exibição amigável
  const fieldLabels: Record<string, string> = {
    name: 'Nome',
    code: 'Código',
    address: 'Endereço',
    city: 'Cidade',
    state: 'Estado',
    zip_code: 'CEP',
    phone: 'Telefone',
    email: 'Email',
    capacity: 'Capacidade',
    status: 'Status',
    cnpj: 'CNPJ',
    neighborhood: 'Bairro',
    region: 'Região',
    administrator: 'Administradora',
    supervisor_name: 'Supervisor',
  }
  
  return (data || []).map((entry: any) => {
    const changes: UnitHistoryEntry['changes'] = []
    
    if (entry.action === 'unit.update' && entry.old_data && entry.new_data) {
      // Detectar campos alterados
      for (const key of Object.keys(fieldLabels)) {
        if (entry.old_data[key] !== entry.new_data[key]) {
          changes.push({
            field: fieldLabels[key] || key,
            old_value: entry.old_data[key]?.toString() || null,
            new_value: entry.new_data[key]?.toString() || null,
          })
        }
      }
    } else if (entry.action === 'unit.insert') {
      changes.push({ field: 'Criação', old_value: null, new_value: 'Unidade criada' })
    }
    
    return {
      id: entry.id,
      action: entry.action,
      user_name: entry.user?.full_name || 'Sistema',
      user_avatar: entry.user?.avatar_url || null,
      changes,
      created_at: entry.created_at,
    }
  })
}
```

#### 3.3 Criar Componente de Histórico
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/components/unit-history.tsx`

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { History, ArrowRight } from 'lucide-react'
import type { UnitHistoryEntry } from '../../actions'

interface UnitHistoryCardProps {
  history: UnitHistoryEntry[]
}

export function UnitHistoryCard({ history }: UnitHistoryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }
  
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'unit.insert': return 'Criação'
      case 'unit.update': return 'Alteração'
      case 'unit.delete': return 'Exclusão'
      default: return action
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Alterações
        </CardTitle>
        <CardDescription>
          Últimas {history.length} alterações nesta unidade
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma alteração registrada
          </p>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.user_avatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(entry.user_name || 'S')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{entry.user_name}</p>
                    <Badge variant="outline" className="text-xs">
                      {getActionLabel(entry.action)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.created_at)}
                  </p>
                  {entry.changes.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {entry.changes.map((change, idx) => (
                        <div key={idx} className="text-xs flex items-center gap-1 text-muted-foreground">
                          <span className="font-medium">{change.field}:</span>
                          {change.old_value && (
                            <>
                              <span className="line-through">{change.old_value}</span>
                              <ArrowRight className="h-3 w-3" />
                            </>
                          )}
                          <span className="text-foreground">{change.new_value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

#### 3.4 Integrar na Página de Detalhes
- Adicionar fetch do histórico
- Renderizar card de histórico na seção principal (abaixo da equipe)

### Critérios de Aceite
- [ ] Trigger de auditoria registra INSERT/UPDATE/DELETE
- [ ] Histórico exibe últimas 20 alterações
- [ ] Cada entrada mostra usuário, data, ação e campos alterados
- [ ] RLS permite apenas admins verem o histórico

---

## Tarefa 4: Vincular Supervisores Após Importar

### Objetivo
Converter o campo `supervisor_name` das unidades importadas em vínculos reais na tabela `user_units`, ligando o usuário correto à unidade.

### Subtarefas

#### 4.1 Criar Server Action para Vinculação
- **Arquivo:** `apps/web/src/app/(app)/unidades/actions.ts`

```typescript
export interface SupervisorLinkResult {
  unitId: string
  unitName: string
  supervisorName: string
  status: 'linked' | 'not_found' | 'already_linked' | 'error'
  userId?: string
  error?: string
}

export async function linkSupervisorsFromImport(): Promise<{
  total: number
  linked: number
  notFound: number
  alreadyLinked: number
  errors: number
  results: SupervisorLinkResult[]
}> {
  const supabase = await createClient()
  
  // Buscar unidades com supervisor_name preenchido
  const { data: unitsWithSupervisor, error: unitsError } = await supabase
    .from('units')
    .select('id, name, supervisor_name')
    .not('supervisor_name', 'is', null)
    .neq('supervisor_name', '')
  
  if (unitsError) throw new Error(`Erro ao buscar unidades: ${unitsError.message}`)
  
  // Buscar todos os profiles para match
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name')
  
  if (profilesError) throw new Error(`Erro ao buscar profiles: ${profilesError.message}`)
  
  // Buscar role de Supervisor de Operações
  const { data: supervisorRole } = await supabase
    .from('roles')
    .select('id, department_id')
    .eq('name', 'Supervisor')
    .single()
  
  // Criar mapa de nomes para IDs (normalizado para comparação)
  const profileMap = new Map<string, string>()
  profiles?.forEach(p => {
    profileMap.set(p.full_name.toLowerCase().trim(), p.id)
  })
  
  const results: SupervisorLinkResult[] = []
  let linked = 0, notFound = 0, alreadyLinked = 0, errors = 0
  
  for (const unit of unitsWithSupervisor || []) {
    const supervisorNameNormalized = unit.supervisor_name!.toLowerCase().trim()
    const userId = profileMap.get(supervisorNameNormalized)
    
    if (!userId) {
      results.push({
        unitId: unit.id,
        unitName: unit.name,
        supervisorName: unit.supervisor_name!,
        status: 'not_found',
      })
      notFound++
      continue
    }
    
    // Verificar se já existe vínculo
    const { data: existing } = await supabase
      .from('user_units')
      .select('id')
      .eq('user_id', userId)
      .eq('unit_id', unit.id)
      .maybeSingle()
    
    if (existing) {
      results.push({
        unitId: unit.id,
        unitName: unit.name,
        supervisorName: unit.supervisor_name!,
        status: 'already_linked',
        userId,
      })
      alreadyLinked++
      continue
    }
    
    // Criar vínculo (is_coverage = true para supervisores)
    const { error: insertError } = await supabase
      .from('user_units')
      .insert({
        user_id: userId,
        unit_id: unit.id,
        is_coverage: true,
      })
    
    if (insertError) {
      results.push({
        unitId: unit.id,
        unitName: unit.name,
        supervisorName: unit.supervisor_name!,
        status: 'error',
        error: insertError.message,
      })
      errors++
    } else {
      results.push({
        unitId: unit.id,
        unitName: unit.name,
        supervisorName: unit.supervisor_name!,
        status: 'linked',
        userId,
      })
      linked++
    }
  }
  
  revalidatePath('/unidades')
  
  return {
    total: unitsWithSupervisor?.length || 0,
    linked,
    notFound,
    alreadyLinked,
    errors,
    results,
  }
}
```

#### 4.2 Criar Página de Vinculação
- **Arquivo:** `apps/web/src/app/(app)/unidades/vincular-supervisores/page.tsx`

```typescript
// Página admin para executar a vinculação em massa
// Exibe preview dos matches antes de confirmar
// Mostra relatório após execução
```

#### 4.3 Adicionar Botão na Listagem
- **Arquivo:** `apps/web/src/app/(app)/unidades/page.tsx`
- Adicionar botão "Vincular Supervisores" no header (próximo a Importar CSV)
- Apenas visível se existirem unidades com `supervisor_name` não vinculado

### Critérios de Aceite
- [ ] Função identifica unidades com supervisor_name
- [ ] Match case-insensitive com full_name de profiles
- [ ] Vínculo criado com is_coverage = true
- [ ] Não duplica vínculos existentes
- [ ] Relatório mostra resultado (linked/not_found/already_linked/errors)
- [ ] Interface de preview antes de confirmar

---

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criar migrations para email e trigger de auditoria | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Backend Specialist | Implementar Server Actions para métricas e histórico | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Criar componentes de métricas, histórico e vinculação | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Feature Developer | Integração end-to-end das funcionalidades | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |

## Documentation Touchpoints

| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | [security.md](../docs/security.md) | agent-update:security | Auth model, secrets management, compliance requirements |

## Risk Assessment

### Identified Risks

| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Match incorreto de supervisor_name | Medium | Low | Preview antes de confirmar; validação manual | Backend Specialist |
| Performance de métricas em unidades com muitos chamados | Low | Medium | Adicionar índices; considerar caching se necessário | Database Specialist |
| Trigger de auditoria afeta performance de updates | Low | Low | Trigger async ou batch; monitorar | Database Specialist |
| Histórico expõe dados sensíveis | Low | High | RLS restrito a admins; mascarar campos sensíveis | Security Auditor |

### Dependencies

- **Internal:** Tabelas `units`, `audit_logs`, `tickets`, `checklist_executions` já existem
- **External:** Supabase Database
- **Technical:** Next.js 15 Server Actions, @supabase/ssr, shadcn/ui

### Assumptions

- `supervisor_name` no CSV corresponde exatamente ou aproximadamente ao `full_name` de um profile existente
- Trigger de auditoria não impactará significativamente a performance
- Métricas serão calculadas on-demand (sem necessidade de materialização)

## Resource Estimation

### Time Allocation

| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Tarefa 1 - Campo Email | 0.5 dia | 0.5 dia | 1 pessoa |
| Tarefa 2 - Métricas | 1 dia | 1 dia | 1 pessoa |
| Tarefa 3 - Audit Log | 1 dia | 1 dia | 1 pessoa |
| Tarefa 4 - Vincular Supervisores | 1 dia | 1 dia | 1 pessoa |
| **Total** | **3.5 dias** | **3.5 dias** | **1 pessoa** |

### Required Skills
- Next.js 15 (App Router, Server Actions)
- Supabase (Database, RLS, Triggers)
- TypeScript
- shadcn/ui + Tailwind CSS

### Resource Availability
- **Available:** 1 dev full-stack
- **Blocked:** N/A
- **Escalation:** Tech Lead para dúvidas de arquitetura

## Working Phases

### Phase 1 — Campo Email e Métricas (1.5 dias)

**Steps**
1. Criar migration para adicionar coluna `email`
2. Atualizar formulário e página de detalhes
3. Implementar Server Action `getUnitMetrics`
4. Criar componente `UnitMetricsCard`
5. Integrar métricas na página de detalhes
6. Regenerar TypeScript types

**Commit Checkpoint**
- `git commit -m "feat(units): add email field and unit metrics display"`

### Phase 2 — Audit Log (1 dia)

**Steps**
1. Criar migration com trigger de auditoria
2. Implementar Server Action `getUnitHistory`
3. Criar componente `UnitHistoryCard`
4. Integrar histórico na página de detalhes
5. Testar registro de alterações

**Commit Checkpoint**
- `git commit -m "feat(units): add audit log history display"`

### Phase 3 — Vincular Supervisores (1 dia)

**Steps**
1. Implementar Server Action `linkSupervisorsFromImport`
2. Criar página de vinculação com preview
3. Adicionar botão na listagem de unidades
4. Testar fluxo completo de vinculação
5. Verificar vínculos criados

**Commit Checkpoint**
- `git commit -m "feat(units): add supervisor linking from CSV import"`

### Phase 4 — Validation & Handoff (0.5 dia)

**Steps**
1. Testar fluxo completo: criar unidade → editar → ver métricas → ver histórico
2. Testar vinculação de supervisores
3. Validar RLS policies
4. Rodar `mcp_supabase_get_advisors` (security)
5. Atualizar `entrega1_tarefas.md` com itens concluídos

**Commit Checkpoint**
- `git commit -m "chore(plan): complete unidades-followups validation"`

## Rollback Plan

### Rollback Triggers
- Bugs críticos em RLS expondo dados
- Trigger de auditoria causando deadlocks
- Performance degradada na página de detalhes

### Rollback Procedures

#### Tarefa 1 Rollback (Email)
- Action: `ALTER TABLE units DROP COLUMN email;`
- Data Impact: Perda de emails cadastrados
- Estimated Time: < 30 min

#### Tarefa 2 Rollback (Métricas)
- Action: Remover componente; sem alterações no banco
- Data Impact: Nenhum
- Estimated Time: < 30 min

#### Tarefa 3 Rollback (Audit Log)
- Action: `DROP TRIGGER units_audit_trigger; DROP FUNCTION log_units_changes;`
- Data Impact: Novos logs não serão registrados; logs existentes permanecem
- Estimated Time: < 30 min

#### Tarefa 4 Rollback (Supervisores)
- Action: `DELETE FROM user_units WHERE is_coverage = true;` (com cuidado)
- Data Impact: Remove vínculos de cobertura criados
- Estimated Time: < 1 hora

### Post-Rollback Actions
1. Documentar razão do rollback
2. Notificar stakeholders
3. Analisar causa raiz
4. Atualizar plano com lições aprendidas

## Evidence & Follow-up

### Evidências a Coletar
- Screenshot do campo email no formulário
- Screenshot do card de métricas
- Screenshot do histórico de alterações
- Screenshot da página de vinculação de supervisores
- Output de `mcp_supabase_get_advisors` (security)
- TypeScript types regenerados

### Follow-up Actions
- [ ] Considerar cache para métricas se performance degradar
- [ ] Avaliar necessidade de materializar métricas em view
- [ ] Implementar notificação de não-conformidades altas
- [ ] Adicionar filtros na listagem por supervisor vinculado

---

## Referências Técnicas

### Stack do Projeto
- **Framework:** Next.js 15 (App Router)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **Database:** PostgreSQL (Supabase)
- **UI:** shadcn/ui + Tailwind CSS
- **Design System:** [design-system.md](../../design-system.md)

### Arquivos Existentes (Referência)
- `apps/web/src/app/(app)/unidades/page.tsx` — Listagem de unidades
- `apps/web/src/app/(app)/unidades/[id]/page.tsx` — Detalhes da unidade
- `apps/web/src/app/(app)/unidades/actions.ts` — Server Actions existentes
- `apps/web/src/app/(app)/unidades/components/` — Componentes de unidades
- `apps/web/src/lib/supabase/database.types.ts` — Types gerados

<!-- agent-update:end -->
