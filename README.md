# 🌌 TheSpace — Interactive 4D WebGL Cosmic Explorer

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React Three Fiber](https://img.shields.io/badge/Three.js-R3F%20v9-blue?style=for-the-badge&logo=three.js)](https://docs.pmnd.rs/react-three-fiber)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-Cinematic%20Camera-88ce02?style=for-the-badge)](https://greensock.com/gsap/)
[![NASA Open API](https://img.shields.io/badge/NASA-Scientific%20Data-red?style=for-the-badge&logo=nasa)](https://api.nasa.gov/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"Somewhere, something incredible is waiting to be known."** — Carl Sagan

**TheSpace** is an interactive, browser-native 3D spatial exploration engine engineered to rival the spatial fidelity and aesthetic precision of **NASA Eyes on the Solar System**, **SpaceEngine**, and Charles & Ray Eames’ iconic *Powers of Ten*. 

Traverse across **42 orders of magnitude**—from subatomic quantum foam manifolds ($10^{-35}\text{ m}$) through our terrestrial neighborhood and Google Maps-style surface landmark exploration, out past real NASA-discovered galaxies (Sombrero, Whirlpool, Cartwheel, Triangulum), to the colossal filamentary spiderweb of the **Laniakea Supercluster** and parallel multiverse bubbles ($>10^{26}\text{ m}$).

---

## 🚀 Key Highlights & Architectural Features

### 1. 🪐 Photorealistic Planetary Surfaces & Real NASA Imagery
- **Authentic Equirectangular 2K Planetary Maps**: Native scientific mosaics mapped with sRGB color fidelity across every planet and major moon (SDO Sun, MESSENGER Mercury, Magellan Venus, Blue Marble Earth, LRO Moon, MGS Mars, Cassini-Huygens Jupiter & Saturn, Voyager Uranus & Neptune).
- **Multi-Layer Dynamic Atmospheric Engines**: Semi-transparent rotating cloud decks (Earth cloud layer spinning at independent angular velocity), atmospheric Rayleigh scattering limb rims, and custom GLSL Fresnel shaders.
- **Accurate Ring Dynamics & Radial UV Geometry**: Saturn's rings feature custom-computed concentric polar UV coordinates mapping the Cassini Division, Encke Gap, and A/B/C rings seamlessly across 360 degrees.

### 2. 📍 Planetary Surface Mode (Google Maps in Deep Space)
- Zoom seamlessly from interplanetary orbit straight down to planetary crusts.
- Explore iconic geological and historic landmarks with real-time Cartesian projection:
  - **Mars**: *Olympus Mons* (21.9 km shield volcano), *Valles Marineris* (4,000 km grand canyon), *Jezero Crater* (Perseverance landing site).
  - **Earth**: *Mount Everest* (8,848 m), *Mariana Trench / Challenger Deep* (-10,994 m), *Grand Canyon*.
  - **Moon**: *Apollo 11 Tranquility Base*, *Tycho Crater* (85 km impact basin with 1,500 km rays).
- Real-time surface telemetry: Cursor latitude/longitude calculation, elevation readouts, and morphological dossiers.

### 3. 🌀 Infinite Zoom & Multi-Scale Cosmic Hierarchy
Experience seamless travel between 5 distinct cosmic scales without scene reloading:
1. **Quantum Realm ($10^{-35}\text{ m}$)**: Calabi-Yau 6D compactified manifolds and spacetime quantum foam.
2. **Planetary Scale ($10^7\text{ m}$)**: Terrestrial worlds, gas giants, and surface landmarks.
3. **Stellar Scale ($10^9\text{ m}$)**: Sol yellow dwarf with dynamic plasma flare corona.
4. **Galactic Scale ($10^{21}\text{ m}$)**: Real discovered galaxies including the Milky Way, Andromeda (M31), Sombrero (M104), Whirlpool (M51), Cartwheel (ring collision galaxy), Triangulum (M33), and relativistic supermassive black holes (**M87\*** and **Gargantua** with Doppler beaming accretion disks).
5. **Cosmic / Multiverse Scale ($>10^{26}\text{ m}$)**: Laniakea Supercluster, Cosmic Microwave Background (Planck Survey), and chaotic eternal inflation pocket universes.

### 4. ⏱️ 4D Temporal Mechanics & Keplerian Orbits
- Live orbital simulation computing Keplerian revolution around parent stars and barycenters.
- Interactive time dilation slider: Warp forward from **1x real-time up to 10,000x**, pause time, or reverse orbital vectors.
- Live camera tracking that automatically locks onto moving bodies in real-time orbit.

### 5. 📡 Live NASA Telemetry Integration
- **NASA APOD**: Automated ingestion of daily NASA Astronomy Picture of the Day with full scientific descriptions.
- **NASA Exoplanet Archive**: Live tabular telemetry querying confirmed habitable-zone exoplanets via IPAC/Caltech TAP APIs.
- **Near-Earth Object (NEO) Radar**: Real-time trajectory and hazard tracking for close-approach asteroids.

### 6. 🎧 Generative Spatial Audio Engine
- Browser-native Web Audio API synthesizer generating dynamic harmonic drone frequencies tuned to celestial orbital velocities.
- High-frequency UI spatial chimes and sub-bass warp sweep transitions on camera travel.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & [React 19](https://react.dev/) |
| **Graphics & WebGL** | [Three.js](https://threejs.org/) (r186), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei) |
| **Animation & Easing**| [GSAP](https://greensock.com/gsap/) (Cinematic multi-stage camera timelines), [Framer Motion](https://www.framer.com/motion/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) with reactive subscribers |
| **Audio Synthesis** | Native Web Audio API procedural oscillator matrix |
| **Data Sources** | NASA JPL, NASA SDO, NASA Visible Earth, ESA Planck Observatory, IPAC Exoplanet Archive |

---

## 🔬 Key Engineering Problems Solved

### 1. Three.js WebGL Shader Recompilation
- **The Issue**: Loading textures asynchronously via React state causes Three.js to compile initial shaders with `#undef USE_MAP`. Because Three.js caches shader programs unless `material.needsUpdate = true` is explicitly invoked, later prop updates left spheres rendered as solid flat colors.
- **The Fix**: Built a synchronous texture caching pipeline (`textureCache.ts`) that guarantees `THREE.Texture` instances exist on **Frame 0** with `THREE.SRGBColorSpace` pre-configured, backed by automatic material update enforcement.

### 2. Physical Point Light Attenuation ($I / d^2$)
- **The Issue**: Modern Three.js uses physically correct inverse-square light decay. In a solar system where planets range from $d=38$ (Mercury) to $d=360$ (Neptune), standard point light decay caused sunlight to drop to near zero at Mars and beyond, rendering the outer solar system pitch-black.
- **The Fix**: Calibrated Sol's primary point light with `decay={0}` and long-range reach ($12,000$ units), supplemented by a camera-following dynamic fill light and a balanced ambient cosmic illumination ($0.42$) so surfaces and craters are vividly visible from every viewing angle.

### 3. Radial UV Mapping for Saturn's Rings
- **The Issue**: Standard Three.js `RingGeometry` generates planar Cartesian UV coordinates, causing linear ring strip textures to stretch across the circle as a flat box rather than forming concentric circular bands.
- **The Fix**: Custom-computed radial polar UV coordinates ($u = (r - r_{inner}) / (r_{outer} - r_{inner})$, $v = 0.5$) across 180 segments, producing museum-fidelity Cassini Division and Encke Gap rings around the full 360-degree circumference.

### 4. Zero Reconciler Overhead HUD
- **The Issue**: Rendering 3D HTML labels using `@react-three/drei`'s `<Html>` inside React 19's reconciler can trigger synchronous unmount race conditions and R3F namespace warnings.
- **The Fix**: Developed `hudManager.ts` and `FloatingHUD.tsx`—a high-performance 2D screen-space DOM layer living completely **outside** the `<Canvas>` tree. A lightweight `useFrame` tracker projects 3D camera coordinates (`vector.project(camera)`) directly to CSS viewport coordinates in sub-millisecond execution time.

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.18.0 or higher recommended)
- `npm` or `pnpm`

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/TheSpace.git
cd TheSpace
```

2. Install dependencies:
```bash
npm install
```

3. Launch the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your modern WebGL-compatible browser (Chrome, Edge, Brave, Firefox, or Safari).

### Production Build
```bash
npm run build
npm run start
```

---

## 🗺️ Key Controls & Navigation

| Input | Action |
| :--- | :--- |
| **Left Click + Drag** | Rotate & orbit camera view |
| **Right Click + Drag** | Pan 3D camera viewport |
| **Scroll Wheel** | Infinite Zoom (scale transitions automatically trigger) |
| **Click on Planet / Body** | Smooth cinematic camera flight to object |
| **`Cmd + K` or `Ctrl + K`** | Global search bar (planets, galaxies, landmarks, black holes) |
| **WARP TO Pills** | Instant cinematic leap to Mars, Jupiter, Saturn, Sombrero, Laniakea |
| **Surface Mode Toggle** | Toggle planetary Google Maps close-up exploration mode |
| **Tour Button** | Launch guided cinematic cosmic odyssey |

---

## 📜 Scientific Credits & Acknowledgements

All planetary textures, galactic photography, and astrometric measurements are provided courtesy of public domain datasets and surveys from:
- **NASA** (National Aeronautics and Space Administration)
- **NASA Jet Propulsion Laboratory (JPL) / California Institute of Technology**
- **ESA** (European Space Agency) & the Planck Space Observatory
- **STScI** (Space Telescope Science Institute) / Hubble Space Telescope & James Webb Space Telescope (JWST)
- **SDO** (Solar Dynamics Observatory)
- **LRO** (Lunar Reconnaissance Orbiter Camera)
- **MGS** (Mars Global Surveyor) & Mars Reconnaissance Orbiter (HiRISE)
- **Cassini-Huygens Mission Team**

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and build upon it for educational and non-commercial cosmic exploration.
