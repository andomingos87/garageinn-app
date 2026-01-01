<!-- agent-update:start:glossary -->
# Glossary & Domain Concepts

List project-specific terminology, acronyms, domain entities, and user personas.

## Core Terms
- **Projeto** — Refers to a structured initiative or task container within the application, encompassing resources, timelines, and collaborators. It is central to the domain model and surfaces in modules like `projeto/models.py` and API endpoints under `/api/projetos/`.
- **Tarefa** — A specific actionable item or sub-unit within a Projeto, including details like status, assignee, and deadlines. Defined in the task management workflow and related to `projeto/tasks.py`.

## Mobile Terms
- **Theme Tokens** — Design system primitives (colors, typography, spacing) used to maintain visual consistency across the mobile app. Defined in `apps/mobile/src/theme/`.
- **Primary Color** — The main brand color for Garageinn: vermelho vibrante `#FF3D3D` (HSL: 0, 95%, 60%). Used for CTAs, active states, and brand elements.
- **Gapp** — Nome do aplicativo mobile Garageinn para operações de campo (Checklists, Chamados, Perfil).

## Acronyms & Abbreviations
- **API** — Application Programming Interface; a set of protocols for building and integrating software applications. Used extensively for backend-frontend communication in this repository, particularly in RESTful endpoints defined in `projeto/api/`.

## Personas / Actors
- **Desenvolvedor** — A software engineer responsible for implementing features. Goals: Efficiently code, test, and deploy changes; key workflows: Git-based version control, local development setup, and CI/CD pipelines; pain points: Dependency conflicts and unclear documentation, addressed via the project's setup guides and automated testing.

## Domain Rules & Invariants
- **Task Assignment Constraints**: A Tarefa can only be assigned to one user at a time; enforced via database unique constraints in `projeto/models.py` to prevent overlaps.
- **Project Status Transitions**: Projetos must follow a linear state machine (e.g., Draft → Active → Completed); invalid transitions raise validation errors, ensuring compliance with agile methodologies.
- **Localization Nuances**: All user-facing strings in the application support Portuguese (PT-BR) as the primary locale, with date formats adhering to ISO 8601 for regulatory consistency in Brazilian contexts. No multi-region specifics beyond this, but future expansions could include EU GDPR compliance for data handling.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Harvest terminology from recent PRs, issues, and discussions.
2. Confirm definitions with product or domain experts when uncertain.
3. Link terms to relevant docs or modules for deeper context.
4. Remove or archive outdated concepts; flag unknown terms for follow-up.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Product requirement docs, RFCs, user research, or support tickets.
- Service contracts, API schemas, data dictionaries.
- Conversations with domain experts (summarize outcomes if applicable).

<!-- agent-update:end -->
