# Padrões RLS do GarageInn

> Guia de boas práticas para Row-Level Security (RLS) no Supabase/PostgreSQL

## Anatomia de uma Política UPDATE Segura

```sql
CREATE POLICY policy_name ON table_name
FOR UPDATE TO authenticated
USING (
  -- USANDO: "Quem pode VER/ACESSAR esta linha?"
  -- Executado ANTES do UPDATE para filtrar linhas
  -- ⚠️ Se não houver WITH CHECK, também executado APÓS com novos valores!
  condition_for_access
)
WITH CHECK (
  -- COM VERIFICAÇÃO: "Quais valores NOVOS são permitidos?"
  -- Executado APÓS o UPDATE para validar o resultado
  -- Se omitido, USING é usado (pode causar falhas!)
  condition_for_new_values
);
```

## Regra Crítica: WITH CHECK em Políticas UPDATE

No PostgreSQL, quando uma política UPDATE **não tem `WITH CHECK`**, a cláusula `USING` é aplicada tanto à linha ANTIGA quanto à NOVA. Isso causa falhas silenciosas quando o UPDATE modifica colunas referenciadas no `USING`.

### Exemplos

```sql
-- ✅ CORRETO: WITH CHECK explícito
CREATE POLICY tickets_update_approver ON tickets
FOR UPDATE TO authenticated
USING (
  -- Verifica se usuário tem permissão baseado no status ATUAL
  EXISTS (
    SELECT 1 FROM ticket_approvals ta
    WHERE ta.ticket_id = tickets.id
    AND ta.approval_level = CASE tickets.status
      WHEN 'awaiting_approval_encarregado' THEN 1
      WHEN 'awaiting_approval_supervisor' THEN 2
      WHEN 'awaiting_approval_gerente' THEN 3
    END
    ...
  )
)
WITH CHECK (true);  -- Permite qualquer novo valor após validar acesso

-- ❌ INCORRETO: Sem WITH CHECK
CREATE POLICY tickets_update_approver ON tickets
FOR UPDATE TO authenticated
USING (
  -- Esta condição será verificada TAMBÉM no novo status!
  -- Se UPDATE muda status de 'encarregado' para 'supervisor',
  -- a verificação falhará porque o aprovador é nível 1, não 2
  ta.approval_level = CASE tickets.status ...
);
```

## Caso de Estudo: Bug de Aprovação de Tickets

### Contexto
Sistema de aprovação hierárquica onde tickets passam por Encarregado → Supervisor → Gerente.

### Problema
Política verificava `tickets.status` para determinar nível de aprovação, mas o UPDATE mudava o status, invalidando a condição.

### Sintoma
```
Error: new row violates row-level security policy for table "tickets"
Code: 42501
```

### Causa
```sql
-- Política problemática (sem WITH CHECK)
USING (
  ta.approval_level = CASE tickets.status
    WHEN 'awaiting_approval_encarregado' THEN 1  -- Válido ANTES
    WHEN 'awaiting_approval_supervisor' THEN 2   -- Esperado DEPOIS!
  END
)
-- PostgreSQL aplica USING ao novo status também → FALHA
```

### Por que foi difícil detectar
1. **Comportamento implícito**: Documentação não enfatiza que `USING` verifica linha nova
2. **Erro genérico**: Código 42501 não indica qual política ou condição falhou
3. **Múltiplas políticas**: Várias políticas UPDATE na tabela, erro não indica qual
4. **Testes parciais passavam**: Aprovação em `ticket_approvals` funcionava

### Solução
```sql
USING (...)
WITH CHECK (true)  -- Permite qualquer novo valor após validar acesso
```

## Padrões de Risco

### 1. State Transition Trap
Política que verifica valores que serão modificados pelo próprio UPDATE.

| Cenário de Risco | Coluna | Problema |
|------------------|--------|----------|
| Aprovar ticket | `status` | Política verifica status atual, UPDATE muda status |
| Atribuir tarefa | `assigned_to` | Política verifica `assigned_to = auth.uid()`, UPDATE muda atribuição |
| Promover usuário | `role` | Política verifica role atual, UPDATE muda role |

### 2. Multiple Policy Trap
Múltiplas políticas PERMISSIVE na mesma tabela têm seus `WITH CHECK` combinados com AND.

```sql
-- Política 1: Dono pode editar
CREATE POLICY update_own ON tickets
FOR UPDATE USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());  -- ⚠️ Bloqueia aprovadores!

-- Política 2: Aprovador pode editar
CREATE POLICY update_approver ON tickets
FOR UPDATE USING (is_approver())
WITH CHECK (true);

-- Resultado: Aprovador passa no USING da política 2,
-- mas FALHA no WITH CHECK da política 1!
```

**Solução**: Remover `WITH CHECK` de políticas que não devem restringir outras:
```sql
CREATE POLICY update_own ON tickets
FOR UPDATE USING (created_by = auth.uid());
-- Sem WITH CHECK = usa USING, que só verifica acesso
```

## Checklist para Novas Políticas UPDATE

- [ ] `WITH CHECK` está definido explicitamente?
- [ ] Se `USING` referencia colunas no `SET`, `WITH CHECK` está correto?
- [ ] Testei o fluxo completo (não apenas permissão de acesso)?
- [ ] Documentei a intenção da política com comentário SQL?
- [ ] Verifiquei interação com outras políticas PERMISSIVE na tabela?
- [ ] Listei todas as políticas existentes antes de adicionar nova?

## Debugging de Erros RLS 42501

### Passo 1: Listar todas as políticas
```sql
SELECT policyname, cmd, qual as using_clause, with_check
FROM pg_policies 
WHERE tablename = 'sua_tabela'
ORDER BY policyname;
```

### Passo 2: Identificar políticas sem WITH CHECK
```sql
SELECT policyname, cmd
FROM pg_policies 
WHERE tablename = 'sua_tabela'
AND cmd = 'UPDATE'
AND with_check IS NULL;  -- ⚠️ Estas usam USING como WITH CHECK
```

### Passo 3: Simular o UPDATE
Para cada política UPDATE, pergunte:
1. A condição `USING` é válida para a linha ANTES do UPDATE? 
2. A condição `USING` (ou `WITH CHECK`) é válida para a linha DEPOIS do UPDATE?

### Passo 4: Verificar auth.uid()
```sql
-- Criar função de debug temporária
CREATE OR REPLACE FUNCTION get_auth_uid_debug()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(auth.uid()::text, 'NULL');
$$;

-- Chamar via RPC no código para verificar propagação
const { data } = await supabase.rpc('get_auth_uid_debug');
```

## Referências

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Plano de correção original](./../plans/fix-ticket-rls-update-approver.md)
