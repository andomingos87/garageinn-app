---
id: plan-modulo-sinistros-completo
ai_update_goal: "Implementar o módulo completo de gestão de Sinistros com sistema interno de compras, comunicação com cliente e integração com manutenção."
required_inputs:
  - "Especificação técnica: projeto/chamados/sinistros.md"
  - "PRD: projeto/PRD.md (seções 2.1.6 Sinistros e 3.1 Chamados)"
  - "Modelo de dados existente: tickets, ticket_categories, departments"
  - "Padrão de compras: .context/plans/chamados-compras.md"
  - "Design System: design-system.md"
success_criteria:
  - "Modelo de dados completo criado e validado"
  - "Tela de abertura de sinistro funcional com todos os campos"
  - "Fluxo de status específico implementado"
  - "Sistema interno de compras de peças integrado"
  - "Seção de comunicações com cliente funcional"
  - "Cadastro de fornecedores credenciados (híbrido)"
  - "Integração com Manutenção via botão opcional"
  - "RLS e permissões configuradas corretamente"
  - "Fluxo de aprovação em cadeia implementado"
related_agents:
  - "database-specialist"
  - "frontend-specialist"
  - "backend-specialist"
  - "security-auditor"
  - "feature-developer"
---

<!-- agent-update:start:plan-modulo-sinistros-completo -->
# Módulo de Sinistros - Plano de Implementação

> Implementação completa do módulo de gestão de sinistros com sistema interno de compras, comunicação com cliente e integração com manutenção. Prazo: **05 de janeiro de 2026** (Entrega 2).

---

## Task Snapshot

- **Primary goal:** Entregar o módulo de Sinistros completo, permitindo registro, acompanhamento e resolução de ocorrências (danos a veículos, estrutura, incidentes com terceiros), com sistema interno de compras de peças gerenciado pelo próprio departamento de Sinistros.

- **Success signal:**
  - Sinistro pode ser criado com todos os campos específicos
  - Fluxo de aprovação em cadeia funciona (Manobrista → Encarregado → Supervisor → Gerente)
  - Compras internas são gerenciadas dentro do módulo (não vão para Compras)
  - Mínimo de 2 cotações obrigatórias antes de aprovar compra
  - Comunicações com cliente são registradas
  - Botão de gerar chamado de Manutenção funciona
  - Fornecedores credenciados podem ser cadastrados e selecionados
  - RLS respeita visibilidade por unidade/departamento

- **Key references:**
  - [PRD do GAPP](../../projeto/PRD.md) — Seções 2.1.6 e 3.1
  - [Especificação Sinistros](../../projeto/chamados/sinistros.md)
  - [Plano de Compras](./chamados-compras.md) — Padrão de cotações
  - [Design System](../../design-system.md)
  - [Entregáveis](../../projeto/entregaveis/entregaveis_geral.md)

---

## Decisões de Negócio Consolidadas

| # | Decisão | Escolha Final |
|---|---------|---------------|
| 1 | Aprovação de Compras Internas | **Apenas Gerente de Sinistros** |
| 2 | Cotações Obrigatórias | **Mínimo de 2 cotações sempre** |
| 3 | Categorias de Sinistro | **5 categorias**: Veículo de Cliente, Veículo de Terceiro, Estrutura da Unidade, Equipamento, Pessoa/Acidente |
| 4 | Fluxo de Aprovação | **Cadeia completa**: Encarregado → Supervisor → Gerente |
| 5 | Cálculo de Responsabilidade | **Manual** pelo analista |
| 6 | Comunicações com Cliente | **Seção específica** com campos estruturados |
| 7 | Integração Manutenção | **Botão opcional** "Gerar Chamado de Manutenção" |
| 8 | Fornecedores Credenciados | **Híbrido** com cadastro global do sistema |
| 9 | SLA | **Sem controle** de prazo |
| 10 | Anexos de Cotação | **Ficam no sinistro principal** |

---

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criação de migrations, índices, RLS policies e funções | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Backend Specialist | Server Actions, validações, lógica de negócio | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Frontend Specialist | Implementação das telas (abertura, listagem, detalhes) | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Security Auditor | Validação de RLS, proteção de rotas, permissões | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Feature Developer | Implementação end-to-end das funcionalidades | [Feature Developer](../agents/feature-developer.md) | Implement new features according to specifications |

---

## Risk Assessment

### Identified Risks

| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| RLS mal configurado expõe dados de sinistros | Medium | High | Testar policies com múltiplos perfis de usuário | Security Auditor |
| Fluxo de aprovação em cadeia complexo | Medium | Medium | Reutilizar lógica existente de Compras/Manutenção | Backend Specialist |
| UX confusa no gerenciamento de compras internas | Medium | Medium | Design mobile-first; interface intuitiva | Frontend Specialist |
| Integração com Manutenção causa inconsistências | Low | Medium | Validar criação de chamado com dados completos | Backend Specialist |
| Cadastro de fornecedores não integra com outros módulos | Low | Low | Criar tabela global reutilizável | Database Specialist |

### Dependencies

- **Internal:** Tabelas `tickets`, `ticket_categories`, `departments`, `units`, `profiles` já existem
- **External:** Supabase Database, Supabase Storage
- **Technical:** Next.js 15 Server Actions, @supabase/ssr, shadcn/ui

### Assumptions

- Fluxo de aprovação segue mesmo padrão de Compras/Manutenção
- Compras internas são exclusivas do módulo de Sinistros
- Fornecedores credenciados são cadastro global (reutilizável)
- Anexos de cotação são vinculados ao sinistro principal (não à cotação)

---

## Resource Estimation

### Time Allocation

| Fase | Esforço | Prazo | Team Size |
| --- | --- | --- | --- |
| Fase 1 — Modelo de Dados | 1 dia | 1 dia | 1 pessoa |
| Fase 2 — Abertura e Listagem | 1.5 dias | 1.5 dias | 1 pessoa |
| Fase 3 — Detalhes e Timeline | 1 dia | 1 dia | 1 pessoa |
| Fase 4 — Compras Internas | 1.5 dias | 1.5 dias | 1 pessoa |
| Fase 5 — Fluxos Especiais | 1 dia | 1 dia | 1 pessoa |
| Fase 6 — Validação e Testes | 0.5 dia | 0.5 dia | 1 pessoa |
| **Total** | **6.5 dias** | **6.5 dias** | **1 pessoa** |

### Required Skills

- Next.js 15 (App Router, Server Actions)
- Supabase (Database, RLS, Functions, Storage)
- TypeScript
- shadcn/ui + Tailwind CSS

---

## Modelo de Dados

### Diagrama de Entidades

```
┌─────────────────────────┐
│        tickets          │
│   (department: Sinistros)│
└───────────┬─────────────┘
            │ 1:1
            ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   ticket_claim_details  │────<│  claim_communications   │
│   (detalhes do sinistro)│     │  (comunicações cliente) │
└───────────┬─────────────┘     └─────────────────────────┘
            │ 1:N
            ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│     claim_purchases     │────<│ claim_purchase_quotations   │
│  (compras internas)     │     │     (cotações internas)     │
└───────────┬─────────────┘     └─────────────────────────────┘
            │ 1:N
            ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   claim_purchase_items  │     │  accredited_suppliers   │
│   (itens da compra)     │     │ (fornecedores globais)  │
└─────────────────────────┘     └─────────────────────────┘
```

---

## Working Phases

---

### Fase 1 — Modelo de Dados (1 dia) ✅ CONCLUÍDA

**Owner:** Database Specialist

**Status:** ✅ **CONCLUÍDA em 31/12/2024**

**Objetivo:** Criar todas as tabelas, índices, constraints, RLS policies e seeds necessários.

**Resumo das Migrations Criadas:**
1. `create_accredited_suppliers_table` - Fornecedores credenciados (global)
2. `create_ticket_claim_details_table` - Detalhes do sinistro
3. `create_claim_communications_table` - Comunicações com cliente
4. `create_claim_purchases_table` - Compras internas
5. `create_claim_purchase_items_table` - Itens das compras
6. `create_claim_purchase_quotations_table` - Cotações internas
7. `seed_ticket_categories_sinistros` - 5 categorias de sinistro

#### Tarefa 1.1: Criar Tabela de Fornecedores Credenciados (Global)

**Arquivo:** Migration Supabase

```sql
CREATE TABLE public.accredited_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  category TEXT, -- oficina, autopeças, funilaria, etc.
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.accredited_suppliers IS 'Fornecedores credenciados do sistema (global)';
```

**Subtarefas:**
- [x] Criar migration via `mcp_supabase_apply_migration` ✅
- [x] Configurar RLS (admins e departamentos gerenciam) ✅
- [x] Criar índices (name, cnpj, category) ✅

**Migration:** `20251231_create_accredited_suppliers_table`

---

#### Tarefa 1.2: Criar Tabela de Detalhes do Sinistro

