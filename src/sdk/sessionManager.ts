/**
 * HumanSense AI - SmartSpectra Session Manager
 * 
 * Orchestrates SDK lifecycle, webcam acquisition, hardware permission checks,
 * metric event routing, and clean resource teardown.
 */

import * as RendererModule from '@smartspectra/node-sdk/renderer';

import { ensureBridgeAvailable, isElectronEnvironment } from './bridgeAdapter.ts';
import { MetricHandler } from './metricHandler.ts';
import { acquireCameraWithFallback } from './cameraHelper.ts';
import {
  breathingMetrics,
  cardioMetrics,
  faceMetrics,
  ProcessingStatus,
  ValidationCode,
  ProcessingStatusNames,
  ValidationMessages,
  ErrorCodeDescriptions,
} from './constants.ts';
import type {
  VitalsState,
  SessionDiagnostics,
  ValidationFeedback,
  PulseReading,
  BreathingReading,
  HrvReading,
  FacialExpressionReading,
} from './types';

// Safely extract SmartSpectraSDK constructor across CJS/ESM interop
const SmartSpectraSDKClass: any =
  (RendererModule as any).SmartSpectraSDK ||
  (RendererModule as any).default?.SmartSpectraSDK ||
  (RendererModule as any).default;

export interface SessionManagerCallbacks {
  onVitalsUpdate: (vitals: Partial<VitalsState>) => void;
  onDiagnosticsUpdate: (diagnostics: Partial<SessionDiagnostics>) => void;
  onStreamAvailable: (stream: MediaStream) => void;
  onError: (errorText: string, isRetryable: boolean) => void;
  onLog: (event: string, details?: any) => void;
}

export class SessionManager {
  private sdk: any = null;
  private activeStream: MediaStream | null = null;
  private callbacks: SessionManagerCallbacks;
  private timerInterval: any = null;
  private sessionStartTime: number = 0;
  private framesCount = 0;
  private packetsCount = 0;
  private isDestroyed = false;

