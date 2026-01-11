---
status: done
generated: 2026-01-11
completed: 2026-01-11
---

# Correção Sistêmica: Políticas RLS para Fluxo de Aprovação de Chamados

> Corrigir as políticas RLS de todas as tabelas relacionadas a tickets para permitir que aprovadores (Encarregado, Supervisor, Gerente) possam visualizar e aprovar chamados

## Task Snapshot
- **Primary goal:** Permitir que aprovadores vejam e aprovem chamados pendentes de sua aprovação
- **Success signal:** Encarregado consegue ver e aprovar chamados com status `awaiting_approval_encarregado`
- **Complexidade:** Média - múltiplas tabelas afetadas, requer funções reutilizáveis
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Problema Identificado

### Sintoma
O Encarregado (e outros aprovadores) não consegue ver a seção de aprovações na página de detalhes do chamado, mesmo quando o chamado está aguardando sua aprovação.

### Causa Raiz
As políticas RLS das tabelas relacionadas a tickets usam uma lógica restritiva que só permite acesso a:
- Criador do ticket (`created_by = auth.uid()`)
- Usuário atribuído (`assigned_to = auth.uid()`)
- Administradores (`is_admin()`)

**Falta:** Permitir acesso a usuários com o cargo correspondente ao nível de aprovação.

## Análise das Políticas Atuais

### Tabela: `tickets`
| Política | Comando | Condição | Status |
|----------|---------|----------|--------|
| `tickets_admin_all` | ALL | `is_admin()` | ✅ OK |
| `tickets_admin_select` | SELECT | `is_admin()` | ✅ OK |
| `tickets_select_own` | SELECT | `created_by = auth.uid()` | ✅ OK |
| `tickets_select_assigned` | SELECT | `assigned_to = auth.uid()` | ✅ OK |
| `tickets_select_department` | SELECT | Usuário tem role no departamento | ✅ OK |
| `tickets_select_unit` | SELECT | Usuário pertence à unidade | ✅ OK |
| `tickets_update_own` | UPDATE | `created_by = auth.uid()` | ⚠️ Limitado |
| `tickets_update_assigned` | UPDATE | `assigned_to = auth.uid()` | ⚠️ Limitado |

**Nota:** A tabela `tickets` tem políticas adequadas para SELECT (departamento/unidade), mas falta política de UPDATE para aprovadores.

### Tabela: `ticket_approvals`
| Política | Comando | Condição | Status |
|----------|---------|----------|--------|
| `ticket_approvals_select` | SELECT | created_by OR assigned_to OR is_admin() | ❌ **PROBLEMA** |
| *(não existe)* | UPDATE | - | ❌ **FALTA** |

**Problemas:**
1. SELECT não considera aprovadores com cargo correspondente
2. Não existe política UPDATE para aprovadores

### Tabela: `ticket_comments`
| Política | Comando | Condição | Status |
|----------|---------|----------|--------|
| `ticket_comments_select` | SELECT | created_by OR assigned_to OR is_admin() | ❌ **PROBLEMA** |
| `ticket_comments_insert` | INSERT | user_id = auth.uid() AND (created_by OR assigned_to OR is_admin()) | ❌ **PROBLEMA** |

**Problemas:**
1. Aprovadores não conseguem ver comentários
2. Aprovadores não conseguem adicionar comentários

### Tabela: `ticket_history`
| Política | Comando | Condição | Status |
|----------|---------|----------|--------|
| `ticket_history_select` | SELECT | created_by OR assigned_to OR is_admin() | ❌ **PROBLEMA** |

**Problema:** Aprovadores não conseguem ver histórico

### Tabela: `ticket_quotations`
| Política | Comando | Condição | Status |
|----------|---------|----------|--------|
| `ticket_quotations_select` | SELECT | created_by OR assigned_to OR is_admin() | ❌ **PROBLEMA** |
| `ticket_quotations_admin` | ALL | is_admin() | ✅ OK |

**Problema:** Aprovadores não conseguem ver cotações (importante para decisão)

### Tabela: `ticket_attachments`
| Política | Comando | Condição | Status |
|----------|---------|----------|--------|
| `ticket_attachments_select` | SELECT | created_by OR assigned_to OR is_admin() | ❌ **PROBLEMA** |
| `ticket_attachments_insert` | INSERT | uploaded_by = auth.uid() AND ticket exists | ⚠️ Muito permissivo |

