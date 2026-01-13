import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Material, CreateMaterialInput } from '../shared/types'

// Custom APIs for renderer
const api = {
  materials: {
    getAll: (includeArchived: boolean): Promise<Material[]> =>
      ipcRenderer.invoke('materials:getAll', includeArchived),
    create: (data: CreateMaterialInput): Promise<Material> =>
      ipcRenderer.invoke('materials:create', data)
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
