# Backlog — Gapp Mobile (MVP)

Este backlog está organizado por **épicos** e priorizado para um MVP em ~6 semanas (ver `PLANO_MVP.md`).

Cada história inclui **critérios de aceite** (CA) para virar tarefa “pronta”.

---

## Épico 0 — Fundação (Projeto, navegação, tema, qualidade)

### 0.1 Inicializar app Expo + TypeScript
- **CA**
  - Projeto Expo criado e roda em iOS/Android (dev)
  - Estrutura mínima de pastas (`src/` com módulos)
  - Variáveis de ambiente para Supabase (sem vazar chaves em código)

### 0.2 Navegação base (Tabs + Stacks)
- **CA**
  - Tabs: Início, Chamados, Checklists, Perfil
  - Deep link interno entre telas (ex.: “Novo Chamado” abre no stack correto)
  - Botão “voltar” consistente (Android/iOS)

### 0.3 Tema (tokens principais)
- **CA**
  - Cor primária (vermelho Garageinn) aplicada em botões/ações
  - Tipografia base consistente
  - Componentes base: Button, Input, TextArea, Card, Badge, Loading, EmptyState

### 0.4 Observabilidade mínima
- **CA**
  - Erros não tratados são capturados (crash reporting)
  - Logs de erro com contexto (usuário/sessão) sem PII sensível

---

## Épico 1 — Autenticação (Supabase Auth)

### 1.1 Login
- **CA**
  - Usuário autentica com credenciais válidas e entra no app
  - Erros exibidos (credencial inválida, sem rede)
  - Sessão persiste ao reabrir o app

### 1.2 Recuperação de senha
- **CA**
  - Usuário solicita recuperação e recebe confirmação de envio
  - Erros exibidos quando email inválido / rede indisponível

### 1.3 Logout
- **CA**
  - Logout encerra sessão e volta para tela de login
  - Cache local sensível é limpo (rascunhos podem permanecer, sem expor dados)

---

## Épico 2 — Identidade do usuário e escopo (RBAC/Unidades)

### 2.1 Carregar “perfil operacional” do usuário
- **CA**
  - App obtém: deptos/cargos + unidades vinculadas + cobertura (quando existir)
  - App identifica tipo de escopo: unidade única / cobertura / todas

### 2.2 Guardrails de acesso (gating)
- **CA**
  - Telas/ações bloqueadas quando usuário não tem permissão (mensagem clara)
  - Usuário administrativo (B) consegue **ler** Chamados e Checklists (quando permitido), mas não vê ações de operação indevidas

> Observação: as permissões finas devem refletir o backend (RLS). No mobile, o gating é UX; a segurança real vem do Supabase.

---

## Épico 3 — Checklists de Abertura (Execução)

### 3.1 Selecionar unidade (ou usar unidade padrão)
- **CA**
  - Manobrista/Encarregado: unidade já vem definida (sem escolha, se aplicável)
  - Supervisor/Gerente: pode escolher entre unidades do escopo

### 3.2 Carregar template de abertura
- **CA**
  - Template carrega por unidade
  - Perguntas renderizam em ordem
  - Estado de erro/retry quando falhar rede

### 3.3 Responder checklist (Sim/Não + validação)
- **CA**
  - Pergunta obrigatória não pode ser pulada
  - Se resposta = “Não” e exigir observação: **texto obrigatório**
  - Usuário consegue salvar progresso (rascunho) sem enviar

### 3.4 Finalizar e enviar execução
- **CA**
  - Ao finalizar, app valida tudo e envia execução
  - Confirmação de sucesso + navegação para resumo/histórico

### 3.5 Fotos opcionais (por item e/ou geral)
- **CA**
  - Usuário anexa foto via câmera/galeria
  - Imagem é comprimida antes do upload
  - Upload mostra progresso e permite retry

---

## Épico 4 — Checklists (Histórico)

### 4.1 Listar execuções (histórico básico)
- **CA**
  - Lista mostra data/hora, unidade, executor, resultado (ex.: “com N não-conformidades”)
  - Paginação ou “carregar mais”

### 4.2 Detalhe de execução
- **CA**
  - Detalhe mostra perguntas + respostas + observações + fotos (se houver)
  - Respeita RBAC/escopo

---

## Épico 5 — Offline “B” (rascunho + reenvio)

### 5.1 Rascunho local de checklist
- **CA**
  - Se cair conexão, usuário não perde respostas
  - Existe tela/indicador de “pendências para enviar”
  - Reenvio funciona ao voltar rede

### 5.2 Rascunho local de chamado
- **CA**
  - Usuário pode salvar “rascunho de chamado” e enviar depois
  - Anexos pendentes entram em fila com retry

---

## Épico 6 — Chamados (criação)

### 6.1 Novo chamado (1 unidade)
- **CA**
  - Campos: título, depto destinatário, unidade (1), descrição/justificativa, urgência percebida (opcional)
  - Validações mínimas (obrigatórios)
  - Se usuário não puder selecionar unidade, ela vem fixa

### 6.2 Anexos em chamado (opcional)
- **CA**
  - Adicionar/remover anexos antes de enviar
  - Upload com retry

---

## Épico 7 — Chamados (lista + detalhe + comentários)

### 7.1 Listagem de chamados (inbox)
- **CA**
  - Lista respeita escopo do usuário (unidade/cobertura/todas)
  - Filtros básicos: status, depto, unidade
  - Paginação

### 7.2 Detalhe do chamado
- **CA**
  - Exibe campos principais + anexos
  - Exibe status atual
  - Exibe histórico mínimo se existir (ou ao menos timestamps principais)

### 7.3 Comentários
- **CA**
  - Usuário vê thread
  - Usuário envia novo comentário
  - Erros de envio mostram retry

### 7.4 Ações do autor (cancelar / fechar / reabrir)
- **CA**
  - Autor consegue cancelar (quando permitido)
  - Autor consegue fechar quando status = Resolvido
  - Reabrir segue regra do backend (ex.: até 7 dias) e retorna erro claro quando não permitido

---

## Épico 8 — Checklist de Supervisão (Execução)

### 8.1 Seleção de unidade sob cobertura
- **CA**
  - Supervisor vê apenas unidades de cobertura
  - Gerente vê todas unidades (se permitido)

### 8.2 Execução do checklist de supervisão
- **CA**
  - Renderiza perguntas do tipo supervisão por unidade
  - Validações mínimas por tipo de pergunta
  - Observações e fotos opcionais (foto pode virar obrigatória pós-MVP)

### 8.3 Envio + histórico mínimo
- **CA**
  - Envia execução e aparece no histórico
  - Respeita RBAC/escopo

---

## Épico 9 — Perfil + Configurações

### 9.1 Perfil (sem CPF)
- **CA**
  - Exibe nome, email, telefone (se permitido), cargos/deptos, unidades/cobertura
  - **Não exibe CPF** em nenhuma tela

### 9.2 Configurações básicas
- **CA**
  - Unidade padrão (quando aplicável)
  - Sobre (versão/build)
  - Link de termos/privacidade

---

## Itens explícitos de pós-MVP (para evitar escopo infinito)
- Push notifications
- Editor de templates no mobile
- Assinatura do encarregado
- Admin completo
- Offline completo (cache total)


