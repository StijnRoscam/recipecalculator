import Database from 'better-sqlite3'
import { randomUUID } from 'crypto'

/**
 * Default settings for the application.
 */
const DEFAULT_SETTINGS = [
  {
    key: 'labor_rate_per_hour',
    value: '25.00',
    settingType: 'number'
  },
  {
    key: 'default_vat_rate',
    value: '21',
    settingType: 'number'
  }
] as const

/**
 * Seeds default values into the database if they don't exist.
 * This includes default labor rate and VAT rate settings.
 *
 * @param db - The database instance
 */
export function seedDefaults(db: Database.Database): void {
  const now = new Date().toISOString()

  // Prepare the insert statement with conflict handling
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (id, key, value, setting_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  // Insert each default setting if it doesn't exist
  for (const setting of DEFAULT_SETTINGS) {
    const id = randomUUID()
    insertSetting.run(id, setting.key, setting.value, setting.settingType, now, now)
  }

  // Log what was seeded
  const settingsCount = db
    .prepare('SELECT COUNT(*) as count FROM settings')
    .get() as { count: number }

  console.log(`Database seeded with ${settingsCount.count} settings`)
}

/**
 * Gets the current labor rate per hour from settings.
 * Returns the default value if not found.
 *
 * @param db - The database instance
 * @returns The labor rate per hour as a number
 */
export function getLaborRatePerHour(db: Database.Database): number {
  const result = db
    .prepare("SELECT value FROM settings WHERE key = 'labor_rate_per_hour'")
    .get() as { value: string } | undefined

  return result ? parseFloat(result.value) : 25.0
}

/**
 * Gets the default VAT rate from settings.
 * Returns the default value if not found.
 *
 * @param db - The database instance
 * @returns The VAT rate as a number (percentage)
 */
export function getDefaultVatRate(db: Database.Database): number {
  const result = db
    .prepare("SELECT value FROM settings WHERE key = 'default_vat_rate'")
    .get() as { value: string } | undefined

  return result ? parseFloat(result.value) : 21.0
}
