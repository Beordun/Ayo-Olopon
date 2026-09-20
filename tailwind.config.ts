import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './design-tokens/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ayo: {
          brand: '#140905',
          surface: '#100805',
          surfaceContainer: '#1D110B',
          surfaceBright: '#261710',
          chassis: '#23120B',
          chassisHighlight: '#351A0E',
          bevel: '#5C3119',
          bevelHighlight: '#7A4222',
          hollow: '#140A05',
          seed: '#53624D',
          seedHighlight: '#73836C',
          seedShadow: '#2A3326',
          badgeBg: '#1F1008',
          badgeText: '#EAD8C7',
          amberGlow: 'rgba(232, 157, 115, 0.55)',
        },
      },
      fontFamily: {
        brand: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        chassis: '0 14px 32px rgba(0, 0, 0, 0.8), inset 0 2px 4px #7A4222, inset 0 -2px 6px #261205',
        hollow: 'inset 0 8px 16px rgba(0, 0, 0, 0.92), inset 0 -2px 4px rgba(92, 49, 25, 0.35)',
        ojuOro: 'inset 0 12px 24px rgba(0, 0, 0, 0.95), inset 0 -3px 6px rgba(92, 49, 25, 0.4)',
        seed: '0 3px 6px rgba(0, 0, 0, 0.75), 0 1px 2px rgba(0, 0, 0, 0.85)',
        activeGlow: '0 0 16px rgba(232, 157, 115, 0.55), inset 0 0 8px rgba(232, 157, 115, 0.25)',
      },
      animation: {
        'seed-pulse': 'seedPulse 2.2s cubic-bezier(0.2, 0, 0, 1) infinite',
      },
      keyframes: {
        seedPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(232, 157, 115, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(232, 157, 115, 0.7), inset 0 0 10px rgba(232, 157, 115, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
