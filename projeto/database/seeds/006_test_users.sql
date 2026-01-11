-- ============================================
-- Seed 006: Usuários de Teste
-- GarageInn App - Test Users Setup
-- ============================================
-- IMPORTANTE: Este script é apenas para REFERÊNCIA.
-- A criação de usuários deve ser feita via Edge Function
-- pois requer acesso ao Supabase Auth Admin API.
-- ============================================
-- Padrão de email: {cargo}_{setor}_teste@garageinn.com
-- Senha padrão: Teste123!
-- ============================================

-- ============================================
-- LISTA DE USUÁRIOS DE TESTE (31 usuários)
-- ============================================

-- Este bloco PL/pgSQL serve como documentação e validação
-- dos usuários que serão criados pela Edge Function

DO $$
DECLARE
  -- IDs dos departamentos
  v_dept_operacoes uuid;
  v_dept_compras uuid;
  v_dept_financeiro uuid;
  v_dept_rh uuid;
  v_dept_sinistros uuid;
  v_dept_comercial uuid;
  v_dept_auditoria uuid;
  v_dept_ti uuid;
  
  -- IDs das unidades para vínculo
  v_unit_berrini_one uuid;
  v_unit_tower_bridge uuid;
  v_unit_hebraica uuid;
  v_unit_cubo uuid;
  v_unit_maria_cecilia uuid;
  
  -- Contadores
  v_total_users integer := 0;
  v_total_roles integer := 0;
  v_total_units integer := 0;
BEGIN
  -- Buscar IDs dos departamentos
  SELECT id INTO v_dept_operacoes FROM departments WHERE name = 'Operações';
  SELECT id INTO v_dept_compras FROM departments WHERE name = 'Compras e Manutenção';
  SELECT id INTO v_dept_financeiro FROM departments WHERE name = 'Financeiro';
  SELECT id INTO v_dept_rh FROM departments WHERE name = 'RH';
  SELECT id INTO v_dept_sinistros FROM departments WHERE name = 'Sinistros';
  SELECT id INTO v_dept_comercial FROM departments WHERE name = 'Comercial';
  SELECT id INTO v_dept_auditoria FROM departments WHERE name = 'Auditoria';
  SELECT id INTO v_dept_ti FROM departments WHERE name = 'TI';
  
  -- Buscar IDs das unidades
  SELECT id INTO v_unit_berrini_one FROM units WHERE name = 'BERRINI ONE';
  SELECT id INTO v_unit_tower_bridge FROM units WHERE name = 'TOWER BRIDGE';
  SELECT id INTO v_unit_hebraica FROM units WHERE name = 'HEBRAICA';
  SELECT id INTO v_unit_cubo FROM units WHERE name = 'CUBO';
  SELECT id INTO v_unit_maria_cecilia FROM units WHERE name = 'MARIA CECILIA';
  
  -- Validar que todos os departamentos existem
  IF v_dept_operacoes IS NULL THEN RAISE EXCEPTION 'Departamento Operações não encontrado'; END IF;
  IF v_dept_compras IS NULL THEN RAISE EXCEPTION 'Departamento Compras e Manutenção não encontrado'; END IF;
  IF v_dept_financeiro IS NULL THEN RAISE EXCEPTION 'Departamento Financeiro não encontrado'; END IF;
  IF v_dept_rh IS NULL THEN RAISE EXCEPTION 'Departamento RH não encontrado'; END IF;
  IF v_dept_sinistros IS NULL THEN RAISE EXCEPTION 'Departamento Sinistros não encontrado'; END IF;
  IF v_dept_comercial IS NULL THEN RAISE EXCEPTION 'Departamento Comercial não encontrado'; END IF;
  IF v_dept_auditoria IS NULL THEN RAISE EXCEPTION 'Departamento Auditoria não encontrado'; END IF;
  IF v_dept_ti IS NULL THEN RAISE EXCEPTION 'Departamento TI não encontrado'; END IF;
  
  -- Validar que todas as unidades existem
  IF v_unit_berrini_one IS NULL THEN RAISE EXCEPTION 'Unidade BERRINI ONE não encontrada'; END IF;
  IF v_unit_tower_bridge IS NULL THEN RAISE EXCEPTION 'Unidade TOWER BRIDGE não encontrada'; END IF;
  IF v_unit_hebraica IS NULL THEN RAISE EXCEPTION 'Unidade HEBRAICA não encontrada'; END IF;
  IF v_unit_cubo IS NULL THEN RAISE EXCEPTION 'Unidade CUBO não encontrada'; END IF;
  IF v_unit_maria_cecilia IS NULL THEN RAISE EXCEPTION 'Unidade MARIA CECILIA não encontrada'; END IF;
  
  -- Contar cargos existentes
  SELECT COUNT(*) INTO v_total_roles FROM roles;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'VALIDAÇÃO DE PRÉ-REQUISITOS CONCLUÍDA';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Departamentos encontrados: 8';
  RAISE NOTICE 'Cargos encontrados: %', v_total_roles;
  RAISE NOTICE 'Unidades para vínculo: 5';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Execute a Edge Function create-test-users';
  RAISE NOTICE 'para criar os usuários de teste.';
  RAISE NOTICE '============================================';
