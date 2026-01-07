---
id: plan-revisao-rls-e-paginacao
ai_update_goal: "Define the stages, owners, and evidence required to complete Revisão de Políticas RLS e Paginação."
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
  - "database-specialist"
  - "security-auditor"
  - "frontend-specialist"
  - "test-writer"
---

<!-- agent-update:start:plan-revisao-rls-e-paginacao -->
# Revisão de Políticas RLS e Paginação

> Correção de bugs críticos identificados durante teste de impersonação: RLS bloqueando criação de chamados por usuários não-admin e paginação não resetando ao aplicar filtros.

## Task Snapshot
- **Primary goal:** Corrigir políticas RLS que impedem usuários não-admin de criar chamados em tabelas de detalhes específicos por departamento, e corrigir bug de paginação na listagem de usuários.
- **Success signal:** 
  1. Usuário manobrista (ou qualquer não-admin) consegue criar chamados de compras sem erro de RLS
  2. Filtro de departamento na tela de usuários exibe corretamente os resultados na página 1
- **Key references:**
  - [Plano de Chamados Compras](./chamados-compras.md) - Definição original das políticas RLS
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)

---

## Bugs Identificados

### Bug 1: RLS em `ticket_purchase_details` bloqueia INSERT para criadores de tickets

**Status:** ✅ **CORRIGIDO em 07/01/2026**

**Severidade:** CRÍTICO - Bloqueia funcionalidade core

**Cenário de Reprodução:**
1. Admin faz login (`admin@garageinn.com`)
2. Navega até `/usuarios`
3. Busca por "manobrista" e clica em "Personificar" no menu de ações
4. Confirma personificação - é redirecionado como usuário manobrista
5. Navega até Chamados > Novo Chamado > Compras
6. Preenche o formulário e clica em "Criar Chamado"

**Erro Exibido:**
```
new row violates row-level security policy for table "ticket_purchase_details"
```

**Análise Técnica:**

A política RLS atual para INSERT em `ticket_purchase_details`:

```sql
CREATE POLICY "Admins and department can manage purchase details" 
ON public.ticket_purchase_details
FOR ALL USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM public.tickets t
    JOIN public.user_roles ur ON ur.user_id = auth.uid()
    JOIN public.roles r ON r.id = ur.role_id
    WHERE t.id = ticket_id
    AND r.department_id = t.department_id
  )
);
```

**Problema:** Esta política permite INSERT apenas para:
- Admins (`is_admin()`)
- Usuários com cargo no mesmo departamento do ticket (ex: usuários do depto Compras)

**Porém:** Um manobrista do departamento de Operações:
- Não é admin
- Não tem cargo no departamento de Compras

**Resultado:** O INSERT na tabela `ticket_purchase_details` é bloqueado, mesmo que o ticket tenha sido criado com sucesso na tabela `tickets`.

**Código Afetado:** `apps/web/src/app/(app)/chamados/compras/actions.ts` linhas 302-337

```typescript
// Criar ticket - FUNCIONA (policy permite created_by = auth.uid())
const { data: ticket, error: ticketError } = await supabase
  .from('tickets')
  .insert({ ...ticketData, created_by: user.id })
  
// Criar detalhes de compra - FALHA (policy não permite criador do ticket)
const { error: detailsError } = await supabase
  .from('ticket_purchase_details')
  .insert({ ticket_id: ticket.id, item_name, quantity, ... })
```

**Solução Proposta:**

Criar uma política específica para INSERT que permita ao criador do ticket inserir os detalhes:

```sql
-- Política para permitir que criador do ticket insira detalhes de compra
CREATE POLICY "Ticket creator can insert purchase details"
ON public.ticket_purchase_details
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id = ticket_id
    AND t.created_by = auth.uid()
  )
);
```

---

### Bug 2: Filtro de departamento aplicado APÓS paginação (client-side)

**Status:** ✅ **CORRIGIDO em 07/01/2026**

**Severidade:** MÉDIO - Afeta usabilidade

