/**
 * Canonical Deterministic Game Engine — Ayò Ọlọ́pọ́n Digital
 * Strict compliance with AGENTS.md, PRD v1.2.0, and ayo-engine-invariants.md
 */

import { GameState, PlayerSide } from '@/types/ayo';

export class InvariantError extends Error {
  constructor(message: string) {
    super(`[Ayò Invariant Violation] ${message}`);
    this.name = 'InvariantError';
  }
}

export class InvalidMoveError extends Error {
  constructor(message: string) {
    super(`[Ayò Invalid Move] ${message}`);
    this.name = 'InvalidMoveError';
  }
}

/**
 * Returns the sum of an array of numbers.
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * Validates the Universal 48-Seed Conservation Invariant:
 * sum(board[0..11]) + scores.south + scores.north === 48
 */
export function assert48SeedConservation(state: GameState): void {
  const boardTotal = sum(state.board);
  const total = boardTotal + state.scores.south + state.scores.north;
  if (total !== 48) {
    throw new InvariantError(
      `48-seed conservation failed! Board sum: ${boardTotal}, South score: ${state.scores.south}, North score: ${state.scores.north}, Total: ${total}`
    );
  }
}

/**
 * Returns the canonical initial state of Ayò Ọlọ́pọ́n.
 */
export function createInitialState(): GameState {
  return {
    board: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    scores: { south: 0, north: 0 },
    currentTurn: 'south',
    isGameOver: false,
    winner: null,
    moveHistoryHash: [],
    zeroCaptureTurnCount: 0,
  };
}

/**
 * Territory index ranges:
 * South: [0, 1, 2, 3, 4, 5]
 * North: [6, 7, 8, 9, 10, 11]
 */
export function isSouthTerritory(pitIndex: number): boolean {
  return pitIndex >= 0 && pitIndex <= 5;
}

export function isNorthTerritory(pitIndex: number): boolean {
  return pitIndex >= 6 && pitIndex <= 11;
}

export function isOpponentTerritory(player: PlayerSide, pitIndex: number): boolean {
  return player === 'south' ? isNorthTerritory(pitIndex) : isSouthTerritory(pitIndex);
}

/**
 * Simulates sowing from a pit to check which pits will receive seeds.
 * Respects the multi-lap origin skipping invariant.
 */
export function simulateSowingPath(board: number[], pitIndex: number): number[] {
  let seeds = board[pitIndex];
  if (seeds <= 0) return [];

  const visited: number[] = [];
  let target = pitIndex;
  while (seeds > 0) {
    target = (target + 1) % 12;
    if (target === pitIndex) {
      continue; // Unconditionally skip origin pit on EVERY circuit
    }
    visited.push(target);
    seeds--;
  }
  return visited;
}

/**
 * Generates all legal moves for the active player.
 * Enforces anti-starvation (Fún ní Jẹ): if opponent has 0 seeds, player must feed them if possible.
 */
export function getLegalMoves(state: GameState, player: PlayerSide): number[] {
  if (state.isGameOver) return [];

  const playerPits = player === 'south' ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  const opponentPits = player === 'south' ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5];

  const candidatePits = playerPits.filter((p) => state.board[p] > 0);
  const opponentTotalSeeds = sum(opponentPits.map((p) => state.board[p]));

  // If opponent has seeds, any non-empty pit in player's territory is legal
  if (opponentTotalSeeds > 0) {
    return candidatePits;
  }

  // Anti-starvation (Fún ní Jẹ): Opponent has 0 seeds
  const feedingMoves = candidatePits.filter((pit) => {
    const path = simulateSowingPath(state.board, pit);
    return path.some((target) => isOpponentTerritory(player, target));
  });

  // If feeding moves exist, ONLY feeding moves are legal
  return feedingMoves;
}

function determineWinner(scores: { south: number; north: number }): PlayerSide | 'draw' {
  if (scores.south > scores.north) return 'south';
  if (scores.north > scores.south) return 'north';
  return 'draw';
}

/**
 * Executes a player move and returns the next immutable GameState.
 * Throws InvalidMoveError or InvariantError if rules are breached.
 */
