/**
 * Material 3 (M3) Elevation & Surface Lighting for Games — Ayò Ọlọ́pọ́n Digital
 *
 * Implements M3 5-level elevation system paired with deep tactile gouges,
 * hardwood rims, and natural seed drop-shadows.
 */

export const m3Elevation = {
  // Standard M3 Tonal & Shadow Elevation Levels
  level0: {
    shadow: 'none',
    surfaceTintAlpha: 0,
  },
  level1: {
    shadow: '0 1px 3px 1px rgba(0, 0, 0, 0.5), 0 1px 2px 0 rgba(0, 0, 0, 0.6)',
    surfaceTintAlpha: 0.05,
  },
  level2: {
    shadow: '0 2px 6px 2px rgba(0, 0, 0, 0.55), 0 1px 2px 0 rgba(0, 0, 0, 0.65)',
    surfaceTintAlpha: 0.08,
  },
  level3: {
    shadow: '0 4px 8px 3px rgba(0, 0, 0, 0.6), 0 1px 3px 0 rgba(0, 0, 0, 0.7)',
    surfaceTintAlpha: 0.11,
  },
  level4: {
    shadow: '0 6px 10px 4px rgba(0, 0, 0, 0.65), 0 2px 3px 0 rgba(0, 0, 0, 0.75)',
    surfaceTintAlpha: 0.12,
  },
  level5: {
    shadow: '0 8px 12px 6px rgba(0, 0, 0, 0.7), 0 4px 4px 0 rgba(0, 0, 0, 0.8)',
    surfaceTintAlpha: 0.14,
  },

  // Game-Specific Tactile Light & Carved Shadow Tokens
  game: {
    // Carved Timber Playing Chassis (Ọpọ́n)
    chassisRim: '0 14px 32px rgba(0, 0, 0, 0.8), inset 0 2px 4px #7A4222, inset 0 -2px 6px #2A1207',
    
    // Deeply gouged circular hollows (Ihò)
    hollowCarved: 'inset 0 8px 16px rgba(0, 0, 0, 0.92), inset 0 -2px 4px rgba(92, 49, 25, 0.35)',
    
    // Elongated score storehouses (Ojú-oró)
    ojuOroCarved: 'inset 0 12px 24px rgba(0, 0, 0, 0.95), inset 0 -3px 6px rgba(92, 49, 25, 0.4)',
    
    // Natural matte seed (Ọmọ Ayò) pebble drop shadow
    seedPebbleShadow: '0 3px 6px rgba(0, 0, 0, 0.75), 0 1px 2px rgba(0, 0, 0, 0.85)',
    
    // Active playable hollow interactive pulse glow
    activePitHoverGlow: '0 0 16px rgba(232, 157, 115, 0.5), inset 0 0 8px rgba(232, 157, 115, 0.25)',
    
    // High-contrast badge elevation
    badgePill: '0 2px 4px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
    
    // Dialogue / Matchmaking Modal overlay
    gameModal: '0 24px 48px rgba(0, 0, 0, 0.9), 0 0 0 1px #352B27',
  }
} as const;

export type M3ElevationTokens = typeof m3Elevation;
