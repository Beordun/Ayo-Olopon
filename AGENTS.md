# Ayò Ọlọ́pọ́n Digital — Master Project Directives & Governance

**Document Version:** 1.2.0 (Authoritative Engineering Blueprint)  
**Target Environment:** Google Antigravity (Next.js App Router / TypeScript / Tailwind CSS / Gemini SDK / WebRTC & Realtime Transport)

---

## 1. Cultural Identity, Nomenclature & Board Orientation

Ayò Ọlọ́pọ́n Digital is a culturally authentic, high-fidelity digital implementation of the Yoruba count-and-capture board game. The interface pairs authentic West African woodworking aesthetics (*Ọpọ́n*) and natural matte seeds (*Ọmọ Ayò*) with a deterministic game engine, authoritative host multiplayer, and an AI Grandmaster (*Ọ̀tá Ayò*).

### 1.1 Canonical Lexicon (Must Be Strictly Preserved)
- **Ọpọ́n**: The hand-carved wooden playing chassis.
- **Ọmọ Ayò**: The playing seeds / counters (traditionally *ṣẹ́yọ̀* from *Caesalpinia bonduc*).
- **Ihò**: The 12 circular playing hollows (6 pits per player).
- **Ojú-oró**: The score banks / storehouses carved at the left and right ends of the board.
- **Tà**: Sowing seeds counter-clockwise, dropping exactly one seed per consecutive hollow.
- **Jẹ**: Capturing 2 or 3 seeds in an opponent's hollow.
- **Fún ní Jẹ**: Anti-starvation rule ("feed to eat"). A player must pass seeds to an empty opponent if a legal feeding move exists.
- **Jẹ Tán**: Grand Slam capture — capturing all newly fed seeds. If this leaves the opponent with 0 seeds, the capture stands and the game terminates immediately.
- **Ọ̀tá Ayò**: The Gemini-powered AI Grandmaster opponent.
- **Òwe Ayò**: Authentic Yoruba proverbs and strategic taunts delivered by Ọ̀tá Ayò.

### 1.2 Coordinate System & Visual Board Geometry
The board consists of a flat 12-integer array `board[0..11]`. *Ojú-oró* score banks are maintained in a separate object `{ south: number, north: number }` and are NEVER included in the 12-pit array.

```
                    North Territory (Player 2 / AI / Remote Peer)
               [11]      [10]       [9]       [8]       [7]       [6]
        ┌─────────────────────────────────────────────────────────────────┐
[North  │                                                                 │  [South
 Bank   │                                                                 │   Bank
Ojú-oró]│                                                                 │  Ojú-oró]
        │       [0]       [1]       [2]       [3]       [4]       [5]     │
        └─────────────────────────────────────────────────────────────────┘
                    South Territory (Player 1 / Human / Local Host)
```

- **South Territory (Player 1)**: Indices `0, 1, 2, 3, 4, 5` (Bottom row, indexed left-to-right `0 → 5`).
- **North Territory (Player 2)**: Indices `6, 7, 8, 9, 10, 11` (Top row, visually displayed left-to-right as `11, 10, 9, 8, 7, 6` to preserve continuous counter-clockwise circular flow).
- **Sowing Trajectory**: Strictly counter-clockwise: `(current_index + 1) % 12` (`0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 0...`).

---

## 2. Canonical Game Engine Specification (`lib/ayo-engine.ts`)

The game engine must be a pure, deterministic, side-effect-free functional module with immutable state updates.

### 2.1 Initial Board Setup
- `board`: `[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]` (48 total seeds).
- `scores`: `{ south: 0, north: 0 }`.
- `currentTurn`: `'south'`.
- `isGameOver`: `false`.
- `winner`: `null`.
- `moveHistoryHash`: `[]`.
- `zeroCaptureTurnCount`: `0`.

### 2.2 Sowing Execution (*Tà*) & Full-Lap Exclusion
1. The active player picks all seeds from one non-empty pit on their side:
   - South: index $\in [0, 5]$ where `board[index] > 0`.
   - North: index $\in [6, 11]$ where `board[index] > 0`.
2. The chosen pit is cleared to 0 seeds.
3. Seeds are distributed one-by-one counter-clockwise: `target_index = (current_index + 1) % 12`.
4. **Full-Lap Exclusion Invariant**:
   - If the picked pit contained $\ge 12$ seeds, sowing traverses more than a full circuit of the board.
   - **The originating pit MUST be skipped on EVERY lap**. No seed may ever be dropped into the hollow it was picked from on that turn. Sowing skips over the starting pit to `(origin + 1) % 12`.