**Arquivo:** Migration Supabase

```sql
CREATE TABLE public.ticket_claim_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  
  -- Dados da Ocorrência
  occurrence_type TEXT NOT NULL,
  occurrence_date TIMESTAMPTZ NOT NULL,
  occurrence_time TIME,
  location_description TEXT,
  police_report_number TEXT,
  police_report_date DATE,
  
  -- Dados do Veículo Afetado
  vehicle_plate TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  vehicle_year INTEGER,
  
  -- Dados do Cliente/Proprietário
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  customer_cpf TEXT,
  
  -- Terceiro Envolvido
  has_third_party BOOLEAN DEFAULT FALSE,
  third_party_name TEXT,
  third_party_phone TEXT,
  third_party_plate TEXT,
  third_party_info JSONB,
  
  -- Valores e Custos
  estimated_damage_value DECIMAL(12, 2),
  final_repair_cost DECIMAL(12, 2),
  deductible_value DECIMAL(12, 2),
  company_liability DECIMAL(12, 2),
  
  -- Resultado/Conclusão
  liability_determination TEXT,
  resolution_type TEXT,
  resolution_notes TEXT,
  customer_satisfaction_rating INTEGER CHECK (customer_satisfaction_rating >= 1 AND customer_satisfaction_rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(ticket_id)
);
```

**Subtarefas:**
- [x] Criar migration ✅
- [x] Configurar RLS (mesma visibilidade do ticket) ✅
- [x] Criar trigger de updated_at ✅

**Migration:** `20251231_create_ticket_claim_details_table`

---

#### Tarefa 1.3: Criar Tabela de Comunicações com Cliente

**Arquivo:** Migration Supabase

```sql
CREATE TABLE public.claim_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_details_id UUID NOT NULL REFERENCES public.ticket_claim_details(id) ON DELETE CASCADE,
  
  communication_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL, -- telefone, whatsapp, email, presencial
  summary TEXT NOT NULL,
  next_contact_date DATE,
  
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.claim_communications IS 'Registro de comunicações com cliente no sinistro';
```

**Subtarefas:**
- [x] Criar migration ✅
- [x] Configurar RLS ✅
- [x] Criar índice em claim_details_id ✅

**Migration:** `20251231_create_claim_communications_table`

---

#### Tarefa 1.4: Criar Tabelas de Compras Internas

**Arquivo:** Migration Supabase

```sql
-- Compras Internas
CREATE TABLE public.claim_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_details_id UUID NOT NULL REFERENCES public.ticket_claim_details(id) ON DELETE CASCADE,
  purchase_number SERIAL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'awaiting_quotation',
  assigned_to UUID REFERENCES public.profiles(id),
  estimated_total DECIMAL(12, 2),
  approved_total DECIMAL(12, 2),
  selected_quotation_id UUID,
  due_date DATE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens da Compra
CREATE TABLE public.claim_purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_purchase_id UUID NOT NULL REFERENCES public.claim_purchases(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_of_measure TEXT DEFAULT 'un',
  estimated_unit_price DECIMAL(12, 2),
  final_unit_price DECIMAL(12, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cotações Internas
CREATE TABLE public.claim_purchase_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_purchase_id UUID NOT NULL REFERENCES public.claim_purchases(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.accredited_suppliers(id),
  supplier_name TEXT NOT NULL,
  supplier_cnpj TEXT,
  supplier_contact TEXT,
  supplier_phone TEXT,
  total_price DECIMAL(12, 2) NOT NULL,
  payment_terms TEXT,
  delivery_deadline DATE,
  validity_date DATE,
  items_breakdown JSONB,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_selected BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FK circular
ALTER TABLE public.claim_purchases 
  ADD CONSTRAINT fk_selected_quotation 
  FOREIGN KEY (selected_quotation_id) 
  REFERENCES public.claim_purchase_quotations(id);
```

**Subtarefas:**
- [x] Criar migration para claim_purchases ✅
- [x] Criar migration para claim_purchase_items ✅
- [x] Criar migration para claim_purchase_quotations ✅
- [x] Configurar RLS em todas as tabelas ✅
- [x] Criar índices necessários ✅

**Migrations:**
- `20251231_create_claim_purchases_table`
- `20251231_create_claim_purchase_items_table`
- `20251231_create_claim_purchase_quotations_table`

---

#### Tarefa 1.5: Inserir Categorias de Sinistro

**Arquivo:** Migration Supabase (seed)

