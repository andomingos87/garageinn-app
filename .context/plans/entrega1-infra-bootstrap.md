---
id: plan-entrega1-infra-bootstrap
ai_update_goal: "Planejar e executar a etapa Infraestrutura e Bootstrap da Entrega 1 (Next.js + TS, Tailwind + shadcn/ui, Supabase, estrutura base, lint/format, env e layout principal)."
required_inputs:
  - "Checklist da entrega: projeto/entregaveis/entrega1_tarefas.md (Infraestrutura e Bootstrap — itens 7–16)"
  - "PRD: projeto/PRD.md (Entrega 1 + stack sugerida + navegação base)"
  - "Design System: design-system.md (tokens e componentes)"
  - "Decisão de estrutura do repo (este plano assume o app em apps/web)"
  - "Supabase: projeto criado no painel + chaves (URL e anon key) e configuração inicial de Auth/Storage"
success_criteria:
  - "App Next.js (TypeScript) inicializado e executando (dev + build) sem erros"
  - "Tailwind + shadcn/ui configurados com tokens do design system (CSS variables + theme)"
  - "ESLint + Prettier configurados (scripts + padrões) e rodando limpo"
  - "Variáveis de ambiente documentadas (ex.: .env.example) e carregamento validado no app"
  - "Layout principal (Sidebar, Header, Content) renderizando com rotas placeholder"
related_agents:
  - "code-reviewer"
  - "documentation-writer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
  - "architect-specialist"
  - "devops-specialist"
  - "database-specialist"
---

<!-- agent-update:start:plan-entrega1-infra-bootstrap -->
# Entrega 1 — Infraestrutura e Bootstrap (Plano)

> Plano para implementar a base do projeto web (Next.js + TypeScript, Tailwind + shadcn/ui, Supabase, estrutura de pastas, lint/format, env e layout principal) referente à Entrega 1.

## Task Snapshot
- **Primary goal:** Entregar o “esqueleto” do app web pronto para evoluir os módulos da Entrega 1, cobrindo os itens 7–16 de `projeto/entregaveis/entrega1_tarefas.md`.
- **Success signal:**
  - O app em `apps/web` sobe com `npm run dev` e gera build com `npm run build`
  - Layout base (Sidebar + Header + Content) renderiza e navega entre rotas placeholder
  - `npm run lint` e `npm run format:check` passam
  - Supabase configurado via env e cliente inicial disponível para uso (sem implementar features ainda)
- **Key references (produto e UI):**
  - `projeto/entregaveis/entrega1_tarefas.md` (Infraestrutura e Bootstrap)
  - `projeto/PRD.md` (Entrega 1 + navegação base + stack)
  - `design-system.md` (tokens e componentes)
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)
- **Out of scope (nesta etapa):** telas e fluxos de autenticação, RBAC, modelos de dados, CRUDs e regras de negócio dos módulos.
- **Repo layout (decisão):** este plano assume o app em `apps/web` para não conflitar com a pasta `projeto/` (documentação) e evitar scaffolds em diretório não vazio.

## Escopo detalhado (itens 7–16)
| Item (`entrega1_tarefas.md`) | Entregável mínimo | Como validar (pronto quando...) |
| --- | --- | --- |
| Configurar projeto Next.js com TypeScript | App Next.js com App Router + `src/` + alias `@/*` em `apps/web` | `npm run dev` sobe e `npm run build` passa |
| Configurar Tailwind CSS e shadcn/ui | Tailwind ativo + shadcn inicializado + theme via CSS variables | Componentes renderizam com estilos (Button/Card/Input) |
| Configurar projeto Supabase (Database, Auth, Storage) | Projeto Supabase criado + Auth/Storage habilitados + libs instaladas + helpers no app | Env vars carregadas e client disponível sem erro |
| Criar estrutura de pastas e arquivos base | Pastas `src/components`, `src/lib`, `src/app` organizadas e consistentes | Time encontra rapidamente UI/layout/lib sem duplicação |
| Configurar ESLint, Prettier e padrões de código | Scripts + configs funcionando (sem conflito ESLint/Prettier) | `npm run lint` e `npm run format:check` passam |
| Criar componentes base do Design System | Componentes shadcn base + util `cn` + tokens aplicados | Layout principal usa componentes base (sem CSS hardcoded) |
| Configurar variáveis de ambiente | `.env.example` versionado e `.env.local` local | App falha com mensagem clara quando faltar env |
| Criar layout principal (Sidebar, Header, Content) | AppShell + rotas placeholder com navegação base do PRD | Sidebar e header aparecem e navegação funciona |

