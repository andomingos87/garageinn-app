---
id: plan-gestao-usuarios-followups
ai_update_goal: "Implementar os follow-ups de Gestão de Usuários: vinculação a unidades, paginação server-side e logs de auditoria."
required_inputs:
  - "Checklist da entrega: projeto/entregaveis/entrega1_tarefas.md (Follow-ups — itens 37-39)"
  - "PRD: projeto/PRD.md (seções 2.2 Regras de Vínculo com Unidades, 3.3 Gestão de Unidades, 3.4 Gestão de Usuários)"
  - "Modelo atual: tabelas profiles, departments, roles, user_roles"
  - "Server Actions existentes: apps/web/src/app/(app)/usuarios/actions.ts"
success_criteria:
  - "Tabela units criada com campos do PRD (nome, código, endereço, capacidade)"
  - "Tabela user_units criada com vínculo usuário-unidade e flag is_coverage"
  - "Interface de seleção de unidades no formulário de usuário (Operações)"
  - "Paginação server-side funcional com offset/limit"
  - "Tabela audit_logs capturando ações de usuário (criação, atualização, deleção)"
  - "RLS e policies configuradas para novas tabelas"
related_agents:
  - "database-specialist"
  - "backend-specialist"
  - "frontend-specialist"
  - "security-auditor"
  - "feature-developer"
---

<!-- agent-update:start:plan-gestao-usuarios-followups -->
# Follow-ups de Gestão de Usuários - GAPP Entrega 1

> Implementar vinculação de usuários a unidades, paginação server-side e logs de auditoria para ações de usuário.

## Checklist de Tarefas

| # | Tarefa | Status | Arquivos Principais |
|---|--------|--------|---------------------|
| 1 | Criar modelo de dados para Unidades | ✅ Concluído | `create_units_table`, `create_user_units_table` migrations |
| 2 | Vincular usuários a unidades | ✅ Concluído | `unit-selector.tsx`, `new-user-form.tsx`, `user-edit-form.tsx` |
| 3 | Implementar paginação server-side | ✅ Concluído | `usuarios/actions.ts`, `usuarios/page.tsx`, `users-pagination.tsx` |
| 4 | Adicionar logs de auditoria | ✅ Concluído | `create_audit_logs_table` migration, triggers para profiles/user_roles/user_units |

---

## Task Snapshot

- **Primary goal:** Completar os follow-ups do módulo de Gestão de Usuários, permitindo vinculação com unidades para cargos de Operações, paginação eficiente para grandes volumes de usuários, e rastreabilidade de ações via logs de auditoria.
- **Success signal:**
  - Tabelas `units` e `user_units` funcionais com RLS
  - Formulário de usuário exibe seletor de unidades para cargos de Operações
  - Lista de usuários com paginação server-side (page, limit)
  - Logs de auditoria registrando criação, atualização e deleção de usuários
- **Key references:**
  - `projeto/entregaveis/entrega1_tarefas.md` (Follow-ups linhas 37-39)
  - `projeto/PRD.md` (seções 2.2, 3.3, 3.4)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
  - [Plano de Gestão de Usuários](./gestao-usuarios.md)
- **Out of scope (nesta etapa):** CRUD completo de unidades (será outro plano), notificações, dashboards de auditoria.

---

## Modelo de Dados

### Tabelas Atuais (Referência)

```
profiles (3 rows)
├── id: uuid (PK, FK → auth.users)
├── full_name: text
├── email: text (unique)
├── phone: text (nullable)
├── cpf: text (nullable, unique)
├── avatar_url: text (nullable)
├── status: text ('active'|'inactive'|'pending')
├── created_at: timestamptz
└── updated_at: timestamptz

user_roles (3 rows)
├── id: uuid (PK)
├── user_id: uuid (FK → profiles)
├── role_id: uuid (FK → roles)
└── created_at: timestamptz
```

### Tabelas a Criar

#### 1. Tabela `units` (Unidades)

```sql
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_units_status ON public.units(status);
CREATE INDEX idx_units_code ON public.units(code);

-- Trigger de updated_at
CREATE TRIGGER on_units_updated
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

#### 2. Tabela `user_units` (Vínculo Usuário-Unidade)

```sql
CREATE TABLE public.user_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  is_coverage BOOLEAN DEFAULT FALSE, -- TRUE para Supervisores (cobertura)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, unit_id)
);

