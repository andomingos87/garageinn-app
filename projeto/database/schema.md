# Schema do Banco de Dados

Documentação completa de todas as tabelas do sistema GarageInn.

---

## 🔐 Autenticação e Usuários

### profiles
Perfis de usuários do sistema. Vinculado ao `auth.users` do Supabase.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | - | PK, referência ao auth.users |
| email | text | ✅ | - | Email único do usuário |
| full_name | text | ✅ | - | Nome completo |
| cpf | text | ❌ | null | CPF (único quando preenchido) |
| phone | text | ❌ | null | Telefone |
| avatar_url | text | ❌ | null | URL da foto de perfil |
| status | text | ❌ | 'pending' | Status: active, inactive, pending |
| invitation_sent_at | timestamptz | ❌ | null | Data de envio do convite |
| invitation_expires_at | timestamptz | ❌ | null | Data de expiração do convite |
| deleted_at | timestamptz | ❌ | null | Soft delete |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### departments
Departamentos da empresa.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| name | text | ✅ | - | Nome do departamento |
| created_at | timestamptz | ❌ | now() | Data de criação |

**Valores esperados:**
- Operações
- Compras e Manutenção
- Financeiro
- RH
- Sinistros
- Comercial
- Auditoria
- TI

---

### roles
Cargos do sistema.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| name | text | ✅ | - | Nome do cargo |
| department_id | uuid | ❌ | null | FK para departments (null = cargo global) |
| is_global | boolean | ❌ | false | Se é cargo global (sem departamento) |
| created_at | timestamptz | ❌ | now() | Data de criação |

**Cargos Globais (is_global = true):**
- Desenvolvedor
- Diretor
- Administrador

---

### user_roles
Vínculo entre usuários e cargos (N:N).

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| user_id | uuid | ✅ | - | FK para profiles |
| role_id | uuid | ✅ | - | FK para roles |
| created_at | timestamptz | ❌ | now() | Data de criação |

**Constraint:** UNIQUE(user_id, role_id)

---

### user_units
Vínculo entre usuários e unidades.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| user_id | uuid | ✅ | - | FK para profiles |
| unit_id | uuid | ✅ | - | FK para units |
| is_coverage | boolean | ❌ | false | Se é unidade de cobertura (Supervisor) |
| created_at | timestamptz | ❌ | now() | Data de criação |

**Constraint:** UNIQUE(user_id, unit_id)

---

## 🏢 Unidades

### units
Unidades/Garagens da rede.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| code | text | ✅ | - | Código único da unidade |
| name | text | ✅ | - | Nome da unidade |
| address | text | ✅ | - | Endereço completo |
| neighborhood | text | ❌ | null | Bairro |
| city | text | ❌ | null | Cidade |
| state | text | ❌ | null | Estado (UF) |
| zip_code | text | ❌ | null | CEP |
| phone | text | ❌ | null | Telefone |
| email | text | ❌ | null | Email |
| cnpj | text | ❌ | null | CNPJ |
| capacity | integer | ❌ | null | Capacidade de vagas |
| region | text | ❌ | null | Região |
| administrator | text | ❌ | null | Nome do administrador |
| supervisor_name | text | ❌ | null | Nome do supervisor |
| status | text | ✅ | 'active' | Status: active, inactive |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

## 📋 Chamados (Tickets)

### tickets
Tabela principal de chamados.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_number | serial | ✅ | auto | Número sequencial do chamado |
| title | text | ✅ | - | Título do chamado |
| description | text | ✅ | - | Descrição detalhada |
| status | text | ✅ | 'awaiting_triage' | Status do chamado |
| priority | text | ❌ | null | Prioridade: low, medium, high, urgent |
| perceived_urgency | text | ❌ | null | Urgência percebida pelo solicitante |
| department_id | uuid | ✅ | - | FK para departments (destino) |
| category_id | uuid | ❌ | null | FK para ticket_categories |
| unit_id | uuid | ❌ | null | FK para units |
| created_by | uuid | ✅ | - | FK para profiles (solicitante) |
| assigned_to | uuid | ❌ | null | FK para profiles (responsável) |
| due_date | date | ❌ | null | Data prevista de conclusão |
| denial_reason | text | ❌ | null | Motivo da negação |
| resolved_at | timestamptz | ❌ | null | Data de resolução |
| closed_at | timestamptz | ❌ | null | Data de fechamento |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

