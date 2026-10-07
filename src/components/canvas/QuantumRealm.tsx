'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface QuantumRealmProps {
  position: [number, number, number];
  size: number;
}

export function QuantumRealm({ position, size }: QuantumRealmProps) {
  const outerKnotRef = useRef<THREE.Mesh>(null);
  const innerKnotRef = useRef<THREE.Mesh>(null);
  const stringLoopsRef = useRef<THREE.Group>(null);
  const latticeRef = useRef<THREE.Points>(null);

  // Generate Planck-scale spacetime lattice points
  const latticePoints = useMemo(() => {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * size * 3;
      positions[i * 3 + 1] = (Math.random() - 0.5) * size * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * size * 3;

      colors[i * 3] = 0.9;
      colors[i * 3 + 1] = 0.2 + Math.random() * 0.4;
      colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [size]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (outerKnotRef.current) {
      outerKnotRef.current.rotation.x += delta * 0.3;
      outerKnotRef.current.rotation.y += delta * 0.5;
    }
    if (innerKnotRef.current) {
      innerKnotRef.current.rotation.y -= delta * 0.4;
      innerKnotRef.current.rotation.z += delta * 0.3;
    }
    if (stringLoopsRef.current) {
      stringLoopsRef.current.rotation.z += delta * 0.2;
      const s = 1 + Math.sin(t * 3) * 0.05;
      stringLoopsRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      {/* 1. Primary Compactified Calabi-Yau 6D Representation (Torus Knot) */}
      <mesh ref={outerKnotRef}>
        <torusKnotGeometry args={[size * 0.65, size * 0.18, 128, 32, 2, 5]} />
        <meshStandardMaterial
          color="#ff7675"
          emissive="#fd79a8"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.9}
          wireframe
        />
      </mesh>

      {/* 2. Secondary Inner Dimensional Pocket */}
      <mesh ref={innerKnotRef}>
        <torusKnotGeometry args={[size * 0.42, size * 0.12, 96, 24, 3, 4]} />
        <meshStandardMaterial
          color="#00cec9"
          emissive="#81ecec"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.95}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 3. Vibrating Fundamental Superstring Loops */}
      <group ref={stringLoopsRef}>
        {[0, 45, 90, 135].map((angle, idx) => (
          <mesh
            key={idx}
            rotation={[
              (angle * Math.PI) / 180,
              (angle * Math.PI) / 90,
              (idx * Math.PI) / 4,
            ]}
          >
            <torusGeometry args={[size * 0.95, 0.25, 16, 64]} />
            <meshBasicMaterial
              color="#ffeaa7"
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* 4. Planck Foam Lattice Points */}
      <points ref={latticeRef} geometry={latticePoints}>
        <pointsMaterial
          size={0.6}
          vertexColors
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Dimensional energy point light */}
      <pointLight color="#fd79a8" intensity={2.5} distance={size * 8} />
    </group>
  );
}