```sql
DO $$
DECLARE
  v_sinistros_id UUID;
BEGIN
  SELECT id INTO v_sinistros_id FROM public.departments WHERE name = 'Sinistros';
  
  IF v_sinistros_id IS NOT NULL THEN
    INSERT INTO public.ticket_categories (name, department_id) VALUES
      ('Veículo de Cliente', v_sinistros_id),
      ('Veículo de Terceiro', v_sinistros_id),
      ('Estrutura da Unidade', v_sinistros_id),
      ('Equipamento', v_sinistros_id),
      ('Pessoa/Acidente', v_sinistros_id)
    ON CONFLICT (name, department_id) DO NOTHING;
  END IF;
END $$;
```

**Subtarefas:**
- [x] Verificar se departamento Sinistros existe ✅
- [x] Criar categorias via migration ✅
- [x] Validar inserção ✅

**Migration:** `20251231_seed_ticket_categories_sinistros`

**Categorias criadas:**
- Veículo de Cliente
- Veículo de Terceiro
- Estrutura da Unidade
- Equipamento
- Pessoa/Acidente

---

#### Tarefa 1.6: Gerar TypeScript Types

**Subtarefas:**
- [x] Executar `mcp_supabase_generate_typescript_types` ✅
- [x] Atualizar `database.types.ts` ✅
- [x] Validar tipos gerados ✅

**Arquivo atualizado:** `apps/web/src/lib/supabase/database.types.ts`

---

#### Tarefa 1.7: Rodar Security Advisors

**Subtarefas:**
- [x] Executar `mcp_supabase_get_advisors` (security) ✅
- [x] Corrigir alertas de RLS se houver ✅ (Nenhum alerta nas novas tabelas)
- [x] Documentar políticas aplicadas ✅

**Resultado:** Todas as novas tabelas estão com RLS habilitado e policies configuradas corretamente.

**Commit Checkpoint:**
```bash
git commit -m "feat(sinistros): create database schema and migrations"
```

---

### Fase 2 — Abertura e Listagem (1.5 dias) ✅ CONCLUÍDA

**Owner:** Frontend Specialist + Backend Specialist

**Status:** ✅ **CONCLUÍDA em 31/12/2024**

**Objetivo:** Implementar formulário de abertura e listagem de sinistros.

#### Tarefa 2.1: Criar Estrutura de Arquivos ✅

```
apps/web/src/app/(app)/chamados/sinistros/
├── page.tsx                           # Listagem
├── actions.ts                         # Server Actions
├── constants.ts                       # Constantes e tipos
├── loading.tsx                        # Loading skeleton
├── novo/
│   └── page.tsx                       # Formulário de abertura
├── [ticketId]/
│   ├── page.tsx                       # Detalhes (placeholder)
│   ├── actions.ts                     # Actions específicas
│   ├── loading.tsx                    # Loading skeleton
│   ├── not-found.tsx                  # Página 404
│   └── components/
│       └── index.ts                   # Exports (placeholder)
└── components/
    ├── index.ts                       # Exports
    ├── claim-form.tsx                 # Formulário de abertura
    ├── claims-table.tsx               # Tabela de sinistros
    ├── claims-filters.tsx             # Filtros
    ├── claims-stats-cards.tsx         # Cards de estatísticas
    ├── claims-pagination.tsx          # Paginação
    ├── claim-type-badge.tsx           # Badge de categoria
    └── claim-status-badge.tsx         # Badge de status
```

**Subtarefas:**
- [x] Criar estrutura de pastas ✅
- [x] Criar arquivos base com exports ✅

---

#### Tarefa 2.2: Criar Server Actions de Abertura ✅

**Arquivo:** `apps/web/src/app/(app)/chamados/sinistros/actions.ts`

**Subtarefas:**
- [x] Implementar `createClaimTicket` (com verificação de aprovação) ✅
- [x] Implementar `getClaimCategories` ✅
- [x] Implementar `getUserUnits` ✅
- [x] Implementar `checkNeedsApproval` (Manobrista → cadeia de aprovação) ✅
- [x] Implementar integração com RPC `create_ticket_approvals` (3 níveis) ✅

---

#### Tarefa 2.3: Criar Formulário de Abertura ✅

**Arquivo:** `apps/web/src/app/(app)/chamados/sinistros/novo/page.tsx`

**Campos do Formulário:**

