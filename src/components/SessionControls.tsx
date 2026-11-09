import React from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Clock,
  Radio,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import type { SessionDiagnostics } from '../sdk/types';

interface SessionControlsProps {
  diagnostics: SessionDiagnostics;
  apiKey: string;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  diagnostics,
  apiKey,
  onStart,
  onStop,
  onReset,
  onOpenSettings,
}) => {
  // Format session duration into mm:ss
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left Status Info */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Session Timer */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800">
          <Clock className={`h-4 w-4 ${diagnostics.isMeasuring ? 'text-cyan-400 animate-spin' : 'text-slate-500'}`} />
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">SESSION DURATION</span>
            <span className="text-sm font-bold font-mono text-white">
              {formatDuration(diagnostics.sessionDurationSec)}
            </span>
          </div>
        </div>

        {/* Live Signal Packet Counter */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800">
          <Radio className={`h-4 w-4 ${diagnostics.isMeasuring ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">PACKETS RECEIVED</span>
            <span className="text-sm font-bold font-mono text-white">
              {diagnostics.packetsReceived}
            </span>
          </div>
        </div>
      </div>

      {/* Center Warning if API key is not configured */}
      {!apiKey && (
        <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-xl">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>No API Key set.</span>
          <button
            onClick={onOpenSettings}
            className="underline font-semibold hover:text-white flex items-center gap-1 ml-1"
          >
            <KeyRound className="h-3 w-3" />
            <span>Configure Key</span>
          </button>
        </div>
      )}

      {/* Right Primary Action Buttons */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        {/* Reset Button */}
        <button
          onClick={onReset}
          disabled={diagnostics.isInitializing}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reset SDK pipeline state"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Start / Stop Toggle */}
        {!diagnostics.isMeasuring ? (
          <button
            onClick={onStart}
            disabled={diagnostics.isInitializing}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>{diagnostics.isInitializing ? 'Starting Pipeline...' : 'Start Measurement'}</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <Square className="h-4 w-4 fill-white" />
            <span>Stop Measurement</span>
          </button>
        )}
      </div>
    </div>
  );
};