**Cenário de Reprodução:**
1. Admin faz login e navega até `/usuarios`
2. Página exibe 20 usuários por página (43 usuários no total, 3 páginas)
3. Clica no botão "Departamento" e seleciona "Operações"
4. A URL muda para `?department=7018b3e8-...`
5. **ERRO:** A página 1 é exibida vazia com mensagem "Nenhum usuário encontrado"
6. Ao navegar para a página 2, os usuários de Operações aparecem

**Análise Técnica:**

O bug está em `apps/web/src/app/(app)/usuarios/actions.ts` na função `getUsers()`:

```typescript
// Linha 91: Busca os primeiros 20 registros do banco
.range(offset, offset + limit - 1)

// ... depois ...

// Linhas 156-161: Filtra por departamento APÓS a paginação (client-side)
if (filters?.departmentId) {
  users = users.filter(user => 
    user.roles.some(r => r.department_id === filters.departmentId)
  )
}
```

**O problema:**
1. Query busca os 20 primeiros usuários ordenados por nome
2. Esses 20 usuários podem não incluir nenhum do departamento Operações
3. Filtro client-side remove todos os 20 resultados
4. Resultado: página vazia

**Porque funciona na página 2:**
- A página 2 (offset 20-39) pode conter usuários do departamento Operações por acaso

**Localização do Bug:**
- `apps/web/src/app/(app)/usuarios/actions.ts` - linhas 156-161

**Solução Proposta:**

Mover o filtro de departamento para a query SQL via JOIN:

```typescript
// Adicionar filtro na query SQL, não client-side
if (filters?.departmentId) {
  query = query.eq('user_roles.role.department.id', filters.departmentId)
}
```

Ou, como alternativa mais simples:
- Usar uma view ou RPC que faça o JOIN corretamente
- Resetar a paginação para página 1 quando filtro é aplicado (paliativo)

---

## Impacto em Outras Tabelas (Revisão Geral)

Análise das políticas RLS de INSERT em tabelas relacionadas a tickets:

| Tabela | Status | Política INSERT Atual | Ação Necessária |
|--------|--------|----------------------|-----------------|
| `ticket_purchase_details` | ❌ **BLOQUEADO** | Apenas admin + departamento | **CRIAR política para criador do ticket** |
| `ticket_maintenance_details` | ⚠️ **MUITO PERMISSIVO** | `auth.uid() IS NOT NULL` (qualquer usuário) | Revisar: restringir para criador + departamento |
| `ticket_claim_details` | ✅ **OK** | `t.created_by = auth.uid() OR is_admin()` | Nenhuma ação |
| `ticket_quotations` | ⚠️ Verificar | Apenas departamento Compras | Verificar se precisa incluir criador |
| `ticket_comments` | ✅ Tem política | "Users can create comments on visible tickets" | Verificar lógica |
| `ticket_attachments` | ✅ Tem política | "Users can upload attachments to own tickets" | Verificar lógica |

### Detalhes das Políticas Verificadas

**`ticket_claim_details`** - Exemplo de política CORRETA:
```sql
-- Permite criador do ticket OU admin
WITH CHECK (EXISTS (
  SELECT 1 FROM tickets t
  WHERE t.id = ticket_claim_details.ticket_id 
  AND (t.created_by = auth.uid() OR is_admin())
))
```

**`ticket_maintenance_details`** - MUITO PERMISSIVA (risco de segurança):
```sql
-- Permite QUALQUER usuário autenticado inserir
WITH CHECK (auth.uid() IS NOT NULL)
```
→ Deve ser corrigida para seguir o mesmo padrão de `ticket_claim_details`

---

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criar e testar novas políticas RLS | [Database Specialist](../agents/database-specialist.md) | Revisar todas as políticas RLS de tabelas de tickets |
| Security Auditor | Validar que novas políticas não abrem brechas de segurança | [Security Auditor](../agents/security-auditor.md) | Garantir princípio do menor privilégio |
| Bug Fixer | Corrigir lógica de paginação no frontend | [Bug Fixer](../agents/bug-fixer.md) | Resetar página ao aplicar filtros |
| Test Writer | Criar testes E2E para validar cenários | [Test Writer](../agents/test-writer.md) | Testes de criação de chamados como diferentes roles |