| Seção | Campo | Tipo | Obrigatório | Implementado |
|-------|-------|------|-------------|--------------|
| **Identificação** | Título | Input | Sim | ✅ |
| | Unidade | Select | Sim | ✅ |
| | Categoria | Select (5 opções) | Sim | ✅ |
| | Tipo de Sinistro | Select | Sim | ✅ |
| **Ocorrência** | Data | DatePicker | Sim | ✅ |
| | Hora | TimePicker | Não | ✅ |
| | Local Específico | Input | Não | ✅ |
| | Nº B.O. | Input | Não | ✅ |
| **Veículo** | Placa | Input (mask) | Sim | ✅ |
| | Marca/Modelo | Input | Não | ✅ |
| | Cor | Input | Não | ✅ |
| | Ano | Input (number) | Não | ✅ |
| **Cliente** | Nome | Input | Sim | ✅ |
| | Telefone | Input (mask) | Sim | ✅ |
| | Email | Input | Não | ✅ |
| | CPF | Input (mask) | Não | ✅ |
| **Terceiro** | Houve terceiro? | Toggle | Não | ✅ |
| | Nome | Input | Condicional | ✅ |
| | Telefone | Input | Condicional | ✅ |
| | Placa | Input | Condicional | ✅ |
| **Descrição** | Descrição Detalhada | Textarea | Sim | ✅ |
| **Evidências** | Fotos | Upload múltiplo | Sim (mín. 1) | ⏳ Fase 3 |

**Subtarefas:**
- [x] Criar componente ClaimForm ✅
- [x] Implementar máscaras (placa, telefone, CPF) ✅
- [x] Implementar lógica de campos condicionais (terceiro) ✅
- [x] Integrar com Server Action ✅
- [ ] Upload de múltiplas fotos (será implementado na Fase 3 junto com anexos)

---

#### Tarefa 2.4: Criar Server Actions de Listagem ✅

**Subtarefas:**
- [x] Implementar `getClaimTickets` com filtros ✅
- [x] Implementar `getClaimStats` (estatísticas) ✅
- [x] Implementar paginação server-side ✅

---

#### Tarefa 2.5: Criar Página de Listagem ✅

**Arquivo:** `apps/web/src/app/(app)/chamados/sinistros/page.tsx`

**Componentes:**
- [x] Cards de estatísticas (total, aguardando triagem, em andamento, resolvidos) ✅
- [x] Filtros (categoria, tipo, status, unidade, período) ✅
- [x] Busca (placa, nome, número) ✅
- [x] Tabela de sinistros ✅
- [x] Paginação ✅

**Subtarefas:**
- [x] Criar ClaimsStatsCards ✅
- [x] Criar ClaimsFilters ✅
- [x] Criar ClaimsTable ✅
- [x] Criar ClaimTypeBadge ✅
- [x] Criar ClaimStatusBadge ✅
- [x] Criar ClaimsPagination ✅
- [x] Integrar componentes na página ✅

**Arquivos Criados:**
- `constants.ts` - Constantes de status, tipos de ocorrência, transições
- `actions.ts` - Server actions de listagem e abertura
- `page.tsx` - Página de listagem
- `loading.tsx` - Loading skeleton
- `novo/page.tsx` - Página de novo sinistro
- `[ticketId]/page.tsx` - Placeholder para detalhes
- `[ticketId]/actions.ts` - Actions de detalhes (preparadas para Fase 3)
- `components/claim-form.tsx` - Formulário completo
- `components/claims-table.tsx` - Tabela de sinistros
- `components/claims-filters.tsx` - Filtros
- `components/claims-stats-cards.tsx` - Cards de estatísticas
- `components/claims-pagination.tsx` - Paginação
- `components/claim-type-badge.tsx` - Badge de categoria/tipo
- `components/claim-status-badge.tsx` - Badge de status
- `components/index.ts` - Exports

**Commit Checkpoint:**
```bash
git commit -m "feat(sinistros): implement claim creation and listing"
```

---

### Fase 3 — Detalhes e Timeline (1 dia) ✅ CONCLUÍDA

**Owner:** Frontend Specialist

**Status:** ✅ **CONCLUÍDA em 31/12/2024**

**Objetivo:** Implementar página de detalhes com todas as seções.

#### Tarefa 3.1: Criar Página de Detalhes ✅

**Arquivo:** `apps/web/src/app/(app)/chamados/sinistros/[ticketId]/page.tsx`

**Seções:**
1. Header com status, prioridade e ações
2. Informações da ocorrência
3. Dados do veículo
4. Dados do cliente
5. Dados do terceiro (se houver)
6. Comunicações com cliente
7. Timeline de eventos
8. Anexos/Fotos
9. Compras internas (placeholder para Fase 4)

