---
id: plan-gestao-unidades
ai_update_goal: "Implementar o módulo completo de Gestão de Unidades da Entrega 1, incluindo telas de listagem, cadastro/edição, detalhes e vínculo usuário-unidade."
required_inputs:
  - "Checklist da entrega: projeto/entregaveis/entrega1_tarefas.md (Gestão de Unidades — itens 41-47)"
  - "PRD: projeto/PRD.md (seção 3.3 Gestão de Unidades)"
  - "Especificação de vínculos: projeto/usuarios/departamentos_cargos.md (seção Unidades)"
  - "Design System: design-system.md (tokens e componentes)"
  - "Tabelas existentes: units, user_units (já migradas)"
success_criteria:
  - "Tela de listagem de unidades funcional com filtros, busca e cards/tabela"
  - "Tela de cadastro/edição de unidade com validação e fluxo completo"
  - "Tela de detalhes da unidade exibindo informações, equipe e métricas"
  - "Vínculo usuário-unidade implementado para cargos de Operações"
  - "RLS e políticas de segurança configuradas corretamente"
  - "Permissões units:read, units:create, units:update integradas ao RBAC"
related_agents:
  - "code-reviewer"
  - "feature-developer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
  - "database-specialist"
---

<!-- agent-update:start:plan-gestao-unidades -->
# Plano de Gestão de Unidades - GAPP Entrega 1

> Implementar o módulo completo de Gestão de Unidades, incluindo telas de listagem, cadastro/edição, detalhes e vínculo usuário-unidade.

## Checklist de Tarefas

| # | Tarefa | Status | Arquivos Principais |
|---|--------|--------|---------------------|
| 1 | Validar/Complementar modelo de dados | ⏳ Pendente | Migrations Supabase, `database.types.ts` |
| 2 | Criar tela de listagem de unidades | ⏳ Pendente | `apps/web/src/app/(app)/unidades/page.tsx` |
| 3 | Criar tela de cadastro/edição de unidade | ⏳ Pendente | `apps/web/src/app/(app)/unidades/novo/page.tsx`, `[id]/editar/page.tsx` |
| 4 | Criar tela de detalhes da unidade | ⏳ Pendente | `apps/web/src/app/(app)/unidades/[id]/page.tsx` |
| 5 | Implementar vínculo usuário-unidade | ⏳ Pendente | `UnitSelector`, `user_units` management |
| 6 | Implementar importação de CSV | ⏳ Pendente | `apps/web/src/app/(app)/unidades/importar/page.tsx` |

---

## Task Snapshot

- **Primary goal:** Entregar o módulo de Gestão de Unidades completo, permitindo que administradores gerenciem unidades (locações) da rede Garageinn, visualizem equipes vinculadas e configurem vínculos de usuários de Operações.
- **Success signal:**
  - CRUD de unidades funcional (criar, listar, editar, ativar/desativar)
  - Tela de detalhes exibindo informações completas e equipe vinculada
  - Vínculo usuário-unidade funcionando para Manobrista, Encarregado e Supervisor
  - Seletor de unidades integrado no cadastro/edição de usuários
- **Key references:**
  - `projeto/entregaveis/entrega1_tarefas.md` (Gestão de Unidades)
  - `projeto/PRD.md` (seção 3.3 Gestão de Unidades)
  - `projeto/usuarios/departamentos_cargos.md` (regras de vínculo)
  - `design-system.md` (tokens e componentes)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
- **Out of scope (nesta etapa):** Métricas avançadas (chamados, checklists), gestão de documentos (alvará, AVCB), coordenadas GPS.

---

## Modelo de Dados Existente

As tabelas de unidades já foram criadas:

### Tabelas Existentes (Supabase)

```
units (5 rows)
├── id: uuid (PK)
├── name: text (NOT NULL)
├── code: text (NOT NULL, UNIQUE) -- Código único (ex: UN001)
├── address: text (NOT NULL)
├── city: text (nullable)
├── state: text (nullable)
├── zip_code: text (nullable)
├── phone: text (nullable)
├── capacity: integer (nullable) -- Capacidade de vagas
├── status: text ('active'|'inactive', default 'active')
├── created_at: timestamptz
└── updated_at: timestamptz

user_units (0 rows)
├── id: uuid (PK)
├── user_id: uuid (FK → profiles.id)
├── unit_id: uuid (FK → units.id)
├── is_coverage: boolean (default FALSE) -- TRUE para Supervisores
└── created_at: timestamptz
└── UNIQUE(user_id, unit_id)
```

### Campos a Adicionar (para importação do CSV)

Os seguintes campos precisam ser adicionados para suportar a importação de `projeto/unidades.csv`:

| Campo | Tipo | Descrição | Fonte CSV |
|-------|------|-----------|-----------|
| `cnpj` | text | CNPJ da unidade | CNPJ |
| `neighborhood` | text | Bairro | BAIRRO |
| `region` | text | Região (Sul, Oeste, Centro, etc.) | REGIÃO |
| `administrator` | text | Administradora (HERSIL, BARZEL, etc.) | ADMINISTRADORA |
| `supervisor_name` | text | Nome do supervisor (para vínculo posterior) | SUPERVISOR |

