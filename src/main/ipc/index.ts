import { ipcMain } from 'electron'
import { getAllMaterials, createMaterial } from './materials'
import type { CreateMaterialInput } from './materials'

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

  console.log('IPC handlers registered')
}
