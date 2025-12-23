---
id: plan-chamados-manutencao
ai_update_goal: "Implementar o módulo completo de Chamados de Manutenção da Entrega 1, incluindo tela de abertura, listagem, fluxo de execução com análise técnica e triagem/priorização."
required_inputs:
  - "Checklist da entrega: projeto/entregaveis/entrega1_tarefas.md (Chamados — Manutenção — itens 78-80)"
  - "PRD: projeto/PRD.md (seção 3.1 Sistema de Chamados)"
  - "Abertura de chamados: projeto/chamados/abertura.md"
  - "Execuções de chamados: projeto/chamados/execuções.md"
  - "Fluxo de aprovações: projeto/chamados/aprovacoes.md"
  - "Design System: design-system.md (tokens e componentes)"
  - "Modelo de dados existente: tickets, ticket_comments, ticket_attachments, ticket_history (criados em chamados-compras)"
  - "Plano de referência: .context/plans/chamados-compras.md"
success_criteria:
  - "Tabela ticket_maintenance_details criada para campos específicos de Manutenção"
  - "Tabela ticket_maintenance_executions criada para execuções de manutenção"
  - "Categorias de Manutenção (assuntos) inseridas"
  - "Tela de abertura de chamado de Manutenção funcional"
  - "Tela de listagem de chamados de Manutenção com filtros"
  - "Fluxo de execução do chamado de Manutenção com status específicos"
  - "Triagem e priorização por Gerentes/Supervisores de Manutenção"
  - "Fluxo de aprovações (Operações → Manutenção) quando aplicável"
  - "RLS e políticas de segurança configuradas corretamente"
related_agents:
  - "code-reviewer"
  - "feature-developer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
  - "database-specialist"
---

<!-- agent-update:start:plan-chamados-manutencao -->
# Plano de Chamados de Manutenção - GAPP Entrega 1

> Implementar o módulo completo de Chamados de Manutenção da Entrega 1, incluindo tela de abertura, listagem, fluxo de execução com análise técnica e triagem/priorização.

## Checklist de Tarefas

| # | Tarefa | Status | Arquivos Principais |
|---|--------|--------|---------------------|
| 1 | Criar modelo de dados específico (migrations) | ✅ Concluída | Migrations Supabase, `database.types.ts` |
| 2 | Criar tela de abertura de chamado de Manutenção | ⏳ Pendente | `apps/web/src/app/(app)/chamados/manutencao/novo/` |
| 3 | Criar tela de listagem de chamados de Manutenção | ⏳ Pendente | `apps/web/src/app/(app)/chamados/manutencao/page.tsx` |
| 4 | Implementar fluxo de execução do chamado de Manutenção | ⏳ Pendente | `apps/web/src/app/(app)/chamados/manutencao/[ticketId]/` |
| 5 | Implementar triagem e priorização | ⏳ Pendente | `actions.ts`, `triage-dialog.tsx`, `ticket-actions.tsx` |

---

## Task Snapshot

- **Primary goal:** Entregar o módulo de Chamados de Manutenção completo, permitindo que usuários abram chamados de solicitação de manutenção, que o departamento de Manutenção faça triagem/priorização, gerencie execuções e acompanhe todo o fluxo até a conclusão.
- **Success signal:**
  - Chamado de Manutenção pode ser criado por qualquer usuário
  - Chamados de Manobristas passam por aprovação em cadeia (Encarregado → Supervisor → Gerente)
  - Departamento de Manutenção pode triar e priorizar chamados
  - Sistema de execuções funcional (adicionar responsável, materiais, datas)
  - Histórico completo de alterações e comentários
  - Anexos podem ser adicionados aos chamados
  - Fluxo de status específico de Manutenção funciona corretamente
- **Key references:**
  - `projeto/entregaveis/entrega1_tarefas.md` (Chamados — Manutenção)
  - `projeto/PRD.md` (seção 3.1 Sistema de Chamados)
  - `projeto/chamados/abertura.md`
  - `projeto/chamados/execuções.md`
  - `projeto/chamados/aprovacoes.md`
  - `design-system.md` (tokens e componentes)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
- **Out of scope (nesta etapa):** Chamados de RH, Sinistros, Comercial, Financeiro (serão implementados separadamente)

---

## Contexto de Negócio (PRD 3.1)

### 3.1.1 Sistema de Chamados — Manutenção

**Objetivo:** Sistema centralizado para solicitação de reparos estruturais, elétricos, hidráulicos e manutenção em geral.

**Campos de Abertura (Solicitante):**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Título | Texto | Sim |
| Departamento Destinatário | Fixo: Manutenção | Sim |
| Unidade(s) | Seleção (quando aplicável) | Condicional |
| Assunto | Seleção (configurável) | Sim |
| Descrição | Texto longo | Sim |
| Urgência Percebida | Baixa/Média/Alta | Não |
| Anexos | Arquivos/Imagens | Não |