### Campos Faltantes (fase futura)

- `email`: Email da unidade
- `opening_hours`: Horário de funcionamento (JSON)
- `photo_url`: Foto da fachada (Storage)
- `latitude`, `longitude`: Coordenadas GPS

---

## Tarefa 1: Validar/Complementar Modelo de Dados

### Objetivo
Garantir que as tabelas existentes atendem às necessidades do CRUD de unidades, adicionar campos para importação do CSV e complementar com índices e views necessárias.

### Subtarefas

#### 1.1 Verificar Estrutura Atual
- [x] Tabelas `units`, `user_units` existem ✅ (units: 17 cols, user_units: 5 cols)
- [x] Validar RLS policies para ambas tabelas ✅ (units: 5 policies, user_units: 5 policies)
- [x] Verificar constraint UNIQUE(user_id, unit_id) em user_units ✅ (user_units_user_id_unit_id_key)

#### 1.2 Adicionar Campos para Importação CSV
```sql
-- Migration: add_units_csv_import_fields
ALTER TABLE public.units
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS administrator TEXT,
ADD COLUMN IF NOT EXISTS supervisor_name TEXT;

COMMENT ON COLUMN public.units.cnpj IS 'CNPJ da unidade';
COMMENT ON COLUMN public.units.neighborhood IS 'Bairro da unidade';
COMMENT ON COLUMN public.units.region IS 'Região (Sul, Oeste, Centro, Paulista, etc.)';
COMMENT ON COLUMN public.units.administrator IS 'Administradora (HERSIL, BARZEL, JLL, etc.)';
COMMENT ON COLUMN public.units.supervisor_name IS 'Nome do supervisor (para vínculo posterior com user_units)';
```

#### 1.3 Criar Índices de Performance
```sql
-- Migration: add_units_indexes
CREATE INDEX IF NOT EXISTS idx_units_status ON public.units(status);
CREATE INDEX IF NOT EXISTS idx_units_code ON public.units(code);
CREATE INDEX IF NOT EXISTS idx_units_city ON public.units(city);
CREATE INDEX IF NOT EXISTS idx_units_region ON public.units(region);
CREATE INDEX IF NOT EXISTS idx_units_cnpj ON public.units(cnpj);
CREATE INDEX IF NOT EXISTS idx_user_units_user_id ON public.user_units(user_id);
CREATE INDEX IF NOT EXISTS idx_user_units_unit_id ON public.user_units(unit_id);
```

#### 1.3 Criar Trigger de Updated_at (se não existir)
```sql
-- Migration: add_units_updated_at_trigger
CREATE TRIGGER on_units_updated
  BEFORE UPDATE ON public.units
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

#### 1.4 Criar View de Unidades com Equipe
```sql
-- Migration: create_units_views
CREATE OR REPLACE VIEW public.units_with_staff AS
SELECT 
  u.id,
  u.name,
  u.code,
  u.address,
  u.city,
  u.state,
  u.zip_code,
  u.phone,
  u.capacity,
  u.status,
  u.created_at,
  u.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'user_id', p.id,
        'user_name', p.full_name,
        'user_email', p.email,
        'user_avatar', p.avatar_url,
        'is_coverage', uu.is_coverage
      )
    ) FILTER (WHERE p.id IS NOT NULL),
    '[]'::json
  ) AS staff
FROM public.units u
LEFT JOIN public.user_units uu ON uu.unit_id = u.id
LEFT JOIN public.profiles p ON p.id = uu.user_id
GROUP BY u.id;
```

#### 1.5 Atualizar RLS Policies
```sql
-- Migration: update_units_rls_policies

-- Units: Todos podem ver unidades ativas; admins veem todas
DROP POLICY IF EXISTS "Anyone can view active units" ON public.units;
DROP POLICY IF EXISTS "Admins can view all units" ON public.units;

CREATE POLICY "Anyone can view active units" ON public.units
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all units" ON public.units
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert units" ON public.units
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update units" ON public.units
  FOR UPDATE USING (public.is_admin());

-- User Units: Admins gerenciam; usuários veem seus vínculos
CREATE POLICY "Admins can manage user_units" ON public.user_units
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own unit links" ON public.user_units
  FOR SELECT USING (auth.uid() = user_id);
```

### Critérios de Aceite
- [x] Índices criados e validados ✅ (idx_units_city, idx_units_cnpj, idx_units_code, idx_units_region, idx_units_status)
- [x] View `units_with_staff` retornando dados corretamente ✅ (testada com 5 registros)
- [x] RLS policies testadas (usuário comum vs admin) ✅ (5 policies em units, 5 em user_units)
- [x] TypeScript types regenerados ✅ (units_with_staff incluída)

---

## Tarefa 2: Criar Tela de Listagem de Unidades

### Objetivo
Implementar tela administrativa para listar, filtrar e buscar unidades do sistema.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/unidades/
├── page.tsx                 # Lista de unidades (Server Component)
├── actions.ts               # Server Actions (CRUD)
├── components/
│   ├── units-grid.tsx       # Grid de cards de unidades
│   ├── units-table.tsx      # Tabela de unidades (alternativa)
│   ├── units-filters.tsx    # Filtros e busca
│   ├── unit-card.tsx        # Card individual de unidade
│   └── unit-status-badge.tsx
└── loading.tsx              # Skeleton loading
```

