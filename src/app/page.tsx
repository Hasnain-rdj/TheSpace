'use client';

import dynamic from 'next/dynamic';
import { NavigationHUD } from '@/components/ui/NavigationHUD';
import { DataPanel } from '@/components/ui/DataPanel';
import { ScaleNavigator } from '@/components/ui/ScaleNavigator';
import { TelemetryHUD } from '@/components/ui/TelemetryHUD';
import { TimeControls } from '@/components/ui/TimeControls';
import { QuickFilterBar } from '@/components/ui/QuickFilterBar';
import { GuidedTourModal } from '@/components/ui/GuidedTourModal';
import { SurfaceMapHUD } from '@/components/ui/SurfaceMapHUD';
import { MultiverseModal } from '@/components/ui/MultiverseModal';
import { NasaFeedModal } from '@/components/ui/NasaFeedModal';
import { Sparkles } from 'lucide-react';

// Dynamic import with ssr: false to prevent SSR hydration errors with WebGL canvas
const SpaceCanvas = dynamic(
  () => import('@/components/canvas/SpaceCanvas').then((mod) => mod.SpaceCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#030308] text-cyan-400 font-mono text-sm">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <Sparkles className="absolute w-6 h-6 text-cyan-300 animate-pulse" />
        </div>
        <div className="tracking-widest uppercase text-xs text-cyan-300">
          INITIALIZING SPATIAL ENGINE & NASA TEXTURES...
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          Loading procedural surface shaders, Google Earth POIs & Multiverse manifolds
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#030308]">
      {/* 1. The 3D Infinite Canvas Experience with Photorealistic Textures & Landmarks */}
      <SpaceCanvas />

      {/* 2. Top Navigation Bar & Global Unified Search */}
      <NavigationHUD />

      {/* 3. Celestial Category Quick Jump Bar */}
      <QuickFilterBar />

      {/* 4. Planetary Surface Explorer & Google Maps Navigation HUD */}
      <SurfaceMapHUD />

      {/* 5. Cosmic Ladder / Infinite Zoom Scale Navigator */}
      <ScaleNavigator />

      {/* 6. Live Astrometric Telemetry Readout */}
      <TelemetryHUD />

      {/* 7. Orbital Time Simulation Scrubber */}
      <TimeControls />

      {/* 8. Contextual Real-World & Theoretical Physics Data Panel */}
      <DataPanel />

      {/* 9. Scripted Cosmic Odyssey Grand Tour */}
      <GuidedTourModal />

      {/* 10. Comprehensive Multiverse & Cosmology Encyclopedia */}
      <MultiverseModal />

      {/* 11. Live NASA Open API Data Feed Hub */}
      <NasaFeedModal />
    </main>
  );
}
