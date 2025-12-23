---
id: plan-autenticacao
ai_update_goal: "Define the stages, owners, and evidence required to complete Plano de Autenticação - Entrega 1."
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

<!-- agent-update:start:plan-autenticacao -->
# Plano de Autenticação - GAPP Entrega 1

> Sistema de autenticação completo para o GAPP (Garageinn App) usando Supabase Auth com Next.js 15 e App Router.

## Checklist de Tarefas

| # | Tarefa | Status | Arquivos Principais |
|---|--------|--------|---------------------|
| 1 | Configurar Supabase Auth | ✅ Concluído | `apps/web/src/lib/supabase/`, `apps/web/src/app/auth/callback/route.ts` |
| 2 | Criar tela de Login | ✅ Concluído | `apps/web/src/app/(auth)/login/page.tsx` |
| 3 | Criar tela de Recuperação de Senha | ✅ Concluído | `apps/web/src/app/(auth)/recuperar-senha/page.tsx`, `apps/web/src/app/(auth)/redefinir-senha/page.tsx` |
| 4 | Implementar middleware de proteção de rotas | ✅ Concluído | `apps/web/src/middleware.ts` |
| 5 | Criação de usuário admin | ✅ Concluído | Migrations aplicadas: profiles, departments, roles, user_roles |
| 6 | Impersonação para usuário admin | ✅ Concluído | `apps/web/src/lib/auth/impersonation.ts`, Edge Function `impersonate-user` |

---

## Tarefa 1: Configurar Supabase Auth

### Objetivo
Configurar o Supabase Auth para funcionar com Next.js 15 App Router usando `@supabase/ssr`.

### Pré-requisitos
- [x] Projeto Supabase já criado
- [x] Variáveis de ambiente configuradas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [x] Package `@supabase/ssr` instalado

### Subtarefas

#### 1.1 Verificar configuração atual do Supabase
- **Arquivos existentes:**
  - `apps/web/src/lib/supabase/client.ts` — Cliente para componentes client-side
  - `apps/web/src/lib/supabase/server.ts` — Cliente para Server Components/Actions
  - `apps/web/src/lib/supabase/middleware.ts` — Helper para refresh de sessão

#### 1.2 Configurar Supabase Auth no Dashboard
- [ ] Acessar Supabase Dashboard → Authentication → Providers
- [ ] Habilitar Email provider (já padrão)
- [ ] Configurar Site URL: `http://localhost:3000` (dev) e URL de produção
- [ ] Configurar Redirect URLs: `http://localhost:3000/auth/callback`
- [ ] Configurar Email Templates em português:
  - [ ] Confirmation Email (Magic Link)
  - [ ] Reset Password Email
  - [ ] Change Email Address

#### 1.3 Criar Auth Callback Route
- **Arquivo:** `apps/web/src/app/auth/callback/route.ts`
- **Função:** Trocar code por session após OAuth/Magic Link

```typescript
// Estrutura esperada
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
```

#### 1.4 Criar hooks de autenticação
- **Arquivo:** `apps/web/src/hooks/use-auth.ts`
- **Funções:**
  - `useAuth()` — Estado do usuário atual
  - `useRequireAuth()` — Redirect se não autenticado

### Critérios de Aceite
- [ ] `supabase.auth.getUser()` retorna usuário após login
- [ ] Sessão persiste entre reloads
- [ ] Callback route funciona para magic links

---

## Tarefa 2: Criar Tela de Login

### Objetivo
Criar página de login responsiva seguindo o Design System do GAPP.

### Estrutura de Arquivos
```
apps/web/src/app/(auth)/
├── layout.tsx          # Layout para páginas de auth (sem sidebar)
├── login/
│   └── page.tsx        # Página de login
└── components/
    ├── login-form.tsx  # Formulário de login (client component)
    └── auth-card.tsx   # Card wrapper para formulários
```

### Subtarefas

