# ESM Import Extensions for Production (Vercel)

## Context
In production environments using Node.js with ESM (`"type": "module"` in `package.json`), relative imports must strictly follow the ESM specification, which requires explicit file extensions.

## Rule
**Always include the `.js` extension in relative imports** for all backend and shared code (files in `api/`, `server/`, and `shared/`).

### Why?
- **Production Strictness**: While local development tools like `tsx` or Vite's dev server might resolve extensions automatically, the production Node.js environment on Vercel will fail with `ERR_MODULE_NOT_FOUND` if the extension is missing.
- **TS to JS**: Even if the source file is `.ts`, the import must use the `.js` extension because that is how it will be resolved at runtime after compilation.

## Examples

### ❌ Incorrect (Works locally, fails in production)
```typescript
import { db } from "./db";
import { schema } from "../shared/schema";
import { registerRoutes } from "../server/routes";
```

### ✅ Correct (Works in both)
```typescript
import { db } from "./db.js";
import { schema } from "../shared/schema.js";
import { registerRoutes } from "../server/routes.js";
```

## Exceptions
- Standard npm packages (e.g., `import express from "express";`) do NOT need extensions.
- Frontend-only code processed exclusively by Vite (files inside `src/` that are NOT imported by `server/` or `api/`) usually handles extensionless imports fine, but consistency is recommended.
