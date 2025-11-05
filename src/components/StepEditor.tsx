import { useStore } from '../store/useStore';
import type { Track, Step, StepCondition } from '../types';

interface StepEditorProps {
  track: Track;
  stepIndex: number;
  onClose: () => void;
}

export const StepEditor = ({ track, stepIndex, onClose }: StepEditorProps) => {
  const { updateStep } = useStore();
  const step = track.steps[stepIndex];

  const handleUpdate = (updates: Partial<Step>) => {
    updateStep(track.id, stepIndex, updates);
  };

  const conditions: { value: StepCondition; label: string }[] = [
    { value: 'always', label: 'Always' },
    { value: 'every2', label: 'Every 2nd' },
    { value: 'every3', label: 'Every 3rd' },
    { value: 'every4', label: 'Every 4th' },
    { value: 'random25', label: 'Random 25%' },
    { value: 'random50', label: 'Random 50%' },
    { value: 'random75', label: 'Random 75%' },
    { value: 'skip', label: 'Skip' },
  ];

  return (
    <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">
          Step {stepIndex + 1} Editor
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xs"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Velocity */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Velocity: {step.velocity}
          </label>
          <input
            type="range"
            min={1}
            max={127}
            value={step.velocity}
            onChange={(e) => handleUpdate({ velocity: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Gate */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Gate: {step.gate}%
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={step.gate}
            onChange={(e) => handleUpdate({ gate: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Probability */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Probability: {step.probability}%
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={step.probability}
            onChange={(e) => handleUpdate({ probability: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Ratchet */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">
            Ratchet: {step.ratchet}x
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={step.ratchet}
            onChange={(e) => handleUpdate({ ratchet: parseInt(e.target.value) })}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Condition */}
        <div className="col-span-2">
          <label className="text-xs text-gray-400 block mb-1">
            Condition
          </label>
          <select
            value={step.condition}
            onChange={(e) => handleUpdate({ condition: e.target.value as StepCondition })}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-white"
          >
            {conditions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
