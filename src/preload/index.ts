import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  Material,
  CreateMaterialInput,
  UpdateMaterialInput,
  PackagingMaterial,
  CreatePackagingInput,
  UpdatePackagingInput,
  Recipe,
  RecipeWithDetails,
  RecipeWithFullDetails,
  CreateRecipeInput,
  UpdateRecipeInput
} from '../shared/types'

// Custom APIs for renderer
const api = {
  materials: {
    getAll: (includeArchived: boolean): Promise<Material[]> =>
      ipcRenderer.invoke('materials:getAll', includeArchived),
    get: (id: string): Promise<Material | null> => ipcRenderer.invoke('materials:get', id),
    create: (data: CreateMaterialInput): Promise<Material> =>
      ipcRenderer.invoke('materials:create', data),
    update: (id: string, data: UpdateMaterialInput): Promise<Material> =>
      ipcRenderer.invoke('materials:update', id, data),
    archive: (id: string): Promise<Material> => ipcRenderer.invoke('materials:archive', id),
    unarchive: (id: string): Promise<Material> => ipcRenderer.invoke('materials:unarchive', id)
  },
  packaging: {
    getAll: (includeArchived: boolean): Promise<PackagingMaterial[]> =>
      ipcRenderer.invoke('packaging:getAll', includeArchived),
    get: (id: string): Promise<PackagingMaterial | null> => ipcRenderer.invoke('packaging:get', id),
    create: (data: CreatePackagingInput): Promise<PackagingMaterial> =>
      ipcRenderer.invoke('packaging:create', data),
    update: (id: string, data: UpdatePackagingInput): Promise<PackagingMaterial> =>
      ipcRenderer.invoke('packaging:update', id, data),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('packaging:delete', id)
  },
  recipes: {
    getAll: (includeArchived: boolean): Promise<RecipeWithDetails[]> =>
      ipcRenderer.invoke('recipes:getAll', includeArchived),
    get: (id: string): Promise<RecipeWithFullDetails | null> =>
      ipcRenderer.invoke('recipes:get', id),
    create: (data: CreateRecipeInput): Promise<Recipe> =>
      ipcRenderer.invoke('recipes:create', data),
    update: (id: string, data: UpdateRecipeInput): Promise<Recipe> =>
      ipcRenderer.invoke('recipes:update', id, data),
    archive: (id: string): Promise<Recipe> => ipcRenderer.invoke('recipes:archive', id),
    unarchive: (id: string): Promise<Recipe> => ipcRenderer.invoke('recipes:unarchive', id),
    toggleFavorite: (id: string): Promise<Recipe> =>
      ipcRenderer.invoke('recipes:toggleFavorite', id),
    getSuggestedDuplicateName: (id: string): Promise<string> =>
      ipcRenderer.invoke('recipes:getSuggestedDuplicateName', id),
    checkNameAvailable: (name: string): Promise<boolean> =>
      ipcRenderer.invoke('recipes:checkNameAvailable', name),
    duplicate: (id: string, newName: string): Promise<Recipe> =>
      ipcRenderer.invoke('recipes:duplicate', id, newName),
    delete: (id: string): Promise<void> => ipcRenderer.invoke('recipes:delete', id)
  },
  ingredients: {
    add: (data: {
      recipeId: string
      materialId: string
      quantity: number
      unit: 'kg' | 'g'
      notes?: string | null
    }): Promise<{ id: string; recipeId: string; materialId: string; quantity: number; unit: string; sortOrder: number; notes: string | null }> =>
      ipcRenderer.invoke('ingredients:add', data),
    update: (
      id: string,
      data: { quantity?: number; unit?: 'kg' | 'g'; notes?: string | null }
    ): Promise<{ id: string; recipeId: string; materialId: string; quantity: number; unit: string; sortOrder: number; notes: string | null }> =>
      ipcRenderer.invoke('ingredients:update', id, data),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('ingredients:remove', id),
    reorder: (recipeId: string, ingredientIds: string[]): Promise<void> =>
      ipcRenderer.invoke('ingredients:reorder', recipeId, ingredientIds)
  },
  recipePackaging: {
    add: (data: {
      recipeId: string
      packagingMaterialId: string
      quantity: number
      notes?: string | null
    }): Promise<{ id: string; recipeId: string; packagingMaterialId: string; quantity: number; sortOrder: number; notes: string | null }> =>
      ipcRenderer.invoke('recipePackaging:add', data),
    update: (
      id: string,
      data: { quantity?: number; notes?: string | null }
    ): Promise<{ id: string; recipeId: string; packagingMaterialId: string; quantity: number; sortOrder: number; notes: string | null }> =>
      ipcRenderer.invoke('recipePackaging:update', id, data),
    remove: (id: string): Promise<void> => ipcRenderer.invoke('recipePackaging:remove', id)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
