-- ============================================
-- Migration 001: Criação das Tabelas
-- GarageInn App - Database Schema
-- ============================================
-- Execute este script em um projeto Supabase novo
-- Ordem de execução: 001 → 002 → 003
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AUTENTICAÇÃO E USUÁRIOS
-- ============================================

-- Departamentos
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Cargos
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, department_id)
);

-- Perfis de usuários (vinculado ao auth.users do Supabase)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  cpf text UNIQUE,
  phone text,
  avatar_url text,
  status text DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  invitation_sent_at timestamptz,
  invitation_expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vínculo usuário-cargo (N:N)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- ============================================
-- UNIDADES
-- ============================================

-- Unidades/Garagens
CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  address text NOT NULL,
  neighborhood text,
  city text,
  state text,
  zip_code text,
  phone text,
  email text,
  cnpj text,
  capacity integer,
  region text,
  administrator text,
  supervisor_name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vínculo usuário-unidade (N:N)
CREATE TABLE public.user_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  is_coverage boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, unit_id)
);

-- ============================================
-- CHAMADOS (TICKETS)
-- ============================================

-- Categorias de chamados
CREATE TABLE public.ticket_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chamados principais
CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number serial NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'awaiting_triage' CHECK (status IN (
    'awaiting_approval', 'awaiting_triage', 'prioritized', 'in_progress',
    'awaiting_return', 'resolved', 'closed', 'denied', 'cancelled'
  )),
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  perceived_urgency text,
  department_id uuid NOT NULL REFERENCES public.departments(id),
  category_id uuid REFERENCES public.ticket_categories(id),
  unit_id uuid REFERENCES public.units(id),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  assigned_to uuid REFERENCES public.profiles(id),
  due_date date,
  denial_reason text,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comentários de chamados
