'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { UniverseScene } from './UniverseScene';
import { FloatingHUD } from '@/components/ui/FloatingHUD';

export function SpaceCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#030308] overflow-hidden select-none">
      <Canvas
        camera={{
          position: [0, 45, 140],
          fov: 45,
          near: 0.5,
          far: 15000,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#030308']} />
        <Suspense fallback={null}>
          <UniverseScene />
        </Suspense>
      </Canvas>
      {/* 2D Space HUD Layer (outside Canvas - zero R3F reconciler errors, zero unmount race conditions) */}
      <FloatingHUD />
    </div>
  );
}
