---
id: plan-chamados-compras
ai_update_goal: "Implementar o módulo completo de Chamados de Compras da Entrega 1, incluindo modelo de dados, tela de abertura, listagem, fluxo de execução com cotações e triagem/priorização."
required_inputs:
  - "Checklist da entrega: projeto/entregaveis/entrega1_tarefas.md (Chamados — Compras — itens 68-74)"
  - "PRD: projeto/PRD.md (seção 3.1 Sistema de Chamados)"
  - "Abertura de chamados: projeto/chamados/abertura.md"
  - "Execuções de chamados: projeto/chamados/execuções.md"
  - "Fluxo de aprovações: projeto/chamados/aprovacoes.md"
  - "Design System: design-system.md (tokens e componentes)"
  - "Tabelas existentes: units, profiles, user_units, departments, roles (já migradas)"
success_criteria:
  - "Modelo de dados criado: tickets, ticket_comments, ticket_attachments, ticket_history, ticket_quotations"
  - "Tela de abertura de chamado de Compras funcional"
  - "Tela de listagem de chamados de Compras com filtros"
  - "Fluxo de execução do chamado de Compras com status específicos"
  - "Triagem e priorização por Gerentes/Supervisores de Compras"
  - "Fluxo de aprovações (Operações → Compras) quando aplicável"
  - "Sistema de cotações para chamados de Compras"
  - "RLS e políticas de segurança configuradas corretamente"
  - "Permissões tickets:* integradas ao RBAC"
related_agents:
  - "code-reviewer"
  - "feature-developer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
  - "database-specialist"
---

<!-- agent-update:start:plan-chamados-compras -->
# Plano de Chamados de Compras - GAPP Entrega 1

> Implementar o módulo completo de Chamados de Compras da Entrega 1, incluindo modelo de dados (tickets, ticket_comments, ticket_attachments, ticket_history), tela de abertura, listagem, fluxo de execução com cotações e triagem/priorização.

## Checklist de Tarefas

| # | Tarefa | Status | Arquivos Principais |
|---|--------|--------|---------------------|
| 1 | Criar modelo de dados (migrations) | ✅ Concluído | Migrations Supabase, `database.types.ts` |
| 2 | Criar tela de abertura de chamado de Compras | ✅ Concluído | `apps/web/src/app/(app)/chamados/compras/novo/` |
| 3 | Criar tela de listagem de chamados de Compras | ✅ Concluído | `apps/web/src/app/(app)/chamados/compras/page.tsx` |
| 4 | Implementar fluxo de execução do chamado de Compras | ✅ Concluído | `apps/web/src/app/(app)/chamados/compras/[ticketId]/` |
| 5 | Implementar triagem e priorização | ✅ Concluído | `actions.ts`, componentes de triagem |
| 6 | Implementar fluxo de aprovações (quando aplicável) | ⏳ Pendente | `ticket_approvals`, componentes de aprovação |
| 7 | Implementar sistema de cotações | ⏳ Pendente | `ticket_quotations`, componentes de cotação |

---

## Task Snapshot

- **Primary goal:** Entregar o módulo de Chamados de Compras completo, permitindo que usuários abram chamados de solicitação de compras, que o departamento de Compras faça triagem/priorização, gerencie cotações e acompanhe todo o fluxo até a entrega.
- **Success signal:**
  - Chamado de Compras pode ser criado por qualquer usuário
  - Chamados de Manobristas passam por aprovação em cadeia (Encarregado → Supervisor → Gerente)
  - Departamento de Compras pode triar e priorizar chamados
  - Sistema de cotações funcional (adicionar fornecedores, preços, prazos)
  - Histórico completo de alterações e comentários
  - Anexos podem ser adicionados aos chamados
  - Fluxo de status específico de Compras funciona corretamente
- **Key references:**
  - `projeto/entregaveis/entrega1_tarefas.md` (Chamados — Compras)
  - `projeto/PRD.md` (seção 3.1 Sistema de Chamados)
  - `projeto/chamados/abertura.md`
  - `projeto/chamados/execuções.md`
  - `projeto/chamados/aprovacoes.md`
  - `design-system.md` (tokens e componentes)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
- **Out of scope (nesta etapa):** Chamados de Manutenção, RH, Sinistros, Comercial (serão implementados separadamente)

---

## Contexto de Negócio (PRD 3.1)

### 3.1.1 Sistema de Chamados — Compras

**Objetivo:** Sistema centralizado para solicitação de materiais, equipamentos e compras em geral.

**Campos de Abertura (Solicitante):**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Título | Texto | Sim |
| Departamento Destinatário | Fixo: Compras | Sim |
| Unidade(s) | Seleção (quando aplicável) | Condicional |
| Categoria | Seleção (configurável) | Sim |
| Item para compra | Texto | Sim |
| Quantidade | Número | Sim |
| Justificativa | Texto longo | Sim |
| Urgência Percebida | Baixa/Média/Alta | Não |
| Anexos | Arquivos/Imagens | Não |

**Campos de Triagem (Departamento de Compras):**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Prioridade | Baixa/Média/Alta/Urgente | Sim (na triagem) |
| Responsável | Usuário do departamento | Sim (na triagem) |
| Previsão de Conclusão | Data | Não |
| Justificativa da negação | Texto | Obrigatório ao negar |

### Status do Chamado de Compras

```
[Criação] → [Aguardando Aprovações*] → [Aguardando Triagem] → [Em cotação] → [Em aprovação] → [Aprovado] → [Executando compra] → [Em entrega] → [Entrega realizada] → [Avaliação da entrega] → [Fechado]
                         ↓                   ↓                                                                                    ↓
                      [Negado]            [Negado]                                                                           [Cancelado]
```

*Etapa aplicada apenas quando Manobrista abre chamado para Compras (aprovação em cadeia: Encarregado → Supervisor → Gerente).*

### Fluxo de Aprovações (Operações → Compras)

**Regra exclusiva para Manobrista abrindo chamado de Compras:**
1. Chamado entra em "Aguardando Aprovação - Encarregado"
2. Encarregado aprova → "Aguardando Aprovação - Supervisor"
3. Supervisor aprova → "Aguardando Aprovação - Gerente"
4. Gerente aprova → "Aguardando Triagem" (entra na fila de Compras)

**Se negado em qualquer etapa:**
- Status = "Negado"
- Justificativa obrigatória
- Retorna ao autor para **fechar** ou **editar e reenviar**

**Demais cenários (não-Manobrista):**
- Chamado entra direto em "Aguardando Triagem" (sem aprovações)

---

## Modelo de Dados

### Tabelas a Criar

