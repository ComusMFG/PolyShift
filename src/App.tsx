import { useEffect } from 'react';
import { Transport } from './components/Transport';
import { Track } from './components/Track';
import { PresetsModal } from './components/PresetsModal';
import { SettingsModal } from './components/SettingsModal';
import { useStore } from './store/useStore';
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

  const { showPresets, showSettings } = useStore();

  return (
    <>
      {/* DEBUG: Direct test element */}
      {showPresets && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'red',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'yellow',
            color: 'black',
            padding: '50px',
            fontSize: '48px',
            fontWeight: 'bold',
            border: '10px solid blue'
          }}>
            DIRECT TEST - CAN YOU SEE THIS?
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

    <PresetsModal />
    <SettingsModal />
  </>
  );
}

export default App;
