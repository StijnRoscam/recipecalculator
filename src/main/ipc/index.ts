import { ipcMain } from 'electron'
import {
  getAllMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  archiveMaterial,
  unarchiveMaterial
} from './materials'
import type { CreateMaterialInput, UpdateMaterialInput } from './materials'
import { getAllPackaging, getPackaging, createPackaging, updatePackaging, deletePackaging } from './packaging'
import type { CreatePackagingInput, UpdatePackagingInput } from './packaging'
import {
  getAllRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  archiveRecipe,
  unarchiveRecipe,
  toggleFavoriteRecipe,
  duplicateRecipe,
  deleteRecipe,
  addIngredient,
  updateIngredient,
  removeIngredient,
  reorderIngredients,
  addPackaging,
  updatePackaging as updateRecipePackaging,
  removePackaging
} from './recipes'
import type {
  CreateRecipeInput,
  UpdateRecipeInput,
  AddIngredientInput,
  UpdateIngredientInput,
  AddPackagingInput,
  UpdatePackagingInput as UpdateRecipePackagingInput
} from './recipes'

/**
 * Registers all IPC handlers for the application.
 * This should be called after database initialization.
 */
export function registerIpcHandlers(): void {
  // Materials handlers
  ipcMain.handle('materials:getAll', async (_event, includeArchived: boolean) => {
    try {
      return await getAllMaterials(includeArchived)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Failed to get materials: ${errorMessage}`)
      throw new Error(`Failed to get materials: ${errorMessage}`)
    }
  })

  ipcMain.handle('materials:create', async (_event, data: CreateMaterialInput) => {
    console.log('[IPC] materials:create called with:', JSON.stringify(data, null, 2))
    try {
      const result = await createMaterial(data)
      console.log('[IPC] materials:create succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] materials:create failed: ${errorMessage}`)
      console.error('[IPC] Full error:', error)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('materials:get', async (_event, id: string) => {
    console.log('[IPC] materials:get called with id:', id)
    try {
      const result = await getMaterial(id)
      console.log('[IPC] materials:get succeeded:', result ? result.id : 'not found')
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] materials:get failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('materials:update', async (_event, id: string, data: UpdateMaterialInput) => {
    console.log('[IPC] materials:update called with id:', id, 'data:', JSON.stringify(data, null, 2))
    try {
      const result = await updateMaterial(id, data)
      console.log('[IPC] materials:update succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] materials:update failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('materials:archive', async (_event, id: string) => {
    console.log('[IPC] materials:archive called with id:', id)
    try {
      const result = await archiveMaterial(id)
      console.log('[IPC] materials:archive succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] materials:archive failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('materials:unarchive', async (_event, id: string) => {
    console.log('[IPC] materials:unarchive called with id:', id)
    try {
      const result = await unarchiveMaterial(id)
      console.log('[IPC] materials:unarchive succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] materials:unarchive failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  // Packaging handlers
  ipcMain.handle('packaging:getAll', async (_event, includeArchived: boolean) => {
    try {
      return await getAllPackaging(includeArchived)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Failed to get packaging materials: ${errorMessage}`)
      throw new Error(`Failed to get packaging materials: ${errorMessage}`)
    }
  })

  ipcMain.handle('packaging:create', async (_event, data: CreatePackagingInput) => {
    console.log('[IPC] packaging:create called with:', JSON.stringify(data, null, 2))
    try {
      const result = await createPackaging(data)
      console.log('[IPC] packaging:create succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] packaging:create failed: ${errorMessage}`)
      console.error('[IPC] Full error:', error)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('packaging:get', async (_event, id: string) => {
    console.log('[IPC] packaging:get called with id:', id)
    try {
      const result = await getPackaging(id)
      console.log('[IPC] packaging:get succeeded:', result ? result.id : 'not found')
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] packaging:get failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('packaging:update', async (_event, id: string, data: UpdatePackagingInput) => {
    console.log('[IPC] packaging:update called with id:', id, 'data:', JSON.stringify(data, null, 2))
    try {
      const result = await updatePackaging(id, data)
      console.log('[IPC] packaging:update succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] packaging:update failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('packaging:delete', async (_event, id: string) => {
    console.log('[IPC] packaging:delete called with id:', id)
    try {
      await deletePackaging(id)
      console.log('[IPC] packaging:delete succeeded')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] packaging:delete failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  // Recipes handlers
  ipcMain.handle('recipes:getAll', async (_event, includeArchived: boolean) => {
    try {
      return await getAllRecipes(includeArchived)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Failed to get recipes: ${errorMessage}`)
      throw new Error(`Failed to get recipes: ${errorMessage}`)
    }
  })

  ipcMain.handle('recipes:get', async (_event, id: string) => {
    console.log('[IPC] recipes:get called with id:', id)
    try {
      const result = await getRecipe(id)
      console.log('[IPC] recipes:get succeeded:', result ? result.id : 'not found')
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipes:get failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('recipes:create', async (_event, data: CreateRecipeInput) => {
    console.log('[IPC] recipes:create called with:', JSON.stringify(data, null, 2))
    try {
      const result = await createRecipe(data)
      console.log('[IPC] recipes:create succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipes:create failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('recipes:update', async (_event, id: string, data: UpdateRecipeInput) => {
    console.log('[IPC] recipes:update called with id:', id, 'data:', JSON.stringify(data, null, 2))
    try {
      const result = await updateRecipe(id, data)
      console.log('[IPC] recipes:update succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipes:update failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('recipes:archive', async (_event, id: string) => {
    console.log('[IPC] recipes:archive called with id:', id)
    try {
      const result = await archiveRecipe(id)
      console.log('[IPC] recipes:archive succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipes:archive failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('recipes:unarchive', async (_event, id: string) => {
    console.log('[IPC] recipes:unarchive called with id:', id)
    try {
      const result = await unarchiveRecipe(id)
      console.log('[IPC] recipes:unarchive succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipes:unarchive failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('recipes:toggleFavorite', async (_event, id: string) => {
    console.log('[IPC] recipes:toggleFavorite called with id:', id)
    try {
      const result = await toggleFavoriteRecipe(id)
      console.log('[IPC] recipes:toggleFavorite succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipes:toggleFavorite failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('recipes:duplicate', async (_event, id: string) => {
    console.log('[IPC] recipes:duplicate called with id:', id)
    try {
      const result = await duplicateRecipe(id)
      console.log('[IPC] recipes:duplicate succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipes:duplicate failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('recipes:delete', async (_event, id: string) => {
    console.log('[IPC] recipes:delete called with id:', id)
    try {
      await deleteRecipe(id)
      console.log('[IPC] recipes:delete succeeded')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipes:delete failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  // Recipe Ingredient handlers
  ipcMain.handle('ingredients:add', async (_event, data: AddIngredientInput) => {
    console.log('[IPC] ingredients:add called with:', JSON.stringify(data, null, 2))
    try {
      const result = await addIngredient(data)
      console.log('[IPC] ingredients:add succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] ingredients:add failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('ingredients:update', async (_event, id: string, data: UpdateIngredientInput) => {
    console.log('[IPC] ingredients:update called with id:', id, 'data:', JSON.stringify(data, null, 2))
    try {
      const result = await updateIngredient(id, data)
      console.log('[IPC] ingredients:update succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] ingredients:update failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('ingredients:remove', async (_event, id: string) => {
    console.log('[IPC] ingredients:remove called with id:', id)
    try {
      await removeIngredient(id)
      console.log('[IPC] ingredients:remove succeeded')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] ingredients:remove failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('ingredients:reorder', async (_event, recipeId: string, ingredientIds: string[]) => {
    console.log('[IPC] ingredients:reorder called for recipe:', recipeId)
    try {
      await reorderIngredients(recipeId, ingredientIds)
      console.log('[IPC] ingredients:reorder succeeded')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] ingredients:reorder failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  // Recipe Packaging handlers
  ipcMain.handle('recipePackaging:add', async (_event, data: AddPackagingInput) => {
    console.log('[IPC] recipePackaging:add called with:', JSON.stringify(data, null, 2))
    try {
      const result = await addPackaging(data)
      console.log('[IPC] recipePackaging:add succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipePackaging:add failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('recipePackaging:update', async (_event, id: string, data: UpdateRecipePackagingInput) => {
    console.log('[IPC] recipePackaging:update called with id:', id, 'data:', JSON.stringify(data, null, 2))
    try {
      const result = await updateRecipePackaging(id, data)
      console.log('[IPC] recipePackaging:update succeeded:', result.id)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipePackaging:update failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('recipePackaging:remove', async (_event, id: string) => {
    console.log('[IPC] recipePackaging:remove called with id:', id)
    try {
      await removePackaging(id)
      console.log('[IPC] recipePackaging:remove succeeded')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[IPC] recipePackaging:remove failed: ${errorMessage}`)
      throw new Error(errorMessage)
    }
  })

  console.log('IPC handlers registered')
}
