'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CelestialObject } from '@/types/space';
import { useSpaceStore } from '@/store/useSpaceStore';
import {
  SURFACE_LANDMARKS,
  latLongToCartesian,
} from '@/data/landmarksData';
import { AtmosphereShader } from './AtmosphereShader';
import { RingSystem } from './RingSystem';
import { SunCorona } from './SunCorona';
import { cosmicAudio } from '@/utils/audioSynth';
import { celestialRegistry } from '@/utils/celestialRegistry';
import { getCelestialTexture, PLANET_TEXTURE_MAP } from '@/utils/textureCache';

interface PhotorealisticPlanetProps {
  body: CelestialObject;
}

export function PhotorealisticPlanet({ body }: PhotorealisticPlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const standardMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const basicMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const cloudMeshRef = useRef<THREE.Mesh>(null);

  const selectedObjectId = useSpaceStore((s) => s.selectedObjectId);
  const hoveredObjectId = useSpaceStore((s) => s.hoveredObjectId);
  const isSurfaceMode = useSpaceStore((s) => s.isSurfaceMode);
  const selectedLandmarkId = useSpaceStore((s) => s.selectedLandmarkId);
  const hoveredLandmarkId = useSpaceStore((s) => s.hoveredLandmarkId);
  const selectObject = useSpaceStore((s) => s.selectObject);
  const selectLandmark = useSpaceStore((s) => s.selectLandmark);
  const setHoveredObject = useSpaceStore((s) => s.setHoveredObject);
  const setHoveredLandmark = useSpaceStore((s) => s.setHoveredLandmark);
  const setCursorCoordinates = useSpaceStore((s) => s.setCursorCoordinates);
  const activeMapLayer = useSpaceStore((s) => s.activeMapLayer);
  const timeSpeed = useSpaceStore((s) => s.timeSpeed);

  const isFocused = selectedObjectId === body.id;
  const isHovered = hoveredObjectId === body.id;

  // Register this body with the global celestial registry for real-time camera tracking
  useEffect(() => {
    if (groupRef.current) {
      celestialRegistry.register(body.id, groupRef.current);
    }
    return () => {
      celestialRegistry.unregister(body.id);
    };
  }, [body.id]);

  // Synchronously obtain primary photographic texture from cache
  const texturePath = PLANET_TEXTURE_MAP[body.id] || body.imageUrl || '/textures/earth_day.jpg';
  const [, setTextureVersion] = useState(0);

  const dayTexture = useMemo(() => {
    return getCelestialTexture(texturePath, () => {
      // Force component and material re-evaluation when image data completes decoding
      if (standardMatRef.current) standardMatRef.current.needsUpdate = true;
      if (basicMatRef.current) basicMatRef.current.needsUpdate = true;
      setTextureVersion((v) => v + 1);
    });
  }, [texturePath]);

  // Earth auxiliary high-fidelity textures
  const normalTexture = useMemo(() => {
    if (body.id !== 'earth') return null;
    return getCelestialTexture('/textures/earth_normal.jpg');
  }, [body.id]);

  const specularTexture = useMemo(() => {
    if (body.id !== 'earth') return null;
    return getCelestialTexture('/textures/earth_specular.jpg');
  }, [body.id]);

  const cloudTexture = useMemo(() => {
    if (body.id !== 'earth') return null;
    return getCelestialTexture('/textures/earth_clouds.png');
  }, [body.id]);

  // Ensure Three.js WebGL material recompiles when texture or layer state changes
  useEffect(() => {
    if (standardMatRef.current) {
      standardMatRef.current.needsUpdate = true;
    }
    if (basicMatRef.current) {
      basicMatRef.current.needsUpdate = true;
    }
  }, [dayTexture, normalTexture, specularTexture, activeMapLayer]);

  // Surface landmarks on this planet
  const landmarks = useMemo(() => {
    return SURFACE_LANDMARKS.filter((l) => l.bodyId === body.id);
  }, [body.id]);

  // Safety tick: ensure shader is freshly bound within initial frames
  const frameCountRef = useRef(0);
  useFrame((state, delta) => {
    if (frameCountRef.current < 5) {
      frameCountRef.current += 1;
      if (standardMatRef.current) standardMatRef.current.needsUpdate = true;
      if (basicMatRef.current) basicMatRef.current.needsUpdate = true;
    }

    const effectiveDelta = delta * timeSpeed;

    // Orbital revolution around parent star / planet
    if (body.orbitRadius && body.orbitSpeed && groupRef.current && !isSurfaceMode) {
      const angle = state.clock.getElapsedTime() * body.orbitSpeed * timeSpeed * 0.4;
      const center = body.orbitCenter || [0, 0, 0];
      groupRef.current.position.x = center[0] + Math.cos(angle) * body.orbitRadius;
      groupRef.current.position.z = center[2] + Math.sin(angle) * body.orbitRadius;
    }

    // Axial rotation
    if (planetMeshRef.current && !isSurfaceMode) {
      planetMeshRef.current.rotation.y += body.rotationSpeed * effectiveDelta * 8;
    }

    // Dynamic atmospheric cloud deck rotation
    if (cloudMeshRef.current && !isSurfaceMode) {
      cloudMeshRef.current.rotation.y += body.rotationSpeed * effectiveDelta * 9.5;
    }
  });

  // Handle pointer over globe to calculate latitude & longitude under cursor
  const handlePointerMove = (e: { uv?: THREE.Vector2; stopPropagation: () => void }) => {
    if (!isFocused || !isSurfaceMode || !e.uv) return;
    const lat = Math.round((0.5 - e.uv.y) * 180 * 10) / 10;
    const lon = Math.round((e.uv.x - 0.5) * 360 * 10) / 10;
    setCursorCoordinates({ lat, lon });
  };

  const handlePointerOut = () => {
    if (isFocused && isSurfaceMode) {
      setCursorCoordinates(null);
    }
    setHoveredObject(null);
  };

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHoveredObject(body.id);
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    selectObject(body.id);
    cosmicAudio.playSelectChime();
  };

  const axialTiltRad = ((body.axialTilt || 0) * Math.PI) / 180;

  return (
    <group
      ref={groupRef}
      position={body.position}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onPointerOver={handlePointerOver}
      onClick={handleClick}
    >
      <group rotation={[0, 0, axialTiltRad]}>
        {/* Main Photographic Planetary Sphere */}
        <mesh
          ref={planetMeshRef}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[body.size, 64, 64]} />
          {body.visuals.isStar ? (
            <meshBasicMaterial
              ref={basicMatRef}
              map={dayTexture || undefined}
              color="#ffffff"
            />
          ) : (
            <meshStandardMaterial
              ref={standardMatRef}
              map={activeMapLayer !== 'elevation' ? dayTexture || undefined : undefined}
              color="#ffffff"
              normalMap={normalTexture || undefined}
              normalScale={normalTexture ? new THREE.Vector2(0.4, 0.4) : undefined}
              roughnessMap={specularTexture || undefined}
              roughness={body.id === 'earth' ? 0.45 : (body.visuals.roughness ?? 0.6)}
              metalness={body.visuals.metalness ?? 0.05}
              wireframe={activeMapLayer === 'elevation'}
            />
          )}
        </mesh>

        {/* Sun Corona if Star */}
        {body.visuals.isStar && <SunCorona radius={body.size} />}

        {/* Real NASA Delicate Cloud Deck for Earth (semi-transparent to reveal continents) */}
        {cloudTexture && activeMapLayer !== 'elevation' && (
          <mesh ref={cloudMeshRef}>
            <sphereGeometry args={[body.size * 1.01, 64, 64]} />
            <meshStandardMaterial
              map={cloudTexture}
              color="#ffffff"
              transparent
              opacity={0.38}
              blending={THREE.NormalBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Atmospheric Glow Rim */}
        {body.visuals.hasAtmosphere && body.visuals.atmosphereColor && (
          <AtmosphereShader
            radius={body.size}
            color={body.visuals.atmosphereColor}
            glowIntensity={body.visuals.atmosphereGlowIntensity ?? 1.2}
          />
        )}

        {/* Saturn / Uranus / Neptune Ring System */}
        {body.visuals.hasRings &&
          body.visuals.ringInnerRadius &&
          body.visuals.ringOuterRadius && (
            <RingSystem
              innerRadius={body.visuals.ringInnerRadius}
              outerRadius={body.visuals.ringOuterRadius}
              color={body.visuals.ringColor}
              texturePath={body.id === 'saturn' ? '/textures/saturn_rings.png' : undefined}
            />
          )}

        {/* Google Maps / Surface Mode 3D Landmarks */}
        {isFocused &&
          isSurfaceMode &&
          landmarks.map((landmark) => {
            const [lx, ly, lz] = latLongToCartesian(
              landmark.latitude,
              landmark.longitude,
              body.size * 1.03
            );
            const isLandmarkSelected = selectedLandmarkId === landmark.id;
            const isHoveredLandmark = hoveredLandmarkId === landmark.id;

            return (
              <group key={landmark.id} position={[lx, ly, lz]}>
                <mesh
                  onClick={(e) => {
                    e.stopPropagation();
                    selectLandmark(landmark.id);
                    cosmicAudio.playSelectChime();
                  }}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredLandmark(landmark.id);
                  }}
                  onPointerOut={() => setHoveredLandmark(null)}
                >
                  <sphereGeometry args={[body.size * 0.045, 16, 16]} />
                  <meshBasicMaterial
                    color={
                      isLandmarkSelected
                        ? '#00d2d3'
                        : isHoveredLandmark
                        ? '#feca57'
                        : '#ff4757'
                    }
                  />
                </mesh>
              </group>
            );
          })}
      </group>
    </group>
  );
}
