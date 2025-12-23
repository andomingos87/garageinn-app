---
id: plan-checklists
ai_update_goal: "Implementar o módulo completo de Checklists da Entrega 1, incluindo modelo de dados, tela de configuração de templates, execução de checklists de abertura e histórico."
required_inputs:
  - "Checklist da entrega: projeto/entregaveis/entrega1_tarefas.md (Checklists — itens 60-66)"
  - "PRD: projeto/PRD.md (seção 3.2 Checklists)"
  - "Design System: design-system.md (tokens e componentes)"
  - "Tabelas existentes: units, profiles, user_units (já migradas)"
success_criteria:
  - "Modelo de dados criado: checklist_templates, checklist_questions, checklist_executions, checklist_answers"
  - "Tela de configuração de checklist de abertura funcional (admin)"
  - "Tela de execução de checklist de abertura funcional (Operações)"
  - "Tela de histórico de checklists executados com filtros"
  - "Admin pode excluir checklists (unitário e em massa)"
  - "RLS e políticas de segurança configuradas corretamente"
  - "Permissões checklists:* integradas ao RBAC"
related_agents:
  - "code-reviewer"
  - "feature-developer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
  - "database-specialist"
---

<!-- agent-update:start:plan-checklists -->
# Plano de Checklists - GAPP Entrega 1

> Implementar o módulo completo de Checklists da Entrega 1, incluindo modelo de dados, tela de configuração de templates, execução de checklists de abertura e histórico.

## Checklist de Tarefas

| # | Tarefa | Status | Arquivos Principais |
|---|--------|--------|---------------------|
| 1 | Criar modelo de dados (migrations) | ✅ Concluído | Migrations Supabase, `database.types.ts` |
| 2 | Criar tela de configuração de checklist de abertura (admin) | ✅ Concluído | `apps/web/src/app/(app)/checklists/configurar/` |
| 3 | Criar tela de execução de checklist de abertura | ✅ Concluído | `apps/web/src/app/(app)/checklists/executar/` |
| 4 | Criar tela de histórico de checklists executados | ⏳ Pendente | `apps/web/src/app/(app)/checklists/page.tsx` |
| 5 | Implementar exclusão de checklists (admin) | ⏳ Pendente | Server Actions, Dialog de confirmação |

---

## Task Snapshot

- **Primary goal:** Entregar o módulo de Checklists de Abertura completo, permitindo que administradores configurem templates de checklist, funcionários de Operações executem checklists diários nas unidades, e todos possam visualizar o histórico de execuções.
- **Success signal:**
  - Templates de checklist configuráveis (perguntas Sim/Não, ordem, obrigatoriedade)
  - Execução de checklist vinculada à unidade e ao usuário
  - Histórico filtrado por unidade, data e status
  - Admin pode excluir execuções (unitário e em massa)
  - Não-conformidades visíveis para supervisores/gerentes
- **Key references:**
  - `projeto/entregaveis/entrega1_tarefas.md` (Checklists)
  - `projeto/PRD.md` (seção 3.2 Checklists)
  - `design-system.md` (tokens e componentes)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
- **Out of scope (nesta etapa):** Checklist de Supervisão (Entrega 2), upload de fotos (Storage), notificações de não-conformidades.

---

## Contexto de Negócio (PRD 3.2)

### 3.2.1 Checklist de Abertura

**Objetivo:** Verificação diária das condições da garagem no início das operações.

**Características:**
- Executado diariamente na abertura de cada unidade
- Composto por perguntas de **Sim/Não**
- Perguntas são **dinâmicas por unidade** (template vinculado)
- Configurável via painel administrativo

**Campos da Pergunta:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Texto da pergunta | Texto | A pergunta em si |
| Ordem | Número | Posição no checklist |
| Obrigatória | Boolean | Se pode ser pulada |
| Observação obrigatória se "Não" | Boolean | Exige justificativa |
| Ativo | Boolean | Se está em uso |

**Campos da Execução:**
| Campo | Tipo |
|-------|------|
| Unidade | Referência |
| Data/Hora de execução | Timestamp |
| Executado por | Referência ao usuário |
| Respostas | Array de respostas |
| Observações gerais | Texto |
| Fotos | Array de imagens (futuro) |

**Fluxo:**
1. Encarregado/Manobrista inicia o checklist de abertura
2. Responde cada pergunta (Sim/Não)
3. Adiciona observações quando necessário
4. Finaliza e envia o checklist
5. Sistema registra não-conformidades para acompanhamento por Supervisores/Gerentes

---

## Modelo de Dados

### Tabelas a Criar

```
checklist_templates
├── id: uuid (PK)
├── name: text (NOT NULL) -- Ex: "Checklist de Abertura - Padrão"
├── description: text (nullable)
├── type: text (NOT NULL) -- 'opening' | 'supervision' (futuro)
├── is_default: boolean (default FALSE) -- Template padrão para novas unidades
├── status: text ('active'|'inactive', default 'active')
├── created_by: uuid (FK → profiles.id)
├── created_at: timestamptz
└── updated_at: timestamptz

checklist_questions
├── id: uuid (PK)
├── template_id: uuid (FK → checklist_templates.id, ON DELETE CASCADE)
├── question_text: text (NOT NULL)
├── order_index: integer (NOT NULL) -- Ordem de exibição
├── is_required: boolean (default TRUE)
├── requires_observation_on_no: boolean (default FALSE) -- Exige observação se responder "Não"
├── status: text ('active'|'inactive', default 'active')
├── created_at: timestamptz
└── updated_at: timestamptz
└── UNIQUE(template_id, order_index)

unit_checklist_templates (vínculo unidade-template)
├── id: uuid (PK)
├── unit_id: uuid (FK → units.id, ON DELETE CASCADE)
├── template_id: uuid (FK → checklist_templates.id, ON DELETE CASCADE)
├── created_at: timestamptz
└── UNIQUE(unit_id, template_id)

checklist_executions
├── id: uuid (PK)
├── template_id: uuid (FK → checklist_templates.id)
├── unit_id: uuid (FK → units.id)
├── executed_by: uuid (FK → profiles.id)
├── started_at: timestamptz (NOT NULL)
├── completed_at: timestamptz (nullable) -- NULL se em andamento
├── status: text ('in_progress'|'completed', default 'in_progress')
├── general_observations: text (nullable)
├── has_non_conformities: boolean (default FALSE) -- Computed: tem resposta "Não"
├── created_at: timestamptz
└── updated_at: timestamptz

checklist_answers
├── id: uuid (PK)
├── execution_id: uuid (FK → checklist_executions.id, ON DELETE CASCADE)
├── question_id: uuid (FK → checklist_questions.id)
├── answer: boolean (NOT NULL) -- TRUE = Sim, FALSE = Não
├── observation: text (nullable) -- Observação da resposta
├── created_at: timestamptz
└── UNIQUE(execution_id, question_id)
```

