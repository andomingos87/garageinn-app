-- ============================================
-- Migration 002: Criação das Funções
-- GarageInn App - Database Functions
-- ============================================
-- Execute após 001_create_tables.sql
-- ============================================

-- ============================================
-- FUNÇÕES DE VERIFICAÇÃO DE PERMISSÃO
-- ============================================

-- Verifica se o usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('Administrador', 'Desenvolvedor', 'Diretor')
    AND r.is_global = true
  ) INTO v_is_admin;
  
  RETURN COALESCE(v_is_admin, false);
END;
$$;

-- Verifica se o usuário atual é do RH
CREATE OR REPLACE FUNCTION public.is_rh()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_rh boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    JOIN departments d ON d.id = r.department_id
    WHERE ur.user_id = auth.uid()
    AND d.name = 'RH'
  ) INTO v_is_rh;
  
  RETURN COALESCE(v_is_rh, false);
END;
$$;

-- ============================================
-- FUNÇÕES DE GESTÃO DE USUÁRIOS
-- ============================================

-- Verifica se o convite de um usuário expirou
CREATE OR REPLACE FUNCTION public.is_invitation_expired(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expires_at timestamptz;
  v_status text;
BEGIN
  SELECT invitation_expires_at, status
  INTO v_expires_at, v_status
  FROM profiles
  WHERE id = p_user_id;
  
  -- Se não encontrou ou não está pendente, não está expirado
  IF v_status IS NULL OR v_status != 'pending' THEN
    RETURN false;
  END IF;
  
  -- Se não tem data de expiração, não está expirado
  IF v_expires_at IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verifica se expirou
  RETURN v_expires_at < now();
END;
$$;

-- Soft delete de usuário
CREATE OR REPLACE FUNCTION public.soft_delete_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica se é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem deletar usuários';
  END IF;
  
  -- Não permite deletar a si mesmo
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Não é possível deletar o próprio usuário';
  END IF;
  
  -- Marca como deletado
  UPDATE profiles
  SET 
    deleted_at = now(),
    status = 'inactive',
    updated_at = now()
  WHERE id = p_user_id
  AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Restaura usuário deletado
CREATE OR REPLACE FUNCTION public.restore_deleted_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verifica se é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Apenas administradores podem restaurar usuários';
  END IF;
  
  -- Restaura o usuário
  UPDATE profiles
  SET 
    deleted_at = NULL,
    status = 'active',
    updated_at = now()
  WHERE id = p_user_id
  AND deleted_at IS NOT NULL;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- ============================================
-- FUNÇÕES DE APROVAÇÃO DE CHAMADOS
-- ============================================

-- Verifica se um chamado precisa de aprovação
CREATE OR REPLACE FUNCTION public.ticket_needs_approval(
  p_created_by uuid,
  p_department_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_manobrista boolean;
  v_is_target_dept boolean;
BEGIN
  -- Verifica se o criador é Manobrista
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_created_by
    AND r.name = 'Manobrista'
  ) INTO v_is_manobrista;
  
  -- Se não é manobrista, não precisa aprovação
  IF NOT v_is_manobrista THEN
    RETURN false;
  END IF;
  
  -- Verifica se o departamento destino é Compras e Manutenção
  SELECT EXISTS (
    SELECT 1
    FROM departments
    WHERE id = p_department_id
    AND name = 'Compras e Manutenção'
  ) INTO v_is_target_dept;
  
  RETURN v_is_target_dept;
END;
$$;

-- Cria registros de aprovação para um chamado
CREATE OR REPLACE FUNCTION public.create_ticket_approvals(p_ticket_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Cria aprovação nível 1 - Encarregado
  INSERT INTO ticket_approvals (
    ticket_id,
    approval_level,
    approval_role,
    status
  ) VALUES (
    p_ticket_id,
    1,
    'Encarregado',
    'pending'
  );
  
  -- Cria aprovação nível 2 - Supervisor
  INSERT INTO ticket_approvals (
    ticket_id,
    approval_level,
    approval_role,
    status
  ) VALUES (
    p_ticket_id,
    2,
    'Supervisor',
    'pending'
  );
  
  -- Cria aprovação nível 3 - Gerente
  INSERT INTO ticket_approvals (
    ticket_id,
    approval_level,
    approval_role,
    status
  ) VALUES (
    p_ticket_id,
    3,
    'Gerente',
    'pending'
  );
END;
$$;

-- Avança ou rejeita uma aprovação de chamado
CREATE OR REPLACE FUNCTION public.advance_ticket_approval(
  p_ticket_id uuid,
  p_approval_level integer,
  p_approved boolean,
  p_notes text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status text;
  v_next_status text;
  v_max_level integer;
BEGIN
  -- Atualiza a aprovação atual
  UPDATE ticket_approvals
  SET 
    status = CASE WHEN p_approved THEN 'approved' ELSE 'denied' END,
    approved_by = auth.uid(),
    decision_at = now(),
    notes = p_notes,
    updated_at = now()
  WHERE ticket_id = p_ticket_id
  AND approval_level = p_approval_level
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN 'Aprovação não encontrada ou já processada';
  END IF;
  
  -- Se foi negado, atualiza o chamado para negado
  IF NOT p_approved THEN
    UPDATE tickets
    SET 
      status = 'denied',
      denial_reason = p_notes,
      updated_at = now()
    WHERE id = p_ticket_id;
    
    -- Registra no histórico
    INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value, metadata)
    VALUES (p_ticket_id, auth.uid(), 'approval_denied', 'pending', 'denied', 
            jsonb_build_object('level', p_approval_level, 'notes', p_notes));
    
    RETURN 'denied';
  END IF;
  
  -- Registra aprovação no histórico
  INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value, metadata)
  VALUES (p_ticket_id, auth.uid(), 'approval_approved', 'pending', 'approved', 
          jsonb_build_object('level', p_approval_level, 'notes', p_notes));
  
  -- Verifica se é o último nível
  SELECT MAX(approval_level) INTO v_max_level
  FROM ticket_approvals
  WHERE ticket_id = p_ticket_id;
  
  IF p_approval_level = v_max_level THEN
    -- Último nível aprovado, envia para triagem
    UPDATE tickets
    SET 
      status = 'awaiting_triage',
      updated_at = now()
    WHERE id = p_ticket_id;
    
    -- Registra no histórico
    INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (p_ticket_id, auth.uid(), 'status_change', 'awaiting_approval', 'awaiting_triage');
    
    RETURN 'awaiting_triage';
  ELSE
    -- Ainda há níveis pendentes
    RETURN 'pending_next_level';
  END IF;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at
  BEFORE UPDATE ON public.ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_categories_updated_at
  BEFORE UPDATE ON public.ticket_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_approvals_updated_at
  BEFORE UPDATE ON public.ticket_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_maintenance_details_updated_at
  BEFORE UPDATE ON public.ticket_maintenance_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_maintenance_executions_updated_at
  BEFORE UPDATE ON public.ticket_maintenance_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_purchase_details_updated_at
  BEFORE UPDATE ON public.ticket_purchase_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_quotations_updated_at
  BEFORE UPDATE ON public.ticket_quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_claim_details_updated_at
  BEFORE UPDATE ON public.ticket_claim_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_purchases_updated_at
  BEFORE UPDATE ON public.claim_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_purchase_items_updated_at
  BEFORE UPDATE ON public.claim_purchase_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claim_purchase_quotations_updated_at
  BEFORE UPDATE ON public.claim_purchase_quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accredited_suppliers_updated_at
  BEFORE UPDATE ON public.accredited_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_rh_details_updated_at
  BEFORE UPDATE ON public.ticket_rh_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uniforms_updated_at
  BEFORE UPDATE ON public.uniforms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON public.checklist_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_questions_updated_at
  BEFORE UPDATE ON public.checklist_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_executions_updated_at
  BEFORE UPDATE ON public.checklist_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar mudanças em chamados
CREATE OR REPLACE FUNCTION public.log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log de mudança de status
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, COALESCE(auth.uid(), NEW.created_by), 'status_change', OLD.status, NEW.status);
  END IF;
  
  -- Log de mudança de responsável
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, COALESCE(auth.uid(), NEW.created_by), 'assignment_change', OLD.assigned_to::text, NEW.assigned_to::text);
  END IF;
  
  -- Log de mudança de prioridade
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, COALESCE(auth.uid(), NEW.created_by), 'priority_change', OLD.priority, NEW.priority);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_ticket_changes_trigger
  AFTER UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_ticket_changes();

-- Trigger para atualizar estoque de uniformes
CREATE OR REPLACE FUNCTION public.update_uniform_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'entry' THEN
    UPDATE uniforms
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.uniform_id;
  ELSIF NEW.type = 'withdrawal' THEN
    UPDATE uniforms
    SET current_stock = GREATEST(0, current_stock - NEW.quantity)
    WHERE id = NEW.uniform_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_uniform_stock_trigger
  AFTER INSERT ON public.uniform_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_uniform_stock();

-- Trigger para marcar não-conformidades em checklists
CREATE OR REPLACE FUNCTION public.check_non_conformities()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a resposta é "Não" (false), marca a execução como tendo não-conformidades
  IF NEW.answer = false THEN
    UPDATE checklist_executions
    SET has_non_conformities = true
    WHERE id = NEW.execution_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_non_conformities_trigger
  AFTER INSERT ON public.checklist_answers
  FOR EACH ROW
  EXECUTE FUNCTION check_non_conformities();