## Comandos sugeridos (não-interativo)
> Ajuste conforme a equipe decidir versões específicas. Os comandos abaixo assumem execução a partir da raiz do repo.

### Scaffold Next.js (TypeScript + Tailwind + ESLint + src/)
```bash
npm create next-app@latest apps/web -- --ts --app --src-dir --eslint --tailwind --import-alias "@/*" --use-npm
cd apps/web
npm install
npm run dev
```

### shadcn/ui (init + componentes base)
```bash
cd apps/web
npx shadcn@latest init
npx shadcn@latest add button card badge input table separator dropdown-menu avatar sheet
```

### Supabase libs (bootstrap)
```bash
cd apps/web
npm install @supabase/supabase-js @supabase/ssr
```

### Prettier (além do ESLint do Next)
```bash
cd apps/web
npm install -D prettier eslint-config-prettier
```

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Architect Specialist | Define estrutura de pastas, convenções e fronteiras (o “mínimo escalável” pro MVP). | [Architect Specialist](../agents/architect-specialist.md) | Design overall system architecture and patterns |
| Frontend Specialist | Scaffolding Next.js + Tailwind + shadcn e layout base. | [Frontend Specialist](../agents/frontend-specialist.md) | Design and implement user interfaces |
| Backend Specialist | Setup de integração Supabase (client/server helpers) e boas práticas pra Next.js. | [Backend Specialist](../agents/backend-specialist.md) | Design and implement server-side architecture |
| Database Specialist | Checklist do “Supabase pronto”: projeto, Auth/Storage habilitados, convenções (para etapas futuras). | [Database Specialist](../agents/database-specialist.md) | Design and optimize database schemas |
| Devops Specialist | Padrões de env, scripts, lint/format e DX (local). | [Devops Specialist](../agents/devops-specialist.md) | Design and maintain CI/CD pipelines |
| Security Auditor | Garantir que secrets/env e Supabase estejam seguros (sem vazamento, boas práticas). | [Security Auditor](../agents/security-auditor.md) | Identify security vulnerabilities |
| Code Reviewer | Revisão final de consistência (padrões, DX, limpeza do scaffold). | [Code Reviewer](../agents/code-reviewer.md) | Review code changes for quality, style, and best practices |
| Documentation Writer | Atualizar docs mínimas de setup (como rodar local, env example, links). | [Documentation Writer](../agents/documentation-writer.md) | Create clear, comprehensive documentation |

## Documentation Touchpoints
| Guide | File | Task Marker | Primary Inputs |
| --- | --- | --- | --- |
| Project Overview | [project-overview.md](../docs/project-overview.md) | agent-update:project-overview | Roadmap, README, stakeholder notes |
| Architecture Notes | [architecture.md](../docs/architecture.md) | agent-update:architecture-notes | ADRs, service boundaries, dependency graphs |
| Development Workflow | [development-workflow.md](../docs/development-workflow.md) | agent-update:development-workflow | Branching rules, CI config, contributing guide |
| Testing Strategy | [testing-strategy.md](../docs/testing-strategy.md) | agent-update:testing-strategy | Test configs, CI gates, known flaky suites |
| Glossary & Domain Concepts | [glossary.md](../docs/glossary.md) | agent-update:glossary | Business terminology, user personas, domain rules |
| Data Flow & Integrations | [data-flow.md](../docs/data-flow.md) | agent-update:data-flow | System diagrams, integration specs, queue topics |
| Security & Compliance Notes | [security.md](../docs/security.md) | agent-update:security | Auth model, secrets management, compliance requirements |
| Tooling & Productivity Guide | [tooling.md](../docs/tooling.md) | agent-update:tooling | CLI scripts, IDE configs, automation workflows |

