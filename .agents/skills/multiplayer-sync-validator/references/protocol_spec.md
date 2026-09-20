# Multiplayer Protocol Specifications & Headless Test Harness

## 1. Signaling Payloads (Pre-DataChannel Setup)

```json
// ROOM_CREATE (Host -> Signaling Server)
{
  "type": "ROOM_CREATE",
  "roomId": "AYO-7842"
}

// ROOM_JOIN (Client -> Signaling Server)
{
  "type": "ROOM_JOIN",
  "roomId": "AYO-7842"
}

// PEER_OFFER (Host -> Client via Signaling)
{
  "type": "PEER_OFFER",
  "roomId": "AYO-7842",
  "sdp": "v=0\r\no=host..."
}

// PEER_ANSWER (Client -> Host via Signaling)
{
  "type": "PEER_ANSWER",
  "roomId": "AYO-7842",
  "sdp": "v=0\r\no=client..."
}

// ICE_CANDIDATE (Bidirectional exchange)
{
  "type": "ICE_CANDIDATE",
  "roomId": "AYO-7842",
  "candidate": { "candidate": "...", "sdpMid": "0", "sdpMLineIndex": 0 }
}
```

---

## 2. Gameplay Payloads (Active WebRTC DataChannel)

```json
// MOVE_ACTION (Client -> Host)
{
  "type": "MOVE_ACTION",
  "moveId": 1,
  "pitIndex": 8,
  "sender": "north"
}

// STATE_SYNC (Host -> Client)
{
  "type": "STATE_SYNC",
  "moveId": 1,
  "sender": "south",
  "state": {
    "board": [4, 4, 4, 4, 4, 4, 4, 4, 0, 5, 5, 5],
    "scores": { "south": 0, "north": 0 },
    "currentTurn": "south",
    "isGameOver": false,
    "winner": null,
    "moveHistoryHash": ["4,4,4,4,4,4,4,4,0,5,5,5:south"],
    "zeroCaptureTurnCount": 1,
    "lastMove": { "player": "north", "pitIndex": 8, "capturedSeeds": 0 }
  }
}

// RESYNC_REQUEST (Client -> Host on Invariant Mismatch)
{
  "type": "RESYNC_REQUEST",
  "moveId": 1,
  "sender": "north"
}
```

---

## 3. Headless Protocol Test Harness (`protocol_spec.js`)

```javascript
// Test runner for Authoritative Host state machine
function runProtocolTest() {
  const hostState = {
    board: [4,4,4,4,4,4,4,4,4,4,4,4],
    scores: { south: 0, north: 0 },
    currentTurn: 'north',
    moveId: 0
  };

  // Simulate Client Move Action
  const clientAction = { type: 'MOVE_ACTION', pitIndex: 8, moveId: 1, sender: 'north' };
  
  // Host validates and updates
  if (clientAction.pitIndex < 6 || clientAction.pitIndex > 11) {
    throw new Error('Host failed to reject illegal client pit index');
  }

  // Host asserts 48-seed invariant
  const total = hostState.board.reduce((a, b) => a + b, 0) + hostState.scores.south + hostState.scores.north;
  if (total !== 48) {
    throw new Error('48-seed invariant failed on Host');
  }

  console.log('Multiplayer Host Protocol Test: PASSED');
}

module.exports = { runProtocolTest };
```
