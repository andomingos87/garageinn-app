# GAPP - Garageinn App (Web)

Sistema de gestão de chamados e checklists operacionais da Garageinn.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ (LTS)
- npm 9+
- Projeto Supabase configurado

### Instalação

```bash
# Na raiz do repositório
cd apps/web

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase
```

### Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Settings > API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Cole no arquivo `.env.local`

### Executando

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start
```

## 📁 Estrutura do Projeto

```
apps/web/
├── src/
│   ├── app/                    # App Router (Next.js)
│   │   ├── (app)/              # Rotas autenticadas
│   │   │   ├── chamados/       # Módulo de Chamados
│   │   │   ├── checklists/     # Módulo de Checklists
│   │   │   ├── unidades/       # Módulo de Unidades
│   │   │   ├── usuarios/       # Módulo de Usuários
│   │   │   ├── configuracoes/  # Configurações
│   │   │   ├── perfil/         # Perfil do usuário
│   │   │   ├── layout.tsx      # Layout autenticado
│   │   │   └── page.tsx        # Dashboard
│   │   ├── globals.css         # CSS global + Design Tokens
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/
│   │   ├── layout/             # Componentes de layout (AppShell, Sidebar, Header)
│   │   └── ui/                 # Componentes shadcn/ui
│   │
│   ├── lib/
│   │   ├── supabase/           # Helpers Supabase (client, server, middleware)
│   │   └── utils.ts            # Utilitários (cn)
│   │
│   └── hooks/                  # Hooks customizados
│
├── public/                     # Assets estáticos
├── .env.example                # Template de variáveis de ambiente
└── package.json
```

## 🎨 Design System

O projeto segue o Design System documentado em `/design-system.md`:

- **Cor Primária**: Vermelho vibrante `hsl(0, 95%, 60%)` — identidade GarageInn
- **Fonte**: Inter (sans-serif)
- **Border Radius**: 8px (base)
- **Componentes**: shadcn/ui customizados

### Tokens de Cor (CSS Variables)

```css
--primary: hsl(0 95% 60%);      /* Vermelho GarageInn */
--success: hsl(142 76% 36%);    /* Verde confirmação */
--warning: hsl(38 92% 50%);     /* Amarelo alerta */
--info: hsl(199 89% 48%);       /* Azul informação */
--destructive: hsl(0 84% 60%);  /* Vermelho destrutivo */
```

## 🛠️ Scripts Disponíveis

| Comando              | Descrição                          |
|----------------------|------------------------------------|
| `npm run dev`        | Inicia servidor de desenvolvimento |
| `npm run build`      | Gera build de produção             |
| `npm start`          | Inicia servidor de produção        |
| `npm run lint`       | Executa ESLint                     |
| `npm run lint:fix`   | Corrige erros de lint automaticamente |
| `npm run format`     | Formata código com Prettier        |
| `npm run format:check` | Verifica formatação              |

## 🔧 Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Componentes**: shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Lint/Format**: ESLint + Prettier

## 📄 Variáveis de Ambiente

| Variável                       | Obrigatória | Descrição                    |
|--------------------------------|-------------|------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`     | Sim         | URL do projeto Supabase      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Sim         | Chave anônima do Supabase    |
| `NEXT_PUBLIC_APP_URL`          | Não         | URL base da aplicação        |

## 📋 Próximos Passos (Entrega 1)

- [ ] Autenticação (Login, Recuperação de senha, Middleware)
- [ ] Gestão de Usuários (CRUD, RBAC)
- [ ] Gestão de Unidades (CRUD)
- [ ] Checklists (Templates, Execução, Histórico)
- [ ] Chamados (Compras, Manutenção, RH)

---

**Documentação do PRD**: `/projeto/PRD.md`
**Design System**: `/design-system.md`