## Risk Assessment
Identify potential blockers, dependencies, and mitigation strategies before beginning work.

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Scaffolding em diretório não vazio (conflitos) | Medium | Medium | Criar app em `apps/web` (não no root). | Frontend Specialist |
| Divergência entre tokens do design system e tema do shadcn | Medium | High | Configurar CSS variables conforme `design-system.md` e validar visual do layout base. | Frontend Specialist |
| Vazamento de chaves/env (Supabase) em commit | Low | High | `.env.local` fora do Git, `.env.example` versionado, revisar `.gitignore` e documentação. | Security Auditor |
| Over-engineering cedo (monorepo/pacotes extras) | Medium | Medium | Manter “mínimo escalável”: estrutura simples nesta etapa. | Architect Specialist |
| Mudança de versão (Next/shadcn) quebrar setup | Low | Medium | Pin de versões no `package.json` após scaffold, registrar em doc. | Devops Specialist |

### Dependencies
- **Internal:** alinhamento mínimo de UI com `design-system.md` e labels/itens da navegação (PRD).
- **External:** Supabase Project (Dashboard) + credenciais; (futuro) Vercel para deploy.
- **Technical:** Node LTS, npm, Git; acesso a internet para `npm install`/`npx`.

### Assumptions
- Vamos usar **Next.js App Router** com **TypeScript** e diretório `src/` (`src/app`).
- Vamos usar **Tailwind** + **shadcn/ui** com **CSS variables** (tokens do design system).
- Se a equipe decidir “app no root” ao invés de `apps/web`, o plano precisa ajustar paths e scripts (principalmente scaffold e docs).

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 0.5–1 dia | 1 dia | 1 pessoa |
| Phase 2 - Implementation | 1–2 dias | 1–2 dias | 1–2 pessoas |
| Phase 3 - Validation | 0.5 dia | 0.5–1 dia | 1 pessoa |
| **Total** | **2–3.5 dias** | **2–4 dias** | **-** |

### Required Skills
- Next.js (App Router) + TypeScript
- Tailwind + shadcn/ui (tokens, CSS variables)
- Supabase (Auth/Storage setup e client para Next.js)
- ESLint/Prettier + scripts npm

### Resource Availability
- **Available:** 1 dev full-stack consegue executar end-to-end.
- **Blocked:** acesso ao painel Supabase/Vercel (se depender de terceiros).
- **Escalation:** PO/Tech Lead para destravar credenciais e decisões de estrutura.

## Working Phases
### Phase 1 — Discovery & Alignment
**Steps**
1. Definir (e registrar) a estrutura do repo:
   - ✅ App em `apps/web` (default deste plano)
   - Import alias `@/*` apontando para `src/*`
2. Definir convenções mínimas:
   - Estrutura de pastas (proposta abaixo)
   - Padrão de componentes (`src/components/ui` para shadcn; `src/components/layout` para shell)
3. Confirmar tokens do design system a implementar agora:
   - Light Mode como default do MVP
   - `darkMode: ["class"]` pode ficar habilitado sem UI de toggle

**Estrutura sugerida (MVP)**
- `apps/web/src/app/` (rotas e layouts)
- `apps/web/src/components/ui/` (shadcn)
- `apps/web/src/components/layout/` (Sidebar/Header/AppShell)
- `apps/web/src/lib/` (utils, supabase, helpers)
- `apps/web/src/styles/` (se necessário além de `globals.css`)

**Commit Checkpoint**
- After completing this phase, capture the agreed context and create a commit (for example, `git commit -m "chore(plan): complete phase 1 discovery"`).

### Phase 2 — Implementation & Iteration
**Steps**
1. **Scaffold Next.js + TypeScript**
   - Criar o app em `apps/web` com App Router + Tailwind + ESLint + `src/`.
   - Objetivo: `npm install` e `npm run dev` funcionando no diretório do app.
2. **Tailwind + Design Tokens**
   - Garantir `tailwind.config.ts` e `globals.css` alinhados com `design-system.md` (CSS variables em HSL).
   - Configurar fonte (Inter) via `next/font`.
3. **shadcn/ui**
   - Inicializar shadcn e adicionar componentes base do design system (mínimo):
     - `button`, `card`, `badge`, `input`, `table`, `separator`, `dropdown-menu`, `avatar`, `sheet` (para sidebar mobile).
   - Criar `src/lib/utils.ts` (cn) e validar build.
