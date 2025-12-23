<!-- agent-update:start:tooling -->
# Tooling & Productivity Guide

Collect the scripts, automation, and editor settings that keep contributors efficient.

## Required Tooling
- Node.js — Download and install the LTS version from the official website (https://nodejs.org/). Recommended: v18.x or later. Powers the JavaScript runtime for executing the ai-context scaffolding tool, running npm scripts, and building the project.
- Git — Install from https://git-scm.com/downloads. Version 2.25+ recommended. Essential for cloning the repository, managing contributions, and tracking changes.
- npm — Bundled with Node.js installation. Version 8+ (matches Node LTS). Handles package dependencies, scripting, and scaffolding initialization via `npm install` and `npm run` commands.

## Recommended Automation
- Pre-commit hooks via Husky and lint-staged: Install with `npm install --save-dev husky lint-staged`. Configured in `package.json` to run ESLint and Prettier checks before commits, ensuring code quality without manual intervention.
- Linting and formatting: Use ESLint (`npm run lint`) for code style enforcement and Prettier (`npm run format`) for auto-formatting. Run `npm run lint:fix` to auto-resolve issues.
- Scaffolding scripts: Leverage the core `npx ai-context init` command for generating new projects. For local dev, use `npm run build` to compile TypeScript and `npm run watch` for continuous rebuilding during development loops.

## IDE / Editor Setup
- Visual Studio Code (VS Code) recommended: Download from https://code.visualstudio.com/. Configure workspace settings in `.vscode/settings.json` for integrated terminal with Node and auto-save.
- Essential extensions: 
  - ESLint (by Microsoft) — Real-time linting feedback.
  - Prettier - Code formatter (by Prettier) — Auto-formats on save.
  - GitLens (by GitKraken) — Enhanced Git blame and history views.
  - Thunder Client (by RangaVadhineni) — For testing API endpoints if extending the scaffolding with HTTP tools.
- Snippets: Use built-in JS/TS snippets or install "JavaScript (ES6) code snippets" for faster boilerplate generation.

## Supabase MCP (Model Context Protocol)

O projeto utiliza o MCP do Supabase para operações de banco de dados diretamente via agentes AI. Este é o método preferido para interagir com o Supabase durante o desenvolvimento.

### Ferramentas Disponíveis

| Ferramenta | Uso | Quando usar |
|------------|-----|-------------|
| `list_tables` | Lista todas as tabelas | Explorar estrutura do banco |
| `execute_sql` | Executa queries SQL | SELECT, INSERT, UPDATE, DELETE |
| `apply_migration` | Aplica migrations DDL | CREATE, ALTER, DROP (schema changes) |
| `list_migrations` | Lista migrations aplicadas | Verificar histórico de mudanças |
| `generate_typescript_types` | Gera types TS | Após alterações no schema |
| `get_logs` | Obtém logs por serviço | Debug de erros (api, auth, postgres, etc) |
| `get_advisors` | Verifica segurança/performance | Após mudanças DDL |
| `get_project_url` | Obtém URL da API | Configuração de clientes |
| `get_publishable_keys` | Obtém chaves públicas | Configuração de clientes |

### Exemplos de Uso

**Listar tabelas:**
```
mcp_supabase_list_tables com schemas: ["public"]
```

**Executar query:**
```sql
-- via mcp_supabase_execute_sql
SELECT * FROM usuarios WHERE ativo = true;
```

**Criar migration:**
```sql
-- via mcp_supabase_apply_migration (name: "create_chamados_table")
CREATE TABLE chamados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Boas Práticas
- Sempre use `apply_migration` para DDL — nunca `execute_sql`
- Execute `get_advisors` tipo "security" após criar tabelas para verificar RLS
- Regenere TypeScript types após mudanças no schema
- Use `get_logs` com serviço "postgres" para debug de queries lentas

## Productivity Tips
- Terminal aliases: Add to `~/.bashrc` or `~/.zshrc`: `alias scaffold='npx ai-context init'` for quick project setup, and `alias lintall='npm run lint && npm run format'` for full checks.
- Container workflows: Use Docker for consistent environments if scaling; run `docker build -t ai-context .` from the root (requires Dockerfile in repo). Mirrors production Node runtime.
- Local emulators: For testing scaffolding output, use `npm run dev` in generated projects to spin up a local server. Share dotfiles like `.eslintrc.js` and `.prettierrc` across team for consistency.
- Links to shared scripts: Check `scripts/` directory for custom utilities (e.g., `setup.sh` for one-click environment bootstrap) and `package.json` for all npm scripts.

<!-- agent-readonly:guidance -->
## AI Update Checklist
1. Verify commands align with the latest scripts and build tooling.
2. Remove instructions for deprecated tools and add replacements.
3. Highlight automation that saves time during reviews or releases.
4. Cross-link to runbooks or README sections that provide deeper context.

<!-- agent-readonly:sources -->
## Acceptable Sources
- Onboarding docs, internal wikis, and team retrospectives.
- Script directories, package manifests, CI configuration.
- Maintainer recommendations gathered during pairing or code reviews.

<!-- agent-update:end -->
