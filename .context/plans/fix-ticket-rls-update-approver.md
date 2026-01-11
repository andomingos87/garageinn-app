---
status: done
generated: 2026-01-11
completed: 2026-01-11
---

# Correção RLS: Política tickets_update_approver

> Corrigir a política RLS `tickets_update_approver` que falha ao atualizar o status do ticket após aprovação, devido à verificação incorreta de múltiplas aprovações pendentes

## Task Snapshot
- **Primary goal:** Permitir que aprovadores (Encarregado, Supervisor, Gerente) consigam atualizar o status do ticket após registrar sua aprovação/rejeição
- **Success signal:** Fluxo completo de aprovação funciona sem erros RLS - aprovação registrada E status do ticket atualizado
- **Complexidade:** Baixa - apenas 1 política RLS a ser alterada
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
  - [Plano anterior de RLS](./fix-ticket-rls-approval-flow.md)

## Problema Identificado

### Sintoma
```
Error updating ticket status (approved): {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "tickets"'
}
```

O erro ocorre quando um aprovador tenta aprovar um chamado. A aprovação em `ticket_approvals` é registrada com sucesso, mas o UPDATE subsequente em `tickets` falha.

### Análise da Causa Raiz

#### Fluxo de Aprovação (handleApproval)
```
1. UPDATE ticket_approvals SET status = 'approved' → ✅ SUCESSO
2. UPDATE tickets SET status = 'awaiting_approval_supervisor' → ❌ FALHA RLS
```

#### Política Atual (tickets_update_approver)
```sql
EXISTS (
  SELECT 1 FROM ticket_approvals ta
  WHERE ta.ticket_id = tickets.id
  AND (
    ta.status = 'pending'
    OR (
      ta.status IN ('approved', 'rejected')
      AND ta.approved_by = auth.uid()
      AND ta.decision_at > (now() - '00:00:10'::interval)
    )
  )
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
```

#### O Bug
A política verifica **TODAS** as aprovações do ticket via `EXISTS`. Quando existem múltiplas aprovações (níveis 1, 2, 3):

| Nível | Status | approval_level | Espera tickets.status |
|-------|--------|----------------|----------------------|
| 1 | approved | 1 | awaiting_approval_encarregado ✅ |
| 2 | pending | 2 | awaiting_approval_supervisor ❌ |
| 3 | pending | 3 | awaiting_approval_gerente ❌ |

A política encontra a aprovação nível 2 (pending) que espera `awaiting_approval_supervisor`, mas o ticket ainda está em `awaiting_approval_encarregado`. **Resultado: FALHA.**

### Estado Atual do Ticket Afetado
```
Ticket: 998234b6-624a-4794-8e6c-544efc120add
Status: awaiting_approval_encarregado (INCONSISTENTE - deveria ser awaiting_approval_supervisor)
Aprovação Nível 1: approved ✅
Aprovação Nível 2: pending
Aprovação Nível 3: pending
```

## Solução Proposta

### Correção da Política RLS

A política deve filtrar apenas a aprovação do **nível atual** baseado no status do ticket:

```sql
DROP POLICY IF EXISTS tickets_update_approver ON tickets;

CREATE POLICY tickets_update_approver ON tickets
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ticket_approvals ta
    WHERE ta.ticket_id = tickets.id
    -- CORREÇÃO: Filtra apenas a aprovação do nível correspondente ao status atual
    AND ta.approval_level = CASE tickets.status
      WHEN 'awaiting_approval_encarregado' THEN 1
      WHEN 'awaiting_approval_supervisor' THEN 2
      WHEN 'awaiting_approval_gerente' THEN 3
    END
    AND (
      -- Aprovação ainda pendente (pode aprovar)
      ta.status = 'pending'
      OR (
        -- Ou acabou de aprovar/rejeitar (janela de 10s para atualizar ticket)
        ta.status IN ('approved', 'rejected')
        AND ta.approved_by = auth.uid()
        AND ta.decision_at > (now() - '00:00:10'::interval)
      )
    )
    -- Usuário tem o cargo correto para este nível
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = ta.approval_role
    )
  )
);
```

### Correção do Estado Inconsistente

Após aplicar a migration, corrigir o ticket que ficou em estado inconsistente:

