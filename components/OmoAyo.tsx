'use client';

import React, { useMemo } from 'react';

interface OmoAyoProps {
  count: number;
  isAnimating?: boolean;
}

/**
 * Organic Pebble SVG Component with authentic Caesalpinia bonduc seed styling matching Welcome Screen
 */
const Pebble = ({ rotation, scale, offsetX, offsetY }: { rotation: number; scale: number; offsetX: number; offsetY: number }) => (
  <div
    className="absolute transition-transform duration-200"
    style={{
      transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.95))',
    }}
  >
    <svg width="24" height="22" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="omoAyoGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#73836C" />
          <stop offset="50%" stopColor="#53624D" />
          <stop offset="100%" stopColor="#2A3326" />
        </radialGradient>
      </defs>
      {/* Organic asymmetrical pebble shape with authentic Caesalpinia bonduc seed gradient */}
      <path
        d="M10.8 1.2C15.5 1.5 19.8 4.2 20.6 8.5C21.4 12.8 18.2 17.1 13.5 18.3C8.8 19.5 3.5 17.2 1.8 12.8C0.1 8.5 3.2 2.8 7.8 1.6C8.8 1.3 9.8 1.1 10.8 1.2Z"
        fill="url(#omoAyoGrad)"
        stroke="#2A3326"
        strokeWidth="0.8"
      />
      {/* Subtle organic light sheen on top surface matching welcome screen */}
      <ellipse cx="8.5" cy="6.5" rx="3.5" ry="2" fill="#889980" opacity="0.4" transform="rotate(-15 8.5 6.5)" />
    </svg>
  </div>
);

/**
 * Triad Cluster for >= 5 seeds with contrast pill badge & shadow
 */
const TriadCluster = ({ count }: { count: number }) => (
  <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
    {/* 3 overlapping stylized pebbles */}
    <div className="relative w-11 h-11 flex items-center justify-center">
      <div className="absolute -top-1 left-2 rotate-[-12deg] scale-95 opacity-95">
        <Pebble rotation={-12} scale={0.95} offsetX={0} offsetY={0} />
      </div>
      <div className="absolute top-2 -left-1 rotate-[24deg] scale-100 opacity-95">
        <Pebble rotation={24} scale={1.0} offsetX={0} offsetY={0} />
      </div>
      <div className="absolute top-2 right-0 rotate-[60deg] scale-95 opacity-95">
        <Pebble rotation={60} scale={0.95} offsetX={0} offsetY={0} />
      </div>

      {/* Centered High-Contrast Numeric Pill Badge with depth shadow */}
      <div
        className="relative z-10 px-2 py-0.5 rounded-full text-xs font-bold font-brand tracking-wide border border-amber-800/80 bg-[#1F1008] text-[#EAD8C7]"
        style={{
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',
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
        return [{ rotation: 5, scale: 1.18, offsetX: 0, offsetY: 0 }];
      case 2:
        return [
          { rotation: -12, scale: 1.1, offsetX: -7, offsetY: -3 },
          { rotation: 18, scale: 1.08, offsetX: 7, offsetY: 3 },
        ];
      case 3:
        return [
          { rotation: -8, scale: 1.05, offsetX: 0, offsetY: -8 },
          { rotation: 22, scale: 1.05, offsetX: -7, offsetY: 5 },
          { rotation: -18, scale: 1.06, offsetX: 7, offsetY: 5 },
        ];
      case 4:
        return [
          { rotation: -15, scale: 1.03, offsetX: -7, offsetY: -7 },
          { rotation: 14, scale: 1.05, offsetX: 7, offsetY: -6 },
          { rotation: 20, scale: 1.03, offsetX: -6, offsetY: 7 },
          { rotation: -10, scale: 1.04, offsetX: 7, offsetY: 7 },
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

  // 1 to 4 seeds: Render distinct organic rounded pebbles with natural depth
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
