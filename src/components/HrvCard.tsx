import React from 'react';
import { Gauge, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { HrvReading } from '../sdk/types';

interface HrvCardProps {
  hrv: HrvReading;
  isMeasuring: boolean;
}

export const HrvCard: React.FC<HrvCardProps> = ({ hrv, isMeasuring }) => {
  const hasValue = (hrv.rmssd !== null || hrv.sdnn !== null) && isMeasuring;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:border-slate-700/80 transition-all">
      {/* Background accent glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/15 transition" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${
              hasValue
                ? 'bg-indigo-950/70 border-indigo-800/50 text-indigo-400'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
            }`}>
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wide uppercase">Heart Rate Variability</h3>
              <p className="text-[10px] text-slate-400 font-mono">Autonomic Nervous System</p>
            </div>
          </div>

          {/* Stability Badge */}
          {hasValue ? (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border ${
                hrv.stable
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/50'
                  : 'bg-amber-950/70 text-amber-300 border-amber-700/50'
              }`}
            >
              {hrv.stable ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {hrv.stable ? '±5 ms Locked' : 'Accumulating'}
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Standby
            </span>
          )}
        </div>

        {/* Primary Metric: RMSSD */}
        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              {hasValue && hrv.rmssd !== null ? hrv.rmssd : '—'}
            </span>
            <span className="text-sm font-semibold text-indigo-300">ms (RMSSD)</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {hasValue ? hrv.statusText : (isMeasuring ? 'Gathering pulse sequence...' : 'Waiting for measurement session')}
          </p>
        </div>

        {/* Secondary HRV Indices Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/70">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-mono">SDNN</span>
            <span className="text-sm font-bold text-white font-mono">
              {hasValue && hrv.sdnn !== null ? `${hrv.sdnn} ms` : '—'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-mono">Mean NN</span>
            <span className="text-sm font-bold text-white font-mono">
              {hasValue && hrv.meanNn !== null ? `${hrv.meanNn} ms` : '—'}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-mono">Baevsky Index</span>
            <span className="text-sm font-bold text-white font-mono">
              {hasValue && hrv.baevsky !== null ? hrv.baevsky : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="pt-3 border-t border-slate-800/80 mt-2 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">HRV Confidence</span>
          <span className="text-white font-mono font-medium">
            {hasValue && hrv.confidence !== null ? `${hrv.confidence}%` : 'N/A'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              hrv.stable ? 'bg-gradient-to-r from-indigo-500 to-emerald-400' : 'bg-amber-500'
            }`}
            style={{ width: `${hasValue && hrv.confidence !== null ? Math.min(hrv.confidence, 100) : 0}%` }}
          />
        </div>

        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-0.5">
          <Info className="h-3 w-3 text-slate-400 shrink-0" />
          <span>RMSSD accuracy target: ±5 ms (confidence ≥ 50 standard).</span>
        </div>
      </div>
    </div>
  );
};
