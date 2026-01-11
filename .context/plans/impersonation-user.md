---
status: completed
generated: 2026-01-11
completed: 2026-01-11
---

# Implementação da Edge Function de Impersonação de Usuários

> Criar e fazer deploy da Edge Function `impersonate-user` no Supabase para permitir que administradores personifiquem outros usuários para fins de suporte. A função deve verificar permissões de admin, gerar magic link para o usuário alvo, e configurar headers CORS apropriados.

## Task Snapshot
- **Primary goal:** Implementar a Edge Function `impersonate-user` que está faltando no Supabase, permitindo que administradores entrem na sessão de outros usuários para fins de suporte e debug.
- **Success signal:** Ao clicar em "Personificar" no menu de ações de um usuário, o admin deve ser redirecionado para uma sessão autenticada como o usuário alvo, com um banner indicando o modo de impersonação.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Contexto do Erro Identificado

### Erro Atual
Ao tentar personificar um usuário, ocorre erro de CORS:

```
[ERROR] Access to fetch at 'https://llxgumwacwgppoxkawnu.supabase.co/functions/v1/impersonate-user' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: It does not have HTTP ok status.

[ERROR] Failed to load resource: net::ERR_FAILED
```

### Causa Raiz
A **Edge Function `impersonate-user` não existe** no Supabase. O frontend já está implementado e tenta chamar a função, mas ela nunca foi criada.

### Arquivos Existentes Relacionados

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `apps/web/src/lib/services/impersonation-service.ts` | Serviço que chama a Edge Function | ✅ Implementado |
| `apps/web/src/lib/auth/impersonation.ts` | Gerenciamento de estado de impersonação | ✅ Implementado |
| `supabase/functions/impersonate-user/index.ts` | Edge Function no Supabase | ❌ **NÃO EXISTE** |

## Codebase Context
- **Total files analyzed:** 417
- **Total symbols discovered:** 934
- **Architecture layers:** Config, Utils, Components, Services, Controllers
- **Entry points:** `apps/mobile/index.ts`, `supabase/functions/create-test-users/index.ts`

### Key Components

**Serviço de Impersonação (Frontend):**
- `impersonateUser()` — `apps/web/src/lib/services/impersonation-service.ts:32`
- `storeOriginalSession()` — `apps/web/src/lib/auth/impersonation.ts`
- `setImpersonationState()` — `apps/web/src/lib/auth/impersonation.ts`

**Interfaces Esperadas:**
```typescript
interface ImpersonateResponse {
  link: string
  targetUser: {
    id: string
    name: string
    email: string
  }
}
```

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Backend Specialist | Implementar a Edge Function no Supabase | [Backend Specialist](../agents/backend-specialist.md) | Criar `supabase/functions/impersonate-user/index.ts` |
| Security Auditor | Validar permissões e segurança da impersonação | [Security Auditor](../agents/security-auditor.md) | Verificar que apenas admins podem impersonar |
| Test Writer | Criar testes para a Edge Function | [Test Writer](../agents/test-writer.md) | Testes de integração e edge cases |
| Documentation Writer | Documentar a funcionalidade | [Documentation Writer](../agents/documentation-writer.md) | Atualizar docs com fluxo de impersonação |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Architecture Notes | [architecture.md](../docs/architecture.md) | Fluxo de autenticação e impersonação |
| Security & Compliance Notes | [security.md](../docs/security.md) | Modelo de permissões para impersonação |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | Deploy de Edge Functions |

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Uso indevido da impersonação | Medium | High | Logging completo de todas as impersonações, apenas admins globais | Security Auditor |
| Token de impersonação vazado | Low | Critical | Tokens de curta duração, validação de IP | Backend Specialist |
| CORS mal configurado | Medium | Medium | Testar em ambiente de staging antes de produção | Backend Specialist |

### Dependencies
- **Internal:** Supabase Auth Admin API para gerar magic links
- **External:** Supabase Edge Functions runtime (Deno)
- **Technical:** Service Role Key do Supabase configurada como secret

