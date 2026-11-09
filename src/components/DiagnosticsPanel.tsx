import React from 'react';
import {
  Terminal,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Cpu,
  Layers,
  X,
} from 'lucide-react';
import type { SessionDiagnostics } from '../sdk/types';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  details?: any;
  type?: 'info' | 'warn' | 'error';
}

interface DiagnosticsPanelProps {
  isOpen: boolean;
  diagnostics: SessionDiagnostics;
  logs: LogEntry[];
  onClearLogs: () => void;
  onClose: () => void;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  isOpen,
  diagnostics,
  logs,
  onClearLogs,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="rounded-2xl bg-slate-950/95 border border-slate-800 p-4 shadow-2xl backdrop-blur-md mb-6 animate-in slide-in-from-top-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            SmartSpectra SDK Diagnostics & IPC Telemetry
          </span>
          <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            Node FFI v3.4.0
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition text-[11px] flex items-center gap-1 font-mono"
            title="Clear logs"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hardware / Environment Spec Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px] font-mono">
        <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">ENVIRONMENT</span>
          <span className="text-white font-semibold flex items-center gap-1">
            <Cpu className="h-3 w-3 text-cyan-400" />
            {diagnostics.isElectron ? 'Desktop Electron' : 'Web Preview Engine'}
          </span>
        </div>

        <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">PLATFORM ARCH</span>
          <span className="text-white font-semibold">
            {diagnostics.platform || 'win32-x64'}
          </span>
        </div>

        <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">TOTAL FRAMES</span>
          <span className="text-cyan-400 font-semibold">
            {diagnostics.framesReceived}
          </span>
        </div>

        <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">METRIC PACKETS</span>
          <span className="text-emerald-400 font-semibold">
            {diagnostics.packetsReceived}
          </span>
        </div>
      </div>

      {/* Real-time Log Stream */}
      <div className="h-40 overflow-y-auto bg-black/60 rounded-xl p-2.5 border border-slate-800/80 font-mono text-[11px] space-y-1">
        {logs.length === 0 ? (
          <div className="text-slate-600 text-center py-8">
            No telemetry events recorded yet. Click Start Measurement to begin.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
              <span className={`shrink-0 font-bold ${
                log.type === 'error' ? 'text-rose-400' : log.type === 'warn' ? 'text-amber-400' : 'text-cyan-400'
              }`}>
                [{log.type ? log.type.toUpperCase() : 'INFO'}]
              </span>
              <span className="text-slate-300 break-all">{log.message}</span>
              {log.details && (
                <span className="text-slate-500 text-[10px]">
                  {JSON.stringify(log.details)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
