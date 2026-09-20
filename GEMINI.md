# Ayò Ọlọ́pọ́n Digital — Gemini & Agent Master Quick-Reference

This file provides the primary directives and architectural contracts for all coding agents operating in this workspace. Refer to [AGENTS.md](file:///c:/Users/DT001/Desktop/Ayo-Olopon/AGENTS.md) for full authoritative blueprints.

---

## 1. Board Coordinate Geometry & Sowing Trajectory
- Flat 12-integer array `board[0..11]`. *Ojú-oró* score banks are separate in `{ south: number, north: number }`.
- **South Territory (Player 1 / Human / Host)**: Indices `0, 1, 2, 3, 4, 5` (rendered bottom row left-to-right `0 → 5`).
- **North Territory (Player 2 / AI / Peer)**: Indices `6, 7, 8, 9, 10, 11` (rendered top row left-to-right `11 → 6`).
- **Trajectory**: Strictly counter-clockwise: `(current_index + 1) % 12`.
- **Multi-Lap Origin Skipping**: Sowing skips the originating hollow on **every circuit** when seeds $\ge 12$.

```
                    North Territory (Player 2)
               [11]      [10]       [9]       [8]       [7]       [6]
        ┌─────────────────────────────────────────────────────────────────┐
[North  │                                                                 │  [South
 Bank   │                                                                 │   Bank
Ojú-oró]│                                                                 │  Ojú-oró]
        │       [0]       [1]       [2]       [3]       [4]       [5]     │
        └─────────────────────────────────────────────────────────────────┘
                    South Territory (Player 1)
```

---

## 2. Core Non-Negotiable Invariants
1. **48-Seed State Conservation**:
   $$\sum_{i=0}^{11} \text{board}[i] + \text{scores.south} + \text{scores.north} \equiv 48$$
   Validated before and after every move. Rollback turn on violation!
2. **Cascading Captures (*Jẹ*)**:
   Triggered only if final seed lands on **opponent side** reaching **exactly 4 seeds**. Cascade sweeps backwards in reverse sowing direction (`(index - 1 + 12) % 12`) along contiguous opponent pits with 4 seeds.
3. **Anti-Starvation (*Fún ní Jẹ*)**:
   Active player must feed an opponent who has 0 seeds if a feeding move exists. If no feeding move exists, active player sweeps all remaining seeds and game terminates.
4. **Grand Slam (*Jẹ Tán*)**:
   Feeding moves that capture all newly fed seeds stand; opponent is starved, and active player sweeps remaining board seeds.
5. **Terminal Victory & Cycles**:
   - $\ge 25$ seeds captured = instant win.
   - 3-fold repetition of hash `"${board.join(',')}:${currentTurn}"` = terminal sweep.
   - Low-seed stalemate ($\le 3$ seeds and 10 zero-capture turns) = terminal sweep.

---

## 3. Technology & Architecture Guardrails
- **AI Latency Ceiling**: Hard ceiling of **$1,200\text{ms}$** (abort at $1,100\text{ms}$). Fallback immediately to `lib/ayo-heuristics.ts`. `GEMINI_API_KEY` is server-only.
- **Multiplayer Topology**: Authoritative Host (Player 1 = Host, Player 2 = Client). Client sends `MOVE_ACTION`, Host executes engine and broadcasts `STATE_SYNC`. Recovery via `RESYNC_REQUEST`.
- **Visual Design System**: Deep African mahogany (`#23120B` - `#351A0E`), amber bevels (`#5C3119` - `#7A4222`), matte sage seeds (`#53624D`).
- **Clustering Rule**: 0 seeds = empty hollow (no badge); 1–4 seeds = organic pebbles; $\ge 5$ seeds = triad cluster + contrast pill badge. Touch targets $\ge 48\text{px} \times 48\text{px}$.
