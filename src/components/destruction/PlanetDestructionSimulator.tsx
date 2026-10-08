'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
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
  Sparkles,
  Thermometer,
  Skull,
  Globe,
  CircleDot,
  Gauge,
  Activity,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { cosmicAudio } from '@/utils/audioSynth';
import { getCelestialTexture } from '@/utils/textureCache';

export type WeaponType =
  | 'laser'
  | 'meteor'
  | 'missile'
  | 'blackhole'
  | 'freeze'
  | 'slicer'
  | 'core_bomb';

interface PlanetConfig {
  id: string;
  name: string;
  texture: string;
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
    texture: '/textures/earth_day.jpg',
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

interface MeteorProjectile {
  id: string;
  start: THREE.Vector3;
  target: THREE.Vector3;
  current: THREE.Vector3;
  progress: number;
  speed: number;
}

interface MissileProjectile {
  id: string;
  start: THREE.Vector3;
  target: THREE.Vector3;
  current: THREE.Vector3;
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

interface ActiveBlackHole {
  pos: THREE.Vector3;
  life: number;
}

interface DestructionSceneProps {
  planet: PlanetConfig;
  activeWeapon: WeaponType;
  blastPower: number;
  isPaused: boolean;
  timeScale: number;
  damageCanvas: HTMLCanvasElement;
  onDamageApplied: (amount: number, casualties: number, tempDelta: number) => void;
  resetTrigger: number;
}

function DestructionScene({
  planet,
  activeWeapon,
  blastPower,
  isPaused,
  timeScale,
  damageCanvas,
  onDamageApplied,
  resetTrigger,
}: DestructionSceneProps) {
  const { camera } = useThree();
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const cloudMeshRef = useRef<THREE.Mesh>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const damageMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Synchronous NASA texture
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

  // Real-time dynamic visual effects state
  const isFiringLaserRef = useRef(false);
  const laserEndPosRef = useRef<THREE.Vector3 | null>(null);
  const [laserBeamActive, setLaserBeamActive] = useState(false);
  const [laserBeamPoints, setLaserBeamPoints] = useState<[THREE.Vector3, THREE.Vector3] | null>(null);

  const [particles, setParticles] = useState<ImpactParticle[]>([]);
  const [meteors, setMeteors] = useState<MeteorProjectile[]>([]);
  const [missiles, setMissiles] = useState<MissileProjectile[]>([]);
  const [shockwaves, setShockwaves] = useState<ShockwaveRing[]>([]);
  const [blackHoles, setBlackHoles] = useState<ActiveBlackHole[]>([]);

  // Reset visual effects on resetTrigger
  useEffect(() => {
    setParticles([]);
    setMeteors([]);
    setMissiles([]);
    setShockwaves([]);
    setBlackHoles([]);
    setLaserBeamActive(false);
    setLaserBeamPoints(null);
    damageTexture.needsUpdate = true;
    if (damageMatRef.current) damageMatRef.current.needsUpdate = true;
  }, [resetTrigger, damageTexture]);

  // Convert 3D spherical hit point to UV coordinates
  const hitPointToUV = useCallback((hitPoint: THREE.Vector3, radius: number) => {
    const norm = hitPoint.clone().normalize();
    const u = 0.5 + Math.atan2(norm.z, norm.x) / (2 * Math.PI);
    const v = 0.5 - Math.asin(norm.y) / Math.PI;
    return { u, v };
  }, []);

  // Stamp damage directly onto the dynamic offscreen canvas
  const applyDamageToCanvas = useCallback(
    (u: number, v: number, type: WeaponType, power: number) => {
      const ctx = damageCanvas.getContext('2d');
      if (!ctx) return;

      const w = damageCanvas.width;
      const h = damageCanvas.height;
      const x = u * w;
      const y = v * h;

      const baseRadius = 14 * power;

      if (type === 'freeze') {
        // Cryogenic ice sheet glaze
        const grad = ctx.createRadialGradient(x, y, 0, x, y, baseRadius * 1.8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.35, 'rgba(178, 235, 242, 0.9)');
        grad.addColorStop(0.7, 'rgba(0, 188, 212, 0.7)');
        grad.addColorStop(1, 'rgba(0, 151, 167, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, baseRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'laser') {
        // Searing continuous molten magma trench
        const grad = ctx.createRadialGradient(x, y, 0, x, y, baseRadius);
        grad.addColorStop(0, '#ffffff'); // White-hot core
        grad.addColorStop(0.25, '#ffaa00'); // Radiant yellow
        grad.addColorStop(0.55, '#ff3300'); // Molten magma
        grad.addColorStop(0.85, '#660000'); // Deep glowing crust
        grad.addColorStop(1, 'rgba(20, 5, 2, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, baseRadius, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'slicer') {
        // Plasma blade fissure
        ctx.strokeStyle = '#ff7700';
        ctx.lineWidth = 10 * power;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(x - 50 * power, y - 25 * power);
        ctx.lineTo(x + 50 * power, y + 25 * power);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Explosive impact crater (Meteor, Missile, Bomb)
        const craterRadius = baseRadius * (type === 'meteor' ? 2.2 : type === 'core_bomb' ? 3.0 : 1.5);
        const grad = ctx.createRadialGradient(x, y, 0, x, y, craterRadius);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.2, '#ff6600');
        grad.addColorStop(0.45, '#cc1100');
        grad.addColorStop(0.75, '#2b0700'); // Charred basalt rim
        grad.addColorStop(1, 'rgba(10, 2, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, craterRadius, 0, Math.PI * 2);
        ctx.fill();

        // High-velocity splatter droplets around crater rim
        for (let i = 0; i < 8; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = craterRadius * (0.8 + Math.random() * 0.7);
          const dropX = x + Math.cos(angle) * dist;
          const dropY = y + Math.sin(angle) * dist;
          const dropR = (Math.random() * 4 + 2) * power;

          ctx.fillStyle = Math.random() < 0.5 ? '#ff4500' : '#1a0500';
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
              (Math.random() - 0.5) * 1.2,
              (Math.random() - 0.5) * 1.2,
              (Math.random() - 0.5) * 1.2
            )
          )
          .normalize();

        const speed = (Math.random() * 4 + 2) * speedScale;
        newParticles.push({
          pos: origin.clone(),
          vel: dir.multiplyScalar(speed),
          color: baseColor.clone(),
          size: Math.random() * 0.16 + 0.08,
          life: 1.0,
          maxLife: Math.random() * 0.4 + 0.4,
        });
      }

      setParticles((prev) => [...prev.slice(-180), ...newParticles]);
    },
    []
  );

  // Spawn 3D shockwave ring
  const spawnShockwave = useCallback((origin: THREE.Vector3, maxR: number, colorHex: string) => {
    const normal = origin.clone().normalize();
    setShockwaves((prev) => [
      ...prev.slice(-12),
      {
        id: Math.random().toString(),
        pos: origin.clone().add(normal.clone().multiplyScalar(0.05)),
        normal,
        radius: 0.1,
        maxRadius: maxR,
        opacity: 0.95,
        color: colorHex,
      },
    ]);
  }, []);

  // Handle immediate weapon impact
  const triggerImpact = useCallback(
    (hitPoint: THREE.Vector3, type: WeaponType) => {
      const { u, v } = hitPointToUV(hitPoint, planet.radius);
      applyDamageToCanvas(u, v, type, blastPower);

      if (type === 'laser') {
        cosmicAudio.playLaserSound();
        spawnExplosionParticles(hitPoint, 15, '#ff9900', 0.8 * blastPower);
        onDamageApplied(0.7 * blastPower, 18000000 * blastPower, 12 * blastPower);
      } else if (type === 'meteor') {
        cosmicAudio.playExplosionSound(1.6 * blastPower);
        spawnExplosionParticles(hitPoint, 45, '#ff4400', 1.8 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 0.9 * blastPower, '#ffaa00');
        onDamageApplied(4.5 * blastPower, 85000000 * blastPower, 55 * blastPower);
      } else if (type === 'missile') {
        cosmicAudio.playExplosionSound(1.2 * blastPower);
        spawnExplosionParticles(hitPoint, 30, '#ff1100', 1.4 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 0.6 * blastPower, '#ff5500');
        onDamageApplied(2.8 * blastPower, 45000000 * blastPower, 30 * blastPower);
      } else if (type === 'freeze') {
        cosmicAudio.playFreezeSound();
        spawnExplosionParticles(hitPoint, 20, '#00ffff', 0.9 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 0.7 * blastPower, '#00ffff');
        onDamageApplied(1.5 * blastPower, 12000000 * blastPower, -25 * blastPower);
      } else if (type === 'slicer') {
        cosmicAudio.playLaserSound();
        spawnExplosionParticles(hitPoint, 35, '#ffbb00', 1.5 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 1.1 * blastPower, '#ffff00');
        onDamageApplied(6.0 * blastPower, 120000000 * blastPower, 80 * blastPower);
      } else if (type === 'core_bomb') {
        cosmicAudio.playExplosionSound(2.2 * blastPower);
        spawnExplosionParticles(hitPoint, 60, '#ffffff', 2.5 * blastPower);
        spawnShockwave(hitPoint, planet.radius * 1.5 * blastPower, '#ffffff');
        onDamageApplied(12.0 * blastPower, 450000000 * blastPower, 220 * blastPower);
      }
    },
    [hitPointToUV, planet.radius, applyDamageToCanvas, blastPower, spawnExplosionParticles, spawnShockwave, onDamageApplied]
  );

  // Pointer interaction: Launch projectiles or continuous laser fire
  const handlePointerDown = (e: { point: THREE.Vector3; stopPropagation: () => void }) => {
    e.stopPropagation();
    const hit = e.point;

    if (activeWeapon === 'laser') {
      isFiringLaserRef.current = true;
      laserEndPosRef.current = hit;
      setLaserBeamActive(true);
      const orbitOrigin = hit.clone().normalize().multiplyScalar(planet.radius * 2.8);
      setLaserBeamPoints([orbitOrigin, hit]);
      triggerImpact(hit, 'laser');
    } else if (activeWeapon === 'meteor') {
      cosmicAudio.playMissileSound();
      const start = hit.clone().normalize().multiplyScalar(planet.radius * 3.5);
      start.x += (Math.random() - 0.5) * 5;
      start.y += (Math.random() - 0.5) * 5;

      setMeteors((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          start,
          target: hit,
          current: start.clone(),
          progress: 0,
          speed: 1.8 * timeScale,
        },
      ]);
    } else if (activeWeapon === 'missile') {
      cosmicAudio.playMissileSound();
      const start = camera.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, -1, 0));
      setMissiles((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          start,
          target: hit,
          current: start.clone(),
          progress: 0,
          speed: 2.2 * timeScale,
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
      laserEndPosRef.current = hit;
      const orbitOrigin = hit.clone().normalize().multiplyScalar(planet.radius * 2.8);
      setLaserBeamPoints([orbitOrigin, hit]);
      triggerImpact(hit, 'laser');
    }
  };

  const handlePointerUp = () => {
    isFiringLaserRef.current = false;
    setLaserBeamActive(false);
    setLaserBeamPoints(null);
  };

  // Main animation frame loop for simulation
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1) * timeScale;

