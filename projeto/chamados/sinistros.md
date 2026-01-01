# Módulo de Sinistros

O módulo de Sinistros é responsável pelo registro, acompanhamento e resolução de ocorrências envolvendo danos a veículos de clientes, danos à estrutura da unidade ou incidentes com terceiros.

## 1. Visão Geral

- **Departamento Destinatário**: Sinistros
- **Cargos Envolvidos**:
  - **Solicitantes**: Manobrista, Encarregado, Supervisor
  - **Responsáveis**: Supervisor de Sinistros, Gerente de Sinistros
- **Objetivo**: Centralizar a gestão de incidentes, garantir a coleta correta de evidências e agilizar o processo de ressarcimento ou reparo.

## 2. Fluxo de Status (Workflows)

O fluxo segue a lógica padrão de chamados, mas com status específicos para a natureza de sinistros:

1. **Aguardando Triagem**: Chamado recém-criado pela unidade.
2. **Em Análise**: Departamento de Sinistros revisando a documentação e fotos enviadas.
3. **Em Investigação**: Verificação de câmeras de segurança, depoimentos e perícia interna.
4. **Aguardando Cliente**: Pendência de envio de documentos ou assinatura de termo pelo cliente.
5. **Aguardando Orçamentos**: Processo de cotação de reparo em oficinas credenciadas.
6. **Em Reparo**: Veículo ou estrutura em processo de conserto.
7. **Aguardando Pagamento**: Reparo concluído, aguardando liquidação financeira (franquia ou valor total).
8. **Resolvido**: Incidente finalizado com sucesso.
9. **Negado**: Sinistro recusado após análise (ex: dano pré-existente).
10. **Fechado**: Processo arquivado.

## 3. Campos de Abertura (Formulário)

Além dos campos padrão de chamado (Título, Descrição, Unidade), o formulário de Sinistros coleta:

### Dados da Ocorrência
- **Tipo de Sinistro**: Veículo de Cliente, Veículo de Terceiro, Estrutura da Unidade, Equipamento, Pessoa/Acidente
- **Data da Ocorrência**: Data exata do fato
- **Hora da Ocorrência**: Hora exata do fato
- **Local Específico**: Onde na unidade ocorreu (ex: Vaga 42, Rampa de acesso)
- **Boletim de Ocorrência (B.O.)**: Número e data (se houver)

### Dados do Veículo / Bem Afetado
- **Placa**: String
- **Marca**: String
- **Modelo**: String
- **Cor**: String
- **Ano**: Número

### Dados do Cliente / Envolvido
- **Nome Completo**: String
- **Telefone**: String
- **Email**: String
- **CPF**: String

### Dados de Terceiros (Opcional)
- **Houve Terceiro Envolvido?**: Sim/Não
- **Nome do Terceiro**: String
- **Telefone do Terceiro**: String
- **Placa do Veículo Terceiro**: String
- **Informações Adicionais**: JSONB (flexível)

### Valores e Responsabilidade
- **Valor Estimado do Dano**: Decimal
- **Custo Final do Reparo**: Decimal
- **Valor da Franquia**: Decimal
- **Responsabilidade da Empresa**: Decimal
- **Determinação de Responsabilidade**: Texto

### Resolução
- **Tipo de Resolução**: Texto
- **Notas de Resolução**: Texto
- **Avaliação de Satisfação do Cliente**: 1-5

### Evidências (Anexos)
- **Fotos do Dano**: Mínimo de 3 fotos recomendadas (categoria: damage_photos)
- **Foto do Ticket de Estacionamento**: Comprovação de entrada (categoria: parking_ticket)
- **Foto da CNH/Documento do Cliente**: Para registro (categoria: customer_document)
- **Boletim de Ocorrência**: Documento digitalizado (categoria: police_report)
- **Outros Documentos**: Documentos adicionais (categoria: other)

## 4. Estrutura de Banco de Dados

### Tabelas Implementadas

#### `ticket_claim_details`
Detalhes específicos do sinistro vinculados ao ticket.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| ticket_id | UUID | FK para tickets |
| occurrence_type | TEXT | Tipo de ocorrência |
| occurrence_date | TIMESTAMPTZ | Data da ocorrência |
| occurrence_time | TIME | Hora da ocorrência |
| location_description | TEXT | Local específico |
| police_report_number | TEXT | Número do B.O. |
| police_report_date | DATE | Data do B.O. |
| vehicle_plate | TEXT | Placa do veículo |
| vehicle_make | TEXT | Marca |
| vehicle_model | TEXT | Modelo |
| vehicle_color | TEXT | Cor |
| vehicle_year | INTEGER | Ano |
| customer_name | TEXT | Nome do cliente |
| customer_phone | TEXT | Telefone |
| customer_email | TEXT | Email |
| customer_cpf | TEXT | CPF |
| has_third_party | BOOLEAN | Há terceiro envolvido |
| third_party_name | TEXT | Nome do terceiro |
| third_party_phone | TEXT | Telefone do terceiro |
| third_party_plate | TEXT | Placa do terceiro |
| third_party_info | JSONB | Info adicional |
| estimated_damage_value | NUMERIC | Valor estimado |
| final_repair_cost | NUMERIC | Custo final |
| deductible_value | NUMERIC | Franquia |
| company_liability | NUMERIC | Responsabilidade empresa |
| liability_determination | TEXT | Determinação |
| resolution_type | TEXT | Tipo de resolução |
| resolution_notes | TEXT | Notas |
| customer_satisfaction_rating | INTEGER | Avaliação 1-5 |
| related_maintenance_ticket_id | UUID | FK para ticket de manutenção |

