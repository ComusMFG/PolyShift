# PolyShift 🎵

**An innovative polyrhythmic MIDI sequencer webapp** that brings shift register-style pattern sequencing with advanced features for creating evolving, experimental electronic music.

![PolyShift](https://img.shields.io/badge/status-beta-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![React](https://img.shields.io/badge/React-19-61dafb) ![Web MIDI](https://img.shields.io/badge/Web%20MIDI-API-purple)

## ✨ Key Features

### Core Sequencing
- **16-step shift register sequencer** per track with visual feedback
- **Polyrhythmic capabilities** - clock dividers from 1/16 to 4x per track
- **Real-time step input** - tap in beats while sequencing or toggle manually
- **Multiple tracks** - unlimited tracks, each routable to different MIDI devices/notes
- **Precision timing** - Web Audio clock-based engine for tight synchronization

### Advanced Features
- 🎛️ **LFO Modulation** - Triangle, sine, square, sawtooth wave volume automation per track
- 🎹 **Arpeggiator** - Multiple modes (up, down, up/down, random, chord) with custom note sets
- 🎲 **Per-step controls**:
  - Velocity (1-127)
  - Gate length (1-100%)
  - Probability (0-100%)
  - Ratcheting (1-8x subdivisions)
  - Conditional triggers (every 2nd, 3rd, 4th, random, skip)
- 🎵 **Swing/Groove** - Global and per-track swing controls
- 🎚️ **Pattern offset** - Shift patterns 0-15 steps per track
- 🎯 **MIDI Learn** - Map mute/solo to MIDI controllers
- 💾 **Save/Load** - Export and import projects as JSON

### AI-Powered Presets
- **Genre templates** with intelligent patterns:
  - House Foundation
  - Industrial Techno
  - Ambient/IDM Textures
  - Drum & Bass
  - Trap Vibes
  - Breakbeat Funk
- **Euclidean rhythm generation** for mathematical patterns
- **One-click randomization** with musically-aware constraints

### Performance Controls
- ⏯️ **Transport** - Play/Stop/Sync with BPM control (20-300)
- 🔇 **Mute/Solo** - Per-track performance controls
- 🎭 **Volume control** - Per-track MIDI velocity scaling
- 🔄 **Global sync** - Instantly resync all tracks to step 0

## 🎮 Quick Start

### Prerequisites
- **Web Browser**: Chrome, Edge, or Opera (Web MIDI API support required)
- **MIDI Devices**: One or more MIDI synthesizers, drum machines, or DAWs with virtual MIDI
- **Node.js**: 18+ for development

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### First Run

1. **Connect MIDI devices** before opening the app
2. **Open the app** in a supported browser
3. **Allow MIDI access** when prompted
4. **Load a preset** or create your own patterns!

## 📖 Usage Guide

### Basic Workflow

1. **Add tracks** - Click "+ Track" button
2. **Assign MIDI routing**:
   - Select MIDI output device
   - Set MIDI note (0-127)
   - Set MIDI channel (1-16)
3. **Create patterns**:
   - Click steps to activate/deactivate
   - Click active steps to edit parameters
4. **Set polyrhythms**:
   - Adjust clock divider dropdown per track
   - 1/4 = normal 16th notes
   - 1/8 = half speed
   - 2x = double speed
5. **Press Play** and enjoy!

### Advanced Techniques

#### Polyrhythmic Patterns
```
Track 1: Kick - 1/4 (normal)
Track 2: Hi-hat - 1/16 (4x faster)
Track 3: Perc - 1/2 (half speed, offset by 3 steps)
Result: Evolving, never-repeating groove
```

#### LFO Volume Automation
1. Click **Settings** icon on a track
2. Enable **LFO**
3. Set **Rate** (0.1-10 Hz) and **Depth** (0-100%)
4. Choose **Shape** (triangle recommended for volume)
5. Result: Breathing, evolving textures

#### Step Probability for Variation
1. Click an active step
2. Reduce **Probability** to 50-75%
3. Result: Subtle variation on each loop

#### Ratcheting for Rolls
1. Click a step
2. Increase **Ratchet** to 2-4x
3. Result: Snare rolls, hi-hat fills

### MIDI Learn

1. Right-click **Mute** or **Solo** button
2. Press a pad on your MIDI controller
3. That pad now controls the track!

## 🏗️ Architecture

### Technology Stack
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Web MIDI API** - MIDI I/O
- **Web Audio API** - Precision timing
- **Tailwind CSS** - Modern styling
- **Vite** - Build tool

### Engine Design

```
┌─────────────────┐
│  TimingEngine   │ ◄── Web Audio clock-based precision
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SequencerEngine │ ◄── Polyrhythm logic, LFO, swing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   MIDIEngine    │ ◄── Web MIDI API interface
└─────────────────┘
```

**Key innovations:**
- Lookahead scheduling (25ms) for jitter-free timing
- Per-track clock divider state tracking
- Phase-accurate LFO generation
- Euclidean rhythm algorithms for presets

## 🎛️ Controls Reference

### Transport
| Control | Function |
|---------|----------|
| Play/Stop | Start/stop sequencer |
| Sync | Reset all tracks to step 0 |
| BPM | Set global tempo (20-300) |
| Global Swing | Apply swing to all tracks (0-100%) |

### Track Controls
| Control | Function |
|---------|----------|
| Name | Click to rename |
| Device | Select MIDI output |
| Note | MIDI note number |
| Channel | MIDI channel (1-16) |
| Clock | Multiplier/divider |
| Mute | Silence track |
| Solo | Solo track |
| Volume | MIDI velocity (0-127) |

### Step Parameters
| Parameter | Range | Description |
|-----------|-------|-------------|
| Velocity | 1-127 | Note velocity |
| Gate | 1-100% | Note length |
| Probability | 0-100% | Trigger chance |
| Ratchet | 1-8 | Subdivisions |
| Condition | Various | Trigger logic |

## 🎵 Musical Applications

### House Production
```
Kick: 4-on-floor (steps 1, 5, 9, 13)
Hi-hat: 16th notes with velocity dynamics
Clap: Backbeat (steps 5, 13)
Perc: Euclidean pattern (5/16) with 50% probability
```

### Techno
```
Kick: Straight 16ths
Open HH: Polyrhythmic (clock ÷ 2, offset 3)
Perc 1: Euclidean (11/16)
Perc 2: Fast clock (× 2) with ratcheting
```

### Ambient/IDM
```
Bass: Slow (clock ÷ 8) with LFO (0.2 Hz, 60% depth)
Melody: Arpeggiator up/down with probability
Texture: Fast poly (clock ÷ 4) with heavy LFO
All tracks: Swing 15-25%
```

## 🔧 Development

### Project Structure
```
src/
├── components/       # React UI components
│   ├── Track.tsx         # Track card with sequencer
│   ├── StepButton.tsx    # Individual step
│   ├── Transport.tsx     # Playback controls
│   └── ...
├── engine/          # Core sequencer logic
│   ├── TimingEngine.ts   # Precision clock
│   ├── MIDIEngine.ts     # MIDI I/O
│   └── SequencerEngine.ts # Pattern playback
├── store/           # Zustand state
│   └── useStore.ts       # Global app state
├── presets/         # AI preset generators
│   └── presetGenerator.ts
└── types.ts         # TypeScript definitions
```

### Key Concepts

**Ticks**: The sequencer runs at 24 PPQN (pulses per quarter note). Each 16th note = 6 ticks.

**Clock Dividers**: Tracks can run at different speeds:
- `0.25` = 1/16 (super slow)
- `0.5` = 1/8
- `1` = 1/4 (normal)
- `2` = 1/2
- `4` = 1x (same as BPM)
- `8` = 2x (double)

**LFO Phase**: Each track maintains its own LFO phase, updated per tick based on LFO rate.

## 🚀 Deployment

### Static Hosting (Recommended)
```bash
npm run build
# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3 + CloudFront
```

### Electron (Future)
For better MIDI timing and offline use, consider packaging as Electron app.

## 🐛 Troubleshooting

### MIDI Not Working
1. ✅ Use Chrome, Edge, or Opera (Firefox/Safari don't support Web MIDI)
2. ✅ Connect MIDI devices BEFORE opening the app
3. ✅ Allow MIDI access when prompted
4. ✅ Check MIDI device is on and properly connected
5. ✅ Try refreshing the page

### Timing Issues
- Web timing has ~10ms jitter (acceptable for most music)
- Close other browser tabs for better performance
- Consider lower BPMs for better accuracy
- For pro-level timing, consider Electron build (future)

### No Sound
- PolyShift only sends MIDI - it doesn't generate sound
- Ensure your MIDI device/DAW is receiving and producing audio
- Check MIDI routing in your DAW

## 🎓 Tips & Tricks

1. **Start Simple** - Begin with one kick track, add complexity gradually
2. **Polyrhythm Magic** - Try clock ÷2 with offset 3 for instant funk
3. **LFO Everything** - Slow LFOs (0.1-0.5 Hz) create evolving textures
4. **Probability = Life** - 70-80% probability prevents mechanical feel
5. **Euclidean Rhythms** - Use presets as starting points, then modify
6. **MIDI Learn** - Map mutes for live performance
7. **Save Often** - Export JSON backups of your best patterns
8. **Swing Sweet Spot** - 8-15% for house, 20-30% for breakbeat

## 🗺️ Roadmap

- [ ] Pattern chaining/scenes
- [ ] MIDI CC automation lanes
- [ ] Euclidean rhythm generator UI
- [ ] More preset genres (Jungle, Trance, Experimental)
- [ ] Tap tempo implementation
- [ ] Export to MIDI file
- [ ] Electron app for better timing
- [ ] Collaborative features
- [ ] VST plugin version

## 🤝 Contributing

Contributions welcome! Areas of interest:
- New preset generators
- UI/UX improvements
- MIDI timing optimizations
- Additional step conditions
- Documentation

## 📝 License

MIT License - See LICENSE file

## 🙏 Credits

Built with:
- [Web MIDI API](https://www.w3.org/TR/webmidi/)
- [WebMidi.js](https://webmidijs.org/)
- [React](https://react.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

Inspired by:
- Roland TR-series step sequencers
- Eurorack shift registers
- Monome Grid patterns
- Elektron sequencers

---

**Made with ❤️ for experimental music producers**

*"In the hands of the right user, simple tools create complex art."*