-- Índices
CREATE INDEX idx_user_units_user_id ON public.user_units(user_id);
CREATE INDEX idx_user_units_unit_id ON public.user_units(unit_id);
```

#### 3. Tabela `audit_logs` (Logs de Auditoria)

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'user.created', 'user.updated', 'user.deleted', etc.
  entity_type TEXT NOT NULL, -- 'profile', 'user_role', 'user_unit'
  entity_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
```

---

## Tarefa 1: Criar Modelo de Dados para Unidades

### Objetivo
Criar tabelas `units` e `user_units` no Supabase com RLS configurado.

### Subtarefas

#### 1.1 Criar Tabela de Unidades
- **Migration:** `create_units_table`
- **Campos conforme PRD 3.3.1:**
  - name, code, address, city, state, zip_code
  - phone, capacity, status
  - created_at, updated_at

#### 1.2 Criar Tabela de Vínculo Usuário-Unidade
- **Migration:** `create_user_units_table`
- **Regras:**
  - Manobrista/Encarregado: uma unidade (`is_coverage = false`)
  - Supervisor: múltiplas unidades (`is_coverage = true`)
  - Constraint UNIQUE(user_id, unit_id)

#### 1.3 Configurar RLS Policies

```sql
-- Units: todos podem visualizar, apenas admins podem modificar
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view units" ON public.units
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage units" ON public.units
  FOR ALL USING (public.is_admin());

-- User Units: usuários veem seus próprios vínculos, admins veem todos
ALTER TABLE public.user_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unit links" ON public.user_units
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all unit links" ON public.user_units
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage unit links" ON public.user_units
  FOR ALL USING (public.is_admin());
```

#### 1.4 Regenerar TypeScript Types
- Executar `mcp_supabase_generate_typescript_types`
- Atualizar `database.types.ts`

### Critérios de Aceite
- [x] Tabela `units` criada com todos os campos do PRD
- [x] Tabela `user_units` com constraint de unicidade
- [x] RLS policies funcionando (testado via SQL)
- [x] Types TypeScript atualizados

---

## Tarefa 2: Vincular Usuários a Unidades

### Objetivo
Implementar seleção de unidades no formulário de usuário e persistir os vínculos.

### Estrutura de Arquivos

```
apps/web/src/app/(app)/usuarios/
├── novo/
│   └── components/
│       └── new-user-form.tsx  # Atualizar com seletor de unidades
├── [id]/
│   └── editar/
│       └── components/
│           └── user-edit-form.tsx  # Atualizar com seletor de unidades
├── actions.ts  # Adicionar getUnits, updateUserUnits
└── components/
    └── unit-selector.tsx  # Novo componente
```

### Subtarefas

#### 2.1 Criar Server Actions para Unidades

**Arquivo:** `apps/web/src/app/(app)/usuarios/actions.ts`

```typescript
/**
 * Busca lista de unidades ativas
 */
export async function getUnits() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('units')
    .select('id, name, code')
    .eq('status', 'active')
    .order('name')
  
  if (error) {
    console.error('Error fetching units:', error)
    return []
  }
  
  return data || []
}

/**
 * Busca unidades vinculadas a um usuário
 */
export async function getUserUnits(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_units')
    .select(`
      id,
      unit_id,
      is_coverage,
      unit:units (id, name, code)
    `)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching user units:', error)
    return []
  }
  
  return data || []
}

/**
 * Atualiza unidades vinculadas a um usuário
 */
export async function updateUserUnits(
  userId: string, 
  units: { unitId: string; isCoverage: boolean }[]
) {
  const supabase = await createClient()
  
  // Remover vínculos existentes
  const { error: deleteError } = await supabase
    .from('user_units')
    .delete()
    .eq('user_id', userId)
  
  if (deleteError) {
    console.error('Error removing user units:', deleteError)
    return { error: deleteError.message }
  }
  
  // Adicionar novos vínculos
  if (units.length > 0) {
    const unitInserts = units.map(u => ({
      user_id: userId,
      unit_id: u.unitId,
      is_coverage: u.isCoverage,
    }))
    
    const { error: insertError } = await supabase
      .from('user_units')
      .insert(unitInserts)
    
    if (insertError) {
      console.error('Error adding user units:', insertError)
      return { error: insertError.message }
    }
  }
  
  revalidatePath('/usuarios')
  revalidatePath(`/usuarios/${userId}`)
  return { success: true }
}
```

