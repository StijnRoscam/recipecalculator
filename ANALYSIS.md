# ButcherCalculator - Complete Functionality Analysis

## Overview

**Purpose**: Desktop application for calculating recipe pricing based on source materials, designed for butchers/food producers.

**Tech Stack**:
- **Frontend**: SvelteKit 5 + TypeScript
- **Backend**: Rust + Tauri 2
- **Database**: SQLite with WAL mode
- **i18n**: sveltekit-i18n (English/Dutch)

---

## 1. Core Entities

### 1.1 Source Materials
Raw ingredients used in recipes (meat, spices, etc.)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Unique, case-insensitive |
| current_price | decimal | Price per unit |
| unit_of_measure | enum | kg, g only (weight-based) |
| supplier | string? | Optional supplier name |
| sku | string? | Stock keeping unit |
| notes | string? | Free-text notes |
| is_archived | bool | Soft delete flag |
| created_at/updated_at | datetime | Timestamps |

### 1.2 Recipes
Finished products composed of materials

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Unique, case-insensitive |
| description | string? | Optional description |
| yield_quantity | decimal | How many units produced |
| yield_unit | string | portion, piece, kg, g, l, ml |
| prep_time_minutes | int? | Time for labor cost calc |
| profit_margin | decimal? | 0-100% markup |
| waste_percentage | decimal? | 0-100% material loss |
| vat_percentage | decimal? | 0, 6, 9, or 21% |
| instructions | string? | Preparation instructions |
| is_favorite | bool | Quick access flag |
| is_archived | bool | Soft delete flag |

### 1.3 Recipe Ingredients
Links recipes to materials

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| recipe_id | UUID | FK to recipes (cascade) |
| material_id | UUID | FK to materials (restrict) |
| quantity | decimal | Amount used |
| unit | string | kg or g only |
| sort_order | int | Display order |
| notes | string? | Ingredient-specific notes |

### 1.4 Packaging Materials
Packaging used in recipes

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Unique, case-insensitive |
| unit_price | decimal | Price per unit |
| unit_type | enum | piece, meter, roll, sheet, box, bag |
| supplier | string? | Optional supplier |
| sku | string? | Stock keeping unit |
| notes | string? | Free-text notes |
| is_archived | bool | Soft delete flag |

### 1.5 Recipe Packaging
Links recipes to packaging materials

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| recipe_id | UUID | FK to recipes (cascade) |
| packaging_material_id | UUID | FK to packaging (restrict) |
| quantity | decimal | How many used |
| sort_order | int | Display order |

### 1.6 Settings
Application-wide configuration

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| labor_rate_per_hour | number | 25.00 | EUR per hour for labor costs |
| default_vat_rate | number | 21.0 | Default VAT percentage |

---

## 2. Functional Modules

### 2.1 Material Management

**CRUD Operations**:
- Create material with validation (name uniqueness, price >= 0)
- Read single material or list all
- Update any field
- Delete (blocked if used in recipes)
- Archive (soft delete)

**Search**: Case-insensitive name search with debouncing (300ms)

**Validation Rules**:
- Name: 1-200 chars, trimmed, unique (case-insensitive)
- Price: >= 0
- Unit: Only kg or g allowed

---

### 2.2 Recipe Management

**CRUD Operations**:
- Create recipe (optionally with initial ingredients)
- Read with full cost breakdown
- Update any field
- Delete (cascades to ingredients/packaging)
- Archive (soft delete)
- Duplicate (copies all ingredients)
- Toggle favorite

**Search**: Case-insensitive name search

**Validation Rules**:
- Name: 1-200 chars, unique (case-insensitive)
- Yield quantity: > 0, finite number
- Profit margin: 0-100%
- Waste percentage: 0-100%
- VAT percentage: 0-100% (typically 0, 6, 9, or 21)

---

### 2.3 Ingredient Management

**Operations**:
- Add ingredient to recipe
- Update ingredient quantity/unit/notes
- Remove ingredient
- Reorder ingredients (drag-and-drop)

**Validation Rules**:
- Quantity: > 0
- Unit: Only kg or g (weight-based units)
- No duplicate materials in same recipe

