# Entrega 1 — Tarefas (23/12/2025)

Fonte: [PRD](../PRD.md) → seção **9. Roadmap de Desenvolvimento** → **Entrega 1**.

> Checklist de execução: marque os itens conforme forem concluídos.

## Infraestrutura e Bootstrap

- [x] Configurar projeto Next.js com TypeScript
- [x] Configurar Tailwind CSS e shadcn/ui
- [x] Configurar projeto Supabase (Database, Auth, Storage)
- [x] Criar estrutura de pastas e arquivos base
- [x] Configurar ESLint, Prettier e padrões de código
- [x] Criar componentes base do Design System
- [x] Configurar variáveis de ambiente
- [x] Criar layout principal (Sidebar, Header, Content)

## Autenticação

- [x] Configurar Supabase Auth
- [x] Criar tela de Login
- [x] Criar tela de Recuperação de Senha
- [x] Implementar middleware de proteção de rotas
- [x] Criação de usuário admin
- [x] Impersonação para usuário admin

## Gestão de Usuários

- [ ] Criar modelo de dados: `users`, `departments`, `roles`, `user_roles`
- [ ] Criar tela de listagem de usuários
- [ ] Criar tela de cadastro/edição de usuário
- [ ] Implementar RBAC (permissões por cargo/departamento)
- [ ] Criar página de perfil do usuário

## Gestão de Unidades

- [ ] Criar modelo de dados: `units`, `user_units`
- [ ] Criar tela de listagem de unidades
- [ ] Criar tela de cadastro/edição de unidade
- [ ] Criar tela de detalhes da unidade
- [ ] Implementar vínculo usuário-unidade

## Checklists

- [ ] Criar modelo de dados: `checklist_templates`, `checklist_questions`, `checklist_executions`, `checklist_answers`
- [ ] Criar tela de configuração de checklist de abertura (admin)
- [ ] Criar tela de execução de checklist de abertura
- [ ] Criar tela de histórico de checklists executados
- [ ] Usuário admin pode excluir checklists (unitário e em massa)

## Chamados — Compras

- [ ] Criar modelo de dados: `tickets`, `ticket_comments`, `ticket_attachments`, `ticket_history`
- [ ] Criar tela de abertura de chamado de Compras
- [ ] Criar tela de listagem de chamados de Compras
- [ ] Implementar fluxo de execução do chamado de Compras
- [ ] Implementar triagem e priorização

## Chamados — Manutenção

- [ ] Criar tela de abertura de chamado de Manutenção
- [ ] Criar tela de listagem de chamados de Manutenção
- [ ] Implementar fluxo de execução do chamado de Manutenção

## Chamados — RH (Uniformes e Gerais)

- [ ] Criar tela de abertura de chamado de RH
- [ ] Criar tela de listagem de chamados de RH
- [ ] Implementar fluxo de execução do chamado de RH
- [ ] Implementar gestão de uniformes (compra, estoque, retirada)

## Admin

- [ ] Usuário admin pode excluir chamados (unitário e em massa)


