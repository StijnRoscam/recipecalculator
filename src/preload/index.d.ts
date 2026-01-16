import { ElectronAPI } from '@electron-toolkit/preload'
import type { MaterialsApi, PackagingApi, RecipesApi, IngredientsApi, RecipePackagingApi } from '../shared/types'

interface Api {
  materials: MaterialsApi
  packaging: PackagingApi
  recipes: RecipesApi
  ingredients: IngredientsApi
  recipePackaging: RecipePackagingApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
