'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getCelestialTexture } from '@/utils/textureCache';

interface QuantumRealmProps {
  position?: [number, number, number];
  size: number;
  imageUrl?: string;
  id?: string;
}

export function QuantumRealm({ position = [0, 0, 0], size, imageUrl, id }: QuantumRealmProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const discRef1 = useRef<THREE.Mesh>(null);
  const discRef2 = useRef<THREE.Mesh>(null);
  const tesseractRef = useRef<THREE.Group>(null);
  const stringLoopsRef = useRef<THREE.Group>(null);
  const latticeRef = useRef<THREE.Points>(null);

  const texture = useMemo(() => {
    return imageUrl ? getCelestialTexture(imageUrl) : null;
  }, [imageUrl]);

  // Generate Planck-scale spacetime lattice points
  const latticePoints = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * size * 2.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * size * 2.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * size * 2.8;

      // Cyan, deep azure, and electric violet spectrum
      colors[i * 3] = 0.2 + Math.random() * 0.3; // R
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.9 + Math.random() * 0.1; // B
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [size]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.25;
      coreRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
    }

    if (discRef1.current) {
      discRef1.current.rotation.z += delta * 0.3;
      discRef1.current.rotation.y += delta * 0.15;
    }

    if (discRef2.current) {
      discRef2.current.rotation.x -= delta * 0.25;
      discRef2.current.rotation.z -= delta * 0.2;
    }

    if (tesseractRef.current) {
      tesseractRef.current.rotation.x += delta * 0.15;
      tesseractRef.current.rotation.y += delta * 0.2;
    }

    if (stringLoopsRef.current) {
      stringLoopsRef.current.rotation.y += delta * 0.4;
      const pulse = 1 + Math.sin(t * 2.5) * 0.04;
      stringLoopsRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={position}>
      {/* 1. Primary Scientific Manifold Visual Sphere with Real High-Resolution Texture */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[size * 0.85, 64, 64]} />
        <meshStandardMaterial
          map={texture || undefined}
          roughness={0.2}
          metalness={0.8}
          emissive={new THREE.Color('#00cec9')}
          emissiveIntensity={0.4}
          emissiveMap={texture || undefined}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 2. Holographic Projection Discs displaying the 6D Curvature slice */}
      {texture && (
        <>
          <mesh ref={discRef1} rotation={[Math.PI / 4, 0, 0]}>
            <circleGeometry args={[size * 1.15, 64]} />
            <meshBasicMaterial
              map={texture}
              side={THREE.DoubleSide}
              transparent
              opacity={0.55}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>

          <mesh ref={discRef2} rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
            <circleGeometry args={[size * 1.05, 64]} />
            <meshBasicMaterial
              map={texture}
              side={THREE.DoubleSide}
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </>
      )}

      {/* 3. Mathematical Higher-Dimensional Projection Bounding Frame */}
      <group ref={tesseractRef}>
        {/* Outer 4D/6D Projection Hypercube Frame */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(size * 1.9, size * 1.9, size * 1.9)]} />
          <lineBasicMaterial
            color="#00d2d3"
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        {/* Inner Compactified Projection Bounds */}
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(size * 1.25, size * 1.25, size * 1.25)]} />
          <lineBasicMaterial
            color="#a29bfe"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      </group>

      {/* 4. Vibrating Fundamental Superstring Loops */}
      <group ref={stringLoopsRef}>
        {[0, 60, 120].map((angle, idx) => (
          <mesh
            key={idx}
            rotation={[
              (angle * Math.PI) / 180,
              (idx * Math.PI) / 3,
              (angle * Math.PI) / 90,
            ]}
          >
            <torusGeometry args={[size * 1.3, 0.12, 16, 64]} />
            <meshBasicMaterial
              color="#54a0ff"
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* 5. Planck Foam Quantum Lattice Points */}
      <points ref={latticeRef} geometry={latticePoints}>
        <pointsMaterial
          size={0.8}
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 6. Glowing Ethereal Volumetric Core Light */}
      <pointLight color="#00d2d3" intensity={3} distance={size * 6} />
      <pointLight color="#7d5fff" intensity={2} distance={size * 5} />
    </group>
  );
}
