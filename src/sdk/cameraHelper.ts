/**
 * HumanSense AI - Camera Acquisition & Resilient Fallback Utility
 * 
 * 1. Attempts to acquire hardware webcam at 1280x720 @ 30 FPS.
 * 2. If rejected or device unavailable, automatically creates an interactive
 *    biometric simulation stream using HTML5 Canvas captureStream(30), ensuring
 *    the user can evaluate and test the entire application even without physical
 *    camera hardware or inside restrictive iframes.
 */

export async function acquireCameraWithFallback(): Promise<{
  stream: MediaStream;
  isSimulated: boolean;
  deviceName: string;
}> {
  // 1. First attempt standard 720p hardware webcam
  if (navigator?.mediaDevices?.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user',
        },
      });

      const track = stream.getVideoTracks()[0];
      return {
        stream,
        isSimulated: false,
        deviceName: track?.label || 'Hardware Webcam',
      };
    } catch (err: any) {
      console.warn('[CameraHelper] Preferred constraints failed, trying basic video:', err.message);

      // 2. Second attempt: basic video constraint
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const track = stream.getVideoTracks()[0];
        return {
          stream,
          isSimulated: false,
          deviceName: track?.label || 'Generic Webcam',
        };
      } catch (err2: any) {
        console.warn('[CameraHelper] Hardware camera acquisition unavailable:', err2.message);
      }
    }
  }

  // 3. Fallback: Interactive Biometric Silhouette Canvas Stream
  console.log('[CameraHelper] Generating resilient Biometric Canvas Stream for evaluation...');
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  let t = 0;
  function drawBiometricFeed() {
    t += 0.03;
    if (!ctx) return;

    // Dark high-tech medical background
    ctx.fillStyle = '#060B14';
    ctx.fillRect(0, 0, 1280, 720);

    // Subtle ambient grid lines
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 720);
      ctx.stroke();
    }
    for (let y = 0; y < 720; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1280, y);
      ctx.stroke();
    }

    // Centered simulated human face silhouette
    const cx = 640;
    const cy = 340 + Math.sin(t * 1.2) * 4; // subtle breathing motion

    // Subtle rPPG skin flushing color variation (simulating pulse)
    const pulseIntensity = (Math.sin(t * 7.5) + 1) * 0.5; // ~72 BPM
    const skinRed = Math.round(180 + pulseIntensity * 30);
    const skinGreen = Math.round(140 + pulseIntensity * 10);
    const skinBlue = Math.round(130 + pulseIntensity * 10);

    // Head Oval
    ctx.fillStyle = `rgb(${skinRed}, ${skinGreen}, ${skinBlue})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 140, 190, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = `rgb(${skinRed - 20}, ${skinGreen - 20}, ${skinBlue - 20})`;
    ctx.fillRect(cx - 50, cy + 160, 100, 120);

    // Upper Torso / Shoulders
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 340, 280, 140, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(cx - 48, cy - 20, 16, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 48, cy - 20, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gentle facial landmark points (SmartSpectra mesh emulation)
    ctx.fillStyle = 'rgba(6, 182, 212, 0.7)';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx + i * 22, cy + 50 + Math.abs(i) * 3, 3, 0, Math.PI * 2); // mouth line
      ctx.fill();
    }

    // Top indicator banner on canvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(360, 20, 560, 40);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.strokeRect(360, 20, 560, 40);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BIOMETRIC rPPG SYNTHESIS FEED (ACTIVE)', 640, 45);

    requestAnimationFrame(drawBiometricFeed);
  }

  drawBiometricFeed();
  const simulatedStream = canvas.captureStream(30);

  return {
    stream: simulatedStream,
    isSimulated: true,
    deviceName: 'Biometric Simulation Stream',
  };
}
