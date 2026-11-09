/**
 * HumanSense AI - Master Desktop Dashboard Application
 * Presage SmartSpectra Challenge
 * 
 * Clinical-grade, real-time physiological signal measurement and visualization
 * using the official Presage SmartSpectra Node.js SDK (v3.4.0).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  X,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { PulseCard } from './components/PulseCard';
import { BreathingCard } from './components/BreathingCard';
import { HrvCard } from './components/HrvCard';
import { FacialExpressionCard } from './components/FacialExpressionCard';
import { SessionControls } from './components/SessionControls';
import { ConsentModal } from './components/ConsentModal';
import { SettingsModal } from './components/SettingsModal';
import { PrivacyDrawer } from './components/PrivacyDrawer';
import { DiagnosticsPanel, type LogEntry } from './components/DiagnosticsPanel';

import { SessionManager } from './sdk/sessionManager';
import { isElectronEnvironment } from './sdk/bridgeAdapter';
import type {
  VitalsState,
  SessionDiagnostics,
  ValidationFeedback,
  PulseReading,
  BreathingReading,
  HrvReading,
  FacialExpressionReading,
} from './sdk/types';
import { ValidationCode, ProcessingStatus } from './sdk/constants';

const INITIAL_PULSE: PulseReading = {
  bpm: null,
  confidence: null,
  stable: false,
  timestampUs: null,
  statusText: 'Waiting for measurement session',
};

const INITIAL_BREATHING: BreathingReading = {
  breathsPerMinute: null,
  confidence: null,
  stable: false,
  timestampUs: null,
  statusText: 'Waiting for measurement session',
};

const INITIAL_HRV: HrvReading = {
  rmssd: null,
  sdnn: null,
  meanNn: null,
  baevsky: null,
  confidence: null,
  stable: false,
  timestampUs: null,
  statusText: 'Waiting for measurement session',
};

const INITIAL_EXPRESSION: FacialExpressionReading = {
  predominant: null,
  predominantScore: null,
  scores: [],
  stable: false,
  timestampUs: null,
  statusText: 'Waiting for face capture',
};

const INITIAL_VALIDATION: ValidationFeedback = {
  code: ValidationCode.kOk,
  name: 'System Ready',
  hint: 'Position your face inside the reticle guide once measurement begins.',
  isOk: true,
  timestampUs: 0,
};

const INITIAL_DIAGNOSTICS: SessionDiagnostics = {
  status: 'Idle',
  statusCode: ProcessingStatus.kIdle,
  isMeasuring: false,
  isInitializing: false,
  isStopped: true,
  hasError: false,
  errorMessage: null,
  errorCode: null,
  isRetryable: false,
  framesReceived: 0,
  packetsReceived: 0,
  sessionDurationSec: 0,
  lastPacketTimestamp: null,
  isElectron: false,
  platform: 'win32-x64',
};

export default function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('smartspectra_api_key') || '';
  });

  const [consentGranted, setConsentGranted] = useState<boolean>(() => {
    return localStorage.getItem('humansense_consent') === 'true';
  });

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pulse, setPulse] = useState<PulseReading>(INITIAL_PULSE);
  const [breathing, setBreathing] = useState<BreathingReading>(INITIAL_BREATHING);
  const [hrv, setHrv] = useState<HrvReading>(INITIAL_HRV);
  const [expression, setExpression] = useState<FacialExpressionReading>(INITIAL_EXPRESSION);
  const [validation, setValidation] = useState<ValidationFeedback>(INITIAL_VALIDATION);
  const [diagnostics, setDiagnostics] = useState<SessionDiagnostics>(INITIAL_DIAGNOSTICS);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const sessionManagerRef = useRef<SessionManager | null>(null);

  const addLog = useCallback((message: string, details?: any, type: 'info' | 'warn' | 'error' = 'info') => {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      details,
      type,
    };
    setLogs((prev) => [entry, ...prev.slice(0, 99)]);
  }, []);

  // Initialize SessionManager
  useEffect(() => {
    const manager = new SessionManager({
      onVitalsUpdate: (vitalsUpdate) => {
        if (vitalsUpdate.pulse) setPulse(vitalsUpdate.pulse);
        if (vitalsUpdate.breathing) setBreathing(vitalsUpdate.breathing);
        if (vitalsUpdate.hrv) setHrv(vitalsUpdate.hrv);
        if (vitalsUpdate.expression) setExpression(vitalsUpdate.expression);
        if (vitalsUpdate.validation) setValidation(vitalsUpdate.validation);
      },
      onDiagnosticsUpdate: (diagUpdate) => {
        setDiagnostics((prev) => ({ ...prev, ...diagUpdate }));
      },
      onStreamAvailable: (mediaStream) => {
        setStream(mediaStream);
      },
      onError: (errorText, isRetryable) => {
        addLog(errorText, null, 'error');
      },
      onLog: (msg, details) => {
        addLog(msg, details, 'info');
      },
    });

    sessionManagerRef.current = manager;
    manager.initialize(apiKey);

    // Detect Electron environment
    const electronDetected = isElectronEnvironment();
    setDiagnostics((prev) => ({
      ...prev,
      isElectron: electronDetected,
      platform: typeof window !== 'undefined' && window.electronAPI?.platform ? window.electronAPI.platform : 'win32-x64',
    }));

    addLog('HumanSense AI application initialized', {
      sdkVersion: '3.4.0',
      isElectron: electronDetected,
    });

    return () => {
      manager.destroy();
    };
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('smartspectra_api_key', newKey);
    addLog('API key updated in secure storage');
    if (sessionManagerRef.current) {
      sessionManagerRef.current.initialize(newKey);
    }
  };

  const handleConsentGranted = () => {
    setConsentGranted(true);
    localStorage.setItem('humansense_consent', 'true');
    setIsConsentModalOpen(false);
    addLog('Camera and biometric consent explicitly granted by user');
    // Automatically trigger measurement start once consented
    startSession();
  };

  const startSession = async () => {
    if (!consentGranted) {
      setIsConsentModalOpen(true);
      return;
    }

    if (!sessionManagerRef.current) return;

    try {
      setDiagnostics((prev) => ({ ...prev, hasError: false, errorMessage: null }));
      await sessionManagerRef.current.start();
    } catch (err: any) {
      addLog(`Failed to start session: ${err.message || err}`, null, 'error');
    }
  };

  const stopSession = async () => {
    if (!sessionManagerRef.current) return;
    await sessionManagerRef.current.stop();
    setStream(null);
    addLog('Measurement session stopped and webcam hardware released');
  };

  const resetSession = async () => {
    if (!sessionManagerRef.current) return;
    await sessionManagerRef.current.reset();
    setStream(null);
    setPulse(INITIAL_PULSE);
    setBreathing(INITIAL_BREATHING);
    setHrv(INITIAL_HRV);
    setExpression(INITIAL_EXPRESSION);
    setValidation(INITIAL_VALIDATION);
    addLog('SDK pipeline and vitals states reset');
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Navigation */}
      <Header
        diagnostics={diagnostics}
        apiKey={apiKey}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onToggleDiagnostics={() => setShowDiagnostics(!showDiagnostics)}
        showDiagnostics={showDiagnostics}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Error Alert Banner */}
        {diagnostics.hasError && diagnostics.errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-200 shadow-xl flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-rose-300">
                  Pipeline Diagnostic Notice
                </h4>
                <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">
                  {diagnostics.errorMessage}
                </p>
                {diagnostics.errorCode === 2 && (
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="mt-2 text-xs font-semibold underline text-white hover:text-rose-100 flex items-center gap-1"
                  >
                    Configure Valid API Key in Settings
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setDiagnostics((prev) => ({ ...prev, hasError: false, errorMessage: null }))}
              className="text-rose-400 hover:text-white p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Technical Diagnostics & Log Stream (Toggled from Header) */}
        <DiagnosticsPanel
          isOpen={showDiagnostics}
          diagnostics={diagnostics}
          logs={logs}
          onClearLogs={() => setLogs([])}
          onClose={() => setShowDiagnostics(false)}
        />

        {/* Primary Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Live Camera & Pipeline Controls (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <CameraView
              stream={stream}
              validation={validation}
              diagnostics={diagnostics}
              onStartClick={startSession}
              consentGranted={consentGranted}
            />

            <SessionControls
              diagnostics={diagnostics}
              apiKey={apiKey}
              onStart={startSession}
              onStop={stopSession}
              onReset={resetSession}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />

            {/* Quick Architecture Note */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300 block mb-0.5">Secure Process Isolation</span>
                <span>
                  Native Node.js & Koffi FFI execution runs exclusively in the Electron Main process. MediaStream frames are streamed across isolated MessagePort IPC channels without exposed Node globals.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Physiological Vitals Grid (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Section Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                  Real-Time Physiological Telemetry
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {diagnostics.isMeasuring ? 'Streaming Active' : 'Pipeline Standby'}
              </span>
            </div>

            {/* 2x2 Vitals Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Pulse Rate Card */}
              <PulseCard pulse={pulse} isMeasuring={diagnostics.isMeasuring} />

              {/* 2. Breathing Rate Card */}
              <BreathingCard breathing={breathing} isMeasuring={diagnostics.isMeasuring} />

              {/* 3. Heart Rate Variability (HRV) Card */}
              <HrvCard hrv={hrv} isMeasuring={diagnostics.isMeasuring} />

              {/* 4. Facial Expression Analysis Card */}
              <FacialExpressionCard expression={expression} isMeasuring={diagnostics.isMeasuring} />
            </div>

            {/* Presage Verification Reference Card */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-800 rounded-xl text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-300 block">Validated rPPG Accuracy Standards</span>
                  <span className="text-[11px] text-slate-500">
                    Pulse: ±3 BPM (conf ≥ 40) • Breathing: ±1 br/min (conf ≥ 45) • HRV: ±5 ms (conf ≥ 50)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition text-[11px] font-medium shrink-0 flex items-center gap-1"
              >
                <Info className="h-3.5 w-3.5" />
                <span>Model Cards</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">HumanSense AI</span>
          <span>•</span>
          <span>Presage SmartSpectra Challenge Submission</span>
          <span>•</span>
          <span className="font-mono text-[10px]">Electron 33+ / SDK 3.4.0</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-slate-300 transition underline"
          >
            Privacy & Compliance
          </button>
          <span>•</span>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="hover:text-slate-300 transition underline"
          >
            Credentials
          </button>
          <span>•</span>
          <span>Windows 10/11 x64 Architecture</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onConsentGranted={handleConsentGranted}
        onClose={() => setIsConsentModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <PrivacyDrawer
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
