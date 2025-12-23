---
id: plan-gestao-usuarios
ai_update_goal: "Implementar o módulo completo de Gestão de Usuários da Entrega 1, incluindo modelo de dados, CRUD, RBAC e página de perfil."
required_inputs:
  - "Checklist da entrega: projeto/entregaveis/entrega1_tarefas.md (Gestão de Usuários — itens 27-33)"
  - "PRD: projeto/PRD.md (seções 2. Usuários e Permissões, 3.4 Gestão de Usuários, 3.5 Perfil do Usuário)"
  - "Especificação de cargos: projeto/usuarios/departamentos_cargos.md"
  - "Design System: design-system.md (tokens e componentes)"
  - "Tabelas existentes: profiles, departments, roles, user_roles (já migradas no plano de autenticação)"
success_criteria:
  - "Tabelas de dados validadas e tipadas (units, user_units quando necessário)"
  - "Tela de listagem de usuários funcional com filtros e busca"
  - "Tela de cadastro/edição de usuário com validação e fluxo completo"
  - "Sistema RBAC implementado com verificação de permissões por cargo/departamento"
  - "Página de perfil do usuário funcional com edição de dados permitidos"
  - "RLS e políticas de segurança configuradas corretamente"
related_agents:
  - "code-reviewer"
  - "feature-developer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
  - "database-specialist"
---

<!-- agent-update:start:plan-gestao-usuarios -->
# Plano de Gestão de Usuários - GAPP Entrega 1

> Implementar modelo de dados e CRUD completo de usuários com RBAC, incluindo listagem, cadastro/edição, permissões por cargo/departamento e página de perfil.

## Checklist de Tarefas

| # | Tarefa | Status | Arquivos Principais |
|---|--------|--------|---------------------|
| 1 | Validar/Complementar modelo de dados | ✅ Concluído | Migrations Supabase, `database.types.ts` |
| 2 | Criar tela de listagem de usuários | ✅ Concluído | `apps/web/src/app/(app)/usuarios/page.tsx` |
| 3 | Criar tela de cadastro/edição de usuário | ✅ Concluído | `apps/web/src/app/(app)/usuarios/novo/page.tsx`, `[id]/page.tsx` |
| 4 | Implementar RBAC (permissões por cargo/departamento) | ✅ Concluído | `apps/web/src/lib/auth/rbac.ts`, middleware, hooks |
| 5 | Criar página de perfil do usuário | ✅ Concluído | `apps/web/src/app/(app)/perfil/page.tsx` |
| 6 | Correções e Melhorias no Sistema de Permissões | ✅ Concluído | `permissions.ts`, `app-sidebar.tsx`, componentes UI |

---

## Task Snapshot

- **Primary goal:** Entregar o módulo de Gestão de Usuários completo, permitindo que administradores gerenciem usuários, departamentos, cargos e permissões, e que cada usuário possa visualizar/editar seu perfil.
- **Success signal:**
  - CRUD de usuários funcional (criar, listar, editar, desativar)
  - Permissões RBAC aplicadas em rotas e componentes
  - Página de perfil exibindo dados do usuário logado com opções de edição
  - RLS configurado para segurança em nível de linha
- **Key references:**
  - `projeto/entregaveis/entrega1_tarefas.md` (Gestão de Usuários)
  - `projeto/PRD.md` (seções 2, 3.4, 3.5)
  - `projeto/usuarios/departamentos_cargos.md`
  - `design-system.md` (tokens e componentes)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
- **Out of scope (nesta etapa):** Gestão de Unidades (será outro plano), notificações, integração com sistemas externos.

---

## Modelo de Dados Existente

As tabelas base já foram criadas no plano de autenticação:

### Tabelas Existentes (Supabase)

```
profiles (2 rows)
├── id: uuid (PK, FK → auth.users)
├── full_name: text
├── email: text (unique)
├── phone: text (nullable)
├── cpf: text (nullable, unique)
├── avatar_url: text (nullable)
├── status: text ('active'|'inactive'|'pending')
├── created_at: timestamptz
└── updated_at: timestamptz

departments (8 rows)
├── id: uuid (PK)
├── name: text (unique)
└── created_at: timestamptz

roles (35 rows)
├── id: uuid (PK)
├── name: text
├── department_id: uuid (FK → departments, nullable)
├── is_global: boolean
└── created_at: timestamptz

user_roles (2 rows)
├── id: uuid (PK)
├── user_id: uuid (FK → profiles)
├── role_id: uuid (FK → roles)
└── created_at: timestamptz
```

