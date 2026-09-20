# Google Material 3 (M3) Design System for Games: Ayò Ọlọ́pọ́n Digital

This directory houses the design tokens and structural guidelines implementing the **Google Material 3 (M3) Design System for Games**, configured with:
- **Optimized Brand Seed / Canvas Anchor**: `#140905` (**African Ebony Timber Noir**)
  *(Upgraded from cold neutral `#111010` to eliminate chromatic desaturation and restore optical depth to carved timber hollows)*
- **Primary Typography**: **Bricolage Grotesque** (Google Fonts variable font)

---

## 1. Color Audit: Why `#140905` Replaced `#111010`

### 1.1 The Chromatic & Luminance Clash of `#111010`
A strict colorimetric audit of `#111010` against canonical Ayò woodworking colors revealed three severe aesthetic failure modes:

1. **Achromatic Cold Asphalt vs. Warm Organic Hardwood**:
   - `#111010` has a Hue of $0^\circ$ and Saturation of only $3\%$. It is virtually pure neutral grey/asphalt.
   - The mahogany chassis (`#23120B`) and amber bevels (`#7A4222`) have a warm orange-red wood Hue of $18^\circ - 22^\circ$ with $52\% - 60\%$ saturation.
   - Placing warm African timber on a cold neutral black background induces simultaneous contrast distortion: the wood appears artificially muddy or synthetic, violating PRD Section 3.
2. **Depth Flattening in Carved Hollows**:
   - The carved pit cavities are `#140A05` (Luminance $L \approx 4.9\%$).
   - The `#111010` canvas has Luminance $L \approx 6.5\%$ (Contrast ratio only **1.1:1**).
   - Because the background and hollows shared near-identical luminance with opposing undertones, the board lost its carved sculptural depth; hollows appeared flat rather than deeply gouged into wood.
3. **M3 Tonal Palette Pollution**:
   - M3 generates neutral surfaces from the brand seed. A desaturated `#111010` produced sterile corporate grey card surfaces (`#272424`, `#443F3F`), diluting the West African artisan atmosphere.

### 1.2 The Solution: `#140905` (African Ebony Timber Noir)
- **Hue**: $19.5^\circ$ — Harmonically identical to mahogany ($18^\circ$), iroko ($20^\circ$), and amber ($22^\circ$).
- **Saturation**: $55\%$ — Infuses the deepest dark tones with rich, living hardwood undertones.
- **Luminance**: $4.1\%$ — Deep enough to allow the board chassis (`#23120B`, $L=9\%$) and amber rim (`#5C3119`, $L=23\%$) to pop with natural ambient warmth.

---

## 2. Tonal Palettes Overview

| M3 Role | Hex Code | Visual & Material Equivalent |
| :--- | :--- | :--- |
| **Brand Seed** | `#140905` | African Ebony Timber Noir anchor |
| **`surface`** | `#100805` | Deep warm ebony game canvas |
| **`surfaceContainerLow`** | `#170D08` | Board chassis resting platter |
| **`surfaceContainer`** | `#1D110B` | Interactive chassis tray |
| **`surfaceContainerHigh`**| `#261710` | HUD score cards & AI dialogue boxes |
| **`secondaryContainer`** | `#5C3119` | Polished timber bevel rim |
| **`onSecondaryContainer`**| `#7A4222` | Warm amber edge highlights |
| **`tertiaryContainer`**  | `#414E3C` | Matte *Caesalpinia bonduc* (*ṣẹ́yọ̀*) seed base |
| **`tertiary` (Highlight)**| `#73836C` | Mineral chalk seed highlight |
| **`neutralVariant95`**   | `#EAD8C7` | High-contrast numeric count pill badge text |
| **`activeGlow`**         | `rgba(232, 157, 115, 0.55)` | Warm amber state glow for interactive pits |

---

## 3. Typography System: Bricolage Grotesque

**Bricolage Grotesque** is configured across the entire M3 scale:
- Headings & Titles: 700 / 600 weight with tight tracking.
- Body & Tactical Rationale: 400 / 500 weight with high-legibility Yoruba diacritics.
- HUD Counters: Tabular figures with bold optical clarity.

---

## 4. Usage in Code

### In CSS (`app/globals.css`):
```css
@import '../design-tokens/tokens.css';

body {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font-family: var(--md-sys-typescale-font-family);
}
```

### In TypeScript / React Components:
```typescript
import { designTokens } from '@/design-tokens';

const Hollow = () => {
  return (
    <div
      style={{
        backgroundColor: designTokens.colors.sys.gameHollowInset,
        boxShadow: designTokens.elevation.game.hollowCarved,
        borderRadius: designTokens.shapes.game.pitHollow,
        minWidth: designTokens.shapes.game.touchTargetMin,
        minHeight: designTokens.shapes.game.touchTargetMin,
      }}
    />
  );
};
```

---

## 5. Physical Gesture Language & Tutorial Assets (M3 Game Onboarding)

In the Google M3 Design System for Games, real-world physical manipulations are formally codified under **Gesture Language & Onboarding Affordances**.

### 5.1 Physical Sowing (*Tà*) Reference Standard
- **The Physical Gesture**: In traditional Ayò, a player scoops all seeds from a starting hollow with cupped fingers and distributes them counter-clockwise, dropping **exactly one seed per hollow** through a rhythmic finger-release motion.
- **Digital Translation Tokens**:
  - **Sowing Cadence**: `140ms` per hollow (`designTokens.motion.game.sowPebbleStep`).
  - **Landing Impact**: Elastic settling bounce `220ms` (`designTokens.motion.game.seedDropSettle` with `pebbleBounce` easing).
  - **Texture Baseline**: Seeds must visually match the matte, earthy *Caesalpinia bonduc* (*ṣẹ́yọ̀*) natural pebbles shown in physical demonstration photography.
- **Usage in Application**:
  - Embedded in the **"How to Play" (Bí a ṣe ń tà'yò)** onboarding modal.
  - Serves as the visual reference anchor for SVG animation and future 3D/canvas rendering.

