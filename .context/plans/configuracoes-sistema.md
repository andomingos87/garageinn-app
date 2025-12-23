---
id: plan-configuracoes-sistema
ai_update_goal: "Implementar as 6 sub-páginas de configuração do sistema GAPP"
required_inputs:
  - "Estrutura atual de dados (departments, roles, ticket_categories, etc.)"
  - "Sistema RBAC existente (permissions.ts, rbac.ts)"
  - "Padrões de UI do design-system.md"
success_criteria:
  - "Todas as 6 sub-páginas funcionais e acessíveis"
  - "CRUD completo para departamentos, cargos e categorias de chamados"
  - "Interface de permissões visual e funcional"
  - "Configurações gerais do sistema editáveis"
related_agents:
  - "frontend-specialist"
  - "backend-specialist"
  - "database-specialist"
---

<!-- agent-update:start:plan-configuracoes-sistema -->
# Configurações do Sistema

> Implementação das 6 sub-páginas de configuração: Departamentos e Cargos, Unidades, Checklists, Chamados, Permissões e Sistema

## Task Snapshot

- **Primary goal:** Tornar a página `/configuracoes` funcional com todas as 6 sub-páginas implementadas
- **Success signal:** Admin pode gerenciar departamentos, cargos, permissões e configurações do sistema via interface
- **Key references:**
  - [PRD](../../projeto/PRD.md)
  - [Departamentos e Cargos](../../projeto/usuarios/departamentos_cargos.md)
  - [Design System](../../design-system.md)

## Estado Atual

### Página Principal (`/configuracoes`)
- ✅ Existe e lista 6 módulos em cards
- ❌ Nenhum link funciona (sub-páginas não existem)

### Sub-páginas Necessárias

| Módulo | Rota | Status | Prioridade |
|--------|------|--------|------------|
| Departamentos e Cargos | `/configuracoes/departamentos` | ✅ Implementado | Alta |
| Unidades | `/configuracoes/unidades` | ✅ Redirect para `/unidades` | Média |
| Checklists | `/configuracoes/checklists` | ✅ Redirect para `/checklists/configurar` | Baixa |
| Chamados | `/configuracoes/chamados` | ✅ Implementado | Alta |
| Permissões | `/configuracoes/permissoes` | ✅ Implementado (read-only) | Alta |
| Sistema | `/configuracoes/sistema` | ✅ Implementado | Baixa |

## Análise do Banco de Dados

### Tabelas Existentes

```
departments (10 registros)
├── id, name, created_at
└── Departamentos: Auditoria, Comercial, Compras, Compras e Manutenção, 
    Financeiro, Manutenção, Operações, RH, Sinistros, TI

roles (40 registros)
├── id, name, department_id, is_global, created_at
├── Cargos globais (3): Administrador, Desenvolvedor, Diretor
└── Cargos por departamento (37): vinculados via department_id

ticket_categories (36 registros)
├── id, name, department_id, status, created_at, updated_at
└── Categorias de chamados por departamento
```

### Sistema de Permissões (Código)

```typescript
// permissions.ts - Permissões definidas em código
type Permission = 
  | 'users:read' | 'users:create' | 'users:update' | 'users:delete' | 'users:impersonate'
  | 'units:read' | 'units:create' | 'units:update'
  | 'tickets:read' | 'tickets:create' | 'tickets:triage' | 'tickets:approve' | 'tickets:execute'
  | 'checklists:read' | 'checklists:execute' | 'checklists:configure'
  | 'settings:read' | 'settings:update'
  | 'admin:all'

// Mapeamento cargo → permissões está hardcoded em GLOBAL_ROLE_PERMISSIONS e DEPARTMENT_ROLE_PERMISSIONS
```

---

## Tarefas de Implementação

### Tarefa 0: Testar e Documentar Estado Atual
- [x] Analisar página `/configuracoes` existente
- [x] Verificar rotas e sub-páginas
- [x] Documentar estrutura de dados no banco
- [x] Mapear sistema de permissões atual

### Tarefa 1: Departamentos e Cargos (`/configuracoes/departamentos`)

**Objetivo:** CRUD de departamentos e cargos organizacionais

**Funcionalidades:**
- [x] Listar departamentos com contagem de cargos
- [x] Criar/editar/excluir departamentos
- [x] Listar cargos por departamento
- [x] Criar/editar/excluir cargos
- [x] Definir cargo como global (sem departamento)
- [x] Visualizar usuários vinculados a cada cargo

