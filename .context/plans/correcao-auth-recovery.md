---
id: plan-correcao-auth-recovery
ai_update_goal: "Define the stages, owners, and evidence required to complete Correção do Fluxo de Recuperação de Senha."
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
  - "frontend-specialist"
  - "backend-specialist"
  - "security-auditor"
---

<!-- agent-update:start:plan-correcao-auth-recovery -->
# Correção do Fluxo de Recuperação de Senha Plan

> Corrigir o erro 'Auth session missing' no fluxo de redefinição de senha para usuários convidados, implementando corretamente o processamento do token de recuperação seguindo as boas práticas do Supabase SSR

## Diagnóstico do Problema

### Contexto
Quando um admin reenvia um convite para um usuário pendente, o sistema usa `resetPasswordForEmail` que envia um email com link de recuperação. O link redireciona para:
```
https://app.garageinn.com/redefinir-senha#access_token=...&type=recovery
```

### Problema Identificado
O token de recuperação vem no **hash fragment** (`#`) da URL, que:
1. **Não é acessível no servidor** - O middleware e server components não têm acesso ao hash
2. **Precisa ser processado no cliente** - Apenas o browser consegue ler o hash
3. **A sessão precisa ser sincronizada** - Após processar o token no cliente, os cookies precisam ser atualizados

### Fluxo Atual (Quebrado)
```
1. Usuário clica no link do email
2. Redireciona para /redefinir-senha#access_token=...
3. Middleware roda (sem acesso ao hash) → não consegue estabelecer sessão
4. Página carrega com NewPasswordForm
5. Cliente tenta processar hash, mas server action já falhou
6. Erro: "Auth session missing!"
```

## Solução Recomendada (Baseada na Documentação Supabase)

### Abordagem 1: Usar `onAuthStateChange` com evento `PASSWORD_RECOVERY`
Segundo a documentação oficial do Supabase:
> **PASSWORD_RECOVERY** - Emitted instead of `SIGNED_IN` when the user lands on a page with a password recovery link in the URL. Use it to show a password reset UI.

### Abordagem 2: Processar Token no Cliente e Atualizar Senha no Cliente
O Supabase SSR client processa automaticamente o hash da URL. A atualização de senha deve ser feita no cliente usando `supabase.auth.updateUser()`.

### Fluxo Correto
```
1. Usuário clica no link do email
2. Redireciona para /redefinir-senha#access_token=...
3. Middleware roda (ignora hash, permite acesso à rota pública)
4. Página carrega com NewPasswordForm (Client Component)
5. useEffect escuta onAuthStateChange para evento PASSWORD_RECOVERY
6. Quando evento dispara, sessão está estabelecida
7. Usuário preenche nova senha
8. supabase.auth.updateUser({ password }) é chamado NO CLIENTE
9. Sucesso! Redireciona para login
```

## Task Snapshot
- **Primary goal:** Corrigir o fluxo de redefinição de senha para que usuários convidados consigam definir sua senha através do link de email
- **Success signal:** Usuário consegue clicar no link do email, definir nova senha e fazer login com sucesso
- **Key references:**
  - [Supabase onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
  - [Supabase resetPasswordForEmail](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)
  - [Supabase updateUser](https://supabase.com/docs/reference/javascript/auth-updateuser)

## Agent Lineup
| Agent | Role in this plan | First responsibility focus |
| --- | --- | --- |
| Bug Fixer | Identificar e corrigir o fluxo quebrado | Analisar logs e implementar correção |
| Frontend Specialist | Implementar processamento de token no cliente | Criar componente React com onAuthStateChange |
| Backend Specialist | Verificar Edge Function e fluxo de email | Garantir que resend-invite está correto |
| Security Auditor | Validar segurança do fluxo de tokens | Verificar exposição de tokens e limpeza de URL |

## Working Phases

### Phase 1 — Correção do NewPasswordForm
**Arquivos a modificar:**
- `apps/web/src/app/(auth)/components/new-password-form.tsx`

**Implementação:**
```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function NewPasswordForm() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const supabase = createClient();
    
    // Escutar eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          // Sessão estabelecida via link de recuperação
          setIsReady(true);
          // Limpar hash da URL por segurança
          window.history.replaceState(null, "", window.location.pathname);
        } else if (event === "SIGNED_IN" && session) {
          // Fallback: usuário já estava logado ou sessão restaurada
          setIsReady(true);
        }
      }
    );

    // Verificar se já existe sessão (usuário acessou diretamente)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setError(error.message);
      return;
    }
    
    router.push("/login?message=password_updated");
  };

  // ... resto do componente
}
```

**Pontos-chave:**
1. Usar `onAuthStateChange` para detectar evento `PASSWORD_RECOVERY`
2. Chamar `updateUser` no cliente (não server action)
3. Limpar hash da URL após processamento
4. Verificar sessão existente como fallback

### Phase 2 — Remover Server Action (Opcional)
**Arquivo:** `apps/web/src/app/(auth)/redefinir-senha/actions.ts`

O server action `updatePassword` pode ser mantido para outros casos de uso (usuário logado alterando senha), mas o fluxo de recovery deve usar o cliente.

### Phase 3 — Validação e Testes

**Cenários de teste:**
1. ✅ Reenviar convite para usuário pendente
2. ✅ Clicar no link do email
3. ✅ Página carrega e mostra "Link verificado"
4. ✅ Preencher nova senha
5. ✅ Submeter formulário
6. ✅ Redirecionar para login com mensagem de sucesso
7. ✅ Fazer login com nova senha

**Verificações de segurança:**
- [ ] Token é removido da URL após processamento
- [ ] Sessão é estabelecida corretamente
- [ ] Cookies são sincronizados
- [ ] Não há exposição de tokens em logs

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| Token expirado antes do usuário acessar | Medium | Low | Mostrar mensagem clara e botão para solicitar novo link |
| Race condition entre onAuthStateChange e getSession | Low | Medium | Usar ambos com fallback |
| Usuário com sessão ativa de outro usuário | Low | High | Verificar se sessão é do tipo recovery |

### Dependencies
- **Supabase Auth:** Depende do correto funcionamento do `onAuthStateChange`
- **Edge Function:** `resend-invite` deve enviar email corretamente

## Rollback Plan

### Rollback Triggers
- Usuários não conseguem redefinir senha
- Erros de autenticação em produção
- Exposição de tokens de segurança

### Rollback Procedures
1. Reverter commit do `new-password-form.tsx`
2. Restaurar versão anterior do componente
3. Notificar usuários afetados

## Evidence & Follow-up
- [x] Logs do Supabase Auth mostrando eventos PASSWORD_RECOVERY (Console logs implementados)
- [x] Screenshot do fluxo funcionando (Testado em localhost:3000/redefinir-senha)
- [ ] Teste com usuário real
- [ ] PR com código corrigido
- [x] Commit: `fix(auth): usar onAuthStateChange para processar token de recovery`

## Implementação Realizada (2024-12-23)

### Mudanças no `new-password-form.tsx`:
1. **Removido server action** - Substituído por handler no cliente
2. **Adicionado `onAuthStateChange`** - Escuta evento `PASSWORD_RECOVERY` do Supabase
3. **Fallbacks implementados**:
   - Verificação de sessão existente
   - Processamento manual de hash com `setSession`
   - Timeout de 3s para mostrar erro se token não for processado
4. **Limpeza de URL** - Hash removido após processamento por segurança
5. **Tratamento de erros melhorado** - Mensagens específicas para cada tipo de erro

<!-- agent-update:end -->
