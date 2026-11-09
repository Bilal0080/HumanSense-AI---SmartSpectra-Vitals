/**
 * HumanSense AI - Presage SmartSpectra Metric Decoder & Handler
 * 
 * Strictly parses decoded protobuf metrics emitted by the SDK without
 * fabricating any data, random values, or synthetic numbers.
 * 
 * Clinical Reference Standards:
 * - Pulse Rate: Stable at confidence >= 40 (+/- 3 bpm accepted accuracy)
 * - Breathing Rate: Stable at confidence >= 45 (+/- 1 br/min accepted accuracy)
 * - Heart Rate Variability (HRV): Stable at confidence >= 50 (+/- 5 ms accuracy)
 * - Facial Expression: Algorithmic facial-expression movement scores [0-100%]
 */

import * as MessagesModule from '@smartspectra/node-sdk/messages';
import { ExpressionTypeNames } from './constants.ts';
import type {
  PulseReading,
  BreathingReading,
  HrvReading,
  FacialExpressionReading,
  ExpressionScoreItem,
} from './types';

const decodeMetricsFn =
  (MessagesModule as any).decodeMetrics ||
  (MessagesModule as any).default?.decodeMetrics ||
  (MessagesModule as any).default;

export class MetricHandler {
  /**
   * Safely decodes a binary protobuf buffer received from SDK 'metrics' event.
   */
  static decode(buffer: Uint8Array | ArrayBuffer): any {
    try {
      const decoded = decodeMetricsFn ? decodeMetricsFn(buffer) : null;
      return decoded;
    } catch (err) {
      console.error('[MetricHandler] Failed to decode protobuf buffer:', err);
      return null;
    }
  }

  /**
   * Extracts Pulse / Heart Rate strictly from decoded cardio metrics.
   */
  static extractPulse(decoded: any): PulseReading {
    const pulseList = decoded?.cardio?.pulseRate;

    if (!pulseList || !Array.isArray(pulseList) || pulseList.length === 0) {
      return {
        bpm: null,
        confidence: null,
        stable: false,
        timestampUs: null,
        statusText: 'Waiting for measurement',
      };
    }

    // Pick the most recent pulse rate measurement in the packet
    const latest = pulseList[pulseList.length - 1];
    const rawValue = typeof latest?.value === 'number' ? Math.round(latest.value) : null;
    const confidence = typeof latest?.confidence === 'number' ? Math.round(latest.confidence) : null;
    const stable = Boolean(latest?.stable ?? (confidence !== null && confidence >= 40));
    const timestampUs = typeof latest?.timestamp === 'number' ? latest.timestamp : null;

    let statusText = 'Measurement active';
    if (rawValue === null) {
      statusText = 'Waiting for measurement';
    } else if (!stable) {
      statusText = 'Insufficient signal quality';
    } else {
      statusText = 'Signal locked (±3 BPM)';
    }

    return {
      bpm: rawValue,
      confidence,
      stable,
      timestampUs,
      statusText,
    };
  }

  /**
   * Extracts Breathing Rate from decoded respiratory metrics.
   */
  static extractBreathing(decoded: any): BreathingReading {
    const rateList = decoded?.breathing?.rate;

    if (!rateList || !Array.isArray(rateList) || rateList.length === 0) {
      return {
        breathsPerMinute: null,
        confidence: null,
        stable: false,
        timestampUs: null,
        statusText: 'Waiting for measurement',
      };
    }

    const latest = rateList[rateList.length - 1];
    const rawValue = typeof latest?.value === 'number' ? Math.round(latest.value * 10) / 10 : null;
    const confidence = typeof latest?.confidence === 'number' ? Math.round(latest.confidence) : null;
    const stable = Boolean(latest?.stable ?? (confidence !== null && confidence >= 45));
    const timestampUs = typeof latest?.timestamp === 'number' ? latest.timestamp : null;

    let statusText = 'Measuring respiration';
    if (rawValue === null) {
      statusText = 'Waiting for measurement';
    } else if (!stable) {
      statusText = 'Insufficient signal quality';
    } else {
      statusText = 'Respiration locked (±1 br/min)';
    }

    return {
      breathsPerMinute: rawValue,
      confidence,
      stable,
      timestampUs,
      statusText,
    };
  }

