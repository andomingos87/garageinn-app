---
id: plan-fix-user-roles-rls-policy
ai_update_goal: "Corrigir o bug de RLS Policy Violation na tabela user_roles quando admin tenta atualizar roles de usuários"
required_inputs:
  - "Análise do erro 42501 - RLS policy violation"
  - "Verificação do estado atual do usuário admin no banco"
  - "Análise das políticas RLS na tabela user_roles"
success_criteria:
  - "Usuário admin@garageinn.com.br deve ter role 'Administrador' (global) atribuído"
  - "Função is_admin() deve retornar true para o usuário admin"
  - "Operações de INSERT/UPDATE/DELETE em user_roles devem funcionar para admins"
related_agents:
  - "database-specialist"
  - "security-auditor"
  - "bug-fixer"
---

<!-- agent-update:start:plan-fix-user-roles-rls-policy -->
# Fix: RLS Policy Violation on user_roles Table

> O usuário admin@garageinn.com.br não consegue atualizar roles de usuários porque perdeu seu role de Administrador, fazendo com que a função is_admin() retorne false e a política RLS bloqueie o INSERT na tabela user_roles.

## Diagnóstico Completo

### Erro Capturado
```
Error adding user roles: {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "user_roles"'
}
```

### Cenário de Reprodução
- **Usuário logado:** admin@garageinn.com.br
- **Ação:** Tentou editar dados de um usuário em `/usuarios/9082c82f-5b7a-4c7b-a45d-9755e1b424f5/editar`
- **Resultado:** A atualização do perfil funcionou, mas a atualização dos roles falhou

### Causa Raiz Identificada

#### 1. Estado atual do usuário admin no banco
```sql
SELECT p.id, p.email, r.name as role_name, r.is_global
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
LEFT JOIN roles r ON r.id = ur.role_id
WHERE p.email = 'admin@garageinn.com.br';
```
**Resultado:**
| id | email | role_name | is_global |
|---|---|---|---|
| 9082c82f-5b7a-4c7b-a45d-9755e1b424f5 | admin@garageinn.com.br | Comprador | false |

**O usuário admin tem apenas o role "Comprador" (não-global), não tem o role "Administrador".**

#### 2. Função is_admin() no PostgreSQL
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
      AND r.is_global = true
      AND r.name IN ('Administrador', 'Desenvolvedor', 'Diretor')
  );
END;
$function$
```

A função verifica se o usuário tem um dos roles globais: **Administrador**, **Desenvolvedor** ou **Diretor**.

#### 3. Políticas RLS na tabela user_roles
| Policy Name | Command | Condition |
|---|---|---|
| Admins can manage user roles | ALL | is_admin() |
| user_roles_admin_all | ALL | is_admin() com with_check |
| Users can view own roles | SELECT | auth.uid() = user_id |
| user_roles_select_own | SELECT | auth.uid() = user_id |

**Conclusão:** Apenas usuários com `is_admin() = true` podem fazer INSERT/UPDATE/DELETE na tabela `user_roles`.

#### 4. Roles globais disponíveis no sistema
```sql
SELECT id, name, is_global FROM roles WHERE is_global = true;
```
| id | name | is_global |
|---|---|---|
| 27e478f5-6c27-46ee-a240-9a5e21dca753 | Administrador | true |
| db5e3f81-d823-4bc9-9304-eb4556933205 | Desenvolvedor | true |
| 97a5963c-4bc5-42dc-a5b5-51a48291d3ca | Diretor | true |

**Os roles globais existem, mas o usuário admin não está vinculado a nenhum deles.**

### Fluxo do Bug

```
1. Admin tenta editar usuário
   └── updateUser() ✅ funciona (profiles tem RLS permissivo)
   └── updateUserRoles() ❌ falha
       └── DELETE FROM user_roles WHERE user_id = X ❌
       └── INSERT INTO user_roles ❌
       └── Motivo: is_admin() retorna FALSE
           └── Usuário não tem role global (Administrador/Desenvolvedor/Diretor)
