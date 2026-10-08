'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Radio,
  Snowflake,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertTriangle,
  ChevronLeft,
  Crosshair,
  ShieldAlert,
  Thermometer,
  Skull,
  CircleDot,
  Gauge,
  Bomb,
  Rocket,
  Layers,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { cosmicAudio } from '@/utils/audioSynth';
import { getCelestialTexture } from '@/utils/textureCache';

// Preload the user's authentic 3D Earth model
useGLTF.preload('/models/Earth.glb');

export type WeaponType =
  | 'nuke_tsar'
  | 'nuke_cluster'
  | 'cruise_missile'
  | 'meteor'
  | 'laser'
  | 'core_bomb'
  | 'freeze'
  | 'slicer'
  | 'blackhole';

interface PlanetConfig {
  id: string;
  name: string;
  texture: string;
  modelUrl?: string;
  radius: number;
  rotationSpeed: number;
  initialPopulation: number;
  initialTemp: number; // Celsius
  atmosphereColor?: string;
  hasClouds?: boolean;
}

const PLANETS: Record<string, PlanetConfig> = {
  earth: {
    id: 'earth',
    name: 'Earth (Terra)',
    texture: '/textures/1_earth_8k.jpg',
    modelUrl: '/models/Earth.glb',
    radius: 5.5,
    rotationSpeed: 0.002,
    initialPopulation: 8054000000,
    initialTemp: 15,
    atmosphereColor: '#00d2d3',
    hasClouds: true,
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    texture: '/textures/mars.jpg',
    radius: 4.2,
    rotationSpeed: 0.0022,
    initialPopulation: 14500, // Colonists
    initialTemp: -63,
    atmosphereColor: '#e17055',
  },
  moon: {
    id: 'moon',
    name: 'The Moon (Luna)',
    texture: '/textures/moon.jpg',
    radius: 3.2,
    rotationSpeed: 0.001,
    initialPopulation: 420, // Moon Base
    initialTemp: -20,
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    texture: '/textures/venus.jpg',
    radius: 5.2,
    rotationSpeed: -0.0008,
    initialPopulation: 0,
    initialTemp: 464,
    atmosphereColor: '#ffa502',
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    texture: '/textures/jupiter.jpg',
    radius: 7.5,
    rotationSpeed: 0.005,
    initialPopulation: 0,
    initialTemp: -110,
    atmosphereColor: '#f1c40f',
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    texture: '/textures/mercury.jpg',
    radius: 3.4,
    rotationSpeed: 0.0012,
    initialPopulation: 0,
    initialTemp: 167,
  },
};

// Particle and projectile types
interface ImpactParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

interface EjectaChunk {
  id: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: THREE.Euler;
  rotVel: THREE.Vector3;
  scale: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Projectile {
  id: string;
  type: 'cruise_missile' | 'nuke_tsar' | 'cluster_warhead' | 'meteor';
  start: THREE.Vector3;
  target: THREE.Vector3;
  current: THREE.Vector3;
  rotation: THREE.Euler;
  progress: number;
  speed: number;
}

interface ShockwaveRing {
  id: string;
  pos: THREE.Vector3;
  normal: THREE.Vector3;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

interface ActiveMushroomCloud {
  id: string;
  pos: THREE.Vector3;
  normal: THREE.Vector3;
  scale: number;
  progress: number; // 0 to 1
  maxLife: number; // seconds
}

interface ActiveBlackHole {
  pos: THREE.Vector3;
  life: number;
}

// 3D Volumetric Mushroom Cloud Component
function MushroomCloudView({ cloud }: { cloud: ActiveMushroomCloud }) {
  const p = cloud.progress; // 0 to 1

  // Height of stem rises
  const stemHeight = Math.min(1, p * 2.5) * cloud.scale * 1.8;
  const stemRadius = (0.15 + p * 0.25) * cloud.scale;

  // Mushroom cap expands outward and flattens
  const capRadius = (0.3 + Math.sin(p * Math.PI * 0.5) * 1.4) * cloud.scale;
  const capHeight = stemHeight;

  // Calculate cooling color: begins incandescent white/orange, transitions to dark charred soot smoke
  const fireballColor = useMemo(() => {
    if (p < 0.25) return '#ffeedd'; // White-hot nuclear detonation fireball
    if (p < 0.55) return '#ff5500'; // Searing radioactive magma fireball
    return '#2b211e'; // Billowing dark pyrocumulus ash
  }, [p]);

  const opacity = Math.max(0, 1 - p * 0.95);

  const orientQuaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), cloud.normal);
    return q;
  }, [cloud.normal]);

  return (
    <group position={cloud.pos} quaternion={orientQuaternion}>
      {/* 1. Rising Stem of Superheated Gases & Ash */}
      <mesh position={[0, stemHeight * 0.5, 0]}>
        <cylinderGeometry args={[stemRadius * 1.3, stemRadius * 0.7, Math.max(0.1, stemHeight), 16]} />
        <meshStandardMaterial
          color={p < 0.4 ? '#ff6600' : '#1f1816'}
          emissive={p < 0.4 ? '#ff3300' : '#000000'}
          emissiveIntensity={p < 0.4 ? 2.5 * (1 - p * 2) : 0}
          transparent
          opacity={opacity * 0.85}
          roughness={0.9}
        />
      </mesh>

      {/* 2. Expanding Toroidal Mushroom Cap / Cloud Head */}
      <mesh position={[0, capHeight, 0]}>
        <sphereGeometry args={[capRadius, 24, 16]} />
        <meshStandardMaterial
          color={fireballColor}
          emissive={p < 0.45 ? '#ff4500' : '#000000'}
          emissiveIntensity={p < 0.45 ? 3.0 * (1 - p * 2) : 0}
          transparent
          opacity={opacity}
          roughness={0.95}
        />
      </mesh>

      {/* 3. Concentric Smoke Ring under Cap */}
      <mesh position={[0, capHeight * 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[capRadius * 0.8, stemRadius * 0.5, 12, 24]} />
        <meshStandardMaterial
          color={p < 0.3 ? '#ff8800' : '#15100e'}
          transparent
          opacity={opacity * 0.75}
        />
      </mesh>

      {/* 4. Thermal Radiation Light Source */}
      {p < 0.6 && (
        <pointLight
          position={[0, capHeight * 0.6, 0]}
          color="#ff7700"
          intensity={Math.max(0, (1 - p / 0.6) * 8 * cloud.scale)}
          distance={cloud.scale * 12}
        />
      )}
    </group>
  );
}

