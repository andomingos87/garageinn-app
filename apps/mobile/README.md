# Gapp Mobile (Garageinn)

Aplicativo mobile para operações de campo do sistema Garageinn.

## Stack

- **Framework**: React Native + Expo (SDK 54)
- **Linguagem**: TypeScript
- **Backend**: Supabase (Auth + Postgres + Storage)
- **UI**: Componentes customizados baseados no Design System

## Estrutura do Projeto

```
apps/mobile/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   └── ui/          # Componentes base (Button, Input, Card, etc.)
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitários e configurações
│   │   └── supabase/    # Cliente Supabase
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Autenticação
│   │   ├── checklists/  # Checklists de abertura/supervisão
│   │   ├── tickets/     # Chamados
│   │   └── profile/     # Perfil do usuário
│   ├── navigation/      # Configuração de navegação
│   ├── theme/           # Tokens de design (cores, tipografia, espaçamento)
│   └── types/           # TypeScript types compartilhados
├── assets/              # Imagens, ícones, fontes
├── App.tsx              # Entry point
├── app.json             # Configuração Expo
└── package.json
```

## Configuração

### 1. Instalar dependências

```bash
cd apps/mobile
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais Supabase
```

### 3. Executar em desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm start

# Ou diretamente para plataforma específica
npm run ios      # iOS (requer macOS)
npm run android  # Android
npm run web      # Web (para testes rápidos)
```

## Design System

O app segue os tokens definidos em `design-system.md`:

### Cores Principais

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#FF3D3D` | Ações principais, CTAs |
| `success` | `#22C55E` | Status positivo |
| `warning` | `#F59E0B` | Alertas |
| `destructive` | `#EF4444` | Ações destrutivas |

### Componentes Base

- `Button` - Variantes: default, secondary, outline, ghost, destructive
- `Input` - Campo de texto com label e erro
- `TextArea` - Campo multilinha
- `Card` - Container com header, content, footer
- `Badge` - Tags de status
- `Loading` - Indicador de carregamento
- `EmptyState` - Estado vazio

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia servidor Expo |
| `npm run ios` | Executa no simulador iOS |
| `npm run android` | Executa no emulador Android |
| `npm run web` | Executa no navegador |
| `npm run lint` | Verifica código com ESLint |
| `npm run typecheck` | Verifica tipos TypeScript |

## Documentação

- **Plano MVP**: `PLANO_MVP.md`
- **Backlog**: `BACKLOG.md`
- **PRD**: `projeto/PRD.md`
- **Design System**: `design-system.md`

## Decisões Técnicas

- **Offline**: Rascunho local + reenvio (checklists + chamados)
- **LGPD**: CPF não é exibido no mobile
- **Escopo**: 1 unidade por chamado
- **Notificações**: Fora do MVP
