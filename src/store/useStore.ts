// Zustand store for application state
import { create } from 'zustand';
import type { Track, Step, MIDIDevice, MIDILearnState, Scene } from '../types';
import { timingEngine } from '../engine/TimingEngine';
import { midiEngine } from '../engine/MIDIEngine';
import { sequencerEngine } from '../engine/SequencerEngine';

interface AppState {
  // Transport
  playing: boolean;
  bpm: number;
  swing: number;

  // Tracks
  tracks: Track[];
  selectedTrackId: string | null;

  // MIDI
  midiDevices: MIDIDevice[];
  midiInitialized: boolean;
  midiLearn: MIDILearnState;

  // Scenes
  scenes: Scene[];
  currentSceneId: string | null;

  // UI
  showSettings: boolean;
  showPresets: boolean;
  showHelp: boolean;

  // Actions
  initializeMIDI: () => Promise<void>;
  play: () => void;
  stop: () => void;
  setBPM: (bpm: number) => void;
  setSwing: (swing: number) => void;
  sync: () => void;

  addTrack: () => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  duplicateTrack: (trackId: string) => void;
  selectTrack: (trackId: string | null) => void;
  updateTrackCurrentStep: (trackId: string, currentStep: number) => void;

  toggleStep: (trackId: string, stepIndex: number) => void;
  updateStep: (trackId: string, stepIndex: number, updates: Partial<Step>) => void;
  clearTrack: (trackId: string) => void;

  startMIDILearn: (trackId: string, target: 'mute' | 'solo') => void;
  stopMIDILearn: () => void;

  saveScene: (name: string) => void;
  loadScene: (sceneId: string) => void;
  deleteScene: (sceneId: string) => void;

  saveProject: () => void;
  loadProject: (data: string) => void;

  setShowSettings: (show: boolean) => void;
  setShowPresets: (show: boolean) => void;
  setShowHelp: (show: boolean) => void;
}

const createDefaultStep = (): Step => ({
  active: false,
  velocity: 100,
  probability: 100,
  gate: 80,
  ratchet: 1,
  condition: 'always',
});

const createDefaultTrack = (id: string, index: number): Track => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];

  return {
    id,
    name: `Track ${index + 1}`,
    steps: Array(16).fill(null).map(() => createDefaultStep()),
    midiChannel: 1,
    midiNote: 36 + index,
    midiDevice: null,
    midiDeviceName: 'Not assigned',
    clockDivider: 1,
    offset: 0,
    currentStep: 0,
    playCount: 0,
    muted: false,
    solo: false,
    volume: 100,
    recordArmed: false,
    lfo: {
      enabled: false,
      rate: 0.5,
      depth: 50,
      shape: 'triangle',
      phase: 0,
    },
    muteLearnNote: null,
    soloLearnNote: null,
    arpEnabled: false,
    arpMode: 'up',
    arpNotes: [],
    arpOctaves: 1,
    swingAmount: 0,
    color: colors[index % colors.length],
  };
};