#### `accredited_suppliers`
Fornecedores credenciados para reparos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| name | TEXT | Nome do fornecedor |
| cnpj | TEXT | CNPJ |
| category | TEXT | Categoria (funilaria, mecânica, etc) |
| contact_name | TEXT | Nome do contato |
| contact_phone | TEXT | Telefone |
| contact_email | TEXT | Email |
| address | TEXT | Endereço |
| city | TEXT | Cidade |
| state | TEXT | Estado |
| is_active | BOOLEAN | Ativo |
| rating | NUMERIC | Avaliação média |
| notes | TEXT | Observações |

#### `claim_purchases`
Compras internas do sinistro (peças, serviços).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| claim_detail_id | UUID | FK para ticket_claim_details |
| title | TEXT | Título da compra |
| description | TEXT | Descrição |
| status | TEXT | Status (pending, approved, rejected, completed) |
| assigned_to | UUID | Responsável |
| created_by | UUID | Criador |
| approved_by | UUID | Aprovador |
| approved_at | TIMESTAMPTZ | Data aprovação |
| total_value | NUMERIC | Valor total |
| selected_quotation_id | UUID | Cotação selecionada |

#### `claim_purchase_items`
Itens de cada compra interna.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| purchase_id | UUID | FK para claim_purchases |
| description | TEXT | Descrição do item |
| quantity | INTEGER | Quantidade |
| unit_price | NUMERIC | Preço unitário |
| total_price | NUMERIC | Preço total |

#### `claim_purchase_quotations`
Cotações para compras internas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| purchase_id | UUID | FK para claim_purchases |
| supplier_id | UUID | FK para accredited_suppliers |
| supplier_name | TEXT | Nome (se não credenciado) |
| total_value | NUMERIC | Valor total |
| delivery_days | INTEGER | Prazo de entrega |
| notes | TEXT | Observações |
| status | TEXT | Status |
| is_selected | BOOLEAN | É a cotação selecionada |
| created_by | UUID | Criador |

#### `claim_communications`
Comunicações com o cliente.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | Chave primária |
| claim_detail_id | UUID | FK para ticket_claim_details |
| communication_type | TEXT | Tipo (phone, email, whatsapp, in_person) |
| communication_date | TIMESTAMPTZ | Data/hora |
| summary | TEXT | Resumo |
| customer_response | TEXT | Resposta do cliente |
| next_contact_date | DATE | Próximo contato |
| created_by | UUID | Criador |

### Categorias de Sinistros

| ID | Nome | Status |
|----|------|--------|
| 51bb8248-... | Veículo de Cliente | active |
| 103cbb4f-... | Veículo de Terceiro | active |
| fd8f216f-... | Estrutura da Unidade | active |
| 2bc98756-... | Equipamento | active |
| db6a0036-... | Pessoa/Acidente | active |

## 5. Regras de Negócio (RBAC)

### Permissões Implementadas
- **Unidade**: Só visualiza os sinistros da sua própria unidade
- **Departamento de Sinistros**: Visualiza todos os sinistros de todas as unidades
- **Aprovação de Compras**: Gerente de Sinistros aprova compras internas
- **Fornecedores Credenciados**: Apenas Administradores podem gerenciar

### RLS (Row Level Security)
Todas as tabelas de sinistros têm RLS habilitado:
- ✅ `ticket_claim_details`
- ✅ `accredited_suppliers`
- ✅ `claim_purchases`
- ✅ `claim_purchase_items`
- ✅ `claim_purchase_quotations`
- ✅ `claim_communications`

## 6. Integração com Manutenção

Sinistros podem gerar tickets de manutenção através do campo `related_maintenance_ticket_id`. Isso permite:
- Vincular reparos estruturais a sinistros
- Rastrear custos de manutenção relacionados
- Manter histórico completo do incidente

## 7. Status de Implementação

### Backend (Supabase/Database) ✅
- [x] Criar migração para a tabela `ticket_claim_details`
- [x] Criar migração para `accredited_suppliers`
- [x] Criar migração para `claim_purchases` e tabelas relacionadas
- [x] Criar migração para `claim_communications`
- [x] Configurar RLS (Row Level Security) para todas as tabelas
- [x] Inserir categorias iniciais de sinistros
- [x] Corrigir Security Advisors (views e funções)

### Frontend (Aplicação Web) 🔄
- [x] Criar schema de validação Zod para o formulário de sinistros
- [x] Desenvolver componente de formulário específico `ClaimTicketForm`
- [x] Integrar formulário na página de "Novo Chamado"
- [x] Criar visualização de detalhes específica para sinistros
- [ ] Implementar listagem filtrada para o departamento de Sinistros
- [ ] Adicionar seção de evidências com preview de imagens
- [ ] Implementar sistema de compras internas
- [ ] Implementar comunicações com cliente

### Documentação e Testes 🔄
- [x] Documentar estrutura de banco de dados
- [x] Documentar fluxo de status
- [ ] Realizar testes de fluxo completo (Abertura -> Triagem -> Resolução)
- [ ] Validar permissões de acesso por perfil

---
*Este documento foi atualizado em 31/12/2024 com o estado final da implementação.*
*Projeto GarageInn - Entrega 2*
