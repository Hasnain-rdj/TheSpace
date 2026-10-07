'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import { useSpaceStore } from '@/store/useSpaceStore';
import { CELESTIAL_BODIES } from '@/data/celestialData';
import { SURFACE_LANDMARKS, latLongToCartesian } from '@/data/landmarksData';
import { cosmicAudio } from '@/utils/audioSynth';
import { celestialRegistry } from '@/utils/celestialRegistry';

interface CameraControllerProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function CameraController({ controlsRef }: CameraControllerProps) {
  const { camera } = useThree();
  const selectedObjectId = useSpaceStore((s) => s.selectedObjectId);
  const selectedLandmarkId = useSpaceStore((s) => s.selectedLandmarkId);
  const isSurfaceMode = useSpaceStore((s) => s.isSurfaceMode);
  const setIsTransitioning = useSpaceStore((s) => s.setIsTransitioning);
  const setCameraDistance = useSpaceStore((s) => s.setCameraDistance);

  const prevTargetKey = useRef<string>('');
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isTweeningRef = useRef<boolean>(false);

  // Smooth cinematic flight on target change
  useEffect(() => {
    const targetKey = `${selectedObjectId}:${selectedLandmarkId || ''}:${isSurfaceMode ? 'surf' : 'glob'}`;
    if (targetKey === prevTargetKey.current) return;
    prevTargetKey.current = targetKey;

    const targetObj = CELESTIAL_BODIES.find((b) => b.id === selectedObjectId);
    if (!targetObj || !controlsRef.current) return;

    setIsTransitioning(true);
    isTweeningRef.current = true;
    cosmicAudio.playWarpSound();

    // Get current real-time world position of the body (accounting for its orbit)
    const currentWorldPos =
      celestialRegistry.getWorldPosition(selectedObjectId) ||
      new THREE.Vector3(...targetObj.position);

    const controls = controlsRef.current;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        isTweeningRef.current = false;
      },
    });
    timelineRef.current = tl;

    // 1. If focusing on a specific surface landmark (Google Maps fly-in)
    if (selectedLandmarkId) {
      const landmark = SURFACE_LANDMARKS.find((l) => l.id === selectedLandmarkId);
      if (landmark) {
        const [lx, ly, lz] = latLongToCartesian(
          landmark.latitude,
          landmark.longitude,
          targetObj.size
        );
        const landmarkWorldPos = new THREE.Vector3(
          currentWorldPos.x + lx,
          currentWorldPos.y + ly,
          currentWorldPos.z + lz
        );
        const camOffset = new THREE.Vector3(lx, ly, lz).normalize().multiplyScalar(targetObj.size * 1.35);
        const landmarkCamPos = new THREE.Vector3(
          currentWorldPos.x + camOffset.x,
          currentWorldPos.y + camOffset.y,
          currentWorldPos.z + camOffset.z
        );

        tl.to(
          camera.position,
          {
            x: landmarkCamPos.x,
            y: landmarkCamPos.y,
            z: landmarkCamPos.z,
            duration: 2.2,
            ease: 'power3.inOut',
          },
          0
        );

        tl.to(
          controls.target,
          {
            x: landmarkWorldPos.x,
            y: landmarkWorldPos.y,
            z: landmarkWorldPos.z,
            duration: 2.0,
            ease: 'power3.inOut',
            onUpdate: () => controls.update(),
          },
          0
        );
        return;
      }
    }

    // 2. If entering Surface Mode (Google Earth close inspection orbit)
    if (isSurfaceMode) {
      const surfaceDistance = targetObj.size * 2.0;
      tl.to(
        camera.position,
        {
          x: currentWorldPos.x + surfaceDistance * 0.8,
          y: currentWorldPos.y + surfaceDistance * 0.4,
          z: currentWorldPos.z + surfaceDistance * 0.8,
          duration: 1.8,
          ease: 'power3.inOut',
        },
        0
      );
      tl.to(
        controls.target,
        {
          x: currentWorldPos.x,
          y: currentWorldPos.y,
          z: currentWorldPos.z,
          duration: 1.6,
          ease: 'power3.inOut',
          onUpdate: () => controls.update(),
        },
        0
      );
      return;
    }

    // 3. Standard global body focus
    let offsetDistance = targetObj.size * 3.2;
    if (targetObj.visuals.hasRings && targetObj.visuals.ringOuterRadius) {
      offsetDistance = targetObj.visuals.ringOuterRadius * 2.8;
    } else if (targetObj.category === 'galaxy') {
      offsetDistance = targetObj.size * 2.2;
    } else if (targetObj.scale === 'cosmic') {
      offsetDistance = targetObj.size * 2.6;
    } else if (targetObj.scale === 'quantum') {
      offsetDistance = targetObj.size * 2.8;
    }

    // Calculate intelligent cinematic viewing angle
    let idealCamOffset: THREE.Vector3;
    if (targetObj.category === 'planet' || targetObj.category === 'moon') {
      // Planet / Moon: position camera on the sunlit hemisphere (45 deg phase angle)
      const toSun = new THREE.Vector3(0, 0, 0).sub(currentWorldPos).normalize();
      if (toSun.lengthSq() > 0.001) {
        const tangent = new THREE.Vector3(-toSun.z, 0, toSun.x).normalize();
        idealCamOffset = toSun
          .clone()
          .multiplyScalar(0.72)
          .add(tangent.clone().multiplyScalar(0.52))
          .add(new THREE.Vector3(0, 0.36, 0))
          .normalize()
          .multiplyScalar(offsetDistance);
      } else {
        idealCamOffset = new THREE.Vector3(0.7, 0.45, 0.85).normalize().multiplyScalar(offsetDistance);
      }
    } else if (targetObj.category === 'galaxy') {
      // Galaxy: elevated oblique vantage point overlooking spiral arm discs
      idealCamOffset = new THREE.Vector3(0, offsetDistance * 0.75, offsetDistance * 0.85);
    } else {
      idealCamOffset = new THREE.Vector3(0.7, 0.45, 0.85).normalize().multiplyScalar(offsetDistance);
    }

    const idealCameraPos = currentWorldPos.clone().add(idealCamOffset);

    tl.to(
      camera.position,
      {
        x: idealCameraPos.x,
        y: idealCameraPos.y,
        z: idealCameraPos.z,
        duration: 2.0,
        ease: 'power3.inOut',
      },
      0
    );

    tl.to(
      controls.target,
      {
        x: currentWorldPos.x,
        y: currentWorldPos.y,
        z: currentWorldPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => controls.update(),
      },
      0
    );
  }, [selectedObjectId, selectedLandmarkId, isSurfaceMode, camera, controlsRef, setIsTransitioning]);

  // Frame update: Live tracking of moving celestial bodies & infinite zoom scale detection
  useFrame(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    // Real-Time Orbital Tracking:
    // If not actively tweening and not in static surface inspection, follow the orbiting planet!
    if (!isTweeningRef.current && selectedObjectId && !selectedLandmarkId) {
      const realPos = celestialRegistry.getWorldPosition(selectedObjectId);
      if (realPos) {
        const delta = realPos.clone().sub(controls.target);
        if (delta.lengthSq() > 0.00001) {
          // Shift both controls target and camera position together so the planet stays in center
          controls.target.add(delta);
          camera.position.add(delta);
          controls.update();
        }
      }
    }

    const dist = camera.position.distanceTo(controls.target);
    setCameraDistance(Math.round(dist));

    if (!isSurfaceMode) {
      if (dist < 45 && camera.position.z > 80) {
        useSpaceStore.setState({ activeScale: 'quantum' });
      } else if (dist > 1800) {
        useSpaceStore.setState({ activeScale: 'cosmic' });
      } else if (dist > 500) {
        useSpaceStore.setState({ activeScale: 'galactic' });
      } else if (dist > 180) {
        useSpaceStore.setState({ activeScale: 'stellar' });
      } else {
        useSpaceStore.setState({ activeScale: 'planetary' });
      }
    }
  });

  return null;
}
