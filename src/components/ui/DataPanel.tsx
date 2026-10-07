'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Orbit,
  Thermometer,
  Weight,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  MapPin,
  Compass,
} from 'lucide-react';
import { useSpaceStore } from '@/store/useSpaceStore';
import { CELESTIAL_BODIES } from '@/data/celestialData';
import { SURFACE_LANDMARKS } from '@/data/landmarksData';

export function DataPanel() {
  const isDataPanelOpen = useSpaceStore((s) => s.isDataPanelOpen);
  const toggleDataPanel = useSpaceStore((s) => s.toggleDataPanel);
  const selectedObjectId = useSpaceStore((s) => s.selectedObjectId);
  const selectedLandmarkId = useSpaceStore((s) => s.selectedLandmarkId);
  const selectObject = useSpaceStore((s) => s.selectObject);
  const isSurfaceMode = useSpaceStore((s) => s.isSurfaceMode);
  const enterSurfaceMode = useSpaceStore((s) => s.enterSurfaceMode);
  const exitSurfaceMode = useSpaceStore((s) => s.exitSurfaceMode);

  const body = CELESTIAL_BODIES.find((b) => b.id === selectedObjectId);
  const landmark = SURFACE_LANDMARKS.find((l) => l.id === selectedLandmarkId);

  if (!body) return null;

  const currentIndex = CELESTIAL_BODIES.findIndex((b) => b.id === selectedObjectId);
  const prevBody =
    CELESTIAL_BODIES[
      (currentIndex - 1 + CELESTIAL_BODIES.length) % CELESTIAL_BODIES.length
    ];
  const nextBody =
    CELESTIAL_BODIES[(currentIndex + 1) % CELESTIAL_BODIES.length];

  return (
    <div className="fixed right-0 top-0 bottom-0 z-30 pointer-events-none flex items-center pr-3 md:pr-6">
      <AnimatePresence>
        {isDataPanelOpen && (
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto w-[92vw] sm:w-[420px] max-h-[88vh] rounded-2xl bg-slate-950/85 backdrop-blur-2xl border border-cyan-500/25 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden text-slate-100 font-sans"
          >
            {/* Header / Identification Banner */}
            <div className="relative p-5 pb-4 border-b border-white/10 bg-gradient-to-b from-cyan-950/30 to-transparent">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {landmark ? landmark.category : body.category}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      {landmark ? `${body.name} Landmark` : `${body.scale} scale`}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    {landmark ? landmark.name : body.name}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {landmark
                      ? `Lat: ${landmark.latitude}° • Lon: ${landmark.longitude}° • ${landmark.elevation}`
                      : body.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => toggleDataPanel(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
                  aria-label="Close telemetry panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Surface Mode Toggle Quick Pill */}
              {SURFACE_LANDMARKS.some((l) => l.bodyId === body.id) && (
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    SURFACE EXPLORER
                  </span>
                  <button
                    onClick={isSurfaceMode ? exitSurfaceMode : enterSurfaceMode}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      isSurfaceMode
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30'
                    }`}
                  >
                    {isSurfaceMode ? 'EXIT TO ORBIT' : 'ENTER GOOGLE MAPS MODE'}
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-5 py-4 space-y-5 text-xs text-slate-300 leading-relaxed custom-scrollbar">
              {/* Authentic NASA Photographic Showcase Banner */}
              {body.imageUrl && !landmark && (
                <div className="relative w-full h-40 overflow-hidden rounded-xl border border-white/10 group shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={body.imageUrl}
                    alt={body.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/20 flex flex-col justify-between p-2.5 pointer-events-none">
                    <span className="self-start text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
                      OFFICIAL NASA PHOTO
                    </span>
                    {body.nasaMissionCredit && (
                      <span className="text-[9px] font-mono text-slate-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur-md truncate">
                        CREDIT: {body.nasaMissionCredit}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {/* If a landmark is focused: display Landmark Specific Science */}
              {landmark ? (
                <>
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                    <h3 className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      SURFACE FEATURE DOSSIER
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-slate-500 text-[10px] block">LATITUDE</span>
                        <span className="text-cyan-200 font-semibold">{landmark.latitude}°</span>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-slate-500 text-[10px] block">LONGITUDE</span>
                        <span className="text-cyan-200 font-semibold">{landmark.longitude}°</span>
                      </div>
                      <div className="p-2 rounded bg-black/40 border border-white/5 col-span-2">
                        <span className="text-slate-500 text-[10px] block">ELEVATION / DEPTH</span>
                        <span className="text-emerald-300 font-semibold">{landmark.elevation}</span>
                      </div>
                      {landmark.diameter && (
                        <div className="p-2 rounded bg-black/40 border border-white/5 col-span-2">
                          <span className="text-slate-500 text-[10px] block">DIAMETER / SPAN</span>
                          <span className="text-amber-300 font-semibold">{landmark.diameter}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 mb-1.5 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      GEOGRAPHIC & MORPHOLOGICAL OVERVIEW
                    </h3>
                    <p className="p-3 rounded-lg bg-slate-900/40 border border-white/5 leading-relaxed">
                      {landmark.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      SCIENTIFIC & MISSION RELEVANCE
                    </h3>
                    <p className="p-3 rounded-lg bg-slate-900/40 border border-white/5 leading-relaxed">
                      {landmark.scientificValue}
                    </p>
                  </div>
                </>
              ) : (
                /* Standard Celestial Body Science Dossier */
                <>
                  <div>
                    <h3 className="text-[11px] font-mono uppercase tracking-widest text-cyan-400/80 mb-2.5 flex items-center gap-1.5">
                      <Orbit className="w-3.5 h-3.5" />
                      PHYSICAL & ASTROMETRIC TELEMETRY
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Weight className="w-3 h-3 text-cyan-400" /> Mass
                        </span>
                        <span className="font-semibold text-slate-100 mt-1 truncate">
                          {body.physicalData.mass}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Maximize2 className="w-3 h-3 text-cyan-400" /> Radius
                        </span>
                        <span className="font-semibold text-slate-100 mt-1 truncate">
                          {body.physicalData.radius}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Minimize2 className="w-3 h-3 text-cyan-400" /> Surface Gravity
                        </span>
                        <span className="font-semibold text-slate-100 mt-1 truncate">
                          {body.physicalData.gravity}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Thermometer className="w-3 h-3 text-cyan-400" /> Surface Temp
                        </span>
                        <span className="font-semibold text-slate-100 mt-1 truncate">
                          {body.physicalData.surfaceTemp}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col col-span-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          Orbital Period / Dynamics
                        </span>
                        <span className="font-semibold text-slate-100 mt-1">
                          {body.physicalData.orbitalPeriod}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col col-span-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          Distance from Earth
                        </span>
                        <span className="font-semibold text-slate-100 mt-1">
                          {body.physicalData.distanceFromEarth}
                        </span>
                      </div>

                      {body.physicalData.atmosphere && (
                        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex flex-col col-span-2">
                          <span className="text-[10px] font-mono text-slate-400">
                            Atmospheric Composition
                          </span>
                          <span className="font-semibold text-slate-200 mt-1">
                            {body.physicalData.atmosphere}
                          </span>
                        </div>
                      )}

                      {body.physicalData.theoreticalDimensions && (
                        <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/20 flex flex-col col-span-2">
                          <span className="text-[10px] font-mono text-purple-300">
                            Theoretical Dimensions (M-Theory)
                          </span>
                          <span className="font-semibold text-purple-100 mt-1">
                            {body.physicalData.theoreticalDimensions}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-mono uppercase tracking-widest text-cyan-400/80 mb-2 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      SCIENTIFIC MISSION OVERVIEW
                    </h3>
                    <p className="bg-slate-900/40 p-3 rounded-lg border border-white/5 leading-relaxed text-slate-300">
                      {body.overview}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-mono uppercase tracking-widest text-cyan-400/80 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      PHENOMENA & KEY OBSERVATIONS
                    </h3>
                    <ul className="space-y-2">
                      {body.notableFacts.map((fact, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded-md bg-slate-900/30 border border-white/5 text-[11px] text-slate-300 leading-snug"
                        >
                          <span className="text-cyan-400 font-mono mt-0.5">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Quick Navigation Footer */}
            <div className="p-3 border-t border-white/10 bg-slate-900/80 flex items-center justify-between font-mono text-xs">
              <button
                onClick={() => selectObject(prevBody.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title={`Previous: ${prevBody.name}`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{prevBody.name}</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <span className="text-[11px] text-slate-500">
                {currentIndex + 1} / {CELESTIAL_BODIES.length}
              </span>

              <button
                onClick={() => selectObject(nextBody.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title={`Next: ${nextBody.name}`}
              >
                <span className="hidden sm:inline">{nextBody.name}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button when Closed */}
      {!isDataPanelOpen && (
        <button
          onClick={() => toggleDataPanel(true)}
          className="pointer-events-auto p-3 rounded-full bg-slate-900/90 text-cyan-400 hover:text-cyan-300 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-md transition-all hover:scale-105"
          title="Open Celestial Data Panel"
        >
          <Info className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
