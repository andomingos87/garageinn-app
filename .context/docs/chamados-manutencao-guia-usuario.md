# Guia do Usuário: Chamados de Manutenção

Este guia explica como utilizar o módulo de Chamados de Manutenção do GAPP para solicitação e acompanhamento de reparos estruturais, elétricos, hidráulicos e manutenção em geral.

## Visão Geral

O módulo de Chamados de Manutenção permite:
- **Todos os usuários**: Abrir chamados de manutenção
- **Manobristas**: Abrir chamados que passam por aprovação em cadeia
- **Departamento de Manutenção**: Triar, priorizar e executar manutenções
- **Supervisores/Gerentes**: Acompanhar execuções e aprovar orçamentos

---

## Para Solicitantes (Todos os Usuários)

### Abrindo um Chamado de Manutenção

1. **Acesse o menu** `Chamados` → `Manutenção` na barra lateral
2. **Clique em** `Novo Chamado`
3. **Preencha os campos obrigatórios**:
   - **Título**: Descrição resumida do problema
   - **Assunto**: Selecione a categoria (Elétrica, Hidráulica, Estrutural, etc.)
   - **Tipo de Manutenção**: Preventiva, Corretiva ou Emergencial
   - **Descrição**: Detalhes completos do problema

4. **Campos opcionais**:
   - **Unidade**: Selecione a unidade onde ocorreu o problema
   - **Local específico**: Ex: "2º andar, banheiro masculino"
   - **Equipamento afetado**: Se aplicável
   - **Urgência percebida**: Baixa, Média ou Alta
   - **Anexos**: Fotos ou documentos relevantes

5. **Clique em** `Criar Chamado`

> 💡 **Dica**: Anexe fotos do problema para agilizar o diagnóstico pela equipe de Manutenção.

### Tipos de Manutenção

| Tipo | Quando usar |
|------|-------------|
| **Corretiva** | Reparo de algo que quebrou ou parou de funcionar |
| **Preventiva** | Manutenção programada para evitar problemas |
| **Emergencial** | Situação que exige ação imediata (ex: vazamento) |

---

## Para Manobristas

### Fluxo de Aprovações

Quando um **Manobrista** abre um chamado de Manutenção, ele passa por uma cadeia de aprovações:

```
Criação → Aprovação Encarregado → Aprovação Supervisor → Aprovação Gerente → Triagem
```

1. O chamado entra em **"Aguardando Aprovação - Encarregado"**
2. Se aprovado, passa para **"Aguardando Aprovação - Supervisor"**
3. Se aprovado, passa para **"Aguardando Aprovação - Gerente"**
4. Após aprovação final, entra na fila de **Triagem** da Manutenção

> ⚠️ **Se negado em qualquer etapa**: Você receberá uma justificativa e poderá editar e reenviar o chamado ou fechá-lo.

### Acompanhando seu Chamado

1. Acesse `Chamados` → `Manutenção`
2. Localize seu chamado na lista
3. Clique no número do chamado para ver os detalhes
4. Acompanhe:
   - **Status atual** no topo da página
   - **Histórico de aprovações** na timeline
   - **Comentários** da equipe de Manutenção
   - **Execuções** programadas

---

## Para Aprovadores (Encarregado, Supervisor, Gerente)

### Aprovando Chamados

1. Acesse `Chamados` → `Manutenção`
2. Use o filtro de status para ver **chamados aguardando sua aprovação**
3. Clique no chamado para abrir os detalhes
4. Na seção de **Aprovações**, você verá seu pendente
5. Escolha:
   - **Aprovar**: O chamado segue para o próximo nível
   - **Negar**: Informe o motivo (obrigatório)

> 💡 **Dica**: Revise os anexos e a descrição antes de aprovar. Chamados com informações insuficientes podem ser negados para complementação.

---

## Para o Departamento de Manutenção

### Triagem de Chamados

Chamados em **"Aguardando Triagem"** precisam ser priorizados:

1. Acesse o chamado
2. Clique em **Triar Chamado**
3. Defina:
   - **Prioridade**: Baixa, Média, Alta ou Urgente
   - **Responsável**: Membro da equipe que executará
   - **Previsão de conclusão**: Data estimada

4. Clique em **Confirmar Triagem**

O chamado passa para **"Em Andamento"**.

### Prioridades

| Prioridade | SLA Sugerido | Exemplos |
|------------|--------------|----------|
| **Baixa** | Até 15 dias | Pintura, pequenos ajustes estéticos |
| **Média** | Até 7 dias | Lâmpadas queimadas, torneiras pingando |
| **Alta** | Até 48h | Problemas que afetam operação |
| **Urgente** | Imediato | Vazamentos graves, falhas elétricas |

### Gerenciando Execuções