### Diagrama ER

```
┌─────────────────────┐     ┌──────────────────────────┐
│ checklist_templates │────<│    checklist_questions   │
│ (1 template)        │     │ (N perguntas)            │
└─────────────────────┘     └──────────────────────────┘
         │                              │
         │ (N:M via unit_checklist_     │
         │  templates)                  │
         ▼                              │
┌─────────────────────┐                 │
│      units          │                 │
└─────────────────────┘                 │
         │                              │
         │ (1:N)                        │
         ▼                              ▼
┌─────────────────────┐     ┌──────────────────────────┐
│checklist_executions │────<│   checklist_answers      │
│ (1 execução)        │     │ (N respostas)            │
└─────────────────────┘     └──────────────────────────┘
         │
         │ (N:1)
         ▼
┌─────────────────────┐
│     profiles        │
│ (executed_by)       │
└─────────────────────┘
```

---

## Tarefa 1: Criar Modelo de Dados (Migrations)

### Objetivo
Criar as tabelas, índices, constraints, RLS policies e triggers necessários para o módulo de Checklists.

### Subtarefas

#### 1.1 Migration: Criar Tabela checklist_templates

```sql
-- Migration: create_checklist_templates
CREATE TABLE public.checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'opening' CHECK (type IN ('opening', 'supervision')),
  is_default BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.checklist_templates IS 'Templates de checklist configuráveis';
COMMENT ON COLUMN public.checklist_templates.type IS 'Tipo: opening (abertura) ou supervision (supervisão)';
COMMENT ON COLUMN public.checklist_templates.is_default IS 'Template padrão para novas unidades';

-- Trigger para updated_at
CREATE TRIGGER on_checklist_templates_updated
  BEFORE UPDATE ON public.checklist_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índices
CREATE INDEX idx_checklist_templates_type ON public.checklist_templates(type);
CREATE INDEX idx_checklist_templates_status ON public.checklist_templates(status);
CREATE INDEX idx_checklist_templates_is_default ON public.checklist_templates(is_default);
```

#### 1.2 Migration: Criar Tabela checklist_questions

```sql
-- Migration: create_checklist_questions
CREATE TABLE public.checklist_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  requires_observation_on_no BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, order_index)
);

COMMENT ON TABLE public.checklist_questions IS 'Perguntas de um template de checklist';
COMMENT ON COLUMN public.checklist_questions.order_index IS 'Ordem de exibição no checklist';
COMMENT ON COLUMN public.checklist_questions.requires_observation_on_no IS 'Exige observação se resposta for Não';

-- Trigger para updated_at
CREATE TRIGGER on_checklist_questions_updated
  BEFORE UPDATE ON public.checklist_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índices
CREATE INDEX idx_checklist_questions_template_id ON public.checklist_questions(template_id);
CREATE INDEX idx_checklist_questions_status ON public.checklist_questions(status);
```

#### 1.3 Migration: Criar Tabela unit_checklist_templates

```sql
-- Migration: create_unit_checklist_templates
CREATE TABLE public.unit_checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, template_id)
);

COMMENT ON TABLE public.unit_checklist_templates IS 'Vínculo entre unidades e templates de checklist';

-- Índices
CREATE INDEX idx_unit_checklist_templates_unit_id ON public.unit_checklist_templates(unit_id);
CREATE INDEX idx_unit_checklist_templates_template_id ON public.unit_checklist_templates(template_id);
```

#### 1.4 Migration: Criar Tabela checklist_executions

```sql
-- Migration: create_checklist_executions
CREATE TABLE public.checklist_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.checklist_templates(id),
  unit_id UUID NOT NULL REFERENCES public.units(id),
  executed_by UUID NOT NULL REFERENCES public.profiles(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  general_observations TEXT,
  has_non_conformities BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.checklist_executions IS 'Execuções de checklists';
COMMENT ON COLUMN public.checklist_executions.has_non_conformities IS 'Indica se existe alguma resposta Não';

-- Trigger para updated_at
CREATE TRIGGER on_checklist_executions_updated
  BEFORE UPDATE ON public.checklist_executions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índices
CREATE INDEX idx_checklist_executions_template_id ON public.checklist_executions(template_id);
CREATE INDEX idx_checklist_executions_unit_id ON public.checklist_executions(unit_id);
CREATE INDEX idx_checklist_executions_executed_by ON public.checklist_executions(executed_by);
CREATE INDEX idx_checklist_executions_status ON public.checklist_executions(status);
CREATE INDEX idx_checklist_executions_started_at ON public.checklist_executions(started_at DESC);
CREATE INDEX idx_checklist_executions_has_non_conformities ON public.checklist_executions(has_non_conformities);
```

#### 1.5 Migration: Criar Tabela checklist_answers

```sql
-- Migration: create_checklist_answers
CREATE TABLE public.checklist_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES public.checklist_executions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.checklist_questions(id),
  answer BOOLEAN NOT NULL,
  observation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(execution_id, question_id)
);

COMMENT ON TABLE public.checklist_answers IS 'Respostas de uma execução de checklist';
COMMENT ON COLUMN public.checklist_answers.answer IS 'TRUE = Sim, FALSE = Não';

-- Índices
CREATE INDEX idx_checklist_answers_execution_id ON public.checklist_answers(execution_id);
CREATE INDEX idx_checklist_answers_question_id ON public.checklist_answers(question_id);
CREATE INDEX idx_checklist_answers_answer ON public.checklist_answers(answer);
```

#### 1.6 Migration: Criar RLS Policies

