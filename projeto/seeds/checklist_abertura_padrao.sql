-- ============================================
-- Seed: Template Padrão de Checklist de Abertura
-- ============================================
-- Este script cria um template padrão de checklist de abertura
-- com perguntas comuns para verificação diária das garagens.
-- 
-- Executar via: mcp_supabase_execute_sql
-- ============================================

-- Criar template padrão de abertura
INSERT INTO public.checklist_templates (
  id,
  name,
  description,
  type,
  is_default,
  status,
  created_by
) VALUES (
  gen_random_uuid(),
  'Checklist de Abertura - Padrão',
  'Template padrão para verificação diária das condições da garagem na abertura.',
  'opening',
  true,
  'active',
  (SELECT id FROM public.profiles WHERE email = 'admin@garageinn.com.br' LIMIT 1)
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Inserir perguntas do checklist padrão
-- Usar CTE para obter o ID do template criado
WITH template AS (
  SELECT id FROM public.checklist_templates 
  WHERE name = 'Checklist de Abertura - Padrão' 
  LIMIT 1
)
INSERT INTO public.checklist_questions (
  template_id,
  question_text,
  order_index,
  is_required,
  requires_observation_on_no,
  status
)
SELECT 
  template.id,
  q.question_text,
  q.order_index,
  q.is_required,
  q.requires_observation_on_no,
  'active'
FROM template, (
  VALUES
    ('As luzes de emergência estão funcionando corretamente?', 1, true, true),
    ('O sistema de segurança (câmeras/alarmes) está ativo?', 2, true, true),
    ('Os extintores de incêndio estão em local visível e dentro da validade?', 3, true, true),
    ('O piso está limpo e sem obstáculos que possam causar acidentes?', 4, true, false),
    ('As sinalizações de vagas estão visíveis e em bom estado?', 5, true, false),
    ('Os equipamentos de manobrista (colete, lanterna) estão disponíveis?', 6, true, true),
    ('O sistema de controle de acesso (cancela/catraca) está funcionando?', 7, true, true),
    ('Há vagas disponíveis para mensalistas?', 8, false, false),
    ('O banheiro está limpo e abastecido?', 9, true, false),
    ('A iluminação geral da garagem está funcionando adequadamente?', 10, true, true),
    ('O computador/sistema de gestão está operacional?', 11, true, true),
    ('Há troco suficiente no caixa?', 12, false, false),
    ('Os cones e cavaletes de sinalização estão disponíveis?', 13, false, false),
    ('A área externa (calçada/entrada) está limpa e desobstruída?', 14, true, false),
    ('Todas as chaves de veículos guardados estão organizadas?', 15, true, true)
) AS q(question_text, order_index, is_required, requires_observation_on_no)
ON CONFLICT DO NOTHING;

-- Exibir resumo
SELECT 
  t.name as template_name,
  t.type,
  t.is_default,
  COUNT(q.id) as total_perguntas
FROM public.checklist_templates t
LEFT JOIN public.checklist_questions q ON q.template_id = t.id
WHERE t.name = 'Checklist de Abertura - Padrão'
GROUP BY t.id, t.name, t.type, t.is_default;

