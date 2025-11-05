// Type declarations for webmidi
declare module 'webmidi' {
  export class WebMidi {
    static enable(options?: any): Promise<void>;
    static disable(): void;
    static outputs: Output[];
    static inputs: Input[];
    static addListener(event: string, callback: (e: any) => void): void;
  }

  export interface Output {
    id: string;
    name: string;
    manufacturer: string;
    sendNoteOn(note: number, options?: any): void;
    sendNoteOff(note: number, options?: any): void;
    sendAllNotesOff(options?: any): void;
    sendControlChange(cc: number, value: number, options?: any): void;
  }

  export interface Input {
    id: string;
    name: string;
    manufacturer: string;
    removeListener(): void;
    addListener(event: string, callback: (e: NoteMessageEvent) => void): void;
  }

  export interface NoteMessageEvent {
    note: {
      number: number;
      attack: number;
    };
    message: {
      channel: number;
    };
  }
}
