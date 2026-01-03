# Plano de Desenvolvimento — Gapp Mobile (MVP)

## Objetivo

Entregar um **MVP mobile** (iOS/Android) focado em operação de campo:

- **Checklists** (Abertura + Supervisão)
- **Chamados** (abertura, leitura, comentários, ações do autor)
- **Perfil** e **Configurações básicas**

Backend: **Supabase** (Auth + Postgres + Storage), com **RBAC** e **escopo por unidade/cobertura** conforme `projeto/PRD.md`.

---

## Escopo do MVP (o que entra)

### Autenticação
- Login (email/senha ou magic link — alinhado com Supabase Auth)
- Recuperação de senha
- Logout
- Sessão persistida + refresh

### Navegação (IA)
Bottom Tabs:
- **Início**
- **Chamados**
- **Checklists**
- **Perfil**

Rotas “stack” por tab:
- Início → atalhos e indicadores leves
- Chamados → Lista → Detalhe → (Novo Chamado)
- Checklists → Seleção (Abertura/Supervisão) → Lista/Escolha de Unidade → Execução → Resumo
- Perfil → Dados → (Configurações) → (Sair)

### Checklists (MVP)
#### Checklist de Abertura
- Carregar template da **unidade** (perguntas Sim/Não)
- Regras:
  - Pergunta “obrigatória” não pode pular
  - Se resposta = **Não** e a pergunta exigir, **observação (texto) obrigatória**
  - **Foto opcional** por item e/ou geral
- Execução:
  - iniciar, salvar progresso (rascunho local), finalizar, enviar
  - histórico básico (minhas execuções / por unidade quando permitido)

#### Checklist de Supervisão
- Selecionar **unidade sob cobertura** (Supervisor) ou todas (Gerente)
- Renderizar checklist do tipo Supervisão da unidade
- Capturar:
  - respostas (conforme tipo de pergunta)
  - observações
  - fotos (opcional)
  - assinatura do encarregado (**fora do MVP**, salvo se obrigatório)

> Nota de escopo: **criação/edição** de templates de Supervisão **não entra** no MVP mobile (recomendado ficar no Web/Admin). O mobile foca em **execução**.

### Chamados (MVP)
- **Abertura**: criar chamado com **1 unidade** (obrigatório quando aplicável), depto destinatário, título, descrição/justificativa, urgência percebida, anexos.
- **Listagem**: inbox conforme RBAC/escopo, com filtros básicos (status, depto, unidade, prioridade se disponível).
- **Detalhe**: dados, status, anexos, timeline simples (quando existir), comentários.
- **Comentários**: enviar/ler thread.
- **Ações do autor**:
  - cancelar chamado
  - fechar chamado quando “Resolvido”
  - reabrir (se regra de janela existir no backend)

> Fora do MVP mobile: **triagem** (definir prioridade/responsável), fluxos avançados por departamento (Compras/Manutenção) como operação principal. Podem existir para leitura.

### Perfil e Config (MVP)
- Perfil: nome, email, telefone (se permitido), deptos/cargos, unidades/cobertura.
- **CPF não aparece** no mobile.
- Config:
  - unidade padrão (para Operações, se fizer sentido)
  - “sobre” (versão/build)
  - termos/privacidade (link)

---

## Escopo fora do MVP (backlog futuro)
- Push notifications
- Modo offline completo (listar tudo offline)
- Editor de templates (Abertura/Supervisão) no mobile
- Admin completo (usuários/unidades/permissões)
- Relatórios/BI
- Assinatura do encarregado (se virar requisito)

---

## Arquitetura recomendada (MVP)

### Stack
- **React Native + Expo** (TypeScript)
- **Supabase**:
  - Auth (sessão)
  - Postgres (RLS)
  - Storage (anexos/fotos)

### Camadas no app
- **UI**: componentes + tema (tokens principais)
- **Feature modules**: `auth`, `checklists`, `tickets`, `profile`
- **Data layer**:
  - client Supabase
  - queries/mutations com cache (ex.: TanStack Query)
  - paginação e filtros
- **Offline “B” (rascunho + reenvio)**:
  - persistir rascunho de execução de checklist
  - persistir rascunho de chamado + fila de upload de anexos
  - reenvio automático ao voltar conexão + botão “tentar novamente”

