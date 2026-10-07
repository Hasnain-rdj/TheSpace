'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getCelestialTexture } from '@/utils/textureCache';

interface RingSystemProps {
  innerRadius: number;
  outerRadius: number;
  color?: string;
  texturePath?: string;
  rotationSpeed?: number;
}

export function RingSystem({
  innerRadius,
  outerRadius,
  color = '#d1ccc0',
  texturePath = '/textures/saturn_rings.png',
  rotationSpeed = 0.001,
}: RingSystemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [, setTextureVersion] = useState(0);

  // Synchronously obtain ring texture
  const ringTexture = useMemo(() => {
    return getCelestialTexture(texturePath, () => {
      if (matRef.current) matRef.current.needsUpdate = true;
      setTextureVersion((v) => v + 1);
    });
  }, [texturePath]);

  // Compute radial UV coordinates: maps 1D/horizontal strip across concentric 360-degree rings
  const ringGeometry = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 180, 8);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const r = Math.sqrt(x * x + y * y);
      // Normalized radial distance from inner to outer radius
      const u = (r - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, u, 0.5);
    }
    uv.needsUpdate = true;
    return geo;
  }, [innerRadius, outerRadius]);

  useEffect(() => {
    if (matRef.current) {
      matRef.current.needsUpdate = true;
    }
  }, [ringTexture]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += rotationSpeed * delta;
    }
  });

  return (
    <mesh ref={meshRef} geometry={ringGeometry} rotation={[-Math.PI / 2.3, 0, 0]}>
      <meshStandardMaterial
        ref={matRef}
        map={ringTexture || undefined}
        color="#ffffff"
        side={THREE.DoubleSide}
        transparent
        opacity={0.92}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
}
