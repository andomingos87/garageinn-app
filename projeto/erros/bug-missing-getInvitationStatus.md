# Bug: Export getInvitationStatus não existe no módulo database.types

## Informações do Erro

- **Data de Identificação:** 2024-12-31
- **Tipo:** Build Error
- **Severidade:** Bloqueante (impede build da aplicação)
- **Versão Next.js:** 16.1.1 (Turbopack)

## Mensagem de Erro

```
Export getInvitationStatus doesn't exist in target module

./src/app/(app)/usuarios/actions.ts:6:1
Export getInvitationStatus doesn't exist in target module
  4 | import { revalidatePath } from 'next/cache'
  5 | import type { UserWithRoles, UserRoleInfo, UserStatus, UserUnitInfo, AuditLog, InvitationStatus } from '@/lib/supabase/database.types'
> 6 | import { getInvitationStatus } from '@/lib/supabase/database.types'
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The export getInvitationStatus was not found in module [project]/src/lib/supabase/database.types.ts [app-rsc] (ecmascript).
The module has no exports at all.
All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.
```

## Arquivos Afetados

1. `apps/web/src/app/(app)/usuarios/actions.ts` - linha 6
2. `apps/web/src/app/(app)/usuarios/[id]/page.tsx` - linha 22
3. `apps/web/src/app/(app)/usuarios/components/users-table.tsx` - linha 31

## Causa Raiz

O arquivo `apps/web/src/lib/supabase/database.types.ts` é **gerado automaticamente** pelo Supabase CLI (via `mcp_supabase_generate_typescript_types`). Esse arquivo contém apenas os tipos inferidos do schema do banco de dados.

Os seguintes tipos e funções customizados estavam sendo importados desse arquivo, mas **nunca foram definidos nele**:

### Tipos Customizados Ausentes
- `UserWithRoles` - tipo composto para usuário com seus cargos
- `UserRoleInfo` - informações do cargo do usuário
- `UserStatus` - enum de status do usuário ('active' | 'pending' | 'inactive')
- `UserUnitInfo` - informações de unidade do usuário
- `AuditLog` - log de auditoria
- `InvitationStatus` - status do convite ('pending' | 'sent' | 'expired' | 'accepted')

### Função Ausente
- `getInvitationStatus(user: UserWithRoles): InvitationStatus` - função utilitária que calcula o status do convite baseado nos campos `invitation_sent_at`, `invitation_expires_at` e `status` do usuário

## Análise Técnica

1. O arquivo `database.types.ts` é gerado pelo Supabase e **não deve ser editado manualmente**
2. Os tipos customizados e funções utilitárias devem ser definidos em um arquivo separado
3. Provavelmente esses tipos foram adicionados manualmente ao arquivo em algum momento e perdidos após regeneração dos tipos

## Solução Recomendada

Criar um arquivo separado para tipos customizados da aplicação:

### 1. Criar arquivo `apps/web/src/lib/supabase/custom-types.ts`

```typescript
import type { Database } from './database.types'

// Tipo base do profile do banco
type Profile = Database['public']['Tables']['profiles']['Row']

// Status possíveis do usuário
export type UserStatus = 'active' | 'pending' | 'inactive'

// Status do convite
export type InvitationStatus = 'pending' | 'sent' | 'expired' | 'accepted'

// Informações do cargo do usuário
export interface UserRoleInfo {
  role_id: string
  role_name: string
  department_id: string | null
  department_name: string | null
  is_global: boolean
}

// Informações da unidade do usuário
export interface UserUnitInfo {
  id: string
  unit_id: string
  unit_name: string
  unit_code: string
  is_coverage: boolean
}

// Usuário com seus cargos e unidades
export interface UserWithRoles {
  id: string
  full_name: string
  email: string
  phone: string | null
  cpf: string | null
  avatar_url: string | null
  status: UserStatus
  created_at: string
  updated_at: string
  deleted_at: string | null
  invitation_sent_at: string | null
  invitation_expires_at: string | null
  roles: UserRoleInfo[]
  units?: UserUnitInfo[]
}

// Log de auditoria
export interface AuditLog {
  id: string
  entity_type: string
  entity_id: string
  action: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  user_id: string | null
  created_at: string | null
}

/**
 * Determina o status do convite de um usuário
 */
export function getInvitationStatus(user: UserWithRoles): InvitationStatus {
  // Se usuário já está ativo, convite foi aceito
  if (user.status === 'active') {
    return 'accepted'
  }

  // Se não tem data de envio, convite está pendente de envio
  if (!user.invitation_sent_at) {
    return 'pending'
  }

  // Se tem data de expiração e já passou, convite expirou
  if (user.invitation_expires_at) {
    const expiresAt = new Date(user.invitation_expires_at)
    if (expiresAt < new Date()) {
      return 'expired'
    }
  }

  // Convite foi enviado e ainda é válido
  return 'sent'
}
```

### 2. Atualizar o arquivo `apps/web/src/lib/supabase/index.ts`

```typescript
// Re-export Supabase clients for convenience
export { createClient as createClientComponentClient } from "./client";
export { createClient as createServerComponentClient } from "./server";
export { updateSession } from "./middleware";
export type * from "./database.types";
export * from "./custom-types";
```

### 3. Atualizar os imports nos arquivos afetados

Mudar de:
```typescript
import type { UserWithRoles, UserRoleInfo, UserStatus, UserUnitInfo, AuditLog, InvitationStatus } from '@/lib/supabase/database.types'
import { getInvitationStatus } from '@/lib/supabase/database.types'
```

Para:
```typescript
import type { UserWithRoles, UserRoleInfo, UserStatus, UserUnitInfo, AuditLog, InvitationStatus } from '@/lib/supabase/custom-types'
import { getInvitationStatus } from '@/lib/supabase/custom-types'
```

Ou usar o barrel export:
```typescript
import type { UserWithRoles, UserRoleInfo, UserStatus, UserUnitInfo, AuditLog, InvitationStatus } from '@/lib/supabase'
import { getInvitationStatus } from '@/lib/supabase'
```

## Prevenção Futura

1. **Nunca adicionar tipos customizados ao `database.types.ts`** - este arquivo é regenerado automaticamente
2. **Documentar tipos customizados** em arquivo separado
3. **Adicionar comentário no `database.types.ts`** indicando que é gerado automaticamente:
   ```typescript
   /**
    * Este arquivo é gerado automaticamente pelo Supabase CLI.
    * NÃO EDITE MANUALMENTE - suas alterações serão perdidas.
    * 
    * Para tipos customizados, use o arquivo custom-types.ts
    */
   ```

## Referências

- Arquivos que importam os tipos ausentes:
  - `apps/web/src/app/(app)/usuarios/actions.ts`
  - `apps/web/src/app/(app)/usuarios/[id]/page.tsx`
  - `apps/web/src/app/(app)/usuarios/[id]/components/user-status-actions.tsx`
  - `apps/web/src/app/(app)/usuarios/components/users-table.tsx`
  - `apps/web/src/app/(app)/usuarios/components/invitation-status-badge.tsx`
  - `apps/web/src/app/(app)/perfil/actions.ts`

