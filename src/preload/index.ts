import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  Material,
  CreateMaterialInput,
  UpdateMaterialInput,
  PackagingMaterial,
  CreatePackagingInput,
  UpdatePackagingInput
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
