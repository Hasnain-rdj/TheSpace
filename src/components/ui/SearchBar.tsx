'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Compass, Globe, Sparkles, Disc, Radio, MapPin } from 'lucide-react';
import { useSpaceStore } from '@/store/useSpaceStore';
import { CELESTIAL_BODIES } from '@/data/celestialData';
import { SURFACE_LANDMARKS, SurfaceLandmark } from '@/data/landmarksData';
import { CelestialCategory } from '@/types/space';

interface SearchResultItem {
  id: string;
  type: 'celestial' | 'landmark';
  name: string;
  subtitle: string;
  tag: string;
  bodyId?: string;
  category?: string;
  imageUrl?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectObject = useSpaceStore((s) => s.selectObject);
  const selectLandmark = useSpaceStore((s) => s.selectLandmark);

  // Keyboard shortcut: Cmd+K / Ctrl+K or / to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const combinedResults: SearchResultItem[] = useMemo(() => {
    const celestialItems: SearchResultItem[] = CELESTIAL_BODIES.map((b) => ({
      id: b.id,
      type: 'celestial',
      name: b.name,
      subtitle: b.subtitle,
      tag: b.scale.toUpperCase(),
      category: b.category,
      imageUrl: b.imageUrl,
    }));

    const landmarkItems: SearchResultItem[] = SURFACE_LANDMARKS.map((l) => ({
      id: l.id,
      type: 'landmark',
      name: l.name,
      subtitle: `${l.bodyId.toUpperCase()} • ${l.elevation} • Lat: ${l.latitude}°, Lon: ${l.longitude}°`,
      tag: 'SURFACE POI',
      bodyId: l.bodyId,
      category: l.category,
    }));

    const all = [...celestialItems, ...landmarkItems];

    if (!query.trim()) return all.slice(0, 10);
    const q = query.toLowerCase();

    return all.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        (item.bodyId && item.bodyId.toLowerCase().includes(q))
    );
  }, [query]);

  const handleSelect = (item: SearchResultItem) => {
    if (item.type === 'celestial') {
      selectObject(item.id);
    } else {
      selectLandmark(item.id);
    }
    setIsOpen(false);
  };

  const getCategoryIcon = (category?: string, type?: 'celestial' | 'landmark') => {
    if (type === 'landmark') {
      return <MapPin className="w-3.5 h-3.5 text-rose-400" />;
    }
    switch (category) {
      case 'planet':
      case 'moon':
        return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
      case 'star':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'black-hole':
        return <Disc className="w-3.5 h-3.5 text-orange-400" />;
      case 'galaxy':
      case 'cosmic-structure':
        return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
      case 'quantum-dimension':
        return <Compass className="w-3.5 h-3.5 text-fuchsia-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <>
      {/* Top Search Button Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md transition-all text-xs font-mono group"
      >
        <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Search planet, landmark, or galaxy...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800/80 border border-slate-700 rounded text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* Modal Backdrop & Search Input Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl rounded-xl bg-slate-950/90 border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.25)] backdrop-blur-xl overflow-hidden flex flex-col max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center px-4 py-3 border-b border-cyan-500/20 bg-slate-900/60">
              <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Earth, Olympus Mons, Apollo 11, Everest, Gargantua, Calabi-Yau..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-mono"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-white mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded border border-slate-700 hover:bg-slate-700 font-mono"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="overflow-y-auto divide-y divide-white/5 p-2 custom-scrollbar">
              {combinedResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-mono">
                  No celestial bodies or landmarks found matching &quot;{query}&quot;
                </div>
              ) : (
                combinedResults.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="w-full px-3 py-2.5 rounded-lg flex items-center justify-between hover:bg-cyan-500/10 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      {item.imageUrl ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-400/40 shrink-0 bg-black/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-md bg-slate-900/80 border border-white/10 group-hover:border-cyan-400/40 shrink-0">
                          {getCategoryIcon(item.category, item.type)}
                        </div>
                      )}
                      <div className="truncate">
                        <div className="text-sm font-medium text-slate-100 group-hover:text-cyan-300 flex items-center gap-2 truncate">
                          <span className="truncate">{item.name}</span>
                          <span
                            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 border ${
                              item.type === 'landmark'
                                ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                                : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                            }`}
                          >
                            {item.tag}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-[11px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.type === 'landmark' ? 'SURFACE FLY →' : 'WARP FLIGHT →'}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
