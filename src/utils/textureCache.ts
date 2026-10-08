'use client';

import * as THREE from 'three';

// Global cache to ensure textures are only loaded once and shared across components
const textureCache = new Map<string, THREE.Texture>();
const loader = typeof window !== 'undefined' ? new THREE.TextureLoader() : null;

// Complete NASA texture path map for celestial bodies
export const PLANET_TEXTURE_MAP: Record<string, string> = {
  sun: '/textures/sun.jpg',
  mercury: '/textures/mercury.jpg',
  venus: '/textures/venus.jpg',
  earth: '/textures/1_earth_8k.jpg',
  moon: '/textures/moon.jpg',
  mars: '/textures/mars.jpg',
  jupiter: '/textures/jupiter.jpg',
  saturn: '/textures/saturn.jpg',
  uranus: '/textures/uranus.jpg',
  neptune: '/textures/neptune.jpg',
  'kepler-186f': '/textures/kepler186f.jpg',
  'trappist-1e': '/textures/trappist1e.jpg',
  'hd-189733b': '/textures/hd189733b.jpg',
  'milky-way': '/textures/milkyway.jpg',
  andromeda: '/textures/andromeda.jpg',
  'sombrero-galaxy': '/textures/sombrero.jpg',
  'whirlpool-galaxy': '/textures/whirlpool.jpg',
  'cartwheel-galaxy': '/textures/cartwheel.jpg',
  'triangulum-galaxy': '/textures/triangulum.jpg',
  'sagittarius-a': '/textures/sgra.jpg',
  gargantua: '/textures/sgra.jpg',
  'm87-black-hole': '/textures/sgra.jpg',
  'multiverse-foam': '/textures/cmb.jpg',
  'observable-universe': '/textures/cmb.jpg',
  'laniakea-supercluster': '/textures/cmb.jpg',
  'calabi-yau': '/textures/calabi_yau.jpg',
  'quantum-foam': '/textures/quantum_foam.jpg',
};

/**
 * Returns a THREE.Texture immediately.
 * Texture is created synchronously so materials compile with USE_MAP on frame 0.
 * Once the image loads, texture.needsUpdate = true is flagged.
 */
export function getCelestialTexture(
  pathOrId: string | undefined,
  onLoaded?: (tex: THREE.Texture) => void
): THREE.Texture | null {
  if (!pathOrId || typeof window === 'undefined' || !loader) return null;

  const resolvedPath = PLANET_TEXTURE_MAP[pathOrId] || pathOrId;

  if (textureCache.has(resolvedPath)) {
    const existing = textureCache.get(resolvedPath)!;
    if (existing.image && onLoaded) {
      onLoaded(existing);
    }
    return existing;
  }

  const texture = loader.load(
    resolvedPath,
    (loadedTex) => {
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.generateMipmaps = true;
      loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
      loadedTex.magFilter = THREE.LinearFilter;
      loadedTex.needsUpdate = true;
      if (onLoaded) {
        onLoaded(loadedTex);
      }
    },
    undefined,
    (err) => {
      console.warn(`[TheSpace] Texture load warning for ${resolvedPath}:`, err);
    }
  );

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;

  textureCache.set(resolvedPath, texture);
  return texture;
}

/**
 * Preloads all primary celestial textures into memory so they are ready instantly.
 */
export function preloadAllCelestialTextures() {
  if (typeof window === 'undefined') return;
  Object.values(PLANET_TEXTURE_MAP).forEach((path) => {
    getCelestialTexture(path);
  });
  // Earth auxiliary maps
  getCelestialTexture('/textures/earth_normal.jpg');
  getCelestialTexture('/textures/earth_specular.jpg');
  getCelestialTexture('/textures/earth_clouds.png');
  getCelestialTexture('/textures/saturn_rings.png');
}