O sistema de execuções permite registrar o trabalho realizado:

#### Adicionando uma Execução

1. No chamado, clique em **+ Nova Execução**
2. Preencha:
   - **Descrição**: O que será feito
   - **Responsável**: Quem executará
   - **Data de início**: Quando começará
   - **Previsão de término**: Estimativa
   - **Custo estimado**: Orçamento (se aplicável)
   - **Materiais necessários**: Lista de itens
   - **Fornecedor**: Se houver terceirização

3. Clique em **Criar Execução**

#### Atualizando uma Execução

1. Localize a execução na lista
2. Clique em **Editar**
3. Atualize:
   - **Status**: Pendente → Em Andamento → Concluída
   - **Data de conclusão real**
   - **Custo final**
   - **Observações**

#### Status de Execução

| Status | Descrição |
|--------|-----------|
| **Pendente** | Execução planejada, ainda não iniciada |
| **Em Andamento** | Trabalho em execução |
| **Aguardando Peças** | Parada por falta de material |
| **Concluída** | Trabalho finalizado |
| **Cancelada** | Execução cancelada |

### Fluxo de Status do Chamado

```
Aguardando Triagem
      ↓
  Em Andamento ←→ Análise Técnica
      ↓
  Em Aprovação (orçamento)
      ↓
    Aprovado
      ↓
  Executando ←→ Aguardando Peças/Materiais
      ↓
   Concluído
      ↓
   Avaliação
      ↓
    Fechado
```

### Marcando Aguardando Peças

Quando uma execução está parada por falta de material:

1. Acesse a execução
2. Clique em **Aguardando Peças**
3. O chamado também será atualizado para esse status
4. Quando o material chegar, volte para **Em Andamento**

### Concluindo o Chamado

1. Certifique-se de que todas as execuções estão concluídas
2. Mude o status do chamado para **Concluído**
3. O solicitante será notificado para avaliar

---

## Acompanhamento e Histórico

### Visualizando a Timeline

Cada chamado possui uma timeline completa com:
- Criação do chamado
- Aprovações/Negações
- Mudanças de status
- Comentários
- Execuções adicionadas/atualizadas

### Adicionando Comentários

1. Role até a seção **Comentários**
2. Digite sua mensagem
3. Clique em **Enviar**

> 💡 **Dica**: Use comentários para comunicação entre solicitante e equipe de Manutenção.

### Filtrando Chamados

Na listagem, use os filtros disponíveis:

| Filtro | Opções |
|--------|--------|
| **Status** | Todos os status do fluxo |
| **Prioridade** | Baixa, Média, Alta, Urgente |
| **Assunto** | Categorias de manutenção |
| **Tipo** | Preventiva, Corretiva, Emergencial |
| **Unidade** | Unidades disponíveis |
| **Período** | Data inicial e final |
| **Busca** | Por número ou título |

---

## Glossário

| Termo | Descrição |
|-------|-----------|
| **Triagem** | Processo de priorização e atribuição de responsável |
| **Execução** | Registro de uma tarefa de manutenção no chamado |
| **Manutenção Corretiva** | Reparo de falhas já ocorridas |
| **Manutenção Preventiva** | Ações para evitar falhas futuras |
| **SLA** | Prazo acordado para resolução |
| **Cadeia de Aprovação** | Sequência hierárquica de aprovações |

---

## Dúvidas Frequentes

### Meu chamado foi negado. O que fazer?
Leia a justificativa de negação, edite o chamado com as informações solicitadas e reenvie para aprovação.

### Posso cancelar um chamado que abri?
Sim, desde que ele ainda não esteja em execução. Acesse os detalhes e clique em **Cancelar Chamado**.

### Como sei se meu chamado está sendo atendido?
Acompanhe o status na listagem ou nos detalhes. Você também pode ver as execuções planejadas/em andamento.

### Por que meu chamado precisa de aprovação e o de outro funcionário não?
Chamados de **Manobristas** para o departamento de Manutenção passam por aprovação hierárquica (Encarregado → Supervisor → Gerente). Outros cargos enviam direto para triagem.

### Como adiciono mais informações a um chamado?
Use a seção de **Comentários** para adicionar informações ou anexos adicionais.

### O que significa "Aguardando Peças/Materiais"?
A execução foi pausada porque falta material necessário. A equipe de Manutenção está aguardando a chegada dos itens para continuar.

### Posso ver chamados de outras unidades?
Depende do seu perfil:
- **Manobrista/Encarregado**: Apenas chamados das suas unidades
- **Supervisor/Gerente**: Chamados de todas as unidades
- **Admin**: Todos os chamados

---

## Suporte

Em caso de problemas técnicos, entre em contato com o suporte através do módulo de Chamados ou pelo email: suporte@garageinn.com.br

