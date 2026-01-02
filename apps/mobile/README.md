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
| `npm test` | Executa testes unitários |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run test:coverage` | Executa testes com relatório de cobertura |
| `npm run test:ci` | Executa testes para CI/CD |

## Testes

O projeto usa **Jest** com **React Native Testing Library** para testes unitários.

### Estrutura de Testes

```
src/
├── components/ui/__tests__/    # Testes de componentes UI
│   ├── Button.test.tsx
│   ├── Input.test.tsx
│   ├── Card.test.tsx
│   ├── Badge.test.tsx
│   ├── Loading.test.tsx
│   ├── EmptyState.test.tsx
│   └── TextArea.test.tsx
├── theme/__tests__/            # Testes de tokens de tema
│   └── colors.test.ts
└── lib/observability/__tests__/ # Testes de observabilidade
    ├── hooks.test.ts
    └── logger.test.ts
```

### Cobertura de Testes

| Módulo | Cobertura |
|--------|-----------|
| `components/ui/` | ~85% |
| `theme/` | 100% |
| `lib/observability/` | ~70% |

### Executando Testes

```bash
# Todos os testes
npm test

# Testes específicos
npm test -- --testPathPattern="Button"

# Com cobertura
npm run test:coverage

# Watch mode (desenvolvimento)
npm run test:watch
```

## Observabilidade

O app inclui sistema de observabilidade integrado com **Sentry**.

### Configuração

1. Adicione o DSN do Sentry no `.env`:
```
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Hooks Disponíveis

| Hook | Uso |
|------|-----|
| `useScreenTracking(screenName)` | Rastreia navegação entre telas |
| `useActionTracking(context)` | Rastreia ações do usuário |
| `useAppStateTracking()` | Monitora foreground/background |
| `usePerformanceTracking(context)` | Mede performance de operações |
| `useErrorTracking(context)` | Captura e reporta erros |

### Exemplo de Uso

```typescript
import { useScreenTracking, useActionTracking } from '@/lib/observability';

function MyScreen() {
  useScreenTracking('MyScreen');
  const trackAction = useActionTracking('MyScreen');

  const handlePress = () => {
    trackAction('button_pressed', { buttonId: 'submit' });
    // ... lógica
  };

  return <Button onPress={handlePress}>Submit</Button>;
}
```

### Logger Estruturado

```typescript
import { logger } from '@/lib/observability';

logger.info('User logged in', { userId: '123' });
logger.error('Failed to fetch', { error: err.message });
logger.debug('Debug info', { data });
```

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
