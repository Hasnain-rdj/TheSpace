'use client';

import { useSpaceStore } from '@/store/useSpaceStore';
import { CELESTIAL_BODIES } from '@/data/celestialData';
import { Compass, ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GuidedTourModal() {
  const isTourActive = useSpaceStore((s) => s.isTourActive);
  const tourStep = useSpaceStore((s) => s.tourStep);
  const stopTour = useSpaceStore((s) => s.stopTour);
  const nextTourStep = useSpaceStore((s) => s.nextTourStep);
  const prevTourStep = useSpaceStore((s) => s.prevTourStep);
  const selectedObjectId = useSpaceStore((s) => s.selectedObjectId);

  const currentObj = CELESTIAL_BODIES.find((b) => b.id === selectedObjectId);

  if (!isTourActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-lg p-4 rounded-2xl bg-slate-950/90 border border-cyan-400/50 backdrop-blur-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] text-white"
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin" />
            <span>COSMIC ODYSSEY TOUR • STOP {tourStep + 1} OF 9</span>
          </div>
          <button
            onClick={stopTour}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {currentObj?.name}
          </h3>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
            {currentObj?.overview}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-xs">
          <button
            onClick={prevTourStep}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev Stop
          </button>

          <button
            onClick={nextTourStep}
            className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 font-semibold shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            Next Destination <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
