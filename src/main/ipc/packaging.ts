import { getPrisma } from '../database/prisma'
import type { PackagingMaterial, CreatePackagingInput } from '../../shared/types'

export type { PackagingMaterial, CreatePackagingInput }

/**
 * Gets all packaging materials from the database using Prisma.
 * Results are ordered by name alphabetically (case-insensitive).
 *
 * @param includeArchived - Whether to include archived packaging materials in the results
 * @returns Array of packaging materials
 */
export async function getAllPackaging(includeArchived: boolean): Promise<PackagingMaterial[]> {
  const prisma = getPrisma()

  const packagingMaterials = await prisma.packagingMaterial.findMany({
    where: includeArchived ? {} : { isArchived: false },
    orderBy: {
      name: 'asc'
    },
    select: {
      id: true,
      name: true,
      unitPrice: true,
      unitType: true,
      supplier: true,
      sku: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      isArchived: true
    }
  })

  return packagingMaterials
}

/**
 * Creates a new packaging material in the database using Prisma.
 *
 * @param data - The packaging material data to create
 * @returns The created packaging material
 * @throws Error if a packaging material with the same name already exists (case-insensitive)
 */
export async function createPackaging(data: CreatePackagingInput): Promise<PackagingMaterial> {
  const prisma = getPrisma()
  const trimmedName = data.name.trim()

  // Check for duplicate name (case-insensitive)
  // SQLite doesn't support Prisma's mode: 'insensitive', so we use COLLATE NOCASE
  // which is more index-friendly than LOWER() function calls
  const existingPackaging = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM packaging_materials WHERE name = ${trimmedName} COLLATE NOCASE LIMIT 1
  `

  if (existingPackaging.length > 0) {
    throw new Error('DUPLICATE_NAME')
  }

  // Create the packaging material
  const packaging = await prisma.packagingMaterial.create({
    data: {
      name: trimmedName,
      unitPrice: data.unitPrice,
      unitType: data.unitType,
      supplier: data.supplier?.trim() || null,
      sku: data.sku?.trim() || null,
      notes: data.notes?.trim() || null
    },
    select: {
      id: true,
      name: true,
      unitPrice: true,
      unitType: true,
      supplier: true,
      sku: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      isArchived: true
    }
  })

  return packaging
}
