import { ipcMain } from 'electron'
import { getAllMaterials } from './materials'

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

  console.log('IPC handlers registered')
}
