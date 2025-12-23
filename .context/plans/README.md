# Collaboration Plans

This directory is the run queue for AI agents and maintainers coordinating work across documentation and playbooks. Treat the list below as an ordered backlog: finish the first plan before moving on to the next unless a human directs otherwise.

## Agent Execution Protocol
1. **Read the queue** from top to bottom. The numbering reflects execution priority.
2. **Open the plan file** (e.g., './plans/<slug>.md') and review the YAML front matter and the '<!-- agent-update:start:plan-... -->' wrapper so you understand the goal, required inputs, and success criteria.
3. **Gather context** by visiting the linked documentation and agent playbooks referenced in the "Agent Lineup" and "Documentation Touchpoints" tables.
4. **Execute the stages** exactly as written, capturing evidence and updating linked docs as instructed. If a stage cannot be completed, record the reason inside the plan before pausing.
5. **Close out the plan** by updating any TODOs, recording outcomes in the "Evidence & Follow-up" section, and notifying maintainers if human review is required.
6. **Return here** and pick the next plan in the queue. Always leave the README and plan files consistent with the work performed.

## Plan Queue (status updated: 2024-12-23)

| # | Plano | Status | Progresso | Descrição |
|---|-------|--------|-----------|-----------|
| 1 | [Autenticacao](./autenticacao.md) | ✅ Concluído | 7/7 | Login, recuperação de senha, middleware, impersonação |
| 2 | [Chamados Compras](./chamados-compras.md) | 🔶 Em Progresso | 5/7 | Abertura, listagem, triagem (faltam: aprovações, cotações) |
| 3 | [Chamados Manutencao](./chamados-manutencao.md) | ✅ Concluído | 5/5 | Abertura, listagem, execuções, triagem |
| 4 | [Checklists](./checklists.md) | ✅ Concluído | 5/5 | Templates, execução, histórico, exclusão |
| 5 | [Entrega1 Infra Bootstrap](./entrega1-infra-bootstrap.md) | ✅ Concluído | - | Next.js, Tailwind, shadcn/ui, estrutura base |
| 6 | [Gestao Unidades](./gestao-unidades.md) | ⏳ Pendente | 0/6 | CRUD de unidades, importação CSV |
| 7 | [Gestao Usuarios](./gestao-usuarios.md) | ✅ Concluído | 6/6 | CRUD, RBAC, perfil do usuário |
| 8 | [Gestao Usuarios Followups](./gestao-usuarios-followups.md) | ✅ Concluído | 4/4 | Vínculo unidades, paginação, auditoria |

### Legenda
- ✅ **Concluído**: Todas as tarefas implementadas e validadas
- 🔶 **Em Progresso**: Algumas tarefas concluídas, outras pendentes
- ⏳ **Pendente**: Aguardando início da implementação

### Próximas Prioridades
1. **Chamados Compras**: Completar fluxo de aprovações e sistema de cotações
2. **Gestão de Unidades**: Iniciar implementação do CRUD de unidades

## How To Create Or Update Plans
- Run "ai-context plan <name>" to scaffold a new plan template.
- Run "ai-context plan <name> --fill" (optionally with "--dry-run") to have an LLM refresh the plan using the latest repository context.
- Cross-link any new documentation or agent resources you introduce so future runs stay discoverable.

## Related Resources
- [Agent Handbook](../agents/README.md)
- [Documentation Index](../docs/README.md)
- [Agent Knowledge Base](../../AGENTS.md)
- [Contributor Guidelines](../../CONTRIBUTING.md)

## User Documentation
- [Guia de Checklists](../docs/checklists-guia-usuario.md)
- [Guia de Chamados de Manutenção](../docs/chamados-manutencao-guia-usuario.md)
