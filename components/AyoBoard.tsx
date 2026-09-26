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
  southPlayerName?: string;
  northPlayerName?: string;
}

export const AyoBoard: React.FC<AyoBoardProps> = ({
  gameState,
  onPitClick,
  legalMoves,
  disabled = false,
  playerPerspective = 'south',
  isAiThinking = false,
  southPlayerName = 'Gúúsù',
  northPlayerName = 'Àríwá',
}) => {
  const [animatingPit, setAnimatingPit] = useState<number | null>(null);
  const [highlightedPits, setHighlightedPits] = useState<number[]>([]);
  const [isSowing, setIsSowing] = useState(false);

  // North row is visually displayed left-to-right as [11, 10, 9, 8, 7, 6] to preserve counter-clockwise flow
  const northPits = [11, 10, 9, 8, 7, 6];
  // South row is visually displayed left-to-right as [0, 1, 2, 3, 4, 5]
  const southPits = [0, 1, 2, 3, 4, 5];

  // Display name on board: remove "Grandmaster" and leave only "AI" for proper hole spacing/wrapping
  const displayNorthName = northPlayerName.replace(/grandmaster/i, '').trim() || 'AI';
  const displaySouthName = southPlayerName;

  // Visual animation effect when lastMove changes — deliberate tactile seed drops with anti-freeze safety
  useEffect(() => {
    if (!gameState.lastMove?.sownPits || gameState.lastMove.sownPits.length === 0) {
      setIsSowing(false);
      setAnimatingPit(null);
      return;
    }

    const path = gameState.lastMove.sownPits;
    const DROP_INTERVAL = 200;
    const PULSE_DURATION = 160;

    setIsSowing(true);
    const timers: NodeJS.Timeout[] = [];

    path.forEach((pit, idx) => {
      const timer = setTimeout(() => {
        setAnimatingPit(pit);
        sound.playSeedClick(1 + (idx % 4) * 0.08);
        setTimeout(() => setAnimatingPit(null), PULSE_DURATION);
      }, idx * DROP_INTERVAL);
      timers.push(timer);
    });

    if (gameState.lastMove.capturedSeeds > 0) {
      const captureTimer = setTimeout(() => {
        sound.playCapture();
      }, path.length * DROP_INTERVAL + 100);
      timers.push(captureTimer);
    }

    const totalDuration = path.length * DROP_INTERVAL + 200;
    const finishTimer = setTimeout(() => {
      setIsSowing(false);
      setAnimatingPit(null);
    }, totalDuration);
    timers.push(finishTimer);

    // Hard safety timer: Guarantee isSowing NEVER stays true past duration
    const safetyTimer = setTimeout(() => {
      setIsSowing(false);
      setAnimatingPit(null);
    }, totalDuration + 300);
    timers.push(safetyTimer);

    return () => {
      timers.forEach(clearTimeout);
      setAnimatingPit(null);
      setIsSowing(false);
    };
  }, [gameState.lastMove]);

  const handlePitInteraction = (pitIndex: number) => {
    if (disabled || isAiThinking || isSowing) return;
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
    // 1-based hole numbering in counter-clockwise game flow (1 to 6 per side)
    const holeNumber = isNorth ? pitIndex - 5 : pitIndex + 1;

    return (
      <div key={pitIndex} className="flex flex-col items-center gap-1.5 select-none">
        {/* Territory & Index Indicator */}
        <span className="text-[10px] sm:text-[11px] font-brand tracking-wider uppercase font-semibold text-stone-400/70 truncate max-w-[68px] sm:max-w-[76px] text-center">
          {isNorth ? `${displayNorthName} ${holeNumber}` : `${displaySouthName} ${holeNumber}`}
        </span>

        {/* The Carved Circular Hollow (Ihò) */}
        <button
          type="button"
          data-pit-index={pitIndex}
          data-pit-count={seedCount}
          onClick={() => handlePitInteraction(pitIndex)}
          disabled={disabled || !isLegal || isAiThinking || isSowing}
          aria-label={`${isNorth ? displayNorthName : displaySouthName} Hole ${holeNumber}, ${seedCount} seeds`}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-200 border-2 ${
            isLegal && !disabled && !isAiThinking && !isSowing
              ? 'cursor-pointer hover:scale-105 active:scale-95 border-amber-500 bg-[#140A05]'
              : 'cursor-default opacity-95 border-amber-950/60 bg-[#120904]'
          } ${isAnimating ? 'scale-105 border-amber-400' : ''}`}
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
        className="relative p-4 sm:p-6 md:p-8 rounded-[32px] sm:rounded-[40px] max-w-5xl w-full mx-auto border-4 border-amber-900/60 bg-[#23120B]"
      >
        {/* Subtle Decorative Hardwood Carving Border Lines */}
        <div className="absolute inset-2 sm:inset-3 rounded-[26px] sm:rounded-[34px] border border-amber-800/20 pointer-events-none" />

        {/* Chassis Layout: [West Ojú-oró] [12 Playing Pits] [East Ojú-oró] */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
          
          {/* West Flank: North Player Score Storehouse (Ojú-oró Àríwá) */}
          <div className="flex flex-col items-center gap-2 order-2 lg:order-1">
            <span className="text-xs font-brand uppercase tracking-widest text-amber-200/80 font-bold truncate max-w-[130px] text-center">
              Storehouse ({displayNorthName})
            </span>
            <div
              className="relative w-28 h-20 sm:w-32 sm:h-24 lg:w-24 lg:h-52 rounded-[28px] flex flex-col items-center justify-center p-3 border-2 border-amber-950/80 bg-[#140A05]"
            >
              <div className="flex flex-wrap gap-1 justify-center items-center opacity-80 mb-1">
                {Array.from({ length: Math.min(gameState.scores.north, 6) }).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-ayo-seed" />
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
              <div className="h-[2px] w-5/6 bg-amber-900/40" />
              <div className="absolute px-3 py-0.5 rounded-full bg-ayo-chassis border border-amber-950/60 text-[9px] uppercase tracking-widest text-amber-400/70 font-brand">
                Ayò Ọlọ́pọ́n
              </div>
            </div>

            {/* South Row (Pits 0 up to 5) */}
            <div className="flex justify-around items-center w-full px-1 sm:px-4">
              {southPits.map((pit) => renderHollow(pit, false))}
            </div>
          </div>

          {/* East Flank: South Player Score Storehouse (Ojú-oró Gúúsù) */}
          <div className="flex flex-col items-center gap-2 order-3">
            <span className="text-xs font-brand uppercase tracking-widest text-amber-200/80 font-bold truncate max-w-[130px] text-center">
              Storehouse ({southPlayerName})
            </span>
            <div
              className="relative w-28 h-20 sm:w-32 sm:h-24 lg:w-24 lg:h-52 rounded-[28px] flex flex-col items-center justify-center p-3 border-2 border-amber-950/80 bg-[#140A05]"
            >
              <div className="flex flex-wrap gap-1 justify-center items-center opacity-80 mb-1">
                {Array.from({ length: Math.min(gameState.scores.south, 6) }).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-ayo-seed" />
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