---

## Working Phases

### Fase 1 — Correção do Bug de RLS (CRÍTICO)

**Status:** ✅ **CONCLUÍDA em 07/01/2026**

**Owner:** Database Specialist

**Tarefas:**

#### 1.1 Criar migration para nova política de INSERT

```sql
-- Migration: fix_ticket_purchase_details_insert_policy
-- Permitir que o criador do ticket insira os detalhes de compra

CREATE POLICY "Ticket creator can insert purchase details"
ON public.ticket_purchase_details
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id = ticket_id
    AND t.created_by = auth.uid()
  )
);
```

#### 1.2 Corrigir política de `ticket_maintenance_details` (MUITO PERMISSIVA)

A política atual permite qualquer usuário autenticado inserir. Deve ser restrita:

```sql
-- Migration: fix_ticket_maintenance_details_insert_policy

-- Remover política muito permissiva
DROP POLICY IF EXISTS "Users can insert maintenance details" 
ON public.ticket_maintenance_details;

-- Criar política restritiva (mesmo padrão de ticket_claim_details)
CREATE POLICY "Ticket creator can insert maintenance details"
ON public.ticket_maintenance_details
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id = ticket_id
    AND (t.created_by = auth.uid() OR is_admin())
  )
);
```

#### 1.3 Verificar outras tabelas (já OK)

- ✅ `ticket_claim_details` - Já tem política correta
- ✅ `ticket_comments` - Já tem política específica
- ✅ `ticket_attachments` - Já tem política específica

#### 1.4 Executar security advisors após mudanças

```bash
# Usar MCP Supabase para verificar
mcp_supabase_get_advisors --type security
```

**Estado atual dos advisors (07/01/2026):**
- ⚠️ `audit_logs` - INSERT com `true` (intencional - logs do sistema)
- ⚠️ `ticket_history` - INSERT com `true` (intencional - histórico automático)
- ⚠️ Leaked Password Protection desabilitado (recomendação separada)

**Commit Checkpoint:**
```bash
git commit -m "fix(rls): allow ticket creators to insert detail records

- Add INSERT policy for ticket_purchase_details (was missing)
- Fix overly permissive INSERT policy for ticket_maintenance_details
- ticket_claim_details already correct (no changes)
- Verify with security advisors

Fixes: RLS error when non-admin users create purchase tickets"
```

---

### Fase 2 — Correção do Bug de Paginação/Filtro

**Status:** ✅ **CONCLUÍDA em 07/01/2026**

**Owner:** Bug Fixer / Backend Specialist

**Correções aplicadas:**
- `apps/web/src/app/(app)/usuarios/actions.ts`: Filtro de departamento movido para query SQL (busca IDs primeiro, depois aplica na query principal)
- `apps/web/src/app/(app)/usuarios/components/users-filters.tsx`: Reset de página para 1 ao alterar filtros

**Tarefas:**

#### 2.1 Mover filtro de departamento para query SQL

**Arquivo:** `apps/web/src/app/(app)/usuarios/actions.ts`

O problema está nas linhas 156-161 onde o filtro é aplicado client-side após a paginação.

**Opção A - Filtrar na query (preferível):**

```typescript
// ANTES: Filtro client-side (errado)
if (filters?.departmentId) {
  users = users.filter(user => 
    user.roles.some(r => r.department_id === filters.departmentId)
  )
}

// DEPOIS: Usar RPC ou view que faz JOIN correto
// Ou: Criar query com inner join antes do range
```

**Opção B - Criar view para listagem de usuários:**

```sql
CREATE VIEW users_with_departments AS
SELECT DISTINCT ON (p.id)
  p.*,
  d.id as department_id,
  d.name as department_name
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
LEFT JOIN roles r ON r.id = ur.role_id
LEFT JOIN departments d ON d.id = r.department_id;
```

