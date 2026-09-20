# Rule: Ayò Engine Determinism & Mathematical Invariants

## Scope & Target Files
- Target: `lib/ayo-engine.ts`, `lib/ayo-heuristics.ts`, `types/ayo.ts`
- Language: TypeScript (strict mode, immutable transitions, zero side effects)

## 1. Universal TypeScript Interfaces
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
  zeroCaptureTurnCount: number; // Counter tracking low-seed stalemate
  lastMove?: {
    player: PlayerSide;
    pitIndex: number;
    capturedSeeds: number;
  };
}
```

## 2. Mathematical Invariant 1: 48-Seed State Conservation
$$\sum_{i=0}^{11} \text{board}[i] + \text{scores.south} + \text{scores.north} \equiv 48$$

- **Pre-Execution Assertion**: `executeMove(state: GameState, pitIndex: number)` MUST assert $\text{totalSeeds}(\text{state}) === 48$ prior to altering any state.
- **Post-Execution Assertion**: After sowing and cascading captures are resolved, it MUST assert $\text{totalSeeds}(\text{nextState}) === 48$.
- **Rollback Protocol**: If the invariant fails, `executeMove` MUST throw an `InvariantError("48-seed conservation violation")`, revert to the pre-move snapshot, and dispatch a resync event in multiplayer.

## 3. Board Indexing, Territory Mapping & Visual Geometry
- Board array length: Exactly 12 integers `[0..11]`.
  - **South Territory (Player 1 / Human / Host)**: Indices `0, 1, 2, 3, 4, 5`.
  - **North Territory (Player 2 / AI / Peer)**: Indices `6, 7, 8, 9, 10, 11`.
- **Direction of Play**: Strictly counter-clockwise: `(current_index + 1) % 12`.

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

## 4. Sowing Rules (*Tà*) & Multi-Lap Origin Skipping
1. **Move Validation & Error Handling**:
   - `pitIndex` must be an integer within the active player's territory (`0..5` for South, `6..11` for North).
   - `state.board[pitIndex]` must be $> 0$.
   - If `pitIndex` is illegal or not in `getLegalMoves(state, state.currentTurn)`, `executeMove` MUST throw an `InvalidMoveError` without altering state.
2. **Distribution Execution**:
   - All seeds are scooped from `pitIndex`, leaving `board[pitIndex] = 0`.
   - Seeds are deposited one-by-one in counter-clockwise order: `target = (current + 1) % 12`.
3. **Multi-Lap Origin Skipping Invariant**:
   - **No seed may EVER be placed back into the starting hollow on that turn**, regardless of the seed count ($\ge 12$, $\ge 23$, etc.).
   - Sowing loop implementation invariant:
     ```typescript
     let target = originIndex;
     while (seedsToSow > 0) {
       target = (target + 1) % 12;
       if (target === originIndex) {
         continue; // Unconditionally skip starting pit on EVERY lap
       }
       newBoard[target]++;
       seedsToSow--;
     }
     ```

## 5. Cascading Backward Captures (*Jẹ*)
1. **Primary Capture Condition**:
   - Sowing's final seed lands in **opponent territory** (`[6..11]` for South; `[0..5]` for North).
   - The final seed brings that pit's total to **exactly 4 seeds**.
2. **Reverse (Clockwise) Cascade Sweep**:
   - From the final landing pit, inspect predecessor pits in reverse sowing direction (clockwise: `prev = (index - 1 + 12) % 12`).
   - If `prev` is still in **opponent territory** AND contains **exactly 4 seeds**, scoop all 4 seeds into `scores[currentTurn]`.
   - The cascade terminates immediately when a pit contains $\ne 4$ seeds or crosses the border into the active player's territory.

## 6. Anti-Starvation (*Fún ní Jẹ*) & Starvation Victory
1. **Feeding Requirement**:
   - Evaluated when the opponent has **0 total seeds** across all 6 of their pits at the start of the active player's turn.
   - The active player MUST select a move that deposits at least one seed into the opponent's territory, if such a move exists.
2. **Move Filtering**:
   - `getLegalMoves(state, player)` must return ONLY the subset of pits that deposit $\ge 1$ seed across the territory line.
3. **Starvation Victory (No Legal Feeding Move)**:
   - If the opponent has 0 seeds and NO move can reach the opponent's side:
     - Game terminates immediately (`isGameOver = true`).
     - All remaining seeds on the board are claimed by the active player: `scores[currentTurn] += sum(board)`.
     - `board.fill(0)`.
     - Winner is the player with highest total score.

## 7. Grand Slam (*Jẹ Tán*) Resolution
- If a legal feeding move captures all newly deposited seeds, leaving the opponent with 0 seeds after the move:
  - **The capture stands**.
  - Opponent is starved with zero playable moves.
  - Game terminates immediately (`isGameOver = true`).
  - All remaining seeds on the board are swept into the active player's bank: `scores[activePlayer] += sum(board)`.
  - `board.fill(0)`.

## 8. Cycle Detection & Terminal Stalemate
1. **Threshold Victory**: A player reaching $\ge 25$ captured seeds wins immediately.
2. **Threefold Repetition**:
   - Append rolling hash `"${board.join(',')}:${currentTurn}"` to `moveHistoryHash` after each move.
   - If any identical state hash appears **3 times**, game terminates immediately.
3. **Low-Seed Stalemate**:
   - If $\sum_{i=0}^{11} \text{board}[i] \le 3$ and `zeroCaptureTurnCount >= 10`, game terminates immediately.
4. **Endgame Sweep for Repetition & Stalemate**:
   - All remaining seeds on South side (`0..5`) are awarded to South: `scores.south += sum(board[0..5])`.
   - All remaining seeds on North side (`6..11`) are awarded to North: `scores.north += sum(board[6..11])`.
   - `board.fill(0)`.
   - Highest total score wins (or `'draw'` if 24-24).
