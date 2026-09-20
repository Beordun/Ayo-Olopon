---
name: multiplayer-sync-validator
description: >-
  Use this skill to validate and debug peer-to-peer multiplayer synchronization in Ayò Ọlọ́pọ́n,
  testing the Authoritative Host topology, WebRTC DataChannel messaging, state sync broadcasts,
  desynchronization recovery via RESYNC_REQUEST, and invariant auditing.
---

# Multiplayer Sync Validator Skill

This skill provides testing procedures to verify Authoritative Host multiplayer synchronization between Player 1 (South / Host) and Player 2 (North / Client).

## Verification Objectives

1. **Host Authority Invariant**:
   - Player 2 sends only `{ type: "MOVE_ACTION", pitIndex: number, moveId: number }`.
   - Player 2 NEVER mutates local state directly; state only updates upon receiving `{ type: "STATE_SYNC", state: GameState }` from Host.
2. **Move Validation by Host**:
   - Host verifies `pitIndex` is in `[6..11]` and `getLegalMoves(state, 'north')`.
   - Host asserts the 48-seed conservation invariant before broadcasting.
3. **Resync on Packet Drop or Invariant Breach**:
   - If Client detects $\sum \text{board} + \text{scores} \ne 48$ or an out-of-order `moveId`, Client dispatches `{ type: "RESYNC_REQUEST" }`.
   - Host immediately responds with the authoritative full-state snapshot.
4. **Latency Ceiling ($\le 80\text{ms}$)**:
   - Round-trip move sync must complete within $80\text{ms}$.

## Automated Verification Protocol
Instead of relying on manual browser clicking, execute the automated headless peer simulation:
```bash
node -e "require('./references/protocol_spec.js').runProtocolTest()"
```

For manual testing steps and network payload schemas, see [references/protocol_spec.md](./references/protocol_spec.md).