END $$;

-- ============================================
-- DEFINIÇÃO DOS USUÁRIOS DE TESTE
-- ============================================
-- Esta tabela temporária serve como referência
-- para a Edge Function

/*
USUÁRIOS A SEREM CRIADOS:

== CARGOS GLOBAIS (3) ==
1. desenvolvedor_global_teste@garageinn.com | Teste Desenvolvedor - Global | Desenvolvedor
2. diretor_global_teste@garageinn.com | Teste Diretor - Global | Diretor
3. administrador_global_teste@garageinn.com | Teste Administrador - Global | Administrador

== OPERAÇÕES (4) ==
4. manobrista_operacoes_teste@garageinn.com | Teste Manobrista - Operações | Manobrista | BERRINI ONE
5. encarregado_operacoes_teste@garageinn.com | Teste Encarregado - Operações | Encarregado | TOWER BRIDGE
6. supervisor_operacoes_teste@garageinn.com | Teste Supervisor - Operações | Supervisor | BERRINI ONE, TOWER BRIDGE, HEBRAICA, CUBO, MARIA CECILIA
7. gerente_operacoes_teste@garageinn.com | Teste Gerente - Operações | Gerente

== COMPRAS E MANUTENÇÃO (3) ==
8. assistente_compras_e_manutencao_teste@garageinn.com | Teste Assistente - Compras e Manutenção | Assistente
9. comprador_compras_e_manutencao_teste@garageinn.com | Teste Comprador - Compras e Manutenção | Comprador
10. gerente_compras_e_manutencao_teste@garageinn.com | Teste Gerente - Compras e Manutenção | Gerente

== FINANCEIRO (7) ==
11. auxiliar_financeiro_teste@garageinn.com | Teste Auxiliar - Financeiro | Auxiliar
12. assistente_financeiro_teste@garageinn.com | Teste Assistente - Financeiro | Assistente
13. analista_junior_financeiro_teste@garageinn.com | Teste Analista Júnior - Financeiro | Analista Júnior
14. analista_pleno_financeiro_teste@garageinn.com | Teste Analista Pleno - Financeiro | Analista Pleno
15. analista_senior_financeiro_teste@garageinn.com | Teste Analista Sênior - Financeiro | Analista Sênior
16. supervisor_financeiro_teste@garageinn.com | Teste Supervisor - Financeiro | Supervisor
17. gerente_financeiro_teste@garageinn.com | Teste Gerente - Financeiro | Gerente

== RH (7) ==
18. auxiliar_rh_teste@garageinn.com | Teste Auxiliar - RH | Auxiliar
19. assistente_rh_teste@garageinn.com | Teste Assistente - RH | Assistente
20. analista_junior_rh_teste@garageinn.com | Teste Analista Júnior - RH | Analista Júnior
21. analista_pleno_rh_teste@garageinn.com | Teste Analista Pleno - RH | Analista Pleno
22. analista_senior_rh_teste@garageinn.com | Teste Analista Sênior - RH | Analista Sênior
23. supervisor_rh_teste@garageinn.com | Teste Supervisor - RH | Supervisor
24. gerente_rh_teste@garageinn.com | Teste Gerente - RH | Gerente

== SINISTROS (2) ==
25. supervisor_sinistros_teste@garageinn.com | Teste Supervisor - Sinistros | Supervisor
26. gerente_sinistros_teste@garageinn.com | Teste Gerente - Sinistros | Gerente

== COMERCIAL (1) ==
27. gerente_comercial_teste@garageinn.com | Teste Gerente - Comercial | Gerente

== AUDITORIA (2) ==
28. auditor_auditoria_teste@garageinn.com | Teste Auditor - Auditoria | Auditor
29. gerente_auditoria_teste@garageinn.com | Teste Gerente - Auditoria | Gerente

== TI (2) ==
30. analista_ti_teste@garageinn.com | Teste Analista - TI | Analista
31. gerente_ti_teste@garageinn.com | Teste Gerente - TI | Gerente

TOTAL: 31 usuários
*/

-- ============================================
-- QUERY DE VERIFICAÇÃO
-- ============================================
-- Execute após criar os usuários para validar

/*
SELECT 
  p.email,
  p.full_name,
  r.name as cargo,
  COALESCE(d.name, 'Global') as departamento,
  COUNT(uu.unit_id) as unidades_vinculadas
FROM profiles p
JOIN user_roles ur ON ur.user_id = p.id
JOIN roles r ON r.id = ur.role_id
LEFT JOIN departments d ON d.id = r.department_id
LEFT JOIN user_units uu ON uu.user_id = p.id
WHERE p.email LIKE '%_teste@garageinn.com'
GROUP BY p.id, p.email, p.full_name, r.name, d.name
ORDER BY d.name NULLS FIRST, r.name;
*/

-- ============================================
-- ROLLBACK (se necessário)
-- ============================================

/*
-- Remover vínculos com unidades
DELETE FROM user_units 
WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%_teste@garageinn.com'
);

-- Remover vínculos com cargos
DELETE FROM user_roles 
WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%_teste@garageinn.com'
);

-- Remover perfis (cascade para auth.users)
DELETE FROM profiles WHERE email LIKE '%_teste@garageinn.com';
*/