4. **Estrutura de pastas + arquivos base**
   - Criar `src/components/layout/*` e `src/lib/supabase/*` (stubs que compilam).
   - Criar páginas placeholder para navegação (ex.: Dashboard/Chamados/Checklists/Unidades/Usuários/Config).
5. **ESLint + Prettier**
   - Adicionar Prettier e scripts:
     - `format`, `format:check`
     - `lint`, `lint:fix`
   - Ajustar ESLint para não conflitar com Prettier (`eslint-config-prettier`) e habilitar regras essenciais.
6. **Env vars**
   - Criar `.env.example` (versionado) com variáveis necessárias.
   - Padronizar nomes e uso (mínimo Supabase):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - (opcional, server-only) `SUPABASE_SERVICE_ROLE_KEY`
   - Validar carregamento (checagem em runtime com mensagem clara quando faltar).
7. **Supabase (bootstrap)**
   - Criar projeto no Supabase, habilitar Auth e Storage (config mínima).
   - Instalar libs e criar helpers de client/server para Next.js (sem fluxos ainda).
8. **Layout principal**
   - Implementar AppShell com `Sidebar + Header + Content`.
   - Sidebar com itens do PRD e estados (ativo/hover) seguindo tokens do design system.

> **Nota:** esta fase é “infra”: não implementar lógica de autenticação nem RBAC aqui — só deixar pronto o terreno.

**Commit Checkpoint**
- Summarize progress, update cross-links, and create a commit documenting the outcomes of this phase (for example, `git commit -m "chore(plan): complete phase 2 implementation"`).

### Phase 3 — Validation & Handoff
**Steps**
1. Rodar checklist de qualidade:
   - `npm run lint`
   - `npm run format:check`
   - `npm run build`
2. Validar UX mínima:
   - Layout renderiza sem quebrar em viewport desktop e mobile (sidebar/sheet).
3. Registrar evidências:
   - screenshot do layout base
   - output dos comandos acima (ou logs resumidos)
4. Atualizar docs rápidas:
   - Instruções de “como rodar” + env example (no README do app ou doc do projeto)
   - Marcar itens 7–16 como prontos em `projeto/entregaveis/entrega1_tarefas.md` (quando concluído)

**Commit Checkpoint**
- Record the validation evidence and create a commit signalling the handoff completion (for example, `git commit -m "chore(plan): complete phase 3 validation"`).

## Rollback Plan
Document how to revert changes if issues arise during or after implementation.

### Rollback Triggers
When to initiate rollback:
- Critical bugs affecting core functionality
- Performance degradation beyond acceptable thresholds
- Data integrity issues detected
- Security vulnerabilities introduced
- User-facing errors exceeding alert thresholds

### Rollback Procedures
#### Phase 1 Rollback
- Action: Discard discovery branch, restore previous documentation state
- Data Impact: None (no production changes)
- Estimated Time: < 1 hour

#### Phase 2 Rollback
- Action: Reverter commits do scaffold/config e remover `apps/web` se necessário
- Data Impact: Nenhum (sem migrações/DDL nesta etapa)
- Estimated Time: < 30 min

#### Phase 3 Rollback
- Action: Reverter ajustes finais (lint/format/env/layout) até estado “compila”
- Data Impact: Nenhum
- Estimated Time: < 1 hora

### Post-Rollback Actions
1. Document reason for rollback in incident report
2. Notify stakeholders of rollback and impact
3. Schedule post-mortem to analyze failure
4. Update plan with lessons learned before retry

<!-- agent-readonly:guidance -->
## Agent Playbook Checklist
1. Pick the agent that matches your task.
2. Enrich the template with project-specific context or links.
3. Share the final prompt with your AI assistant.
4. Capture learnings in the relevant documentation file so future runs improve.

## Evidence & Follow-up
- Evidências a coletar:
  - Árvore do projeto (mínimo `apps/web/src/*` e configs)
  - Screenshot do layout principal (desktop + mobile)
  - Logs (ou status) de `lint / format:check / build`
  - Confirmação das env vars necessárias em `.env.example`
- Follow-ups imediatos (pós-etapa 7–16):
  - Planejar etapa **Autenticação** (PRD Entrega 1) em um novo plano `.context/plans/*`
  - Definir estratégia de Supabase local (CLI + migrations) para a etapa de modelos de dados

<!-- agent-update:end -->
