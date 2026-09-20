# Rule: AI Grandmaster (Ọ̀tá Ayò) Contract & Fallback Architecture

## Scope & Target Files
- Target: `app/api/ai-move/route.ts`, `lib/ayo-heuristics.ts`, `components/AiDialogueBox.tsx`, `types/ayo.ts`

## 1. Security & Model Selection
- `GEMINI_API_KEY` must NEVER be exposed to the browser or prefixed with `NEXT_PUBLIC_`.
- Serverless Route: All Gemini calls execute strictly within `app/api/ai-move/route.ts`.
- **Target Model**: `gemini-2.0-flash` (with secondary fallback to `gemini-1.5-flash`).
- Configuration: `temperature: 0.7`, `maxOutputTokens: 256`, system instructions establishing the persona of *Ọ̀tá Ayò* (ancient Yoruba board master).

## 2. Strict Latency Budget & Hard Fail-Safe (1,200ms)
- Total turn latency budget for AI computation: **$1,200\text{ms}$ maximum**.
- In `app/api/ai-move/route.ts`, implement an `AbortController` with a timeout of **$1,100\text{ms}$**.
- If Gemini times out, throws a network/rate-limit error, or returns an unparsable response:
  - Immediately compute and return the move using the deterministic Minimax heuristic engine in `lib/ayo-heuristics.ts`.
  - Provide an authentic fallback Yoruba proverb from the curated pool.
  - Zero UI freezing or hanging.

## 3. Strict Request & Response Contracts

### Incoming Request Payload (`AIMoveRequest`)
```typescript
export interface AIMoveRequest {
  board: number[];              // 12-integer array [0..11]
  scores: {
    south: number;
    north: number;
  };
  currentTurn: 'north';
  legalMoves: number[];         // Pre-filtered subset of [6..11]
}
```

### Outgoing Response Payload (`AIMoveResponse`)
```typescript
export interface AIMoveResponse {
  selected_pit: number;          // Guaranteed legal index between 6 and 11
  tactical_reasoning: string;    // Grandmaster strategic explanation
  yoruba_proverb_taunt: string;  // Authentic proverb (Òwe) with cultural context
}
```

### Prompt Guardrails & Move Validation
1. **Candidate Pre-Filtering**: The client/server sends pre-filtered `legalMoves: number[]` (indices 6..11) to the prompt. Gemini is explicitly instructed to choose ONLY from this array.
2. **Server-Side Validation**: Before returning the response, `route.ts` must verify `legalMoves.includes(result.selected_pit)`. If Gemini hallucinates an illegal index or an index on South's side (`0..5`), the server immediately overrides it with the top-ranked heuristic move from `lib/ayo-heuristics.ts`.

## 4. Minimax Heuristics Architecture & Numerical Weights (`lib/ayo-heuristics.ts`)
The offline fallback engine evaluates candidate moves with a 1-ply immediate outcome analysis using explicit mathematical weights:

```typescript
export function evaluateMove(state: GameState, pitIndex: number): number {
  // Simulate move in a sandbox clone
  const nextState = simulateMove(state, pitIndex);
  let score = 0;

  // Priority 1: Captured seeds (+100 points per seed captured)
  const captured = nextState.scores.north - state.scores.north;
  score += captured * 100;

  // Priority 2: Defusing opponent 3-seed traps (+50 points)
  // Check if this move prevented South pits from having exactly 3 seeds
  const trapsDefused = countSouthTraps(state) - countSouthTraps(nextState);
  score += trapsDefused * 50;

  // Priority 3: Protecting friendly accumulator hollows (+30 points)
  // Preserves pits holding >= 10 seeds from being targeted
  if (state.board[pitIndex] >= 10 && captured > 0) {
    score += 30;
  }

  // Priority 4: Preserving mobility & feeding obligations (+20 points)
  const opponentSeeds = sum(nextState.board.slice(0, 6));
  if (opponentSeeds > 0) {
    score += 20; // Successfully maintains legal opponent play
  }

  return score;
}
```
- Computation ceiling: $\le 15\text{ms}$ total execution time.
