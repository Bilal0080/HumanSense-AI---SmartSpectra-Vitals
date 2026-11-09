import React from 'react';
import {
  Activity,
  ShieldCheck,
  Settings,
  Terminal,
  Monitor,
  Minus,
  Square,
  X,
  Lock,
} from 'lucide-react';
import type { SessionDiagnostics } from '../sdk/types';

interface HeaderProps {
  diagnostics: SessionDiagnostics;
  apiKey: string;
  onOpenSettings: () => void;
  onOpenPrivacy: () => void;
  onToggleDiagnostics: () => void;
  showDiagnostics: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  diagnostics,
  apiKey,
  onOpenSettings,
  onOpenPrivacy,
  onToggleDiagnostics,
  showDiagnostics,
}) => {
  const isElectron = diagnostics.isElectron;

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) window.electronAPI.minimize();
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) window.electronAPI.maximize();
  };

  const handleClose = () => {
    if (window.electronAPI?.close) window.electronAPI.close();
  };

  // Color mapping for status indicator
  const getStatusColor = () => {
    if (diagnostics.hasError) return 'bg-rose-500 text-rose-300 border-rose-500/40 shadow-rose-500/20';
    if (diagnostics.isMeasuring) return 'bg-emerald-500 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20 animate-pulse';
    if (diagnostics.isInitializing) return 'bg-amber-500 text-amber-300 border-amber-500/40 shadow-amber-500/20';
    if (diagnostics.isStopped) return 'bg-sky-500 text-sky-300 border-sky-500/40 shadow-sky-500/20';
    return 'bg-slate-500 text-slate-300 border-slate-500/40 shadow-slate-500/20';
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 select-none">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Activity className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">HumanSense</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                AI
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Presage SmartSpectra v3.4.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Contactless Physiological Vitals & Facial Kinematics
            </p>
          </div>
        </div>

        {/* Center Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Environment Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <Monitor className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isElectron ? `Desktop Native (${diagnostics.platform || 'x64'})` : 'Browser Preview Engine'}</span>
          </div>

          {/* Pipeline Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <span className={`h-2 w-2 rounded-full shadow-sm ${getStatusColor()}`} />
            <span className="text-slate-200 font-medium">{diagnostics.status}</span>
          </div>

          {/* Credentials Warning Badge if not configured */}
          {!apiKey && (
            <button
              onClick={onOpenSettings}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-600/40 text-[11px] text-amber-300 hover:bg-amber-900/40 transition"
              title="Click to configure Presage SmartSpectra API Key"
            >
              <Lock className="h-3 w-3" />
              <span>API Key Required</span>
            </button>
          )}
        </div>

        {/* Action Controls & Window Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleDiagnostics}
            className={`p-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              showDiagnostics
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Toggle Technical Diagnostics Log"
          >
            <Terminal className="h-4 w-4" />
            <span className="hidden xl:inline">Telemetry</span>
          </button>

          <button
            onClick={onOpenPrivacy}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition flex items-center gap-1.5 text-xs"
            title="Privacy Policy & Consent Details"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="hidden xl:inline">Privacy</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition flex items-center gap-1.5 text-xs"
            title="SDK & Credentials Settings"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden xl:inline">Settings</span>
          </button>

          {/* Native Desktop Window Controls if running inside Electron */}
          {isElectron && (
            <div className="flex items-center border-l border-slate-800 ml-2 pl-2 gap-1">
              <button
                onClick={handleMinimize}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                title="Minimize"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleMaximize}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                title="Maximize"
              >
                <Square className="h-3 w-3" />
              </button>
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-rose-900/80 rounded transition"
                title="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
