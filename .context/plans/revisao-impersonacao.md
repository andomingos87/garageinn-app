---
id: plan-revisao-impersonacao
ai_update_goal: "Define the stages, owners, and evidence required to complete Revisão Completa da Funcionalidade de Impersonação."
required_inputs:
  - "Task summary or issue link describing the goal"
  - "Relevant documentation sections from docs/README.md"
  - "Matching agent playbooks from agents/README.md"
success_criteria:
  - "Stages list clear owners, deliverables, and success signals"
  - "Plan references documentation and agent resources that exist today"
  - "Follow-up actions and evidence expectations are recorded"
related_agents:
  - "bug-fixer"
  - "feature-developer"
  - "test-writer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
---

<!-- agent-update:start:plan-revisao-impersonacao -->
# Revisão Completa da Funcionalidade de Impersonação

> Plano de revisão e correção da funcionalidade de impersonação de usuários, incluindo diagnóstico de problemas, correções e validação do fluxo completo.

## Task Snapshot
- **Primary goal:** Garantir que a funcionalidade de impersonação funcione corretamente end-to-end, permitindo que administradores entrem na sessão de outros usuários para suporte.
- **Success signal:** Admin consegue clicar em "Personificar", confirmar no dialog, ser autenticado como o usuário alvo, ver o banner de impersonação, e sair restaurando sua sessão original.
- **Key references:**
  - [Plano Original de Implementação](./implementacao-impersonacao.md)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)

## Problemas Identificados

### 1. Botão "Personificar" não aparece no menu
**Causa provável:** O hook `usePermissions()` retorna `canImpersonate = false` porque:
- A permissão `users:impersonate` não está mapeada para nenhum role
- O usuário atual não tem um role admin global

### 2. Redirecionamento para login após impersonação
**Causa:** O magic link usa fluxo implícito (tokens no hash fragment), mas o callback anterior era server-side e não conseguia acessar o hash.
**Solução aplicada:** Convertido `/auth/callback` para client-side page.

### 3. Erro 401 na Edge Function (resolvido)
**Causa:** `verify_jwt: true` na Edge Function rejeitava tokens válidos.
**Solução aplicada:** Alterado para `verify_jwt: false` com validação manual.

---

## Fase 1 — Diagnóstico e Correção de Permissões

### Tarefa 1.1: Verificar mapeamento de permissão `users:impersonate`
**Arquivo:** `apps/web/src/lib/auth/permissions.ts`
**Problema:** A permissão `users:impersonate` existe mas não está atribuída a nenhum role.

**Ação:**
```typescript
// Adicionar users:impersonate aos roles admin globais
export const GLOBAL_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'Desenvolvedor': ['admin:all'],
  'Diretor': ['admin:all'],
  'Administrador': ['admin:all'],
}
```

**Nota:** `admin:all` já deveria incluir `users:impersonate`. Verificar se o hook `usePermissions` está tratando `admin:all` corretamente.

**Critérios de Aceite:**
- [ ] Verificar se `admin:all` expande para incluir `users:impersonate`
- [ ] Se não, adicionar explicitamente `users:impersonate` aos roles admin

---

### Tarefa 1.2: Verificar hook `usePermissions`
**Arquivo:** `apps/web/src/hooks/use-permissions.ts`
**Verificar:** Se o método `can()` trata corretamente a permissão `admin:all`.

**Ação:** Verificar implementação do RBAC em `apps/web/src/lib/auth/rbac.ts`

**Critérios de Aceite:**
- [ ] Confirmar que `hasPermission('users:impersonate')` retorna `true` para admins
- [ ] Adicionar logs de debug se necessário

---

### Tarefa 1.3: Verificar se `currentUserId` está sendo passado
**Arquivos:**
- `apps/web/src/app/(app)/usuarios/page.tsx`
- `apps/web/src/app/(app)/usuarios/actions.ts`

**Verificar:** Se `getCurrentUserId()` retorna o ID corretamente e é passado para `UsersTable`.

**Critérios de Aceite:**
- [ ] `currentUserId` não é `undefined` na tabela
- [ ] Logs mostram o ID correto

---

## Fase 2 — Correção do Fluxo de Autenticação

### Tarefa 2.1: Validar callback client-side
**Arquivo:** `apps/web/src/app/auth/callback/page.tsx`
**Status:** Implementado

**Verificar:**
- [ ] Página captura tokens do hash fragment
- [ ] Sessão é estabelecida corretamente
- [ ] Redirecionamento para `/dashboard` funciona

---

### Tarefa 2.2: Validar Edge Function `impersonate-user`
**Status:** Atualizada (v5)

