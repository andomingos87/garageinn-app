# Collaboration Plans

This directory is the run queue for AI agents and maintainers coordinating work across documentation and playbooks. Treat the list below as an ordered backlog: finish the first plan before moving on to the next unless a human directs otherwise.

## Agent Execution Protocol
1. **Read the queue** from top to bottom. The numbering reflects execution priority.
2. **Open the plan file** (e.g., './plans/<slug>.md') and review the YAML front matter and the '<!-- agent-update:start:plan-... -->' wrapper so you understand the goal, required inputs, and success criteria.
3. **Gather context** by visiting the linked documentation and agent playbooks referenced in the "Agent Lineup" and "Documentation Touchpoints" tables.
4. **Execute the stages** exactly as written, capturing evidence and updating linked docs as instructed. If a stage cannot be completed, record the reason inside the plan before pausing.
5. **Close out the plan** by updating any TODOs, recording outcomes in the "Evidence & Follow-up" section, and notifying maintainers if human review is required.
6. **Return here** and pick the next plan in the queue. Always leave the README and plan files consistent with the work performed.

## Plan Queue (process in order)
1. [Autenticacao](./autenticacao.md)
2. [Chamados Compras](./chamados-compras.md)
3. [Chamados Hub Unificado](./chamados-hub-unificado.md)
4. [Chamados Manutencao](./chamados-manutencao.md)
5. [Checklists](./checklists.md)
6. [Configuracoes Sistema](./configuracoes-sistema.md)
7. [Correcao Auth Recovery](./correcao-auth-recovery.md)
8. [Correcao Build Errors](./correcao-build-errors.md)
9. [Dashboard Dados Reais](./dashboard-dados-reais.md)
10. [Deploy Bugfix](./deploy-bugfix.md)
11. [Entrega1 Infra Bootstrap](./entrega1-infra-bootstrap.md)
12. [Fix Bug Impersonacao Estado Persistente](./fix-bug-impersonacao-estado-persistente.md)
13. [Fix Bug Redefinicao Senha](./fix-bug-redefinicao-senha.md)
14. [Gestao Avancada Usuarios](./gestao-avancada-usuarios.md)
15. [Gestao Unidades](./gestao-unidades.md)
16. [Gestao Usuarios](./gestao-usuarios.md)
17. [Gestao Usuarios Followups](./gestao-usuarios-followups.md)
18. [Implementacao Impersonacao](./implementacao-impersonacao.md)
19. [Mobile Epico 0 Fundacao](./mobile-epico-0-fundacao.md)
20. [Mobile Epico 1 Autenticacao](./mobile-epico-1-autenticacao.md)
21. [Modulo Sinistros](./modulo-sinistros.md)
22. [Modulo Sinistros Completo](./modulo-sinistros-completo.md)
23. [Revisao Impersonacao](./revisao-impersonacao.md)
24. [Revisao Rls E Paginacao](./revisao-rls-e-paginacao.md)
25. [Revisao Vinculo Unidades Usuarios](./revisao-vinculo-unidades-usuarios.md)
26. [Rh Uniformes](./rh-uniformes.md)
27. [Security Advisors Pending](./security-advisors-pending.md)
28. [Ui Design System Refinements](./ui-design-system-refinements.md)
29. [Unidades Followups](./unidades-followups.md)

## How To Create Or Update Plans
- Run "ai-context plan <name>" to scaffold a new plan template.
- Run "ai-context plan <name> --fill" (optionally with "--dry-run") to have an LLM refresh the plan using the latest repository context.
- Cross-link any new documentation or agent resources you introduce so future runs stay discoverable.

## Related Resources
- [Agent Handbook](../agents/README.md)
- [Documentation Index](../docs/README.md)
- [Agent Knowledge Base](../../AGENTS.md)
- [Contributor Guidelines](../../CONTRIBUTING.md)
