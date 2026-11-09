import React, { useState } from 'react';
import {
  Settings,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  X,
  Sliders,
  Shield,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  apiKey,
  onSaveApiKey,
  onClose,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [enableTelemetry, setEnableTelemetry] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-cyan-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">SmartSpectra Settings</h2>
              <p className="text-xs text-slate-400">API Credentials & Pipeline Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="space-y-4">
          {/* API Key Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                <span>Presage API Key</span>
              </span>
              <a
                href="https://physiology.presagetech.com/auth/login"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <span>Get API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </label>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter your Presage API Key (e.g. psg_live_...)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              API credentials are stored exclusively in your local application session and are never exposed to public repositories.
            </p>
          </div>

          {/* Requested Metric Bundles */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sliders className="h-3.5 w-3.5 text-indigo-400" />
              <span>Configured Metric Bundles (Official SDK 3.4.0)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>cardioMetrics (Pulse, HRV)</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>breathingMetrics (Rate, Trace)</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <span>faceMetrics (Expressions, Blinking)</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-400">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span>Landmarks & Kinematics</span>
              </div>
            </div>
          </div>

          {/* Privacy & Telemetry Toggle */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableTelemetry}
                onChange={(e) => setEnableTelemetry(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20"
              />
              <div>
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Send SDK Aggregate Diagnostics Telemetry</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Disabled by default. When enabled, anonymized pipeline latency statistics are shared with Presage to improve model performance.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-indigo-500 transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{savedSuccess ? 'Saved!' : 'Save Credentials'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
