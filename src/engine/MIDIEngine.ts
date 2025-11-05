// MIDI Engine using Web MIDI API
import { WebMidi } from 'webmidi';
import type { Output, Input, NoteMessageEvent } from 'webmidi';
import type { MIDIDevice } from '../types';

export interface MIDINote {
  note: number;
  velocity: number;
  channel: number;
  duration?: number;
}

export type MIDIMessageCallback = (note: number, velocity: number, channel: number) => void;

export class MIDIEngine {
  private outputs: Map<string, Output> = new Map();
  private inputs: Map<string, Input> = new Map();
  private enabled: boolean = false;
  private messageCallbacks: Set<MIDIMessageCallback> = new Set();
  private activeNotes: Map<string, number> = new Map();

  async initialize(): Promise<void> {
    try {
      await WebMidi.enable();
      this.enabled = true;
      console.log('Web MIDI enabled');

      // Set up listeners for device changes
      WebMidi.addListener('connected', (e: any) => {
        console.log('MIDI device connected:', e.port.name);
        this.refreshDevices();
      });

      WebMidi.addListener('disconnected', (e: any) => {
        console.log('MIDI device disconnected:', e.port.name);
        this.refreshDevices();
      });

      this.refreshDevices();
    } catch (err) {
      console.error('Failed to enable Web MIDI:', err);
      throw new Error('Web MIDI not supported or permission denied');
    }
  }

  private refreshDevices() {
    // Refresh output devices
    this.outputs.clear();
    WebMidi.outputs.forEach((output: Output) => {
      this.outputs.set(output.id, output);
    });

    // Refresh input devices
    this.inputs.clear();
    WebMidi.inputs.forEach((input: Input) => {
      this.inputs.set(input.id, input);
      // Set up note listeners for MIDI learn
      input.removeListener();
      input.addListener('noteon', (e: NoteMessageEvent) => {
        this.notifyMessageCallbacks(e.note.number, e.note.attack, e.message.channel);
      });
    });
  }

  getOutputDevices(): MIDIDevice[] {
    return Array.from(this.outputs.values()).map(output => ({
      id: output.id,
      name: output.name,
      manufacturer: output.manufacturer || 'Unknown',
      type: 'output' as const,
    }));
  }

  getInputDevices(): MIDIDevice[] {
    return Array.from(this.inputs.values()).map(input => ({
      id: input.id,
      name: input.name,
      manufacturer: input.manufacturer || 'Unknown',
      type: 'input' as const,
    }));
  }

  sendNote(deviceId: string | null, note: MIDINote) {
    if (!this.enabled || !deviceId) return;

    const output = this.outputs.get(deviceId);
    if (!output) {
      console.warn(`MIDI output device ${deviceId} not found`);
      return;
    }

    try {
      // Send note on
      output.sendNoteOn(note.note, {
        channels: note.channel,
        attack: note.velocity / 127,
      });

      // Schedule note off
      if (note.duration) {
        const noteKey = `${deviceId}-${note.channel}-${note.note}`;

        // Cancel any existing note off for this note
        const existing = this.activeNotes.get(noteKey);
        if (existing) {
          window.clearTimeout(existing);
        }

        const timeout = window.setTimeout(() => {
          output.sendNoteOff(note.note, {
            channels: note.channel,
          });
          this.activeNotes.delete(noteKey);
        }, note.duration);

        this.activeNotes.set(noteKey, timeout);
      }
    } catch (err) {
      console.error('Failed to send MIDI note:', err);
    }
  }

  stopNote(deviceId: string | null, note: number, channel: number) {
    if (!this.enabled || !deviceId) return;

    const output = this.outputs.get(deviceId);
    if (!output) return;

    try {
      output.sendNoteOff(note, {
        channels: channel,
      });
    } catch (err) {
      console.error('Failed to stop MIDI note:', err);
    }
  }

  stopAllNotes() {
    // Clear all scheduled note offs
    this.activeNotes.forEach((timeout, key) => {
      window.clearTimeout(timeout);
      const [deviceId, channel, note] = key.split('-');
      this.stopNote(deviceId, parseInt(note), parseInt(channel));
    });
    this.activeNotes.clear();

    // Send all notes off to all outputs
    this.outputs.forEach(output => {
      for (let ch = 1; ch <= 16; ch++) {
        try {
          output.sendAllNotesOff({ channels: ch });
        } catch (err) {
          console.error('Failed to send all notes off:', err);
        }
      }
    });
  }

  sendCC(deviceId: string | null, channel: number, cc: number, value: number) {
    if (!this.enabled || !deviceId) return;

    const output = this.outputs.get(deviceId);
    if (!output) return;

    try {
      output.sendControlChange(cc, value, { channels: channel });
    } catch (err) {
      console.error('Failed to send CC:', err);
    }
  }

  // Subscribe to MIDI messages from inputs (for MIDI learn)
  subscribeMIDIMessages(callback: MIDIMessageCallback): () => void {
    this.messageCallbacks.add(callback);
    return () => {
      this.messageCallbacks.delete(callback);
    };
  }

  private notifyMessageCallbacks(note: number, velocity: number, channel: number) {
    this.messageCallbacks.forEach(callback => {
      try {
        callback(note, velocity, channel);
      } catch (e) {
        console.error('Error in MIDI message callback:', e);
      }
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  destroy() {
    this.stopAllNotes();
    this.messageCallbacks.clear();
    if (this.enabled) {
      WebMidi.disable();
      this.enabled = false;
    }
  }
}

// Singleton instance
export const midiEngine = new MIDIEngine();
