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

- [x] Adicionar campo de email na unidade (fase futura)
- [x] Implementar métricas da unidade (chamados, checklists)
- [x] Histórico de alterações da unidade (audit log)
- [x] Vincular supervisores após importar (converter `supervisor_name` → `user_units`)

## Checklists

- [x] Criar modelo de dados: `checklist_templates`, `checklist_questions`, `checklist_executions`, `checklist_answers`
- [x] Criar tela de configuração de checklist de abertura (admin)
- [x] Criar tela de execução de checklist de abertura
- [x] Criar tela de histórico de checklists executados
- [x] Usuário admin pode excluir checklists (unitário e em massa)

## Chamados — Compras

- [x] Criar modelo de dados: `tickets`, `ticket_comments`, `ticket_attachments`, `ticket_history`
- [x] Criar tela de abertura de chamado de Compras
- [x] Criar tela de listagem de chamados de Compras
- [x] Implementar fluxo de execução do chamado de Compras
- [x] Implementar triagem e priorização

## Chamados — Manutenção

- [x] Criar tela de abertura de chamado de Manutenção
- [x] Criar tela de listagem de chamados de Manutenção
- [x] Implementar fluxo de execução do chamado de Manutenção

## Chamados — RH (Uniformes e Gerais)

- [x] Criar tela de abertura de chamado de RH
- [x] Criar tela de listagem de chamados de RH
- [x] Implementar fluxo de execução do chamado de RH
- [x] Implementar gestão de uniformes (compra, estoque, retirada)

## Admin

- [ ] Usuário admin pode excluir chamados (unitário e em massa)

---

## UI/Design System (Refinamentos)

- [x] Ajustar logo na sidebar (remover texto "GAPP", tornar logo proporcional)
- [x] Corrigir cor do componente Skeleton (vermelho → cinza suave)

## Dashboard

- [x] Plano de implementação criado: [.context/plans/dashboard-dados-reais.md](.context/plans/dashboard-dados-reais.md)
- [x] Remover dados mock do dashboard
- [x] Implementar cards com dados reais (chamados abertos, checklists hoje, unidades ativas, taxa de resolução)
- [x] Implementar lista de chamados recentes com dados reais
- [x] Implementar lista de checklists pendentes com dados reais

## Página de Chamados (Hub Unificado)

> A página `/chamados` atualmente exibe dados mock. Objetivo: torná-la funcional como hub central.

- [x] Analisar e documentar requisitos para página "Chamados" funcional
- [x] Substituir dados mock por consulta real ao banco (todos os departamentos)
- [x] Implementar navegação para detalhes ao clicar no chamado
- [x] Implementar ação de abertura de novo chamado (escolha de tipo: Compras, Manutenção, RH)
- [x] Implementar filtros (departamento, status, prioridade, unidade)
- [x] Implementar paginação server-side

## Configurações (Análise e Implementação)

> A página `/configuracoes` lista 6 módulos. Verificar quais estão funcionais.

- [x] Testar e documentar estado atual da página "Configurações"
- [x] Verificar/implementar sub-página: Departamentos e Cargos
- [x] Verificar/implementar sub-página: Unidades (configurações)
- [x] Verificar/implementar sub-página: Checklists (já existe em `/checklists/configurar`)
- [x] Verificar/implementar sub-página: Chamados (tipos e fluxos)
- [x] Verificar/implementar sub-página: Permissões
- [x] Verificar/implementar sub-página: Sistema (configurações gerais)

## Gestão Avançada de Usuários (Admin)

> Funcionalidades administrativas adicionais para gerenciamento de usuários.

- [ ] Implementar exclusão de usuário (soft delete)
- [ ] Adicionar confirmação antes de excluir usuário
- [ ] Implementar reenvio de email de convite para usuários pendentes
- [ ] Permitir edição de email do usuário (para reenvio de convite)
- [ ] Validar unicidade do novo email antes de salvar
- [ ] Adicionar indicador visual de status do convite (pendente, aceito, expirado)

