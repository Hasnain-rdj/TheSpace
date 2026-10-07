'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { AtmosphereShaderMaterial } from '@/utils/shaders';

interface AtmosphereShaderProps {
  radius: number;
  color: string;
  glowIntensity?: number;
}

export function AtmosphereShader({
  radius,
  color,
  glowIntensity = 1.0,
}: AtmosphereShaderProps) {
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: AtmosphereShaderMaterial.vertexShader,
      fragmentShader: AtmosphereShaderMaterial.fragmentShader,
      uniforms: {
        color: { value: new THREE.Color(color) },
        glowIntensity: { value: glowIntensity },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
    });
    return mat;
  }, [color, glowIntensity]);

  return (
    <mesh material={material}>
      <sphereGeometry args={[radius * 1.015, 64, 64]} />
    </mesh>
  );
}
