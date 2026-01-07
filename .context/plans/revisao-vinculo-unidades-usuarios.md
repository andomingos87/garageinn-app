---
id: plan-revisao-vinculo-unidades-usuarios
ai_update_goal: "Define the stages, owners, and evidence required to complete Revisão do Sistema de Vínculo Unidades-Usuários."
required_inputs:
  - "Análise das regras de negócio de vínculo usuário-unidade"
  - "Verificação das tabelas user_units e units e suas políticas RLS"
  - "Mapeamento de todos os formulários que dependem de seleção de unidade"
success_criteria:
  - "Usuários de Operações (Manobrista, Encarregado, Supervisor) conseguem criar chamados com unidade preenchida"
  - "Regras de negócio de acesso a unidades estão implementadas consistentemente"
  - "Dados de teste estão completos e válidos para todos os cenários"
related_agents:
  - "database-specialist"
  - "backend-specialist"
  - "frontend-specialist"
  - "test-writer"
  - "security-auditor"
---

<!-- agent-update:start:plan-revisao-vinculo-unidades-usuarios -->
# Revisão do Sistema de Vínculo Unidades-Usuários

> Correção global do sistema de vinculação de unidades a usuários e seu reflexo na criação de chamados e outras funcionalidades que dependem da seleção de unidade.

## Task Snapshot
- **Primary goal:** Garantir que todos os usuários tenham acesso apropriado às unidades conforme suas regras de negócio, e que o sistema valide e preencha corretamente campos de unidade em todos os formulários.
- **Success signal:** 
  1. Usuário manobrista personificado consegue criar chamado de compras com campo unidade preenchido automaticamente
  2. Usuário supervisor consegue selecionar dentre suas unidades vinculadas
  3. Gerente consegue selecionar qualquer unidade ativa
  4. Validação impede criação de chamados sem unidade para roles que exigem vínculo
- **Key references:**
  - [Plano de Gestão de Usuários](./gestao-usuarios.md)
  - [Plano de Gestão de Unidades](./gestao-unidades.md)
  - [Plano de Revisão RLS](./revisao-rls-e-paginacao.md)
  - [Documentation Index](../docs/README.md)

---

## Bug Reportado

### Cenário de Reprodução
1. Admin (`admin@garageinn.com` / `Teste123!`) faz login
2. Navega até **Usuários** → Filtra por **Operações** → Encontra "Manobrista"
3. Clica em **Personificar** no menu de ações
4. Como manobrista personificado, navega até **Chamados** > **Compras** > **Novo**
5. **Erro observado:** Campo "Unidade" está em branco e desativado

### Análise Técnica

#### 1. Raiz do Problema: Dados de Teste Incompletos

A tabela `user_units` possui apenas **4 registros**, e **nenhum** pertence aos usuários de teste de Operações:

| Usuário | Role | Unidades Vinculadas |
|---------|------|---------------------|
| Teste Manobrista - Operações | Manobrista | ❌ **NENHUMA** |
| Teste Encarregado - Operações | Encarregado | ❌ **NENHUMA** |
| Teste Supervisor - Operações | Supervisor | ❌ **NENHUMA** |
| Teste Gerente - Operações | Gerente | ❌ **NENHUMA** |
| Teste SMTP | Manobrista + Supervisor | ✅ 3 unidades (UN001, UN004, UN021) |

#### 2. Código da Função `getUserUnits()` (compras/actions.ts)

```typescript
// apps/web/src/app/(app)/chamados/compras/actions.ts, linhas 95-121
export async function getUserUnits(): Promise<UserUnit[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  // Verificar se é admin
  const { data: isAdmin } = await supabase.rpc('is_admin')
  
  if (isAdmin) {
    // Admin vê TODAS as unidades ativas
    const { data } = await supabase
      .from('units')
      .select('id, name, code')
      .eq('status', 'active')
      .order('name')
    return data || []
  }
  
  // Senão, apenas unidades vinculadas via user_units
  const { data } = await supabase
    .from('user_units')
    .select('unit:units(id, name, code)')
    .eq('user_id', user.id)
  
  return data?.map((d: any) => d.unit).filter(Boolean) || []
}
```

