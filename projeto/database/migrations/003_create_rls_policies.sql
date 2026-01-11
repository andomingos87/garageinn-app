-- ============================================
-- Migration 003: Row Level Security (RLS)
-- GarageInn App - Security Policies
-- ============================================
-- Execute após 002_create_functions.sql
-- ============================================

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_maintenance_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_maintenance_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_purchase_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_claim_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_purchase_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accredited_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_rh_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uniforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uniform_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================

-- Usuários podem ver todos os perfis ativos
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins podem fazer tudo
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================
-- DEPARTMENTS
-- ============================================

-- Todos podem ver departamentos
CREATE POLICY "departments_select_all" ON public.departments
  FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem modificar
CREATE POLICY "departments_admin_all" ON public.departments
  FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================
-- ROLES
-- ============================================

-- Todos podem ver cargos
CREATE POLICY "roles_select_all" ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem modificar
CREATE POLICY "roles_admin_all" ON public.roles
  FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================
-- USER_ROLES
-- ============================================

-- Usuários podem ver seus próprios cargos
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins podem ver e modificar todos
CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================
-- UNITS
-- ============================================

-- Todos podem ver unidades ativas
CREATE POLICY "units_select_all" ON public.units
  FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin());

-- Apenas admins podem modificar
CREATE POLICY "units_admin_all" ON public.units
  FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================
-- USER_UNITS
-- ============================================

-- Usuários podem ver seus próprios vínculos
CREATE POLICY "user_units_select_own" ON public.user_units
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins podem ver e modificar todos
CREATE POLICY "user_units_admin_all" ON public.user_units
  FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================
-- TICKETS
-- ============================================

-- Usuários podem ver chamados que criaram
CREATE POLICY "tickets_select_own" ON public.tickets
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Usuários podem ver chamados atribuídos a eles
CREATE POLICY "tickets_select_assigned" ON public.tickets
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

-- Usuários podem ver chamados do seu departamento
CREATE POLICY "tickets_select_department" ON public.tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
      AND r.department_id = tickets.department_id
    )
  );

-- Usuários podem ver chamados da sua unidade
CREATE POLICY "tickets_select_unit" ON public.tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_units uu
      WHERE uu.user_id = auth.uid()
      AND uu.unit_id = tickets.unit_id
    )
  );

-- Admins podem ver todos
CREATE POLICY "tickets_admin_select" ON public.tickets
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Usuários autenticados podem criar chamados
CREATE POLICY "tickets_insert_authenticated" ON public.tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Usuários podem atualizar chamados que criaram (com restrições)
CREATE POLICY "tickets_update_own" ON public.tickets
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Responsáveis podem atualizar chamados atribuídos
CREATE POLICY "tickets_update_assigned" ON public.tickets
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid());

-- Admins podem fazer tudo
CREATE POLICY "tickets_admin_all" ON public.tickets
  FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================
-- TICKET_CATEGORIES
-- ============================================

-- Todos podem ver categorias ativas
CREATE POLICY "ticket_categories_select_all" ON public.ticket_categories
  FOR SELECT
  TO authenticated
  USING (status = 'active' OR is_admin());

-- Apenas admins podem modificar
CREATE POLICY "ticket_categories_admin_all" ON public.ticket_categories
  FOR ALL
  TO authenticated
  USING (is_admin());

-- ============================================
-- TICKET_COMMENTS
-- ============================================

-- Usuários podem ver comentários de chamados que podem ver
CREATE POLICY "ticket_comments_select" ON public.ticket_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR is_admin()
      )
    )
  );

-- Usuários podem criar comentários em chamados que podem ver
CREATE POLICY "ticket_comments_insert" ON public.ticket_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR is_admin()
      )
    )
  );

-- ============================================
-- TICKET_ATTACHMENTS
-- ============================================

-- Mesma lógica dos comentários
CREATE POLICY "ticket_attachments_select" ON public.ticket_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_attachments.ticket_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR is_admin()
      )
    )
  );

CREATE POLICY "ticket_attachments_insert" ON public.ticket_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_attachments.ticket_id
    )
  );

-- ============================================
-- TICKET_HISTORY
-- ============================================

-- Usuários podem ver histórico de chamados que podem ver
CREATE POLICY "ticket_history_select" ON public.ticket_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_history.ticket_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR is_admin()
      )
    )
  );

-- ============================================
-- TICKET_APPROVALS
-- ============================================

-- Usuários podem ver aprovações de chamados que podem ver
CREATE POLICY "ticket_approvals_select" ON public.ticket_approvals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_approvals.ticket_id
      AND (
        t.created_by = auth.uid()
        OR t.assigned_to = auth.uid()
        OR is_admin()
      )
    )
  );

-- ============================================
-- DETALHES DE CHAMADOS (MANUTENÇÃO, COMPRAS, SINISTROS, RH)
-- ============================================

