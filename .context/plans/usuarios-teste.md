---
status: completed
generated: 2026-01-11
completed: 2026-01-11
---

# Criação de Usuários de Teste por Cargo/Departamento

> Criar usuários de teste para cada cargo de cada departamento, seguindo o padrão de email `cargo_setor_teste@garageinn.com`. Usuários de Operações (Manobrista, Encarregado) vinculados a 1 unidade, Supervisores vinculados a várias unidades.

## Task Snapshot
- **Primary goal:** Criar usuários de teste representando todos os cargos de todos os departamentos do sistema GarageInn para facilitar testes de funcionalidades e permissões.
- **Success signal:** Todos os usuários criados com sucesso no Supabase Auth e vinculados corretamente aos seus cargos e unidades (quando aplicável).
- **Key references:**
  - [Departamentos e Cargos](../../projeto/usuarios/departamentos_cargos.md)
  - [Seed de Departamentos](../../projeto/database/seeds/001_departments_roles.sql)
  - [Seed de Admin](../../projeto/database/seeds/002_admin_user.sql)
  - [Unidades CSV](../../projeto/unidades.csv)

## Padrão de Nomenclatura

### Formato de Email
```
{cargo}_{setor}_teste@garageinn.com
```

**Regras:**
- Tudo em minúsculas
- Espaços substituídos por underscore (`_`)
- Acentos removidos
- Caracteres especiais removidos

**Exemplos:**
- `manobrista_operacoes_teste@garageinn.com`
- `analista_junior_financeiro_teste@garageinn.com`
- `gerente_compras_e_manutencao_teste@garageinn.com`

### Formato de Nome
```
Teste {Cargo} - {Departamento}
```

**Exemplos:**
- `Teste Manobrista - Operações`
- `Teste Analista Júnior - Financeiro`

## Lista de Usuários a Criar

### Cargos Globais (3 usuários)

| Email | Nome | Cargo | Unidade(s) |
|-------|------|-------|------------|
| `desenvolvedor_global_teste@garageinn.com` | Teste Desenvolvedor - Global | Desenvolvedor | - |
| `diretor_global_teste@garageinn.com` | Teste Diretor - Global | Diretor | - |
| `administrador_global_teste@garageinn.com` | Teste Administrador - Global | Administrador | - |

### Operações (4 usuários)

| Email | Nome | Cargo | Unidade(s) |
|-------|------|-------|------------|
| `manobrista_operacoes_teste@garageinn.com` | Teste Manobrista - Operações | Manobrista | BERRINI ONE (1 unidade) |
| `encarregado_operacoes_teste@garageinn.com` | Teste Encarregado - Operações | Encarregado | TOWER BRIDGE (1 unidade) |
| `supervisor_operacoes_teste@garageinn.com` | Teste Supervisor - Operações | Supervisor | BERRINI ONE, TOWER BRIDGE, HEBRAICA, CUBO, MARIA CECILIA (5 unidades) |
| `gerente_operacoes_teste@garageinn.com` | Teste Gerente - Operações | Gerente | - |

### Compras e Manutenção (3 usuários)

| Email | Nome | Cargo | Unidade(s) |
|-------|------|-------|------------|
| `assistente_compras_e_manutencao_teste@garageinn.com` | Teste Assistente - Compras e Manutenção | Assistente | - |
| `comprador_compras_e_manutencao_teste@garageinn.com` | Teste Comprador - Compras e Manutenção | Comprador | - |
| `gerente_compras_e_manutencao_teste@garageinn.com` | Teste Gerente - Compras e Manutenção | Gerente | - |

### Financeiro (7 usuários)

| Email | Nome | Cargo | Unidade(s) |
|-------|------|-------|------------|
| `auxiliar_financeiro_teste@garageinn.com` | Teste Auxiliar - Financeiro | Auxiliar | - |
| `assistente_financeiro_teste@garageinn.com` | Teste Assistente - Financeiro | Assistente | - |
| `analista_junior_financeiro_teste@garageinn.com` | Teste Analista Júnior - Financeiro | Analista Júnior | - |
| `analista_pleno_financeiro_teste@garageinn.com` | Teste Analista Pleno - Financeiro | Analista Pleno | - |
| `analista_senior_financeiro_teste@garageinn.com` | Teste Analista Sênior - Financeiro | Analista Sênior | - |
| `supervisor_financeiro_teste@garageinn.com` | Teste Supervisor - Financeiro | Supervisor | - |
| `gerente_financeiro_teste@garageinn.com` | Teste Gerente - Financeiro | Gerente | - |

### RH (7 usuários)

| Email | Nome | Cargo | Unidade(s) |
|-------|------|-------|------------|
| `auxiliar_rh_teste@garageinn.com` | Teste Auxiliar - RH | Auxiliar | - |
| `assistente_rh_teste@garageinn.com` | Teste Assistente - RH | Assistente | - |
| `analista_junior_rh_teste@garageinn.com` | Teste Analista Júnior - RH | Analista Júnior | - |
| `analista_pleno_rh_teste@garageinn.com` | Teste Analista Pleno - RH | Analista Pleno | - |
| `analista_senior_rh_teste@garageinn.com` | Teste Analista Sênior - RH | Analista Sênior | - |
| `supervisor_rh_teste@garageinn.com` | Teste Supervisor - RH | Supervisor | - |
| `gerente_rh_teste@garageinn.com` | Teste Gerente - RH | Gerente | - |

### Sinistros (2 usuários)

