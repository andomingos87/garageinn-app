---
id: plan-fix-bug-impersonacao-estado-persistente
ai_update_goal: "Corrigir o bug de estado persistente de impersonação que exibe banner incorreto após logout/login"
required_inputs:
  - "Documentação do bug: projeto/erros/bug-impersonacao-estado-persistente.md"
  - "Código de impersonação: apps/web/src/lib/auth/impersonation.ts"
  - "Hook de impersonação: apps/web/src/hooks/use-impersonation.ts"
  - "Banner de impersonação: apps/web/src/components/layout/impersonation-banner.tsx"
  - "Hook de autenticação: apps/web/src/hooks/use-auth.ts"
success_criteria:
  - "Estado de impersonação é validado contra sessão atual do Supabase"
  - "Banner não aparece após logout/login quando não há impersonação ativa"
  - "Estado órfão é limpo automaticamente quando detectado"
  - "Navegação durante impersonação não causa perda de sessão inesperada"
  - "Arquivo de documentação do bug é removido após validação"
related_agents:
  - "bug-fixer"
  - "frontend-specialist"
  - "backend-specialist"
  - "security-auditor"
---

<!-- agent-update:start:plan-fix-bug-impersonacao-estado-persistente -->
# Correção do Bug de Impersonação - Estado Persistente

> Corrigir o bug onde o estado de impersonação persiste no localStorage após logout/login, causando exibição incorreta do banner mesmo quando o usuário não está mais impersonando