---

### 2.4 Packaging Management

**Packaging Material CRUD**:
- Create/Read/Update/Delete/Archive packaging materials
- Search by name

**Recipe Packaging**:
- Add packaging to recipe
- Update quantity/notes
- Remove packaging
- List all packaging for a recipe

---

### 2.5 Pricing & Cost Calculation

**Cost Components**:

```
MATERIAL COST = Σ(ingredient_quantity × material_price)
               (with unit conversion kg ↔ g)

LABOR COST = (prep_time_minutes / 60) × labor_rate_per_hour

PACKAGING COST = Σ(packaging_quantity × unit_price)

TOTAL COST = material_cost + labor_cost + packaging_cost

COST PER UNIT = total_cost / yield_quantity
```

**Weight Calculations** (for weight-based recipes):
```
GROSS WEIGHT = Σ(ingredient weights in kg)
WASTE AMOUNT = gross_weight × (waste_percentage / 100)
NET WEIGHT = gross_weight - waste_amount
COST PER KG (GROSS) = total_cost / gross_weight
COST PER KG (NET) = total_cost / net_weight
```

**Profit Calculations**:
```
SUGGESTED PRICE = total_cost × (1 + profit_margin / 100)
PROFIT AMOUNT = suggested_price - total_cost
```

**VAT Calculations**:
```
VAT AMOUNT = suggested_price × (vat_percentage / 100)
PRICE INCL VAT = suggested_price + vat_amount
```

**Advanced Features**:
- **Price Change Simulation**: Analyze impact of material price changes across all recipes
- **Margin Analysis**: Generate scenarios at different profit margins

---

### 2.6 Settings Management

**Operations**:
- Get single setting
- Get all settings
- Update setting (upsert)

**Domain-specific validation**:
- labor_rate >= 0
- Value type matches setting_type

---

### 2.7 Internationalization (i18n)

**Supported Languages**: English (en), Dutch (nl)

**Translation Categories**:
- common: Navigation, validation, actions, status
- home: Home page content
- materials: Material-related strings
- recipes: Recipe-related strings
- packaging: Packaging-related strings
- settings: Settings-related strings

**Features**:
- Route-based translation loading
- Language persisted to localStorage
- Dynamic language switching without reload

---

## 3. User Interface

### 3.1 Navigation
- Sticky header with links: Home, Materials, Packaging, Recipes, Settings
- Active route highlighting
- Language selector dropdown

### 3.2 Pages

| Route | Purpose |
|-------|---------|
| `/` | Home/welcome page |
| `/materials` | List all materials with search/filter |
| `/materials/new` | Create new material form |
| `/materials/[id]` | Edit material form |
| `/recipes` | Grid of recipe cards with actions |
| `/recipes/new` | Create new recipe form |
| `/recipes/[id]` | View recipe details + cost breakdown |
| `/recipes/[id]/edit` | Edit recipe with ingredient management |
| `/packaging` | List all packaging materials |
| `/packaging/new` | Create new packaging material |
| `/packaging/[id]` | Edit packaging material |
| `/settings` | Labor rate and VAT configuration |

### 3.3 Components

**Forms**:
- `MaterialForm`: Create/edit source materials
- `RecipeForm`: Create/edit recipe metadata
- `PackagingForm`: Create/edit packaging materials

**Dialogs**:
- `DeleteConfirmDialog`: Confirmation for destructive actions
- `AddIngredientDialog`: Autocomplete ingredient picker
- `AddPackagingDialog`: Autocomplete packaging picker

**Display**:
- `RecipeCard`: Summary card with actions menu
- `IngredientList`: Editable/reorderable ingredient table
- `CostBreakdown`: Comprehensive cost analysis display
- `LanguageSelector`: Language switcher dropdown

### 3.4 UX Features
- Debounced search (300ms)
- Drag-and-drop ingredient reordering
- Modal dialogs with keyboard support (Escape to close)
- Loading states during async operations
- Error messages with validation feedback
- Archived items visual indication
- Favorite toggle with star icon

---

## 4. Data Flow