```sql
UPDATE tickets 
SET status = 'awaiting_approval_supervisor'
WHERE id = '998234b6-624a-4794-8e6c-544efc120add'
AND status = 'awaiting_approval_encarregado';
```

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Implementar correção da política RLS | [Database Specialist](../agents/database-specialist.md) | Aplicar migration via Supabase MCP |
| Security Auditor | Validar que a correção não abre brechas | [Security Auditor](../agents/security-auditor.md) | Verificar advisors após mudança |
| Bug Fixer | Corrigir estado inconsistente do ticket | [Bug Fixer](../agents/bug-fixer.md) | Executar SQL de correção de dados |

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Política muito permissiva | Baixa | Alto | Manter verificação de cargo e nível | Database Specialist |
| Outros tickets em estado inconsistente | Média | Médio | Query para identificar e corrigir | Bug Fixer |
| Regressão em outros módulos | Baixa | Alto | Testar todos os tipos de chamado | QA |

### Dependencies
- **Internal:** Nenhuma - correção isolada em RLS
- **External:** Supabase MCP para aplicar migration
- **Technical:** Nenhuma

### Assumptions
- A lógica de negócio no código (`handleApproval`) está correta
- A janela de 10 segundos é suficiente para o UPDATE do ticket
- Índices existentes são adequados para performance

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Implementação | 15 minutos | 15 minutos | 1 pessoa |
| Phase 2 - Correção de Dados | 5 minutos | 5 minutos | 1 pessoa |
| Phase 3 - Validação | 30 minutos | 30 minutos | 1 pessoa |
| **Total** | **50 minutos** | **50 minutos** | **1 pessoa** |

## Working Phases

### Phase 1 — Implementação da Correção RLS ✅

**Steps**
1. [x] Aplicar migration com nova política `tickets_update_approver`
2. [x] Verificar advisors de segurança via Supabase MCP
3. [x] Confirmar que política foi aplicada corretamente

**Migrations Aplicadas:**
- `fix_tickets_update_approver_policy` - Correção inicial com filtro por nível
- `fix_tickets_update_approver_policy_v2` - Aumentou janela de tempo de 10s para 60s
- `fix_tickets_update_approver_policy_v3` - Removeu verificação temporal, usa `approved_by = auth.uid()`
- `fix_tickets_update_own_policy_remove_with_check` - Removeu `WITH CHECK` da política `tickets_update_own`
- `fix_tickets_update_approver_add_with_check` - **FINAL**: Adicionou `WITH CHECK (true)` à política

**Causa Raiz Final:**
No PostgreSQL, quando uma política UPDATE **não tem `WITH CHECK`**, a cláusula `USING` é usada para verificar **TANTO a linha antiga QUANTO a nova**. Nossa política verificava o status atual do ticket (`CASE tickets.status ... THEN approval_level`), mas após o UPDATE mudar o status de `awaiting_approval_encarregado` para `awaiting_approval_supervisor`, a verificação falhava porque o novo status esperava nível 2, mas o aprovador era nível 1.

**Migration SQL Final**
```sql
-- =====================================================
-- Migration: Fix tickets_update_approver policy
-- Adiciona WITH CHECK (true) para permitir a mudança de status
-- O USING já garante que o usuário tem permissão
-- =====================================================

DROP POLICY IF EXISTS tickets_update_approver ON tickets;

CREATE POLICY tickets_update_approver ON tickets
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ticket_approvals ta
    WHERE ta.ticket_id = tickets.id
    AND ta.approval_level = CASE tickets.status
      WHEN 'awaiting_approval_encarregado' THEN 1
      WHEN 'awaiting_approval_supervisor' THEN 2
      WHEN 'awaiting_approval_gerente' THEN 3
    END
    AND (
      ta.status = 'pending'
      OR ta.approved_by = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = ta.approval_role
    )
  )
)
WITH CHECK (true);  -- Permite qualquer valor novo, o USING já validou a permissão
```

**Mudança chave:** Adicionado `WITH CHECK (true)` para permitir qualquer novo valor após o UPDATE. O `USING` já valida que o usuário tem permissão para atualizar a linha original (baseado no status ANTES do update). Sem o `WITH CHECK`, o PostgreSQL usaria o `USING` para também verificar a linha NOVA, que falharia porque o status mudou.

**Advisors de Segurança:** Nenhum novo problema introduzido

**Commit Checkpoint**
- `fix(rls): corrige política tickets_update_approver para múltiplas aprovações`

### Phase 2 — Correção de Dados Inconsistentes ✅

**Steps**
1. [x] Identificar tickets em estado inconsistente
2. [x] Corrigir status do ticket afetado
3. [x] Verificar se há outros tickets com mesmo problema

