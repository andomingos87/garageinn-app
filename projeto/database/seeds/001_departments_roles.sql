-- ============================================
-- Seed 001: Departamentos e Cargos
-- GarageInn App - Initial Data
-- ============================================
-- Execute após as migrations
-- ============================================

-- ============================================
-- DEPARTAMENTOS
-- ============================================

INSERT INTO public.departments (id, name) VALUES
  (gen_random_uuid(), 'Operações'),
  (gen_random_uuid(), 'Compras e Manutenção'),
  (gen_random_uuid(), 'Financeiro'),
  (gen_random_uuid(), 'RH'),
  (gen_random_uuid(), 'Sinistros'),
  (gen_random_uuid(), 'Comercial'),
  (gen_random_uuid(), 'Auditoria'),
  (gen_random_uuid(), 'TI')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- CARGOS GLOBAIS (sem departamento)
-- ============================================

INSERT INTO public.roles (name, department_id, is_global) VALUES
  ('Desenvolvedor', NULL, true),
  ('Diretor', NULL, true),
  ('Administrador', NULL, true)
ON CONFLICT (name, department_id) DO NOTHING;

-- ============================================
-- CARGOS POR DEPARTAMENTO
-- ============================================

-- Operações
INSERT INTO public.roles (name, department_id, is_global)
SELECT r.name, d.id, false
FROM (VALUES 
  ('Manobrista'),
  ('Encarregado'),
  ('Supervisor'),
  ('Gerente')
) AS r(name)
CROSS JOIN public.departments d
WHERE d.name = 'Operações'
ON CONFLICT (name, department_id) DO NOTHING;

-- Compras e Manutenção
INSERT INTO public.roles (name, department_id, is_global)
SELECT r.name, d.id, false
FROM (VALUES 
  ('Assistente'),
  ('Comprador'),
  ('Gerente')
) AS r(name)
CROSS JOIN public.departments d
WHERE d.name = 'Compras e Manutenção'
ON CONFLICT (name, department_id) DO NOTHING;

-- Financeiro
INSERT INTO public.roles (name, department_id, is_global)
SELECT r.name, d.id, false
FROM (VALUES 
  ('Auxiliar'),
  ('Assistente'),
  ('Analista Júnior'),
  ('Analista Pleno'),
  ('Analista Sênior'),
  ('Supervisor'),
  ('Gerente')
) AS r(name)
CROSS JOIN public.departments d
WHERE d.name = 'Financeiro'
ON CONFLICT (name, department_id) DO NOTHING;

-- RH
INSERT INTO public.roles (name, department_id, is_global)
SELECT r.name, d.id, false
FROM (VALUES 
  ('Auxiliar'),
  ('Assistente'),
  ('Analista Júnior'),
  ('Analista Pleno'),
  ('Analista Sênior'),
  ('Supervisor'),
  ('Gerente')
) AS r(name)
CROSS JOIN public.departments d
WHERE d.name = 'RH'
ON CONFLICT (name, department_id) DO NOTHING;

-- Sinistros
INSERT INTO public.roles (name, department_id, is_global)
SELECT r.name, d.id, false
FROM (VALUES 
  ('Supervisor'),
  ('Gerente')
) AS r(name)
CROSS JOIN public.departments d
WHERE d.name = 'Sinistros'
ON CONFLICT (name, department_id) DO NOTHING;

-- Comercial
INSERT INTO public.roles (name, department_id, is_global)
SELECT r.name, d.id, false
FROM (VALUES 
  ('Gerente')
) AS r(name)
CROSS JOIN public.departments d
WHERE d.name = 'Comercial'
ON CONFLICT (name, department_id) DO NOTHING;

-- Auditoria
INSERT INTO public.roles (name, department_id, is_global)
SELECT r.name, d.id, false
FROM (VALUES 
  ('Auditor'),
  ('Gerente')
) AS r(name)
CROSS JOIN public.departments d
WHERE d.name = 'Auditoria'
ON CONFLICT (name, department_id) DO NOTHING;

-- TI
INSERT INTO public.roles (name, department_id, is_global)
SELECT r.name, d.id, false
FROM (VALUES 
  ('Analista'),
  ('Gerente')
) AS r(name)
CROSS JOIN public.departments d
WHERE d.name = 'TI'
ON CONFLICT (name, department_id) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Exibir resumo dos dados inseridos
SELECT 
  COALESCE(d.name, 'Global') as departamento,
  COUNT(r.id) as total_cargos,
  STRING_AGG(r.name, ', ' ORDER BY r.name) as cargos
FROM public.roles r
LEFT JOIN public.departments d ON d.id = r.department_id
GROUP BY d.name
ORDER BY d.name NULLS FIRST;
