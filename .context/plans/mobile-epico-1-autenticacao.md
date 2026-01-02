---
id: plan-mobile-epico-1-autenticacao
ai_update_goal: "Define the stages, owners, and evidence required to complete Épico 1 — Autenticação Mobile (Supabase Auth)."
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
  - "test-writer"
  - "documentation-writer"
  - "security-auditor"
  - "mobile-specialist"
---

<!-- agent-update:start:plan-mobile-epico-1-autenticacao -->
# Épico 1 — Autenticação Mobile (Supabase Auth) Plan

> Implementar autenticação completa no app mobile Gapp usando Supabase Auth: Login com credenciais, recuperação de senha, logout, persistência de sessão com AsyncStorage, e tratamento de erros (credenciais inválidas, sem rede).

## Task Snapshot
- **Primary goal:** Implementar fluxo completo de autenticação no app mobile usando Supabase Auth, permitindo que usuários façam login com email/senha, recuperem senha via email, realizem logout seguro, e tenham sessão persistida entre reinicializações do app.
- **Success signal:** 
  - Usuário consegue fazer login com credenciais válidas e acessar o app
  - Erros de autenticação são exibidos de forma clara (credenciais inválidas, sem rede)
  - Sessão persiste ao reabrir o app (não precisa fazer login novamente)
  - Recuperação de senha envia email e exibe confirmação
  - Logout limpa sessão e redireciona para tela de login
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
  - [Épico 0 - Fundação Mobile](./mobile-epico-0-fundacao.md)
  - [BACKLOG Mobile](../../apps/mobile/BACKLOG.md)
  - [PLANO MVP Mobile](../../apps/mobile/PLANO_MVP.md)

## Histórias de Usuário (Backlog)

### 1.1 Login
| Critério de Aceite | Status |
| --- | --- |
| Usuário autentica com credenciais válidas e entra no app | ✅ Implementado |
| Erros exibidos (credencial inválida, sem rede) | ✅ Implementado |
| Sessão persiste ao reabrir o app | ✅ Implementado |

### 1.2 Recuperação de Senha
| Critério de Aceite | Status |
| --- | --- |
| Usuário solicita recuperação e recebe confirmação de envio | ✅ Implementado |
| Erros exibidos quando email inválido / rede indisponível | ✅ Implementado |

### 1.3 Logout
| Critério de Aceite | Status |
| --- | --- |
| Logout encerra sessão e volta para tela de login | ✅ Implementado |
| Cache local sensível é limpo (rascunhos podem permanecer) | ✅ Implementado |

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Mobile Specialist | Líder técnico: implementa integração Supabase Auth, AsyncStorage, e fluxos de autenticação | [Mobile Specialist](../agents/mobile-specialist.md) | Configurar cliente Supabase com AsyncStorage e implementar hooks de autenticação |
| Feature Developer | Implementa telas de login, recuperação de senha e lógica de UI | [Feature Developer](../agents/feature-developer.md) | Atualizar LoginScreen e ForgotPasswordScreen com integração real |
| Security Auditor | Valida segurança do fluxo de autenticação e armazenamento de tokens | [Security Auditor](../agents/security-auditor.md) | Revisar armazenamento seguro de tokens e fluxo de refresh |
| Test Writer | Cria testes unitários e de integração para fluxos de auth | [Test Writer](../agents/test-writer.md) | Escrever testes para hooks de autenticação e cenários de erro |
| Code Reviewer | Revisa código para qualidade, segurança e boas práticas | [Code Reviewer](../agents/code-reviewer.md) | Revisar PRs de implementação de auth |
| Bug Fixer | Corrige bugs encontrados durante testes de autenticação | [Bug Fixer](../agents/bug-fixer.md) | Resolver issues de edge cases (timeout, refresh token) |
| Documentation Writer | Documenta fluxo de autenticação e configuração | [Documentation Writer](../agents/documentation-writer.md) | Atualizar README com instruções de configuração Supabase |

## Documentation Touchpoints
| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | agent-update:development-workflow | Branching rules, CI config, contributing guide |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | agent-update:testing-strategy | Test configs, CI gates, known flaky suites |
| Security & Compliance Notes | [security.md](../docs/security.md) | agent-update:security | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | agent-update:tooling | CLI scripts, IDE configs, automation workflows |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| AsyncStorage não persiste sessão corretamente em iOS/Android | Medium | High | Testar em ambas plataformas cedo; usar @react-native-async-storage/async-storage oficial | Mobile Specialist |
| Token refresh falha silenciosamente | Medium | High | Implementar retry com backoff exponencial; logar erros no Sentry | Mobile Specialist |
| Deep links de recuperação de senha não funcionam | Low | Medium | Configurar URL scheme no Expo; testar em dispositivos reais | Mobile Specialist |
| Supabase Auth não configurado no projeto | Low | High | Verificar configuração via MCP Supabase antes de iniciar | Mobile Specialist |