**Problema:** A função retorna array vazio para usuários não-admin que não têm registros em `user_units`.

#### 3. Regras de Negócio Esperadas (não implementadas)

Segundo as regras de negócio do sistema GarageInn:

| Role | Acesso a Unidades |
|------|-------------------|
| **Manobrista** | Vinculado a **1 unidade fixa** |
| **Encarregado** | Vinculado a **1 unidade fixa** |
| **Supervisor** | Supervisiona **várias unidades** (is_coverage = true) |
| **Gerente** | Acesso a **todas as unidades** |
| **Admin/Desenvolvedor/Diretor** | Acesso a **todas as unidades** (is_global = true) |

#### 4. Componente TicketForm (ticket-form.tsx)

```typescript
// apps/web/src/app/(app)/chamados/compras/components/ticket-form.tsx
// Linhas 232-250

<Select
  value={formData.unit_id}
  onValueChange={(value) => handleChange('unit_id', value)}
  disabled={isPending}  // Desativado apenas durante submit
>
  <SelectTrigger id="unit_id">
    <SelectValue placeholder="Selecione a unidade (opcional)" />
  </SelectTrigger>
  <SelectContent>
    {units.map((unit) => (  // Se units está vazio, nada é renderizado
      <SelectItem key={unit.id} value={unit.id}>
        {unit.code} - {unit.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Problema adicional:** O campo está marcado como "opcional", mas para Manobristas e Encarregados deveria ser obrigatório e auto-preenchido.

---

## Impacto Global

Este problema afeta **todos os formulários** que utilizam seleção de unidade:

| Módulo | Arquivo | Status |
|--------|---------|--------|
| Chamados Compras | `chamados/compras/novo/page.tsx` | ❌ **AFETADO** |
| Chamados Manutenção | `chamados/manutencao/novo/page.tsx` | ⚠️ **VERIFICAR** |
| Chamados RH | `chamados/rh/novo/page.tsx` | ⚠️ **VERIFICAR** |
| Chamados Sinistros | `chamados/sinistros/novo/page.tsx` | ⚠️ **VERIFICAR** |
| Checklists | `checklists/executar/page.tsx` | ⚠️ **VERIFICAR** |

---

## Agent Lineup

| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Database Specialist | Criar seed data correto e função RPC para acesso a unidades | [Database Specialist](../agents/database-specialist.md) | Popular user_units para usuários de teste |
| Backend Specialist | Refatorar função getUserUnits para considerar regras de negócio | [Backend Specialist](../agents/backend-specialist.md) | Implementar lógica de acesso por role |
| Frontend Specialist | Ajustar comportamento do campo unidade nos formulários | [Frontend Specialist](../agents/frontend-specialist.md) | Auto-preencher para roles de unidade fixa |
| Test Writer | Criar testes E2E para validar cenários de diferentes roles | [Test Writer](../agents/test-writer.md) | Testes de criação de chamado por role |
| Security Auditor | Verificar que RLS está correta para user_units | [Security Auditor](../agents/security-auditor.md) | Validar políticas de acesso |

---

## Risk Assessment

### Identified Risks

| Risk | Probability | Impact | Mitigation Strategy | Owner |
| --- | --- | --- | --- | --- |
| Mudança em getUserUnits pode quebrar funcionalidades existentes | Média | Alto | Criar função separada, manter retrocompatibilidade | Backend Specialist |
| Dados de produção podem estar inconsistentes | Baixa | Alto | Criar migration para validar e corrigir vínculos | Database Specialist |
| Regras de negócio podem variar por departamento | Média | Médio | Documentar regras claramente antes de implementar | Architect |

### Dependencies
- **Internal:** Nenhuma - alterações são self-contained
- **External:** Supabase MCP para aplicar migrations e popular dados
- **Technical:** Definição clara das regras de negócio por role

### Assumptions
- Regras de negócio documentadas estão corretas (Manobrista = 1 unidade, etc.)
- Dados de teste podem ser recriados/corrigidos sem impacto
- Função is_admin() já está implementada e funcionando corretamente

---

## Working Phases

### Fase 1 — Correção Imediata: Popular Dados de Teste

**Owner:** Database Specialist

**Status:** 🔴 PENDENTE

**Objetivo:** Popular a tabela `user_units` com vínculos corretos para todos os usuários de teste de Operações.

#### 1.1 Identificar usuários e unidades para vínculo

Usuários de Operações que precisam de vínculo:

| user_id (profile) | full_name | role | unidade sugerida |
|-------------------|-----------|------|------------------|
| `acadb731-4f39-42c9-a375-8143bbc4f643` | Teste Manobrista - Operações | Manobrista | UN001 (Unidade Centro) |
| `821d5b4a-5435-4c80-9cb5-e3d96f3c67d9` | Teste Encarregado - Operações | Encarregado | UN001 (Unidade Centro) |
| `49e773ea-2768-4f26-a6c3-4e8b5a123551` | Teste Supervisor - Operações | Supervisor | UN001, UN002, UN003 (is_coverage = true) |
| `a513f87c-7687-4089-a567-41c99f09b4e1` | Teste Gerente - Operações | Gerente | TODAS (via lógica, não via user_units) |

#### 1.2 Migration para popular dados de teste

```sql
-- Migration: seed_user_units_operacoes
-- Vincular usuários de teste de Operações às unidades

