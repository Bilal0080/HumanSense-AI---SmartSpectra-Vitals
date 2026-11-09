import React from 'react';
import { Smile, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import type { FacialExpressionReading } from '../sdk/types';

interface FacialExpressionCardProps {
  expression: FacialExpressionReading;
  isMeasuring: boolean;
}

export const FacialExpressionCard: React.FC<FacialExpressionCardProps> = ({
  expression,
  isMeasuring,
}) => {
  const hasValue = expression.scores.length > 0 && isMeasuring;

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between group hover:border-slate-700/80 transition-all">
      {/* Background accent glow */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/15 transition" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl border ${
              hasValue
                ? 'bg-emerald-950/70 border-emerald-800/50 text-emerald-400'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-400'
            }`}>
              <Smile className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wide uppercase">Facial Expression</h3>
              <p className="text-[10px] text-slate-400 font-mono">Muscle Kinematics Classification</p>
            </div>
          </div>

          {/* Predominant Tag */}
          {hasValue && expression.predominant ? (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>{expression.predominant}</span>
              {expression.predominantScore !== null && (
                <span className="text-[10px] font-mono text-emerald-400/80">({expression.predominantScore}%)</span>
              )}
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Standby
            </span>
          )}
        </div>

        {/* Status text */}
        <p className="text-xs text-slate-400 mb-3">
          {hasValue ? expression.statusText : (isMeasuring ? expression.statusText : 'Waiting for face capture')}
        </p>

        {/* Expression Distribution Bars */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {hasValue ? (
            expression.scores.slice(0, 5).map((item) => (
              <div key={item.name} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-medium ${
                    item.name === expression.predominant ? 'text-emerald-300' : 'text-slate-300'
                  }`}>
                    {item.name}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{item.confidence}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800/90 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.name === expression.predominant
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                        : 'bg-slate-700'
                    }`}
                    style={{ width: `${Math.min(item.confidence, 100)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <UserCheck className="h-6 w-6 text-slate-600 mb-1" />
              <span className="text-xs text-slate-500">No expression distribution available</span>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Algorithmic & Ethical Disclaimer (Section 6.D) */}
      <div className="pt-3 border-t border-slate-800/80 mt-3">
        <div className="p-2 bg-slate-950/70 border border-slate-800 rounded-xl text-[10px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
          <ShieldAlert className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
          <span>
            <strong>Algorithmic Notice:</strong> Estimates represent facial muscle movement patterns. Does not detect true internal emotions, mental health, intentions, or personality traits.
          </span>
        </div>
      </div>
    </div>
  );
};
