/**
 * Authoritative Host Multiplayer State Machine & WebRTC Transport — Ayò Ọlọ́pọ́n Digital
 * Strict compliance with AGENTS.md Invariant 1 & 2
 */

import { GameState, NetworkMessage, PlayerSide } from '@/types/ayo';
import { executeMove, assert48SeedConservation, createInitialState } from './ayo-engine';

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
  private pollTimer: any = null;
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
    this.roomId = roomId;
    this.callbacks = callbacks;
    this.playerName = playerName;
    this.authoritativeState = initialState ? JSON.parse(JSON.stringify(initialState)) : createInitialState();

    // Use BroadcastChannel for zero-config multi-tab local play on the same machine
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.localBroadcast = new BroadcastChannel(`ayo-room-${roomId}`);
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

    // 2. Start server relay polling loop (guaranteed cross-device delivery)
    this.startPollingLoop();

    // 3. WebRTC Peer Connection (direct low-latency transport where available)
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
      console.warn('[Multiplayer] WebRTC init skipped, relying on HTTP relay:', err);
    }

    if (this.role === 'north') {
      // Announce challenge acceptance immediately across relay and local channels
      this.sendChallengeAccepted();
    }
  }

  private startPollingLoop() {
    this.clearPollingLoop();
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/multiplayer?room=${encodeURIComponent(this.roomId)}&role=${this.role}&lastId=${this.lastPollMessageId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (typeof data.latestMessageId === 'number' && data.latestMessageId > this.lastPollMessageId) {
            this.lastPollMessageId = data.latestMessageId;
          }

          // Role-specific discovery
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

          // Initial state synchronization for joining Client
          if (this.role === 'north' && data.currentState && this.status !== 'connected') {
            this.authoritativeState = data.currentState;
            this.setStatus('connected');
            this.callbacks.onStateUpdate(data.currentState);
          }

          if (data.messages && Array.isArray(data.messages)) {
            for (const msg of data.messages) {
              this.handleIncomingMessage(msg);
            }
          }
        }
      } catch {
        // Network jitter or transient error, keep loop running
      }
    };

    poll();
    this.pollTimer = setInterval(poll, 350);
  }

  private clearPollingLoop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
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
      // Client dispatches MOVE_ACTION only to authoritative Host
      this.moveSequence++;
      this.broadcastMessage({
        type: 'MOVE_ACTION',
        moveId: this.moveSequence,
        pitIndex,
        sender: 'north',
        playerName: this.playerName,
      });
      return currentState; // Client does NOT mutate locally until authoritative STATE_SYNC arrives
    }
  }

  /**
   * Internal message handler.
   */
  private handleIncomingMessage(msg: NetworkMessage) {
    if (msg.sender === this.role) return; // Ignore self-broadcasts

    // Deduplicate identical packets received across multiple transports (BroadcastChannel + HTTP Relay)
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
          // Host receives Client move intent, executes against authoritative state, and broadcasts
          this.executeAndBroadcastHost(msg.pitIndex);
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
    // Kept for backward compatibility, but authoritativeState takes precedence
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

  private executeAndBroadcastHost(clientPitIndex: number) {
    try {
      const nextState = executeMove(this.authoritativeState, clientPitIndex);
      this.authoritativeState = nextState;
      this.moveSequence++;
      this.callbacks.onStateUpdate(nextState);
      this.broadcastMessage({
        type: 'STATE_SYNC',
        moveId: this.moveSequence,
        state: nextState,
        sender: 'south',
        playerName: this.playerName,
      });
    } catch (err: any) {
      this.callbacks.onError(err.message || 'Illegal move from opponent');
      this.requestResync();
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
      }).catch(() => {});
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
    this.clearReconnectTimer();
    this.clearPollingLoop();
    if (this.dataChannel) this.dataChannel.close();
    if (this.peerConnection) this.peerConnection.close();
    if (this.localBroadcast) this.localBroadcast.close();
    this.setStatus('disconnected');
  }
}