## Task Snapshot
- **Primary goal:** Implementar validação do estado de impersonação contra a sessão atual do Supabase para evitar estados órfãos e banners incorretos
- **Success signal:** Admin faz impersonação → navega → perde sessão → faz login → banner não aparece (ou aparece corretamente se ainda estiver impersonando)
- **Key references:**
  - [Documentação do Bug](../../projeto/erros/bug-impersonacao-estado-persistente.md)
  - [Plano de Implementação de Impersonação](./implementacao-impersonacao.md)
  - [Plano de Revisão de Impersonação](./revisao-impersonacao.md)
  - [Supabase Auth getUser](https://supabase.com/docs/reference/javascript/auth-getuser)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Bug Fixer | Diagnosticar causa raiz e implementar validação de estado | [Bug Fixer](../agents/bug-fixer.md) | Analisar `getImpersonationState()` e implementar validação |
| Frontend Specialist | Ajustar hook e componentes para validar estado | [Frontend Specialist](../agents/frontend-specialist.md) | Modificar `use-impersonation.ts` para integrar com `use-auth` |
| Backend Specialist | Verificar Edge Function de impersonação | [Backend Specialist](../agents/backend-specialist.md) | Validar que magic links geram sessões válidas |
| Security Auditor | Garantir que validação não expõe informações sensíveis | [Security Auditor](../agents/security-auditor.md) | Validar limpeza de estado órfão e segurança |

## Arquivos Afetados
| Arquivo | Responsabilidade | Ação Necessária |
| --- | --- | --- |
| `apps/web/src/lib/auth/impersonation.ts` | Funções de gerenciamento de estado | Modificar `getImpersonationState()` para validar contra sessão atual |
| `apps/web/src/hooks/use-impersonation.ts` | Hook React para estado de impersonação | Integrar com `use-auth` para revalidar quando sessão muda |
| `apps/web/src/components/layout/impersonation-banner.tsx` | Banner de aviso | Garantir que só exibe quando estado é válido |
| `apps/web/src/lib/services/impersonation-service.ts` | Serviço de impersonação | Verificar se salva estado corretamente (já funciona) |
| `apps/web/src/app/(app)/usuarios/components/impersonate-dialog.tsx` | Dialog de impersonação | Verificar fluxo (já funciona) |
| `apps/web/src/proxy.ts` | Middleware de autenticação | Verificar se sessão expira corretamente (já funciona) |

## Configurações Externas
| Plataforma | Configuração | Valor Esperado |
| --- | --- | --- |
| Supabase Edge Function | `impersonate-user` | Deve gerar magic links válidos com sessões que não expiram rapidamente |
| Supabase Auth | Session timeout | Verificar configuração padrão (geralmente 1 hora) |

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Validação assíncrona quebra componentes síncronos | Média | Médio | Usar estado de loading e fallback | Frontend Specialist |
| Performance: validação em cada render | Baixa | Baixo | Usar memoização e cache | Frontend Specialist |
| Regressão: banner não aparece quando deveria | Baixa | Alto | Testes completos de todos os cenários | Bug Fixer |
| Sessão expira durante impersonação | Média | Médio | Investigar causa raiz da expiração | Backend Specialist |

### Dependencies
- **Interna:** Hook `use-auth` deve estar disponível e funcionando
- **Externa:** Supabase Auth API (status operacional)
- **Técnica:** Cliente Supabase configurado corretamente

### Assumptions
- O problema principal é falta de validação, não bug na Edge Function
- A expiração de sessão durante navegação é um problema separado (mas relacionado)
- O estado no localStorage é confiável, apenas precisa ser validado

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Análise e Design | 1-2 horas | Mesmo dia | 1 pessoa |
| Phase 2 - Implementação | 2-3 horas | Mesmo dia | 1 pessoa |
| Phase 3 - Testes e Validação | 1-2 horas | Mesmo dia | 1 pessoa |
| Phase 4 - Limpeza | 15 minutos | Mesmo dia | 1 pessoa |
| **Total** | **4-7 horas** | **1 dia** | **1 pessoa** |

### Required Skills
- Conhecimento de React Hooks (useState, useEffect, useCallback)
- Supabase Auth (getUser, getSession)
- TypeScript
- Entendimento de localStorage e estado de aplicação

### Resource Availability
- **Disponível:** Desenvolvedor com acesso ao código
- **Bloqueado:** N/A
- **Escalação:** N/A

## Working Phases

### Phase 1 — Análise e Design da Solução

**Steps**
1. [ ] Ler documentação completa do bug em `projeto/erros/bug-impersonacao-estado-persistente.md`
2. [ ] Analisar código atual de `getImpersonationState()` em `apps/web/src/lib/auth/impersonation.ts`
3. [ ] Verificar como `use-impersonation.ts` usa o estado
4. [ ] Verificar como `use-auth.ts` gerencia sessão
5. [ ] Decidir entre as 4 abordagens sugeridas na documentação:
   - **Opção A:** Tornar `getImpersonationState()` assíncrona (mais robusta)
   - **Opção B:** Validar no hook `use-impersonation` (mais simples)
   - **Opção C:** Limpar estado no login (preventiva)
   - **Opção D:** Adicionar timeout (preventiva)
6. [ ] **Recomendação:** Implementar **Opção B** (validação no hook) como solução principal + **Opção C** (limpeza no login) como segurança adicional

**Decisões de Design**
- Manter `getImpersonationState()` síncrona para não quebrar código existente
- Adicionar validação assíncrona no hook `use-impersonation`
- Integrar com `use-auth` para revalidar quando usuário muda
- Limpar estado órfão automaticamente quando detectado

**Commit Checkpoint**
```bash
git commit -m "chore(plan): complete phase 1 - análise do bug de impersonação"
```

### Phase 2 — Implementação da Correção

**Steps**

#### 2.1 Modificar `use-impersonation.ts`
1. [ ] Adicionar import de `use-auth`
2. [ ] Adicionar dependência de `user` do `use-auth` no `useEffect`
3. [ ] Implementar função `validateImpersonationState()` que:
   - Lê estado do localStorage
   - Compara com `user.id` atual
   - Limpa estado se for órfão
   - Retorna estado válido
4. [ ] Atualizar `useEffect` para chamar validação quando `user` muda

**Código de Referência:**
```typescript
// apps/web/src/hooks/use-impersonation.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getImpersonationState,
  clearImpersonationState,
  ImpersonationState,
} from "@/lib/auth/impersonation";
import { useAuth } from "@/hooks/use-auth";

export function useImpersonation() {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
  });
  const { user } = useAuth(); // Adicionar dependência

  useEffect(() => {
    const validateState = () => {
      const savedState = getImpersonationState();
      
      // Se não há estado salvo, retornar vazio
      if (!savedState.isImpersonating) {
        setState(savedState);
        return;
      }

      // Se não há usuário logado, limpar estado órfão
      if (!user) {
        clearImpersonationState();
        setState({ isImpersonating: false });
        return;
      }

      // Validar se usuário atual corresponde ao estado salvo
      const isCurrentlyImpersonating = user.id === savedState.impersonatedUserId;
      const isOriginalAdmin = user.id === savedState.originalUserId;

      // Se usuário atual não corresponde a nenhum dos IDs, é estado órfão
      if (!isCurrentlyImpersonating && !isOriginalAdmin) {
        clearImpersonationState();
        setState({ isImpersonating: false });
        return;
      }

      // Estado válido: atualizar com flag correto
      setState({
        ...savedState,
        isImpersonating: isCurrentlyImpersonating,
      });
    };

    validateState();
  }, [user]); // Revalidar quando usuário muda

  const exitImpersonation = useCallback(async () => {
    clearImpersonationState();
    window.location.href = "/";
  }, []);

  return {
    ...state,
    exitImpersonation,
  };
}
```

#### 2.2 Adicionar Limpeza Preventiva no Login (Opcional mas Recomendado)
1. [ ] Localizar arquivo de login actions
2. [ ] Adicionar limpeza de estado órfão após login bem-sucedido
3. [ ] Validar que usuário atual não corresponde ao estado antes de limpar

**Código de Referência:**
```typescript
// Em apps/web/src/app/(auth)/login/actions.ts ou similar
import { getImpersonationState, clearImpersonationState } from "@/lib/auth/impersonation";
import { createClient } from "@/lib/supabase/client";

export async function signIn(formData: FormData) {
  // ... código de login existente ...
  
  // Após login bem-sucedido, validar estado de impersonação
  if (typeof window !== "undefined") {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const state = getImpersonationState();
      // Se estado existe mas usuário atual não corresponde, limpar
      if (state.isImpersonating && 
          user.id !== state.impersonatedUserId && 
          user.id !== state.originalUserId) {
        clearImpersonationState();
      }
    }
  }
}
```

#### 2.3 (Opcional) Investigar Expiração de Sessão
1. [ ] Verificar logs do Supabase para entender por que sessão expira ao navegar para `/chamados`
2. [ ] Verificar se magic link gera sessão com tempo de expiração adequado
3. [ ] Se necessário, ajustar Edge Function ou configuração de sessão

**Commit Checkpoint**
```bash
git commit -m "fix(impersonation): validar estado contra sessão atual para evitar estados órfãos"
```

### Phase 3 — Testes e Validação

**Steps**

#### 3.1 Teste de Estado Órfão (Cenário Principal)
1. [ ] Fazer login como admin (`admin@garageinn.com`)
2. [ ] Navegar até `/usuarios`
3. [ ] Personificar usuário `teste_manobrista_operacoes@garageinn.com`
4. [ ] Verificar que banner aparece corretamente
5. [ ] Navegar para `/chamados` (ou qualquer página que cause logout)
6. [ ] Fazer login novamente como admin
7. [ ] **VALIDAR:** Banner NÃO deve aparecer (ou deve aparecer apenas se ainda estiver impersonando)

#### 3.2 Teste de Impersonação Normal
1. [ ] Fazer login como admin
2. [ ] Personificar usuário
3. [ ] Navegar entre páginas normalmente
4. [ ] **VALIDAR:** Banner continua aparecendo durante toda a navegação
5. [ ] Clicar em "Encerrar" no banner
6. [ ] **VALIDAR:** Volta para sessão de admin, banner desaparece

#### 3.3 Teste de Logout Completo
1. [ ] Fazer impersonação
2. [ ] Fazer logout completo (não apenas encerrar impersonação)
3. [ ] Fazer login como admin
4. [ ] **VALIDAR:** Banner não aparece

#### 3.4 Teste de Navegação Durante Impersonação
1. [ ] Fazer impersonação
2. [ ] Navegar entre várias páginas (`/dashboard`, `/chamados`, `/usuarios`, etc.)
3. [ ] **VALIDAR:** Sessão não expira inesperadamente
4. [ ] **VALIDAR:** Banner continua aparecendo

#### 3.5 Teste de Múltiplas Impersonações
1. [ ] Fazer impersonação do usuário A
2. [ ] Encerrar impersonação
3. [ ] Fazer impersonação do usuário B
4. [ ] **VALIDAR:** Banner mostra usuário B corretamente

**Evidence to Capture**
- Screenshots do fluxo funcionando corretamente
- Logs do console mostrando validação de estado
- Teste manual completo seguindo passos de reprodução do bug

**Commit Checkpoint**
```bash
git commit -m "test(impersonation): validação completa da correção de estado órfão"
```

### Phase 4 — Limpeza e Documentação

**Steps**
1. [ ] Verificar que todos os testes passaram
2. [ ] Verificar que não há regressões em outros fluxos
3. [ ] Atualizar documentação se necessário
4. [ ] **REMOVER ARQUIVO DE BUG:** Apagar `projeto/erros/bug-impersonacao-estado-persistente.md`
5. [ ] Atualizar este plano marcando como completo

**Commit Checkpoint**
```bash
git commit -m "chore: remover documentação de bug corrigido (impersonação estado persistente)"
```

## Rollback Plan

### Rollback Triggers
- Banner não aparece quando deveria aparecer
- Impersonação para de funcionar completamente
- Erros de performance devido a validações excessivas
- Regressões em outros fluxos de autenticação

### Rollback Procedures
1. Reverter commits relacionados via `git revert <hash>`
2. Fazer redeploy
3. **Tempo estimado:** < 15 minutos

### Post-Rollback Actions
1. Documentar motivo do rollback
2. Investigar causa raiz com mais detalhes
3. Buscar alternativa de implementação

## Causa Raiz Confirmada

Com base na análise da documentação do bug:

### Problema Principal
A função `getImpersonationState()` em `apps/web/src/lib/auth/impersonation.ts` verifica apenas se existem dados no localStorage, mas **não valida se o usuário atual corresponde ao estado salvo**. Isso permite que estados órfãos persistam após logout/login.

### Problema Secundário
O hook `use-impersonation.ts` não revalida o estado quando a sessão do usuário muda, então mesmo após login como admin, o estado antigo continua sendo usado.

### Solução
1. **Validação no Hook:** Modificar `use-impersonation.ts` para validar estado contra `user.id` atual
2. **Limpeza Automática:** Limpar estado órfão quando detectado
3. **Revalidação:** Revalidar quando `user` muda (via dependência do `useEffect`)

## Evidence & Follow-up
- [ ] Screenshots do fluxo funcionando corretamente após correção
- [ ] Logs do console mostrando validação de estado
- [ ] Teste manual completo seguindo passos de reprodução do bug original
- [ ] PR com as alterações
- [ ] Confirmação de que arquivo de bug foi removido
- [ ] Atualização deste plano marcando fases como completas

## Referências Relacionadas
- [Bug Documentation](../../projeto/erros/bug-impersonacao-estado-persistente.md) (será removido após correção)
- [Plano de Implementação de Impersonação](./implementacao-impersonacao.md)
- [Plano de Revisão de Impersonação](./revisao-impersonacao.md)
- [Supabase Auth getUser](https://supabase.com/docs/reference/javascript/auth-getuser)
- [React useEffect Dependencies](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)

<!-- agent-update:end -->

