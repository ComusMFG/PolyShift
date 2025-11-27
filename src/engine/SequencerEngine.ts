// Main sequencer engine - orchestrates timing, MIDI, and track playback
import { timingEngine } from './TimingEngine';
import { midiEngine } from './MIDIEngine';
import type { Track, Step } from '../types';

const TICKS_PER_STEP = 6; // 24 PPQN / 4 steps per beat = 6 ticks per 16th note

export class SequencerEngine {
  private tracks: Map<string, Track> = new Map();
  private trackStepTimers: Map<string, number> = new Map(); // Last tick each track stepped
  private trackInternalSteps: Map<string, number> = new Map(); // Track's internal step counter
  private lfoPhases: Map<string, number> = new Map(); // Current LFO phase per track
  private globalSwing: number = 0; // 0-100
  private unsubscribeTiming: (() => void) | null = null;
  private storeUpdateCallback: ((trackId: string, currentStep: number) => void) | null = null;

  constructor() {
    // Subscribe to timing engine
    this.unsubscribeTiming = timingEngine.subscribe(this.onTick.bind(this));
  }

  private onTick(tick: number) {
    // Process each track
    this.tracks.forEach((track) => {
      if (track.muted || !this.shouldTrackStep(track, tick)) {
        return;
      }

      this.processTrack(track, tick);
    });
  }

  private shouldTrackStep(track: Track, tick: number): boolean {
    // Calculate if this track should step based on its clock divider
    const ticksPerTrackStep = TICKS_PER_STEP / track.clockDivider;
    const lastStepTick = this.trackStepTimers.get(track.id) ?? -ticksPerTrackStep;

    return tick - lastStepTick >= ticksPerTrackStep;
  }

  private processTrack(track: Track, tick: number) {
    // Update last step time
    this.trackStepTimers.set(track.id, tick);

    // Get or initialize internal step counter
    let internalStep = this.trackInternalSteps.get(track.id) ?? 0;

    // Apply offset
    const effectiveStep = (internalStep + track.offset) % track.steps.length;
    const step = track.steps[effectiveStep];

    // Update current step for UI
    const previousStep = track.currentStep;
    track.currentStep = effectiveStep;

    // Notify store if step changed
    if (previousStep !== effectiveStep && this.storeUpdateCallback) {
      this.storeUpdateCallback(track.id, effectiveStep);
    }

    // Check step condition
    if (!this.evaluateStepCondition(step, track.playCount)) {
      this.advanceTrackStep(track, internalStep);
      return;
    }

    // Check probability
    if (step.probability < 100 && Math.random() * 100 > step.probability) {
      this.advanceTrackStep(track, internalStep);
      return;
    }

    // Play step if active
    if (step.active) {
      this.playStep(track, step, tick);
    }

    this.advanceTrackStep(track, internalStep);
  }

  private advanceTrackStep(track: Track, currentStep: number) {
    const nextStep = (currentStep + 1) % track.steps.length;
    this.trackInternalSteps.set(track.id, nextStep);

    // Increment play count when loop completes
    if (nextStep === 0) {
      track.playCount++;
    }
  }

  private evaluateStepCondition(step: Step, playCount: number): boolean {
    switch (step.condition) {
      case 'always':
        return true;
      case 'every2':
        return playCount % 2 === 0;
      case 'every3':
        return playCount % 3 === 0;
      case 'every4':
        return playCount % 4 === 0;
      case 'random25':
        return Math.random() < 0.25;
      case 'random50':
        return Math.random() < 0.5;
      case 'random75':
        return Math.random() < 0.75;
      case 'skip':
        return false;
      default:
        return true;
    }
  }

  private playStep(track: Track, step: Step, _tick: number) {
    // Calculate swing offset
    const swingOffset = this.calculateSwingOffset(track);

    // Calculate LFO modulation
    const lfoModulation = this.calculateLFO(track, _tick);

    // Calculate final velocity with LFO
    const baseVelocity = step.velocity;
    const volumeMultiplier = track.volume / 127;
    const finalVelocity = Math.round(
      baseVelocity * volumeMultiplier * lfoModulation
    );

    if (finalVelocity === 0) return;

    // Handle ratcheting
    const ratchetCount = step.ratchet || 1;
    const ratchetDelay = (TICKS_PER_STEP / track.clockDivider) / ratchetCount;

    for (let i = 0; i < ratchetCount; i++) {
      const delay = (swingOffset + (ratchetDelay * i)) * this.getTickDuration();

      setTimeout(() => {
        this.sendMIDINote(track, step, finalVelocity);
      }, delay);
    }
  }

  private calculateSwingOffset(track: Track): number {
    // Combine global and track swing
    const totalSwing = ((this.globalSwing + track.swingAmount) / 200) * 100;

    // Apply swing to even-numbered 16th notes (steps 1, 3, 5, etc.)
    const stepInBeat = track.currentStep % 4;
    if (stepInBeat % 2 === 1) {
      // Swing: delay by percentage of step length
      return (totalSwing / 100) * (TICKS_PER_STEP / 2);
    }

    return 0;
  }