-- Obter IDs das primeiras 3 unidades ativas
WITH target_units AS (
  SELECT id, code, ROW_NUMBER() OVER (ORDER BY code) as rn
  FROM units
  WHERE status = 'active'
  LIMIT 3
)

-- Manobrista: 1 unidade fixa (UN001)
INSERT INTO user_units (user_id, unit_id, is_coverage)
SELECT 
  'acadb731-4f39-42c9-a375-8143bbc4f643'::uuid,
  id,
  false
FROM target_units WHERE rn = 1
ON CONFLICT DO NOTHING;

-- Encarregado: 1 unidade fixa (UN001)
INSERT INTO user_units (user_id, unit_id, is_coverage)
SELECT 
  '821d5b4a-5435-4c80-9cb5-e3d96f3c67d9'::uuid,
  id,
  false
FROM target_units WHERE rn = 1
ON CONFLICT DO NOTHING;

-- Supervisor: 3 unidades (is_coverage = true)
INSERT INTO user_units (user_id, unit_id, is_coverage)
SELECT 
  '49e773ea-2768-4f26-a6c3-4e8b5a123551'::uuid,
  id,
  true
FROM target_units
ON CONFLICT DO NOTHING;
```

#### 1.3 Validação

```sql
-- Verificar vínculos criados
SELECT 
  p.full_name,
  r.name as role,
  u.code as unit_code,
  u.name as unit_name,
  uu.is_coverage
FROM user_units uu
JOIN profiles p ON p.id = uu.user_id
JOIN units u ON u.id = uu.unit_id
JOIN user_roles ur ON ur.user_id = p.id
JOIN roles r ON r.id = ur.role_id
WHERE r.name IN ('Manobrista', 'Encarregado', 'Supervisor')
ORDER BY r.name, p.full_name;
```

**Commit Checkpoint:**
```bash
git commit -m "fix(data): populate user_units for operations test users

- Add unit links for Manobrista, Encarregado, Supervisor test users
- Ensures getUserUnits() returns data for non-admin users
- Fixes empty unit selector in ticket creation forms"
```

---

### Fase 2 — Refatoração: Função getUserUnits com Regras de Negócio

**Owner:** Backend Specialist

**Status:** 🔴 PENDENTE

**Objetivo:** Refatorar a função `getUserUnits()` para implementar corretamente as regras de acesso por role.

#### 2.1 Criar RPC no Supabase para centralizar lógica

```sql
-- Migration: create_get_accessible_units_function