**Campos de Triagem (Departamento de Manutenção):**
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| Prioridade | Baixa/Média/Alta/Urgente | Sim (na triagem) |
| Responsável | Usuário do departamento | Sim (na triagem) |
| Previsão de Conclusão | Data | Não |
| Justificativa da negação | Texto | Obrigatório ao negar |

### Status do Chamado de Manutenção

```
[Criação] → [Aguardando Aprovações*] → [Aguardando Triagem] → [Em andamento] → [Em análise técnica] → [Em aprovação] → [Aprovado] → [Executando manutenção] → [Aguardando peças/materiais] → [Concluído] → [Avaliação da execução] → [Fechado]
                         ↓                   ↓                                                                                                                        ↓
                      [Negado]            [Negado]                                                                                                                [Cancelado]
```

*Etapa aplicada apenas quando Manobrista abre chamado para Manutenção (aprovação em cadeia: Encarregado → Supervisor → Gerente).*

### Fluxo de Aprovações (Operações → Manutenção)

**Regra exclusiva para Manobrista abrindo chamado de Manutenção:**
1. Chamado entra em "Aguardando Aprovação - Encarregado"
2. Encarregado aprova → "Aguardando Aprovação - Supervisor"
3. Supervisor aprova → "Aguardando Aprovação - Gerente"
4. Gerente aprova → "Aguardando Triagem" (entra na fila de Manutenção)

**Se negado em qualquer etapa:**
- Status = "Negado"
- Justificativa obrigatória
- Retorna ao autor para **fechar** ou **editar e reenviar**

**Demais cenários (não-Manobrista):**
- Chamado entra direto em "Aguardando Triagem" (sem aprovações)

---

## Modelo de Dados

### Tabelas Existentes (reutilizadas)

As seguintes tabelas já foram criadas no plano de Chamados de Compras e serão reutilizadas:

```
tickets
ticket_categories
ticket_approvals
ticket_comments
ticket_attachments
ticket_history
```

### Tabelas a Criar

```
-- Detalhes específicos de chamados de Manutenção
ticket_maintenance_details
├── id: uuid (PK)
├── ticket_id: uuid (FK → tickets.id, UNIQUE)
├── subject_id: uuid (FK → ticket_categories.id) -- Assunto da manutenção
├── maintenance_type: text -- 'preventiva', 'corretiva', 'emergencial'
├── location_description: text -- Local específico do problema (ex: "2º andar, banheiro masculino")
├── equipment_affected: text -- Equipamento afetado (se aplicável)
├── completion_rating: integer (nullable) -- 1-5 avaliação da execução
├── completion_notes: text (nullable)
├── created_at: timestamptz
└── updated_at: timestamptz

-- Execuções de manutenção (pode haver múltiplas tentativas)
ticket_maintenance_executions
├── id: uuid (PK)
├── ticket_id: uuid (FK → tickets.id)
├── unit_id: uuid (FK → units.id) -- Unidade onde será executado
├── assigned_to: uuid (FK → profiles.id) -- Responsável pela execução
├── description: text -- Descrição da manutenção a ser realizada
├── materials_needed: text -- Itens/materiais necessários
├── start_date: date -- Data de início
├── estimated_end_date: date -- Data prevista para conclusão
├── actual_end_date: date -- Data de conclusão real
├── estimated_cost: decimal(12,2) -- Custo estimado
├── actual_cost: decimal(12,2) -- Custo final
├── supplier_name: text -- Fornecedor (quando aplicável)
├── supplier_contact: text -- Contato do fornecedor
├── status: text -- 'pending', 'in_progress', 'waiting_parts', 'completed', 'cancelled'
├── notes: text -- Observações
├── created_by: uuid (FK → profiles.id)
├── created_at: timestamptz
└── updated_at: timestamptz
```

### Enum de Status (Manutenção)

```typescript
type TicketMaintenanceStatus =
  // Fase de aprovação (apenas para Manobristas)
  | 'awaiting_approval_encarregado'
  | 'awaiting_approval_supervisor'
  | 'awaiting_approval_gerente'
  // Fase de triagem e execução
  | 'awaiting_triage'           // Aguardando triagem
  | 'in_progress'               // Em andamento (triado)
  | 'technical_analysis'        // Em análise técnica
  | 'awaiting_approval'         // Em aprovação (orçamento precisa de aprovação)
  | 'approved'                  // Aprovado (orçamento aprovado)
  | 'executing'                 // Executando manutenção
  | 'waiting_parts'             // Aguardando peças/materiais
  | 'completed'                 // Concluído
  | 'evaluating'                // Avaliação da execução
  | 'closed'                    // Fechado
  | 'denied'                    // Negado
  | 'cancelled'                 // Cancelado
```

### Diagrama ER

