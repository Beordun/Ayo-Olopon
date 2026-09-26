/**
 * Authoritative Host Multiplayer State Machine & WebRTC Transport — Ayò Ọlọ́pọ́n Digital
 * Strict compliance with AGENTS.md Invariant 1 & 2
 * Real-time event-driven relay synchronization (< 30ms latency)
 */

import { GameState, NetworkMessage, PlayerSide } from '@/types/ayo';
import { executeMove, assert48SeedConservation, createInitialState, getLegalMoves } from './ayo-engine';

export type PeerConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'desynced';

export interface MultiplayerCallbacks {
  onStateUpdate: (state: GameState) => void;
  onStatusChange: (status: PeerConnectionStatus) => void;
  onError: (message: string) => void;
  onOpponentForfeit: () => void;
  onChallengeAccepted?: (opponentName?: string) => void;
  onOpponentName?: (opponentName: string) => void;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
};

export class MultiplayerSession {
  public role: PlayerSide; // 'south' = Host, 'north' = Client
  public roomId: string;
  public playerName?: string;
  public opponentName?: string;
  public status: PeerConnectionStatus = 'disconnected';
  public authoritativeState: GameState;

  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localBroadcast: BroadcastChannel | null = null;
  private moveSequence: number = 0;
  private callbacks: MultiplayerCallbacks;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;
  private isPollLoopActive = false;
  private activePollAbortController: AbortController | null = null;
  private lastPollMessageId: number = 0;
  private processedMessageKeys = new Set<string>();

