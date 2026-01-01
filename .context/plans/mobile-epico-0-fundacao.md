---
id: plan-mobile-epico-0-fundacao
ai_update_goal: "Define the stages, owners, and evidence required to complete Épico 0 — Fundação Mobile (Expo + Navegação + Tema + Observabilidade)."
required_inputs:
  - "Task summary or issue link describing the goal"
  - "Relevant documentation sections from docs/README.md"
  - "Matching agent playbooks from agents/README.md"
success_criteria:
  - "Stages list clear owners, deliverables, and success signals"
  - "Plan references documentation and agent resources that exist today"
  - "Follow-up actions and evidence expectations are recorded"
related_agents:
  - "code-reviewer"
  - "bug-fixer"
  - "feature-developer"
  - "refactoring-specialist"
  - "test-writer"
  - "documentation-writer"
  - "performance-optimizer"
  - "security-auditor"
  - "backend-specialist"
  - "frontend-specialist"
  - "architect-specialist"
  - "devops-specialist"
  - "database-specialist"
  - "mobile-specialist"
---

<!-- agent-update:start:plan-mobile-epico-0-fundacao -->
# Épico 0 — Fundação Mobile (Expo + Navegação + Tema + Observabilidade) Plan

> Implementar a fundação do app mobile Gapp com Expo + TypeScript, incluindo: estrutura de projeto, navegação base com tabs/stacks, tema com tokens principais (cor primária vermelho Garageinn, tipografia, componentes base) e observabilidade mínima (crash reporting, logs).

## Task Snapshot
- **Primary goal:** Establish the core structure for the Gapp mobile app using Expo and TypeScript, setting up project initialization, basic navigation with tabs and stacks, a consistent theme featuring Garageinn's primary red color, typography, and base UI components, plus minimal observability through crash reporting and logging integration.
- **Success signal:** The app launches successfully on an iOS/Android simulator or device, navigation between tabs and stacks functions without errors, theme tokens are applied uniformly to base components, and observability tools capture logs and crashes during basic interactions, with all changes passing initial tests and reviews.
- **Key references:**
  - [Documentation Index](../docs/README.md)
  - [Agent Handbook](../agents/README.md)
  - [Plans Index](./README.md)

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Code Reviewer | Ensures code quality, adherence to TypeScript standards, and Expo best practices across all changes. | [Code Reviewer](../agents/code-reviewer.md) | Review initial project setup and Expo configuration for consistency and errors |
| Bug Fixer | Addresses any runtime errors, Expo compatibility issues, or navigation glitches discovered during development. | [Bug Fixer](../agents/bug-fixer.md) | Triage and fix setup-related bugs from Expo initialization |
| Feature Developer | Builds out the navigation, theme, and observability features according to the epic specifications. | [Feature Developer](../agents/feature-developer.md) | Implement the basic tab/stack navigation structure |
| Refactoring Specialist | Reviews and refines the initial codebase for maintainability, especially in theme and component setup. | [Refactoring Specialist](../agents/refactoring-specialist.md) | Refactor early code smells in project structure post-initialization |
| Test Writer | Creates unit and integration tests for navigation flows, theme application, and observability hooks. | [Test Writer](../agents/test-writer.md) | Write tests for theme token consistency across components |
| Documentation Writer | Updates docs with setup guides, theme token definitions, and observability configuration details. | [Documentation Writer](../agents/documentation-writer.md) | Document the Expo project setup process and dependencies |
| Performance Optimizer | Monitors initial app load times and navigation performance, optimizing theme and logging impacts. | [Performance Optimizer](../agents/performance-optimizer.md) | Profile navigation transitions for smoothness |
| Security Auditor | Scans for vulnerabilities in Expo dependencies and observability integrations (e.g., crash reporting APIs). | [Security Auditor](../agents/security-auditor.md) | Audit third-party logging libraries for data exposure risks |
| Backend Specialist | Consults on future integration points for observability data syncing, though minimal involvement now. | [Backend Specialist](../agents/backend-specialist.md) | Define initial API stubs for crash reporting endpoints |
| Frontend Specialist | Designs and implements the UI theme, base components, and navigation visuals. | [Frontend Specialist](../agents/frontend-specialist.md) | Create base styled components using the Garageinn red theme |
| Architect Specialist | Oversees the overall mobile app architecture, ensuring scalability for future epics. | [Architect Specialist](../agents/architect-specialist.md) | Validate the Expo + TypeScript project structure against architecture notes |
| Devops Specialist | Sets up CI/CD for mobile builds and configures observability pipelines. | [Devops Specialist](../agents/devops-specialist.md) | Integrate Expo EAS for build automation |
| Database Specialist | Minimal role; notes any local storage needs for observability logs if applicable. | [Database Specialist](../agents/database-specialist.md) | Specify local persistence schema for crash logs |
| Mobile Specialist | Leads Expo setup, navigation implementation, and cross-platform testing. | [Mobile Specialist](../agents/mobile-specialist.md) | Initialize the Expo project with TypeScript template |

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
| Expo SDK version incompatibilities with TypeScript or dependencies | Medium | High | Use latest stable Expo SDK; test on multiple Node versions early | Mobile Specialist |
| Theme inconsistencies across iOS/Android platforms | Low | Medium | Leverage Expo's cross-platform styling tools; manual QA on both platforms | Frontend Specialist |
| Observability tools adding unexpected bundle size or performance overhead | Medium | Low | Select lightweight libraries like Sentry; monitor with Performance Optimizer | Devops Specialist |