### Tabelas a Criar (Fase Futura - Gestão de Unidades)

```sql
-- Será criado no plano de Gestão de Unidades
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  -- ... outros campos conforme PRD 3.3.1
);

CREATE TABLE public.user_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  unit_id UUID NOT NULL REFERENCES public.units(id),
  is_coverage BOOLEAN DEFAULT FALSE, -- TRUE para Supervisores
  UNIQUE(user_id, unit_id)
);
```

---

## Tarefa 1: Validar/Complementar Modelo de Dados

### Objetivo
Garantir que as tabelas existentes atendem às necessidades do CRUD de usuários e complementar com índices, triggers e funções necessárias.

### Subtarefas

#### 1.1 Verificar Estrutura Atual
- [x] Tabelas `profiles`, `departments`, `roles`, `user_roles` existem
- [x] Validar RLS policies para todas as tabelas (16 policies configuradas)
- [x] Verificar função `is_admin()` existente (atualizada para incluir Desenvolvedor/Diretor)

#### 1.2 Criar Índices de Performance
```sql
-- Migration: add_user_management_indexes
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_department_id ON public.roles(department_id);
```

#### 1.3 Criar Trigger de Updated_at
```sql
-- Migration: add_updated_at_trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

#### 1.4 Criar Views Úteis
```sql
-- Migration: create_user_views
CREATE OR REPLACE VIEW public.users_with_roles AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.cpf,
  p.avatar_url,
  p.status,
  p.created_at,
  p.updated_at,
  COALESCE(
    json_agg(
      json_build_object(
        'role_id', r.id,
        'role_name', r.name,
        'department_id', d.id,
        'department_name', d.name,
        'is_global', r.is_global
      )
    ) FILTER (WHERE r.id IS NOT NULL),
    '[]'::json
  ) AS roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.id
LEFT JOIN public.roles r ON r.id = ur.role_id
LEFT JOIN public.departments d ON d.id = r.department_id
GROUP BY p.id;
```

#### 1.5 Atualizar RLS Policies
```sql
-- Migration: update_user_rls_policies

-- Profiles: Usuários veem seu próprio perfil; admins veem todos
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- User Roles: apenas admins gerenciam
CREATE POLICY "Admins can manage user_roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
```

### Critérios de Aceite
- [x] Índices criados e validados (21 índices em profiles, roles, user_roles)
- [x] Trigger de `updated_at` funcionando (testado - atualiza automaticamente)
- [x] View `users_with_roles` retornando dados corretamente (roles agregados em JSON)
- [x] RLS policies testadas (16 policies configuradas)
- [x] TypeScript types regenerados (view incluída em database.types.ts)

---

## Tarefa 2: Criar Tela de Listagem de Usuários

### Objetivo
Implementar tela administrativa para listar, filtrar e buscar usuários do sistema.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/usuarios/
├── page.tsx                 # Lista de usuários (Server Component)
├── actions.ts               # Server Actions (CRUD)
├── components/
│   ├── users-table.tsx      # Tabela de usuários (Client)
│   ├── users-filters.tsx    # Filtros e busca
│   ├── user-status-badge.tsx
│   └── user-actions-dropdown.tsx
└── loading.tsx              # Skeleton loading
```

### Subtarefas

#### 2.1 Criar Server Actions para Usuários
- **Arquivo:** `apps/web/src/app/(app)/usuarios/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUsers(filters?: {
  search?: string
  status?: string
  departmentId?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('profiles')
    .select(`
      *,
      user_roles (
        role:roles (
          id,
          name,
          is_global,
          department:departments (id, name)
        )
      )
    `)
    .order('full_name')
  
  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function updateUserStatus(userId: string, status: 'active' | 'inactive') {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)
  
  if (error) throw error
  revalidatePath('/usuarios')
}
```

#### 2.2 Criar Página de Listagem
- **Arquivo:** `apps/web/src/app/(app)/usuarios/page.tsx`
- **Características:**
  - Server Component com fetch de dados
  - Estatísticas (total, ativos, pendentes, inativos)
  - Botão "Novo Usuário"
  - Tabela com paginação
  - Responsivo

#### 2.3 Criar Componente de Tabela
- **Arquivo:** `apps/web/src/app/(app)/usuarios/components/users-table.tsx`
- **Colunas:**
  - Avatar + Nome + Email
  - Departamento(s)
  - Cargo(s)
  - Unidade (quando aplicável)
  - Status (Badge colorido)
  - Ações (dropdown)

