# Relacionamentos do Banco de Dados

Documentação dos relacionamentos entre as tabelas do sistema GarageInn.

---

## 📊 Diagrama de Relacionamentos (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AUTENTICAÇÃO E USUÁRIOS                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐                          │
│   │  auth.users  │──1:1─│   profiles   │──N:N─│    roles     │                          │
│   │  (Supabase)  │      │              │      │              │                          │
│   └──────────────┘      └──────┬───────┘      └──────┬───────┘                          │
│                                │                     │                                   │
│                                │                     │                                   │
│                         ┌──────┴───────┐      ┌──────┴───────┐                          │
│                         │  user_units  │      │ departments  │                          │
│                         │    (N:N)     │      │              │                          │
│                         └──────┬───────┘      └──────────────┘                          │
│                                │                                                         │
│                         ┌──────┴───────┐                                                │
│                         │    units     │                                                │
│                         │              │                                                │
│                         └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CHAMADOS                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   ┌──────────────┐                                                                      │
│   │   tickets    │──────────────────────────────────────────────────────────────┐       │
│   │              │                                                               │       │
│   └──────┬───────┘                                                               │       │
│          │                                                                       │       │
│    ┌─────┼─────┬─────────┬─────────┬─────────┬─────────┐                        │       │
│    │     │     │         │         │         │         │                        │       │
│    ▼     ▼     ▼         ▼         ▼         ▼         ▼                        │       │
│ ┌──────┐ ┌──────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │       │
│ │ticket│ │ticket│ │  ticket   │ │  ticket   │ │  ticket   │ │  ticket   │       │       │
│ │_comm │ │_atta │ │_approvals │ │_history   │ │_mainten.  │ │_purchase  │       │       │
│ │ents  │ │chmnts│ │           │ │           │ │_details   │ │_details   │       │       │
│ └──────┘ └──────┘ └───────────┘ └───────────┘ └─────┬─────┘ └─────┬─────┘       │       │
│                                                     │             │             │       │
│                                               ┌─────┴─────┐ ┌─────┴─────┐       │       │
│                                               │  ticket   │ │  ticket   │       │       │
│                                               │_mainten.  │ │_quotations│       │       │
│                                               │_executions│ │           │       │       │
│                                               └───────────┘ └───────────┘       │       │
│                                                                                 │       │
│   ┌───────────────┐     ┌───────────────┐                                       │       │
│   │ ticket_claim  │─────│    claim      │                                       │       │
│   │   _details    │     │ _purchases    │                                       │       │
│   └───────┬───────┘     └───────┬───────┘                                       │       │
│           │                     │                                               │       │
│     ┌─────┴─────┐         ┌─────┴─────┐                                         │       │
│     │   claim   │         │   claim   │                                         │       │
│     │_communic. │         │_purchase  │                                         │       │
│     │           │         │  _items   │                                         │       │
│     └───────────┘         └─────┬─────┘                                         │       │
│                                 │                                               │       │
│                           ┌─────┴─────┐     ┌───────────────┐                   │       │
│                           │   claim   │─────│  accredited   │                   │       │
│                           │_purchase  │     │  _suppliers   │                   │       │
│                           │_quotations│     │               │                   │       │
│                           └───────────┘     └───────────────┘                   │       │
│                                                                                 │       │
│   ┌───────────────┐                                                             │       │
│   │ ticket_rh    │◄────────────────────────────────────────────────────────────┘       │
│   │   _details   │                                                                      │
│   └───────────────┘                                                                     │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                      CHECKLISTS                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐              │
│   │    checklist     │──1:N─│    checklist     │      │    checklist     │              │
│   │    _templates    │      │    _questions    │      │    _executions   │              │
│   └────────┬─────────┘      └──────────────────┘      └────────┬─────────┘              │
│            │                                                   │                         │
│            │                                                   │                         │
│   ┌────────┴─────────┐                                ┌────────┴─────────┐              │
│   │ unit_checklist   │                                │    checklist     │              │
│   │    _templates    │                                │     _answers     │              │
│   └──────────────────┘                                └──────────────────┘              │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                      UNIFORMES                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   ┌──────────────────┐      ┌──────────────────┐                                        │
│   │     uniforms     │──1:N─│    uniform       │                                        │
│   │                  │      │   _transactions  │                                        │
│   └──────────────────┘      └──────────────────┘                                        │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Detalhamento dos Relacionamentos

### Autenticação e Usuários

#### profiles ↔ auth.users
- **Tipo**: 1:1
- **FK**: `profiles.id` → `auth.users.id`
- **Descrição**: Cada usuário do Supabase Auth tem um perfil correspondente