### Subtarefas

#### 2.1 Criar Server Actions para Unidades
- **Arquivo:** `apps/web/src/app/(app)/unidades/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUnits(filters?: {
  search?: string
  status?: string
  city?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('units')
    .select('*')
    .order('name')
  
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.city) {
    query = query.eq('city', filters.city)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function updateUnitStatus(unitId: string, status: 'active' | 'inactive') {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('units')
    .update({ status })
    .eq('id', unitId)
  
  if (error) throw error
  revalidatePath('/unidades')
}

export async function getCities() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('units')
    .select('city')
    .not('city', 'is', null)
    .order('city')
  
  if (error) throw error
  return [...new Set(data?.map(u => u.city))]
}
```

#### 2.2 Criar Página de Listagem
- **Arquivo:** `apps/web/src/app/(app)/unidades/page.tsx`
- **Características:**
  - Server Component com fetch de dados
  - Estatísticas (total, ativas, inativas, capacidade total)
  - Botão "Nova Unidade" (RequireAdmin)
  - Visualização em cards (grid responsivo)
  - Alternativa de visualização em tabela
  - Responsivo

#### 2.3 Criar Componente de Card de Unidade
- **Arquivo:** `apps/web/src/app/(app)/unidades/components/unit-card.tsx`
- **Informações exibidas:**
  - Nome e código
  - Endereço (cidade/estado)
  - Capacidade de vagas
  - Status (Badge colorido)
  - Número de funcionários vinculados
  - Ações (ver detalhes, editar, ativar/desativar)

#### 2.4 Criar Componente de Filtros
- **Arquivo:** `apps/web/src/app/(app)/unidades/components/units-filters.tsx`
- **Filtros:**
  - Busca por nome/código/endereço
  - Status (Todos, Ativo, Inativo)
  - Cidade (select com cidades existentes)

### Design Visual
- Grid de cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Cards com: foto placeholder/ícone, informações principais, badge de status
- Hover state com sombra
- Cores semânticas para status (verde = ativo, cinza = inativo)

### Critérios de Aceite
- [x] Lista carrega unidades do banco ✅ (78 unidades carregadas)
- [x] Filtros funcionam (busca, status, cidade) ✅ (busca "BERRINI" retornou 3 resultados)
- [x] Estatísticas refletem dados reais ✅ (Total: 78, Ativas: 78, Inativas: 0, Capacidade: 18.335)
- [x] Ações de ativar/desativar funcionam ✅ (testado desativar/ativar unidade BERRINI)
- [x] Responsivo em mobile ✅ (testado em 375x667, menu hamburger aparece)
- [x] Loading state enquanto carrega dados ✅ (loading.tsx implementado com skeletons)

---

## Tarefa 3: Criar Tela de Cadastro/Edição de Unidade

### Objetivo
Implementar formulários para criar novas unidades e editar existentes.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/unidades/
├── novo/
│   ├── page.tsx              # Formulário de nova unidade
│   └── actions.ts            # Server Action de criação
├── [id]/
│   ├── page.tsx              # Detalhes da unidade
│   └── editar/
│       ├── page.tsx          # Formulário de edição
│       └── actions.ts        # Server Action de edição
└── components/
    └── unit-form.tsx         # Formulário reutilizável
```

### Subtarefas

#### 3.1 Criar Formulário de Unidade
- **Arquivo:** `apps/web/src/app/(app)/unidades/components/unit-form.tsx`
- **Campos:**

| Campo | Tipo | Validação | Obrigatório |
|-------|------|-----------|-------------|
| name | Input text | Mínimo 3 caracteres | Sim |
| code | Input text | Único, formato UN### | Sim |
| address | Input text | Mínimo 5 caracteres | Sim |
| city | Input text | - | Não |
| state | Select (UFs) | - | Não |
| zip_code | Input masked | Formato 00000-000 | Não |
| phone | Input masked | Formato (XX) XXXXX-XXXX | Não |
| capacity | Input number | Mínimo 1 | Não |
| status | Select | active/inactive | Sim (default: active) |

#### 3.2 Criar Server Action de Criação
- **Arquivo:** `apps/web/src/app/(app)/unidades/novo/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createUnit(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string | null
  const state = formData.get('state') as string | null
  const zip_code = formData.get('zip_code') as string | null
  const phone = formData.get('phone') as string | null
  const capacity = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null
  
  // Verificar código único
  const { data: existing } = await supabase
    .from('units')
    .select('id')
    .eq('code', code)
    .single()
  
  if (existing) {
    return { error: 'Já existe uma unidade com este código' }
  }
  
  const { data, error } = await supabase
    .from('units')
    .insert({
      name,
      code,
      address,
      city,
      state,
      zip_code,
      phone,
      capacity,
      status: 'active'
    })
    .select()
    .single()
  
  if (error) return { error: error.message }
  
  revalidatePath('/unidades')
  redirect(`/unidades/${data.id}`)
}
```

#### 3.3 Criar Página de Criação
- **Arquivo:** `apps/web/src/app/(app)/unidades/novo/page.tsx`
- Verificar permissão admin
- Renderizar UnitForm vazio
- Breadcrumb: Unidades > Nova Unidade

#### 3.4 Criar Server Action de Edição
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/editar/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateUnit(unitId: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string | null
  const state = formData.get('state') as string | null
  const zip_code = formData.get('zip_code') as string | null
  const phone = formData.get('phone') as string | null
  const capacity = formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null
  const status = formData.get('status') as 'active' | 'inactive'
  
  // Verificar código único (excluindo a própria unidade)
  const { data: existing } = await supabase
    .from('units')
    .select('id')
    .eq('code', code)
    .neq('id', unitId)
    .single()
  
  if (existing) {
    return { error: 'Já existe outra unidade com este código' }
  }
  
  const { error } = await supabase
    .from('units')
    .update({
      name,
      code,
      address,
      city,
      state,
      zip_code,
      phone,
      capacity,
      status
    })
    .eq('id', unitId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/unidades')
  revalidatePath(`/unidades/${unitId}`)
  redirect(`/unidades/${unitId}`)
}
```

