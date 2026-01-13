import { ElectronAPI } from '@electron-toolkit/preload'
import type { MaterialsApi, PackagingApi } from '../shared/types'

interface Api {
  materials: MaterialsApi
  packaging: PackagingApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
