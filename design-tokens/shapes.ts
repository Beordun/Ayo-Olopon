/**
 * Material 3 (M3) Shape System for Games — Ayò Ọlọ́pọ́n Digital
 *
 * Implements M3 shape family scales combined with organic West African
 * pebble geometry and circular pit hollows.
 */

export const m3Shapes = {
  // M3 Standard Shape Family Radii
  corner: {
    none: '0px',
    extraSmall: '4px',
    small: '8px',
    medium: '12px',
    large: '16px',
    extraLarge: '28px',
    full: '9999px',
  },

  // Game-Specific Tactile Shapes
  game: {
    // Carved Timber Chassis Outer Bevel
    boardChassis: '28px',
    
    // Circular Pit Hollows (Ihò)
    pitHollow: '50%',
    
    // Elongated Oval Storehouses (Ojú-oró)
    ojuOroBank: '40px',
    
    // Organic Rounded Pebble (Ṣẹ́yọ̀ seed variations)
    pebbleOrganicVariant1: '48% 52% 55% 45% / 52% 47% 53% 48%',
    pebbleOrganicVariant2: '53% 47% 49% 51% / 46% 54% 46% 54%',
    pebbleOrganicVariant3: '46% 54% 52% 48% / 54% 46% 54% 46%',
    
    // Numeric Count Pill Badge
    countBadgePill: '9999px',
    
    // Minimum Accessible Touch Hit-Box Invariant
    touchTargetMin: '48px',
    
    // Modal Cards & Turn Badges
    modalCard: '20px',
  }
} as const;

export type M3ShapeTokens = typeof m3Shapes;
