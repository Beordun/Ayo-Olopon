/**
 * Material 3 (M3) Color System for Games — Ayò Ọlọ́pọ́n Digital
 * Optimized Brand Seed: #140905 (African Ebony Timber Noir)
 *
 * Replaces cold neutral #111010 to eliminate chromatic desaturation and depth flattening.
 * Harmonizes with canonical mahogany chassis (#23120B), amber bevels (#7A4222),
 * and gouged hollows (#140A05).
 */

export const m3Colors = {
  // Brand Baseline Seed: Warm African Ebony Hardwood
  seed: '#140905',

  // Primary Palette: Warm Timber Obsidian & Aged Mahogany Tiers
  primary: {
    0: '#000000',
    10: '#140905', // Brand Anchor (Deep African Ebony)
    20: '#23120B', // Canonical Ọpọ́n Chassis Base
    30: '#351A0E', // Chassis Highlight Platter
    40: '#4D2715',
    50: '#67361E',
    60: '#844729',
    70: '#A25936',
    80: '#C26D44',
    90: '#E18455',
    95: '#F5A77E',
    99: '#FCEDE6',
    100: '#FFFFFF',
  },

  // Secondary Palette: Polished Amber Timber & Bevel Highlights
  secondary: {
    10: '#261205',
    20: '#3D1C08',
    30: '#5C3119', // Canonical Bevel Rim Base
    40: '#7A4222', // Canonical Amber Edge Highlight
    50: '#99542D',
    60: '#B8683A',
    70: '#D77D49',
    80: '#E89D73', // Interactive M3 Button & Glow Accent
    90: '#F5C6AA',
    95: '#FCE2D4',
    100: '#FFFFFF',
  },

  // Tertiary Palette: Natural Caesalpinia bonduc (Ṣẹ́yọ̀) Seed Greens
  tertiary: {
    10: '#151C13',
    20: '#2A3326', // Deep Seed Pebble Shadow
    30: '#414E3C', // Matte Seed Base
    40: '#53624D', // Canonical Ọmọ Ayò Green
    50: '#64765E',
    60: '#73836C', // Mineral Chalk Highlight
    70: '#8E9F86',
    80: '#A9BAA1',
    90: '#C5D6BD',
    95: '#E2F3D9',
    100: '#FFFFFF',
  },

  // Neutral: Warm Hardwood Charcoal (Prevents cold-grey sterile desaturation)
  neutral: {
    0: '#000000',
    4: '#0A0604', // Deepest Ambient Backdrop
    6: '#100805', // Main Viewport Canvas (Ultra-Deep Ebony)
    10: '#170D08',
    12: '#1D110B',
    17: '#261710', // Elevated HUD Panel Platter
    20: '#2C1B13',
    30: '#422C21',
    40: '#5B3E31',
    50: '#755243',
    60: '#906756',
    70: '#AC7F6C',
    80: '#C89783',
    90: '#E5B19D',
    95: '#F6D2C4',
    100: '#FFFFFF',
  },

  // Neutral Variant: Carved Borders, Insets, Badges & Diacritics
  neutralVariant: {
    10: '#1B110B',
    20: '#2F1F17',
    30: '#453026',
    40: '#5D4336',
    50: '#775747',
    60: '#926D5B',
    70: '#AE8571',
    80: '#CAA08B',
    90: '#E7BDAB',
    95: '#EAD8C7', // Canonical Numeric Pill Badge Text
    100: '#FFFFFF',
  },

  // Error & Warning (Starvation Alert / Invariant Breach)
  error: {
    10: '#410002',
    20: '#690005',
    30: '#93000A',
    40: '#BA1A1A',
    80: '#FFB4AB',
    90: '#FFDAD6',
    100: '#FFFFFF',
  },

  // Semantic M3 Surface Roles (Harmonized for Dark Immersive Game Mode)
  sys: {
    surface: '#100805',                     // Deep Warm Ebony Canvas (Replaces sterile #111010)
    surfaceDim: '#0A0604',                  // Deepest Underlay
    surfaceBright: '#261710',               // Elevated HUD Panel
    surfaceContainerLowest: '#0D0704',      // Deepest Inset Cavity
    surfaceContainerLow: '#170D08',         // Board Base Platter
    surfaceContainer: '#1D110B',            // Interactive Chassis Tray
    surfaceContainerHigh: '#261710',        // Card / Dialog Modal
    surfaceContainerHighest: '#331F16',     // Tooltip / High-Contrast Pill
    onSurface: '#F6D2C4',                   // Primary Text with warm bone undertone
    onSurfaceVariant: '#CAA08B',            // Secondary Subtitles & Diacritics
    outline: '#5C3119',                     // Carved Hardwood Bevel Rim
    outlineVariant: '#3D1C08',              // Subtle Separators & Inset Borders
    
    // M3 Color Actions
    primary: '#E18455',                     // Warm Amber-Mahogany Primary
    onPrimary: '#23120B',
    primaryContainer: '#4D2715',
    onPrimaryContainer: '#FCEDE6',

    secondary: '#E89D73',                   // Golden Amber Interactive Accent
    onSecondary: '#261205',
    secondaryContainer: '#5C3119',
    onSecondaryContainer: '#FCE2D4',

    tertiary: '#A9BAA1',                    // Seed Sage Green Indicator
    onTertiary: '#2A3326',
    tertiaryContainer: '#414E3C',
    onTertiaryContainer: '#E2F3D9',

    // Canonical Game-Specific Semantics (PRD & AGENTS.md Conforming)
    gameBoardChassis: '#23120B',
    gameBoardChassisHighlight: '#351A0E',
    gameHollowInset: '#140A05',
    gameOjuOroBank: '#140A05',
    gameSeedBase: '#53624D',
    gameSeedHighlight: '#73836C',
    gameSeedBadgeBg: '#1F1008',
    gameSeedBadgeText: '#EAD8C7',
    gameActivePulseGlow: 'rgba(232, 157, 115, 0.55)', // Warm Amber M3 State Glow
  }
} as const;

export type M3ColorTokens = typeof m3Colors;
