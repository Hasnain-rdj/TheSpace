'use client';

import { useState, useEffect } from 'react';
import {
  Compass,
  Volume2,
  VolumeX,
  Orbit,
  Tag,
  Sparkles,
  Layers,
  Radio,
  Info,
} from 'lucide-react';
import { useSpaceStore } from '@/store/useSpaceStore';
import { SearchBar } from './SearchBar';
import { cosmicAudio } from '@/utils/audioSynth';

export function NavigationHUD() {
  const isOrbitLinesVisible = useSpaceStore((s) => s.isOrbitLinesVisible);
  const toggleOrbitLines = useSpaceStore((s) => s.toggleOrbitLines);
  const isLabelsVisible = useSpaceStore((s) => s.isLabelsVisible);
  const toggleLabels = useSpaceStore((s) => s.toggleLabels);
  const isAudioMuted = useSpaceStore((s) => s.isAudioMuted);
  const toggleAudio = useSpaceStore((s) => s.toggleAudio);
  const isTourActive = useSpaceStore((s) => s.isTourActive);
  const startTour = useSpaceStore((s) => s.startTour);
  const stopTour = useSpaceStore((s) => s.stopTour);
  const toggleDataPanel = useSpaceStore((s) => s.toggleDataPanel);
  const toggleMultiverseModal = useSpaceStore((s) => s.toggleMultiverseModal);
  const toggleNasaLiveFeed = useSpaceStore((s) => s.toggleNasaLiveFeed);
  const selectObject = useSpaceStore((s) => s.selectObject);

  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAudioToggle = () => {
    const newMuted = !isAudioMuted;
    toggleAudio();
    cosmicAudio.setMuted(newMuted);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-3 md:px-6 py-2 flex items-center justify-between border-b border-cyan-500/15 bg-slate-950/75 backdrop-blur-xl">
      {/* Brand Identity & Logo */}
      <button
        onClick={() => {
          selectObject('earth');
          cosmicAudio.playSelectChime();
        }}
        className="group flex items-center gap-3 text-left focus:outline-none cursor-pointer"
        title="TheSpace - Return to Earth / Home"
      >
        <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-cyan-400/40 via-purple-500/20 to-blue-600/40 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.35)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="TheSpace Cosmic Logo"
            className="w-full h-full object-cover rounded-[10px]"
          />
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold tracking-wider text-white uppercase font-sans group-hover:text-cyan-300 transition-colors">
              TheSpace
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              NASA EYES V3
            </span>
          </div>
          <div
            className="text-[10px] font-mono text-slate-400 hidden sm:block"
            suppressHydrationWarning
          >
            {utcTime || 'SYNCHRONIZING ORBITAL TIME...'}
          </div>
        </div>
      </button>

      {/* Center Search Bar (Supports Planets & Google Maps Landmarks) */}
      <div className="flex items-center gap-2">
        <SearchBar />
      </div>

      {/* Right Controls HUD */}
      <div className="flex items-center gap-1.5 md:gap-2 font-mono text-xs">
        {/* Multiverse Encyclopedia Launcher */}
        <button
          onClick={() => toggleMultiverseModal(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-purple-950/60 hover:bg-purple-900/70 text-purple-200 border border-purple-500/30 transition-all shadow-[0_0_12px_rgba(168,85,247,0.2)]"
          title="Open Multiverse & Theoretical Physics Hub"
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Multiverse</span>
        </button>

        {/* NASA Live API Telemetry Launcher */}
        <button
          onClick={() => toggleNasaLiveFeed(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-200 border border-cyan-500/30 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          title="Open NASA Live APOD & Exoplanet Feed"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>NASA Live</span>
        </button>

        {/* Guided Tour Launcher */}
        <button
          onClick={isTourActive ? stopTour : startTour}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all ${
            isTourActive
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10'
          }`}
          title="Begin Cinematic Cosmic Odyssey Tour"
        >
          <Compass className={`w-3.5 h-3.5 ${isTourActive ? 'animate-spin' : ''}`} />
          <span>{isTourActive ? 'Touring...' : 'Tour'}</span>
        </button>

        {/* Orbit Lines Toggle */}
        <button
          onClick={toggleOrbitLines}
          className={`p-2 rounded-full transition-colors border ${
            isOrbitLinesVisible
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
          }`}
          title={isOrbitLinesVisible ? 'Hide Orbit Lines' : 'Show Orbit Lines'}
          aria-label="Toggle Orbit Paths"
        >
          <Orbit className="w-3.5 h-3.5" />
        </button>

        {/* Celestial Labels Toggle */}
        <button
          onClick={toggleLabels}
          className={`p-2 rounded-full transition-colors border ${
            isLabelsVisible
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
          }`}
          title={isLabelsVisible ? 'Hide Object Labels' : 'Show Object Labels'}
          aria-label="Toggle Object Labels"
        >
          <Tag className="w-3.5 h-3.5" />
        </button>

        {/* Ambient Synthesizer Audio Toggle */}
        <button
          onClick={handleAudioToggle}
          className={`p-2 rounded-full transition-colors border ${
            !isAudioMuted
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : 'bg-slate-900/80 text-slate-400 border-white/10 hover:text-white'
          }`}
          title={!isAudioMuted ? 'Mute Cosmic Drone' : 'Unmute Ambient Drone'}
          aria-label="Toggle Ambient Audio"
        >
          {!isAudioMuted ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Data Panel Toggle */}
        <button
          onClick={() => toggleDataPanel()}
          className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
          title="Toggle Data Panel"
          aria-label="Toggle Data Panel"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
