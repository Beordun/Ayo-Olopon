/**
 * Material 3 (M3) Motion & Micro-Animation System for Games — Ayò Ọlọ́pọ́n Digital
 *
 * Implements M3 Emphasized & Standard Easing curves adapted for tactile physical sowing,
 * pebble drop bounces, cascading backward capture sweeps, and dialogue reveals.
 */

export const m3Motion = {
  // Canonical M3 Easing Curves
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
    standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
    pebbleBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Elastic tactile drop
  },

  // M3 Durations
  duration: {
    short1: '50ms',
    short2: '100ms',
    short3: '150ms',
    short4: '200ms',
    medium1: '250ms',
    medium2: '300ms',
    medium3: '350ms',
    medium4: '400ms',
    long1: '450ms',
    long2: '500ms',
    long3: '550ms',
    long4: '600ms',
    extraLong1: '700ms',
    extraLong2: '800ms',
    extraLong3: '900ms',
    extraLong4: '1000ms',
  },

  // Game-Specific Choreography Timings
  game: {
    // Sowing distribution interval per consecutive hollow
    sowPebbleStep: '140ms',
    
    // Pebble landing settling bounce
    seedDropSettle: '220ms',
    
    // Cascading backward capture scoop sweep into Ojú-oró storehouse
    captureScoopFly: '480ms',
    
    // Active playable hollow amber breath pulse
    activeHollowPulse: '2200ms',
    
    // AI Grandmaster dialogue bubble entrance
    dialogueReveal: '320ms',
    
    // Turn change indicator slide
    turnIndicatorSlide: '280ms',
  }
} as const;

export type M3MotionTokens = typeof m3Motion;
