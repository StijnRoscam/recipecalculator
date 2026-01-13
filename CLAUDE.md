# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recipe Calculator is an Electron desktop application for butchers and food producers to calculate recipe costs, manage source materials, and determine pricing. Built with React 18, TypeScript, Prisma ORM (SQLite), and electron-vite.

## Commands

```bash
# Development
npm run dev              # Start Electron app with hot reload

# Building
npm run build            # Build for production

# Testing
npm run test             # Run tests once
npm run test:watch       # Watch mode for development

# Database
npx prisma generate      # Regenerate client after schema changes
npx prisma migrate dev --name <name>  # Create migration
npx prisma studio        # GUI database viewer
```

## Architecture

Three-process Electron architecture:

```
Main Process (src/main/)
├── index.ts              # App lifecycle, window creation
├── database/prisma.ts    # Prisma client singleton
└── ipc/                  # IPC handlers for database operations
         ↓ IPC (invoke/handle)
Preload Script (src/preload/)
├── index.ts              # Context bridge, exposes window.api
└── index.d.ts            # TypeScript definitions
         ↓ window.api
Renderer Process (src/renderer/src/)
├── App.tsx               # Root component with navigation state
├── pages/                # Page components (MaterialsPage, etc.)
├── components/           # Reusable components (Navigation, LanguageSwitcher)
├── hooks/                # Custom hooks (useDebounce)
└── i18n/                 # Translations (en.json, nl.json)
```

**Shared Types**: `src/shared/types/` - Single source of truth for interfaces used across all processes.

## Key Patterns

### Adding IPC Handlers
1. Create handler function in `src/main/ipc/`
2. Register with `ipcMain.handle()` in `src/main/ipc/index.ts`
3. Expose in `src/preload/index.ts` API object
4. Add type to `src/preload/index.d.ts`
5. Call from renderer via `window.api.domain.method()`

### Database Schema
Models defined in `prisma/schema.prisma`:
- **SourceMaterial** - Raw ingredients with pricing
- **Recipe** - Finished products with ingredients
- **RecipeIngredient** - Junction table (Recipe ↔ SourceMaterial)
- **PackagingMaterial** - Packaging costs
- **Category** - Grouping for materials/recipes
- **Setting** - Key-value app configuration

### Internationalization
- Languages: English (en), Dutch (nl)
- Files: `src/renderer/src/i18n/locales/{en,nl}.json`
- Usage: `const { t } = useTranslation()` then `t('key.path')`
- Storage: localStorage key `language`

### Testing
- Framework: Vitest + React Testing Library
- Setup: `src/renderer/src/__tests__/setup.ts`
- Mock `window.api` in tests (see MaterialsPage.test.tsx for patterns)
- Use `vi.useFakeTimers()` with `act()` for debounce testing

## Database Location
- **macOS**: `~/Library/Application Support/recipecalculator/butchercalculator.db`
- **Windows**: `%APPDATA%/recipecalculator/butchercalculator.db`
- **Linux**: `~/.config/recipecalculator/butchercalculator.db`

## Branch Naming
Follow pattern: `feature/us-X.X-description` (e.g., `feature/us-2.2-search-materials`)