**Subtarefas:**
- [x] Criar ClaimHeader (número, título, status, ações) ✅
- [x] Criar ClaimInfo (categoria, tipo, data, local) ✅
- [x] Criar ClaimVehicle (placa, marca, modelo, cor, ano) ✅
- [x] Criar ClaimCustomer (nome, telefone, email, CPF) ✅
- [x] Criar ClaimThirdParty (condicional) ✅
- [x] Criar layout responsivo com tabs ✅

**Arquivos Criados:**
- `[ticketId]/components/claim-header.tsx` - Header com informações principais
- `[ticketId]/components/claim-info.tsx` - Informações da ocorrência
- `[ticketId]/components/claim-vehicle.tsx` - Dados do veículo
- `[ticketId]/components/claim-customer.tsx` - Dados do cliente
- `[ticketId]/components/claim-third-party.tsx` - Dados do terceiro
- `[ticketId]/page.tsx` - Página completa com tabs

---

#### Tarefa 3.2: Criar Seção de Comunicações com Cliente ✅

**Arquivo:** `[ticketId]/components/claim-communications.tsx`

**Campos por comunicação:**
- Data/Hora
- Canal (Telefone, WhatsApp, Email, Presencial)
- Resumo
- Próximo Contato
- Responsável (auto)

**Subtarefas:**
- [x] Criar lista de comunicações ✅
- [x] Criar formulário de nova comunicação (Dialog) ✅
- [x] Utilizar Server Action `addClaimCommunication` existente ✅
- [x] Implementar ordenação por data (mais recente primeiro) ✅

**Funcionalidades Implementadas:**
- Lista de comunicações com ícones por canal
- Dialog para registrar nova comunicação
- Campo de próximo contato opcional
- Cores diferenciadas por canal (telefone, whatsapp, email, presencial)
- Ordenação automática por data

---

#### Tarefa 3.3: Criar Timeline de Eventos ✅

**Arquivo:** `[ticketId]/components/claim-timeline.tsx`

**Subtarefas:**
- [x] Reutilizar lógica de ticket_history ✅
- [x] Criar componente visual de timeline ✅
- [x] Incluir eventos de comunicação na timeline ✅
- [x] Incluir eventos de compras internas ✅

**Funcionalidades Implementadas:**
- Timeline unificada com histórico, comunicações e compras
- Ícones e cores diferenciados por tipo de evento
- Descrições contextualizadas para cada ação
- Ordenação cronológica (mais recente primeiro)

---

#### Tarefa 3.4: Criar Galeria de Anexos ✅

**Arquivo:** `[ticketId]/components/claim-attachments.tsx`

**Subtarefas:**
- [x] Criar grid de imagens ✅
- [x] Implementar preview/lightbox ✅
- [x] Implementar upload adicional de fotos (preparado) ✅
- [x] Categorizar anexos (Fotos do Dano, Ticket, Documentos) ✅

**Funcionalidades Implementadas:**
- Grid responsivo de imagens com hover effects
- Lightbox para visualização em tela cheia
- Navegação entre imagens (setas e contador)
- Lista de documentos com ícones por tipo
- Categorização visual com badges coloridos
- Botão de download para todos os arquivos
- Preparação para upload (prop onUpload)

**Commit Checkpoint:**
```bash
git commit -m "feat(sinistros): implement claim details and timeline"
```

---

### Fase 4 — Compras Internas (1.5 dias)

**Owner:** Backend Specialist + Frontend Specialist

**Objetivo:** Implementar sistema completo de compras internas de peças.

#### Tarefa 4.1: Criar Server Actions de Compras

**Arquivo:** `[ticketId]/actions.ts`

**Subtarefas:**
- [ ] Implementar `createClaimPurchase`
- [ ] Implementar `addClaimPurchaseItem`
- [ ] Implementar `removeClaimPurchaseItem`
- [ ] Implementar `getClaimPurchases`

---

#### Tarefa 4.2: Criar Server Actions de Cotações

**Subtarefas:**
- [ ] Implementar `addClaimQuotation`
- [ ] Implementar `selectClaimQuotation`
- [ ] Implementar `getAccreditedSuppliers`
- [ ] Implementar validação de mínimo 2 cotações

---

#### Tarefa 4.3: Criar Server Actions de Aprovação de Compra

**Regra:** Apenas Gerente de Sinistros pode aprovar.

**Subtarefas:**
- [ ] Implementar `approveClaimPurchase`
- [ ] Implementar verificação de permissão (Gerente)
- [ ] Implementar verificação de mínimo 2 cotações
- [ ] Implementar transição de status

