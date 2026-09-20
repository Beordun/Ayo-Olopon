---
name: gemini-ota-ayo-evaluator
description: >-
  Use this skill to benchmark, test, and evaluate the Gemini AI Grandmaster (Ọ̀tá Ayò)
  endpoint (/api/ai-move), ensuring latency is strictly within the 1,200ms budget, verifying
  JSON schema conformance, checking Yoruba proverb authenticity, and validating the minimax fallback.
---

# Gemini Ọ̀tá Ayò Evaluator & Benchmark Skill

This skill provides automated scripts and verification protocols to evaluate `app/api/ai-move/route.ts` and `lib/ayo-heuristics.ts`.

## Evaluation Criteria

1. **Strict Latency Budget ($\le 1,200\text{ms}$)**:
   - Server handler enforces internal `AbortController` timeout at **$1,100\text{ms}$**.
   - Total HTTP response latency must never exceed **$1,200\text{ms}$**.
2. **JSON Schema Integrity (`AIMoveResponse`)**:
   ```typescript
   {
     selected_pit: number;          // 6..11
     tactical_reasoning: string;    // Grandmaster strategic explanation
     yoruba_proverb_taunt: string;  // Authentic Yoruba proverb + English context
   }
   ```
3. **Legal Move Conformance**:
   - `selected_pit` must exist within the provided `legalMoves: number[]`.
   - Hallucinated or illegal indices must be intercepted server-side and replaced with the top heuristic candidate.
4. **Offline / Outage Fallback**:
   - If `GEMINI_API_KEY` is missing or when network requests fail, the route executes `lib/ayo-heuristics.ts` and returns status 200 within $< 50\text{ms}$.

## Automated Benchmark Execution
Run the automated test runner in `references/benchmarking.md`:
```bash
node -e "require('./references/benchmarking.js').runBenchmark()"
```
Or run the curl check against the local dev server:
```bash
curl -X POST http://localhost:3000/api/ai-move \
  -H "Content-Type: application/json" \
  -d '{"board":[4,4,4,4,4,4,4,4,4,4,4,4],"scores":{"south":0,"north":0},"currentTurn":"north","legalMoves":[6,7,8,9,10,11]}'
```

See [references/benchmarking.md](./references/benchmarking.md) for the benchmark script and proverb bank.
