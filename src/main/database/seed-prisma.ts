import { getPrisma } from './prisma'
import { randomUUID } from 'crypto'

/**
 * Seeds the database with default settings if they don't exist.
 * This ensures the application has necessary default values on first run.
 */
export async function seedDefaults(): Promise<void> {
  const prisma = getPrisma()

  // Check if settings already exist
  const existingSettings = await prisma.setting.count()
  if (existingSettings > 0) {
    console.log('Settings already exist, skipping seed')
    return
  }

  // Default labor rate (€25.00 per hour)
  await prisma.setting.create({
    data: {
      id: randomUUID(),
      key: 'labor_rate_per_hour',
      value: '25.00',
      settingType: 'number'
    }
  })

  // Default VAT rate (21%)
  await prisma.setting.create({
    data: {
      id: randomUUID(),
      key: 'default_vat_rate',
      value: '21',
      settingType: 'number'
    }
  })

  console.log('Database seeded with default settings')
}

/**
 * Gets the labor rate per hour from settings.
 * Returns the default value (25.00) if not found.
 */
export async function getLaborRatePerHour(): Promise<number> {
  const prisma = getPrisma()
  const setting = await prisma.setting.findUnique({
    where: { key: 'labor_rate_per_hour' }
  })
  return setting ? parseFloat(setting.value) : 25.0
}

/**
 * Gets the default VAT rate from settings.
 * Returns the default value (21) if not found.
 */
export async function getDefaultVatRate(): Promise<number> {
  const prisma = getPrisma()
  const setting = await prisma.setting.findUnique({
    where: { key: 'default_vat_rate' }
  })
  return setting ? parseFloat(setting.value) : 21
}