```sql
-- Migration: create_checklist_rls_policies

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_answers ENABLE ROW LEVEL SECURITY;

-- checklist_templates: Todos podem ler ativos; admins gerenciam
CREATE POLICY "Anyone can view active templates" ON public.checklist_templates
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage templates" ON public.checklist_templates
  FOR ALL USING (public.is_admin());

-- checklist_questions: Leitura via template; admins gerenciam
CREATE POLICY "Anyone can view questions of active templates" ON public.checklist_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checklist_templates t 
      WHERE t.id = template_id AND t.status = 'active'
    )
  );

CREATE POLICY "Admins can manage questions" ON public.checklist_questions
  FOR ALL USING (public.is_admin());

-- unit_checklist_templates: Leitura por vínculo; admins gerenciam
CREATE POLICY "Users can view templates of their units" ON public.unit_checklist_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_units uu 
      WHERE uu.unit_id = unit_checklist_templates.unit_id 
      AND uu.user_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Admins can manage unit templates" ON public.unit_checklist_templates
  FOR ALL USING (public.is_admin());

-- checklist_executions: Criação por usuário da unidade; leitura conforme visibilidade
CREATE POLICY "Users can create executions for their units" ON public.checklist_executions
  FOR INSERT WITH CHECK (
    executed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.user_units uu 
      WHERE uu.unit_id = checklist_executions.unit_id 
      AND uu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view executions of their units" ON public.checklist_executions
  FOR SELECT USING (
    executed_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_units uu 
      WHERE uu.unit_id = checklist_executions.unit_id 
      AND uu.user_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Users can update own in-progress executions" ON public.checklist_executions
  FOR UPDATE USING (
    executed_by = auth.uid() AND status = 'in_progress'
  );

CREATE POLICY "Admins can manage all executions" ON public.checklist_executions
  FOR ALL USING (public.is_admin());

-- checklist_answers: Vinculadas à execução
CREATE POLICY "Users can manage answers of own executions" ON public.checklist_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.checklist_executions e 
      WHERE e.id = execution_id 
      AND e.executed_by = auth.uid()
      AND e.status = 'in_progress'
    )
  );

CREATE POLICY "Users can view answers of visible executions" ON public.checklist_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.checklist_executions e 
      WHERE e.id = execution_id 
      AND (
        e.executed_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.user_units uu 
          WHERE uu.unit_id = e.unit_id 
          AND uu.user_id = auth.uid()
        )
        OR public.is_admin()
      )
    )
  );

CREATE POLICY "Admins can manage all answers" ON public.checklist_answers
  FOR ALL USING (public.is_admin());
```

#### 1.7 Migration: Criar Function para Atualizar has_non_conformities

```sql
-- Migration: create_checklist_functions

-- Função para atualizar has_non_conformities após inserção/update de respostas
CREATE OR REPLACE FUNCTION public.update_checklist_non_conformities()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.checklist_executions
  SET has_non_conformities = EXISTS (
    SELECT 1 FROM public.checklist_answers
    WHERE execution_id = NEW.execution_id
    AND answer = FALSE
  )
  WHERE id = NEW.execution_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar automaticamente
CREATE TRIGGER on_checklist_answer_change
  AFTER INSERT OR UPDATE ON public.checklist_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_checklist_non_conformities();
```

#### 1.8 Migration: Criar View para Execuções com Detalhes

```sql
-- Migration: create_checklist_views

CREATE OR REPLACE VIEW public.checklist_executions_with_details AS
SELECT 
  e.id,
  e.template_id,
  e.unit_id,
  e.executed_by,
  e.started_at,
  e.completed_at,
  e.status,
  e.general_observations,
  e.has_non_conformities,
  e.created_at,
  t.name AS template_name,
  t.type AS template_type,
  u.name AS unit_name,
  u.code AS unit_code,
  p.full_name AS executed_by_name,
  p.avatar_url AS executed_by_avatar,
  (
    SELECT COUNT(*) 
    FROM public.checklist_answers a 
    WHERE a.execution_id = e.id
  ) AS total_answers,
  (
    SELECT COUNT(*) 
    FROM public.checklist_answers a 
    WHERE a.execution_id = e.id AND a.answer = FALSE
  ) AS non_conformities_count
FROM public.checklist_executions e
LEFT JOIN public.checklist_templates t ON t.id = e.template_id
LEFT JOIN public.units u ON u.id = e.unit_id
LEFT JOIN public.profiles p ON p.id = e.executed_by;
```

### Critérios de Aceite
- [x] Tabelas criadas e validadas via `mcp_supabase_list_tables`
- [x] Índices criados e funcionando
- [x] RLS policies configuradas (usuário Operações vs admin)
- [x] Trigger de has_non_conformities funcionando
- [x] View `checklist_executions_with_details` retornando dados (SECURITY INVOKER)
- [x] TypeScript types regenerados

### Migrations Criadas
| Migration | Descrição |
|-----------|-----------|
| `create_checklist_templates_table` | Tabela de templates de checklist |
| `create_checklist_questions_table` | Tabela de perguntas de checklist |
| `create_unit_checklist_templates_table` | Tabela de vínculo unidade-template |
| `create_checklist_executions_table` | Tabela de execuções de checklists |
| `create_checklist_answers_table` | Tabela de respostas de execuções |
| `create_checklist_rls_policies` | RLS policies para todas as tabelas |
| `create_checklist_non_conformities_function` | Function e triggers para has_non_conformities |
| `create_checklist_executions_view` | View de execuções com detalhes |
| `fix_checklist_view_security` | Correção de SECURITY INVOKER na view |

---

## Tarefa 2: Criar Tela de Configuração de Checklist de Abertura (Admin)

