import React, { useRef, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  EyeOff,
  Sun,
  Maximize2,
  Move,
  RefreshCw,
  VideoOff,
} from 'lucide-react';
import type { ValidationFeedback, SessionDiagnostics } from '../sdk/types';
import { ValidationCode } from '../sdk/constants';

interface CameraViewProps {
  stream: MediaStream | null;
  validation: ValidationFeedback;
  diagnostics: SessionDiagnostics;
  onStartClick: () => void;
  consentGranted: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  stream,
  validation,
  diagnostics,
  onStartClick,
  consentGranted,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn('[CameraView] Video play error:', err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  // Determine alignment guide border color based on validation code
  const getGuideColor = () => {
    if (!diagnostics.isMeasuring) return 'border-slate-700/60 stroke-slate-600/40';
    if (validation.code === ValidationCode.kOk) return 'border-emerald-400/80 stroke-emerald-400 text-emerald-400 shadow-emerald-500/20';
    if (
      validation.code === ValidationCode.kNoFaceFound ||
      validation.code === ValidationCode.kMultipleFacesFound ||
      validation.code === ValidationCode.kFaceTooClose ||
      validation.code === ValidationCode.kExcessiveMotion
    ) {
      return 'border-rose-400/80 stroke-rose-400 text-rose-400 shadow-rose-500/20';
    }
    return 'border-amber-400/80 stroke-amber-400 text-amber-400 shadow-amber-500/20';
  };

  const getValidationIcon = () => {
    if (validation.code === ValidationCode.kOk) {
      return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
    }
    if (validation.code === ValidationCode.kNoFaceFound) {
      return <EyeOff className="h-4 w-4 text-rose-400 shrink-0" />;
    }
    if (validation.code === ValidationCode.kTooDark || validation.code === ValidationCode.kTooBright) {
      return <Sun className="h-4 w-4 text-amber-400 shrink-0" />;
    }
    if (validation.code === ValidationCode.kExcessiveMotion) {
      return <Move className="h-4 w-4 text-amber-400 shrink-0" />;
    }
    return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
  };

  return (
    <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between aspect-[16/10] w-full group">
      {/* Background/Stream Container */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
            <div className="h-16 w-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
              <VideoOff className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Camera Feed Inactive</h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">
              {consentGranted
                ? 'Camera stream is stopped. Click Start Measurement below to acquire webcam.'
                : 'Camera permission and privacy consent required before acquiring hardware feed.'}
            </p>
            <button
              onClick={onStartClick}
              disabled={diagnostics.isInitializing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 hover:from-cyan-500 hover:to-indigo-500 transition flex items-center gap-2 cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{diagnostics.isInitializing ? 'Initializing SDK...' : 'Start Camera & Vitals'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Alignment Overlay Guide (Shown during active streaming) */}
      {stream && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 pointer-events-none" />

          {/* Biometric Placement Reticle */}
          <div className="relative flex flex-col items-center">
            {/* Face Oval Reticle */}
            <div
              className={`w-44 h-56 rounded-[50%] border-2 border-dashed transition-all duration-300 flex items-center justify-center ${getGuideColor()}`}
            >
              {/* Center Crosshair */}
              <div className="w-2 h-2 rounded-full bg-cyan-400/60" />
            </div>

            {/* Upper Chest indicator line */}
            <div className="w-64 h-16 border-t-2 border-dashed border-cyan-400/40 rounded-t-3xl mt-2 flex justify-center">
              <span className="text-[10px] text-cyan-300/80 bg-slate-950/80 px-2 py-0.5 rounded-full border border-cyan-800/40 -translate-y-2.5">
                Include Upper Chest for Breathing
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Overlay Bar */}
      <div className="relative z-10 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-white">
            <span
              className={`h-2 w-2 rounded-full ${
                stream ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="font-medium font-mono">
              {stream ? '1280x720 • 30 FPS' : 'STANDBY'}
            </span>
          </div>

          {diagnostics.isMeasuring && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/70 backdrop-blur-md border border-cyan-700/50 text-[11px] text-cyan-300">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>rPPG Signal Pipeline</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-300 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 font-mono">
          Frames: {diagnostics.framesReceived}
        </div>
      </div>

      {/* Bottom Live Validation Status Banner */}
      {stream && (
        <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <div
            className={`p-2.5 rounded-xl backdrop-blur-md border flex items-center gap-2.5 transition-all ${
              validation.code === ValidationCode.kOk
                ? 'bg-emerald-950/70 border-emerald-700/50 text-emerald-200'
                : 'bg-slate-900/90 border-slate-700/60 text-slate-200'
            }`}
          >
            {getValidationIcon()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-tight text-white">
                  {validation.name || 'Positioning Verification'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Code: {validation.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {validation.hint || 'Align your face inside the central oval frame.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
