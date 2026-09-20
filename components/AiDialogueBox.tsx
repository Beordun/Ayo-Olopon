'use client';

import React from 'react';
import { AIMoveResponse } from '@/types/ayo';
import { Sparkles, Bot, Quote } from 'lucide-react';

interface AiDialogueBoxProps {
  lastAiResponse: AIMoveResponse | null;
  isAiThinking: boolean;
}

export const AiDialogueBox: React.FC<AiDialogueBoxProps> = ({
  lastAiResponse,
  isAiThinking,
}) => {
  return (
    <div
      className="w-full max-w-2xl mx-auto rounded-2xl p-4 sm:p-5 border border-amber-900/40 relative overflow-hidden transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, #1D110B 0%, #140905 100%)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.05)',
      }}
    >
      {/* Ambient Timber Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start gap-3 sm:gap-4 relative z-10">
        {/* Avatar / Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border border-amber-800/50 flex-shrink-0 transition-transform ${
            isAiThinking ? 'animate-pulse scale-105' : ''
          }`}
          style={{
            backgroundColor: '#261710',
            boxShadow: isAiThinking
              ? '0 0 14px rgba(232,157,115,0.6)'
              : '0 2px 6px rgba(0,0,0,0.6)',
          }}
        >
          <Bot className="w-6 h-6 text-amber-300" />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-brand font-bold text-sm tracking-wide text-amber-200">
                Ọ̀tá Ayò
              </span>
              <span className="text-[10px] uppercase font-brand tracking-widest px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300/80 font-semibold">
                Grandmaster
              </span>
            </div>

            {isAiThinking && (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 font-brand animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Thinking...
              </span>
            )}
          </div>

          {/* Dialogue / Proverb Display */}
          {isAiThinking ? (
            <p className="text-sm font-brand text-stone-400 italic">
              Consulting the ancient wisdom of the board...
            </p>
          ) : lastAiResponse ? (
            <div className="space-y-2">
              {/* Yoruba Proverb Taunt */}
              <div className="flex items-start gap-2 bg-black/20 p-2.5 rounded-xl border border-amber-950/40">
                <Quote className="w-4 h-4 text-amber-400/70 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-brand font-medium italic text-amber-100/90 leading-relaxed">
                  {lastAiResponse.yoruba_proverb_taunt}
                </p>
              </div>

              {/* Tactical Rationale */}
              <p className="text-xs font-brand text-stone-300/90 leading-normal pl-1">
                <strong className="text-amber-300 font-semibold">Tactics: </strong>
                {lastAiResponse.tactical_reasoning}
              </p>
            </div>
          ) : (
            <p className="text-xs sm:text-sm font-brand text-stone-400">
              Select any hollow on your side (Gúúsù 0–5) to initiate play. Ọ̀tá Ayò awaits your move.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