```
┌─────────────────────┐     ┌───────────────────────────────┐
│      tickets        │────<│   ticket_maintenance_details  │
│ (1 chamado)         │     │ (1:1 detalhes manutenção)     │
└─────────────────────┘     └───────────────────────────────┘
         │
         │ (1:N)
         ├───────────────────────────────┬────────────────────────────┐
         │                               │                            │
         ▼                               ▼                            ▼
┌─────────────────────────────┐   ┌──────────────────────────┐  ┌──────────────────────────┐
│ticket_maintenance_executions│   │    ticket_approvals      │  │    ticket_comments       │
│ (N execuções)               │   │ (até 3 aprovações)       │  │ (N comentários)          │
└─────────────────────────────┘   └──────────────────────────┘  └──────────────────────────┘
         │
         │ (1:N)
         ▼
┌─────────────────────┐     ┌──────────────────────────┐
│ ticket_attachments  │     │    ticket_history        │
│ (N anexos)          │     │ (N registros auditoria)  │
└─────────────────────┘     └──────────────────────────┘

┌─────────────────────┐     ┌──────────────────────────┐
│    departments      │────<│   ticket_categories      │
└─────────────────────┘     │ (assuntos de manutenção) │
                            └──────────────────────────┘
```

---

## Tarefa 1: Criar Modelo de Dados Específico (Migrations)

### Objetivo
Criar as tabelas específicas para Manutenção, índices, constraints e RLS policies.

### Subtarefas

#### 1.1 Migration: Criar Tabela ticket_maintenance_details

```sql
-- Migration: create_ticket_maintenance_details_table
CREATE TABLE public.ticket_maintenance_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.ticket_categories(id),
  maintenance_type TEXT CHECK (maintenance_type IN ('preventiva', 'corretiva', 'emergencial')),
  location_description TEXT,
  equipment_affected TEXT,
  completion_rating INTEGER CHECK (completion_rating >= 1 AND completion_rating <= 5),
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ticket_id)
);

COMMENT ON TABLE public.ticket_maintenance_details IS 'Detalhes específicos de chamados de Manutenção';
COMMENT ON COLUMN public.ticket_maintenance_details.maintenance_type IS 'Tipo: preventiva, corretiva ou emergencial';

CREATE TRIGGER on_ticket_maintenance_details_updated
  BEFORE UPDATE ON public.ticket_maintenance_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_ticket_maintenance_details_ticket_id ON public.ticket_maintenance_details(ticket_id);
CREATE INDEX idx_ticket_maintenance_details_subject_id ON public.ticket_maintenance_details(subject_id);
```

#### 1.2 Migration: Criar Tabela ticket_maintenance_executions

```sql
-- Migration: create_ticket_maintenance_executions_table
CREATE TABLE public.ticket_maintenance_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id),
  assigned_to UUID REFERENCES public.profiles(id),
  description TEXT NOT NULL,
  materials_needed TEXT,
  start_date DATE,
  estimated_end_date DATE,
  actual_end_date DATE,
  estimated_cost DECIMAL(12, 2),
  actual_cost DECIMAL(12, 2),
  supplier_name TEXT,
  supplier_contact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'waiting_parts', 'completed', 'cancelled')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ticket_maintenance_executions IS 'Execuções de manutenção em chamados';
COMMENT ON COLUMN public.ticket_maintenance_executions.status IS 'Status: pending, in_progress, waiting_parts, completed, cancelled';

CREATE TRIGGER on_ticket_maintenance_executions_updated
  BEFORE UPDATE ON public.ticket_maintenance_executions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX idx_ticket_maintenance_executions_ticket_id ON public.ticket_maintenance_executions(ticket_id);
CREATE INDEX idx_ticket_maintenance_executions_assigned_to ON public.ticket_maintenance_executions(assigned_to);
CREATE INDEX idx_ticket_maintenance_executions_status ON public.ticket_maintenance_executions(status);
CREATE INDEX idx_ticket_maintenance_executions_unit_id ON public.ticket_maintenance_executions(unit_id);
```

#### 1.3 Migration: Criar RLS Policies para Tabelas de Manutenção

```sql
-- Migration: create_ticket_maintenance_rls_policies

-- Habilitar RLS
ALTER TABLE public.ticket_maintenance_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_maintenance_executions ENABLE ROW LEVEL SECURITY;

-- ticket_maintenance_details: Segue visibilidade do ticket
CREATE POLICY "Users can view maintenance details of visible tickets" ON public.ticket_maintenance_details
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

CREATE POLICY "Admins and department can manage maintenance details" ON public.ticket_maintenance_details
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.tickets t
      JOIN public.user_roles ur ON ur.user_id = auth.uid()
      JOIN public.roles r ON r.id = ur.role_id
      WHERE t.id = ticket_id
      AND r.department_id = t.department_id
    )
  );

-- ticket_maintenance_executions: Departamento de Manutenção gerencia
CREATE POLICY "Users can view executions of visible tickets" ON public.ticket_maintenance_executions
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

CREATE POLICY "Manutencao department can manage executions" ON public.ticket_maintenance_executions
  FOR ALL USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.tickets t
      JOIN public.user_roles ur ON ur.user_id = auth.uid()
      JOIN public.roles r ON r.id = ur.role_id
      JOIN public.departments d ON d.id = r.department_id
      WHERE t.id = ticket_id
      AND d.name = 'Manutenção'
    )
  );
```