### Objetivo
Implementar interface administrativa para criar, editar e gerenciar templates de checklist e suas perguntas.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/checklists/
├── configurar/
│   ├── page.tsx                      # Lista de templates (Server Component)
│   ├── actions.ts                    # Server Actions de templates
│   ├── novo/
│   │   └── page.tsx                  # Formulário de novo template
│   ├── [templateId]/
│   │   ├── page.tsx                  # Detalhes do template
│   │   ├── editar/
│   │   │   └── page.tsx              # Edição do template
│   │   └── perguntas/
│   │       └── page.tsx              # Gerenciar perguntas
│   └── components/
│       ├── template-card.tsx         # Card de template
│       ├── template-form.tsx         # Formulário de template
│       ├── questions-list.tsx        # Lista de perguntas (drag & drop)
│       ├── question-form-dialog.tsx  # Dialog para adicionar/editar pergunta
│       └── unit-assignment-dialog.tsx # Dialog para vincular unidades
```

### Subtarefas

#### 2.1 Criar Server Actions para Templates

**Arquivo:** `apps/web/src/app/(app)/checklists/configurar/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Listar templates
export async function getTemplates(filters?: {
  search?: string
  type?: string
  status?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('checklist_templates')
    .select(`
      *,
      questions:checklist_questions(count),
      units:unit_checklist_templates(
        unit:units(id, name, code)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }
  
  if (filters?.type) {
    query = query.eq('type', filters.type)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

// Criar template
export async function createTemplate(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const type = formData.get('type') as string || 'opening'
  const is_default = formData.get('is_default') === 'true'
  
  const { data, error } = await supabase
    .from('checklist_templates')
    .insert({
      name,
      description,
      type,
      is_default,
      created_by: user.id,
      status: 'active'
    })
    .select()
    .single()
  
  if (error) return { error: error.message }
  
  revalidatePath('/checklists/configurar')
  redirect(`/checklists/configurar/${data.id}/perguntas`)
}

// Atualizar template
export async function updateTemplate(templateId: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const is_default = formData.get('is_default') === 'true'
  const status = formData.get('status') as 'active' | 'inactive'
  
  const { error } = await supabase
    .from('checklist_templates')
    .update({ name, description, is_default, status })
    .eq('id', templateId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/checklists/configurar')
  revalidatePath(`/checklists/configurar/${templateId}`)
  redirect(`/checklists/configurar/${templateId}`)
}

// Deletar template
export async function deleteTemplate(templateId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('checklist_templates')
    .delete()
    .eq('id', templateId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/checklists/configurar')
  return { success: true }
}

// === Perguntas ===

// Listar perguntas de um template
export async function getQuestions(templateId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('checklist_questions')
    .select('*')
    .eq('template_id', templateId)
    .order('order_index')
  
  if (error) throw error
  return data
}

// Adicionar pergunta
export async function addQuestion(templateId: string, formData: FormData) {
  const supabase = await createClient()
  
  const question_text = formData.get('question_text') as string
  const is_required = formData.get('is_required') === 'true'
  const requires_observation_on_no = formData.get('requires_observation_on_no') === 'true'
  
  // Obter próximo order_index
  const { data: maxOrder } = await supabase
    .from('checklist_questions')
    .select('order_index')
    .eq('template_id', templateId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()
  
  const nextOrder = (maxOrder?.order_index ?? 0) + 1
  
  const { data, error } = await supabase
    .from('checklist_questions')
    .insert({
      template_id: templateId,
      question_text,
      order_index: nextOrder,
      is_required,
      requires_observation_on_no,
      status: 'active'
    })
    .select()
    .single()
  
  if (error) return { error: error.message }
  
  revalidatePath(`/checklists/configurar/${templateId}/perguntas`)
  return { success: true, data }
}

// Atualizar pergunta
export async function updateQuestion(questionId: string, formData: FormData) {
  const supabase = await createClient()
  
  const question_text = formData.get('question_text') as string
  const is_required = formData.get('is_required') === 'true'
  const requires_observation_on_no = formData.get('requires_observation_on_no') === 'true'
  const status = formData.get('status') as 'active' | 'inactive'
  
  const { error } = await supabase
    .from('checklist_questions')
    .update({ question_text, is_required, requires_observation_on_no, status })
    .eq('id', questionId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/checklists/configurar')
  return { success: true }
}

// Deletar pergunta
export async function deleteQuestion(questionId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('checklist_questions')
    .delete()
    .eq('id', questionId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/checklists/configurar')
  return { success: true }
}

// Reordenar perguntas
export async function reorderQuestions(templateId: string, orderedIds: string[]) {
  const supabase = await createClient()
  
  // Atualizar cada pergunta com novo order_index
  const updates = orderedIds.map((id, index) => 
    supabase
      .from('checklist_questions')
      .update({ order_index: index + 1 })
      .eq('id', id)
  )
  
  await Promise.all(updates)
  
  revalidatePath(`/checklists/configurar/${templateId}/perguntas`)
  return { success: true }
}

// === Vínculo com Unidades ===

// Vincular template a unidades
export async function assignTemplateToUnits(templateId: string, unitIds: string[]) {
  const supabase = await createClient()
  
  // Remover vínculos existentes
  await supabase
    .from('unit_checklist_templates')
    .delete()
    .eq('template_id', templateId)
  
  // Inserir novos vínculos
  if (unitIds.length > 0) {
    const inserts = unitIds.map(unitId => ({
      unit_id: unitId,
      template_id: templateId
    }))
    
    const { error } = await supabase
      .from('unit_checklist_templates')
      .insert(inserts)
    
    if (error) return { error: error.message }
  }
  
  revalidatePath('/checklists/configurar')
  revalidatePath(`/checklists/configurar/${templateId}`)
  return { success: true }
}

// Obter unidades vinculadas a um template
export async function getTemplateUnits(templateId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('unit_checklist_templates')
    .select(`
      id,
      unit:units(id, name, code, status)
    `)
    .eq('template_id', templateId)
  
  if (error) throw error
  return data
}
```

#### 2.2 Criar Página de Listagem de Templates

**Arquivo:** `apps/web/src/app/(app)/checklists/configurar/page.tsx`

**Características:**
- Server Component com fetch de dados
- RequireAdmin para acesso
- Estatísticas (total, ativos, inativos, com não-conformidades)
- Grid de cards de templates
- Botão "Novo Template"
- Filtros por tipo e status

#### 2.3 Criar Formulário de Template

**Arquivo:** `apps/web/src/app/(app)/checklists/configurar/components/template-form.tsx`

**Campos:**
| Campo | Tipo | Validação | Obrigatório |
|-------|------|-----------|-------------|
| name | Input text | Mínimo 3 caracteres | Sim |
| description | Textarea | - | Não |
| type | Select | opening/supervision | Sim (default: opening) |
| is_default | Checkbox | - | Não |
| status | Select | active/inactive | Sim (default: active) |

#### 2.4 Criar Lista de Perguntas com Drag & Drop

**Arquivo:** `apps/web/src/app/(app)/checklists/configurar/components/questions-list.tsx`

**Funcionalidades:**
- Lista ordenável de perguntas (drag & drop)
- Indicadores: obrigatória, exige observação
- Botões: editar, desativar, excluir
- Botão "Adicionar Pergunta"
- Estado vazio: "Nenhuma pergunta cadastrada"

#### 2.5 Criar Dialog de Pergunta

**Arquivo:** `apps/web/src/app/(app)/checklists/configurar/components/question-form-dialog.tsx`

**Campos:**
- Texto da pergunta (textarea)
- Obrigatória (checkbox, default: true)
- Exige observação se "Não" (checkbox, default: false)
- Status (select: active/inactive)

#### 2.6 Criar Dialog de Vínculo com Unidades

**Arquivo:** `apps/web/src/app/(app)/checklists/configurar/components/unit-assignment-dialog.tsx`

**Funcionalidades:**
- Lista de todas as unidades ativas
- Checkbox para selecionar/deselecionar
- Busca por nome/código
- Botões: Salvar, Cancelar
- Indicador de quantas unidades selecionadas

### Design Visual
- Grid de templates: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Cards com: nome, descrição, tipo (badge), número de perguntas, unidades vinculadas
- Lista de perguntas com DnD (usar biblioteca dnd-kit ou @hello-pangea/dnd)
- Dialog modal para formulários
- Cores semânticas: verde (ativo), cinza (inativo)

### Critérios de Aceite
- [x] CRUD de templates funcional
- [x] CRUD de perguntas funcional
- [x] Reordenação de perguntas via drag & drop
- [x] Vínculo de template com unidades funcional
- [x] Validação de permissão (apenas admin)
- [x] Responsivo em mobile

### Arquivos Criados

**Server Actions:**
- `apps/web/src/app/(app)/checklists/configurar/actions.ts` - CRUD completo de templates, perguntas e vínculos

**Componentes:**
- `components/template-card.tsx` - Card de template com ações
- `components/templates-stats-cards.tsx` - Cards de estatísticas
- `components/templates-filters.tsx` - Filtros de busca
- `components/templates-grid.tsx` - Grid de templates
- `components/template-form.tsx` - Formulário de template
- `components/questions-list.tsx` - Lista com drag & drop
- `components/question-form-dialog.tsx` - Dialog de pergunta
- `components/unit-assignment-dialog.tsx` - Dialog de vínculo

**Páginas:**
- `configurar/page.tsx` - Listagem de templates
- `configurar/novo/page.tsx` - Criar template
- `configurar/[templateId]/page.tsx` - Detalhes do template
- `configurar/[templateId]/editar/page.tsx` - Editar template
- `configurar/[templateId]/perguntas/page.tsx` - Gerenciar perguntas

**UI Components Adicionados:**
- `components/ui/textarea.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/switch.tsx`

**Dependências Adicionadas:**
- `@hello-pangea/dnd` - Drag & drop
- `@radix-ui/react-checkbox`
- `@radix-ui/react-switch`

---

## Tarefa 3: Criar Tela de Execução de Checklist de Abertura

### Objetivo
Implementar interface para funcionários de Operações executarem o checklist de abertura diário de suas unidades.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/checklists/
├── executar/
│   ├── page.tsx                      # Seleção de unidade/checklist
│   ├── [executionId]/
│   │   └── page.tsx                  # Tela de execução
│   └── components/
│       ├── execution-start.tsx       # Card para iniciar execução
│       ├── question-item.tsx         # Item de pergunta (Sim/Não)
│       ├── execution-progress.tsx    # Barra de progresso
│       └── execution-summary.tsx     # Resumo antes de finalizar
```

### Subtarefas

#### 3.1 Criar Server Actions para Execução

**Arquivo:** `apps/web/src/app/(app)/checklists/executar/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Obter templates disponíveis para o usuário (baseado nas unidades vinculadas)
export async function getAvailableChecklists() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  
  // Buscar unidades do usuário
  const { data: userUnits, error: unitsError } = await supabase
    .from('user_units')
    .select(`
      unit:units(
        id,
        name,
        code,
        unit_checklist_templates(
          template:checklist_templates(
            id,
            name,
            type,
            questions:checklist_questions(count)
          )
        )
      )
    `)
    .eq('user_id', user.id)
  
  if (unitsError) throw unitsError
  return userUnits
}

// Iniciar uma nova execução
export async function startExecution(unitId: string, templateId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  
  // Verificar se usuário tem acesso à unidade
  const { data: hasAccess } = await supabase
    .from('user_units')
    .select('id')
    .eq('user_id', user.id)
    .eq('unit_id', unitId)
    .single()
  
  if (!hasAccess) {
    return { error: 'Você não tem acesso a esta unidade' }
  }
  
  // Verificar se já existe execução em andamento hoje
  const today = new Date().toISOString().split('T')[0]
  const { data: existingExecution } = await supabase
    .from('checklist_executions')
    .select('id')
    .eq('unit_id', unitId)
    .eq('template_id', templateId)
    .eq('status', 'in_progress')
    .gte('started_at', `${today}T00:00:00`)
    .single()
  
  if (existingExecution) {
    // Retomar execução existente
    redirect(`/checklists/executar/${existingExecution.id}`)
  }
  
  // Criar nova execução
  const { data, error } = await supabase
    .from('checklist_executions')
    .insert({
      template_id: templateId,
      unit_id: unitId,
      executed_by: user.id,
      started_at: new Date().toISOString(),
      status: 'in_progress'
    })
    .select()
    .single()
  
  if (error) return { error: error.message }
  
  revalidatePath('/checklists')
  redirect(`/checklists/executar/${data.id}`)
}

// Obter execução em andamento
export async function getExecution(executionId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('checklist_executions')
    .select(`
      *,
      template:checklist_templates(
        id,
        name,
        questions:checklist_questions(
          id,
          question_text,
          order_index,
          is_required,
          requires_observation_on_no,
          status
        )
      ),
      unit:units(id, name, code),
      answers:checklist_answers(
        id,
        question_id,
        answer,
        observation
      )
    `)
    .eq('id', executionId)
    .single()
  
  if (error) throw error
  return data
}

// Salvar resposta de uma pergunta
export async function saveAnswer(
  executionId: string, 
  questionId: string, 
  answer: boolean, 
  observation?: string
) {
  const supabase = await createClient()
  
  // Upsert da resposta
  const { error } = await supabase
    .from('checklist_answers')
    .upsert({
      execution_id: executionId,
      question_id: questionId,
      answer,
      observation: observation || null
    }, {
      onConflict: 'execution_id,question_id'
    })
  
  if (error) return { error: error.message }
  
  revalidatePath(`/checklists/executar/${executionId}`)
  return { success: true }
}

// Finalizar execução
export async function completeExecution(executionId: string, generalObservations?: string) {
  const supabase = await createClient()
  
  // Verificar se todas as perguntas obrigatórias foram respondidas
  const { data: execution } = await supabase
    .from('checklist_executions')
    .select(`
      id,
      template:checklist_templates(
        questions:checklist_questions(
          id,
          is_required,
          requires_observation_on_no
        )
      ),
      answers:checklist_answers(
        question_id,
        answer,
        observation
      )
    `)
    .eq('id', executionId)
    .single()
  
  if (!execution) {
    return { error: 'Execução não encontrada' }
  }
  
  const questions = execution.template?.questions || []
  const answers = execution.answers || []
  
  // Validar respostas
  for (const q of questions) {
    const ans = answers.find(a => a.question_id === q.id)
    
    if (q.is_required && !ans) {
      return { error: 'Responda todas as perguntas obrigatórias' }
    }
    
    if (q.requires_observation_on_no && ans?.answer === false && !ans.observation) {
      return { error: 'Adicione observação para as respostas "Não" que exigem justificativa' }
    }
  }
  
  // Calcular has_non_conformities
  const hasNonConformities = answers.some(a => a.answer === false)
  
  // Atualizar execução
  const { error } = await supabase
    .from('checklist_executions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      general_observations: generalObservations || null,
      has_non_conformities: hasNonConformities
    })
    .eq('id', executionId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/checklists')
  redirect('/checklists')
}
```

#### 3.2 Criar Página de Seleção

**Arquivo:** `apps/web/src/app/(app)/checklists/executar/page.tsx`

**Características:**
- Listar unidades do usuário com templates vinculados
- Mostrar status: "Checklist de hoje já executado" ou "Pendente"
- Botão "Iniciar Checklist" por unidade/template
- Card de unidade com nome, código e template disponível

#### 3.3 Criar Página de Execução

**Arquivo:** `apps/web/src/app/(app)/checklists/executar/[executionId]/page.tsx`

**Características:**
- Header com nome da unidade e template
- Barra de progresso (X de Y respondidas)
- Lista de perguntas com botões Sim/Não
- Campo de observação (expande se responder "Não" e exigir observação)
- Observações gerais ao final
- Botão "Finalizar Checklist"
- Validação antes de finalizar

#### 3.4 Criar Componente de Item de Pergunta

**Arquivo:** `apps/web/src/app/(app)/checklists/executar/components/question-item.tsx`

**Elementos:**
- Número da pergunta + texto
- Badge se obrigatória
- Dois botões grandes: "Sim" (verde) / "Não" (vermelho)
- Estado selecionado destacado
- Campo de observação (textarea) - aparece se responder "Não" e exigir observação
- Indicador visual de pergunta respondida

#### 3.5 Criar Componente de Resumo

**Arquivo:** `apps/web/src/app/(app)/checklists/executar/components/execution-summary.tsx`

**Exibir antes de finalizar:**
- Total de perguntas respondidas
- Total de "Sim" vs "Não"
- Lista de não-conformidades (respostas "Não")
- Campo de observações gerais
- Botões: "Revisar" / "Finalizar"

### Design Visual
- Layout vertical (mobile-first)
- Botões Sim/Não grandes e tácteis (min 48px)
- Cores: Verde para "Sim" confirmado, Vermelho para "Não"
- Barra de progresso no topo
- Card por pergunta com espaçamento adequado
- Toast de confirmação ao salvar cada resposta (opcional)

### Critérios de Aceite
- [x] Usuário vê apenas unidades vinculadas
- [x] Execução é criada corretamente
- [x] Respostas são salvas em tempo real (ou ao clicar)
- [x] Validação de perguntas obrigatórias funciona
- [x] Validação de observação obrigatória funciona
- [x] Execução é marcada como completed ao finalizar
- [x] has_non_conformities é calculado corretamente
- [x] Responsivo e táctil em mobile

### Arquivos Criados

**Server Actions:**
- `apps/web/src/app/(app)/checklists/executar/actions.ts` - CRUD de execuções, respostas e validações

**Componentes:**
- `components/execution-start-card.tsx` - Card para iniciar execução de uma unidade
- `components/question-item.tsx` - Item de pergunta com botões Sim/Não
- `components/execution-progress.tsx` - Barra de progresso
- `components/execution-summary.tsx` - Resumo antes de finalizar

**Páginas:**
- `executar/page.tsx` - Seleção de unidade/checklist
- `executar/[executionId]/page.tsx` - Execução de checklist
- `executar/loading.tsx` - Loading skeleton

---

## Tarefa 4: Criar Tela de Histórico de Checklists Executados

### Objetivo
Implementar tela para visualização do histórico de execuções de checklists com filtros, detalhes e indicadores de não-conformidade.

### Estrutura de Arquivos
```
apps/web/src/app/(app)/checklists/
├── page.tsx                          # Histórico de execuções
├── [executionId]/
│   └── page.tsx                      # Detalhes de uma execução
├── actions.ts                        # Server Actions de consulta
└── components/
    ├── executions-table.tsx          # Tabela de execuções
    ├── executions-filters.tsx        # Filtros (unidade, data, status)
    ├── execution-card.tsx            # Card de execução
    ├── execution-details.tsx         # Visualização detalhada
    └── non-conformities-badge.tsx    # Badge de não-conformidades
```

### Subtarefas

#### 4.1 Criar Server Actions para Consulta

**Arquivo:** `apps/web/src/app/(app)/checklists/actions.ts`

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'

// Listar execuções com filtros
export async function getExecutions(filters?: {
  unitId?: string
  templateId?: string
  startDate?: string
  endDate?: string
  status?: string
  hasNonConformities?: boolean
  page?: number
  limit?: number
}) {
  const supabase = await createClient()
  
  const page = filters?.page || 1
  const limit = filters?.limit || 20
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('checklist_executions_with_details')
    .select('*', { count: 'exact' })
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (filters?.unitId) {
    query = query.eq('unit_id', filters.unitId)
  }
  
  if (filters?.templateId) {
    query = query.eq('template_id', filters.templateId)
  }
  
  if (filters?.startDate) {
    query = query.gte('started_at', `${filters.startDate}T00:00:00`)
  }
  
  if (filters?.endDate) {
    query = query.lte('started_at', `${filters.endDate}T23:59:59`)
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.hasNonConformities !== undefined) {
    query = query.eq('has_non_conformities', filters.hasNonConformities)
  }
  
  const { data, error, count } = await query
  
  if (error) throw error
  return { data, count, page, limit }
}

// Obter detalhes de uma execução
export async function getExecutionDetails(executionId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('checklist_executions')
    .select(`
      *,
      template:checklist_templates(id, name, type),
      unit:units(id, name, code),
      executed_by_profile:profiles!executed_by(id, full_name, email, avatar_url),
      answers:checklist_answers(
        id,
        answer,
        observation,
        question:checklist_questions(
          id,
          question_text,
          order_index,
          is_required,
          requires_observation_on_no
        )
      )
    `)
    .eq('id', executionId)
    .single()
  
  if (error) throw error
  return data
}

// Obter estatísticas de checklists
export async function getChecklistStats(filters?: {
  unitId?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('checklist_executions')
    .select('id, status, has_non_conformities')
  
  if (filters?.unitId) {
    query = query.eq('unit_id', filters.unitId)
  }
  
  if (filters?.startDate) {
    query = query.gte('started_at', `${filters.startDate}T00:00:00`)
  }
  
  if (filters?.endDate) {
    query = query.lte('started_at', `${filters.endDate}T23:59:59`)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  const total = data?.length || 0
  const completed = data?.filter(e => e.status === 'completed').length || 0
  const inProgress = data?.filter(e => e.status === 'in_progress').length || 0
  const withNonConformities = data?.filter(e => e.has_non_conformities).length || 0
  
  return {
    total,
    completed,
    inProgress,
    withNonConformities,
    conformityRate: total > 0 ? ((total - withNonConformities) / total * 100).toFixed(1) : 0
  }
}
```

#### 4.2 Criar Página de Histórico

**Arquivo:** `apps/web/src/app/(app)/checklists/page.tsx`

**Características:**
- Cards de estatísticas no topo
- Filtros: unidade, período (data), status, apenas não-conformidades
- Botão "Executar Checklist" (link para /checklists/executar)
- Tabela ou grid de execuções
- Paginação
- Link para detalhes de cada execução

#### 4.3 Criar Componente de Filtros

**Arquivo:** `apps/web/src/app/(app)/checklists/components/executions-filters.tsx`

**Filtros:**
- Unidade (select com unidades do usuário)
- Data início / Data fim (date pickers)
- Status (Todos, Em andamento, Concluído)
- Toggle "Apenas com não-conformidades"
- Botão "Limpar filtros"

#### 4.4 Criar Tabela de Execuções

**Arquivo:** `apps/web/src/app/(app)/checklists/components/executions-table.tsx`

**Colunas:**
- Data/Hora
- Unidade (nome + código)
- Template
- Executado por
- Status (badge)
- Não-conformidades (badge com contagem)
- Ações (ver detalhes)

#### 4.5 Criar Página de Detalhes

**Arquivo:** `apps/web/src/app/(app)/checklists/[executionId]/page.tsx`

**Seções:**
- Header: Template, Unidade, Executado por, Data/Hora
- Indicador de não-conformidades (se houver)
- Lista de perguntas com respostas
  - Pergunta + resposta (Sim/Não com ícone colorido)
  - Observação da resposta (se houver)
- Observações gerais
- Botões admin: Excluir (RequireAdmin)

### Design Visual
- Cards de estatísticas: Total, Concluídos, Em andamento, Com não-conformidades
- Badge vermelho para execuções com não-conformidades
- Ícones: ✓ verde para "Sim", ✗ vermelho para "Não"
- Highlight visual em respostas "Não"
- Paginação no rodapé da tabela

### Critérios de Aceite
- [ ] Lista de execuções carrega corretamente
- [ ] Filtros funcionam (unidade, data, status, não-conformidades)
- [ ] Estatísticas refletem dados filtrados
- [ ] Detalhes da execução exibem todas informações
- [ ] Paginação funcional
- [ ] Visibilidade respeitada (usuário vê apenas suas unidades, exceto admin)
- [ ] Responsivo em mobile

---

## Tarefa 5: Implementar Exclusão de Checklists (Admin)

### Objetivo
Permitir que administradores excluam execuções de checklists, tanto individualmente quanto em massa.

### Subtarefas

#### 5.1 Criar Server Actions de Exclusão

**Arquivo:** `apps/web/src/app/(app)/checklists/actions.ts` (adicionar)

```typescript
// Excluir execução individual
export async function deleteExecution(executionId: string) {
  const supabase = await createClient()
  
  // Verificar admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return { error: 'Acesso negado. Apenas administradores podem excluir execuções.' }
  }
  
  const { error } = await supabase
    .from('checklist_executions')
    .delete()
    .eq('id', executionId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/checklists')
  return { success: true }
}

// Excluir múltiplas execuções
export async function deleteExecutions(executionIds: string[]) {
  const supabase = await createClient()
  
  // Verificar admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return { error: 'Acesso negado. Apenas administradores podem excluir execuções.' }
  }
  
  const { error } = await supabase
    .from('checklist_executions')
    .delete()
    .in('id', executionIds)
  
  if (error) return { error: error.message }
  
  revalidatePath('/checklists')
  return { success: true, deletedCount: executionIds.length }
}
```

#### 5.2 Criar Dialog de Confirmação de Exclusão

**Arquivo:** `apps/web/src/app/(app)/checklists/components/delete-execution-dialog.tsx`

**Características:**
- AlertDialog do shadcn/ui
- Mensagem de confirmação clara
- Indicar que a ação é irreversível
- Botões: Cancelar / Excluir (destructive)

#### 5.3 Implementar Seleção em Massa na Tabela

**Modificar:** `apps/web/src/app/(app)/checklists/components/executions-table.tsx`

**Funcionalidades (RequireAdmin):**
- Checkbox no header para selecionar todos
- Checkbox por linha
- Contador de selecionados
- Botão "Excluir selecionados" (apareece quando há seleção)
- Dialog de confirmação para exclusão em massa

#### 5.4 Adicionar Botão de Exclusão na Página de Detalhes

**Modificar:** `apps/web/src/app/(app)/checklists/[executionId]/page.tsx`

- Botão "Excluir" no header (RequireAdmin)
- Dialog de confirmação
- Redirect para lista após exclusão

### Critérios de Aceite
- [ ] Admin pode excluir execução individual
- [ ] Admin pode excluir múltiplas execuções
- [ ] Dialog de confirmação exibido antes de excluir
- [ ] Respostas são excluídas em cascata (ON DELETE CASCADE)
- [ ] Usuário comum não vê opções de exclusão
- [ ] Feedback visual após exclusão (toast de sucesso)

---

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criação de migrations, RLS policies, índices | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Frontend Specialist | Implementação das telas (configuração, execução, histórico) | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
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
| Performance em listagem com muitas execuções | Medium | Medium | Índices criados; paginação server-side | Database Specialist |
| UX confusa na execução de checklist (mobile) | Medium | Medium | Design mobile-first; botões grandes e tácteis | Frontend Specialist |
| Execuções duplicadas no mesmo dia | Low | Low | Validação na criação; retomar execução em andamento | Backend Specialist |
| Perda de respostas durante execução | Low | High | Salvar respostas individualmente; não perder estado | Backend Specialist |
| has_non_conformities dessincronizado | Low | Medium | Trigger automático no banco | Database Specialist |

### Dependencies

- **Internal:** Tabelas `units`, `profiles`, `user_units` já existem; módulos de usuários e unidades implementados
- **External:** Supabase Database
- **Technical:** Next.js 15 Server Actions, @supabase/ssr, shadcn/ui, dnd-kit (para drag & drop)

### Assumptions

- Checklist de Abertura é o foco do MVP; Checklist de Supervisão será implementado na Entrega 2
- Não haverá upload de fotos no MVP (campo preparado para futuro)
- Notificações de não-conformidades são standby (sem push/email no MVP)
- Um template pode ser vinculado a múltiplas unidades
- Uma unidade pode ter apenas um template de abertura ativo por vez

## Resource Estimation

### Time Allocation

| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery & Modelo de Dados | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 2a - Configuração de Templates (Admin) | 1.5 dias | 1.5 dias | 1 pessoa |
| Phase 2b - Execução de Checklist | 1.5 dias | 1.5 dias | 1 pessoa |
| Phase 2c - Histórico e Detalhes | 1 dia | 1 dia | 1 pessoa |
| Phase 2d - Exclusão (Admin) | 0.5 dia | 0.5 dia | 1 pessoa |
| Phase 3 - Validation & Handoff | 0.5 dia | 0.5 dia | 1 pessoa |
| **Total** | **5.5 dias** | **5.5 dias** | **-** |

### Required Skills
- Next.js 15 (App Router, Server Actions)
- Supabase (Database, RLS, Functions)
- TypeScript
- shadcn/ui + Tailwind CSS
- dnd-kit ou @hello-pangea/dnd (drag & drop)

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
- `git commit -m "feat(checklists): create database schema and migrations"`

### Phase 2 — Implementation & Iteration (4.5 dias)

**Steps**

**Dia 1-2: Configuração de Templates (Admin)**
1. Criar estrutura de arquivos `/checklists/configurar/`
2. Implementar Server Actions de templates e perguntas
3. Criar página de listagem de templates
4. Criar formulário de template
5. Implementar lista de perguntas com drag & drop
6. Criar dialog de vínculo com unidades

**Dia 3-4: Execução de Checklist**
1. Criar estrutura de arquivos `/checklists/executar/`
2. Implementar Server Actions de execução
3. Criar página de seleção de unidade/template
4. Criar página de execução com perguntas
5. Implementar salvamento de respostas
6. Criar resumo e finalização

**Dia 4-5: Histórico e Exclusão**
1. Criar página de histórico com filtros
2. Implementar paginação
3. Criar página de detalhes da execução
4. Implementar exclusão individual e em massa (admin)
5. Criar cards de estatísticas

**Commit Checkpoints**
- `git commit -m "feat(checklists): implement template configuration (admin)"`
- `git commit -m "feat(checklists): implement checklist execution flow"`
- `git commit -m "feat(checklists): implement history and admin deletion"`

### Phase 3 — Validation & Handoff (0.5 dia)

**Steps**
1. Testar fluxo completo: criar template → vincular unidade → executar checklist → ver histórico
2. Testar RLS: Manobrista vs Supervisor vs Admin
3. Validar responsividade (mobile)
4. Rodar `mcp_supabase_get_advisors` (security)
5. Atualizar `entrega1_tarefas.md` com itens concluídos
6. Atualizar README do plans

**Commit Checkpoint**
- `git commit -m "chore(plan): complete phase 3 validation - checklists"`

## Rollback Plan

### Rollback Triggers
- Bugs críticos em RLS expondo dados de execuções
- Perda de dados de respostas durante execução
- Performance degradada na listagem
- has_non_conformities dessincronizado

### Rollback Procedures

#### Phase 1 Rollback
- Action: Reverter migrations; DROP TABLES
- Data Impact: Nenhum (sem dados de produção ainda)
- Estimated Time: < 30 min

#### Phase 2 Rollback
- Action: Reverter commits de feature; restaurar versão anterior
- Data Impact: Possível perda de execuções de teste
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
- Screenshot da tela de configuração de templates
- Screenshot da lista de perguntas com drag & drop
- Screenshot do dialog de vínculo com unidades
- Screenshot da seleção de checklist para executar
- Screenshot da execução de checklist (mobile)
- Screenshot do histórico com filtros
- Screenshot dos detalhes de uma execução
- Screenshot da exclusão em massa (admin)
- Log de teste de RLS (Manobrista vs Supervisor vs Admin)
- Output de `mcp_supabase_get_advisors` (security)
- TypeScript types gerados (`database.types.ts`)
- Output de `mcp_supabase_list_tables` mostrando novas tabelas

### Follow-up Actions
- [ ] Atualizar `entrega1_tarefas.md` marcando itens 60-66 como concluídos
- [ ] Atualizar `README.md` do plans com status
- [ ] Preparar dados de seed (template padrão de abertura)
- [ ] Documentar fluxo de checklist para usuários

---

## Referências Técnicas

### Stack do Projeto
- **Framework:** Next.js 15 (App Router)
- **Auth:** Supabase Auth via `@supabase/ssr`
- **Database:** PostgreSQL (Supabase)
- **UI:** shadcn/ui + Tailwind CSS
- **Drag & Drop:** dnd-kit ou @hello-pangea/dnd
- **Design System:** [design-system.md](../../design-system.md)

### Documentação
- [PRD do GAPP](../../projeto/PRD.md) — Seção 3.2 Checklists
- [Entrega 1 Tarefas](../../projeto/entregaveis/entrega1_tarefas.md)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

### Arquivos Existentes (Referência)
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
  
  // Checklists
  'checklists:read': ['Desenvolvedor', 'Administrador', 'Diretor', /* todos de Operações */],
  'checklists:create': ['Desenvolvedor', 'Administrador', /* Manobrista, Encarregado, Supervisor, Gerente de Operações */],
  'checklists:delete': ['Desenvolvedor', 'Administrador'],
  'checklists:configure': ['Desenvolvedor', 'Administrador'], // Configurar templates
}
```

<!-- agent-update:end -->
