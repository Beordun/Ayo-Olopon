# Ayò Ọlọ́pọ́n Digital (Traditional Yoruba Board Game)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Google M3](https://img.shields.io/badge/Design_Tokens-Google_M3_for_Games-EAD8C7)](#design-system--aesthetics)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A culturally grounded, high-fidelity digital implementation of **Ayò Ọlọ́pọ́n**, the revered count-and-capture board game of the Yoruba people of West Africa. 

Built with Next.js (App Router), TypeScript, Tailwind CSS, and Google's Material 3 (M3) design tokens for games, this application pairs authentic West African woodworking aesthetics (*Ọpọ́n*) and natural matte seeds (*Ọmọ Ayò*) with a deterministic game engine, authoritative peer-to-peer multiplayer, and an AI Grandmaster (*Ọ̀tá Ayò*) powered by Google Gemini.

---

## 📖 Cultural Heritage & Lexicon

Ayò Ọlọ́pọ́n is celebrated for its deep mathematical strategy, social engagement, and oral tradition. In Yoruba culture, mastery of Ayò represents tactical forethought, patience, and community honor.

| Yoruba Term | Meaning & Context |
| :--- | :--- |
| **Ọpọ́n** | The hand-carved hardwood playing board (traditionally carved from mahogany or iroko). |
| **Ọmọ Ayò** | The 48 playing seeds (traditionally smooth *ṣẹ́yọ̀* seeds from *Caesalpinia bonduc*). |
| **Ihò** | The 12 carved circular hollows (6 pits per player). |
| **Ojú-oró** | The elongated score storehouses carved into the left and right flanks of the board. |
| **Tà** | Sowing seeds counter-clockwise, dropping exactly one seed per consecutive hollow. |
| **Jẹ** | Capturing — scooping seeds when the final sown seed brings an opponent's hollow to 2 or 3 seeds. |
| **Fún ní Jẹ** | Anti-starvation ("feed to eat") — a mandatory rule requiring a player to feed an empty opponent if a legal path exists. |
| **Jẹ Tán** | Grand Slam capture — capturing all newly fed seeds, legally starving the opponent and ending the match immediately. |
| **Ọ̀tá Ayò** | The AI Grandmaster opponent. |
| **Òwe Ayò** | Traditional Yoruba proverbs, philosophical commentary, and strategic taunts delivered during gameplay. |

---

## 🎮 Game Rules & Engine Mechanics

Ayò Ọlọ́pọ́n uses a 12-pit board initialized with **4 seeds in each pit** (48 total seeds):

```
                    North Territory (Player 2 / AI / Peer)
               [11]      [10]       [9]       [8]       [7]       [6]
        ┌─────────────────────────────────────────────────────────────────┐
[North  │                                                                 │  [South
 Bank   │                                                                 │   Bank
Ojú-oró]│                                                                 │  Ojú-oró]
        │       [0]       [1]       [2]       [3]       [4]       [5]     │
        └─────────────────────────────────────────────────────────────────┘
                    South Territory (Player 1 / Human / Host)
```

### 1. Sowing (*Tà*)
- Sowing proceeds strictly **counter-clockwise**: `(current_index + 1) % 12` (`0 → 1 → ... → 5 → 6 → ... → 11 → 0`).
- **Multi-Lap Origin Skipping Invariant**: If a pit contains $\ge 12$ seeds, sowing traverses more than a full lap of the board. The engine strictly skips the originating hollow on **every** pass (`if (target === originIndex) continue;`), ensuring no seed ever drops into the pit it was scooped from.

### 2. Cascading Captures (*Jẹ*)
- A capture triggers when the **last seed** of a turn lands in an **opponent hollow** and brings that hollow's count to **exactly 2 or 3 seeds**.
- The capture sweeps **backwards** in reverse sowing direction (clockwise: `(i - 1 + 12) % 12`). If the preceding pit is also in opponent territory and holds **2 or 3 seeds**, all of its seeds are captured as well. The cascade continues until a pit has $\ne 2$ and $\ne 3$ seeds (i.e. $< 2$ or $> 3$) or crosses into the active player's territory.

### 3. Anti-Starvation (*Fún ní Jẹ*)
- If all 6 pits of an opponent are empty (0 seeds), the active player **must** choose a move that deposits at least one seed into the opponent's territory, provided such a move exists.
- If no legal feeding move is possible, the game terminates immediately, and the active player sweeps all remaining seeds on the board.

### 4. Grand Slam (*Jẹ Tán*)
- If an active player feeds an empty opponent, but the final seed and cascading backward sweep capture **all** the newly placed seeds (leaving the opponent with 0 seeds), the capture stands. The opponent is legally starved with no playable seeds, and the game terminates immediately.

### 5. Termination & Victory Conditions
- **Threshold Victory**: The first player to reach **$\ge 25$ seeds** captured immediately wins.
- **Threefold Repetition**: If an identical board state hash (`board:turn`) occurs 3 times, the match terminates in a draw/sweep.
- **Low-Seed Stalemate**: If remaining board seeds drop to $\le 3$ with 10 consecutive turns without a capture, remaining seeds are swept to their home territories.

---

## ✨ Features & Game Modes