#### profiles ↔ roles (via user_roles)
- **Tipo**: N:N
- **Tabela de junção**: `user_roles`
- **FKs**: 
  - `user_roles.user_id` → `profiles.id`
  - `user_roles.role_id` → `roles.id`
- **Descrição**: Um usuário pode ter múltiplos cargos

#### profiles ↔ units (via user_units)
- **Tipo**: N:N
- **Tabela de junção**: `user_units`
- **FKs**:
  - `user_units.user_id` → `profiles.id`
  - `user_units.unit_id` → `units.id`
- **Descrição**: Um usuário pode estar vinculado a múltiplas unidades

#### roles ↔ departments
- **Tipo**: N:1
- **FK**: `roles.department_id` → `departments.id`
- **Descrição**: Cada cargo pertence a um departamento (exceto cargos globais)

---

### Chamados

#### tickets ↔ departments
- **Tipo**: N:1
- **FK**: `tickets.department_id` → `departments.id`
- **Descrição**: Cada chamado é direcionado a um departamento

#### tickets ↔ units
- **Tipo**: N:1
- **FK**: `tickets.unit_id` → `units.id`
- **Descrição**: Chamado pode estar associado a uma unidade

#### tickets ↔ profiles (created_by)
- **Tipo**: N:1
- **FK**: `tickets.created_by` → `profiles.id`
- **Descrição**: Quem criou o chamado

#### tickets ↔ profiles (assigned_to)
- **Tipo**: N:1
- **FK**: `tickets.assigned_to` → `profiles.id`
- **Descrição**: Responsável pelo chamado

#### tickets ↔ ticket_categories
- **Tipo**: N:1
- **FK**: `tickets.category_id` → `ticket_categories.id`
- **Descrição**: Categoria do chamado

#### tickets ↔ ticket_comments
- **Tipo**: 1:N
- **FK**: `ticket_comments.ticket_id` → `tickets.id`
- **Descrição**: Comentários do chamado

#### tickets ↔ ticket_attachments
- **Tipo**: 1:N
- **FK**: `ticket_attachments.ticket_id` → `tickets.id`
- **Descrição**: Anexos do chamado

#### tickets ↔ ticket_history
- **Tipo**: 1:N
- **FK**: `ticket_history.ticket_id` → `tickets.id`
- **Descrição**: Histórico de alterações

#### tickets ↔ ticket_approvals
- **Tipo**: 1:N
- **FK**: `ticket_approvals.ticket_id` → `tickets.id`
- **Descrição**: Aprovações do chamado

---

### Chamados - Manutenção

#### tickets ↔ ticket_maintenance_details
- **Tipo**: 1:1
- **FK**: `ticket_maintenance_details.ticket_id` → `tickets.id`
- **Descrição**: Detalhes específicos de manutenção

#### tickets ↔ ticket_maintenance_executions
- **Tipo**: 1:N
- **FK**: `ticket_maintenance_executions.ticket_id` → `tickets.id`
- **Descrição**: Execuções de manutenção

---

### Chamados - Compras

#### tickets ↔ ticket_purchase_details
- **Tipo**: 1:1
- **FK**: `ticket_purchase_details.ticket_id` → `tickets.id`
- **Descrição**: Detalhes específicos de compras

#### tickets ↔ ticket_quotations
- **Tipo**: 1:N
- **FK**: `ticket_quotations.ticket_id` → `tickets.id`
- **Descrição**: Cotações do chamado

---

### Chamados - Sinistros

#### tickets ↔ ticket_claim_details
- **Tipo**: 1:1
- **FK**: `ticket_claim_details.ticket_id` → `tickets.id`
- **Descrição**: Detalhes específicos de sinistros

#### ticket_claim_details ↔ claim_communications
- **Tipo**: 1:N
- **FK**: `claim_communications.claim_details_id` → `ticket_claim_details.id`
- **Descrição**: Comunicações com cliente

#### ticket_claim_details ↔ claim_purchases
- **Tipo**: 1:N
- **FK**: `claim_purchases.claim_details_id` → `ticket_claim_details.id`
- **Descrição**: Compras internas do sinistro

#### claim_purchases ↔ claim_purchase_items
- **Tipo**: 1:N
- **FK**: `claim_purchase_items.claim_purchase_id` → `claim_purchases.id`
- **Descrição**: Itens da compra

#### claim_purchases ↔ claim_purchase_quotations
- **Tipo**: 1:N
- **FK**: `claim_purchase_quotations.claim_purchase_id` → `claim_purchases.id`
- **Descrição**: Cotações da compra

