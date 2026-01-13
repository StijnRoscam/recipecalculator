# Recipe Calculator

A desktop application for butchers to calculate recipe costs, manage source materials, and determine pricing for their products.

## Tech Stack

- **Framework**: Electron 28
- **Frontend**: React 18 + TypeScript
- **Database**: SQLite with Prisma ORM
- **Build Tool**: electron-vite
- **Testing**: Vitest + Testing Library
- **i18n**: react-i18next (English & Dutch)

## Getting Started

### Prerequisites

- Node.js 20.x or 22.x
- npm

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Preview production build |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts            # App entry point
│   ├── database/           # Prisma setup and seeding
│   │   ├── prisma.ts       # Prisma client initialization
│   │   └── seed-prisma.ts  # Default data seeding
│   └── ipc/                # IPC handlers
│       ├── index.ts        # Handler registration
│       └── materials.ts    # Materials CRUD operations
├── preload/                 # Secure IPC bridge
│   ├── index.ts            # Context bridge setup
│   └── index.d.ts          # Type definitions
├── renderer/                # React frontend
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── i18n/           # Translations
│       └── __tests__/      # Unit tests
├── shared/                  # Shared types
│   └── types/
└── prisma/
    └── schema.prisma       # Database schema
```

## Database

The application uses SQLite with Prisma ORM. The database is stored in the user data directory:

- **macOS**: `~/Library/Application Support/recipecalculator/butchercalculator.db`
- **Windows**: `%APPDATA%/recipecalculator/butchercalculator.db`
- **Linux**: `~/.config/recipecalculator/butchercalculator.db`

### Prisma Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration_name>

# View database in Prisma Studio
npx prisma studio
```

## Features

### Implemented
- [x] Application launch with SQLite database
- [x] Language selection (English/Dutch)
- [x] View all materials with filtering
- [x] Navigation between sections

### Planned
- [ ] Create/Edit/Delete materials
- [ ] Recipe management
- [ ] Packaging materials
- [ ] Cost calculations
- [ ] Settings configuration

## License

ISC