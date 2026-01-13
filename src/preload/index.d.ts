import { ElectronAPI } from '@electron-toolkit/preload'
import type { MaterialsApi } from '../shared/types'

interface Api {
  materials: MaterialsApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