#### 2.2 Criar Componente Seletor de Unidades

**Arquivo:** `apps/web/src/app/(app)/usuarios/components/unit-selector.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Building2 } from 'lucide-react'

interface Unit {
  id: string
  name: string
  code: string
}

interface UnitSelectorProps {
  units: Unit[]
  selectedUnits: { unitId: string; isCoverage: boolean }[]
  onChange: (units: { unitId: string; isCoverage: boolean }[]) => void
  mode: 'single' | 'multiple' // single para Manobrista/Encarregado, multiple para Supervisor
  label?: string
}

export function UnitSelector({
  units,
  selectedUnits,
  onChange,
  mode,
  label = 'Unidade(s)'
}: UnitSelectorProps) {
  // Implementação do seletor...
}
```

#### 2.3 Integrar no Formulário de Usuário

**Lógica de exibição:**
1. Verificar se algum cargo selecionado é de Operações
2. Se for Manobrista ou Encarregado → exibir seletor single
3. Se for Supervisor → exibir seletor multiple com flag `is_coverage`
4. Se não for cargo de Operações → não exibir seletor

```typescript
// Em new-user-form.tsx / user-edit-form.tsx
const operationsRoles = ['Manobrista', 'Encarregado', 'Supervisor']
const singleUnitRoles = ['Manobrista', 'Encarregado']

const selectedOperationsRoles = selectedRoles.filter(r => 
  operationsRoles.includes(r.name)
)

const showUnitSelector = selectedOperationsRoles.length > 0
const unitSelectorMode = selectedOperationsRoles.some(r => 
  singleUnitRoles.includes(r.name)
) ? 'single' : 'multiple'
```

### Critérios de Aceite
- [x] Seletor de unidades aparece apenas para cargos de Operações
- [x] Manobrista/Encarregado: permite selecionar uma unidade
- [x] Supervisor: permite selecionar múltiplas unidades (cobertura)
- [x] Vínculos são salvos na tabela `user_units`
- [x] Edição de usuário carrega unidades vinculadas

---

## Tarefa 3: Implementar Paginação Server-Side

### Objetivo
Adicionar paginação com cursor/offset na listagem de usuários para melhor performance.

### Subtarefas

#### 3.1 Atualizar Server Action `getUsers`

**Arquivo:** `apps/web/src/app/(app)/usuarios/actions.ts`

```typescript
export interface UsersFilters {
  search?: string
  status?: UserStatus | 'all'
  departmentId?: string
  page?: number
  limit?: number
}

export interface PaginatedUsers {
  users: UserWithRoles[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getUsers(filters?: UsersFilters): Promise<PaginatedUsers> {
  const supabase = await createClient()
  
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  // Query base
  let query = supabase
    .from('profiles')
    .select(`
      id, full_name, email, phone, cpf, avatar_url, status, created_at, updated_at,
      user_roles (
        role:roles (
          id, name, is_global,
          department:departments (id, name)
        )
      )
    `, { count: 'exact' })
    .order('full_name')
    .range(offset, offset + limit - 1)
  
  // Aplicar filtros...
  
  const { data, error, count } = await query
  
  return {
    users: transformedUsers,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}
```

#### 3.2 Atualizar Interface da Página

**Arquivo:** `apps/web/src/app/(app)/usuarios/page.tsx`

```typescript
interface PageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    department?: string
    page?: string
    limit?: string
  }>
}
```

#### 3.3 Criar Componente de Paginação

**Arquivo:** `apps/web/src/app/(app)/usuarios/components/users-pagination.tsx`

