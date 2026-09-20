# Product Requirements Document (PRD)

**Product Name:** Ayò Ọlọ́pọ́n Digital  
**Document Version:** 1.1.0 (Post-Review Engineering Baseline)  
**Status:** Approved for Implementation  
**Target Environment:** Google Antigravity (Next.js / TypeScript / Tailwind CSS / Gemini SDK / Realtime Transport)

## 1. Executive Summary & Product Vision

Ayò Ọlọ́pọ́n Digital is a high-fidelity, culturally authentic web implementation of the traditional Yoruba count-and-capture board game. Built for cross-platform accessibility, it pairs artisanal West African woodworking aesthetics—specifically aged hardwood (_Ọpọ́n_) and natural matte seeds (_Ọmọ Ayò_)—with robust digital game architecture:

1. A deterministic, finite-state rule engine with cycle detection and invariant rollback.
2. Low-friction multiplayer using an Authoritative Host network topology over WebRTC/Realtime channels.
3. An AI Grandmaster (_Ọ̀tá Ayò_) powered by Google Gemini for contextual proverbs and psychological taunting, backed by a deterministic minimax validation layer.

---

## 2. Target Audience & Core Personas

- **The Cultural Enthusiast & Diaspora:** Players seeking an authentic digital adaptation that respects the original rules, Yoruba terminology, and material heritage.
- **The Abstract Strategy Gamer:** Enthusiasts of Mancala variants, Chess, or Go looking for deep, zero-luck mathematical strategy.
- **Casual Friends & Family:** Remote players who want to jump into a game instantly via an invite link without creating accounts or downloading native applications.

---

## 3. Visual Identity & Design System

The visual design is rooted in authentic Nigerian artisanal woodcraft. High-contrast neon accents, synthetic plastic finishes, and generic wireframes are strictly excluded.

### 3.1 Color Palette & Textures

| Surface / Element                       | Hex Range              | Description / Physical Equivalent                                              |
| --------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| **Ọpọ́n Chassis (Main Frame)**           | `#23120B` to `#351A0E` | Deep African mahogany/iroko with dark, warm timber undertones                  |
| **Bevels & Outer Rim**                  | `#5C3119` to `#7A4222` | Polished timber bevel with warm amber highlights                               |
| **Hollows (_Ihò_) & Banks (_Ojú-oró_)** | `#140A05` to `#1C0D07` | Deeply recessed gouges with inner shadow (`inset 0 6px 14px rgba(0,0,0,0.85)`) |
| **Ọmọ Ayò (Seed Base)**                 | `#53624D` to `#414E3C` | Matte, earthy "dirty greenish" _Caesalpinia bonduc_ (_ṣẹ́yọ̀_) seeds             |
| **Ọmọ Ayò (Highlights)**                | `#73836C`              | Dry sage and chalky mineral specks                                             |
| **Numeric Badges**                      | `#EAD8C7` on `#1F1008` | Minimalist contrast pill badges for rapid count identification                 |

### 3.2 Visual Clustering & Rendering Limits (DOM Performance)

To avoid layout clipping, overflow, and mobile performance drops when pits accumulate large seed counts (_ọ̀pọ̀_):

- **Pits with 1 to 4 seeds:** Render 1 to 4 distinct, organic rounded pebbles with randomized rotational offsets (`-15deg` to `+15deg`).
- **Pits with $\ge 5$ seeds:** Render a fixed graphical triad cluster (3 overlapping stylized pebbles) paired with an explicit numerical badge (`#EAD8C7` pill badge) indicating the total seed count.
- **Touch Target Invariant:** Every pit hollow must maintain an interactive hit-box of at least $48\text{px} \times 48\text{px}$ across all mobile breakpoints.

---

## 4. Canonical Game Rules & Deterministic Engine Logic

The engine resides in `lib/ayo-engine.ts` as a pure, side-effect-free functional module.

```

```

                North (Player 2 / AI / Remote)
        [11]   [10]   [9]    [8]    [7]    [6]

```

[North Bank]                                       [South Bank]
[0]    [1]    [2]    [3]    [4]    [5]
South (Player 1 / Human)

```