```
tickets
├── id: uuid (PK)
├── ticket_number: serial (auto-incremento para display, ex: #1234)
├── title: text (NOT NULL)
├── description: text (NOT NULL) -- Justificativa
├── department_id: uuid (FK → departments.id) -- Departamento destinatário
├── category_id: uuid (FK → ticket_categories.id, nullable)
├── unit_id: uuid (FK → units.id, nullable) -- Unidade relacionada
├── created_by: uuid (FK → profiles.id)
├── assigned_to: uuid (FK → profiles.id, nullable) -- Responsável atribuído na triagem
├── status: text (NOT NULL) -- Ver enum abaixo
├── priority: text (nullable) -- Definida na triagem: low, medium, high, urgent
├── perceived_urgency: text (nullable) -- Percepção do solicitante: low, medium, high
├── due_date: date (nullable) -- Previsão de conclusão
├── resolved_at: timestamptz (nullable)
├── closed_at: timestamptz (nullable)
├── denial_reason: text (nullable) -- Justificativa de negação
├── created_at: timestamptz
└── updated_at: timestamptz

-- Campos específicos de Compras (JSON ou tabela separada)
ticket_purchase_details
├── id: uuid (PK)
├── ticket_id: uuid (FK → tickets.id, UNIQUE)
├── item_name: text (NOT NULL) -- Item para compra
├── quantity: integer (NOT NULL)
├── unit_of_measure: text (nullable) -- Unidade de medida (un, kg, m², etc.)
├── estimated_price: decimal (nullable)
├── approved_quotation_id: uuid (FK → ticket_quotations.id, nullable)
├── delivery_address: text (nullable)
├── delivery_date: date (nullable)
├── delivery_confirmed_at: timestamptz (nullable)
├── delivery_rating: integer (nullable) -- 1-5 avaliação da entrega
├── delivery_notes: text (nullable)
├── created_at: timestamptz
└── updated_at: timestamptz

ticket_categories
├── id: uuid (PK)
├── name: text (NOT NULL)
├── department_id: uuid (FK → departments.id) -- Categorias por departamento
├── status: text ('active'|'inactive', default 'active')
├── created_at: timestamptz
└── updated_at: timestamptz

ticket_quotations (Cotações)
├── id: uuid (PK)
├── ticket_id: uuid (FK → tickets.id)
├── supplier_name: text (NOT NULL) -- Nome da empresa
├── supplier_cnpj: text (nullable)
├── supplier_contact: text (nullable)
├── unit_price: decimal (NOT NULL)
├── total_price: decimal (NOT NULL)
├── quantity: integer (NOT NULL)
├── payment_terms: text (nullable) -- Forma de pagamento
├── delivery_deadline: date (nullable) -- Prazo de entrega
├── validity_date: date (nullable) -- Validade da cotação
├── supplier_response_date: date (nullable) -- Data resposta do fornecedor
├── notes: text (nullable)
├── status: text ('pending'|'approved'|'rejected', default 'pending')
├── is_selected: boolean (default FALSE) -- Cotação escolhida
├── created_by: uuid (FK → profiles.id)
├── created_at: timestamptz
└── updated_at: timestamptz

ticket_approvals (Aprovações em cadeia)
├── id: uuid (PK)
├── ticket_id: uuid (FK → tickets.id)
├── approval_level: integer (NOT NULL) -- 1=Encarregado, 2=Supervisor, 3=Gerente
├── approval_role: text (NOT NULL) -- 'encarregado', 'supervisor', 'gerente'
├── approved_by: uuid (FK → profiles.id, nullable)
├── status: text ('pending'|'approved'|'rejected', default 'pending')
├── decision_at: timestamptz (nullable)
├── notes: text (nullable) -- Observações do aprovador
├── created_at: timestamptz
└── updated_at: timestamptz
└── UNIQUE(ticket_id, approval_level)

ticket_comments
├── id: uuid (PK)
├── ticket_id: uuid (FK → tickets.id)
├── user_id: uuid (FK → profiles.id)
├── content: text (NOT NULL)
├── is_internal: boolean (default FALSE) -- Comentário interno (só dept. vê)
├── created_at: timestamptz
└── updated_at: timestamptz

ticket_attachments
├── id: uuid (PK)
├── ticket_id: uuid (FK → tickets.id)
├── comment_id: uuid (FK → ticket_comments.id, nullable) -- Anexo vinculado a comentário
├── file_name: text (NOT NULL)
├── file_path: text (NOT NULL) -- Path no Supabase Storage
├── file_size: integer (NOT NULL) -- Tamanho em bytes
├── file_type: text (NOT NULL) -- MIME type
├── uploaded_by: uuid (FK → profiles.id)
├── created_at: timestamptz
└── UNIQUE(ticket_id, file_path)

ticket_history (Auditoria de alterações)
├── id: uuid (PK)
├── ticket_id: uuid (FK → tickets.id)
├── user_id: uuid (FK → profiles.id)
├── action: text (NOT NULL) -- 'created', 'status_changed', 'assigned', 'commented', 'approval_*', etc.
├── old_value: text (nullable)
├── new_value: text (nullable)
├── metadata: jsonb (nullable) -- Dados adicionais
├── created_at: timestamptz
└── INDEX(ticket_id, created_at DESC)
```

### Enum de Status (Compras)

```typescript
type TicketPurchaseStatus =
  // Fase de aprovação (apenas para Manobristas)
  | 'awaiting_approval_encarregado'
  | 'awaiting_approval_supervisor'
  | 'awaiting_approval_gerente'
  // Fase de triagem e execução
  | 'awaiting_triage'      // Aguardando triagem
  | 'in_progress'          // Em andamento (triado, mas sem cotação ainda)
  | 'quoting'              // Em cotação
  | 'awaiting_approval'    // Em aprovação (cotação precisa de aprovação)
  | 'approved'             // Aprovado (cotação aprovada)
  | 'purchasing'           // Executando compra
  | 'in_delivery'          // Em entrega
  | 'delivered'            // Entrega realizada
  | 'evaluating'           // Avaliação da entrega
  | 'closed'               // Fechado
  | 'denied'               // Negado
  | 'cancelled'            // Cancelado
```

### Diagrama ER

```
┌─────────────────────┐     ┌──────────────────────────┐
│      tickets        │────<│   ticket_purchase_details│
│ (1 chamado)         │     │ (1:1 detalhes compras)   │
└─────────────────────┘     └──────────────────────────┘
         │
         │ (1:N)
         ├──────────────────────────────┬──────────────────────────────┐
         │                              │                              │
         ▼                              ▼                              ▼
┌─────────────────────┐     ┌──────────────────────────┐   ┌──────────────────────────┐
│  ticket_quotations  │     │    ticket_approvals      │   │    ticket_comments       │
│ (N cotações)        │     │ (até 3 aprovações)       │   │ (N comentários)          │
└─────────────────────┘     └──────────────────────────┘   └──────────────────────────┘
         │
         │ (1:N)
         ▼
┌─────────────────────┐     ┌──────────────────────────┐
│ ticket_attachments  │     │    ticket_history        │
│ (N anexos)          │     │ (N registros auditoria)  │
└─────────────────────┘     └──────────────────────────┘

┌─────────────────────┐     ┌──────────────────────────┐
│    departments      │────<│   ticket_categories      │
└─────────────────────┘     └──────────────────────────┘
```

---

## Tarefa 1: Criar Modelo de Dados (Migrations)

### Objetivo
Criar as tabelas, índices, constraints, RLS policies e triggers necessários para o módulo de Chamados.

### Subtarefas

#### 1.1 Migration: Criar Tabela ticket_categories

```sql
-- Migration: create_ticket_categories_table
CREATE TABLE public.ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, department_id)
);

COMMENT ON TABLE public.ticket_categories IS 'Categorias de chamados por departamento';

CREATE TRIGGER on_ticket_categories_updated
  BEFORE UPDATE ON public.ticket_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_ticket_categories_department_id ON public.ticket_categories(department_id);
CREATE INDEX idx_ticket_categories_status ON public.ticket_categories(status);
```