#### 2.1 Criar Layout de Autenticação
- **Arquivo:** `apps/web/src/app/(auth)/layout.tsx`
- **Características:**
  - Sem sidebar/header do app principal
  - Background com padrão sutil (conforme design-system.md)
  - Logo GarageInn centralizado
  - Responsivo (mobile-first)

#### 2.2 Criar Página de Login
- **Arquivo:** `apps/web/src/app/(auth)/login/page.tsx`
- **Componentes:**
  - Logo GarageInn
  - Título "Entrar no GAPP"
  - Formulário de login
  - Link "Esqueceu a senha?"

#### 2.3 Criar Formulário de Login
- **Arquivo:** `apps/web/src/app/(auth)/components/login-form.tsx`
- **Campos:**
  - Email (input type="email", obrigatório)
  - Senha (input type="password", obrigatório, mínimo 6 chars)
- **Ações:**
  - Botão "Entrar" (primary)
  - Loading state durante submit
  - Exibir erros de validação
  - Exibir erros do Supabase (credenciais inválidas, etc.)

#### 2.4 Implementar Server Action de Login
- **Arquivo:** `apps/web/src/app/(auth)/login/actions.ts`
- **Função:** `signInWithPassword(formData: FormData)`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}
```

### Design Visual
- **Cores:** Usar tokens do design-system.md
- **Cor primária:** `hsl(0, 95%, 60%)` (vermelho GarageInn)
- **Background:** `hsl(0, 0%, 98%)` com padrão sutil
- **Card:** `bg-card rounded-lg shadow-sm border`
- **Fonte:** Inter (sans-serif)

### Critérios de Aceite
- [ ] Login funciona com email/senha válidos
- [ ] Exibe erro para credenciais inválidas
- [ ] Redireciona para `/` após login bem-sucedido
- [ ] Responsivo em mobile e desktop
- [ ] Acessível (labels, focus states, ARIA)

---

## Tarefa 3: Criar Tela de Recuperação de Senha

### Objetivo
Permitir que usuários recuperem acesso via email (magic link do Supabase).

### Estrutura de Arquivos
```
apps/web/src/app/(auth)/
├── recuperar-senha/
│   └── page.tsx              # Solicitar recuperação
├── redefinir-senha/
│   └── page.tsx              # Definir nova senha (após magic link)
└── components/
    └── password-reset-form.tsx
```

### Subtarefas

#### 3.1 Criar Página de Solicitação de Recuperação
- **Arquivo:** `apps/web/src/app/(auth)/recuperar-senha/page.tsx`
- **Campos:**
  - Email (input type="email", obrigatório)
- **Fluxo:**
  1. Usuário informa email
  2. Sistema envia link de recuperação via `supabase.auth.resetPasswordForEmail()`
  3. Exibe mensagem de sucesso "Verifique seu email"

#### 3.2 Criar Página de Redefinição de Senha
- **Arquivo:** `apps/web/src/app/(auth)/redefinir-senha/page.tsx`
- **Campos:**
  - Nova senha (mínimo 6 caracteres)
  - Confirmar nova senha
- **Fluxo:**
  1. Usuário chega via magic link com token na URL
  2. Valida token e exibe formulário
  3. Usuário define nova senha via `supabase.auth.updateUser()`
  4. Redireciona para login com mensagem de sucesso

#### 3.3 Implementar Server Actions
- **Arquivo:** `apps/web/src/app/(auth)/recuperar-senha/actions.ts`

```typescript
'use server'
export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha`,
  })
  
  if (error) return { error: error.message }
  return { success: true }
}
```

### Critérios de Aceite
- [ ] Email de recuperação é enviado corretamente
- [ ] Link de redefinição funciona
- [ ] Nova senha é salva com sucesso
- [ ] Validação de senha (mínimo 6 chars, confirmação)
- [ ] Mensagens de feedback claras

---

## Tarefa 4: Implementar Middleware de Proteção de Rotas

