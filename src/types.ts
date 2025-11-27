// Core type definitions for PolyShift MIDI Sequencer

export interface Step {
  active: boolean;
  velocity: number; // 0-127
  probability: number; // 0-100
  gate: number; // 0-100 (percentage of step length)
  ratchet: number; // 1-8 (subdivisions)
  condition: StepCondition;
  noteLength?: number; // Optional override in ticks
}

export type StepCondition = 'always' | 'every2' | 'every3' | 'every4' | 'random25' | 'random50' | 'random75' | 'skip';

export interface LFO {
  enabled: boolean;
  rate: number; // Hz
  depth: number; // 0-100
  shape: 'triangle' | 'sine' | 'square' | 'sawtooth';
  phase: number; // 0-1
}

export interface Track {
  id: string;
  name: string;
  steps: Step[];
  midiChannel: number; // 1-16
  midiNote: number; // 0-127
  midiDevice: string | null; // MIDI device ID
  midiDeviceName: string;

  // Polyrhythm controls
  clockDivider: number; // 0.25, 0.5, 1, 2, 4, 8, etc.
  offset: number; // Step offset (0-15)

  // Pattern state
  currentStep: number;
  playCount: number; // How many times through the pattern

  // Performance controls
  muted: boolean;
  solo: boolean;
  volume: number; // 0-127 (MIDI velocity multiplier)
  recordArmed: boolean; // For tap-in recording

  // LFO
  lfo: LFO;

  // MIDI Learn
  muteLearnNote: number | null;
  soloLearnNote: number | null;

  // Arpeggiator
  arpEnabled: boolean;
  arpMode: 'up' | 'down' | 'updown' | 'random' | 'chord';
  arpNotes: number[]; // Additional notes for arp
  arpOctaves: number; // 1-4

  // Swing
  swingAmount: number; // 0-100

  // Color for UI
  color: string;
}

export interface Pattern {
  id: string;
  name: string;
  tracks: Track[];
}

export interface Scene {
  id: string;
  name: string;
  trackStates: {
    [trackId: string]: {
      muted: boolean;
      solo: boolean;
      volume: number;
    };
  };
}

export interface TransportState {
  playing: boolean;
  bpm: number;
  swing: number; // Global swing 0-100
  currentTick: number;
  syncScheduled: boolean;
}

export interface MIDILearnState {
  learning: boolean;
  trackId: string | null;
  target: 'mute' | 'solo' | null;
}

export interface ProjectState {
  name: string;
  version: string;
  transport: TransportState;
  tracks: Track[];
  patterns: Pattern[];
  scenes: Scene[];
  currentPatternId: string | null;
  midiLearn: MIDILearnState;
}

// MIDI Device info
export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
}

// Preset types
export interface Preset {
  id: string;
  name: string;
  genre: string;
  description: string;
  tracks: Partial<Track>[];
  bpm: number;
  swing: number;
}

// Timing types
export const PPQN = 24; // Pulses per quarter note
export type ClockCallback = (tick: number) => void;
