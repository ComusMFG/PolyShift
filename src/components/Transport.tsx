import { Play, Pause, RotateCcw, Plus, Save, FolderOpen, Sparkles, Settings, HelpCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRef } from 'react';

export const Transport = () => {
  const {
    playing,
    bpm,
    swing,
    midiInitialized,
    play,
    stop,
    setBPM,
    setSwing,
    sync,
    addTrack,
    saveProject,
    setShowPresets,
    setShowSettings,
    setShowHelp,
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoadProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      useStore.getState().loadProject(data);
    };
    reader.readAsText(file);
  };

  const handleTapTempo = () => {
    // TODO: Implement tap tempo
    console.log('Tap tempo not yet implemented');
  };

  return (
    <div className="bg-[#1a1f2e] border-b border-gray-800 px-6 py-4 shadow-lg">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Transport */}
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                PolyShift
              </h1>
              <p className="text-xs text-gray-400">Polyrhythmic MIDI Sequencer</p>
            </div>

            <div className="flex items-center gap-2 pl-6 border-l border-gray-700/50">
              <button
                onClick={playing ? stop : play}
                disabled={!midiInitialized}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  playing
                    ? 'bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'bg-green-500/90 hover:bg-green-500 text-white shadow-lg shadow-green-500/20'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {playing ? (
                  <>
                    <Pause size={18} />
                    Stop
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Play
                  </>
                )}
              </button>

              <button
                onClick={sync}
                className="px-4 py-2 rounded-lg font-medium bg-gray-700/50 hover:bg-gray-600/60 text-gray-200 transition-all flex items-center gap-2"
                title="Resync all tracks"
              >
                <RotateCcw size={18} />
                Sync
              </button>
            </div>
          </div>

          {/* Center: BPM & Swing */}
          <div className="flex items-center gap-6">
            <div>
              <label className="text-xs text-gray-400 block mb-1">BPM</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBPM(parseInt(e.target.value) || 120)}
                  min={20}
                  max={300}
                  className="bg-gray-800/50 text-white px-3 py-2 rounded-lg text-lg font-mono w-20 border border-gray-700/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50"
                />
                <button
                  onClick={handleTapTempo}
                  className="px-3 py-2 bg-gray-700/50 hover:bg-gray-600/60 text-gray-200 rounded-lg text-xs transition-all"
                  title="Tap tempo"
                >
                  TAP
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">
                Global Swing: {swing}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={swing}
                onChange={(e) => setSwing(parseInt(e.target.value))}
                className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPresets(true)}
              className="px-4 py-2 bg-purple-500/90 hover:bg-purple-500 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20"
              title="Genre Presets"
            >
              <Sparkles size={18} />
              Presets
            </button>

            <button
              onClick={addTrack}
              className="px-4 py-2 bg-blue-500/90 hover:bg-blue-500 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
              title="Add track"
            >
              <Plus size={18} />
              Track
            </button>

            <div className="w-px h-8 bg-gray-700/50 mx-2" />

            <button
              onClick={saveProject}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/60 text-gray-200 rounded-lg transition-all flex items-center gap-2"
              title="Save project"
            >
              <Save size={18} />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/60 text-gray-200 rounded-lg transition-all flex items-center gap-2"
              title="Load project"
            >
              <FolderOpen size={18} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleLoadProject}
              className="hidden"
            />

            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/60 text-gray-200 rounded-lg transition-all"
              title="Settings"
            >
              <Settings size={18} />
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg transition-all"
              title="User Guide"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </div>

        {/* MIDI Status */}
        {!midiInitialized && (
          <div className="mt-3 px-3 py-2 bg-yellow-900/30 border border-yellow-600 rounded text-xs text-yellow-200">
            Web MIDI is not initialized. Click Play to enable MIDI access.
          </div>
        )}
      </div>
    </div>
  );
};
