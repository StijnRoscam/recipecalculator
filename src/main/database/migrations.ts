import Database from 'better-sqlite3'

/**
 * Migration definition structure
 */
interface Migration {
  id: number
  name: string
  up: (db: Database.Database) => void
}

/**
 * All database migrations in chronological order.
 * Each migration runs in a transaction for safety.
 */
const migrations: Migration[] = [
  {
    id: 1,
    name: 'initial_schema',
    up: (db: Database.Database) => {
      // Create categories table
      db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('material', 'recipe')),
          color TEXT
        );
      `)

      // Create index on category type for filtering
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_categories_type
        ON categories(type);
      `)

      // Create source_materials table
      db.exec(`
        CREATE TABLE IF NOT EXISTS source_materials (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE COLLATE NOCASE,
          category_id TEXT REFERENCES categories(id),
          current_price REAL NOT NULL CHECK(current_price >= 0),
          unit_of_measure TEXT NOT NULL CHECK(unit_of_measure IN ('kg', 'g')),
          supplier TEXT,
          sku TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_archived INTEGER DEFAULT 0 CHECK(is_archived IN (0, 1))
        );
      `)

      // Create indexes for source_materials
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_source_materials_name
        ON source_materials(name COLLATE NOCASE);

        CREATE INDEX IF NOT EXISTS idx_source_materials_category
        ON source_materials(category_id);

        CREATE INDEX IF NOT EXISTS idx_source_materials_archived
        ON source_materials(is_archived);
      `)

      // Create recipes table
      db.exec(`
        CREATE TABLE IF NOT EXISTS recipes (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE COLLATE NOCASE,
          description TEXT,
          category_id TEXT REFERENCES categories(id),
          yield_quantity REAL NOT NULL CHECK(yield_quantity > 0),
          yield_unit TEXT NOT NULL,
          prep_time_minutes INTEGER CHECK(prep_time_minutes IS NULL OR prep_time_minutes >= 0),
          instructions TEXT,
          profit_margin REAL CHECK(profit_margin IS NULL OR (profit_margin >= 0 AND profit_margin <= 100)),
          waste_percentage REAL CHECK(waste_percentage IS NULL OR (waste_percentage >= 0 AND waste_percentage <= 100)),
          vat_percentage REAL CHECK(vat_percentage IS NULL OR (vat_percentage >= 0 AND vat_percentage <= 100)),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_archived INTEGER DEFAULT 0 CHECK(is_archived IN (0, 1)),
          is_favorite INTEGER DEFAULT 0 CHECK(is_favorite IN (0, 1))
        );
      `)

      // Create indexes for recipes
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_recipes_name
        ON recipes(name COLLATE NOCASE);

        CREATE INDEX IF NOT EXISTS idx_recipes_category
        ON recipes(category_id);

        CREATE INDEX IF NOT EXISTS idx_recipes_archived
        ON recipes(is_archived);

        CREATE INDEX IF NOT EXISTS idx_recipes_favorite
        ON recipes(is_favorite);
      `)

      // Create recipe_ingredients table
      db.exec(`
        CREATE TABLE IF NOT EXISTS recipe_ingredients (
          id TEXT PRIMARY KEY,
          recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
          material_id TEXT NOT NULL REFERENCES source_materials(id) ON DELETE RESTRICT,
          quantity REAL NOT NULL CHECK(quantity > 0),
          unit TEXT NOT NULL CHECK(unit IN ('kg', 'g')),
          sort_order INTEGER NOT NULL,
          notes TEXT,
          UNIQUE(recipe_id, material_id)
        );
      `)

      // Create indexes for recipe_ingredients
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe
        ON recipe_ingredients(recipe_id);

        CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_material
        ON recipe_ingredients(material_id);

        CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_sort
        ON recipe_ingredients(recipe_id, sort_order);
      `)

      // Create packaging_materials table
      db.exec(`
        CREATE TABLE IF NOT EXISTS packaging_materials (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE COLLATE NOCASE,
          unit_price REAL NOT NULL CHECK(unit_price >= 0),
          unit_type TEXT NOT NULL CHECK(unit_type IN ('piece', 'meter', 'roll', 'sheet', 'box', 'bag')),
          supplier TEXT,
          sku TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_archived INTEGER DEFAULT 0 CHECK(is_archived IN (0, 1))
        );
      `)

      // Create indexes for packaging_materials
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_packaging_materials_name
        ON packaging_materials(name COLLATE NOCASE);

        CREATE INDEX IF NOT EXISTS idx_packaging_materials_archived
        ON packaging_materials(is_archived);
      `)

      // Create recipe_packaging table
      db.exec(`
        CREATE TABLE IF NOT EXISTS recipe_packaging (
          id TEXT PRIMARY KEY,
          recipe_id TEXT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
          packaging_material_id TEXT NOT NULL REFERENCES packaging_materials(id) ON DELETE RESTRICT,
          quantity REAL NOT NULL CHECK(quantity > 0),
          sort_order INTEGER NOT NULL,
          notes TEXT,
          UNIQUE(recipe_id, packaging_material_id)
        );
      `)

      // Create indexes for recipe_packaging
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_recipe_packaging_recipe
        ON recipe_packaging(recipe_id);

        CREATE INDEX IF NOT EXISTS idx_recipe_packaging_material
        ON recipe_packaging(packaging_material_id);

        CREATE INDEX IF NOT EXISTS idx_recipe_packaging_sort
        ON recipe_packaging(recipe_id, sort_order);
      `)

      // Create settings table
      db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          id TEXT PRIMARY KEY,
          key TEXT NOT NULL UNIQUE,
          value TEXT NOT NULL,
          setting_type TEXT NOT NULL CHECK(setting_type IN ('string', 'number', 'boolean')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `)

      // Create index on settings key for fast lookups
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_settings_key
        ON settings(key);
      `)

      // Create price_history table
      db.exec(`
        CREATE TABLE IF NOT EXISTS price_history (
          id TEXT PRIMARY KEY,
          material_id TEXT NOT NULL REFERENCES source_materials(id),
          price REAL NOT NULL CHECK(price >= 0),
          effective_date TEXT NOT NULL,
          notes TEXT
        );
      `)

      // Create indexes for price_history
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_price_history_material
        ON price_history(material_id);

        CREATE INDEX IF NOT EXISTS idx_price_history_date
        ON price_history(effective_date);

        CREATE INDEX IF NOT EXISTS idx_price_history_material_date
        ON price_history(material_id, effective_date DESC);
      `)
    }
  }
]