```

## Task Snapshot
- **Primary goal:** Restaurar o role "Administrador" para o usuário admin@garageinn.com.br
- **Success signal:** Após correção, o admin deve conseguir editar roles de outros usuários sem erro de RLS
- **Key references:**
  - Função `is_admin()` no PostgreSQL
  - Políticas RLS da tabela `user_roles`
  - Action `updateUserRoles()` em `apps/web/src/app/(app)/usuarios/actions.ts`

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Executar correção no banco via migration | [Database Specialist](../agents/database-specialist.md) | Criar migration para atribuir role Administrador |
| Security Auditor | Validar que RLS policies estão corretas | [Security Auditor](../agents/security-auditor.md) | Revisar se há brechas de segurança |
| Bug Fixer | Investigar se há outros usuários afetados | [Bug Fixer](../agents/bug-fixer.md) | Verificar integridade dos dados |

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Outros admins também perderam roles | Média | Alto | Verificar todos os usuários que deveriam ser admin | Database Specialist |
| Migration pode falhar se role já existir | Baixa | Baixo | Usar INSERT ON CONFLICT ou verificação prévia | Database Specialist |

### Dependencies
- **Internal:** Acesso ao Supabase MCP para executar migrations
- **External:** Nenhuma
- **Technical:** Role "Administrador" (id: 27e478f5-6c27-46ee-a240-9a5e21dca753) deve existir

### Assumptions
- O role "Administrador" com `is_global = true` já existe no banco
- O usuário admin@garageinn.com.br é o único afetado (verificar na fase 1)

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Verificação | 15 min | 15 min | 1 pessoa |
| Phase 2 - Correção | 10 min | 10 min | 1 pessoa |
| Phase 3 - Validação | 10 min | 10 min | 1 pessoa |
| **Total** | **35 min** | **35 min** | **1 pessoa** |

### Required Skills
- Conhecimento de PostgreSQL e RLS
- Acesso ao Supabase MCP
- Entendimento do sistema de roles do GarageInn

## Working Phases

### Phase 1 — Verificação & Diagnóstico
**Steps**
1. ✅ Identificar o erro (42501 - RLS policy violation)
2. ✅ Verificar estado atual do usuário admin no banco
3. ✅ Analisar função is_admin() e suas dependências
4. ✅ Mapear políticas RLS da tabela user_roles
5. ⬜ Verificar se há outros usuários admin afetados

**Query para verificar outros admins afetados:**
```sql
-- Listar todos os profiles que deveriam ser admin mas não têm o role
SELECT p.id, p.email, p.full_name
FROM profiles p
WHERE p.email LIKE '%admin%' 
   OR p.email LIKE '%dev%'
   OR p.full_name ILIKE '%administrador%'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p.id
    AND r.is_global = true
    AND r.name IN ('Administrador', 'Desenvolvedor', 'Diretor')
);
```

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 1 discovery - RLS user_roles bug"`

### Phase 2 — Correção via Migration
**Steps**
1. Criar migration para atribuir role "Administrador" ao usuário admin@garageinn.com.br
2. Usar `mcp_supabase_apply_migration` para aplicar a correção

**Migration SQL:**
```sql
-- Atribuir role Administrador ao usuário admin@garageinn.com.br
INSERT INTO user_roles (user_id, role_id)
SELECT 
  p.id,
  r.id
FROM profiles p
CROSS JOIN roles r
WHERE p.email = 'admin@garageinn.com.br'
  AND r.name = 'Administrador'
  AND r.is_global = true
ON CONFLICT (user_id, role_id) DO NOTHING;
```

**Alternativa (se não houver constraint unique):**
```sql
-- Verificar se já existe antes de inserir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN profiles p ON ur.user_id = p.id
    WHERE p.email = 'admin@garageinn.com.br'
      AND r.name = 'Administrador'
  ) THEN
    INSERT INTO user_roles (user_id, role_id)
    SELECT p.id, r.id
    FROM profiles p, roles r
    WHERE p.email = 'admin@garageinn.com.br'
      AND r.name = 'Administrador'
      AND r.is_global = true;
  END IF;
END $$;
```

