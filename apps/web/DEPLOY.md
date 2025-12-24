# Deploy do GarageInn na Vercel

Este guia detalha o processo de deploy da aplicação GarageInn na plataforma Vercel, incluindo configuração de variáveis de ambiente, integração com Supabase e boas práticas.

## 📋 Pré-requisitos

Antes de iniciar o deploy, certifique-se de ter:

- [ ] Conta na [Vercel](https://vercel.com)
- [ ] Conta no [GitHub](https://github.com) (ou GitLab/Bitbucket)
- [ ] Projeto Supabase configurado e funcionando
- [ ] Repositório Git com o código do projeto

## 🚀 Métodos de Deploy

### Opção 1: Deploy via Git Integration (Recomendado)

A integração Git é o método mais comum e recomendado para deploy na Vercel. Cada commit ou pull request dispara automaticamente um novo deploy.

#### Passo 1: Conectar Repositório

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Selecione **"Import Git Repository"**
4. Autorize o acesso ao seu provedor Git (GitHub/GitLab/Bitbucket)
5. Selecione o repositório `garageinn`

#### Passo 2: Configurar Projeto (Monorepo)

Como este é um monorepo, você precisa configurar o **Root Directory**:

| Configuração | Valor |
|--------------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/web` |
| **Build Command** | `npm run build` (ou deixe automático) |
| **Output Directory** | `.next` (automático) |
| **Install Command** | `npm install` (automático) |

> ⚠️ **Importante**: Clique em **"Edit"** ao lado de **Root Directory** e selecione `apps/web`.

#### Passo 3: Configurar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione as seguintes variáveis:

```env
# Supabase - Obrigatórias
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opcional - Para funcionalidades avançadas
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Passo 4: Deploy

Clique em **"Deploy"** e aguarde o processo de build.

---

### Opção 2: Deploy via Vercel CLI

Para deploys manuais ou CI/CD customizado:

```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Navegar para o diretório do projeto
cd apps/web

# Fazer login na Vercel
vercel login

# Deploy de preview
vercel

# Deploy de produção
vercel --prod
```

---

### Opção 3: Integração Vercel + Supabase Marketplace

A Vercel oferece uma integração nativa com Supabase que sincroniza automaticamente as variáveis de ambiente:

1. Acesse [Vercel Integrations](https://vercel.com/integrations/supabase)
2. Clique em **"Add Integration"**
3. Selecione seu projeto Vercel
4. Conecte ao seu projeto Supabase
5. As variáveis serão sincronizadas automaticamente

**Variáveis sincronizadas automaticamente:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `POSTGRES_URL` (para conexões diretas)

---

## 🔐 Variáveis de Ambiente

### Variáveis Obrigatórias

| Variável | Descrição | Onde encontrar |
|----------|-----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Dashboard Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima pública | Dashboard Supabase → Settings → API |

### Variáveis Opcionais

| Variável | Descrição | Quando usar |
|----------|-----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (admin) | Server Actions com privilégios elevados |
| `NEXT_PUBLIC_SITE_URL` | URL do site em produção | Redirecionamentos de autenticação |

### Configuração por Ambiente

A Vercel permite configurar variáveis diferentes por ambiente:

- **Production**: Variáveis para o domínio principal
- **Preview**: Variáveis para deploys de preview (PRs)
- **Development**: Variáveis para `vercel dev` local

```
┌─────────────────────────────────────────────────────────────┐
│  Environment Variables                                       │
├─────────────────────────────────────────────────────────────┤
│  NEXT_PUBLIC_SUPABASE_URL                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ https://prod-project.supabase.co                    │    │
│  └─────────────────────────────────────────────────────┘    │
│  ☑ Production  ☑ Preview  ☑ Development                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Configuração de URLs de Redirecionamento (Supabase Auth)

Para que a autenticação funcione corretamente com deploys de preview:

### No Dashboard do Supabase

1. Acesse **Authentication** → **URL Configuration**
2. Configure o **Site URL**: `https://seu-dominio.vercel.app`
3. Adicione **Redirect URLs** adicionais:

```
# Produção
https://seu-dominio.vercel.app/**

# Preview deployments (Vercel)
https://*-seu-time.vercel.app/**

# Desenvolvimento local
http://localhost:3000/**
```

### Função Helper para Redirecionamento Dinâmico

Para suportar URLs dinâmicas de preview, use esta função:

```typescript
// lib/utils/get-url.ts
export function getURL() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // URL configurada manualmente
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // URL automática da Vercel
    'http://localhost:3000/'
  
  // Garantir https:// quando não for localhost
  url = url.startsWith('http') ? url : `https://${url}`
  // Garantir trailing slash
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}
```

---

## 📁 Estrutura do Projeto (Monorepo)

```
garageinn/
├── apps/
│   └── web/                    ← Root Directory para Vercel
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── lib/
│       │   └── middleware.ts
│       ├── public/
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
├── projeto/
└── AGENTS.md
```

---

## ⚙️ Configuração do next.config.ts

O arquivo de configuração atual é mínimo, mas pode ser expandido conforme necessário:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações de imagem (se necessário)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  
  // Headers de segurança (opcional)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## 🔍 Verificação Pós-Deploy

Após o deploy, verifique:

### 1. Funcionalidades Críticas

- [ ] Página de login carrega corretamente
- [ ] Autenticação funciona (login/logout)
- [ ] Redirecionamentos após login funcionam
- [ ] Dados são carregados do Supabase
- [ ] Middleware de autenticação protege rotas

### 2. Performance

- [ ] Core Web Vitals estão verdes
- [ ] Tempo de carregamento < 3s
- [ ] Sem erros no console do navegador

### 3. Logs

Acesse os logs na Vercel:
1. Dashboard → Seu Projeto → **Deployments**
2. Selecione o deploy → **Functions** ou **Logs**

---

## 🌐 Configuração de Domínio Customizado

### Adicionar Domínio

1. Dashboard Vercel → Seu Projeto → **Settings** → **Domains**
2. Adicione seu domínio: `garageinn.com.br`
3. Configure os registros DNS conforme instruído

### Registros DNS Necessários

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

### Atualizar Supabase

Após configurar o domínio, atualize no Supabase:
1. **Site URL**: `https://garageinn.com.br`
2. **Redirect URLs**: Adicione `https://garageinn.com.br/**`

---

## 🔄 CI/CD Automático

A Vercel configura automaticamente:

### Preview Deployments

- Cada **Pull Request** gera um deploy de preview
- URL única: `https://garageinn-git-branch-name-team.vercel.app`
- Comentário automático no PR com a URL

### Production Deployments

- Cada **merge na branch main** dispara deploy de produção
- Atualiza automaticamente o domínio principal

### Branch Protection (Recomendado)

Configure no GitHub:
1. **Settings** → **Branches** → **Add rule**
2. Branch: `main`
3. Ative:
   - ☑ Require pull request reviews
   - ☑ Require status checks to pass (Vercel)

---

## 🛠️ Troubleshooting

### Erro: "Missing Supabase environment variables"

**Causa**: Variáveis de ambiente não configuradas.

**Solução**:
1. Verifique se `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão configuradas
2. Certifique-se de que estão habilitadas para o ambiente correto (Production/Preview)
3. Faça um novo deploy após adicionar as variáveis

### Erro: Build falha no Root Directory

**Causa**: Root Directory incorreto.

**Solução**:
1. Vá em **Settings** → **General** → **Root Directory**
2. Defina como `apps/web`
3. Salve e faça redeploy

### Erro: Autenticação não redireciona corretamente

**Causa**: URLs de redirecionamento não configuradas no Supabase.

**Solução**:
1. Acesse Supabase Dashboard → **Authentication** → **URL Configuration**
2. Adicione a URL do deploy (incluindo preview URLs)
3. Use wildcards: `https://*-seu-time.vercel.app/**`

### Erro: "NEXT_PUBLIC_* not available"

**Causa**: Variáveis `NEXT_PUBLIC_*` são inlined no build.

**Solução**:
- Faça um novo deploy após alterar variáveis `NEXT_PUBLIC_*`
- Variáveis `NEXT_PUBLIC_*` não podem ser alteradas em runtime

---

## 📊 Monitoramento

### Vercel Analytics (Opcional)

Ative analytics para monitorar:
- Core Web Vitals
- Tempo de carregamento por página
- Erros de runtime

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Speed Insights (Opcional)

```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## 📝 Checklist Final de Deploy

```
□ Repositório conectado à Vercel
□ Root Directory configurado como `apps/web`
□ Variáveis de ambiente configuradas
  □ NEXT_PUBLIC_SUPABASE_URL
  □ NEXT_PUBLIC_SUPABASE_ANON_KEY
□ URLs de redirecionamento configuradas no Supabase
□ Build completado com sucesso
□ Funcionalidades testadas
  □ Login/Logout
  □ Navegação
  □ Carregamento de dados
□ Domínio customizado configurado (opcional)
□ SSL ativo (automático na Vercel)
```

---

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Vercel + Next.js](https://vercel.com/docs/frameworks/nextjs)
- [Vercel + Supabase Integration](https://vercel.com/integrations/supabase)
- [Supabase Auth Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Monorepos](https://vercel.com/docs/monorepos)

---

## 📞 Suporte

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/support](https://supabase.com/support)
- **Projeto GarageInn**: Abra uma issue no repositório

