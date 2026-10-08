'use client';

import { useSpaceStore, MapLayerType } from '@/store/useSpaceStore';
import { SURFACE_LANDMARKS } from '@/data/landmarksData';
import { CELESTIAL_BODIES } from '@/data/celestialData';
import {
  MapPin,
  Layers,
  Compass,
  Mountain,
  Moon,
  Sun,
  Eye,
  Globe,
} from 'lucide-react';

export function SurfaceMapHUD() {
  const selectedObjectId = useSpaceStore((s) => s.selectedObjectId);
  const isSurfaceMode = useSpaceStore((s) => s.isSurfaceMode);
  const enterSurfaceMode = useSpaceStore((s) => s.enterSurfaceMode);
  const exitSurfaceMode = useSpaceStore((s) => s.exitSurfaceMode);
  const selectedLandmarkId = useSpaceStore((s) => s.selectedLandmarkId);
  const selectLandmark = useSpaceStore((s) => s.selectLandmark);
  const activeMapLayer = useSpaceStore((s) => s.activeMapLayer);
  const setMapLayer = useSpaceStore((s) => s.setMapLayer);
  const cursorCoordinates = useSpaceStore((s) => s.cursorCoordinates);

  const currentObj = CELESTIAL_BODIES.find((b) => b.id === selectedObjectId);
  const landmarks = SURFACE_LANDMARKS.filter((l) => l.bodyId === selectedObjectId);

  // Only show surface controls if the selected celestial body supports surface exploration
  const supportsSurfaceExploration = landmarks.length > 0;
  if (!supportsSurfaceExploration) return null;

  const mapLayers: Array<{ id: MapLayerType; label: string; icon: React.ReactNode }> = [
    { id: 'satellite', label: 'True Color', icon: <Globe className="w-3 h-3" /> },
    { id: 'elevation', label: 'Topography', icon: <Mountain className="w-3 h-3" /> },
    { id: 'night', label: 'Night Lights', icon: <Moon className="w-3 h-3" /> },
  ];

  return (
    <div className="fixed top-24 sm:top-28 left-2 sm:left-4 z-20 flex flex-col gap-2 max-w-[94vw] sm:max-w-sm pointer-events-auto">
      {/* Surface Mode Toggle Bar */}
      <div className="p-2.5 rounded-2xl bg-slate-950/85 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col gap-2 font-mono text-xs text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            <span className="uppercase">{currentObj?.name} MAPS ENGINE</span>
          </div>
          <button
            onClick={isSurfaceMode ? exitSurfaceMode : enterSurfaceMode}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
              isSurfaceMode
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30'
            }`}
          >
            {isSurfaceMode ? 'SURFACE ACTIVE' : 'EXPLORE SURFACE'}
          </button>
        </div>

        {/* Live Coordinate Crosshair Readout */}
        {isSurfaceMode && (
          <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-[11px] text-slate-300">
            <span className="text-slate-400">COORDINATES:</span>
            {cursorCoordinates ? (
              <span className="text-cyan-300 font-semibold">
                {cursorCoordinates.lat > 0
                  ? `${cursorCoordinates.lat}° N`
                  : `${Math.abs(cursorCoordinates.lat)}° S`}
                ,{' '}
                {cursorCoordinates.lon > 0
                  ? `${cursorCoordinates.lon}° E`
                  : `${Math.abs(cursorCoordinates.lon)}° W`}
              </span>
            ) : (
              <span className="text-slate-500 italic">Hover over globe</span>
            )}
          </div>
        )}

        {/* Map Layer Switcher */}
        {isSurfaceMode && (
          <div className="flex items-center gap-1 pt-1 border-t border-white/10">
            <span className="text-[10px] text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> Layers:
            </span>
            {mapLayers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setMapLayer(layer.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-all ${
                  activeMapLayer === layer.id
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {layer.icon}
                <span>{layer.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Surface Landmarks Quick Fly-To List */}
      {isSurfaceMode && landmarks.length > 0 && (
        <div className="p-2.5 rounded-2xl bg-slate-950/85 border border-cyan-500/20 backdrop-blur-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)] flex flex-col gap-1.5 max-h-56 overflow-y-auto custom-scrollbar font-sans text-xs">
          <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-1 pb-1 border-b border-white/5 flex items-center justify-between">
            <span>SURFACE POIS ({landmarks.length})</span>
            <span className="text-cyan-400">CLICK TO FLY</span>
          </div>

          <div className="flex flex-col gap-1">
            {landmarks.map((l) => {
              const isSelected = selectedLandmarkId === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => selectLandmark(l.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected
                          ? 'text-cyan-400 fill-cyan-400'
                          : 'text-rose-400 group-hover:scale-110'
                      }`}
                    />
                    <div className="truncate">
                      <div className="truncate text-xs">{l.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {l.elevation}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    FLY →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
