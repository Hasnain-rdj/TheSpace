'use client';

import { useState } from 'react';
import { useSpaceStore } from '@/store/useSpaceStore';
import { MULTIVERSE_ENCYCLOPEDIA } from '@/data/multiverseData';
import { X, Layers, Sparkles, BookOpen, Compass, Atom, HelpCircle } from 'lucide-react';

export function MultiverseModal() {
  const isMultiverseModalOpen = useSpaceStore((s) => s.isMultiverseModalOpen);
  const toggleMultiverseModal = useSpaceStore((s) => s.toggleMultiverseModal);
  const selectObject = useSpaceStore((s) => s.selectObject);

  const [activeTierId, setActiveTierId] = useState(MULTIVERSE_ENCYCLOPEDIA[0].id);

  if (!isMultiverseModalOpen) return null;

  const currentTier =
    MULTIVERSE_ENCYCLOPEDIA.find((t) => t.id === activeTierId) ||
    MULTIVERSE_ENCYCLOPEDIA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl max-h-[92vh] sm:max-h-[88vh] rounded-2xl bg-slate-950/95 border border-purple-500/30 shadow-[0_0_60px_rgba(168,85,247,0.25)] backdrop-blur-2xl flex flex-col overflow-hidden text-white font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-slate-900/40 to-transparent">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/20 border border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.4)] shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white">
                  MULTIVERSE & COSMOLOGY
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/60 text-purple-200 border border-purple-500/40">
                  THEORETICAL ARCHIVE
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono line-clamp-1">
                Tegmark Levels I–IV • String Landscape Flux Vacua • Holographic Dualities
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleMultiverseModal(false)}
            className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Layout: Left Nav + Right Dossier */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Tier Switcher (Horizontal scroll on mobile, vertical on desktop) */}
          <div className="w-full md:w-64 p-2 sm:p-3 bg-slate-900/40 flex md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar gap-1.5 shrink-0">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 px-2 py-1 shrink-0 hidden md:block">
              MULTIVERSE TIERS
            </div>
            {MULTIVERSE_ENCYCLOPEDIA.map((tier) => {
              const isActive = tier.id === activeTierId;
              return (
                <button
                  key={tier.id}
                  onClick={() => setActiveTierId(tier.id)}
                  className={`min-w-[140px] md:min-w-0 md:w-full p-2 sm:p-2.5 rounded-xl text-left transition-all flex flex-col shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-purple-500/25 text-purple-200 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      : 'hover:bg-white/5 text-slate-300 border border-transparent'
                  }`}
                >
                  <span className="text-xs font-semibold leading-snug line-clamp-2">
                    {tier.name.split(':')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-purple-400/80 mt-0.5">
                    {tier.dimensionCount}
                  </span>
                </button>
              );
            })}

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  toggleMultiverseModal(false);
                  selectObject('multiverse-foam');
                }}
                className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>FLY TO MULTIVERSE FOAM</span>
              </button>
            </div>
          </div>

          {/* Right Detailed Dossier */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs leading-relaxed text-slate-300">
            <div>
              <div className="text-[11px] font-mono text-purple-400 uppercase tracking-widest mb-1">
                {currentTier.classification}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {currentTier.name}
              </h3>
              <div className="text-xs text-slate-400 font-mono">
                Key Theorists: {currentTier.primaryProponents} • Dimensionality: {currentTier.dimensionCount}
              </div>
            </div>

            {/* Core Theoretical Basis */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-purple-500/20">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1.5 font-semibold">
                <BookOpen className="w-3.5 h-3.5" /> CORE THEORETICAL FOUNDATION
              </h4>
              <p className="leading-relaxed">{currentTier.coreTheoreticalBasis}</p>
            </div>

            {/* Physical Implications */}
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 mb-1.5 flex items-center gap-1.5 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> PHYSICAL IMPLICATIONS & NATURE OF REALITY
              </h4>
              <p className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 leading-relaxed">
                {currentTier.physicalImplications}
              </p>
            </div>

            {/* Mathematical Formulation */}
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-300 mb-1.5 flex items-center gap-1.5 font-semibold">
                <Atom className="w-3.5 h-3.5" /> MATHEMATICAL & TENSOR FORMULATION
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/25 font-mono text-xs text-amber-200">
                <code>{currentTier.mathematicalFormulation}</code>
              </div>
            </div>

            {/* Observational Signatures */}
            <div>
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 mb-1.5 flex items-center gap-1.5 font-semibold">
                <Compass className="w-3.5 h-3.5" /> OBSERVATIONAL TESTABILITY & EXPERIMENTS
              </h4>
              <p className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 leading-relaxed">
                {currentTier.observationalSignatures}
              </p>
            </div>

            {/* FAQ */}
            {currentTier.faq.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20">
                <div className="font-semibold text-purple-200 flex items-center gap-1.5 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  {item.question}
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