-- Seguem a mesma lógica: quem pode ver o ticket pode ver os detalhes

CREATE POLICY "ticket_maintenance_details_select" ON public.ticket_maintenance_details
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())));

CREATE POLICY "ticket_maintenance_details_admin" ON public.ticket_maintenance_details
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "ticket_maintenance_executions_select" ON public.ticket_maintenance_executions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())));

CREATE POLICY "ticket_maintenance_executions_admin" ON public.ticket_maintenance_executions
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "ticket_purchase_details_select" ON public.ticket_purchase_details
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())));

CREATE POLICY "ticket_purchase_details_admin" ON public.ticket_purchase_details
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "ticket_quotations_select" ON public.ticket_quotations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())));

CREATE POLICY "ticket_quotations_admin" ON public.ticket_quotations
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "ticket_claim_details_select" ON public.ticket_claim_details
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())));

CREATE POLICY "ticket_claim_details_admin" ON public.ticket_claim_details
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "ticket_rh_details_select" ON public.ticket_rh_details
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid() OR is_admin())));

CREATE POLICY "ticket_rh_details_admin" ON public.ticket_rh_details
  FOR ALL TO authenticated USING (is_admin());

-- ============================================
-- SINISTROS - TABELAS RELACIONADAS
-- ============================================

CREATE POLICY "claim_communications_select" ON public.claim_communications
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "claim_communications_admin" ON public.claim_communications
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "claim_purchases_select" ON public.claim_purchases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "claim_purchases_admin" ON public.claim_purchases
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "claim_purchase_items_select" ON public.claim_purchase_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "claim_purchase_items_admin" ON public.claim_purchase_items
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "claim_purchase_quotations_select" ON public.claim_purchase_quotations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "claim_purchase_quotations_admin" ON public.claim_purchase_quotations
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "accredited_suppliers_select" ON public.accredited_suppliers
  FOR SELECT TO authenticated USING (is_active = true OR is_admin());

CREATE POLICY "accredited_suppliers_admin" ON public.accredited_suppliers
  FOR ALL TO authenticated USING (is_admin());

-- ============================================
-- UNIFORMES
-- ============================================

CREATE POLICY "uniforms_select_all" ON public.uniforms
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "uniforms_admin" ON public.uniforms
  FOR ALL TO authenticated USING (is_admin() OR is_rh());

CREATE POLICY "uniform_transactions_select" ON public.uniform_transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "uniform_transactions_insert" ON public.uniform_transactions
  FOR INSERT TO authenticated WITH CHECK (is_admin() OR is_rh());

-- ============================================
-- CHECKLISTS
-- ============================================

CREATE POLICY "checklist_templates_select" ON public.checklist_templates
  FOR SELECT TO authenticated USING (status = 'active' OR is_admin());

CREATE POLICY "checklist_templates_admin" ON public.checklist_templates
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "checklist_questions_select" ON public.checklist_questions
  FOR SELECT TO authenticated USING (status = 'active' OR is_admin());

CREATE POLICY "checklist_questions_admin" ON public.checklist_questions
  FOR ALL TO authenticated USING (is_admin());

-- Usuários podem ver execuções da sua unidade
CREATE POLICY "checklist_executions_select_unit" ON public.checklist_executions
  FOR SELECT TO authenticated
  USING (
    executed_by = auth.uid()
    OR EXISTS (SELECT 1 FROM user_units uu WHERE uu.user_id = auth.uid() AND uu.unit_id = checklist_executions.unit_id)
    OR is_admin()
  );

-- Usuários podem criar execuções
CREATE POLICY "checklist_executions_insert" ON public.checklist_executions
  FOR INSERT TO authenticated
  WITH CHECK (executed_by = auth.uid());

-- Usuários podem atualizar suas próprias execuções
CREATE POLICY "checklist_executions_update_own" ON public.checklist_executions
  FOR UPDATE TO authenticated
  USING (executed_by = auth.uid());

CREATE POLICY "checklist_executions_admin" ON public.checklist_executions
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "checklist_answers_select" ON public.checklist_answers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM checklist_executions ce
      WHERE ce.id = checklist_answers.execution_id
      AND (ce.executed_by = auth.uid() OR is_admin())
    )
  );

CREATE POLICY "checklist_answers_insert" ON public.checklist_answers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM checklist_executions ce
      WHERE ce.id = checklist_answers.execution_id
      AND ce.executed_by = auth.uid()
    )
  );

CREATE POLICY "unit_checklist_templates_select" ON public.unit_checklist_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "unit_checklist_templates_admin" ON public.unit_checklist_templates
  FOR ALL TO authenticated USING (is_admin());

-- ============================================
-- SISTEMA
-- ============================================

CREATE POLICY "system_settings_select" ON public.system_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "system_settings_admin" ON public.system_settings
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
