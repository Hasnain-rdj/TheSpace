'use client';

import dynamic from 'next/dynamic';
import { Flame } from 'lucide-react';

const PlanetDestructionSimulator = dynamic(
  () =>
    import('@/components/destruction/PlanetDestructionSimulator').then(
      (mod) => mod.PlanetDestructionSimulator
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#020206] text-red-400 font-mono text-sm">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
          <Flame className="absolute w-7 h-7 text-red-400 animate-pulse" />
        </div>
        <div className="tracking-widest uppercase text-xs text-red-300 font-bold">
          INITIALIZING PLANETARY DESTRUCTION LAB...
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Loading orbital superlasers, kinetic impactors, and damage shaders
        </div>
      </div>
    ),
  }
);

export default function SimulatePage() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#020206]">
      <PlanetDestructionSimulator />
    </main>
  );
}
