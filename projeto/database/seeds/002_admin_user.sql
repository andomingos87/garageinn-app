-- ============================================
-- Seed 002: Usuário Administrador
-- GarageInn App - Admin User Setup
-- ============================================
-- IMPORTANTE: Este script deve ser executado APÓS
-- criar o usuário no Supabase Auth (Dashboard ou API)
-- ============================================

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 1. Acesse o Dashboard do Supabase
-- 2. Vá em Authentication > Users
-- 3. Clique em "Add user" > "Create new user"
-- 4. Preencha:
--    - Email: admin@garageinn.com.br
--    - Password: (defina uma senha segura)
--    - Auto Confirm User: ON
-- 5. Copie o UUID do usuário criado
-- 6. Substitua 'SEU_UUID_AQUI' abaixo pelo UUID copiado
-- 7. Execute este script
-- ============================================

-- Variável para o UUID do admin (substitua pelo UUID real)
-- Exemplo: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
DO $$
DECLARE
  v_admin_id uuid := 'SEU_UUID_AQUI'; -- ⚠️ SUBSTITUA PELO UUID REAL
  v_admin_role_id uuid;
BEGIN
  -- Verifica se o UUID foi substituído
  IF v_admin_id = 'SEU_UUID_AQUI' THEN
    RAISE EXCEPTION 'Por favor, substitua SEU_UUID_AQUI pelo UUID real do usuário admin criado no Supabase Auth';
  END IF;

  -- Cria o perfil do admin
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    status,
    created_at,
    updated_at
  ) VALUES (
    v_admin_id,
    'admin@garageinn.com.br',
    'Administrador do Sistema',
    'active',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    status = 'active',
    updated_at = now();

  -- Busca o ID do cargo Administrador
  SELECT id INTO v_admin_role_id
  FROM public.roles
  WHERE name = 'Administrador'
  AND is_global = true
  LIMIT 1;

  IF v_admin_role_id IS NULL THEN
    RAISE EXCEPTION 'Cargo Administrador não encontrado. Execute o seed 001_departments_roles.sql primeiro.';
  END IF;

  -- Vincula o usuário ao cargo de Administrador
  INSERT INTO public.user_roles (
    user_id,
    role_id,
    created_at
  ) VALUES (
    v_admin_id,
    v_admin_role_id,
    now()
  )
  ON CONFLICT (user_id, role_id) DO NOTHING;

  RAISE NOTICE 'Usuário admin criado com sucesso!';
  RAISE NOTICE 'Email: admin@garageinn.com.br';
  RAISE NOTICE 'ID: %', v_admin_id;
END $$;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se o admin foi criado corretamente
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.status,
  r.name as cargo,
  CASE WHEN r.is_global THEN 'Global' ELSE d.name END as departamento
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
JOIN public.roles r ON r.id = ur.role_id
LEFT JOIN public.departments d ON d.id = r.department_id
WHERE p.email = 'admin@garageinn.com.br';