### Objetivo
Proteger rotas do app (`/(app)/*`) redirecionando usuários não autenticados para `/login`.

### Estrutura de Arquivos
```
apps/web/src/
├── middleware.ts                    # Middleware principal
└── lib/supabase/
    └── middleware.ts               # Helper já existente (updateSession)
```

### Subtarefas

#### 4.1 Criar Middleware Principal
- **Arquivo:** `apps/web/src/middleware.ts`
- **Lógica:**
  1. Atualizar sessão (refresh token se necessário)
  2. Verificar se rota requer autenticação
  3. Redirecionar para `/login` se não autenticado
  4. Redirecionar para `/` se autenticado e acessando páginas de auth

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// Rotas públicas (não requerem auth)
const publicRoutes = ['/login', '/recuperar-senha', '/redefinir-senha', '/auth/callback']

export async function middleware(request: NextRequest) {
  // 1. Atualizar sessão
  const response = await updateSession(request)
  
  const { pathname } = request.nextUrl
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // 2. Verificar autenticação
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // 3. Redirecionar se necessário
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (user && isPublicRoute && pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### Critérios de Aceite
- [ ] Rotas `/(app)/*` redirecionam para `/login` sem sessão
- [ ] `/login` redireciona para `/` com sessão ativa
- [ ] Sessão é refreshed automaticamente
- [ ] Assets estáticos não são interceptados

---

## Tarefa 5: Criação de Usuário Admin

### Objetivo
Criar usuário administrador inicial com permissões globais (cargo "Administrador").

### Abordagem
O sistema GAPP usa RBAC com departamentos e cargos. O admin é um cargo global (sem vínculo com departamento específico).

### Subtarefas

#### 5.1 Criar Tabelas de Usuários (se não existirem)
Via Supabase MCP (`mcp_supabase_apply_migration`):

```sql
-- Migration: create_users_tables
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  cpf TEXT UNIQUE,
  avatar_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'Administrador'
    )
  );
```

#### 5.2 Criar Tabelas de Cargos e Departamentos

```sql
-- Migration: create_roles_departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  is_global BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, department_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
```

#### 5.3 Criar Seed de Dados Iniciais

```sql
-- Migration: seed_departments_roles
-- Cargos Globais
INSERT INTO public.roles (name, is_global) VALUES
  ('Desenvolvedor', true),
  ('Diretor', true),
  ('Administrador', true)
ON CONFLICT DO NOTHING;

-- Departamentos
INSERT INTO public.departments (name) VALUES
  ('Operações'),
  ('Compras e Manutenção'),
  ('Financeiro'),
  ('RH'),
  ('Sinistros'),
  ('Comercial'),
  ('Auditoria'),
  ('TI')
ON CONFLICT DO NOTHING;

-- Cargos por departamento (exemplo para Operações)
INSERT INTO public.roles (name, department_id)
SELECT r.name, d.id FROM (
  VALUES ('Manobrista'), ('Encarregado'), ('Supervisor'), ('Gerente')
) AS r(name)
CROSS JOIN public.departments d WHERE d.name = 'Operações'
ON CONFLICT DO NOTHING;
```

#### 5.4 Criar Usuário Admin via Supabase Dashboard
1. Acessar Supabase Dashboard → Authentication → Users
2. Clicar "Add user" → "Create new user"
3. Preencher email e senha do admin
4. Após criação, inserir perfil e cargo via SQL:

```sql
-- Substituir {USER_ID} pelo ID do usuário criado
INSERT INTO public.profiles (id, full_name, email, status)
VALUES ('{USER_ID}', 'Administrador GAPP', 'admin@garageinn.com.br', 'active');

INSERT INTO public.user_roles (user_id, role_id)
SELECT '{USER_ID}', id FROM public.roles WHERE name = 'Administrador' AND is_global = true;
```

### Critérios de Aceite
- [ ] Tabelas profiles, departments, roles, user_roles criadas
- [ ] RLS configurado nas tabelas
- [ ] Usuário admin pode fazer login
- [ ] Admin tem cargo "Administrador" vinculado

---

## Tarefa 6: Impersonação para Usuário Admin

### Objetivo
Permitir que administradores "entrem" na sessão de outro usuário para suporte/debug.

### Abordagem
Usar Supabase Admin API (service_role key) para gerar sessão do usuário alvo. **Requer função Edge Function ou API Route com service_role.**

### Subtarefas

#### 6.1 Criar Edge Function para Impersonação
- **Arquivo:** Supabase Edge Function `impersonate-user`
- **Endpoint:** `POST /functions/v1/impersonate-user`
- **Payload:** `{ targetUserId: string }`
- **Segurança:** Verificar se requisitante é admin

```typescript
// supabase/functions/impersonate-user/index.ts
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Verificar se requisitante é admin
  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')
  
  const { data: { user: requester } } = await supabaseAdmin.auth.getUser(token)
  
  // Verificar cargo admin do requisitante
  const { data: isAdmin } = await supabaseAdmin
    .from('user_roles')
    .select('roles!inner(name, is_global)')
    .eq('user_id', requester!.id)
    .eq('roles.name', 'Administrador')
    .eq('roles.is_global', true)
    .single()

  if (!isAdmin) {
    return new Response(
      JSON.stringify({ error: 'Não autorizado' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Gerar link de impersonação
  const { targetUserId } = await req.json()
  
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: '', // será preenchido pelo targetUserId
    options: { redirectTo: '/' }
  })

  // Alternativa: usar signInWithId (se disponível)
  // ou criar custom token

  return new Response(
    JSON.stringify({ link: data?.properties?.action_link }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
```

#### 6.2 Criar UI de Impersonação
- **Local:** Tela de listagem de usuários (admin)
- **Ação:** Botão "Entrar como" em cada usuário
- **Fluxo:**
  1. Admin clica "Entrar como" no usuário X
  2. Sistema salva sessão original do admin (localStorage)
  3. Gera nova sessão como usuário X
  4. Exibe banner "Você está como [Usuário X] - Sair"
  5. Ao sair, restaura sessão original do admin

#### 6.3 Criar Componente de Banner de Impersonação
- **Arquivo:** `apps/web/src/components/layout/impersonation-banner.tsx`
- **Exibição:** Topo da página quando em modo impersonação
- **Estilo:** Background warning (`hsl(38, 92%, 50%)`), texto escuro

```tsx
'use client'
export function ImpersonationBanner() {
  const { impersonatedUser, exitImpersonation } = useImpersonation()
  
  if (!impersonatedUser) return null
  
  return (
    <div className="bg-warning text-warning-foreground px-4 py-2 text-sm flex justify-between items-center">
      <span>
        Você está visualizando como <strong>{impersonatedUser.name}</strong>
      </span>
      <Button variant="ghost" size="sm" onClick={exitImpersonation}>
        Sair do modo visualização
      </Button>
    </div>
  )
}
```

### Critérios de Aceite
- [ ] Apenas admins podem impersonar
- [ ] Banner visível durante impersonação
- [ ] Admin pode retornar à sua sessão original
- [ ] Logs de impersonação são registrados (auditoria)

---

## Referências Técnicas

### Stack do Projeto
- **Framework:** Next.js 15 (App Router)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **UI:** shadcn/ui + Tailwind CSS
- **Design System:** [design-system.md](../../design-system.md)

### Documentação
- [Supabase Auth com Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [PRD do GAPP](../../projeto/PRD.md) — Seção 8.1 Autenticação
- [Departamentos e Cargos](../../projeto/usuarios/departamentos_cargos.md)

### Arquivos Existentes
- `apps/web/src/lib/supabase/client.ts` — Cliente browser
- `apps/web/src/lib/supabase/server.ts` — Cliente server
- `apps/web/src/lib/supabase/middleware.ts` — Helper de sessão

<!-- agent-update:end -->
