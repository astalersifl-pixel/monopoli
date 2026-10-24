import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/audio';

interface DiceProps {
  value: number;
  isRolling: boolean;
  onRoll?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  onRoll,
  disabled = false,
  size = 'md',
  label,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (isRolling) {
      sounds.playDiceRoll();
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
        setRotation({
          x: Math.floor(Math.random() * 360),
          y: Math.floor(Math.random() * 360),
          z: Math.floor(Math.random() * 180),
        });
      }, 70);

      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
      setRotation({ x: 0, y: 0, z: 0 });
    }
  }, [isRolling, value]);

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg rounded-xl',
    md: 'w-20 h-20 text-3xl rounded-2xl',
    lg: 'w-28 h-28 text-5xl rounded-3xl',
  };

  const renderPips = (val: number) => {
    // 3x3 pip grid
    const pipMap: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const activePips = pipMap[val] || [4];
    const isRed = val === 1;

    return (
      <div className="grid grid-cols-3 grid-rows-3 w-3/4 h-3/4 p-1 gap-1 items-center justify-items-center">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-100 ${
              activePips.includes(i)
                ? isRed
                  ? 'bg-rose-600 scale-125 shadow-sm'
                  : 'bg-slate-900 shadow-sm'
                : 'opacity-0'
            } ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4.5 h-4.5'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => {
          if (!disabled && !isRolling && onRoll) {
            onRoll();
          }
        }}
        disabled={disabled || isRolling}
        style={{
          transform: isRolling
            ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg) scale(1.08)`
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isRolling ? 'transform 0.08s ease-in-out' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className={`relative ${sizeClasses[size]} bg-white border-2 border-slate-300 shadow-xl flex items-center justify-center cursor-pointer select-none active:scale-95 disabled:cursor-not-allowed group hover:border-indigo-400 hover:shadow-indigo-200/50`}
      >
        {/* Subtle 3D gradient & edge highlights */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-200 rounded-[inherit] pointer-events-none" />
        <div className="absolute inset-0 border border-white/80 rounded-[inherit] pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {renderPips(displayValue)}
        </div>
      </button>

      {label && (
        <span className="text-xs font-bold text-slate-600 tracking-wide bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
          {label}
        </span>
      )}
    </div>
  );
};
