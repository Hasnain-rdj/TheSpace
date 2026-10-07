'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AccretionDiskShader } from '@/utils/shaders';

interface BlackHoleProps {
  radius: number;
}

export function BlackHole({ radius }: BlackHoleProps) {
  const diskRef = useRef<THREE.Mesh>(null);
  const warpedDiskRef = useRef<THREE.Mesh>(null);
  const jetsRef = useRef<THREE.Points>(null);
  const realPhotoDiskRef = useRef<THREE.Mesh>(null);

  // Load real NASA / EHT Black Hole accretion photograph
  const sgrTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/textures/sgra.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Custom shader material for relativistic accretion glow
  const diskMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: AccretionDiskShader.vertexShader,
      fragmentShader: AccretionDiskShader.fragmentShader,
      uniforms: {
        time: { value: 0 },
        innerRadius: { value: radius * 1.5 },
        outerRadius: { value: radius * 4.2 },
      },
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [radius]);

  // Relativistic polar plasma jet particles
  const jetParticles = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const isNorth = i % 2 === 0;
      const height = (Math.random() * 2.5 + 0.5) * radius * (isNorth ? 1 : -1);
      const spread = (Math.random() * 0.15 + 0.02) * (Math.abs(height) / radius);
      const angle = Math.random() * Math.PI * 2;

      positions[i * 3] = Math.cos(angle) * spread * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * spread * radius;

      colors[i * 3] = 0.4;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 1.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [radius]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (diskMaterial.uniforms.time) {
      diskMaterial.uniforms.time.value = t;
    }
    if (diskRef.current) {
      diskRef.current.rotation.z += delta * 0.4;
    }
    if (warpedDiskRef.current) {
      warpedDiskRef.current.rotation.y += delta * 0.2;
    }
    if (jetsRef.current) {
      jetsRef.current.rotation.y += delta * 1.2;
    }
    if (realPhotoDiskRef.current) {
      realPhotoDiskRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <group>
      {/* 1. Absolute Event Horizon: Absorbs 100% of incident light */}
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Photon Sphere: Extreme thin ring of trapped light */}
      <mesh>
        <sphereGeometry args={[radius * 1.06, 48, 48]} />
        <meshBasicMaterial
          color="#ffd32a"
          transparent
          opacity={0.35}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Real NASA / EHT Photographic Accretion Plane */}
      <mesh
        ref={realPhotoDiskRef}
        rotation={[-Math.PI / 2.3, 0, 0]}
      >
        <ringGeometry args={[radius * 1.2, radius * 3.6, 64]} />
        <meshBasicMaterial
          map={sgrTexture || undefined}
          side={THREE.DoubleSide}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Equatorial Accretion Disk (Procedural Relativistic Doppler Beaming) */}
      <mesh
        ref={diskRef}
        rotation={[-Math.PI / 2.3, 0, 0]}
        material={diskMaterial}
      >
        <planeGeometry args={[radius * 7, radius * 7, 32, 32]} />
      </mesh>

      {/* 5. Gravitationally Lensed Vertical Halo (The Interstellar Arc) */}
      <mesh
        ref={warpedDiskRef}
        rotation={[0, 0, 0]}
      >
        <ringGeometry args={[radius * 1.15, radius * 2.8, 64]} />
        <meshBasicMaterial
          color="#ff793f"
          side={THREE.DoubleSide}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 6. Relativistic Polar Jet Emission */}
      <points ref={jetsRef} geometry={jetParticles}>
        <pointsMaterial
          size={0.8}
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Emitted intense accretion glow */}
      <pointLight color="#ff9f43" intensity={3.5} distance={radius * 15} />
    </group>
  );
}