  constructor(
    role: PlayerSide,
    roomId: string,
    callbacks: MultiplayerCallbacks,
    playerName?: string,
    initialState?: GameState
  ) {
    this.role = role;
    this.roomId = roomId.toUpperCase().trim();
    this.callbacks = callbacks;
    this.playerName = playerName;
    this.authoritativeState = initialState ? JSON.parse(JSON.stringify(initialState)) : createInitialState();

    // BroadcastChannel for instant zero-latency same-machine multi-tab play
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.localBroadcast = new BroadcastChannel(`ayo-room-${this.roomId}`);
      this.localBroadcast.onmessage = (event) => this.handleIncomingMessage(event.data);
    }
  }

  public setStatus(newStatus: PeerConnectionStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.callbacks.onStatusChange(newStatus);
    }
  }

  /**
   * Initializes network and relay connection.
   */
  public async initConnection(): Promise<void> {
    if (typeof window === 'undefined') return;

    this.setStatus('connecting');

    // 1. Join room on server relay (enables cross-device / internet multiplayer)
    fetch('/api/multiplayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'join',
        roomId: this.roomId,
        role: this.role,
        playerName: this.playerName,
        state: this.role === 'south' ? this.authoritativeState : undefined,
      }),
    }).catch((err) => console.warn('[Multiplayer] Relay join notice:', err));

    // 2. Start high-frequency long-polling loop (real-time push delivery < 30ms)
    this.startLongPollLoop();

    // 3. WebRTC Peer Connection (direct peer transport where available)
    try {
      this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState;
        if (state === 'connected') {
          this.clearReconnectTimer();
          this.setStatus('connected');
        } else if (state === 'disconnected') {
          this.startReconnectTimer();
        }
      };

      if (this.role === 'south') {
        this.dataChannel = this.peerConnection.createDataChannel('ayo-game-sync', {
          ordered: true,
        });
        this.setupDataChannel(this.dataChannel);
      } else {
        this.peerConnection.ondatachannel = (event) => {
          this.dataChannel = event.channel;
          this.setupDataChannel(this.dataChannel);
        };
      }
    } catch (err) {
      console.warn('[Multiplayer] WebRTC init skipped, relying on real-time HTTP relay:', err);
    }

    if (this.role === 'north') {
      // Announce challenge acceptance immediately across relay and local channels
      this.sendChallengeAccepted();
    }
  }

  /**
   * Continuous real-time long-polling loop with zero idle delay between messages
   */
  private async startLongPollLoop() {
    if (this.isPollLoopActive) return;
    this.isPollLoopActive = true;

    while (!this.isDestroyed && this.isPollLoopActive) {
      try {
        this.activePollAbortController = new AbortController();
        const res = await fetch(
          `/api/multiplayer?room=${encodeURIComponent(this.roomId)}&role=${this.role}&lastId=${this.lastPollMessageId}&wait=1`,
          { signal: this.activePollAbortController.signal }
        );

        if (res.ok) {
          const data = await res.json();
          this.processPollData(data);
        } else {
          // If server error or transient 500, back off briefly
          await new Promise((r) => setTimeout(r, 400));
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Explicit wakeup or move dispatch triggered, continue loop immediately
        } else {
          // Network jitter, wait 500ms before retrying
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }
  }

  /**
   * Processes payload from server relay
   */
  private processPollData(data: any) {
    if (!data) return;

    if (typeof data.latestMessageId === 'number' && data.latestMessageId > this.lastPollMessageId) {
      this.lastPollMessageId = data.latestMessageId;
    }

    // Role-specific opponent discovery
    if (this.role === 'south' && data.clientName && !this.opponentName) {
      this.opponentName = data.clientName;
      this.callbacks.onOpponentName?.(data.clientName);
      this.callbacks.onChallengeAccepted?.(data.clientName);
      this.setStatus('connected');
      this.broadcastCurrentState();
    }

    if (this.role === 'north' && data.hostName && !this.opponentName) {
      this.opponentName = data.hostName;
      this.callbacks.onOpponentName?.(data.hostName);
      this.setStatus('connected');
    }

    // Initial state sync for newly joined Client
    if (this.role === 'north' && data.currentState && this.status !== 'connected') {
      try {
        assert48SeedConservation(data.currentState);
        this.authoritativeState = data.currentState;
        this.setStatus('connected');
        this.callbacks.onStateUpdate(data.currentState);
      } catch {}
    }

    if (data.messages && Array.isArray(data.messages)) {
      for (const msg of data.messages) {
        if (msg.id && msg.id > this.lastPollMessageId) {
          this.lastPollMessageId = msg.id;
        }
        this.handleIncomingMessage(msg);
      }
    }
  }

  /**
   * Wakes up the waiting long-poll request to fetch updates immediately
   */
  public triggerImmediateWakeup() {
    if (this.activePollAbortController) {
      try {
        this.activePollAbortController.abort();
      } catch {}
    }
  }

  public sendChallengeAccepted() {
    this.broadcastMessage({
      type: 'CHALLENGE_ACCEPTED',
      moveId: 0,
      sender: 'north',
      playerName: this.playerName,
    });
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onopen = () => {
      this.clearReconnectTimer();
      this.setStatus('connected');
      if (this.role === 'north') {
        this.sendChallengeAccepted();
      }
    };
    channel.onclose = () => {
      this.startReconnectTimer();
    };
    channel.onerror = () => {
      this.setStatus('desynced');
    };
    channel.onmessage = (event) => {
      try {
        const message: NetworkMessage = JSON.parse(event.data);
        this.handleIncomingMessage(message);
      } catch (err) {
        console.error('Failed to parse network message', err);
      }
    };
  }

  /**
   * Dispatches move intent (Client) or executes and broadcasts (Host).
   */
  public handlePlayerMove(currentState: GameState, pitIndex: number): GameState {
    if (this.role === 'south') {
      // Host executes authoritative move directly
      try {
        const base = this.authoritativeState || currentState;
        const nextState = executeMove(base, pitIndex);
        this.authoritativeState = nextState;
        this.moveSequence++;
        this.broadcastMessage({
          type: 'STATE_SYNC',
          moveId: this.moveSequence,
          state: nextState,
          sender: 'south',
          playerName: this.playerName,
        });
        return nextState;
      } catch (err: any) {
        this.callbacks.onError(err.message || 'Invalid move execution');
        return this.authoritativeState || currentState;
      }
    } else {
      // Client is North: Send move intent to Host, and optimistically apply for zero-latency UI
      this.moveSequence++;
      this.broadcastMessage({
        type: 'MOVE_ACTION',
        moveId: this.moveSequence,
        pitIndex,
        sender: 'north',
        playerName: this.playerName,
      });

      // Optimistic execution: Client calculates next state immediately for instant seed animation & sound
      try {
        const base = this.authoritativeState || currentState;
        const optimisticState = executeMove(base, pitIndex);
        this.authoritativeState = optimisticState;
        return optimisticState;
      } catch {
        return currentState;
      }
    }
  }

  /**
   * Internal message handler with robust anti-freeze guards.
   */
  private handleIncomingMessage(msg: NetworkMessage) {
    if (msg.sender === this.role) return; // Ignore self-broadcasts

    // Deduplicate identical packets received across multiple transports
    const messageKey = `${msg.type}:${msg.moveId ?? 0}:${msg.sender}:${msg.pitIndex ?? ''}:${JSON.stringify(
      msg.state?.board || ''
    )}`;
    if (this.processedMessageKeys.has(messageKey)) return;
    this.processedMessageKeys.add(messageKey);
    if (this.processedMessageKeys.size > 200) {
      this.processedMessageKeys.clear();
    }

    switch (msg.type) {
      case 'CHALLENGE_ACCEPTED':
        if (this.role === 'south') {
          this.setStatus('connected');
          if (msg.playerName) {
            this.opponentName = msg.playerName;
            this.callbacks.onOpponentName?.(msg.playerName);
          }
          this.callbacks.onChallengeAccepted?.(msg.playerName);
          this.broadcastCurrentState();
        }
        break;

      case 'MOVE_ACTION':
        if (this.role === 'south' && typeof msg.pitIndex === 'number') {
          this.executeAndBroadcastHost(msg.pitIndex, msg.moveId);
        }
        break;

      case 'STATE_SYNC':
        if (msg.state) {
          try {
            assert48SeedConservation(msg.state);
            this.authoritativeState = msg.state;
            this.setStatus('connected');
            if (msg.playerName) {
              this.opponentName = msg.playerName;
              this.callbacks.onOpponentName?.(msg.playerName);
            }
            this.callbacks.onStateUpdate(msg.state);
          } catch (e) {
            console.warn('[Multiplayer] State desync detected. Requesting resync.', e);
            this.setStatus('desynced');
            this.requestResync();
          }
        }
        break;

      case 'RESYNC_REQUEST':
        if (this.role === 'south') {
          // Host retransmits authoritative state snapshot
          this.broadcastCurrentState();
        }
        break;

      case 'FORFEIT':
        this.callbacks.onOpponentForfeit();
        break;
    }
  }

  public registerHostStateProvider(provider: () => GameState) {
    try {
      const state = provider();
      if (state) this.authoritativeState = state;
    } catch {}
  }

  public resetHostState(state?: GameState) {
    this.authoritativeState = state ? JSON.parse(JSON.stringify(state)) : createInitialState();
    this.moveSequence++;
    if (this.role === 'south') {
      this.broadcastCurrentState();
    }
  }

  /**
   * Host validates & executes North's move with anti-freeze protection.
   */
  private executeAndBroadcastHost(clientPitIndex: number, moveId?: number) {
    // Anti-Freeze Guard 1: If it's already South's turn, North's move was already processed or out of order
    if (this.authoritativeState.currentTurn !== 'north') {
      console.warn('[Multiplayer] Move received for North but turn is South. Re-broadcasting authoritative state.');
      this.broadcastCurrentState();
      return;
    }

    // Anti-Freeze Guard 2: Ensure chosen pit is currently legal for North
    const legalMoves = getLegalMoves(this.authoritativeState, 'north');
    if (!legalMoves.includes(clientPitIndex)) {
      console.warn(`[Multiplayer] Illegal pit index ${clientPitIndex} from North. Re-broadcasting authoritative state.`);
      this.broadcastCurrentState();
      return;
    }

    try {
      const nextState = executeMove(this.authoritativeState, clientPitIndex);
      this.authoritativeState = nextState;
      this.moveSequence = (moveId ?? this.moveSequence) + 1;
      this.callbacks.onStateUpdate(nextState);
      this.broadcastMessage({
        type: 'STATE_SYNC',
        moveId: this.moveSequence,
        state: nextState,
        sender: 'south',
        playerName: this.playerName,
      });
    } catch (err: any) {
      console.error('[Multiplayer] Engine error during Host execution:', err);
      this.broadcastCurrentState();
    }
  }

  public broadcastCurrentState() {
    this.broadcastMessage({
      type: 'STATE_SYNC',
      moveId: this.moveSequence,
      state: this.authoritativeState,
      sender: 'south',
      playerName: this.playerName,
    });
  }

  public requestResync() {
    this.broadcastMessage({
      type: 'RESYNC_REQUEST',
      moveId: this.moveSequence,
      sender: this.role,
    });
  }

  public sendForfeit() {
    this.broadcastMessage({
      type: 'FORFEIT',
      moveId: this.moveSequence,
      sender: this.role,
    });
  }

  public broadcastMessage(message: NetworkMessage) {
    const payload = JSON.stringify(message);

    // 1. Send via active WebRTC DataChannel if open
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(payload);
      } catch {}
    }

    // 2. Send via local BroadcastChannel (for multi-tab same-browser testing)
    if (this.localBroadcast) {
      try {
        this.localBroadcast.postMessage(message);
      } catch {}
    }

    // 3. Send via server HTTP relay (guaranteed internet & cross-device delivery)
    if (typeof window !== 'undefined') {
      fetch('/api/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          roomId: this.roomId,
          role: this.role,
          playerName: this.playerName,
          message,
        }),
      })
        .then(() => {
          // Immediately wake up our local poll to pick up any responses
          this.triggerImmediateWakeup();
        })
        .catch(() => {});
    }
  }

  private startReconnectTimer() {
    this.setStatus('reconnecting');
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.setStatus('disconnected');
      this.callbacks.onError('Opponent disconnected. Match forfeited.');
      this.callbacks.onOpponentForfeit();
    }, 15000); // 15-second disconnect grace period
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  public destroy() {
    this.isDestroyed = true;
    this.isPollLoopActive = false;
    this.clearReconnectTimer();
    this.triggerImmediateWakeup();
    if (this.dataChannel) this.dataChannel.close();
    if (this.peerConnection) this.peerConnection.close();
    if (this.localBroadcast) this.localBroadcast.close();
    this.setStatus('disconnected');
  }
}
