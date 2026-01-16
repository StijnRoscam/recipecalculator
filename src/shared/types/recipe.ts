/**
 * Recipe interface matching the recipes database schema.
 * Shared between main and renderer processes.
 * Uses camelCase to match Prisma client output.
 */
export interface Recipe {
  id: string
  name: string
  description: string | null
  categoryId: string | null
  yieldQuantity: number
  yieldUnit: string
  prepTimeMinutes: number | null
  instructions: string | null
  profitMargin: number | null
  wastePercentage: number | null
  vatPercentage: number | null
  createdAt: Date | string
  updatedAt: Date | string
  isArchived: boolean
  isFavorite: boolean
}

/**
 * Recipe ingredient with material details for display.
 */
export interface RecipeIngredientWithMaterial {
  id: string
  recipeId: string
  materialId: string
  quantity: number
  unit: string
  sortOrder: number
  notes: string | null
  material: {
    id: string
    name: string
    currentPrice: number
    unitOfMeasure: string
  }
}

/**
 * Recipe packaging with packaging material details for display.
 */
export interface RecipePackagingWithMaterial {
  id: string
  recipeId: string
  packagingMaterialId: string
  quantity: number
  sortOrder: number
  notes: string | null
  packagingMaterial: {
    id: string
    name: string
    unitPrice: number
    unitType: string
  }
}

/**
 * Recipe with calculated cost details for display.
 * Used in the recipes list view.
 */
export interface RecipeWithDetails extends Recipe {
  ingredientsCost: number
  packagingCost: number
  totalCost: number
  ingredientCount: number
  packagingCount: number
}

/**
 * Full recipe with all related data.
 * Used in recipe detail view.
 */
export interface RecipeWithFullDetails extends Recipe {
  ingredients: RecipeIngredientWithMaterial[]
  packaging: RecipePackagingWithMaterial[]
  ingredientsCost: number
  packagingCost: number
  totalCost: number
}

/**
 * Input for creating a new recipe.
 */
export interface CreateRecipeInput {
  name: string
  description?: string | null
  categoryId?: string | null
  yieldQuantity: number
  yieldUnit: string
  prepTimeMinutes?: number | null
  instructions?: string | null
  profitMargin?: number | null
  wastePercentage?: number | null
  vatPercentage?: number | null
}

/**
 * Input for updating an existing recipe.
 */
export interface UpdateRecipeInput {
  name: string
  description?: string | null
  categoryId?: string | null
  yieldQuantity: number
  yieldUnit: string
  prepTimeMinutes?: number | null
  instructions?: string | null
  profitMargin?: number | null
  wastePercentage?: number | null
  vatPercentage?: number | null
}

/**
 * Recipes API interface exposed to the renderer process.
 */
export interface RecipesApi {
  getAll: (includeArchived: boolean) => Promise<RecipeWithDetails[]>
  get: (id: string) => Promise<RecipeWithFullDetails | null>
  create: (data: CreateRecipeInput) => Promise<Recipe>
  update: (id: string, data: UpdateRecipeInput) => Promise<Recipe>
  archive: (id: string) => Promise<Recipe>
  unarchive: (id: string) => Promise<Recipe>
  toggleFavorite: (id: string) => Promise<Recipe>
  getSuggestedDuplicateName: (id: string) => Promise<string>
  checkNameAvailable: (name: string) => Promise<boolean>
  duplicate: (id: string, newName: string) => Promise<Recipe>
  delete: (id: string) => Promise<void>
}

/**
 * Recipe ingredient returned from API operations.
 */
export interface RecipeIngredient {
  id: string
  recipeId: string
  materialId: string
  quantity: number
  unit: string
  sortOrder: number
  notes: string | null
}

/**
 * Input for adding an ingredient to a recipe.
 */
export interface AddIngredientInput {
  recipeId: string
  materialId: string
  quantity: number
  unit: 'kg' | 'g'
  notes?: string | null
}

/**
 * Input for updating an ingredient.
 */
export interface UpdateIngredientInput {
  quantity?: number
  unit?: 'kg' | 'g'
  notes?: string | null
}

/**
 * Ingredients API interface exposed to the renderer process.
 */
export interface IngredientsApi {
  add: (data: AddIngredientInput) => Promise<RecipeIngredient>
  update: (id: string, data: UpdateIngredientInput) => Promise<RecipeIngredient>
  remove: (id: string) => Promise<void>
  reorder: (recipeId: string, ingredientIds: string[]) => Promise<void>
}

/**
 * Recipe packaging returned from API operations.
 */
export interface RecipePackagingItem {
  id: string
  recipeId: string
  packagingMaterialId: string
  quantity: number
  sortOrder: number
  notes: string | null
}

/**
 * Input for adding packaging to a recipe.
 */
export interface AddRecipePackagingInput {
  recipeId: string
  packagingMaterialId: string
  quantity: number
  notes?: string | null
}

/**
 * Input for updating recipe packaging.
 */
export interface UpdateRecipePackagingInput {
  quantity?: number
  notes?: string | null
}

/**
 * Recipe Packaging API interface exposed to the renderer process.
 */
export interface RecipePackagingApi {
  add: (data: AddRecipePackagingInput) => Promise<RecipePackagingItem>
  update: (id: string, data: UpdateRecipePackagingInput) => Promise<RecipePackagingItem>
  remove: (id: string) => Promise<void>
}