### 2.3 Cascading Backward Captures (*Jẹ*)
1. A capture triggers if and only if:
   - The final sown seed lands in an **opponent hollow** (for South: lands in `[6..11]`; for North: lands in `[0..5]`).
   - The arrival of this final seed brings that hollow's total to **exactly 2 or 3 seeds**.
2. **Cascading Backward Sweep**:
   - The engine inspects contiguous predecessor pits in reverse sowing direction: `prev_index = (index - 1 + 12) % 12`.
   - If the predecessor pit is also in **opponent territory** AND currently holds **exactly 2 or 3 seeds**, its seeds (2 or 3) are also scooped.
   - The cascade continues backwards until a pit contains $\ne 2$ and $\ne 3$ seeds or crosses into the active player's territory.
3. All scooped seeds are credited directly to `scores[currentTurn]`.

### 2.4 Anti-Starvation (*Fún ní Jẹ*) & Starvation Victory
1. **Feeding Requirement**: If all 6 pits of the opponent contain 0 seeds, the active player **must** choose a move that deposits at least one seed into the opponent's territory, provided such a move exists.
2. **Move Filtering**: `getLegalMoves(state, player)` must return ONLY the subset of pits that deposit $\ge 1$ seed across the territory line when the opponent is at 0 seeds.
3. **No Legal Feeding Move**: If the opponent has 0 seeds and the active player has no move capable of reaching the opponent's side:
   - The game terminates immediately.
   - All remaining seeds on the board are claimed by the active player: `scores[currentTurn] += sum(board)`.
   - `board.fill(0)`.
   - Winner is decided by final score.

### 2.5 Grand Slam Resolution (*Jẹ Tán*)
- If an active player makes a legal feeding move into an empty opponent's side, and the final seed and subsequent backward cascades capture **all** the newly placed seeds (leaving the opponent with 0 seeds after the move resolves):
  - **The capture stands**.
  - The opponent has been legally starved with no playable pieces remaining.
  - The game terminates immediately.
  - All remaining seeds on the board are swept into the active player's bank: `scores[activePlayer] += sum(board)`.
  - `board.fill(0)`.

### 2.6 Game Termination, Cycle Detection & Stalemate
A game ends upon reaching any of the following terminal states:
1. **Threshold Victory**: A player reaches $\ge 25$ captured seeds. The game terminates immediately; that player wins.
2. **Threefold Repetition**:
   - The engine appends a rolling hash string to `moveHistoryHash` after each move: `"${board.join(',')}:${currentTurn}"`.
   - If any identical state hash appears **3 times**, the game terminates immediately.
3. **Low-Seed Stalemate**:
   - If total seeds remaining on the board drop to $\le 3$ ($\sum_{i=0}^{11} \text{board}[i] \le 3$) and `zeroCaptureTurnCount >= 10`, the game terminates immediately.
4. **Endgame Seed Sweep Protocol**:
   - Upon termination by **Threefold Repetition** or **Low-Seed Stalemate**:
     - All remaining seeds on the South side (`0..5`) are awarded to South: `scores.south += sum(board[0..5])`.
     - All remaining seeds on the North side (`6..11`) are awarded to North: `scores.north += sum(board[6..11])`.
     - `board.fill(0)`.
     - Winner is the player with the highest total score (or `'draw'` if scores are 24-24).

---

## 3. Universal TypeScript Contracts (`types/ayo.ts`)

Every module, component, and route handler must import and strictly adhere to these interfaces:

```typescript
export type PlayerSide = 'south' | 'north';

export interface GameState {
  board: number[];              // Length 12 array of pit counts [0..11]
  scores: {
    south: number;              // Captured seeds in South Ojú-oró
    north: number;              // Captured seeds in North Ojú-oró
  };
  currentTurn: PlayerSide;
  isGameOver: boolean;
  winner: PlayerSide | 'draw' | null;
  moveHistoryHash: string[];    // Rolling history hashes ("b0,b1...b11:turn")
  zeroCaptureTurnCount: number; // Counter for consecutive turns without a capture
  lastMove?: {
    player: PlayerSide;
    pitIndex: number;
    capturedSeeds: number;
  };
}

export interface AIMoveRequest {
  board: number[];              // 12-integer array
  scores: { south: number; north: number };
  currentTurn: 'north';
  legalMoves: number[];         // Pre-filtered subset of [6..11]
}

export interface AIMoveResponse {
  selected_pit: number;         // Guaranteed legal index between 6 and 11
  tactical_reasoning: string;   // Strategic breakdown
  yoruba_proverb_taunt: string; // Authentic Yoruba proverb with cultural context
}

export type NetworkMessageType = 
  | 'MOVE_ACTION' 
  | 'STATE_SYNC' 
  | 'RESYNC_REQUEST' 
  | 'FORFEIT';

export interface NetworkMessage {
  type: NetworkMessageType;
  moveId?: number;              // Strictly incrementing sequence number
  pitIndex?: number;            // [0..5] for South, [6..11] for North
  state?: GameState;            // Authoritative snapshot from Host
  sender: PlayerSide;
}
```

---

## 4. Non-Negotiable Architectural Invariants

### Invariant 1: 48-Seed Conservation & Turn Rollback
$$\sum_{i=0}^{11} \text{board}[i] + \text{scores.south} + \text{scores.north} \equiv 48$$
- Must be asserted before and after every move execution in `lib/ayo-engine.ts`.
- If an invariant mismatch occurs:
  1. Discard the invalid state immediately.
  2. Revert to the pre-move snapshot taken at the start of the turn.
  3. Emit a user warning: *"Invalid move state detected. Turn reset."*
  4. In multiplayer mode, the client dispatches a `RESYNC_REQUEST`.

### Invariant 2: Authoritative Host Multiplayer Topology
- **Host (Player 1 / South / Room Creator)**:
  - Serves as the sole authoritative engine.
  - Maintains the master game state, validates all moves, executes captures, checks invariants, increments `moveId`, and broadcasts `STATE_SYNC`.
- **Client (Player 2 / North / Joiner)**:
  - Dispatches move intents only: `{ type: 'MOVE_ACTION', pitIndex, moveId, sender: 'north' }`.
  - NEVER mutates game state locally until an authoritative `STATE_SYNC` packet is received.
- **Resynchronization Protocol**:
  - If Client detects $\sum \text{board} + \text{scores} \ne 48$ or receives an out-of-order `moveId`, Client dispatches `{ type: 'RESYNC_REQUEST', sender: 'north' }`.
  - Host immediately retransmits the full authoritative `GameState` snapshot.
- **Transport & Latency**: WebRTC DataChannels (with STUN/TURN fallback) or ephemeral realtime broadcast channel. Round-trip move sync must complete within $\le 80\text{ms}$.