#### 3.5 Criar Página de Edição
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/editar/page.tsx`
- Verificar permissão admin
- Carregar dados da unidade
- Renderizar UnitForm com dados preenchidos
- Breadcrumb: Unidades > [Nome] > Editar

### Critérios de Aceite
- [x] Formulário valida campos obrigatórios
- [x] Código verifica unicidade
- [x] Edição preserva dados existentes
- [x] Validação de permissão (apenas admin)
- [x] Redirect após salvar
- [x] Feedback visual de erro/sucesso

---

## Tarefa 4: Criar Tela de Detalhes da Unidade

### Objetivo
Implementar página de visualização completa da unidade com informações, equipe vinculada e métricas.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/unidades/[id]/
├── page.tsx                   # Página de detalhes
└── components/
    ├── unit-header.tsx        # Cabeçalho com nome, status, ações
    ├── unit-info.tsx          # Informações básicas
    ├── unit-staff.tsx         # Lista de funcionários vinculados
    └── unit-metrics.tsx       # Métricas (futuro)
```

### Subtarefas

#### 4.1 Criar Página de Detalhes
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/page.tsx`
- **Seções:**
  - Header com nome, código, status e ações (editar, ativar/desativar)
  - Card de informações básicas (endereço, telefone, capacidade)
  - Card de equipe vinculada (lista de usuários)
  - Card de métricas (placeholder para futuro)

#### 4.2 Criar Componente de Cabeçalho
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/components/unit-header.tsx`
- **Elementos:**
  - Breadcrumb: Unidades > [Nome]
  - Título com código
  - Badge de status
  - Botões: Editar, Ativar/Desativar (RequireAdmin)

#### 4.3 Criar Componente de Informações
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/components/unit-info.tsx`
- **Informações exibidas:**
  - Endereço completo (formatado)
  - Cidade/Estado
  - CEP
  - Telefone
  - Capacidade de vagas
  - Data de criação

#### 4.4 Criar Componente de Equipe
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/components/unit-staff.tsx`
- **Funcionalidades:**
  - Lista de usuários vinculados (avatar, nome, cargo)
  - Indicação de cobertura (para Supervisores)
  - Botão "Gerenciar Equipe" (RequireAdmin) - link para edição
  - Estado vazio: "Nenhum funcionário vinculado"

#### 4.5 Criar Server Action para Buscar Detalhes
```typescript
export async function getUnitDetails(unitId: string) {
  const supabase = await createClient()
  
  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('*')
    .eq('id', unitId)
    .single()
  
  if (unitError) throw unitError
  
  // Buscar equipe vinculada
  const { data: staff, error: staffError } = await supabase
    .from('user_units')
    .select(`
      id,
      is_coverage,
      user:profiles (
        id,
        full_name,
        email,
        avatar_url,
        user_roles (
          role:roles (
            id,
            name,
            department:departments (name)
          )
        )
      )
    `)
    .eq('unit_id', unitId)
  
  if (staffError) throw staffError
  
  return { unit, staff }
}
```

### Design Visual
- Layout em grid: sidebar com info + main com equipe
- Cards com bordas sutis e sombras
- Avatar dos funcionários em lista horizontal ou vertical
- Métricas em cards com ícones e números grandes (futuro)

### Critérios de Aceite
- [x] Página carrega dados da unidade
- [x] Informações exibidas corretamente formatadas
- [x] Equipe vinculada é listada
- [x] Ações de edição funcionam (RequireAdmin)
- [x] Responsivo em mobile
- [x] 404 se unidade não existe

---

## Tarefa 5: Implementar Vínculo Usuário-Unidade

### Objetivo
Implementar o gerenciamento de vínculos entre usuários e unidades, integrado ao cadastro/edição de usuários.

### Regras de Negócio (PRD)

| Tipo de Vínculo | Cargos Aplicáveis | Comportamento |
|-----------------|-------------------|---------------|
| **Uma unidade** | Manobrista, Encarregado | Seleciona 1 unidade obrigatória |
| **Múltiplas unidades** | Supervisor (Operações) | Seleciona N unidades (cobertura) |
| **Sem vínculo** | Todos os demais | Campo de unidade não aparece |

