import { getPrisma } from '../database/prisma'
import type { PackagingMaterial } from '../../shared/types'

export type { PackagingMaterial }

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
