import { getPrisma } from '../database/prisma'
import type {
  RecipeWithDetails,
  RecipeWithFullDetails,
  CreateRecipeInput,
  UpdateRecipeInput,
  Recipe
} from '../../shared/types'

export type { CreateRecipeInput, UpdateRecipeInput }

/**
 * Calculate the cost of ingredients for a recipe in the base unit (per kg/g).
 */
function calculateIngredientCost(
  quantity: number,
  unit: string,
  materialPrice: number,
  materialUnit: string
): number {
  // Normalize quantities to grams for calculation
  const quantityInGrams = unit === 'kg' ? quantity * 1000 : quantity
  const pricePerGram = materialUnit === 'kg' ? materialPrice / 1000 : materialPrice

  return quantityInGrams * pricePerGram
}

/**
 * Get all recipes with calculated costs.
 */
export async function getAllRecipes(includeArchived: boolean): Promise<RecipeWithDetails[]> {
  const prisma = getPrisma()

  const recipes = await prisma.recipe.findMany({
    where: includeArchived ? {} : { isArchived: false },
    include: {
      ingredients: {
        include: {
          material: true
        }
      },
      recipePackaging: {
        include: {
          packagingMaterial: true
        }
      }
    },
    orderBy: [{ isFavorite: 'desc' }, { name: 'asc' }]
  })

  return recipes.map((recipe) => {
    // Calculate ingredients cost
    const ingredientsCost = recipe.ingredients.reduce((total, ingredient) => {
      return (
        total +
        calculateIngredientCost(
          ingredient.quantity,
          ingredient.unit,
          ingredient.material.currentPrice,
          ingredient.material.unitOfMeasure
        )
      )
    }, 0)

    // Calculate packaging cost
    const packagingCost = recipe.recipePackaging.reduce((total, pkg) => {
      return total + pkg.quantity * pkg.packagingMaterial.unitPrice
    }, 0)

    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      categoryId: recipe.categoryId,
      yieldQuantity: recipe.yieldQuantity,
      yieldUnit: recipe.yieldUnit,
      prepTimeMinutes: recipe.prepTimeMinutes,
      instructions: recipe.instructions,
      profitMargin: recipe.profitMargin,
      wastePercentage: recipe.wastePercentage,
      vatPercentage: recipe.vatPercentage,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      isArchived: recipe.isArchived,
      isFavorite: recipe.isFavorite,
      ingredientsCost,
      packagingCost,
      totalCost: ingredientsCost + packagingCost,
      ingredientCount: recipe.ingredients.length,
      packagingCount: recipe.recipePackaging.length
    }
  })
}

/**
 * Get a single recipe with full details.
 */
