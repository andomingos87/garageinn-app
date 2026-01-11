---
status: ready
generated: 2026-01-11
---

# Criação do Banco de Dados GarageInn Plan

> Plano para criar o banco de dados PostgreSQL no Supabase usando MCP, incluindo tabelas, funções, RLS policies e seeds de dados iniciais

## Task Snapshot
- **Primary goal:** Recriar o banco de dados completo do GarageInn em um novo projeto Supabase, utilizando o MCP (Model Context Protocol) do Supabase para executar todas as migrations e seeds.
- **Success signal:** Todas as 33 tabelas criadas, 8 funções implementadas, RLS policies ativas, e dados iniciais (departamentos, cargos, categorias) inseridos com sucesso. Aplicação conectando e funcionando normalmente.
- **Key references:**
  - [Documentação do Banco de Dados](../../../projeto/database/README.md)
  - [Schema das Tabelas](../../../projeto/database/schema.md)
  - [Relacionamentos](../../../projeto/database/relationships.md)
  - [Funções SQL](../../../projeto/database/functions.md)

## Codebase Context
- **Total de tabelas:** 33
- **Total de funções:** 8
- **Migrations:** 3 arquivos SQL
- **Seeds:** 5 arquivos SQL
- **Documentação:** Completa em `projeto/database/`

### Estrutura do Banco

**Grupos de Tabelas:**
- **Autenticação:** profiles, departments, roles, user_roles, user_units (5 tabelas)
- **Unidades:** units (1 tabela)
- **Chamados:** tickets, ticket_categories, ticket_comments, ticket_attachments, ticket_history, ticket_approvals (6 tabelas)
- **Manutenção:** ticket_maintenance_details, ticket_maintenance_executions (2 tabelas)
- **Compras:** ticket_purchase_details, ticket_quotations (2 tabelas)
- **Sinistros:** ticket_claim_details, claim_communications, claim_purchases, claim_purchase_items, claim_purchase_quotations, accredited_suppliers (6 tabelas)
- **RH:** ticket_rh_details, uniforms, uniform_transactions (3 tabelas)
- **Checklists:** checklist_templates, checklist_questions, checklist_executions, checklist_answers, unit_checklist_templates (5 tabelas)
- **Sistema:** system_settings, audit_logs (2 tabelas)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Executor principal - executa todas as migrations via MCP | [Database Specialist](../agents/database-specialist.md) | Criar tabelas, funções e RLS policies |
| Security Auditor | Validar RLS policies e permissões | [Security Auditor](../agents/security-auditor.md) | Verificar se RLS está corretamente configurado |
| Backend Specialist | Testar conexão e queries após setup | [Backend Specialist](../agents/backend-specialist.md) | Validar integração com a aplicação |

## Documentation Touchpoints
| Guide | File | Primary Inputs |
| --- | --- | --- |
| Schema do Banco | [schema.md](../../../projeto/database/schema.md) | Estrutura de todas as 33 tabelas |
| Relacionamentos | [relationships.md](../../../projeto/database/relationships.md) | Diagrama ERD e FKs |
| Funções SQL | [functions.md](../../../projeto/database/functions.md) | 8 funções documentadas |
| Migration 001 | [001_create_tables.sql](../../../projeto/database/migrations/001_create_tables.sql) | Script de criação de tabelas |
| Migration 002 | [002_create_functions.sql](../../../projeto/database/migrations/002_create_functions.sql) | Script de funções e triggers |
| Migration 003 | [003_create_rls_policies.sql](../../../projeto/database/migrations/003_create_rls_policies.sql) | Script de RLS policies |

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Erro de sintaxe SQL no MCP | Low | Medium | Testar cada migration separadamente | Database Specialist |
| Ordem incorreta de criação (FK) | Medium | High | Seguir ordem das migrations (001→002→003) | Database Specialist |
| RLS bloqueando acesso | Medium | Medium | Criar usuário admin antes de ativar RLS | Security Auditor |
| Timeout em migrations grandes | Low | Low | Dividir migrations em chunks menores | Database Specialist |

### Dependencies
- **Internal:** Documentação do banco em `projeto/database/` (✅ Completa)
- **External:** Projeto Supabase criado e acessível via MCP
- **Technical:** MCP Supabase configurado e funcionando