#### claim_purchase_quotations ↔ accredited_suppliers
- **Tipo**: N:1
- **FK**: `claim_purchase_quotations.supplier_id` → `accredited_suppliers.id`
- **Descrição**: Fornecedor credenciado

---

### Chamados - RH

#### tickets ↔ ticket_rh_details
- **Tipo**: 1:1
- **FK**: `ticket_rh_details.ticket_id` → `tickets.id`
- **Descrição**: Detalhes específicos de RH

---

### Checklists

#### checklist_templates ↔ checklist_questions
- **Tipo**: 1:N
- **FK**: `checklist_questions.template_id` → `checklist_templates.id`
- **Descrição**: Perguntas do template

#### checklist_templates ↔ checklist_executions
- **Tipo**: 1:N
- **FK**: `checklist_executions.template_id` → `checklist_templates.id`
- **Descrição**: Execuções do template

#### checklist_executions ↔ checklist_answers
- **Tipo**: 1:N
- **FK**: `checklist_answers.execution_id` → `checklist_executions.id`
- **Descrição**: Respostas da execução

#### checklist_answers ↔ checklist_questions
- **Tipo**: N:1
- **FK**: `checklist_answers.question_id` → `checklist_questions.id`
- **Descrição**: Pergunta respondida

#### units ↔ checklist_templates (via unit_checklist_templates)
- **Tipo**: N:N
- **Tabela de junção**: `unit_checklist_templates`
- **FKs**:
  - `unit_checklist_templates.unit_id` → `units.id`
  - `unit_checklist_templates.template_id` → `checklist_templates.id`
- **Descrição**: Templates específicos por unidade

---

### Uniformes

#### uniforms ↔ uniform_transactions
- **Tipo**: 1:N
- **FK**: `uniform_transactions.uniform_id` → `uniforms.id`
- **Descrição**: Transações do uniforme

#### uniform_transactions ↔ profiles
- **Tipo**: N:1
- **FK**: `uniform_transactions.user_id` → `profiles.id`
- **Descrição**: Usuário que retirou

#### uniform_transactions ↔ units
- **Tipo**: N:1
- **FK**: `uniform_transactions.unit_id` → `units.id`
- **Descrição**: Unidade da transação

#### uniform_transactions ↔ tickets
- **Tipo**: N:1
- **FK**: `uniform_transactions.ticket_id` → `tickets.id`
- **Descrição**: Chamado relacionado

---

## 🔑 Índices Recomendados

```sql
-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Tickets
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_department_id ON tickets(department_id);
CREATE INDEX idx_tickets_unit_id ON tickets(unit_id);
CREATE INDEX idx_tickets_created_by ON tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- User Roles
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- User Units
CREATE INDEX idx_user_units_user_id ON user_units(user_id);
CREATE INDEX idx_user_units_unit_id ON user_units(unit_id);

-- Checklist Executions
CREATE INDEX idx_checklist_executions_unit_id ON checklist_executions(unit_id);
CREATE INDEX idx_checklist_executions_executed_by ON checklist_executions(executed_by);
CREATE INDEX idx_checklist_executions_started_at ON checklist_executions(started_at DESC);

-- Ticket Comments
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- Ticket History
CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);
```

---

## ⚠️ Constraints Importantes

### Unique Constraints
- `profiles.email` - Email único
- `profiles.cpf` - CPF único (quando preenchido)
- `units.code` - Código único da unidade
- `system_settings.key` - Chave única de configuração
- `user_roles(user_id, role_id)` - Evita duplicação de cargo
- `user_units(user_id, unit_id)` - Evita duplicação de vínculo
- `checklist_answers(execution_id, question_id)` - Uma resposta por pergunta

### Check Constraints (Recomendados)
```sql
-- Status válidos para tickets
ALTER TABLE tickets ADD CONSTRAINT chk_tickets_status 
CHECK (status IN ('awaiting_approval', 'awaiting_triage', 'prioritized', 
                  'in_progress', 'awaiting_return', 'resolved', 'closed', 
                  'denied', 'cancelled'));

-- Prioridade válida
ALTER TABLE tickets ADD CONSTRAINT chk_tickets_priority 
CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high', 'urgent'));

-- Status de perfil válido
ALTER TABLE profiles ADD CONSTRAINT chk_profiles_status 
CHECK (status IN ('active', 'inactive', 'pending'));

-- Status de unidade válido
ALTER TABLE units ADD CONSTRAINT chk_units_status 
CHECK (status IN ('active', 'inactive'));
```
