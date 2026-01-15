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

  console.log('IPC handlers registered')
}