export function executeMove(state: GameState, pitIndex: number): GameState {
  if (state.isGameOver) {
    throw new InvalidMoveError('Cannot execute move: Game is already over.');
  }

  // Pre-move 48-seed conservation invariant check
  assert48SeedConservation(state);

  const player = state.currentTurn;
  const opponent: PlayerSide = player === 'south' ? 'north' : 'south';
  const playerPits = player === 'south' ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  const opponentPits = opponent === 'south' ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];

  // Validate territory ownership
  if (!playerPits.includes(pitIndex)) {
    throw new InvalidMoveError(
      `Pit index ${pitIndex} does not belong to active player '${player}'.`
    );
  }

  const legalMoves = getLegalMoves(state, player);
  const opponentSeedsBefore = sum(opponentPits.map((p) => state.board[p]));

  // Check Starvation Deadlock: Opponent has 0 seeds and active player cannot feed them
  if (opponentSeedsBefore === 0 && legalMoves.length === 0) {
    // Starvation victory for active player
    const remainingBoard = sum(state.board);
    const finalScores = {
      ...state.scores,
      [player]: state.scores[player] + remainingBoard,
    };
    const finalBoard = new Array(12).fill(0);
    const terminalState: GameState = {
      ...state,
      board: finalBoard,
      scores: finalScores,
      isGameOver: true,
      winner: determineWinner(finalScores),
      lastMove: {
        player,
        pitIndex,
        capturedSeeds: 0,
      },
    };
    assert48SeedConservation(terminalState);
    return terminalState;
  }

  if (!legalMoves.includes(pitIndex)) {
    throw new InvalidMoveError(
      `Pit index ${pitIndex} is not a legal move for player '${player}'.`
    );
  }

  // 1. Sowing (Tà) with Multi-Lap Origin Skipping
  let seeds = state.board[pitIndex];
  const newBoard = [...state.board];
  newBoard[pitIndex] = 0;

  let target = pitIndex;
  const sownPits: number[] = [];

  while (seeds > 0) {
    target = (target + 1) % 12;
    if (target === pitIndex) {
      continue; // Unconditionally skip starting hollow on EVERY lap
    }
    newBoard[target]++;
    sownPits.push(target);
    seeds--;
  }

  // 2. Cascading Backward Captures (Jẹ)
  let capturedSeeds = 0;
  const finalPit = target;

  // Capture triggers ONLY if final seed lands in opponent territory reaching exactly 2 or 3 seeds
  if (
    isOpponentTerritory(player, finalPit) &&
    (newBoard[finalPit] === 2 || newBoard[finalPit] === 3)
  ) {
    capturedSeeds += newBoard[finalPit];
    newBoard[finalPit] = 0;

    // Reverse (clockwise) sweep along contiguous opponent pits with 2 or 3 seeds
    let prev = (finalPit - 1 + 12) % 12;
    while (
      isOpponentTerritory(player, prev) &&
      (newBoard[prev] === 2 || newBoard[prev] === 3)
    ) {
      capturedSeeds += newBoard[prev];
      newBoard[prev] = 0;
      prev = (prev - 1 + 12) % 12;
    }
  }

  let newScores = {
    ...state.scores,
    [player]: state.scores[player] + capturedSeeds,
  };

  const opponentSeedsAfter = sum(opponentPits.map((p) => newBoard[p]));
  let isGameOver = false;
  let winner = state.winner;

  // 3. Grand Slam (Jẹ Tán) Resolution
  // If player made a legal feeding move but captures all fed seeds, leaving opponent at 0:
  if (opponentSeedsBefore === 0 && opponentSeedsAfter === 0 && capturedSeeds > 0) {
    // Capture stands, opponent is starved, remaining seeds swept to active player
    const remainingBoard = sum(newBoard);
    newScores[player] += remainingBoard;
    newBoard.fill(0);
    isGameOver = true;
    winner = determineWinner(newScores);
  } else if (newScores[player] >= 25) {
    // 4. Threshold Victory (>= 25 seeds captured)
    isGameOver = true;
    winner = player;
  } else if (opponentSeedsAfter === 0) {
    // 5. Opponent has 0 seeds after turn.
    // Check if opponent has any legal feeding move on their upcoming turn:
    const opponentLegalMoves = getLegalMoves(
      {
        ...state,
        board: newBoard,
        scores: newScores,
        currentTurn: opponent,
      },
      opponent
    );

    if (opponentLegalMoves.length === 0) {
      // Opponent starved with zero moves. Active player sweeps remaining board seeds!
      const remainingBoard = sum(newBoard);
      newScores[player] += remainingBoard;
      newBoard.fill(0);
      isGameOver = true;
      winner = determineWinner(newScores);
    }
  }

  // 6. Cycle Detection (Threefold Repetition) & Low-Seed Stalemate
  const nextTurn: PlayerSide = opponent;
  const zeroCaptureTurnCount = capturedSeeds > 0 ? 0 : state.zeroCaptureTurnCount + 1;
  const currentHash = `${newBoard.join(',')}:${nextTurn}`;
  const newHistoryHash = [...state.moveHistoryHash, currentHash];

  if (!isGameOver) {
    const repetitionCount = newHistoryHash.filter((h) => h === currentHash).length;
    const totalRemaining = sum(newBoard);

    // Threefold repetition or low-seed stalemate triggers terminal sweep
    if (repetitionCount >= 3 || (totalRemaining <= 3 && zeroCaptureTurnCount >= 10)) {
      isGameOver = true;
      // Sweep remaining seeds to player on whose side they currently reside
      newScores.south += sum(newBoard.slice(0, 6));
      newScores.north += sum(newBoard.slice(6, 12));
      newBoard.fill(0);
      winner = determineWinner(newScores);
    }
  }

  const nextState: GameState = {
    board: newBoard,
    scores: newScores,
    currentTurn: nextTurn,
    isGameOver,
    winner,
    moveHistoryHash: newHistoryHash,
    zeroCaptureTurnCount,
    lastMove: {
      player,
      pitIndex,
      capturedSeeds,
      sownPits,
    },
  };

  // Post-move 48-seed conservation invariant assertion
  assert48SeedConservation(nextState);

  return nextState;
}
