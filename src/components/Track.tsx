import { useState } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Radio,
  Settings,
  Trash2,
  Copy,
  Zap,
  Waves,
} from 'lucide-react';
import { StepButton } from './StepButton';
import { StepEditor } from './StepEditor';
import { TrackControls } from './TrackControls';
import { useStore } from '../store/useStore';
import type { Track as TrackType } from '../types';

interface TrackProps {
  track: TrackType;
  isPlaying: boolean;
}

export const Track = ({ track, isPlaying }: TrackProps) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(false);

  const {
    toggleStep,
    updateTrack,
    removeTrack,
    duplicateTrack,
    startMIDILearn,
    midiDevices,
  } = useStore();

  const outputDevices = midiDevices.filter(d => d.type === 'output');
  const hasSolo = useStore(state => state.tracks.some(t => t.solo));

  const handleVolumeChange = (volume: number) => {
    updateTrack(track.id, { volume });
  };

  const handleMuteToggle = () => {
    updateTrack(track.id, { muted: !track.muted });
  };

  const handleSoloToggle = () => {
    updateTrack(track.id, { solo: !track.solo });
  };

  const effectivelyMuted = track.muted || (hasSolo && !track.solo);

  return (
    <div
      className="bg-[#1a1f2e] rounded-xl p-4 shadow-xl border transition-all"
      style={{ borderColor: effectivelyMuted ? '#374151' : track.color, borderWidth: '1px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <input
            type="text"
            value={track.name}
            onChange={(e) => updateTrack(track.id, { name: e.target.value })}
            className="bg-gray-800/50 text-white px-2 py-1 rounded text-sm font-medium border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
            style={{ maxWidth: '120px' }}
          />

          {/* Device & Note */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <select
              value={track.midiDevice || ''}
              onChange={(e) => {
                const device = outputDevices.find(d => d.id === e.target.value);
                updateTrack(track.id, {
                  midiDevice: e.target.value || null,
                  midiDeviceName: device?.name || 'Not assigned',
                });
              }}
              className="bg-gray-800/50 text-white px-2 py-1 rounded text-xs border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
            >
              <option value="">No device</option>
              {outputDevices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>

            <span className="text-gray-500">•</span>

            <input
              type="number"
              value={track.midiNote}
              onChange={(e) => updateTrack(track.id, { midiNote: parseInt(e.target.value) })}
              min={0}
              max={127}
              className="bg-gray-800/50 text-white px-2 py-1 rounded text-xs w-14 border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
            />

            <span className="text-gray-500">Ch</span>

            <input
              type="number"
              value={track.midiChannel}
              onChange={(e) => updateTrack(track.id, { midiChannel: parseInt(e.target.value) })}
              min={1}
              max={16}
              className="bg-gray-800/50 text-white px-2 py-1 rounded text-xs w-12 border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clock Divider */}
          <select
            value={track.clockDivider}
            onChange={(e) => updateTrack(track.id, { clockDivider: parseFloat(e.target.value) })}
            className="bg-gray-800/50 text-white px-2 py-1 rounded text-xs border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
            title="Clock multiplier/divider"
          >
            <option value={0.25}>1/16</option>
            <option value={0.5}>1/8</option>
            <option value={1}>1/4</option>
            <option value={2}>1/2</option>
            <option value={4}>1x</option>
            <option value={8}>2x</option>
            <option value={16}>4x</option>
          </select>

          {/* LFO Indicator */}
          {track.lfo.enabled && (
            <div className="text-purple-400" title="LFO active">
              <Waves size={16} />
            </div>
          )}

          {/* Arp Indicator */}
          {track.arpEnabled && (
            <div className="text-blue-400" title="Arpeggiator active">
              <Zap size={16} />
            </div>
          )}

          {/* Controls toggle */}
          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-1 rounded hover:bg-gray-700 transition-colors ${showControls ? 'text-white' : 'text-gray-400'}`}
            title="Show/hide advanced controls"
          >
            <Settings size={16} />
          </button>

          {/* Duplicate */}
          <button
            onClick={() => duplicateTrack(track.id)}
            className="p-1 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            title="Duplicate track"
          >
            <Copy size={16} />
          </button>

          {/* Delete */}
          <button
            onClick={() => removeTrack(track.id)}
            className="p-1 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-400"
            title="Delete track"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Step Grid */}
      <div className="grid grid-cols-16 gap-1 mb-3">
        {track.steps.map((step, index) => (
          <StepButton
            key={index}
            step={step}
            isPlaying={isPlaying}
            isCurrent={track.currentStep === index}
            stepIndex={index}
            trackColor={track.color}
            onToggle={() => toggleStep(track.id, index)}
            onClick={() => setSelectedStepIndex(index === selectedStepIndex ? null : index)}
          />
        ))}
      </div>

      {/* Step Editor */}
      {selectedStepIndex !== null && (
        <StepEditor
          track={track}
          stepIndex={selectedStepIndex}
          onClose={() => setSelectedStepIndex(null)}
        />
      )}

      {/* Bottom Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Mute */}
          <button
            onClick={handleMuteToggle}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              track.muted
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onContextMenu={(e) => {
              e.preventDefault();
              startMIDILearn(track.id, 'mute');
            }}
            title={`Mute ${track.muteLearnNote ? `(${track.muteLearnNote})` : '(right-click to learn)'}`}
          >
            {track.muted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>

          {/* Solo */}
          <button
            onClick={handleSoloToggle}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              track.solo
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onContextMenu={(e) => {
              e.preventDefault();
              startMIDILearn(track.id, 'solo');
            }}
            title={`Solo ${track.soloLearnNote ? `(${track.soloLearnNote})` : '(right-click to learn)'}`}
          >
            <Radio size={14} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Volume2 size={14} className="text-gray-400" />
          <input
            type="range"
            min={0}
            max={127}
            value={track.volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, ${track.color} 0%, ${track.color} ${(track.volume / 127) * 100}%, #374151 ${(track.volume / 127) * 100}%, #374151 100%)`,
            }}
          />
          <span className="text-xs text-gray-400 w-8 text-right">{track.volume}</span>
        </div>
      </div>

      {/* Advanced Controls */}
      {showControls && <TrackControls track={track} />}
    </div>
  );
};
