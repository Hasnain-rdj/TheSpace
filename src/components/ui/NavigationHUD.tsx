'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Flame,
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <>
      <header className="fixed top-0 left-0 right-0 z-30 px-2.5 sm:px-4 md:px-6 py-2 flex items-center justify-between border-b border-cyan-500/15 bg-slate-950/80 backdrop-blur-xl">
        {/* Brand Identity & Logo */}
        <button
          onClick={() => {
            selectObject('earth');
            cosmicAudio.playSelectChime();
          }}
          className="group flex items-center gap-2 sm:gap-3 text-left focus:outline-none cursor-pointer shrink-0"
          title="TheSpace - Return to Earth / Home"
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden p-0.5 bg-gradient-to-br from-cyan-400/40 via-purple-500/20 to-blue-600/40 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.35)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="TheSpace Cosmic Logo"
              className="w-full h-full object-cover rounded-[10px]"
            />
            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-wider text-white uppercase font-sans group-hover:text-cyan-300 transition-colors">
                TheSpace
              </h1>
              <span className="hidden lg:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                NASA EYES V3
              </span>
            </div>
            <div
              className="text-[9px] sm:text-[10px] font-mono text-slate-400 hidden xl:block"
              suppressHydrationWarning
            >
              {utcTime || 'SYNCHRONIZING ORBITAL TIME...'}
            </div>
          </div>
        </button>

        {/* Center Search Bar */}
        <div className="flex items-center mx-1 sm:mx-2">
          <SearchBar />
        </div>

        {/* Right Controls HUD */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 font-mono text-xs shrink-0">
          {/* Planet Destruction Lab Launcher (Solar Smash Simulation) */}
          <Link
            href="/simulate"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 hover:border-red-400 transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] group shrink-0"
            title="Open Planet Destruction Lab (Solar Smash Simulator)"
          >
            <Flame className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform animate-pulse" />
            <span className="font-bold tracking-wide hidden sm:inline">Destruction Lab</span>
            <span className="font-bold tracking-wide sm:hidden text-[10px]">Smash</span>
          </Link>

          {/* Desktop Controls (Hidden on Mobile/Tablet) */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Multiverse Encyclopedia Launcher */}
            <button
              onClick={() => toggleMultiverseModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-purple-950/60 hover:bg-purple-900/70 text-purple-200 border border-purple-500/30 transition-all shadow-[0_0_12px_rgba(168,85,247,0.2)]"
              title="Open Multiverse & Theoretical Physics Hub"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Multiverse</span>
            </button>

            {/* NASA Live API Telemetry Launcher */}
            <button
              onClick={() => toggleNasaLiveFeed(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900/70 text-cyan-200 border border-cyan-500/30 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              title="Open NASA Live APOD & Exoplanet Feed"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>NASA Live</span>
            </button>

            {/* Guided Tour Launcher */}
            <button
              onClick={isTourActive ? stopTour : startTour}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all ${
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

          {/* Mobile / Tablet Quick Menu Button (Hamburger) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer shadow-md"
            title="Toggle Quick Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Glassmorphic Drawer / Popover Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden pt-16 px-4 animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm ml-auto rounded-2xl bg-slate-950/95 border border-cyan-500/30 p-4 shadow-[0_0_40px_rgba(6,182,212,0.25)] backdrop-blur-2xl flex flex-col gap-3 font-mono text-xs text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                NAVIGATION HUB
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hub Actions Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  toggleMultiverseModal(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200"
              >
                <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Multiverse</span>
              </button>

              <button
                onClick={() => {
                  toggleNasaLiveFeed(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200"
              >
                <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>NASA Live</span>
              </button>

              <button
                onClick={() => {
                  if (isTourActive) stopTour();
                  else startTour();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200"
              >
                <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isTourActive ? 'Stop Tour' : 'Grand Tour'}</span>
              </button>

              <button
                onClick={() => {
                  toggleDataPanel();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-200"
              >
                <Info className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Planet Info</span>
              </button>
            </div>

            {/* Quick Toggles List */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
              <button
                onClick={toggleOrbitLines}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <Orbit className="w-3.5 h-3.5 text-cyan-400" />
                  Orbit Lines
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isOrbitLinesVisible ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  {isOrbitLinesVisible ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={toggleLabels}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  Celestial Labels
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isLabelsVisible ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  {isLabelsVisible ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                onClick={handleAudioToggle}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                  Cosmic Sound
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${!isAudioMuted ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                  {!isAudioMuted ? 'ON' : 'MUTED'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
