/**
 * Universal TypeScript Contracts — Ayò Ọlọ́pọ́n Digital
 * Canonical specification from AGENTS.md & PRD v1.2.0
 */

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
  zeroCaptureTurnCount: number; // Counter for consecutive turns without a capture
  lastMove?: {
    player: PlayerSide;
    pitIndex: number;
    capturedSeeds: number;
    sownPits?: number[];        // Visual sequence of pits visited during sowing
  };
}

export interface AIMoveRequest {
  board: number[];              // 12-integer array [0..11]
  scores: { south: number; north: number };
  currentTurn: 'north';
  legalMoves: number[];         // Pre-filtered subset of [6..11]
}

export interface AIMoveResponse {
  selected_pit: number;         // Guaranteed legal index between 6 and 11
  tactical_reasoning: string;   // Strategic breakdown
  yoruba_proverb_taunt: string; // Authentic Yoruba proverb with cultural context
}

export type NetworkMessageType = 
  | 'MOVE_ACTION' 
  | 'STATE_SYNC' 
  | 'RESYNC_REQUEST' 
  | 'FORFEIT';

export interface NetworkMessage {
  type: NetworkMessageType;
  moveId: number;               // Strictly incrementing sequence number (1-indexed)
  pitIndex?: number;            // [0..5] for South, [6..11] for North
  state?: GameState;            // Authoritative snapshot from Host
  sender: PlayerSide;
}

export type SignalingMessageType =
  | 'ROOM_CREATE'
  | 'ROOM_JOIN'
  | 'PEER_OFFER'
  | 'PEER_ANSWER'
  | 'ICE_CANDIDATE'
  | 'PEER_DISCONNECT';

export interface SignalingMessage {
  type: SignalingMessageType;
  roomId: string;
  payload?: any;
}