let midiLearnUnsubscribe: (() => void) | null = null;

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  playing: false,
  bpm: 120,
  swing: 0,
  tracks: [
    createDefaultTrack('track-1', 0),
    createDefaultTrack('track-2', 1),
    createDefaultTrack('track-3', 2),
    createDefaultTrack('track-4', 3),
  ],
  selectedTrackId: null,
  midiDevices: [],
  midiInitialized: false,
  midiLearn: {
    learning: false,
    trackId: null,
    target: null,
  },
  scenes: [],
  currentSceneId: null,
  showSettings: false,
  showPresets: false,
  showHelp: false,

  // Actions
  initializeMIDI: async () => {
    try {
      await midiEngine.initialize();
      const devices = [
        ...midiEngine.getOutputDevices(),
        ...midiEngine.getInputDevices(),
      ];
      set({ midiDevices: devices, midiInitialized: true });

      // Set up callback for real-time step updates
      sequencerEngine.setStoreUpdateCallback((trackId, currentStep) => {
        get().updateTrackCurrentStep(trackId, currentStep);
      });

      // Initialize tracks in sequencer
      get().tracks.forEach(track => {
        sequencerEngine.addTrack(track);
      });
    } catch (err) {
      console.error('MIDI initialization failed:', err);
    }
  },

  play: () => {
    timingEngine.start();
    set({ playing: true });
  },

  stop: () => {
    timingEngine.stop();
    midiEngine.stopAllNotes();
    set({ playing: false });
  },

  setBPM: (bpm) => {
    timingEngine.setBPM(bpm);
    set({ bpm });
  },

  setSwing: (swing) => {
    sequencerEngine.setGlobalSwing(swing);
    set({ swing });
  },

  sync: () => {
    sequencerEngine.syncAllTracks();
    set(state => ({
      tracks: state.tracks.map(t => ({ ...t, currentStep: 0, playCount: 0 })),
    }));
  },

  addTrack: () => {
    const state = get();
    const newTrack = createDefaultTrack(`track-${Date.now()}`, state.tracks.length);
    sequencerEngine.addTrack(newTrack);
    set({ tracks: [...state.tracks, newTrack] });
  },

  removeTrack: (trackId) => {
    sequencerEngine.removeTrack(trackId);
    set(state => ({
      tracks: state.tracks.filter(t => t.id !== trackId),
      selectedTrackId: state.selectedTrackId === trackId ? null : state.selectedTrackId,
    }));
  },

  updateTrack: (trackId, updates) => {
    set(state => {
      const tracks = state.tracks.map(t =>
        t.id === trackId ? { ...t, ...updates } : t
      );
      const updatedTrack = tracks.find(t => t.id === trackId);
      if (updatedTrack) {
        sequencerEngine.updateTrack(updatedTrack);
      }
      return { tracks };
    });
  },

  duplicateTrack: (trackId) => {
    const state = get();
    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return;

    const newTrack = {
      ...track,
      id: `track-${Date.now()}`,
      name: `${track.name} (copy)`,
      currentStep: 0,
      playCount: 0,
    };
    sequencerEngine.addTrack(newTrack);
    set({ tracks: [...state.tracks, newTrack] });
  },

  selectTrack: (trackId) => {
    set({ selectedTrackId: trackId });
  },

  updateTrackCurrentStep: (trackId, currentStep) => {
    set(state => ({
      tracks: state.tracks.map(t =>
        t.id === trackId ? { ...t, currentStep } : t
      ),
    }));
  },

  toggleStep: (trackId, stepIndex) => {
    set(state => {
      const tracks = state.tracks.map(t => {
        if (t.id === trackId) {
          const steps = [...t.steps];
          steps[stepIndex] = { ...steps[stepIndex], active: !steps[stepIndex].active };
          const updated = { ...t, steps };
          sequencerEngine.updateTrack(updated);
          return updated;
        }
        return t;
      });
      return { tracks };
    });
  },

  updateStep: (trackId, stepIndex, updates) => {
    set(state => {
      const tracks = state.tracks.map(t => {
        if (t.id === trackId) {
          const steps = [...t.steps];
          steps[stepIndex] = { ...steps[stepIndex], ...updates };
          const updated = { ...t, steps };
          sequencerEngine.updateTrack(updated);
          return updated;
        }
        return t;
      });
      return { tracks };
    });
  },

  clearTrack: (trackId) => {
    set(state => {
      const tracks = state.tracks.map(t => {
        if (t.id === trackId) {
          const steps = Array(16).fill(null).map(() => createDefaultStep());
          const updated = { ...t, steps };
          sequencerEngine.updateTrack(updated);
          return updated;
        }
        return t;
      });
      return { tracks };
    });
  },

  startMIDILearn: (trackId, target) => {
    // Stop any existing learn
    if (midiLearnUnsubscribe) {
      midiLearnUnsubscribe();
    }

    // Subscribe to MIDI messages
    midiLearnUnsubscribe = midiEngine.subscribeMIDIMessages((note) => {
      const state = get();
      if (state.midiLearn.learning && state.midiLearn.trackId) {
        // Assign the note
        const updates = target === 'mute'
          ? { muteLearnNote: note }
          : { soloLearnNote: note };

        get().updateTrack(state.midiLearn.trackId, updates);
        get().stopMIDILearn();
      }
    });

    set({ midiLearn: { learning: true, trackId, target } });
  },

  stopMIDILearn: () => {
    if (midiLearnUnsubscribe) {
      midiLearnUnsubscribe();
      midiLearnUnsubscribe = null;
    }
    set({ midiLearn: { learning: false, trackId: null, target: null } });
  },

  saveScene: (name) => {
    const state = get();
    const scene: Scene = {
      id: `scene-${Date.now()}`,
      name,
      trackStates: {},
    };

    state.tracks.forEach(track => {
      scene.trackStates[track.id] = {
        muted: track.muted,
        solo: track.solo,
        volume: track.volume,
      };
    });

    set({ scenes: [...state.scenes, scene] });
  },

  loadScene: (sceneId) => {
    const state = get();
    const scene = state.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    set(state => ({
      tracks: state.tracks.map(t => {
        const sceneState = scene.trackStates[t.id];
        if (sceneState) {
          const updated = { ...t, ...sceneState };
          sequencerEngine.updateTrack(updated);
          return updated;
        }
        return t;
      }),
      currentSceneId: sceneId,
    }));
  },

  deleteScene: (sceneId) => {
    set(state => ({
      scenes: state.scenes.filter(s => s.id !== sceneId),
      currentSceneId: state.currentSceneId === sceneId ? null : state.currentSceneId,
    }));
  },

  saveProject: () => {
    const state = get();
    const project = {
      version: '1.0.0',
      bpm: state.bpm,
      swing: state.swing,
      tracks: state.tracks,
      scenes: state.scenes,
    };

    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polyshift-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  loadProject: (data) => {
    try {
      const project = JSON.parse(data);

      // Stop playback
      get().stop();

      // Clear existing tracks
      get().tracks.forEach(track => {
        sequencerEngine.removeTrack(track.id);
      });

      // Load new tracks
      project.tracks.forEach((track: Track) => {
        sequencerEngine.addTrack(track);
      });

      set({
        bpm: project.bpm,
        swing: project.swing,
        tracks: project.tracks,
        scenes: project.scenes || [],
      });

      timingEngine.setBPM(project.bpm);
      sequencerEngine.setGlobalSwing(project.swing);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  },

  setShowSettings: (show) => set({ showSettings: show }),
  setShowPresets: (show) => set({ showPresets: show }),
  setShowHelp: (show) => set({ showHelp: show }),
}));