### 4.1 Board Setup

- **Pits Array:** Flat integer array of length 12: `[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]`.
- **Territories:**
  - South (Player 1): Indices `0, 1, 2, 3, 4, 5`
  - North (Player 2): Indices `6, 7, 8, 9, 10, 11`
- **Score Banks (_Ojú-oró_):** `{ south: 0, north: 0 }`.

### 4.2 Sowing Rules (_Tà_)

1. A player selects any non-empty pit on their side.
2. Seeds are scooped and distributed counter-clockwise: `(current_index + 1) % 12`.
3. **Full Lap Exclusion:** If a pit holds 12 or more seeds, a full lap occurs. The starting pit must be skipped during sowing; no seed may be placed back into the hollow it was picked from on that turn.

### 4.3 Capturing Rules (_Jẹ_)

1. A capture triggers if the final seed lands on the **opponent's side** and brings that pit's total to **exactly 4 seeds**.
2. **Cascading Backward Sweep:** The engine inspects consecutive predecessor pits counter-clockwise on the opponent's side (`(index - 1 + 12) % 12`). If a predecessor also holds exactly 4 seeds, its seeds are captured as well. The cascade terminates as soon as a pit without 4 seeds or a pit belonging to the active player is met.
3. Captured seeds are transferred directly to the player's _Ojú-oró_.

### 4.4 Anti-Starvation (_Fún ní Jẹ_) & Grand Slam Resolution

- **The Rule:** If an opponent has 0 seeds across all 6 pits, the active player must select a move that passes at least one seed across the border to the opponent, if such a move exists.
- **Input-Based Verification:** Legal move generation validates whether a selected pit will deposit seeds into the opponent's territory.
- **Grand Slam (_Jẹ Tán_) Resolution:** If a legal feeding move terminates in a capture or backward cascade that scoops up all newly fed seeds (leaving the opponent with 0 seeds after resolution), **the capture stands**. The opponent is now completely starved with no playable pieces remaining, triggering immediate game termination. All remaining seeds on the board are swept into the active player's score bank.

### 4.5 Termination, Stalemate & Cycle Detection

The game concludes upon reaching any of the following terminal states:

1. **Threshold Victory:** A player captures $\ge 25$ seeds.
2. **Threefold Repetition:** The engine maintains a rolling hash history of board states. If the identical board configuration repeats 3 times, the game enters terminal resolution.
3. **Low-Seed Stalemate:** If total board seeds drop to $\le 3$ with zero captures occurring over 10 consecutive turns, play halts.
4. **Seed Sweep Resolution:** Upon termination by repetition or stalemate, all remaining seeds on the board are claimed by the player on whose side they currently reside. The player with the highest total score wins.

---

## 5. System Architecture & Features

### 5.1 Game Modes

#### 1. Single-Player vs. AI (_Ọ̀tá Ayò_)

- **Deterministic Move Pre-Filtering:** The client/server local engine computes all legal moves. If a move is forced (or tactical), it ranks them via an internal heuristic (captures > defusing opponent 3-seed threats > preserving accumulators).
- **Gemini LLM Role:** The serverless Next.js API Route (`/api/ai-move`) sends the board state and pre-filtered candidate moves to Gemini. The model selects the flavor of the move, provides tactical rationale, and generates an authentic Yoruba proverb/taunt (_Òwe Ayò_).
- **Fail-Safe Timeout:** If the Gemini API call exceeds 1,200ms or returns an invalid index, the local heuristic move executes instantly with zero UI hang.

#### 2. Multiplayer (Authoritative Host Architecture)

- **Topology:** To prevent state desynchronization and race conditions without requiring an expensive central relational database:
  - **Player 1 (Room Creator / South)** acts as the **Authoritative Host Engine**.
  - **Player 2 (Invited Peer / North)** acts as a Client.
