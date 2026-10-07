'use client';

import { CosmicScale } from '@/types/space';
import { useSpaceStore } from '@/store/useSpaceStore';
import { Layers } from 'lucide-react';

const SCALE_TIERS: Array<{
  id: CosmicScale;
  label: string;
  orderOfMagnitude: string;
  description: string;
}> = [
  {
    id: 'cosmic',
    label: 'Cosmic / Multiverse',
    orderOfMagnitude: '10²⁶ m',
    description: 'Bubble universes & CMB horizon',
  },
  {
    id: 'galactic',
    label: 'Galactic',
    orderOfMagnitude: '10²¹ m',
    description: 'Milky Way, Andromeda & Sgr A*',
  },
  {
    id: 'stellar',
    label: 'Stellar System',
    orderOfMagnitude: '10¹³ m',
    description: 'Sol, Gargantua, Kepler stars',
  },
  {
    id: 'planetary',
    label: 'Planetary & Moons',
    orderOfMagnitude: '10⁷ m',
    description: 'Earth, Jupiter, Saturn, Mars',
  },
  {
    id: 'quantum',
    label: 'Quantum Dimensions',
    orderOfMagnitude: '10⁻³⁵ m',
    description: 'Calabi-Yau 6D & Planck foam',
  },
];

export function ScaleNavigator() {
  const activeScale = useSpaceStore((s) => s.activeScale);
  const setScale = useSpaceStore((s) => s.setScale);

  return (
    <div className="fixed left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-2 p-2.5 rounded-2xl bg-slate-950/75 border border-cyan-500/20 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.1)]">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 border-b border-white/5 pb-2">
        <Layers className="w-3 h-3" />
        <span>Cosmic Ladder</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {SCALE_TIERS.map((tier) => {
          const isActive = activeScale === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setScale(tier.id)}
              className={`group flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div>
                <div className="text-xs font-medium">{tier.label}</div>
                <div className="text-[10px] text-slate-500 group-hover:text-slate-400">
                  {tier.description}
                </div>
              </div>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                  isActive
                    ? 'bg-cyan-900/60 text-cyan-200'
                    : 'bg-slate-900 text-slate-500'
                }`}
              >
                {tier.orderOfMagnitude}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