### 1. Ọ̀tá Ayò (AI Grandmaster)
- Powered by **Google Gemini** (`gemini-2.0-flash` / `gemini-1.5-flash`) via a dedicated server API route (`/api/ai-move`).
- **Strict Latency Budget**: 1,100ms `AbortController` timeout within a hard 1,200ms turn ceiling.
- **Instant Minimax Fallback**: If network latency occurs or Gemini times out, the engine seamlessly defaults to [`lib/ayo-heuristics.ts`](file:///c:/Users/DT001/Desktop/Ayo-Olopon/lib/ayo-heuristics.ts) with zero UI interruption.
- **Òwe Ayò Card**: Generates authentic Yoruba philosophical proverbs alongside tactical analysis.

### 2. Pass & Play (Local 2-Player)
- Play head-to-head on the same screen or mobile tablet, taking turns between South and North.

### 3. Peer-to-Peer Online Multiplayer
- **Authoritative Host Topology**: Player 1 creates the room as the authoritative game host; Player 2 dispatches move intents over WebRTC DataChannels.
- **Resynchronization Protocol**: Automatic recovery via `RESYNC_REQUEST` on packet loss or state desynchronization.
- **Local Tab Mirroring**: Supported via standard `BroadcastChannel` for testing multiplayer seamlessly across two browser tabs.

### 4. Artisanal Woodcraft Aesthetics
- Handcrafted African mahogany palette (`#23120B` to `#351A0E`) with warm amber bevels (`#5C3119` to `#7A4222`).
- Deep gouged circular hollows (`#140A05`) and natural matte *ṣẹ́yọ̀* seed gradients (`#53624D`).
- **DOM Clustering Optimization**: 
  - 0 seeds = recessed empty hollow (no badge clutter).
  - 1–4 seeds = randomized organic SVG pebbles with subtle rotation and natural placement.
  - $\ge 5$ seeds = stylized triad cluster with high-contrast `#EAD8C7` pill badge.

### 5. Procedural Web Audio API
- Zero external MP3/WAV dependencies.
- Synthesizes organic wood knocks on seed placement, hollow scoop sweeps, capture chimes, and victory celebration rhythms.

---

## 🛠️ Architecture & Tech Stack

```
ayo-olopon/
├── app/
│   ├── api/ai-move/route.ts      # Gemini Grandmaster API (1,200ms budget + minimax fallback)
│   ├── globals.css               # Core styling & custom animations
│   ├── layout.tsx                # Bricolage Grotesque typography & metadata
│   └── page.tsx                  # Master game coordinator, HUD & telemetry
├── components/
│   ├── AiDialogueBox.tsx         # Ọ̀tá Ayò persona card & Yoruba proverb commentary
│   ├── AyoBoard.tsx              # Carved wooden chassis, 12 hollows & 2 Ojú-oró banks
│   ├── HowToPlayModal.tsx        # Cultural rulebook and interactive visual guide
│   ├── MultiplayerModal.tsx      # WebRTC room creation, invite link & sync diagnostics
│   └── OmoAyo.tsx                # High-performance pebble clustering & DOM badges
├── design-tokens/                # Google M3 Design System for Games
│   ├── colors.ts                 # Audited African Ebony (#140905) brand palette
│   ├── elevation.ts              # Carved hollow drop-shadows & bevels
│   ├── motion.ts                 # Sowing cadence (140ms) & drop settle easing
│   ├── shapes.ts                 # Hollow radii & pebble geometry
│   ├── tokens.css                # CSS variables & Bricolage Grotesque font-face
│   └── typography.ts             # Display scales & HUD numeric styling
├── lib/
│   ├── audio.ts                  # Procedural Web Audio API sound generator
│   ├── ayo-engine.ts             # Pure deterministic game engine & invariant assertions
│   ├── ayo-heuristics.ts         # Fast offline minimax engine & proverb dictionary
│   └── multiplayer-host.ts       # Authoritative Host state machine & sync protocol
└── types/
    └── ayo.ts                    # Universal TypeScript contracts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.17 or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ayo-olopon.git
   cd ayo-olopon
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the project root:
   ```env
   # Optional: Enables full Gemini generative AI for Ọ̀tá Ayò.
   # If omitted or invalid, the game automatically uses the built-in offline minimax engine!
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🧪 Testing & Verification

The game engine is backed by a suite of automated unit tests covering all core mechanics, invariants, and edge cases:

```bash
# Run the deterministic game engine test suite with Vitest
npx vitest run lib/ayo-engine.test.ts
```

### Verified Test Cases:
- [x] Initial 48-seed conservation invariant ($\sum \text{board} + \text{scores} \equiv 48$)
- [x] Single-lap sowing counter-clockwise
- [x] Multi-lap origin skipping on hollows with $\ge 12$ seeds
- [x] Cascading backward captures (*Jẹ*)
- [x] Anti-starvation (*Fún ní Jẹ*) move filtering
- [x] Starvation deadlock resolution
- [x] Grand Slam (*Jẹ Tán*) termination
- [x] 25-seed threshold victory
- [x] Threefold repetition cycle detection

---

## 📜 Cultural Proverbs (*Òwe Ayò*)

During matches against Ọ̀tá Ayò, players receive authentic Yoruba proverbs reflecting their tactical state:

> *"Ayò là ń ta, a kì í ta ìjà."*  
> *(We play Ayò for joy and wisdom, not for war.)*

> *"Bí a bá ń ta ayò, ọgbọ́n la fi ń kọ́ ara wa."*  
> *(When we play Ayò, we teach each other wisdom.)*

> *"Ọ̀pọ̀ ọmọ ayò kò ní dandan pé a ó jẹ."*  
> *(Having many seeds in a pit does not guarantee victory; it is where they land that counts.)*

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Ẹ kú ayọ̀! (May you find joy in the game!)*