```
┌─────────────┐    invoke()     ┌──────────────┐
│   Svelte    │ ───────────────▶│    Tauri     │
│  Frontend   │                 │   Commands   │
│  (TS/Svelte)│ ◀─────────────  │    (Rust)    │
└─────────────┘    JSON         └──────────────┘
       │                               │
       ▼                               ▼
┌─────────────┐                 ┌──────────────┐
│  Services   │                 │   Services   │
│(TypeScript) │                 │    (Rust)    │
└─────────────┘                 └──────────────┘
                                       │
                                       ▼
                                ┌──────────────┐
                                │    SQLite    │
                                │   Database   │
                                └──────────────┘
```

---

## 5. Business Rules

### Data Integrity
- Foreign keys enforced at database level
- Cascade delete: ingredients/packaging deleted with recipe
- Restrict delete: can't delete material/packaging if used in recipes
- Case-insensitive unique constraints on names

### Unit System
- Materials: Only weight units (kg, g)
- Ingredients: Only weight units (kg, g)
- Automatic unit conversion in cost calculations

### Monetary Precision
- All money calculations use Decimal (not float)
- Rounding applied at display, not calculation

### Soft Delete
- All entities support archiving
- Archived items filterable in lists
- Archived items still functional for existing recipes

---

## 6. API Reference (Tauri Commands)

### Materials
```
create_material(data) -> SourceMaterial
get_material(id) -> SourceMaterial
get_all_materials(include_archived) -> SourceMaterial[]
update_material(id, data) -> SourceMaterial
delete_material(id) -> void
search_materials(query) -> SourceMaterial[]
archive_material(id) -> void
```

### Recipes
```
create_recipe(data) -> Recipe
get_recipe(id) -> RecipeWithDetails
get_all_recipes(include_archived) -> RecipeWithDetails[]
update_recipe(id, data) -> Recipe
delete_recipe(id) -> void
search_recipes(query) -> RecipeWithDetails[]
archive_recipe(id) -> void
duplicate_recipe(id, new_name) -> Recipe
toggle_favorite(id) -> Recipe
```

### Ingredients
```
add_ingredient(recipe_id, data) -> RecipeIngredient
update_ingredient(ingredient_id, data) -> RecipeIngredient
remove_ingredient(ingredient_id) -> void
reorder_ingredients(recipe_id, ingredient_ids) -> void
```

### Pricing
```
calculate_recipe_pricing(recipe_id) -> RecipePricing
simulate_price_change(data) -> PriceChangeImpact
get_recipe_margin_analysis(data) -> MarginScenario[]
```

### Packaging
```
create_packaging_material(data) -> PackagingMaterial
get_packaging_material(id) -> PackagingMaterial
get_all_packaging_materials(include_archived) -> PackagingMaterial[]
update_packaging_material(id, data) -> PackagingMaterial
delete_packaging_material(id) -> void
search_packaging_materials(query) -> PackagingMaterial[]
archive_packaging_material(id) -> void
add_recipe_packaging(recipe_id, data) -> PackagingWithMaterial
update_recipe_packaging(id, data) -> PackagingWithMaterial
remove_recipe_packaging(id) -> void
get_recipe_packaging(recipe_id) -> PackagingWithMaterial[]
```

### Settings
```
get_setting(key) -> Setting | null
get_all_settings() -> Setting[]
update_setting(key, data) -> Setting
```

---

## 7. Database Schema

### Tables Overview

#### `source_materials`
```sql
CREATE TABLE source_materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    category_id TEXT REFERENCES categories(id),
    current_price REAL NOT NULL,
    unit_of_measure TEXT NOT NULL,  -- 'kg' or 'g'
    supplier TEXT,
    sku TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_archived INTEGER DEFAULT 0
);
```

#### `recipes`
```sql
CREATE TABLE recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    description TEXT,
    category_id TEXT REFERENCES categories(id),
    yield_quantity REAL NOT NULL,
    yield_unit TEXT NOT NULL,
    prep_time_minutes INTEGER,
    instructions TEXT,
    profit_margin REAL,        -- 0-100
    waste_percentage REAL,     -- 0-100
    vat_percentage REAL,       -- 0, 6, 9, 21, etc.
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_archived INTEGER DEFAULT 0,
    is_favorite INTEGER DEFAULT 0
);
```

