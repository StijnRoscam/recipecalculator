import { getPrisma } from '../database/prisma'
import type { Material, CreateMaterialInput, UpdateMaterialInput } from '../../shared/types'

export type { Material, CreateMaterialInput, UpdateMaterialInput }

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

/**
 * Gets a single material by ID from the database using Prisma.
 *
 * @param id - The material ID to fetch
 * @returns The material or null if not found
 */
export async function getMaterial(id: string): Promise<Material | null> {
  console.log('[getMaterial] Called with id:', id)

  const prisma = getPrisma()

  const material = await prisma.sourceMaterial.findUnique({
    where: { id },
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

  console.log('[getMaterial] Result:', material ? material.id : 'not found')
  return material
}

/**
 * Updates an existing material in the database using Prisma.
 *
 * @param id - The material ID to update
 * @param data - The material data to update
 * @returns The updated material
 * @throws Error if the material is not found
 * @throws Error if a material with the same name already exists (case-insensitive, excluding current material)
 */
export async function updateMaterial(id: string, data: UpdateMaterialInput): Promise<Material> {
  console.log('[updateMaterial] Called with id:', id, 'data:', JSON.stringify(data, null, 2))

  const prisma = getPrisma()

  // Check if material exists
  const existingMaterial = await prisma.sourceMaterial.findUnique({
    where: { id },
    select: { id: true }
  })

  if (!existingMaterial) {
    console.log('[updateMaterial] Material not found:', id)
    throw new Error('NOT_FOUND')
  }

  // Check for duplicate name (case-insensitive), excluding current material
  const trimmedName = data.name.trim()
  console.log('[updateMaterial] Checking for duplicate name:', trimmedName)

  const duplicateMaterials = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM source_materials WHERE LOWER(name) = LOWER(${trimmedName}) AND id != ${id} LIMIT 1
  `
  const duplicateMaterial = duplicateMaterials.length > 0 ? duplicateMaterials[0] : null

  if (duplicateMaterial) {
    console.log('[updateMaterial] Duplicate found, throwing error')
    throw new Error('DUPLICATE_NAME')
  }

  console.log('[updateMaterial] No duplicate found, updating material...')

  const material = await prisma.sourceMaterial.update({
    where: { id },
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

  console.log('[updateMaterial] Material updated successfully:', material.id)
  return material
}

/**
 * Archives a material by setting isArchived to true.
 *
 * @param id - The material ID to archive
 * @returns The archived material
 * @throws Error if the material is not found
 */
export async function archiveMaterial(id: string): Promise<Material> {
  console.log('[archiveMaterial] Called with id:', id)

  const prisma = getPrisma()

  // Check if material exists
  const existingMaterial = await prisma.sourceMaterial.findUnique({
    where: { id },
    select: { id: true }
  })

  if (!existingMaterial) {
    console.log('[archiveMaterial] Material not found:', id)
    throw new Error('NOT_FOUND')
  }

  const material = await prisma.sourceMaterial.update({
    where: { id },
    data: { isArchived: true },
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

  console.log('[archiveMaterial] Material archived successfully:', material.id)
  return material
}

/**
 * Unarchives a material by setting isArchived to false.
 *
 * @param id - The material ID to unarchive
 * @returns The unarchived material
 * @throws Error if the material is not found
 */
export async function unarchiveMaterial(id: string): Promise<Material> {
  console.log('[unarchiveMaterial] Called with id:', id)

  const prisma = getPrisma()

  // Check if material exists
  const existingMaterial = await prisma.sourceMaterial.findUnique({
    where: { id },
    select: { id: true }
  })

  if (!existingMaterial) {
    console.log('[unarchiveMaterial] Material not found:', id)
    throw new Error('NOT_FOUND')
  }

  const material = await prisma.sourceMaterial.update({
    where: { id },
    data: { isArchived: false },
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

  console.log('[unarchiveMaterial] Material unarchived successfully:', material.id)
  return material
}