    // 1. Planetary axial spin
    if (!isPaused && planetMeshRef.current) {
      planetMeshRef.current.rotation.y += planet.rotationSpeed * timeScale;
    }
    if (!isPaused && cloudMeshRef.current) {
      cloudMeshRef.current.rotation.y += planet.rotationSpeed * 1.35 * timeScale;
    }
    if (!isPaused && coreMeshRef.current) {
      coreMeshRef.current.rotation.y += planet.rotationSpeed * 0.7 * timeScale;
    }

    // 2. Animate Meteors
    setMeteors((prev) => {
      const active: MeteorProjectile[] = [];
      prev.forEach((m) => {
        const newProgress = m.progress + dt * m.speed;
        if (newProgress >= 1.0) {
          triggerImpact(m.target, 'meteor');
        } else {
          m.progress = newProgress;
          m.current.lerpVectors(m.start, m.target, newProgress);
          active.push(m);
        }
      });
      return active;
    });

    // 3. Animate Missiles
    setMissiles((prev) => {
      const active: MissileProjectile[] = [];
      prev.forEach((m) => {
        const newProgress = m.progress + dt * m.speed;
        if (newProgress >= 1.0) {
          triggerImpact(m.target, 'missile');
        } else {
          m.progress = newProgress;
          m.current.lerpVectors(m.start, m.target, newProgress);
          active.push(m);
        }
      });
      return active;
    });

