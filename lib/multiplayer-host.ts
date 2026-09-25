/**
 * Authoritative Host Multiplayer State Machine & WebRTC Transport — Ayò Ọlọ́pọ́n Digital
 * Strict compliance with AGENTS.md & authoritative-multiplayer.md
 */

import { GameState, NetworkMessage, PlayerSide } from '@/types/ayo';
import { executeMove, assert48SeedConservation, InvariantError } from './ayo-engine';

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
  public status: PeerConnectionStatus = 'disconnected';
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localBroadcast: BroadcastChannel | null = null;
  private moveSequence: number = 0;
  private callbacks: MultiplayerCallbacks;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(role: PlayerSide, roomId: string, callbacks: MultiplayerCallbacks, playerName?: string) {
    this.role = role;
    this.roomId = roomId;
    this.callbacks = callbacks;
    this.playerName = playerName;

    // Use BroadcastChannel for zero-config multi-tab local play on the same machine
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.localBroadcast = new BroadcastChannel(`ayo-room-${roomId}`);
      this.localBroadcast.onmessage = (event) => this.handleIncomingMessage(event.data);
    }
  }

  public setStatus(newStatus: PeerConnectionStatus) {
    this.status = newStatus;
    this.callbacks.onStatusChange(newStatus);
  }

  /**
   * Initializes WebRTC connection.
   */
  public async initConnection(): Promise<void> {
    if (typeof window === 'undefined') return;

    this.setStatus('connecting');
    this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'connected') {
        this.clearReconnectTimer();
        this.setStatus('connected');
      } else if (state === 'disconnected') {
        this.startReconnectTimer();
      } else if (state === 'failed') {
        this.setStatus('disconnected');
        this.callbacks.onError('WebRTC connection failed.');
      }
    };

    if (this.role === 'south') {
      // Host creates DataChannel
      this.dataChannel = this.peerConnection.createDataChannel('ayo-game-sync', {
        ordered: true,
      });
      this.setupDataChannel(this.dataChannel);
    } else {
      // Client awaits DataChannel
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannel(this.dataChannel);
      };
    }

    if (this.role === 'north') {
      // Announce challenge acceptance immediately across local and network channels
      this.sendChallengeAccepted();
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
      // Host executes directly
      try {
        const nextState = executeMove(currentState, pitIndex);
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
        return currentState;
      }
    } else {
      // Client dispatches MOVE_ACTION only
      this.moveSequence++;
      this.broadcastMessage({
        type: 'MOVE_ACTION',
        moveId: this.moveSequence,
        pitIndex,
        sender: 'north',
        playerName: this.playerName,
      });
      return currentState; // Client does NOT mutate locally until STATE_SYNC arrives
    }
  }

  /**
   * Internal message handler.
   */
  private handleIncomingMessage(msg: NetworkMessage) {
    if (msg.sender === this.role) return; // Ignore self-broadcasts

    switch (msg.type) {
      case 'CHALLENGE_ACCEPTED':
        if (this.role === 'south') {
          this.setStatus('connected');
          if (msg.playerName) {
            this.callbacks.onOpponentName?.(msg.playerName);
          }
          this.callbacks.onChallengeAccepted?.(msg.playerName);
          this.broadcastCurrentState();
        }
        break;

      case 'MOVE_ACTION':
        if (this.role === 'south' && typeof msg.pitIndex === 'number') {
          // Host receives Client move intent, runs engine, and broadcasts back
          this.executeAndBroadcastHost(msg.pitIndex);
        }
        break;

      case 'STATE_SYNC':
        if (msg.state) {
          try {
            assert48SeedConservation(msg.state);
            this.setStatus('connected');
            if (msg.playerName) {
              this.callbacks.onOpponentName?.(msg.playerName);
            }
            this.callbacks.onStateUpdate(msg.state);
          } catch (e) {
            console.warn('[Multiplayer] State desync detected. Requesting resync.');
            this.setStatus('desynced');
            this.requestResync();
          }
        }
        break;

      case 'RESYNC_REQUEST':
        if (this.role === 'south') {
          // Host retransmits authoritative state
          this.broadcastCurrentState();
        }
        break;

      case 'FORFEIT':
        this.callbacks.onOpponentForfeit();
        break;
    }
  }

  private hostStateProvider: (() => GameState) | null = null;

  public registerHostStateProvider(provider: () => GameState) {
    this.hostStateProvider = provider;
  }

  private executeAndBroadcastHost(clientPitIndex: number) {
    if (!this.hostStateProvider) return;
    const currentState = this.hostStateProvider();

    try {
      const nextState = executeMove(currentState, clientPitIndex);
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

  private broadcastCurrentState() {
    if (!this.hostStateProvider) return;
    const currentState = this.hostStateProvider();
    this.broadcastMessage({
      type: 'STATE_SYNC',
      moveId: this.moveSequence,
      state: currentState,
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

    // Send via active WebRTC DataChannel if open
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(payload);
    }

    // Also send via local BroadcastChannel (for multi-tab same-browser testing)
    if (this.localBroadcast) {
      this.localBroadcast.postMessage(message);
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
    if (this.dataChannel) this.dataChannel.close();
    if (this.peerConnection) this.peerConnection.close();
    if (this.localBroadcast) this.localBroadcast.close();
    this.setStatus('disconnected');
  }
}
