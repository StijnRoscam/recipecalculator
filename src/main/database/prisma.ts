import { PrismaClient } from '@prisma/client'
import { app } from 'electron'
import { join } from 'path'

let prisma: PrismaClient | null = null

/**
 * Gets the database file path.
 * Uses the user data directory for persistent storage.
 */
export function getDatabasePath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'butchercalculator.db')
}

/**
 * Gets the database URL for Prisma.
 */
export function getDatabaseUrl(): string {
  return `file:${getDatabasePath()}`
}

/**
 * Initializes the Prisma client with the correct database path.
 * Creates the database file if it doesn't exist.
 *
 * @throws Error if database initialization fails
 */
export async function initializePrisma(): Promise<void> {
  if (prisma) {
    return // Already initialized
  }

  const databaseUrl = getDatabaseUrl()

  try {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    })

    // Test the connection
    await prisma.$connect()

    console.log(`Prisma initialized with database at: ${getDatabasePath()}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error'
    console.error(`Failed to initialize Prisma: ${errorMessage}`)
    throw new Error(`Database initialization failed: ${errorMessage}`)
  }
}

/**
 * Gets the Prisma client instance.
 * Must call initializePrisma first.
 *
 * @throws Error if Prisma is not initialized
 */
export function getPrisma(): PrismaClient {
  if (!prisma) {
    throw new Error('Prisma not initialized. Call initializePrisma first.')
  }
  return prisma
}

/**
 * Closes the Prisma connection.
 * Should be called when the app is quitting.
 */
export async function closePrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
    console.log('Prisma connection closed')
  }
}