### Assumptions
- O projeto Supabase já foi criado no dashboard
- As credenciais do MCP estão configuradas corretamente
- O schema `public` está vazio (projeto novo)

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Preparação | 15 minutos | 15 min | 1 pessoa |
| Phase 2 - Criação de Tabelas | 30 minutos | 30 min | 1 pessoa |
| Phase 3 - Funções e Triggers | 15 minutos | 15 min | 1 pessoa |
| Phase 4 - RLS Policies | 20 minutos | 20 min | 1 pessoa |
| Phase 5 - Seeds | 15 minutos | 15 min | 1 pessoa |
| Phase 6 - Validação | 15 minutos | 15 min | 1 pessoa |
| **Total** | **~2 horas** | **~2 horas** | **1 pessoa** |

### Required Skills
- Conhecimento de SQL/PostgreSQL
- Familiaridade com Supabase
- Uso do MCP Supabase

## Working Phases

### Phase 1 — Preparação e Verificação
**Objetivo:** Garantir que o ambiente está pronto para receber as migrations.

**Steps**
1. Verificar conexão com Supabase via MCP (`mcp_supabase_gapp_get_project_url`)
2. Listar tabelas existentes (`mcp_supabase_gapp_list_tables`) - deve estar vazio
3. Verificar extensões disponíveis (`mcp_supabase_gapp_list_extensions`)

**Commit Checkpoint**
- `git commit -m "chore(db): verify supabase connection ready for migrations"`

---

### Phase 2 — Criação das Tabelas
**Objetivo:** Criar todas as 33 tabelas do sistema.

**Steps**
1. Executar migration 001 via MCP (`mcp_supabase_gapp_apply_migration`)
   - Nome: `001_create_tables`
   - Conteúdo: `projeto/database/migrations/001_create_tables.sql`
2. Verificar tabelas criadas (`mcp_supabase_gapp_list_tables`)
3. Validar que todas as 33 tabelas existem

**Tabelas a criar (em ordem):**
```
1. departments
2. roles
3. profiles
4. user_roles
5. units
6. user_units
7. ticket_categories
8. tickets
9. ticket_comments
10. ticket_attachments
11. ticket_history
12. ticket_approvals
13. ticket_maintenance_details
14. ticket_maintenance_executions
15. ticket_purchase_details
16. ticket_quotations
17. accredited_suppliers
18. ticket_claim_details
19. claim_communications
20. claim_purchases
21. claim_purchase_items
22. claim_purchase_quotations
23. ticket_rh_details
24. uniforms
25. uniform_transactions
26. checklist_templates
27. checklist_questions
28. checklist_executions
29. checklist_answers
30. unit_checklist_templates
31. system_settings
32. audit_logs
```

**Commit Checkpoint**
- `git commit -m "chore(db): create all 33 tables via migration 001"`

---

### Phase 3 — Criação de Funções e Triggers
**Objetivo:** Implementar as 8 funções SQL e triggers automáticos.

**Steps**
1. Executar migration 002 via MCP (`mcp_supabase_gapp_apply_migration`)
   - Nome: `002_create_functions`
   - Conteúdo: `projeto/database/migrations/002_create_functions.sql`
2. Verificar funções criadas via query

**Funções a criar:**
```sql
1. is_admin() → boolean
2. is_rh() → boolean
3. is_invitation_expired(uuid) → boolean
4. soft_delete_user(uuid) → boolean
5. restore_deleted_user(uuid) → boolean
6. ticket_needs_approval(uuid, uuid) → boolean
7. create_ticket_approvals(uuid) → void
8. advance_ticket_approval(uuid, int, bool, text) → text
```

**Triggers a criar:**
```
- update_updated_at_column (em todas as tabelas com updated_at)
- log_ticket_changes_trigger (em tickets)
- update_uniform_stock_trigger (em uniform_transactions)
- check_non_conformities_trigger (em checklist_answers)
```

**Commit Checkpoint**
- `git commit -m "chore(db): create functions and triggers via migration 002"`

---

### Phase 4 — Configuração de RLS Policies
**Objetivo:** Ativar Row Level Security e criar policies de acesso.

**Steps**
1. Executar migration 003 via MCP (`mcp_supabase_gapp_apply_migration`)
   - Nome: `003_create_rls_policies`
   - Conteúdo: `projeto/database/migrations/003_create_rls_policies.sql`
2. Verificar advisors de segurança (`mcp_supabase_gapp_get_advisors`)
3. Validar que RLS está ativo em todas as tabelas

**Commit Checkpoint**
- `git commit -m "chore(db): enable RLS and create security policies via migration 003"`

---