/**
 * Creates the migrations tracking table if it doesn't exist.
 * This table tracks which migrations have been applied.
 */
function createMigrationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  // Create index on migration id for fast lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_schema_migrations_id
    ON schema_migrations(id);
  `)
}

/**
 * Gets the list of migration IDs that have already been applied.
 */
function getAppliedMigrations(db: Database.Database): number[] {
  const stmt = db.prepare('SELECT id FROM schema_migrations ORDER BY id')
  const rows = stmt.all() as { id: number }[]
  return rows.map((row) => row.id)
}

/**
 * Records a migration as applied in the tracking table.
 */
function recordMigration(db: Database.Database, migration: Migration): void {
  const stmt = db.prepare(`
    INSERT INTO schema_migrations (id, name, applied_at)
    VALUES (?, ?, datetime('now'))
  `)
  stmt.run(migration.id, migration.name)
}

/**
 * Runs all pending database migrations.
 * Each migration runs in its own transaction for safety.
 * If a migration fails, it will be rolled back and an error will be thrown.
 *
 * @param db - The better-sqlite3 database instance
 * @throws Error if any migration fails
 */
export function runMigrations(db: Database.Database): void {
  try {
    // Ensure the migrations tracking table exists
    createMigrationsTable(db)

    // Get list of already applied migrations
    const appliedMigrations = getAppliedMigrations(db)
    console.log(`Applied migrations: ${appliedMigrations.join(', ') || 'none'}`)

    // Find pending migrations
    const pendingMigrations = migrations.filter(
      (migration) => !appliedMigrations.includes(migration.id)
    )

    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to run')
      return
    }

    console.log(
      `Running ${pendingMigrations.length} pending migration(s): ${pendingMigrations.map((m) => m.name).join(', ')}`
    )

    // Run each pending migration in a transaction
    for (const migration of pendingMigrations) {
      console.log(`Applying migration ${migration.id}: ${migration.name}`)

      // Use a transaction to ensure atomicity
      const runMigration = db.transaction(() => {
        try {
          migration.up(db)
          recordMigration(db, migration)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown migration error'
          throw new Error(
            `Migration ${migration.id} (${migration.name}) failed: ${errorMessage}`
          )
        }
      })

      // Execute the transaction
      runMigration()

      console.log(`Migration ${migration.id}: ${migration.name} completed`)
    }

    console.log('All migrations completed successfully')
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error(`Migration failed: ${errorMessage}`)
    throw new Error(`Migration process failed: ${errorMessage}`)
  }
}

/**
 * Gets the current schema version (highest applied migration ID).
 * Returns 0 if no migrations have been applied.
 */
export function getCurrentSchemaVersion(db: Database.Database): number {
  try {
    createMigrationsTable(db)
    const stmt = db.prepare('SELECT MAX(id) as version FROM schema_migrations')
    const result = stmt.get() as { version: number | null }
    return result.version ?? 0
  } catch (error) {
    console.error('Failed to get schema version:', error)
    return 0
  }
}

/**
 * Gets the total number of available migrations.
 */
export function getTotalMigrations(): number {
  return migrations.length
}