- **Signaling & Transport:** WebRTC DataChannels with an automated STUN/TURN fallback or ephemeral serverless real-time broadcast channel (e.g., Supabase Realtime / Ably).
- **State Flow:** Player 2 sends only move inputs: `{ type: 'MOVE', pitIndex: number, moveId: number }`. Player 1's engine validates the move, computes state transitions and cascading captures, checks invariants, and broadcasts the authoritative `GameState` back to Player 2.
- **Recovery:** If Player 2 detects an invariant mismatch, their client sends a `RESYNC_REQUEST` to overwrite local state with Player 1's authoritative snapshot.

#### 3. Local Pass & Play

- Alternates turns locally on a single viewport with auto-rotating turn indicators.

### 5.2 User Flow Diagram

```

[Landing Screen]
│
├───> [Single Player vs AI] ───> [Board Interface] <───> [Gemini API / Fallback]
│
├───> [Local Pass & Play]   ───> [Board Interface] (Local Turn Alternation)
│
└───> [Create / Join Room]  ───> [WebRTC Peer Handshake] ───> [Synced Board Interface]

```

---

## 6. Directory Structure & File Manifest

```

ayo-olopon/
├── app/
│   ├── api/
│   │   └── ai-move/
│   │       └── route.ts         # Gemini API endpoint with timeout & JSON schema
│   ├── page.tsx                 # Main application shell & state coordinator
│   └── layout.tsx               # Root layout & typography imports
├── components/
│   ├── AyoBoard.tsx             # Carved wooden chassis, hollows, and Ojú-oró bins
│   ├── OmoAyo.tsx               # Seed cluster rendering (<5 seeds vs badge logic)
│   ├── AiDialogueBox.tsx        # Grandmaster thought box & Yoruba proverbs
│   └── MultiplayerModal.tsx     # Room generation, invite copying & connection badges
├── lib/
│   ├── ayo-engine.ts            # Canonical game logic, captures, and cycle detection
│   ├── ayo-heuristics.ts        # Fallback minimax engine for offline & timeout safety
│   └── multiplayer-host.ts      # Authoritative host state machine & messaging protocol
└── types/
└── ayo.ts                   # Universal TypeScript interfaces

```

---

## 7. TypeScript Contracts (`types/ayo.ts`)

```typescript
export type PlayerSide = "south" | "north";

export interface GameState {
  board: number[]; // Flat array of 12 pit counts [0..11]
  scores: {
    south: number;
    north: number;
  };
  currentTurn: PlayerSide;
  isGameOver: boolean;
  winner: PlayerSide | "draw" | null;
  moveHistoryHash: string[]; // Rolling history of board states for cycle detection
  zeroCaptureTurnCount: number; // Counter tracking low-seed stalemate
  lastMove?: {
    player: PlayerSide;
    pitIndex: number;
    capturedSeeds: number;
  };
}

export interface AIMoveResponse {
  selected_pit: number; // Guaranteed legal index between 6 and 11
  tactical_reasoning: string;
  yoruba_proverb_taunt: string;
}

export interface NetworkMessage {
  type: "MOVE_ACTION" | "STATE_SYNC" | "RESYNC_REQUEST" | "FORFEIT";
  moveId?: number;
  pitIndex?: number;
  state?: GameState;
  sender: PlayerSide;
}
```

---

## 8. Non-Functional & Reliability Requirements

- **State Conservation Invariant & Rollback:**

$$\sum_{i=0}^{11} \text{board}[i] + \text{scores.south} + \text{scores.north} \equiv 48$$

This condition is checked before and after every move execution. If violated:

1. The invalid state is discarded.
2. The board reverts to the snapshot taken at turn commencement.
3. A user notification is displayed: _"Invalid move state detected. Turn reset."_
4. In multiplayer mode, an authoritative resync request is issued.

- **Latency Budgets:**
- Local engine transition: $\le 16\text{ms}$ (60 fps frame budget).
- Network move synchronization: $\le 80\text{ms}$ over active data channels.
- AI response (Gemini or heuristic fallback): Hard ceiling of $1,200\text{ms}$.

- **API Key Protection:** `GEMINI_API_KEY` is strictly confined to Next.js server-side route handlers. Never leak environment variables to client-side bundles.

```

```
