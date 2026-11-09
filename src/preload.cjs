/**
 * HumanSense AI - Electron Preload Script
 * 
 * Secure contextBridge boundary:
 * 1. Requires the official @smartspectra/node-sdk/preload script to wire window.__smartspectraBridge.
 * 2. Exposes desktop system info and window management controls without exposing raw Node APIs.
 */

'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// 1. Initialize the official Presage SmartSpectra preload bridge
// This wires window.__smartspectraBridge with attach(), postMessage(), onMessage(), close()
require('@smartspectra/node-sdk/preload');

// 2. Expose application metadata and system diagnostics securely to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getInfo: () => ipcRenderer.invoke('app:get-info'),
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),
  platform: process.platform,
  arch: process.arch,
});
