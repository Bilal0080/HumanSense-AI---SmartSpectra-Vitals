import React, { useState } from 'react';
import {
  ShieldAlert,
  Camera,
  CheckCircle2,
  Lock,
  Eye,
  AlertTriangle,
  X,
} from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onConsentGranted: () => void;
  onClose: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onConsentGranted,
  onClose,
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (agreed) {
      onConsentGranted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-200 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950/80 border border-cyan-700/50 rounded-xl text-cyan-400">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Camera & Privacy Consent</h2>
              <p className="text-xs text-slate-400">Presage SmartSpectra Physiological Vitals Processing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Disclosures */}
        <div className="space-y-3.5 text-xs text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <Eye className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">1. What Data Is Processed?</span>
              <p className="text-slate-400 leading-relaxed">
                Live camera frames captured at 1280x720 / 30 FPS are processed in real-time memory by the
                Presage SmartSpectra SDK. <strong>No video or image files are saved, recorded, or written to disk.</strong>
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">2. Vitals Measured</span>
              <p className="text-slate-400 leading-relaxed">
                Contactless pulse (rPPG heart rate in BPM), breathing rate (br/min), heart rate variability (HRV: RMSSD, SDNN, Baevsky Stress Index), and algorithmic facial muscle movement estimates.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <Lock className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">3. Data Transmission & Third Parties</span>
              <p className="text-slate-400 leading-relaxed">
                All video frame processing executes locally via native FFI binaries on your computer. Your Presage API Key is transmitted securely over TLS to verify license authorization with Presage cloud services. Diagnostic telemetry is disabled by default.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">4. Instant Revocation & Safety</span>
              <p className="text-slate-400 leading-relaxed">
                You can stop capture at any second by clicking the red <strong>Stop Measurement</strong> button. All video tracks are immediately stopped and hardware camera indicators will turn off.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-xl text-[11px] text-rose-300 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>
              <strong>Medical Disclaimer:</strong> HumanSense AI is built for technical challenge demonstration and research evaluation. It is not an FDA-cleared medical device and should not be used for emergency, diagnostic, or clinical patient decision-making.
            </span>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/20"
            />
            <span className="text-xs text-slate-200">
              I have read and consent to the real-time processing of my camera feed for physiological vitals analysis under the terms outlined above.
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!agreed}
            className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-lg transition flex items-center gap-2 ${
              agreed
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-cyan-600/25 hover:from-cyan-500 hover:to-indigo-500 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Grant Permission & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
