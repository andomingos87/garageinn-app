# Erro no Módulo de Impersonação - Estado Persistente Após Logout/Login

## Descrição do Problema

Após realizar impersonação de um usuário e ser redirecionado para login (devido à perda de sessão), ao fazer login novamente como admin, o banner de impersonação continua sendo exibido mesmo que o usuário esteja logado como admin e não mais como o usuário impersonado.

### Passos para Reprodução

1. Usuário admin (`admin@garageinn.com`) faz login
2. Navega até `/usuarios`
3. Localiza o usuário `teste_manobrista_operacoes@garageinn.com`
4. No menu de ações, clica em "Personificar"
5. Modal de confirmação é exibido
6. Clica em "Entrar como usuário"
7. Notificação de sucesso aparece
8. É redirecionado para o dashboard com tarja amarela: "Você está visualizando como Teste Manobrista - Operações"
9. Clica em "Chamados" na Sidebar
10. **ERRO:** É redirecionado para a página de login
11. Faz login novamente com `admin@garageinn.com`
12. **ERRO:** A tarja amarela continua exibindo "Você está visualizando como Teste Manobrista - Operações"
13. **ERRO:** Mas agora está logado como `admin@garageinn.com` (não mais como o usuário impersonado)

## Diagnóstico Técnico

### 1. Fluxo Esperado de Impersonação

1. **Início da Impersonação:**
   - Admin clica em "Personificar" → `ImpersonateDialog.handleImpersonate()`
   - Chama `impersonateUser()` que:
     - Salva `originalUserId` no localStorage (`gapp_original_session`)
     - Salva estado de impersonação no localStorage (`gapp_impersonation`)
     - Retorna magic link da Edge Function
   - Redireciona para o magic link (`window.location.href = result.link`)

2. **Após Redirecionamento:**
   - Magic link estabelece sessão do usuário impersonado
   - `getImpersonationState()` lê do localStorage e retorna `isImpersonating: true`
   - Banner é exibido com nome do usuário impersonado

3. **Navegação Durante Impersonação:**
   - Usuário navega normalmente
   - Middleware (`proxy.ts`) verifica autenticação via cookies
   - Se sessão válida, permite acesso

4. **Fim da Impersonação:**
   - Admin clica em "Encerrar" → `exitImpersonation()`
   - Limpa localStorage (`clearImpersonationState()`)
   - Redireciona para `/` para restaurar sessão original

### 2. Fluxo Atual (Com Erro)

1. **Início da Impersonação:** ✅ Funciona corretamente
2. **Após Redirecionamento:** ✅ Funciona corretamente
3. **Navegação Durante Impersonação:**
   - Usuário navega para `/chamados`
   - **PROBLEMA:** Sessão do usuário impersonado expira ou não é válida
   - Middleware detecta `!user` e redireciona para `/login`
4. **Login Após Redirecionamento:**
   - Admin faz login normalmente
   - **PROBLEMA:** Estado de impersonação ainda está no localStorage
   - `getImpersonationState()` retorna `isImpersonating: true` mesmo que:
     - O usuário atual seja o admin (não o usuário impersonado)
     - A sessão original não corresponda mais ao estado salvo

### 3. Causa Raiz Identificada

O problema está na função `getImpersonationState()` em `apps/web/src/lib/auth/impersonation.ts`:

```typescript
export function getImpersonationState(): ImpersonationState {
  const originalUserId = localStorage.getItem(ORIGINAL_SESSION_KEY);
  const impersonationData = localStorage.getItem(IMPERSONATION_KEY);

  if (!originalUserId || !impersonationData) {
    return { isImpersonating: false };
  }

  try {
    const { impersonatedUserId, impersonatedUserName } = JSON.parse(impersonationData);
    return {
      isImpersonating: true,
      originalUserId,
      impersonatedUserId,
      impersonatedUserName,
    };
  } catch {
    return { isImpersonating: false };
  }
}
```

**Problemas:**

1. **Não valida o usuário atual:** A função verifica apenas se existem dados no localStorage, mas não valida se:
   - O usuário atual corresponde ao `impersonatedUserId` (deveria estar impersonando)
   - OU o usuário atual corresponde ao `originalUserId` (deveria estar como admin, mas com estado de impersonação ativo)

