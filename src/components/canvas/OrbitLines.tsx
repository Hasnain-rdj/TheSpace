'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useSpaceStore } from '@/store/useSpaceStore';
import { CELESTIAL_BODIES } from '@/data/celestialData';

export function OrbitLines() {
  const isOrbitLinesVisible = useSpaceStore((s) => s.isOrbitLinesVisible);

  const orbitGeometries = useMemo(() => {
    const lines: Array<{
      id: string;
      geometry: THREE.BufferGeometry;
      color: string;
    }> = [];

    CELESTIAL_BODIES.forEach((body) => {
      if (body.orbitRadius && body.category === 'planet') {
        const segments = 128;
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          points.push(
            new THREE.Vector3(
              Math.cos(theta) * body.orbitRadius,
              0,
              Math.sin(theta) * body.orbitRadius
            )
          );
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        lines.push({
          id: body.id,
          geometry: geo,
          color: body.visuals.baseColor || '#4bcffa',
        });
      }
    });

    return lines;
  }, []);

  if (!isOrbitLinesVisible) return null;

  return (
    <group>
      {orbitGeometries.map((orbit) => (
        <lineLoop key={orbit.id} geometry={orbit.geometry}>
          <lineBasicMaterial
            color={orbit.color}
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
          />
        </lineLoop>
      ))}
    </group>
  );
}
