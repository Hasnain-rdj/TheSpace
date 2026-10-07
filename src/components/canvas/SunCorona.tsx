'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface SunCoronaProps {
  radius: number;
}

export function SunCorona({ radius }: SunCoronaProps) {
  const coronaRef = useRef<THREE.Mesh>(null);
  const outerCoronaRef = useRef<THREE.Mesh>(null);
  const flarePointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (coronaRef.current) {
      coronaRef.current.rotation.y += delta * 0.05;
      coronaRef.current.rotation.z += delta * 0.03;
      const s = 1 + Math.sin(time * 1.5) * 0.03;
      coronaRef.current.scale.set(s, s, s);
    }
    if (outerCoronaRef.current) {
      outerCoronaRef.current.rotation.y -= delta * 0.02;
      const s2 = 1 + Math.cos(time * 1.2) * 0.04;
      outerCoronaRef.current.scale.set(s2, s2, s2);
    }
    if (flarePointsRef.current) {
      flarePointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      {/* Primary Solar Illuminator: decay=0 guarantees sunlight reaches all planets across the solar system */}
      <pointLight color="#fffdf0" intensity={3.8} distance={12000} decay={0} />
      <pointLight color="#ff9f43" intensity={1.5} distance={1200} decay={0.3} />

      {/* Radiant inner corona */}
      <mesh ref={coronaRef}>
        <sphereGeometry args={[radius * 1.15, 36, 36]} />
        <meshBasicMaterial
          color="#ff793f"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Atmospheric outer glow envelope */}
      <mesh ref={outerCoronaRef}>
        <sphereGeometry args={[radius * 1.35, 36, 36]} />
        <meshBasicMaterial
          color="#ffb142"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Far coronal halo */}
      <mesh>
        <sphereGeometry args={[radius * 1.7, 32, 32]} />
        <meshBasicMaterial
          color="#ff5252"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
