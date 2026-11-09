/**
 * HumanSense AI - SmartSpectra Type Definitions
 * 
 * Strict typed contracts for physiological metrics, session states,
 * and hardware validation telemetry.
 */

export type ProcessingStatusName =
  | 'Uninitialized'
  | 'Idle'
  | 'Starting'
  | 'Running'
  | 'Stopping'
  | 'Error';

export interface PulseReading {
  bpm: number | null;
  confidence: number | null;
  stable: boolean;
  timestampUs: number | null;
  statusText: string;
}

export interface BreathingReading {
  breathsPerMinute: number | null;
  confidence: number | null;
  stable: boolean;
  timestampUs: number | null;
  statusText: string;
}

export interface HrvReading {
  rmssd: number | null;       // ms
  sdnn: number | null;        // ms
  meanNn: number | null;      // ms
  baevsky: number | null;     // Stress index (unitless)
  confidence: number | null;  // 0 - 100%
  stable: boolean;
  timestampUs: number | null;
  statusText: string;
}

export interface ExpressionScoreItem {
  name: string;
  typeId: number;
  confidence: number;
}

export interface FacialExpressionReading {
  predominant: string | null;
  predominantScore: number | null;
  scores: ExpressionScoreItem[];
  stable: boolean;
  timestampUs: number | null;
  statusText: string;
}

export interface ValidationFeedback {
  code: number;
  name: string;
  hint: string;
  isOk: boolean;
  timestampUs: number;
}

export interface SessionDiagnostics {
  status: ProcessingStatusName;
  statusCode: number;
  isMeasuring: boolean;
  isInitializing: boolean;
  isStopped: boolean;
  hasError: boolean;
  errorMessage: string | null;
  errorCode: number | null;
  isRetryable: boolean;
  framesReceived: number;
  packetsReceived: number;
  sessionDurationSec: number;
  lastPacketTimestamp: string | null;
  isElectron: boolean;
  platform: string;
}

export interface VitalsState {
  pulse: PulseReading;
  breathing: BreathingReading;
  hrv: HrvReading;
  expression: FacialExpressionReading;
  validation: ValidationFeedback;
  pulseHistory: { timestamp: number; bpm: number }[];
  breathingHistory: { timestamp: number; br: number }[];
}