**Status possíveis:**
- `awaiting_approval` - Aguardando aprovações internas
- `awaiting_triage` - Aguardando triagem
- `prioritized` - Priorizado
- `in_progress` - Em andamento
- `awaiting_return` - Aguardando retorno
- `resolved` - Resolvido
- `closed` - Fechado
- `denied` - Negado
- `cancelled` - Cancelado

---

### ticket_categories
Categorias de chamados por departamento.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| name | text | ✅ | - | Nome da categoria |
| department_id | uuid | ✅ | - | FK para departments |
| status | text | ✅ | 'active' | Status: active, inactive |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### ticket_comments
Comentários em chamados.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets |
| user_id | uuid | ✅ | - | FK para profiles |
| content | text | ✅ | - | Conteúdo do comentário |
| is_internal | boolean | ❌ | false | Se é comentário interno |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### ticket_attachments
Anexos de chamados.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets |
| comment_id | uuid | ❌ | null | FK para ticket_comments |
| file_name | text | ✅ | - | Nome do arquivo |
| file_path | text | ✅ | - | Caminho no storage |
| file_type | text | ✅ | - | MIME type |
| file_size | integer | ✅ | - | Tamanho em bytes |
| category | text | ❌ | null | Categoria do anexo |
| uploaded_by | uuid | ✅ | - | FK para profiles |
| created_at | timestamptz | ❌ | now() | Data de upload |

---

### ticket_history
Histórico de alterações em chamados.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets |
| user_id | uuid | ✅ | - | FK para profiles |
| action | text | ✅ | - | Ação realizada |
| old_value | text | ❌ | null | Valor anterior |
| new_value | text | ❌ | null | Novo valor |
| metadata | jsonb | ❌ | null | Dados adicionais |
| created_at | timestamptz | ❌ | now() | Data da ação |

---

### ticket_approvals
Aprovações de chamados (fluxo Operações → Compras/Manutenção).

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets |
| approval_level | integer | ✅ | - | Nível: 1=Encarregado, 2=Supervisor, 3=Gerente |
| approval_role | text | ✅ | - | Cargo aprovador |
| status | text | ✅ | 'pending' | Status: pending, approved, denied |
| approved_by | uuid | ❌ | null | FK para profiles |
| decision_at | timestamptz | ❌ | null | Data da decisão |
| notes | text | ❌ | null | Observações |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

## 🔧 Chamados - Manutenção

### ticket_maintenance_details
Detalhes específicos de chamados de manutenção.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets (UNIQUE) |
| maintenance_type | text | ❌ | null | Tipo de manutenção |
| subject_id | uuid | ❌ | null | FK para categoria/assunto |
| location_description | text | ❌ | null | Descrição do local |
| equipment_affected | text | ❌ | null | Equipamento afetado |
| completion_notes | text | ❌ | null | Notas de conclusão |
| completion_rating | integer | ❌ | null | Avaliação (1-5) |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### ticket_maintenance_executions
Execuções de manutenção.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets |
| unit_id | uuid | ❌ | null | FK para units |
| description | text | ✅ | - | Descrição da execução |
| status | text | ✅ | 'pending' | Status da execução |
| assigned_to | uuid | ❌ | null | FK para profiles |
| supplier_name | text | ❌ | null | Nome do fornecedor |
| supplier_contact | text | ❌ | null | Contato do fornecedor |
| materials_needed | text | ❌ | null | Materiais necessários |
| estimated_cost | numeric | ❌ | null | Custo estimado |
| actual_cost | numeric | ❌ | null | Custo real |
| start_date | date | ❌ | null | Data de início |
| estimated_end_date | date | ❌ | null | Previsão de término |
| actual_end_date | date | ❌ | null | Data real de término |
| notes | text | ❌ | null | Observações |
| created_by | uuid | ✅ | - | FK para profiles |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

## 🛒 Chamados - Compras