  /**
   * Extracts Heart Rate Variability (HRV) metrics.
   * Units:
   * - rmssd: ms
   * - sdnn: ms
   * - meanNn: ms
   * - baevsky: unitless Stress Index
   */
  static extractHrv(decoded: any): HrvReading {
    const hrvList = decoded?.cardio?.hrv;

    if (!hrvList || !Array.isArray(hrvList) || hrvList.length === 0) {
      return {
        rmssd: null,
        sdnn: null,
        meanNn: null,
        baevsky: null,
        confidence: null,
        stable: false,
        timestampUs: null,
        statusText: 'Waiting for measurement',
      };
    }

    const latest = hrvList[hrvList.length - 1];
    const rmssd = typeof latest?.rmssd === 'number' ? Math.round(latest.rmssd * 10) / 10 : null;
    const sdnn = typeof latest?.sdnn === 'number' ? Math.round(latest.sdnn * 10) / 10 : null;
    const meanNn = typeof latest?.meanNn === 'number' ? Math.round(latest.meanNn * 10) / 10 : null;
    const baevsky = typeof latest?.baevsky === 'number' ? Math.round(latest.baevsky * 10) / 10 : null;
    const confidence = typeof latest?.confidence === 'number' ? Math.round(latest.confidence) : null;
    const stable = Boolean(latest?.stable ?? (confidence !== null && confidence >= 50));
    const timestampUs = typeof latest?.timestamp === 'number' ? latest.timestamp : null;

    let statusText = 'Analyzing pulse wave';
    if (rmssd === null && sdnn === null) {
      statusText = 'Waiting for measurement';
    } else if (!stable) {
      statusText = 'Insufficient signal quality';
    } else {
      statusText = 'HRV calculated (±5 ms)';
    }

    return {
      rmssd,
      sdnn,
      meanNn,
      baevsky,
      confidence,
      stable,
      timestampUs,
      statusText,
    };
  }

  /**
   * Extracts Facial Expression estimates strictly from face metrics.
   * Note: These are algorithmic estimates of facial muscle movement patterns,
   * NOT emotional or psychological assessments.
   */
  static extractExpression(decoded: any): FacialExpressionReading {
    const expressionList = decoded?.face?.expression;

    if (!expressionList || !Array.isArray(expressionList) || expressionList.length === 0) {
      return {
        predominant: null,
        predominantScore: null,
        scores: [],
        stable: false,
        timestampUs: null,
        statusText: 'Face not detected',
      };
    }

    const latest = expressionList[expressionList.length - 1];
    const rawScores = latest?.scores || [];
    const stable = Boolean(latest?.stable);
    const timestampUs = typeof latest?.timestamp === 'number' ? latest.timestamp : null;

    const scores: ExpressionScoreItem[] = [];
    let topName: string | null = null;
    let topScore = -1;

    for (const item of rawScores) {
      const typeId = typeof item?.type === 'number' ? item.type : 0;
      const name = ExpressionTypeNames[typeId] || 'Unspecified';
      const conf = typeof item?.confidence === 'number' ? Math.round(item.confidence) : 0;

      scores.push({ name, typeId, confidence: conf });

      if (conf > topScore) {
        topScore = conf;
        topName = name;
      }
    }

    // Sort by confidence descending
    scores.sort((a, b) => b.confidence - a.confidence);

    let statusText = 'Expression tracked';
    if (scores.length === 0) {
      statusText = 'Waiting for measurement';
    } else if (!stable) {
      statusText = 'Algorithmic estimate (low confidence)';
    } else {
      statusText = 'Facial muscle kinematics locked';
    }

    return {
      predominant: topName,
      predominantScore: topScore >= 0 ? topScore : null,
      scores,
      stable,
      timestampUs,
      statusText,
    };
  }
}
