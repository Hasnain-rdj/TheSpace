'use client';

import { useState, useEffect } from 'react';
import { useSpaceStore } from '@/store/useSpaceStore';
import {
  fetchNasaApod,
  fetchLiveExoplanets,
  fetchNearEarthObjects,
  NasaApodData,
  LiveExoplanet,
  NearEarthObject,
} from '@/services/nasaService';
import { X, Globe, Radio, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';

export function NasaFeedModal() {
  const isNasaLiveFeedOpen = useSpaceStore((s) => s.isNasaLiveFeedOpen);
  const toggleNasaLiveFeed = useSpaceStore((s) => s.toggleNasaLiveFeed);

  const [activeTab, setActiveTab] = useState<'apod' | 'exoplanets' | 'asteroids'>('apod');
  const [apod, setApod] = useState<NasaApodData | null>(null);
  const [exoplanets, setExoplanets] = useState<LiveExoplanet[]>([]);
  const [asteroids, setAsteroids] = useState<NearEarthObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isNasaLiveFeedOpen) return;
    setLoading(true);
    Promise.all([fetchNasaApod(), fetchLiveExoplanets(), fetchNearEarthObjects()]).then(
      ([apodRes, exoRes, astRes]) => {
        setApod(apodRes);
        setExoplanets(exoRes);
        setAsteroids(astRes);
        setLoading(false);
      }
    );
  }, [isNasaLiveFeedOpen]);

  if (!isNasaLiveFeedOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] rounded-2xl bg-slate-950/95 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] backdrop-blur-2xl flex flex-col overflow-hidden text-white font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/40 to-transparent">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white">
                  NASA TELEMETRY HUB
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-900/60 text-cyan-200 border border-cyan-500/40">
                  LIVE API SYNC
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono line-clamp-1">
                Real-Time Feeds from NASA Jet Propulsion Laboratory & IPAC Exoplanet Archive
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleNasaLiveFeed(false)}
            className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/10 bg-slate-900/40 font-mono text-xs">
          <button
            onClick={() => setActiveTab('apod')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'apod'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            NASA Astronomy Picture of the Day
          </button>
          <button
            onClick={() => setActiveTab('exoplanets')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'exoplanets'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Exoplanet Archive
          </button>
          <button
            onClick={() => setActiveTab('asteroids')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'asteroids'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Near-Earth Asteroids (NeoWS)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs leading-relaxed text-slate-300">
          {loading ? (
            <div className="py-16 text-center text-cyan-400 font-mono animate-pulse">
              SYNCING TELEMETRY PACKETS FROM NASA APIS...
            </div>
          ) : activeTab === 'apod' && apod ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 rounded-xl overflow-hidden border border-white/10 bg-black flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={apod.url}
                    alt={apod.title}
                    className="w-full h-auto object-cover max-h-80"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-2.5">
                  <span className="text-[10px] font-mono text-cyan-400">
                    DATE: {apod.date}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {apod.title}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {apod.explanation}
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'exoplanets' ? (
            <div className="space-y-3">
              <div className="text-[11px] font-mono text-slate-400">
                LATEST VALIDATED HABITABLE-ZONE EXOPLANETS (NASA EXOPLANET ARCHIVE)
              </div>
              <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-slate-900/40">
                {exoplanets.map((exo) => (
                  <div
                    key={exo.name}
                    className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        {exo.name}
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {exo.discoveryMethod} ({exo.discoveryYear})
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5 font-mono">
                        Host Star: {exo.hostStar} • Period: {exo.orbitalPeriodDays} days
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div className="text-cyan-300">
                        Radius: {exo.radiusEarth} R⊕
                      </div>
                      <div className="text-slate-400">
                        Mass: {exo.massEarth} M⊕
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[11px] font-mono text-slate-400">
                NEAR-EARTH OBJECTS (NEOWS) CLOSE APPROACH TRACKING
              </div>
              <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-slate-900/40">
                {asteroids.map((ast) => (
                  <div
                    key={ast.id}
                    className="p-3.5 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center gap-2">
                        {ast.name}
                        {ast.isPotentiallyHazardous && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> HAZARDOUS
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5 font-mono">
                        Diameter: {ast.estimatedDiameterKm} • Relative Speed: {ast.relativeVelocityKmh}
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <div className="text-amber-300">
                        Approach: {ast.closeApproachDate}
                      </div>
                      <div className="text-slate-400">
                        Miss Dist: {ast.missDistanceKm}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
