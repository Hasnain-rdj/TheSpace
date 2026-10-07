'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CelestialObject } from '@/types/space';
import { useSpaceStore } from '@/store/useSpaceStore';
import { BlackHole } from './BlackHole';
import { GalacticNebula } from './GalacticNebula';
import { QuantumRealm } from './QuantumRealm';
import { PhotorealisticPlanet } from './PhotorealisticPlanet';
import { cosmicAudio } from '@/utils/audioSynth';
import { celestialRegistry } from '@/utils/celestialRegistry';
import { getCelestialTexture } from '@/utils/textureCache';

interface CelestialBodyProps {
  body: CelestialObject;
}

export function CelestialBody({ body }: CelestialBodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const selectedObjectId = useSpaceStore((s) => s.selectedObjectId);
  const hoveredObjectId = useSpaceStore((s) => s.hoveredObjectId);
  const isLabelsVisible = useSpaceStore((s) => s.isLabelsVisible);
  const timeSpeed = useSpaceStore((s) => s.timeSpeed);
  const isSurfaceMode = useSpaceStore((s) => s.isSurfaceMode);
  const selectObject = useSpaceStore((s) => s.selectObject);
  const setHoveredObject = useSpaceStore((s) => s.setHoveredObject);

  const isSelected = selectedObjectId === body.id;
  const isHovered = hoveredObjectId === body.id;

  // Register in global registry for camera tracking
  useEffect(() => {
    if (groupRef.current) {
      celestialRegistry.register(body.id, groupRef.current);
    }
    return () => celestialRegistry.unregister(body.id);
  }, [body.id]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const effectiveDelta = delta * timeSpeed;

    // Orbital motion calculation
    if (body.orbitRadius && body.orbitSpeed && groupRef.current && !isSurfaceMode) {
      const angle = elapsed * body.orbitSpeed * timeSpeed * 0.4;
      let center = body.orbitCenter || [0, 0, 0];
      if (body.parentBodyId) {
        const parentPos = celestialRegistry.getWorldPosition(body.parentBodyId);
        if (parentPos) {
          center = [parentPos.x, parentPos.y, parentPos.z];
        }
      }
      groupRef.current.position.x = center[0] + Math.cos(angle) * body.orbitRadius;
      groupRef.current.position.z = center[2] + Math.sin(angle) * body.orbitRadius;
      if (body.parentBodyId) {
        groupRef.current.position.y = center[1] + Math.sin(angle * 0.5) * 1.5;
      }
    }

    // Axial rotation
    if (meshRef.current && !isSurfaceMode) {
      meshRef.current.rotation.y += body.rotationSpeed * effectiveDelta * 8;
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    selectObject(body.id);
    cosmicAudio.playSelectChime();
  };

  // Route major Solar System bodies, Sun, and Exoplanets to PhotorealisticPlanet
  const isPhotorealistic =
    body.category === 'planet' ||
    body.category === 'moon' ||
    body.category === 'exoplanet' ||
    body.id === 'sun' ||
    [
      'earth',
      'mars',
      'moon',
      'jupiter',
      'saturn',
      'venus',
      'mercury',
      'uranus',
      'neptune',
      'sun',
      'kepler-186f',
      'trappist-1e',
      'hd-189733b',
    ].includes(body.id);

  if (isPhotorealistic) {
    return (
      <group onClick={handleClick}>
        <PhotorealisticPlanet body={body} />
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={body.position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredObject(body.id);
      }}
      onPointerOut={() => setHoveredObject(null)}
    >
      {/* Selection / Hover Indicator Ring */}
      {(isSelected || isHovered) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[body.size * 1.35, body.size * 1.45, 64]} />
          <meshBasicMaterial
            color={isSelected ? '#00d2d3' : '#ff9f43'}
            side={THREE.DoubleSide}
            transparent
            opacity={isSelected ? 0.85 : 0.45}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Specialty Renderers */}
      {body.visuals.isBlackHole ? (
        <BlackHole radius={body.size} />
      ) : body.visuals.isGalaxy ? (
        <GalacticNebula
          radius={body.size}
          baseColor={body.visuals.baseColor}
          secondaryColor={body.visuals.secondaryColor}
          imageUrl={body.imageUrl}
        />
      ) : body.visuals.isQuantum ? (
        <QuantumRealm position={[0, 0, 0]} size={body.size} />
      ) : (
        <mesh ref={meshRef}>
          <sphereGeometry args={[body.size, 64, 64]} />
          <meshStandardMaterial
            map={body.imageUrl ? getCelestialTexture(body.imageUrl) || undefined : undefined}
            color="#ffffff"
            roughness={body.visuals.roughness ?? 0.5}
            metalness={body.visuals.metalness ?? 0.1}
            emissive={body.visuals.emissive ? new THREE.Color(body.visuals.emissive) : undefined}
            emissiveIntensity={body.visuals.emissiveIntensity ?? 0.3}
          />
        </mesh>
      )}

    </group>
  );
}
