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

- [x] Criar modelo de dados: `profiles`, `departments`, `roles`, `user_roles`
- [x] Criar tela de listagem de usuários
- [x] Criar tela de cadastro/edição de usuário
- [x] Implementar RBAC (permissões por cargo/departamento)
- [x] Criar página de perfil do usuário

### Follow-ups (Gestão de Usuários)

- [x] Vincular usuários a unidades (após criar tabela `units`)
- [x] Implementar paginação server-side (avaliar quando > 50 usuários)
- [x] Adicionar logs de auditoria para ações de usuário

## Gestão de Unidades

- [x] Criar modelo de dados: `units`, `user_units`
- [x] Criar tela de listagem de unidades
- [x] Criar tela de cadastro/edição de unidade
- [x] Criar tela de detalhes da unidade
- [x] Implementar vínculo usuário-unidade
- [x] Implementar importação de CSV (94 unidades em `projeto/unidades.csv`)

### Follow-ups (Gestão de Unidades)

- [ ] Adicionar campo de email na unidade (fase futura)
- [ ] Implementar upload de foto da fachada (Storage)
- [ ] Adicionar coordenadas GPS (lat/long)
- [ ] Implementar métricas da unidade (chamados, checklists)
- [ ] Histórico de alterações da unidade (audit log)
- [ ] Vincular supervisores após importar (converter `supervisor_name` → `user_units`)
- [ ] Exportar unidades para CSV

## Checklists

- [x] Criar modelo de dados: `checklist_templates`, `checklist_questions`, `checklist_executions`, `checklist_answers`
- [x] Criar tela de configuração de checklist de abertura (admin)
- [x] Criar tela de execução de checklist de abertura
- [x] Criar tela de histórico de checklists executados
- [x] Usuário admin pode excluir checklists (unitário e em massa)

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