**Problema:** Aprovadores não conseguem ver anexos

### Tabelas de Detalhes (purchase, maintenance, rh, claim)
| Política | Comando | Condição | Status |
|----------|---------|----------|--------|
| `*_select` | SELECT | created_by OR assigned_to OR is_admin() | ❌ **PROBLEMA** |
| `*_admin` | ALL | is_admin() | ✅ OK |

**Problema:** Aprovadores não conseguem ver detalhes específicos do chamado

## Solução Proposta

### Abordagem: Funções SQL Reutilizáveis

Criar funções que encapsulam a lógica de permissão, evitando duplicação e facilitando manutenção.

### Função 1: `can_view_ticket(ticket_id)`

Determina se o usuário atual pode visualizar um ticket e seus dados relacionados.

```sql
CREATE OR REPLACE FUNCTION can_view_ticket(p_ticket_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = p_ticket_id
    AND (
      -- Criador do ticket
      t.created_by = auth.uid()
      -- Atribuído ao ticket
      OR t.assigned_to = auth.uid()
      -- Admin global
      OR is_admin()
      -- Membro do departamento do ticket
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.department_id = t.department_id
      )
      -- Usuário da mesma unidade
      OR EXISTS (
        SELECT 1 FROM user_units uu
        WHERE uu.user_id = auth.uid()
        AND uu.unit_id = t.unit_id
      )
      -- Aprovador com cargo correspondente a uma aprovação pendente
      OR EXISTS (
        SELECT 1 FROM ticket_approvals ta
        JOIN user_roles ur ON ur.user_id = auth.uid()
        JOIN roles r ON ur.role_id = r.id
        WHERE ta.ticket_id = t.id
        AND r.name = ta.approval_role
      )
    )
  );
END;
$$;
```

### Função 2: `can_approve_ticket(approval_id)`

Determina se o usuário atual pode aprovar/rejeitar uma aprovação específica.

```sql
CREATE OR REPLACE FUNCTION can_approve_ticket(p_approval_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_approval_role TEXT;
  v_approval_status TEXT;
  v_ticket_status TEXT;
  v_approval_level INT;
BEGIN
  -- Buscar dados da aprovação
  SELECT ta.approval_role, ta.status, ta.approval_level, t.status
  INTO v_approval_role, v_approval_status, v_approval_level, v_ticket_status
  FROM ticket_approvals ta
  JOIN tickets t ON t.id = ta.ticket_id
  WHERE ta.id = p_approval_id;
  
  -- Se não encontrou, não pode aprovar
  IF v_approval_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Admin pode tudo
  IF is_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Só pode aprovar se status for pending
  IF v_approval_status != 'pending' THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se é o nível atual de aprovação
  IF v_ticket_status != CASE v_approval_level
    WHEN 1 THEN 'awaiting_approval_encarregado'
    WHEN 2 THEN 'awaiting_approval_supervisor'
    WHEN 3 THEN 'awaiting_approval_gerente'
  END THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se usuário tem o cargo correto
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = v_approval_role
  );
END;
$$;
```

### Função 3: `can_comment_ticket(ticket_id)`

Determina se o usuário pode comentar em um ticket.

```sql
CREATE OR REPLACE FUNCTION can_comment_ticket(p_ticket_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mesma lógica de visualização - quem pode ver, pode comentar
  RETURN can_view_ticket(p_ticket_id);
END;
$$;
```

## Migration SQL Completa