### Invariant 3: Gemini AI Latency & Minimax Fallback Budget
- Server route `app/api/ai-move/route.ts` must enforce a hard abort timeout of **$1,100\text{ms}$** with a total turn budget of **$1,200\text{ms}$**.
- `GEMINI_API_KEY` must NEVER be exposed to client-side bundles.
- **Candidate Pre-Filtering**: The caller passes pre-filtered `legalMoves: number[]` (indices 6..11).
- **Output Validation**: If Gemini fails, times out, or hallucinates an index outside `legalMoves`, the route immediately executes `lib/ayo-heuristics.ts` and returns the top heuristic move with zero UI hang.
- **Minimax Heuristic Evaluation Weights (`lib/ayo-heuristics.ts`)**:
  1. Priority 1 (Score: +100 per seed): Immediate capture yield (2 or 3 seeds per hollow).
  2. Priority 2 (Score: +50): Defusing opponent threats (vulnerable pits with 1 or 2 seeds on South's side).
  3. Priority 3 (Score: +30): Protecting friendly accumulator hollows ($\ge 10$ seeds).
  4. Priority 4 (Score: +20): Preserving legal mobility and fulfilling anti-starvation obligations.

### Invariant 4: Security, Credential Protection & Secret Leak Prevention (`.agents/rules/security-credential-protection.md`)
- **Zero Secrets Committed**: Under no circumstances may an agent, developer, or workflow stage, commit, log, or push sensitive credentials to GitHub or remote git remotes.
- **Protected Secrets**: API keys (`GEMINI_API_KEY`), database connection strings, database passwords, private keys (`.pem`, `.key`, `id_rsa`), certificates, and service account keys (`*.json`).
- **Storage & Boundary**: All secrets must reside exclusively in `.env.local` or host environment variables, never hardcoded in source code or client bundles.
- **Pre-Push Inspection**: Before any `git push` or `git add`, inspect `git status` to verify no secret-bearing file is staged. Strict `.gitignore` rules must be maintained.

---

## 5. Visual & Interaction Design System

### 5.1 Artisanal Palette & Shading Tokens

| Element | Hex Range | CSS Implementation | Physical Material |
| :--- | :--- | :--- | :--- |
| **Ọpọ́n Chassis** | `#23120B` to `#351A0E` | `background: linear-gradient(145deg, #351A0E, #23120B)` | Aged African iroko/mahogany hardwood |
| **Bevel & Rim** | `#5C3119` to `#7A4222` | `box-shadow: 0 10px 25px rgba(0,0,0,0.7), inset 0 2px 4px #7A4222` | Polished timber rim with warm amber bevels |
| **Hollows (*Ihò*)** | `#140A05` to `#1C0D07` | `box-shadow: inset 0 8px 16px rgba(0,0,0,0.9), inset 0 -2px 4px rgba(92,49,25,0.3)` | Deeply gouged circular hollows |
| **Ojú-oró Banks** | `#140A05` to `#1C0D07` | `box-shadow: inset 0 10px 20px rgba(0,0,0,0.95)` | Elongated carved storage bins at board ends |
| **Ọmọ Ayò (Seed)** | `#53624D` to `#414E3C` | `radial-gradient(circle at 35% 35%, #73836C 0%, #53624D 50%, #2A3326 100%)` | Natural matte *ṣẹ́yọ̀* seeds (*Caesalpinia bonduc*) |
| **Seed Badge** | `#EAD8C7` on `#1F1008` | `background: #1F1008; color: #EAD8C7; border: 1px solid #5C3119` | High-contrast pill badge for large seed counts |

### 5.2 DOM Clustering & Seed Rendering Rules (`components/OmoAyo.tsx`)
- **0 seeds**: Render an empty recessed hollow. Do NOT render a `0` badge or placeholder pebble.
- **1 to 4 seeds**: Render 1 to 4 distinct organic pebble SVGs with randomized rotational offsets (`-15deg` to `+15deg`), varied scale (`0.95` to `1.05`), and natural placement within the pit.
- **$\ge 5$ seeds**: Render a static graphical triad cluster (3 overlapping stylized pebbles) accompanied by a centered numerical contrast pill badge displaying the exact count. Prevents DOM bloat, layout clipping, and mobile animation stutter.
- **Touch Target Invariant**: Every pit hollow (*Ihò*) must maintain an interactive hit-box of at least **$48\text{px} \times 48\text{px}$** across all mobile breakpoints.

---

## 6. Directory Structure & File Manifest

```
ayo-olopon/
├── app/
│   ├── api/ai-move/route.ts      # Gemini Grandmaster API route (1,200ms timeout budget)
│   ├── layout.tsx                # Typography (Bricolage Grotesque) and root metadata
│   └── page.tsx                  # Main game coordinator and mode switcher
├── components/
│   ├── AyoBoard.tsx              # Carved wooden chassis, 12 hollows, and 2 Ojú-oró banks
│   ├── OmoAyo.tsx                # Seed clustering (<5 pebbles vs triad + badge)
│   ├── AiDialogueBox.tsx         # Grandmaster proverbs, taunts & tactical rationale
│   └── MultiplayerModal.tsx      # Room creation, WebRTC peer handshake & sync badges
├── design-tokens/                # Google M3 Design System for Games (Brand: #140905 African Ebony)
│   ├── colors.ts                 # M3 tonal palettes, semantic surface tiers
│   ├── typography.ts             # Bricolage Grotesque type scales & HUD counts
│   ├── elevation.ts              # M3 elevation levels + carved hollow & bevel shadows
│   ├── shapes.ts                 # M3 corner scales + circular pits & pebble shapes
│   ├── motion.ts                 # M3 easing curves + sowing animation timing
│   ├── tokens.css                # CSS custom properties (@import Bricolage Grotesque)
│   ├── index.ts                  # Unified TypeScript exports
│   └── design-system.md          # Architectural guide for M3 games system
├── lib/
│   ├── ayo-engine.ts             # Deterministic engine, invariant validation, captures
│   ├── ayo-heuristics.ts         # Fast offline minimax engine for fallback & safety
│   └── multiplayer-host.ts       # Authoritative Host state machine & sync protocol
└── types/
    └── ayo.ts                    # Universal TypeScript interfaces
```
