# Documentação do Banco de Dados - GarageInn App

Esta pasta contém a documentação completa do banco de dados do sistema GarageInn, incluindo estrutura de tabelas, relacionamentos, funções e scripts para recriação.

## 📁 Estrutura da Documentação

| Arquivo | Descrição |
|---------|-----------|
| [schema.md](./schema.md) | Estrutura completa de todas as tabelas |
| [relationships.md](./relationships.md) | Diagrama e descrição dos relacionamentos |
| [functions.md](./functions.md) | Funções SQL e stored procedures |
| [migrations/](./migrations/) | Scripts SQL para criar o banco do zero |
| [seeds/](./seeds/) | Dados iniciais (departamentos, cargos, etc.) |

## 🗄️ Visão Geral do Banco

- **Banco de Dados**: PostgreSQL (via Supabase)
- **Schema**: `public`
- **Total de Tabelas**: 33
- **Funções**: 8

## 📊 Grupos de Tabelas

### 🔐 Autenticação e Usuários
- `profiles` - Perfis de usuários
- `departments` - Departamentos
- `roles` - Cargos
- `user_roles` - Vínculo usuário-cargo
- `user_units` - Vínculo usuário-unidade

### 🏢 Unidades
- `units` - Unidades/Garagens

### 📋 Chamados (Tickets)
- `tickets` - Chamados principais
- `ticket_categories` - Categorias de chamados
- `ticket_comments` - Comentários
- `ticket_attachments` - Anexos
- `ticket_history` - Histórico de alterações
- `ticket_approvals` - Aprovações

### 🔧 Chamados - Manutenção
- `ticket_maintenance_details` - Detalhes de manutenção
- `ticket_maintenance_executions` - Execuções de manutenção

### 🛒 Chamados - Compras
- `ticket_purchase_details` - Detalhes de compras
- `ticket_quotations` - Cotações

### 🚗 Chamados - Sinistros
- `ticket_claim_details` - Detalhes de sinistros
- `claim_communications` - Comunicações com cliente
- `claim_purchases` - Compras de sinistros
- `claim_purchase_items` - Itens de compras
- `claim_purchase_quotations` - Cotações de compras
- `accredited_suppliers` - Fornecedores credenciados

### 👔 Chamados - RH
- `ticket_rh_details` - Detalhes de RH
- `uniforms` - Uniformes
- `uniform_transactions` - Transações de uniformes

### ✅ Checklists
- `checklist_templates` - Templates de checklists
- `checklist_questions` - Perguntas
- `checklist_executions` - Execuções
- `checklist_answers` - Respostas
- `unit_checklist_templates` - Templates por unidade

### ⚙️ Sistema
- `system_settings` - Configurações do sistema
- `audit_logs` - Logs de auditoria

## 🚀 Como Recriar o Banco

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Execute os scripts na ordem:
   ```bash
   # 1. Criar tabelas
   migrations/001_create_tables.sql
   
   # 2. Criar funções
   migrations/002_create_functions.sql
   
   # 3. Configurar RLS
   migrations/003_create_rls_policies.sql
   
   # 4. Inserir dados iniciais
   seeds/001_departments_roles.sql
   seeds/002_admin_user.sql
   ```

3. Atualize as variáveis de ambiente no projeto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
   ```

## 📝 Notas Importantes

- O arquivo `database.types.ts` em `apps/web/src/lib/supabase/` é gerado automaticamente pelo Supabase CLI
- Após alterações no schema, regenere os tipos com: `npx supabase gen types typescript`
- Sempre teste migrações em ambiente de staging antes de produção

## 🔗 Referências

- [PRD do Projeto](../PRD.md)
- [Departamentos e Cargos](../usuarios/departamentos_cargos.md)
- [Supabase Documentation](https://supabase.com/docs)