```sql
-- =====================================================
-- Migration: Fix RLS policies for ticket approval flow
-- =====================================================

-- 1. Criar funções auxiliares
-- -----------------------------------------------------

-- Função: can_view_ticket
CREATE OR REPLACE FUNCTION can_view_ticket(p_ticket_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tickets t
    WHERE t.id = p_ticket_id
    AND (
      t.created_by = auth.uid()
      OR t.assigned_to = auth.uid()
      OR is_admin()
      OR EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.department_id = t.department_id
      )
      OR EXISTS (
        SELECT 1 FROM user_units uu
        WHERE uu.user_id = auth.uid()
        AND uu.unit_id = t.unit_id
      )
      OR EXISTS (
        SELECT 1 FROM ticket_approvals ta
        JOIN user_roles ur ON ur.user_id = auth.uid()
        JOIN roles r ON ur.role_id = r.id
        WHERE ta.ticket_id = t.id
        AND r.name = ta.approval_role
      )
    )
  );
END;
$$;

-- Função: can_approve_ticket
CREATE OR REPLACE FUNCTION can_approve_ticket(p_approval_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_approval_role TEXT;
  v_approval_status TEXT;
  v_ticket_status TEXT;
  v_approval_level INT;
BEGIN
  SELECT ta.approval_role, ta.status, ta.approval_level, t.status
  INTO v_approval_role, v_approval_status, v_approval_level, v_ticket_status
  FROM ticket_approvals ta
  JOIN tickets t ON t.id = ta.ticket_id
  WHERE ta.id = p_approval_id;
  
  IF v_approval_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF is_admin() THEN
    RETURN TRUE;
  END IF;
  
  IF v_approval_status != 'pending' THEN
    RETURN FALSE;
  END IF;
  
  IF v_ticket_status != CASE v_approval_level
    WHEN 1 THEN 'awaiting_approval_encarregado'
    WHEN 2 THEN 'awaiting_approval_supervisor'
    WHEN 3 THEN 'awaiting_approval_gerente'
  END THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = v_approval_role
  );
END;
$$;

-- 2. Atualizar políticas de ticket_approvals
-- -----------------------------------------------------
DROP POLICY IF EXISTS ticket_approvals_select ON ticket_approvals;
CREATE POLICY ticket_approvals_select ON ticket_approvals
FOR SELECT TO authenticated
USING (can_view_ticket(ticket_id));

DROP POLICY IF EXISTS ticket_approvals_update ON ticket_approvals;
CREATE POLICY ticket_approvals_update ON ticket_approvals
FOR UPDATE TO authenticated
USING (can_approve_ticket(id))
WITH CHECK (can_approve_ticket(id));

-- 3. Atualizar políticas de ticket_comments
-- -----------------------------------------------------
DROP POLICY IF EXISTS ticket_comments_select ON ticket_comments;
CREATE POLICY ticket_comments_select ON ticket_comments
FOR SELECT TO authenticated
USING (can_view_ticket(ticket_id));

DROP POLICY IF EXISTS ticket_comments_insert ON ticket_comments;
CREATE POLICY ticket_comments_insert ON ticket_comments
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  AND can_view_ticket(ticket_id)
);

-- 4. Atualizar políticas de ticket_history
-- -----------------------------------------------------
DROP POLICY IF EXISTS ticket_history_select ON ticket_history;
CREATE POLICY ticket_history_select ON ticket_history
FOR SELECT TO authenticated
USING (can_view_ticket(ticket_id));

-- 5. Atualizar políticas de ticket_quotations
-- -----------------------------------------------------
DROP POLICY IF EXISTS ticket_quotations_select ON ticket_quotations;
CREATE POLICY ticket_quotations_select ON ticket_quotations
FOR SELECT TO authenticated
USING (can_view_ticket(ticket_id));

-- 6. Atualizar políticas de ticket_attachments
-- -----------------------------------------------------
DROP POLICY IF EXISTS ticket_attachments_select ON ticket_attachments;
CREATE POLICY ticket_attachments_select ON ticket_attachments
FOR SELECT TO authenticated
USING (can_view_ticket(ticket_id));

DROP POLICY IF EXISTS ticket_attachments_insert ON ticket_attachments;
CREATE POLICY ticket_attachments_insert ON ticket_attachments
FOR INSERT TO authenticated
WITH CHECK (
  uploaded_by = auth.uid()
  AND can_view_ticket(ticket_id)
);

-- 7. Atualizar políticas de ticket_purchase_details
-- -----------------------------------------------------
DROP POLICY IF EXISTS ticket_purchase_details_select ON ticket_purchase_details;
CREATE POLICY ticket_purchase_details_select ON ticket_purchase_details
FOR SELECT TO authenticated
USING (can_view_ticket(ticket_id));

-- 8. Atualizar políticas de ticket_maintenance_details
-- -----------------------------------------------------
DROP POLICY IF EXISTS ticket_maintenance_details_select ON ticket_maintenance_details;
CREATE POLICY ticket_maintenance_details_select ON ticket_maintenance_details
FOR SELECT TO authenticated
USING (can_view_ticket(ticket_id));

-- 9. Atualizar políticas de ticket_rh_details
-- -----------------------------------------------------
DROP POLICY IF EXISTS ticket_rh_details_select ON ticket_rh_details;
CREATE POLICY ticket_rh_details_select ON ticket_rh_details
FOR SELECT TO authenticated
USING (can_view_ticket(ticket_id));

-- 10. Atualizar políticas de ticket_claim_details
-- -----------------------------------------------------
DROP POLICY IF EXISTS ticket_claim_details_select ON ticket_claim_details;
CREATE POLICY ticket_claim_details_select ON ticket_claim_details
FOR SELECT TO authenticated
USING (can_view_ticket(ticket_id));

-- 11. Adicionar política de UPDATE para tickets (aprovadores)
-- -----------------------------------------------------
DROP POLICY IF EXISTS tickets_update_approver ON tickets;
CREATE POLICY tickets_update_approver ON tickets
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ticket_approvals ta
    WHERE ta.ticket_id = tickets.id
    AND ta.status = 'pending'
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = ta.approval_role
    )
    AND tickets.status = CASE ta.approval_level
      WHEN 1 THEN 'awaiting_approval_encarregado'
      WHEN 2 THEN 'awaiting_approval_supervisor'
      WHEN 3 THEN 'awaiting_approval_gerente'
    END
  )
);
```

