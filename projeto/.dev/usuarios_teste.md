# Usuários de Teste - GarageInn

**Senha padrão para todos os usuários:** `Teste123!`

## Resumo
- **Total de usuários criados:** 31
- **Data de criação:** 11/01/2026
- **Status:** Todos ativos e com email confirmado
- **Padrão de email:** `{cargo}_{setor}_teste@garageinn.com`

---

## Cargos Globais (3 usuários)

| Email | Nome | Cargo | Unidades |
|-------|------|-------|----------|
| `desenvolvedor_global_teste@garageinn.com` | Teste Desenvolvedor - Global | Desenvolvedor | - |
| `diretor_global_teste@garageinn.com` | Teste Diretor - Global | Diretor | - |
| `administrador_global_teste@garageinn.com` | Teste Administrador - Global | Administrador | - |

---

## Departamento: Operações (4 usuários)

| Email | Nome | Cargo | Unidades |
|-------|------|-------|----------|
| `manobrista_operacoes_teste@garageinn.com` | Teste Manobrista - Operações | Manobrista | BERRINI ONE |
| `encarregado_operacoes_teste@garageinn.com` | Teste Encarregado - Operações | Encarregado | TOWER BRIDGE |
| `supervisor_operacoes_teste@garageinn.com` | Teste Supervisor - Operações | Supervisor | BERRINI ONE, TOWER BRIDGE, HEBRAICA, CUBO, MARIA CECILIA |
| `gerente_operacoes_teste@garageinn.com` | Teste Gerente - Operações | Gerente | - |

---

## Departamento: Compras e Manutenção (3 usuários)

| Email | Nome | Cargo | Unidades |
|-------|------|-------|----------|
| `assistente_compras_e_manutencao_teste@garageinn.com` | Teste Assistente - Compras e Manutenção | Assistente | - |
| `comprador_compras_e_manutencao_teste@garageinn.com` | Teste Comprador - Compras e Manutenção | Comprador | - |
| `gerente_compras_e_manutencao_teste@garageinn.com` | Teste Gerente - Compras e Manutenção | Gerente | - |

---

## Departamento: Financeiro (7 usuários)

| Email | Nome | Cargo | Unidades |
|-------|------|-------|----------|
| `auxiliar_financeiro_teste@garageinn.com` | Teste Auxiliar - Financeiro | Auxiliar | - |
| `assistente_financeiro_teste@garageinn.com` | Teste Assistente - Financeiro | Assistente | - |
| `analista_junior_financeiro_teste@garageinn.com` | Teste Analista Júnior - Financeiro | Analista Júnior | - |
| `analista_pleno_financeiro_teste@garageinn.com` | Teste Analista Pleno - Financeiro | Analista Pleno | - |
| `analista_senior_financeiro_teste@garageinn.com` | Teste Analista Sênior - Financeiro | Analista Sênior | - |
| `supervisor_financeiro_teste@garageinn.com` | Teste Supervisor - Financeiro | Supervisor | - |
| `gerente_financeiro_teste@garageinn.com` | Teste Gerente - Financeiro | Gerente | - |

---

## Departamento: RH (7 usuários)

| Email | Nome | Cargo | Unidades |
|-------|------|-------|----------|
| `auxiliar_rh_teste@garageinn.com` | Teste Auxiliar - RH | Auxiliar | - |
| `assistente_rh_teste@garageinn.com` | Teste Assistente - RH | Assistente | - |
| `analista_junior_rh_teste@garageinn.com` | Teste Analista Júnior - RH | Analista Júnior | - |
| `analista_pleno_rh_teste@garageinn.com` | Teste Analista Pleno - RH | Analista Pleno | - |
| `analista_senior_rh_teste@garageinn.com` | Teste Analista Sênior - RH | Analista Sênior | - |
| `supervisor_rh_teste@garageinn.com` | Teste Supervisor - RH | Supervisor | - |
| `gerente_rh_teste@garageinn.com` | Teste Gerente - RH | Gerente | - |

---

## Departamento: Sinistros (2 usuários)

| Email | Nome | Cargo | Unidades |
|-------|------|-------|----------|
| `supervisor_sinistros_teste@garageinn.com` | Teste Supervisor - Sinistros | Supervisor | - |
| `gerente_sinistros_teste@garageinn.com` | Teste Gerente - Sinistros | Gerente | - |

---

## Departamento: Comercial (1 usuário)

| Email | Nome | Cargo | Unidades |
|-------|------|-------|----------|
| `gerente_comercial_teste@garageinn.com` | Teste Gerente - Comercial | Gerente | - |

---

## Departamento: Auditoria (2 usuários)

| Email | Nome | Cargo | Unidades |
|-------|------|-------|----------|
| `auditor_auditoria_teste@garageinn.com` | Teste Auditor - Auditoria | Auditor | - |
| `gerente_auditoria_teste@garageinn.com` | Teste Gerente - Auditoria | Gerente | - |

---

## Departamento: TI (2 usuários)

| Email | Nome | Cargo | Unidades |
|-------|------|-------|----------|
| `analista_ti_teste@garageinn.com` | Teste Analista - TI | Analista | - |
| `gerente_ti_teste@garageinn.com` | Teste Gerente - TI | Gerente | - |

---

## Regras de Vínculo com Unidades

Conforme documentação em `projeto/usuarios/departamentos_cargos.md`:

1. **Manobrista e Encarregado (Operações):** Vinculados a **1 unidade** (trabalham em uma unidade específica)
2. **Supervisor (Operações):** Vinculado a **várias unidades** (supervisiona múltiplas unidades)
3. **Demais cargos:** **Sem vínculo** com unidades (trabalham para todas as unidades)

---

## Notas Importantes

1. **Todos os usuários estão com status "active"** e podem fazer login imediatamente.
2. **Os emails estão confirmados**, não é necessário verificação de email.
3. **A senha padrão `Teste123!`** deve ser alterada em ambiente de produção.
4. Estes usuários são apenas para fins de teste e desenvolvimento.

---

## Como usar

Para fazer login com qualquer usuário de teste:
1. Acesse a página de login do sistema
2. Use o email do usuário desejado (ex: `manobrista_operacoes_teste@garageinn.com`)
3. Use a senha: `Teste123!`

---

## Edge Function utilizada

A Edge Function `create-test-users` foi criada para gerar estes usuários automaticamente.
Para recriar os usuários (caso sejam deletados), execute:

```bash
curl -X POST "https://llxgumwacwgppoxkawnu.supabase.co/functions/v1/create-test-users" \
  -H "Content-Type: application/json" \
  -d '{"secret_key": "garageinn-test-2026"}'
```

---

## Rollback (Remover usuários de teste)

Para remover todos os usuários de teste, execute o seguinte SQL:

```sql
-- Remover vínculos com unidades
DELETE FROM user_units 
WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%_teste@garageinn.com'
);

-- Remover vínculos com cargos
DELETE FROM user_roles 
WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%_teste@garageinn.com'
);

-- Remover perfis (cascade para auth.users)
DELETE FROM profiles WHERE email LIKE '%_teste@garageinn.com';
```
