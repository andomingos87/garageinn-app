# Bugfix para Deploy na Vercel

> **Status**: ✅ Concluído  
> **Data**: 2025-01-23

## Objetivo

Corrigir todos os erros de TypeScript que estavam impedindo o build na Vercel.

## Problemas Identificados e Soluções

### 1. Erro de atribuição dinâmica em `SystemSettingsMap`

**Arquivo**: `apps/web/src/app/(app)/configuracoes/sistema/actions.ts`

**Erro**:
```
Type error: Type 'any' is not assignable to type 'never'.
```

**Causa**: O TypeScript não permite atribuição dinâmica em objetos tipados com propriedades heterogêneas (string, number, boolean, array).

**Solução**: Usar `Record<string, unknown>` temporariamente e fazer double cast no retorno:
```typescript
// Antes
const settings: SystemSettingsMap = { ...DEFAULT_SETTINGS }
settings[key] = setting.value as any  // ← Erro

// Depois
const settings = { ...DEFAULT_SETTINGS } as Record<string, unknown>
settings[key] = setting.value
return settings as unknown as SystemSettingsMap
```

### 2. Tipos customizados não exportados

**Arquivo**: `apps/web/src/lib/supabase/database.types.ts`

**Erro**:
```
Type error: Module '"@/lib/supabase/database.types"' has no exported member 'UserWithRoles'.
```

**Causa**: Os tipos `UserWithRoles`, `UserRoleInfo`, `UserStatus`, `UserUnitInfo`, `AuditLog`, `Unit`, `UnitWithStaffCount`, `UnitStatus`, `UnitStaffMember` eram usados em vários arquivos mas não estavam definidos no arquivo `database.types.ts`.

**Solução**: Adicionar todos os tipos customizados ao final do arquivo `database.types.ts`:

```typescript
// Custom Types adicionados:
export type UserStatus = 'active' | 'pending' | 'inactive'
export type UnitStatus = 'active' | 'inactive'
export interface UserRoleInfo { ... }
export interface UserUnitInfo { ... }
export interface UserWithRoles { ... }
export interface AuditLog { ... }
export interface Unit { ... }
export interface UnitStaffMember { ... }
export interface UnitWithStaffCount { ... }
```

### 3. Propriedades incorretas em `UnitStaffMember`

**Arquivo**: `apps/web/src/app/(app)/unidades/[id]/page.tsx`

**Erro**:
```
Type error: Property 'user_id' does not exist on type 'UnitStaffMember'.
```

**Causa**: O tipo `UnitStaffMember` foi definido com propriedades diferentes das usadas no código.

**Solução**: Atualizar a interface para corresponder ao uso real:
```typescript
export interface UnitStaffMember {
  user_id: string
  user_name: string
  user_email: string
  user_avatar: string | null
  is_coverage: boolean
  role_name: string | null
  department_name: string | null
}
```

## Arquivos Modificados

1. `apps/web/src/app/(app)/configuracoes/sistema/actions.ts`
2. `apps/web/src/lib/supabase/database.types.ts`

## Verificação

Build local passou com sucesso:
```
✓ Compiled successfully in 7.4s
✓ Generating static pages using 11 workers (31/31) in 828.8ms
```

## Lições Aprendidas

1. **Tipos customizados**: Sempre que criar tipos que serão usados em múltiplos arquivos, exportá-los de um local centralizado (como `database.types.ts`).

2. **TypeScript strictness**: O ambiente de build da Vercel pode ter configurações de TypeScript mais estritas que o ambiente local. Sempre rodar `npm run build` localmente antes de fazer push.

3. **Double cast**: Quando precisar fazer cast entre tipos incompatíveis, usar `as unknown as TargetType` para passar pela validação do TypeScript.

4. **Consistência de tipos**: Manter os tipos sincronizados com o uso real no código, especialmente para interfaces que representam dados de API.
