# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GarageInn (GAPP) is a garage management SaaS platform for automotive repair shops. It's a monorepo with two applications:

- **apps/web**: Next.js 16 web application (React 19, Tailwind CSS 4)
- **apps/mobile**: Expo/React Native mobile app (Expo 54, React Native 0.81)

Both apps share Supabase as the backend.

## Commands

### Web App (apps/web)
```bash
cd apps/web
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier format
npm run format:check # Prettier check
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright with UI
```

### Mobile App (apps/mobile)
```bash
cd apps/mobile
npm start            # Expo start
npm run android      # Android development
npm run ios          # iOS development
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run test         # Jest tests
npm run test:watch   # Jest watch mode
npm run test:coverage # Coverage report
```

## Architecture

### Web App Structure (Next.js App Router)
- `src/app/(app)/` — Authenticated routes (dashboard, chamados, usuarios, unidades, configuracoes, perfil, checklists)
- `src/app/(auth)/` — Auth-related pages (login, recuperar-senha, redefinir-senha)
- `src/app/auth/callback/` — OAuth callback handler
- `src/proxy.ts` — Next.js middleware for auth protection (exported in middleware.ts)
- `src/components/ui/` — shadcn/ui components
- `src/components/layout/` — Layout components (sidebar, etc.)
- `src/lib/supabase/` — Supabase client configuration
  - `client.ts` — Browser client (createBrowserClient)
  - `server.ts` — Server components client (createServerClient with cookies)
  - `middleware.ts` — Session refresh for middleware
  - `database.types.ts` — Generated TypeScript types

### Mobile App Structure (Expo)
- `modules/` — Feature modules
- `navigation/` — React Navigation setup
- `components/` — Shared components
- `hooks/` — Custom hooks
- `lib/` — Utilities and services
- `theme/` — Theming configuration

### Authentication Flow
Uses Supabase Auth with SSR support (@supabase/ssr). The proxy.ts middleware:
1. Refreshes session tokens via updateSession()
2. Protects routes (redirects unauthenticated users to /login)
3. Redirects authenticated users away from auth pages

Public routes: `/login`, `/recuperar-senha`, `/redefinir-senha`, `/auth/callback`

## Supabase Integration

**Always use the Supabase MCP tool for database operations:**
- `mcp_supabase_execute_sql` — SELECT queries
- `mcp_supabase_apply_migration` — DDL changes (CREATE, ALTER, DROP)
- `mcp_supabase_list_tables` — List existing tables
- `mcp_supabase_generate_typescript_types` — Regenerate database.types.ts after schema changes
- `mcp_supabase_get_advisors` — Check RLS policies after DDL changes

**Rules:**
- Never execute DDL directly; always use apply_migration to maintain history
- Regenerate TypeScript types after any schema change
- Verify security advisors after creating/altering tables

## Design System

The web app uses shadcn/ui with a custom theme:
- Primary color: Red (`hsl(0, 95%, 60%)`) — GarageInn brand identity
- Supports dark mode via next-themes
- Components in `src/components/ui/`
- CSS variables defined in `src/app/globals.css`
- Uses Tailwind CSS 4 with 4px spacing system

Key utilities:
- `cn()` from `@/lib/utils` for conditional class merging
- HSL color tokens for theme consistency

## Environment Variables

Required for web app:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Conventions

- Follow Conventional Commits (e.g., `feat(chamados): add filter component`)
- Portuguese is used for UI text and feature naming (chamados, unidades, usuarios)
- Use Server Components by default; Client Components only when necessary
- Server Actions in `actions.ts` files for data mutations
