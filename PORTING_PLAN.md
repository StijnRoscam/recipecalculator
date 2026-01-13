# ButcherCalculator - Electron/React Port Plan

## Overview

Port the existing Tauri/SvelteKit application to Electron with React, TypeScript, and TailwindCSS.

### Technology Mapping

| Current | Target |
|---------|--------|
| SvelteKit 5 | React 18 + React Router |
| Tauri 2 (Rust) | Electron (Node.js) |
| Svelte 5 runes | React hooks + Context/Zustand |
| sveltekit-i18n | react-i18next |
| TailwindCSS | TailwindCSS (keep) |
| SQLite (Rust) | better-sqlite3 (Node.js) |

---

## Phase 1: Project Setup

### 1.1 Initialize Electron + React Project
- Set up Electron with electron-vite or electron-forge
- Configure React 18 with TypeScript
- Set up TailwindCSS
- Configure ESLint and Prettier
- Set up development hot-reload

### 1.2 Database Setup
- Install better-sqlite3 for SQLite access
- Port migration scripts from SQL files
- Set up database connection with WAL mode
- Create database initialization on app start

### 1.3 IPC Communication Layer
- Define IPC channels for main/renderer communication
- Create type-safe IPC handlers
- Set up preload script with context bridge

---

## Phase 2: Core Infrastructure

### 2.1 Type Definitions
- Port all TypeScript types from existing codebase
- Create shared types for IPC communication
- Define validation schemas (zod recommended)

### 2.2 Database Layer (Main Process)
- Create repository classes for each entity
- Implement CRUD operations with better-sqlite3
- Port unit conversion logic
- Port pricing calculation logic
- Implement transaction support

### 2.3 IPC Handlers (Main Process)
- Materials handlers
- Recipes handlers
- Ingredients handlers
- Packaging handlers
- Settings handlers
- Pricing handlers

### 2.4 Frontend Services (Renderer)
- Create service layer that wraps IPC calls
- Mirror the existing service API structure
- Add error handling and type safety

---

## Phase 3: UI Foundation

### 3.1 Layout & Navigation
- Create app layout with header
- Implement React Router configuration
- Build Navigation component
- Add active route highlighting

### 3.2 Shared Components
- Button component
- Input/TextField component
- Select/Dropdown component
- Modal/Dialog component
- Card component
- Table component
- Loading spinner
- Error message display

### 3.3 Internationalization
- Set up react-i18next
- Port translation files (en, nl)
- Create LanguageSelector component
- Implement language persistence

---

## Phase 4: Feature Implementation

### 4.1 Materials Module
- Materials list page with search
- Create material form/page
- Edit material page
- Delete confirmation dialog
- Archive functionality

### 4.2 Packaging Module
- Packaging list page with search
- Create packaging form/page
- Edit packaging page
- Delete confirmation dialog
- Archive functionality

### 4.3 Recipes Module
- Recipes grid page with cards
- Create recipe form/page
- Recipe detail view page
- Edit recipe page
- Duplicate recipe functionality
- Favorite toggle
- Archive functionality

### 4.4 Ingredients Management
- Ingredient list component (editable)
- Add ingredient dialog with autocomplete
- Update ingredient quantity/unit
- Remove ingredient
- Drag-and-drop reordering

### 4.5 Recipe Packaging
- Recipe packaging list component
- Add packaging dialog
- Update packaging quantity
- Remove packaging

### 4.6 Cost Breakdown
- Cost breakdown component
- Material cost display
- Labor cost display
- Packaging cost display
- Profit margin calculations
- VAT calculations
- Weight calculations (gross/net)

### 4.7 Settings Module
- Settings page
- Labor rate configuration
- Default VAT rate configuration

---

## Phase 5: Advanced Features

### 5.1 Search & Filtering
- Debounced search (300ms)
- Archive filter toggle
- Favorite filter for recipes

### 5.2 Data Validation
- Form validation with error messages
- Real-time validation feedback
- Unique name checking

### 5.3 UX Enhancements
- Loading states during async operations
- Error handling with user-friendly messages
- Keyboard navigation support
- Modal escape-to-close

---

## Phase 6: Testing & Polish

### 6.1 Testing
- Unit tests for pricing calculations
- Unit tests for unit conversion
- Integration tests for database operations
- Component tests for critical UI

### 6.2 Build & Distribution
- Configure electron-builder
- Set up auto-updater (optional)
- Create installers for Windows/macOS/Linux

---

# User Stories

## Epic 1: Application Setup