export async function getRecipe(id: string): Promise<RecipeWithFullDetails | null> {
  const prisma = getPrisma()

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: {
          material: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      recipePackaging: {
        include: {
          packagingMaterial: true
        },
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  if (!recipe) {
    return null
  }

  // Calculate ingredients cost
  const ingredientsCost = recipe.ingredients.reduce((total, ingredient) => {
    return (
      total +
      calculateIngredientCost(
        ingredient.quantity,
        ingredient.unit,
        ingredient.material.currentPrice,
        ingredient.material.unitOfMeasure
      )
    )
  }, 0)

  // Calculate packaging cost
  const packagingCost = recipe.recipePackaging.reduce((total, pkg) => {
    return total + pkg.quantity * pkg.packagingMaterial.unitPrice
  }, 0)

  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    categoryId: recipe.categoryId,
    yieldQuantity: recipe.yieldQuantity,
    yieldUnit: recipe.yieldUnit,
    prepTimeMinutes: recipe.prepTimeMinutes,
    instructions: recipe.instructions,
    profitMargin: recipe.profitMargin,
    wastePercentage: recipe.wastePercentage,
    vatPercentage: recipe.vatPercentage,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    isArchived: recipe.isArchived,
    isFavorite: recipe.isFavorite,
    ingredients: recipe.ingredients.map((ingredient) => ({
      id: ingredient.id,
      recipeId: ingredient.recipeId,
      materialId: ingredient.materialId,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      sortOrder: ingredient.sortOrder,
      notes: ingredient.notes,
      material: {
        id: ingredient.material.id,
        name: ingredient.material.name,
        currentPrice: ingredient.material.currentPrice,
        unitOfMeasure: ingredient.material.unitOfMeasure
      }
    })),
    packaging: recipe.recipePackaging.map((pkg) => ({
      id: pkg.id,
      recipeId: pkg.recipeId,
      packagingMaterialId: pkg.packagingMaterialId,
      quantity: pkg.quantity,
      sortOrder: pkg.sortOrder,
      notes: pkg.notes,
      packagingMaterial: {
        id: pkg.packagingMaterial.id,
        name: pkg.packagingMaterial.name,
        unitPrice: pkg.packagingMaterial.unitPrice,
        unitType: pkg.packagingMaterial.unitType
      }
    })),
    ingredientsCost,
    packagingCost,
    totalCost: ingredientsCost + packagingCost
  }
}

/**
 * Create a new recipe.
 */
export async function createRecipe(data: CreateRecipeInput): Promise<Recipe> {
  const prisma = getPrisma()

  // Check for duplicate name (case-insensitive) using raw SQL for SQLite compatibility
  const trimmedName = data.name.trim()
  const existingRecipes = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM recipes WHERE LOWER(name) = LOWER(${trimmedName}) LIMIT 1
  `

  if (existingRecipes.length > 0) {
    throw new Error('DUPLICATE_NAME')
  }

  return prisma.recipe.create({
    data: {
      name: trimmedName,
      description: data.description?.trim() || null,
      categoryId: data.categoryId || null,
      yieldQuantity: data.yieldQuantity,
      yieldUnit: data.yieldUnit,
      prepTimeMinutes: data.prepTimeMinutes || null,
      instructions: data.instructions?.trim() || null,
      profitMargin: data.profitMargin || null,
      wastePercentage: data.wastePercentage || null,
      vatPercentage: data.vatPercentage || null
    }
  })
}

/**
 * Update an existing recipe.
 */
export async function updateRecipe(id: string, data: UpdateRecipeInput): Promise<Recipe> {
  const prisma = getPrisma()

  // Check if recipe exists
  const recipe = await prisma.recipe.findUnique({
    where: { id }
  })

  if (!recipe) {
    throw new Error('NOT_FOUND')
  }

  // Check for duplicate name (case-insensitive, excluding current recipe) using raw SQL for SQLite compatibility
  const trimmedName = data.name.trim()
  const duplicateRecipes = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM recipes WHERE LOWER(name) = LOWER(${trimmedName}) AND id != ${id} LIMIT 1
  `

  if (duplicateRecipes.length > 0) {
    throw new Error('DUPLICATE_NAME')
  }

  return prisma.recipe.update({
    where: { id },
    data: {
      name: trimmedName,
      description: data.description?.trim() || null,
      categoryId: data.categoryId || null,
      yieldQuantity: data.yieldQuantity,
      yieldUnit: data.yieldUnit,
      prepTimeMinutes: data.prepTimeMinutes || null,
      instructions: data.instructions?.trim() || null,
      profitMargin: data.profitMargin || null,
      wastePercentage: data.wastePercentage || null,
      vatPercentage: data.vatPercentage || null
    }
  })
}

/**
 * Archive a recipe.
 */
export async function archiveRecipe(id: string): Promise<Recipe> {
  const prisma = getPrisma()

  const recipe = await prisma.recipe.findUnique({
    where: { id }
  })

  if (!recipe) {
    throw new Error('NOT_FOUND')
  }

  return prisma.recipe.update({
    where: { id },
    data: { isArchived: true }
  })
}

/**
 * Unarchive a recipe.
 */
export async function unarchiveRecipe(id: string): Promise<Recipe> {
  const prisma = getPrisma()

  const recipe = await prisma.recipe.findUnique({
    where: { id }
  })

  if (!recipe) {
    throw new Error('NOT_FOUND')
  }

  return prisma.recipe.update({
    where: { id },
    data: { isArchived: false }
  })
}

/**
 * Toggle favorite status of a recipe.
 */
export async function toggleFavoriteRecipe(id: string): Promise<Recipe> {
  const prisma = getPrisma()

  const recipe = await prisma.recipe.findUnique({
    where: { id }
  })

  if (!recipe) {
    throw new Error('NOT_FOUND')
  }

  return prisma.recipe.update({
    where: { id },
    data: { isFavorite: !recipe.isFavorite }
  })
}

/**
 * Get the suggested name for a duplicated recipe.
 * Returns the original name with " (Copy)" suffix, incrementing if needed.
 */
export async function getSuggestedDuplicateName(id: string): Promise<string> {
  const prisma = getPrisma()

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { name: true }
  })

  if (!recipe) {
    throw new Error('NOT_FOUND')
  }

  // Generate a unique name for the copy
  let copyName = `${recipe.name} (Copy)`
  let counter = 1

  while (true) {
    const existingRecipes = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM recipes WHERE LOWER(name) = LOWER(${copyName}) LIMIT 1
    `

    if (existingRecipes.length === 0) break

    counter++
    copyName = `${recipe.name} (Copy ${counter})`
  }

  return copyName
}

/**
 * Check if a recipe name is available for use.
 */
export async function checkRecipeNameAvailable(name: string): Promise<boolean> {
  const prisma = getPrisma()
  const trimmedName = name.trim()

  const existingRecipes = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM recipes WHERE LOWER(name) = LOWER(${trimmedName}) LIMIT 1
  `

  return existingRecipes.length === 0
}

