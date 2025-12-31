# Avisos de Segurança Pendentes

> **Gerado em:** 31/12/2024  
> **Fonte:** Supabase Security Advisors  
> **Status:** 🟡 Pendente de Avaliação

---

## Resumo

| Nível | Quantidade | Descrição |
|-------|------------|-----------|
| 🔴 ERROR | 2 | Views com SECURITY DEFINER |
| 🟡 WARN | 3 | Functions sem search_path + Auth config |

---

## 🔴 Erros (ERROR)

### 1. Security Definer View: `users_with_roles`

**Severidade:** ERROR  
**Categoria:** SECURITY  
**Schema:** `public`

**Descrição:**  
A view `public.users_with_roles` está definida com a propriedade `SECURITY DEFINER`. Isso significa que a view executa com as permissões do **criador da view**, não do usuário que está fazendo a consulta. Isso pode bypassar RLS policies.

**Risco:**  
- Usuários podem acessar dados que não deveriam ver através desta view
- RLS policies não são aplicadas corretamente

**Remediação:**  
https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view

**Ação Sugerida:**
```sql
-- Verificar se SECURITY DEFINER é realmente necessário
-- Se não for, recriar a view sem essa propriedade
-- Ou adicionar verificações de segurança explícitas na view
```

---

### 2. Security Definer View: `units_with_staff`

**Severidade:** ERROR  
**Categoria:** SECURITY  
**Schema:** `public`

**Descrição:**  
A view `public.units_with_staff` está definida com a propriedade `SECURITY DEFINER`. Mesma situação da view anterior.

**Risco:**  
- Bypass de RLS policies
- Exposição indevida de dados de funcionários/unidades

**Remediação:**  
https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view

**Ação Sugerida:**
```sql
-- Avaliar se a view precisa de SECURITY DEFINER
-- Considerar usar SECURITY INVOKER (padrão) se possível
```

---

## 🟡 Avisos (WARN)

### 3. Function Search Path Mutable: `is_rh`

**Severidade:** WARN  
**Categoria:** SECURITY  
**Schema:** `public`

**Descrição:**  
A função `public.is_rh` não tem o parâmetro `search_path` definido. Isso pode permitir ataques de "search path injection" onde um atacante cria objetos maliciosos em schemas que aparecem antes no search_path.

**Risco:**  
- Potencial para SQL injection via search_path manipulation
- Comportamento imprevisível se schemas forem modificados

**Remediação:**  
https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

**Ação Sugerida:**
```sql
-- Adicionar search_path fixo à função
ALTER FUNCTION public.is_rh() SET search_path = public;

-- Ou recriar a função com:
CREATE OR REPLACE FUNCTION public.is_rh()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
  -- corpo da função
$$;
```

---

### 4. Function Search Path Mutable: `ticket_needs_approval`

**Severidade:** WARN  
**Categoria:** SECURITY  
**Schema:** `public`

**Descrição:**  
A função `public.ticket_needs_approval` não tem o parâmetro `search_path` definido.

**Risco:**  
- Mesmo risco da função anterior
- Esta função é usada no fluxo de aprovação de sinistros

**Remediação:**  
https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

**Ação Sugerida:**
```sql
ALTER FUNCTION public.ticket_needs_approval(uuid, uuid) SET search_path = public;
```

---

### 5. Leaked Password Protection Disabled

**Severidade:** WARN  
**Categoria:** SECURITY  
**Tipo:** Auth Configuration

**Descrição:**  
A proteção contra senhas vazadas está desabilitada no Supabase Auth. O Supabase pode verificar senhas contra o banco de dados do HaveIBeenPwned.org para impedir o uso de senhas comprometidas.

**Risco:**  
- Usuários podem usar senhas que já foram expostas em vazamentos de dados
- Maior vulnerabilidade a ataques de credential stuffing

**Remediação:**  
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

**Ação Sugerida:**
1. Acessar o Dashboard do Supabase
2. Ir em Authentication → Settings → Security
3. Habilitar "Leaked Password Protection"

---

## Plano de Ação Recomendado

### Prioridade Alta (Fazer Primeiro)
1. [ ] Avaliar views `users_with_roles` e `units_with_staff` - verificar se SECURITY DEFINER é necessário
2. [ ] Habilitar Leaked Password Protection no Auth

### Prioridade Média
3. [ ] Corrigir search_path das funções `is_rh` e `ticket_needs_approval`

### Investigação Necessária
- [ ] Verificar quais outras views/functions podem ter problemas similares
- [ ] Documentar por que SECURITY DEFINER foi usado (se intencional)

---

## Comandos para Diagnóstico

```sql
-- Listar todas as views com SECURITY DEFINER
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE schemaname = 'public';

-- Listar funções sem search_path definido
SELECT proname, prosecdef, proconfig
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (proconfig IS NULL OR NOT 'search_path' = ANY(proconfig));

-- Ver definição da view users_with_roles
SELECT pg_get_viewdef('public.users_with_roles'::regclass, true);

-- Ver definição da view units_with_staff  
SELECT pg_get_viewdef('public.units_with_staff'::regclass, true);
```

---

## Histórico

| Data | Ação | Responsável |
|------|------|-------------|
| 31/12/2024 | Documentação criada | Sistema |
| - | Pendente avaliação | - |

