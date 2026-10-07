'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getCelestialTexture } from '@/utils/textureCache';

interface GalacticNebulaProps {
  radius: number;
  baseColor: string;
  secondaryColor?: string;
  rotationSpeed?: number;
  imageUrl?: string;
}

export function GalacticNebula({
  radius,
  baseColor,
  secondaryColor = '#00d2d3',
  rotationSpeed = 0.0006,
  imageUrl,
}: GalacticNebulaProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const diskMeshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const [, setTextureVersion] = useState(0);

  // Synchronously load photographic galaxy texture
  const texturePath = imageUrl || '/textures/milkyway.jpg';

  const galaxyTexture = useMemo(() => {
    return getCelestialTexture(texturePath, () => {
      if (matRef.current) matRef.current.needsUpdate = true;
      setTextureVersion((v) => v + 1);
    });
  }, [texturePath]);

  useEffect(() => {
    if (matRef.current) {
      matRef.current.needsUpdate = true;
    }
  }, [galaxyTexture]);

  const { geometry } = useMemo(() => {
    const particleCount = 12000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(baseColor);
    const color2 = new THREE.Color(secondaryColor);
    const coreColor = new THREE.Color('#fff0d4');

    const arms = 2;
    const armSeparationDistance = (2 * Math.PI) / arms;

    for (let i = 0; i < particleCount; i++) {
      const r = Math.pow(Math.random(), 2.2) * radius;
      const armIndex = i % arms;
      const angle = armIndex * armSeparationDistance + r * 0.04;

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (r * 0.15 + 2);
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (radius * 0.06);
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * (r * 0.15 + 2);

      positions[i * 3] = Math.cos(angle) * r + randomX;
      positions[i * 3 + 1] = randomY;
      positions[i * 3 + 2] = Math.sin(angle) * r + randomZ;

      const mixRatio = Math.min(r / radius, 1.0);
      let mixed: THREE.Color;

      if (mixRatio < 0.25) {
        mixed = coreColor.clone().lerp(color1, mixRatio / 0.25);
      } else {
        mixed = color1.clone().lerp(color2, (mixRatio - 0.25) / 0.75);
      }

      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return { geometry: geo };
  }, [radius, baseColor, secondaryColor]);

  const frameCountRef = useRef(0);
  useFrame((_, delta) => {
    if (frameCountRef.current < 5) {
      frameCountRef.current += 1;
      if (matRef.current) matRef.current.needsUpdate = true;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y += rotationSpeed * delta;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += rotationSpeed * 1.5 * delta;
    }
    if (diskMeshRef.current) {
      diskMeshRef.current.rotation.z += rotationSpeed * 0.8 * delta;
    }
  });

  return (
    <group rotation={[Math.PI / 4.2, 0, Math.PI / 5.5]}>
      {/* Authentic NASA High-Fidelity Galactic Photographic Disc */}
      <mesh ref={diskMeshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 1.6, 64]} />
        <meshBasicMaterial
          ref={matRef}
          map={galaxyTexture || undefined}
          color="#ffffff"
          transparent
          opacity={0.96}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle, soft peripheral stellar field */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={0.45}
          vertexColors
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
