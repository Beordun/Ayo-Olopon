import { NextRequest, NextResponse } from 'next/server';
import { GameState, NetworkMessage, PlayerSide } from '@/types/ayo';

interface RoomMessage {
  id: number;
  message: NetworkMessage;
  timestamp: number;
}

interface RoomData {
  roomId: string;
  hostName?: string;
  clientName?: string;
  currentState?: GameState;
  messages: RoomMessage[];
  nextMessageId: number;
  lastActive: number;
}

// In-memory room registry
const rooms = new Map<string, RoomData>();

// In-memory room notification listeners for real-time long-polling (< 20ms sync)
type RoomListener = () => void;
const roomListeners = new Map<string, Set<RoomListener>>();

function notifyRoomListeners(roomId: string) {
  const normalizedId = roomId.toUpperCase().trim();
  const set = roomListeners.get(normalizedId);
  if (set) {
    set.forEach((listener) => {
      try {
        listener();
      } catch {}
    });
  }
}

// Periodic cleanup of stale rooms (older than 3 hours)
function cleanupStaleRooms() {
  const now = Date.now();
  rooms.forEach((room, id) => {
    if (now - room.lastActive > 3 * 60 * 60 * 1000) {
      rooms.delete(id);
      roomListeners.delete(id);
    }
  });
}

function getOrCreateRoom(roomId: string): RoomData {
  cleanupStaleRooms();
  const normalizedId = roomId.toUpperCase().trim();
  let room = rooms.get(normalizedId);
  if (!room) {
    room = {
      roomId: normalizedId,
      messages: [],
      nextMessageId: 1,
      lastActive: Date.now(),
    };
    rooms.set(normalizedId, room);
  } else {
    room.lastActive = Date.now();
  }
  return room;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('room');
  const role = searchParams.get('role') as PlayerSide | null;
  const lastIdStr = searchParams.get('lastId');
  const lastId = lastIdStr ? parseInt(lastIdStr, 10) : 0;
  const shouldWait = searchParams.get('wait') === '1';

  if (!roomId) {
    return NextResponse.json({ error: 'Missing room parameter' }, { status: 400 });
  }

  const normalizedId = roomId.toUpperCase().trim();
  const room = getOrCreateRoom(normalizedId);

  const getFilteredMessages = () =>
    room.messages.filter((m) => m.id > lastId && (!role || m.message.sender !== role));

  let newMessages = getFilteredMessages();

  // Long-polling: If no new messages and client requested waiting, hold request until notified or 10s timeout
  if (shouldWait && newMessages.length === 0) {
    await new Promise<void>((resolve) => {
      let resolved = false;

      const cleanup = () => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        const set = roomListeners.get(normalizedId);
        if (set) {
          set.delete(onNotify);
          if (set.size === 0) roomListeners.delete(normalizedId);
        }
      };

      const onNotify = () => {
        cleanup();
        resolve();
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve();
      }, 10000); // 10s maximum hold before returning empty heartbeat

      let set = roomListeners.get(normalizedId);
      if (!set) {
        set = new Set();
        roomListeners.set(normalizedId, set);
      }
      set.add(onNotify);
    });

    // Re-check messages after wakeup event
    newMessages = getFilteredMessages();
  }

  return NextResponse.json({
    roomId: room.roomId,
    hostName: room.hostName,
    clientName: room.clientName,
    hasClient: Boolean(room.clientName),
    currentState: room.currentState,
    messages: newMessages.map((m) => ({ id: m.id, ...m.message })),
    latestMessageId: room.messages.length > 0 ? room.messages[room.messages.length - 1].id : 0,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomId, role, playerName, message, state } = body;

    if (!roomId) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
    }

    const normalizedId = roomId.toUpperCase().trim();
    const room = getOrCreateRoom(normalizedId);

    switch (action) {
      case 'join': {
        if (role === 'south') {
          if (playerName) room.hostName = playerName;
          if (state) room.currentState = state;
        } else if (role === 'north') {
          if (playerName) room.clientName = playerName;
        }
        notifyRoomListeners(normalizedId);
        return NextResponse.json({
          success: true,
          roomId: room.roomId,
          hostName: room.hostName,
          clientName: room.clientName,
        });
      }

      case 'send': {
        if (!message) {
          return NextResponse.json({ error: 'Missing message payload' }, { status: 400 });
        }

        const msgEntry: RoomMessage = {
          id: room.nextMessageId++,
          message: {
            ...message,
            sender: role || message.sender,
            playerName: playerName || message.playerName,
          },
          timestamp: Date.now(),
        };

        // If message is CHALLENGE_ACCEPTED, record client name
        if (message.type === 'CHALLENGE_ACCEPTED' && message.playerName) {
          room.clientName = message.playerName;
        }

        // If message includes authoritative state, cache current state
        if (message.state) {
          room.currentState = message.state;
        }

        room.messages.push(msgEntry);

        // Keep buffer size manageable (max 150 recent messages)
        if (room.messages.length > 150) {
          room.messages = room.messages.slice(-150);
        }

        // Instantly notify all waiting long-poll listeners for this room
        notifyRoomListeners(normalizedId);

        return NextResponse.json({
          success: true,
          messageId: msgEntry.id,
        });
      }

      case 'state': {
        if (state) {
          room.currentState = state;
        }
        notifyRoomListeners(normalizedId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
