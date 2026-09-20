# Ayò Engine Test Matrix & Golden Fixtures

Use these standardized board configurations to verify all edge cases:

## Fixture 1: Standard Initial State
```typescript
const initialState: GameState = {
  board: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  scores: { south: 0, north: 0 },
  currentTurn: 'south',
  isGameOver: false,
  winner: null,
  moveHistoryHash: [],
  zeroCaptureTurnCount: 0
};
// Total seeds = 48. Legal South moves = [0, 1, 2, 3, 4, 5].
```

## Fixture 2: Multi-Lap Origin Skipping (12 and 23 Seeds)
```typescript
const lapState: GameState = {
  board: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  scores: { south: 18, north: 18 },
  currentTurn: 'south',
  isGameOver: false,
  winner: null,
  moveHistoryHash: [],
  zeroCaptureTurnCount: 0
};
// After South plays pit 0:
// 12 seeds are placed in 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, and 1.
// Pit 0 was skipped during the second circuit. Pit 0 MUST remain 0.
```

## Fixture 3: Cascading Backward Capture & Threshold Win
```typescript
const captureState: GameState = {
  board: [0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0],
  scores: { south: 21, north: 22 },
  currentTurn: 'south',
  isGameOver: false,
  winner: null,
  moveHistoryHash: [],
  zeroCaptureTurnCount: 0
};
// South plays pit 5 (2 seeds) -> lands in pit 6 (becomes 1+1=2) and pit 7 (becomes 2+1=3).
// Pit 7 reaches 3 seeds -> scoops 3 seeds.
// Reverse sweep clockwise: pit 6 has 2 seeds -> scoops 2 seeds.
// South scores +5 -> total 26. Winner: 'south' (threshold >= 25 reached).
```

## Fixture 4: Anti-Starvation (*Fún ní Jẹ*) Filtering
```typescript
const starvationFilterState: GameState = {
  board: [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // North is completely empty
  scores: { south: 24, north: 21 },
  currentTurn: 'south',
  isGameOver: false,
  winner: null,
  moveHistoryHash: [],
  zeroCaptureTurnCount: 0
};
// Pit 0 (1 seed) lands in 1 (does NOT feed North).
// Pit 1 (2 seeds) lands in 2, 3 (does NOT feed North).
// No legal feeding move exists!
// Expected: Starvation victory. Remaining board seeds (3) awarded to South.
// Final scores: South = 27, North = 21. Winner: 'south'.
```

## Fixture 5: Grand Slam (*Jẹ Tán*) Resolution
```typescript
const grandSlamState: GameState = {
  board: [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0], // North only has 1 in pit 6
  scores: { south: 23, north: 23 },
  currentTurn: 'south',
  isGameOver: false,
  winner: null,
  moveHistoryHash: [],
  zeroCaptureTurnCount: 0
};
// South plays pit 5 (1 seed) -> lands in pit 6 (becomes 1+1=2 seeds).
// Pit 6 reaches 2 seeds -> captured!
// Grand Slam occurs: all fed seeds captured, North has 0 seeds left.
// Capture stands, remaining seeds on board swept, game terminates immediately.
```

## Fixture 6: Threefold Repetition Cycle Detection
```typescript
const repetitionState: GameState = {
  board: [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  scores: { south: 23, north: 23 },
  currentTurn: 'south',
  isGameOver: false,
  winner: null,
  moveHistoryHash: [
    "0,0,1,0,0,0,0,0,1,0,0,0:south",
    "0,0,0,1,0,0,0,0,1,0,0,0:north",
    "0,0,1,0,0,0,0,0,1,0,0,0:south",
    "0,0,0,1,0,0,0,0,1,0,0,0:north",
  ],
  zeroCaptureTurnCount: 6
};
// If South's next move returns hash "0,0,1,0,0,0,0,0,1,0,0,0:south",
// this matches for the 3rd time!
// Expected: isGameOver = true. Board swept (South pit 2 to South, North pit 8 to North).
// Final score: 24 - 24 -> winner: 'draw'.
```

## Fixture 7: Low-Seed Stalemate Sweep
```typescript
const lowSeedStalemateState: GameState = {
  board: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // Total seeds = 2 (<= 3)
  scores: { south: 24, north: 22 },
  currentTurn: 'south',
  isGameOver: false,
  winner: null,
  moveHistoryHash: [],
  zeroCaptureTurnCount: 9 // Next zero-capture turn makes it 10
};
// South moves pit 0 -> lands in pit 1 (no capture).
// zeroCaptureTurnCount becomes 10.
// Expected: isGameOver = true. Sweep: South gets 1, North gets 1.
// Final scores: South = 25, North = 23 -> winner: 'south'.
```
