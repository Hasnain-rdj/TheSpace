'use client';

import { useSpaceStore } from '@/store/useSpaceStore';
import { CelestialCategory } from '@/types/space';
import { CELESTIAL_BODIES } from '@/data/celestialData';

interface CategoryTab {
  id: string;
  label: string;
  targetId: string;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'all', label: 'Overview', targetId: 'earth' },
  { id: 'solar', label: 'Solar System', targetId: 'mars' },
  { id: 'galaxy', label: 'Discovered Galaxies', targetId: 'milky-way' },
  { id: 'black-hole', label: 'Black Holes', targetId: 'm87-black-hole' },
  { id: 'exoplanet', label: 'Exoplanets', targetId: 'kepler-186f' },
  { id: 'cosmic', label: 'Laniakea & Cosmic Web', targetId: 'laniakea-supercluster' },
  { id: 'quantum', label: 'Quantum Realm', targetId: 'calabi-yau' },
];

const DIRECT_HOTLINKS = [
  { id: 'mars', label: 'Mars', color: 'hover:text-orange-400', img: '/textures/mars.jpg' },
  { id: 'jupiter', label: 'Jupiter', color: 'hover:text-amber-300', img: '/textures/jupiter.jpg' },
  { id: 'saturn', label: 'Saturn', color: 'hover:text-yellow-200', img: '/textures/saturn.jpg' },
  { id: 'sombrero-galaxy', label: 'Sombrero (M104)', color: 'hover:text-amber-200', img: '/textures/sombrero.jpg' },
  { id: 'whirlpool-galaxy', label: 'Whirlpool (M51)', color: 'hover:text-cyan-300', img: '/textures/whirlpool.jpg' },
  { id: 'cartwheel-galaxy', label: 'Cartwheel', color: 'hover:text-pink-400', img: '/textures/cartwheel.jpg' },
  { id: 'triangulum-galaxy', label: 'Triangulum (M33)', color: 'hover:text-sky-300', img: '/textures/triangulum.jpg' },
  { id: 'laniakea-supercluster', label: 'Laniakea', color: 'hover:text-indigo-300', img: '/textures/cmb.jpg' },
];

export function QuickFilterBar() {
  const activeCategoryFilter = useSpaceStore((s) => s.activeCategoryFilter);
  const selectedObjectId = useSpaceStore((s) => s.selectedObjectId);
  const setCategoryFilter = useSpaceStore((s) => s.setCategoryFilter);
  const selectObject = useSpaceStore((s) => s.selectObject);

  const handleSelect = (cat: CategoryTab) => {
    setCategoryFilter(cat.id);
    selectObject(cat.targetId);
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-1.5 pointer-events-auto">
      {/* Primary Category Selector */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-slate-950/80 border border-cyan-500/25 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] text-xs font-mono">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat)}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Real NASA Discovered Objects Direct Warp Pills */}
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md text-[11px] font-mono text-slate-400 shadow-md">
        <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mr-1">
          WARP TO:
        </span>
        {DIRECT_HOTLINKS.map((item) => {
          const isSelected = selectedObjectId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => selectObject(item.id)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all whitespace-nowrap ${item.color} ${
                isSelected
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full overflow-hidden border border-white/20 shrink-0 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