### Dependencies
- **Internal:** Alignment with project roadmap in project-overview.md; no other teams initially.
- **External:** Expo CLI and SDK availability; third-party services like Sentry for crash reporting.
- **Technical:** Node.js >=18, Yarn/NPM for package management; access to iOS/Android simulators.

### Assumptions
- Expo is the approved framework for cross-platform mobile development, as per architecture notes.
- No backend integration required yet; observability is client-side only. If assumptions prove false, escalate to Architect Specialist for plan revision.

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time | Team Size |
| --- | --- | --- | --- |
| Phase 1 - Discovery | 2 person-days | 3-5 days | 1-2 people |
| Phase 2 - Implementation | 5 person-days | 1-2 weeks | 2-3 people |
| Phase 3 - Validation | 2 person-days | 3-5 days | 1-2 people |
| **Total** | **9 person-days** | **2-3 weeks** | **-** |

### Required Skills
- React Native/Expo experience for mobile setup and navigation.
- TypeScript proficiency for type-safe component and theme definitions.
- UI/UX design basics for theme implementation; familiarity with observability tools like Sentry or LogRocket.
- Identify skill gaps: If no Expo expert, provide training via tooling.md guides; escalate to Devops Specialist for CI setup.

### Resource Availability
- **Available:** Mobile Specialist (full-time), Frontend Specialist (part-time); leverage agent playbooks for AI-assisted tasks.
- **Blocked:** None initially; monitor for overlapping epics.
- **Escalation:** Architect Specialist if mobile expertise is insufficient.

