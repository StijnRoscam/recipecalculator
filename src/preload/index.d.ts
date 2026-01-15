import { ElectronAPI } from '@electron-toolkit/preload'
import type { MaterialsApi, PackagingApi, RecipesApi } from '../shared/types'

interface Api {
  materials: MaterialsApi
  packaging: PackagingApi
  recipes: RecipesApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
