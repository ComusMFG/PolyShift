// High-precision timing engine using Web Audio clock
import { PPQN, type ClockCallback } from '../types';

export class TimingEngine {
  private audioContext: AudioContext | null = null;
  private callbacks: Set<ClockCallback> = new Set();
  private bpm: number = 120;
  private playing: boolean = false;
  private currentTick: number = 0;
  private nextTickTime: number = 0;
  private lookahead: number = 25; // ms
  private scheduleAhead: number = 0.1; // seconds
  private timerID: number | null = null;
  private ticksPerBeat: number = PPQN;

  constructor() {
    // Initialize AudioContext on first user interaction
    if (typeof window !== 'undefined') {
      this.initAudioContext();
    }
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API not supported', e);
    }
  }

  private get tickInterval(): number {
    // Calculate interval between ticks in seconds
    const beatsPerSecond = this.bpm / 60;
    const ticksPerSecond = beatsPerSecond * this.ticksPerBeat;
    return 1 / ticksPerSecond;
  }

  private get currentTime(): number {
    return this.audioContext?.currentTime || performance.now() / 1000;
  }

  public setBPM(bpm: number) {
    this.bpm = Math.max(20, Math.min(300, bpm));
  }

  public getBPM(): number {
    return this.bpm;
  }

  public getCurrentTick(): number {
    return this.currentTick;
  }

  public start() {
    if (this.playing) return;

    // Resume AudioContext if suspended (browser autoplay policy)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    this.playing = true;
    this.nextTickTime = this.currentTime;
    this.schedule();
  }

  public stop() {
    this.playing = false;
    if (this.timerID !== null) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  public reset() {
    this.currentTick = 0;
    this.nextTickTime = this.currentTime;
  }

  public sync() {
    // Sync all tracks back to step 0
    this.currentTick = 0;
    this.nextTickTime = this.currentTime;
    this.notifyCallbacks();
  }

  public subscribe(callback: ClockCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private schedule() {
    if (!this.playing) return;

    // Schedule ticks that fall within the lookahead window
    while (this.nextTickTime < this.currentTime + this.scheduleAhead) {
      this.scheduleTick(this.currentTick, this.nextTickTime);
      this.nextTick();
    }

    // Schedule next scheduling check
    this.timerID = window.setTimeout(() => {
      this.schedule();
    }, this.lookahead);
  }

  private scheduleTick(tick: number, time: number) {
    // Calculate exact delay until tick
    const delay = (time - this.currentTime) * 1000;

    setTimeout(() => {
      if (this.playing) {
        this.notifyCallbacks(tick);
      }
    }, Math.max(0, delay));
  }

  private nextTick() {
    this.nextTickTime += this.tickInterval;
    this.currentTick++;
  }

  private notifyCallbacks(tick?: number) {
    const currentTick = tick !== undefined ? tick : this.currentTick;
    this.callbacks.forEach(callback => {
      try {
        callback(currentTick);
      } catch (e) {
        console.error('Error in timing callback:', e);
      }
    });
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  public destroy() {
    this.stop();
    this.callbacks.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
export const timingEngine = new TimingEngine();