| Email | Nome | Cargo | Unidade(s) |
|-------|------|-------|------------|
| `supervisor_sinistros_teste@garageinn.com` | Teste Supervisor - Sinistros | Supervisor | - |
| `gerente_sinistros_teste@garageinn.com` | Teste Gerente - Sinistros | Gerente | - |

### Comercial (1 usuário)

| Email | Nome | Cargo | Unidade(s) |
|-------|------|-------|------------|
| `gerente_comercial_teste@garageinn.com` | Teste Gerente - Comercial | Gerente | - |

### Auditoria (2 usuários)

| Email | Nome | Cargo | Unidade(s) |
|-------|------|-------|------------|
| `auditor_auditoria_teste@garageinn.com` | Teste Auditor - Auditoria | Auditor | - |
| `gerente_auditoria_teste@garageinn.com` | Teste Gerente - Auditoria | Gerente | - |

### TI (2 usuários)

| Email | Nome | Cargo | Unidade(s) |
|-------|------|-------|------------|
| `analista_ti_teste@garageinn.com` | Teste Analista - TI | Analista | - |
| `gerente_ti_teste@garageinn.com` | Teste Gerente - TI | Gerente | - |

## Resumo

| Departamento | Quantidade de Usuários |
|--------------|------------------------|
| Cargos Globais | 3 |
| Operações | 4 |
| Compras e Manutenção | 3 |
| Financeiro | 7 |
| RH | 7 |
| Sinistros | 2 |
| Comercial | 1 |
| Auditoria | 2 |
| TI | 2 |
| **TOTAL** | **31** |

## Regras de Vínculo com Unidades

Conforme documentação em `projeto/usuarios/departamentos_cargos.md`:

1. **Manobrista e Encarregado (Operações):** Vinculados a **1 unidade** (trabalham em uma unidade específica)
2. **Supervisor (Operações):** Vinculado a **várias unidades** (supervisiona múltiplas unidades)
3. **Demais cargos:** **Sem vínculo** com unidades (trabalham para todas as unidades)

### Unidades Selecionadas para Testes

| Código | Nome | Região | Uso |
|--------|------|--------|-----|
| 15 | BERRINI ONE | Sul/Berrini | Manobrista + Supervisor |
| 87 | TOWER BRIDGE | Sul/Berrini | Encarregado + Supervisor |
| 44 | HEBRAICA | Sul/Faria Lima | Supervisor |
| 30 | CUBO | Sul/Vila Olímpia | Supervisor |
| 52 | MARIA CECILIA | Sul/Itaim Bibi | Supervisor |

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criar script SQL para inserção dos usuários | [Database Specialist](../agents/database-specialist.md) | Criar seed SQL com usuários de teste |
| Backend Specialist | Criar Edge Function para automação | [Backend Specialist](../agents/backend-specialist.md) | Implementar função de criação de usuários |
| Documentation Writer | Documentar usuários criados | [Documentation Writer](../agents/documentation-writer.md) | Atualizar documentação com lista de usuários |

## Working Phases

### Phase 1 — Preparação e Validação

**Steps**
1. Verificar se todas as unidades necessárias existem no banco de dados
2. Verificar se todos os departamentos e cargos existem conforme seed 001
3. Definir senha padrão para os usuários de teste

**Senha Padrão:** `Teste123!`

**Commit Checkpoint**
- `git commit -m "chore(plan): validar estrutura para usuários de teste"`

### Phase 2 — Criação do Script SQL

**Steps**
1. Criar arquivo `projeto/database/seeds/006_test_users.sql`
2. Implementar script que:
   - Cria usuários no Supabase Auth (via função admin ou Edge Function)
   - Insere perfis na tabela `profiles`
   - Vincula usuários aos cargos na tabela `user_roles`
   - Vincula usuários às unidades na tabela `user_units` (quando aplicável)

**Estrutura do Script:**
```sql
-- 1. Criar usuários no auth.users (requer Edge Function ou Dashboard)
-- 2. Inserir em profiles
-- 3. Inserir em user_roles
-- 4. Inserir em user_units (para Operações)
```

**Commit Checkpoint**
- `git commit -m "feat(seeds): adicionar script de usuários de teste"`

### Phase 3 — Execução e Validação

**Steps**
1. Executar Edge Function ou script para criar usuários
2. Verificar criação com query de validação
3. Testar login com cada tipo de usuário
4. Atualizar documentação `projeto/.dev/usuarios_teste.md`

**Query de Validação:**
```sql
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
```

**Commit Checkpoint**
- `git commit -m "docs: atualizar documentação de usuários de teste"`

## Rollback Plan

### Rollback Procedures

**Remover usuários de teste:**
```sql
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
```

## Evidence & Follow-up

### Artifacts to Collect
- [x] Script SQL de criação (`006_test_users.sql`) ✅
- [x] Log de execução da Edge Function ✅ (31 usuários criados com sucesso)
- [x] Query de validação executada com sucesso ✅
- [ ] Screenshot ou log de teste de login

### Follow-up Actions
- [x] Atualizar `projeto/.dev/usuarios_teste.md` com nova lista ✅
- [x] Edge Function `create-test-users` criada e deployada ✅
- [x] Documentar credenciais no arquivo de referência ✅

## Execution Log

**Data de execução:** 2026-01-11

**Resultado da Edge Function:**
```json
{
  "success": true,
  "summary": {
    "total": 31,
    "created": 31,
    "skipped": 0,
    "errors": 0
  }
}
```

**Validação de vínculos com unidades:**
- Manobrista: 1 unidade (BERRINI ONE) ✅
- Encarregado: 1 unidade (TOWER BRIDGE) ✅
- Supervisor: 5 unidades ✅
- Demais cargos: 0 unidades (correto) ✅