### Estrutura de Arquivos
```
apps/web/src/app/(app)/usuarios/components/
├── unit-selector.tsx          # Seletor de unidades (já existe básico)
└── ...

apps/web/src/app/(app)/unidades/[id]/components/
├── manage-staff-dialog.tsx    # Dialog para gerenciar equipe
└── ...
```

### Subtarefas

#### 5.1 Atualizar Seletor de Unidades no Cadastro de Usuário
- **Arquivo:** `apps/web/src/app/(app)/usuarios/components/unit-selector.tsx`
- **Comportamento:**
  1. Detectar cargos selecionados
  2. Se cargo é Manobrista ou Encarregado → mostrar select single obrigatório
  3. Se cargo é Supervisor (Operações) → mostrar multi-select
  4. Demais cargos → ocultar seletor

```typescript
interface UnitSelectorProps {
  selectedRoles: string[] // IDs dos cargos selecionados
  selectedUnits: string[] // IDs das unidades
  onUnitsChange: (units: string[]) => void
  multiple?: boolean
}

export function UnitSelector({ selectedRoles, selectedUnits, onUnitsChange, multiple }: UnitSelectorProps) {
  // Cargos que requerem unidade
  const SINGLE_UNIT_ROLES = ['Manobrista', 'Encarregado']
  const MULTI_UNIT_ROLES = ['Supervisor'] // apenas de Operações
  
  // Determinar modo baseado nos cargos
  const requiresSingleUnit = selectedRoles.some(r => SINGLE_UNIT_ROLES.includes(r))
  const requiresMultiUnit = selectedRoles.some(r => MULTI_UNIT_ROLES.includes(r))
  
  if (!requiresSingleUnit && !requiresMultiUnit) {
    return null // Não exibir para cargos sem vínculo
  }
  
  // ... renderizar select ou multi-select
}
```

#### 5.2 Criar Server Actions para Gerenciar Vínculos
- **Arquivo:** `apps/web/src/app/(app)/usuarios/actions.ts` (adicionar)

```typescript
export async function updateUserUnits(
  userId: string, 
  unitIds: string[], 
  isCoverage: boolean = false
) {
  const supabase = await createClient()
  
  // Remover vínculos existentes
  await supabase
    .from('user_units')
    .delete()
    .eq('user_id', userId)
  
  // Inserir novos vínculos
  if (unitIds.length > 0) {
    const inserts = unitIds.map(unitId => ({
      user_id: userId,
      unit_id: unitId,
      is_coverage: isCoverage
    }))
    
    const { error } = await supabase
      .from('user_units')
      .insert(inserts)
    
    if (error) throw error
  }
  
  revalidatePath('/usuarios')
  revalidatePath(`/usuarios/${userId}`)
}

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
  
  if (error) throw error
  return data
}
```

#### 5.3 Integrar no Formulário de Criação de Usuário
- **Arquivo:** `apps/web/src/app/(app)/usuarios/novo/page.tsx`
- Adicionar `UnitSelector` após seleção de cargos
- Passar cargos selecionados para determinar comportamento
- Incluir unidades no submit da action

#### 5.4 Integrar no Formulário de Edição de Usuário
- **Arquivo:** `apps/web/src/app/(app)/usuarios/[id]/editar/page.tsx`
- Carregar unidades vinculadas do usuário
- Pré-selecionar no `UnitSelector`
- Atualizar vínculos ao salvar

#### 5.5 Criar Dialog de Gerenciamento de Equipe (na página da unidade)
- **Arquivo:** `apps/web/src/app/(app)/unidades/[id]/components/manage-staff-dialog.tsx`
- **Funcionalidades:**
  - Listar usuários disponíveis (Manobrista, Encarregado, Supervisor de Operações)
  - Checkbox para vincular/desvincular
  - Toggle para marcar como cobertura (Supervisor)

### Critérios de Aceite
- [x] Seletor aparece apenas para cargos que requerem unidade
- [x] Manobrista/Encarregado: seleção única obrigatória
- [x] Supervisor: seleção múltipla (cobertura)
- [x] Vínculos são salvos corretamente no banco
- [x] Edição preserva vínculos existentes
- [x] Página de detalhes da unidade exibe equipe corretamente

---

## Tarefa 6: Implementar Importação de CSV

### Objetivo
Implementar funcionalidade para importar unidades em massa a partir de arquivo CSV, permitindo popular o sistema com os dados de `projeto/unidades.csv` (94 unidades).

### Análise do CSV de Origem

**Arquivo:** `projeto/unidades.csv`
- **Delimitador:** `;` (ponto e vírgula)
- **Encoding:** ISO-8859-1 (Latin-1) — precisa converter para UTF-8
- **Total de registros:** 94 unidades

#### Mapeamento de Colunas CSV → Tabela units

