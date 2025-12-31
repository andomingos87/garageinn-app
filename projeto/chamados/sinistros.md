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

Além dos campos padrão de chamado (Título, Descrição, Unidade), o formulário de Sinistros deve coletar:

### Dados da Ocorrência
- **Tipo de Sinistro**: Colisão, Furto/Roubo, Vandalismo, Dano Parcial, Dano Total, Queda de Objeto, Terceiro.
- **Data e Hora da Ocorrência**: Data/Hora exata do fato.
- **Local Específico**: Onde na unidade ocorreu (ex: Vaga 42, Rampa de acesso).
- **Boletim de Ocorrência (B.O.)**: Número (se houver).

### Dados do Veículo / Bem Afetado
- **Placa**: String
- **Marca/Modelo**: String
- **Cor**: String
- **Ano**: Número

### Dados do Cliente / Envolvido
- **Nome Completo**: String
- **Telefone**: String
- **Email**: String

### Dados de Terceiros (Opcional)
- **Houve Terceiro Envolvido?**: Sim/Não
- **Nome do Terceiro**: String
- **Telefone do Terceiro**: String
- **Placa do Veículo Terceiro**: String

### Evidências (Anexos)
- **Fotos do Dano**: Mínimo de 3 fotos recomendadas.
- **Foto do Ticket de Estacionamento**: Comprovação de entrada.
- **Foto da CNH/Documento do Cliente**: Para registro.

## 4. Requisitos Técnicos

### Banco de Dados
Nova tabela `ticket_claim_details` vinculada a `tickets`:

```sql
CREATE TABLE ticket_claim_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  occurrence_type TEXT NOT NULL,
  occurrence_date TIMESTAMPTZ NOT NULL,
  location_description TEXT,
  vehicle_plate TEXT,
  vehicle_make_model TEXT,
  vehicle_color TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  has_third_party BOOLEAN DEFAULT FALSE,
  third_party_info JSONB,
  police_report_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Regras de Negócio (RBAC)
- **Unidade**: Só visualiza os sinistros da sua própria unidade.
- **Departamento de Sinistros**: Visualiza todos os sinistros de todas as unidades.
- **Aprovação**: Sinistros não passam pela cadeia de aprovação de Operações (seguem direto para triagem do departamento).

## 5. Lista de Tarefas (To-do List)

### Backend (Supabase/Database)
- [ ] Criar migração para a tabela `ticket_claim_details`.
- [ ] Configurar RLS (Row Level Security) para a nova tabela.
- [ ] Inserir categorias iniciais de sinistros na tabela `ticket_categories`.
- [ ] Gerar novos tipos TypeScript.

### Frontend (Aplicação Web)
- [ ] Criar schema de validação Zod para o formulário de sinistros.
- [ ] Desenvolver componente de formulário específico `ClaimTicketForm`.
- [ ] Integrar formulário na página de "Novo Chamado".
- [ ] Criar visualização de detalhes específica para sinistros `ClaimTicketDetails`.
- [ ] Implementar listagem filtrada para o departamento de Sinistros.
- [ ] Adicionar seção de evidências com preview de imagens.

### Documentação e Testes
- [ ] Atualizar o README do projeto com o novo módulo.
- [ ] Realizar testes de fluxo completo (Abertura -> Triagem -> Resolução).
- [ ] Validar permissões de acesso por perfil.

---
*Este plano segue as diretrizes do projeto GarageInn - Entrega 2.*