### ticket_purchase_details
Detalhes específicos de chamados de compras.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets (UNIQUE) |
| item_name | text | ✅ | - | Nome do item |
| quantity | integer | ✅ | - | Quantidade |
| unit_of_measure | text | ❌ | null | Unidade de medida |
| estimated_price | numeric | ❌ | null | Preço estimado |
| delivery_address | text | ❌ | null | Endereço de entrega |
| delivery_date | date | ❌ | null | Data de entrega |
| delivery_notes | text | ❌ | null | Observações de entrega |
| delivery_confirmed_at | timestamptz | ❌ | null | Confirmação de entrega |
| delivery_rating | integer | ❌ | null | Avaliação da entrega (1-5) |
| approved_quotation_id | uuid | ❌ | null | FK para ticket_quotations |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### ticket_quotations
Cotações de chamados de compras.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets |
| supplier_name | text | ✅ | - | Nome do fornecedor |
| supplier_cnpj | text | ❌ | null | CNPJ do fornecedor |
| supplier_contact | text | ❌ | null | Contato do fornecedor |
| quantity | integer | ✅ | - | Quantidade cotada |
| unit_price | numeric | ✅ | - | Preço unitário |
| total_price | numeric | ✅ | - | Preço total |
| payment_terms | text | ❌ | null | Condições de pagamento |
| delivery_deadline | date | ❌ | null | Prazo de entrega |
| validity_date | date | ❌ | null | Validade da cotação |
| supplier_response_date | date | ❌ | null | Data de resposta |
| notes | text | ❌ | null | Observações |
| status | text | ✅ | 'pending' | Status: pending, approved, rejected |
| is_selected | boolean | ❌ | false | Se foi selecionada |
| created_by | uuid | ✅ | - | FK para profiles |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

## 🚗 Chamados - Sinistros

### ticket_claim_details
Detalhes específicos de chamados de sinistros.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets (UNIQUE) |
| occurrence_type | text | ✅ | - | Tipo de ocorrência |
| occurrence_date | date | ✅ | - | Data da ocorrência |
| occurrence_time | time | ❌ | null | Hora da ocorrência |
| location_description | text | ❌ | null | Descrição do local |
| vehicle_plate | text | ❌ | null | Placa do veículo |
| vehicle_make | text | ❌ | null | Marca do veículo |
| vehicle_model | text | ❌ | null | Modelo do veículo |
| vehicle_color | text | ❌ | null | Cor do veículo |
| vehicle_year | integer | ❌ | null | Ano do veículo |
| customer_name | text | ❌ | null | Nome do cliente |
| customer_cpf | text | ❌ | null | CPF do cliente |
| customer_phone | text | ❌ | null | Telefone do cliente |
| customer_email | text | ❌ | null | Email do cliente |
| has_third_party | boolean | ❌ | false | Se há terceiro envolvido |
| third_party_name | text | ❌ | null | Nome do terceiro |
| third_party_phone | text | ❌ | null | Telefone do terceiro |
| third_party_plate | text | ❌ | null | Placa do terceiro |
| third_party_info | jsonb | ❌ | null | Informações adicionais |
| police_report_number | text | ❌ | null | Número do B.O. |
| police_report_date | date | ❌ | null | Data do B.O. |
| estimated_damage_value | numeric | ❌ | null | Valor estimado do dano |
| deductible_value | numeric | ❌ | null | Valor da franquia |
| company_liability | numeric | ❌ | null | Responsabilidade da empresa (%) |
| liability_determination | text | ❌ | null | Determinação de responsabilidade |
| resolution_type | text | ❌ | null | Tipo de resolução |
| resolution_notes | text | ❌ | null | Notas de resolução |
| final_repair_cost | numeric | ❌ | null | Custo final do reparo |
| customer_satisfaction_rating | integer | ❌ | null | Avaliação do cliente (1-5) |
| related_maintenance_ticket_id | uuid | ❌ | null | FK para ticket relacionado |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

**Tipos de ocorrência:**
- `vehicle_customer` - Veículo de Cliente
- `vehicle_third_party` - Veículo de Terceiro
- `structure` - Estrutura da Unidade
- `equipment` - Equipamento
- `person_accident` - Pessoa/Acidente

---

