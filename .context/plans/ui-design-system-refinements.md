---
id: plan-ui-design-system-refinements
ai_update_goal: "Implementar refinamentos visuais na sidebar e componente Skeleton conforme design system."
required_inputs:
  - "Design System: design-system.md"
  - "Componente Sidebar: apps/web/src/components/layout/app-sidebar.tsx"
  - "Componente Skeleton: apps/web/src/components/ui/skeleton.tsx"
  - "CSS Global: apps/web/src/app/globals.css"
success_criteria:
  - "Logo da GarageInn exibida proporcionalmente na sidebar sem texto 'GAPP'"
  - "Componente Skeleton usando cor neutra (cinza) ao invés de vermelho"
  - "Visual consistente com design-system.md"
related_agents:
  - "frontend-specialist"
---

<!-- agent-update:start:plan-ui-design-system-refinements -->
# UI/Design System - Refinamentos Plan

> Ajustes visuais na sidebar (logo) e componente Skeleton (cor)

## Task Snapshot
- **Primary goal:** Corrigir dois problemas visuais identificados: logo da sidebar com texto redundante e Skeleton com cor inadequada.
- **Success signal:** Interface visual limpa, com logo proporcional e Skeletons em cor neutra durante carregamento.
- **Key references:**
  - [Design System](../../design-system.md)
  - [Frontend Specialist](../agents/frontend-specialist.md)

## Contexto Técnico

### Análise do Problema 1: Logo na Sidebar

**Arquivo:** `apps/web/src/components/layout/app-sidebar.tsx`

**Estado Atual (linhas 129-144):**
```tsx
<SidebarHeader className="border-b border-sidebar-border p-4">
  <Link href="/" className="flex items-center gap-2">
    <div className="relative h-8 w-8">
      <Image
        src="/logo-garageinn.png"
        alt="GarageInn Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
    <span className="text-xl font-semibold tracking-tight text-sidebar-foreground">
      GAPP
    </span>
  </Link>
</SidebarHeader>
```

**Problemas Identificados:**
1. O texto "GAPP" é redundante pois a logo já contém "GARAGEINN"
2. A logo está confinada em um container 32x32px, cortando o texto da imagem
3. A logo original é horizontal (ícone + texto) e precisa de espaço proporcional

**Logo Original:** A imagem `logo-garageinn.png` contém o ícone "G" estilizado + texto "GARAGEINN" em layout horizontal.

### Análise do Problema 2: Skeleton Vermelho

**Arquivo:** `apps/web/src/components/ui/skeleton.tsx`

**Estado Atual (linha 7):**
```tsx
className={cn("bg-accent animate-pulse rounded-md", className)}
```

**Problema:**
- `bg-accent` usa a variável CSS `--accent: hsl(0 95% 60%)` = vermelho vibrante
- Skeletons de carregamento devem ser neutros para não chamar atenção desnecessária
- A cor vermelha dá impressão de erro, não de carregamento

**Solução:**
- Substituir `bg-accent` por `bg-muted` que usa `--muted: hsl(0 0% 96%)` = cinza claro
- Manter consistência com padrões shadcn/ui

## Agent Lineup
| Agent | Role in this plan | Playbook | First responsibility focus |
| --- | --- | --- | --- |
| Frontend Specialist | Implementar ajustes visuais nos componentes | [Frontend Specialist](../agents/frontend-specialist.md) | Modificar sidebar e skeleton com código limpo |

## Risk Assessment

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| Sidebar fica desalinhada em modo colapsado | Baixa | Média | Testar em diferentes estados da sidebar |
| Logo muito grande/pequena | Baixa | Baixa | Usar dimensões proporcionais (aspect-ratio) |

### Dependencies
- **Technical:** Nenhuma dependência externa

### Assumptions
- A logo `logo-garageinn.png` permanecerá com o layout horizontal atual
- O design system continuará usando o token `--muted` para elementos neutros

## Resource Estimation

### Time Allocation
| Phase | Estimated Effort | Calendar Time |
| --- | --- | --- |
| Implementação | 30 minutos | Imediato |
| Validação visual | 15 minutos | Imediato |
| **Total** | **45 minutos** | **< 1 hora** |

## Tarefas

### Tarefa 1 — Ajustar Logo na Sidebar
- [x] **1.1** Remover o elemento `<span>` com texto "GAPP"
- [x] **1.2** Ajustar container da logo para permitir proporção horizontal
- [x] **1.3** Testar aparência em sidebar expandida e colapsada

**Arquivo:** `apps/web/src/components/layout/app-sidebar.tsx`

**Mudança Proposta:**
```tsx
<SidebarHeader className="border-b border-sidebar-border p-4">
  <Link href="/" className="flex items-center">
    <div className="relative h-8 w-32">
      <Image
        src="/logo-garageinn.png"
        alt="GarageInn Logo"
        fill
        className="object-contain object-left"
        priority
      />
    </div>
  </Link>
</SidebarHeader>
```

**Detalhes:**
- Remove `gap-2` pois não há mais elementos lado a lado
- Container agora é `h-8 w-32` (32x128px) para acomodar logo horizontal
- Adiciona `object-left` para alinhar logo à esquerda quando sidebar colapsa

### Tarefa 2 — Corrigir Cor do Skeleton
- [x] **2.1** Substituir `bg-accent` por `bg-muted` no componente Skeleton
- [x] **2.2** Verificar telas de loading que usam Skeleton

**Arquivo:** `apps/web/src/components/ui/skeleton.tsx`

**Mudança Proposta:**
```tsx
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  );
}
```

## Validation Checklist
- [ ] Logo aparece proporcional na sidebar expandida
- [ ] Logo permanece visível/adequada em sidebar colapsada
- [ ] Skeleton exibe cor cinza neutra durante carregamento
- [ ] Dark mode funciona corretamente para ambos componentes
- [ ] Nenhuma regressão visual em outras partes da aplicação

## Rollback Plan

**Trigger:** Problemas visuais graves ou regressão funcional

**Procedimento:**
```bash
git revert HEAD  # Se já commitado
# Ou simplesmente restaurar os arquivos originais
```

**Impacto:** Nenhum impacto em dados ou funcionalidade - apenas mudanças visuais

## Evidence & Follow-up
- [ ] Screenshot da sidebar antes/depois
- [ ] Screenshot de tela com Skeleton antes/depois
- [ ] Atualizar design-system.md se necessário documentar padrão de Skeleton

<!-- agent-update:end -->
