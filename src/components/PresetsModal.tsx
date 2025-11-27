import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { allPresets } from '../presets/presetGenerator';
import { sequencerEngine } from '../engine/SequencerEngine';
import { timingEngine } from '../engine/TimingEngine';
import type { Track } from '../types';

export const PresetsModal = () => {
  const { showPresets, setShowPresets, stop } = useStore();

  console.log('PresetsModal render, showPresets:', showPresets);

  if (!showPresets) {
    console.log('PresetsModal: returning null because showPresets is false');
    return null;
  }

  console.log('PresetsModal: rendering modal content');

  const loadPreset = (presetIndex: number) => {
    const preset = allPresets[presetIndex];

    // Stop playback
    stop();

    // Clear existing tracks
    const currentTracks = useStore.getState().tracks;
    currentTracks.forEach(track => {
      sequencerEngine.removeTrack(track.id);
    });

    // Create new tracks from preset
    const newTracks: Track[] = preset.tracks.map((partialTrack, index) => {
      const track: Track = {
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

    // Update engines
    timingEngine.setBPM(preset.bpm);
    sequencerEngine.setGlobalSwing(preset.swing);

    setShowPresets(false);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(255, 0, 0, 0.9)',
        zIndex: 999999,
        border: '10px solid lime',
      }}
      onClick={() => {
        console.log('Modal overlay clicked');
        setShowPresets(false);
      }}
    >
      <div style={{
        position: 'absolute',
        top: '50px',
        left: '50px',
        backgroundColor: 'yellow',
        color: 'black',
        padding: '20px',
        fontSize: '24px',
        zIndex: 9999999,
        border: '5px solid blue'
      }}>
        TEST - CAN YOU SEE THIS?
      </div>
      <div
        className="bg-[#1a1f2e] rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-700/50 flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Genre Presets</h2>
            <p className="text-sm text-gray-400 mt-1">
              Start with a pre-made genre template and customize to your taste
            </p>
          </div>
          <button
            onClick={() => setShowPresets(false)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => loadPreset(index)}
                className="text-left p-6 bg-gray-900 rounded-xl border-2 border-gray-700 hover:border-purple-500 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                      {preset.name}
                    </h3>
                    <p className="text-sm text-purple-400 font-medium">{preset.genre}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">BPM</div>
                    <div className="text-xl font-bold text-white">{preset.bpm}</div>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4">{preset.description}</p>

                <div className="flex flex-wrap gap-2">
                  {preset.tracks.map((track, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${track.color}20`,
                        color: track.color,
                      }}
                    >
                      {track.name}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <span>{preset.tracks.length} tracks</span>
                  <span>Swing: {preset.swing}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
