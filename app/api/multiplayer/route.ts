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

// Periodic cleanup of stale rooms (older than 3 hours)
function cleanupStaleRooms() {
  const now = Date.now();
  rooms.forEach((room, id) => {
    if (now - room.lastActive > 3 * 60 * 60 * 1000) {
      rooms.delete(id);
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

  if (!roomId) {
    return NextResponse.json({ error: 'Missing room parameter' }, { status: 400 });
  }

  const room = getOrCreateRoom(roomId);

  // Filter messages intended for this role (messages sent by the other role)
  // that have an ID higher than lastId
  const newMessages = room.messages.filter(
    (m) => m.id > lastId && (!role || m.message.sender !== role)
  );

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

    const room = getOrCreateRoom(roomId);

    switch (action) {
      case 'join': {
        if (role === 'south') {
          if (playerName) room.hostName = playerName;
          if (state) room.currentState = state;
        } else if (role === 'north') {
          if (playerName) room.clientName = playerName;
        }
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

        // If message includes state, cache current state
        if (message.state) {
          room.currentState = message.state;
        }

        room.messages.push(msgEntry);

        // Keep buffer size manageable (max 100 recent messages)
        if (room.messages.length > 100) {
          room.messages = room.messages.slice(-100);
        }

        return NextResponse.json({
          success: true,
          messageId: msgEntry.id,
        });
      }

      case 'state': {
        if (state) {
          room.currentState = state;
        }
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