### Dependencies
- **Internal:** 
  - Épico 0 completo (navegação, tema, observabilidade) ✅
  - Supabase client configurado em `apps/mobile/src/lib/supabase/client.ts` ✅
  - Telas de auth já scaffolded (LoginScreen, ForgotPasswordScreen, ResetPasswordScreen) ✅
- **External:** 
  - Supabase Auth habilitado no projeto
  - Configuração de email para recuperação de senha no Supabase
  - Variáveis de ambiente EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY
- **Technical:** 
  - @react-native-async-storage/async-storage para persistência
  - @supabase/supabase-js já instalado

### Assumptions
- Supabase Auth está configurado e funcional no projeto backend
- Usuários já existem no sistema (não há cadastro no MVP mobile)
- Email de recuperação de senha está configurado no Supabase
- Se assumptions falharem: escalar para Backend Specialist para configuração do Supabase

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery & Setup | 0.5 person-day | 1 dia | 1 pessoa |
| Phase 2 - Implementation | 2 person-days | 2-3 dias | 1-2 pessoas |
| Phase 3 - Validation & Handoff | 1 person-day | 1-2 dias | 1 pessoa |
| **Total** | **3.5 person-days** | **4-6 dias** | **-** |

### Required Skills
- React Native/Expo com TypeScript
- Supabase Auth (signInWithPassword, signOut, resetPasswordForEmail)
- AsyncStorage para React Native
- Tratamento de erros e estados de loading
- Testes com Jest e React Native Testing Library

### Resource Availability
- **Available:** Mobile Specialist (dedicado), Feature Developer (parcial)
- **Blocked:** Nenhum
- **Escalation:** Architect Specialist se houver problemas de arquitetura

## Working Phases

### Phase 1 — Discovery & Setup
**Objetivo:** Configurar dependências e validar integração Supabase

**Steps**
1. **Instalar AsyncStorage** (Owner: Mobile Specialist)
   - Instalar `@react-native-async-storage/async-storage`
   - Verificar compatibilidade com Expo SDK 54
   - Deliverable: Dependência instalada sem erros
   - Evidence: `package.json` atualizado

2. **Configurar Supabase Client com AsyncStorage** (Owner: Mobile Specialist)
   - Atualizar `apps/mobile/src/lib/supabase/client.ts`
   - Configurar storage adapter para AsyncStorage
   - Habilitar `autoRefreshToken` e `persistSession`
   - Deliverable: Cliente Supabase configurado
   - Evidence: Código commitado

3. **Verificar configuração Supabase** (Owner: Mobile Specialist)
   - Usar MCP Supabase para verificar auth habilitado
   - Confirmar variáveis de ambiente configuradas
   - Deliverable: Checklist de configuração
   - Evidence: Screenshot ou log de verificação

4. **Criar AuthContext e hooks** (Owner: Mobile Specialist)
   - Criar `apps/mobile/src/modules/auth/context/AuthContext.tsx`
   - Criar `apps/mobile/src/modules/auth/hooks/useAuth.ts`
   - Implementar estados: `user`, `session`, `loading`, `error`
   - Deliverable: Context e hooks scaffolded
   - Evidence: Arquivos criados

**Commit Checkpoint**
- `git commit -m "feat(mobile/auth): setup supabase client with asyncstorage and auth context"`

### Phase 2 — Implementation & Iteration
**Objetivo:** Implementar fluxos completos de autenticação

**Steps**

#### 2.1 Implementar Login (Owner: Feature Developer)
**Tarefas:**
- [ ] Atualizar `LoginScreen.tsx` para usar `useAuth` hook
- [ ] Implementar `signIn(email, password)` no AuthContext
- [ ] Adicionar validação de campos (email format, senha mínima)
- [ ] Implementar estados de loading durante autenticação
- [ ] Tratar erros específicos:
  - `invalid_credentials`: "E-mail ou senha incorretos"
  - `network_error`: "Sem conexão com a internet"
  - `too_many_requests`: "Muitas tentativas. Aguarde alguns minutos"
- [ ] Navegar para Main após login bem-sucedido
- [ ] Logar eventos no Sentry/observability