#### 2.2 Solução paliativa (se necessário rapidamente)

Resetar a página para 1 quando qualquer filtro é aplicado no componente `UsersFilters`:

**Arquivo:** `apps/web/src/app/(app)/usuarios/components/users-filters.tsx`

```typescript
const handleDepartmentChange = (dept: string) => {
  const params = new URLSearchParams(searchParams.toString())
  if (dept === 'all') {
    params.delete('department')
  } else {
    params.set('department', dept)
  }
  params.delete('page') // Reset para página 1
  router.push(`?${params.toString()}`)
}
```

#### 2.3 Validar com testes manuais

1. Navegar para página 2 de usuários
2. Aplicar filtro de departamento "Operações"
3. Verificar que página 1 é exibida com o(s) usuário(s) de Operações

**Commit Checkpoint:**
```bash
git commit -m "fix(usuarios): apply department filter in SQL query

- Move department filter from client-side to SQL query
- Fix empty page when filtering by department
- Ensure pagination works correctly with filters

Fixes: Empty page displayed when filtering users by department"
```

---

### Fase 3 — Validação e Testes

**Owner:** Test Writer

**Tarefas:**

#### 3.1 Criar teste E2E para criação de chamado como não-admin

```typescript
// tests/e2e/tickets/purchase-creation.spec.ts
test('non-admin user can create purchase ticket', async ({ page }) => {
  // Login como manobrista
  await loginAs(page, 'teste_manobrista_operacoes@garageinn.com')
  
  // Navegar para criação de chamado
  await page.goto('/chamados')
  await page.click('button:has-text("Novo Chamado")')
  await page.click('button:has-text("Compras")')
  
  // Preencher formulário
  await page.fill('[name="title"]', 'Teste de criação de chamado')
  await page.fill('[name="item_name"]', 'Item teste')
  await page.fill('[name="quantity"]', '1')
  await page.fill('[name="description"]', 'Justificativa do teste')
  
  // Submeter e verificar sucesso
  await page.click('button:has-text("Criar Chamado")')
  await expect(page).not.toContainText('row-level security')
  await expect(page.url()).toContain('/chamados/compras/')
})
```

#### 3.2 Criar teste E2E para paginação com filtros

```typescript
// tests/e2e/users/pagination.spec.ts
test('pagination resets when filter applied', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('/usuarios')
  
  // Navegar para página 2
  await page.click('button:has-text("2")')
  await expect(page.url()).toContain('page=2')
  
  // Aplicar filtro de departamento
  await page.click('button:has-text("Departamento")')
  await page.click('text=Operações')
  
  // Verificar que página foi resetada e mostra resultados
  await expect(page.url()).not.toContain('page=2')
  await expect(page.locator('table tbody tr')).toHaveCountGreaterThan(0)
})
```

**Commit Checkpoint:**
```bash
git commit -m "test(e2e): add tests for RLS and pagination fixes

- Add test for non-admin ticket creation
- Add test for pagination reset on filter change"
```

---

## Risk Assessment

### Identified Risks

| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Nova política RLS pode abrir brechas | Baixa | Alto | Usar WITH CHECK restritivo, executar security advisors | Database Specialist |
| Outras tabelas com mesmo problema | Alta | Médio | Revisar todas as tabelas de detalhes de forma sistemática | Database Specialist |
| Reset de paginação pode afetar UX | Baixa | Baixo | Comportamento padrão esperado | Frontend Specialist |

### Dependencies
- **Internal:** Nenhuma dependência de outras equipes
- **External:** Supabase MCP para aplicar migrations
- **Technical:** Acesso ao banco de dados de produção

### Assumptions
- As políticas RLS existentes foram criadas seguindo o plano original em `chamados-compras.md`
- O padrão de problema se repete em outras tabelas de detalhes específicos

---

## Rollback Plan