**Estrutura de arquivos:**
```
configuracoes/
├── departamentos/
│   ├── page.tsx              # Lista de departamentos
│   ├── actions.ts            # Server actions
│   ├── components/
│   │   ├── department-card.tsx
│   │   ├── department-form-dialog.tsx
│   │   ├── roles-list.tsx
│   │   ├── role-form-dialog.tsx
│   │   └── index.ts
│   └── [id]/
│       └── page.tsx          # Detalhes/edição do departamento
```

**Modelo de dados (existente):**
- `departments`: id, name, created_at
- `roles`: id, name, department_id, is_global, created_at

---

### Tarefa 2: Unidades (Configurações) (`/configuracoes/unidades`)

**Objetivo:** Configurações específicas de unidades (não CRUD de unidades, que já existe em `/unidades`)

**Funcionalidades:**
- [x] Configurar templates de checklist padrão por unidade (via `unit_checklist_templates`)
- [x] Configurar horários de funcionamento (dados na tabela `units`)
- [x] Definir supervisores de cobertura (via `user_units.is_coverage`)
- [x] Configurações de notificação por unidade (gerenciadas em `/unidades/[id]`)

**Decisão:** ✅ Implementado como redirect para `/unidades` - as configurações específicas de cada unidade são gerenciadas na página de detalhes da unidade.

**Implementação:** Redirect simples para `/unidades` pois todas as funcionalidades já existem:
- Templates de checklist: tabela `unit_checklist_templates` + página `/checklists/configurar`
- Equipe e supervisores: página `/unidades/[id]` com listagem de equipe vinculada
- Edição de dados: página `/unidades/[id]/editar`

---

### Tarefa 3: Checklists (`/configuracoes/checklists`)

**Objetivo:** Acesso rápido à configuração de checklists

**Implementação:**
- [x] Redirecionar para `/checklists/configurar` (já existe e funciona)
- [x] ~~OU criar página wrapper que embute a funcionalidade~~ (não necessário)

**Decisão:** ✅ Implementado como redirect simples, pois a funcionalidade já existe completa em `/checklists/configurar`.

---

### Tarefa 4: Chamados (Tipos e Fluxos) (`/configuracoes/chamados`)

**Objetivo:** Gerenciar categorias de chamados e configurações de fluxo

**Funcionalidades:**
- [x] Listar categorias de chamados por departamento
- [x] Criar/editar/excluir categorias
- [x] Ativar/desativar categorias
- [ ] Configurar campos obrigatórios por categoria (futuro)
- [ ] Definir fluxo de aprovação por categoria (futuro)

**Estrutura de arquivos:**
```
configuracoes/
├── chamados/
│   ├── page.tsx              # Lista de categorias por departamento
│   ├── actions.ts            # Server actions
│   ├── components/
│   │   ├── category-table.tsx
│   │   ├── category-form-dialog.tsx
│   │   ├── department-tabs.tsx
│   │   └── index.ts
```

**Modelo de dados (existente):**
- `ticket_categories`: id, name, department_id, status, created_at, updated_at

---

### Tarefa 5: Permissões (`/configuracoes/permissoes`)

**Objetivo:** Interface visual para gerenciar permissões por cargo

**Funcionalidades:**
- [x] Matriz de permissões: cargos (linhas) x permissões (colunas)
- [x] Visualizar permissões atuais de cada cargo
- [ ] Editar permissões (toggle on/off) — *Fase 2: requer migração para banco*
- [x] Filtrar por departamento
- [x] Destacar cargos globais (admin)

**Desafio técnico:** Permissões estão hardcoded em `permissions.ts`. Opções:
1. **Manter hardcoded** - Interface apenas visualiza, edição requer deploy
2. **Migrar para banco** - Criar tabela `role_permissions` e sincronizar

**Recomendação:** Fase 1 - Interface read-only. Fase 2 - Migrar para banco.

**Estrutura de arquivos:**
```
configuracoes/
├── permissoes/
│   ├── page.tsx              # Matriz de permissões
│   ├── actions.ts            # Server actions
│   ├── components/
│   │   ├── permissions-matrix.tsx
│   │   ├── department-filter.tsx
│   │   ├── permission-toggle.tsx (futuro)
│   │   └── index.ts
```

---

### Tarefa 6: Sistema (`/configuracoes/sistema`)

**Objetivo:** Configurações gerais da aplicação