// 3D Missile Model Component
function MissileView({ projectile }: { projectile: Projectile }) {
  const isNuke = projectile.type === 'nuke_tsar';
  const isCluster = projectile.type === 'cluster_warhead';

  return (
    <group position={projectile.current} rotation={projectile.rotation}>
      {/* Sleek Fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry
          args={[isNuke ? 0.16 : 0.08, isNuke ? 0.16 : 0.08, isNuke ? 0.9 : 0.5, 12]}
        />
        <meshStandardMaterial
          color={isNuke ? '#1e293b' : isCluster ? '#334155' : '#e2e8f0'}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Aerodynamic Radome Warhead Tip */}
      <mesh position={[0, 0, isNuke ? 0.55 : 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[isNuke ? 0.16 : 0.08, isNuke ? 0.35 : 0.18, 12]} />
        <meshStandardMaterial color={isNuke ? '#e11d48' : '#f97316'} roughness={0.3} />
      </mesh>

      {/* Stabilizing Delta Tail Fins */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, idx) => (
        <mesh
          key={idx}
          position={[0, 0, isNuke ? -0.38 : -0.22]}
          rotation={[0, 0, angle]}
        >
          <boxGeometry args={[isNuke ? 0.45 : 0.22, 0.02, 0.15]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}

      {/* Rocket Booster Exhaust Flame */}
      <mesh position={[0, 0, isNuke ? -0.65 : -0.38]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[isNuke ? 0.14 : 0.07, isNuke ? 0.5 : 0.3, 8]} />
        <meshBasicMaterial color="#ff4500" />
      </mesh>

      {/* Glowing Thruster Light */}
      <pointLight
        position={[0, 0, -0.4]}
        color="#ff6600"
        intensity={isNuke ? 4 : 2}
        distance={4}
      />
    </group>
  );
}

// 3D Meteor Model Component
function MeteorView({ projectile }: { projectile: Projectile }) {
  return (
    <group position={projectile.current}>
      {/* Jagged Asteroid Body */}
      <mesh rotation={[projectile.progress * 8, projectile.progress * 5, 0]}>
        <dodecahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial
          color="#3e2723"
          roughness={0.95}
          metalness={0.2}
          emissive="#ff3d00"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Atmospheric Entry Plasma Glow */}
      <mesh>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight color="#ff4500" intensity={5} distance={7} />
    </group>
  );
}

interface DestructionSceneProps {
  planet: PlanetConfig;
  activeWeapon: WeaponType;
  blastPower: number;
  isPaused: boolean;
  timeScale: number;
  damageCanvas: HTMLCanvasElement;
  onDamageApplied: (amount: number, casualties: number, tempDelta: number) => void;
  triggerScreenFlash: (color: string, intensity: number) => void;
  resetTrigger: number;
  isRestoring: boolean;
  onRestoringFinished: () => void;
}

function DestructionScene({
  planet,
  activeWeapon,
  blastPower,
  isPaused,
  timeScale,
  damageCanvas,
  onDamageApplied,
  triggerScreenFlash,
  resetTrigger,
  isRestoring,
  onRestoringFinished,
}: DestructionSceneProps) {
  const { camera } = useThree();
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const cloudMeshRef = useRef<THREE.Mesh>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const damageMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Camera Shake state
  const cameraShakeRef = useRef<number>(0);
  const originalCamPosRef = useRef<THREE.Vector3 | null>(null);

  // Load the user's authentic 3D Earth model
  const earthGLTF = useGLTF('/models/Earth.glb');

  // Build the baseline high-density geometry (from 3D model if Earth, or 128x128 sphere)
  const baseGeometry = useMemo(() => {
    if (planet.id === 'earth') {
      let geo: THREE.BufferGeometry | null = null;
      earthGLTF.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && !geo) {
          geo = (child as THREE.Mesh).geometry.clone();
          geo.scale(planet.radius, planet.radius, planet.radius);
          geo.computeVertexNormals();
        }
      });
      if (geo) return geo;
    }
    return new THREE.SphereGeometry(planet.radius, 128, 128);
  }, [planet.id, planet.radius, earthGLTF.scene]);

  // Active mutable geometry that gets physically deformed on impact
  const activeGeometry = useMemo(() => {
    return baseGeometry.clone();
  }, [baseGeometry, resetTrigger]);

  // Store original positions for measuring depth, rim elevation, and smooth restoration
  const originalPositions = useMemo(() => {
    return new Float32Array(baseGeometry.attributes.position.array);
  }, [baseGeometry]);

  // Synchronous NASA / 8K texture
  const baseTexture = useMemo(() => {
    return getCelestialTexture(planet.texture);
  }, [planet.texture]);

  // Damage canvas texture overlay
  const damageTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(damageCanvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [damageCanvas]);

  // Laser beam state
  const isFiringLaserRef = useRef(false);
  const [laserBeamActive, setLaserBeamActive] = useState(false);
  const [laserBeamPoints, setLaserBeamPoints] = useState<[THREE.Vector3, THREE.Vector3] | null>(null);
  const lastLaserUVRef = useRef<{ u: number; v: number } | null>(null);

  // Active Projectiles, Ejecta & Entities
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [ejectaChunks, setEjectaChunks] = useState<EjectaChunk[]>([]);
  const [mushroomClouds, setMushroomClouds] = useState<ActiveMushroomCloud[]>([]);
  const [particles, setParticles] = useState<ImpactParticle[]>([]);
  const [shockwaves, setShockwaves] = useState<ShockwaveRing[]>([]);
  const [blackHoles, setBlackHoles] = useState<ActiveBlackHole[]>([]);

  // Reset visual effects on resetTrigger
  useEffect(() => {
    setProjectiles([]);
    setEjectaChunks([]);
    setMushroomClouds([]);
    setParticles([]);
    setShockwaves([]);
    setBlackHoles([]);
    setLaserBeamActive(false);
    setLaserBeamPoints(null);
    lastLaserUVRef.current = null;
    damageTexture.needsUpdate = true;
    if (damageMatRef.current) damageMatRef.current.needsUpdate = true;
  }, [resetTrigger, damageTexture]);

  // Convert 3D spherical hit point to UV coordinates
  const hitPointToUV = useCallback((hitPoint: THREE.Vector3) => {
    const norm = hitPoint.clone().normalize();
    const u = 0.5 + Math.atan2(norm.z, norm.x) / (2 * Math.PI);
    const v = 0.5 - Math.asin(norm.y) / Math.PI;
    return { u, v };
  }, []);

  // REAL 3D PHYSICAL VERTEX CRATER DEFORMATION ENGINE
  const deformMeshAtPoint = useCallback(
    (hitLocal: THREE.Vector3, type: WeaponType, power: number) => {
      const posAttr = activeGeometry.attributes.position;
      if (!posAttr) return;

      const count = posAttr.count;

      // Physical crater dimensions based on weapon caliber and power
      let craterRadius = 1.35 * power;
      let maxDepth = 0.65 * power;
      let rimHeight = 0.28 * power;

      if (type === 'nuke_tsar') {
        craterRadius = 2.6 * power;
        maxDepth = 1.15 * power;
        rimHeight = 0.48 * power;
      } else if (type === 'nuke_cluster') {
        craterRadius = 1.45 * power;
        maxDepth = 0.58 * power;
        rimHeight = 0.24 * power;
      } else if (type === 'cruise_missile') {
        craterRadius = 1.05 * power;
        maxDepth = 0.52 * power;
        rimHeight = 0.2 * power;
      } else if (type === 'meteor') {
        craterRadius = 3.1 * power;
        maxDepth = 1.45 * power;
        rimHeight = 0.65 * power;
      } else if (type === 'core_bomb') {
        craterRadius = 3.9 * power;
        maxDepth = 2.1 * power;
        rimHeight = 0.8 * power;
      } else if (type === 'laser') {
        craterRadius = 0.65 * power;
        maxDepth = 0.42 * power;
        rimHeight = 0.1 * power;
      }

      const v = new THREE.Vector3();
      const vNorm = new THREE.Vector3();
      const origV = new THREE.Vector3();

      for (let i = 0; i < count; i++) {
        v.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
        origV.set(
          originalPositions[i * 3],
          originalPositions[i * 3 + 1],
          originalPositions[i * 3 + 2]
        );
        const origRadius = origV.length();
        const dist = v.distanceTo(hitLocal);

        if (dist < craterRadius * 1.35) {
          vNorm.copy(v).normalize();

          if (dist < craterRadius) {
            // Inner Crater Depression: Concave parabolic cavity into the planet
            const cavityFactor = 1 - Math.pow(dist / craterRadius, 2);
            // Jagged bedrock irregularity noise
            const noise = 1 + (Math.sin(v.x * 20) * Math.cos(v.y * 20)) * 0.14;
            const currentR = v.length();
            const targetR = Math.max(origRadius * 0.45, origRadius - maxDepth * cavityFactor * noise);
            const newR = Math.min(currentR, targetR);
            v.copy(vNorm.multiplyScalar(newR));
          } else {
            // Raised Ejecta Rim: Displaced crust pushed upward/outward
            const rimDist = dist - craterRadius;
            const sigma = craterRadius * 0.2;
            const rimFactor = Math.exp(-Math.pow(rimDist, 2) / (2 * Math.pow(sigma, 2)));
            const rimNoise = 1 + Math.sin(v.z * 16 + v.x * 12) * 0.22;
            const targetR = origRadius + rimHeight * rimFactor * rimNoise;
            const currentR = v.length();
            const newR = Math.max(currentR, targetR);
            v.copy(vNorm.multiplyScalar(newR));
          }

          posAttr.setXYZ(i, v.x, v.y, v.z);
        }
      }

      posAttr.needsUpdate = true;
      activeGeometry.computeVertexNormals();
    },
    [activeGeometry, originalPositions]
  );

  // Spawn 3D Physical Debris Chunks (Ejecta Fragments)
  const spawnEjectaChunks = useCallback(
    (origin: THREE.Vector3, count: number) => {
      const normal = origin.clone().normalize();
      const newChunks: EjectaChunk[] = [];

      for (let i = 0; i < count; i++) {
        const scatter = new THREE.Vector3(
          (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 1.4
        );
        const dir = normal.clone().add(scatter).normalize();
        const speed = Math.random() * 5 + 3.5;

        newChunks.push({
          id: Math.random().toString(),
          pos: origin.clone().add(normal.clone().multiplyScalar(0.1)),
          vel: dir.multiplyScalar(speed),
          rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
          rotVel: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
          ),
          scale: (Math.random() * 0.22 + 0.08) * blastPower,
          life: 1.0,
          maxLife: Math.random() * 1.2 + 1.2,
          color: Math.random() < 0.6 ? '#ff4500' : '#2b1810',
        });
      }

      setEjectaChunks((prev) => [...prev.slice(-80), ...newChunks]);
    },
    [blastPower]
  );

  // HIGH-REALISM PROCEDURAL CRATER DEFORMATION ENGINE (Texture Layer)
  const applyDamageToCanvas = useCallback(
    (
      u: number,
      v: number,
      type: WeaponType,
      power: number,
      prevUV?: { u: number; v: number } | null
    ) => {
      const ctx = damageCanvas.getContext('2d');
      if (!ctx) return;

      const w = damageCanvas.width;
      const h = damageCanvas.height;
      const x = u * w;
      const y = v * h;

      const baseR = 14 * power;
      const seed = Math.random() * 100;

      // Helper: Draw organic non-circular perimeter with multi-octave perturbation
      const drawOrganicPath = (cx: number, cy: number, radius: number, points = 28, roughness = 0.18) => {
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const noise =
            1 +
            Math.sin(angle * 3 + seed) * (roughness * 0.6) +
            Math.cos(angle * 7 + seed * 1.5) * (roughness * 0.4) +
            Math.sin(angle * 13 + seed * 2.3) * (roughness * 0.3) +
            (Math.random() - 0.5) * roughness * 0.2;
          const r = radius * noise;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      };

      // Helper: Draw realistic supersonic ejecta rays radiating outwards
      const drawEjectaRays = (cx: number, cy: number, innerR: number, outerR: number, count = 16) => {
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
          const length = outerR * (0.6 + Math.random() * 0.9);
          const rayGrad = ctx.createLinearGradient(
            cx + Math.cos(angle) * innerR,
            cy + Math.sin(angle) * innerR,
            cx + Math.cos(angle) * length,
            cy + Math.sin(angle) * length
          );
          rayGrad.addColorStop(0, 'rgba(15, 8, 5, 0.9)');
          rayGrad.addColorStop(0.35, 'rgba(120, 30, 10, 0.45)');
          rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = (Math.random() * 3 + 1.5) * power;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * innerR * 0.7, cy + Math.sin(angle) * innerR * 0.7);
          ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
          ctx.stroke();
        }
      };

      // Helper: Draw branching tectonic fracture cracks peeking with molten red magma
      const drawTectonicFractures = (cx: number, cy: number, startR: number, maxR: number, branches = 6) => {
        for (let b = 0; b < branches; b++) {
          let curAngle = (b / branches) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
          let curR = startR * 0.9;
          let curX = cx + Math.cos(curAngle) * curR;
          let curY = cy + Math.sin(curAngle) * curR;

          ctx.beginPath();
          ctx.moveTo(curX, curY);

          while (curR < maxR) {
            curR += (Math.random() * 10 + 6) * power;
            curAngle += (Math.random() - 0.5) * 0.45;
            curX = cx + Math.cos(curAngle) * curR;
            curY = cy + Math.sin(curAngle) * curR;
            ctx.lineTo(curX, curY);
          }

          ctx.strokeStyle = '#ff3700';
          ctx.lineWidth = 2.2 * power;
          ctx.shadowColor = '#ff6600';
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      };

      if (type === 'laser') {
        // CONTINUOUS ORBITAL LASER: Searing Molten Canyon
        if (prevUV) {
          const px = prevUV.u * w;
          const py = prevUV.v * h;

          ctx.strokeStyle = '#140500';
          ctx.lineWidth = baseR * 1.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();

          ctx.strokeStyle = '#ff3700';
          ctx.lineWidth = baseR * 1.1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = baseR * 0.45;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
        } else {
          const grad = ctx.createRadialGradient(x, y, 0, x, y, baseR * 1.2);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, '#ffaa00');
          grad.addColorStop(0.65, '#ff3300');
          grad.addColorStop(0.85, '#220500');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          drawOrganicPath(x, y, baseR * 1.2, 20, 0.2);
          ctx.fill();
        }
      } else if (type === 'freeze') {
        // CRYOGENIC GLACIAL FLASH FREEZE
        const freezeR = baseR * 2.2;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, freezeR);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        grad.addColorStop(0.3, 'rgba(224, 247, 250, 0.95)');
        grad.addColorStop(0.6, 'rgba(77, 208, 225, 0.8)');
        grad.addColorStop(0.85, 'rgba(0, 151, 167, 0.45)');
        grad.addColorStop(1, 'rgba(0, 151, 167, 0)');
        ctx.fillStyle = grad;
        drawOrganicPath(x, y, freezeR, 32, 0.25);
        ctx.fill();

        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8 * power;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(a) * freezeR * 0.9, y + Math.sin(a) * freezeR * 0.9);
          ctx.stroke();
        }
      } else if (type === 'slicer') {
        // ORBITAL PLASMA CUTTER TECTONIC FISSURE
        ctx.strokeStyle = '#110500';
        ctx.lineWidth = 16 * power;
        ctx.beginPath();
        ctx.moveTo(x - 70 * power, y - 35 * power);
        ctx.lineTo(x + 70 * power, y + 35 * power);
        ctx.stroke();

        ctx.strokeStyle = '#ff5500';
        ctx.lineWidth = 9 * power;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(x - 70 * power, y - 35 * power);
        ctx.lineTo(x + 70 * power, y + 35 * power);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5 * power;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // EXPLOSIVE IMPACT CRATERS: TSAR BOMBA, CLUSTER NUKE, CRUISE MISSILE, METEOR, CORE BOMB
        let craterRadiusMultiplier = 1.8;
        let isNuclear = false;

        if (type === 'nuke_tsar') {
          craterRadiusMultiplier = 3.2;
          isNuclear = true;
        } else if (type === 'nuke_cluster') {
          craterRadiusMultiplier = 1.9;
          isNuclear = true;
        } else if (type === 'cruise_missile') {
          craterRadiusMultiplier = 1.4;
        } else if (type === 'meteor') {
          craterRadiusMultiplier = 2.8;
        } else if (type === 'core_bomb') {
          craterRadiusMultiplier = 3.8;
        }

        const craterR = baseR * craterRadiusMultiplier;

        // 1. Irradiated / Charred Ash Blast Zone (Outer Halo)
        const outerHaloR = craterR * (isNuclear ? 2.2 : 1.7);
        const haloGrad = ctx.createRadialGradient(x, y, craterR * 0.4, x, y, outerHaloR);
        haloGrad.addColorStop(0, isNuclear ? 'rgba(8, 6, 6, 0.95)' : 'rgba(15, 10, 8, 0.85)');
        haloGrad.addColorStop(0.6, isNuclear ? 'rgba(30, 20, 18, 0.7)' : 'rgba(40, 20, 10, 0.5)');
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        drawOrganicPath(x, y, outerHaloR, 32, 0.28);
        ctx.fill();

        // 2. High-Velocity Supersonic Ejecta Rays
        drawEjectaRays(x, y, craterR * 0.7, outerHaloR * 1.3, isNuclear ? 22 : 16);

        // 3. Tectonic Spiderweb Magma Fractures radiating outwards
        drawTectonicFractures(x, y, craterR * 0.8, craterR * 1.6, isNuclear ? 8 : 5);

        // 4. Raised Scorched Crater Rim (Basalt & Charred Slag)
        ctx.fillStyle = isNuclear ? '#120b08' : '#1f130b';
        drawOrganicPath(x, y, craterR * 1.08, 30, 0.22);
        ctx.fill();

        // 5. Deep Molten Magma Reservoir / Lava Lake inside crater basin
        const lavaR = craterR * 0.82;
        const lavaGrad = ctx.createRadialGradient(x, y, 0, x, y, lavaR);
        lavaGrad.addColorStop(0, '#ffffff'); // Incandescent white-hot center
        lavaGrad.addColorStop(0.25, '#ffdd44'); // Radiant yellow molten rock
        lavaGrad.addColorStop(0.6, '#ff4500'); // Searing orange-red magma
        lavaGrad.addColorStop(0.85, '#991100'); // Deep red crust
        lavaGrad.addColorStop(1, '#2b0700'); // Charred boundary
        ctx.fillStyle = lavaGrad;
        drawOrganicPath(x, y, lavaR, 26, 0.18);
        ctx.fill();

        // 6. Floating Basalt Crust Rafts inside molten lake (Volcanic caldera effect)
        const raftCount = Math.floor(Math.random() * 5 + 4);
        for (let r = 0; r < raftCount; r++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = (Math.random() * 0.6 + 0.15) * lavaR;
          const raftX = x + Math.cos(angle) * dist;
          const raftY = y + Math.sin(angle) * dist;
          const raftRadius = (Math.random() * 3 + 2) * power;

          ctx.fillStyle = '#140704';
          ctx.beginPath();
          ctx.arc(raftX, raftY, raftRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // 7. Fallout Splatters and secondary ejecta debris around crater rim
        for (let i = 0; i < 14; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = craterR * (0.8 + Math.random() * 0.9);
          const dropX = x + Math.cos(angle) * dist;
          const dropY = y + Math.sin(angle) * dist;
          const dropR = (Math.random() * 3.5 + 1.5) * power;

          ctx.fillStyle = Math.random() < 0.4 ? '#ff5500' : '#0d0705';
          ctx.beginPath();
          ctx.arc(dropX, dropY, dropR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      damageTexture.needsUpdate = true;
      if (damageMatRef.current) {
        damageMatRef.current.needsUpdate = true;
      }
    },
    [damageCanvas, damageTexture]
  );

  // Spawn 3D particles on impact
  const spawnExplosionParticles = useCallback(
    (origin: THREE.Vector3, count: number, colorHex: string, speedScale: number = 1.0) => {
      const newParticles: ImpactParticle[] = [];
      const baseColor = new THREE.Color(colorHex);

      for (let i = 0; i < count; i++) {
        const dir = origin
          .clone()
          .normalize()
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 1.3,
              (Math.random() - 0.5) * 1.3,
              (Math.random() - 0.5) * 1.3
            )
          )
          .normalize();

        const speed = (Math.random() * 5 + 2.5) * speedScale;
        newParticles.push({
          pos: origin.clone(),
          vel: dir.multiplyScalar(speed),
          color: baseColor.clone(),
          size: Math.random() * 0.2 + 0.1,
          life: 1.0,
          maxLife: Math.random() * 0.5 + 0.5,
        });
      }

      setParticles((prev) => [...prev.slice(-220), ...newParticles]);
    },
    []
  );

  // Spawn 3D expanding shockwave ring
  const spawnShockwave = useCallback((origin: THREE.Vector3, maxR: number, colorHex: string) => {
    const normal = origin.clone().normalize();
    setShockwaves((prev) => [
      ...prev.slice(-15),
      {
        id: Math.random().toString(),
        pos: origin.clone().add(normal.clone().multiplyScalar(0.06)),
        normal,
        radius: 0.1,
        maxRadius: maxR,
        opacity: 0.95,
        color: colorHex,
      },
    ]);
  }, []);

  // Spawn 3D Mushroom Cloud
  const spawnMushroomCloud = useCallback((origin: THREE.Vector3, scale: number) => {
    const normal = origin.clone().normalize();
    setMushroomClouds((prev) => [
      ...prev.slice(-8),
      {
        id: Math.random().toString(),
        pos: origin.clone(),
        normal,
        scale,
        progress: 0,
        maxLife: 3.8,
      },
    ]);
  }, []);

  // TRIGGER WEAPON IMPACT & PHYSICAL COLLISION
  const triggerImpact = useCallback(
    (hitPoint: THREE.Vector3, type: WeaponType) => {
      // 1. Convert hitPoint from world to local mesh coordinates
      const hitLocal = planetMeshRef.current
        ? planetMeshRef.current.worldToLocal(hitPoint.clone())
        : hitPoint.clone();

      // 2. REAL PHYSICAL 3D VERTEX CRATER DEFORMATION
      deformMeshAtPoint(hitLocal, type, blastPower);

      // 3. PHYSICAL 3D DEBRIS EJECTA CHUNKS FLYING INTO SPACE
      spawnEjectaChunks(hitPoint, Math.floor(blastPower * (type === 'meteor' ? 24 : type === 'nuke_tsar' ? 20 : 14)));

      // 4. Multi-layer charred & molten crater texture decal
      const { u, v } = hitPointToUV(hitPoint);
      applyDamageToCanvas(u, v, type, blastPower, type === 'laser' ? lastLaserUVRef.current : null);

      if (type === 'laser') {
        lastLaserUVRef.current = { u, v };
        cosmicAudio.playLaserSound();
        spawnExplosionParticles(hitPoint, 12, '#ffaa00', 0.7 * blastPower);
        onDamageApplied(0.6 * blastPower, 16000000 * blastPower, 10 * blastPower);
      } else if (type === 'nuke_tsar') {
        // STRATEGIC TSAR BOMBA THERMONUCLEAR DETONATION
        cosmicAudio.playNuclearDetonationSound(2.2 * blastPower);
        triggerScreenFlash('#ffffff', 0.9);
        cameraShakeRef.current = 1.5;
        spawnMushroomCloud(hitPoint, blastPower * 1.8);
        spawnExplosionParticles(hitPoint, 70, '#ffeedd', 2.6 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 1.6 * blastPower, '#ffffff');
        onDamageApplied(14.0 * blastPower, 480000000 * blastPower, 190 * blastPower);
      } else if (type === 'nuke_cluster') {
        // CLUSTER WARHEAD DETONATION
        cosmicAudio.playNuclearDetonationSound(1.2 * blastPower);
        triggerScreenFlash('#ff7700', 0.6);
        cameraShakeRef.current = 0.8;
        spawnMushroomCloud(hitPoint, blastPower * 1.1);
        spawnExplosionParticles(hitPoint, 45, '#ff6600', 1.8 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 0.9 * blastPower, '#ffaa00');
        onDamageApplied(3.5 * blastPower, 110000000 * blastPower, 45 * blastPower);
      } else if (type === 'cruise_missile') {
        // HYPERSONIC CRUISE MISSILE IMPACT
        cosmicAudio.playExplosionSound(1.4 * blastPower);
        triggerScreenFlash('#ff5500', 0.45);
        cameraShakeRef.current = 0.6;
        spawnExplosionParticles(hitPoint, 35, '#ff2200', 1.5 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 0.7 * blastPower, '#ff4400');
        onDamageApplied(2.6 * blastPower, 42000000 * blastPower, 25 * blastPower);
      } else if (type === 'meteor') {
        // ASTEROID KINETIC IMPACT
        cosmicAudio.playExplosionSound(2.0 * blastPower);
        triggerScreenFlash('#ffaa33', 0.8);
        cameraShakeRef.current = 1.3;
        spawnExplosionParticles(hitPoint, 60, '#ff4400', 2.2 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 1.3 * blastPower, '#ffaa00');
        onDamageApplied(8.0 * blastPower, 220000000 * blastPower, 85 * blastPower);
      } else if (type === 'freeze') {
        // CRYO FREEZE RAY
        cosmicAudio.playFreezeSound();
        spawnExplosionParticles(hitPoint, 25, '#00ffff', 0.9 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 0.8 * blastPower, '#00ffff');
        onDamageApplied(1.5 * blastPower, 15000000 * blastPower, -30 * blastPower);
      } else if (type === 'slicer') {
        // ORBITAL PLASMA SLICER
        cosmicAudio.playLaserSound();
        spawnExplosionParticles(hitPoint, 40, '#ffbb00', 1.6 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 1.2 * blastPower, '#ffff00');
        onDamageApplied(6.0 * blastPower, 130000000 * blastPower, 80 * blastPower);
      } else if (type === 'core_bomb') {
        // PLANETARY CORE ANTIMATTER DETONATOR
        cosmicAudio.playNuclearDetonationSound(2.8 * blastPower);
        triggerScreenFlash('#ffffff', 0.95);
        cameraShakeRef.current = 2.0;
        spawnMushroomCloud(hitPoint, blastPower * 2.2);
        spawnExplosionParticles(hitPoint, 85, '#ffffff', 3.0 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 1.9 * blastPower, '#ff3300');
        onDamageApplied(18.0 * blastPower, 650000000 * blastPower, 300 * blastPower);
      }
    },
    [
      deformMeshAtPoint,
      spawnEjectaChunks,
      hitPointToUV,
      applyDamageToCanvas,
      blastPower,
      planet.radius,
      spawnExplosionParticles,
      spawnShockwave,
      spawnMushroomCloud,
      triggerScreenFlash,
      onDamageApplied,
    ]
  );

  // POINTER INTERACTION: Launch Projectiles or Continuous Laser
  const handlePointerDown = (e: { point: THREE.Vector3; stopPropagation: () => void }) => {
    e.stopPropagation();
    const hit = e.point;

    if (activeWeapon === 'laser') {
      isFiringLaserRef.current = true;
      lastLaserUVRef.current = null;
      setLaserBeamActive(true);
      const orbitOrigin = hit.clone().normalize().multiplyScalar(planet.radius * 2.8);
      setLaserBeamPoints([orbitOrigin, hit]);
      triggerImpact(hit, 'laser');
    } else if (activeWeapon === 'nuke_tsar') {
      // Launch strategic nuclear ICBM
      cosmicAudio.playMissileSound();
      const start = camera.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, -1.5, 0));
      const dir = hit.clone().sub(start).normalize();
      const euler = new THREE.Euler();
      euler.setFromVector3(dir);

      setProjectiles((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: 'nuke_tsar',
          start,
          target: hit,
          current: start.clone(),
          rotation: euler,
          progress: 0,
          speed: 1.6 * timeScale,
        },
      ]);
    } else if (activeWeapon === 'nuke_cluster') {
      // Launch MIRV Cluster Strike (6 warheads scattering)
      cosmicAudio.playClusterLaunchSound();
      const clusterProjectiles: Projectile[] = [];

      for (let i = 0; i < 6; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 1.8
        );
        const subTarget = hit.clone().add(offset).normalize().multiplyScalar(planet.radius);
        const start = camera.position
          .clone()
          .add(new THREE.Vector3((Math.random() - 0.5) * 3, -1 - i * 0.2, 0));
        const dir = subTarget.clone().sub(start).normalize();
        const euler = new THREE.Euler();
        euler.setFromVector3(dir);

        clusterProjectiles.push({
          id: Math.random().toString(),
          type: 'cluster_warhead',
          start,
          target: subTarget,
          current: start.clone(),
          rotation: euler,
          progress: 0,
          speed: (2.0 + i * 0.15) * timeScale,
        });
      }

      setProjectiles((prev) => [...prev, ...clusterProjectiles]);
    } else if (activeWeapon === 'cruise_missile') {
      // Launch tactical cruise missile
      cosmicAudio.playMissileSound();
      const start = camera.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 3, -1, 0));
      const dir = hit.clone().sub(start).normalize();
      const euler = new THREE.Euler();
      euler.setFromVector3(dir);

      setProjectiles((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: 'cruise_missile',
          start,
          target: hit,
          current: start.clone(),
          rotation: euler,
          progress: 0,
          speed: 2.6 * timeScale,
        },
      ]);
    } else if (activeWeapon === 'meteor') {
      // Summon asteroid impactor
      cosmicAudio.playMissileSound();
      const start = hit.clone().normalize().multiplyScalar(planet.radius * 3.8);
      start.x += (Math.random() - 0.5) * 6;
      start.y += (Math.random() - 0.5) * 6;
      const dir = hit.clone().sub(start).normalize();
      const euler = new THREE.Euler();
      euler.setFromVector3(dir);

      setProjectiles((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          type: 'meteor',
          start,
          target: hit,
          current: start.clone(),
          rotation: euler,
          progress: 0,
          speed: 1.8 * timeScale,
        },
      ]);
    } else if (activeWeapon === 'blackhole') {
      cosmicAudio.playExplosionSound(1.0);
      const singularityPos = hit.clone().normalize().multiplyScalar(planet.radius * 1.4);
      setBlackHoles((prev) => [
        ...prev.slice(-3),
        {
          pos: singularityPos,
          life: 8.0,
        },
      ]);
      triggerImpact(hit, 'core_bomb');
    } else {
      triggerImpact(hit, activeWeapon);
    }
  };

  const handlePointerMove = (e: { point: THREE.Vector3 }) => {
    if (activeWeapon === 'laser' && isFiringLaserRef.current) {
      const hit = e.point;
      const orbitOrigin = hit.clone().normalize().multiplyScalar(planet.radius * 2.8);
      setLaserBeamPoints([orbitOrigin, hit]);
      triggerImpact(hit, 'laser');
    }
  };

  const handlePointerUp = () => {
    isFiringLaserRef.current = false;
    setLaserBeamActive(false);
    setLaserBeamPoints(null);
    lastLaserUVRef.current = null;
  };

  // MAIN SIMULATION ANIMATION LOOP
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1) * timeScale;

    // 1. Camera Shake Effect
    if (cameraShakeRef.current > 0.01) {
      if (!originalCamPosRef.current) {
        originalCamPosRef.current = camera.position.clone();
      }
      const shakeAmt = cameraShakeRef.current * 0.25;
      camera.position.x += (Math.random() - 0.5) * shakeAmt;
      camera.position.y += (Math.random() - 0.5) * shakeAmt;
      cameraShakeRef.current *= 0.88;
    } else if (originalCamPosRef.current) {
      originalCamPosRef.current = null;
    }

    // 2. Smooth Genesis Planetary Healing (Vertex Morph Restoration)
    if (isRestoring && planetMeshRef.current) {
      const posAttr = activeGeometry.attributes.position;
      let maxDiff = 0;
      for (let i = 0; i < posAttr.count; i++) {
        const cx = posAttr.getX(i);
        const cy = posAttr.getY(i);
        const cz = posAttr.getZ(i);
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];
        const nx = cx + (ox - cx) * 0.14;
        const ny = cy + (oy - cy) * 0.14;
        const nz = cz + (oz - cz) * 0.14;
        posAttr.setXYZ(i, nx, ny, nz);
        maxDiff = Math.max(maxDiff, Math.abs(ox - cx) + Math.abs(oy - cy) + Math.abs(oz - cz));
      }
      posAttr.needsUpdate = true;
      activeGeometry.computeVertexNormals();
      if (maxDiff < 0.005) {
        onRestoringFinished();
      }
    }

    // 3. Planetary axial rotation
    if (!isPaused && planetMeshRef.current) {
      planetMeshRef.current.rotation.y += planet.rotationSpeed * timeScale;
    }
    if (!isPaused && cloudMeshRef.current) {
      cloudMeshRef.current.rotation.y += planet.rotationSpeed * 1.35 * timeScale;
    }
    if (!isPaused && coreMeshRef.current) {
      coreMeshRef.current.rotation.y += planet.rotationSpeed * 0.7 * timeScale;
    }

    // 4. Animate All In-Flight Projectiles (Missiles, Nukes, Meteors)
    setProjectiles((prev) => {
      const active: Projectile[] = [];
      prev.forEach((p) => {
        const newProgress = p.progress + dt * p.speed;
        if (newProgress >= 1.0) {
          triggerImpact(
            p.target,
            p.type === 'nuke_tsar'
              ? 'nuke_tsar'
              : p.type === 'cluster_warhead'
              ? 'nuke_cluster'
              : p.type === 'cruise_missile'
              ? 'cruise_missile'
              : 'meteor'
          );
        } else {
          p.progress = newProgress;
          p.current.lerpVectors(p.start, p.target, newProgress);

          if (p.type !== 'meteor' && Math.random() < 0.4) {
            spawnExplosionParticles(p.current, 1, '#94a3b8', 0.2);
          }
          active.push(p);
        }
      });
      return active;
    });

    // 5. Animate 3D Physical Debris Chunks (Ballistic gravity trajectories)
    setEjectaChunks((prev) => {
      return prev
        .map((chunk) => {
          chunk.pos.addScaledVector(chunk.vel, dt);
          const toCenter = chunk.pos.clone().normalize();
          // Planetary gravitational pull
          chunk.vel.addScaledVector(toCenter, -2.8 * dt);
          chunk.rot.x += chunk.rotVel.x * dt;
          chunk.rot.y += chunk.rotVel.y * dt;
          chunk.life -= dt / chunk.maxLife;
          return chunk;
        })
        .filter((chunk) => chunk.life > 0.02 && chunk.pos.length() > planet.radius * 0.82);
    });

    // 6. Animate 3D Mushroom Clouds
    setMushroomClouds((prev) => {
      return prev
        .map((mc) => ({
          ...mc,
          progress: mc.progress + dt / mc.maxLife,
        }))
        .filter((mc) => mc.progress < 1.0);
    });

    // 7. Animate Shockwaves
    setShockwaves((prev) => {
      return prev
        .map((s) => ({
          ...s,
          radius: s.radius + dt * 4.5,
          opacity: Math.max(0, s.opacity - dt * 1.2),
        }))
        .filter((s) => s.opacity > 0.02 && s.radius < s.maxRadius);
    });

    // 8. Animate Particles
    setParticles((prev) => {
      return prev
        .map((p) => {
          p.pos.addScaledVector(p.vel, dt);
          p.life -= dt / p.maxLife;
          return p;
        })
        .filter((p) => p.life > 0.05);
    });

    // 9. Animate Black Holes
    setBlackHoles((prev) => {
      return prev
        .map((bh) => {
          bh.life -= dt;
          return bh;
        })
        .filter((bh) => bh.life > 0);
    });
  });

  return (
    <group
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Molten Inner Core Sphere (Exposed through 3D physical crater depressions) */}
      <mesh ref={coreMeshRef}>
        <sphereGeometry args={[planet.radius * 0.88, 36, 36]} />
        <meshBasicMaterial color="#ff3300" wireframe />
      </mesh>

      {/* Main 3D Model / Celestial Body with Real Physical 3D Deformed Geometry */}
      <mesh ref={planetMeshRef} geometry={activeGeometry}>
        <meshStandardMaterial
          map={baseTexture || undefined}
          color="#ffffff"
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Dynamic Molten Damage Decal Layer (Using the exact same deformed 3D geometry) */}
      <mesh geometry={activeGeometry}>
        <meshStandardMaterial
          ref={damageMatRef}
          map={damageTexture}
          emissiveMap={damageTexture}
          emissive="#ff4500"
          emissiveIntensity={3.2}
          transparent
          opacity={0.96}
          roughness={0.8}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
          depthWrite={false}
        />
      </mesh>

      {/* Dynamic Cloud Deck (Earth) */}
      {planet.hasClouds && (
        <mesh ref={cloudMeshRef}>
          <sphereGeometry args={[planet.radius * 1.01, 64, 64]} />
          <meshStandardMaterial
            map={getCelestialTexture('/textures/earth_clouds.png') || undefined}
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Atmospheric Rim */}
      {planet.atmosphereColor && (
        <mesh>
          <sphereGeometry args={[planet.radius * 1.025, 48, 48]} />
          <meshBasicMaterial
            color={planet.atmosphereColor}
            transparent
            opacity={0.16}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 3D Physical Debris Chunks (Ejecta Fragments) */}
      {ejectaChunks.map((chunk) => (
        <mesh
          key={chunk.id}
          position={chunk.pos}
          rotation={chunk.rot}
          scale={chunk.scale * Math.min(1, chunk.life * 2)}
        >
          <dodecahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color={chunk.color}
            emissive={chunk.color === '#ff4500' ? '#ff3300' : '#110500'}
            emissiveIntensity={chunk.color === '#ff4500' ? 2.8 : 0.2}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* 3D Orbital Superlaser Beam */}
      {laserBeamActive && laserBeamPoints && (
        <group>
          {/* Inner core beam */}
          <line>
            <bufferGeometry
              attach="geometry"
              {...(() => {
                const geo = new THREE.BufferGeometry().setFromPoints(laserBeamPoints);
                return geo;
              })()}
            />
            <lineBasicMaterial color="#ffffff" linewidth={4} />
          </line>
          {/* Outer glowing plasma cylinder */}
          <mesh
            position={laserBeamPoints[0].clone().lerp(laserBeamPoints[1], 0.5)}
            quaternion={(() => {
              const q = new THREE.Quaternion();
              const v = laserBeamPoints[1].clone().sub(laserBeamPoints[0]);
              q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
              return q;
            })()}
          >
            <cylinderGeometry
              args={[0.1, 0.1, laserBeamPoints[0].distanceTo(laserBeamPoints[1]), 12]}
            />
            <meshBasicMaterial
              color="#ff4400"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* Active In-Flight Projectiles */}
      {projectiles.map((p) => {
        if (p.type === 'meteor') {
          return <MeteorView key={p.id} projectile={p} />;
        }
        return <MissileView key={p.id} projectile={p} />;
      })}

      {/* 3D Volumetric Mushroom Clouds */}
      {mushroomClouds.map((mc) => (
        <MushroomCloudView key={mc.id} cloud={mc} />
      ))}

      {/* Active Black Holes */}
      {blackHoles.map((bh, idx) => (
        <group key={idx} position={bh.pos}>
          {/* Event Horizon Shadow */}
          <mesh>
            <sphereGeometry args={[0.65, 32, 32]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Accretion Disk */}
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[0.8, 1.8, 36]} />
            <meshBasicMaterial
              color="#ffaa00"
              side={THREE.DoubleSide}
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <pointLight color="#ff5500" intensity={4} distance={6} />
        </group>
      ))}

      {/* Expanding 3D Shockwaves */}
      {shockwaves.map((s) => (
        <mesh
          key={s.id}
          position={s.pos}
          quaternion={(() => {
            const q = new THREE.Quaternion();
            q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), s.normal);
            return q;
          })()}
        >
          <ringGeometry args={[s.radius * 0.88, s.radius, 48]} />
          <meshBasicMaterial
            color={s.color}
            side={THREE.DoubleSide}
            transparent
            opacity={s.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 3D Explosion Ember Particles */}
      {particles.length > 0 && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(particles.flatMap((p) => [p.pos.x, p.pos.y, p.pos.z])),
                3,
              ]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[
                new Float32Array(particles.flatMap((p) => [p.color.r, p.color.g, p.color.b])),
                3,
              ]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.28}
            vertexColors
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}

export function PlanetDestructionSimulator() {
  const [selectedPlanetKey, setSelectedPlanetKey] = useState<string>('earth');
  const [activeWeapon, setActiveWeapon] = useState<WeaponType>('nuke_tsar');
  const [blastPower, setBlastPower] = useState<number>(1.2);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [mobileTelemetryOpen, setMobileTelemetryOpen] = useState<boolean>(false);
  const [mobileArsenalOpen, setMobileArsenalOpen] = useState<boolean>(false);

  // Screen-space detonation flash
  const [flash, setFlash] = useState<{ color: string; opacity: number } | null>(null);

  // Simulation Telemetry
  const [integrity, setIntegrity] = useState<number>(100);
  const [population, setPopulation] = useState<number>(PLANETS.earth.initialPopulation);
  const [temperature, setTemperature] = useState<number>(PLANETS.earth.initialTemp);
  const [cratersCount, setCratersCount] = useState<number>(0);
  const [megatonsYield, setMegatonsYield] = useState<number>(0);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  const planet = PLANETS[selectedPlanetKey] || PLANETS.earth;

  // Offscreen damage canvas
  const damageCanvas = useMemo(() => {
    if (typeof window === 'undefined') return null as unknown as HTMLCanvasElement;
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 512);
    }
    return c;
  }, []);

  // Flash trigger
  const triggerScreenFlash = useCallback((color: string, intensity: number) => {
    setFlash({ color, opacity: intensity });
    setTimeout(() => {
      setFlash(null);
    }, 450);
  }, []);

  // Reset planet to pristine condition (Genesis restoration)
  const handleGenesisReset = () => {
    cosmicAudio.playGenesisSound();
    if (damageCanvas) {
      const ctx = damageCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, damageCanvas.width, damageCanvas.height);
    }
    setIsRestoring(true);
    setIntegrity(100);
    setPopulation(planet.initialPopulation);
    setTemperature(planet.initialTemp);
    setCratersCount(0);
    setMegatonsYield(0);
    setResetTrigger((t) => t + 1);
  };

  // Switch planet
  const handleSelectPlanet = (key: string) => {
    setSelectedPlanetKey(key);
    const newPlanet = PLANETS[key];
    if (damageCanvas) {
      const ctx = damageCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, damageCanvas.width, damageCanvas.height);
    }
    setIsRestoring(false);
    setIntegrity(100);
    setPopulation(newPlanet.initialPopulation);
    setTemperature(newPlanet.initialTemp);
    setCratersCount(0);
    setMegatonsYield(0);
    setResetTrigger((t) => t + 1);
    cosmicAudio.playSelectChime();
  };

  const handleDamageApplied = useCallback(
    (amount: number, casualties: number, tempDelta: number) => {
      setIntegrity((prev) => Math.max(0, Math.round((prev - amount) * 10) / 10));
      setPopulation((prev) => Math.max(0, Math.round(prev - casualties)));
      setTemperature((prev) => Math.round(prev + tempDelta));
      setCratersCount((prev) => prev + 1);
      setMegatonsYield((prev) => Math.round(prev + amount * 420));
    },
    []
  );

  const toggleSound = () => {
    const nextMuted = !isSoundMuted;
    setIsSoundMuted(nextMuted);
    cosmicAudio.setMuted(nextMuted);
  };

  // Atmosphere description based on integrity
  const getAtmosphereStatus = () => {
    if (integrity > 85) return { text: 'STABLE BIOSPHERE', color: 'text-emerald-400' };
    if (integrity > 60) return { text: 'IONIZED SHOCK CLOUDS', color: 'text-yellow-400' };
    if (integrity > 30) return { text: 'GLOBAL NUCLEAR WINTER', color: 'text-orange-400' };
    if (integrity > 10) return { text: 'CRUSTAL MAGMA COLLAPSE', color: 'text-rose-500' };
    return { text: 'TOTAL EXTINCTION', color: 'text-red-600 animate-pulse' };
  };

  const status = getAtmosphereStatus();

  const getWeaponName = (w: WeaponType) => {
    switch (w) {
      case 'nuke_tsar': return 'Tsar Bomba';
      case 'nuke_cluster': return 'MIRV Cluster';
      case 'cruise_missile': return 'Cruise Missile';
      case 'meteor': return 'Giant Asteroid';
      case 'laser': return 'Orbital Laser';
      case 'core_bomb': return 'Core Bomb';
      case 'freeze': return 'Cryo Beam';
      case 'slicer': return 'Plasma Slicer';
      case 'blackhole': return 'Black Hole';
      default: return 'Weapon';
    }
  };

  const getWeaponIcon = (w: WeaponType) => {
    switch (w) {
      case 'nuke_tsar': return <Radio className="w-3.5 h-3.5 text-rose-400" />;
      case 'nuke_cluster': return <Bomb className="w-3.5 h-3.5 text-red-400" />;
      case 'cruise_missile': return <Rocket className="w-3.5 h-3.5 text-orange-400" />;
      case 'meteor': return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'laser': return <Zap className="w-3.5 h-3.5 text-red-400" />;
      case 'core_bomb': return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
      case 'freeze': return <Snowflake className="w-3.5 h-3.5 text-cyan-400" />;
      case 'slicer': return <Crosshair className="w-3.5 h-3.5 text-yellow-400" />;
      case 'blackhole': return <CircleDot className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Bomb className="w-3.5 h-3.5 text-red-400" />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020206] text-white select-none font-sans">
      {/* Blinding Screen Detonation Flash Overlay */}
      {flash && (
        <div
          className="pointer-events-none absolute inset-0 z-50 transition-opacity duration-500"
          style={{
            backgroundColor: flash.color,
            opacity: flash.opacity,
          }}
        />
      )}

      {/* 3D WebGL Destruction Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 6, 18], fov: 42, near: 0.5, far: 2000 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#020206']} />
          <ambientLight intensity={0.5} color="#ffffff" />
          <directionalLight position={[12, 10, 15]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-12, -8, -10]} intensity={0.4} color="#6366f1" />
          <Stars radius={200} depth={60} count={6000} factor={4} saturation={1} fade speed={1} />

          <OrbitControls
            enableDamping
            dampingFactor={0.06}
            rotateSpeed={0.8}
            zoomSpeed={1.1}
            minDistance={planet.radius * 1.3}
            maxDistance={planet.radius * 6}
          />

          {damageCanvas && (
            <DestructionScene
              planet={planet}
              activeWeapon={activeWeapon}
              blastPower={blastPower}
              isPaused={isPaused}
              timeScale={timeScale}
              damageCanvas={damageCanvas}
              onDamageApplied={handleDamageApplied}
              triggerScreenFlash={triggerScreenFlash}
              resetTrigger={resetTrigger}
              isRestoring={isRestoring}
              onRestoringFinished={() => setIsRestoring(false)}
            />
          )}
        </Canvas>
      </div>

      {/* Header Overlay */}
      <header className="absolute top-0 left-0 right-0 z-30 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-red-500/20 bg-slate-950/80 backdrop-blur-xl gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-md shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">COSMIC EXPLORER</span>
            <span className="sm:hidden text-[11px]">EXIT</span>
          </Link>

          <div className="h-5 w-px bg-white/10 hidden sm:block shrink-0" />

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-950/80 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)] shrink-0">
              <Bomb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-bold tracking-wider uppercase font-sans text-white flex items-center gap-1 sm:gap-2 truncate">
                <span className="hidden sm:inline">PLANETARY DESTRUCTION LAB</span>
                <span className="sm:hidden">DESTRUCTION LAB</span>
                <span className="hidden md:inline text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 shrink-0">
                  SOLAR SMASH 3D
                </span>
              </h1>
              <p className="text-[10px] font-mono text-slate-400 hidden xl:block truncate">
                Authentic 3D Earth Mesh • Physical Vertex Crater Sculpting & Ejecta Collisions
              </p>
            </div>
          </div>
        </div>

        {/* Planet Switcher Quick Tabs (Scrollable on small devices) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-xs font-mono overflow-x-auto no-scrollbar shrink-0 max-w-[44vw] sm:max-w-none">
          {Object.values(PLANETS).map((p) => {
            const isSelected = p.id === selectedPlanetKey;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPlanet(p.id)}
                className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all whitespace-nowrap text-[11px] sm:text-xs ${
                  isSelected
                    ? 'bg-red-500/25 text-red-200 border border-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.3)] font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Floating Action Triggers (Visible on < lg, Hidden on Desktop) */}
      <div className="absolute top-14 sm:top-16 left-3 right-3 z-20 flex items-center justify-between pointer-events-none lg:hidden">
        {/* Mobile Telemetry Trigger */}
        <button
          onClick={() => setMobileTelemetryOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 border border-red-500/35 backdrop-blur-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] text-xs font-mono active:scale-95 transition-all text-white"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span
            className={`font-bold ${
              integrity > 60
                ? 'text-emerald-400'
                : integrity > 25
                ? 'text-amber-400'
                : 'text-red-500 animate-pulse'
            }`}
          >
            {integrity.toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400 hidden xs:inline">STATUS</span>
        </button>

        {/* Mobile Arsenal Trigger */}
        <button
          onClick={() => setMobileArsenalOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 border border-red-500/35 backdrop-blur-xl shadow-[0_0_15px_rgba(239,68,68,0.2)] text-xs font-mono active:scale-95 transition-all text-white"
        >
          <span className="shrink-0">{getWeaponIcon(activeWeapon)}</span>
          <span className="font-bold text-white max-w-[85px] sm:max-w-[120px] truncate text-[11px] sm:text-xs">
            {getWeaponName(activeWeapon)}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-500/40">
            {blastPower}x
          </span>
        </button>
      </div>

      {/* Left Telemetry HUD (Desktop lg:flex only) */}
      <aside className="hidden lg:flex absolute left-4 top-20 z-20 pointer-events-none flex-col gap-3 font-mono text-xs w-72">
        {/* Planetary Integrity Gauge */}
        <div className="pointer-events-auto p-4 rounded-2xl bg-slate-950/85 border border-red-500/25 backdrop-blur-2xl shadow-[0_0_30px_rgba(239,68,68,0.15)] flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[11px]">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              PLANETARY INTEGRITY
            </span>
            <span
              className={`text-sm font-bold ${
                integrity > 60
                  ? 'text-emerald-400'
                  : integrity > 25
                  ? 'text-amber-400'
                  : 'text-red-500 animate-pulse'
              }`}
            >
              {integrity.toFixed(1)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                integrity > 60
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : integrity > 25
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                  : 'bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
              }`}
              style={{ width: `${integrity}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-400">STATUS:</span>
            <span className={`font-bold ${status.color}`}>{status.text}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Skull className="w-3 h-3 text-rose-400" /> POPULATION
              </span>
              <span className="font-bold text-slate-100 mt-0.5 truncate">
                {population > 1000000
                  ? `${(population / 1000000000).toFixed(2)}B`
                  : population.toLocaleString()}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-orange-400" /> SURFACE TEMP
              </span>
              <span className="font-bold text-orange-300 mt-0.5">
                {temperature > 0 ? `+${temperature}` : temperature}°C
              </span>
            </div>

            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <CircleDot className="w-3 h-3 text-yellow-400" /> CRATERS
              </span>
              <span className="font-bold text-slate-100 mt-0.5">{cratersCount}</span>
            </div>

            <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-purple-400" /> TOTAL YIELD
              </span>
              <span className="font-bold text-purple-300 mt-0.5 truncate">
                {megatonsYield.toLocaleString()} MT
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Guidance Box */}
        <div className="pointer-events-auto p-3.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl text-[11px] text-slate-400 leading-relaxed shadow-lg">
          <div className="text-cyan-400 font-bold mb-1 flex items-center gap-1.5 uppercase text-[10px]">
            <Crosshair className="w-3.5 h-3.5" />
            TARGETING MANUAL
          </div>
          <p>
            {activeWeapon === 'nuke_tsar' &&
              'Click anywhere to fire a strategic Tsar Bomba ICBM. Produces real 3D physical crust deformation, blinding flash, mushroom cloud, and molten caldera.'}
            {activeWeapon === 'nuke_cluster' &&
              'Click to deploy a MIRV cluster strike. Multiple warheads scatter and strike the 3D model, causing cascading physical crater gouges.'}
            {activeWeapon === 'cruise_missile' &&
              'Click to launch a precision supersonic cruise missile with high-velocity kinetic crust denting and scorched ejecta.'}
            {activeWeapon === 'meteor' &&
              'Click to summon a colossal asteroid. Cataclysmic supersonic kinetic impact blast creating massive 3D physical craters and orbital ejecta boulders.'}
            {activeWeapon === 'laser' &&
              'Click and drag on the sphere to continuously sculpt deep molten magma canyons directly into the 3D crust in real time.'}
            {activeWeapon === 'core_bomb' &&
              'Click to deploy an antimatter core penetrator that burrows into the core, shattering tectonic plates and exposing magma.'}
            {activeWeapon === 'freeze' &&
              'Click to fire a cryogenic beam that flash-freezes oceans and continents into glacial sheets.'}
            {activeWeapon === 'slicer' &&
              'Click to slice the planet with hyper-velocity orbital plasma cutters.'}
            {activeWeapon === 'blackhole' &&
              'Click to spawn a gravitational micro-singularity that swallows matter.'}
          </p>
        </div>
      </aside>

      {/* Right Arsenal Dock (Weapons Selector - Desktop lg:flex only) */}
      <aside className="hidden lg:flex absolute right-4 top-20 z-20 pointer-events-auto flex-col gap-2 font-mono">
        <div className="p-2.5 rounded-2xl bg-slate-950/85 border border-red-500/25 backdrop-blur-2xl shadow-[0_0_35px_rgba(239,68,68,0.2)] flex flex-col gap-1.5 w-64">
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-red-400 border-b border-white/10 flex items-center justify-between">
            <span>TACTICAL ARSENAL</span>
            <Bomb className="w-3.5 h-3.5 text-red-400" />
          </div>

          {/* 1. Tsar Bomba Nuclear ICBM */}
          <button
            onClick={() => setActiveWeapon('nuke_tsar')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'nuke_tsar'
                ? 'bg-rose-500/20 text-white border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="text-xs font-bold">Tsar Bomba ICBM</div>
              <div className="text-[9px] text-slate-400">Nuclear Flash & 3D Crater Dents</div>
            </div>
          </button>

          {/* 2. Cluster Nuclear Strike */}
          <button
            onClick={() => setActiveWeapon('nuke_cluster')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'nuke_cluster'
                ? 'bg-red-500/20 text-white border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0">
              <Bomb className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <div className="text-xs font-bold">MIRV Cluster Strike</div>
              <div className="text-[9px] text-slate-400">6 Multi-Warhead Impacts</div>
            </div>
          </button>

          {/* 3. Tactical Cruise Missile */}
          <button
            onClick={() => setActiveWeapon('cruise_missile')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'cruise_missile'
                ? 'bg-orange-500/20 text-white border border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-orange-950/80 border border-orange-500/40 flex items-center justify-center shrink-0">
              <Rocket className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-xs font-bold">Cruise Missile</div>
              <div className="text-[9px] text-slate-400">Hypersonic Precision Strike</div>
            </div>
          </button>

          {/* 4. Giant Meteor Impactor */}
          <button
            onClick={() => setActiveWeapon('meteor')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'meteor'
                ? 'bg-amber-500/20 text-white border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold">Giant Asteroid</div>
              <div className="text-[9px] text-slate-400">Cataclysmic 3D Rim Impact</div>
            </div>
          </button>

          {/* 5. Orbital Superlaser */}
          <button
            onClick={() => setActiveWeapon('laser')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'laser'
                ? 'bg-red-500/20 text-white border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <div className="text-xs font-bold">Orbital Superlaser</div>
              <div className="text-[9px] text-slate-400">Real-Time Canyon Sculpting</div>
            </div>
          </button>

          {/* 6. Core Drill Bomb */}
          <button
            onClick={() => setActiveWeapon('core_bomb')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'core_bomb'
                ? 'bg-red-600/30 text-white border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <div className="text-xs font-bold">Antimatter Core Detonator</div>
              <div className="text-[9px] text-slate-400">Global Crust Rupture</div>
            </div>
          </button>

          {/* 7. Cryo Freeze Ray */}
          <button
            onClick={() => setActiveWeapon('freeze')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'freeze'
                ? 'bg-cyan-500/20 text-white border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0">
              <Snowflake className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold">Glacial Cryo Beam</div>
              <div className="text-[9px] text-slate-400">Instant Ice Sheet Glaze</div>
            </div>
          </button>

          {/* 8. Planet Slicer */}
          <button
            onClick={() => setActiveWeapon('slicer')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'slicer'
                ? 'bg-yellow-500/20 text-white border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-950/80 border border-yellow-500/40 flex items-center justify-center shrink-0">
              <Crosshair className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-xs font-bold">Plasma Cutter Grid</div>
              <div className="text-[9px] text-slate-400">Tectonic Slicer Blades</div>
            </div>
          </button>

          {/* 9. Micro Singularity */}
          <button
            onClick={() => setActiveWeapon('blackhole')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'blackhole'
                ? 'bg-purple-500/20 text-white border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center shrink-0">
              <CircleDot className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-xs font-bold">Micro Black Hole</div>
              <div className="text-[9px] text-slate-400">Spacetime Rupture</div>
            </div>
          </button>
        </div>

        {/* Blast Power Intensity Slider */}
        <div className="p-3 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-xl flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>WARHEAD CALIBER</span>
            <span className="text-red-400 font-bold">{blastPower}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={blastPower}
            onChange={(e) => setBlastPower(parseFloat(e.target.value))}
            className="w-full accent-red-500 cursor-pointer"
          />
        </div>
      </aside>

      {/* Mobile Telemetry Drawer Modal */}
      <AnimatePresence>
        {mobileTelemetryOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in"
            onClick={() => setMobileTelemetryOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-slate-950/95 border border-red-500/40 p-4 shadow-2xl space-y-3 font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[11px]">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  PLANETARY INTEGRITY
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      integrity > 60
                        ? 'text-emerald-400'
                        : integrity > 25
                        ? 'text-amber-400'
                        : 'text-red-500 animate-pulse'
                    }`}
                  >
                    {integrity.toFixed(1)}%
                  </span>
                  <button
                    onClick={() => setMobileTelemetryOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    integrity > 60
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : integrity > 25
                      ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      : 'bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                  }`}
                  style={{ width: `${integrity}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">STATUS:</span>
                <span className={`font-bold ${status.color}`}>{status.text}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Skull className="w-3 h-3 text-rose-400" /> POPULATION
                  </span>
                  <span className="font-bold text-slate-100 mt-0.5 truncate">
                    {population > 1000000
                      ? `${(population / 1000000000).toFixed(2)}B`
                      : population.toLocaleString()}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-orange-400" /> SURFACE TEMP
                  </span>
                  <span className="font-bold text-orange-300 mt-0.5">
                    {temperature > 0 ? `+${temperature}` : temperature}°C
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <CircleDot className="w-3 h-3 text-yellow-400" /> CRATERS
                  </span>
                  <span className="font-bold text-slate-100 mt-0.5">{cratersCount}</span>
                </div>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-purple-400" /> TOTAL YIELD
                  </span>
                  <span className="font-bold text-purple-300 mt-0.5 truncate">
                    {megatonsYield.toLocaleString()} MT
                  </span>
                </div>
              </div>

              {/* Guidance summary */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300">
                <div className="text-cyan-400 font-bold mb-0.5 text-[10px] uppercase flex items-center gap-1">
                  <Crosshair className="w-3 h-3" /> ACTIVE: {getWeaponName(activeWeapon)}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Tap anywhere on the 3D planet to strike with real vertex mesh craters and ejecta physics.
                </p>
              </div>

              <button
                onClick={() => setMobileTelemetryOpen(false)}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-center text-xs"
              >
                CLOSE TELEMETRY
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Arsenal Drawer Modal */}
      <AnimatePresence>
        {mobileArsenalOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden flex items-end sm:items-center justify-center p-2 sm:p-4 animate-in fade-in"
            onClick={() => setMobileArsenalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[85vh] rounded-2xl bg-slate-950/95 border border-red-500/40 p-3.5 sm:p-4 shadow-2xl flex flex-col font-mono text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <span className="flex items-center gap-1.5 text-red-400 font-bold uppercase tracking-wider text-[11px]">
                  <Bomb className="w-4 h-4 text-red-400" />
                  TACTICAL ARSENAL (9 WEAPONS)
                </span>
                <button
                  onClick={() => setMobileArsenalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Weapons List */}
              <div className="overflow-y-auto max-h-[46vh] pr-1 space-y-1.5 custom-scrollbar">
                {[
                  { id: 'nuke_tsar', name: 'Tsar Bomba ICBM', desc: 'Nuclear Flash & 3D Crater Dents', icon: <Radio className="w-4 h-4 text-rose-400" />, activeClass: 'bg-rose-500/20 border-rose-500/50' },
                  { id: 'nuke_cluster', name: 'MIRV Cluster Strike', desc: '6 Multi-Warhead Impacts', icon: <Bomb className="w-4 h-4 text-red-400" />, activeClass: 'bg-red-500/20 border-red-500/50' },
                  { id: 'cruise_missile', name: 'Cruise Missile', desc: 'Hypersonic Precision Strike', icon: <Rocket className="w-4 h-4 text-orange-400" />, activeClass: 'bg-orange-500/20 border-orange-500/50' },
                  { id: 'meteor', name: 'Giant Asteroid', desc: 'Cataclysmic 3D Rim Impact', icon: <Flame className="w-4 h-4 text-amber-400" />, activeClass: 'bg-amber-500/20 border-amber-500/50' },
                  { id: 'laser', name: 'Orbital Superlaser', desc: 'Real-Time Canyon Sculpting', icon: <Zap className="w-4 h-4 text-red-400" />, activeClass: 'bg-red-500/20 border-red-500/50' },
                  { id: 'core_bomb', name: 'Antimatter Core Detonator', desc: 'Global Crust Rupture', icon: <AlertTriangle className="w-4 h-4 text-red-500" />, activeClass: 'bg-red-600/30 border-red-500' },
                  { id: 'freeze', name: 'Glacial Cryo Beam', desc: 'Instant Ice Sheet Glaze', icon: <Snowflake className="w-4 h-4 text-cyan-400" />, activeClass: 'bg-cyan-500/20 border-cyan-500/50' },
                  { id: 'slicer', name: 'Plasma Cutter Grid', desc: 'Tectonic Slicer Blades', icon: <Crosshair className="w-4 h-4 text-yellow-400" />, activeClass: 'bg-yellow-500/20 border-yellow-500/50' },
                  { id: 'blackhole', name: 'Micro Black Hole', desc: 'Spacetime Rupture', icon: <CircleDot className="w-4 h-4 text-purple-400" />, activeClass: 'bg-purple-500/20 border-purple-500/50' },
                ].map((w) => {
                  const isSelected = activeWeapon === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        setActiveWeapon(w.id as WeaponType);
                        setMobileArsenalOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? `${w.activeClass} text-white border shadow-md font-bold`
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                        {w.icon}
                      </div>
                      <div className="flex-1 truncate">
                        <div className="text-xs">{w.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{w.desc}</div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-red-400 uppercase shrink-0">READY</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Blast Power Intensity Slider */}
              <div className="mt-2 p-2.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col gap-1 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>WARHEAD CALIBER</span>
                  <span className="text-red-400 font-bold">{blastPower}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={blastPower}
                  onChange={(e) => setBlastPower(parseFloat(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <button
                onClick={() => setMobileArsenalOpen(false)}
                className="mt-2 w-full py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white font-bold text-center text-xs shadow-lg"
              >
                ENGAGE TARGET (FIRE)
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Control Bar */}
      <footer className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-950/90 border border-white/10 backdrop-blur-2xl shadow-2xl font-mono text-xs max-w-[96vw] overflow-x-auto no-scrollbar">
        {/* Genesis Restore Planet Button */}
        <button
          onClick={handleGenesisReset}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600/80 to-teal-500/80 hover:from-emerald-500 hover:to-teal-400 text-white font-bold border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          title="Restore celestial body to pristine condition (Morph back into smooth sphere)"
        >
          <RotateCcw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRestoring ? 'animate-spin text-emerald-300' : ''}`} />
          <span className="hidden sm:inline">GENESIS RESTORE</span>
          <span className="sm:hidden text-xs">RESTORE</span>
        </button>

        <div className="h-5 sm:h-6 w-px bg-white/10 shrink-0" />

        {/* Pause/Spin Toggle */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title={isPaused ? 'Resume planetary rotation' : 'Freeze rotation for precision aim'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        {/* Slow Motion Matrix Mode Toggle */}
        <button
          onClick={() => setTimeScale(timeScale === 1.0 ? 0.25 : 1.0)}
          className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
            timeScale < 1.0
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title="Toggle Slow-Motion Impact Physics"
        >
          {timeScale < 1.0 ? '0.25x' : '1.0x'} <span className="hidden sm:inline">{timeScale < 1.0 ? 'SLOW-MO' : 'NORMAL'}</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
            isSoundMuted
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title={isSoundMuted ? 'Unmute Destruction SFX' : 'Mute Destruction SFX'}
        >
          {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
      </footer>
    </div>
  );
}