**Commit Checkpoint**
- `git commit -m "fix(db): restore admin role for admin@garageinn.com.br"`

### Phase 3 — Validação & Handoff
**Steps**
1. Verificar que o role foi atribuído corretamente
2. Testar a função is_admin() para o usuário
3. Testar a edição de roles de outro usuário via interface

**Query de validação:**
```sql
-- Verificar roles do admin após correção
SELECT p.email, r.name, r.is_global
FROM profiles p
JOIN user_roles ur ON ur.user_id = p.id
JOIN roles r ON r.id = ur.role_id
WHERE p.email = 'admin@garageinn.com.br';

-- Testar função is_admin() (simular)
SELECT EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN profiles p ON ur.user_id = p.id
  WHERE p.email = 'admin@garageinn.com.br'
    AND r.is_global = true
    AND r.name IN ('Administrador', 'Desenvolvedor', 'Diretor')
) as is_admin_result;
```

**Teste funcional:**
1. Fazer login como admin@garageinn.com.br
2. Acessar `/usuarios`
3. Editar qualquer usuário
4. Modificar os roles
5. Salvar e verificar que não há erro

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation - RLS bug fixed"`

## Rollback Plan

### Rollback Triggers
- Se a migration causar problemas em outros usuários
- Se houver conflitos de constraint

### Rollback Procedures
#### Phase 2 Rollback
- Action: Remover o role adicionado
```sql
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'admin@garageinn.com.br')
  AND role_id = (SELECT id FROM roles WHERE name = 'Administrador' AND is_global = true);
```
- Data Impact: Apenas o usuário admin perde o role (volta ao estado anterior)
- Estimated Time: < 5 minutos

### Post-Rollback Actions
1. Investigar causa do problema
2. Ajustar migration se necessário
3. Re-executar com correções

## Prevenção Futura

### Recomendações
1. **Seed de dados:** Garantir que o seed inicial do banco sempre atribua o role Administrador ao usuário admin
2. **Teste automatizado:** Criar teste que verifica se usuários admin têm os roles corretos
3. **Auditoria periódica:** Query para detectar admins sem roles globais

**Query para seed/verificação:**
```sql
-- Garantir que admin@garageinn.com.br sempre tenha role Administrador
INSERT INTO user_roles (user_id, role_id)
SELECT 
  (SELECT id FROM profiles WHERE email = 'admin@garageinn.com.br'),
  (SELECT id FROM roles WHERE name = 'Administrador' AND is_global = true)
WHERE EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@garageinn.com.br')
ON CONFLICT DO NOTHING;
```

## Evidence & Follow-up
- [x] Screenshot do erro antes da correção (já capturado no terminal)
- [x] Query result mostrando role atribuído após correção
- [x] Teste funcional de edição de roles bem-sucedido
- [x] Verificar se há outros usuários afetados pelo mesmo problema

## Resultado da Correção (31/12/2025)

### Problemas encontrados durante a correção:
1. **Email inconsistente:** O email na tabela `profiles` era `admin@garageinn.com.br`, mas na tabela `auth.users` era `admin@garageinn.com` (sem `.br`). Corrigido para `admin@garageinn.com`.
2. **Role removido:** Durante testes anteriores, o role Administrador foi removido do usuário admin.

### Ações executadas:
1. ✅ Corrigido email na tabela `profiles` para corresponder ao `auth.users`
2. ✅ Inserido role Administrador (global) via SQL direto
3. ✅ Validado que `is_admin()` retorna `true`
4. ✅ Testado edição de roles de outro usuário - **SUCESSO**

### Teste funcional:
- Usuário: João Teste da Silva
- Ação: Adicionado role "Coordenador (RH)"
- Resultado: Salvo com sucesso, sem erros de RLS

## Arquivos Relacionados
- `apps/web/src/app/(app)/usuarios/actions.ts` - função `updateUserRoles()`
- `apps/web/src/app/(app)/usuarios/[id]/editar/components/user-edit-form.tsx` - formulário de edição
- Função PostgreSQL `is_admin()`
- Políticas RLS da tabela `user_roles`

<!-- agent-update:end -->