#### 1.2 Migration: Criar Tabela tickets

```sql
-- Migration: create_tickets_table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number SERIAL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  category_id UUID REFERENCES public.ticket_categories(id),
  unit_id UUID REFERENCES public.units(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'awaiting_triage',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  perceived_urgency TEXT CHECK (perceived_urgency IN ('low', 'medium', 'high')),
  due_date DATE,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  denial_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.tickets IS 'Chamados do sistema';
COMMENT ON COLUMN public.tickets.ticket_number IS 'Número sequencial para exibição (ex: #1234)';
COMMENT ON COLUMN public.tickets.status IS 'Status do chamado conforme fluxo do departamento';
COMMENT ON COLUMN public.tickets.priority IS 'Prioridade definida na triagem: low, medium, high, urgent';
COMMENT ON COLUMN public.tickets.perceived_urgency IS 'Urgência percebida pelo solicitante (informativo)';

CREATE TRIGGER on_tickets_updated
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índices
CREATE INDEX idx_tickets_department_id ON public.tickets(department_id);
CREATE INDEX idx_tickets_category_id ON public.tickets(category_id);
CREATE INDEX idx_tickets_unit_id ON public.tickets(unit_id);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at DESC);
CREATE INDEX idx_tickets_ticket_number ON public.tickets(ticket_number);
```

#### 1.3 Migration: Criar Tabela ticket_purchase_details

```sql
-- Migration: create_ticket_purchase_details_table
CREATE TABLE public.ticket_purchase_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_of_measure TEXT DEFAULT 'un',
  estimated_price DECIMAL(12, 2),
  approved_quotation_id UUID,
  delivery_address TEXT,
  delivery_date DATE,
  delivery_confirmed_at TIMESTAMPTZ,
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  delivery_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticket_id)
);

COMMENT ON TABLE public.ticket_purchase_details IS 'Detalhes específicos de chamados de Compras';

CREATE TRIGGER on_ticket_purchase_details_updated
  BEFORE UPDATE ON public.ticket_purchase_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

#### 1.4 Migration: Criar Tabela ticket_quotations

```sql
-- Migration: create_ticket_quotations_table
CREATE TABLE public.ticket_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  supplier_cnpj TEXT,
  supplier_contact TEXT,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  payment_terms TEXT,
  delivery_deadline DATE,
  validity_date DATE,
  supplier_response_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_selected BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ticket_quotations IS 'Cotações de fornecedores para chamados de compras';

CREATE TRIGGER on_ticket_quotations_updated
  BEFORE UPDATE ON public.ticket_quotations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_ticket_quotations_ticket_id ON public.ticket_quotations(ticket_id);
CREATE INDEX idx_ticket_quotations_status ON public.ticket_quotations(status);
CREATE INDEX idx_ticket_quotations_is_selected ON public.ticket_quotations(is_selected);

-- Add FK para approved_quotation_id após criar a tabela
ALTER TABLE public.ticket_purchase_details 
  ADD CONSTRAINT fk_approved_quotation 
  FOREIGN KEY (approved_quotation_id) 
  REFERENCES public.ticket_quotations(id);
```

#### 1.5 Migration: Criar Tabela ticket_approvals

```sql
-- Migration: create_ticket_approvals_table
CREATE TABLE public.ticket_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  approval_level INTEGER NOT NULL CHECK (approval_level IN (1, 2, 3)),
  approval_role TEXT NOT NULL CHECK (approval_role IN ('encarregado', 'supervisor', 'gerente')),
  approved_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decision_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticket_id, approval_level)
);

COMMENT ON TABLE public.ticket_approvals IS 'Aprovações em cadeia para chamados de Operações';
COMMENT ON COLUMN public.ticket_approvals.approval_level IS '1=Encarregado, 2=Supervisor, 3=Gerente';

CREATE TRIGGER on_ticket_approvals_updated
  BEFORE UPDATE ON public.ticket_approvals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_ticket_approvals_ticket_id ON public.ticket_approvals(ticket_id);
CREATE INDEX idx_ticket_approvals_status ON public.ticket_approvals(status);
CREATE INDEX idx_ticket_approvals_approved_by ON public.ticket_approvals(approved_by);
```

#### 1.6 Migration: Criar Tabela ticket_comments

```sql
-- Migration: create_ticket_comments_table
CREATE TABLE public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ticket_comments IS 'Comentários em chamados';
COMMENT ON COLUMN public.ticket_comments.is_internal IS 'Comentário interno visível apenas para o departamento';

CREATE TRIGGER on_ticket_comments_updated
  BEFORE UPDATE ON public.ticket_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_user_id ON public.ticket_comments(user_id);
CREATE INDEX idx_ticket_comments_created_at ON public.ticket_comments(created_at DESC);
```

#### 1.7 Migration: Criar Tabela ticket_attachments

```sql
-- Migration: create_ticket_attachments_table
CREATE TABLE public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.ticket_comments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticket_id, file_path)
);

COMMENT ON TABLE public.ticket_attachments IS 'Anexos de chamados';

CREATE INDEX idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);
CREATE INDEX idx_ticket_attachments_comment_id ON public.ticket_attachments(comment_id);
CREATE INDEX idx_ticket_attachments_uploaded_by ON public.ticket_attachments(uploaded_by);
```

#### 1.8 Migration: Criar Tabela ticket_history

```sql
-- Migration: create_ticket_history_table
CREATE TABLE public.ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ticket_history IS 'Histórico de alterações em chamados';
COMMENT ON COLUMN public.ticket_history.action IS 'Ação: created, status_changed, assigned, commented, approval_approved, approval_rejected, etc.';

CREATE INDEX idx_ticket_history_ticket_id ON public.ticket_history(ticket_id);
CREATE INDEX idx_ticket_history_created_at ON public.ticket_history(created_at DESC);
CREATE INDEX idx_ticket_history_action ON public.ticket_history(action);
```

#### 1.9 Migration: Criar RLS Policies

```sql
-- Migration: create_ticket_rls_policies

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_purchase_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;

-- ticket_categories: Todos podem ler ativos; admins gerenciam
CREATE POLICY "Anyone can view active categories" ON public.ticket_categories
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage categories" ON public.ticket_categories
  FOR ALL USING (public.is_admin());

-- tickets: Leitura complexa baseada em visibilidade
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view tickets of their units" ON public.tickets
  FOR SELECT USING (
    unit_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_units uu 
      WHERE uu.unit_id = tickets.unit_id 
      AND uu.user_id = auth.uid()
    )
  );

CREATE POLICY "Department members can view department tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.department_id = tickets.department_id
    )
  );

CREATE POLICY "Admins can view all tickets" ON public.tickets
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Ticket creator can update own ticket" ON public.tickets
  FOR UPDATE USING (
    created_by = auth.uid() AND status IN ('awaiting_triage', 'denied')
  );

CREATE POLICY "Assigned user can update ticket" ON public.tickets
  FOR UPDATE USING (assigned_to = auth.uid());

CREATE POLICY "Department supervisors can update department tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.department_id = tickets.department_id
      AND r.name IN ('Supervisor', 'Gerente')
    )
  );

CREATE POLICY "Admins can manage all tickets" ON public.tickets
  FOR ALL USING (public.is_admin());