### US-1.1: Application Launch
**As a** user
**I want** the application to launch quickly and reliably
**So that** I can start working without delays

**Acceptance Criteria:**
- Application opens within 3 seconds
- Database is initialized automatically on first run
- Default settings are created if not present
- Application window is properly sized and centered

### US-1.2: Language Selection
**As a** Dutch or English speaking user
**I want** to switch the application language
**So that** I can use the app in my preferred language

**Acceptance Criteria:**
- Language selector is visible in the navigation
- Supports English and Dutch
- Language preference is persisted across sessions
- All UI text updates immediately on language change

---

## Epic 2: Source Materials Management

### US-2.1: View All Materials
**As a** butcher
**I want** to see a list of all my source materials
**So that** I can manage my inventory of raw ingredients

**Acceptance Criteria:**
- Display materials in a searchable list/table
- Show name, current price, unit, supplier
- Visual indicator for archived materials
- Option to show/hide archived materials

### US-2.2: Search Materials
**As a** user
**I want** to search materials by name
**So that** I can quickly find specific ingredients

**Acceptance Criteria:**
- Search input with debounced filtering (300ms)
- Case-insensitive search
- Results update as I type
- Clear search option

### US-2.3: Create Material
**As a** user
**I want** to add a new source material
**So that** I can use it in my recipes

**Acceptance Criteria:**
- Form with fields: name, price, unit (kg/g), supplier, SKU, notes
- Name is required and must be unique (case-insensitive)
- Price must be >= 0
- Unit must be kg or g
- Success message on creation
- Redirect to materials list after creation

### US-2.4: Edit Material
**As a** user
**I want** to update material information
**So that** I can keep prices and details current

**Acceptance Criteria:**
- Pre-populated form with current values
- Same validation as creation
- Success message on update
- Changes reflected immediately in lists

### US-2.5: Delete Material
**As a** user
**I want** to delete a material I no longer use
**So that** I can keep my materials list clean

**Acceptance Criteria:**
- Confirmation dialog before deletion
- Cannot delete if used in any recipe
- Clear error message if deletion is blocked
- Success message on deletion

### US-2.6: Archive Material
**As a** user
**I want** to archive a material instead of deleting it
**So that** existing recipes using it still work

**Acceptance Criteria:**
- Archive option available for each material
- Archived materials are visually distinct
- Archived materials still work in existing recipes
- Can unarchive a material

---

## Epic 3: Packaging Materials Management

### US-3.1: View All Packaging Materials
**As a** user
**I want** to see all packaging materials
**So that** I can manage my packaging inventory

**Acceptance Criteria:**
- Display packaging in a searchable list
- Show name, unit price, unit type, supplier
- Visual indicator for archived items
- Option to show/hide archived items

### US-3.2: Create Packaging Material
**As a** user
**I want** to add a new packaging material
**So that** I can include it in recipe costs

**Acceptance Criteria:**
- Form with fields: name, unit price, unit type, supplier, SKU, notes
- Unit types: piece, meter, roll, sheet, box, bag
- Name must be unique (case-insensitive)
- Price must be >= 0
- Success message on creation

### US-3.3: Edit Packaging Material
**As a** user
**I want** to update packaging material details
**So that** costs remain accurate

**Acceptance Criteria:**
- Pre-populated form with current values
- Same validation as creation
- Changes reflected in recipe costs

### US-3.4: Delete Packaging Material
**As a** user
**I want** to delete unused packaging materials
**So that** I can keep my list organized

**Acceptance Criteria:**
- Confirmation dialog before deletion
- Cannot delete if used in any recipe
- Clear error message if blocked
- Success message on deletion

---

## Epic 4: Recipe Management

### US-4.1: View All Recipes
**As a** user
**I want** to see all my recipes in a grid view
**So that** I can quickly browse and access them

**Acceptance Criteria:**
- Display recipes as cards in a grid
- Show recipe name, description, total cost
- Favorite indicator (star icon)
- Quick actions menu (edit, duplicate, delete, archive)
- Search by recipe name
- Filter by favorites
- Option to show/hide archived

### US-4.2: Create Recipe
**As a** user
**I want** to create a new recipe
**So that** I can calculate its costs

**Acceptance Criteria:**
- Form with fields: name, description, yield quantity, yield unit, prep time, profit margin, waste percentage, VAT percentage, instructions
- Name is required and unique
- Yield quantity must be > 0
- Profit margin: 0-100%
- Waste percentage: 0-100%
- VAT percentage: typically 0, 6, 9, or 21%
- Success message on creation