### Phase 5 — Seeds de Dados Iniciais
**Objetivo:** Popular o banco com dados essenciais.

**Steps**
1. Seed 001 - Departamentos e Cargos (`mcp_supabase_gapp_execute_sql`)
   - Conteúdo: `projeto/database/seeds/001_departments_roles.sql`
   - Resultado esperado: 8 departamentos, ~30 cargos

2. Seed 002 - Usuário Admin
   - **IMPORTANTE:** Primeiro criar usuário no Supabase Auth (Dashboard)
   - Depois executar seed com UUID do usuário criado
   - Conteúdo: `projeto/database/seeds/002_admin_user.sql`

3. Seed 003 - Categorias de Chamados (`mcp_supabase_gapp_execute_sql`)
   - Conteúdo: `projeto/database/seeds/003_ticket_categories.sql`
   - Resultado esperado: ~50 categorias

4. Seed 004 - Template de Checklist (`mcp_supabase_gapp_execute_sql`)
   - Conteúdo: `projeto/database/seeds/004_checklist_template.sql`
   - Resultado esperado: 1 template com 15 perguntas

5. Seed 005 - Configurações do Sistema (`mcp_supabase_gapp_execute_sql`)
   - Conteúdo: `projeto/database/seeds/005_system_settings.sql`
   - Resultado esperado: ~15 configurações

**Commit Checkpoint**
- `git commit -m "chore(db): populate initial data via seeds"`

---

### Phase 6 — Validação e Handoff
**Objetivo:** Garantir que tudo está funcionando corretamente.

**Steps**
1. Gerar TypeScript types (`mcp_supabase_gapp_generate_typescript_types`)
2. Atualizar arquivo `database.types.ts` no projeto
3. Verificar advisors de segurança (`mcp_supabase_gapp_get_advisors`)
4. Testar queries básicas:
   - SELECT em profiles
   - SELECT em departments com roles
   - SELECT em units
5. Atualizar `.env.local` com novas credenciais
6. Testar aplicação localmente

**Commit Checkpoint**
- `git commit -m "chore(db): complete database setup and validation"`

## Rollback Plan

### Rollback Triggers
- Erro crítico em migration que corrompe dados
- RLS bloqueando todo acesso (inclusive admin)
- Funções com bugs que afetam integridade

### Rollback Procedures

#### Rollback Completo (Projeto Novo)
Se o projeto Supabase é novo e não tem dados importantes:
1. Deletar o projeto no Dashboard do Supabase
2. Criar novo projeto
3. Reiniciar do Phase 1

#### Rollback Parcial (Migration Específica)
```sql
-- Reverter RLS (Phase 4)
-- Desabilitar RLS em todas as tabelas
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ... repetir para todas as tabelas

-- Reverter Funções (Phase 3)
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_rh();
-- ... repetir para todas as funções

-- Reverter Tabelas (Phase 2)
-- CUIDADO: Isso apaga todos os dados!
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;
-- ... repetir para todas as tabelas em ordem reversa
```

### Post-Rollback Actions
1. Documentar o erro encontrado
2. Corrigir o script SQL problemático
3. Testar localmente antes de reaplicar
4. Reiniciar do phase que falhou

## Evidence & Follow-up

### Artifacts to Collect
- [ ] Screenshot do Dashboard Supabase mostrando tabelas criadas
- [ ] Output do `list_tables` mostrando 33 tabelas
- [ ] Output do `get_advisors` sem warnings críticos
- [ ] Arquivo `database.types.ts` atualizado
- [ ] Log de sucesso da aplicação conectando

### Follow-up Actions
| Action | Owner | Due Date |
| --- | --- | --- |
| Importar unidades do CSV | Database Specialist | Após setup |
| Criar usuários de teste | Admin | Após setup |
| Configurar backups automáticos | DevOps | 1 semana |
| Documentar processo de deploy | Documentation Writer | 1 semana |

## Quick Reference - MCP Commands

```bash
# Verificar conexão
mcp_supabase_gapp_get_project_url

# Listar tabelas
mcp_supabase_gapp_list_tables

# Aplicar migration
mcp_supabase_gapp_apply_migration
  - name: "001_create_tables"
  - query: "<SQL>"

# Executar SQL (seeds)
mcp_supabase_gapp_execute_sql
  - query: "<SQL>"

# Verificar segurança
mcp_supabase_gapp_get_advisors
  - type: "security"

# Gerar types
mcp_supabase_gapp_generate_typescript_types
```