#### 1.4 Migration: Criar View de Tickets de Manutenção

```sql
-- Migration: create_ticket_maintenance_view

CREATE OR REPLACE VIEW public.tickets_maintenance_with_details AS
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
  -- Categoria/Assunto
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
  (SELECT COUNT(*) FROM public.ticket_maintenance_executions tme WHERE tme.ticket_id = t.id) AS executions_count,
  -- Detalhes de manutenção
  md.maintenance_type,
  md.location_description,
  md.equipment_affected
FROM public.tickets t
LEFT JOIN public.departments d ON d.id = t.department_id
LEFT JOIN public.ticket_categories c ON c.id = t.category_id
LEFT JOIN public.units u ON u.id = t.unit_id
LEFT JOIN public.profiles p_created ON p_created.id = t.created_by
LEFT JOIN public.profiles p_assigned ON p_assigned.id = t.assigned_to
LEFT JOIN public.ticket_maintenance_details md ON md.ticket_id = t.id
WHERE d.name = 'Manutenção';
```

#### 1.5 Migration: Inserir Categorias/Assuntos de Manutenção (Seed)

```sql
-- Migration: seed_ticket_categories_manutencao

-- Obter ID do departamento de Manutenção
DO $$
DECLARE
  v_manutencao_id UUID;
BEGIN
  SELECT id INTO v_manutencao_id FROM public.departments WHERE name = 'Manutenção';
  
  IF v_manutencao_id IS NOT NULL THEN
    INSERT INTO public.ticket_categories (name, department_id) VALUES
      ('Elétrica', v_manutencao_id),
      ('Hidráulica', v_manutencao_id),
      ('Estrutural', v_manutencao_id),
      ('Pintura', v_manutencao_id),
      ('Equipamentos', v_manutencao_id),
      ('Portões e Cancelas', v_manutencao_id),
      ('Iluminação', v_manutencao_id),
      ('Ar Condicionado', v_manutencao_id),
      ('Elevadores', v_manutencao_id),
      ('Sinalização', v_manutencao_id),
      ('Limpeza Pesada', v_manutencao_id),
      ('Jardinagem', v_manutencao_id),
      ('Outros', v_manutencao_id)
    ON CONFLICT (name, department_id) DO NOTHING;
  END IF;
END $$;
```

### Critérios de Aceite
- [x] Tabelas criadas e validadas via `mcp_supabase_list_tables`
- [x] Índices criados e funcionando
- [x] RLS policies configuradas (criador vs departamento vs admin)
- [x] View `tickets_maintenance_with_details` retornando dados
- [x] TypeScript types regenerados
- [x] Categorias/Assuntos de Manutenção inseridos

---

## Tarefa 2: Criar Tela de Abertura de Chamado de Manutenção

