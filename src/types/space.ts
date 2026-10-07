export type CosmicScale = 'quantum' | 'planetary' | 'stellar' | 'galactic' | 'cosmic';

export type CelestialCategory =
  | 'star'
  | 'planet'
  | 'moon'
  | 'exoplanet'
  | 'black-hole'
  | 'galaxy'
  | 'cosmic-structure'
  | 'quantum-dimension';

export interface PhysicalData {
  mass: string;
  radius: string;
  gravity: string;
  surfaceTemp: string;
  orbitalPeriod: string;
  distanceFromEarth: string;
  atmosphere?: string;
  discovered?: string;
  spectralType?: string;
  eventHorizonRadius?: string;
  theoreticalDimensions?: string;
  planckScaleRatio?: string;
}

export interface CelestialObject {
  id: string;
  name: string;
  designation?: string;
  subtitle: string;
  category: CelestialCategory;
  scale: CosmicScale;
  position: [number, number, number];
  size: number;
  rotationSpeed: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitCenter?: [number, number, number];
  parentBodyId?: string;
  axialTilt?: number; // degrees
  visuals: {
    baseColor: string;
    secondaryColor?: string;
    emissive?: string;
    emissiveIntensity?: number;
    roughness?: number;
    metalness?: number;
    hasAtmosphere?: boolean;
    atmosphereColor?: string;
    atmosphereGlowIntensity?: number;
    hasRings?: boolean;
    ringInnerRadius?: number;
    ringOuterRadius?: number;
    ringColor?: string;
    isStar?: boolean;
    isBlackHole?: boolean;
    isQuantum?: boolean;
    isGalaxy?: boolean;
    cloudTexture?: boolean;
    textureMapUrl?: string;
  };
  imageUrl?: string;
  nasaMissionCredit?: string;
  physicalData: PhysicalData;
  overview: string;
  notableFacts: string[];
}

export interface ViewportTelemetry {
  cameraDistance: number;
  targetDistance: number;
  currentScale: CosmicScale;
  zoomLevel: number;
  fps: number;
}
