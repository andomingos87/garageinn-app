# Design System — GAPP

> Guia de padrões visuais e componentes de interface do sistema GAPP.

---

## 🎨 Fundamentos

### Filosofia

O design do GAPP segue uma abordagem **clean, funcional e profissional**, otimizada para uso em ambientes corporativos e operacionais. Prioriza:

- **Clareza**: Informação facilmente escaneável
- **Consistência**: Padrões visuais uniformes
- **Acessibilidade**: Contraste adequado e hierarquia clara
- **Responsividade**: Funciona em desktop e mobile

---

## 🎨 Paleta de Cores

Todas as cores utilizam **HSL** para facilitar manipulação de opacidade e variantes.

### Cores Principais

| Token | Light Mode | Dark Mode | Uso |
|-------|------------|-----------|-----|
| `--primary` | `0 95% 60%` | `0 95% 60%` | Ações principais, CTAs, links ativos |
| `--accent` | `0 95% 60%` | `0 95% 60%` | Destaques, hover states |
| `--destructive` | `0 84% 60%` | `0 84% 60%` | Ações destrutivas, erros |

> 🔴 A cor primária é um **vermelho vibrante** (`hsl(0, 95%, 60%)`) — identidade visual da marca GarageInn.

### Cores Semânticas

| Token | Valor HSL | Uso |
|-------|-----------|-----|
| `--success` | `142 76% 36%` | Confirmações, status positivo |
| `--warning` | `38 92% 50%` | Alertas, atenção necessária |
| `--info` | `199 89% 48%` | Informações, dicas |

### Cores de Superfície

| Token | Light Mode | Dark Mode | Uso |
|-------|------------|-----------|-----|
| `--background` | `0 0% 98%` | `0 0% 8%` | Fundo principal |
| `--foreground` | `0 0% 10%` | `0 0% 98%` | Texto principal |
| `--card` | `0 0% 100%` | `0 0% 10%` | Cards e containers |
| `--muted` | `0 0% 96%` | `0 0% 15%` | Elementos secundários |
| `--muted-foreground` | `0 0% 45%` | `0 0% 65%` | Texto secundário |

### Cores de UI

| Token | Light Mode | Dark Mode | Uso |
|-------|------------|-----------|-----|
| `--border` | `0 0% 90%` | `0 0% 20%` | Bordas de elementos |
| `--input` | `0 0% 90%` | `0 0% 20%` | Bordas de inputs |
| `--ring` | `0 95% 60%` | `0 95% 60%` | Focus ring |

---

## 📐 Espaçamento e Layout

### Sistema de Espaçamento

Baseado em múltiplos de **4px** (Tailwind default):

| Classe | Valor | Uso comum |
|--------|-------|-----------|
| `p-2` | 8px | Padding interno de botões pequenos |
| `p-4` | 16px | Padding padrão de cards |
| `p-6` | 24px | Padding de seções |
| `gap-2` | 8px | Espaço entre ícone e texto |
| `gap-4` | 16px | Espaço entre elementos de form |
| `gap-6` | 24px | Espaço entre seções |

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius` | `0.5rem` (8px) | Base |
| `rounded-lg` | `var(--radius)` | Cards, modals |
| `rounded-md` | `calc(var(--radius) - 2px)` | Botões, inputs |
| `rounded-sm` | `calc(var(--radius) - 4px)` | Badges, tags |
| `rounded-full` | `9999px` | Avatares, badges circulares |

### Container

```css
max-width: 1400px (2xl breakpoint)
padding: 2rem horizontal
centralizado
```

---

## 🔤 Tipografia

### Fonte

- **Família**: Inter (sans-serif)
- **Fallback**: system-ui, sans-serif

### Escala Tipográfica

| Classe | Tamanho | Peso | Uso |
|--------|---------|------|-----|
| `text-2xl` | 1.5rem | `font-semibold` | Títulos de página |
| `text-xl` | 1.25rem | `font-semibold` | Títulos de seção |
| `text-lg` | 1.125rem | `font-medium` | Subtítulos |
| `text-base` | 1rem | `font-normal` | Corpo de texto |
| `text-sm` | 0.875rem | `font-normal` | Labels, texto auxiliar |
| `text-xs` | 0.75rem | `font-medium` | Badges, captions |

### Hierarquia de Texto

```tsx
// Título de página
<h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

// Título de card
<h3 className="text-xl font-semibold leading-none tracking-tight">Chamados</h3>

// Descrição
<p className="text-sm text-muted-foreground">Gerencie seus chamados</p>

// Label
<label className="text-sm font-medium">Email</label>
```

---

## 🧩 Componentes

### Botões

#### Variantes

| Variante | Classes | Uso |
|----------|---------|-----|
| `default` | `bg-primary text-primary-foreground` | Ação principal |
| `secondary` | `bg-secondary text-secondary-foreground` | Ação secundária |
| `outline` | `border border-input bg-background` | Ação terciária |
| `ghost` | `hover:bg-accent` | Ações sutis, menus |
| `destructive` | `bg-destructive text-destructive-foreground` | Ações destrutivas |
| `link` | `text-primary underline-offset-4` | Links inline |

#### Tamanhos

| Tamanho | Classes | Uso |
|---------|---------|-----|
| `default` | `h-10 px-4 py-2` | Padrão |
| `sm` | `h-9 px-3` | Compacto |
| `lg` | `h-11 px-8` | Destaque |
| `icon` | `h-10 w-10` | Apenas ícone |

#### Exemplos

```tsx
// Primário
<Button>Salvar</Button>

