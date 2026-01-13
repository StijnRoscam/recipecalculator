import { getPrisma } from '../database/prisma'
import type { Material } from '../../shared/types'

export type { Material }

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