**Verificar:**
- [ ] `verify_jwt: false` está ativo
- [ ] Validação manual de admin funciona
- [ ] Magic link é gerado com `redirectTo` correto
- [ ] Logs de auditoria são gravados

---

### Tarefa 2.3: Testar fluxo completo de impersonação
**Passos:**
1. Login como admin (Administrador, Diretor ou Desenvolvedor global)
2. Navegar para `/usuarios`
3. Clicar no menu de ações de um usuário ativo
4. Verificar se "Personificar" aparece
5. Clicar em "Personificar"
6. Confirmar no dialog
7. Verificar redirecionamento e login como usuário alvo
8. Verificar banner de impersonação
9. Clicar em "Encerrar" no banner
10. Verificar restauração da sessão original

---

## Fase 3 — Validação e Testes

### Tarefa 3.1: Testes manuais de permissão
| Cenário | Resultado Esperado |
|---------|-------------------|
| Admin global vê botão | ✓ Botão visível |
| Usuário comum não vê botão | ✓ Botão oculto |
| Admin não pode impersonar a si mesmo | ✓ Botão oculto para próprio usuário |
| Admin não pode impersonar usuário inativo | ✓ Botão oculto |

---

### Tarefa 3.2: Instalar e executar testes E2E
**Arquivos:**
- `apps/web/e2e/impersonation.spec.ts`
- `apps/web/playwright.config.ts`

**Comandos:**
```bash
cd apps/web
npm install -D @playwright/test
npx playwright install
npm run test:e2e
```

---

## Arquivos Relevantes

```
apps/web/src/
├── lib/
│   ├── auth/
│   │   ├── impersonation.ts          # Utilitários de estado
│   │   ├── permissions.ts            # Definição de permissões ← VERIFICAR
│   │   └── rbac.ts                   # Sistema RBAC ← VERIFICAR
│   └── services/
│       └── impersonation-service.ts  # Serviço de integração
├── hooks/
│   ├── use-impersonation.ts          # Hook de estado
│   └── use-permissions.ts            # Hook de permissões ← VERIFICAR
├── components/layout/
│   └── impersonation-banner.tsx      # Banner de impersonação
├── app/
│   ├── auth/callback/
│   │   └── page.tsx                  # Callback de auth (client-side)
│   └── (app)/usuarios/
│       ├── components/
│       │   ├── users-table.tsx       # Tabela com botão
│       │   └── impersonate-dialog.tsx # Dialog de confirmação
│       ├── actions.ts                # Server actions
│       └── page.tsx                  # Página principal
```

---

## Checklist de Execução

### Fase 1 - Diagnóstico
- [x] 1.1 Verificar mapeamento `users:impersonate` - OK, `admin:all` cobre
- [x] 1.2 Verificar hook `usePermissions` e RBAC - **PROBLEMA ENCONTRADO E CORRIGIDO**
  - O hook é assíncrono e retornava `false` durante loading
  - Corrigido em `users-table.tsx` para verificar `!permissionsLoading && (isAdmin || can(...))`
- [x] 1.3 Verificar `currentUserId` na tabela - OK, está sendo passado

### Fase 2 - Correções
- [x] 2.1 Validar callback client-side - Implementado
- [x] 2.2 Validar Edge Function - Atualizada para v5
- [ ] 2.3 Testar fluxo completo

### Fase 3 - Validação
- [ ] 3.1 Testes manuais de permissão
- [ ] 3.2 Executar testes E2E

---

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Permissão não mapeada corretamente | Alta | Alta | Verificar RBAC e adicionar mapeamento | Frontend Specialist |
| Callback não processa tokens | Média | Alta | Logs de debug, fallback para login | Backend Specialist |
| Edge Function rejeita requests | Baixa | Alta | Logs detalhados, retry | Backend Specialist |

### Dependencies
- **Internal:** Sistema RBAC existente, Edge Function `impersonate-user`
- **External:** Supabase Auth (magic links)
- **Technical:** Next.js 16, Supabase SSR

---

## Rollback Plan

### Rollback Triggers
- Usuários sendo deslogados inesperadamente
- Falhas de autenticação em massa
- Sessões corrompidas

### Rollback Procedures
1. Reverter Edge Function para versão anterior
2. Restaurar `/auth/callback/route.ts` se necessário
3. Remover botão de impersonação temporariamente

---

## Evidence & Follow-up
- [ ] Screenshot do botão "Personificar" visível
- [ ] Screenshot do dialog de confirmação
- [ ] Screenshot do banner de impersonação ativo
- [ ] Logs da Edge Function mostrando sucesso
- [ ] Resultado dos testes E2E

<!-- agent-update:end -->
