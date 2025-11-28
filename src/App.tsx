import { useEffect } from 'react';
import { Transport } from './components/Transport';
import { Track } from './components/Track';
import { useStore } from './store/useStore';
import { allPresets } from './presets/presetGenerator';
import { sequencerEngine } from './engine/SequencerEngine';
import { timingEngine } from './engine/TimingEngine';
import type { Track as TrackType } from './types';
import './App.css';

function App() {
  const { tracks, playing, midiInitialized, initializeMIDI } = useStore();

  // Initialize MIDI on mount
  useEffect(() => {
    if (!midiInitialized) {
      initializeMIDI().catch(err => {
        console.error('Failed to initialize MIDI:', err);
      });
    }
  }, [midiInitialized, initializeMIDI]);

  // Add keyboard shortcuts (spacebar and 'x' key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Spacebar: Play/Stop
      if (e.code === 'Space') {
        e.preventDefault();
        const { playing, play, stop } = useStore.getState();
        if (playing) {
          stop();
        } else {
          play();
        }
      }

      // 'X' key: Tap-in recording for armed tracks
      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        const { tracks, toggleStep } = useStore.getState();

        // Toggle current step for all armed tracks
        tracks.forEach(track => {
          if (track.recordArmed) {
            toggleStep(track.id, track.currentStep);
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { showPresets, showSettings, showHelp, setShowPresets, setShowSettings, setShowHelp, stop, midiDevices } = useStore();

  const loadPreset = (presetIndex: number) => {
    const preset = allPresets[presetIndex];
    stop();

    // Clear existing tracks
    const currentTracks = useStore.getState().tracks;
    currentTracks.forEach(track => {
      sequencerEngine.removeTrack(track.id);
    });

    // Create new tracks from preset
    const newTracks: TrackType[] = preset.tracks.map((partialTrack, index) => {
      const track: TrackType = {
        id: `track-${Date.now()}-${index}`,
        name: partialTrack.name || `Track ${index + 1}`,
        steps: partialTrack.steps || [],
        midiChannel: partialTrack.midiChannel || 1,
        midiNote: partialTrack.midiNote || 36,
        midiDevice: null,
        midiDeviceName: 'Not assigned',
        clockDivider: partialTrack.clockDivider || 1,
        offset: partialTrack.offset || 0,
        currentStep: 0,
        playCount: 0,
        muted: false,
        solo: false,
        volume: partialTrack.volume || 100,
        recordArmed: false,
        lfo: partialTrack.lfo || {
          enabled: false,
          rate: 0.5,
          depth: 50,
          shape: 'triangle',
          phase: 0,
        },
        muteLearnNote: null,
        soloLearnNote: null,
        arpEnabled: partialTrack.arpEnabled || false,
        arpMode: partialTrack.arpMode || 'up',
        arpNotes: partialTrack.arpNotes || [],
        arpOctaves: 1,
        swingAmount: partialTrack.swingAmount || 0,
        color: partialTrack.color || '#3b82f6',
      };

      sequencerEngine.addTrack(track);
      return track;
    });

    // Update store
    useStore.setState({
      tracks: newTracks,
      bpm: preset.bpm,
      swing: preset.swing,
    });

    timingEngine.setBPM(preset.bpm);
    sequencerEngine.setGlobalSwing(preset.swing);
    setShowPresets(false);
  };

  const inputDevices = midiDevices.filter(d => d.type === 'input');
  const outputDevices = midiDevices.filter(d => d.type === 'output');

  return (
    <>
      {/* Presets Modal */}
      {showPresets && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowPresets(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1f2e',
              borderRadius: '16px',
              maxWidth: '1024px',
              width: '100%',
              maxHeight: '90vh',
              border: '1px solid rgba(107, 114, 128, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid rgb(55, 65, 81)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>Genre Presets</h2>
                <p style={{ fontSize: '14px', color: 'rgb(156, 163, 175)', marginTop: '4px' }}>
                  Start with a pre-made genre template and customize to your taste
                </p>
              </div>
              <button
                onClick={() => setShowPresets(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'rgb(156, 163, 175)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {allPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => loadPreset(index)}
                    style={{
                      textAlign: 'left',
                      padding: '24px',
                      backgroundColor: 'rgb(17, 24, 39)',
                      borderRadius: '12px',
                      border: '2px solid rgb(55, 65, 81)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgb(168, 85, 247)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgb(55, 65, 81)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: '0 0 4px 0' }}>
                          {preset.name}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'rgb(168, 85, 247)', fontWeight: '500', margin: 0 }}>{preset.genre}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'rgb(156, 163, 175)' }}>BPM</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{preset.bpm}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '14px', color: 'rgb(156, 163, 175)', marginBottom: '16px' }}>{preset.description}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                      {preset.tracks.map((track, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: `${track.color}20`,
                            color: track.color,
                          }}
                        >
                          {track.name}
                        </div>
                      ))}
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid rgb(31, 41, 55)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgb(107, 114, 128)' }}>
                      <span>{preset.tracks.length} tracks</span>
                      <span>Swing: {preset.swing}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowSettings(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1f2e',
              borderRadius: '16px',
              maxWidth: '768px',
              width: '100%',
              maxHeight: '90vh',
              border: '1px solid rgba(107, 114, 128, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid rgb(55, 65, 81)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>Settings</h2>
                <p style={{ fontSize: '14px', color: 'rgb(156, 163, 175)', marginTop: '4px' }}>
                  Configure PolyShift preferences
                </p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'rgb(156, 163, 175)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* MIDI Devices Section */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>MIDI Devices</h3>

                  {/* Input Devices */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: 'rgb(209, 213, 219)', marginBottom: '8px' }}>Input Devices</h4>
                    <div style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                      {inputDevices.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {inputDevices.map(device => (
                            <li key={device.id} style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgb(34, 197, 94)' }}></div>
                              {device.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: '14px', color: 'rgb(107, 114, 128)', fontStyle: 'italic', margin: 0 }}>No MIDI input devices detected</p>
                      )}
                    </div>
                  </div>

                  {/* Output Devices */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', color: 'rgb(209, 213, 219)', marginBottom: '8px' }}>Output Devices</h4>
                    <div style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                      {outputDevices.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {outputDevices.map(device => (
                            <li key={device.id} style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgb(59, 130, 246)' }}></div>
                              {device.name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: '14px', color: 'rgb(107, 114, 128)', fontStyle: 'italic', margin: 0 }}>No MIDI output devices detected</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>About</h3>
                  <div style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(55, 65, 81, 0.5)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: 'rgb(156, 163, 175)' }}>Version</span>
                      <span style={{ color: 'white', fontFamily: 'monospace' }}>1.0.0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: 'rgb(156, 163, 175)' }}>Browser</span>
                      <span style={{ color: 'white' }}>{navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'}</span>
                    </div>
                    <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(55, 65, 81, 0.5)' }}>
                      <p style={{ fontSize: '12px', color: 'rgb(107, 114, 128)', margin: 0 }}>
                        PolyShift uses the Web MIDI API. Make sure you've granted MIDI access permissions for the best experience.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>Quick Tips</h3>
                  <div style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                    <ul style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, paddingLeft: '0', listStyle: 'none' }}>
                      <li>• Click center of steps to toggle, corners to edit settings</li>
                      <li>• Right-click Mute/Solo to MIDI learn from your controller</li>
                      <li>• Use clock dividers to create polyrhythmic patterns</li>
                      <li>• Enable LFO for evolving volume modulation</li>
                      <li>• Combine arpeggiator with euclidean patterns for melodies</li>
                      <li>• Save your projects as JSON to back up your work</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowHelp(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1f2e',
              borderRadius: '16px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              border: '1px solid rgba(107, 114, 128, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid rgb(55, 65, 81)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0 }}>PolyShift User Guide</h2>
                <p style={{ fontSize: '14px', color: 'rgb(156, 163, 175)', marginTop: '4px' }}>
                  Complete guide to all features and functionality
                </p>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'rgb(156, 163, 175)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Getting Started */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgb(168, 85, 247)', marginBottom: '12px' }}>🚀 Getting Started</h3>
                  <ul style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Connect MIDI:</strong> PolyShift uses Web MIDI API. Grant MIDI access when prompted.</li>
                    <li><strong>Add Tracks:</strong> Click "+ Add Track" or load a preset from "Presets" button.</li>
                    <li><strong>Assign Devices:</strong> Each track needs a MIDI output device and note number.</li>
                    <li><strong>Create Patterns:</strong> Click steps to activate them, click corners for advanced settings.</li>
                  </ul>
                </div>

                {/* Keyboard Shortcuts */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgb(59, 130, 246)', marginBottom: '12px' }}>⌨️ Keyboard Shortcuts</h3>
                  <div style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(55, 65, 81, 0.5)' }}>
                    <table style={{ width: '100%', fontSize: '14px', color: 'rgb(209, 213, 219)' }}>
                      <tbody>
                        <tr><td style={{ padding: '4px 8px', fontFamily: 'monospace', color: 'rgb(168, 85, 247)' }}>Spacebar</td><td style={{ padding: '4px 8px' }}>Play / Stop</td></tr>
                        <tr><td style={{ padding: '4px 8px', fontFamily: 'monospace', color: 'rgb(168, 85, 247)' }}>X</td><td style={{ padding: '4px 8px' }}>Tap-in: Toggle current step on armed tracks</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Track Controls */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgb(34, 197, 94)', marginBottom: '12px' }}>🎛️ Track Controls</h3>
                  <ul style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Mute:</strong> Silence a track. Right-click to MIDI learn (assign pad controller).</li>
                    <li><strong>Solo (Yellow):</strong> Play only this track. When active, shows "SOLO" text and pulses.</li>
                    <li><strong>Record Arm (Red Circle):</strong> Arm for tap-in recording. Press X to toggle steps live.</li>
                    <li><strong>Clock Divider:</strong> Change track speed. 1x = unity, 2x = faster, 1/2 = slower.</li>
                    <li><strong>Volume Slider:</strong> Control MIDI velocity (0-127).</li>
                  </ul>
                </div>

                {/* Step Programming */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgb(234, 179, 8)', marginBottom: '12px' }}>📝 Step Programming</h3>
                  <ul style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Click Center:</strong> Toggle step on/off (70% of button area).</li>
                    <li><strong>Click Corners:</strong> Open advanced editor for velocity, probability, gate, ratchet, conditions.</li>
                    <li><strong>Velocity:</strong> Note intensity (0-127).</li>
                    <li><strong>Probability:</strong> Chance step will trigger (0-100%).</li>
                    <li><strong>Gate:</strong> How long note plays (0-100% of step length).</li>
                    <li><strong>Ratchet:</strong> Repeat note 1-8 times per step (for rolls).</li>
                    <li><strong>Conditions:</strong> Always, every 2nd/3rd/4th, random percentages, or skip.</li>
                  </ul>
                </div>

                {/* Polyrhythms */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgb(236, 72, 153)', marginBottom: '12px' }}>🎵 Polyrhythms & Clock Dividers</h3>
                  <ul style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>1x:</strong> Normal speed (quarter notes).</li>
                    <li><strong>2x, 4x, 8x:</strong> Faster (double, quadruple, etc.).</li>
                    <li><strong>1/2, 1/4, 1/8:</strong> Slower (half, quarter, etc.).</li>
                    <li><strong>Triplets (3x, 1.5x, 3/4, 1/3):</strong> Create swing/shuffle grooves.</li>
                    <li><strong>Offset:</strong> In advanced settings, shift pattern start position.</li>
                    <li><strong>Tip:</strong> Use different dividers on tracks for complex polyrhythms!</li>
                  </ul>
                </div>

                {/* Advanced Features */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgb(139, 92, 246)', marginBottom: '12px' }}>⚡ Advanced Features</h3>
                  <ul style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Swing:</strong> Global and per-track timing offset for groove (0-100%). 50% ≈ triplet feel.</li>
                    <li><strong>LFO:</strong> Modulate volume with waveforms (sine, triangle, square, sawtooth).</li>
                    <li><strong>Arpeggiator:</strong> Play note sequences (up, down, up/down, random, chord).</li>
                    <li><strong>Euclidean Rhythms:</strong> In advanced editor, generate mathematically perfect patterns.</li>
                    <li><strong>Pattern Fill:</strong> Fill all steps at once in advanced editor.</li>
                    <li><strong>Pattern Clear:</strong> Clear all steps quickly.</li>
                  </ul>
                </div>

                {/* Live Performance */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgb(239, 68, 68)', marginBottom: '12px' }}>🎭 Live Performance</h3>
                  <ul style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Tap-In Recording:</strong> Arm tracks (red button), press X to toggle steps while playing.</li>
                    <li><strong>MIDI Learn:</strong> Right-click Mute/Solo to assign pads from controller.</li>
                    <li><strong>Sync Button:</strong> Reset all tracks to step 0 simultaneously.</li>
                    <li><strong>Solo Tracks:</strong> Instantly isolate tracks. Yellow + "SOLO" text when active.</li>
                    <li><strong>On-the-fly Adjustments:</strong> Change BPM, swing, dividers while playing.</li>
                  </ul>
                </div>

                {/* Projects & Presets */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgb(6, 182, 212)', marginBottom: '12px' }}>💾 Projects & Presets</h3>
                  <ul style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, paddingLeft: '20px' }}>
                    <li><strong>Save Project:</strong> Export entire project as JSON file.</li>
                    <li><strong>Load Project:</strong> Import saved projects.</li>
                    <li><strong>Genre Presets:</strong> Pre-made templates for House, Techno, D&B, Ambient, etc.</li>
                    <li><strong>Duplicate Track:</strong> Copy button creates exact duplicate for variations.</li>
                  </ul>
                </div>

                {/* Tips & Tricks */}
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', padding: '16px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'rgb(96, 165, 250)', marginBottom: '12px' }}>💡 Tips & Tricks</h3>
                  <ul style={{ fontSize: '14px', color: 'rgb(209, 213, 219)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, paddingLeft: '20px' }}>
                    <li>Start with a preset and modify it to learn the workflow.</li>
                    <li>Use probability (50-80%) for humanized, less robotic patterns.</li>
                    <li>Combine clock dividers across tracks for polyrhythmic magic.</li>
                    <li>Lower gate values (30-60%) create staccato, punchy sounds.</li>
                    <li>Use ratchets on snares/hats for fills and transitions.</li>
                    <li>LFO on volume creates tremolo and evolving dynamics.</li>
                    <li>Save often! Export projects before major changes.</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#0f1419] text-white">
        <Transport />

      <main className="max-w-[1800px] mx-auto p-6">
        {tracks.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-400 mb-4">
              No tracks yet
            </h2>
            <p className="text-gray-500 mb-6">
              Click "Add Track" or load a preset to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tracks.map((track) => (
              <Track key={track.id} track={track} isPlaying={playing} />
            ))}
          </div>
        )}

        {/* Instructions */}
        {!midiInitialized && tracks.length > 0 && (
          <div className="mt-8 p-6 bg-blue-900/20 border-2 border-blue-500 rounded-xl">
            <h3 className="text-lg font-bold text-blue-400 mb-2">
              Getting Started
            </h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Click a step to toggle it on/off</li>
              <li>• Click a highlighted step to edit velocity, gate, probability, etc.</li>
              <li>• Right-click Mute/Solo buttons to MIDI learn from your controller</li>
              <li>• Adjust clock divider for polyrhythms (1/16 to 4x)</li>
              <li>• Enable LFO for evolving volume modulation</li>
              <li>• Use the arpeggiator to create melodic patterns</li>
              <li>• Save and load your projects as JSON files</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  </>
  );
}

export default App;
