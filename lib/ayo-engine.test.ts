import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  executeMove,
  getLegalMoves,
  assert48SeedConservation,
  InvariantError,
  InvalidMoveError,
  sum,
} from './ayo-engine';
import { GameState } from '@/types/ayo';

describe('Ayò Ọlọ́pọ́n Deterministic Engine Suite', () => {
  // 1. Initial State & Invariant Conservation
  it('Fixture 1: initializes with 48 seeds and validates conservation', () => {
    const state = createInitialState();
    expect(state.board).toEqual([4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect(state.scores).toEqual({ south: 0, north: 0 });
    expect(state.currentTurn).toBe('south');
    expect(state.isGameOver).toBe(false);
    expect(getLegalMoves(state, 'south')).toEqual([0, 1, 2, 3, 4, 5]);

    // Validate 48-seed invariant
    expect(() => assert48SeedConservation(state)).not.toThrow();
  });

  // 2. Multi-Lap Origin Skipping (12 seeds)
  it('Fixture 2: skips originating pit on every circuit during full laps', () => {
    const lapState: GameState = {
      board: [12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      scores: { south: 18, north: 18 },
      currentTurn: 'south',
      isGameOver: false,
      winner: null,
      moveHistoryHash: [],
      zeroCaptureTurnCount: 0,
    };

    const nextState = executeMove(lapState, 0);

    // 12 seeds from pit 0: distributed into pits 1..11 and pit 1. Pit 0 MUST remain 0!
    expect(nextState.board[0]).toBe(0);
    expect(nextState.board[1]).toBe(2);
    for (let p = 2; p <= 11; p++) {
      expect(nextState.board[p]).toBe(1);
    }
    expect(() => assert48SeedConservation(nextState)).not.toThrow();
  });

  // 3. Cascading Backward Capture & Threshold Win
  it('Fixture 3: executes cascading backward captures and triggers threshold victory', () => {
    const captureState: GameState = {
      board: [0, 0, 0, 0, 0, 2, 3, 3, 0, 0, 0, 0],
      scores: { south: 20, north: 20 },
      currentTurn: 'south',
      isGameOver: false,
      winner: null,
      moveHistoryHash: [],
      zeroCaptureTurnCount: 0,
    };

    // South plays pit 5 (2 seeds) -> lands in pit 6 (becomes 3+1=4) and pit 7 (becomes 3+1=4)
    const nextState = executeMove(captureState, 5);

    // Pit 7 captured (4), reverse sweep to pit 6 captured (4). South score = 20 + 8 = 28
    expect(nextState.board[6]).toBe(0);
    expect(nextState.board[7]).toBe(0);
    expect(nextState.scores.south).toBe(28);
    expect(nextState.isGameOver).toBe(true);
    expect(nextState.winner).toBe('south');
    expect(() => assert48SeedConservation(nextState)).not.toThrow();
  });

  // 4. Anti-Starvation (Fún ní Jẹ) Move Filtering
  it('Fixture 4: filters moves to mandate feeding an empty opponent', () => {
    const starvationState: GameState = {
      board: [1, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0], // North is completely empty
      scores: { south: 20, north: 20 },
      currentTurn: 'south',
      isGameOver: false,
      winner: null,
      moveHistoryHash: [],
      zeroCaptureTurnCount: 0,
    };

    // Pit 0 (1 seed) reaches pit 1 -> does not feed North.
    // Pit 1 (2 seeds) reaches pit 2, 3 -> does not feed North.
    // Pit 5 (5 seeds) reaches pits 6, 7, 8, 9, 10 -> feeds North!
    const legalMoves = getLegalMoves(starvationState, 'south');
    expect(legalMoves).toEqual([5]);
  });

  // 5. Starvation Deadlock Sweep (No Legal Feeding Move)
  it('Fixture 4b: terminates and awards remaining board seeds to active player when no feeding move exists', () => {
    const deadlockState: GameState = {
      board: [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // North is completely empty, South cannot reach North
      scores: { south: 24, north: 21 },
      currentTurn: 'south',
      isGameOver: false,
      winner: null,
      moveHistoryHash: [],
      zeroCaptureTurnCount: 0,
    };

    const legalMoves = getLegalMoves(deadlockState, 'south');
    expect(legalMoves).toEqual([]);

    // Executing move on deadlock triggers starvation sweep
    const terminalState = executeMove(deadlockState, 0);
    expect(terminalState.isGameOver).toBe(true);
    expect(terminalState.board).toEqual(new Array(12).fill(0));
    expect(terminalState.scores.south).toBe(27); // 24 + 3 swept
    expect(terminalState.scores.north).toBe(21);
    expect(terminalState.winner).toBe('south');
    expect(() => assert48SeedConservation(terminalState)).not.toThrow();
  });

  // 6. Grand Slam (Jẹ Tán) Resolution
  it('Fixture 5: allows capture to stand and sweeps remaining seeds when Grand Slam occurs', () => {
    const grandSlamState: GameState = {
      board: [0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0], // North only has 3 in pit 6
      scores: { south: 22, north: 22 },
      currentTurn: 'south',
      isGameOver: false,
      winner: null,
      moveHistoryHash: [],
      zeroCaptureTurnCount: 0,
    };

    // South plays pit 5 (1 seed) -> lands in pit 6 (3+1=4) -> captures all North seeds
    const nextState = executeMove(grandSlamState, 5);
    expect(nextState.board).toEqual(new Array(12).fill(0));
    expect(nextState.scores.south).toBe(26);
    expect(nextState.isGameOver).toBe(true);
    expect(nextState.winner).toBe('south');
    expect(() => assert48SeedConservation(nextState)).not.toThrow();
  });

  // 7. Threefold Repetition Cycle Detection
  it('Fixture 6: terminates game and sweeps side seeds upon threefold repetition', () => {
    const repetitionState: GameState = {
      board: [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      scores: { south: 23, north: 23 },
      currentTurn: 'south',
      isGameOver: false,
      winner: null,
      moveHistoryHash: [
        '0,0,0,1,0,0,0,0,1,0,0,0:north',
        '0,0,0,1,0,0,0,0,1,0,0,0:north', // already appeared twice
      ],
      zeroCaptureTurnCount: 4,
    };

    // South plays pit 2 (1 seed) -> lands in pit 3. New hash matches for 3rd time
    const nextState = executeMove(repetitionState, 2);
    expect(nextState.isGameOver).toBe(true);
    expect(nextState.board).toEqual(new Array(12).fill(0));
    // Sweep: South side has pit 3 (1 seed) -> South gets 1. North side has pit 8 (1 seed) -> North gets 1.
    expect(nextState.scores.south).toBe(24);
    expect(nextState.scores.north).toBe(24);
    expect(nextState.winner).toBe('draw');
    expect(() => assert48SeedConservation(nextState)).not.toThrow();
  });

  // 8. Low-Seed Stalemate Sweep
  it('Fixture 7: terminates game when <= 3 seeds remain and 10 zero-capture turns occur', () => {
    const lowSeedState: GameState = {
      board: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // Total seeds = 2 (<= 3)
      scores: { south: 24, north: 22 },
      currentTurn: 'south',
      isGameOver: false,
      winner: null,
      moveHistoryHash: [],
      zeroCaptureTurnCount: 9, // 10th zero-capture turn
    };

    const nextState = executeMove(lowSeedState, 0);
    expect(nextState.isGameOver).toBe(true);
    expect(nextState.board).toEqual(new Array(12).fill(0));
    expect(nextState.scores.south).toBe(25);
    expect(nextState.scores.north).toBe(23);
    expect(nextState.winner).toBe('south');
    expect(() => assert48SeedConservation(nextState)).not.toThrow();
  });

  // 9. Invariant Protection against Tampered State
  it('throws InvariantError when board seeds are corrupted', () => {
    const invalidState: GameState = {
      board: [5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], // 49 seeds!
      scores: { south: 0, north: 0 },
      currentTurn: 'south',
      isGameOver: false,
      winner: null,
      moveHistoryHash: [],
      zeroCaptureTurnCount: 0,
    };

    expect(() => executeMove(invalidState, 0)).toThrow(InvariantError);
  });
});
