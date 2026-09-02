import { fireBirthdayConfetti } from './confetti';
import { triggerHaptic } from './hapticsService';

export type CelebrationSoundType = 
  | 'party_pop'
  | 'yeehaw' 
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
  { id: 'party_pop', label: 'Party Pop & Chime (Default)', emoji: '🎉', desc: 'Short, satisfying pop with gentle sparkle chime' },
  { id: 'yeehaw', label: 'Yeehaw! Cheer', emoji: '🤠', desc: 'Joyful rising cheer with upbeat fanfare' },
  { id: 'cheer_fanfare', label: 'Victory Fanfare', emoji: '🥳', desc: 'Short, pleasant 3-chord celebratory fanfare' },
  { id: 'birthday_chime', label: 'Birthday Jingle', emoji: '🔔', desc: 'Melodic glockenspiel birthday chime' },
  { id: 'airhorn', label: 'Hype Airhorn', emoji: '🎺', desc: 'Double pulse stadium celebration blast' },
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
  return 'party_pop'; // Pleasant default
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
 * Synthesizes short, subtle, pleasant celebration sounds using the Web Audio API
 */
function renderSound(ctx: AudioContext, sound: CelebrationSoundType): void {
  stopCurrentAudio();

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  // Warm, balanced volume level (~0.60) to prevent piercing/loud audio
  masterGain.gain.setValueAtTime(0.60, now);
  masterGain.connect(ctx.destination);
  activeNodes.push(masterGain);

  if (sound === 'party_pop') {
    // 🎉 1. Crisp, tactile party pop
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(800, now);
    popOsc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
    popGain.gain.setValueAtTime(0.6, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    popOsc.connect(popGain);
    popGain.connect(masterGain);
    popOsc.start(now);
    popOsc.stop(now + 0.06);
    activeNodes.push(popOsc, popGain);

    // 2. Sweet, warm harmonic chime triad (C5 -> E5 -> G5 -> C6)
    const chimes = [523.25, 659.25, 783.99, 1046.50];
    chimes.forEach((freq, i) => {
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      const startTime = now + 0.03 + i * 0.04;

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(freq, startTime);
      chimeGain.gain.setValueAtTime(0.35, startTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGain);
      chimeOsc.start(startTime);
      chimeOsc.stop(startTime + 0.38);

      activeNodes.push(chimeOsc, chimeGain);
    });

  } else if (sound === 'yeehaw') {
    // 🤠 1. Cheerful rising pitch slide
    const slideOsc = ctx.createOscillator();
    const slideGain = ctx.createGain();
    slideOsc.type = 'triangle';
    slideOsc.frequency.setValueAtTime(320, now);
    slideOsc.frequency.exponentialRampToValueAtTime(700, now + 0.16);
    slideOsc.frequency.exponentialRampToValueAtTime(520, now + 0.32);

    slideGain.gain.setValueAtTime(0.01, now);
    slideGain.gain.linearRampToValueAtTime(0.45, now + 0.10);
    slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    slideOsc.connect(slideGain);
    slideGain.connect(masterGain);
    slideOsc.start(now);
    slideOsc.stop(now + 0.36);
    activeNodes.push(slideOsc, slideGain);

    // 2. Upbeat celebratory fanfare chord triad
    const fanfareNotes = [
      { freq: 523.25, time: 0.12, dur: 0.18 }, // C5
      { freq: 659.25, time: 0.18, dur: 0.20 }, // E5
      { freq: 783.99, time: 0.24, dur: 0.22 }, // G5
      { freq: 1046.50, time: 0.30, dur: 0.35 }, // C6
    ];

    fanfareNotes.forEach((n) => {
      const startTime = now + n.time;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, startTime);
      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.dur);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + n.dur + 0.04);

      activeNodes.push(osc, gain);
    });

  } else if (sound === 'cheer_fanfare') {
    // 🥳 Short 3-chord victory progression
    const chords = [
      { freqs: [523.25, 659.25], time: 0, dur: 0.15 },       // C Maj
      { freqs: [587.33, 739.99], time: 0.15, dur: 0.15 },    // D Maj
      { freqs: [783.99, 1046.50], time: 0.30, dur: 0.40 },   // High G / C
    ];

    chords.forEach((chord) => {
      const chordStart = now + chord.time;
      chord.freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chordStart);
        gain.gain.setValueAtTime(0.30, chordStart);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + chord.dur);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(chordStart);
        osc.stop(chordStart + chord.dur + 0.04);

        activeNodes.push(osc, gain);
      });
    });

  } else if (sound === 'birthday_chime') {
    // 🔔 Sweet Happy Birthday chime
    const notes = [
      { freq: 392.00, dur: 0.16, delay: 0.00 }, // G4
      { freq: 392.00, dur: 0.16, delay: 0.18 }, // G4
      { freq: 440.00, dur: 0.30, delay: 0.36 }, // A4
      { freq: 392.00, dur: 0.30, delay: 0.68 }, // G4
      { freq: 523.25, dur: 0.45, delay: 1.00 }, // C5
    ];

    notes.forEach((n) => {
      const noteTime = now + n.delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(n.freq, noteTime);
      gain.gain.setValueAtTime(0.40, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + n.dur);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(noteTime);
      osc.stop(noteTime + n.dur + 0.04);

      activeNodes.push(osc, gain);
    });

  } else if (sound === 'airhorn') {
    // 🎺 Double pulse stadium celebration blast
    const hornPitches = [466.16, 587.33];
    const pulses = [0, 0.14];

    pulses.forEach((pulseOffset) => {
      const pulseTime = now + pulseOffset;
      hornPitches.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, pulseTime);
        gain.gain.setValueAtTime(0.20, pulseTime);
        gain.gain.exponentialRampToValueAtTime(0.01, pulseTime + 0.10);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(pulseTime);
        osc.stop(pulseTime + 0.11);

        activeNodes.push(osc, gain);
      });
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
      renderSound(ctx, sound);
    });
  } else {
    renderSound(ctx, sound);
  }
}

/**
 * Unified celebration trigger:
 * 1. Confetti Burst
 * 2. Short, satisfying audio chime/sound
 * 3. Native Capacitor Haptic Feedback
 */
export function triggerCelebration(customSound?: CelebrationSoundType): void {
  // 1. Confetti Burst
  fireBirthdayConfetti();

  // 2. Play Audio Feedback
  playCelebrationSound(customSound);

  // 3. Native Haptic Feedback
  triggerHaptic('celebrate');
}
