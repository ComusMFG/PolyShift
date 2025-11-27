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

  const { showPresets, showSettings, setShowPresets, setShowSettings, stop, midiDevices } = useStore();

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

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4 text-center text-sm text-gray-500 mt-12">
        <p>
          PolyShift - Polyrhythmic MIDI Sequencer | Web MIDI API Required
        </p>
        <p className="text-xs mt-1">
          Best experienced in Chrome, Edge, or Opera
        </p>
      </footer>
    </div>
  </>
  );
}

export default App;