```typescript
'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UsersPaginationProps {
  page: number
  totalPages: number
  total: number
}

export function UsersPagination({ page, totalPages, total }: UsersPaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }
  
  return (
    <div className="flex items-center justify-between py-4">
      <p className="text-sm text-muted-foreground">
        {total} usuário(s) encontrado(s)
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => router.push(createPageURL(page - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="text-sm">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => router.push(createPageURL(page + 1))}
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

### Critérios de Aceite
- [x] Query usa `range()` para paginação server-side
- [x] Total de registros retornado via `count: 'exact'`
- [x] Componente de paginação exibe página atual e total
- [x] Navegação entre páginas preserva filtros
- [ ] Performance testada com > 50 usuários (pendente teste manual)

---

## Tarefa 4: Adicionar Logs de Auditoria

### Objetivo
Registrar automaticamente ações de usuário em tabela de auditoria.

### Subtarefas

#### 4.1 Criar Tabela de Audit Logs

**Migration:** `create_audit_logs_table`

```sql
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  metadata JSONB, -- ip_address, user_agent, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: apenas admins podem visualizar
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- Índices para consultas frequentes
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
```

#### 4.2 Criar Trigger Functions para Auditoria Automática

```sql
-- Função genérica de auditoria
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    TG_ARGV[0] || '.' || LOWER(TG_OP),
    TG_ARGV[0],
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para profiles
CREATE TRIGGER audit_profiles_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger('profile');

CREATE TRIGGER audit_profiles_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger('profile');

CREATE TRIGGER audit_profiles_delete
  AFTER DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger('profile');

-- Triggers para user_roles
CREATE TRIGGER audit_user_roles_insert
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger('user_role');

CREATE TRIGGER audit_user_roles_delete
  AFTER DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger('user_role');

-- Triggers para user_units
CREATE TRIGGER audit_user_units_insert
  AFTER INSERT ON public.user_units
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger('user_unit');

CREATE TRIGGER audit_user_units_delete
  AFTER DELETE ON public.user_units
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger('user_unit');
```

#### 4.3 Criar Server Action para Consulta de Logs

**Arquivo:** `apps/web/src/app/(app)/usuarios/actions.ts`

```typescript
export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

/**
 * Busca logs de auditoria de um usuário específico
 */
export async function getUserAuditLogs(userId: string): Promise<AuditLog[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) {
    console.error('Error fetching audit logs:', error)
    return []
  }
  
  return data || []
}
```

#### 4.4 Exibir Histórico na Página do Usuário (Opcional)

**Arquivo:** `apps/web/src/app/(app)/usuarios/[id]/components/user-audit-log.tsx`

```typescript
'use client'

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserAuditLogProps {
  logs: AuditLog[]
}

const actionLabels: Record<string, string> = {
  'profile.insert': 'Usuário criado',
  'profile.update': 'Perfil atualizado',
  'user_role.insert': 'Cargo adicionado',
  'user_role.delete': 'Cargo removido',
  'user_unit.insert': 'Unidade vinculada',
  'user_unit.delete': 'Unidade desvinculada',
}

