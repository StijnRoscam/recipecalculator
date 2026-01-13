import { app, BrowserWindow, dialog, shell, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initializeDatabase, closeDatabase, getDatabasePath } from './database'

/**
 * Shows an error dialog to the user when database initialization fails.
 */
function showDatabaseError(error: Error): void {
  dialog.showErrorBox(
    'Database Error',
    `Failed to initialize the database. The application cannot start.\n\n` +
      `Error: ${error.message}\n\n` +
      `Database path: ${getDatabasePath()}\n\n` +
      `Please check that you have write permissions to the application data folder.`
  )
}

function createWindow(): void {
  // Get primary display dimensions for centering
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  // Window dimensions
  const windowWidth = 1200
  const windowHeight = 800
  const minWidth = 1024
  const minHeight = 768

  // Calculate center position
  const x = Math.round((screenWidth - windowWidth) / 2)
  const y = Math.round((screenHeight - windowHeight) / 2)

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    x: x,
    y: y,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer based on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.butchercalculator')

  // Initialize database before creating windows
  try {
    initializeDatabase()
  } catch (error) {
    showDatabaseError(error instanceof Error ? error : new Error(String(error)))
    app.quit()
    return
  }

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Close database connection when app is quitting
app.on('before-quit', () => {
  closeDatabase()
})
