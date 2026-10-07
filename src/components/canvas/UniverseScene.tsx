'use client';

import { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CELESTIAL_BODIES } from '@/data/celestialData';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpaceStore } from '@/store/useSpaceStore';
import { celestialRegistry } from '@/utils/celestialRegistry';
import { hudManager } from '@/utils/hudManager';
import { SURFACE_LANDMARKS, latLongToCartesian } from '@/data/landmarksData';
import { preloadAllCelestialTextures } from '@/utils/textureCache';
import { CelestialBody } from './CelestialBody';
import { OrbitLines } from './OrbitLines';
import { CosmicDustAndStars } from './CosmicDustAndStars';
import { MultiverseBubbles } from './MultiverseBubbles';
import { CameraController } from './CameraController';

function CameraHeadlight() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
    }
  });
  return <directionalLight ref={lightRef} intensity={0.4} color="#ffffff" />;
}

function HudTracker() {
  const { camera, size } = useThree();
  const selectedObjectId = useSpaceStore((s) => s.selectedObjectId);
  const hoveredObjectId = useSpaceStore((s) => s.hoveredObjectId);
  const isLabelsVisible = useSpaceStore((s) => s.isLabelsVisible);
  const selectedLandmarkId = useSpaceStore((s) => s.selectedLandmarkId);
  const hoveredLandmarkId = useSpaceStore((s) => s.hoveredLandmarkId);
  const isSurfaceMode = useSpaceStore((s) => s.isSurfaceMode);

  useFrame(() => {
    // 1. Synchronize Planetary / Celestial Body Label
    const activeBodyId = hoveredObjectId || selectedObjectId;
    if (isLabelsVisible && activeBodyId && !isSurfaceMode) {
      const worldPos = celestialRegistry.getWorldPosition(activeBodyId);
      const targetObj = CELESTIAL_BODIES.find((b) => b.id === activeBodyId);
      if (worldPos && targetObj) {
        const labelPos = worldPos.clone();
        labelPos.y += targetObj.size * 1.35 + 1.2;

        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        const toLabel = labelPos.clone().sub(camera.position);

        if (toLabel.dot(camDir) > 0.01) {
          labelPos.project(camera);
          const x = (labelPos.x * 0.5 + 0.5) * size.width;
          const y = (-(labelPos.y * 0.5) + 0.5) * size.height;
          hudManager.updateBody({
            x,
            y,
            visible: true,
            name: targetObj.name,
            isSelected: selectedObjectId === activeBodyId,
          });
        } else {
          hudManager.updateBody(null);
        }
      } else {
        hudManager.updateBody(null);
      }
    } else {
      hudManager.updateBody(null);
    }

    // 2. Synchronize Surface Landmark Tooltip (Google Maps Mode)
    const activeLandmarkId = hoveredLandmarkId || selectedLandmarkId;
    if (isSurfaceMode && activeLandmarkId) {
      const landmark = SURFACE_LANDMARKS.find((l) => l.id === activeLandmarkId);
      const parentBody = CELESTIAL_BODIES.find((b) => b.id === (landmark?.bodyId || ''));
      const bodyWorldPos = landmark ? celestialRegistry.getWorldPosition(landmark.bodyId) : null;

      if (landmark && parentBody && bodyWorldPos) {
        const [lx, ly, lz] = latLongToCartesian(
          landmark.latitude,
          landmark.longitude,
          parentBody.size * 1.05
        );
        const lWorldPos = new THREE.Vector3(
          bodyWorldPos.x + lx,
          bodyWorldPos.y + ly,
          bodyWorldPos.z + lz
        );

        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        const toLandmark = lWorldPos.clone().sub(camera.position);

        if (toLandmark.dot(camDir) > 0.01) {
          lWorldPos.project(camera);
          const x = (lWorldPos.x * 0.5 + 0.5) * size.width;
          const y = (-(lWorldPos.y * 0.5) + 0.5) * size.height;
          hudManager.updateLandmark({
            x,
            y,
            visible: true,
            name: landmark.name,
            elevation: landmark.elevation,
            latitude: landmark.latitude,
            longitude: landmark.longitude,
            isSelected: selectedLandmarkId === activeLandmarkId,
          });
        } else {
          hudManager.updateLandmark(null);
        }
      } else {
        hudManager.updateLandmark(null);
      }
    } else {
      hudManager.updateLandmark(null);
    }
  });

  return null;
}

export function UniverseScene() {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    preloadAllCelestialTextures();
  }, []);

  return (
    <>
      {/* 3D Orbit Controls */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.7}
        zoomSpeed={1.2}
        minDistance={6}
        maxDistance={4500}
        makeDefault
      />

      {/* Cinematic Camera Flight Controller */}
      <CameraController controlsRef={controlsRef} />

      {/* Synchronizes 3D positions to 2D screen-space DOM HUD */}
      <HudTracker />

      {/* Deep Space Cosmic Illumination: Balanced ambient fill + camera headlight ensures textures are 100% visible */}
      <ambientLight intensity={0.42} color="#ffffff" />
      <directionalLight position={[100, 300, 200]} intensity={0.35} color="#e0f2fe" />
      <CameraHeadlight />

      {/* Deep Cosmos Background: 14,000 spectral stars and dust */}
      <CosmicDustAndStars />

      {/* Multiverse Bubble Foam (Macro Cosmic scale) */}
      <MultiverseBubbles center={[0, 500, -2600]} />

      {/* Planetary Orbit Lines */}
      <OrbitLines />

      {/* All Interactive Celestial Bodies */}
      {CELESTIAL_BODIES.map((body) => (
        <CelestialBody key={body.id} body={body} />
      ))}
    </>
  );
}
