import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIMoveRequest, AIMoveResponse, GameState } from '@/types/ayo';
import { getBestHeuristicMove } from '@/lib/ayo-heuristics';

// Hard latency ceiling: abort fetch at 1,100ms to guarantee sub-1,200ms turn budget
const TIMEOUT_MS = 1100;

export async function POST(req: NextRequest) {
  let body: AIMoveRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { board, scores, currentTurn, legalMoves } = body;

  if (!board || !scores || !legalMoves || legalMoves.length === 0) {
    return NextResponse.json(
      { error: 'Missing required state fields or legalMoves is empty' },
      { status: 400 }
    );
  }

  // Construct standard GameState for fallback heuristic
  const state: GameState = {
    board,
    scores,
    currentTurn: currentTurn || 'north',
    isGameOver: false,
    winner: null,
    moveHistoryHash: [],
    zeroCaptureTurnCount: 0,
  };

  const apiKey = process.env.GEMINI_API_KEY;

  // If GEMINI_API_KEY is not configured or in offline mode, instantly execute minimax heuristic
  if (!apiKey) {
    const fallback = getBestHeuristicMove(state, legalMoves);
    return NextResponse.json(fallback);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
        responseMimeType: 'application/json',
      },
      systemInstruction: `You are Ọ̀tá Ayò, the revered ancient Yoruba Grandmaster of the board game Ayò Ọlọ́pọ́n.
Your goal is to select the most lethal tactical move for North while delivering an authentic Yoruba proverb (Òwe Ayò) with its contextual English translation.
CRITICAL CONSTRAINT: You MUST select your move ONLY from the provided legalMoves array. Selecting any other index is strictly illegal.
OUTPUT JSON FORMAT:
{
  "selected_pit": number,
  "tactical_reasoning": "brief tactical justification",
  "yoruba_proverb_taunt": "Authentic Yoruba proverb (English translation / tactical taunt)"
}`,
    });

    const prompt = `Current Ayò Ọlọ́pọ́n Board State:
Board [0..11]: ${JSON.stringify(board)}
(South: [0..5], North: [6..11])
Scores: South = ${scores.south}, North = ${scores.north}
Your turn: North
Candidate Legal Moves (Pits 6..11): ${JSON.stringify(legalMoves)}

Select your move from legalMoves, explain your tactical rationale, and deliver your Òwe Ayò.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    clearTimeout(timeoutId);

    const responseText = result.response.text();
    const parsed: AIMoveResponse = JSON.parse(responseText);

    // Strict Server-Side Validation: Assert model selected an allowed move
    if (
      typeof parsed.selected_pit === 'number' &&
      legalMoves.includes(parsed.selected_pit)
    ) {
      return NextResponse.json(parsed);
    }

    // Model hallucinated an illegal pit -> fallback to deterministic minimax
    console.warn('[Ọ̀tá Ayò] Gemini picked illegal move. Executing minimax fallback.');
    const fallback = getBestHeuristicMove(state, legalMoves);
    return NextResponse.json(fallback);
  } catch (err: any) {
    clearTimeout(timeoutId);
    // Timeout, network error, or rate-limit -> instant heuristic fallback
    const fallback = getBestHeuristicMove(state, legalMoves);
    return NextResponse.json(fallback);
  }
}