    // 4. Animate Shockwaves
    setShockwaves((prev) => {
      return prev
        .map((s) => ({
          ...s,
          radius: s.radius + dt * 4.0,
          opacity: Math.max(0, s.opacity - dt * 1.2),
        }))
        .filter((s) => s.opacity > 0.02 && s.radius < s.maxRadius);
    });

    // 5. Animate Particles
    setParticles((prev) => {
      return prev
        .map((p) => {
          p.pos.addScaledVector(p.vel, dt);
          p.life -= dt / p.maxLife;
          return p;
        })
        .filter((p) => p.life > 0.05);
    });

    // 6. Animate Black Holes
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
      {/* Molten Inner Core Sphere (Visible through fractures and craters) */}
      <mesh ref={coreMeshRef}>
        <sphereGeometry args={[planet.radius * 0.88, 36, 36]} />
        <meshBasicMaterial color="#ff3300" wireframe />
      </mesh>

      {/* Main Celestial Body Sphere */}
      <mesh ref={planetMeshRef}>
        <sphereGeometry args={[planet.radius, 64, 64]} />
        <meshStandardMaterial
          map={baseTexture || undefined}
          color="#ffffff"
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Dynamic Molten Damage Decal Layer (Layered at radius * 1.003 with glowing emissive) */}
      <mesh>
        <sphereGeometry args={[planet.radius * 1.003, 64, 64]} />
        <meshStandardMaterial
          ref={damageMatRef}
          map={damageTexture}
          emissiveMap={damageTexture}
          emissive="#ff4500"
          emissiveIntensity={2.8}
          transparent
          opacity={0.96}
          roughness={0.8}
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
              args={[0.08, 0.08, laserBeamPoints[0].distanceTo(laserBeamPoints[1]), 12]}
            />
            <meshBasicMaterial
              color="#ff6600"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* Incoming Meteors in Flight */}
      {meteors.map((m) => (
        <group key={m.id} position={m.current}>
          <mesh>
            <sphereGeometry args={[0.35, 12, 12]} />
            <meshStandardMaterial color="#8b0000" roughness={0.9} />
          </mesh>
          <pointLight color="#ff6600" intensity={3} distance={4} />
        </group>
      ))}

      {/* Incoming Missiles in Flight */}
      {missiles.map((m) => (
        <group key={m.id} position={m.current}>
          <mesh>
            <coneGeometry args={[0.12, 0.5, 8]} />
            <meshBasicMaterial color="#e0e0e0" />
          </mesh>
          <pointLight color="#ff3300" intensity={2} distance={3} />
        </group>
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
            size={0.25}
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
  const [activeWeapon, setActiveWeapon] = useState<WeaponType>('laser');
  const [blastPower, setBlastPower] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeScale, setTimeScale] = useState<number>(1.0);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

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

  // Reset planet to pristine condition (Genesis restoration)
  const handleGenesisReset = () => {
    cosmicAudio.playGenesisSound();
    if (damageCanvas) {
      const ctx = damageCanvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, damageCanvas.width, damageCanvas.height);
    }
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
      setMegatonsYield((prev) => Math.round(prev + amount * 350));
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
    if (integrity > 85) return { text: 'STABLE ATMOSPHERE', color: 'text-emerald-400' };
    if (integrity > 60) return { text: 'IONIZED PLASMA CLOUDS', color: 'text-yellow-400' };
    if (integrity > 30) return { text: 'SEVERE THERMAL SHOCK', color: 'text-orange-400' };
    if (integrity > 10) return { text: 'GLOBAL CRUST COLLAPSE', color: 'text-rose-500' };
    return { text: 'PLANETARY EXTINCTION', color: 'text-red-600 animate-pulse' };
  };

  const status = getAtmosphereStatus();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020206] text-white select-none font-sans">
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
              resetTrigger={resetTrigger}
            />
          )}
        </Canvas>
      </div>

      {/* Header Overlay */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between border-b border-red-500/20 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all shadow-md"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-400" />
            <span>COSMIC EXPLORER</span>
          </Link>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <Flame className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-wider uppercase font-sans text-white flex items-center gap-2">
                PLANETARY DESTRUCTION LAB
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                  SOLAR SMASH
                </span>
              </h1>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                Tactical Planetary Disruption & Impact Physics Simulation
              </p>
            </div>
          </div>
        </div>

        {/* Planet Switcher Quick Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-xs font-mono">
          {Object.values(PLANETS).map((p) => {
            const isSelected = p.id === selectedPlanetKey;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPlanet(p.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
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

      {/* Left Telemetry HUD */}
      <aside className="absolute left-4 top-20 z-20 pointer-events-none flex flex-col gap-3 font-mono text-xs w-72">
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
            TARGETING SYSTEM
          </div>
          <p>
            {activeWeapon === 'laser' &&
              'Click and drag on the sphere to fire a searing orbital laser beam that burns molten magma canyons into the crust.'}
            {activeWeapon === 'meteor' &&
              'Click anywhere to summon massive hypersonic meteorites that blast crater shockwaves.'}
            {activeWeapon === 'missile' &&
              'Click to launch nuclear ICBM strikes that detonate in radioactive mushroom fireballs.'}
            {activeWeapon === 'blackhole' &&
              'Click to spawn a gravitational micro-singularity that swallows matter and warps space.'}
            {activeWeapon === 'freeze' &&
              'Click to fire a cryogenic beam that flash-freezes oceans and continents into glacial ice sheets.'}
            {activeWeapon === 'slicer' &&
              'Click to slice the planet with hyper-velocity orbital plasma cutters.'}
            {activeWeapon === 'core_bomb' &&
              'Click to burrow into the planet core and detonate an apocalyptic crust-shattering bomb.'}
          </p>
        </div>
      </aside>

      {/* Right Arsenal Dock (Weapons Selector) */}
      <aside className="absolute right-4 top-20 z-20 pointer-events-auto flex flex-col gap-2 font-mono">
        <div className="p-2.5 rounded-2xl bg-slate-950/85 border border-red-500/25 backdrop-blur-2xl shadow-[0_0_35px_rgba(239,68,68,0.2)] flex flex-col gap-1.5 w-60">
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-red-400 border-b border-white/10 flex items-center justify-between">
            <span>DESTRUCTION ARSENAL</span>
            <Flame className="w-3.5 h-3.5 text-red-400" />
          </div>

          {/* 1. Orbital Superlaser */}
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
              <div className="text-[9px] text-slate-400">Continuous Magma Beam</div>
            </div>
          </button>

          {/* 2. Meteor Strike */}
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
              <div className="text-xs font-bold">Asteroid Swarm</div>
              <div className="text-[9px] text-slate-400">Hypersonic Crater Impact</div>
            </div>
          </button>

          {/* 3. Nuclear ICBM */}
          <button
            onClick={() => setActiveWeapon('missile')}
            className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
              activeWeapon === 'missile'
                ? 'bg-rose-500/20 text-white border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/40 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="text-xs font-bold">Thermonuclear ICBM</div>
              <div className="text-[9px] text-slate-400">Multi-Warhead Detonations</div>
            </div>
          </button>

          {/* 4. Micro Singularity */}
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
              <div className="text-[9px] text-slate-400">Gravitational Devastation</div>
            </div>
          </button>

          {/* 5. Cryo Freeze Ray */}
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
              <div className="text-xs font-bold">Cryo Freeze Blaster</div>
              <div className="text-[9px] text-slate-400">Glacial Flash Freeze</div>
            </div>
          </button>

          {/* 6. Planet Slicer */}
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
              <div className="text-xs font-bold">Orbital Slicer</div>
              <div className="text-[9px] text-slate-400">Plasma Cutter Grid</div>
            </div>
          </button>

          {/* 7. Core Drill Bomb */}
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
              <div className="text-xs font-bold">Core Detonator</div>
              <div className="text-[9px] text-slate-400">Apocalyptic Core Rupture</div>
            </div>
          </button>
        </div>

        {/* Blast Power Intensity Slider */}
        <div className="p-3 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-xl flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span>BLAST CALIBER</span>
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

      {/* Bottom Control Bar */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 p-2 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-2xl shadow-2xl font-mono text-xs">
        {/* Genesis Restore Planet Button */}
        <button
          onClick={handleGenesisReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600/80 to-teal-500/80 hover:from-emerald-500 hover:to-teal-400 text-white font-bold border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Restore celestial body to pristine 100% condition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESTORE PLANET</span>
        </button>

        <div className="h-6 w-px bg-white/10" />

        {/* Pause/Spin Toggle */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`p-2.5 rounded-xl border transition-all ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title={isPaused ? 'Resume planetary rotation' : 'Freeze rotation for precision aim'}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Slow Motion Matrix Mode Toggle */}
        <button
          onClick={() => setTimeScale(timeScale === 1.0 ? 0.25 : 1.0)}
          className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
            timeScale < 1.0
              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title="Toggle Slow-Motion Impact Physics"
        >
          {timeScale < 1.0 ? '0.25x SLOW-MO' : '1.0x NORMAL'}
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2.5 rounded-xl border transition-all ${
            isSoundMuted
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
          }`}
          title={isSoundMuted ? 'Unmute Destruction SFX' : 'Mute Destruction SFX'}
        >
          {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </footer>
    </div>
  );
}
