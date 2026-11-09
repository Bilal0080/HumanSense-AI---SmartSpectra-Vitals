import React from 'react';
import { Heart, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PulseReading } from '../sdk/types';

interface PulseCardProps {
  pulse: PulseReading;
  isMeasuring: boolean;
}

export const PulseCard: React.FC<PulseCardProps> = ({ pulse, isMeasuring }) => {
  const hasValue = pulse.bpm !== null && isMeasuring;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:border-slate-700/80 transition-all">
      {/* Background accent glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/15 transition" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${
              hasValue
                ? 'bg-rose-950/70 border-rose-800/50 text-rose-400'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
            }`}>
              <Heart className={`h-4 w-4 ${hasValue ? 'animate-pulse fill-rose-500/30' : ''}`} />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wide uppercase">Pulse Rate</h3>
              <p className="text-[10px] text-slate-400 font-mono">rPPG Photoplethysmography</p>
            </div>
          </div>

          {/* Clinical Stability Badge */}
          {hasValue ? (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
                pulse.stable
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'
                  : 'bg-amber-950/70 text-amber-300 border-amber-700/50'
              }`}
            >
              {pulse.stable ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {pulse.stable ? '±3 BPM Locked' : 'Stabilizing'}
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Standby
            </span>
          )}
        </div>

        {/* Main Metric Value */}
        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
              {hasValue ? pulse.bpm : '—'}
            </span>
            <span className="text-sm font-semibold text-slate-400">BPM</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {hasValue ? pulse.statusText : (isMeasuring ? pulse.statusText : 'Waiting for measurement session')}
          </p>
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="pt-3 border-t border-slate-800/80 mt-2 space-y-2">
        {/* Confidence Progress Bar */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Signal Confidence</span>
          <span className="text-white font-mono font-medium">
            {hasValue && pulse.confidence !== null ? `${pulse.confidence}%` : 'N/A'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              pulse.stable ? 'bg-gradient-to-r from-rose-500 to-emerald-400' : 'bg-amber-500'
            }`}
            style={{ width: `${hasValue && pulse.confidence !== null ? Math.min(pulse.confidence, 100) : 0}%` }}
          />
        </div>

        {/* Clinical Note */}
        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-0.5">
          <Activity className="h-3 w-3 text-slate-400 shrink-0" />
          <span>Accredited accuracy standard: ±3 BPM at confidence ≥ 40.</span>
        </div>
      </div>
    </div>
  );
};