### US-4.3: View Recipe Details
**As a** user
**I want** to view a recipe's full details and cost breakdown
**So that** I can understand my costs and pricing

**Acceptance Criteria:**
- Display recipe metadata
- List all ingredients with quantities and costs
- List all packaging with quantities and costs
- Show cost breakdown:
  - Material cost
  - Labor cost
  - Packaging cost
  - Total cost
  - Cost per unit
  - Suggested price (with margin)
  - VAT amount
  - Price including VAT
- For weight-based recipes: gross weight, waste amount, net weight, cost per kg

### US-4.4: Edit Recipe
**As a** user
**I want** to modify recipe details
**So that** I can update ingredients, quantities, or pricing

**Acceptance Criteria:**
- Edit all recipe metadata
- Add/remove/update ingredients
- Add/remove/update packaging
- Reorder ingredients via drag-and-drop
- Real-time cost recalculation
- Save changes

### US-4.5: Duplicate Recipe
**As a** user
**I want** to duplicate an existing recipe
**So that** I can create variations without starting from scratch

**Acceptance Criteria:**
- Prompt for new recipe name
- Copy all ingredients
- Copy all packaging
- New recipe appears in list

### US-4.6: Toggle Favorite
**As a** user
**I want** to mark recipes as favorites
**So that** I can quickly access frequently used recipes

**Acceptance Criteria:**
- Toggle favorite with star icon
- Favorites persist across sessions
- Filter recipes to show only favorites

### US-4.7: Delete Recipe
**As a** user
**I want** to delete recipes I no longer need
**So that** I can keep my recipe list organized

**Acceptance Criteria:**
- Confirmation dialog
- Cascades to delete ingredients and packaging links
- Success message
- Recipe removed from list

### US-4.8: Archive Recipe
**As a** user
**I want** to archive old recipes
**So that** I can hide them without losing data

**Acceptance Criteria:**
- Archive option available
- Archived recipes visually distinct
- Can filter to show/hide archived
- Can unarchive

---

## Epic 5: Ingredients Management

### US-5.1: Add Ingredient to Recipe
**As a** user
**I want** to add ingredients to a recipe
**So that** I can build up the recipe's composition

**Acceptance Criteria:**
- Dialog with material autocomplete/search
- Specify quantity and unit (kg or g)
- Optional notes field
- Cannot add same material twice
- Cost updates immediately

### US-5.2: Update Ingredient
**As a** user
**I want** to change ingredient quantities
**So that** I can adjust the recipe

**Acceptance Criteria:**
- Inline editing of quantity
- Change unit (kg/g)
- Update notes
- Cost recalculates immediately

### US-5.3: Remove Ingredient
**As a** user
**I want** to remove ingredients from a recipe
**So that** I can correct mistakes or simplify recipes

**Acceptance Criteria:**
- Remove button for each ingredient
- No confirmation needed (can re-add)
- Cost updates immediately

### US-5.4: Reorder Ingredients
**As a** user
**I want** to reorder ingredients
**So that** I can organize them logically

**Acceptance Criteria:**
- Drag-and-drop reordering
- Order persists after save
- Visual feedback during drag

---

## Epic 6: Recipe Packaging

### US-6.1: Add Packaging to Recipe
**As a** user
**I want** to add packaging materials to a recipe
**So that** packaging costs are included in pricing

**Acceptance Criteria:**
- Dialog with packaging autocomplete/search
- Specify quantity
- Optional notes
- Cost updates immediately

### US-6.2: Update Recipe Packaging
**As a** user
**I want** to change packaging quantities
**So that** I can adjust for different package sizes

**Acceptance Criteria:**
- Inline editing of quantity
- Update notes
- Cost recalculates immediately

### US-6.3: Remove Recipe Packaging
**As a** user
**I want** to remove packaging from a recipe
**So that** I can adjust packaging configuration

**Acceptance Criteria:**
- Remove button for each packaging item
- Cost updates immediately

---

## Epic 7: Pricing & Cost Calculation

### US-7.1: View Cost Breakdown
**As a** user
**I want** to see a detailed cost breakdown for a recipe
**So that** I understand where my costs come from

**Acceptance Criteria:**
- Material cost total and per-ingredient breakdown
- Labor cost based on prep time and labor rate
- Packaging cost total and per-item breakdown
- Total cost
- Cost per unit (yield)