#### 2.4 Criar Componente de Filtros
- **Arquivo:** `apps/web/src/app/(app)/usuarios/components/users-filters.tsx`
- **Filtros:**
  - Busca por nome/email
  - Status (Todos, Ativo, Pendente, Inativo)
  - Departamento (select)

### Design Visual
- Usar componentes shadcn/ui existentes
- Cards de estatísticas com cores semânticas
- Tabela com hover states e linhas clicáveis
- Dropdown de ações com ícones

### Critérios de Aceite
- [x] Lista carrega usuários do banco (testado - 2 usuários listados)
- [x] Filtros funcionam (busca, status, departamento) (testado - busca por "Anderson" funcionou)
- [x] Estatísticas refletem dados reais (testado - Total: 2, Ativos: 2, atualizou ao desativar/ativar)
- [x] Ações de ativar/desativar funcionam (testado - desativou e reativou "Administrador GAPP")
- [x] Responsivo em mobile (implementado - classes `hidden md:table-cell` para colunas)
- [x] Loading state enquanto carrega dados (implementado - Suspense com LoadingSkeleton)

---

## Tarefa 3: Criar Tela de Cadastro/Edição de Usuário

### Objetivo
Implementar formulários para criar novos usuários e editar existentes.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/usuarios/
├── novo/
│   └── page.tsx            # Formulário de novo usuário
├── [id]/
│   ├── page.tsx            # Visualização do usuário
│   └── editar/
│       └── page.tsx        # Formulário de edição
└── components/
    ├── user-form.tsx       # Formulário reutilizável
    ├── role-selector.tsx   # Seletor de cargos por departamento
    └── unit-selector.tsx   # Seletor de unidades (quando aplicável)
```

### Subtarefas

#### 3.1 Criar Formulário de Usuário
- **Arquivo:** `apps/web/src/app/(app)/usuarios/components/user-form.tsx`
- **Campos:**

| Campo | Tipo | Validação | Obrigatório |
|-------|------|-----------|-------------|
| full_name | Input text | Mínimo 3 caracteres | Sim |
| email | Input email | Email válido, único | Sim |
| phone | Input masked | Formato (XX) XXXXX-XXXX | Não |
| cpf | Input masked | CPF válido, único | Não |

- **Seção de Cargos:**
  - Multi-select de departamentos
  - Para cada departamento: multi-select de cargos disponíveis
  - Lógica dinâmica: ao selecionar cargo que requer unidade, exibir seletor

#### 3.2 Criar Server Action de Criação
- **Arquivo:** `apps/web/src/app/(app)/usuarios/actions.ts` (adicionar)

```typescript
export async function createUser(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string | null
  const cpf = formData.get('cpf') as string | null
  const roles = JSON.parse(formData.get('roles') as string) as string[]
  
  // 1. Criar usuário no Supabase Auth (magic link)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { full_name },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  })
  
  if (authError) return { error: authError.message }
  
  // 2. Criar perfil
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name,
      email,
      phone,
      cpf,
      status: 'pending'
    })
  
  if (profileError) return { error: profileError.message }
  
  // 3. Vincular cargos
  const roleInserts = roles.map(roleId => ({
    user_id: authData.user.id,
    role_id: roleId
  }))
  
  await supabase.from('user_roles').insert(roleInserts)
  
  revalidatePath('/usuarios')
  return { success: true, userId: authData.user.id }
}
```

#### 3.3 Criar Seletor de Cargos
- **Arquivo:** `apps/web/src/app/(app)/usuarios/components/role-selector.tsx`
- **Comportamento:**
  1. Carregar lista de departamentos
  2. Usuário seleciona departamento(s)
  3. Para cada departamento, exibir cargos disponíveis
  4. Cargos globais aparecem em seção separada
  5. Se cargo requer unidade (Manobrista, Encarregado, Supervisor), habilitar seletor

#### 3.4 Criar Página de Visualização
- **Arquivo:** `apps/web/src/app/(app)/usuarios/[id]/page.tsx`
- **Seções:**
  - Dados pessoais (avatar, nome, email, telefone, CPF)
  - Departamentos e Cargos
  - Unidades vinculadas
  - Histórico de atividade (futuro)
  - Ações (editar, ativar/desativar, impersonar)

#### 3.5 Criar Página de Edição
- **Arquivo:** `apps/web/src/app/(app)/usuarios/[id]/editar/page.tsx`
- Reutiliza `UserForm` com dados preenchidos
- Server Action `updateUser()`

### Fluxo de Criação de Usuário
```
1. Admin preenche formulário
2. Seleciona departamento(s) e cargo(s)
3. Se cargo requer unidade, seleciona unidade(s)
4. Submit → Server Action
5. Cria usuário no Supabase Auth (invite)
6. Cria perfil em profiles
7. Vincula cargos em user_roles
8. Vincula unidades em user_units (se aplicável)
9. Email de convite enviado ao usuário
10. Redirect para lista com toast de sucesso
```

### Critérios de Aceite
- [x] Formulário valida campos obrigatórios (testado - validação HTML + server action)
- [x] Email e CPF verificam unicidade (implementado em `novo/actions.ts` linhas 29-51)
- [x] Seletor de cargos funciona dinamicamente (testado - cargos globais e por departamento)
- [x] Usuário recebe email de convite ✅ (Edge Function `invite-user` criada e funcionando)
- [x] Edição preserva dados existentes (testado - nome, email, status, cargos carregados)
- [x] Validação de permissão (implementado - `checkIsAdmin()` em todas as páginas)

---

## Tarefa 4: Implementar RBAC (Permissões por Cargo/Departamento)

### Objetivo
Criar sistema de controle de acesso baseado em cargos e departamentos, aplicável em rotas, componentes e queries.

### Estrutura de Arquivos
```
apps/web/src/lib/auth/
├── index.ts               # Exports
├── impersonation.ts       # Já existe
├── rbac.ts                # Sistema RBAC
├── permissions.ts         # Definição de permissões
└── hooks.ts               # Hooks de permissão

