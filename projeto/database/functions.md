# Funções SQL do Banco de Dados

Documentação das funções e stored procedures do sistema GarageInn.

---

## 📋 Lista de Funções

| Função | Descrição | Retorno |
|--------|-----------|---------|
| `is_admin()` | Verifica se o usuário atual é admin | boolean |
| `is_rh()` | Verifica se o usuário atual é do RH | boolean |
| `is_invitation_expired(p_user_id)` | Verifica se convite expirou | boolean |
| `soft_delete_user(p_user_id)` | Soft delete de usuário | boolean |
| `restore_deleted_user(p_user_id)` | Restaura usuário deletado | boolean |
| `ticket_needs_approval(p_created_by, p_department_id)` | Verifica se chamado precisa aprovação | boolean |
| `create_ticket_approvals(p_ticket_id)` | Cria registros de aprovação | void |
| `advance_ticket_approval(...)` | Avança aprovação do chamado | text |

---

## 🔐 Funções de Verificação de Permissão

### is_admin()

Verifica se o usuário autenticado possui cargo de Administrador, Desenvolvedor ou Diretor.

```sql
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
```

**Uso:**
```sql
SELECT is_admin(); -- Retorna true/false
```

---

### is_rh()

Verifica se o usuário autenticado possui cargo no departamento de RH.

```sql
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
```

**Uso:**
```sql
SELECT is_rh(); -- Retorna true/false
```

---

## 👤 Funções de Gestão de Usuários

### is_invitation_expired(p_user_id)

Verifica se o convite de um usuário expirou.

```sql
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
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_user_id | uuid | ID do usuário |

**Uso:**
```sql
SELECT is_invitation_expired('uuid-do-usuario');
```

---

### soft_delete_user(p_user_id)

Realiza soft delete de um usuário (marca como deletado sem remover).

```sql
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
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_user_id | uuid | ID do usuário a deletar |

**Uso:**
```sql
SELECT soft_delete_user('uuid-do-usuario');
```

---

### restore_deleted_user(p_user_id)

Restaura um usuário que foi soft deleted.

```sql
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
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_user_id | uuid | ID do usuário a restaurar |

**Uso:**
```sql
SELECT restore_deleted_user('uuid-do-usuario');
```

---

## 📋 Funções de Aprovação de Chamados

### ticket_needs_approval(p_created_by, p_department_id)

Verifica se um chamado precisa passar por aprovações internas.

**Regra**: Chamados criados por Manobristas para Compras ou Manutenção precisam de aprovação.

```sql
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
  
  -- Verifica se o departamento destino é Compras ou Manutenção
  SELECT EXISTS (
    SELECT 1
    FROM departments
    WHERE id = p_department_id
    AND name IN ('Compras e Manutenção')
  ) INTO v_is_target_dept;
  
  RETURN v_is_target_dept;
END;
$$;
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_created_by | uuid | ID do criador do chamado |
| p_department_id | uuid | ID do departamento destino |

**Uso:**
```sql
SELECT ticket_needs_approval('uuid-criador', 'uuid-departamento');
```

---

### create_ticket_approvals(p_ticket_id)

Cria os registros de aprovação para um chamado que precisa de aprovação.

```sql
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
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_ticket_id | uuid | ID do chamado |

**Uso:**
```sql
SELECT create_ticket_approvals('uuid-do-chamado');
```

---

### advance_ticket_approval(p_ticket_id, p_approval_level, p_approved, p_notes)

Avança ou rejeita uma aprovação de chamado.

```sql
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
    
    RETURN 'denied';
  END IF;
  
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
    
    RETURN 'awaiting_triage';
  ELSE
    -- Ainda há níveis pendentes
    RETURN 'pending_next_level';
  END IF;
END;
$$;
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| p_ticket_id | uuid | ID do chamado |
| p_approval_level | integer | Nível da aprovação (1, 2 ou 3) |
| p_approved | boolean | Se foi aprovado ou não |
| p_notes | text | Observações (obrigatório se negado) |

**Retorno:**
- `'denied'` - Chamado foi negado
- `'awaiting_triage'` - Todas aprovações concluídas
- `'pending_next_level'` - Aguardando próximo nível

**Uso:**
```sql
-- Aprovar
SELECT advance_ticket_approval('uuid-chamado', 1, true, 'Aprovado pelo encarregado');

-- Negar
SELECT advance_ticket_approval('uuid-chamado', 2, false, 'Valor acima do orçamento');
```

---

## 🔧 Triggers Recomendados

### Atualização automática de updated_at

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas com updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ... repetir para outras tabelas
```

---

### Registro automático de histórico de chamados

```sql
CREATE OR REPLACE FUNCTION public.log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log de mudança de status
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status_change', OLD.status, NEW.status);
  END IF;
  
  -- Log de mudança de responsável
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'assignment_change', OLD.assigned_to::text, NEW.assigned_to::text);
  END IF;
  
  -- Log de mudança de prioridade
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO ticket_history (ticket_id, user_id, action, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'priority_change', OLD.priority, NEW.priority);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_ticket_changes_trigger
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_ticket_changes();
```

---

### Atualização automática de estoque de uniformes

```sql
CREATE OR REPLACE FUNCTION public.update_uniform_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'entry' THEN
    UPDATE uniforms
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.uniform_id;
  ELSIF NEW.type = 'withdrawal' THEN
    UPDATE uniforms
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.uniform_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_uniform_stock_trigger
  AFTER INSERT ON uniform_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_uniform_stock();
```

---

## 📝 Notas de Implementação

1. **SECURITY DEFINER**: Todas as funções usam `SECURITY DEFINER` para executar com permissões do owner, não do caller
2. **search_path**: Definido como `public` para evitar ataques de search path
3. **auth.uid()**: Função do Supabase que retorna o ID do usuário autenticado
4. **Transações**: Funções que modificam múltiplas tabelas devem ser chamadas dentro de transações
