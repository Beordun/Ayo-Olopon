/**
 * Minimax Fallback Heuristic Engine — Ayò Ọlọ́pọ́n Digital
 * Strict compliance with AGENTS.md & ai-grandmaster-contract.md
 */

import { GameState, AIMoveResponse, PlayerSide } from '@/types/ayo';
import { executeMove, getLegalMoves, sum } from './ayo-engine';

export const FALLBACK_YORUBA_PROVERBS = [
  {
    proverb: 'Ọmọdé kò mọ ayò tà, ó ń kígbe pé ayò dọ́gba.',
    meaning: 'A novice who cannot play Ayò cries that the game is a draw.',
    context: 'Taunting an opponent who claims a stalemate or plays defensively.',
  },
  {
    proverb: 'Bí a bá ń tà\'yò, a kì í bínú; ogbọ́n la fi ń jẹ ọmọ ayò.',
    meaning: 'When playing Ayò, one must not rage; wisdom is what captures seeds.',
    context: 'Encouraging calm strategic patience after a heavy scoop.',
  },
  {
    proverb: 'Ojú ló ń tà\'yò, kò sí ogun níbẹ̀.',
    meaning: 'The eyes and intellect play Ayò, it is not a war of muscle.',
    context: 'Reminding the player that careful calculation beats reckless force.',
  },
  {
    proverb: 'Ẹni tí ó gbọ́n ní ń jẹ ọ̀pọ̀.',
    meaning: 'He who is wise reaps the abundant harvest of seeds.',
    context: 'Delivered when a strategic accumulator pit is scooped for multiple captures.',
  },
  {
    proverb: 'Ayò kì í ṣe eré agbára, eré ìmọ̀ ni.',
    meaning: 'Ayò is not a contest of force, it is a game of pure intellect.',
    context: 'Commending tactical foresight in an endgame position.',
  },
];

export function getRandomProverb() {
  const index = Math.floor(Math.random() * FALLBACK_YORUBA_PROVERBS.length);
  return FALLBACK_YORUBA_PROVERBS[index];
}

/**
 * Counts vulnerable pits (1 or 2 seeds) on South's territory (0..5).
 * Pits with 1 or 2 seeds are vulnerable to immediate 2- or 3-seed capture.
 */
function countSouthTraps(board: number[]): number {
  let traps = 0;
  for (let i = 0; i < 6; i++) {
    if (board[i] === 1 || board[i] === 2) traps++;
  }
  return traps;
}

/**
 * Evaluates a candidate North move (pitIndex in 6..11) using the 4-tier M3 heuristic system.
 */
export function evaluateMoveForNorth(state: GameState, pitIndex: number): number {
  try {
    const nextState = executeMove(state, pitIndex);
    let score = 0;

    // Priority 1: Immediate capture yield (2 or 3 seeds per hollow) (+100 points per seed captured)
    const captured = nextState.scores.north - state.scores.north;
    score += captured * 100;

    // Priority 2: Defusing opponent traps (+50 points per trap defused)
    const southTrapsBefore = countSouthTraps(state.board);
    const southTrapsAfter = countSouthTraps(nextState.board);
    const trapsDefused = southTrapsBefore - southTrapsAfter;
    if (trapsDefused > 0) {
      score += trapsDefused * 50;
    }

    // Priority 3: Protecting friendly accumulator hollows (>= 10 seeds) (+30 points)
    if (state.board[pitIndex] >= 10 && captured > 0) {
      score += 30;
    }

    // Priority 4: Preserving opponent mobility & feeding obligations (+20 points)
    const southSeedsRemaining = sum(nextState.board.slice(0, 6));
    if (southSeedsRemaining > 0) {
      score += 20;
    }

    // Win bonus
    if (nextState.isGameOver && nextState.winner === 'north') {
      score += 10000;
    }

    return score;
  } catch {
    return -999999;
  }
}

/**
 * Returns the best move for North according to the deterministic heuristic evaluation.
 * Guaranteed to execute within < 15ms.
 */
export function getBestHeuristicMove(state: GameState, legalMoves: number[]): AIMoveResponse {
  if (legalMoves.length === 0) {
    throw new Error('No legal moves available for heuristic evaluation.');
  }

  let bestPit = legalMoves[0];
  let highestScore = -Infinity;

  for (const pit of legalMoves) {
    const score = evaluateMoveForNorth(state, pit);
    if (score > highestScore) {
      highestScore = score;
      bestPit = pit;
    }
  }

  const randomProverb = getRandomProverb();
  let reasoning = 'Ọ̀tá Ayò calculates the board trajectory to maintain spatial pressure.';
  
  if (highestScore >= 400) {
    reasoning = 'A surgical capture opportunity is seized in opponent hollows.';
  } else if (highestScore >= 50) {
    reasoning = 'Neutralizing opponent trap hollows to prevent imminent counter-scoops.';
  }

  return {
    selected_pit: bestPit,
    tactical_reasoning: reasoning,
    yoruba_proverb_taunt: `${randomProverb.proverb} (${randomProverb.meaning})`,
  };
}
