import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { runMigrations } from './migrations'
import { seedDefaults } from './seed'

let db: Database.Database | null = null

/**
 * Gets the database file path.
 * Uses the user data directory for persistent storage.
 */
export function getDatabasePath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'butchercalculator.db')
}

/**
 * Initializes the database connection.
 * Creates the database file if it doesn't exist.
 * Runs migrations and seeds default data.
 * Configures WAL mode for performance.
 *
 * @throws Error if database initialization fails
 */
export function initializeDatabase(): void {
  if (db) {
    return // Already initialized
  }

  const dbPath = getDatabasePath()

  try {
    // Create database connection
    db = new Database(dbPath)

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL')

    // Enable foreign keys
    db.pragma('foreign_keys = ON')

    // Run migrations to create/update schema
    runMigrations(db)

    // Seed default values if not present
    seedDefaults(db)

    console.log(`Database initialized at: ${dbPath}`)
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown database error'
    console.error(`Failed to initialize database: ${errorMessage}`)
    throw new Error(`Database initialization failed: ${errorMessage}`)
  }
}

/**
 * Gets the database instance.
 * Must call initializeDatabase first.
 *
 * @throws Error if database is not initialized
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.')
  }
  return db
}

/**
 * Closes the database connection.
 * Should be called when the app is quitting.
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    console.log('Database connection closed')
  }
}
