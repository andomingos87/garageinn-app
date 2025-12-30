---
id: plan-fix-bug-redefinicao-senha
ai_update_goal: "Corrigir o fluxo de redefinição de senha que redireciona para /login ao invés de /redefinir-senha"
required_inputs:
  - "Documentação do bug: projeto/erros/bug-redefinicao-senha.md"
  - "Configuração do Supabase Auth (Dashboard > Authentication > URL Configuration)"
  - "Código do callback: apps/web/src/app/auth/callback/route.ts"
  - "Server action: apps/web/src/app/(auth)/recuperar-senha/actions.ts"
success_criteria:
  - "Usuário clica no link do email e é redirecionado para /redefinir-senha"
  - "Sessão de autenticação é estabelecida corretamente antes de exibir o formulário"
  - "Usuário consegue definir nova senha e fazer login com sucesso"
related_agents:
  - "bug-fixer"
  - "frontend-specialist"
  - "backend-specialist"
  - "security-auditor"
---

<!-- agent-update:start:plan-fix-bug-redefinicao-senha -->
# Correção do Bug de Redefinição de Senha Plan

> Corrigir o fluxo de redefinição de senha que redireciona incorretamente para a página de login ao invés da página de redefinição

## Task Snapshot
- **Primary goal:** Corrigir o redirecionamento incorreto no fluxo de recuperação de senha para que o usuário chegue em `/redefinir-senha` após clicar no link do email.
- **Success signal:** Usuário solicita recuperação de senha → recebe email → clica no botão → é redirecionado para `/redefinir-senha` → define nova senha → consegue fazer login.
- **Key references:**
  - [Documentação do Bug](../../projeto/erros/bug-redefinicao-senha.md)
  - [Plano de Autenticação Original](./autenticacao.md)
  - [Supabase resetPasswordForEmail Docs](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Bug Fixer | Diagnosticar a causa raiz do redirecionamento incorreto e propor correção | [Bug Fixer](../agents/bug-fixer.md) | Analisar logs do Supabase e código do callback |
| Frontend Specialist | Implementar fallback no componente de cliente se necessário | [Frontend Specialist](../agents/frontend-specialist.md) | Ajustar `NewPasswordForm` para lidar com edge cases |
| Backend Specialist | Ajustar Route Handler e configurações de redirect | [Backend Specialist](../agents/backend-specialist.md) | Modificar `/auth/callback/route.ts` para tratar recovery |
| Security Auditor | Garantir que a correção não introduza vulnerabilidades | [Security Auditor](../agents/security-auditor.md) | Validar que tokens não ficam expostos na URL |

## Arquivos Afetados
| Arquivo | Responsabilidade | Ação Necessária |
| --- | --- | --- |
| `apps/web/src/app/auth/callback/route.ts` | Processa código PKCE e estabelece sessão | Verificar/melhorar tratamento de erro |
| `apps/web/src/app/(auth)/recuperar-senha/actions.ts` | Envia email de recuperação | Verificar `redirectTo` URL |
| `apps/web/src/app/(auth)/components/new-password-form.tsx` | Formulário de nova senha (cliente) | Possível fallback para tokens no hash |
| `apps/web/src/middleware.ts` | Proteção de rotas | Confirmar que `/redefinir-senha` está como pública |
| **Supabase Dashboard** | Configuração de Redirect URLs | Adicionar URLs permitidas |

## Configurações Externas
| Plataforma | Configuração | Valor Esperado |
| --- | --- | --- |
| Supabase Dashboard | Site URL | `https://app.garageinn.com` (produção) ou `http://localhost:3000` (dev) |
| Supabase Dashboard | Redirect URLs | Deve incluir `/auth/callback` e wildcards se necessário |
| Supabase Dashboard | Email Templates > Recovery | Verificar se usa `{{ .ConfirmationURL }}` corretamente |

## Risk Assessment
Identificar bloqueadores potenciais e estratégias de mitigação.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Configuração incorreta no Supabase Dashboard | Alta | Alto | Verificar e documentar configurações atuais antes de alterar | Bug Fixer |
| Diferença entre ambiente dev e prod | Média | Médio | Testar em ambos os ambientes após correção | Backend Specialist |
| Regressão em outros fluxos de auth | Baixa | Alto | Testar login, cadastro e logout após mudanças | Security Auditor |

### Dependencies
- **Interna:** Acesso ao Supabase Dashboard com permissões de admin
- **Externa:** Supabase Auth API (status operacional)
- **Técnica:** Variáveis de ambiente `NEXT_PUBLIC_SITE_URL` configuradas corretamente

### Assumptions
- O fluxo PKCE está habilitado no Supabase (padrão para SSR)
- O template de email está usando a variável `{{ .ConfirmationURL }}` corretamente
- O problema está na configuração de redirect, não no código do Supabase

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 1-2 horas | Mesmo dia | 1 pessoa |
| Phase 2 - Implementation | 2-4 horas | Mesmo dia | 1 pessoa |
| Phase 3 - Validation | 1 hora | Mesmo dia | 1 pessoa |
| **Total** | **4-7 horas** | **1 dia** | **1 pessoa** |

### Required Skills
- Conhecimento de Supabase Auth (PKCE flow, redirect configuration)
- Next.js App Router (Route Handlers, Middleware)
- Acesso ao Supabase Dashboard

### Resource Availability
- **Disponível:** Desenvolvedor com acesso ao dashboard do Supabase
- **Bloqueado:** N/A
- **Escalação:** Admin do projeto Supabase se necessário alterar configurações

## Working Phases

### Phase 1 — Discovery & Diagnóstico
**Steps**
1. [ ] Acessar Supabase Dashboard > Authentication > URL Configuration
2. [ ] Verificar se `http://localhost:3000/auth/callback` está na lista de Redirect URLs
3. [ ] Verificar se `https://app.garageinn.com/auth/callback` está na lista (produção)
4. [ ] Verificar valor atual da "Site URL" no dashboard
5. [ ] Inspecionar email recebido e capturar a URL exata do botão "Redefinir minha senha"
6. [ ] Comparar URL do email com o `redirectTo` configurado em `actions.ts`

**Perguntas a Responder**
- A URL do email está apontando para `/auth/callback?next=/redefinir-senha`?
- O Supabase está respeitando o `redirectTo` ou usando Site URL padrão?
- Há parâmetro `code` ou `access_token` no hash?

**Commit Checkpoint**
```bash
git commit -m "chore(plan): complete phase 1 - diagnóstico do bug de redefinição"
```

### Phase 2 — Implementação da Correção
**Steps**
1. [ ] **Configuração Supabase:** Adicionar URLs de redirect permitidas no dashboard
   - `http://localhost:3000/auth/callback`
   - `https://app.garageinn.com/auth/callback`
2. [ ] **Código (se necessário):** Melhorar tratamento de erro no callback
   ```typescript
   // apps/web/src/app/auth/callback/route.ts
   // Adicionar log para debug e fallback mais informativo
   ```
3. [ ] **Fallback (se PKCE falhar):** Ajustar `NewPasswordForm` para processar hash diretamente se o callback não funcionar

**Referências**
- [Supabase PKCE Flow](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Auth Helpers Migration Guide](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers)

**Commit Checkpoint**
```bash
git commit -m "fix(auth): corrigir redirecionamento no fluxo de recuperação de senha"
```

### Phase 3 — Validação & Testes
**Steps**
1. [ ] **Teste Local:**
   - Solicitar recuperação de senha com email válido
   - Verificar se email chega
   - Clicar no botão e confirmar redirecionamento para `/redefinir-senha`
   - Definir nova senha e confirmar login
2. [ ] **Teste em Produção:**
   - Repetir o fluxo completo no ambiente de produção
3. [ ] **Testes de Regressão:**
   - Verificar se login normal continua funcionando
   - Verificar se logout funciona
   - Verificar se cadastro funciona (se aplicável)

**Evidence to Capture**
- Screenshot ou gravação do fluxo funcionando
- URL capturada do email para confirmar formato correto
- Logs do console mostrando evento `PASSWORD_RECOVERY`

**Commit Checkpoint**
```bash
git commit -m "chore(plan): validação completa do fix de redefinição de senha"
```

## Rollback Plan
Este fix é de baixo risco pois envolve principalmente configuração.

### Rollback Triggers
- Outros fluxos de autenticação param de funcionar
- Erros de CORS ou redirect loops
- Usuários não conseguem mais fazer login

### Rollback Procedures
#### Configuração Supabase
- Remover URLs adicionadas à lista de Redirect URLs
- Restaurar Site URL ao valor anterior (se alterado)
- **Tempo estimado:** < 5 minutos

#### Código (se alterado)
- Reverter commits via `git revert <hash>`
- Fazer redeploy
- **Tempo estimado:** < 15 minutos

### Post-Rollback Actions
1. Documentar motivo do rollback
2. Investigar causa raiz com mais detalhes
3. Buscar alternativa de implementação

## Causa Raiz Provável

Com base na análise do código e documentação:

### Hipótese 1: Redirect URL não autorizada (Mais Provável)
O `redirectTo` configurado em `actions.ts` inclui query params (`?next=/redefinir-senha`), e a URL completa pode não estar na whitelist do Supabase. Quando isso acontece, o Supabase ignora o redirect e usa a Site URL padrão.

**Código atual:**
```typescript
// apps/web/src/app/(auth)/recuperar-senha/actions.ts
redirectTo: `${siteUrl}/auth/callback?next=/redefinir-senha`
```

### Hipótese 2: Callback falha silenciosamente
Se o código PKCE expirar ou for inválido, o callback redireciona para `/login?error=auth_failed`:
```typescript
// apps/web/src/app/auth/callback/route.ts
if (code) {
  // ...
}
return NextResponse.redirect(`${origin}/login?error=auth_failed`);
```

### Hipótese 3: Inconsistência de SITE_URL
Se `NEXT_PUBLIC_SITE_URL` estiver diferente entre dev/prod ou não configurado, o link enviado pode apontar para um domínio incorreto.

---

## Evidence & Follow-up
- [ ] Screenshot das configurações atuais do Supabase Dashboard
- [ ] URL exata do botão do email (copiar raw)
- [ ] Logs do console do browser ao clicar no link
- [ ] PR com as alterações (se houver código)
- [ ] Confirmação de teste em produção após deploy

## Referências Relacionadas
- [Bug Documentation](../../projeto/erros/bug-redefinicao-senha.md)
- [Plano de Correção Auth Recovery](./correcao-auth-recovery.md)
- [Plano de Autenticação Original](./autenticacao.md)

<!-- agent-update:end -->
