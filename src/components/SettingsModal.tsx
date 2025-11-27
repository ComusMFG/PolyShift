import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';

export const SettingsModal = () => {
  const { showSettings, setShowSettings, midiDevices } = useStore();

  console.log('SettingsModal render, showSettings:', showSettings);

  if (!showSettings) return null;

  const inputDevices = midiDevices.filter(d => d.type === 'input');
  const outputDevices = midiDevices.filter(d => d.type === 'output');

  return createPortal(
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-8">
      <div className="bg-[#1a1f2e] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="text-sm text-gray-400 mt-1">
              Configure PolyShift preferences
            </p>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
            {/* MIDI Devices Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">MIDI Devices</h3>

              {/* Input Devices */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Input Devices</h4>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  {inputDevices.length > 0 ? (
                    <ul className="space-y-1">
                      {inputDevices.map(device => (
                        <li key={device.id} className="text-sm text-gray-300 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          {device.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No MIDI input devices detected</p>
                  )}
                </div>
              </div>

              {/* Output Devices */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Output Devices</h4>
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  {outputDevices.length > 0 ? (
                    <ul className="space-y-1">
                      {outputDevices.map(device => (
                        <li key={device.id} className="text-sm text-gray-300 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {device.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No MIDI output devices detected</p>
                  )}
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">About</h3>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Version</span>
                  <span className="text-white font-mono">1.0.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Browser</span>
                  <span className="text-white">{navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'}</span>
                </div>
                <div className="pt-2 border-t border-gray-700/50">
                  <p className="text-xs text-gray-500">
                    PolyShift uses the Web MIDI API. Make sure you've granted MIDI access permissions for the best experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Quick Tips</h3>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <ul className="text-sm text-gray-300 space-y-2">
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
    </div>,
    document.body
  );
};
