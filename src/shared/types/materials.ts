/**
 * Material interface matching the source_materials database schema.
 * Shared between main and renderer processes.
 * Uses camelCase to match Prisma client output.
 */
export interface Material {
  id: string
  name: string
  categoryId: string | null
  currentPrice: number
  unitOfMeasure: string
  supplier: string | null
  sku: string | null
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string
  isArchived: boolean
}

/**
 * Materials API interface exposed to the renderer process.
 */
export interface MaterialsApi {
  getAll: (includeArchived: boolean) => Promise<Material[]>
}
