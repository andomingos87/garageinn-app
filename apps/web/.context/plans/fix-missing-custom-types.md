---
id: plan-fix-missing-custom-types
ai_update_goal: "Define the stages, owners, and evidence required to complete Correção: Tipos Customizados Ausentes no Supabase."
required_inputs:
  - "Bug report: projeto/erros/bug-missing-getInvitationStatus.md"
  - "Arquivos afetados pelo erro de build"
success_criteria:
  - "Build da aplicação completa sem erros"
  - "Todos os imports de tipos customizados funcionando corretamente"
  - "Tipos e funções utilitárias em arquivo separado do database.types.ts"
related_agents:
  - "bug-fixer"
  - "frontend-specialist"
---

<!-- agent-update:start:plan-fix-missing-custom-types -->
# Correção: Tipos Customizados Ausentes no Supabase

> Criar arquivo custom-types.ts com tipos e funções utilitárias que foram perdidos após regeneração do database.types.ts, e atualizar imports nos arquivos afetados

## Task Snapshot
- **Primary goal:** Corrigir o erro de build causado pela ausência da função `getInvitationStatus` e tipos customizados no módulo `database.types.ts`
- **Success signal:** `npm run build` executa sem erros e a aplicação funciona corretamente
- **Bug Report:** [bug-missing-getInvitationStatus.md](../../../../projeto/erros/bug-missing-getInvitationStatus.md)

## Contexto do Problema

O arquivo `database.types.ts` é **gerado automaticamente** pelo Supabase CLI. Tipos e funções customizados foram adicionados manualmente a esse arquivo em algum momento, mas foram perdidos quando o arquivo foi regenerado.

### Elementos Ausentes
| Tipo/Função | Descrição |
| --- | --- |
| `UserStatus` | Union type: `'active' \| 'pending' \| 'inactive'` |
| `InvitationStatus` | Union type: `'pending' \| 'sent' \| 'expired' \| 'accepted'` |
| `UserRoleInfo` | Interface com informações do cargo do usuário |
| `UserUnitInfo` | Interface com informações da unidade do usuário |
| `UserWithRoles` | Interface composta de usuário com cargos e unidades |
| `AuditLog` | Interface para logs de auditoria |
| `getInvitationStatus()` | Função que calcula o status do convite |

### Arquivos Afetados
1. `src/app/(app)/usuarios/actions.ts` - linhas 5-6
2. `src/app/(app)/usuarios/[id]/page.tsx` - linhas 21-22
3. `src/app/(app)/usuarios/[id]/components/user-status-actions.tsx` - linha 9
4. `src/app/(app)/usuarios/components/users-table.tsx` - linhas 30-31
5. `src/app/(app)/usuarios/components/invitation-status-badge.tsx` - linha 6
6. `src/app/(app)/perfil/actions.ts` - linha 5

## Agent Lineup
| Agent | Role in this plan | First responsibility focus |
| --- | --- | --- |
| Bug Fixer | Implementar a correção | Criar arquivo custom-types.ts e atualizar imports |
| Frontend Specialist | Validar integração | Verificar que todos os componentes funcionam após a correção |

## Working Phases

### Phase 1 — Criar Arquivo de Tipos Customizados
**Objetivo:** Criar o arquivo `custom-types.ts` com todos os tipos e funções ausentes

**Tarefas:**
1. [x] Criar arquivo `src/lib/supabase/custom-types.ts`
2. [x] Definir tipo `UserStatus`
3. [x] Definir tipo `InvitationStatus`
4. [x] Definir interface `UserRoleInfo`
5. [x] Definir interface `UserUnitInfo`
6. [x] Definir interface `UserWithRoles`
7. [x] Definir interface `AuditLog`
8. [x] Implementar função `getInvitationStatus()`

**Arquivo a criar:**
```
src/lib/supabase/custom-types.ts
```

**Commit Checkpoint:**
```bash
git commit -m "feat(types): create custom-types.ts with user-related types and utilities"
```

### Phase 2 — Atualizar Exports e Imports
**Objetivo:** Atualizar o barrel export e todos os arquivos que importam os tipos

**Tarefas:**
1. [ ] Atualizar `src/lib/supabase/index.ts` para re-exportar custom-types
2. [ ] Atualizar imports em `src/app/(app)/usuarios/actions.ts`
3. [ ] Atualizar imports em `src/app/(app)/usuarios/[id]/page.tsx`
4. [ ] Atualizar imports em `src/app/(app)/usuarios/[id]/components/user-status-actions.tsx`
5. [ ] Atualizar imports em `src/app/(app)/usuarios/components/users-table.tsx`
6. [ ] Atualizar imports em `src/app/(app)/usuarios/components/invitation-status-badge.tsx`
7. [ ] Atualizar imports em `src/app/(app)/perfil/actions.ts`

**Padrão de Import:**
```typescript
// De:
import type { UserWithRoles, ... } from '@/lib/supabase/database.types'
import { getInvitationStatus } from '@/lib/supabase/database.types'

// Para:
import type { UserWithRoles, ... } from '@/lib/supabase/custom-types'
import { getInvitationStatus } from '@/lib/supabase/custom-types'
```

**Commit Checkpoint:**
```bash
git commit -m "fix(imports): update imports to use custom-types instead of database.types"
```

### Phase 3 — Validação
**Objetivo:** Verificar que a correção resolve o problema

**Tarefas:**
1. [ ] Executar `npm run build` e verificar ausência de erros
2. [ ] Executar `npm run dev` e testar navegação na área de usuários
3. [ ] Verificar que o status de convite é exibido corretamente
4. [ ] Verificar lint com `npm run lint`

**Commit Checkpoint:**
```bash
git commit -m "chore(plan): complete phase 3 validation - build successful"
```

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| Tipos definidos incorretamente | Baixa | Alta | Basear nos campos usados nos arquivos existentes |
| Imports faltando em outros arquivos | Média | Média | Usar grep para encontrar todos os usos |

### Dependencies
- **Técnica:** Nenhuma dependência externa

### Assumptions
- Os tipos foram usados consistentemente em todos os arquivos
- A lógica de `getInvitationStatus` pode ser inferida dos usos

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time |
| --- | --- | --- |
| Phase 1 - Criar tipos | 15 minutos | 15 minutos |
| Phase 2 - Atualizar imports | 10 minutos | 10 minutos |
| Phase 3 - Validação | 5 minutos | 5 minutos |
| **Total** | **30 minutos** | **30 minutos** |

## Rollback Plan

### Rollback Triggers
- Build continua falhando após correção
- Erros de tipo em runtime

### Rollback Procedures
- Reverter commits com `git revert`
- Nenhum impacto em dados (apenas código TypeScript)

## Evidence & Follow-up
- [ ] Build executado com sucesso
- [ ] Nenhum erro de lint
- [ ] Funcionalidade de usuários testada manualmente

## Prevenção Futura
1. Adicionar comentário no `database.types.ts` indicando que é gerado automaticamente
2. Nunca adicionar tipos customizados ao arquivo gerado
3. Documentar padrão de organização de tipos no projeto

<!-- agent-update:end -->