### Regras de acesso (ponto crítico)
Implementar helpers bem testados para:
- calcular **escopo de unidades** do usuário (unidade única / cobertura / todas)
- listar registros “visíveis” (chamados e checklists) com base no RBAC
- gating de telas/ações por permissão (ex.: executar supervisão apenas se perfil permitir)

---

## Contratos de dados (o que o mobile precisa do backend)

### Entidades mínimas
- Usuário + vínculos (deptos/cargos + unidades/cobertura)
- Unidades (id, nome/código)
- Chamados (campos do PRD + status + depto destinatário + unidade)
- Comentários + anexos de chamados
- Templates de checklist (abertura + supervisão) por unidade
- Execuções de checklist + respostas + anexos

### Recomendações de backend (sem alterar escopo)
- Criar/usar **views/RPCs** específicas para mobile caso as queries fiquem complexas (ex.: “minha inbox”), mantendo RLS.
- Normalizar anexos no Storage com paths previsíveis e metadados mínimos no Postgres.

---

## Experiência (UX) — princípios do MVP
- **Fluxo rápido** (1–2 taps) para “Executar checklist” e “Novo chamado”
- Estados claros: vazio / carregando / erro / offline / pendências de envio
- Uploads com progresso e retentativas
- Listas com paginação e filtros salvos (mínimo)

---

## Cronograma sugerido (6 semanas)

> Ajuste conforme time (1 dev vs 2 devs) e maturidade do backend.

### Semana 1 — Fundação + Auth + Shell ✅
- ✅ Setup Expo + arquitetura de pastas
- ✅ Tema/tokens + navegação (tabs/stacks)
- ✅ Auth (login/recuperação/logout) + sessão persistida
- ✅ Perfil "read-only" inicial
- ✅ **RBAC/Escopo (Épico 2)**: Perfil operacional + permissões + gating de UI

### Semana 2 — Checklists (Abertura) — execução ✅
- ✅ Carregar template por unidade
- ✅ Render Sim/Não + validações (obrigatório / observação quando "Não")
- ✅ Salvar progresso local + finalizar

**Arquivos implementados:**
- `src/modules/checklists/types/checklist.types.ts` — Tipos TypeScript
- `src/modules/checklists/services/checklistService.ts` — Operações Supabase
- `src/modules/checklists/services/draftService.ts` — Persistência local
- `src/modules/checklists/hooks/useChecklistExecution.ts` — Hook de execução
- `src/modules/checklists/hooks/useUnitSelection.ts` — Seleção de unidade
- `src/modules/checklists/components/` — UnitSelector, QuestionCard, ChecklistProgress, ChecklistSummary
- `src/modules/checklists/screens/ChecklistExecutionScreen.tsx` — Fluxo completo

### Semana 3 — Checklists (Abertura) — anexos + histórico + offline B ✅
- ✅ Fotos opcionais (compressão + upload)
- ✅ Histórico básico (minhas execuções / por unidade conforme permissão)
- ✅ Fila de envio (rascunho + reenvio)

**Arquivos implementados:**
- `src/modules/checklists/services/photoService.ts` — Câmera, galeria, compressão e upload
- `src/modules/checklists/components/PhotoPicker.tsx` — Componente de fotos
- `src/modules/checklists/screens/ChecklistsListScreen.tsx` — Lista com histórico
- `src/modules/checklists/screens/ChecklistDetailsScreen.tsx` — Detalhes da execução

> **Nota:** Para fotos funcionarem, executar: `npx expo install expo-image-picker expo-image-manipulator`

### Semana 4 — Chamados (criação + listagem)
- Novo chamado (1 unidade) + anexos
- Inbox/lista com filtros básicos + paginação
- Offline B para rascunho de chamado + fila de upload

### Semana 5 — Chamados (detalhe + comentários + ações do autor) + Supervisão
- Detalhe do chamado + thread de comentários
- Ações (cancelar/fechar/reabrir)
- Checklist de Supervisão (execução + envio + histórico mínimo)

### Semana 6 — Hardening + release
- Ajustes de RBAC/escopo (testes)
- Performance (listas/imagens) + observabilidade (crash reporting)
- Preparar builds e distribuição (TestFlight / Internal testing)

---

## Critérios de pronto (Definition of Done) — MVP
- Telas com estados: loading/empty/error/offline
- RBAC/escopo funcionando (casos principais: Manobrista/Encarregado/Supervisor/Gerente)
- Checklists: validações e envio consistente
- Chamados: criar/listar/detalhar/comentar e ações do autor
- Uploads com retry
- Sem CPF no app