  constructor(callbacks: SessionManagerCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Initializes the SmartSpectra SDK instance with the chosen API key.
   */
  public initialize(apiKey: string = ''): boolean {
    try {
      // Ensure bridge is present (either native Electron preload or web adapter)
      ensureBridgeAvailable();

      if (this.sdk) {
        try {
          this.sdk.destroy();
        } catch {
          // ignore teardown error
        }
        this.sdk = null;
      }

      this.callbacks.onLog('Initializing SmartSpectraSDK', {
        version: SmartSpectraSDKClass?.version || '3.4.0',
        isElectron: isElectronEnvironment(),
        hasKey: Boolean(apiKey),
      });

      // Request Cardio, Breathing, and Face metric bundles
      const requestedMetrics = [
        ...breathingMetrics,
        ...cardioMetrics,
        ...faceMetrics,
      ];

      if (typeof SmartSpectraSDKClass !== 'function') {
        throw new Error('SmartSpectraSDK class constructor could not be resolved from renderer module.');
      }

      this.sdk = new SmartSpectraSDKClass({
        apiKey: apiKey || '',
        requestedMetrics,
        enableTelemetry: false, // Privacy-first default: disable telemetry unless opted-in
        sendTimeoutMs: 15000,
      });

      this.wireEvents();

      this.callbacks.onDiagnosticsUpdate({
        status: 'Idle',
        statusCode: ProcessingStatus.kIdle,
        isStopped: true,
        isMeasuring: false,
        isElectron: isElectronEnvironment(),
        platform: typeof window !== 'undefined' && window.electronAPI?.platform ? window.electronAPI.platform : navigator.platform,
      });

      return true;
    } catch (err: any) {
      console.error('[SessionManager] Initialization failed:', err);
      this.callbacks.onError(err.message || 'Failed to initialize SmartSpectra SDK', false);
      this.callbacks.onDiagnosticsUpdate({
        status: 'Error',
        statusCode: ProcessingStatus.kError,
        hasError: true,
        errorMessage: err.message,
      });
      return false;
    }
  }

  private wireEvents(): void {
    if (!this.sdk) return;

    // 1. Stream Available: The SDK acquired the front-facing webcam
    this.sdk.on('streamAvailable', (stream: MediaStream) => {
      this.activeStream = stream;
      this.callbacks.onLog('Webcam stream acquired by SDK', {
        tracks: stream.getVideoTracks().map(t => t.label),
      });
      this.callbacks.onStreamAvailable(stream);
    });

    // 2. Processing Status: Pipeline state transitions
    this.sdk.on('processingStatus', (statusNumber: number) => {
      const statusName = (ProcessingStatusNames[statusNumber] || 'Unknown') as any;
      this.callbacks.onLog(`Processing status: ${statusName} (${statusNumber})`);

      const isRunning = statusNumber === ProcessingStatus.kRunning;
      const isStarting = statusNumber === ProcessingStatus.kStarting;
      const isStopped = statusNumber === ProcessingStatus.kIdle || statusNumber === ProcessingStatus.kUninitialized;
      const hasError = statusNumber === ProcessingStatus.kError;

      if (isRunning && !this.timerInterval) {
        this.sessionStartTime = Date.now();
        this.timerInterval = setInterval(() => {
          const sec = Math.floor((Date.now() - this.sessionStartTime) / 1000);
          this.callbacks.onDiagnosticsUpdate({ sessionDurationSec: sec });
        }, 1000);
      } else if (!isRunning && this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.callbacks.onDiagnosticsUpdate({
        status: statusName,
        statusCode: statusNumber,
        isMeasuring: isRunning,
        isInitializing: isStarting,
        isStopped,
        hasError,
      });
    });

    // 3. Validation Status: Face & upper-chest alignment telemetry
    this.sdk.on('validationStatus', (code: number, timestampUs: number, hint: string) => {
      const msg = ValidationMessages[code] || {
        title: 'Validation Feedback',
        hint: hint || 'Follow on-screen positioning guidance.',
      };

      const feedback: ValidationFeedback = {
        code,
        name: msg.title,
        hint: hint || msg.hint,
        isOk: code === ValidationCode.kOk,
        timestampUs,
      };

      this.callbacks.onVitalsUpdate({ validation: feedback });
    });

    // 4. Metrics: Decoded physiological signals
    this.sdk.on('metrics', (buf: Uint8Array, timestampUs: number) => {
      this.packetsCount++;
      const decoded = MetricHandler.decode(buf);

      if (!decoded) return;

      const pulse = MetricHandler.extractPulse(decoded);
      const breathing = MetricHandler.extractBreathing(decoded);
      const hrv = MetricHandler.extractHrv(decoded);
      const expression = MetricHandler.extractExpression(decoded);

      const updatePayload: Partial<VitalsState> = {
        pulse,
        breathing,
        hrv,
        expression,
      };

      this.callbacks.onVitalsUpdate(updatePayload);
      this.callbacks.onDiagnosticsUpdate({
        packetsReceived: this.packetsCount,
        lastPacketTimestamp: new Date().toLocaleTimeString(),
      });
    });

    // 5. Frame Throughput: Video frame delivery acknowledgement
    this.sdk.on('frameSentThrough', (sent: boolean, ts: number) => {
      if (sent) {
        this.framesCount++;
        if (this.framesCount % 30 === 0) {
          this.callbacks.onDiagnosticsUpdate({ framesReceived: this.framesCount });
        }
      }
    });

    // 6. Error handling
    this.sdk.on('error', (code: number, message: string, retryable: boolean) => {
      const errorExplanation = ErrorCodeDescriptions[code] || message;
      console.error(`[SmartSpectra Error ${code}]`, message);

      this.callbacks.onLog(`SDK Error ${code}: ${message}`, { retryable });
      this.callbacks.onError(`${errorExplanation} (${message})`, retryable);

      this.callbacks.onDiagnosticsUpdate({
        hasError: true,
        errorMessage: `${errorExplanation}: ${message}`,
        errorCode: code,
        isRetryable: retryable,
      });
    });
  }

  /**
   * Starts vitals measurement session with resilient camera acquisition.
   */
  public async start(): Promise<void> {
    if (!this.sdk) {
      this.initialize('');
    }

    this.framesCount = 0;
    this.packetsCount = 0;
    this.callbacks.onLog('Acquiring camera input...');

    try {
      // Robust camera acquisition: tries hardware 720p -> generic video -> biometric simulation
      const { stream, isSimulated, deviceName } = await acquireCameraWithFallback();
      this.activeStream = stream;
      this.callbacks.onStreamAvailable(stream);
      this.callbacks.onLog(`Camera active: ${deviceName}`, { isSimulated });

      if (this.sdk && typeof this.sdk.useMediaStream === 'function') {
        this.sdk.useMediaStream(stream);
      }

      await this.sdk.start();
    } catch (err: any) {
      console.error('[SessionManager] start() failed:', err);
      this.callbacks.onError(`Session start failed: ${err.message || err}`, true);
      throw err;
    }
  }

  /**
   * Stops vitals measurement session and releases camera hardware.
   */
  public async stop(): Promise<void> {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (this.sdk) {
      try {
        this.callbacks.onLog('Stopping measurement session...');
        await this.sdk.stop();
      } catch (err: any) {
        console.warn('[SessionManager] stop() warning:', err);
      }
    }

    // Explicitly release any webcam media tracks
    this.releaseCamera();

    this.callbacks.onDiagnosticsUpdate({
      isMeasuring: false,
      isStopped: true,
      status: 'Idle',
      statusCode: ProcessingStatus.kIdle,
    });
  }

  /**
   * Rebuilds the processing pipeline after an error.
   */
  public async reset(): Promise<void> {
    if (this.sdk) {
      try {
        this.callbacks.onLog('Resetting SDK pipeline...');
        await this.sdk.reset();
      } catch (err: any) {
        console.warn('[SessionManager] reset() error:', err);
      }
    }
    this.releaseCamera();
  }

  /**
   * Releases hardware camera stream tracks.
   */
  public releaseCamera(): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => {
        try {
          track.stop();
          console.log(`[SessionManager] Released camera track: ${track.label}`);
        } catch {
          // ignore
        }
      });
      this.activeStream = null;
    }
  }

  /**
   * Complete destruction of SDK resources.
   */
  public async destroy(): Promise<void> {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.releaseCamera();

    if (this.sdk) {
      try {
        this.sdk.destroy();
      } catch (err) {
        console.warn('[SessionManager] destroy() error:', err);
      }
      this.sdk = null;
    }
  }
}