**Deliverables:**
- LoginScreen funcional com autenticação real
- Mensagens de erro localizadas em PT-BR

**Evidence:**
- Screenshot de login bem-sucedido
- Screenshot de erro de credenciais
- Screenshot de erro de rede

#### 2.2 Implementar Persistência de Sessão (Owner: Mobile Specialist)
**Tarefas:**
- [ ] Verificar sessão ao iniciar app via `supabase.auth.getSession()`
- [ ] Implementar listener `onAuthStateChange`
- [ ] Mostrar splash/loading enquanto verifica sessão
- [ ] Redirecionar automaticamente se sessão válida
- [ ] Implementar refresh automático de token

**Deliverables:**
- App verifica sessão ao abrir
- Usuário não precisa fazer login novamente se sessão válida

**Evidence:**
- Fechar e reabrir app mantém sessão
- Log de refresh de token bem-sucedido

#### 2.3 Implementar Recuperação de Senha (Owner: Feature Developer)
**Tarefas:**
- [ ] Atualizar `ForgotPasswordScreen.tsx` para usar Supabase
- [ ] Implementar `resetPassword(email)` no AuthContext
- [ ] Validar formato de email antes de enviar
- [ ] Exibir confirmação de envio (mesmo se email não existir - segurança)
- [ ] Tratar erros:
  - `invalid_email`: "Formato de e-mail inválido"
  - `network_error`: "Sem conexão com a internet"
- [ ] Configurar redirect URL para deep link (futuro)

**Deliverables:**
- ForgotPasswordScreen envia email de recuperação
- Feedback claro ao usuário

**Evidence:**
- Email de recuperação recebido
- Screenshot de confirmação de envio

#### 2.4 Implementar Logout (Owner: Feature Developer)
**Tarefas:**
- [ ] Atualizar `ProfileScreen.tsx` para usar `useAuth`
- [ ] Implementar `signOut()` no AuthContext
- [ ] Limpar sessão do AsyncStorage
- [ ] Limpar dados sensíveis do cache (se houver)
- [ ] Manter rascunhos locais (não sensíveis)
- [ ] Navegar para LoginScreen após logout
- [ ] Logar evento de logout no observability

**Deliverables:**
- Botão de logout funcional
- Sessão completamente limpa

**Evidence:**
- Após logout, app mostra tela de login
- Reabrir app não restaura sessão anterior

#### 2.5 Integrar AuthContext no App (Owner: Mobile Specialist)
**Tarefas:**
- [ ] Envolver App com `AuthProvider`
- [ ] Atualizar `RootNavigator` para usar `useAuth`
- [ ] Remover prop `isAuthenticated` hardcoded
- [ ] Implementar loading state global durante verificação de sessão

**Deliverables:**
- App usa estado real de autenticação
- Navegação condicional funciona corretamente

**Evidence:**
- App inicia com loading, depois mostra login ou main

**Commit Checkpoint**
- `git commit -m "feat(mobile/auth): implement login, logout, password recovery with supabase"`

### Phase 3 — Validation & Handoff
**Objetivo:** Testar, documentar e preparar para próximo épico

**Steps**

#### 3.1 Testes Unitários (Owner: Test Writer)
**Tarefas:**
- [ ] Criar `apps/mobile/src/modules/auth/__tests__/AuthContext.test.tsx`
- [ ] Testar `signIn` com credenciais válidas/inválidas
- [ ] Testar `signOut` limpa sessão
- [ ] Testar `resetPassword` com email válido/inválido
- [ ] Testar estados de loading e error
- [ ] Mockar Supabase client

**Deliverables:**
- Suite de testes para AuthContext
- Cobertura > 80% para módulo auth

**Evidence:**
- Output de `npm run test:coverage`

#### 3.2 Testes Manuais (Owner: Mobile Specialist)
**Cenários a testar:**

| Cenário | Passos | Resultado Esperado |
| --- | --- | --- |
| Login válido | Inserir email/senha corretos, clicar Entrar | Navega para Home |
| Login inválido | Inserir email/senha incorretos | Mostra erro "E-mail ou senha incorretos" |
| Login sem rede | Desativar internet, tentar login | Mostra erro "Sem conexão" |
| Sessão persistida | Fazer login, fechar app, reabrir | Vai direto para Home |
| Recuperar senha | Inserir email, clicar Enviar | Mostra confirmação, email recebido |
| Recuperar senha inválido | Inserir email mal formatado | Mostra erro de formato |
| Logout | Clicar em Sair na tela de Perfil | Volta para Login |
| Logout limpa sessão | Fazer logout, reabrir app | Mostra tela de Login |

