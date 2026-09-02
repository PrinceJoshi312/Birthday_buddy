import { fireBirthdayConfetti } from './confetti';

export type CelebrationSoundType = 
  | 'yeehaw'
  | 'party_pop' 
  | 'airhorn' 
  | 'cheer_fanfare' 
  | 'birthday_chime' 
  | 'none';

export interface CelebrationSoundOption {
  id: CelebrationSoundType;
  label: string;
  emoji: string;
  desc: string;
}

export const CELEBRATION_SOUNDS: CelebrationSoundOption[] = [
  { id: 'yeehaw', label: 'Yeehaw! Party (Default)', emoji: '🤠', desc: 'High-energy joyous cheer & celebratory fanfare' },
  { id: 'party_pop', label: 'Party Popper', emoji: '🎉', desc: 'Crisp party pop & rising sparkle chimes' },
  { id: 'airhorn', label: 'Hype Airhorn', emoji: '🎺', desc: 'Triple pulse stadium celebration blast' },
  { id: 'cheer_fanfare', label: 'Victory Fanfare', emoji: '🥳', desc: 'Triumphant orchestral celebration chords' },
  { id: 'birthday_chime', label: 'Birthday Jingle', emoji: '🔔', desc: 'Melodic happy birthday glockenspiel melody' },
  { id: 'none', label: 'Silent Mode', emoji: '🔇', desc: 'Visual confetti & vibration only' },
];

const SOUND_STORAGE_KEY = 'bb_celebration_sound';

export function getStoredCelebrationSound(): CelebrationSoundType {
  try {
    const stored = localStorage.getItem(SOUND_STORAGE_KEY) as CelebrationSoundType;
    if (stored && CELEBRATION_SOUNDS.some(s => s.id === stored)) {
      return stored;
    }
  } catch {
    // Ignore storage read errors
  }
  return 'yeehaw'; // Catchy Yeehaw default
}

export function setStoredCelebrationSound(sound: CelebrationSoundType): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, sound);
  } catch {
    // Ignore storage write errors
  }
}

// Global AudioContext reference with active source tracking
let audioCtx: AudioContext | null = null;
let activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];