CREATE OR REPLACE FUNCTION public.get_user_accessible_units()
RETURNS TABLE (
  id uuid,
  name text,
  code text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_is_admin boolean;
  v_is_gerente boolean;
BEGIN
  -- Verificar se é admin (global)
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id 
      AND r.is_global = true
      AND r.name IN ('Administrador', 'Desenvolvedor', 'Diretor')
  ) INTO v_is_admin;
  
  IF v_is_admin THEN
    -- Admin: todas as unidades ativas
    RETURN QUERY
    SELECT u.id, u.name, u.code
    FROM units u
    WHERE u.status = 'active'
    ORDER BY u.name;
    RETURN;
  END IF;
  
  -- Verificar se é gerente (departamental)
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id 
      AND r.name = 'Gerente'
  ) INTO v_is_gerente;
  
  IF v_is_gerente THEN
    -- Gerente: todas as unidades ativas
    RETURN QUERY
    SELECT u.id, u.name, u.code
    FROM units u
    WHERE u.status = 'active'
    ORDER BY u.name;
    RETURN;
  END IF;
  
  -- Outros roles: apenas unidades vinculadas via user_units
  RETURN QUERY
  SELECT u.id, u.name, u.code
  FROM user_units uu
  JOIN units u ON u.id = uu.unit_id
  WHERE uu.user_id = v_user_id
    AND u.status = 'active'
  ORDER BY u.name;
END;
$$;

-- Conceder acesso à função
GRANT EXECUTE ON FUNCTION public.get_user_accessible_units() TO authenticated;
```

#### 2.2 Atualizar função getUserUnits no frontend

```typescript
// apps/web/src/app/(app)/chamados/compras/actions.ts

/**
 * Obtém unidades acessíveis ao usuário atual
 * 
 * Regras de acesso:
 * - Admin/Desenvolvedor/Diretor: todas as unidades
 * - Gerente: todas as unidades
 * - Supervisor: unidades vinculadas (múltiplas, is_coverage = true)
 * - Manobrista/Encarregado: unidade vinculada (única)
 */
export async function getUserUnits(): Promise<UserUnit[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  // Usar RPC que centraliza a lógica de acesso
  const { data, error } = await supabase.rpc('get_user_accessible_units')
  
  if (error) {
    console.error('Error fetching accessible units:', error)
    return []
  }
  
  return data || []
}

/**
 * Verifica se o usuário tem unidade fixa (Manobrista/Encarregado)
 * Retorna a unidade se única, null se múltiplas ou nenhuma
 */
export async function getUserFixedUnit(): Promise<UserUnit | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  // Verificar se tem role de unidade fixa
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', user.id)
  
  const hasFixedUnitRole = userRoles?.some((ur: any) => 
    ['Manobrista', 'Encarregado'].includes(ur.role?.name)
  )
  
  if (!hasFixedUnitRole) return null
  
  // Buscar unidade única
  const { data: units } = await supabase
    .from('user_units')
    .select('unit:units(id, name, code)')
    .eq('user_id', user.id)
    .eq('is_coverage', false)
    .limit(1)
  
  return units?.[0]?.unit || null
}
```

#### 2.3 Atualizar page.tsx para passar informações adicionais

```typescript
// apps/web/src/app/(app)/chamados/compras/novo/page.tsx

export default async function NovoChamadoComprasPage() {
  const [categories, units, fixedUnit] = await Promise.all([
    getPurchaseCategories(),
    getUserUnits(),
    getUserFixedUnit(),  // Nova função
  ])

  return (
    <TicketForm
      categories={categories}
      units={units}
      fixedUnit={fixedUnit}  // Novo prop
      onSubmit={handleCreateTicket}
    />
  )
}
```

**Commit Checkpoint:**
```bash
git commit -m "feat(units): implement role-based unit access logic