## Working Phases
### Phase 1 — Discovery & Alignment ✅ COMPLETED
**Steps**
1. ✅ Review epic requirements against project-overview.md and architecture.md; clarify theme tokens (e.g., Garageinn red: #FF3D3D) and observability scope (Owner: Architect Specialist; Deliverable: Refined spec document; Evidence: Updated glossary.md with terms like "theme tokens").
2. ✅ Initialize Expo project skeleton using `npx create-expo-app --template`; validate TypeScript setup (Owner: Mobile Specialist; Deliverable: Basic repo structure; Evidence: Commit with initial files, no build errors).
3. ✅ Identify open questions, e.g., exact observability provider (Sentry vs. others), and hold alignment meeting (Owner: Documentation Writer; Deliverable: FAQ section in development-workflow.md; Evidence: Meeting notes in issue tracker).

**Phase 1 Evidence (2026-01-01)**
- Expo SDK 54 + TypeScript inicializado em `apps/mobile/`
- Estrutura de pastas `src/` criada com módulos: components, hooks, lib, modules, navigation, theme, types
- Theme tokens implementados: `src/theme/colors.ts`, `typography.ts`, `spacing.ts`
- Cor primária Garageinn definida: `#FF3D3D` (HSL: 0, 95%, 60%)
- Componentes base criados: Button, Input, TextArea, Card, Badge, Loading, EmptyState
- Supabase client configurado com variáveis de ambiente seguras (`.env.example`)
- TypeScript compila sem erros (`npm run typecheck` ✓)
- Glossário atualizado com termos: "Theme Tokens", "Primary Color", "Gapp"
- FAQ de observabilidade documentado em `development-workflow.md`
- Decisão: Sentry para crash reporting (a integrar na Phase 2)

**Commit Checkpoint**
- ✅ `git commit -m "feat(mobile): initialize expo project with theme and base components"`

### Phase 2 — Implementation & Iteration ✅ COMPLETED
**Steps**
1. ✅ Implement navigation with React Navigation: Set up tabs and stacks for main screens (Owner: Feature Developer; Deliverable: Functional navigation prototype; Evidence: Demo video or screenshots; Reference: Mobile Specialist playbook for Expo integrations).
2. ✅ Define and apply theme: Create tokens for colors, typography; build base components (e.g., Button, Text) (Owner: Frontend Specialist; Deliverable: Themed UI kit; Evidence: Storybook or component tests; Reference: Frontend Specialist playbook for styling best practices).
3. ✅ Integrate observability: Add logging with console/debugger and crash reporting (e.g., Sentry Expo plugin) (Owner: Devops Specialist; Deliverable: Configured hooks; Evidence: Sample log output and crash simulation; Reference: Tooling.md for setup scripts).
4. ✅ Conduct iterative reviews: Pair on changes, fix bugs inline (Owner: Code Reviewer; Deliverable: Clean PRs; Evidence: Review comments resolved).

**Phase 2 Evidence (2026-01-01)**

**Navegação Implementada:**
- React Navigation v7 com `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- `react-native-screens` e `react-native-safe-area-context` instalados
- Estrutura de navegação type-safe com TypeScript:
  - `RootNavigator`: gerencia autenticação (Login/Main)
  - `MainTabNavigator`: 4 abas principais (Home, Checklists, Tickets, Profile)
  - Stack navigators para cada módulo com telas de detalhe
- Tipos de navegação definidos em `src/navigation/types.ts`
- Temas customizados Garageinn (light/dark) aplicados ao NavigationContainer

**Telas Implementadas:**
- **Home**: Dashboard com cards de status, ações rápidas, atividade recente
- **Checklists**: Lista de checklists disponíveis, histórico, execução
- **Tickets**: Grid de tipos de chamado, lista de chamados, criação
- **Profile**: Informações do usuário, menu de configurações, logout
- **Auth**: Login, recuperação de senha, redefinição de senha
- **Modais**: Notificações, Configurações

**Observabilidade Integrada:**
- `@sentry/react-native` instalado e configurado
- Plugin Sentry no `app.json` para source maps
- Sistema de logging estruturado (`src/lib/observability/logger.ts`)
- Hooks de observabilidade:
  - `useScreenTracking`: rastreia navegação entre telas
  - `useActionTracking`: rastreia ações do usuário
  - `useAppStateTracking`: monitora foreground/background
  - `usePerformanceTracking`: mede performance de operações
  - `useErrorTracking`: captura e reporta erros
- Breadcrumbs automáticos para debugging
- Configuração de DSN via variável de ambiente (`EXPO_PUBLIC_SENTRY_DSN`)

**Qualidade de Código:**
- TypeScript compila sem erros (`npm run typecheck` ✓)
- Componentes seguem padrões de acessibilidade (SafeAreaView, etc.)
- Tema aplicado consistentemente em todas as telas
- Suporte a dark mode nativo via `useColorScheme`

**Commit Checkpoint**
- ✅ `git commit -m "feat(mobile): implement navigation, screens, and observability"`

### Phase 3 — Validation & Handoff
**Steps**
1. Run comprehensive tests: Unit tests for components, integration for navigation/observability (Owner: Test Writer; Deliverable: 80% coverage report; Evidence: Jest/Vitest results; Reference: Testing Strategy doc).
2. Perform security and performance audits: Scan dependencies, profile app startup (Owner: Security Auditor and Performance Optimizer; Deliverable: Audit report; Evidence: No high-severity issues, metrics under thresholds).
3. Update documentation: Add setup guides, theme usage, and observability troubleshooting (Owner: Documentation Writer; Deliverable: Revised docs sections; Evidence: Diffs in PR).
4. Final review and handoff: Ensure cross-platform compatibility (iOS/Android) (Owner: Mobile Specialist; Deliverable: Release-ready branch; Evidence: Simulator runs on both platforms).

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
- Action: Revert commits via `git reset --hard HEAD~n`; remove Expo node_modules and reinstall from clean package.json; delete any local storage from observability tests
- Data Impact: Minimal; no persistent data changes, but re-test theme applications
- Estimated Time: 2-4 hours

#### Phase 3 Rollback
- Action: Full deployment rollback using Expo EAS revert; restore previous build artifacts
- Data Impact: Sync any test logs back to baseline; no user data affected
- Estimated Time: 1-2 hours

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
- Artifacts to collect: PR links for each phase, test run reports (e.g., Jest coverage), build logs from Expo, theme design specs, observability dashboard screenshots.
- Follow-up actions: Architect Specialist to confirm alignment with future epics; schedule demo for stakeholders; monitor for post-merge issues via Bug Fixer.
<!-- agent-update:end -->

</plan>
