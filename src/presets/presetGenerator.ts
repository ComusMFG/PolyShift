// AI-powered preset generator for different electronic music genres
import type { Track, Step } from '../types';

export interface PresetDefinition {
  name: string;
  genre: string;
  description: string;
  bpm: number;
  swing: number;
  tracks: Partial<Track>[];
}

// Utility to create euclidean rhythm
const euclideanRhythm = (steps: number, pulses: number): boolean[] => {
  const pattern: boolean[] = new Array(steps).fill(false);
  if (pulses === 0) return pattern;

  const slope = pulses / steps;
  let previous = -1;

  for (let i = 0; i < steps; i++) {
    const current = Math.floor(i * slope);
    pattern[i] = current !== previous;
    previous = current;
  }

  return pattern;
};

// Create default steps
const createSteps = (pattern: boolean[], velocities?: number[]): Step[] => {
  return pattern.map((active, i) => ({
    active,
    velocity: velocities?.[i] ?? (active ? 100 : 0),
    probability: 100,
    gate: 80,
    ratchet: 1,
    condition: 'always' as const,
  }));
};

// House preset
export const housePreset: PresetDefinition = {
  name: 'House Foundation',
  genre: 'House',
  description: 'Classic 4/4 house groove with kick, hi-hats, and percussion',
  bpm: 124,
  swing: 8,
  tracks: [
    {
      name: 'Kick',
      midiNote: 36,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        true, false, false, false, true, false, false, false,
        true, false, false, false, true, false, false, false,
      ], [110, 0, 0, 0, 105, 0, 0, 0, 110, 0, 0, 0, 105, 0, 0, 0]),
      color: '#ef4444',
    },
    {
      name: 'Closed HH',
      midiNote: 42,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps(Array(16).fill(true),
        Array(16).fill(0).map((_, i) => i % 2 === 0 ? 90 : 70)),
      color: '#3b82f6',
      lfo: {
        enabled: true,
        rate: 0.25,
        depth: 30,
        shape: 'triangle' as const,
        phase: 0,
      },
    },
    {
      name: 'Clap',
      midiNote: 39,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, false, false,
      ]),
      color: '#f59e0b',
    },
    {
      name: 'Percussion',
      midiNote: 56,
      midiChannel: 1,
      clockDivider: 0.5,
      steps: createSteps(euclideanRhythm(16, 5)),
      color: '#10b981',
      swingAmount: 20,
    },
  ],
};

// Techno preset
export const technoPreset: PresetDefinition = {
  name: 'Industrial Techno',
  genre: 'Techno',
  description: 'Driving techno with polyrhythmic percussion and evolving hi-hats',
  bpm: 132,
  swing: 0,
  tracks: [
    {
      name: 'Kick',
      midiNote: 36,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        true, false, false, false, true, false, false, false,
        true, false, false, false, true, false, false, false,
      ], [120, 0, 0, 0, 120, 0, 0, 0, 120, 0, 0, 0, 120, 0, 0, 0]),
      color: '#ef4444',
    },
    {
      name: 'Open HH',
      midiNote: 46,
      midiChannel: 1,
      clockDivider: 2,
      steps: createSteps(euclideanRhythm(16, 7)),
      color: '#06b6d4',
      lfo: {
        enabled: true,
        rate: 0.5,
        depth: 50,
        shape: 'sine' as const,
        phase: 0,
      },
    },
    {
      name: 'Perc 1',
      midiNote: 75,
      midiChannel: 1,
      clockDivider: 0.5,
      steps: createSteps(euclideanRhythm(16, 11)),
      color: '#8b5cf6',
    },
    {
      name: 'Clap',
      midiNote: 39,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, false, true,
      ]),
      color: '#f59e0b',
    },
    {
      name: 'Rim',
      midiNote: 37,
      midiChannel: 1,
      clockDivider: 2,
      steps: createSteps(euclideanRhythm(16, 3)),
      color: '#14b8a6',
      offset: 2,
    },
  ],
};

// Ambient/IDM preset
export const ambientPreset: PresetDefinition = {
  name: 'Ambient Textures',
  genre: 'Ambient/IDM',
  description: 'Evolving polyrhythmic patterns with LFO modulation',
  bpm: 95,
  swing: 15,
  tracks: [
    {
      name: 'Bass',
      midiNote: 48,
      midiChannel: 1,
      clockDivider: 4,
      steps: createSteps(euclideanRhythm(16, 5)),
      color: '#6366f1',
      lfo: {
        enabled: true,
        rate: 0.2,
        depth: 40,
        shape: 'sine' as const,
        phase: 0,
      },
    },
    {
      name: 'Melody 1',
      midiNote: 60,
      midiChannel: 1,
      clockDivider: 0.5,
      steps: createSteps(euclideanRhythm(16, 7)),
      color: '#a855f7',
      arpEnabled: true,
      arpMode: 'updown' as const,
      arpNotes: [64, 67, 72],
    },
    {
      name: 'Perc',
      midiNote: 75,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps(euclideanRhythm(16, 11)),
      color: '#10b981',
      offset: 3,
      lfo: {
        enabled: true,
        rate: 0.33,
        depth: 60,
        shape: 'triangle' as const,
        phase: 0,
      },
    },
    {
      name: 'Texture',
      midiNote: 84,
      midiChannel: 1,
      clockDivider: 0.25,
      steps: createSteps(euclideanRhythm(16, 13)),
      color: '#ec4899',
      volume: 60,
      lfo: {
        enabled: true,
        rate: 0.15,
        depth: 80,
        shape: 'sine' as const,
        phase: 0,
      },
    },
  ],
};