### claim_communications
Comunicações com cliente em sinistros.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| claim_details_id | uuid | ✅ | - | FK para ticket_claim_details |
| channel | text | ✅ | - | Canal: phone, email, whatsapp, in_person |
| communication_date | timestamptz | ✅ | now() | Data da comunicação |
| summary | text | ✅ | - | Resumo da comunicação |
| next_contact_date | date | ❌ | null | Próximo contato |
| created_by | uuid | ✅ | - | FK para profiles |
| created_at | timestamptz | ❌ | now() | Data de criação |

---

### claim_purchases
Compras internas de sinistros.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| claim_details_id | uuid | ✅ | - | FK para ticket_claim_details |
| purchase_number | serial | ✅ | auto | Número sequencial |
| title | text | ✅ | - | Título da compra |
| description | text | ❌ | null | Descrição |
| status | text | ✅ | 'draft' | Status da compra |
| estimated_total | numeric | ❌ | null | Total estimado |
| approved_total | numeric | ❌ | null | Total aprovado |
| assigned_to | uuid | ❌ | null | FK para profiles |
| due_date | date | ❌ | null | Data limite |
| approved_by | uuid | ❌ | null | FK para profiles |
| approved_at | timestamptz | ❌ | null | Data de aprovação |
| rejection_reason | text | ❌ | null | Motivo de rejeição |
| selected_quotation_id | uuid | ❌ | null | FK para cotação selecionada |
| completed_at | timestamptz | ❌ | null | Data de conclusão |
| created_by | uuid | ✅ | - | FK para profiles |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### claim_purchase_items
Itens de compras de sinistros.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| claim_purchase_id | uuid | ✅ | - | FK para claim_purchases |
| item_name | text | ✅ | - | Nome do item |
| description | text | ❌ | null | Descrição |
| quantity | integer | ✅ | 1 | Quantidade |
| unit_of_measure | text | ❌ | null | Unidade de medida |
| estimated_unit_price | numeric | ❌ | null | Preço unitário estimado |
| final_unit_price | numeric | ❌ | null | Preço unitário final |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### claim_purchase_quotations
Cotações de compras de sinistros.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| claim_purchase_id | uuid | ✅ | - | FK para claim_purchases |
| supplier_id | uuid | ❌ | null | FK para accredited_suppliers |
| supplier_name | text | ✅ | - | Nome do fornecedor |
| supplier_cnpj | text | ❌ | null | CNPJ |
| supplier_contact | text | ❌ | null | Contato |
| supplier_phone | text | ❌ | null | Telefone |
| total_price | numeric | ✅ | - | Preço total |
| items_breakdown | jsonb | ❌ | null | Detalhamento por item |
| payment_terms | text | ❌ | null | Condições de pagamento |
| delivery_deadline | date | ❌ | null | Prazo de entrega |
| validity_date | date | ❌ | null | Validade |
| notes | text | ❌ | null | Observações |
| status | text | ✅ | 'pending' | Status |
| is_selected | boolean | ❌ | false | Se foi selecionada |
| created_by | uuid | ✅ | - | FK para profiles |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### accredited_suppliers
Fornecedores credenciados para sinistros.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| name | text | ✅ | - | Nome do fornecedor |
| cnpj | text | ❌ | null | CNPJ |
| category | text | ❌ | null | Categoria |
| contact_name | text | ❌ | null | Nome do contato |
| phone | text | ❌ | null | Telefone |
| email | text | ❌ | null | Email |
| address | text | ❌ | null | Endereço |
| notes | text | ❌ | null | Observações |
| is_active | boolean | ❌ | true | Se está ativo |
| created_by | uuid | ❌ | null | FK para profiles |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

## 👔 Chamados - RH

### ticket_rh_details
Detalhes específicos de chamados de RH.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| ticket_id | uuid | ✅ | - | FK para tickets (UNIQUE) |
| rh_type | text | ✅ | - | Tipo de solicitação RH |
| withdrawal_reason | text | ❌ | null | Motivo de retirada (uniformes) |
| specific_fields | jsonb | ❌ | null | Campos específicos por tipo |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

**Tipos de RH:**
- `uniform_request` - Solicitação de uniforme
- `personnel_request` - Solicitação de pessoal
- `salary_issue` - Questão salarial
- `benefits` - Benefícios (VR/VT)
- `general` - Geral

---

