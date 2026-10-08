'use client';

import { useSpaceStore } from '@/store/useSpaceStore';
import { Play, Pause, Clock } from 'lucide-react';

export function TimeControls() {
  const timeSpeed = useSpaceStore((s) => s.timeSpeed);
  const setTimeSpeed = useSpaceStore((s) => s.setTimeSpeed);

  const speeds = [
    { label: '0x', value: 0 },
    { label: '1x', value: 1 },
    { label: '10x', value: 10 },
    { label: '50x', value: 50 },
    { label: '200x', value: 200 },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-slate-950/85 border border-cyan-500/25 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.15)] text-slate-300 font-mono text-xs max-w-[96vw]">
      {/* Pause/Play quick toggle */}
      <button
        onClick={() => setTimeSpeed(timeSpeed === 0 ? 1 : 0)}
        className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        title={timeSpeed === 0 ? 'Resume Orbit Simulation' : 'Pause Simulation'}
      >
        {timeSpeed === 0 ? (
          <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" />
        ) : (
          <Pause className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-current" />
        )}
      </button>

      <div className="h-3.5 sm:h-4 w-px bg-white/10" />

      {/* Speed Multiplier Pills */}
      <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar">
        {speeds.map((s) => {
          const isActive = timeSpeed === s.value;
          return (
            <button
              key={s.value}
              onClick={() => setTimeSpeed(s.value)}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'hover:bg-white/5 text-slate-400'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="hidden md:flex items-center gap-1 pl-1.5 pr-2 text-[10px] text-slate-400">
        <Clock className="w-3 h-3 text-cyan-400" />
        <span>ORBIT SPEED</span>
      </div>
    </div>
  );
}