// Drum & Bass preset
export const drumAndBassPreset: PresetDefinition = {
  name: 'Drum & Bass',
  genre: 'Drum & Bass',
  description: 'Fast breakbeat with polyrhythmic bass and percussion',
  bpm: 174,
  swing: 0,
  tracks: [
    {
      name: 'Kick',
      midiNote: 36,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        true, false, false, false, false, false, true, false,
        false, true, false, false, true, false, false, false,
      ]),
      color: '#ef4444',
    },
    {
      name: 'Snare',
      midiNote: 38,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        false, false, false, false, true, false, false, false,
        false, false, true, false, false, false, false, true,
      ]),
      color: '#f97316',
    },
    {
      name: 'Hi-Hat',
      midiNote: 42,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps(Array(16).fill(true),
        Array(16).fill(0).map((_, i) => i % 4 === 0 ? 100 : 70)),
      color: '#3b82f6',
    },
    {
      name: 'Bass',
      midiNote: 36,
      midiChannel: 2,
      clockDivider: 2,
      steps: createSteps(euclideanRhythm(16, 9)),
      color: '#6366f1',
      arpEnabled: true,
      arpMode: 'up' as const,
      arpNotes: [36, 43],
    },
    {
      name: 'Reese',
      midiNote: 40,
      midiChannel: 2,
      clockDivider: 8,
      steps: createSteps([
        true, false, false, false, false, false, false, false,
        false, false, false, false, true, false, false, false,
      ]),
      color: '#8b5cf6',
    },
  ],
};

// Trap preset
export const trapPreset: PresetDefinition = {
  name: 'Trap Vibes',
  genre: 'Trap',
  description: 'Rolling hi-hats with punchy 808s and snares',
  bpm: 140,
  swing: 12,
  tracks: [
    {
      name: '808 Kick',
      midiNote: 36,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        true, false, false, false, false, false, false, false,
        true, false, false, true, false, false, false, false,
      ]),
      color: '#ef4444',
    },
    {
      name: 'Snare',
      midiNote: 38,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        false, false, false, false, true, false, false, false,
        false, false, false, false, true, false, false, false,
      ]),
      color: '#f97316',
    },
    {
      name: 'Hi-Hat Rolls',
      midiNote: 42,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps(Array(16).fill(true).map((_, i) => i % 2 === 0 || i === 6 || i === 14)),
      color: '#3b82f6',
    },
    {
      name: 'HH Triplets',
      midiNote: 42,
      midiChannel: 1,
      clockDivider: 0.5,
      steps: createSteps([
        false, false, false, false, false, false, true, true,
        true, false, false, false, false, false, true, true,
      ]),
      color: '#06b6d4',
      volume: 80,
    },
    {
      name: 'Open HH',
      midiNote: 46,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        false, false, true, false, false, false, true, false,
        false, false, true, false, false, false, true, false,
      ]),
      color: '#14b8a6',
    },
  ],
};

// Breakbeat preset
export const breakbeatPreset: PresetDefinition = {
  name: 'Breakbeat Funk',
  genre: 'Breakbeat',
  description: 'Funky breakbeat with syncopated groove',
  bpm: 128,
  swing: 25,
  tracks: [
    {
      name: 'Kick',
      midiNote: 36,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        true, false, false, true, false, false, false, false,
        true, false, false, false, false, false, true, false,
      ]),
      color: '#ef4444',
    },
    {
      name: 'Snare',
      midiNote: 38,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps([
        false, false, false, false, true, false, true, false,
        false, true, false, false, true, false, false, false,
      ]),
      color: '#f97316',
    },
    {
      name: 'Hi-Hat',
      midiNote: 42,
      midiChannel: 1,
      clockDivider: 1,
      steps: createSteps(Array(16).fill(true),
        [90, 60, 70, 85, 90, 60, 70, 80, 90, 60, 70, 85, 90, 60, 70, 80]),
      color: '#3b82f6',
    },
    {
      name: 'Ride',
      midiNote: 51,
      midiChannel: 1,
      clockDivider: 2,
      steps: createSteps(euclideanRhythm(16, 5)),
      color: '#14b8a6',
    },
  ],
};

export const allPresets: PresetDefinition[] = [
  housePreset,
  technoPreset,
  ambientPreset,
  drumAndBassPreset,
  trapPreset,
  breakbeatPreset,
];
