import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Cpu,
  FileText,
  AlertTriangle,
  X,
} from 'lucide-react';

interface PrivacyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyDrawer: React.FC<PrivacyDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-700/50 rounded-xl text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Privacy & Architecture Disclosure</h2>
              <p className="text-xs text-slate-400">Presage SmartSpectra Challenge Compliance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Technical & Privacy Details */}
        <div className="space-y-4 text-xs text-slate-300 max-h-[65vh] overflow-y-auto pr-2">
          {/* Section A */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>1. Local Frame Processing Guarantee</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Video capture frames are transferred directly from the renderer's MediaStream to the Electron main process via sandboxed MessagePort buffers. Native C++ algorithms (OpenCV, Vulkan, and <code className="text-cyan-300 font-mono">smartspectra.dll</code>) process pixel intensity variations locally on your CPU/GPU. <strong>No raw camera video or image frames are ever uploaded to cloud servers.</strong>
            </p>
          </div>

          {/* Section B */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>2. Zero Persistent Video or Media Storage</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              HumanSense AI contains zero file-saving or disk recording mechanisms for video feeds. Each frame is processed in volatile RAM buffers and immediately freed. When you stop capture, camera tracks are terminated instantly.
            </p>
          </div>

          {/* Section C */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Lock className="h-4 w-4 text-indigo-400" />
              <span>3. Cloud Communication & Telemetry Boundary</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The Presage SDK communicates with <code className="text-indigo-300 font-mono">physiology.presagetech.com</code> solely to authenticate your developer API license key upon session startup. Diagnostic telemetry is explicitly disabled by default in HumanSense AI (<code className="text-indigo-300 font-mono">enableTelemetry: false</code>).
            </p>
          </div>

          {/* Section D */}
          <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-semibold">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>4. Algorithmic Facial Analysis Standards</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Facial expression scores are derived from mathematical landmark kinematics (e.g. eyebrow movement, mouth curvature, eyelid aperture). In compliance with ethical AI principles, this software does not claim to detect emotional sincerity, cognitive states, intent, or mental health status.
            </p>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-amber-300 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Investigational & Demonstration Notice</span>
            </div>
            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              HumanSense AI is developed for the Presage SmartSpectra Challenge technical showcase. It is not approved by regulatory medical bodies (FDA, CE) as a medical diagnostic device. Do not use for patient critical care or emergency health decisions.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close Policy
          </button>
        </div>
      </div>
    </div>
  );
};