| # | Coluna CSV | Campo units | Obrigatório | Tratamento |
|---|------------|-------------|-------------|------------|
| 1 | QTD | - | - | Ignorar (índice) |
| 2 | UNIDADE | `name` | Sim | Trim |
| 3 | VAGAS | `capacity` | Não | Parse int, null se vazio |
| 4 | CNPJ | `cnpj` | Não | Trim |
| 5 | APP Omie | - | - | Ignorar |
| 6 | SUPERVISOR | `supervisor_name` | Não | Trim |
| 7 | ADMINISTRADORA | `administrator` | Não | Trim |
| 8 | ENDEREÇO | `address` | Sim | Trim, fix encoding |
| 9 | BAIRRO | `neighborhood` | Não | Trim |
| 10 | REGIÃO | `region` | Não | Trim |
| 11 | CIDADE | `city` | Não | Trim, fix encoding |
| 12 | ESTADO | `state` | Não | Trim (UF) |
| 13+ | ... | - | - | Ignorar (campos técnicos) |

**Código único (`code`):** Gerar automaticamente no formato `UN###` baseado no índice (UN001, UN002, etc.)

### Estrutura de Arquivos
```
apps/web/src/app/(app)/unidades/
├── importar/
│   ├── page.tsx              # Página de importação
│   ├── actions.ts            # Server Actions de importação
│   └── components/
│       ├── csv-dropzone.tsx  # Área de upload drag & drop
│       ├── column-mapper.tsx # Mapeador de colunas (opcional)
│       ├── import-preview.tsx # Preview dos dados
│       └── import-report.tsx  # Relatório de resultado
└── ...
```

### Subtarefas

#### 6.1 Instalar Dependência para Parse de CSV
```bash
npm install papaparse @types/papaparse
```

#### 6.2 Criar Página de Importação
- **Arquivo:** `apps/web/src/app/(app)/unidades/importar/page.tsx`
- **Características:**
  - Acesso restrito a admin (RequireAdmin)
  - Breadcrumb: Unidades > Importar CSV
  - Instruções de formato esperado
  - Área de upload (drag & drop ou botão)

#### 6.3 Criar Componente de Upload
- **Arquivo:** `apps/web/src/app/(app)/unidades/importar/components/csv-dropzone.tsx`
- **Funcionalidades:**
  - Drag & drop de arquivo
  - Validação de tipo (apenas .csv)
  - Validação de tamanho (max 5MB)
  - Preview do nome do arquivo
  - Botão para remover arquivo

```typescript
'use client'
import { useCallback, useState } from 'react'
import Papa from 'papaparse'

interface CSVDropzoneProps {
  onParse: (data: Record<string, string>[], headers: string[]) => void
  onError: (error: string) => void
}

export function CSVDropzone({ onParse, onError }: CSVDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  
  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      onError('Apenas arquivos .csv são permitidos')
      return
    }
    
    setFileName(file.name)
    
    // Parse com encoding Latin-1 para UTF-8
    Papa.parse(file, {
      header: true,
      delimiter: ';',
      encoding: 'ISO-8859-1',
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          onError(`Erro no parsing: ${results.errors[0].message}`)
          return
        }
        onParse(results.data as Record<string, string>[], results.meta.fields || [])
      },
      error: (error) => {
        onError(`Erro ao ler arquivo: ${error.message}`)
      }
    })
  }, [onParse, onError])
  
  // ... handlers de drag & drop
}
```

#### 6.4 Criar Componente de Preview
- **Arquivo:** `apps/web/src/app/(app)/unidades/importar/components/import-preview.tsx`
- **Funcionalidades:**
  - Tabela com primeiras 10 linhas
  - Indicação de campos mapeados vs ignorados
  - Contador de registros totais
  - Validação inline (erros em vermelho)
  - Estatísticas: válidos, com erro, duplicados

```typescript
interface ImportPreviewProps {
  data: ParsedUnit[]
  errors: ValidationError[]
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

interface ParsedUnit {
  rowIndex: number
  name: string
  code: string // gerado
  address: string
  city: string | null
  state: string | null
  capacity: number | null
  cnpj: string | null
  neighborhood: string | null
  region: string | null
  administrator: string | null
  supervisor_name: string | null
  isValid: boolean
  errors: string[]
}
```