#### `recipe_ingredients`
```sql
CREATE TABLE recipe_ingredients (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    material_id TEXT NOT NULL REFERENCES source_materials(id) ON DELETE RESTRICT,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,        -- 'kg' or 'g'
    sort_order INTEGER NOT NULL,
    notes TEXT
);
```

#### `packaging_materials`
```sql
CREATE TABLE packaging_materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    unit_price REAL NOT NULL,
    unit_type TEXT NOT NULL,   -- 'piece', 'meter', 'roll', 'sheet', 'box', 'bag'
    supplier TEXT,
    sku TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_archived INTEGER DEFAULT 0
);
```

#### `recipe_packaging`
```sql
CREATE TABLE recipe_packaging (
    id TEXT PRIMARY KEY,
    recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    packaging_material_id TEXT NOT NULL REFERENCES packaging_materials(id) ON DELETE RESTRICT,
    quantity REAL NOT NULL,
    sort_order INTEGER NOT NULL,
    notes TEXT
);
```

#### `settings`
```sql
CREATE TABLE settings (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    setting_type TEXT NOT NULL CHECK(setting_type IN ('string', 'number', 'boolean')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

#### `categories`
```sql
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('material', 'recipe')),
    color TEXT
);
```

#### `price_history`
```sql
CREATE TABLE price_history (
    id TEXT PRIMARY KEY,
    material_id TEXT NOT NULL REFERENCES source_materials(id),
    price REAL NOT NULL,
    effective_date TEXT NOT NULL,
    notes TEXT
);
```

### Database Configuration
- **Foreign Keys**: ENABLED
- **Journal Mode**: WAL (Write-Ahead Logging)
- **Synchronous Mode**: NORMAL
- **Memory Mapping**: 268MB

---

## 8. Database Migrations

| # | Name | Purpose |
|---|------|---------|
| 001 | initial_schema | Base tables: categories, materials, recipes, ingredients, price_history |
| 002 | add_waste_percentage | Add waste tracking to recipes |
| 003 | add_settings_table | Add settings table with labor rate |
| 004 | add_vat_support | Add VAT percentage to recipes |
| 005 | add_packaging_materials | Add packaging system |

---

## 9. Data Models (TypeScript)

### Material Types
```typescript
type UnitOfMeasure = 'kilogram' | 'gram';

