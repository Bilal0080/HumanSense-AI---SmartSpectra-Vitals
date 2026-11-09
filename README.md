# HumanSense AI — Presage SmartSpectra Desktop Application

[![SmartSpectra SDK](https://img.shields.io/badge/SmartSpectra%20SDK-v3.4.0-cyan.svg)](https://smartspectra.presagetech.com/)
[![Electron](https://img.shields.io/badge/Electron-Desktop-indigo.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-emerald.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64%20%7C%20Linux%20%7C%20macOS-blue.svg)]()
[![License](https://img.shields.io/badge/License-Apache%202.0-slate.svg)](LICENSE)

> **Presage SmartSpectra Challenge Submission**  
> Real-time, contactless physiological vitals measurement and facial kinematics analysis powered by the official Presage SmartSpectra Node.js SDK and Electron desktop architecture.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Key Physiological Features](#2-key-physiological-features)
3. [Root Cause & Solution: Vite & Koffi Dependency Error](#3-root-cause--solution-vite--koffi-dependency-error)
4. [Desktop Architecture & Process Boundary](#4-desktop-architecture--process-boundary)
5. [Prerequisites](#5-prerequisites)
6. [Installation & Windows PowerShell Setup](#6-installation--windows-powershell-setup)
7. [Running HumanSense AI](#7-running-humansense-ai)
8. [Packaging & Distribution for Windows x64](#8-packaging--distribution-for-windows-x64)
9. [Signal Validation & Clinical Accuracy Standards](#9-signal-validation--clinical-accuracy-standards)
10. [Camera Permission & Privacy Disclosures](#10-camera-permission--privacy-disclosures)
11. [Troubleshooting Guide](#11-troubleshooting-guide)
12. [Technical Demonstration Walkthrough](#12-technical-demonstration-walkthrough)

---

## 1. Overview

**HumanSense AI** is a clinical-grade desktop application that transforms a standard webcam into a real-time, non-invasive physiological vitals monitor. By evaluating subtle micro-color variations in facial tissue (remote photoplethysmography or rPPG) and thoracic kinematic movements, HumanSense AI computes vital health telemetry without physical contact sensors.

Built specifically for the **Presage SmartSpectra Challenge**, it uses the official `@smartspectra/node-sdk` (version 3.4.0) with strict process isolation, robust error handling, and privacy-conscious design.

---

## 2. Key Physiological Features

HumanSense AI requests and decodes three primary official SmartSpectra metric bundles:

### A. Pulse / Heart Rate (`cardioMetrics`)
- **Metric:** Pulse Rate in Beats Per Minute (BPM).
- **Signal Quality Standard:** Stability verified at confidence $\ge 40$ ($\pm 3$ BPM error floor according to Presage Arterial Pressure Model Card).
- **Status Indication:** Surfaces clear real-time states (*"Locked ($\pm 3$ BPM)"*, *"Insufficient signal quality"*, *"Waiting for measurement"*). Never invents or fabricates synthetic numbers.

### B. Breathing Rate (`breathingMetrics`)
- **Metric:** Respiration Rate in breaths per minute (`br/min`).
- **Signal Quality Standard:** Stability verified at confidence $\ge 45$ ($\pm 1$ br/min error floor according to Presage Breathing Model Card).
- **Tracking:** Derived from upper-chest and thoracic kinematic movement patterns.

### C. Heart Rate Variability (HRV) (`cardioMetrics`)
- **RMSSD:** Root mean square of successive normal RR interval differences in milliseconds (`ms`). Stability threshold: confidence $\ge 50$ ($\pm 5$ ms accuracy standard).
- **SDNN:** Standard deviation of normal-to-normal intervals in milliseconds (`ms`).
- **Mean NN:** Average interval length between consecutive normal beats in milliseconds (`ms`).
- **Baevsky's Stress Index:** Dimensionless autonomic nervous system balance indicator derived from interval distribution ($AMo / (2 \cdot Mo \cdot MxDMn)$).

### D. Facial Expression & Muscle Kinematics (`faceMetrics`)
- **Scores Breakdown:** Real-time percentage distribution for 8 expression types (`Neutral`, `Happy`, `Surprise`, `Sad`, `Angry`, `Fear`, `Disgust`, `Contempt`).
- **Ethical & Algorithmic Notice:** Displayed with mandatory disclosure: *Algorithmic facial-expression estimates based on facial muscle movement patterns. Does not detect a person's true emotions, mental health, intentions, or personality.*

---

## 3. Root Cause & Solution: Vite & Koffi Dependency Error

### The Root Cause
The Vite dependency optimization error occurs because `@smartspectra/node-sdk` root index imports native C++ FFI machinery (`koffi`), filesystem bindings (`fs`), and path resolvers (`path`) designed exclusively for Node.js / Electron main processes.

When a frontend module writes:
```typescript
// ❌ WRONG: Imports root module which requires koffi into browser bundle
import { SmartSpectraSDK, breathingMetrics } from '@smartspectra/node-sdk';
```
Vite attempts to crawl and pre-bundle `koffi` using esbuild for the browser, crashing with:
```text
[vite] Internal server error: Failed to resolve import "koffi"
```

### The Architectural Solution
1. **Renderer Isolation:** Frontend code strictly imports from `@smartspectra/node-sdk/renderer` and `@smartspectra/node-sdk/messages`:
   ```typescript
   //  CORRECT: Pure browser/renderer entry points
   import { SmartSpectraSDK, breathingMetrics, cardioMetrics } from '@smartspectra/node-sdk/renderer';
   import { decodeMetrics } from '@smartspectra/node-sdk/messages';
   ```
   *Note: `@smartspectra/node-sdk/renderer` re-exports all constants and metric bundles without bundling Koffi!*
2. **Vite Optimization Exclusion:** `vite.config.ts` explicitly marks native dependencies as excluded and external:
   ```typescript
   optimizeDeps: {
     exclude: ['koffi', 'electron', '@smartspectra/node-sdk', '@smartspectra/node-sdk/main'],
   },
   build: {
     rollupOptions: {
       external: ['koffi', 'electron', '@smartspectra/node-sdk', '@smartspectra/node-sdk/main'],
     },
   }
   ```
3. **Electron Main Isolation:** `bindSmartSpectraIpc` from `@smartspectra/node-sdk/main` runs strictly inside `src/main.cjs` under Node.js, where Koffi loads the platform binary (`smartspectra_capi.dll` on Windows x64).

---

## 4. Desktop Architecture & Process Boundary

```text
┌─────────────────────────────────────────────────────────────────┐
│                     HumanSense AI Application                    │
├───────────────────────────────┬─────────────────────────────────┤
│    ELECTRON MAIN PROCESS      │     ELECTRON RENDERER (REACT)   │
│         (Node.js)             │         (Vite / Web)            │
│                               │                                 │
│  src/main.cjs                 │  src/App.tsx                    │
│   • BrowserWindow             │   • CameraView (1280x720 30FPS) │
│   • bindSmartSpectraIpc()     │   • Vitals Cards Grid           │
│   • koffi FFI runtime         │   • Alignment Reticle           │
│   • smartspectra_capi.dll     │   • Settings & Consent Modals   │
│   • Media Permission Handler  │   • @smartspectra/node-sdk/     │
│                               │     renderer                    │
│                               │   • @smartspectra/node-sdk/     │
│                               │     messages (decodeMetrics)    │
├───────────────────────────────┴─────────────────────────────────┤
│                   SANDBOXED IPC BOUNDARY                        │
│                     src/preload.cjs                             │
│       • contextBridge: window.__smartspectraBridge              │
│       • MessagePort transfers frame buffers (RGBA)              │
│       • Structured-cloned protobuf metric packets               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Prerequisites

- **Operating System:** Windows 10 / 11 (64-bit), Linux x64 (glibc $\ge 2.35$), or macOS Apple Silicon (`darwin-arm64`).
- **Node.js:** $\ge 20.0.0$ (Node 24 LTS recommended).
- **Webcam:** Any standard USB or integrated webcam supporting $1280 \times 720$ at 30 FPS.
- **Presage API Key:** Free developer key from [physiology.presagetech.com](https://physiology.presagetech.com/auth/login).

---

## 6. Installation & Windows PowerShell Setup

Open **PowerShell** as Administrator or standard user and run:

```powershell
# 1. Clone the repository
git clone https://github.com/your-username/humansense-ai.git
cd humansense-ai

# 2. Verify Node.js version (must be >= 20.0.0)
node -v

# 3. Install dependencies
npm install

# 4. Verify Windows x64 native binary payload is installed
Test-Path node_modules/@smartspectra/node-sdk-win32-x64/smartspectra_capi.dll
```

---

## 7. Running HumanSense AI

### Method A: Web Development & Preview Mode
Launches Vite dev server on port 3000:
```powershell
npm run dev
```

### Method B: Native Desktop Electron Application
Launches full native Electron desktop client with Windows C-API Koffi bindings:
```powershell
npm run electron:dev
```

### Method C: Production Web Build
```powershell
npm run build
npm run preview
```

---

## 8. Packaging & Distribution for Windows x64

HumanSense AI is configured with `electron-builder` to bundle the native Windows runtime closure (`smartspectra_capi.dll`, `smartspectra.dll`, `opencv_world4100.dll`, `vulkan-1.dll`, and `graph/` models) into the application directory:

```powershell
# Build Windows Installer (NSIS) and Portable Executable
npm run electron:dist
```

The compiled Windows binaries are emitted to:
```text
release/
├── HumanSense AI Setup 1.0.0.exe  (Installer)
└── HumanSense AI 1.0.0.exe        (Portable standalone)
```

---

## 9. Signal Validation & Clinical Accuracy Standards

The Presage SmartSpectra SDK continuously emits optical validation codes (`validationStatus`) to guide positioning:

| Code | Name | Guidance Description |
|:---:|:---|:---|
| `0` | `kOk` | High signal quality; face and upper chest well positioned. |
| `1` | `kNoFaceFound` | Look directly forward into the camera lens. |
| `2` | `kMultipleFacesFound` | Ensure only one person is within view. |
| `3` | `kFaceNotCentered` | Center face inside the reticle guide. |
| `5` | `kTooDark` | Ambient illumination is too dim; increase lighting. |
| `6` | `kTooBright` | Avoid intense glare or backlighting. |
| `7` | `kChestNotVisible` | Tilt camera down to capture both face and upper torso. |
| `10` | `kCameraTuning` | Webcam auto-exposure and white-balance calibrating. |
| `12` | `kExcessiveMotion` | Hold still; head movement degrades rPPG signal. |
| `13` | `kFaceTooClose` | Move back 20–30 cm from camera lens. |
| `14` | `kFaceTooFar` | Move closer to the webcam. |

---

## 10. Camera Permission & Privacy Disclosures

1. **Explicit Prior Consent:** HumanSense AI never activates the webcam silently. Users must review the consent terms and grant permission before capture starts.
2. **Local Frame Processing:** Video frames are streamed directly to local memory buffers. No raw video or photographs are ever transmitted over the network or saved to disk.
3. **Zero Video Storage:** RAM buffers are cleared immediately after feature extraction.
4. **Cloud Telemetry Opt-Out:** Developer license verification occurs via TLS with Presage servers; diagnostic telemetry is turned off by default (`enableTelemetry: false`).
5. **Instant Hardware Release:** Clicking **Stop Measurement** terminates all media tracks, turning off the physical webcam indicator LED immediately.

---

## 11. Troubleshooting Guide

| Issue | Cause | Solution |
|:---|:---|:---|
| **Vite Koffi Error** | Importing `@smartspectra/node-sdk` root in renderer | Import only from `@smartspectra/node-sdk/renderer` and `@smartspectra/node-sdk/messages`. Check `vite.config.ts`. |
| **`kAuthenticationFailed` (Code 2)** | Missing or invalid API key | Click **Settings** in the header and paste your key from `physiology.presagetech.com`. |
| **`kInputUnavailable` (Code 7)** | Camera is in use by another app | Close Zoom, Teams, or browser tabs using your camera and click **Reset**. |
| **`kChestNotVisible` (Code 7)** | Camera angled too high | Tilt webcam down to frame both chin and upper chest. |
| **`kFrameRateTooLow` (Code 11)** | Frame rate below 24 FPS | Ensure adequate room lighting and close background GPU-intensive apps. |

---

## 12. Technical Demonstration Walkthrough

When presenting HumanSense AI for the challenge:

1. **Introduction:** Introduce HumanSense AI as a contactless physiological vitals desktop app developed for the Presage SmartSpectra Challenge.
2. **SDK Choice:** Explain that the Presage SmartSpectra Node.js SDK (v3.4.0) provides validated optical rPPG algorithms powered by native FFI binaries.
3. **Electron Architecture:** Highlight the strict boundary between the native Electron Main process (managing Koffi, C-API DLLs, and IPC) and the sandboxed React renderer.
4. **Consent Flow:** Demonstrate the explicit consent modal detailing local frame processing and zero video storage.
5. **Live Measurement:** Click **Start Measurement**; show how the alignment reticle turns green as `ValidationCode.kOk` is reported.
6. **Telemetry Updates:** Observe real pulse (BPM), breathing rate (br/min), HRV indices (RMSSD, SDNN, Baevsky), and facial expression kinematics update in real-time.
7. **Safe Teardown:** Click **Stop Measurement** and verify the webcam hardware is instantly released.

---

## License

This application code is licensed under the **Apache License 2.0**.  
The Presage SmartSpectra SDK (`@smartspectra/node-sdk`) and associated native binaries are the proprietary intellectual property of Presage Technologies, Inc.