### Objetivo
Implementar formulário para criação de chamados de Manutenção com campos específicos.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/chamados/
├── manutencao/
│   ├── page.tsx                      # Listagem de chamados de Manutenção
│   ├── actions.ts                    # Server Actions
│   ├── constants.ts                  # Constantes (status, etc.)
│   ├── loading.tsx                   # Loading state
│   ├── novo/
│   │   └── page.tsx                  # Formulário de abertura
│   ├── [ticketId]/
│   │   ├── page.tsx                  # Detalhes do chamado
│   │   ├── loading.tsx               # Loading state
│   │   ├── not-found.tsx             # 404
│   │   └── components/
│   │       ├── index.ts
│   │       ├── ticket-header.tsx
│   │       ├── ticket-info.tsx
│   │       ├── ticket-timeline.tsx
│   │       ├── ticket-comments.tsx
│   │       ├── ticket-attachments.tsx
│   │       ├── ticket-executions.tsx  # Lista de execuções
│   │       ├── ticket-approvals.tsx
│   │       ├── ticket-actions.tsx
│   │       ├── triage-dialog.tsx
│   │       └── execution-dialog.tsx   # Dialog para adicionar execução
│   └── components/
│       ├── index.ts
│       ├── ticket-form.tsx           # Formulário de chamado
│       ├── tickets-table.tsx         # Tabela de chamados
│       ├── tickets-filters.tsx       # Filtros
│       ├── tickets-stats-cards.tsx   # Cards de estatísticas
│       ├── tickets-pagination.tsx    # Paginação
│       └── status-badge.tsx          # Badge de status
```

### Subtarefas

#### 2.1 Criar Server Actions para Chamados de Manutenção

**Arquivo:** `apps/web/src/app/(app)/chamados/manutencao/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Criar chamado de Manutenção
export async function createMaintenanceTicket(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  
  // Obter departamento de Manutenção
  const { data: manutencaoDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Manutenção')
    .single()
  
  if (!manutencaoDept) throw new Error('Departamento de Manutenção não encontrado')
  
  // Extrair dados do formulário
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string | null
  const unit_id = formData.get('unit_id') as string | null
  const perceived_urgency = formData.get('perceived_urgency') as string | null
  const maintenance_type = formData.get('maintenance_type') as string | null
  const location_description = formData.get('location_description') as string | null
  const equipment_affected = formData.get('equipment_affected') as string | null
  
  // Verificar se precisa de aprovação
  const { data: needsApproval } = await supabase
    .rpc('ticket_needs_approval', {
      p_created_by: user.id,
      p_department_id: manutencaoDept.id
    })
  
  const initialStatus = needsApproval ? 
    'awaiting_approval_encarregado' : 'awaiting_triage'
  
  // Criar ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .insert({
      title,
      description,
      department_id: manutencaoDept.id,
      category_id: category_id || null,
      unit_id: unit_id || null,
      created_by: user.id,
      status: initialStatus,
      perceived_urgency: perceived_urgency || null
    })
    .select()
    .single()
  
  if (ticketError) return { error: ticketError.message }
  
  // Criar detalhes de manutenção
  const { error: detailsError } = await supabase
    .from('ticket_maintenance_details')
    .insert({
      ticket_id: ticket.id,
      subject_id: category_id || null,
      maintenance_type: maintenance_type || 'corretiva',
      location_description,
      equipment_affected
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
  
  revalidatePath('/chamados/manutencao')
  redirect(`/chamados/manutencao/${ticket.id}`)
}

// Listar categorias/assuntos de Manutenção
export async function getMaintenanceCategories() {
  const supabase = await createClient()
  
  const { data: manutencaoDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Manutenção')
    .single()
  
  if (!manutencaoDept) return []
  
  const { data, error } = await supabase
    .from('ticket_categories')
    .select('*')
    .eq('department_id', manutencaoDept.id)
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

**Arquivo:** `apps/web/src/app/(app)/chamados/manutencao/novo/page.tsx`

**Campos:**
| Campo | Tipo | Validação | Obrigatório |
|-------|------|-----------|-------------|
| title | Input text | Mínimo 5 caracteres | Sim |
| category_id | Select | Assuntos de Manutenção | Sim |
| unit_id | Select | Unidades do usuário | Condicional |
| maintenance_type | Select | preventiva/corretiva/emergencial | Sim (default: corretiva) |
| location_description | Input text | Local específico do problema | Não |
| equipment_affected | Input text | Equipamento afetado | Não |
| description | Textarea | Mínimo 10 caracteres | Sim |
| perceived_urgency | Select | Baixa/Média/Alta | Não |
| attachments | File input (múltiplo) | Max 5MB cada | Não |

### Critérios de Aceite
- [ ] Formulário validado no client e server
- [ ] Chamado criado com status correto (com/sem aprovação)
- [ ] Detalhes de manutenção vinculados
- [ ] Aprovações criadas quando necessário
- [ ] Redirect para detalhes após criação
- [ ] Responsivo em mobile

---

## Tarefa 3: Criar Tela de Listagem de Chamados de Manutenção

### Objetivo
Implementar listagem de chamados de Manutenção com filtros, ordenação e paginação.

### Subtarefas

#### 3.1 Criar Server Actions de Listagem

```typescript
// Listar chamados de Manutenção
export async function getMaintenanceTickets(filters?: {
  status?: string
  priority?: string
  category_id?: string
  unit_id?: string
  assigned_to?: string
  maintenance_type?: string
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
  
  // Obter departamento de Manutenção
  const { data: manutencaoDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Manutenção')
    .single()
  
  if (!manutencaoDept) return { data: [], count: 0, page, limit }
  
  let query = supabase
    .from('tickets_maintenance_with_details')
    .select('*', { count: 'exact' })
    .eq('department_id', manutencaoDept.id)
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
  
  if (filters?.maintenance_type) {
    query = query.eq('maintenance_type', filters.maintenance_type)
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

// Estatísticas de Manutenção
export async function getMaintenanceStats() {
  const supabase = await createClient()
  
  const { data: manutencaoDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Manutenção')
    .single()
  
  if (!manutencaoDept) return { total: 0, awaitingTriage: 0, inProgress: 0, closed: 0 }
  
  const { data } = await supabase
    .from('tickets')
    .select('status')
    .eq('department_id', manutencaoDept.id)
  
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
- Filtros: status, prioridade, assunto, unidade, tipo de manutenção, período, busca
- Tabela com colunas: #, Título, Assunto, Tipo, Unidade, Status, Prioridade, Criado por, Data
- Paginação server-side
- Link para detalhes

### Critérios de Aceite
- [ ] Listagem carrega corretamente
- [ ] Filtros funcionam (incluindo filtro por tipo de manutenção)
- [ ] Paginação funcional
- [ ] Busca por número ou título
- [ ] Visibilidade respeitada (RLS)
- [ ] Responsivo em mobile

---

## Tarefa 4: Implementar Fluxo de Execução do Chamado de Manutenção

### Objetivo
Implementar tela de detalhes com timeline, comentários, anexos, execuções e ações de status.

### Subtarefas

#### 4.1 Criar Página de Detalhes

**Seções:**
1. **Header:** Número, título, status (badge), prioridade, ações
2. **Informações Gerais:** Assunto, tipo, local, equipamento, unidade, solicitante, data
3. **Aprovações (se aplicável):** Timeline de aprovações com status
4. **Execuções:** Lista de execuções com ações (adicionar, editar, concluir)
5. **Timeline:** Histórico de alterações
6. **Comentários:** Thread de discussão
7. **Anexos:** Lista de arquivos

#### 4.2 Criar Sistema de Execuções

```typescript
// Adicionar execução
export async function addExecution(ticketId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  
  const unit_id = formData.get('unit_id') as string | null
  const assigned_to = formData.get('assigned_to') as string | null
  const description = formData.get('description') as string
  const materials_needed = formData.get('materials_needed') as string | null
  const start_date = formData.get('start_date') as string | null
  const estimated_end_date = formData.get('estimated_end_date') as string | null
  const estimated_cost = formData.get('estimated_cost') ? 
    parseFloat(formData.get('estimated_cost') as string) : null
  const supplier_name = formData.get('supplier_name') as string | null
  const supplier_contact = formData.get('supplier_contact') as string | null
  const notes = formData.get('notes') as string | null
  
  const { error } = await supabase
    .from('ticket_maintenance_executions')
    .insert({
      ticket_id: ticketId,
      unit_id,
      assigned_to,
      description,
      materials_needed,
      start_date: start_date || null,
      estimated_end_date: estimated_end_date || null,
      estimated_cost,
      supplier_name,
      supplier_contact,
      notes,
      created_by: user.id
    })
  
  if (error) return { error: error.message }
  
  // Atualizar status se ainda não estiver em execução
  await supabase
    .from('tickets')
    .update({ status: 'executing' })
    .eq('id', ticketId)
    .in('status', ['awaiting_triage', 'in_progress', 'technical_analysis', 'approved'])
  
  revalidatePath(`/chamados/manutencao/${ticketId}`)
  return { success: true }
}

// Atualizar execução
export async function updateExecution(executionId: string, formData: FormData) {
  const supabase = await createClient()
  
  const status = formData.get('status') as string
  const actual_end_date = formData.get('actual_end_date') as string | null
  const actual_cost = formData.get('actual_cost') ? 
    parseFloat(formData.get('actual_cost') as string) : null
  const notes = formData.get('notes') as string | null
  
  const { error, data } = await supabase
    .from('ticket_maintenance_executions')
    .update({
      status,
      actual_end_date: actual_end_date || null,
      actual_cost,
      notes
    })
    .eq('id', executionId)
    .select('ticket_id')
    .single()
  
  if (error) return { error: error.message }
  
  // Se execução concluída, atualizar status do ticket
  if (status === 'completed' && data) {
    await supabase
      .from('tickets')
      .update({ status: 'completed' })
      .eq('id', data.ticket_id)
  }
  
  revalidatePath(`/chamados/manutencao/${data?.ticket_id}`)
  return { success: true }
}

// Marcar como aguardando peças
export async function setWaitingParts(ticketId: string, executionId: string) {
  const supabase = await createClient()
  
  // Atualizar execução
  await supabase
    .from('ticket_maintenance_executions')
    .update({ status: 'waiting_parts' })
    .eq('id', executionId)
  
  // Atualizar ticket
  const { error } = await supabase
    .from('tickets')
    .update({ status: 'waiting_parts' })
    .eq('id', ticketId)
  
  if (error) return { error: error.message }
  
  revalidatePath(`/chamados/manutencao/${ticketId}`)
  return { success: true }
}
```

#### 4.3 Criar Transições de Status

```typescript
// Transições de status permitidas (Manutenção)
const statusTransitions: Record<string, string[]> = {
  'awaiting_triage': ['in_progress', 'technical_analysis', 'denied'],
  'in_progress': ['technical_analysis', 'executing', 'denied', 'cancelled'],
  'technical_analysis': ['awaiting_approval', 'executing', 'denied'],
  'awaiting_approval': ['approved', 'denied'],
  'approved': ['executing'],
  'executing': ['waiting_parts', 'completed'],
  'waiting_parts': ['executing', 'completed'],
  'completed': ['evaluating'],
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
  
  if (newStatus === 'completed') {
    updates.resolved_at = new Date().toISOString()
  }
  
  const { error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
  
  if (error) return { error: error.message }
  
  revalidatePath(`/chamados/manutencao/${ticketId}`)
  return { success: true }
}
```

### Critérios de Aceite
- [ ] Detalhes exibem todas informações
- [ ] Sistema de execuções funcional
- [ ] Transições de status respeitam regras
- [ ] Timeline mostra histórico completo
- [ ] Comentários podem ser adicionados
- [ ] Status "Aguardando peças/materiais" funciona

---

## Tarefa 5: Implementar Triagem e Priorização

### Objetivo
Permitir que Supervisores/Gerentes de Manutenção façam triagem dos chamados.

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
  
  revalidatePath(`/chamados/manutencao/${ticketId}`)
  revalidatePath('/chamados/manutencao')
  return { success: true }
}

// Listar membros do departamento de Manutenção
export async function getManutencaoDepartmentMembers() {
  const supabase = await createClient()
  
  const { data: manutencaoDept } = await supabase
    .from('departments')
    .select('id')
    .eq('name', 'Manutenção')
    .single()
  
  if (!manutencaoDept) return []
  
  const { data } = await supabase
    .from('user_roles')
    .select(`
      user:profiles(id, full_name, email, avatar_url),
      role:roles(name)
    `)
    .eq('roles.department_id', manutencaoDept.id)
  
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
- [ ] Apenas Supervisores/Gerentes do dept. Manutenção (ou admins) podem triar
- [ ] Triagem define prioridade e responsável
- [ ] Status muda para "Em andamento" após triagem
- [ ] Histórico registra triagem com metadados

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
| Fluxo de status complexo (waiting_parts) | Medium | Medium | Testes E2E completos do fluxo | Backend Specialist |
| UX confusa no gerenciamento de execuções | Medium | Medium | Design mobile-first; interface intuitiva | Frontend Specialist |
| Histórico dessincronizado | Low | Low | Triggers automáticos no banco | Database Specialist |

### Dependencies

- **Internal:** Tabelas `tickets`, `ticket_categories`, `ticket_comments`, `ticket_attachments`, `ticket_history`, `ticket_approvals` já existem (criadas em chamados-compras)
- **Internal:** Módulos de usuários, unidades e chamados de compras implementados
- **External:** Supabase Database, Supabase Storage
- **Technical:** Next.js 15 Server Actions, @supabase/ssr, shadcn/ui

### Assumptions

- Modelo de dados base de tickets já existe (criado em chamados-compras)
- Categorias de Manutenção são configuráveis via admin (seed inicial)
- Fluxo de aprovação só se aplica a Manobristas
- Execuções são gerenciadas pelo departamento de Manutenção
- Pode haver múltiplas execuções por chamado

## Resource Estimation

### Time Allocation

| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery & Modelo de Dados | 0.25 dia | 0.25 dia | 1 pessoa |
| Phase 2a - Tela de Abertura de Chamado | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2b - Tela de Listagem | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2c - Fluxo de Execução | 1 dia | 1 dia | 1 pessoa |
| Phase 2d - Triagem e Priorização | 0.25 dia | 0.25 dia | 1 pessoa |
| Phase 3 - Validation & Handoff | 0.25 dia | 0.25 dia | 1 pessoa |
| **Total** | **2.75 dias** | **2.75 dias** | **-** |

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

### Phase 1 — Discovery & Modelo de Dados (0.25 dia)

**Steps**
1. Validar modelo de dados proposto com PRD
2. Criar migrations via `mcp_supabase_apply_migration`
3. Testar RLS policies com diferentes perfis
4. Regenerar TypeScript types via `mcp_supabase_generate_typescript_types`
5. Rodar `mcp_supabase_get_advisors` (security)

**Commit Checkpoint**
- `git commit -m "feat(tickets): create maintenance-specific tables and migrations"`

### Phase 2 — Implementation & Iteration (2.25 dias)

**Steps**

**Dia 1: Tela de Abertura e Listagem**
1. Criar estrutura de arquivos `/chamados/manutencao/`
2. Reutilizar componentes de compras onde possível
3. Implementar Server Actions de criação
4. Criar formulário de abertura com campos específicos
5. Criar página de listagem com filtros

**Dia 2: Fluxo de Execução**
1. Criar página de detalhes do chamado
2. Implementar timeline de histórico
3. Implementar sistema de execuções
4. Criar dialog de triagem
5. Implementar transições de status

**Commit Checkpoints**
- `git commit -m "feat(tickets): implement maintenance ticket creation"`
- `git commit -m "feat(tickets): implement maintenance listing and details"`
- `git commit -m "feat(tickets): implement maintenance execution flow"`

### Phase 3 — Validation & Handoff (0.25 dia)

**Steps**
1. Testar fluxo completo: criar chamado → aprovação → triagem → execução → conclusão → fechamento
2. Testar RLS: Manobrista vs Manutenção vs Admin
3. Validar responsividade (mobile)
4. Rodar `mcp_supabase_get_advisors` (security)
5. Atualizar `entrega1_tarefas.md` com itens concluídos
6. Atualizar README do plans

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation - chamados-manutencao"`

## Rollback Plan

### Rollback Triggers
- Bugs críticos em RLS expondo dados de chamados
- Fluxo de execução inconsistente
- Performance degradada na listagem
- Perda de histórico

### Rollback Procedures

#### Phase 1 Rollback
- Action: Reverter migrations; DROP TABLES ticket_maintenance_*
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
- Screenshot da tela de abertura de chamado de Manutenção
- Screenshot da listagem de chamados de Manutenção
- Screenshot dos detalhes do chamado
- Screenshot do fluxo de aprovação
- Screenshot do sistema de execuções
- Screenshot da triagem
- Log de teste de RLS (Manobrista vs Manutenção vs Admin)
- Output de `mcp_supabase_get_advisors` (security)
- TypeScript types gerados (`database.types.ts`)
- Output de `mcp_supabase_list_tables` mostrando novas tabelas

### Follow-up Actions
- [ ] Atualizar `entrega1_tarefas.md` marcando itens 78-80 como concluídos
- [ ] Atualizar `README.md` do plans com status
- [ ] Preparar dados de seed (assuntos de Manutenção)
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
- [Plano de Chamados de Compras](./chamados-compras.md) — Referência de implementação
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

### Arquivos Existentes (Referência)
- `apps/web/src/app/(app)/chamados/compras/` — Módulo de chamados de compras (padrão a seguir)
- `apps/web/src/app/(app)/checklists/` — Módulo de checklists (padrão a seguir)
- `apps/web/src/app/(app)/unidades/` — Módulo de unidades (padrão a seguir)
- `apps/web/src/lib/supabase/client.ts` — Cliente browser
- `apps/web/src/lib/supabase/server.ts` — Cliente server
- `apps/web/src/lib/supabase/database.types.ts` — Types gerados
- `apps/web/src/lib/auth/permissions.ts` — Sistema de permissões
- `apps/web/src/components/auth/require-permission.tsx` — Componente de proteção

### Componentes Reutilizáveis de Compras
Os seguintes componentes de `chamados/compras/` podem ser reutilizados ou adaptados:

```
compras/components/
├── status-badge.tsx         → Adaptar para status de Manutenção
├── tickets-filters.tsx      → Adaptar filtros
├── tickets-pagination.tsx   → Reutilizar diretamente
├── tickets-stats-cards.tsx  → Adaptar métricas
├── tickets-table.tsx        → Adaptar colunas

compras/[ticketId]/components/
├── ticket-header.tsx        → Reutilizar com adaptações
├── ticket-info.tsx          → Adaptar para campos de Manutenção
├── ticket-timeline.tsx      → Reutilizar diretamente
├── ticket-comments.tsx      → Reutilizar diretamente
├── ticket-approvals.tsx     → Reutilizar diretamente
├── ticket-actions.tsx       → Adaptar ações
├── triage-dialog.tsx        → Reutilizar com adaptações
```

### Constantes de Status (Manutenção)

```typescript
// Em apps/web/src/app/(app)/chamados/manutencao/constants.ts

export const MAINTENANCE_STATUS = {
  awaiting_approval_encarregado: 'Aguardando Aprovação - Encarregado',
  awaiting_approval_supervisor: 'Aguardando Aprovação - Supervisor',
  awaiting_approval_gerente: 'Aguardando Aprovação - Gerente',
  awaiting_triage: 'Aguardando Triagem',
  in_progress: 'Em Andamento',
  technical_analysis: 'Em Análise Técnica',
  awaiting_approval: 'Em Aprovação',
  approved: 'Aprovado',
  executing: 'Executando Manutenção',
  waiting_parts: 'Aguardando Peças/Materiais',
  completed: 'Concluído',
  evaluating: 'Avaliação da Execução',
  closed: 'Fechado',
  denied: 'Negado',
  cancelled: 'Cancelado',
} as const

export const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  awaiting_approval_encarregado: 'bg-warning text-white',
  awaiting_approval_supervisor: 'bg-warning text-white',
  awaiting_approval_gerente: 'bg-warning text-white',
  awaiting_triage: 'bg-info text-white',
  in_progress: 'bg-blue-500 text-white',
  technical_analysis: 'bg-purple-500 text-white',
  awaiting_approval: 'bg-warning text-white',
  approved: 'bg-success text-white',
  executing: 'bg-blue-600 text-white',
  waiting_parts: 'bg-orange-500 text-white',
  completed: 'bg-success text-white',
  evaluating: 'bg-teal-500 text-white',
  closed: 'bg-muted text-muted-foreground',
  denied: 'bg-destructive text-white',
  cancelled: 'bg-muted text-muted-foreground',
}

export const MAINTENANCE_TYPES = {
  preventiva: 'Preventiva',
  corretiva: 'Corretiva',
  emergencial: 'Emergencial',
} as const

export const EXECUTION_STATUS = {
  pending: 'Pendente',
  in_progress: 'Em Andamento',
  waiting_parts: 'Aguardando Peças',
  completed: 'Concluída',
  cancelled: 'Cancelada',
} as const
```

<!-- agent-update:end -->