### Assumptions
- O usuário admin deve ter role `administrador_global` ou similar
- Magic links do Supabase funcionam para impersonação
- A sessão original do admin será preservada no localStorage

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5 person-days | 1 dia | 1 pessoa |
| Phase 2 - Implementation | 1 person-day | 1-2 dias | 1 pessoa |
| Phase 3 - Validation | 0.5 person-days | 1 dia | 1 pessoa |
| **Total** | **2 person-days** | **3-4 dias** | **1 pessoa** |

### Required Skills
- Conhecimento de Supabase Edge Functions (Deno/TypeScript)
- Experiência com Supabase Auth Admin API
- Entendimento de CORS e segurança de APIs

## Working Phases

### Phase 1 — Discovery & Alignment
**Steps**
1. ✅ Identificar o erro de CORS ao tentar impersonar usuário
2. ✅ Confirmar que a Edge Function `impersonate-user` não existe
3. ✅ Analisar o código frontend que consome a função
4. ✅ Revisar a documentação do Supabase Auth Admin API para magic links
5. ✅ Definir estrutura de permissões (quais roles podem impersonar)

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 1 discovery for impersonation"`

### Phase 2 — Implementation & Iteration
**Steps**
1. ✅ Criar arquivo `supabase/functions/impersonate-user/index.ts`
2. ✅ Implementar verificação de permissões do usuário chamador
3. ✅ Implementar geração de magic link via Admin API
4. ✅ Configurar headers CORS apropriados
5. ✅ Fazer deploy da função via MCP Supabase
6. ✅ Secrets já configurados automaticamente pelo Supabase

**Estrutura esperada da Edge Function:**
```typescript
// supabase/functions/impersonate-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 1. Verificar autenticação do chamador
  // 2. Verificar se chamador é admin
  // 3. Obter dados do usuário alvo
  // 4. Gerar magic link via Admin API
  // 5. Retornar link e dados do usuário
})
```

**Commit Checkpoint**
- `git commit -m "feat(supabase): implement impersonate-user edge function"`

### Phase 3 — Validation & Handoff
**Steps**
1. ✅ Testar impersonação via Playwright (teste automatizado)
2. ✅ Verificar que a Edge Function retorna 200 e magic link
3. ⏳ Verificar logs de auditoria da impersonação (tabela audit_logs não existe ainda)
4. ⏳ Testar retorno à sessão original (end impersonation) - funcionalidade futura
5. ✅ Documentar o fluxo completo de impersonação

**Critérios de Aceite:**
- ✅ Admin consegue clicar em "Personificar" e entrar como outro usuário
- ⏳ Banner de impersonação é exibido corretamente (depende do frontend)
- ⏳ Admin consegue encerrar impersonação e voltar à sua sessão (funcionalidade futura)
- ⏳ Logs de auditoria registram todas as impersonações (tabela não existe)
- ✅ Usuários não-admin não conseguem impersonar (verificação de roles implementada)

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation for impersonation"`

## Rollback Plan

### Rollback Triggers
- Falha crítica na geração de magic links
- Vazamento de tokens de impersonação
- Usuários não-admin conseguindo impersonar

### Rollback Procedures
#### Phase 2 Rollback
- Action: `supabase functions delete impersonate-user`
- Data Impact: Nenhum (função stateless)
- Estimated Time: < 15 minutos

### Post-Rollback Actions
1. Documentar razão do rollback
2. Notificar equipe de segurança se houver vazamento
3. Revisar implementação antes de novo deploy

## Evidence & Follow-up

### Artifacts a Coletar
- [ ] Screenshot do erro de CORS (antes)
- [ ] Screenshot da impersonação funcionando (depois)
- [ ] Logs da Edge Function em produção
- [ ] PR link com a implementação

### Follow-up Actions
| Ação | Owner | Prazo |
|------|-------|-------|
| Implementar logging de auditoria detalhado | Backend Specialist | Após MVP |
| Adicionar notificação ao usuário impersonado | Feature Developer | Futuro |
| Dashboard de sessões de impersonação ativas | Frontend Specialist | Futuro |