function getOrCreateAudioContext(): AudioContext | null {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function stopCurrentAudio(): void {
  for (const node of activeNodes) {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch {
      // Ignore cleanup errors
    }
  }
  activeNodes = [];
}

/**
 * Internal synthesis engine with fresh currentTime guarantee
 */
function renderSound(ctx: AudioContext, sound: CelebrationSoundType): void {
  stopCurrentAudio();

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.85, now);
  masterGain.connect(ctx.destination);
  activeNodes.push(masterGain);

  if (sound === 'yeehaw') {
    // 🤠 1. High-energy party starter pop
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(900, now);
    popOsc.frequency.exponentialRampToValueAtTime(110, now + 0.07);
    popGain.gain.setValueAtTime(0.7, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    popOsc.connect(popGain);
    popGain.connect(masterGain);
    popOsc.start(now);
    popOsc.stop(now + 0.08);
    activeNodes.push(popOsc, popGain);

    // 2. High-energy vocal sweep: "Yeeeee-HAAAAAW!"
    const vocalOsc = ctx.createOscillator();
    const vocalGain = ctx.createGain();
    vocalOsc.type = 'triangle';
    vocalOsc.frequency.setValueAtTime(320, now + 0.02);
    vocalOsc.frequency.exponentialRampToValueAtTime(750, now + 0.18);
    vocalOsc.frequency.exponentialRampToValueAtTime(880, now + 0.28);
    vocalOsc.frequency.exponentialRampToValueAtTime(500, now + 0.45);

    vocalGain.gain.setValueAtTime(0.01, now + 0.02);
    vocalGain.gain.linearRampToValueAtTime(0.65, now + 0.14);
    vocalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

    vocalOsc.connect(vocalGain);
    vocalGain.connect(masterGain);
    vocalOsc.start(now + 0.02);
    vocalOsc.stop(now + 0.50);
    activeNodes.push(vocalOsc, vocalGain);

    // 3. Upbeat joyous celebration fanfare chords (C5 -> E5 -> G5 -> C6 -> High E6)
    const fanfareNotes = [
      { freq: 523.25, time: 0.10, dur: 0.22 }, // C5
      { freq: 659.25, time: 0.18, dur: 0.22 }, // E5
      { freq: 783.99, time: 0.26, dur: 0.25 }, // G5
      { freq: 1046.50, time: 0.34, dur: 0.45 }, // C6
      { freq: 1318.51, time: 0.42, dur: 0.55 }, // E6
    ];

    fanfareNotes.forEach((n) => {
      const startTime = now + n.time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, startTime);

      gain.gain.setValueAtTime(0.45, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.dur);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + n.dur + 0.05);

      activeNodes.push(osc, gain);
    });

  } else if (sound === 'party_pop') {
    // 1. Pop transient
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.09);
    activeNodes.push(osc, gain);

    // 2. Sparkling rising harmonic chime
    const chimeFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chimeFreqs.forEach((freq, i) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      const startTime = now + 0.04 + i * 0.05;

      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(freq, startTime);
      chimeGain.gain.setValueAtTime(0.40, startTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.40);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGain);
      chimeOsc.start(startTime);
      chimeOsc.stop(startTime + 0.42);

      activeNodes.push(chimeOsc, chimeGain);
    });

  } else if (sound === 'airhorn') {
    // Triple pulse stadium horn blast
    const hornPitches = [466.16, 466.16 * 1.334, 466.16 * 1.5];
    const pulses = [0, 0.13, 0.26];

    pulses.forEach((pulseOffset) => {
      const pulseTime = now + pulseOffset;
      hornPitches.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, pulseTime);
        gain.gain.setValueAtTime(0.28, pulseTime);
        gain.gain.exponentialRampToValueAtTime(0.01, pulseTime + 0.11);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(pulseTime);
        osc.stop(pulseTime + 0.12);

        activeNodes.push(osc, gain);
      });
    });

  } else if (sound === 'cheer_fanfare') {
    // Triumphant victory chords
    const chords = [
      { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.18 },       // C Maj
      { freqs: [587.33, 739.99, 880.00], time: 0.18, dur: 0.18 },    // D Maj
      { freqs: [659.25, 830.61, 987.77], time: 0.36, dur: 0.18 },    // E Maj
      { freqs: [783.99, 987.77, 1174.66, 1567.98], time: 0.54, dur: 0.65 }, // High G Maj
    ];

    chords.forEach((chord) => {
      const chordStart = now + chord.time;
      chord.freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, chordStart);
        gain.gain.setValueAtTime(0.35, chordStart);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + chord.dur);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(chordStart);
        osc.stop(chordStart + chord.dur + 0.05);

        activeNodes.push(osc, gain);
      });
    });

  } else if (sound === 'birthday_chime') {
    // Happy Birthday glockenspiel
    const notes = [
      { freq: 392.00, dur: 0.20, delay: 0.00 }, // G4
      { freq: 392.00, dur: 0.20, delay: 0.22 }, // G4
      { freq: 440.00, dur: 0.38, delay: 0.44 }, // A4
      { freq: 392.00, dur: 0.38, delay: 0.85 }, // G4
      { freq: 523.25, dur: 0.42, delay: 1.25 }, // C5
      { freq: 493.88, dur: 0.65, delay: 1.70 }, // B4
    ];

    notes.forEach((n) => {
      const noteTime = now + n.delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, noteTime);
      gain.gain.setValueAtTime(0.50, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.dur);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(noteTime);
      osc.stop(noteTime + n.dur + 0.05);

      activeNodes.push(osc, gain);
    });
  }
}

/**
 * Synthesizes and plays celebration sounds via the Web Audio API
 */
export function playCelebrationSound(soundType?: CelebrationSoundType): void {
  const sound = soundType || getStoredCelebrationSound();
  if (sound === 'none') return;

  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      renderSound(ctx, sound);
    }).catch(() => {
      // Fallback
      renderSound(ctx, sound);
    });
  } else {
    renderSound(ctx, sound);
  }
}

/**
 * Triggers full celebration: Confetti + Catchy Sound + Haptic Vibration
 */
export function triggerCelebration(customSound?: CelebrationSoundType): void {
  // 1. Confetti Burst
  fireBirthdayConfetti();

  // 2. Play Sound (if not muted)
  playCelebrationSound(customSound);

  // 3. Device Haptic Vibration
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch {
    // Silently ignore vibration errors
  }
}
