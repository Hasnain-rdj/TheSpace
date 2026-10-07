'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface MultiverseBubblesProps {
  center: [number, number, number];
}

export function MultiverseBubbles({ center }: MultiverseBubblesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const filamentsRef = useRef<THREE.LineSegments>(null);

  // Load real NASA/ESA Planck CMB all-sky texture
  const cmbTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/textures/cmb.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Generate bubble universes and connecting cosmic filaments
  const { bubbles, filamentGeo } = useMemo(() => {
    const bubbleList: Array<{
      pos: [number, number, number];
      size: number;
      color: string;
      speed: number;
    }> = [];

    const colors = ['#8a2be2', '#00d2d3', '#ff6b6b', '#feca57', '#5f27cd', '#48dbfb'];

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.3;
      const dist = Math.random() * 400 + 200;
      const height = (Math.random() - 0.5) * 350;

      bubbleList.push({
        pos: [
          center[0] + Math.cos(angle) * dist,
          center[1] + height,
          center[2] + Math.sin(angle) * dist,
        ],
        size: Math.random() * 45 + 25,
        color: colors[i % colors.length],
        speed: (Math.random() * 0.5 + 0.2) * (Math.random() < 0.5 ? 1 : -1),
      });
    }

    // Connect some bubbles with cosmic web filaments
    const linePositions: number[] = [];
    for (let i = 0; i < bubbleList.length; i++) {
      for (let j = i + 1; j < bubbleList.length; j++) {
        const p1 = bubbleList[i].pos;
        const p2 = bubbleList[j].pos;
        const dx = p1[0] - p2[0];
        const dy = p1[1] - p2[1];
        const dz = p1[2] - p2[2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < 300) {
          linePositions.push(p1[0], p1[1], p1[2]);
          linePositions.push(p2[0], p2[1], p2[2]);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(linePositions, 3)
    );

    return { bubbles: bubbleList, filamentGeo: geo };
  }, [center]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Real NASA / ESA Planck Cosmic Microwave Background Sky Sphere */}
      <mesh position={center}>
        <sphereGeometry args={[280, 48, 48]} />
        <meshStandardMaterial
          map={cmbTexture || undefined}
          color={cmbTexture ? '#ffffff' : '#2b1055'}
          side={THREE.DoubleSide}
          transparent
          opacity={0.65}
          roughness={0.9}
        />
      </mesh>

      {/* Cosmic Web connecting filaments */}
      <lineSegments ref={filamentsRef} geometry={filamentGeo}>
        <lineBasicMaterial
          color="#a29bfe"
          transparent
          opacity={0.25}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Bubble Universes */}
      {bubbles.map((b, idx) => (
        <group key={idx} position={b.pos}>
          {/* Outer membrane */}
          <mesh>
            <sphereGeometry args={[b.size, 24, 24]} />
            <meshStandardMaterial
              color={b.color}
              emissive={b.color}
              emissiveIntensity={0.3}
              roughness={0.1}
              metalness={0.8}
              transparent
              opacity={0.32}
              wireframe={idx % 3 === 0}
            />
          </mesh>
          {/* Inner pocket cosmos */}
          <mesh>
            <sphereGeometry args={[b.size * 0.45, 16, 16]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.2}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
