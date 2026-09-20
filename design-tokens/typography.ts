/**
 * Material 3 (M3) Typography System for Games — Ayò Ọlọ́pọ́n Digital
 * Primary Font Family: 'Bricolage Grotesque', system-ui, sans-serif
 *
 * Implements the standard M3 Type Scale adapted for game viewports, HUD telemetry,
 * and high-legibility Yoruba diacritics.
 */

export const m3Typography = {
  fontFamily: {
    brand: "'Bricolage Grotesque', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // Font weights available in Bricolage Grotesque variable font
  weight: {
    extralight: '200',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // M3 Canonical Type Scale adapted for Game Interfaces
  scale: {
    displayLarge: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '700',
      fontSize: '3.5rem', // 56px
      lineHeight: '4rem', // 64px
      letterSpacing: '-0.025em',
    },
    displayMedium: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '700',
      fontSize: '2.8125rem', // 45px
      lineHeight: '3.25rem', // 52px
      letterSpacing: '-0.02em',
    },
    displaySmall: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '600',
      fontSize: '2.25rem', // 36px
      lineHeight: '2.75rem', // 44px
      letterSpacing: '-0.015em',
    },
    headlineLarge: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '600',
      fontSize: '2rem', // 32px
      lineHeight: '2.5rem', // 40px
      letterSpacing: '0',
    },
    headlineMedium: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '600',
      fontSize: '1.75rem', // 28px
      lineHeight: '2.25rem', // 36px
      letterSpacing: '0',
    },
    headlineSmall: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '500',
      fontSize: '1.5rem', // 24px
      lineHeight: '2rem', // 32px
      letterSpacing: '0',
    },
    titleLarge: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '600',
      fontSize: '1.375rem', // 22px
      lineHeight: '1.75rem', // 28px
      letterSpacing: '0',
    },
    titleMedium: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '600',
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem', // 24px
      letterSpacing: '0.015em',
    },
    titleSmall: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '500',
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      letterSpacing: '0.01em',
    },
    bodyLarge: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '400',
      fontSize: '1rem', // 16px
      lineHeight: '1.5rem', // 24px
      letterSpacing: '0.03em',
    },
    bodyMedium: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '400',
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      letterSpacing: '0.025em',
    },
    bodySmall: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '400',
      fontSize: '0.75rem', // 12px
      lineHeight: '1rem', // 16px
      letterSpacing: '0.04em',
    },
    labelLarge: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '600',
      fontSize: '0.875rem', // 14px
      lineHeight: '1.25rem', // 20px
      letterSpacing: '0.01em',
    },
    labelMedium: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '600',
      fontSize: '0.75rem', // 12px
      lineHeight: '1rem', // 16px
      letterSpacing: '0.05em',
    },
    labelSmall: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '500',
      fontSize: '0.6875rem', // 11px
      lineHeight: '1rem', // 16px
      letterSpacing: '0.05em',
    },

    // Game Specific M3 Extensions
    gameScoreBadge: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '800',
      fontSize: '1.5rem', // 24px
      lineHeight: '1.5rem',
      letterSpacing: '-0.02em',
    },
    gamePitCountPill: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '700',
      fontSize: '0.8125rem', // 13px
      lineHeight: '1rem',
      letterSpacing: '0.02em',
    },
    gameProverbTaunt: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '500',
      fontStyle: 'italic',
      fontSize: '1rem',
      lineHeight: '1.625rem',
      letterSpacing: '0.015em',
    },
    gameTurnIndicator: {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      weight: '700',
      fontSize: '0.9375rem',
      lineHeight: '1.25rem',
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
    }
  }
} as const;

export type M3TypographyTokens = typeof m3Typography;