CREATE TABLE public.ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Anexos de chamados
CREATE TABLE public.ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.ticket_comments(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  category text,
  uploaded_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Histórico de chamados
CREATE TABLE public.ticket_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  action text NOT NULL,
  old_value text,
  new_value text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Aprovações de chamados
CREATE TABLE public.ticket_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  approval_level integer NOT NULL,
  approval_role text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  approved_by uuid REFERENCES public.profiles(id),
  decision_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CHAMADOS - MANUTENÇÃO
-- ============================================

-- Detalhes de manutenção
CREATE TABLE public.ticket_maintenance_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE REFERENCES public.tickets(id) ON DELETE CASCADE,
  maintenance_type text,
  subject_id uuid,
  location_description text,
  equipment_affected text,
  completion_notes text,
  completion_rating integer CHECK (completion_rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Execuções de manutenção
CREATE TABLE public.ticket_maintenance_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  unit_id uuid REFERENCES public.units(id),
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  assigned_to uuid REFERENCES public.profiles(id),
  supplier_name text,
  supplier_contact text,
  materials_needed text,
  estimated_cost numeric(12,2),
  actual_cost numeric(12,2),
  start_date date,
  estimated_end_date date,
  actual_end_date date,
  notes text,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- CHAMADOS - COMPRAS
-- ============================================

-- Detalhes de compras
CREATE TABLE public.ticket_purchase_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE REFERENCES public.tickets(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL,
  unit_of_measure text,
  estimated_price numeric(12,2),
  delivery_address text,
  delivery_date date,
  delivery_notes text,
  delivery_confirmed_at timestamptz,
  delivery_rating integer CHECK (delivery_rating BETWEEN 1 AND 5),
  approved_quotation_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cotações de chamados
CREATE TABLE public.ticket_quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  supplier_name text NOT NULL,
  supplier_cnpj text,
  supplier_contact text,
  quantity integer NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  total_price numeric(12,2) NOT NULL,
  payment_terms text,
  delivery_deadline date,
  validity_date date,
  supplier_response_date date,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_selected boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar FK após criar ticket_quotations
ALTER TABLE public.ticket_purchase_details 
ADD CONSTRAINT fk_approved_quotation 
FOREIGN KEY (approved_quotation_id) REFERENCES public.ticket_quotations(id);

-- ============================================
-- CHAMADOS - SINISTROS
-- ============================================

-- Fornecedores credenciados
CREATE TABLE public.accredited_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text,
  category text,
  contact_name text,
  phone text,
  email text,
  address text,
  notes text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Detalhes de sinistros
CREATE TABLE public.ticket_claim_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE REFERENCES public.tickets(id) ON DELETE CASCADE,
  occurrence_type text NOT NULL,
  occurrence_date date NOT NULL,
  occurrence_time time,
  location_description text,
  vehicle_plate text,
  vehicle_make text,
  vehicle_model text,
  vehicle_color text,
  vehicle_year integer,
  customer_name text,
  customer_cpf text,
  customer_phone text,
  customer_email text,
  has_third_party boolean DEFAULT false,
  third_party_name text,
  third_party_phone text,
  third_party_plate text,
  third_party_info jsonb,
  police_report_number text,
  police_report_date date,
  estimated_damage_value numeric(12,2),
  deductible_value numeric(12,2),
  company_liability numeric(5,2),
  liability_determination text,
  resolution_type text,
  resolution_notes text,
  final_repair_cost numeric(12,2),
  customer_satisfaction_rating integer CHECK (customer_satisfaction_rating BETWEEN 1 AND 5),
  related_maintenance_ticket_id uuid REFERENCES public.tickets(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comunicações de sinistros
CREATE TABLE public.claim_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_details_id uuid NOT NULL REFERENCES public.ticket_claim_details(id) ON DELETE CASCADE,
  channel text NOT NULL,
  communication_date timestamptz NOT NULL DEFAULT now(),
  summary text NOT NULL,
  next_contact_date date,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Compras de sinistros
CREATE TABLE public.claim_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_details_id uuid NOT NULL REFERENCES public.ticket_claim_details(id) ON DELETE CASCADE,
  purchase_number serial NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  estimated_total numeric(12,2),
  approved_total numeric(12,2),
  assigned_to uuid REFERENCES public.profiles(id),
  due_date date,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  rejection_reason text,
  selected_quotation_id uuid,
  completed_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itens de compras de sinistros
CREATE TABLE public.claim_purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_purchase_id uuid NOT NULL REFERENCES public.claim_purchases(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1,
  unit_of_measure text,
  estimated_unit_price numeric(12,2),
  final_unit_price numeric(12,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cotações de compras de sinistros
CREATE TABLE public.claim_purchase_quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_purchase_id uuid NOT NULL REFERENCES public.claim_purchases(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES public.accredited_suppliers(id),
  supplier_name text NOT NULL,
  supplier_cnpj text,
  supplier_contact text,
  supplier_phone text,
  total_price numeric(12,2) NOT NULL,
  items_breakdown jsonb,
  payment_terms text,
  delivery_deadline date,
  validity_date date,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  is_selected boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Adicionar FK após criar claim_purchase_quotations
ALTER TABLE public.claim_purchases 
ADD CONSTRAINT fk_selected_quotation 
FOREIGN KEY (selected_quotation_id) REFERENCES public.claim_purchase_quotations(id);

-- ============================================
-- CHAMADOS - RH
-- ============================================

-- Detalhes de RH
CREATE TABLE public.ticket_rh_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL UNIQUE REFERENCES public.tickets(id) ON DELETE CASCADE,
  rh_type text NOT NULL,
  withdrawal_reason text,
  specific_fields jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Uniformes
CREATE TABLE public.uniforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text,
  size text,
  description text,
  current_stock integer DEFAULT 0,
  min_stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transações de uniformes
CREATE TABLE public.uniform_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uniform_id uuid NOT NULL REFERENCES public.uniforms(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('entry', 'withdrawal')),
  quantity integer NOT NULL,
  user_id uuid REFERENCES public.profiles(id),
  unit_id uuid REFERENCES public.units(id),
  ticket_id uuid REFERENCES public.tickets(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- CHECKLISTS
-- ============================================

-- Templates de checklists
CREATE TABLE public.checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'opening' CHECK (type IN ('opening', 'supervision')),
  is_default boolean DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Perguntas de checklists
CREATE TABLE public.checklist_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  order_index integer NOT NULL,
  is_required boolean DEFAULT true,
  requires_observation_on_no boolean DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Execuções de checklists
CREATE TABLE public.checklist_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.checklist_templates(id),
  unit_id uuid NOT NULL REFERENCES public.units(id),
  executed_by uuid NOT NULL REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  general_observations text,
  has_non_conformities boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Respostas de checklists
CREATE TABLE public.checklist_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES public.checklist_executions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.checklist_questions(id),
  answer boolean NOT NULL,
  observation text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(execution_id, question_id)
);

-- Vínculo unidade-template de checklist
CREATE TABLE public.unit_checklist_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.checklist_templates(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(unit_id, template_id)
);

-- ============================================
-- SISTEMA
-- ============================================

-- Configurações do sistema
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- Logs de auditoria
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  metadata jsonb,
  user_id uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_deleted_at ON public.profiles(deleted_at) WHERE deleted_at IS NULL;

-- Tickets
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_department_id ON public.tickets(department_id);
CREATE INDEX idx_tickets_unit_id ON public.tickets(unit_id);
CREATE INDEX idx_tickets_created_by ON public.tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at DESC);

-- User Roles
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);

-- User Units
CREATE INDEX idx_user_units_user_id ON public.user_units(user_id);
CREATE INDEX idx_user_units_unit_id ON public.user_units(unit_id);

-- Checklist Executions
CREATE INDEX idx_checklist_executions_unit_id ON public.checklist_executions(unit_id);
CREATE INDEX idx_checklist_executions_executed_by ON public.checklist_executions(executed_by);
CREATE INDEX idx_checklist_executions_started_at ON public.checklist_executions(started_at DESC);

-- Ticket Comments
CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);

-- Ticket History
CREATE INDEX idx_ticket_history_ticket_id ON public.ticket_history(ticket_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema';
COMMENT ON TABLE public.departments IS 'Departamentos da empresa';
COMMENT ON TABLE public.roles IS 'Cargos do sistema';
COMMENT ON TABLE public.units IS 'Unidades/Garagens da rede';
COMMENT ON TABLE public.tickets IS 'Chamados do sistema';
COMMENT ON TABLE public.checklist_templates IS 'Templates de checklists';
COMMENT ON TABLE public.system_settings IS 'Configurações do sistema';
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria';
