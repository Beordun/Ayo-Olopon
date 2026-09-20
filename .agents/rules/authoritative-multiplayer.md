# Rule: Authoritative Host Multiplayer & Network Topology

## Scope & Target Files
- Target: `lib/multiplayer-host.ts`, `components/MultiplayerModal.tsx`, `types/ayo.ts`

## 1. Network Topology: Host Authority Pattern
To eliminate split-brain board states and race conditions without requiring centralized database sync:
- **Player 1 (Room Creator / South)**: Sole **Authoritative Host Engine**. Maintains master state, validates moves, executes captures, checks invariants, and broadcasts updates.
- **Player 2 (Invited Peer / North)**: **Client**. Dispatches move intents only; never mutates local state directly.

## 2. WebRTC Signaling Protocol
Signaling between Host and Client operates over an ephemeral broadcast channel or serverless signaling relay:

```typescript
export type SignalingMessageType =
  | 'ROOM_CREATE'     // Host announces room code
  | 'ROOM_JOIN'       // Client requests to join room code
  | 'PEER_OFFER'      // WebRTC SDP Offer from Host
  | 'PEER_ANSWER'     // WebRTC SDP Answer from Client
  | 'ICE_CANDIDATE'   // ICE Candidate exchange
  | 'PEER_DISCONNECT';// Peer left room

export interface SignalingMessage {
  type: SignalingMessageType;
  roomId: string;
  payload?: any;
}
```

## 3. Active Gameplay Protocol (`types/ayo.ts`)
Once WebRTC DataChannel transitions to `open`, game actions transmit via JSON:

```typescript
export type NetworkMessageType = 
  | 'MOVE_ACTION' 
  | 'STATE_SYNC' 
  | 'RESYNC_REQUEST' 
  | 'FORFEIT';

export interface NetworkMessage {
  type: NetworkMessageType;
  moveId: number;               // Strictly incrementing integer starting at 1
  pitIndex?: number;            // [0..5] for South, [6..11] for North
  state?: GameState;            // Authoritative snapshot from Host
  sender: PlayerSide;
}
```

### Sequence Flow & Move Validation
1. **Player 1 Turn (Host)**:
   - Host executes `executeMove(state, pitIndex)`.
   - Host asserts 48-seed invariant.
   - Host increments `moveId` and broadcasts `{ type: 'STATE_SYNC', moveId, state, sender: 'south' }`.
2. **Player 2 Turn (Client)**:
   - Client sends `{ type: 'MOVE_ACTION', pitIndex, moveId: expectedMoveId, sender: 'north' }`.
   - Host validates whether `pitIndex` is in `[6..11]` and `getLegalMoves(state, 'north')`.
   - Host executes `executeMove`, increments `moveId`, and broadcasts `{ type: 'STATE_SYNC', moveId, state, sender: 'south' }`.
   - Client updates local state upon receiving `STATE_SYNC`.

## 4. Invariant Rollback, Resync Recovery & Disconnect Policy
1. **Resync Trigger**:
   - If Client receives a `STATE_SYNC` where $\sum \text{board} + \text{scores} \ne 48$, or `moveId` skips a sequence number:
     - Client immediately dispatches `{ type: 'RESYNC_REQUEST', moveId: currentMoveId, sender: 'north' }`.
     - Host retransmits full authoritative `GameState` snapshot.
2. **Latency Ceiling**:
   - Round-trip move sync must complete within $\le 80\text{ms}$ over active data channels.
3. **Disconnect Grace Period**:
   - If peer connection drops, UI displays *"Reconnecting..."* for a **15-second grace period**.
   - If reconnection fails after 15 seconds, the disconnected player is forfeited and the connected player is awarded victory.
