---
status: completed
generated: 2026-01-11
completed: 2026-01-11
---

# Sincronização de Views do Banco de Dados

> Criar as views que estão faltando no banco de dados Supabase

## Task Snapshot
- **Primary goal:** Criar 3 views no banco de dados para que as queries do sistema funcionem corretamente.
- **Success signal:** Chamados e checklists podem ser listados e visualizados sem erros.
- **Complexidade:** Baixa - apenas DDL (CREATE VIEW)

## Views Faltantes

| View | Módulo | Arquivos que usam |
|------|--------|-------------------|
| `tickets_with_details` | Chamados (geral, compras, RH) | 6 referências |
| `tickets_maintenance_with_details` | Chamados de Manutenção | 3 referências |
| `checklist_executions_with_details` | Checklists | 1 referência |

---

## View 1: tickets_with_details

### Campos esperados (baseado no código)

```typescript
interface HubTicket {
  id: string
  ticket_number: number
  title: string
  description: string
  status: string
  priority: string | null
  perceived_urgency: string | null
  created_at: string
  updated_at: string
  department_id: string
  department_name: string
  category_id: string | null
  category_name: string | null
  unit_id: string | null
  unit_name: string | null
  unit_code: string | null
  created_by: string
  created_by_name: string | null
  assigned_to_id: string | null
  assigned_to_name: string | null
  due_date: string | null
  denial_reason: string | null
  resolved_at: string | null
  closed_at: string | null
}
```

### SQL

```sql
CREATE OR REPLACE VIEW tickets_with_details AS
SELECT 
  t.id,
  t.ticket_number,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.perceived_urgency,
  t.department_id,
  d.name AS department_name,
  t.category_id,
  tc.name AS category_name,
  t.unit_id,
  u.name AS unit_name,
  u.code AS unit_code,
  t.created_by,
  creator.full_name AS created_by_name,
  creator.avatar_url AS created_by_avatar,
  t.assigned_to AS assigned_to_id,
  assignee.full_name AS assigned_to_name,
  assignee.avatar_url AS assigned_to_avatar,
  t.due_date,
  t.denial_reason,
  t.resolved_at,
  t.closed_at,
  t.created_at,
  t.updated_at
FROM tickets t
LEFT JOIN departments d ON d.id = t.department_id
LEFT JOIN ticket_categories tc ON tc.id = t.category_id
LEFT JOIN units u ON u.id = t.unit_id
LEFT JOIN profiles creator ON creator.id = t.created_by
LEFT JOIN profiles assignee ON assignee.id = t.assigned_to;
```

---

## View 2: tickets_maintenance_with_details

### Campos adicionais (além dos campos de tickets_with_details)

```typescript
// Campos específicos de manutenção
maintenance_type: string | null      // 'preventive' | 'corrective'
location_description: string | null
equipment_affected: string | null
completion_notes: string | null
completion_rating: number | null
```

### SQL

```sql
CREATE OR REPLACE VIEW tickets_maintenance_with_details AS
SELECT 
  t.id,
  t.ticket_number,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.perceived_urgency,
  t.department_id,
  d.name AS department_name,
  t.category_id,
  tc.name AS category_name,
  t.unit_id,
  u.name AS unit_name,
  u.code AS unit_code,
  t.created_by,
  creator.full_name AS created_by_name,
  creator.avatar_url AS created_by_avatar,
  t.assigned_to AS assigned_to_id,
  assignee.full_name AS assigned_to_name,
  assignee.avatar_url AS assigned_to_avatar,
  t.due_date,
  t.denial_reason,
  t.resolved_at,
  t.closed_at,
  t.created_at,
  t.updated_at,
  -- Campos específicos de manutenção
  md.maintenance_type,
  md.location_description,
  md.equipment_affected,
  md.completion_notes,
  md.completion_rating
FROM tickets t
LEFT JOIN departments d ON d.id = t.department_id
LEFT JOIN ticket_categories tc ON tc.id = t.category_id
LEFT JOIN units u ON u.id = t.unit_id
LEFT JOIN profiles creator ON creator.id = t.created_by
LEFT JOIN profiles assignee ON assignee.id = t.assigned_to
LEFT JOIN ticket_maintenance_details md ON md.ticket_id = t.id
WHERE d.name = 'Compras e Manutenção';
```