#### 6.5 Criar Server Action de Importação
- **Arquivo:** `apps/web/src/app/(app)/unidades/importar/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ImportUnitData {
  name: string
  code: string
  address: string
  city: string | null
  state: string | null
  capacity: number | null
  cnpj: string | null
  neighborhood: string | null
  region: string | null
  administrator: string | null
  supervisor_name: string | null
}

export async function importUnits(units: ImportUnitData[]) {
  const supabase = await createClient()
  
  // Verificar admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return { error: 'Acesso negado', imported: 0, errors: [] }
  }
  
  const results = {
    imported: 0,
    updated: 0,
    errors: [] as { row: number; name: string; error: string }[]
  }
  
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    
    // Verificar se já existe (por nome ou CNPJ)
    const { data: existing } = await supabase
      .from('units')
      .select('id')
      .or(`name.eq.${unit.name},cnpj.eq.${unit.cnpj}`)
      .maybeSingle()
    
    if (existing) {
      // Atualizar existente (upsert)
      const { error } = await supabase
        .from('units')
        .update({
          address: unit.address,
          city: unit.city,
          state: unit.state,
          capacity: unit.capacity,
          cnpj: unit.cnpj,
          neighborhood: unit.neighborhood,
          region: unit.region,
          administrator: unit.administrator,
          supervisor_name: unit.supervisor_name,
        })
        .eq('id', existing.id)
      
      if (error) {
        results.errors.push({ row: i + 1, name: unit.name, error: error.message })
      } else {
        results.updated++
      }
    } else {
      // Inserir novo
      const { error } = await supabase
        .from('units')
        .insert({
          ...unit,
          status: 'active'
        })
      
      if (error) {
        results.errors.push({ row: i + 1, name: unit.name, error: error.message })
      } else {
        results.imported++
      }
    }
  }
  
  revalidatePath('/unidades')
  
  return results
}

export async function generateUnitCode(): Promise<string> {
  const supabase = await createClient()
  
  // Buscar último código
  const { data } = await supabase
    .from('units')
    .select('code')
    .like('code', 'UN%')
    .order('code', { ascending: false })
    .limit(1)
    .single()
  
  if (!data?.code) {
    return 'UN001'
  }
  
  const lastNumber = parseInt(data.code.replace('UN', ''), 10)
  return `UN${String(lastNumber + 1).padStart(3, '0')}`
}
```

#### 6.6 Criar Componente de Relatório
- **Arquivo:** `apps/web/src/app/(app)/unidades/importar/components/import-report.tsx`
- **Exibir:**
  - Total importados com sucesso
  - Total atualizados
  - Total com erro (com detalhes)
  - Botão para voltar à listagem
  - Botão para nova importação

#### 6.7 Fluxo de Importação

```
1. Admin acessa /unidades/importar
2. Arrasta ou seleciona arquivo CSV
3. Sistema faz parsing (client-side com Papa Parse)
4. Preview exibe dados mapeados e erros de validação
5. Admin revisa e confirma
6. Server Action processa importação (upsert)
7. Relatório final exibido
8. Redirect para listagem ou nova importação
```

### Validações a Implementar

| Validação | Tipo | Mensagem |
|-----------|------|----------|
| Nome vazio | Erro | "Nome da unidade é obrigatório" |
| Endereço vazio | Erro | "Endereço é obrigatório" |
| Capacidade inválida | Warning | "Capacidade deve ser um número positivo" |
| CNPJ duplicado | Warning | "CNPJ já existe - será atualizado" |
| Nome duplicado | Warning | "Unidade com mesmo nome já existe" |

### Design Visual
- Página clean com stepper (Upload → Preview → Resultado)
- Dropzone com borda tracejada e ícone de upload
- Tabela de preview com scroll horizontal
- Células com erro em vermelho claro
- Badges para status (válido/erro/duplicado)
- Toast de sucesso/erro após importação

### Critérios de Aceite
- [x] Upload de CSV funciona (drag & drop e botão)
- [x] Parser converte encoding corretamente (ISO-8859-1 → UTF-8)
- [x] Preview exibe dados mapeados corretamente
- [x] Validações identificam erros antes de importar
- [x] Upsert funciona (atualiza se existir, insere se não)
- [x] Relatório mostra resultado da importação
- [x] Importação das 94 unidades do CSV funciona
- [x] Acesso restrito a admin

---

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criação de índices, views e políticas RLS | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Frontend Specialist | Implementação das telas (listagem, detalhes, formulários) | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Backend Specialist | Server Actions, integração com Supabase | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Security Auditor | Validação de RLS e proteção de rotas | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Code Reviewer | Revisão de código, padrões e consistência | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Feature Developer | Implementação end-to-end das funcionalidades | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |

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
| RLS mal configurado expõe dados | Medium | High | Testar policies com diferentes usuários | Security Auditor |
| Conflito de vínculos usuário-unidade | Low | Medium | Validar constraint UNIQUE; UI impede duplicatas | Backend Specialist |
| Performance em listagem com muitas unidades | Low | Low | Índices criados; paginação se necessário | Database Specialist |
| UX confusa no seletor de unidades | Medium | Low | Testar fluxo completo; feedback visual claro | Frontend Specialist |
| Encoding do CSV incorreto | High | Medium | Usar Papa Parse com encoding ISO-8859-1; preview antes de importar | Backend Specialist |
| Duplicatas na importação | Medium | Low | Implementar upsert (atualiza se existir); validação prévia | Backend Specialist |
| Dados incompletos no CSV | Medium | Low | Validação prévia; campos opcionais aceitos; warnings | Frontend Specialist |

### Dependencies

- **Internal:** Tabelas `units`, `user_units` já existem; módulo de usuários já implementado
- **External:** Supabase Database
- **Technical:** Next.js 15 Server Actions, @supabase/ssr, shadcn/ui, **papaparse** (parsing CSV)
- **Dados:** `projeto/unidades.csv` (94 unidades para importar)

### Assumptions

- Modelo de dados existente atende às necessidades (campos básicos)
- Campos adicionais (email, foto, GPS) serão implementados em fase futura
- MVP sem upload de foto da unidade; usar ícone/placeholder

## Resource Estimation

### Time Allocation

| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2 - Implementation (CRUD + Vínculos) | 2-3 dias | 2-3 dias | 1-2 pessoas |
| Phase 2b - Implementation (Importação CSV) | 1 dia | 1 dia | 1 pessoa |
| Phase 3 - Validation | 0.5 dia | 0.5 dia | 1 pessoa |
| **Total** | **4-5 dias** | **4-5 dias** | **-** |

### Required Skills
- Next.js 15 (App Router, Server Actions)
- Supabase (Database, RLS)
- TypeScript
- shadcn/ui + Tailwind CSS
- Papa Parse (CSV parsing no browser)

### Resource Availability
- **Available:** 1 dev full-stack
- **Blocked:** N/A
- **Escalation:** Tech Lead para dúvidas de arquitetura

## Working Phases

### Phase 1 — Discovery & Alignment (0.5 dia)

**Steps**
1. Validar modelo de dados existente (tabelas, campos, relacionamentos)
2. Confirmar campos do formulário de unidade com PRD
3. Validar design das telas com design-system
4. Verificar integração com módulo de usuários existente

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 1 discovery - gestao-unidades"`

### Phase 2 — Implementation & Iteration (3-4 dias)

**Steps**
1. **Dia 1 - Database & Listagem**
   - Criar migrations (novos campos, índices, views, RLS)
   - Implementar tela de listagem de unidades
   - Implementar filtros e busca
   - Regenerar TypeScript types

2. **Dia 2 - CRUD & Detalhes**
   - Implementar formulário de cadastro/edição
   - Implementar Server Actions de CRUD
   - Criar página de detalhes da unidade
   - Criar componentes de visualização

3. **Dia 3 - Vínculos & Integração**
   - Implementar seletor de unidades no cadastro de usuário
   - Implementar gerenciamento de equipe na página da unidade
   - Integrar permissões units:* no RBAC
   - Testes manuais de fluxos

4. **Dia 4 - Importação de CSV**
   - Instalar Papa Parse
   - Criar página de importação com dropzone
   - Implementar parser e preview de dados
   - Implementar Server Action de importação (upsert)
   - Criar relatório de resultado
   - Testar importação com `projeto/unidades.csv`

**Commit Checkpoint**
- `git commit -m "feat(units): implement unit management module"`
- `git commit -m "feat(units): add CSV import functionality"`

### Phase 3 — Validation & Handoff (0.5 dia)

**Steps**
1. Testar fluxo completo: criar unidade → vincular usuários → visualizar
2. Testar RLS: usuário comum vs admin
3. Validar responsividade (mobile)
4. Rodar `mcp_supabase_get_advisors` (security)
5. Atualizar `entrega1_tarefas.md` com itens concluídos

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation - gestao-unidades"`

## Rollback Plan

### Rollback Triggers
- Bugs críticos em RLS expondo dados de unidades
- Vínculos usuário-unidade corrompidos
- Performance degradada na listagem

### Rollback Procedures

#### Phase 1 Rollback
- Action: Descartar branch de discovery
- Data Impact: Nenhum
- Estimated Time: < 30 min

#### Phase 2 Rollback
- Action: Reverter migrations via SQL ou rollback manual
- Data Impact: Possível perda de dados de teste
- Estimated Time: 1-2 horas

#### Phase 3 Rollback
- Action: Reverter commits de feature; restaurar versão anterior
- Data Impact: Mínimo (apenas ajustes de UI)
- Estimated Time: < 1 hora

### Post-Rollback Actions
1. Documentar razão do rollback
2. Notificar stakeholders
3. Analisar causa raiz
4. Atualizar plano com lições aprendidas

## Evidence & Follow-up

### Evidências a Coletar
- Screenshot da tela de listagem de unidades
- Screenshot do formulário de cadastro
- Screenshot da página de detalhes
- Screenshot do seletor de unidades no cadastro de usuário
- Screenshot da página de importação CSV
- Screenshot do preview de dados antes de importar
- Screenshot do relatório de importação (94 unidades)
- Log de teste de RLS (usuário vs admin)
- Output de `mcp_supabase_get_advisors` (security)
- TypeScript types gerados (`database.types.ts`)

// Serão feitos em outra etapa

---

## Referências Técnicas

### Stack do Projeto
- **Framework:** Next.js 15 (App Router)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **Database:** PostgreSQL (Supabase)
- **UI:** shadcn/ui + Tailwind CSS
- **Design System:** [design-system.md](../../design-system.md)

### Documentação
- [PRD do GAPP](../../projeto/PRD.md) — Seção 3.3 Gestão de Unidades
- [Departamentos e Cargos](../../projeto/usuarios/departamentos_cargos.md) — Regras de vínculo
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

### Arquivos Existentes (Referência)
- `apps/web/src/app/(app)/usuarios/` — Módulo de usuários (padrão a seguir)
- `apps/web/src/lib/supabase/client.ts` — Cliente browser
- `apps/web/src/lib/supabase/server.ts` — Cliente server
- `apps/web/src/lib/supabase/database.types.ts` — Types gerados
- `apps/web/src/lib/auth/permissions.ts` — Sistema de permissões

<!-- agent-update:end -->
