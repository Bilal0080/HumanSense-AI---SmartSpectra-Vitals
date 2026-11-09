/**
 * HumanSense AI - Electron Main Process
 * 
 * Manages the native application lifecycle, secure BrowserWindow creation,
 * hardware camera permissions, and native Presage SmartSpectra SDK IPC binding.
 * 
 * Strict Process Isolation:
 * - Native Node.js & Koffi FFI execution remains exclusively in this Main process.
 * - Renderer communicates solely via sandboxed MessagePort bridge.
 */

'use strict';

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { bindSmartSpectraIpc } = require('@smartspectra/node-sdk/main');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    title: 'HumanSense AI - SmartSpectra Vitals',
    backgroundColor: '#070B14',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Attach official SmartSpectra IPC handler to manage native C-API / Koffi session
  bindSmartSpectraIpc(mainWindow, {
    logger: (level, msg) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] [SmartSpectra ${level.toUpperCase()}] ${msg}`);
    },
  });

  // Handle hardware camera permission requests securely
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    if (permission === 'media') {
      // Explicitly allow camera access for internal application window
      const url = (details && details.requestingUrl) || (webContents && webContents.getURL()) || '';
      const isAllowed = url.startsWith('http://localhost') || url.startsWith('file://') || url.startsWith('http://127.0.0.1');
      callback(isAllowed);
      return;
    }
    callback(false);
  });

  // Display window when ready to prevent visual flickering
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load renderer view (Vite dev server or production dist)
  const devUrl = process.env.VITE_DEV_SERVER_URL || (process.argv.includes('--dev') ? 'http://localhost:3000' : null);
  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath).catch(() => {
      // Fallback to dev server if dist hasn't been built yet
      mainWindow.loadURL('http://localhost:3000');
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for app diagnostics and desktop capabilities
ipcMain.handle('app:get-info', () => {
  return {
    name: 'HumanSense AI',
    version: app.getVersion(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    platform: process.platform,
    arch: process.arch,
    sdkVersion: '3.4.0',
    isElectron: true,
  };
});

ipcMain.handle('app:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('app:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.handle('app:close', () => {
  if (mainWindow) mainWindow.close();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
