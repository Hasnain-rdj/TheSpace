'use client';

import { useState } from 'react';
import { useSpaceStore } from '@/store/useSpaceStore';
import { CELESTIAL_BODIES } from '@/data/celestialData';
import { Crosshair, Zap, ChevronUp, ChevronDown } from 'lucide-react';

export function TelemetryHUD() {
  const selectedObjectId = useSpaceStore((s) => s.selectedObjectId);
  const activeScale = useSpaceStore((s) => s.activeScale);
  const isTransitioning = useSpaceStore((s) => s.isTransitioning);
  const cameraDistance = useSpaceStore((s) => s.cameraDistance);
  const [isExpanded, setIsExpanded] = useState(false);

  const currentObj = CELESTIAL_BODIES.find((b) => b.id === selectedObjectId);

  return (
    <div className="fixed bottom-16 md:bottom-4 left-3 md:left-4 z-20 pointer-events-auto flex flex-col gap-1.5 font-mono text-[10px] sm:text-[11px]">
      {/* Mobile Compact Pill (Tappable to expand on small screens) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden px-3 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/25 backdrop-blur-xl text-slate-300 shadow-md flex items-center gap-2 cursor-pointer"
      >
        <span className="flex items-center gap-1 text-cyan-400">
          <Crosshair className="w-3 h-3" />
          <span className="font-bold truncate max-w-[100px]">{currentObj?.name || 'SPACE'}</span>
        </span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-300">{cameraDistance.toLocaleString()} SU</span>
        {isExpanded ? <ChevronDown className="w-3 h-3 text-cyan-400" /> : <ChevronUp className="w-3 h-3 text-cyan-400" />}
      </div>

      {/* Full Telemetry Box (Always on Desktop, Expandable on Mobile) */}
      <div
        className={`${
          isExpanded ? 'flex flex-col' : 'hidden md:flex flex-col'
        } px-3.5 py-2.5 rounded-xl bg-slate-950/85 border border-cyan-500/20 backdrop-blur-xl text-slate-300 shadow-[0_0_20px_rgba(6,182,212,0.1)] gap-1.5 w-60 sm:w-64`}
      >
        {/* Status indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Crosshair className="w-3.5 h-3.5" />
            <span>TELEMETRY LOCK</span>
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold flex items-center gap-1 ${
              isTransitioning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
            }`}
          >
            <Zap className="w-2.5 h-2.5" />
            {isTransitioning ? 'WARP TRANSIT' : 'ORBIT LOCK'}
          </span>
        </div>

        {/* Target name and scale */}
        <div className="flex justify-between">
          <span className="text-slate-400">TARGET:</span>
          <span className="text-white font-semibold truncate max-w-[130px]">
            {currentObj?.name || 'DEEP SPACE'}
          </span>
        </div>

        {/* Spatial Coordinates */}
        <div className="flex justify-between">
          <span className="text-slate-400">COORDS:</span>
          <span className="text-cyan-300">
            [{currentObj?.position[0] ?? 0}, {currentObj?.position[1] ?? 0},{' '}
            {currentObj?.position[2] ?? 0}]
          </span>
        </div>

        {/* Camera Distance */}
        <div className="flex justify-between">
          <span className="text-slate-400">RANGE:</span>
          <span className="text-slate-200">
            {cameraDistance.toLocaleString()} SU
          </span>
        </div>

        {/* Scale level */}
        <div className="flex justify-between">
          <span className="text-slate-400">SCALE:</span>
          <span className="text-purple-300 uppercase font-semibold">{activeScale}</span>
        </div>
      </div>
    </div>
  );
}
