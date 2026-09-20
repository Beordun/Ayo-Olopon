'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, PlayerSide, AIMoveResponse, AIMoveRequest } from '@/types/ayo';
import { createInitialState, executeMove, getLegalMoves } from '@/lib/ayo-engine';
import { AyoBoard } from '@/components/AyoBoard';
import { AiDialogueBox } from '@/components/AiDialogueBox';
import { MultiplayerModal } from '@/components/MultiplayerModal';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { MultiplayerSession, PeerConnectionStatus } from '@/lib/multiplayer-host';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Users,
  Bot,
  Gamepad2,
  HelpCircle,
  Trophy,
  Share2,
} from 'lucide-react';

type GameMode = 'ai' | 'local' | 'multiplayer';

export default function AyoPage() {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastAiResponse, setLastAiResponse] = useState<AIMoveResponse | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);

  // Multiplayer State
  const [roomId, setRoomId] = useState<string>('AYO-01');
  const [multiplayerStatus, setMultiplayerStatus] = useState<PeerConnectionStatus>('disconnected');
  const [isHost, setIsHost] = useState(true);
  const multiplayerSessionRef = useRef<MultiplayerSession | null>(null);

  // Sound Mute Toggle
  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Trigger Victory Celebrations
  useEffect(() => {
    if (gameState.isGameOver && gameState.winner) {
      sound.playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E89D73', '#5C3119', '#53624D', '#EAD8C7'],
        });
      } catch {}
    }
  }, [gameState.isGameOver, gameState.winner]);

  // Compute legal moves for active player
  const legalMoves = getLegalMoves(gameState, gameState.currentTurn);

  // Reset Game to Canonical Initial State
  const resetGame = () => {
    setGameState(createInitialState());
    setLastAiResponse(null);
    setIsAiThinking(false);
  };

  // AI Turn Handler (Ọ̀tá Ayò)
  const triggerAiTurn = useCallback(
    async (currentState: GameState) => {
      if (currentState.isGameOver || currentState.currentTurn !== 'north') return;

      const aiLegalMoves = getLegalMoves(currentState, 'north');
      if (aiLegalMoves.length === 0) return;

      setIsAiThinking(true);

      const requestPayload: AIMoveRequest = {
        board: currentState.board,
        scores: currentState.scores,
        currentTurn: 'north',
        legalMoves: aiLegalMoves,
      };

      try {
        const res = await fetch('/api/ai-move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data: AIMoveResponse = await res.json();
        setLastAiResponse(data);

        // Execute AI's selected pit
        setTimeout(() => {
          setGameState((prev) => {
            if (prev.currentTurn !== 'north' || prev.isGameOver) return prev;
            return executeMove(prev, data.selected_pit);
          });
          setIsAiThinking(false);
        }, 350);
      } catch (err) {
        console.error('AI move failed, falling back:', err);
        // Fallback: pick first legal move
        const fallbackPit = aiLegalMoves[0];
        setGameState((prev) => executeMove(prev, fallbackPit));
        setIsAiThinking(false);
      }
    },
    []
  );

  // Trigger AI if it's North's turn in AI mode
  useEffect(() => {
    if (gameMode === 'ai' && gameState.currentTurn === 'north' && !gameState.isGameOver) {
      triggerAiTurn(gameState);
    }
  }, [gameState.currentTurn, gameMode, gameState.isGameOver, triggerAiTurn, gameState]);

  // Handle Player Pit Interaction
  const handlePitClick = (pitIndex: number) => {
    if (gameState.isGameOver || isAiThinking) return;

    if (gameMode === 'multiplayer' && multiplayerSessionRef.current) {
      // In multiplayer, delegate through session coordinator
      const nextState = multiplayerSessionRef.current.handlePlayerMove(gameState, pitIndex);
      setGameState(nextState);
      return;
    }

    try {
      const nextState = executeMove(gameState, pitIndex);
      setGameState(nextState);
    } catch (err: any) {
      console.warn('Move rejected:', err.message);
    }
  };

  // Initialize or Switch Multiplayer Session
  const initMultiplayer = (room: string, asHost: boolean) => {
    if (multiplayerSessionRef.current) {
      multiplayerSessionRef.current.destroy();
    }

    const session = new MultiplayerSession(
      asHost ? 'south' : 'north',
      room,
      {
        onStateUpdate: (newState) => setGameState(newState),
        onStatusChange: (status) => setMultiplayerStatus(status),
        onError: (msg) => alert(`Multiplayer: ${msg}`),
        onOpponentForfeit: () => {
          alert('Opponent has forfeited the match.');
          resetGame();
        },
      }
    );

    session.registerHostStateProvider(() => gameState);
    session.initConnection();
    multiplayerSessionRef.current = session;
    setRoomId(room);
    setIsHost(asHost);
  };

  // URL Room Code Auto-Detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setGameMode('multiplayer');
        setIsMultiplayerOpen(true);
        initMultiplayer(roomParam.toUpperCase(), false);
      }
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 md:p-8 max-w-6xl mx-auto font-brand select-none">
      {/* 1. Header & Global Navigation */}
      <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-amber-950/40 mb-4 sm:mb-6">
        {/* Cultural Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ayo-chassis border border-ayo-bevel flex items-center justify-center shadow-lg">
            <span className="text-xl">🟤</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-100 uppercase">
              Ayò Ọlọ́pọ́n
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-amber-400/70 font-semibold">
              The Yoruba Count-and-Capture Board
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-amber-950/60 shadow-inner">
          <button
            onClick={() => {
              setGameMode('ai');
              resetGame();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'ai'
                ? 'bg-ayo-bevel text-amber-100 shadow-md'
                : 'text-stone-400 hover:text-amber-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Ọ̀tá Ayò (AI)
          </button>

          <button
            onClick={() => {
              setGameMode('local');
              resetGame();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'local'
                ? 'bg-ayo-bevel text-amber-100 shadow-md'
                : 'text-stone-400 hover:text-amber-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Pass & Play
          </button>

          <button
            onClick={() => {
              setGameMode('multiplayer');
              setIsMultiplayerOpen(true);
              if (!multiplayerSessionRef.current) {
                initMultiplayer(roomId, true);
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'multiplayer'
                ? 'bg-ayo-bevel text-amber-100 shadow-md'
                : 'text-stone-400 hover:text-amber-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Online Peer
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetGame}
            title="Reset Board"
            className="p-2.5 rounded-xl bg-ayo-surfaceContainer border border-amber-950/60 text-stone-300 hover:text-amber-300 hover:border-amber-800/60 transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2.5 rounded-xl bg-ayo-surfaceContainer border border-amber-950/60 text-stone-300 hover:text-amber-300 hover:border-amber-800/60 transition-all shadow-md"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsHowToPlayOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs font-bold hover:bg-amber-900/50 transition-all shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Rules
          </button>
        </div>
      </header>

      {/* 2. Turn Telemetry Banner */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-black/30 border border-amber-950/40 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              gameState.currentTurn === 'south' ? 'bg-amber-400 animate-pulse' : 'bg-stone-600'
            }`}
          />
          <span className="text-xs sm:text-sm font-bold tracking-wide text-stone-200">
            Active Turn:{' '}
            <strong className="text-amber-300 uppercase">
              {gameState.currentTurn === 'south'
                ? 'Gúúsù (Player 1 / South)'
                : gameMode === 'ai'
                ? 'Ọ̀tá Ayò (AI / North)'
                : 'Àríwá (Player 2 / North)'}
            </strong>
          </span>
        </div>

        {/* Captured Lead Summary */}
        <div className="text-xs font-semibold text-stone-400">
          Remaining Seeds on Board:{' '}
          <span className="text-amber-200 font-bold">
            {gameState.board.reduce((a, b) => a + b, 0)}
          </span>
        </div>
      </div>

      {/* 3. The Central Carved Playing Board */}
      <div className="w-full my-auto py-2">
        <AyoBoard
          gameState={gameState}
          onPitClick={handlePitClick}
          legalMoves={legalMoves}
          disabled={gameState.isGameOver}
          isAiThinking={isAiThinking}
          playerPerspective={isHost ? 'south' : 'north'}
        />
      </div>

      {/* 4. AI Grandmaster Dialogue Box */}
      {gameMode === 'ai' && (
        <div className="w-full mt-4">
          <AiDialogueBox lastAiResponse={lastAiResponse} isAiThinking={isAiThinking} />
        </div>
      )}

      {/* 5. Terminal Victory / Draw Modal */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div
            className="w-full max-w-md rounded-3xl p-8 border-4 border-ayo-bevel text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #23120B 0%, #140905 100%)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.95)',
            }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-950/60 border border-amber-700/50 flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>

            <h2 className="text-3xl font-extrabold font-brand text-amber-100 mb-2 uppercase tracking-wide">
              {gameState.winner === 'draw'
                ? 'Ayò Dọ́gba! (Draw)'
                : `${gameState.winner === 'south' ? 'Gúúsù (South)' : 'Àríwá (North)'} Wins!`}
            </h2>

            <p className="text-xs sm:text-sm font-brand text-stone-300 mb-6">
              Final Scores: South captured <strong>{gameState.scores.south}</strong> seeds, North
              captured <strong>{gameState.scores.north}</strong> seeds.
            </p>

            <button
              onClick={resetGame}
              className="w-full py-3.5 rounded-xl font-brand font-bold text-sm bg-ayo-secondary hover:bg-amber-500 text-stone-950 transition-colors shadow-lg"
            >
              Tún Ayò Tà (Play Again)
            </button>
          </div>
        </div>
      )}

      {/* 6. Multiplayer Modal */}
      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        connectionStatus={multiplayerStatus}
        roomId={roomId}
        onJoinRoom={(id) => {
          initMultiplayer(id, false);
          setIsMultiplayerOpen(false);
        }}
        onCreateRoom={() => {
          const newCode = `AYO-${Math.floor(1000 + Math.random() * 9000)}`;
          initMultiplayer(newCode, true);
        }}
        onRequestResync={() => multiplayerSessionRef.current?.requestResync()}
        isHost={isHost}
      />

      {/* 7. How to Play Rules Modal */}
      <HowToPlayModal isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />
    </main>
  );
}