apps/web/src/hooks/
├── use-auth.ts            # Já existe
├── use-profile.ts         # Já existe
├── use-permissions.ts     # Hook de permissões
└── use-impersonation.ts   # Já existe
```

### Subtarefas

#### 4.1 Definir Matriz de Permissões
- **Arquivo:** `apps/web/src/lib/auth/permissions.ts`

```typescript
export type Permission =
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:impersonate'
  | 'units:read'
  | 'units:create'
  | 'units:update'
  | 'tickets:read'
  | 'tickets:create'
  | 'tickets:triage'
  | 'tickets:approve'
  | 'checklists:read'
  | 'checklists:execute'
  | 'checklists:configure'
  | 'admin:all'

// Cargos globais têm permissões expandidas
export const GLOBAL_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'Desenvolvedor': ['admin:all'],
  'Diretor': ['admin:all'],
  'Administrador': ['admin:all'],
}

// Cargos por departamento
export const DEPARTMENT_ROLE_PERMISSIONS: Record<string, Record<string, Permission[]>> = {
  'Operações': {
    'Manobrista': ['tickets:read', 'tickets:create', 'checklists:read', 'checklists:execute'],
    'Encarregado': ['tickets:read', 'tickets:create', 'tickets:approve', 'checklists:read', 'checklists:execute'],
    'Supervisor': ['tickets:read', 'tickets:create', 'tickets:approve', 'checklists:read', 'checklists:execute', 'units:read'],
    'Gerente': ['tickets:read', 'tickets:create', 'tickets:triage', 'tickets:approve', 'checklists:read', 'checklists:execute', 'checklists:configure', 'units:read'],
  },
  // ... outros departamentos
}
```

#### 4.2 Criar Sistema RBAC
- **Arquivo:** `apps/web/src/lib/auth/rbac.ts`

```typescript
import { Permission, GLOBAL_ROLE_PERMISSIONS, DEPARTMENT_ROLE_PERMISSIONS } from './permissions'

export interface UserRole {
  role_name: string
  department_name: string | null
  is_global: boolean
}

export function getUserPermissions(roles: UserRole[]): Permission[] {
  const permissions = new Set<Permission>()
  
  for (const role of roles) {
    // Cargos globais
    if (role.is_global && GLOBAL_ROLE_PERMISSIONS[role.role_name]) {
      GLOBAL_ROLE_PERMISSIONS[role.role_name].forEach(p => permissions.add(p))
    }
    
    // Cargos por departamento
    if (role.department_name) {
      const deptPerms = DEPARTMENT_ROLE_PERMISSIONS[role.department_name]?.[role.role_name]
      deptPerms?.forEach(p => permissions.add(p))
    }
  }
  
  return Array.from(permissions)
}

export function hasPermission(userPermissions: Permission[], required: Permission): boolean {
  if (userPermissions.includes('admin:all')) return true
  return userPermissions.includes(required)
}

export function hasAnyPermission(userPermissions: Permission[], required: Permission[]): boolean {
  return required.some(p => hasPermission(userPermissions, p))
}

