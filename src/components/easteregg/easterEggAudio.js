// WATCH DOGS 2 INSPIRED SYNTHESIZED AUDIO ENGINE
// 100% Procedural Web Audio API — No external audio files or proprietary assets

import { isMuted } from '../../utils/audio.js';

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Mechanical Switch / Junction Rotation Click
export function playCircuitRotate() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.055);
  } catch (e) {}
}

// 2. Power Flow / Circuit Branch Energized
export function playCircuitPowerUp() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {}
}

// 3. Hostile IDS Shock / Alarm Warning
export function playHostileShock() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.setValueAtTime(140, ctx.currentTime + 0.06);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch (e) {}
}

// 4. Padlock Snap & Security Router Release
export function playLockRelease() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Mechanical tumbler click
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(700, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.045);

    // High crystalline unlock chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1560, ctx.currentTime + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.22);
    gain2.gain.setValueAtTime(0.07, ctx.currentTime + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.03);
    osc2.stop(ctx.currentTime + 0.24);
  } catch (e) {}
}

// 5. Timer Tension Tick (pitch escalates if urgent)
export function playTimerTick(isUrgent = false) {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isUrgent ? 'square' : 'triangle';
    const freq = isUrgent ? 1600 : 900;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(isUrgent ? 0.06 : 0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {}
}

// 6. Stage Cleared Arpeggio
export function playStageVictory() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.09, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.32);
    });
  } catch (e) {}
}

// 7. Full DedSec / Watch Dogs Root System Override Victory Fanfare
export function playFinalOverrideVictory() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const melody = [
      { f: 440, t: 0.0, d: 0.18 }, // A4
      { f: 554.37, t: 0.15, d: 0.18 }, // C#5
      { f: 659.25, t: 0.30, d: 0.22 }, // E5
      { f: 880, t: 0.48, d: 0.35 }, // A5
      { f: 1108.73, t: 0.72, d: 0.45 }, // C#6
      { f: 1318.51, t: 0.98, d: 0.8 }, // E6 sustained
    ];

    melody.forEach(({ f, t, d }) => {
      const startTime = ctx.currentTime + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + d);
    });

    // Sub-bass sweep underneath
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 1.2);
    subGain.gain.setValueAtTime(0.14, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start();
    subOsc.stop(ctx.currentTime + 1.2);
  } catch (e) {}
}

// 8. Cinematic Glitch / Announcement Whoosh
export function playGlitchTransition() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Noise blast
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.35);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    // High synth sweep
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.3);
    oscGain.gain.setValueAtTime(0.06, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

// 9. Node Hover / Selection Click
export function playSelectNode() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.setValueAtTime(1800, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

// 10. Heavy Hydraulic Vault Door Opening (Hiss + Metallic Groan + Sub-Bass)
export function playVaultDoorOpening() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Sub-bass heavy pneumatic rumble
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(80, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 2.4);

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(160, ctx.currentTime);
    subFilter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 2.4);

    subGain.gain.setValueAtTime(0.2, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start();
    subOsc.stop(ctx.currentTime + 2.5);

    // Steam / Hydraulic release noise hiss
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(900, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 1.5);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();
  } catch (e) {}
}

// 11. Epic Cinematic Golden Vault Fanfare
export function playVaultFanfare() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const chords = [
      { f: 220, t: 0.0, d: 2.2 }, // A3
      { f: 329.63, t: 0.2, d: 2.0 }, // E4
      { f: 440, t: 0.4, d: 2.5 }, // A4
      { f: 554.37, t: 0.7, d: 2.2 }, // C#5
      { f: 659.25, t: 1.0, d: 2.8 }, // E5
      { f: 880, t: 1.3, d: 3.2 }, // A5
    ];

    chords.forEach(({ f, t, d }) => {
      const startTime = ctx.currentTime + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + d);
    });
  } catch (e) {}
}

// 12. Sterile Corporate UI Click / Tick
export function playCorporateClick() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    osc.frequency.setValueAtTime(1400, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
}

// 13. Progress Bar Step Beep
export function playLoadingProgressBeep() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);

    gain.gain.setValueAtTime(0.025, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {}
}

// 14. Loud Comedic Corporate Rejection Slam & Buzzer
export function playRejectionBuzzer() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Heavy rubber stamp impact thud
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(140, ctx.currentTime);
    thud.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);

    thudGain.gain.setValueAtTime(0.25, ctx.currentTime);
    thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start();
    thud.stop(ctx.currentTime + 0.18);

    // Double rejection buzzer "BU-BUZZ"
    [0.08, 0.28].forEach((timeOffset) => {
      const buzzer = ctx.createOscillator();
      const buzzerGain = ctx.createGain();

      buzzer.type = 'sawtooth';
      buzzer.frequency.setValueAtTime(130, ctx.currentTime + timeOffset);
      buzzer.frequency.setValueAtTime(110, ctx.currentTime + timeOffset + 0.12);

      buzzerGain.gain.setValueAtTime(0.14, ctx.currentTime + timeOffset);
      buzzerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + 0.14);

      buzzer.connect(buzzerGain);
      buzzerGain.connect(ctx.destination);

      buzzer.start(ctx.currentTime + timeOffset);
      buzzer.stop(ctx.currentTime + timeOffset + 0.14);
    });
  } catch (e) {}
}

// 15. Comedic Deadpan Punchline Tone
export function playSadPunchline() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [
      { f: 311.13, t: 0.0, d: 0.3 }, // Eb4
      { f: 293.66, t: 0.32, d: 0.3 }, // D4
      { f: 277.18, t: 0.64, d: 0.3 }, // Db4
      { f: 261.63, t: 0.96, d: 0.8 }, // C4 (held)
    ];

    notes.forEach(({ f, t, d }) => {
      const startTime = ctx.currentTime + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + d);
    });
  } catch (e) {}
}

// 16. Record Scratch (Instant anticlimax / music freeze)
export function playRecordScratch() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = ctx.sampleRate * 0.28;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.28);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {}
}

// 17. Flying Chappal / Slipper Sonic Whoosh
export function playSlipperWhoosh() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

// 18. Indian Temple Bell / Mom Warning Gong
export function playMomGong() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    [587.33, 880, 1174.66].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    });
  } catch (e) {}
}

// 19. Comedic Dhaniya Victory Trumpet Fanfare
export function playDhaniyaFanfare() {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [
      { f: 523.25, t: 0.0, d: 0.14 }, // C5
      { f: 659.25, t: 0.14, d: 0.14 }, // E5
      { f: 783.99, t: 0.28, d: 0.14 }, // G5
      { f: 1046.50, t: 0.44, d: 0.5 }, // C6
    ];

    notes.forEach(({ f, t, d }) => {
      const startTime = ctx.currentTime + t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + d);
    });
  } catch (e) {}
}