/**
 * Duplicate a recipe with all its ingredients and packaging.
 * @param id - The ID of the recipe to duplicate
 * @param newName - The name for the duplicated recipe (must be unique)
 */
export async function duplicateRecipe(id: string, newName: string): Promise<Recipe> {
  const prisma = getPrisma()

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      recipePackaging: true
    }
  })

  if (!recipe) {
    throw new Error('NOT_FOUND')
  }

  // Validate the new name
  const trimmedName = newName.trim()
  if (!trimmedName) {
    throw new Error('NAME_REQUIRED')
  }

  // Check for duplicate name (case-insensitive)
  const existingRecipes = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM recipes WHERE LOWER(name) = LOWER(${trimmedName}) LIMIT 1
  `

  if (existingRecipes.length > 0) {
    throw new Error('DUPLICATE_NAME')
  }

  // Create the new recipe with ingredients and packaging
  return prisma.recipe.create({
    data: {
      name: trimmedName,
      description: recipe.description,
      categoryId: recipe.categoryId,
      yieldQuantity: recipe.yieldQuantity,
      yieldUnit: recipe.yieldUnit,
      prepTimeMinutes: recipe.prepTimeMinutes,
      instructions: recipe.instructions,
      profitMargin: recipe.profitMargin,
      wastePercentage: recipe.wastePercentage,
      vatPercentage: recipe.vatPercentage,
      isFavorite: false,
      isArchived: false,
      ingredients: {
        create: recipe.ingredients.map((ingredient) => ({
          materialId: ingredient.materialId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          sortOrder: ingredient.sortOrder,
          notes: ingredient.notes
        }))
      },
      recipePackaging: {
        create: recipe.recipePackaging.map((pkg) => ({
          packagingMaterialId: pkg.packagingMaterialId,
          quantity: pkg.quantity,
          sortOrder: pkg.sortOrder,
          notes: pkg.notes
        }))
      }
    }
  })
}

/**
 * Delete a recipe.
 */
export async function deleteRecipe(id: string): Promise<void> {
  const prisma = getPrisma()

  const recipe = await prisma.recipe.findUnique({
    where: { id }
  })

  if (!recipe) {
    throw new Error('NOT_FOUND')
  }

  // Cascade delete will handle ingredients and packaging
  await prisma.recipe.delete({
    where: { id }
  })
}

// ========================================
// Recipe Ingredient Management
// ========================================

export interface AddIngredientInput {
  recipeId: string
  materialId: string
  quantity: number
  unit: 'kg' | 'g'
  notes?: string | null
}

export interface UpdateIngredientInput {
  quantity?: number
  unit?: 'kg' | 'g'
  notes?: string | null
}

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
 * Add an ingredient to a recipe.
 */
export async function addIngredient(data: AddIngredientInput): Promise<RecipeIngredient> {
  const prisma = getPrisma()

  // Verify the recipe exists
  const recipe = await prisma.recipe.findUnique({
    where: { id: data.recipeId }
  })

  if (!recipe) {
    throw new Error('RECIPE_NOT_FOUND')
  }

  // Verify the material exists
  const material = await prisma.sourceMaterial.findUnique({
    where: { id: data.materialId }
  })

  if (!material) {
    throw new Error('MATERIAL_NOT_FOUND')
  }

  // Check if the material is already in the recipe
  const existingIngredient = await prisma.recipeIngredient.findUnique({
    where: {
      recipeId_materialId: {
        recipeId: data.recipeId,
        materialId: data.materialId
      }
    }
  })

  if (existingIngredient) {
    throw new Error('INGREDIENT_ALREADY_EXISTS')
  }

  // Get the current max sortOrder
  const maxSortOrderResult = await prisma.recipeIngredient.findFirst({
    where: { recipeId: data.recipeId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true }
  })

  const newSortOrder = (maxSortOrderResult?.sortOrder ?? -1) + 1

  return prisma.recipeIngredient.create({
    data: {
      recipeId: data.recipeId,
      materialId: data.materialId,
      quantity: data.quantity,
      unit: data.unit,
      sortOrder: newSortOrder,
      notes: data.notes || null
    }
  })
}

/**
 * Update an ingredient in a recipe.
 */
export async function updateIngredient(
  id: string,
  data: UpdateIngredientInput
): Promise<RecipeIngredient> {
  const prisma = getPrisma()

  const ingredient = await prisma.recipeIngredient.findUnique({
    where: { id }
  })

  if (!ingredient) {
    throw new Error('NOT_FOUND')
  }

  return prisma.recipeIngredient.update({
    where: { id },
    data: {
      quantity: data.quantity ?? ingredient.quantity,
      unit: data.unit ?? ingredient.unit,
      notes: data.notes !== undefined ? data.notes : ingredient.notes
    }
  })
}

/**
 * Remove an ingredient from a recipe.
 */
export async function removeIngredient(id: string): Promise<void> {
  const prisma = getPrisma()

  const ingredient = await prisma.recipeIngredient.findUnique({
    where: { id }
  })

  if (!ingredient) {
    throw new Error('NOT_FOUND')
  }

  await prisma.recipeIngredient.delete({
    where: { id }
  })

  // Reorder remaining ingredients to fill the gap
  await prisma.$executeRaw`
    UPDATE recipe_ingredients
    SET sort_order = sort_order - 1
    WHERE recipe_id = ${ingredient.recipeId} AND sort_order > ${ingredient.sortOrder}
  `
}

/**
 * Reorder ingredients in a recipe.
 */
export async function reorderIngredients(
  recipeId: string,
  ingredientIds: string[]
): Promise<void> {
  const prisma = getPrisma()

  // Verify the recipe exists
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId }
  })

  if (!recipe) {
    throw new Error('RECIPE_NOT_FOUND')
  }

  // Update sort orders in a transaction
  await prisma.$transaction(
    ingredientIds.map((id, index) =>
      prisma.recipeIngredient.update({
        where: { id },
        data: { sortOrder: index }
      })
    )
  )
}

// ========================================
// Recipe Packaging Management
// ========================================

export interface AddPackagingInput {
  recipeId: string
  packagingMaterialId: string
  quantity: number
  notes?: string | null
}

export interface UpdatePackagingInput {
  quantity?: number
  notes?: string | null
}

export interface RecipePackaging {
  id: string
  recipeId: string
  packagingMaterialId: string
  quantity: number
  sortOrder: number
  notes: string | null
}

/**
 * Add packaging to a recipe.
 */
export async function addPackaging(data: AddPackagingInput): Promise<RecipePackaging> {
  const prisma = getPrisma()

  // Verify the recipe exists
  const recipe = await prisma.recipe.findUnique({
    where: { id: data.recipeId }
  })

  if (!recipe) {
    throw new Error('RECIPE_NOT_FOUND')
  }

  // Verify the packaging material exists
  const packagingMaterial = await prisma.packagingMaterial.findUnique({
    where: { id: data.packagingMaterialId }
  })

  if (!packagingMaterial) {
    throw new Error('PACKAGING_NOT_FOUND')
  }

  // Check if the packaging material is already in the recipe
  const existingPackaging = await prisma.recipePackaging.findUnique({
    where: {
      recipeId_packagingMaterialId: {
        recipeId: data.recipeId,
        packagingMaterialId: data.packagingMaterialId
      }
    }
  })

  if (existingPackaging) {
    throw new Error('PACKAGING_ALREADY_EXISTS')
  }

  // Get the current max sortOrder
  const maxSortOrderResult = await prisma.recipePackaging.findFirst({
    where: { recipeId: data.recipeId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true }
  })

  const newSortOrder = (maxSortOrderResult?.sortOrder ?? -1) + 1

  return prisma.recipePackaging.create({
    data: {
      recipeId: data.recipeId,
      packagingMaterialId: data.packagingMaterialId,
      quantity: data.quantity,
      sortOrder: newSortOrder,
      notes: data.notes || null
    }
  })
}

/**
 * Update packaging in a recipe.
 */
export async function updatePackaging(
  id: string,
  data: UpdatePackagingInput
): Promise<RecipePackaging> {
  const prisma = getPrisma()

  const packaging = await prisma.recipePackaging.findUnique({
    where: { id }
  })

  if (!packaging) {
    throw new Error('NOT_FOUND')
  }

  return prisma.recipePackaging.update({
    where: { id },
    data: {
      quantity: data.quantity ?? packaging.quantity,
      notes: data.notes !== undefined ? data.notes : packaging.notes
    }
  })
}

/**
 * Remove packaging from a recipe.
 */
export async function removePackaging(id: string): Promise<void> {
  const prisma = getPrisma()

  const packaging = await prisma.recipePackaging.findUnique({
    where: { id }
  })

  if (!packaging) {
    throw new Error('NOT_FOUND')
  }

  await prisma.recipePackaging.delete({
    where: { id }
  })

  // Reorder remaining packaging to fill the gap
  await prisma.$executeRaw`
    UPDATE recipe_packaging
    SET sort_order = sort_order - 1
    WHERE recipe_id = ${packaging.recipeId} AND sort_order > ${packaging.sortOrder}
  `
}