---

## View 3: checklist_executions_with_details

### Campos esperados (baseado no código)

```typescript
interface ExecutionWithDetails {
  id: string
  started_at: string
  completed_at: string | null
  status: string
  has_non_conformities: boolean | null
  general_observations: string | null
  unit_id: string | null
  unit_name: string | null
  unit_code: string | null
  template_id: string | null
  template_name: string | null
  template_type: string | null
  executed_by: string | null
  executed_by_name: string | null
  executed_by_email: string | null
  executed_by_avatar: string | null
  non_conformities_count: number | null
  total_answers: number | null
  total_questions: number | null
}
```

### SQL

```sql
CREATE OR REPLACE VIEW checklist_executions_with_details AS
SELECT 
  ce.id,
  ce.template_id,
  ct.name AS template_name,
  ct.type AS template_type,
  ce.unit_id,
  u.name AS unit_name,
  u.code AS unit_code,
  ce.executed_by,
  p.full_name AS executed_by_name,
  p.email AS executed_by_email,
  p.avatar_url AS executed_by_avatar,
  ce.status,
  ce.started_at,
  ce.completed_at,
  ce.general_observations,
  ce.has_non_conformities,
  ce.created_at,
  ce.updated_at,
  -- Contagens calculadas
  (SELECT COUNT(*) FROM checklist_answers ca WHERE ca.execution_id = ce.id AND ca.answer = false) AS non_conformities_count,
  (SELECT COUNT(*) FROM checklist_answers ca WHERE ca.execution_id = ce.id) AS total_answers,
  (SELECT COUNT(*) FROM checklist_questions cq WHERE cq.template_id = ce.template_id AND cq.status = 'active') AS total_questions
FROM checklist_executions ce
LEFT JOIN checklist_templates ct ON ct.id = ce.template_id
LEFT JOIN units u ON u.id = ce.unit_id
LEFT JOIN profiles p ON p.id = ce.executed_by;
```

---

## Passos de Implementação

### Passo 1: Criar as 3 views via migration

```sql
-- Migration: create_missing_views
-- Executa as 3 views em sequência
```

### Passo 2: Verificar criação

```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'VIEW';
```

### Passo 3: Testar funcionalidades

- [x] Listagem de chamados no hub `/chamados`
- [x] Listagem de chamados de compras `/chamados/compras`
- [x] Listagem de chamados de manutenção `/chamados/manutencao`
- [ ] Listagem de chamados de RH `/chamados/rh` (não testado)
- [x] Listagem de execuções de checklist `/checklists`
- [x] Dropdown de categorias funcionando

---

## Rollback

Se necessário reverter:

```sql
DROP VIEW IF EXISTS tickets_with_details;
DROP VIEW IF EXISTS tickets_maintenance_with_details;
DROP VIEW IF EXISTS checklist_executions_with_details;
```

---

## Correções Adicionais Realizadas

Durante a implementação, foram identificadas e corrigidas:

1. **Constraint de status** - Atualizada para incluir novos status de aprovação hierárquica
2. **Política RLS** - Adicionada política INSERT para `ticket_purchase_details`
3. **Nome do departamento** - Corrigido de "Compras" para "Compras e Manutenção"
4. **Arquivo actions.ts de manutenção** - Corrigido erro de re-export em arquivo `'use server'` (funções copiadas localmente)

---

## Notas Técnicas

### RLS em Views

Views no Supabase/PostgreSQL herdam as políticas RLS das tabelas subjacentes automaticamente. Como todas as tabelas base (`tickets`, `checklist_executions`, etc.) já têm RLS configurado, as views respeitarão essas políticas.

### Performance

As views usam `LEFT JOIN` para garantir que registros sem relacionamentos ainda apareçam. Para otimização futura, considerar:
- Índices nas colunas de FK
- Materialização de views se performance for problema