-- ticket_purchase_details: Segue visibilidade do ticket
CREATE POLICY "Users can view purchase details of visible tickets" ON public.ticket_purchase_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id 
      AND (
        t.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_units uu 
          WHERE uu.unit_id = t.unit_id 
          AND uu.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON r.id = ur.role_id
          WHERE ur.user_id = auth.uid()
          AND r.department_id = t.department_id
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "Admins and department can manage purchase details" ON public.ticket_purchase_details
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.tickets t
      JOIN public.user_roles ur ON ur.user_id = auth.uid()
      JOIN public.roles r ON r.id = ur.role_id
      WHERE t.id = ticket_id
      AND r.department_id = t.department_id
    )
  );

-- ticket_quotations: Departamento de Compras gerencia
CREATE POLICY "Users can view quotations of visible tickets" ON public.ticket_quotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id 
      AND (
        t.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON r.id = ur.role_id
          WHERE ur.user_id = auth.uid()
          AND r.department_id = t.department_id
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "Compras department can manage quotations" ON public.ticket_quotations
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.tickets t
      JOIN public.user_roles ur ON ur.user_id = auth.uid()
      JOIN public.roles r ON r.id = ur.role_id
      JOIN public.departments d ON d.id = r.department_id
      WHERE t.id = ticket_id
      AND d.name = 'Compras'
    )
  );

-- ticket_approvals: Aprovadores podem ver e atualizar
CREATE POLICY "Users can view approvals of own tickets" ON public.ticket_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id 
      AND t.created_by = auth.uid()
    )
  );

CREATE POLICY "Approvers can view and update pending approvals" ON public.ticket_approvals
  FOR ALL USING (
    status = 'pending' AND (
      -- Encarregado pode aprovar level 1
      (approval_level = 1 AND EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'Encarregado'
      ))
      -- Supervisor pode aprovar level 2
      OR (approval_level = 2 AND EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'Supervisor'
      ))
      -- Gerente pode aprovar level 3
      OR (approval_level = 3 AND EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'Gerente'
      ))
    )
  );

CREATE POLICY "Admins can manage all approvals" ON public.ticket_approvals
  FOR ALL USING (public.is_admin());