- Add get_user_accessible_units() RPC function
- Implement getUserFixedUnit() for Manobrista/Encarregado roles
- Centralize unit access rules in database function
- Update ticket creation form to auto-select fixed unit"
```

---

### Fase 3 — Frontend: Comportamento Inteligente do Campo Unidade

**Owner:** Frontend Specialist

**Status:** 🔴 PENDENTE

**Objetivo:** Ajustar o componente TicketForm para comportamento inteligente baseado no role do usuário.

#### 3.1 Atualizar interface TicketFormProps

```typescript
interface TicketFormProps {
  categories: PurchaseCategory[]
  units: UserUnit[]
  fixedUnit?: UserUnit | null  // Unidade fixa para Manobrista/Encarregado
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
}
```

#### 3.2 Atualizar lógica do componente

```typescript
export function TicketForm({ categories, units, fixedUnit, onSubmit }: TicketFormProps) {
  const [formData, setFormData] = useState({
    // ... outros campos
    unit_id: fixedUnit?.id || '',  // Auto-preencher se tiver unidade fixa
  })

  const isUnitDisabled = !!fixedUnit  // Desabilitar se unidade fixa
  const isUnitRequired = units.length > 0  // Obrigatório se tem unidades
  const showUnitWarning = units.length === 0  // Mostrar aviso se sem unidades

  // ... restante do componente
```

#### 3.3 Atualizar JSX do campo unidade

```tsx
{/* Unidade */}
<div className="space-y-2">
  <Label htmlFor="unit_id">
    Unidade {isUnitRequired && '*'}
  </Label>
  
  {showUnitWarning ? (
    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
      <AlertTriangle className="inline h-4 w-4 mr-2" />
      Você não possui unidades vinculadas. Entre em contato com o administrador.
    </div>
  ) : (
    <Select
      value={formData.unit_id}
      onValueChange={(value) => handleChange('unit_id', value)}
      disabled={isPending || isUnitDisabled}
    >
      <SelectTrigger id="unit_id">
        <SelectValue placeholder={
          isUnitDisabled 
            ? `${fixedUnit?.code} - ${fixedUnit?.name}` 
            : "Selecione a unidade"
        } />
      </SelectTrigger>
      <SelectContent>
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            {unit.code} - {unit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
  
  {isUnitDisabled && (
    <p className="text-xs text-muted-foreground">
      Sua unidade foi selecionada automaticamente
    </p>
  )}
</div>
```

#### 3.4 Adicionar validação no submit

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  // Validação de unidade (se obrigatória)
  if (isUnitRequired && !formData.unit_id) {
    setError('Selecione uma unidade para continuar')
    return
  }

  // ... restante da validação
}
```

**Commit Checkpoint:**
```bash
git commit -m "feat(ui): smart unit field behavior based on user role

- Auto-select and disable unit for fixed-unit roles (Manobrista, Encarregado)
- Show warning when user has no linked units
- Make unit required when user has accessible units
- Add helpful messages for different scenarios"
```

---

### Fase 4 — Aplicar Padrão em Outros Módulos

**Owner:** Backend Specialist + Frontend Specialist

**Status:** 🔴 PENDENTE

**Objetivo:** Replicar a correção para todos os formulários que usam seleção de unidade.

#### 4.1 Criar função compartilhada

```typescript
// apps/web/src/lib/units/actions.ts

export { getUserUnits, getUserFixedUnit, type UserUnit } from './queries'
```

#### 4.2 Atualizar módulos afetados

| Módulo | Arquivo | Ação |
|--------|---------|------|
| Manutenção | `chamados/manutencao/actions.ts` | Importar de lib/units |
| RH | `chamados/rh/actions.ts` | Importar de lib/units |
| Sinistros | `chamados/sinistros/actions.ts` | Importar de lib/units |
| Checklists | `checklists/actions.ts` | Importar de lib/units |

**Commit Checkpoint:**
```bash
git commit -m "refactor(units): centralize unit access logic

- Move getUserUnits and getUserFixedUnit to shared lib
- Update all ticket modules to use shared functions
- Ensure consistent unit selection behavior across app"
```

---

### Fase 5 — Validação e Testes

**Owner:** Test Writer

**Status:** 🔴 PENDENTE

#### 5.1 Teste E2E: Criação de chamado como Manobrista

```typescript
// apps/web/e2e/tickets/unit-selection.spec.ts

test.describe('Unit Selection by Role', () => {
  test('Manobrista sees auto-selected unit', async ({ page }) => {
    // Login como admin
    await loginAsAdmin(page)
    
    // Personificar manobrista
    await page.goto('/usuarios')
    await page.fill('[placeholder="Buscar"]', 'manobrista')
    await page.click('button:has-text("Personificar")')
    await page.click('button:has-text("Entrar como usuário")')
    
    // Aguardar redirecionamento
    await page.waitForURL('/dashboard')
    
    // Criar chamado de compras
    await page.goto('/chamados/compras/novo')
    
    // Verificar que unidade está preenchida e desabilitada
    const unitField = page.locator('#unit_id')
    await expect(unitField).toBeDisabled()
    await expect(unitField).toContainText('UN001')
    
    // Preencher e submeter
    await page.fill('[name="title"]', 'Teste criação manobrista')
    await page.fill('[name="item_name"]', 'Item teste')
    await page.fill('[name="quantity"]', '1')
    await page.fill('[name="description"]', 'Justificativa do teste')
    await page.click('button:has-text("Criar Chamado")')
    
    // Verificar sucesso
    await expect(page.url()).toContain('/chamados/compras/')
    await expect(page).not.toContainText('erro')
  })
  
  test('Supervisor sees multiple unit options', async ({ page }) => {
    await loginAs(page, 'teste_supervisor_operacoes@garageinn.com')
    await page.goto('/chamados/compras/novo')
    
    // Verificar que pode selecionar entre múltiplas unidades
    await page.click('#unit_id')
    await expect(page.locator('[role="option"]')).toHaveCount(3) // 3 unidades do supervisor
  })
  
  test('User without units sees warning', async ({ page }) => {
    // Criar usuário temporário sem unidades
    // Verificar que mensagem de aviso é exibida
    await expect(page.locator('text=não possui unidades vinculadas')).toBeVisible()
  })
})
```

#### 5.2 Teste manual de validação

- [ ] Login como admin, personificar manobrista, criar chamado de compras
- [ ] Login como supervisor, verificar seleção múltipla de unidades
- [ ] Login como gerente, verificar acesso a todas as unidades
- [ ] Verificar que chamado é criado com unit_id correto

**Commit Checkpoint:**
```bash
git commit -m "test(e2e): add unit selection tests by role

- Test auto-select for Manobrista
- Test multiple options for Supervisor
- Test warning for users without units"
```

---

## Rollback Plan

### Rollback Triggers
- Usuários não conseguem selecionar unidades
- RPC function falha com erro
- Performance degradada

### Rollback Procedures

#### Fase 1 Rollback (Dados)
```sql
-- Remover vínculos de teste criados
DELETE FROM user_units 
WHERE user_id IN (
  'acadb731-4f39-42c9-a375-8143bbc4f643',
  '821d5b4a-5435-4c80-9cb5-e3d96f3c67d9',
  '49e773ea-2768-4f26-a6c3-4e8b5a123551'
);
```

#### Fase 2 Rollback (RPC)
```sql
DROP FUNCTION IF EXISTS public.get_user_accessible_units();
```
- Reverter código TypeScript para versão anterior

---

## Evidence & Follow-up

### Artifacts to Collect
- [ ] Screenshot do campo unidade vazio (antes)
- [ ] Screenshot do campo unidade preenchido (depois)
- [ ] Log de migrations aplicadas
- [ ] Resultado dos testes E2E
- [ ] PR links para as correções

### Follow-up Actions
- [ ] Documentar regras de negócio de acesso a unidades em glossary.md
- [ ] Criar script para validar integridade de vínculos user_units
- [ ] Considerar adicionar trigger para criar vínculo automático ao criar usuário de Operações
- [ ] Auditar se há outros campos com comportamento similar (categoria, departamento)

---

## Notas Técnicas

### Políticas RLS Atuais de user_units

```sql
-- SELECT: Usuário vê próprios vínculos OU admin vê todos
"Users can view own unit links" -> (auth.uid() = user_id)
"Admins can view all unit links" -> is_admin()

-- INSERT/UPDATE/DELETE: Apenas admin
"Admins can insert/update/delete unit links" -> is_admin()
```

As políticas estão corretas. O problema é apenas de **dados faltantes**.

### Função is_admin()

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
      AND r.is_global = true
      AND r.name IN ('Administrador', 'Desenvolvedor', 'Diretor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Gerentes NÃO são considerados admin (is_global = false), mas devem ter acesso a todas as unidades. Isso precisa ser tratado na nova função `get_user_accessible_units()`.

<!-- agent-update:end -->
