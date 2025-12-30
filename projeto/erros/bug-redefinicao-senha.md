# Erro no Fluxo de Redefinição de Senha

## Descrição do Problema
O usuário solicita a redefinição de senha, recebe o e-mail, mas ao clicar no botão "Redefinir minha senha", é redirecionado para a página de login (`/login`) em vez da página de redefinição de senha (`/redefinir-senha`).

## Diagnóstico Técnico

### 1. Fluxo Esperado (PKCE)
1. **Solicitação:** `requestPasswordReset` chama `supabase.auth.resetPasswordForEmail` com `redirectTo: /auth/callback?next=/redefinir-senha`.
2. **E-mail:** O usuário recebe um link que aponta para o Supabase Auth.
3. **Redirect Supabase:** O Supabase redireciona o usuário para `http://localhost:3000/auth/callback?next=/redefinir-senha&code=...`.
4. **Callback:** O arquivo `apps/web/src/app/auth/callback/route.ts` captura o `code`, troca por uma sessão e redireciona para `/redefinir-senha`.
5. **Página Final:** O usuário chega em `/redefinir-senha` com uma sessão ativa e define a nova senha.

### 2. Possíveis Causas do Redirecionamento para Login

#### A. Whitelist de Redirect no Supabase (Causa mais provável)
Se a URL `http://localhost:3000/auth/callback?next=/redefinir-senha` (ou similar em produção) não estiver na lista de **Redirect URLs** permitidas no Dashboard do Supabase (Authentication > URL Configuration), o Supabase ignora o parâmetro `redirectTo` e envia o usuário para a **Site URL** padrão configurada no dashboard.
*   Se a **Site URL** for `http://localhost:3000/`, o usuário cai na raiz do site.
*   A rota raiz (`/`) é protegida pelo middleware e, como a troca de código (`code`) ainda não aconteceu (porque o callback foi pulado), o middleware redireciona para `/login`.

#### B. Link de Fluxo Implícito (Hash vs Query Param)
Se o Supabase estiver configurado ou disparando um link de **Implicit Flow**, o token chega no fragmento de hash: `/auth/callback#access_token=...`.
*   O Route Handler (`route.ts`) não consegue ler o hash (fragmentos `#` não são enviados ao servidor).
*   A lógica no callback falha ao não encontrar o parâmetro `code`:
    ```typescript
    const code = searchParams.get("code");
    if (code) { ... }
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    ```
*   Isso resultaria em um redirecionamento para `/login?error=auth_failed`.

#### C. Inconsistência de Domínios
Se o `NEXT_PUBLIC_SITE_URL` estiver configurado como `http://localhost:3000` mas o usuário estiver testando via `http://127.0.0.1:3000`, os cookies de sessão definidos em um domínio não serão válidos no outro, e o middleware tratará o usuário como deslogado após o redirecionamento.

## Sugestões de Correção (Não implementadas conforme solicitação)
1. **Configuração do Supabase:** Adicionar a URL de callback completa (incluindo parâmetros se necessário, ou usar wildcard `**`) na lista de redirects permitidos.
2. **Fallback no Callback:** Se o callback for atingido sem `code`, verificar se há tokens no cliente (embora isso exija uma página de carregamento intermediária em vez de um Route Handler puro).
3. **Página de Redefinição Pública:** Garantir que `/redefinir-senha` seja tratada como pública no middleware para que, mesmo se a sessão demorar a ser reconhecida pelo servidor, o componente de cliente consiga processar o token. (Atualmente já está na lista `publicRoutes`, o que reforça que o erro ocorre *antes* de chegar na página).

---
**Status:** ✅ Corrigido
**Data:** 30 de Dezembro de 2025

## Solução Implementada

### Causa Raiz Identificada
O Supabase redireciona com tokens no **hash fragment** (`#access_token=...`) após verificar o link de recuperação. O hash fragment **não é enviado ao servidor**, então o Route Handler (`/auth/callback`) não conseguia processar os tokens.

O fluxo do Supabase funciona assim:
1. Usuário clica no link do email → vai para `supabase.co/auth/v1/verify`
2. Supabase verifica o token e redireciona para o `redirectTo` configurado
3. O redirect inclui tokens no **hash fragment**: `http://app.com/callback#access_token=...`
4. O servidor não vê o hash, então não consegue estabelecer a sessão

### Correções Aplicadas

#### 1. Server Action (`apps/web/src/app/(auth)/recuperar-senha/actions.ts`)
Alterado o `redirectTo` para ir diretamente para `/redefinir-senha`, onde o componente cliente (`NewPasswordForm`) já tem a lógica para processar o hash:
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  // Redireciona diretamente para a página de redefinição
  // O NewPasswordForm processa o hash fragment no cliente
  redirectTo: `${siteUrl}/redefinir-senha`,
});
```

#### 2. Callback Route Handler (`apps/web/src/app/auth/callback/route.ts`)
Mantido suporte para `token_hash` via query params (para templates customizados) e `code` (para OAuth/Magic Link).

#### 3. NewPasswordForm (`apps/web/src/app/(auth)/components/new-password-form.tsx`)
Já existia a lógica para:
- Escutar evento `PASSWORD_RECOVERY` via `onAuthStateChange`
- Processar tokens do hash fragment manualmente se necessário
- Chamar `supabase.auth.setSession()` para estabelecer a sessão

### Por que funciona agora
1. Email enviado com link para Supabase
2. Supabase verifica e redireciona para `/redefinir-senha#access_token=...`
3. `NewPasswordForm` (cliente) captura o hash e estabelece a sessão
4. Usuário define nova senha via `supabase.auth.updateUser()`