-- ticket_comments: Usuários podem comentar em tickets visíveis
CREATE POLICY "Users can view comments of visible tickets" ON public.ticket_comments
  FOR SELECT USING (
    (NOT is_internal OR EXISTS (
      SELECT 1 FROM public.tickets t
      JOIN public.user_roles ur ON ur.user_id = auth.uid()
      JOIN public.roles r ON r.id = ur.role_id
      WHERE t.id = ticket_id
      AND r.department_id = t.department_id
    ))
    AND EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id 
      AND (
        t.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_units uu 
          WHERE uu.unit_id = t.unit_id 
          AND uu.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON r.id = ur.role_id
          WHERE ur.user_id = auth.uid()
          AND r.department_id = t.department_id
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "Users can create comments on visible tickets" ON public.ticket_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id 
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON r.id = ur.role_id
          WHERE ur.user_id = auth.uid()
          AND r.department_id = t.department_id
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "Admins can manage all comments" ON public.ticket_comments
  FOR ALL USING (public.is_admin());

-- ticket_attachments: Segue visibilidade do ticket
CREATE POLICY "Users can view attachments of visible tickets" ON public.ticket_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id 
      AND (
        t.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON r.id = ur.role_id
          WHERE ur.user_id = auth.uid()
          AND r.department_id = t.department_id
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "Users can upload attachments to own tickets" ON public.ticket_attachments
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id 
      AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all attachments" ON public.ticket_attachments
  FOR ALL USING (public.is_admin());

-- ticket_history: Leitura para quem vê o ticket
CREATE POLICY "Users can view history of visible tickets" ON public.ticket_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id 
      AND (
        t.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON r.id = ur.role_id
          WHERE ur.user_id = auth.uid()
          AND r.department_id = t.department_id
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "System can insert history" ON public.ticket_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all history" ON public.ticket_history
  FOR ALL USING (public.is_admin());
```

#### 1.10 Migration: Criar Functions e Triggers de Auditoria

```sql
-- Migration: create_ticket_functions

-- Function para registrar histórico automaticamente
CREATE OR REPLACE FUNCTION public.log_ticket_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudança de status
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status_changed', OLD.status, NEW.status);
  END IF;
  
  -- Registrar atribuição
  IF TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'assigned', OLD.assigned_to::text, NEW.assigned_to::text);
  END IF;
  
  -- Registrar priorização
  IF TG_OP = 'UPDATE' AND OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO public.ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'priority_changed', OLD.priority, NEW.priority);
  END IF;
  
  -- Registrar criação
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.ticket_history (ticket_id, user_id, action, new_value)
    VALUES (NEW.id, NEW.created_by, 'created', NEW.status);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auditoria de tickets
CREATE TRIGGER on_ticket_change
  AFTER INSERT OR UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.log_ticket_change();

-- Function para verificar se usuário precisa de aprovação
CREATE OR REPLACE FUNCTION public.ticket_needs_approval(
  p_created_by UUID,
  p_department_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_manobrista BOOLEAN;
  v_is_compras_or_manutencao BOOLEAN;
BEGIN
  -- Verificar se criador é Manobrista
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_created_by
    AND r.name = 'Manobrista'
  ) INTO v_is_manobrista;
  
  -- Verificar se departamento destino é Compras ou Manutenção
  SELECT EXISTS (
    SELECT 1 FROM public.departments d
    WHERE d.id = p_department_id
    AND d.name IN ('Compras', 'Manutenção')
  ) INTO v_is_compras_or_manutencao;
  
  RETURN v_is_manobrista AND v_is_compras_or_manutencao;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function para criar registros de aprovação
CREATE OR REPLACE FUNCTION public.create_ticket_approvals(p_ticket_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Criar 3 níveis de aprovação
  INSERT INTO public.ticket_approvals (ticket_id, approval_level, approval_role)
  VALUES 
    (p_ticket_id, 1, 'encarregado'),
    (p_ticket_id, 2, 'supervisor'),
    (p_ticket_id, 3, 'gerente');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 1.11 Migration: Criar View de Tickets com Detalhes

```sql
-- Migration: create_ticket_views

CREATE OR REPLACE VIEW public.tickets_with_details AS
SELECT 
  t.id,
  t.ticket_number,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.perceived_urgency,
  t.due_date,
  t.denial_reason,
  t.created_at,
  t.updated_at,
  t.resolved_at,
  t.closed_at,
  -- Departamento
  d.id AS department_id,
  d.name AS department_name,
  -- Categoria
  c.id AS category_id,
  c.name AS category_name,
  -- Unidade
  u.id AS unit_id,
  u.name AS unit_name,
  u.code AS unit_code,
  -- Criador
  p_created.id AS created_by_id,
  p_created.full_name AS created_by_name,
  p_created.avatar_url AS created_by_avatar,
  -- Responsável
  p_assigned.id AS assigned_to_id,
  p_assigned.full_name AS assigned_to_name,
  p_assigned.avatar_url AS assigned_to_avatar,
  -- Contagens
  (SELECT COUNT(*) FROM public.ticket_comments tc WHERE tc.ticket_id = t.id) AS comments_count,
  (SELECT COUNT(*) FROM public.ticket_attachments ta WHERE ta.ticket_id = t.id) AS attachments_count,
  (SELECT COUNT(*) FROM public.ticket_quotations tq WHERE tq.ticket_id = t.id) AS quotations_count,
  -- Detalhes de compra (se existir)
  pd.item_name,
  pd.quantity,
  pd.unit_of_measure,
  pd.estimated_price
FROM public.tickets t
LEFT JOIN public.departments d ON d.id = t.department_id
LEFT JOIN public.ticket_categories c ON c.id = t.category_id
LEFT JOIN public.units u ON u.id = t.unit_id
LEFT JOIN public.profiles p_created ON p_created.id = t.created_by
LEFT JOIN public.profiles p_assigned ON p_assigned.id = t.assigned_to
LEFT JOIN public.ticket_purchase_details pd ON pd.ticket_id = t.id;
```

#### 1.12 Migration: Inserir Categorias de Compras (Seed)

```sql
-- Migration: seed_ticket_categories_compras

-- Obter ID do departamento de Compras
DO $$
DECLARE
  v_compras_id UUID;
BEGIN
  SELECT id INTO v_compras_id FROM public.departments WHERE name = 'Compras';
  
  IF v_compras_id IS NOT NULL THEN
    INSERT INTO public.ticket_categories (name, department_id) VALUES
      ('Material de Limpeza', v_compras_id),
      ('Material de Escritório', v_compras_id),
      ('Equipamentos', v_compras_id),
      ('Uniformes', v_compras_id),
      ('EPI', v_compras_id),
      ('Ferramentas', v_compras_id),
      ('Sinalização', v_compras_id),
      ('Outros', v_compras_id)
    ON CONFLICT (name, department_id) DO NOTHING;
  END IF;
END $$;
```

### Critérios de Aceite
- [x] Tabelas criadas e validadas via `mcp_supabase_list_tables`
- [x] Índices criados e funcionando
- [x] RLS policies configuradas (criador vs departamento vs admin)
- [x] Triggers de auditoria funcionando
- [x] View `tickets_with_details` retornando dados
- [x] TypeScript types regenerados
- [x] Categorias de Compras inseridas

---

## Tarefa 2: Criar Tela de Abertura de Chamado de Compras

### Objetivo
Implementar formulário para criação de chamados de Compras com campos específicos.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/chamados/
├── compras/
│   ├── page.tsx                      # Listagem de chamados de Compras
│   ├── actions.ts                    # Server Actions
│   ├── novo/
│   │   └── page.tsx                  # Formulário de abertura
│   ├── [ticketId]/
│   │   ├── page.tsx                  # Detalhes do chamado
│   │   └── components/
│   │       ├── ticket-header.tsx
│   │       ├── ticket-timeline.tsx
│   │       ├── ticket-comments.tsx
│   │       ├── ticket-attachments.tsx
│   │       ├── ticket-quotations.tsx
│   │       ├── ticket-approvals.tsx
│   │       └── ticket-actions.tsx
│   └── components/
│       ├── ticket-form.tsx           # Formulário de chamado
│       ├── tickets-table.tsx         # Tabela de chamados
│       ├── tickets-filters.tsx       # Filtros
│       ├── tickets-stats-cards.tsx   # Cards de estatísticas
│       ├── ticket-card.tsx           # Card de chamado
│       └── status-badge.tsx          # Badge de status
```

### Subtarefas

#### 2.1 Criar Server Actions para Chamados de Compras

**Arquivo:** `apps/web/src/app/(app)/chamados/compras/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Criar chamado de Compras
export async function createPurchaseTicket(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  
  // Obter departamento de Compras
  const { data: comprasDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Compras')
    .single()
  
  if (!comprasDept) throw new Error('Departamento de Compras não encontrado')
  
  // Extrair dados do formulário
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string | null
  const unit_id = formData.get('unit_id') as string | null
  const perceived_urgency = formData.get('perceived_urgency') as string | null
  const item_name = formData.get('item_name') as string
  const quantity = parseInt(formData.get('quantity') as string)
  const unit_of_measure = formData.get('unit_of_measure') as string | null
  const estimated_price = formData.get('estimated_price') ? 
    parseFloat(formData.get('estimated_price') as string) : null
  
  // Verificar se precisa de aprovação
  const { data: needsApproval } = await supabase
    .rpc('ticket_needs_approval', {
      p_created_by: user.id,
      p_department_id: comprasDept.id
    })
  
  const initialStatus = needsApproval ? 
    'awaiting_approval_encarregado' : 'awaiting_triage'
  
  // Criar ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      title,
      description,
      department_id: comprasDept.id,
      category_id: category_id || null,
      unit_id: unit_id || null,
      created_by: user.id,
      status: initialStatus,
      perceived_urgency: perceived_urgency || null
    })
    .select()
    .single()
  
  if (ticketError) return { error: ticketError.message }
  
  // Criar detalhes de compra
  const { error: detailsError } = await supabase
    .from('ticket_purchase_details')
    .insert({
      ticket_id: ticket.id,
      item_name,
      quantity,
      unit_of_measure: unit_of_measure || 'un',
      estimated_price
    })
  
  if (detailsError) {
    // Rollback: deletar ticket
    await supabase.from('tickets').delete().eq('id', ticket.id)
    return { error: detailsError.message }
  }
  
  // Se precisa aprovação, criar registros de aprovação
  if (needsApproval) {
    await supabase.rpc('create_ticket_approvals', { p_ticket_id: ticket.id })
  }
  
  revalidatePath('/chamados/compras')
  redirect(`/chamados/compras/${ticket.id}`)
}

// Listar categorias de Compras
export async function getPurchaseCategories() {
  const supabase = await createClient()
  
  const { data: comprasDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Compras')
    .single()
  
  if (!comprasDept) return []
  
  const { data, error } = await supabase
    .from('ticket_categories')
    .select('*')
    .eq('department_id', comprasDept.id)
    .eq('status', 'active')
    .order('name')
  
  if (error) throw error
  return data
}

// Obter unidades do usuário
export async function getUserUnits() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  // Se admin, retorna todas
  const { data: isAdmin } = await supabase.rpc('is_admin')
  
  if (isAdmin) {
    const { data } = await supabase
      .from('units')
      .select('id, name, code')
      .eq('status', 'active')
      .order('name')
    return data || []
  }
  
  // Senão, apenas unidades vinculadas
  const { data } = await supabase
    .from('user_units')
    .select('unit:units(id, name, code)')
    .eq('user_id', user.id)
  
  return data?.map(d => d.unit).filter(Boolean) || []
}
```

#### 2.2 Criar Formulário de Abertura

**Arquivo:** `apps/web/src/app/(app)/chamados/compras/novo/page.tsx`

**Campos:**
| Campo | Tipo | Validação | Obrigatório |
|-------|------|-----------|-------------|
| title | Input text | Mínimo 5 caracteres | Sim |
| category_id | Select | Categorias de Compras | Sim |
| unit_id | Select | Unidades do usuário | Condicional |
| item_name | Input text | Mínimo 3 caracteres | Sim |
| quantity | Input number | > 0 | Sim |
| unit_of_measure | Select | un, kg, m², litros, etc. | Sim (default: un) |
| estimated_price | Input number | >= 0 | Não |
| description | Textarea | Mínimo 10 caracteres | Sim |
| perceived_urgency | Select | Baixa/Média/Alta | Não |
| attachments | File input (múltiplo) | Max 5MB cada | Não |

### Critérios de Aceite
- [x] Formulário validado no client e server
- [x] Chamado criado com status correto (com/sem aprovação)
- [x] Detalhes de compra vinculados
- [x] Aprovações criadas quando necessário
- [ ] Upload de anexos funcional (Supabase Storage) — Implementação adiada para fase posterior
- [x] Redirect para detalhes após criação
- [x] Responsivo em mobile

---

## Tarefa 3: Criar Tela de Listagem de Chamados de Compras

### Objetivo
Implementar listagem de chamados de Compras com filtros, ordenação e paginação.

### Subtarefas

#### 3.1 Criar Server Actions de Listagem

```typescript
// Listar chamados de Compras
export async function getPurchaseTickets(filters?: {
  status?: string
  priority?: string
  category_id?: string
  unit_id?: string
  assigned_to?: string
  search?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  // Obter departamento de Compras
  const { data: comprasDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Compras')
    .single()
  
  if (!comprasDept) return { data: [], count: 0, page, limit }
  
  let query = supabase
    .from('tickets_with_details')
    .select('*', { count: 'exact' })
    .eq('department_id', comprasDept.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }
  
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }
  
  if (filters?.unit_id) {
    query = query.eq('unit_id', filters.unit_id)
  }
  
  if (filters?.assigned_to) {
    query = query.eq('assigned_to_id', filters.assigned_to)
  }
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,ticket_number.eq.${parseInt(filters.search) || 0}`)
  }
  
  if (filters?.startDate) {
    query = query.gte('created_at', `${filters.startDate}T00:00:00`)
  }
  
  if (filters?.endDate) {
    query = query.lte('created_at', `${filters.endDate}T23:59:59`)
  }
  
  const { data, error, count } = await query
  
  if (error) throw error
  return { data, count, page, limit }
}

// Estatísticas de Compras
export async function getPurchaseStats() {
  const supabase = await createClient()
  
  const { data: comprasDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Compras')
    .single()
  
  if (!comprasDept) return { total: 0, awaitingTriage: 0, inProgress: 0, closed: 0 }
  
  const { data } = await supabase
    .from('tickets')
    .select('status')
    .eq('department_id', comprasDept.id)
  
  const total = data?.length || 0
  const awaitingTriage = data?.filter(t => t.status === 'awaiting_triage').length || 0
  const inProgress = data?.filter(t => !['closed', 'cancelled', 'denied', 'awaiting_triage'].includes(t.status)).length || 0
  const closed = data?.filter(t => t.status === 'closed').length || 0
  
  return { total, awaitingTriage, inProgress, closed }
}
```

#### 3.2 Criar Página de Listagem

**Características:**
- Cards de estatísticas no topo
- Filtros: status, prioridade, categoria, unidade, período, busca
- Tabela com colunas: #, Título, Item, Categoria, Unidade, Status, Prioridade, Criado por, Data
- Paginação server-side
- Link para detalhes

### Critérios de Aceite
- [x] Listagem carrega corretamente
- [x] Filtros funcionam
- [x] Paginação funcional
- [x] Busca por número ou título
- [x] Visibilidade respeitada (RLS)
- [x] Responsivo em mobile

---

## Tarefa 4: Implementar Fluxo de Execução do Chamado de Compras

### Objetivo
Implementar tela de detalhes com timeline, comentários, anexos, cotações e ações de status.

### Subtarefas

#### 4.1 Criar Página de Detalhes

**Seções:**
1. **Header:** Número, título, status (badge), prioridade, ações
2. **Informações Gerais:** Categoria, item, quantidade, unidade, solicitante, data
3. **Aprovações (se aplicável):** Timeline de aprovações com status
4. **Cotações:** Lista de cotações com ações (adicionar, aprovar, selecionar)
5. **Timeline:** Histórico de alterações
6. **Comentários:** Thread de discussão
7. **Anexos:** Lista de arquivos

#### 4.2 Criar Sistema de Cotações

```typescript
// Adicionar cotação
export async function addQuotation(ticketId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  
  const supplier_name = formData.get('supplier_name') as string
  const supplier_cnpj = formData.get('supplier_cnpj') as string | null
  const supplier_contact = formData.get('supplier_contact') as string | null
  const unit_price = parseFloat(formData.get('unit_price') as string)
  const quantity = parseInt(formData.get('quantity') as string)
  const total_price = unit_price * quantity
  const payment_terms = formData.get('payment_terms') as string | null
  const delivery_deadline = formData.get('delivery_deadline') as string | null
  const validity_date = formData.get('validity_date') as string | null
  const notes = formData.get('notes') as string | null
  
  const { error } = await supabase
    .from('ticket_quotations')
    .insert({
      ticket_id: ticketId,
      supplier_name,
      supplier_cnpj,
      supplier_contact,
      unit_price,
      quantity,
      total_price,
      payment_terms,
      delivery_deadline: delivery_deadline || null,
      validity_date: validity_date || null,
      notes,
      created_by: user.id
    })
  
  if (error) return { error: error.message }
  
  // Atualizar status se ainda não estiver em cotação
  await supabase
    .from('tickets')
    .update({ status: 'quoting' })
    .eq('id', ticketId)
    .in('status', ['awaiting_triage', 'in_progress'])
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  return { success: true }
}

// Selecionar cotação
export async function selectQuotation(ticketId: string, quotationId: string) {
  const supabase = await createClient()
  
  // Desmarcar outras cotações
  await supabase
    .from('ticket_quotations')
    .update({ is_selected: false })
    .eq('ticket_id', ticketId)
  
  // Marcar cotação selecionada
  const { error } = await supabase
    .from('ticket_quotations')
    .update({ is_selected: true, status: 'approved' })
    .eq('id', quotationId)
  
  if (error) return { error: error.message }
  
  // Vincular aos detalhes de compra
  await supabase
    .from('ticket_purchase_details')
    .update({ approved_quotation_id: quotationId })
    .eq('ticket_id', ticketId)
  
  // Atualizar status do ticket
  await supabase
    .from('tickets')
    .update({ status: 'approved' })
    .eq('id', ticketId)
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  return { success: true }
}
```

#### 4.3 Criar Transições de Status

```typescript
// Transições de status permitidas
const statusTransitions: Record<string, string[]> = {
  'awaiting_triage': ['in_progress', 'quoting', 'denied'],
  'in_progress': ['quoting', 'denied', 'cancelled'],
  'quoting': ['awaiting_approval', 'approved', 'denied'],
  'awaiting_approval': ['approved', 'denied'],
  'approved': ['purchasing'],
  'purchasing': ['in_delivery'],
  'in_delivery': ['delivered'],
  'delivered': ['evaluating'],
  'evaluating': ['closed'],
  'denied': ['awaiting_triage'], // Pode reenviar
  'closed': [], // Final
  'cancelled': [] // Final
}

// Mudar status
export async function changeTicketStatus(ticketId: string, newStatus: string, reason?: string) {
  const supabase = await createClient()
  
  const { data: ticket } = await supabase
    .from('tickets')
    .select('status')
    .eq('id', ticketId)
    .single()
  
  if (!ticket) return { error: 'Chamado não encontrado' }
  
  const allowedTransitions = statusTransitions[ticket.status] || []
  if (!allowedTransitions.includes(newStatus)) {
    return { error: `Transição de ${ticket.status} para ${newStatus} não permitida` }
  }
  
  const updates: Record<string, any> = { status: newStatus }
  
  if (newStatus === 'denied' && reason) {
    updates.denial_reason = reason
  }
  
  if (newStatus === 'closed') {
    updates.closed_at = new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
  
  if (error) return { error: error.message }
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  return { success: true }
}
```

### Critérios de Aceite
- [x] Detalhes exibem todas informações
- [x] Sistema de cotações funcional
- [x] Transições de status respeitam regras
- [x] Timeline mostra histórico completo
- [x] Comentários podem ser adicionados
- [ ] Anexos podem ser visualizados/baixados (implementação adiada para fase posterior)

---

## Tarefa 5: Implementar Triagem e Priorização

### Objetivo
Permitir que Supervisores/Gerentes de Compras façam triagem dos chamados.

### Subtarefas

#### 5.1 Criar Componente de Triagem

```typescript
// Triar chamado
export async function triageTicket(ticketId: string, formData: FormData) {
  const supabase = await createClient()
  
  const priority = formData.get('priority') as string
  const assigned_to = formData.get('assigned_to') as string
  const due_date = formData.get('due_date') as string | null
  
  const { error } = await supabase
    .from('tickets')
    .update({
      priority,
      assigned_to,
      due_date: due_date || null,
      status: 'in_progress'
    })
    .eq('id', ticketId)
  
  if (error) return { error: error.message }
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  revalidatePath('/chamados/compras')
  return { success: true }
}

// Listar membros do departamento de Compras
export async function getComprasDepartmentMembers() {
  const supabase = await createClient()
  
  const { data: comprasDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Compras')
    .single()
  
  if (!comprasDept) return []
  
  const { data } = await supabase
    .from('user_roles')
    .select(`
      user:profiles(id, full_name, email, avatar_url),
      role:roles(name)
    `)
    .eq('roles.department_id', comprasDept.id)
  
  return data?.map(d => ({ ...d.user, role: d.role?.name })) || []
}
```

#### 5.2 Criar Dialog de Triagem

**Campos:**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| priority | Select (Baixa/Média/Alta/Urgente) | Sim |
| assigned_to | Select (membros do dept.) | Sim |
| due_date | Date picker | Não |

### Critérios de Aceite
- [ ] Apenas Supervisores/Gerentes podem triar
- [ ] Triagem define prioridade e responsável
- [ ] Status muda para "Em andamento" após triagem
- [ ] Histórico registra triagem

---

## Tarefa 6: Implementar Fluxo de Aprovações

### Objetivo
Implementar aprovação em cadeia para chamados de Manobristas.

### Subtarefas

#### 6.1 Criar Componente de Aprovação

```typescript
// Aprovar/Rejeitar chamado
export async function handleApproval(
  ticketId: string, 
  approvalId: string, 
  decision: 'approved' | 'rejected',
  notes?: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  
  const { data: approval } = await supabase
    .from('ticket_approvals')
    .select('approval_level, approval_role')
    .eq('id', approvalId)
    .single()
  
  if (!approval) return { error: 'Aprovação não encontrada' }
  
  // Atualizar aprovação
  const { error } = await supabase
    .from('ticket_approvals')
    .update({
      approved_by: user.id,
      status: decision,
      decision_at: new Date().toISOString(),
      notes
    })
    .eq('id', approvalId)
  
  if (error) return { error: error.message }
  
  // Atualizar status do ticket
  if (decision === 'rejected') {
    await supabase
      .from('tickets')
      .update({ 
        status: 'denied',
        denial_reason: notes || 'Negado na aprovação'
      })
      .eq('id', ticketId)
  } else {
    // Aprovar e avançar para próximo nível ou triagem
    const nextStatusMap: Record<number, string> = {
      1: 'awaiting_approval_supervisor',
      2: 'awaiting_approval_gerente',
      3: 'awaiting_triage'
    }
    
    await supabase
      .from('tickets')
      .update({ status: nextStatusMap[approval.approval_level] })
      .eq('id', ticketId)
  }
  
  revalidatePath(`/chamados/compras/${ticketId}`)
  return { success: true }
}

// Listar aprovações pendentes para o usuário
export async function getPendingApprovals() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  // Verificar cargo do usuário
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', user.id)
  
  const roles = userRoles?.map(r => r.role?.name).filter(Boolean) || []
  
  let approvalLevel: number | null = null
  if (roles.includes('Encarregado')) approvalLevel = 1
  else if (roles.includes('Supervisor')) approvalLevel = 2
  else if (roles.includes('Gerente')) approvalLevel = 3
  
  if (!approvalLevel) return []
  
  const { data } = await supabase
    .from('ticket_approvals')
    .select(`
      *,
      ticket:tickets(
        id,
        ticket_number,
        title,
        created_by,
        created_at,
        creator:profiles!created_by(full_name)
      )
    `)
    .eq('approval_level', approvalLevel)
    .eq('status', 'pending')
  
  return data || []
}
```

### Critérios de Aceite
- [ ] Aprovações em cadeia funcionam (Enc → Sup → Ger)
- [ ] Rejeição em qualquer nível nega o chamado
- [ ] Status do ticket atualizado corretamente
- [ ] Histórico registra cada aprovação/rejeição

---

## Tarefa 7: Implementar Sistema de Cotações

### Objetivo
Permitir gerenciamento completo de cotações nos chamados de Compras.

### Subtarefas
- Dialog de adicionar cotação
- Lista de cotações com comparativo
- Seleção de cotação vencedora
- Aprovação de cotação (se necessário)

### Critérios de Aceite
- [ ] Cotações podem ser adicionadas
- [ ] Comparativo visual de cotações
- [ ] Cotação pode ser selecionada
- [ ] Status atualizado após seleção

---

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criação de migrations, RLS policies, índices | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Frontend Specialist | Implementação das telas (abertura, listagem, detalhes) | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Backend Specialist | Server Actions, integração com Supabase, validações | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Security Auditor | Validação de RLS, proteção de rotas, permissões | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Code Reviewer | Revisão de código, padrões e consistência | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Feature Developer | Implementação end-to-end das funcionalidades | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |

## Documentation Touchpoints

| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Security & Compliance Notes | [security.md](../docs/security.md) | agent-update:security | Auth model, secrets management, compliance requirements |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | System diagrams, integration specs, queue topics |

## Risk Assessment

### Identified Risks

| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| RLS mal configurado expõe dados | Medium | High | Testar policies com diferentes perfis de usuário | Security Auditor |
| Performance em listagem com muitos chamados | Medium | Medium | Índices criados; paginação server-side | Database Specialist |
| Fluxo de aprovação complexo | Medium | Medium | Testes E2E completos do fluxo | Backend Specialist |
| UX confusa no gerenciamento de cotações | Medium | Medium | Design mobile-first; interface intuitiva | Frontend Specialist |
| Uploads grandes impactam performance | Low | Medium | Limite de 5MB por arquivo; validação | Backend Specialist |
| Histórico dessincronizado | Low | Low | Triggers automáticos no banco | Database Specialist |

### Dependencies

- **Internal:** Tabelas `units`, `profiles`, `user_units`, `departments`, `roles` já existem; módulos de usuários e unidades implementados
- **External:** Supabase Database, Supabase Storage
- **Technical:** Next.js 15 Server Actions, @supabase/ssr, shadcn/ui

### Assumptions

- Chamados de Compras são o foco desta etapa; Manutenção, RH serão implementados separadamente
- Categorias de Compras são configuráveis via admin (seed inicial)
- Fluxo de aprovação só se aplica a Manobristas
- Cotações são gerenciadas pelo departamento de Compras
- Anexos armazenados no Supabase Storage

## Resource Estimation

### Time Allocation

| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery & Modelo de Dados | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2a - Tela de Abertura de Chamado | 1 dia | 1 dia | 1 pessoa |
| Phase 2b - Tela de Listagem | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2c - Fluxo de Execução | 1.5 dias | 1.5 dias | 1 pessoa |
| Phase 2d - Triagem e Priorização | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2e - Fluxo de Aprovações | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2f - Sistema de Cotações | 1 dia | 1 dia | 1 pessoa |
| Phase 3 - Validation & Handoff | 0.5 dia | 0.5 dia | 1 pessoa |
| **Total** | **6 dias** | **6 dias** | **-** |

### Required Skills
- Next.js 15 (App Router, Server Actions)
- Supabase (Database, RLS, Functions, Storage)
- TypeScript
- shadcn/ui + Tailwind CSS

### Resource Availability
- **Available:** 1 dev full-stack
- **Blocked:** N/A
- **Escalation:** Tech Lead para dúvidas de arquitetura

## Working Phases

### Phase 1 — Discovery & Modelo de Dados (0.5 dia)

**Steps**
1. Validar modelo de dados proposto com PRD
2. Criar migrations via `mcp_supabase_apply_migration`
3. Testar RLS policies com diferentes perfis
4. Regenerar TypeScript types via `mcp_supabase_generate_typescript_types`
5. Rodar `mcp_supabase_get_advisors` (security)

**Commit Checkpoint**
- `git commit -m "feat(tickets): create database schema and migrations"`

### Phase 2 — Implementation & Iteration (5 dias)

**Steps**

**Dia 1: Tela de Abertura de Chamado**
1. Criar estrutura de arquivos `/chamados/compras/`
2. Implementar Server Actions de criação
3. Criar formulário de abertura
4. Implementar upload de anexos

**Dia 2: Listagem e Detalhes**
1. Criar página de listagem com filtros
2. Implementar paginação
3. Criar página de detalhes do chamado
4. Implementar timeline de histórico

**Dia 3-4: Fluxo de Execução**
1. Implementar transições de status
2. Criar sistema de comentários
3. Implementar triagem e priorização
4. Criar componente de aprovações

**Dia 5: Sistema de Cotações**
1. Criar formulário de cotação
2. Implementar lista comparativa
3. Implementar seleção de cotação
4. Integrar com fluxo de status

**Commit Checkpoints**
- `git commit -m "feat(tickets): implement purchase ticket creation"`
- `git commit -m "feat(tickets): implement listing and details"`
- `git commit -m "feat(tickets): implement execution flow and approvals"`
- `git commit -m "feat(tickets): implement quotation system"`

### Phase 3 — Validation & Handoff (0.5 dia)

**Steps**
1. Testar fluxo completo: criar chamado → aprovação → triagem → cotação → execução → fechamento
2. Testar RLS: Manobrista vs Compras vs Admin
3. Validar responsividade (mobile)
4. Rodar `mcp_supabase_get_advisors` (security)
5. Atualizar `entrega1_tarefas.md` com itens concluídos
6. Atualizar README do plans

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation - chamados-compras"`

## Rollback Plan

### Rollback Triggers
- Bugs críticos em RLS expondo dados de chamados
- Fluxo de aprovação inconsistente
- Performance degradada na listagem
- Perda de anexos ou histórico

### Rollback Procedures

#### Phase 1 Rollback
- Action: Reverter migrations; DROP TABLES
- Data Impact: Nenhum (sem dados de produção ainda)
- Estimated Time: < 30 min

#### Phase 2 Rollback
- Action: Reverter commits de feature; restaurar versão anterior
- Data Impact: Possível perda de chamados de teste
- Estimated Time: 1-2 horas

#### Phase 3 Rollback
- Action: Reverter ajustes finais; manter funcionalidade core
- Data Impact: Mínimo
- Estimated Time: < 1 hora

### Post-Rollback Actions
1. Documentar razão do rollback
2. Notificar stakeholders
3. Analisar causa raiz
4. Atualizar plano com lições aprendidas

## Evidence & Follow-up

### Evidências a Coletar
- Screenshot da tela de abertura de chamado
- Screenshot da listagem de chamados
- Screenshot dos detalhes do chamado
- Screenshot do fluxo de aprovação
- Screenshot do sistema de cotações
- Screenshot da triagem
- Log de teste de RLS (Manobrista vs Compras vs Admin)
- Output de `mcp_supabase_get_advisors` (security)
- TypeScript types gerados (`database.types.ts`)
- Output de `mcp_supabase_list_tables` mostrando novas tabelas

### Follow-up Actions
- [ ] Atualizar `entrega1_tarefas.md` marcando itens 68-74 como concluídos
- [ ] Atualizar `README.md` do plans com status
- [ ] Preparar dados de seed (categorias de Compras)
- [ ] Documentar fluxo de chamados para usuários

---

## Referências Técnicas

### Stack do Projeto
- **Framework:** Next.js 15 (App Router)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **UI:** shadcn/ui + Tailwind CSS
- **Design System:** [design-system.md](../../design-system.md)

### Documentação
- [PRD do GAPP](../../projeto/PRD.md) — Seção 3.1 Sistema de Chamados
- [Abertura de Chamados](../../projeto/chamados/abertura.md)
- [Execuções de Chamados](../../projeto/chamados/execuções.md)
- [Fluxo de Aprovações](../../projeto/chamados/aprovacoes.md)
- [Entrega 1 Tarefas](../../projeto/entregaveis/entrega1_tarefas.md)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

### Arquivos Existentes (Referência)
- `apps/web/src/app/(app)/checklists/` — Módulo de checklists (padrão a seguir)
- `apps/web/src/app/(app)/unidades/` — Módulo de unidades (padrão a seguir)
- `apps/web/src/app/(app)/usuarios/` — Módulo de usuários (padrão a seguir)
- `apps/web/src/lib/supabase/client.ts` — Cliente browser
- `apps/web/src/lib/supabase/server.ts` — Cliente server
- `apps/web/src/lib/supabase/database.types.ts` — Types gerados
- `apps/web/src/lib/auth/permissions.ts` — Sistema de permissões
- `apps/web/src/components/auth/require-permission.tsx` — Componente de proteção

### Permissões a Adicionar ao RBAC
```typescript
// Em apps/web/src/lib/auth/permissions.ts
export const PERMISSIONS = {
  // ... existentes ...
  
  // Chamados
  'tickets:read': ['Desenvolvedor', 'Administrador', 'Diretor', /* todos */],
  'tickets:create': ['Desenvolvedor', 'Administrador', /* todos */],
  'tickets:delete': ['Desenvolvedor', 'Administrador'],
  'tickets:triage': ['Desenvolvedor', 'Administrador', 'Supervisor', 'Gerente'], // Por departamento
  'tickets:approve': ['Desenvolvedor', 'Administrador', 'Encarregado', 'Supervisor', 'Gerente'],
  'tickets:manage_quotations': ['Desenvolvedor', 'Administrador'], // Dept. Compras
}
```

<!-- agent-update:end -->
