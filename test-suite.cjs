/**
 * HumanSense AI - End-to-End Test Suite
 * Automated verification of SmartSpectra SDK bindings, protobuf decoding,
 * metric extractors, and Electron IPC contracts.
 */

'use strict';

const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('       HUMANSENSE AI - AUTOMATED TEST SUITE        ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

async function runTests() {
  // Test 1: Verify Windows x64 Native Binaries
  console.log('1. Checking Native Binary Closures:');
  const win32Dir = path.join(__dirname, 'node_modules/@smartspectra/node-sdk-win32-x64');
  const win32Dll = path.join(win32Dir, 'smartspectra_capi.dll');
  const win32Core = path.join(win32Dir, 'smartspectra.dll');
  const win32OpenCv = path.join(win32Dir, 'opencv_world4100.dll');

  assert(fs.existsSync(win32Dir), 'node-sdk-win32-x64 package exists');
  assert(fs.existsSync(win32Dll), 'smartspectra_capi.dll exists');
  assert(fs.existsSync(win32Core), 'smartspectra.dll exists');
  assert(fs.existsSync(win32OpenCv), 'opencv_world4100.dll exists');

  // Test 2: Verify SDK Module Exports & Protobuf Codec
  console.log('\n2. Testing SDK Protobuf Codec & Messages:');
  try {
    const { decodeMetrics, Metrics } = require('@smartspectra/node-sdk/messages');
    assert(typeof decodeMetrics === 'function', 'decodeMetrics function exported');
    assert(typeof Metrics === 'function', 'Metrics protobuf class exported');

    // Create a real protobuf packet with mock physiological telemetry
    const testPacket = Metrics.create({
      cardio: {
        pulseRate: [
          { value: 74.2, confidence: 91, stable: true, timestamp: Date.now() * 1000 }
        ],
        hrv: [
          { rmssd: 42.8, sdnn: 39.1, meanNn: 810.5, baevsky: 85.0, confidence: 88, stable: true }
        ],
        arterialPressureTrace: [
          { value: 1.05, confidence: 90, stable: true }
        ]
      },
      breathing: {
        rate: [
          { value: 15.4, confidence: 82, stable: true, timestamp: Date.now() * 1000 }
        ]
      },
      face: {
        expression: [
          {
            stable: true,
            scores: [
              { type: 6, confidence: 85 }, // NEUTRAL
              { type: 5, confidence: 12 }, // HAPPY
              { type: 8, confidence: 3 }   // SURPRISE
            ]
          }
        ]
      }
    });

    const encodedBuffer = Metrics.encode(testPacket).finish();
    assert(encodedBuffer.length > 0, `Protobuf packet successfully encoded (${encodedBuffer.length} bytes)`);

    const decoded = decodeMetrics(encodedBuffer);
    assert(decoded !== null, 'Protobuf packet successfully decoded');
    assert(decoded.cardio && decoded.cardio.pulseRate.length > 0, 'Cardio pulseRate decoded');
    assert(decoded.breathing && decoded.breathing.rate.length > 0, 'Breathing rate decoded');
    assert(decoded.cardio.hrv.length > 0, 'HRV decoded');
    assert(decoded.face.expression.length > 0, 'Facial expression decoded');
  } catch (err) {
    assert(false, 'Protobuf codec test failed', err.message);
  }

  // Test 3: Test MetricHandler Extraction Logic
  console.log('\n3. Testing MetricHandler Extraction Logic:');
  try {
    const { MetricHandler } = await import('./src/sdk/metricHandler.ts');
    assert(typeof MetricHandler.extractPulse === 'function', 'MetricHandler.extractPulse is defined');
    assert(typeof MetricHandler.extractBreathing === 'function', 'MetricHandler.extractBreathing is defined');
    assert(typeof MetricHandler.extractHrv === 'function', 'MetricHandler.extractHrv is defined');
    assert(typeof MetricHandler.extractExpression === 'function', 'MetricHandler.extractExpression is defined');

    // Test with empty payload (strict zero-fake-data rule)
    const emptyPulse = MetricHandler.extractPulse({});
    assert(emptyPulse.bpm === null, 'Pulse returns null when unavailable (no fake numbers)');
    assert(emptyPulse.statusText === 'Waiting for measurement', 'Pulse status reflects waiting state');

    const emptyBreathing = MetricHandler.extractBreathing({});
    assert(emptyBreathing.breathsPerMinute === null, 'Breathing returns null when unavailable');

    const emptyHrv = MetricHandler.extractHrv({});
    assert(emptyHrv.rmssd === null, 'HRV RMSSD returns null when unavailable');

    const emptyExpression = MetricHandler.extractExpression({});
    assert(emptyExpression.predominant === null, 'Facial expression returns null when unavailable');
  } catch (err) {
    assert(false, 'MetricHandler import test', err.message);
  }

  // Test 4: Verify Electron Scripts & Preload Bridges
  console.log('\n4. Verifying Electron Process Files:');
  const mainScript = path.join(__dirname, 'src/main.cjs');
  const preloadScript = path.join(__dirname, 'src/preload.cjs');

  assert(fs.existsSync(mainScript), 'src/main.cjs exists');
  assert(fs.existsSync(preloadScript), 'src/preload.cjs exists');

  const mainContent = fs.readFileSync(mainScript, 'utf8');
  assert(mainContent.includes('bindSmartSpectraIpc'), 'main.cjs attaches bindSmartSpectraIpc');
  assert(mainContent.includes('setPermissionRequestHandler'), 'main.cjs configures camera permissions');

  const preloadContent = fs.readFileSync(preloadScript, 'utf8');
  assert(preloadContent.includes('@smartspectra/node-sdk/preload'), 'preload.cjs wires official SDK preload');
  assert(preloadContent.includes('contextBridge.exposeInMainWorld'), 'preload.cjs uses contextBridge');

  // Test 5: Verify Package Configuration for electron-builder
  console.log('\n5. Verifying package.json electron-builder configuration:');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  assert(pkg.main === 'src/main.cjs', 'package.json points to src/main.cjs');
  assert(pkg.scripts['electron:dev'] !== undefined, 'electron:dev script present');
  assert(pkg.scripts['electron:dist'] !== undefined, 'electron:dist script present');
  assert(pkg.build && pkg.build.win && pkg.build.win.extraResources !== undefined, 'Windows extraResources configured for smartspectra DLLs');

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests();