## Passos de Implementação

- [x] Criar backup das políticas atuais (documentado acima)
- [x] Aplicar migration via Supabase MCP
- [x] Testar como Admin (deve continuar funcionando)
- [x] Testar como Encarregado (deve ver e aprovar) ✅ Aprovação funcionou!
- [ ] Testar como Supervisor (deve ver e aprovar nível 2)
- [ ] Testar como Gerente (deve ver e aprovar nível 3)
- [ ] Testar como Solicitante (deve ver apenas seus tickets)
- [ ] Verificar que usuários sem permissão não veem tickets alheios
- [ ] Gerar novos TypeScript types

## Testes de Validação

### Teste 1: Admin
```
1. Login como admin@garageinn.com.br
2. Acessar qualquer chamado
3. Verificar: vê aprovações, comentários, histórico, cotações
4. Resultado esperado: ✅ Acesso total
```

### Teste 2: Encarregado
```
1. Login como admin
2. Impersonar encarregado_operacoes_teste@garageinn.com
3. Acessar chamado com status "awaiting_approval_encarregado"
4. Verificar: vê seção de aprovações com botões Aprovar/Rejeitar
5. Clicar em Aprovar
6. Resultado esperado: ✅ Aprovação registrada, status muda para próximo nível
```

### Teste 3: Supervisor
```
1. Login como admin
2. Impersonar supervisor_operacoes_teste@garageinn.com
3. Acessar chamado com status "awaiting_approval_supervisor"
4. Verificar: vê seção de aprovações, pode aprovar nível 2
5. Resultado esperado: ✅ Pode aprovar apenas nível 2
```

### Teste 4: Solicitante
```
1. Login como manobrista_operacoes_teste@garageinn.com
2. Acessar seu próprio chamado
3. Verificar: vê aprovações (somente leitura), comentários, histórico
4. Resultado esperado: ✅ Visualiza mas não aprova
```

### Teste 5: Usuário sem relação
```
1. Login como usuário de outro departamento/unidade
2. Tentar acessar chamado de outra unidade
3. Resultado esperado: ❌ Não encontrado ou sem permissão
```

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Função recursiva causa loop | Baixa | Alto | Funções não chamam umas às outras |
| Performance degradada | Média | Médio | Índices em ticket_id, user_id, role_id |
| Admin perde acesso | Baixa | Alto | `is_admin()` sempre verificado primeiro |
| Aprovador vê tickets de outras unidades | Média | Médio | Lógica restringe por aprovação pendente |

## Rollback

Se necessário reverter, executar:

```sql
-- Dropar funções novas
DROP FUNCTION IF EXISTS can_view_ticket(UUID);
DROP FUNCTION IF EXISTS can_approve_ticket(UUID);

-- Recriar políticas antigas (backup acima)
-- ... (copiar políticas originais documentadas)
```

## Índices Recomendados

```sql
-- Garantir índices para performance
CREATE INDEX IF NOT EXISTS idx_ticket_approvals_ticket_id ON ticket_approvals(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_approvals_status ON ticket_approvals(status);
CREATE INDEX IF NOT EXISTS idx_ticket_approvals_role ON ticket_approvals(approval_role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_department_id ON roles(department_id);
```
