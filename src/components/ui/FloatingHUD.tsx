'use client';

import React, { useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { hudManager, BodyLabelData, LandmarkLabelData } from '@/utils/hudManager';

export function FloatingHUD() {
  const bodyLabelRef = useRef<HTMLDivElement>(null);
  const bodyTextRef = useRef<HTMLSpanElement>(null);
  const bodyDotRef = useRef<HTMLSpanElement>(null);

  const landmarkRef = useRef<HTMLDivElement>(null);
  const landmarkNameRef = useRef<HTMLDivElement>(null);
  const landmarkDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hudManager.setBodyListener((data: BodyLabelData | null) => {
      const el = bodyLabelRef.current;
      if (!el) return;
      if (!data || !data.visible) {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'flex';
      el.style.transform = `translate3d(${data.x.toFixed(1)}px, ${data.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      if (bodyTextRef.current) bodyTextRef.current.textContent = data.name;
      if (bodyDotRef.current) {
        bodyDotRef.current.className = `w-1.5 h-1.5 rounded-full ${
          data.isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
        }`;
      }
      el.className = `fixed pointer-events-none z-30 px-2.5 py-1 rounded text-xs font-mono tracking-wider transition-opacity duration-150 whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md border ${
        data.isSelected
          ? 'bg-cyan-950/85 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
          : 'bg-amber-950/85 text-amber-300 border-amber-400/80'
      }`;
    });

    hudManager.setLandmarkListener((data: LandmarkLabelData | null) => {
      const el = landmarkRef.current;
      if (!el) return;
      if (!data || !data.visible) {
        el.style.display = 'none';
        return;
      }
      el.style.display = 'flex';
      el.style.transform = `translate3d(${data.x.toFixed(1)}px, ${data.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
      if (landmarkNameRef.current) landmarkNameRef.current.textContent = data.name;
      if (landmarkDetailsRef.current) {
        landmarkDetailsRef.current.textContent = `${data.latitude.toFixed(2)}°, ${data.longitude.toFixed(2)}° • ${data.elevation}`;
      }
      el.className = `fixed pointer-events-none z-30 px-2.5 py-1.5 rounded-lg border backdrop-blur-xl transition-all shadow-lg flex items-center gap-2 whitespace-nowrap text-xs font-sans ${
        data.isSelected
          ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-105'
          : 'bg-amber-950/90 text-amber-200 border-amber-400/80'
      }`;
    });

    return () => {
      hudManager.setBodyListener(null);
      hudManager.setLandmarkListener(null);
    };
  }, []);

  return (
    <>
      {/* 2D Celestial Body Label */}
      <div
        ref={bodyLabelRef}
        style={{ display: 'none', top: 0, left: 0, willChange: 'transform' }}
      >
        <span ref={bodyDotRef} className="w-1.5 h-1.5 rounded-full" />
        <span ref={bodyTextRef} />
      </div>

      {/* 2D Surface Landmark Tooltip */}
      <div
        ref={landmarkRef}
        style={{ display: 'none', top: 0, left: 0, willChange: 'transform' }}
      >
        <MapPin className="w-3.5 h-3.5 shrink-0 text-cyan-400 fill-cyan-400" />
        <div>
          <div ref={landmarkNameRef} className="font-semibold text-[11px] leading-tight" />
          <div ref={landmarkDetailsRef} className="text-[9px] font-mono opacity-80" />
        </div>
      </div>
    </>
  );
}
