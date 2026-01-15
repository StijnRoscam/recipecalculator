/**
 * PackagingMaterial interface matching the packaging_materials database schema.
 * Shared between main and renderer processes.
 * Uses camelCase to match Prisma client output.
 */
export interface PackagingMaterial {
  id: string
  name: string
  unitPrice: number
  unitType: string // 'piece', 'meter', 'roll', 'sheet', 'box', 'bag'
  supplier: string | null
  sku: string | null
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string
  isArchived: boolean
}

/**
 * Input for creating a new packaging material.
 */
export interface CreatePackagingInput {
  name: string
  unitPrice: number
  unitType: string
  supplier?: string | null
  sku?: string | null
  notes?: string | null
}

/**
 * Input for updating an existing packaging material.
 */
export interface UpdatePackagingInput {
  name: string
  unitPrice: number
  unitType: string
  supplier?: string | null
  sku?: string | null
  notes?: string | null
}

/**
 * Packaging API interface exposed to the renderer process.
 */
export interface PackagingApi {
  getAll: (includeArchived: boolean) => Promise<PackagingMaterial[]>
  get: (id: string) => Promise<PackagingMaterial | null>
  create: (data: CreatePackagingInput) => Promise<PackagingMaterial>
  update: (id: string, data: UpdatePackagingInput) => Promise<PackagingMaterial>
  delete: (id: string) => Promise<void>
}