// Secundário
<Button variant="secondary">Cancelar</Button>

// Com ícone
<Button><Plus className="h-4 w-4" /> Novo</Button>

// Apenas ícone
<Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>

// Destrutivo
<Button variant="destructive">Excluir</Button>
```

---

### Cards

Estrutura padrão:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
  <CardFooter>
    {/* Ações */}
  </CardFooter>
</Card>
```

**Estilos base**:
- `rounded-lg border bg-card shadow-sm`
- Header: `p-6` com `space-y-1.5`
- Content: `p-6 pt-0`
- Footer: `p-6 pt-0 flex items-center`

---

### Badges

| Variante | Cor | Uso |
|----------|-----|-----|
| `default` | Primary | Status ativo, tags principais |
| `secondary` | Secondary | Tags neutras |
| `destructive` | Destructive | Erros, urgente |
| `outline` | Border only | Tags sutis |

**Customizações comuns**:

```tsx
// Status success (custom)
<Badge className="bg-success text-white">Aprovado</Badge>

// Status warning (custom)
<Badge className="bg-warning text-white">Pendente</Badge>

// Status info (custom)
<Badge className="bg-info text-white">Em análise</Badge>
```

---

### Inputs

**Estilo base**:
```css
h-10 w-full rounded-md border border-input bg-background px-3 py-2
placeholder:text-muted-foreground
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
disabled:cursor-not-allowed disabled:opacity-50
```

**Com Form**:
```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="email@exemplo.com" {...field} />
      </FormControl>
      <FormDescription>Seu email de acesso</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### Tabelas

**Estrutura**:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Coluna</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Valor</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Estilos**:
- Header: `bg-muted/50 font-medium text-muted-foreground`
- Rows: `border-b hover:bg-muted/50 transition-colors`
- Cells: `p-4 align-middle`

---

### Sidebar

**Tokens específicos**:

| Token | Light | Dark |
|-------|-------|------|
| `--sidebar-background` | `0 0% 100%` | `0 0% 10%` |
| `--sidebar-foreground` | `0 0% 20%` | `0 0% 90%` |
| `--sidebar-primary` | `0 95% 60%` | `0 95% 60%` |
| `--sidebar-accent` | `0 0% 96%` | `0 0% 15%` |
| `--sidebar-border` | `0 0% 92%` | `0 0% 20%` |

**Estados de navegação**:
```tsx
// Ativo
"bg-sidebar-accent text-sidebar-accent-foreground font-medium"

// Hover
"hover:bg-sidebar-accent/50"
```

---

## 🌓 Dark Mode

O sistema suporta **dark mode** via classe `.dark` no elemento raiz.

### Implementação

```tsx
import { useTheme } from "next-themes";

const { theme, setTheme } = useTheme();

// Toggle
setTheme(theme === "dark" ? "light" : "dark");
```

### Considerações

- Todas as cores de superfície invertem automaticamente
- Cores semânticas (success, warning, info) mantêm-se constantes
- Cor primária (vermelho) permanece igual em ambos os modos
- Opacidades podem precisar de ajuste (ex: `muted/0.3` → `muted/0.2`)

---

## 📱 Responsividade

### Breakpoints

| Prefixo | Min-width | Uso |
|---------|-----------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop grande |
| `2xl` | 1400px | Container máximo |

### Padrões Comuns

```tsx
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Texto responsivo
<h1 className="text-xl md:text-2xl lg:text-3xl">

// Padding responsivo
<div className="p-4 md:p-6 lg:p-8">

// Ocultar em mobile
<div className="hidden md:block">
```

---

## ✨ Animações

### Transições Padrão

```css
transition-colors /* Para hover de cores */
transition-transform /* Para rotações, scales */
transition-all /* Quando múltiplas propriedades mudam */
```

### Duração

- **Rápida**: `duration-150` (150ms) — hover states
- **Normal**: `duration-200` (200ms) — transições de UI
- **Lenta**: `duration-300` (300ms) — animações de entrada

### Animações Específicas

```css
/* Accordion */
accordion-down: 0.2s ease-out
accordion-up: 0.2s ease-out

/* Loading spinner */
animate-spin /* Rotação contínua */

/* Focus ring */
ring-offset-2 /* Offset do ring de foco */
```

---

## 🔧 Utilitários

### Classes Customizadas

```css
/* Padrão de fundo para páginas de auth */
.auth-pattern {
  background-image: 
    radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.03) ...),
    radial-gradient(circle at 75% 75%, hsl(var(--accent) / 0.03) ...),
    repeating-linear-gradient(45deg, ...);
}
```

### Helpers de Classe

```tsx
import { cn } from "@/lib/utils";

// Merge de classes condicionais
cn(
  "base-classes",
  condition && "conditional-classes",
  className // props externas
)
```

---

## 📋 Checklist de Implementação

Ao criar novos componentes ou telas, verifique:

- [ ] Usa tokens de cor do design system (não cores hardcoded)
- [ ] Respeita hierarquia tipográfica
- [ ] Tem estados de hover/focus adequados
- [ ] Funciona em dark mode
- [ ] É responsivo (mobile-first)
- [ ] Usa componentes shadcn/ui existentes quando possível
- [ ] Segue padrões de espaçamento consistentes

---

## 📚 Referências

- **Componentes UI**: `src/components/ui/` (shadcn/ui)
- **CSS Variables**: `src/index.css`
- **Tailwind Config**: `tailwind.config.ts`
- **shadcn/ui Docs**: https://ui.shadcn.com

---

*Última atualização: Dezembro 2024*