2. **Estado órfão:** Após logout/login, o localStorage mantém os dados de impersonação, mas a sessão atual não corresponde mais a nenhum dos IDs salvos.

3. **Falta de sincronização:** Não há verificação se a sessão atual do Supabase corresponde ao estado de impersonação salvo.

### 4. Arquivos Relacionados

#### Arquivos Principais

- **`apps/web/src/lib/auth/impersonation.ts`**
  - Funções: `getImpersonationState()`, `setImpersonationState()`, `clearImpersonationState()`
  - **Problema:** `getImpersonationState()` não valida contra sessão atual

- **`apps/web/src/hooks/use-impersonation.ts`**
  - Hook que usa `getImpersonationState()` no `useEffect`
  - **Problema:** Não revalida quando a sessão muda

- **`apps/web/src/components/layout/impersonation-banner.tsx`**
  - Componente que exibe o banner baseado em `useImpersonation()`
  - **Problema:** Exibe banner mesmo quando estado está inconsistente

- **`apps/web/src/lib/services/impersonation-service.ts`**
  - Função `impersonateUser()` que salva estado antes de redirecionar
  - **Status:** Funciona corretamente

- **`apps/web/src/app/(app)/usuarios/components/impersonate-dialog.tsx`**
  - Dialog que inicia a impersonação
  - **Status:** Funciona corretamente

- **`apps/web/src/proxy.ts`**
  - Middleware que verifica autenticação
  - **Status:** Funciona corretamente (redireciona quando não autenticado)

#### Fluxo de Autenticação

- **`apps/web/src/app/auth/callback/page.tsx`**
  - Processa callbacks de autenticação (incluindo magic links de impersonação)
  - **Status:** Funciona corretamente

- **`apps/web/src/hooks/use-auth.ts`**
  - Hook que gerencia estado de autenticação
  - **Observação:** Não integra com estado de impersonação

### 5. Hipóteses Adicionais

#### Hipótese 1: Expiração de Sessão do Usuário Impersonado
- **Causa:** Magic link pode gerar sessão com tempo de expiração curto
- **Evidência:** Redirecionamento para login ao acessar `/chamados`
- **Impacto:** Sessão expira antes do esperado, causando logout inesperado

#### Hipótese 2: Cookies Não Persistem Corretamente
- **Causa:** Cookies da sessão impersonada podem não estar sendo definidos corretamente
- **Evidência:** Middleware não encontra usuário autenticado após navegação
- **Impacto:** Perda de sessão durante navegação normal

#### Hipótese 3: Race Condition no Estado
- **Causa:** Estado de impersonação é salvo antes do redirecionamento, mas a sessão pode não ser estabelecida corretamente
- **Evidência:** Estado persiste mesmo após login como admin
- **Impacto:** Estado órfão no localStorage

### 6. Impacto

#### Severidade: **Média-Alta**

- **Funcional:** 
  - Usuário vê banner incorreto de impersonação
  - Pode causar confusão sobre qual usuário está logado
  - Pode afetar permissões e dados exibidos

- **Segurança:**
  - Estado inconsistente pode levar a exibição de dados incorretos
  - Não há risco direto de acesso não autorizado, mas pode confundir auditoria

- **UX:**
  - Experiência confusa para o admin
  - Requer limpeza manual do localStorage ou logout completo

### 7. Sugestões de Correção

#### Correção 1: Validar Estado Contra Sessão Atual (Recomendado)

Modificar `getImpersonationState()` para validar contra a sessão atual do Supabase:

```typescript
export async function getImpersonationState(): Promise<ImpersonationState> {
  if (typeof window === "undefined") {
    return { isImpersonating: false };
  }

  const originalUserId = localStorage.getItem(ORIGINAL_SESSION_KEY);
  const impersonationData = localStorage.getItem(IMPERSONATION_KEY);

  if (!originalUserId || !impersonationData) {
    return { isImpersonating: false };
  }

  // Validar contra sessão atual
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Sem sessão, limpar estado órfão
    clearImpersonationState();
    return { isImpersonating: false };
  }

  try {
    const { impersonatedUserId, impersonatedUserName } = JSON.parse(impersonationData);
    
    // Validar se usuário atual corresponde ao estado salvo
    const isCurrentlyImpersonating = user.id === impersonatedUserId;
    const isOriginalAdmin = user.id === originalUserId;

    if (!isCurrentlyImpersonating && !isOriginalAdmin) {
      // Estado órfão: usuário atual não corresponde a nenhum dos IDs salvos
      clearImpersonationState();
      return { isImpersonating: false };
    }

    return {
      isImpersonating: isCurrentlyImpersonating,
      originalUserId,
      impersonatedUserId,
      impersonatedUserName,
    };
  } catch {
    clearImpersonationState();
    return { isImpersonating: false };
  }
}
```

