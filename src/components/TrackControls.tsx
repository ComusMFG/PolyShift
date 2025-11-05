import { useStore } from '../store/useStore';
import type { Track } from '../types';

interface TrackControlsProps {
  track: Track;
}

export const TrackControls = ({ track }: TrackControlsProps) => {
  const { updateTrack, clearTrack } = useStore();

  return (
    <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
      {/* LFO Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-white">LFO (Volume)</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={track.lfo.enabled}
              onChange={(e) =>
                updateTrack(track.id, {
                  lfo: { ...track.lfo, enabled: e.target.checked },
                })
              }
              className="w-4 h-4 rounded bg-gray-700 border-gray-600"
            />
            <span className="text-xs text-gray-400">Enable</span>
          </label>
        </div>

        {track.lfo.enabled && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Rate: {track.lfo.rate.toFixed(2)} Hz
              </label>
              <input
                type="range"
                min={0.1}
                max={10}
                step={0.1}
                value={track.lfo.rate}
                onChange={(e) =>
                  updateTrack(track.id, {
                    lfo: { ...track.lfo, rate: parseFloat(e.target.value) },
                  })
                }
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Depth: {track.lfo.depth}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={track.lfo.depth}
                onChange={(e) =>
                  updateTrack(track.id, {
                    lfo: { ...track.lfo, depth: parseInt(e.target.value) },
                  })
                }
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-gray-400 block mb-1">Shape</label>
              <select
                value={track.lfo.shape}
                onChange={(e) =>
                  updateTrack(track.id, {
                    lfo: { ...track.lfo, shape: e.target.value as any },
                  })
                }
                className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="triangle">Triangle</option>
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Arpeggiator Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-white">Arpeggiator</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={track.arpEnabled}
              onChange={(e) =>
                updateTrack(track.id, { arpEnabled: e.target.checked })
              }
              className="w-4 h-4 rounded bg-gray-700 border-gray-600"
            />
            <span className="text-xs text-gray-400">Enable</span>
          </label>
        </div>

        {track.arpEnabled && (
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Mode</label>
              <select
                value={track.arpMode}
                onChange={(e) =>
                  updateTrack(track.id, { arpMode: e.target.value as any })
                }
                className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-white"
              >
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="updown">Up/Down</option>
                <option value="random">Random</option>
                <option value="chord">Chord</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Additional Notes (comma-separated MIDI notes)
              </label>
              <input
                type="text"
                value={track.arpNotes.join(', ')}
                onChange={(e) => {
                  const notes = e.target.value
                    .split(',')
                    .map((n) => parseInt(n.trim()))
                    .filter((n) => !isNaN(n) && n >= 0 && n <= 127);
                  updateTrack(track.id, { arpNotes: notes });
                }}
                placeholder="e.g. 40, 43, 47"
                className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Track Swing */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Track Swing: {track.swingAmount}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={track.swingAmount}
          onChange={(e) =>
            updateTrack(track.id, { swingAmount: parseInt(e.target.value) })
          }
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Pattern Offset */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">
          Pattern Offset: {track.offset} steps
        </label>
        <input
          type="range"
          min={0}
          max={15}
          value={track.offset}
          onChange={(e) =>
            updateTrack(track.id, { offset: parseInt(e.target.value) })
          }
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Utilities */}
      <div className="flex gap-2 pt-2 border-t border-gray-700">
        <button
          onClick={() => clearTrack(track.id)}
          className="flex-1 px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition-colors"
        >
          Clear Pattern
        </button>

        <button
          onClick={() => {
            // Randomize pattern
            const newSteps = track.steps.map((step) => ({
              ...step,
              active: Math.random() > 0.7,
              velocity: Math.floor(Math.random() * 64) + 64,
            }));
            updateTrack(track.id, { steps: newSteps });
          }}
          className="flex-1 px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition-colors"
        >
          Randomize
        </button>
      </div>
    </div>
  );
};