### Rollback Triggers
- Usuários não conseguem mais criar tickets (problema inverso)
- Usuários conseguem ver/editar tickets de outros (brecha de segurança)
- Performance degradada após novas políticas

### Rollback Procedures

#### Fase 1 Rollback (RLS)
```sql
-- Reverter políticas
DROP POLICY IF EXISTS "Ticket creator can insert purchase details" 
ON public.ticket_purchase_details;
-- Repetir para outras tabelas
```
- Data Impact: Nenhum (apenas políticas de acesso)
- Estimated Time: < 30 minutos

#### Fase 2 Rollback (Paginação)
- Action: Revert commit de frontend
- Data Impact: Nenhum
- Estimated Time: < 15 minutos

---

## Evidence & Follow-up

### Artifacts to Collect
- [ ] Screenshot do erro de RLS antes da correção
- [ ] Screenshot do sucesso após correção
- [ ] Log de migrations aplicadas
- [ ] Resultado do security advisors
- [ ] PR links para as correções

### Follow-up Actions
- [ ] Regenerar TypeScript types após mudanças no schema
- [ ] Atualizar documentação de RLS em `chamados-compras.md`
- [ ] Considerar criar função helper para verificar criador do ticket
- [ ] Auditar outras tabelas com padrão similar

---

## Notas Adicionais

### Padrão Recomendado para Futuras Tabelas de Detalhes

Ao criar tabelas de detalhes específicos de tickets (ex: `ticket_*_details`), sempre incluir:

1. **Política SELECT:** Visibilidade baseada no ticket pai
2. **Política INSERT com WITH CHECK:** Permitir criador do ticket OU membros do departamento
3. **Política UPDATE:** Apenas admin e membros do departamento
4. **Política DELETE:** Apenas admin

Exemplo padrão:

```sql
-- Template para novas tabelas de detalhes
CREATE POLICY "Visible to ticket viewers" ON public.ticket_X_details
FOR SELECT USING (/* mesma lógica do ticket */);

CREATE POLICY "Creator can insert" ON public.ticket_X_details
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND t.created_by = auth.uid())
);

CREATE POLICY "Department can manage" ON public.ticket_X_details
FOR UPDATE USING (is_admin() OR /* departamento match */);

CREATE POLICY "Admins can delete" ON public.ticket_X_details
FOR DELETE USING (is_admin());
```

---

## ✅ Implementação Concluída (07/01/2026)

### Fase 1 - Correções de RLS

**Migrations aplicadas:**

1. `20260107165055_fix_ticket_purchase_details_insert_policy`
   - Criada política `Ticket creator can insert purchase details`
   - Permite INSERT quando `t.created_by = auth.uid()`

2. `20260107165107_fix_ticket_maintenance_details_insert_policy`
   - Removida política muito permissiva `Users can insert maintenance details`
   - Criada política `Ticket creator can insert maintenance details`
   - Permite INSERT quando `t.created_by = auth.uid() OR is_admin()`

**Security Advisors:** Verificados - sem novos warnings relacionados às mudanças.

### Fase 2 - Correção de Paginação

**Arquivos modificados:**

1. `apps/web/src/app/(app)/usuarios/actions.ts`
   - Movido filtro de departamento para query SQL (busca IDs primeiro)
   - Filtro agora é aplicado ANTES da paginação via `.in('id', userIdsInDepartment)`
   - Contagem total agora reflete corretamente o número de usuários filtrados

2. `apps/web/src/app/(app)/usuarios/components/users-filters.tsx`
   - Adicionado reset de página (`params.delete('page')`) quando filtros são alterados
   - Garante que usuário sempre veja a página 1 ao aplicar/remover filtros

### Validação

- [x] Lint passou sem erros nas mudanças
- [x] Políticas RLS verificadas via SQL
- [x] Security advisors executados
- [ ] Teste manual de criação de chamado como não-admin (pendente)
- [ ] Teste manual de filtro de departamento com paginação (pendente)

<!-- agent-update:end -->
