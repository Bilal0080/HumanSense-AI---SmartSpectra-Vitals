/**
 * HumanSense AI - SmartSpectra Constants & Dictionaries
 * 
 * Clinical-grade metric codes, validation telemetry dictionaries,
 * and error code descriptions matching official SmartSpectra C++ wire values.
 */

// Official Presage SmartSpectra Status Values
export const ProcessingStatus = Object.freeze({
  kUninitialized: 0,
  kIdle: 1,
  kStarting: 2,
  kRunning: 3,
  kStopping: 4,
  kError: 5,
} as const);

export type ProcessingStatusCode = (typeof ProcessingStatus)[keyof typeof ProcessingStatus];

// Official Presage SmartSpectra Optical Validation Codes
export const ValidationCode = Object.freeze({
  kOk: 0,
  kNoFaceFound: 1,
  kMultipleFacesFound: 2,
  kFaceNotCentered: 3,
  kFaceSizeOutOfRange: 4,
  kTooDark: 5,
  kTooBright: 6,
  kChestNotVisible: 7,
  kCameraTuning: 10,
  kFrameRateTooLow: 11,
  kExcessiveMotion: 12,
  kFaceTooClose: 13,
  kFaceTooFar: 14,
  kFaceTooHigh: 15,
  kFaceTooLow: 16,
  kFaceNotForward: 17,
} as const);

export type ValidationStatusCode = (typeof ValidationCode)[keyof typeof ValidationCode];

// Official Presage SmartSpectra Error Codes
export const SmartSpectraErrorCode = Object.freeze({
  kOk: 0,
  kInvalidState: 1,
  kAuthenticationFailed: 2,
  kConfigurationFailed: 3,
  kCreditExhausted: 4,
  kNetworkError: 5,
  kServerError: 6,
  kInputUnavailable: 7,
  kProcessingFailed: 8,
  kFrameConversionFailed: 9,
  kNonMonotonicTimestamp: 10,
  kTimestampGap: 11,
} as const);

export type SmartSpectraErrorCodeType = (typeof SmartSpectraErrorCode)[keyof typeof SmartSpectraErrorCode];

// Metric bundles matching Presage SmartSpectra wire values
export const breathingMetrics = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7] as const);
export const cardioMetrics = Object.freeze([15, 16, 17] as const);
export const faceMetrics = Object.freeze([11, 12, 13, 14] as const);
export const micromotionMetrics = Object.freeze([8, 9] as const);
export const edaMetrics = Object.freeze([10] as const);
export const defaultSupportedMetrics = breathingMetrics;

// Expression enum mapping from Presage protobuf definition
export const ExpressionTypeNames: Record<number, string> = {
  0: 'Unspecified',
  1: 'Angry',
  2: 'Contempt',
  3: 'Disgust',
  4: 'Fear',
  5: 'Happy',
  6: 'Neutral',
  7: 'Sad',
  8: 'Surprise',
};

// Status text mapping
export const ProcessingStatusNames: Record<number, string> = {
  [ProcessingStatus.kUninitialized]: 'Uninitialized',
  [ProcessingStatus.kIdle]: 'Idle',
  [ProcessingStatus.kStarting]: 'Starting',
  [ProcessingStatus.kRunning]: 'Running',
  [ProcessingStatus.kStopping]: 'Stopping',
  [ProcessingStatus.kError]: 'Error',
};

// Validation code messages with helpful positioning guidance
export const ValidationMessages: Record<number, { title: string; hint: string }> = {
  [ValidationCode.kOk]: {
    title: 'Optimal Alignment',
    hint: 'Signal quality is high. Please remain still while vitals are captured.',
  },
  [ValidationCode.kNoFaceFound]: {
    title: 'Face Not Detected',
    hint: 'Look directly at your webcam so the algorithm can locate facial landmarks.',
  },
  [ValidationCode.kMultipleFacesFound]: {
    title: 'Multiple Faces in View',
    hint: 'Ensure only one person is positioned within the camera frame.',
  },
  [ValidationCode.kFaceNotCentered]: {
    title: 'Center Your Face',
    hint: 'Position your head inside the center oval guide.',
  },
  [ValidationCode.kFaceSizeOutOfRange]: {
    title: 'Adjust Distance',
    hint: 'Move slightly closer or farther away from the camera.',
  },
  [ValidationCode.kTooDark]: {
    title: 'Insufficient Lighting',
    hint: 'The ambient light is too dim. Turn on room lights or face a light source.',
  },
  [ValidationCode.kTooBright]: {
    title: 'Excessive Glare / Backlight',
    hint: 'Avoid direct backlight or intense glare washing out your face.',
  },
  [ValidationCode.kChestNotVisible]: {
    title: 'Include Upper Chest',
    hint: 'Tilt camera down slightly to include both face and upper chest for breathing rate.',
  },
  [ValidationCode.kCameraTuning]: {
    title: 'Camera Calibrating',
    hint: 'Webcam exposure, white-balance, and focus are stabilizing.',
  },
  [ValidationCode.kFrameRateTooLow]: {
    title: 'Low Frame Rate',
    hint: 'Camera FPS is too low (< 24 FPS). Close CPU-heavy applications.',
  },
  [ValidationCode.kExcessiveMotion]: {
    title: 'Excessive Movement',
    hint: 'Please hold steady. Head motion degrades optical rPPG accuracy.',
  },
  [ValidationCode.kFaceTooClose]: {
    title: 'Too Close',
    hint: 'Move back 20–30 cm from the camera lens.',
  },
  [ValidationCode.kFaceTooFar]: {
    title: 'Too Far',
    hint: 'Move closer so your face occupies approximately one-third of the frame.',
  },
  [ValidationCode.kFaceTooHigh]: {
    title: 'Face Too High',
    hint: 'Tilt your camera up or lower your seating position.',
  },
  [ValidationCode.kFaceTooLow]: {
    title: 'Face Too Low',
    hint: 'Tilt your camera down or raise your seating position.',
  },
  [ValidationCode.kFaceNotForward]: {
    title: 'Face Not Forward',
    hint: 'Turn your head to look directly forward into the lens.',
  },
};

// Error code explanations
export const ErrorCodeDescriptions: Record<number, string> = {
  [SmartSpectraErrorCode.kOk]: 'No error reported.',
  [SmartSpectraErrorCode.kInvalidState]: 'The SDK pipeline was called in an invalid operational state.',
  [SmartSpectraErrorCode.kAuthenticationFailed]: 'API Key authentication failed. Please verify your Presage API credentials.',
  [SmartSpectraErrorCode.kConfigurationFailed]: 'Invalid model configuration or unsupported requested metrics bundle.',
  [SmartSpectraErrorCode.kCreditExhausted]: 'API usage quota or account credits have been exhausted.',
  [SmartSpectraErrorCode.kNetworkError]: 'Network communication failure during SDK license verification or telemetry.',
  [SmartSpectraErrorCode.kServerError]: 'Presage SmartSpectra cloud authentication service returned an internal error.',
  [SmartSpectraErrorCode.kInputUnavailable]: 'Selected video input camera device could not be acquired or is in use by another app.',
  [SmartSpectraErrorCode.kProcessingFailed]: 'Signal processing pipeline failure during rPPG feature extraction.',
  [SmartSpectraErrorCode.kFrameConversionFailed]: 'Failed to convert captured video frame into RGBA buffer.',
  [SmartSpectraErrorCode.kNonMonotonicTimestamp]: 'Video frame timestamps were not strictly increasing.',
  [SmartSpectraErrorCode.kTimestampGap]: 'Large timestamp discontinuity detected in camera frame feed.',
};
