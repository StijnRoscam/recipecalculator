import { getPrisma } from '../database/prisma'
import type { PackagingMaterial, CreatePackagingInput, UpdatePackagingInput } from '../../shared/types'

export type { PackagingMaterial, CreatePackagingInput, UpdatePackagingInput }

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

/**
 * Gets a single packaging material by ID from the database using Prisma.
 *
 * @param id - The packaging material ID to fetch
 * @returns The packaging material or null if not found
 */
export async function getPackaging(id: string): Promise<PackagingMaterial | null> {
  console.log('[getPackaging] Called with id:', id)

  const prisma = getPrisma()

  const packaging = await prisma.packagingMaterial.findUnique({
    where: { id },
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

  console.log('[getPackaging] Result:', packaging ? packaging.id : 'not found')
  return packaging
}

/**
 * Updates an existing packaging material in the database using Prisma.
 *
 * @param id - The packaging material ID to update
 * @param data - The packaging material data to update
 * @returns The updated packaging material
 * @throws Error if the packaging material is not found
 * @throws Error if a packaging material with the same name already exists (case-insensitive, excluding current item)
 */
export async function updatePackaging(id: string, data: UpdatePackagingInput): Promise<PackagingMaterial> {
  console.log('[updatePackaging] Called with id:', id, 'data:', JSON.stringify(data, null, 2))

  const prisma = getPrisma()

  // Check if packaging material exists
  const existingPackaging = await prisma.packagingMaterial.findUnique({
    where: { id },
    select: { id: true }
  })

  if (!existingPackaging) {
    console.log('[updatePackaging] Packaging not found:', id)
    throw new Error('NOT_FOUND')
  }

  // Check for duplicate name (case-insensitive), excluding current packaging
  const trimmedName = data.name.trim()
  console.log('[updatePackaging] Checking for duplicate name:', trimmedName)

  const duplicatePackaging = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM packaging_materials WHERE name = ${trimmedName} COLLATE NOCASE AND id != ${id} LIMIT 1
  `

  if (duplicatePackaging.length > 0) {
    console.log('[updatePackaging] Duplicate found, throwing error')
    throw new Error('DUPLICATE_NAME')
  }

  console.log('[updatePackaging] No duplicate found, updating packaging...')

  const packaging = await prisma.packagingMaterial.update({
    where: { id },
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

  console.log('[updatePackaging] Packaging updated successfully:', packaging.id)
  return packaging
}

/**
 * Deletes a packaging material from the database.
 *
 * @param id - The packaging material ID to delete
 * @throws Error if the packaging material is not found
 * @throws Error if the packaging material is used in any recipes (PACKAGING_IN_USE)
 */
export async function deletePackaging(id: string): Promise<void> {
  console.log('[deletePackaging] Called with id:', id)

  const prisma = getPrisma()

  // Check if packaging material exists
  const existingPackaging = await prisma.packagingMaterial.findUnique({
    where: { id },
    select: { id: true, name: true }
  })

  if (!existingPackaging) {
    console.log('[deletePackaging] Packaging not found:', id)
    throw new Error('NOT_FOUND')
  }

  // Check if packaging is used in any recipes
  const recipesUsingPackaging = await prisma.recipePackaging.findMany({
    where: { packagingMaterialId: id },
    select: {
      recipe: {
        select: { name: true }
      }
    }
  })

  if (recipesUsingPackaging.length > 0) {
    const recipeNames = recipesUsingPackaging.map((rp) => rp.recipe.name)
    console.log('[deletePackaging] Packaging in use by recipes:', recipeNames)
    throw new Error(`PACKAGING_IN_USE:${recipeNames.join(',')}`)
  }

  // Delete the packaging material
  await prisma.packagingMaterial.delete({
    where: { id }
  })

  console.log('[deletePackaging] Packaging deleted successfully:', existingPackaging.name)
}
