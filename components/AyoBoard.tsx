'use client';

import React, { useState, useEffect } from 'react';
import { GameState, PlayerSide } from '@/types/ayo';
import { OmoAyo } from './OmoAyo';
import { sound } from '@/lib/audio';

interface AyoBoardProps {
  gameState: GameState;
  onPitClick: (pitIndex: number) => void;
  legalMoves: number[];
  disabled?: boolean;
  playerPerspective?: PlayerSide; // 'south' (default) or 'north'
  isAiThinking?: boolean;
}

export const AyoBoard: React.FC<AyoBoardProps> = ({
  gameState,
  onPitClick,
  legalMoves,
  disabled = false,
  playerPerspective = 'south',
  isAiThinking = false,
}) => {
  const [animatingPit, setAnimatingPit] = useState<number | null>(null);
  const [highlightedPits, setHighlightedPits] = useState<number[]>([]);

  // North row is visually displayed left-to-right as [11, 10, 9, 8, 7, 6] to preserve counter-clockwise flow
  const northPits = [11, 10, 9, 8, 7, 6];
  // South row is visually displayed left-to-right as [0, 1, 2, 3, 4, 5]
  const southPits = [0, 1, 2, 3, 4, 5];

  // Visual animation effect when lastMove changes
  useEffect(() => {
    if (gameState.lastMove?.sownPits && gameState.lastMove.sownPits.length > 0) {
      const path = gameState.lastMove.sownPits;
      path.forEach((pit, idx) => {
        setTimeout(() => {
          setAnimatingPit(pit);
          sound.playSeedClick(1 + (idx % 4) * 0.08);
          setTimeout(() => setAnimatingPit(null), 180);
        }, idx * 110);
      });

      if (gameState.lastMove.capturedSeeds > 0) {
        setTimeout(() => {
          sound.playCapture();
        }, path.length * 110 + 60);
      }
    }
  }, [gameState.lastMove]);

  const handlePitInteraction = (pitIndex: number) => {
    if (disabled || isAiThinking) return;
    if (!legalMoves.includes(pitIndex)) return;

    sound.playScoop();
    onPitClick(pitIndex);
  };

  const renderHollow = (pitIndex: number, isNorth: boolean) => {
    const seedCount = gameState.board[pitIndex];
    const isLegal = legalMoves.includes(pitIndex);
    const isAnimating = animatingPit === pitIndex;
    const isHighlighted = highlightedPits.includes(pitIndex);
    const isTurnTerritory =
      gameState.currentTurn === 'south' ? !isNorth : isNorth;

    return (
      <div key={pitIndex} className="flex flex-col items-center gap-1.5 select-none">
        {/* Territory & Index Indicator */}
        <span className="text-[11px] font-brand tracking-wider uppercase font-semibold text-stone-400/70">
          {isNorth ? `Àríwá ${pitIndex}` : `Gúúsù ${pitIndex}`}
        </span>

        {/* The Carved Circular Hollow (Ihò) */}
        <button
          type="button"
          data-pit-index={pitIndex}
          data-pit-count={seedCount}
          onClick={() => handlePitInteraction(pitIndex)}
          disabled={disabled || !isLegal || isAiThinking}
          aria-label={`Pit ${pitIndex}, ${seedCount} seeds`}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isLegal && !disabled && !isAiThinking
              ? 'cursor-pointer hover:scale-105 active:scale-95 ring-2 ring-amber-500/40 shadow-activeGlow'
              : 'cursor-default opacity-95'
          } ${isAnimating ? 'scale-110' : ''}`}
          style={{
            backgroundColor: '#140A05',
            boxShadow:
              isLegal && !disabled && !isAiThinking
                ? 'inset 0 8px 16px rgba(0,0,0,0.95), 0 0 16px rgba(232, 157, 115, 0.55)'
                : 'inset 0 8px 16px rgba(0,0,0,0.95), inset 0 -2px 4px rgba(92,49,25,0.35)',
          }}
        >
          {/* Subtle wood grain texture ring */}
          <div className="absolute inset-1 rounded-full border border-amber-950/20 pointer-events-none" />

          {/* Render Organic Ọmọ Ayò Seeds */}
          <OmoAyo count={seedCount} isAnimating={isAnimating} />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hand-Carved Hardwood Chassis (Ọpọ́n) */}
      <div
        className="relative p-4 sm:p-6 md:p-8 rounded-[32px] sm:rounded-[40px] max-w-5xl w-full mx-auto border-4 border-ayo-bevel/80"
        style={{
          background: 'linear-gradient(145deg, #351A0E 0%, #23120B 60%, #170904 100%)',
          boxShadow:
            '0 20px 50px rgba(0,0,0,0.9), inset 0 3px 6px #7A4222, inset 0 -4px 8px #140905',
        }}
      >
        {/* Subtle Decorative Hardwood Carving Border Lines */}
        <div className="absolute inset-2 sm:inset-3 rounded-[26px] sm:rounded-[34px] border border-amber-800/20 pointer-events-none" />

        {/* Chassis Layout: [West Ojú-oró] [12 Playing Pits] [East Ojú-oró] */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
          
          {/* West Flank: North Player Score Storehouse (Ojú-oró Àríwá) */}
          <div className="flex flex-col items-center gap-2 order-2 lg:order-1">
            <span className="text-xs font-brand uppercase tracking-widest text-amber-200/80 font-bold">
              Ojú-oró (North)
            </span>
            <div
              className="relative w-28 h-20 sm:w-32 sm:h-24 lg:w-24 lg:h-52 rounded-[28px] flex flex-col items-center justify-center p-3 border border-amber-900/40"
              style={{
                backgroundColor: '#140A05',
                boxShadow: 'inset 0 12px 24px rgba(0,0,0,0.95), inset 0 -3px 6px rgba(92,49,25,0.4)',
              }}
            >
              <div className="flex flex-wrap gap-1 justify-center items-center opacity-80 mb-1">
                {Array.from({ length: Math.min(gameState.scores.north, 6) }).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-ayo-seed shadow-sm" />
                ))}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-brand text-amber-100 tracking-tight">
                {gameState.scores.north}
              </div>
              <span className="text-[10px] uppercase font-brand text-amber-300/60 font-semibold">
                Captured
              </span>
            </div>
          </div>

          {/* Center: The 12 Playing Hollows (Ihò) */}
          <div className="flex flex-col gap-6 sm:gap-8 flex-1 order-1 lg:order-2 w-full">
            {/* North Row (Pits 11 down to 6) */}
            <div className="flex justify-around items-center w-full px-1 sm:px-4">
              {northPits.map((pit) => renderHollow(pit, true))}
            </div>

            {/* Subtle Divider Spine */}
            <div className="relative w-full flex items-center justify-center my-[-8px]">
              <div className="h-[2px] w-5/6 bg-gradient-to-r from-transparent via-amber-900/30 to-transparent" />
              <div className="absolute px-3 py-0.5 rounded-full bg-ayo-chassis border border-amber-950/40 text-[9px] uppercase tracking-widest text-amber-400/50 font-brand">
                Ọpọ́n Ayò
              </div>
            </div>

            {/* South Row (Pits 0 up to 5) */}
            <div className="flex justify-around items-center w-full px-1 sm:px-4">
              {southPits.map((pit) => renderHollow(pit, false))}
            </div>
          </div>

          {/* East Flank: South Player Score Storehouse (Ojú-oró Gúúsù) */}
          <div className="flex flex-col items-center gap-2 order-3">
            <span className="text-xs font-brand uppercase tracking-widest text-amber-200/80 font-bold">
              Ojú-oró (South)
            </span>
            <div
              className="relative w-28 h-20 sm:w-32 sm:h-24 lg:w-24 lg:h-52 rounded-[28px] flex flex-col items-center justify-center p-3 border border-amber-900/40"
              style={{
                backgroundColor: '#140A05',
                boxShadow: 'inset 0 12px 24px rgba(0,0,0,0.95), inset 0 -3px 6px rgba(92,49,25,0.4)',
              }}
            >
              <div className="flex flex-wrap gap-1 justify-center items-center opacity-80 mb-1">
                {Array.from({ length: Math.min(gameState.scores.south, 6) }).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-ayo-seed shadow-sm" />
                ))}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-brand text-amber-100 tracking-tight">
                {gameState.scores.south}
              </div>
              <span className="text-[10px] uppercase font-brand text-amber-300/60 font-semibold">
                Captured
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
