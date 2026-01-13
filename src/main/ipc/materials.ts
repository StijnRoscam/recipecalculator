import { getPrisma } from '../database/prisma'
import type { Material, CreateMaterialInput } from '../../shared/types'

export type { Material, CreateMaterialInput }

/**
 * Gets all materials from the database using Prisma.
 * Results are ordered by name alphabetically (case-insensitive).
 *
 * @param includeArchived - Whether to include archived materials in the results
 * @returns Array of materials
 */
export async function getAllMaterials(includeArchived: boolean): Promise<Material[]> {
  const prisma = getPrisma()

  const materials = await prisma.sourceMaterial.findMany({
    where: includeArchived ? {} : { isArchived: false },
    orderBy: {
      name: 'asc'
    },
    select: {
      id: true,
      name: true,
      categoryId: true,
      currentPrice: true,
      unitOfMeasure: true,
      supplier: true,
      sku: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      isArchived: true
    }
  })

  return materials
}

/**
 * Creates a new material in the database using Prisma.
 *
 * @param data - The material data to create
 * @returns The created material
 * @throws Error if a material with the same name already exists (case-insensitive)
 */
export async function createMaterial(data: CreateMaterialInput): Promise<Material> {
  console.log('[createMaterial] Called with data:', JSON.stringify(data, null, 2))

  const prisma = getPrisma()
  console.log('[createMaterial] Got prisma instance')

  // Check for duplicate name (case-insensitive)
  // SQLite doesn't support mode: 'insensitive', so we use raw SQL with LOWER()
  const trimmedName = data.name.trim()
  console.log('[createMaterial] Checking for duplicate name:', trimmedName)

  try {
    const existingMaterials = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM source_materials WHERE LOWER(name) = LOWER(${trimmedName}) LIMIT 1
    `
    console.log('[createMaterial] Duplicate check result:', existingMaterials)
    const existingMaterial = existingMaterials.length > 0 ? existingMaterials[0] : null

    if (existingMaterial) {
      console.log('[createMaterial] Duplicate found, throwing error')
      throw new Error('DUPLICATE_NAME')
    }
  } catch (duplicateCheckError) {
    console.error('[createMaterial] Error during duplicate check:', duplicateCheckError)
    throw duplicateCheckError
  }

  console.log('[createMaterial] No duplicate found, creating material...')

  try {
    const material = await prisma.sourceMaterial.create({
      data: {
        name: data.name.trim(),
        currentPrice: data.currentPrice,
        unitOfMeasure: data.unitOfMeasure,
        supplier: data.supplier?.trim() || null,
        sku: data.sku?.trim() || null,
        notes: data.notes?.trim() || null
      },
      select: {
        id: true,
        name: true,
        categoryId: true,
        currentPrice: true,
        unitOfMeasure: true,
        supplier: true,
        sku: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        isArchived: true
      }
    })

    console.log('[createMaterial] Material created successfully:', material.id)
    return material
  } catch (createError) {
    console.error('[createMaterial] Error creating material:', createError)
    throw createError
  }
}