  private calculateLFO(track: Track, _tick: number): number {
    if (!track.lfo.enabled || track.lfo.depth === 0) {
      return 1.0;
    }

    // Get or initialize phase
    let phase = this.lfoPhases.get(track.id) ?? 0;

    // Calculate phase increment based on LFO rate
    const tickDuration = this.getTickDuration() / 1000; // seconds
    const phaseIncrement = track.lfo.rate * tickDuration;
    phase = (phase + phaseIncrement) % 1.0;

    this.lfoPhases.set(track.id, phase);

    // Generate waveform
    let lfoValue: number;
    switch (track.lfo.shape) {
      case 'triangle':
        lfoValue = 1 - Math.abs((phase * 4) % 4 - 2) / 2;
        break;
      case 'sine':
        lfoValue = (Math.sin(phase * Math.PI * 2) + 1) / 2;
        break;
      case 'square':
        lfoValue = phase < 0.5 ? 1 : 0;
        break;
      case 'sawtooth':
        lfoValue = phase;
        break;
      default:
        lfoValue = 0.5;
    }

    // Apply depth (0-100 becomes 0-1)
    const depth = track.lfo.depth / 100;
    const minValue = 1 - depth;

    return minValue + (lfoValue * depth);
  }

  private sendMIDINote(track: Track, step: Step, velocity: number) {
    if (!track.midiDevice) return;

    // Calculate note duration based on gate
    const stepDuration = (TICKS_PER_STEP / track.clockDivider) * this.getTickDuration();
    const noteDuration = (step.gate / 100) * stepDuration;

    // Handle arpeggiator
    const notes = this.getArpeggiatedNotes(track);

    notes.forEach((note) => {
      midiEngine.sendNote(track.midiDevice, {
        note,
        velocity,
        channel: track.midiChannel,
        duration: noteDuration,
      });
    });
  }

  private getArpeggiatedNotes(track: Track): number[] {
    if (!track.arpEnabled || track.arpNotes.length === 0) {
      return [track.midiNote];
    }

    const notes: number[] = [track.midiNote, ...track.arpNotes];
    const arpIndex = track.currentStep % notes.length;

    switch (track.arpMode) {
      case 'up':
        return [notes[arpIndex]];
      case 'down':
        return [notes[notes.length - 1 - arpIndex]];
      case 'updown': {
        const pattern = [...notes, ...notes.slice(1, -1).reverse()];
        return [pattern[track.currentStep % pattern.length]];
      }
      case 'random':
        return [notes[Math.floor(Math.random() * notes.length)]];
      case 'chord':
        return notes;
      default:
        return [track.midiNote];
    }
  }

  private getTickDuration(): number {
    // Duration of one tick in milliseconds
    const bpm = timingEngine.getBPM();
    const beatsPerSecond = bpm / 60;
    const ticksPerSecond = beatsPerSecond * 24; // PPQN
    return 1000 / ticksPerSecond;
  }

  // Public API
  public setStoreUpdateCallback(callback: (trackId: string, currentStep: number) => void) {
    this.storeUpdateCallback = callback;
  }

  public addTrack(track: Track) {
    this.tracks.set(track.id, track);
    this.trackStepTimers.set(track.id, -TICKS_PER_STEP);
    this.trackInternalSteps.set(track.id, 0);
    this.lfoPhases.set(track.id, 0);
  }

  public removeTrack(trackId: string) {
    this.tracks.delete(trackId);
    this.trackStepTimers.delete(trackId);
    this.trackInternalSteps.delete(trackId);
    this.lfoPhases.delete(trackId);
  }

  public updateTrack(track: Track) {
    this.tracks.set(track.id, track);
  }

  public getTrack(trackId: string): Track | undefined {
    return this.tracks.get(trackId);
  }

  public setGlobalSwing(swing: number) {
    this.globalSwing = Math.max(0, Math.min(100, swing));
  }

  public syncAllTracks() {
    // Reset all tracks to step 0
    this.tracks.forEach((track) => {
      track.currentStep = 0;
      track.playCount = 0;
      this.trackStepTimers.set(track.id, -TICKS_PER_STEP);
      this.trackInternalSteps.set(track.id, 0);
      this.lfoPhases.set(track.id, 0);
    });

    timingEngine.sync();
  }

  public panic() {
    // Stop all MIDI notes
    midiEngine.stopAllNotes();
  }

  public destroy() {
    this.panic();
    if (this.unsubscribeTiming) {
      this.unsubscribeTiming();
      this.unsubscribeTiming = null;
    }
    this.tracks.clear();
    this.trackStepTimers.clear();
    this.trackInternalSteps.clear();
    this.lfoPhases.clear();
  }
}

// Singleton instance
export const sequencerEngine = new SequencerEngine();