**Funcionalidades:**
- [x] Nome da empresa/sistema
- [x] Logo customizado (campo disponível, upload futuro)
- [x] Timezone padrão
- [x] Configurações de email (SMTP)
- [x] Configurações de notificação
- [x] Limites do sistema (ex: tamanho máximo de upload)

**Modelo de dados (necessário criar):**
```sql
CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);
```

**Estrutura de arquivos:**
```
configuracoes/
├── sistema/
│   ├── page.tsx              # Formulário de configurações
│   ├── actions.ts            # Server actions
│   ├── components/
│   │   ├── settings-form.tsx
│   │   ├── settings-section.tsx
│   │   └── index.ts
```

---

## Ordem de Implementação Recomendada

### Fase 1 — Essenciais (Prioridade Alta)
1. **Departamentos e Cargos** - Base para todo o sistema de usuários
2. **Chamados** - Categorias são usadas na abertura de chamados
3. **Permissões (read-only)** - Visibilidade do sistema de acesso

### Fase 2 — Complementares (Prioridade Média)
4. **Checklists** - Redirect simples
5. **Unidades** - Avaliar necessidade real

### Fase 3 — Avançadas (Prioridade Baixa)
6. **Sistema** - Requer nova tabela e mais planejamento
7. **Permissões (editável)** - Migração de código para banco

---

## Estimativa de Esforço

| Tarefa | Complexidade | Tempo Estimado |
|--------|--------------|----------------|
| Departamentos e Cargos | Alta | 4-6h |
| Chamados (Categorias) | Média | 2-3h |
| Permissões (read-only) | Média | 2-3h |
| Checklists (redirect) | Baixa | 15min |
| Unidades | Média | 2-3h |
| Sistema | Alta | 4-6h |
| Permissões (editável) | Alta | 6-8h |

**Total Fase 1:** ~8-12h
**Total Completo:** ~20-30h

---

## Padrões de Implementação

### Estrutura de Página (seguir existentes)
```tsx
// page.tsx
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { checkIsAdmin } from './actions'

export default async function Page() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect('/')
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Título</h2>
          <p className="text-muted-foreground">Descrição</p>
        </div>
        <Button>Ação Principal</Button>
      </div>
      
      <Suspense fallback={<LoadingSkeleton />}>
        <Content />
      </Suspense>
    </div>
  )
}
```

### Server Actions
```typescript
// actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDepartments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('departments')
    .select('*, roles(*)')
    .order('name')
  
  if (error) throw error
  return data
}
```

---

## Checklist de Implementação

### Pré-requisitos
- [ ] Verificar permissões de admin funcionando
- [ ] Confirmar acesso ao banco via MCP

### Tarefa 1: Departamentos e Cargos
- [x] Criar estrutura de pastas
- [x] Implementar `actions.ts` (CRUD)
- [x] Implementar página de listagem
- [x] Implementar dialog de criação/edição de departamento
- [x] Implementar lista de cargos por departamento
- [x] Implementar dialog de criação/edição de cargo
- [x] Testar fluxo completo
- [x] Verificar RLS policies

### Tarefa 2: Chamados (Categorias)
- [x] Criar estrutura de pastas
- [x] Implementar `actions.ts` (CRUD)
- [x] Implementar página com tabs por departamento
- [x] Implementar tabela de categorias
- [x] Implementar dialog de criação/edição
- [x] Implementar toggle de status
- [x] Testar fluxo completo

### Tarefa 3: Permissões
- [x] Criar estrutura de pastas
- [x] Implementar `actions.ts` (leitura)
- [x] Implementar matriz de permissões
- [x] Implementar filtro por departamento
- [x] Destacar cargos globais
- [x] Testar visualização

### Tarefa 4: Checklists
- [x] Implementar redirect para `/checklists/configurar`

### Tarefa 5: Unidades
- [x] Avaliar escopo real necessário
- [x] Implementar conforme decisão (redirect para `/unidades`)

### Tarefa 6: Sistema
- [x] Criar migration para `system_settings`
- [x] Implementar `actions.ts`
- [x] Implementar formulário de configurações
- [x] Testar persistência

---

## Evidence & Follow-up

### Artefatos a Capturar
- Screenshots das páginas implementadas
- Logs de teste de CRUD
- Verificação de RLS policies

### Follow-up Actions
- [ ] Atualizar `entrega1_tarefas.md` conforme conclusão
- [ ] Documentar decisões de arquitetura tomadas
- [ ] Criar testes E2E para fluxos críticos (futuro)

<!-- agent-update:end -->