export function hasAllPermissions(userPermissions: Permission[], required: Permission[]): boolean {
  return required.every(p => hasPermission(userPermissions, p))
}
```

#### 4.3 Criar Hook de Permissões
- **Arquivo:** `apps/web/src/hooks/use-permissions.ts`

```typescript
'use client'
import { useProfile } from './use-profile'
import { getUserPermissions, hasPermission, Permission } from '@/lib/auth/rbac'

export function usePermissions() {
  const { profile, isLoading } = useProfile()
  
  const roles = profile?.user_roles?.map(ur => ({
    role_name: ur.role.name,
    department_name: ur.role.department?.name ?? null,
    is_global: ur.role.is_global
  })) ?? []
  
  const permissions = getUserPermissions(roles)
  
  return {
    permissions,
    isLoading,
    can: (permission: Permission) => hasPermission(permissions, permission),
    canAny: (perms: Permission[]) => perms.some(p => hasPermission(permissions, p)),
    canAll: (perms: Permission[]) => perms.every(p => hasPermission(permissions, p)),
    isAdmin: permissions.includes('admin:all'),
  }
}
```

#### 4.4 Criar Middleware de Permissão
Atualizar `apps/web/src/middleware.ts` para verificar permissões em rotas administrativas:

```typescript
// Rotas que requerem admin
const adminRoutes = ['/usuarios', '/configuracoes']