interface SourceMaterial {
  id: string;
  name: string;
  categoryId: string | null;
  currentPrice: number;
  unitOfMeasure: UnitOfMeasure;
  supplier: string | null;
  sku: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

interface CreateMaterialInput {
  name: string;
  currentPrice: number;
  unitOfMeasure: UnitOfMeasure;
  categoryId?: string;
  supplier?: string;
  sku?: string;
  notes?: string;
}
```

### Recipe Types
```typescript
interface Recipe {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes: number | null;
  instructions: string | null;
  profitMargin: number | null;
  wastePercentage: number | null;
  vatPercentage: number | null;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isFavorite: boolean;
}

interface RecipeIngredient {
  id: string;
  recipeId: string;
  materialId: string;
  quantity: number;
  unit: string;
  sortOrder: number;
  notes: string | null;
}

interface IngredientWithMaterial {
  ingredient: RecipeIngredient;
  material: SourceMaterial;
  lineCost: number;
  costPercentage: number;
  unitError: string | null;
}

interface RecipeWithDetails {
  recipe: Recipe;
  ingredients: IngredientWithMaterial[];
  materialCost: number;
  laborCost: number;
  totalCost: number;
  costPerUnit: number;
  laborRatePerHour: number;
  grossWeight: number | null;
  wasteAmount: number | null;
  netWeight: number | null;
  costPerKgGross: number | null;
  costPerKgNet: number | null;
}
```

### Packaging Types
```typescript
type PackagingUnitType = 'piece' | 'meter' | 'roll' | 'sheet' | 'box' | 'bag';

interface PackagingMaterial {
  id: string;
  name: string;
  unitPrice: number;
  unitType: PackagingUnitType;
  supplier: string | null;
  sku: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

interface RecipePackaging {
  id: string;
  recipeId: string;
  packagingMaterialId: string;
  quantity: number;
  sortOrder: number;
  notes: string | null;
}

interface PackagingWithMaterial {
  packaging: RecipePackaging;
  material: PackagingMaterial;
  lineCost: number;
}
```

### Pricing Types
```typescript
interface RecipePricing {
  recipeId: string;
  recipeName: string;
  materialCost: number;
  laborCost: number;
  packagingCost: number;
  totalCost: number;
  costPerUnit: number;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes: number | null;
  laborRatePerHour: number;
  profitMargin: number | null;
  suggestedPrice: number | null;
  profitAmount: number | null;
  vatPercentage: number | null;
  vatAmount: number | null;
  priceInclVat: number | null;
  ingredients: IngredientCost[];
  packagingItems: PackagingCost[];
}

interface IngredientCost {
  ingredientId: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineCost: number;
  percentage: number;
}
```

### Settings Types
```typescript
type SettingType = 'string' | 'number' | 'boolean';

interface Setting {
  id: string;
  key: string;
  value: string;
  settingType: SettingType;
  createdAt: string;
  updatedAt: string;
}
```

---

## 10. Unit Conversion Logic

### Supported Conversions
```
Weight: kg ↔ g (1 kg = 1000 g)
Volume: L ↔ ml (1 L = 1000 ml)  // Not currently used
Count: pcs ↔ dozen (1 dozen = 12 pcs)  // Not currently used
```

### Conversion Algorithm
```typescript
function convertQuantity(quantity: number, fromUnit: string, toUnit: string): number {
  // 1. Parse units
  // 2. Check compatibility (same dimension)
  // 3. Convert to base unit (kg for weight)
  // 4. Convert from base unit to target

  const baseFactors = {
    kg: 1,
    g: 0.001,
  };

  const quantityInBase = quantity * baseFactors[fromUnit];
  return quantityInBase / baseFactors[toUnit];
}
```

### Cost Calculation with Conversion
```typescript
function calculateLineCost(
  ingredientQuantity: number,
  ingredientUnit: string,
  materialPrice: number,
  materialUnit: string
): number {
  const convertedQuantity = convertQuantity(
    ingredientQuantity,
    ingredientUnit,
    materialUnit
  );
  return convertedQuantity * materialPrice;
}
```

---

## 11. Key Technical Decisions

1. **Weight-only units** for materials/ingredients (simplifies conversion)
2. **Decimal arithmetic** for all monetary calculations (Rust: rust_decimal)
3. **Soft delete pattern** for data preservation
4. **Case-insensitive uniqueness** for names
5. **Svelte 5 runes** instead of stores (component-level state)
6. **Route-based i18n** loading for performance
7. **WAL mode** SQLite for better concurrency
8. **Atomic transactions** for multi-step operations
9. **UUID primary keys** for all entities
10. **ISO 8601 timestamps** stored as TEXT

---

## 12. Frontend Services

### materialService.ts
```typescript
createMaterial(data: CreateMaterialInput): Promise<SourceMaterial>
getMaterial(id: string): Promise<SourceMaterial>
getAllMaterials(includeArchived: boolean): Promise<SourceMaterial[]>
updateMaterial(id: string, data: UpdateMaterialInput): Promise<SourceMaterial>
deleteMaterial(id: string): Promise<void>
searchMaterials(query: string): Promise<SourceMaterial[]>
archiveMaterial(id: string): Promise<void>
```

### recipeService.ts
```typescript
createRecipe(data: CreateRecipeInput): Promise<Recipe>
getRecipe(id: string): Promise<RecipeWithDetails>
getAllRecipes(includeArchived: boolean): Promise<RecipeWithDetails[]>
updateRecipe(id: string, data: UpdateRecipeInput): Promise<Recipe>
deleteRecipe(id: string): Promise<void>
searchRecipes(query: string): Promise<RecipeWithDetails[]>
archiveRecipe(id: string): Promise<void>
duplicateRecipe(id: string, newName: string): Promise<Recipe>
toggleFavorite(id: string): Promise<Recipe>
addIngredient(recipeId: string, data: AddIngredientInput): Promise<RecipeIngredient>
updateIngredient(id: string, data: UpdateIngredientInput): Promise<RecipeIngredient>
removeIngredient(id: string): Promise<void>
reorderIngredients(recipeId: string, ingredientIds: string[]): Promise<void>
```

### packagingService.ts
```typescript
createPackagingMaterial(data: CreatePackagingMaterialInput): Promise<PackagingMaterial>
getPackagingMaterial(id: string): Promise<PackagingMaterial>
getAllPackagingMaterials(includeArchived: boolean): Promise<PackagingMaterial[]>
updatePackagingMaterial(id: string, data: UpdatePackagingMaterialInput): Promise<PackagingMaterial>
deletePackagingMaterial(id: string): Promise<void>
searchPackagingMaterials(query: string): Promise<PackagingMaterial[]>
archivePackagingMaterial(id: string): Promise<void>
addRecipePackaging(recipeId: string, data: AddRecipePackagingInput): Promise<PackagingWithMaterial>
updateRecipePackaging(id: string, data: UpdateRecipePackagingInput): Promise<PackagingWithMaterial>
removeRecipePackaging(id: string): Promise<void>
getRecipePackaging(recipeId: string): Promise<PackagingWithMaterial[]>
```

### settingsService.ts
```typescript
getSetting(key: string): Promise<Setting | null>
getAllSettings(): Promise<Setting[]>
updateSetting(key: string, data: UpdateSettingInput): Promise<Setting>
getLaborRatePerHour(): Promise<number>
updateLaborRatePerHour(rate: number): Promise<Setting>
getDefaultVatRate(): Promise<number>
updateDefaultVatRate(rate: number): Promise<Setting>
```

---

## 13. Error Handling

### Backend Error Types

#### MaterialError
- `NotFound` - Material with ID not found
- `DuplicateName` - Name already exists
- `InvalidName` - Name too long/short
- `InvalidPrice` - Price < 0
- `InvalidUnitOfMeasure` - Unknown unit
- `UsedInRecipes` - Can't delete, used in recipes
- `Database` - SQLite error
- `Internal` - Unexpected error

#### RecipeError
- `NotFound` - Recipe not found
- `DuplicateName` - Name exists
- `InvalidName` - Name validation failed
- `InvalidYieldQuantity` - <= 0 or non-finite
- `InvalidYieldUnit` - Empty unit
- `InvalidProfitMargin` - Not 0-100
- `InvalidWastePercentage` - Not 0-100
- `InvalidVatPercentage` - Not 0-100
- `InvalidIngredientQuantity` - <= 0
- `InvalidIngredientUnit` - Not kg/g
- `IngredientNotFound` - Ingredient ID not found
- `MaterialNotFound` - Material ID not found
- `DuplicateMaterial` - Material already in recipe
- `UnitConversion` - Conversion failed

#### PackagingError
- `NotFound` - Packaging not found
- `DuplicateName` - Name exists
- `InvalidName` - Validation failed
- `InvalidPrice` - Price < 0
- `InvalidQuantity` - Quantity <= 0
- `UsedInRecipes` - Can't delete
- `RecipePackagingNotFound` - Link not found

---

## 14. Porting Considerations

### Critical Logic to Preserve

1. **Unit Conversion**
   - Only kg ↔ g supported
   - Error handling for incompatible units
   - Conversion applied before cost calculation

2. **Decimal Precision**
   - Use Decimal type (not float) for money
   - Round only at display layer
   - Rust uses `rust_decimal` crate

3. **Cost Formulas**
   ```
   line_cost = convert(quantity, ingredient_unit, material_unit) × material_price
   material_cost = Σ(line_costs)
   labor_cost = (prep_time / 60) × labor_rate
   packaging_cost = Σ(quantity × unit_price)
   total_cost = material + labor + packaging
   cost_per_unit = total / yield
   suggested_price = total × (1 + margin/100)
   vat = suggested_price × (vat_rate/100)
   price_incl_vat = suggested_price + vat
   ```

4. **Validation Rules**
   - Names: 1-200 chars, trimmed, unique (case-insensitive)
   - Prices: >= 0
   - Quantities: > 0
   - Percentages: 0-100
   - Units: Only kg/g for ingredients

5. **Data Integrity**
   - Cascade delete for recipe → ingredients/packaging
   - Restrict delete for materials/packaging in use
   - Soft delete via is_archived flag

### Architecture Patterns

1. **Service Layer**: Abstract data access from UI
2. **Command Pattern**: Tauri commands = API endpoints
3. **DTO Pattern**: Separate input/output types
4. **Repository Pattern**: Database access in commands

### State Management

- Component-level state with Svelte 5 runes
- No global stores
- Derived state for filters/sorts
- Effects for side effects

### i18n Structure

```
src/lib/i18n/
├── index.ts           # Config and exports
├── en/
│   ├── common.json
│   ├── home.json
│   ├── materials.json
│   ├── recipes.json
│   ├── packaging.json
│   └── settings.json
└── nl/
    └── ... (same structure)
```

---

## 15. File Structure Reference

### Frontend
```
src/
├── routes/
│   ├── +layout.svelte
│   ├── +layout.ts
│   ├── +page.svelte
│   ├── materials/
│   │   ├── +page.svelte
│   │   ├── new/+page.svelte
│   │   └── [id]/+page.svelte
│   ├── recipes/
│   │   ├── +page.svelte
│   │   ├── new/+page.svelte
│   │   └── [id]/
│   │       ├── +page.svelte
│   │       └── edit/+page.svelte
│   ├── packaging/
│   │   ├── +page.svelte
│   │   ├── new/+page.svelte
│   │   └── [id]/+page.svelte
│   └── settings/+page.svelte
└── lib/
    ├── components/
    │   ├── Navigation.svelte
    │   ├── MaterialForm.svelte
    │   ├── RecipeForm.svelte
    │   ├── PackagingForm.svelte
    │   ├── RecipeCard.svelte
    │   ├── IngredientList.svelte
    │   ├── CostBreakdown.svelte
    │   ├── DeleteConfirmDialog.svelte
    │   ├── AddIngredientDialog.svelte
    │   ├── AddPackagingDialog.svelte
    │   └── LanguageSelector.svelte
    ├── services/
    │   ├── materialService.ts
    │   ├── recipeService.ts
    │   ├── packagingService.ts
    │   └── settingsService.ts
    ├── types/
    │   ├── material.ts
    │   ├── recipe.ts
    │   └── packaging.ts
    └── i18n/
        ├── index.ts
        ├── en/*.json
        └── nl/*.json
```

### Backend
```
src-tauri/
├── src/
│   ├── lib.rs
│   ├── main.rs
│   ├── constants.rs
│   ├── commands/
│   │   ├── mod.rs
│   │   ├── materials.rs
│   │   ├── recipes.rs
│   │   ├── pricing.rs
│   │   ├── packaging.rs
│   │   └── settings.rs
│   ├── models/
│   │   ├── mod.rs
│   │   ├── material.rs
│   │   ├── recipe.rs
│   │   ├── pricing.rs
│   │   ├── packaging.rs
│   │   └── settings.rs
│   ├── services/
│   │   ├── mod.rs
│   │   ├── pricing_service.rs
│   │   └── settings_service.rs
│   ├── db/
│   │   ├── mod.rs
│   │   ├── connection.rs
│   │   └── migrations.rs
│   └── utils/
│       ├── mod.rs
│       └── unit_conversion.rs
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_add_waste_percentage.sql
    ├── 003_add_settings_table.sql
    ├── 004_add_vat_support.sql
    └── 005_add_packaging_materials.sql
```

---

## 16. Testing Strategy

### Backend Tests (Rust)
- Unit tests for validation logic
- Unit tests for unit conversion
- Unit tests for pricing calculations
- Integration tests for database operations
- Tests for error conditions

### Areas to Test When Porting
1. Unit conversion accuracy
2. Cost calculation precision
3. Validation boundary conditions
4. Cascade/restrict delete behavior
5. Case-insensitive uniqueness
6. Transaction atomicity