### US-7.2: Calculate Suggested Price
**As a** user
**I want** to see a suggested selling price based on profit margin
**So that** I can price my products appropriately

**Acceptance Criteria:**
- Suggested price = total cost * (1 + margin/100)
- Display profit amount
- Update when margin changes

### US-7.3: Calculate VAT
**As a** user
**I want** to see VAT calculations
**So that** I know the final customer price

**Acceptance Criteria:**
- VAT amount based on VAT percentage
- Price including VAT
- Support for 0%, 6%, 9%, 21% rates

### US-7.4: View Weight Calculations
**As a** user
**I want** to see weight-based cost analysis
**So that** I can price by weight when needed

**Acceptance Criteria:**
- Gross weight (sum of ingredients)
- Waste amount (based on waste percentage)
- Net weight (gross - waste)
- Cost per kg (gross)
- Cost per kg (net)

---

## Epic 8: Settings Management

### US-8.1: Configure Labor Rate
**As a** user
**I want** to set my hourly labor rate
**So that** labor costs are calculated correctly

**Acceptance Criteria:**
- Input field for hourly rate (EUR)
- Must be >= 0
- Persists across sessions
- Default: 25.00 EUR

### US-8.2: Configure Default VAT Rate
**As a** user
**I want** to set a default VAT rate
**So that** new recipes use my standard rate

**Acceptance Criteria:**
- Input field for VAT percentage
- Persists across sessions
- Default: 21%

---

## Epic 9: Navigation & UX

### US-9.1: Navigate Between Sections
**As a** user
**I want** clear navigation between app sections
**So that** I can easily move between materials, recipes, packaging, and settings

**Acceptance Criteria:**
- Sticky header with navigation links
- Active page highlighting
- Links: Home, Materials, Packaging, Recipes, Settings

### US-9.2: Form Validation Feedback
**As a** user
**I want** immediate feedback on form errors
**So that** I can correct mistakes before submitting

**Acceptance Criteria:**
- Inline error messages
- Fields highlighted when invalid
- Clear error descriptions

### US-9.3: Loading States
**As a** user
**I want** to see loading indicators during operations
**So that** I know the app is working

**Acceptance Criteria:**
- Loading spinner during data fetches
- Disabled buttons during submissions
- Loading state on initial page load

### US-9.4: Confirmation Dialogs
**As a** user
**I want** confirmation before destructive actions
**So that** I don't accidentally delete data

**Acceptance Criteria:**
- Modal dialog for delete confirmations
- Clear message about what will be deleted
- Cancel and Confirm buttons
- Escape key to close

---

## Implementation Priority

### Phase 1 - MVP (Weeks 1-3)
1. Project setup with Electron + React + TypeScript + TailwindCSS
2. Database setup and migrations
3. Materials CRUD (US-2.1 through US-2.6)
4. Basic navigation (US-9.1)

### Phase 2 - Core Features (Weeks 4-6)
5. Packaging CRUD (US-3.1 through US-3.4)
6. Recipe CRUD (US-4.1 through US-4.8)
7. Ingredients management (US-5.1 through US-5.4)
8. Recipe packaging (US-6.1 through US-6.3)

### Phase 3 - Pricing & Polish (Weeks 7-8)
9. Cost breakdown (US-7.1 through US-7.4)
10. Settings (US-8.1, US-8.2)
11. Internationalization (US-1.2)
12. UX polish (US-9.2 through US-9.4)

### Phase 4 - Testing & Release (Week 9-10)
13. Testing
14. Bug fixes
15. Build configuration
16. Distribution setup

---

## Technical Notes

### Database
- Keep SQLite with better-sqlite3
- Synchronous API (runs in main process)
- Keep existing schema and migrations
- WAL mode for performance

### State Management
- React Context for global state (settings, language)
- Local state with useState/useReducer for forms
- Consider Zustand if state becomes complex

### IPC Communication
```typescript
// Main process
ipcMain.handle('materials:getAll', async (event, includeArchived) => {
  return materialRepository.getAll(includeArchived);
});

// Renderer process (via preload)
const materials = await window.api.materials.getAll(false);
```

### Folder Structure
```
src/
├── main/                    # Electron main process
│   ├── index.ts
│   ├── database/
│   │   ├── connection.ts
│   │   ├── migrations/
│   │   └── repositories/
│   ├── handlers/           # IPC handlers
│   └── services/
├── preload/
│   └── index.ts
├── renderer/               # React app
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   ├── i18n/
│   └── styles/
└── shared/                 # Shared types
    └── types/
```
