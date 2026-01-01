# Build Errors - 31/12/2024

## Resumo
- **Data:** 31/12/2024
- **Comando:** `npm run build`
- **Diretório:** `apps/web`
- **Status:** ❌ Build falhou
- **Exit Code:** 1

---

## Erro Principal

### 1. Playwright Module Not Found

**Arquivo:** `playwright.config.ts`  
**Linha:** 1  
**Tipo:** TypeScript Error

```
./playwright.config.ts:1:39
Type error: Cannot find module '@playwright/test' or its corresponding type declarations.

> 1 | import { defineConfig, devices } from '@playwright/test'
    |                                       ^
  2 |
  3 | /**
  4 |  * Configuração do Playwright para testes E2E
```

**Causa:** O arquivo `playwright.config.ts` está na raiz do projeto `apps/web` e é incluído na verificação de tipos do Next.js durante o build. O pacote `@playwright/test` não está instalado como dependência do projeto, ou está listado apenas como devDependency e não está disponível no ambiente de build.

---

## Warnings Observados

### 1. Middleware Deprecation Warning

```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. 
Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

**Descrição:** O Next.js 16.1.1 está alertando que a convenção de arquivo `middleware.ts` está depreciada e deve ser substituída por `proxy`.

**Arquivo afetado:** `src/middleware.ts`

---

## Ambiente

- **Next.js Version:** 16.1.1 (Turbopack)
- **Node.js:** (verificar versão)
- **Build Engine:** Turbopack

---

## Possíveis Soluções (NÃO IMPLEMENTADAS)

1. **Para o erro do Playwright:**
   - Excluir `playwright.config.ts` do TypeScript check no `tsconfig.json`
   - Ou instalar `@playwright/test` como dependência
   - Ou mover o arquivo para fora do escopo de build

2. **Para o warning do middleware:**
   - Migrar de `middleware.ts` para a nova convenção `proxy`
   - Consultar documentação: https://nextjs.org/docs/messages/middleware-to-proxy

---

## Logs Completos

```
> web@0.1.0 build
> next build

▲ Next.js 16.1.1 (Turbopack)
- Environments: .env.local

⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
  Creating an optimized production build ...
✓ Compiled successfully in 13.7s
  Running TypeScript ...
Failed to compile.

./playwright.config.ts:1:39
Type error: Cannot find module '@playwright/test' or its corresponding type declarations.

> 1 | import { defineConfig, devices } from '@playwright/test'
    |                                       ^
  2 |
  3 | /**
  4 |  * Configuração do Playwright para testes E2E
Next.js build worker exited with code: 1 and signal: null
```

---

## Status
- [x] Erro corrigido (31/12/2024)
- [x] Warning resolvido (31/12/2024)
- [x] Documentado

## Correções Aplicadas

**Data:** 31/12/2024

### Correção 1: Playwright Module Not Found

**Solução:** Instalado `@playwright/test` como devDependency:

```bash
npm install --save-dev @playwright/test
```

### Correção 2: Middleware Deprecation Warning

**Solução:** Migrado `src/middleware.ts` para `src/proxy.ts` seguindo a nova convenção do Next.js 16:

- Renomeado arquivo de `middleware.ts` para `proxy.ts`
- Renomeada função exportada de `middleware` para `proxy`
- Mantida toda a lógica de autenticação e proteção de rotas

**Resultado:** Build executa com sucesso (exit code 0) sem erros e sem warnings.