**Evidence:**
- Checklist de testes manuais preenchido
- Screenshots/vídeos dos cenários

#### 3.3 Auditoria de Segurança (Owner: Security Auditor)
**Checklist:**
- [ ] Tokens não são logados em texto claro
- [ ] AsyncStorage usa chaves seguras
- [ ] Erros não expõem informações sensíveis
- [ ] Refresh token é tratado adequadamente
- [ ] Não há vazamento de sessão entre usuários

**Evidence:**
- Relatório de auditoria

#### 3.4 Documentação (Owner: Documentation Writer)
**Tarefas:**
- [ ] Atualizar `apps/mobile/README.md` com:
  - Configuração de variáveis de ambiente Supabase
  - Fluxo de autenticação
  - Troubleshooting comum
- [ ] Documentar AuthContext API
- [ ] Adicionar comentários JSDoc nos hooks

**Evidence:**
- README atualizado
- JSDoc nos arquivos de auth

**Commit Checkpoint**
- `git commit -m "test(mobile/auth): add unit tests and documentation for auth module"`

## Implementação Técnica Detalhada

### Estrutura de Arquivos
```
apps/mobile/src/
├── modules/
│   └── auth/
│       ├── context/
│       │   └── AuthContext.tsx      # Context provider com estado de auth
│       ├── hooks/
│       │   ├── useAuth.ts           # Hook principal de autenticação
│       │   └── useSession.ts        # Hook para verificar sessão
│       ├── screens/
│       │   ├── LoginScreen.tsx      # Atualizar com integração real
│       │   ├── ForgotPasswordScreen.tsx
│       │   └── ResetPasswordScreen.tsx
│       ├── services/
│       │   └── authService.ts       # Funções de autenticação Supabase
│       ├── types/
│       │   └── auth.types.ts        # Tipos TypeScript para auth
│       └── __tests__/
│           ├── AuthContext.test.tsx
│           └── authService.test.ts
└── lib/
    └── supabase/
        └── client.ts                # Atualizar com AsyncStorage
```

### AuthContext Interface
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}
```

### Mensagens de Erro (PT-BR)
```typescript
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'invalid_credentials': 'E-mail ou senha incorretos',
  'invalid_email': 'Formato de e-mail inválido',
  'user_not_found': 'Usuário não encontrado',
  'email_not_confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada',
  'too_many_requests': 'Muitas tentativas. Aguarde alguns minutos',
  'network_error': 'Sem conexão com a internet. Verifique sua conexão',
  'default': 'Ocorreu um erro. Tente novamente',
};
```

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Autenticação falha consistentemente em produção
- Tokens vazam ou são expostos
- Sessões não persistem corretamente
- Performance degradada significativamente

### Rollback Procedures
#### Phase 1 Rollback
- Action: Reverter commits de setup, remover AsyncStorage
- Data Impact: Nenhum (sem dados de usuário afetados)
- Estimated Time: < 1 hora

#### Phase 2 Rollback
- Action: Reverter para versão mock de autenticação
- Data Impact: Usuários precisarão fazer login novamente quando fix for aplicado
- Estimated Time: 1-2 horas

#### Phase 3 Rollback
- Action: Reverter testes e documentação se necessário
- Data Impact: Nenhum
- Estimated Time: < 1 hora

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

<!-- agent-readonly:guidance -->
## Agent Playbook Checklist
1. Pick the agent that matches your task.
2. Enrich the template with project-specific context or links.
3. Share the final prompt with your AI assistant.
4. Capture learnings in the relevant documentation file so future runs improve.

## Evidence & Follow-up
- **Artifacts to collect:**
  - PR links para cada fase
  - Screenshots de testes manuais
  - Output de cobertura de testes
  - Relatório de auditoria de segurança
- **Follow-up actions:**
  - Épico 2 (RBAC/Escopo) depende da conclusão deste épico
  - Configurar deep links para recuperação de senha (pós-MVP)
  - Implementar magic link login (opcional, pós-MVP)

## Checklist Final de Entrega
- [x] Login funciona com credenciais válidas
- [x] Erros de login são exibidos corretamente
- [x] Sessão persiste ao reabrir app
- [x] Recuperação de senha envia email
- [x] Logout limpa sessão completamente
- [x] Testes unitários passando (23 testes)
- [ ] Testes manuais documentados
- [ ] Auditoria de segurança aprovada
- [ ] Documentação atualizada
- [ ] Code review aprovado

<!-- agent-update:end -->
