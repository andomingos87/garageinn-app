<!-- agent-update:start:development-workflow -->
# Development Workflow

Outline the day-to-day engineering process for this repository.

## Branching & Releases
This repository follows a trunk-based development model, where features and fixes are developed directly on the `main` branch with short-lived feature branches for larger changes. Pull requests (PRs) are used to merge code, ensuring reviews before integration.

Releases are managed manually via Git tags following semantic versioning (e.g., `v1.0.0`). To create a release:
1. Update the version in `package.json`.
2. Run `npm run build` to verify.
3. Tag the commit: `git tag vX.Y.Z`.
4. Push the tag: `git push origin vX.Y.Z`.
5. Publish to npm: `npm publish` (requires authentication).

Release cadence is ad-hoc, tied to feature completions or bug fixes, with no automated CI/CD pipeline currently in place for deployments.

## Local Development
- Commands to install dependencies: `npm install`
- Run the CLI locally: `npm run dev`
- Build for distribution: `npm run build`

Additional tips:
- Use `npm test` (if defined in `package.json`) to run any tests.
- For debugging, add `--inspect` flag to the dev script if needed.

## Code Review Expectations
All changes must be submitted via Pull Requests (PRs) on GitHub. Key checklists include:
- Code adheres to existing style (use ESLint if configured).
- Tests pass (if applicable).
- Documentation is updated for new features.
- No breaking changes without deprecation notices.

PRs require at least one approval from a maintainer before merging. Enforce branch protection on `main` to prevent direct pushes. Reference [AGENTS.md](../../AGENTS.md) for agent collaboration tips during reviews, such as using AI-assisted code suggestions.

## Mobile Development (Gapp)

### Setup
```bash
cd apps/mobile
npm install
cp .env.example .env  # Configure Supabase credentials
npm start
```

### Observability Stack (MVP)
Para o MVP mobile, a observabilidade será implementada com:

| Ferramenta | Propósito | Status |
|------------|-----------|--------|
| **Sentry** | Crash reporting e error tracking | Planejado (Phase 2) |
| **Console logs** | Debug em desenvolvimento | Implementado |
| **Expo Dev Tools** | Debugging e performance profiling | Disponível |

**Decisões tomadas:**
- Sentry escolhido por integração nativa com Expo e SDK leve
- Logs não devem conter PII (CPF, tokens, senhas)
- Contexto de usuário/sessão incluído nos logs (sem dados sensíveis)

### FAQ Mobile
- **Q: Qual SDK Expo usar?** A: SDK 54 (última estável em Jan/2026)
- **Q: Observabilidade provider?** A: Sentry para crash reporting, console para dev
- **Q: Offline mode?** A: Rascunho local + reenvio (não cache completo)

## Onboarding Tasks
New contributors should:
- Fork the repository and clone their fork.
- Install dependencies and run `npm run dev` to verify setup.
- Browse open issues on GitHub, particularly those labeled "good first issue" or "help wanted" for starter tasks.
- Review the [CONTRIBUTING.md](CONTRIBUTING.md) (if present) for detailed guidelines.

No internal runbooks or dashboards are currently available; triage happens via GitHub Issues and Projects board (if set up).

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Confirm branching/release steps with CI configuration and recent tags.
2. Verify local commands against `package.json`; ensure flags and scripts still exist.
3. Capture review requirements (approvers, checks) from contributing docs or repository settings.
4. Refresh onboarding links (boards, dashboards) to their latest URLs.
5. Highlight any manual steps that should become automation follow-ups.

<!-- agent-readonly:sources -->
## Acceptable Sources
- CONTRIBUTING guidelines and `AGENTS.md`.
- Build pipelines, branch protection rules, or release scripts.
- Issue tracker boards used for onboarding or triage.

<!-- agent-update:end -->
