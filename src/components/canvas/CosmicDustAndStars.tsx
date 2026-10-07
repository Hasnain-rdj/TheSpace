'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function CosmicDustAndStars() {
  const starsRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  // 1. Deep Space Stellar Field with Morgan-Keenan Spectral Colors
  const starData = useMemo(() => {
    const count = 14000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const spectralColors = [
      new THREE.Color('#9bb0ff'), // O/B: Blue
      new THREE.Color('#bbccff'), // A: Light Blue-White
      new THREE.Color('#f8f9fa'), // F: White
      new THREE.Color('#fff4e8'), // G: Yellow (Solar)
      new THREE.Color('#ffd2a1'), // K: Orange
      new THREE.Color('#ff8a65'), // M: Red Dwarf
    ];

    for (let i = 0; i < count; i++) {
      // Spherical distribution around universe center
      const radius = 600 + Math.random() * 3200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color =
        spectralColors[Math.floor(Math.random() * spectralColors.length)];
      // Random brightness
      const lum = Math.random() * 0.7 + 0.3;
      colors[i * 3] = color.r * lum;
      colors[i * 3 + 1] = color.g * lum;
      colors[i * 3 + 2] = color.b * lum;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // 2. Local Interstellar Gas / Cosmic Dust Field
  const dustData = useMemo(() => {
    const count = 2500;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.00015;
    }
    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.0003;
    }
  });

  return (
    <group>
      <points ref={starsRef} geometry={starData}>
        <pointsMaterial
          size={1.6}
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <points ref={dustRef} geometry={dustData}>
        <pointsMaterial
          size={0.9}
          color="#81ecec"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
