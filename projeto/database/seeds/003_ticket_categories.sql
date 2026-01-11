-- ============================================
-- Seed 003: Categorias de Chamados
-- GarageInn App - Ticket Categories
-- ============================================
-- Execute após 001_departments_roles.sql
-- ============================================

-- ============================================
-- CATEGORIAS - COMPRAS E MANUTENÇÃO
-- ============================================

INSERT INTO public.ticket_categories (name, department_id, status)
SELECT c.name, d.id, 'active'
FROM (VALUES 
  ('Material de Limpeza'),
  ('Material de Escritório'),
  ('Equipamentos'),
  ('Ferramentas'),
  ('Peças de Reposição'),
  ('Uniformes'),
  ('EPI - Equipamento de Proteção'),
  ('Sinalização'),
  ('Outros Materiais')
) AS c(name)
CROSS JOIN public.departments d
WHERE d.name = 'Compras e Manutenção'
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORIAS - MANUTENÇÃO (Assuntos)
-- ============================================

INSERT INTO public.ticket_categories (name, department_id, status)
SELECT c.name, d.id, 'active'
FROM (VALUES 
  ('Elétrica'),
  ('Hidráulica'),
  ('Pintura'),
  ('Alvenaria'),
  ('Serralheria'),
  ('Portão/Cancela'),
  ('Elevador'),
  ('Sistema de Segurança'),
  ('Ar Condicionado'),
  ('Iluminação'),
  ('Piso'),
  ('Telhado/Cobertura'),
  ('Limpeza de Caixa d''água'),
  ('Dedetização'),
  ('Jardinagem'),
  ('Outros')
) AS c(name)
CROSS JOIN public.departments d
WHERE d.name = 'Compras e Manutenção'
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORIAS - RH
-- ============================================

INSERT INTO public.ticket_categories (name, department_id, status)
SELECT c.name, d.id, 'active'
FROM (VALUES 
  ('Solicitação de Uniforme'),
  ('Solicitação de Pessoal'),
  ('Questão Salarial'),
  ('Vale Refeição (VR)'),
  ('Vale Transporte (VT)'),
  ('Férias'),
  ('Atestado Médico'),
  ('Advertência/Suspensão'),
  ('Desligamento'),
  ('Treinamento'),
  ('Outros')
) AS c(name)
CROSS JOIN public.departments d
WHERE d.name = 'RH'
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORIAS - SINISTROS
-- ============================================

INSERT INTO public.ticket_categories (name, department_id, status)
SELECT c.name, d.id, 'active'
FROM (VALUES 
  ('Veículo de Cliente'),
  ('Veículo de Terceiro'),
  ('Estrutura da Unidade'),
  ('Equipamento'),
  ('Pessoa/Acidente')
) AS c(name)
CROSS JOIN public.departments d
WHERE d.name = 'Sinistros'
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORIAS - FINANCEIRO
-- ============================================

INSERT INTO public.ticket_categories (name, department_id, status)
SELECT c.name, d.id, 'active'
FROM (VALUES 
  ('Pagamento a Fornecedor'),
  ('Reembolso'),
  ('Nota Fiscal'),
  ('Cobrança'),
  ('Conciliação'),
  ('Relatório Financeiro'),
  ('Outros')
) AS c(name)
CROSS JOIN public.departments d
WHERE d.name = 'Financeiro'
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORIAS - TI
-- ============================================

INSERT INTO public.ticket_categories (name, department_id, status)
SELECT c.name, d.id, 'active'
FROM (VALUES 
  ('Suporte Técnico'),
  ('Solicitação de Equipamento'),
  ('Problema de Sistema'),
  ('Acesso/Permissões'),
  ('Email'),
  ('Internet/Rede'),
  ('Impressora'),
  ('Outros')
) AS c(name)
CROSS JOIN public.departments d
WHERE d.name = 'TI'
ON CONFLICT DO NOTHING;

-- ============================================
-- CATEGORIAS - COMERCIAL
-- ============================================

INSERT INTO public.ticket_categories (name, department_id, status)
SELECT c.name, d.id, 'active'
FROM (VALUES 
  ('Novo Contrato'),
  ('Renovação de Contrato'),
  ('Cancelamento'),
  ('Reclamação de Cliente'),
  ('Proposta Comercial'),
  ('Outros')
) AS c(name)
CROSS JOIN public.departments d
WHERE d.name = 'Comercial'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Exibir resumo das categorias por departamento
SELECT 
  d.name as departamento,
  COUNT(tc.id) as total_categorias,
  STRING_AGG(tc.name, ', ' ORDER BY tc.name) as categorias
FROM public.ticket_categories tc
JOIN public.departments d ON d.id = tc.department_id
WHERE tc.status = 'active'
GROUP BY d.name
ORDER BY d.name;
