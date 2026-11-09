import React from 'react';
import { Wind, Waves, CheckCircle2, AlertCircle } from 'lucide-react';
import type { BreathingReading } from '../sdk/types';

interface BreathingCardProps {
  breathing: BreathingReading;
  isMeasuring: boolean;
}

export const BreathingCard: React.FC<BreathingCardProps> = ({ breathing, isMeasuring }) => {
  const hasValue = breathing.breathsPerMinute !== null && isMeasuring;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:border-slate-700/80 transition-all">
      {/* Background accent glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/15 transition" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${
              hasValue
                ? 'bg-cyan-950/70 border-cyan-800/50 text-cyan-400'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
            }`}>
              <Wind className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wide uppercase">Breathing Rate</h3>
              <p className="text-[10px] text-slate-400 font-mono">Thoracic Kinematics</p>
            </div>
          </div>

          {/* Stability Badge */}
          {hasValue ? (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
                breathing.stable
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'
                  : 'bg-amber-950/70 text-amber-300 border-amber-700/50'
              }`}
            >
              {breathing.stable ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {breathing.stable ? '±1 br/min Locked' : 'Calibrating'}
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
              {hasValue ? breathing.breathsPerMinute : '—'}
            </span>
            <span className="text-sm font-semibold text-slate-400">br/min</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {hasValue ? breathing.statusText : (isMeasuring ? breathing.statusText : 'Waiting for measurement session')}
          </p>
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="pt-3 border-t border-slate-800/80 mt-2 space-y-2">
        {/* Confidence Progress Bar */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Respiration Confidence</span>
          <span className="text-white font-mono font-medium">
            {hasValue && breathing.confidence !== null ? `${breathing.confidence}%` : 'N/A'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              breathing.stable ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' : 'bg-amber-500'
            }`}
            style={{ width: `${hasValue && breathing.confidence !== null ? Math.min(breathing.confidence, 100) : 0}%` }}
          />
        </div>

        {/* Clinical Note */}
        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-0.5">
          <Waves className="h-3 w-3 text-slate-400 shrink-0" />
          <span>Requires chest & upper torso within frame (confidence ≥ 45).</span>
        </div>
      </div>
    </div>
  );
};