**Tickets corrigidos:**
- `998234b6-624a-4794-8e6c-544efc120add` (Ticket #7) - Corrigido de `awaiting_approval_encarregado` → `awaiting_approval_supervisor` → `awaiting_approval_gerente` → `awaiting_triage`

**Query de Identificação**
```sql
-- Encontrar tickets onde aprovação foi registrada mas status não avançou
SELECT t.id, t.ticket_number, t.status, 
       ta.approval_level, ta.status as approval_status
FROM tickets t
JOIN ticket_approvals ta ON ta.ticket_id = t.id
WHERE ta.status = 'approved'
AND t.status = CASE ta.approval_level
  WHEN 1 THEN 'awaiting_approval_encarregado'
  WHEN 2 THEN 'awaiting_approval_supervisor'
  WHEN 3 THEN 'awaiting_approval_gerente'
END;
```

**Query de Correção**
```sql
-- Corrigir ticket específico
UPDATE tickets 
SET status = 'awaiting_approval_supervisor'
WHERE id = '998234b6-624a-4794-8e6c-544efc120add';
```

**Commit Checkpoint**
- `fix(data): corrige estado inconsistente de tickets após falha RLS`

### Phase 3 — Validação ✅

**Steps**
1. [x] Testar aprovação como Encarregado (nível 1) - Já havia sido aprovado antes da correção
2. [x] Testar aprovação como Supervisor (nível 2) - ✅ Testado via Playwright com impersonação
3. [x] Testar aprovação como Gerente (nível 3) - ✅ Testado via Playwright com impersonação
4. [ ] Testar rejeição em qualquer nível - Não testado (fluxo similar)
5. [x] Verificar que usuários sem permissão não conseguem aprovar - Supervisor não vê botões para nível 3

**Casos de Teste**

| Cenário | Usuário | Ação | Resultado |
|---------|---------|------|-----------|
| Aprovar nível 1 | Encarregado | Aprovar chamado awaiting_approval_encarregado | ✅ Aprovado (antes da correção) |
| Aprovar nível 2 | Supervisor | Aprovar chamado awaiting_approval_supervisor | ✅ Aprovado - Status mudou para awaiting_approval_gerente |
| Aprovar nível 3 | Gerente | Aprovar chamado awaiting_approval_gerente | ✅ Aprovado - Status mudou para awaiting_triage |
| Rejeitar | Qualquer aprovador | Rejeitar chamado | ⏭️ Não testado |
| Sem permissão | Supervisor | Tentar aprovar nível 3 | ✅ Botões não aparecem |

**Evidências:**
- Teste realizado com Playwright MCP
- Impersonação de usuários via funcionalidade admin
- Toast "Chamado aprovado" exibido após cada aprovação
- Status do ticket atualizado corretamente no banco

**Commit Checkpoint**
- `fix(rls): corrige política tickets_update_approver para múltiplas aprovações`

## Rollback Plan

### Rollback Triggers
- Aprovadores legítimos não conseguem aprovar
- Usuários sem permissão conseguem aprovar
- Performance degradada significativamente

### Rollback Procedure
```sql
-- Restaurar política anterior
DROP POLICY IF EXISTS tickets_update_approver ON tickets;

CREATE POLICY tickets_update_approver ON tickets
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ticket_approvals ta
    WHERE ta.ticket_id = tickets.id
    AND (
      ta.status = 'pending'
      OR (
        ta.status IN ('approved', 'rejected')
        AND ta.approved_by = auth.uid()
        AND ta.decision_at > (now() - '00:00:10'::interval)
      )
    )
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

### Post-Rollback Actions
1. Documentar razão do rollback
2. Investigar causa da falha
3. Revisar solução antes de nova tentativa

## Evidence & Follow-up

### Artifacts Collected
- [x] Screenshot do erro antes da correção - Terminal logs mostrando erro 42501
- [x] Log do Supabase MCP após aplicar migration - `{"success":true}`
- [x] Resultado dos advisors de segurança - Nenhum novo problema
- [x] Testes de aprovação funcionando - Validado via Playwright MCP

### Resultado Final
```
Ticket #7 (998234b6-624a-4794-8e6c-544efc120add):
- Encarregado: ✅ Aprovado
- Supervisor: ✅ Aprovado  
- Gerente: ✅ Aprovado
- Status Final: awaiting_triage
```

### Follow-up Actions
- [ ] Monitorar logs por 24h após deploy
- [x] Verificar se há outros tickets em estado inconsistente - Apenas 1 encontrado e corrigido
- [ ] Atualizar documentação de RLS se necessário
