// Hollywood / Movie Studio Cinematic Sound Engine using Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export interface CinematicSoundOptions {
  volume?: number;
  pitchFactor?: number;
}

/**
 * Plays a full multi-layer Hollywood / Cinema Studio Intro Sound:
 * 1. Deep Sub-Bass Braam (IMAX / Hans Zimmer style low rumble)
 * 2. Cyber Plasma Riser / Atmospheric whoosh
 * 3. Metallic Chrome Flash & Resonant Chimes
 * 4. Powerful Cinematic Impact Burst with reverb tail
 * 5. Futuristic harmonic chord finish
 */
export function playCinematicIntroSound(options: CinematicSoundOptions = {}): { stop: () => void } {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const masterVol = options.volume ?? 0.85;
    masterGain.gain.setValueAtTime(masterVol, now);
    masterGain.connect(ctx.destination);

    // ==========================================
    // LAYER 1: Cyber Riser / Atmospheric Swell
    // ==========================================
    const riserOsc = ctx.createOscillator();
    const riserGain = ctx.createGain();
    const riserFilter = ctx.createBiquadFilter();

    riserOsc.type = 'sawtooth';
    riserOsc.frequency.setValueAtTime(65, now);
    riserOsc.frequency.exponentialRampToValueAtTime(520, now + 1.6);

    riserFilter.type = 'bandpass';
    riserFilter.frequency.setValueAtTime(120, now);
    riserFilter.frequency.exponentialRampToValueAtTime(1800, now + 1.6);
    riserFilter.Q.setValueAtTime(3.5, now);

    riserGain.gain.setValueAtTime(0.001, now);
    riserGain.gain.exponentialRampToValueAtTime(0.28, now + 1.2);
    riserGain.gain.exponentialRampToValueAtTime(0.65, now + 1.55);
    riserGain.gain.linearRampToValueAtTime(0.001, now + 1.7);

    riserOsc.connect(riserFilter);
    riserFilter.connect(riserGain);
    riserGain.connect(masterGain);

    riserOsc.start(now);
    riserOsc.stop(now + 1.75);

    // ==========================================
    // LAYER 2: Main Cinema Sub-Bass "BRAAM" & Impact
    // ==========================================
    const impactTime = now + 1.55;

    // Sub oscillator (Deep 42Hz fundamental)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, impactTime);
    subOsc.frequency.exponentialRampToValueAtTime(42, impactTime + 0.35);

    subGain.gain.setValueAtTime(0.001, impactTime);
    subGain.gain.linearRampToValueAtTime(0.9, impactTime + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.4, impactTime + 0.8);
    subGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 3.2);

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start(impactTime);
    subOsc.stop(impactTime + 3.3);

    // Mid-range distorted Braam oscillator
    const braamOsc = ctx.createOscillator();
    const braamGain = ctx.createGain();
    const braamFilter = ctx.createBiquadFilter();

    braamOsc.type = 'triangle';
    braamOsc.frequency.setValueAtTime(130.81, impactTime); // C3
    braamOsc.frequency.exponentialRampToValueAtTime(65.41, impactTime + 0.4); // C2

    braamFilter.type = 'lowpass';
    braamFilter.frequency.setValueAtTime(2400, impactTime);
    braamFilter.frequency.exponentialRampToValueAtTime(180, impactTime + 2.5);

    braamGain.gain.setValueAtTime(0.001, impactTime);
    braamGain.gain.linearRampToValueAtTime(0.7, impactTime + 0.05);
    braamGain.gain.exponentialRampToValueAtTime(0.15, impactTime + 1.5);
    braamGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 3.0);

    braamOsc.connect(braamFilter);
    braamFilter.connect(braamGain);
    braamGain.connect(masterGain);
    braamOsc.start(impactTime);
    braamOsc.stop(impactTime + 3.1);

    // ==========================================
    // LAYER 3: White Noise Flash Explosion / Zap
    // ==========================================
    const bufferSize = ctx.sampleRate * 1.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(4500, impactTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(400, impactTime + 1.2);
    noiseFilter.Q.setValueAtTime(2.0, impactTime);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, impactTime);
    noiseGain.gain.linearRampToValueAtTime(0.55, impactTime + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 1.4);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start(impactTime);
    noiseSource.stop(impactTime + 1.5);

    // ==========================================
    // LAYER 4: Harmonic Celestial Chimes (Metallic Fenk Chord)
    // Notes: C5 (523.25Hz), G5 (783.99Hz), C6 (1046.5Hz), E6 (1318.51Hz)
    // ==========================================
    const chordFrequencies = [523.25, 783.99, 1046.5, 1318.51, 1567.98];
    const chimeStartTime = impactTime + 0.08;

    chordFrequencies.forEach((freq, index) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq * (1 + (Math.random() * 0.004 - 0.002)), chimeStartTime);

      chimeGain.gain.setValueAtTime(0.001, chimeStartTime + index * 0.04);
      chimeGain.gain.linearRampToValueAtTime(0.18 / (index + 1), chimeStartTime + 0.05 + index * 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, chimeStartTime + 2.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGain);

      chimeOsc.start(chimeStartTime + index * 0.04);
      chimeOsc.stop(chimeStartTime + 3.0);
    });

    return {
      stop: () => {
        try {
          masterGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        } catch {
          // ignore
        }
      },
    };
  } catch (e) {
    console.warn('Cinematic audio playback error:', e);
    return { stop: () => {} };
  }
}

/**
 * Short UI click / confirmation sound for futuristic TV remote & buttons
 */
export function playCyberClickSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // ignore
  }
}