---

#### Tarefa 4.4: Criar Formulário de Nova Compra

**Arquivo:** `claim-purchase-form.tsx`

**Campos:**
- Título
- Descrição
- Itens (nome, quantidade, unidade, preço estimado)

**Subtarefas:**
- [ ] Criar formulário com lista dinâmica de itens
- [ ] Implementar adição/remoção de itens
- [ ] Calcular total estimado
- [ ] Integrar com Server Action

---

#### Tarefa 4.5: Criar Lista de Compras Internas

**Arquivo:** `claim-purchases.tsx`

**Subtarefas:**
- [ ] Criar card de compra com status
- [ ] Exibir itens da compra
- [ ] Exibir cotações recebidas
- [ ] Indicar cotação selecionada
- [ ] Botões de ação (adicionar cotação, aprovar)

---

#### Tarefa 4.6: Criar Formulário de Cotação

**Arquivo:** `claim-quotation-form.tsx`

**Campos:**
- Fornecedor (select credenciado OU input livre)
- CNPJ
- Contato/Telefone
- Preço Total
- Forma de Pagamento
- Prazo de Entrega
- Validade
- Observações

**Subtarefas:**
- [ ] Criar formulário com autocomplete de fornecedores
- [ ] Implementar modo híbrido (credenciado/livre)
- [ ] Integrar com Server Action

---

#### Tarefa 4.7: Criar Tela de Cadastro de Fornecedores

**Arquivo:** `apps/web/src/app/(app)/configuracoes/fornecedores/page.tsx`

**Subtarefas:**
- [ ] Criar listagem de fornecedores
- [ ] Criar formulário de cadastro/edição
- [ ] Implementar filtro por categoria
- [ ] Implementar ativação/desativação

**Commit Checkpoint:**
```bash
git commit -m "feat(sinistros): implement internal purchases and quotations"
```

---

### Fase 5 — Fluxos Especiais (1 dia)

**Owner:** Backend Specialist + Frontend Specialist

**Objetivo:** Implementar fluxo de aprovação, integração com Manutenção e transições de status.

#### Tarefa 5.1: Implementar Fluxo de Aprovação em Cadeia

**Regra:** Manobrista abrindo sinistro → Encarregado → Supervisor → Gerente → Triagem

**Subtarefas:**
- [ ] Reutilizar lógica de `ticket_approvals`
- [ ] Criar componente ClaimApprovals
- [ ] Implementar `handleClaimApproval`
- [ ] Implementar transição de status após aprovação/rejeição
- [ ] Exibir aprovações pendentes no dashboard

---

#### Tarefa 5.2: Implementar Integração com Manutenção

**Regra:** Botão opcional "Gerar Chamado de Manutenção" para sinistros de estrutura/equipamento.

**Subtarefas:**
- [ ] Criar Server Action `createMaintenanceFromClaim`
- [ ] Pré-preencher dados do chamado de manutenção
- [ ] Vincular chamados (referência no sinistro)
- [ ] Criar botão condicional (categoria = Estrutura ou Equipamento)

---

#### Tarefa 5.3: Implementar Transições de Status

**Status do Sinistro:**
```
awaiting_triage → in_analysis → in_investigation
                             → awaiting_customer
                             → awaiting_quotations
                             → in_repair
                             → awaiting_payment
                             → resolved → closed
                             → denied
```

**Subtarefas:**
- [ ] Criar mapa de transições permitidas
- [ ] Implementar `changeClaimStatus`
- [ ] Criar componente de ações de status
- [ ] Validar transições no backend

---

#### Tarefa 5.4: Implementar Triagem de Sinistros

**Campos de Triagem:**
- Prioridade (Baixa/Média/Alta/Urgente)
- Responsável
- Previsão de Conclusão

**Subtarefas:**
- [ ] Criar dialog de triagem
- [ ] Implementar `triageClaimTicket`
- [ ] Validar permissão (Supervisor/Gerente de Sinistros)

**Commit Checkpoint:**
```bash
git commit -m "feat(sinistros): implement approval flow and maintenance integration"
```

---

### Fase 6 — Validação e Testes (0.5 dia)

**Owner:** Security Auditor + Feature Developer

**Objetivo:** Validar o módulo completo e garantir qualidade.

#### Tarefa 6.1: Testar Fluxo Completo

