# Rule: Cultural Authenticity & Artisanal Woodcraft Design System

## Scope & Target Files
- Target: `components/AyoBoard.tsx`, `components/OmoAyo.tsx`, `components/AiDialogueBox.tsx`, `app/globals.css`, `tailwind.config.ts`

## 1. Aesthetic Identity: West African Woodcraft
The visual design must evoke hand-carved Yoruba woodcraft (*Ọpọ́n Ayò*), seasoned African iroko/mahogany hardwood, and natural *Caesalpinia bonduc* (*ṣẹ́yọ̀*) seeds.

### Strict Design Exclusions
- NO neon / cyberpunk / high-saturation plastic gradients.
- NO flat grey corporate wireframes.
- NO generic circular checkers/tokens without organic pebble texture, shading, and rotation.

## 2. Palette & Shading Tokens

| Token | Hex Range | Purpose / Physical Reference | CSS Implementation |
| :--- | :--- | :--- | :--- |
| `chassis-base` | `#23120B` to `#351A0E` | Deep African mahogany chassis | `linear-gradient(145deg, #351A0E, #23120B)` |
| `bevel-rim` | `#5C3119` to `#7A4222` | Polished timber bevel with warm amber edge highlights | `box-shadow: 0 10px 25px rgba(0,0,0,0.7), inset 0 2px 4px #7A4222` |
| `hollow-pit` | `#140A05` to `#1C0D07` | Deeply carved circular hollows (*Ihò*) | `box-shadow: inset 0 8px 16px rgba(0,0,0,0.9), inset 0 -2px 4px rgba(92,49,25,0.3)` |
| `oju-oro-bank` | `#140A05` to `#1C0D07` | Carved elongated score bins (*Ojú-oró*) | `box-shadow: inset 0 10px 20px rgba(0,0,0,0.95)` |
| `seed-base` | `#53624D` to `#414E3C` | Matte, earthy dirty-greenish *ṣẹ́yọ̀* seeds | `radial-gradient(circle at 35% 35%, #73836C 0%, #53624D 50%, #2A3326 100%)` |
| `badge-pill` | `#EAD8C7` on `#1F1008` | Minimalist contrast pill badge for seed counts $\ge 5$ | `background: #1F1008; color: #EAD8C7; border: 1px solid #5C3119;` |

## 3. Spatial Geometry & Visual Row Inversion (`components/AyoBoard.tsx`)
To preserve continuous counter-clockwise circular movement across the 2D screen:
- **North Row (Top)**: Must be visually rendered left-to-right as **`[11, 10, 9, 8, 7, 6]`**.
- **South Row (Bottom)**: Must be visually rendered left-to-right as **`[0, 1, 2, 3, 4, 5]`**.
- **Flanking Storehouses (*Ojú-oró*)**:
  - **West Flank (Left)**: North Player Storehouse (*Ojú-oró Àríwá*).
  - **East Flank (Right)**: South Player Storehouse (*Ojú-oró Gúúsù*).
  - Rendered as elongated, vertically curved wooden troughs containing a stacked pebble pile visual with an explicit numeric count badge.

## 4. DOM Performance & Seed Clustering Rules (`components/OmoAyo.tsx`)
Pits can accumulate large numbers of seeds (*ọ̀pọ̀*), up to 20+. Rendering individual SVG/DOM nodes for dozens of pebbles causes layout overflow and mobile animation stutter.

- **0 seeds**: Render an empty recessed timber hollow. **DO NOT render a "0" badge or placeholder pebble**.
- **1 to 4 seeds**: Render 1 to 4 distinct organic rounded pebbles with randomized rotational offsets (`-15deg` to `+15deg`), varied scale (`0.95` to `1.05`), and natural placement within the pit.
- **$\ge 5$ seeds**: Render a static graphical triad cluster (3 overlapping stylized pebbles) paired with a centered contrast pill badge (`#EAD8C7` on `#1F1008`) displaying the exact count. Prevents DOM bloat and layout clipping.
- **Touch Target Invariant**: Every pit hollow (*Ihò*) must maintain an interactive hit-box of at least **$48\text{px} \times 48\text{px}$** across all mobile breakpoints.
- **Interactive Feedback**: On the active player's turn, legal playable pits display a subtle warm timber pulse (`box-shadow: 0 0 12px rgba(218, 165, 32, 0.4)`). Inactive pits must not display hover pointer states.

## 5. Typography & Yoruba Cultural Diacritics
- **Primary Typography**: **Bricolage Grotesque** (`font-family: var(--md-sys-typescale-font-family)`), loaded via [design-tokens/tokens.css](file:///c:/Users/DT001/Desktop/Ayo-Olopon/design-tokens/tokens.css).
- Headings & Titles: `Bricolage Grotesque` (Bold / Semi-bold 700 / 600).
- Body & Dialogue: `Bricolage Grotesque` (Regular / Medium 400 / 500).
- Monospace / Counters: JetBrains Mono or Bricolage Grotesque numeric tabular figures.
- Yoruba diacritics must be accurately rendered:
  - *Ayò Ọlọ́pọ́n*
  - *Ọmọ Ayò*
  - *Ojú-oró*
  - *Ọ̀tá Ayò*
  - *Òwe Ayò*
  - *Fún ní Jẹ*
  - *Jẹ Tán*

## 6. Design Tokens Integration
All visual components MUST import tokens from `@/design-tokens` or consume CSS variables defined in [design-tokens/tokens.css](file:///c:/Users/DT001/Desktop/Ayo-Olopon/design-tokens/tokens.css) (Brand anchor `#140905` African Ebony, Google M3 for Games system).


