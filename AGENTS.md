# AGENTS.md

## Dev environment tips
- Install dependencies with `npm install` before running scaffolds.
- Use `npm run dev` for the interactive TypeScript session that powers local experimentation.
- Run `npm run build` to refresh the CommonJS bundle in `dist/` before shipping changes.
- Store generated artefacts in `.context/` so reruns stay deterministic.

## Testing instructions
- Execute `npm run test` to run the Jest suite.
- Append `-- --watch` while iterating on a failing spec.
- Trigger `npm run build && npm run test` before opening a PR to mimic CI.
- Add or update tests alongside any generator or CLI changes.

## PR instructions
- Follow Conventional Commits (for example, `feat(scaffolding): add doc links`).
- Cross-link new scaffolds in `docs/README.md` and `agents/README.md` so future agents can find them.
- Attach sample CLI output or generated markdown when behaviour shifts.
- Confirm the built artefacts in `dist/` match the new source changes.

## Repository map
- `design-system.md/` — explain what lives here and when agents should edit it.
- `favicon.ico/` — explain what lives here and when agents should edit it.
- `logo-garageinn.png/` — explain what lives here and when agents should edit it.
- `projeto/` — explain what lives here and when agents should edit it.

## Supabase MCP Integration
Este projeto utiliza o **Supabase** como backend. **Sempre utilize o MCP do Supabase** para operações de banco de dados:

### Quando usar o MCP Supabase:
- **Consultas ao banco**: Use `mcp_supabase_execute_sql` para queries SELECT
- **Alterações de schema**: Use `mcp_supabase_apply_migration` para DDL (CREATE, ALTER, DROP)
- **Verificar estrutura**: Use `mcp_supabase_list_tables` para listar tabelas existentes
- **Gerar types**: Use `mcp_supabase_generate_typescript_types` após alterações no schema
- **Debug**: Use `mcp_supabase_get_logs` para investigar erros
- **Segurança**: Use `mcp_supabase_get_advisors` após mudanças DDL para verificar RLS

### Regras importantes:
1. **Nunca execute DDL diretamente** — sempre use `apply_migration` para manter histórico
2. **Sempre verifique advisors de segurança** após criar/alterar tabelas
3. **Gere TypeScript types** após mudanças no schema para manter tipagem atualizada
4. Para operações de leitura simples, prefira `execute_sql` sobre chamadas via código

### RLS Best Practices para Políticas UPDATE

> ⚠️ **Regra Crítica**: No PostgreSQL, quando uma política UPDATE **não tem `WITH CHECK`**, a cláusula `USING` é aplicada tanto à linha ANTIGA quanto à NOVA. Isso causa falhas silenciosas quando o UPDATE modifica colunas referenciadas no `USING`.

**Padrão obrigatório para políticas UPDATE:**

```sql
-- ✅ CORRETO: WITH CHECK explícito
CREATE POLICY example_update ON table_name
FOR UPDATE TO authenticated
USING (
  -- Verifica permissão de ACESSO à linha original
  owner_id = auth.uid()
)
WITH CHECK (
  -- Verifica se o NOVO valor é permitido
  -- Use (true) se qualquer valor novo é aceito
  true
);

-- ❌ INCORRETO: Sem WITH CHECK
CREATE POLICY example_update ON table_name
FOR UPDATE TO authenticated
USING (status = 'pending');  -- FALHA se UPDATE mudar status!
```

**Quando usar `WITH CHECK (true)`:**
- A intenção é apenas verificar se o usuário pode acessar a linha
- Não há restrições sobre os novos valores

**Quando definir `WITH CHECK` específico:**
- Há restrições sobre quais valores o usuário pode definir
- Ex: `WITH CHECK (priority <= user_max_priority)`

**Debugging de Erros RLS 42501:**
1. Listar TODAS as políticas da tabela: `SELECT * FROM pg_policies WHERE tablename = 'x'`
2. Verificar `with_check` de cada política - se NULL, o `USING` será usado
3. Simular o UPDATE mentalmente: a condição `USING` será válida APÓS o UPDATE?
4. Lembrar: múltiplas políticas PERMISSIVE têm seus `WITH CHECK` combinados com AND

**Referência completa:** `.context/docs/rls-patterns.md`

## AI Context References
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`
- Contributor guide: `CONTRIBUTING.md`