**Cenários:**
1. Manobrista abre sinistro → aprovação em cadeia → triagem
2. Supervisor abre sinistro → vai direto para triagem
3. Criar compra interna → 2 cotações → aprovar → finalizar
4. Registrar comunicação com cliente
5. Gerar chamado de manutenção a partir do sinistro

**Subtarefas:**
- [ ] Executar cada cenário manualmente
- [ ] Documentar resultados
- [ ] Corrigir bugs encontrados

---

#### Tarefa 6.2: Testar RLS e Permissões

**Perfis a testar:**
- Manobrista (vê apenas sua unidade)
- Supervisor Operações (vê unidades de cobertura)
- Supervisor Sinistros (vê todos)
- Gerente Sinistros (vê todos, pode aprovar compras)
- Admin (vê todos)

**Subtarefas:**
- [ ] Testar cada perfil
- [ ] Validar visibilidade de dados
- [ ] Validar ações permitidas
- [ ] Corrigir policies se necessário

---

#### Tarefa 6.3: Rodar Security Advisors Final

**Subtarefas:**
- [ ] Executar `mcp_supabase_get_advisors` (security)
- [ ] Corrigir alertas
- [ ] Documentar estado final

---

#### Tarefa 6.4: Atualizar Documentação

**Subtarefas:**
- [ ] Atualizar `projeto/chamados/sinistros.md` com fluxo final
- [ ] Atualizar `entregaveis_geral.md` com status
- [ ] Atualizar PRD se necessário

**Commit Checkpoint:**
```bash
git commit -m "chore(sinistros): complete validation and documentation"
```

---

## Rollback Plan

### Rollback Triggers

- Bugs críticos em RLS expondo dados
- Fluxo de aprovação inconsistente
- Compras internas com erro de cálculo
- Integração com Manutenção causando dados órfãos

### Rollback Procedures

#### Fase 1-2 Rollback
- Action: Reverter migrations; DROP TABLES
- Data Impact: Nenhum (sem dados de produção)
- Estimated Time: < 30 min

#### Fase 3-5 Rollback
- Action: Reverter commits de feature; restaurar versão anterior
- Data Impact: Possível perda de sinistros de teste
- Estimated Time: 1-2 horas

### Post-Rollback Actions
1. Documentar razão do rollback
2. Notificar stakeholders
3. Analisar causa raiz
4. Atualizar plano com lições aprendidas

---

## Evidence & Follow-up

### Artefatos a Coletar

- [ ] Screenshot da tela de abertura de sinistro
- [ ] Screenshot da listagem de sinistros
- [ ] Screenshot dos detalhes do sinistro
- [ ] Screenshot do fluxo de aprovação
- [ ] Screenshot do sistema de compras internas
- [ ] Screenshot das comunicações com cliente
- [ ] Screenshot da integração com manutenção
- [ ] Log de teste de RLS
- [ ] Output de `mcp_supabase_get_advisors` (security)
- [ ] TypeScript types gerados

### Follow-up Actions

- [ ] Atualizar `entregaveis_geral.md` com módulo concluído
- [ ] Preparar dados de seed (fornecedores de exemplo)
- [ ] Documentar fluxo de sinistros para treinamento
- [ ] Planejar módulo Comercial (próximo da Entrega 2)

---

## Referências Técnicas

### Stack do Projeto
- **Framework:** Next.js 15 (App Router)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **Database:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **UI:** shadcn/ui + Tailwind CSS

### Arquivos de Referência
- `apps/web/src/app/(app)/chamados/compras/` — Padrão de chamados
- `apps/web/src/app/(app)/chamados/manutencao/` — Padrão de manutenção
- `apps/web/src/lib/supabase/` — Clientes Supabase
- `apps/web/src/lib/auth/permissions.ts` — Sistema de permissões

### Permissões a Adicionar

```typescript
export const PERMISSIONS = {
  // ... existentes ...
  
  // Sinistros
  'claims:read': ['Desenvolvedor', 'Administrador', 'Diretor', /* + perfis */],
  'claims:create': ['Desenvolvedor', 'Administrador', /* + Operações */],
  'claims:triage': ['Desenvolvedor', 'Administrador', 'Supervisor', 'Gerente'], // Sinistros
  'claims:approve': ['Desenvolvedor', 'Administrador', 'Encarregado', 'Supervisor', 'Gerente'],
  'claims:approve_purchase': ['Desenvolvedor', 'Administrador', 'Gerente'], // Apenas Gerente Sinistros
  'claims:manage_suppliers': ['Desenvolvedor', 'Administrador'],
}
```

<!-- agent-update:end -->
