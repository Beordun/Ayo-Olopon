---
name: ayo-engine-tester
description: >-
  Use this skill to test, verify, and validate the deterministic game engine for Ayò Ọlọ́pọ́n,
  including the 48-seed conservation invariant, counter-clockwise sowing, full-lap exclusion,
  cascading backward captures, anti-starvation rules, Grand Slam resolution, and cycle detection.
---

# Ayò Engine Tester & Invariant Verifier

This skill guides you through executing, validating, and debugging the canonical rules engine in `lib/ayo-engine.ts`.

## Test Matrix & Invariant Checklist

Before releasing or updating engine code, execute the test suites covering these core scenarios:

### 1. Invariant Conservation Test
- Check total seeds before and after every turn:
  $$\sum_{i=0}^{11} \text{board}[i] + \text{scores.south} + \text{scores.north} = 48$$
- Verify that moves that fail conservation throw an `InvariantError` and revert state to pre-move snapshot.

### 2. Sowing & Multi-Lap Skipping Test
- Sow from a pit with 12 seeds (e.g. South pit 2).
- Verify the 12 seeds are distributed across the other 11 pits and the 12th seed lands in pit 3, skipping pit 2 entirely. Pit 2 must remain at 0 seeds immediately after distribution.
- Sow from a pit with 23 seeds. Verify pit 2 is skipped on **both circuits**.

### 3. Cascading Backward Capture Test
- Setup board where pit 8 and 7 have 3 seeds each.
- South plays a move where the final seed lands in pit 8 (bringing it to 4).
- Verify pit 8 captures 4 seeds, and the reverse sweep (clockwise: `(index - 1 + 12) % 12`) checks pit 7 (which has 4 seeds) and captures pit 7 as well.
- Verify that if pit 6 has 2 seeds or belongs to South, the cascade halts immediately.

### 4. Anti-Starvation (*Fún ní Jẹ*) Test
- Clear North's board to `[0, 0, 0, 0, 0, 0]`.
- Call `getLegalMoves(state, 'south')`.
- Assert that only pits whose seed count can reach North's territory (`[6..11]`) are returned.
- If no moves can feed North, assert game ends immediately with all remaining board seeds awarded to South.

### 5. Grand Slam (*Jẹ Tán*) Test
- South plays a legal feeding move into North's starved territory.
- Sowing final seed and reverse cascade scoop up all newly fed seeds.
- Verify North has 0 seeds, capture is awarded, game terminates immediately, and board sweep awards remaining South seeds to South.

### 6. Threefold Repetition & Low-Seed Stalemate Test
- Simulate cyclic moves generating identical `moveHistoryHash` 3 times $\to$ assert game termination.
- Simulate total board seeds $\le 3$ with 10 zero-capture turns $\to$ assert stalemate sweep.

## How to Execute Engine Tests
Run unit tests using the project's test runner:
```bash
npm test -- ayo-engine.test.ts
# or using vitest
npx vitest run lib/ayo-engine.test.ts
```

For complete golden fixtures covering all 7 scenarios, see [references/test_matrix.md](./references/test_matrix.md).