export function UserAuditLog({ logs }: UserAuditLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Alterações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 text-sm">
              <div className="flex-1">
                <p className="font-medium">{actionLabels[log.action] || log.action}</p>
                <p className="text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Critérios de Aceite
- [x] Tabela `audit_logs` criada com RLS
- [x] Triggers disparam para INSERT/UPDATE/DELETE em profiles
- [x] Triggers disparam para user_roles e user_units
- [x] Logs registram user_id do executor da ação
- [x] Logs armazenam old_data e new_data como JSONB
- [x] Consulta de logs funcional (últimos 50)

---

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criação de migrations, triggers e RLS | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Backend Specialist | Server Actions, integração com Supabase | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Componentes de UI (seletor, paginação) | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Security Auditor | Validação de RLS e policies | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Feature Developer | Implementação end-to-end | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |

## Documentation Touchpoints

| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Security & Compliance Notes | [security.md](../docs/security.md) | agent-update:security | Auth model, secrets management, compliance requirements |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | System diagrams, integration specs, queue topics |

## Risk Assessment

### Identified Risks

| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| RLS mal configurado em novas tabelas | Medium | High | Testar policies com diferentes perfis de usuário | Security Auditor |
| Paginação quebra filtros existentes | Low | Medium | Testes de regressão nos filtros | Frontend Specialist |
| Triggers de auditoria afetam performance | Low | Medium | Usar SECURITY DEFINER, índices otimizados | Database Specialist |
| Volume de logs cresce rapidamente | Medium | Low | Implementar política de retenção (futuro) | Database Specialist |

### Dependencies

- **Internal:** Tabelas `profiles`, `user_roles` já existem; função `is_admin()` disponível
- **External:** Supabase Database (migrations, RLS, triggers)
- **Technical:** Next.js 15 Server Actions, @supabase/ssr

### Assumptions

- Tabela `units` será criada com campos mínimos (MVP); CRUD completo será outro plano
- Paginação server-side é necessária apenas para > 50 usuários
- Logs de auditoria são append-only; não há UI de gestão de logs no MVP

## Resource Estimation

### Time Allocation

| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2 - Implementation | 2-3 dias | 2-3 dias | 1-2 pessoas |
| Phase 3 - Validation | 0.5 dia | 0.5 dia | 1 pessoa |
| **Total** | **3-4 dias** | **3-4 dias** | **-** |

### Required Skills
- PostgreSQL (migrations, triggers, RLS)
- Next.js 15 (Server Actions, App Router)
- Supabase (Database, Auth)
- TypeScript + shadcn/ui

### Resource Availability
- **Available:** 1 dev full-stack
- **Blocked:** N/A
- **Escalation:** Tech Lead para dúvidas de arquitetura

## Working Phases

### Phase 1 — Discovery & Alignment (0.5 dia)

**Steps**
1. Validar estrutura de tabelas `units` e `user_units` com PRD
2. Definir campos mínimos para MVP (sem CRUD completo de unidades)
3. Confirmar regras de vínculo: single (Manobrista/Encarregado) vs multiple (Supervisor)
4. Definir estratégia de paginação (offset vs cursor)

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 1 discovery - gestao-usuarios-followups"`

### Phase 2 — Implementation & Iteration (2-3 dias)

**Steps**
1. **Dia 1 - Database**
   - Criar migration `create_units_table`
   - Criar migration `create_user_units_table`
   - Criar migration `create_audit_logs_table`
   - Configurar RLS policies
   - Criar triggers de auditoria
   - Regenerar TypeScript types

2. **Dia 2 - Backend & Frontend (Unidades)**
   - Implementar `getUnits`, `getUserUnits`, `updateUserUnits`
   - Criar componente `UnitSelector`
   - Integrar no formulário de novo usuário
   - Integrar no formulário de edição

3. **Dia 3 - Paginação & Finalização**
   - Atualizar `getUsers` com paginação
   - Criar componente `UsersPagination`
   - Atualizar página de listagem
   - Implementar `getUserAuditLogs`
   - (Opcional) Exibir histórico na página do usuário

**Commit Checkpoint**
- `git commit -m "feat(users): implement units linking, pagination, and audit logs"`

### Phase 3 — Validation & Handoff (0.5 dia)

**Steps**
1. Testar vínculo de unidades: criar usuário Manobrista com 1 unidade
2. Testar vínculo de unidades: criar usuário Supervisor com múltiplas unidades
3. Testar paginação: simular > 20 usuários, navegar páginas
4. Testar auditoria: verificar logs após criar/editar/deletar usuário
5. Rodar `mcp_supabase_get_advisors` (security)
6. Atualizar `entrega1_tarefas.md` com itens concluídos

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation - gestao-usuarios-followups"`

## Rollback Plan

### Rollback Triggers
- RLS bloqueando acesso legítimo a unidades
- Triggers de auditoria causando deadlocks
- Paginação quebrando filtros existentes
- Performance degradada na listagem

### Rollback Procedures

#### Phase 1 Rollback
- Action: Descartar branch de discovery
- Data Impact: Nenhum
- Estimated Time: < 30 min

#### Phase 2 Rollback
- Action: Reverter migrations via SQL ou `mcp_supabase_reset_branch`
- Data Impact: Perda de dados em `units`, `user_units`, `audit_logs`
- Estimated Time: 1-2 horas

#### Phase 3 Rollback
- Action: Reverter commits de feature
- Data Impact: Mínimo (apenas ajustes de UI)
- Estimated Time: < 1 hora

### Post-Rollback Actions
1. Documentar razão do rollback
2. Analisar causa raiz
3. Atualizar plano com lições aprendidas

## Evidence & Follow-up

### Evidências a Coletar
- Screenshot do formulário com seletor de unidades
- Screenshot da paginação funcionando
- Output de `SELECT * FROM audit_logs` após criar usuário
- Output de `mcp_supabase_get_advisors` (security)
- TypeScript types gerados

### Follow-ups
- [ ] Implementar CRUD completo de unidades (plano separado: gestao-unidades)
- [ ] Criar tela de visualização de logs de auditoria (admin)
- [ ] Implementar política de retenção de logs (90 dias?)
- [ ] Adicionar filtro por unidade na listagem de usuários

<!-- agent-update:end -->