### uniforms
Cadastro de uniformes.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| name | text | ✅ | - | Nome do uniforme |
| type | text | ❌ | null | Tipo (camisa, calça, etc.) |
| size | text | ❌ | null | Tamanho |
| description | text | ❌ | null | Descrição |
| current_stock | integer | ❌ | 0 | Estoque atual |
| min_stock | integer | ❌ | 0 | Estoque mínimo |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### uniform_transactions
Transações de uniformes (entrada/saída).

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| uniform_id | uuid | ✅ | - | FK para uniforms |
| type | text | ✅ | - | Tipo: entry, withdrawal |
| quantity | integer | ✅ | - | Quantidade |
| user_id | uuid | ❌ | null | FK para profiles (quem retirou) |
| unit_id | uuid | ❌ | null | FK para units |
| ticket_id | uuid | ❌ | null | FK para tickets |
| created_at | timestamptz | ❌ | now() | Data da transação |

---

## ✅ Checklists

### checklist_templates
Templates de checklists.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| name | text | ✅ | - | Nome do template |
| description | text | ❌ | null | Descrição |
| type | text | ✅ | 'opening' | Tipo: opening, supervision |
| is_default | boolean | ❌ | false | Se é template padrão |
| status | text | ✅ | 'active' | Status: active, inactive |
| created_by | uuid | ❌ | null | FK para profiles |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### checklist_questions
Perguntas de checklists.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| template_id | uuid | ✅ | - | FK para checklist_templates |
| question_text | text | ✅ | - | Texto da pergunta |
| order_index | integer | ✅ | - | Ordem de exibição |
| is_required | boolean | ❌ | true | Se é obrigatória |
| requires_observation_on_no | boolean | ❌ | false | Exige observação se "Não" |
| status | text | ✅ | 'active' | Status: active, inactive |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### checklist_executions
Execuções de checklists.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| template_id | uuid | ✅ | - | FK para checklist_templates |
| unit_id | uuid | ✅ | - | FK para units |
| executed_by | uuid | ✅ | - | FK para profiles |
| status | text | ✅ | 'in_progress' | Status: in_progress, completed |
| started_at | timestamptz | ✅ | now() | Início da execução |
| completed_at | timestamptz | ❌ | null | Fim da execução |
| general_observations | text | ❌ | null | Observações gerais |
| has_non_conformities | boolean | ❌ | false | Se tem não-conformidades |
| created_at | timestamptz | ❌ | now() | Data de criação |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

---

### checklist_answers
Respostas de checklists.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| execution_id | uuid | ✅ | - | FK para checklist_executions |
| question_id | uuid | ✅ | - | FK para checklist_questions |
| answer | boolean | ✅ | - | Resposta (Sim/Não) |
| observation | text | ❌ | null | Observação |
| created_at | timestamptz | ❌ | now() | Data da resposta |

**Constraint:** UNIQUE(execution_id, question_id)

---

### unit_checklist_templates
Vínculo entre unidades e templates de checklist.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| unit_id | uuid | ✅ | - | FK para units |
| template_id | uuid | ✅ | - | FK para checklist_templates |
| created_at | timestamptz | ❌ | now() | Data de criação |

**Constraint:** UNIQUE(unit_id, template_id)

---

## ⚙️ Sistema

### system_settings
Configurações do sistema.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| key | text | ✅ | - | Chave única da configuração |
| value | jsonb | ✅ | - | Valor da configuração |
| description | text | ❌ | null | Descrição |
| updated_by | uuid | ❌ | null | FK para profiles |
| updated_at | timestamptz | ❌ | now() | Data de atualização |

**Constraint:** UNIQUE(key)

---

### audit_logs
Logs de auditoria do sistema.

| Coluna | Tipo | Obrigatório | Default | Descrição |
|--------|------|-------------|---------|-----------|
| id | uuid | ✅ | gen_random_uuid() | PK |
| entity_type | text | ✅ | - | Tipo da entidade |
| entity_id | uuid | ✅ | - | ID da entidade |
| action | text | ✅ | - | Ação: create, update, delete |
| old_data | jsonb | ❌ | null | Dados anteriores |
| new_data | jsonb | ❌ | null | Novos dados |
| metadata | jsonb | ❌ | null | Metadados adicionais |
| user_id | uuid | ❌ | null | FK para profiles |
| created_at | timestamptz | ❌ | now() | Data do log |