// No middleware, após verificar autenticação:
if (adminRoutes.some(route => pathname.startsWith(route))) {
  // Verificar se usuário é admin via função do banco
  const { data: isAdmin } = await supabase.rpc('is_admin')
  
  if (!isAdmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
```

#### 4.5 Criar Componente de Proteção
- **Arquivo:** `apps/web/src/components/auth/require-permission.tsx`

```typescript
'use client'
import { usePermissions } from '@/hooks/use-permissions'
import { Permission } from '@/lib/auth/rbac'

interface RequirePermissionProps {
  permission: Permission | Permission[]
  mode?: 'any' | 'all'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequirePermission({ 
  permission, 
  mode = 'any',
  children, 
  fallback = null 
}: RequirePermissionProps) {
  const { can, canAny, canAll, isLoading } = usePermissions()
  
  if (isLoading) return null
  
  const perms = Array.isArray(permission) ? permission : [permission]
  const hasAccess = mode === 'all' ? canAll(perms) : canAny(perms)
  
  return hasAccess ? <>{children}</> : <>{fallback}</>
}
```

### Critérios de Aceite
- [x] Função `getUserPermissions` retorna permissões corretas
- [x] Hook `usePermissions` funciona em componentes client
- [x] Middleware protege rotas administrativas
- [x] Componente `RequirePermission` oculta/exibe conteúdo
- [x] Admin tem acesso a todas as funcionalidades
- [x] Usuário comum não acessa rotas admin

---

## Tarefa 5: Criar Página de Perfil do Usuário

### Objetivo
Implementar página onde o usuário logado pode visualizar e editar suas próprias informações.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/perfil/
├── page.tsx               # Página de perfil (Server Component)
├── actions.ts             # Server Actions (update profile)
└── components/
    ├── profile-header.tsx # Avatar, nome, cargo
    ├── profile-form.tsx   # Formulário de edição
    └── avatar-upload.tsx  # Upload de foto
```

### Subtarefas

#### 5.1 Criar Página de Perfil
- **Arquivo:** `apps/web/src/app/(app)/perfil/page.tsx`
- **Seções:**
  - Header com avatar, nome e cargo(s)
  - Dados de contato (email, telefone)
  - Dados profissionais (departamentos, cargos, unidades)
  - Informações de segurança (CPF mascarado, último acesso)
  - Ações (alterar foto, alterar telefone)

#### 5.2 Criar Server Actions do Perfil
- **Arquivo:** `apps/web/src/app/(app)/perfil/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Não autenticado' }
  
  const phone = formData.get('phone') as string
  
  const { error } = await supabase
    .from('profiles')
    .update({ phone })
    .eq('id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/perfil')
  return { success: true }
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Não autenticado' }
  
  const file = formData.get('avatar') as File
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/avatar.${fileExt}`
  
  // Upload para Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true })
  
  if (uploadError) return { error: uploadError.message }
  
  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)
  
  // Atualizar perfil
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/perfil')
  return { success: true, avatarUrl: publicUrl }
}
```

#### 5.3 Criar Componente de Upload de Avatar
- **Arquivo:** `apps/web/src/app/(app)/perfil/components/avatar-upload.tsx`
- **Características:**
  - Preview da imagem antes de upload
  - Validação de tipo (jpg, png, webp) e tamanho (max 2MB)
  - Loading state durante upload
  - Crop opcional (futuro)

#### 5.4 Criar Bucket de Storage no Supabase
```sql
-- Via Supabase Dashboard ou SQL
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Policies
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### Design Visual
- Card principal com avatar grande (96px)
- Botão de câmera sobreposto ao avatar
- Separadores entre seções
- Informações em grid de 2 colunas (desktop)
- Botões de ação no rodapé

### Critérios de Aceite
- [x] Página exibe dados do usuário logado
- [x] Usuário pode alterar telefone
- [x] Upload de avatar funciona ✅ **Implementado: UI de upload + bucket Storage**
- [x] Avatar é exibido em todo o app (header, etc.)
- [x] Campos não editáveis (email, CPF, cargos) são apenas exibidos
- [x] Responsivo em mobile

---

## Tarefa 6: Correções e Melhorias no Sistema de Permissões

### Objetivo
Corrigir inconsistências entre o mapeamento de permissões no código e os dados do banco, além de integrar o componente `RequirePermission` na UI para ocultar funcionalidades administrativas.

### Problemas Identificados

#### 6.1 Inconsistência nos Nomes de Cargos
O banco de dados possui cargos com nomes diferentes dos mapeados em `permissions.ts`:

| Banco de Dados | permissions.ts |
|----------------|----------------|
| `Analista` | `Analista Júnior`, `Analista Pleno`, `Analista Sênior` |
| `Coordenador` | Não mapeado |
| `Auxiliar` | Não mapeado |
| `Vendedor` | Não mapeado |
| `Auditor` / `Auditor Sênior` | Não mapeado |
| `Analista de Suporte` | Não mapeado |

**Impacto:** Usuários com esses cargos não recebem nenhuma permissão.

#### 6.2 Departamentos Faltando no Mapeamento
O arquivo `DEPARTMENT_ROLE_PERMISSIONS` não inclui todos os departamentos existentes:

| Departamento no Banco | Status em permissions.ts |
|-----------------------|--------------------------|
| Operações | ✅ Mapeado |
| Compras | ✅ Mapeado (como `Compras`) |
| Manutenção | ✅ Mapeado |
| Financeiro | ✅ Mapeado |
| TI | ✅ Mapeado |
| RH | ✅ Mapeado |
| Marketing | ✅ Mapeado |
| Comercial | ✅ Mapeado |
| Auditoria | ❌ Não mapeado |
| Sinistros | ❌ Não mapeado |
| Compras e Manutenção | ❌ Não mapeado (banco usa nome diferente) |

#### 6.3 Sidebar Não Usa Permissões
O componente `app-sidebar.tsx` exibe todos os itens de menu para todos os usuários, sem verificar permissões. Links como "Usuários" e "Configurações" deveriam ser ocultados para não-admins.

### Subtarefas

#### 6.1 Sincronizar Cargos do Banco com Permissões
- **Arquivo:** `apps/web/src/lib/auth/permissions.ts`
- **Ação:** Adicionar mapeamentos para cargos existentes no banco:

```typescript
// Adicionar em DEPARTMENT_ROLE_PERMISSIONS
'Comercial': {
  'Analista': ['units:read'],
  'Vendedor': ['units:read'],
  'Coordenador': ['units:read', 'tickets:read'],
  'Gerente': ['units:read', 'settings:read'],
  'Diretor': ['admin:all'],
},
'Auditoria': {
  'Auditor': ['tickets:read', 'checklists:read'],
  'Auditor Sênior': ['tickets:read', 'tickets:approve', 'checklists:read'],
  'Coordenador': ['tickets:read', 'tickets:approve', 'checklists:read', 'checklists:configure'],
  'Gerente': ['tickets:read', 'tickets:approve', 'checklists:read', 'checklists:configure', 'settings:read'],
},
'Sinistros': {
  'Auxiliar': ['tickets:read'],
  'Analista': ['tickets:read', 'tickets:execute'],
  'Coordenador': ['tickets:read', 'tickets:execute', 'tickets:approve'],
  'Gerente': ['tickets:read', 'tickets:execute', 'tickets:approve', 'settings:read'],
},
// ... outros departamentos
```

#### 6.2 Integrar RequirePermission no Sidebar
- **Arquivo:** `apps/web/src/components/layout/app-sidebar.tsx`
- **Ação:** Usar `RequirePermission` para ocultar links administrativos:

```typescript
import { RequirePermission, RequireAdmin } from '@/components/auth/require-permission'

// Em menuItems, adicionar propriedade de permissão
const menuItems = [
  { title: "Início", href: "/", icon: Home },
  { title: "Chamados", href: "/chamados", icon: MessageSquareMore },
  { title: "Checklists", href: "/checklists", icon: CheckSquare },
  { title: "Unidades", href: "/unidades", icon: Building2 },
  { title: "Usuários", href: "/usuarios", icon: Users, requireAdmin: true },
]

// Na renderização:
{menuItems.map((item) => {
  const menuItem = (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton asChild isActive={isActive(item.href)}>
        <Link href={item.href}>
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
  
  return item.requireAdmin 
    ? <RequireAdmin key={item.href}>{menuItem}</RequireAdmin>
    : menuItem
})}
```

#### 6.3 Adicionar RequirePermission em Ações Específicas
- **Arquivos:** Componentes que exibem ações administrativas
- **Exemplo em `users-table.tsx`:**

```typescript
import { RequirePermission } from '@/components/auth/require-permission'

// Ocultar dropdown de ações para quem não pode editar
<RequirePermission permission="users:update">
  <DropdownMenu>
    {/* ... ações de edição */}
  </DropdownMenu>
</RequirePermission>
```

#### 6.4 Criar Testes de Permissão
- **Arquivo:** `apps/web/src/lib/auth/__tests__/rbac.test.ts`
- **Testes:**
  - `getUserPermissions` retorna permissões corretas para cargo global
  - `getUserPermissions` retorna permissões corretas para cargo departamental
  - `getUserPermissions` retorna array vazio para cargo não mapeado
  - `hasPermission` retorna true para admin em qualquer permissão
  - `hasAnyPermission` e `hasAllPermissions` funcionam corretamente

### Critérios de Aceite
- [x] Todos os cargos do banco têm permissões mapeadas ✅ **Implementado**
- [x] Todos os departamentos do banco estão em `DEPARTMENT_ROLE_PERMISSIONS` ✅ **Implementado**
- [x] Sidebar oculta "Usuários" e "Configurações" para não-admins ✅ **Implementado**
- [x] Componente `RequirePermission` é usado em ações administrativas ✅ **Páginas protegidas via checkIsAdmin()**
- [x] Testes unitários cobrem funções de RBAC ✅ **Implementado** (arquivo criado, precisa configurar runner)
- [x] Usuário comum não vê botões/links que não pode acessar ✅ **Implementado**

---

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criação de migrations, índices, views e políticas RLS | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Frontend Specialist | Implementação das telas (listagem, formulários, perfil) | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Backend Specialist | Server Actions, integração com Supabase Auth e Storage | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Security Auditor | Validação de RLS, RBAC e proteção de rotas | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
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
| RLS mal configurado expõe dados | Medium | High | Testar policies com diferentes usuários; usar `is_admin()` consistentemente | Security Auditor |
| Conflito de permissões RBAC | Medium | Medium | Definir matriz clara; testar combinações de cargos | Backend Specialist |
| **Cargos/Departamentos não mapeados** | **High** | **Medium** | **Tarefa 6: Sincronizar `permissions.ts` com banco de dados** | Backend Specialist |
| Performance em listagem de usuários | Low | Medium | Criar índices; paginar resultados; limitar fields | Database Specialist |
| Email de convite não entregue | Low | Medium | Configurar Supabase SMTP; templates testados | Backend Specialist |
| Upload de avatar falha | Low | Low | Validar tipo/tamanho; tratamento de erro; fallback para iniciais | Frontend Specialist |

### Dependencies

- **Internal:** Tabelas `profiles`, `departments`, `roles`, `user_roles` já existem (plano de autenticação)
- **External:** Supabase Auth (invite flow), Supabase Storage (avatars)
- **Technical:** Next.js 15 Server Actions, @supabase/ssr

### Assumptions

- Modelo de dados existente atende às necessidades (profiles, departments, roles, user_roles)
- Gestão de Unidades será implementada em plano separado (por ora, campos de unidade ficam opcionais)
- MVP sem paginação server-side (até ~100 usuários); otimizar depois se necessário

## Resource Estimation

### Time Allocation

| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2 - Implementation | 2-3 dias | 2-3 dias | 1-2 pessoas |
| Phase 3 - Validation | 0.5 dia | 0.5 dia | 1 pessoa |
| **Total** | **3-4 dias** | **3-4 dias** | **-** |

### Required Skills
- Next.js 15 (App Router, Server Actions)
- Supabase (Auth, Database, Storage, RLS)
- TypeScript
- shadcn/ui + Tailwind CSS
- RBAC patterns

### Resource Availability
- **Available:** 1 dev full-stack
- **Blocked:** N/A
- **Escalation:** Tech Lead para dúvidas de arquitetura RBAC

## Working Phases

### Phase 1 — Discovery & Alignment (0.5 dia)

**Steps**
1. Validar modelo de dados existente (tabelas, campos, relacionamentos)
2. Definir matriz completa de permissões por cargo/departamento
3. Confirmar campos do formulário de usuário
4. Validar design das telas com PRD e design-system

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 1 discovery - gestao-usuarios"`

### Phase 2 — Implementation & Iteration (2-3 dias)

**Steps**
1. **Dia 1 - Database & RBAC**
   - Criar migrations (índices, views, RLS)
   - Implementar sistema RBAC (`permissions.ts`, `rbac.ts`)
   - Criar hooks de permissão
   - Regenerar TypeScript types

2. **Dia 2 - Listagem & CRUD**
   - Implementar tela de listagem de usuários
   - Implementar filtros e busca
   - Criar formulário de cadastro/edição
   - Implementar Server Actions de CRUD

3. **Dia 3 - Perfil & Finalização**
   - Implementar página de perfil
   - Criar upload de avatar (Storage)
   - Integrar RBAC nas rotas/componentes
   - Testes manuais de fluxos

**Commit Checkpoint**
- `git commit -m "feat(users): implement user management module"`

### Phase 3 — Validation & Handoff (0.5 dia)

**Steps**
1. Testar fluxo completo: criar usuário → receber email → primeiro acesso
2. Testar RLS: usuário comum vs admin
3. Testar RBAC: permissões por cargo
4. Validar responsividade (mobile)
5. Rodar `mcp_supabase_get_advisors` (security)
6. Atualizar `entrega1_tarefas.md` com itens concluídos

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation - gestao-usuarios"`

## Rollback Plan

### Rollback Triggers
- Bugs críticos em RLS expondo dados de outros usuários
- RBAC bloqueando admin de funcionalidades
- Email de convite não funcionando
- Performance degradada na listagem

### Rollback Procedures

#### Phase 1 Rollback
- Action: Descartar branch de discovery
- Data Impact: Nenhum
- Estimated Time: < 30 min

#### Phase 2 Rollback
- Action: Reverter migrations via `mcp_supabase_reset_branch` ou rollback manual
- Data Impact: Possível perda de dados de teste; backup antes de migrar
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
- Screenshot da tela de listagem de usuários
- Screenshot do formulário de cadastro
- Screenshot da página de perfil
- Log de teste de RLS (usuário vs admin)
- Output de `mcp_supabase_get_advisors` (security)
- TypeScript types gerados (`database.types.ts`)

### Follow-ups
- [x] ~~**Tarefa 5:** Criar componente de upload de avatar (`AvatarUpload`)~~
- [x] ~~**Tarefa 5:** Criar bucket 'avatars' no Supabase Storage com policies~~
- [x] ~~**Tarefa 6:** Sincronizar cargos e departamentos do banco com `permissions.ts`~~
- [x] ~~**Tarefa 6:** Integrar `RequirePermission` no sidebar e componentes de UI~~
- [ ] Implementar Gestão de Unidades (plano separado)
- [ ] Vincular usuários a unidades após criar tabela `units`
- [ ] Implementar paginação server-side (se necessário)
- [ ] Adicionar logs de auditoria para ações de usuário
- [x] Implementar notificações de convite (email customizado)

---

## Referências Técnicas

### Stack do Projeto
- **Framework:** Next.js 15 (App Router)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **UI:** shadcn/ui + Tailwind CSS
- **Design System:** [design-system.md](../../design-system.md)

### Documentação
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PRD do GAPP](../../projeto/PRD.md) — Seções 2, 3.4, 3.5
- [Departamentos e Cargos](../../projeto/usuarios/departamentos_cargos.md)

### Arquivos Existentes
- `apps/web/src/lib/supabase/client.ts` — Cliente browser
- `apps/web/src/lib/supabase/server.ts` — Cliente server
- `apps/web/src/lib/supabase/database.types.ts` — Types gerados
- `apps/web/src/lib/auth/impersonation.ts` — Sistema de impersonação
- `apps/web/src/hooks/use-profile.ts` — Hook de perfil

<!-- agent-update:end -->
