# Guia do Usuário: Checklists

Este guia explica como utilizar o módulo de Checklists do GAPP para verificação diária das condições das garagens.

## Visão Geral

O módulo de Checklists permite:
- **Operações**: Executar checklists de abertura diariamente
- **Supervisão**: Acompanhar histórico e identificar não-conformidades
- **Administração**: Configurar templates e perguntas personalizadas

---

## Para Operações (Manobristas, Encarregados)

### Executando um Checklist de Abertura

1. **Acesse o menu** `Checklists` na barra lateral
2. **Clique em** `Executar Checklist`
3. **Selecione sua unidade** na lista de unidades disponíveis
4. **Clique em** `Iniciar Checklist`

#### Durante a Execução

- Responda cada pergunta clicando em **Sim** (verde) ou **Não** (vermelho)
- Se responder **Não** em uma pergunta que exige justificativa, um campo de observação será exibido
- A barra de progresso mostra quantas perguntas já foram respondidas
- Você pode adicionar **observações gerais** ao final do checklist

#### Finalizando

1. Revise suas respostas no **resumo**
2. Adicione observações gerais se necessário
3. Clique em **Finalizar Checklist**

> ⚠️ **Importante**: Todas as perguntas obrigatórias devem ser respondidas antes de finalizar.

---

## Para Supervisores e Gerentes

### Acompanhando o Histórico

1. Acesse `Checklists` no menu
2. Visualize os **cards de estatísticas**:
   - Total de checklists executados
   - Concluídos vs Em andamento
   - Com não-conformidades
   - Taxa de conformidade

### Usando Filtros

- **Unidade**: Filtre por unidade específica
- **Template**: Filtre por tipo de checklist
- **Período**: Defina data inicial e final
- **Status**: Todos, Em andamento ou Concluído
- **Não-conformidades**: Ative para ver apenas checklists com problemas

### Visualizando Detalhes

1. Clique no ícone de **olho** (👁) na linha do checklist
2. Veja todas as respostas com indicadores visuais:
   - ✓ Verde = Sim (conforme)
   - ✗ Vermelho = Não (não-conforme)
3. Leia as observações registradas
4. Identifique padrões de não-conformidades

---

## Para Administradores

### Configurando Templates

1. Acesse `Checklists` → `Configurar`
2. Clique em `Novo Template`
3. Preencha:
   - **Nome**: Ex: "Checklist de Abertura - Shopping"
   - **Descrição**: Detalhes sobre quando usar
   - **Tipo**: Abertura ou Supervisão
   - **Padrão**: Marque se deve ser o default para novas unidades

### Gerenciando Perguntas

1. Acesse o template desejado
2. Clique em `Gerenciar Perguntas`
3. Para adicionar: Clique em `+ Adicionar Pergunta`
4. Configure:
   - **Texto da pergunta**
   - **Obrigatória**: Se deve ser respondida
   - **Exige observação se Não**: Force justificativa em não-conformidades
5. **Reordene** arrastando as perguntas

### Vinculando a Unidades

1. No template, clique em `Vincular Unidades`
2. Selecione as unidades que devem usar este template
3. Salve

### Excluindo Execuções

**Individual:**
1. Acesse os detalhes da execução
2. Clique no botão vermelho `Excluir`
3. Confirme a ação

**Em massa:**
1. Na listagem, marque os checkboxes das execuções
2. Clique em `Excluir Selecionados`
3. Confirme a ação

> ⚠️ **Atenção**: A exclusão é permanente e remove todas as respostas associadas.

---

## Glossário

| Termo | Descrição |
|-------|-----------|
| **Template** | Modelo de checklist com perguntas pré-definidas |
| **Execução** | Uma instância de checklist preenchido |
| **Não-conformidade** | Resposta "Não" em uma pergunta |
| **Taxa de conformidade** | Percentual de checklists sem não-conformidades |

---

## Dúvidas Frequentes

### Por que não consigo finalizar o checklist?
Verifique se todas as perguntas obrigatórias foram respondidas e se as observações exigidas foram preenchidas.

### Posso editar um checklist já finalizado?
Não. Checklists finalizados são imutáveis para garantir a integridade dos dados. Em caso de erro, entre em contato com um administrador.

### Como sei se minha unidade tem um checklist vinculado?
Na tela de execução, você verá apenas as unidades que têm templates vinculados. Se sua unidade não aparecer, solicite ao administrador que vincule um template.

### Onde vejo os checklists com problemas?
Use o filtro "Apenas com não-conformidades" na tela de histórico, ou observe o card "Não-Conformidades" nas estatísticas.

---

## Suporte

Em caso de problemas técnicos, entre em contato com o suporte através do módulo de Chamados ou pelo email: suporte@garageinn.com.br

