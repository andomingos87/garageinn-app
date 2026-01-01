# Usuários de Teste - GarageInn

**Senha padrão para todos os usuários:** `Teste123!`

## Resumo
- **Total de usuários criados:** 40
- **Data de criação:** 31/12/2025
- **Status:** Todos ativos e com email confirmado

---

## Cargos Globais (sem departamento)

| Email | Nome | Cargo |
|-------|------|-------|
| teste_administrador_global@garageinn.com | Teste Administrador - Global | Administrador |
| teste_desenvolvedor_global@garageinn.com | Teste Desenvolvedor - Global | Desenvolvedor |
| teste_diretor_global@garageinn.com | Teste Diretor - Global | Diretor |

---

## Departamento: Operações

| Email | Nome | Cargo |
|-------|------|-------|
| teste_manobrista_operacoes@garageinn.com | Teste Manobrista - Operações | Manobrista |
| teste_encarregado_operacoes@garageinn.com | Teste Encarregado - Operações | Encarregado |
| teste_supervisor_operacoes@garageinn.com | Teste Supervisor - Operações | Supervisor |
| teste_gerente_operacoes@garageinn.com | Teste Gerente - Operações | Gerente |

---

## Departamento: Manutenção

| Email | Nome | Cargo |
|-------|------|-------|
| teste_tecnico_de_manutencao_manutencao@garageinn.com | Teste Técnico de Manutenção - Manutenção | Técnico de Manutenção |
| teste_encarregado_de_manutencao_manutencao@garageinn.com | Teste Encarregado de Manutenção - Manutenção | Encarregado de Manutenção |
| teste_supervisor_de_manutencao_manutencao@garageinn.com | Teste Supervisor de Manutenção - Manutenção | Supervisor de Manutenção |
| teste_gerente_de_manutencao_manutencao@garageinn.com | Teste Gerente de Manutenção - Manutenção | Gerente de Manutenção |

---

## Departamento: Compras

| Email | Nome | Cargo |
|-------|------|-------|
| teste_comprador_compras@garageinn.com | Teste Comprador - Compras | Comprador |

---

## Departamento: Compras e Manutenção

| Email | Nome | Cargo |
|-------|------|-------|
| teste_auxiliar_compras_e_manutencao@garageinn.com | Teste Auxiliar - Compras e Manutenção | Auxiliar |
| teste_analista_compras_e_manutencao@garageinn.com | Teste Analista - Compras e Manutenção | Analista |
| teste_coordenador_compras_e_manutencao@garageinn.com | Teste Coordenador - Compras e Manutenção | Coordenador |
| teste_gerente_compras_e_manutencao@garageinn.com | Teste Gerente - Compras e Manutenção | Gerente |

---

## Departamento: Financeiro

| Email | Nome | Cargo |
|-------|------|-------|
| teste_auxiliar_financeiro@garageinn.com | Teste Auxiliar - Financeiro | Auxiliar |
| teste_analista_financeiro@garageinn.com | Teste Analista - Financeiro | Analista |
| teste_coordenador_financeiro@garageinn.com | Teste Coordenador - Financeiro | Coordenador |
| teste_gerente_financeiro@garageinn.com | Teste Gerente - Financeiro | Gerente |

---

## Departamento: RH

| Email | Nome | Cargo |
|-------|------|-------|
| teste_auxiliar_rh@garageinn.com | Teste Auxiliar - RH | Auxiliar |
| teste_analista_rh@garageinn.com | Teste Analista - RH | Analista |
| teste_coordenador_rh@garageinn.com | Teste Coordenador - RH | Coordenador |
| teste_gerente_rh@garageinn.com | Teste Gerente - RH | Gerente |

---

## Departamento: Sinistros

| Email | Nome | Cargo |
|-------|------|-------|
| teste_auxiliar_sinistros@garageinn.com | Teste Auxiliar - Sinistros | Auxiliar |
| teste_analista_sinistros@garageinn.com | Teste Analista - Sinistros | Analista |
| teste_coordenador_sinistros@garageinn.com | Teste Coordenador - Sinistros | Coordenador |
| teste_gerente_sinistros@garageinn.com | Teste Gerente - Sinistros | Gerente |

---

## Departamento: Comercial

| Email | Nome | Cargo |
|-------|------|-------|
| teste_vendedor_comercial@garageinn.com | Teste Vendedor - Comercial | Vendedor |
| teste_analista_comercial@garageinn.com | Teste Analista - Comercial | Analista |
| teste_coordenador_comercial@garageinn.com | Teste Coordenador - Comercial | Coordenador |
| teste_gerente_comercial@garageinn.com | Teste Gerente - Comercial | Gerente |

---

## Departamento: Auditoria

| Email | Nome | Cargo |
|-------|------|-------|
| teste_auditor_auditoria@garageinn.com | Teste Auditor - Auditoria | Auditor |
| teste_auditor_senior_auditoria@garageinn.com | Teste Auditor Sênior - Auditoria | Auditor Sênior |
| teste_coordenador_auditoria@garageinn.com | Teste Coordenador - Auditoria | Coordenador |
| teste_gerente_auditoria@garageinn.com | Teste Gerente - Auditoria | Gerente |

---

## Departamento: TI

| Email | Nome | Cargo |
|-------|------|-------|
| teste_analista_de_suporte_ti@garageinn.com | Teste Analista de Suporte - TI | Analista de Suporte |
| teste_desenvolvedor_ti@garageinn.com | Teste Desenvolvedor - TI | Desenvolvedor |
| teste_coordenador_ti@garageinn.com | Teste Coordenador - TI | Coordenador |
| teste_gerente_ti@garageinn.com | Teste Gerente - TI | Gerente |

---

## Notas Importantes

1. **Todos os usuários estão com status "active"** e podem fazer login imediatamente.
2. **Os emails estão confirmados**, não é necessário verificação de email.
3. **A senha padrão `Teste123!`** deve ser alterada em ambiente de produção.
4. Estes usuários são apenas para fins de teste e desenvolvimento.

## Como usar

Para fazer login com qualquer usuário de teste:
1. Acesse a página de login do sistema
2. Use o email do usuário desejado (ex: `teste_manobrista_operacoes@garageinn.com`)
3. Use a senha: `Teste123!`

## Edge Function utilizada

A Edge Function `create-test-users` foi criada para gerar estes usuários automaticamente.
Para recriar os usuários (caso sejam deletados), execute:

```bash
curl -X POST "https://pwsesfwbbwimniivemwg.supabase.co/functions/v1/create-test-users" \
  -H "Content-Type: application/json" \
  -d '{"secret_key": "garageinn-test-2024"}'
```

