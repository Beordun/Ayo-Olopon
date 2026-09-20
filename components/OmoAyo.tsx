'use client';

import React, { useMemo } from 'react';

interface OmoAyoProps {
  count: number;
  isAnimating?: boolean;
}

/**
 * Organic Pebble SVG Component
 */
const Pebble = ({ rotation, scale, offsetX, offsetY }: { rotation: number; scale: number; offsetX: number; offsetY: number }) => (
  <div
    className="absolute transition-transform duration-200"
    style={{
      transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
    }}
  >
    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
      <defs>
        <radialGradient id="seedGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#73836C" />
          <stop offset="50%" stopColor="#53624D" />
          <stop offset="100%" stopColor="#2A3326" />
        </radialGradient>
        <filter id="speckle">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45   0 0 0 0 0.51   0 0 0 0 0.42  0 0 0 0.15 0" />
          <feComposite in2="SourceGraphic" in="glaze" operator="in" />
        </filter>
      </defs>
      {/* Organic asymmetrical pebble shape */}
      <path
        d="M10.8 1.2C15.5 1.5 19.8 4.2 20.6 8.5C21.4 12.8 18.2 17.1 13.5 18.3C8.8 19.5 3.5 17.2 1.8 12.8C0.1 8.5 3.2 2.8 7.8 1.6C8.8 1.3 9.8 1.1 10.8 1.2Z"
        fill="url(#seedGrad)"
      />
      {/* Subtle dry sage mineral highlight speck */}
      <ellipse cx="7.5" cy="5.5" rx="3" ry="2" fill="#8E9F86" opacity="0.4" />
    </svg>
  </div>
);

/**
 * Triad Cluster for >= 5 seeds with contrast pill badge
 */
const TriadCluster = ({ count }: { count: number }) => (
  <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
    {/* 3 overlapping stylized pebbles */}
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute -top-1 left-2 rotate-[-12deg] scale-90 opacity-90">
        <Pebble rotation={-12} scale={0.9} offsetX={0} offsetY={0} />
      </div>
      <div className="absolute top-2 -left-1 rotate-[24deg] scale-95 opacity-90">
        <Pebble rotation={24} scale={0.95} offsetX={0} offsetY={0} />
      </div>
      <div className="absolute top-2 right-0 rotate-[60deg] scale-90 opacity-95">
        <Pebble rotation={60} scale={0.9} offsetX={0} offsetY={0} />
      </div>

      {/* Centered High-Contrast Numeric Pill Badge */}
      <div
        className="relative z-10 px-2 py-0.5 rounded-full text-xs font-bold font-brand tracking-wide shadow-lg border border-ayo-bevel"
        style={{
          backgroundColor: '#1F1008',
          color: '#EAD8C7',
          boxShadow: '0 2px 6px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.15)',
        }}
      >
        {count}
      </div>
    </div>
  </div>
);

export const OmoAyo: React.FC<OmoAyoProps> = ({ count, isAnimating }) => {
  // Pre-calculate deterministic pebble placements for 1 to 4 seeds
  const pebbleLayouts = useMemo(() => {
    switch (count) {
      case 1:
        return [{ rotation: 5, scale: 1.05, offsetX: 0, offsetY: 0 }];
      case 2:
        return [
          { rotation: -12, scale: 1.0, offsetX: -6, offsetY: -2 },
          { rotation: 18, scale: 0.98, offsetX: 6, offsetY: 2 },
        ];
      case 3:
        return [
          { rotation: -8, scale: 0.95, offsetX: 0, offsetY: -7 },
          { rotation: 22, scale: 0.95, offsetX: -6, offsetY: 4 },
          { rotation: -18, scale: 0.96, offsetX: 6, offsetY: 4 },
        ];
      case 4:
        return [
          { rotation: -15, scale: 0.92, offsetX: -6, offsetY: -6 },
          { rotation: 14, scale: 0.94, offsetX: 6, offsetY: -5 },
          { rotation: 20, scale: 0.92, offsetX: -5, offsetY: 6 },
          { rotation: -10, scale: 0.93, offsetX: 6, offsetY: 6 },
        ];
      default:
        return [];
    }
  }, [count]);

  // 0 seeds: Render an empty hollow (no badge, no placeholder)
  if (count <= 0) {
    return null;
  }

  // >= 5 seeds: Render triad cluster + high-contrast count badge
  if (count >= 5) {
    return <TriadCluster count={count} />;
  }

  // 1 to 4 seeds: Render distinct organic rounded pebbles
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center pointer-events-none transition-transform duration-200 ${
        isAnimating ? 'scale-105' : 'scale-100'
      }`}
    >
      {pebbleLayouts.map((layout, idx) => (
        <Pebble
          key={idx}
          rotation={layout.rotation}
          scale={layout.scale}
          offsetX={layout.offsetX}
          offsetY={layout.offsetY}
        />
      ))}
    </div>
  );
};