**Observação:** Isso tornaria a função assíncrona, exigindo ajustes em `use-impersonation.ts`.

#### Correção 2: Limpar Estado no Login (Alternativa Simples)

Adicionar limpeza de estado de impersonação no fluxo de login:

```typescript
// Em apps/web/src/app/(auth)/login/actions.ts ou similar
export async function signIn(formData: FormData) {
  // ... código de login existente ...
  
  // Limpar estado de impersonação órfão após login bem-sucedido
  if (typeof window !== "undefined") {
    const { clearImpersonationState } = await import("@/lib/auth/impersonation");
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

#### Correção 3: Validar Estado no Hook (Solução Híbrida)

Modificar `use-impersonation.ts` para validar estado quando a sessão muda:

```typescript
export function useImpersonation() {
  const [state, setState] = useState<ImpersonationState>({
    isImpersonating: false,
  });
  const { user } = useAuth(); // Adicionar dependência do hook de auth

  useEffect(() => {
    const validateState = async () => {
      const savedState = getImpersonationState();
      
      if (!savedState.isImpersonating || !user) {
        setState(savedState);
        return;
      }

      // Validar se usuário atual corresponde ao estado
      if (user.id !== savedState.impersonatedUserId && 
          user.id !== savedState.originalUserId) {
        // Estado órfão, limpar
        clearImpersonationState();
        setState({ isImpersonating: false });
        return;
      }

      setState({
        ...savedState,
        isImpersonating: user.id === savedState.impersonatedUserId,
      });
    };

    validateState();
  }, [user]); // Revalidar quando usuário muda

  // ... resto do código
}
```

#### Correção 4: Adicionar Timeout ao Estado (Prevenção)

Adicionar timestamp ao estado de impersonação e limpar automaticamente após período:

```typescript
interface ImpersonationData {
  impersonatedUserId: string;
  impersonatedUserName: string;
  timestamp: number; // Adicionar timestamp
}

export function setImpersonationState(state: {
  userId: string;
  userName: string;
}): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    IMPERSONATION_KEY,
    JSON.stringify({
      impersonatedUserId: state.userId,
      impersonatedUserName: state.userName,
      timestamp: Date.now(), // Salvar timestamp
    })
  );
}

export function getImpersonationState(): ImpersonationState {
  // ... código existente ...
  
  const { impersonatedUserId, impersonatedUserName, timestamp } = JSON.parse(impersonationData);
  
  // Limpar se estado for muito antigo (ex: 24 horas)
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas
  if (Date.now() - timestamp > MAX_AGE) {
    clearImpersonationState();
    return { isImpersonating: false };
  }
  
  // ... resto do código
}
```

### 8. Testes Recomendados

1. **Teste de Estado Órfão:**
   - Fazer impersonação
   - Fazer logout completo
   - Fazer login como admin
   - Verificar que banner não aparece

2. **Teste de Navegação Durante Impersonação:**
   - Fazer impersonação
   - Navegar entre páginas
   - Verificar que sessão não expira inesperadamente

3. **Teste de Expiração de Sessão:**
   - Fazer impersonação
   - Aguardar expiração natural da sessão
   - Verificar que estado é limpo automaticamente

4. **Teste de Restauração de Sessão:**
   - Fazer impersonação
   - Clicar em "Encerrar"
   - Verificar que volta para sessão de admin corretamente

---

**Status:** 🔴 Não Corrigido  
**Data de Identificação:** 31 de Dezembro de 2024  
**Prioridade:** Média-Alta  
**Módulo Afetado:** Impersonação / Personificação  
**Ambiente:** Web (`apps/web`)

