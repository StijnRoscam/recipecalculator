import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync } from 'fs'
import { getDatabasePath, getDatabaseUrl } from './prisma'
import { join } from 'path'
import { app } from 'electron'

const execAsync = promisify(exec)

/**
 * Gets the path to the Prisma CLI.
 * In development, uses the local node_modules.
 * In production, uses the bundled prisma binary.
 */
function getPrismaPath(): string {
  if (app.isPackaged) {
    // In production, prisma should be in resources
    return join(process.resourcesPath, 'node_modules', '.bin', 'prisma')
  }
  // In development, use local node_modules
  return join(process.cwd(), 'node_modules', '.bin', 'prisma')
}

/**
 * Gets the path to the prisma schema file.
 */
function getSchemaPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'prisma', 'schema.prisma')
  }
  return join(process.cwd(), 'prisma', 'schema.prisma')
}

/**
 * Checks if the database file exists.
 */
export function databaseExists(): boolean {
  const dbPath = getDatabasePath()
  return existsSync(dbPath)
}

/**
 * Runs Prisma migrations to create or update the database schema.
 * Uses `prisma migrate deploy` which is safe for production.
 *
 * @throws Error if migrations fail
 */
export async function runMigrations(): Promise<void> {
  const databaseUrl = getDatabaseUrl()
  const schemaPath = getSchemaPath()

  console.log(`Running database migrations...`)
  console.log(`Database URL: ${databaseUrl}`)
  console.log(`Schema path: ${schemaPath}`)

  try {
    // Use prisma migrate deploy for production-safe migrations
    const { stdout, stderr } = await execAsync(
      `npx prisma migrate deploy --schema="${schemaPath}"`,
      {
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl
        },
        cwd: app.isPackaged ? process.resourcesPath : process.cwd()
      }
    )

    if (stdout) {
      console.log('Migration output:', stdout)
    }
    if (stderr && !stderr.includes('warn')) {
      console.warn('Migration warnings:', stderr)
    }

    console.log('Database migrations completed successfully')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Migration failed:', errorMessage)
    throw new Error(`Database migration failed: ${errorMessage}`)
  }
}

/**
 * Ensures the database exists and is up to date.
 * Creates the database and runs migrations if needed.
 */
export async function ensureDatabaseReady(): Promise<void> {
  const dbExists = databaseExists()

  if (!dbExists) {
    console.log('Database does not exist, will be created during migration...')
  } else {
    console.log('Database exists, checking for pending migrations...')
  }

  await runMigrations()
}
