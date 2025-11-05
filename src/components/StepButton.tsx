import { useEffect, useState } from 'react';
import type { Step } from '../types';

interface StepButtonProps {
  step: Step;
  isPlaying: boolean;
  isCurrent: boolean;
  stepIndex: number;
  trackColor: string;
  onToggle: () => void;
  onClick: () => void;
}

export const StepButton = ({
  step,
  isPlaying,
  isCurrent,
  stepIndex,
  trackColor,
  onToggle,
  onClick,
}: StepButtonProps) => {
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (isCurrent && isPlaying && step.active) {
      setPulseKey(k => k + 1);
    }
  }, [isCurrent, isPlaying, step.active]);

  return (
    <button
      className={`
        relative w-full aspect-square rounded-md transition-all duration-150
        border-2 select-none
        ${step.active ? 'border-white' : 'border-gray-700'}
        ${isCurrent && isPlaying ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}
        ${step.active ? 'shadow-lg' : ''}
        hover:border-gray-400
      `}
      style={{
        backgroundColor: step.active ? trackColor : 'transparent',
        opacity: step.active ? (step.velocity / 127) * 0.8 + 0.2 : 0.3,
      }}
      onMouseDown={(e) => {
        if (e.button === 0) onToggle();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={`Step ${stepIndex + 1}${step.active ? ` • Vel: ${step.velocity} • Gate: ${step.gate}%` : ''}`}
    >
      {/* Step number indicator */}
      <div className="absolute top-0.5 left-1 text-[8px] text-gray-500 font-mono">
        {(stepIndex + 1).toString().padStart(2, '0')}
      </div>

      {/* Pulse animation */}
      {isCurrent && isPlaying && step.active && (
        <div
          key={pulseKey}
          className="absolute inset-0 rounded-md animate-pulse-step"
          style={{ backgroundColor: trackColor }}
        />
      )}

      {/* Indicators for special settings */}
      <div className="absolute bottom-0.5 right-0.5 flex gap-0.5">
        {step.probability < 100 && (
          <div
            className="w-1 h-1 rounded-full bg-yellow-400"
            title={`${step.probability}% probability`}
          />
        )}
        {step.ratchet > 1 && (
          <div
            className="w-1 h-1 rounded-full bg-blue-400"
            title={`${step.ratchet}x ratchet`}
          />
        )}
        {step.condition !== 'always' && (
          <div
            className="w-1 h-1 rounded-full bg-purple-400"
            title={`Condition: ${step.condition}`}
          />
        )}
      </div>
    </button>
  );
};
