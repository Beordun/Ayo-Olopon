'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types/ayo';
import { Bot, Gamepad2, Users, Play, User, BookOpen, Swords } from 'lucide-react';
import { sound } from '@/lib/audio';

interface WelcomeScreenProps {
  initialProfile?: UserProfile;
  challengerName?: string;
  challengeRoom?: string;
  onStartGame: (profile: UserProfile, mode: 'ai' | 'local' | 'multiplayer') => void;
  onOpenRules: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  initialProfile,
  challengerName,
  challengeRoom,
  onStartGame,
  onOpenRules,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>(
    initialProfile?.gender || ''
  );
  const [selectedMode, setSelectedMode] = useState<'ai' | 'local' | 'multiplayer'>(
    challengeRoom ? 'multiplayer' : 'ai'
  );
  const [error, setError] = useState<string | null>(null);

  // Load saved profile on mount if available
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialProfile?.name) {
      try {
        const saved = localStorage.getItem('ayo_user_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) setName(parsed.name);
          if (parsed.gender) setGender(parsed.gender);
        }
      } catch {}
    }
  }, [initialProfile]);

  // If a challenge room is provided in the URL, automatically lock mode to multiplayer
  useEffect(() => {
    if (challengeRoom) {
      setSelectedMode('multiplayer');
    }
  }, [challengeRoom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter your playing name.');
      return;
    }

    if (trimmedName.length > 20) {
      setError('Playing name must be under 20 characters.');
      return;
    }

    setError(null);
    sound.playScoop();

    const profile: UserProfile = {
      name: trimmedName,
      gender: gender || 'other',
    };

    try {
      localStorage.setItem('ayo_user_profile', JSON.stringify(profile));
    } catch {}

    onStartGame(profile, selectedMode);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-auto py-6 px-4 sm:px-6 select-none animate-fadeIn">
      {/* Wooden Carved Welcome Container */}
      <div
        className="relative rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-10 border-4 border-amber-900/70 bg-[#23120B] overflow-hidden"
      >
        {/* Subtle decorative inner border */}
        <div className="absolute inset-2 sm:inset-3 rounded-[26px] sm:rounded-[34px] border border-amber-800/20 pointer-events-none" />

        {/* Brand Header with Authentic Ọmọ Ayò Playing Seed in Carved Hollow */}
        <div className="text-center relative z-10 mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#140A05] border-2 border-amber-900/70 mb-3">
            <svg
              width="36"
              height="33"
              viewBox="0 0 22 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-300 hover:scale-110"
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.95))',
              }}
              aria-label="Ọmọ Ayò (Authentic Caesalpinia bonduc playing seed)"
            >
              <defs>
                <radialGradient id="welcomeSeedGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#73836C" />
                  <stop offset="50%" stopColor="#53624D" />
                  <stop offset="100%" stopColor="#2A3326" />
                </radialGradient>
              </defs>
              {/* Organic asymmetrical pebble shape with authentic Caesalpinia bonduc seed gradient */}
              <path
                d="M10.8 1.2C15.5 1.5 19.8 4.2 20.6 8.5C21.4 12.8 18.2 17.1 13.5 18.3C8.8 19.5 3.5 17.2 1.8 12.8C0.1 8.5 3.2 2.8 7.8 1.6C8.8 1.3 9.8 1.1 10.8 1.2Z"
                fill="url(#welcomeSeedGrad)"
                stroke="#2A3326"
                strokeWidth="0.8"
              />
              {/* Subtle organic light sheen on top surface */}
              <ellipse cx="8.5" cy="6.5" rx="3.5" ry="2" fill="#889980" opacity="0.4" transform="rotate(-15 8.5 6.5)" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-amber-100 uppercase font-brand">
            Ayò Ọlọ́pọ́n
          </h1>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-amber-400/80 font-bold mt-1">
            Welcome to Ayò Ọlọ́pọ́n
          </p>
          <p className="text-xs text-stone-300/80 mt-1 max-w-md mx-auto">
            The classic African count-and-capture game of wisdom, foresight, and tactical intellect.
          </p>
        </div>

        {/* Multiplayer Challenge Invitation Banner (If accessed via challenge link) */}
        {challengerName && challengeRoom && (
          <div className="relative z-10 mb-6 p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-700/60 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-bold font-brand text-sm sm:text-base">
              <Swords className="w-5 h-5 text-amber-400" />
              <span>
                <strong>{challengerName}</strong> has challenged you to play!
              </span>
            </div>
            <p className="text-xs text-amber-200/80 mt-1 font-brand">
              Enter your details below and accept the challenge to match with them in Room{' '}
              <strong className="text-amber-100 font-mono">{challengeRoom}</strong>.
            </p>
          </div>
        )}

        {/* Profile Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Playing Name Field */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-bold text-amber-200">
              Your Playing Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500/70">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                maxLength={20}
                placeholder="Enter your name (e.g. Adekunle, Amara, or Jordan)"
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-black/60 border border-amber-900/60 text-amber-100 placeholder-stone-500 font-brand text-sm sm:text-base focus:outline-none focus:border-amber-600 transition-all"
              />
            </div>
            {error && (
              <p className="text-xs font-semibold text-red-400 animate-fadeIn pl-1">
                {error}
              </p>
            )}
          </div>

          {/* Sex / Gender Selector */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-bold text-amber-200">
              Sex / Gender
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'male', label: 'Male' },
                { id: 'female', label: 'Female' },
                { id: 'other', label: 'Other' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGender(item.id as any)}
                  className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    gender === item.id
                      ? 'bg-amber-900/80 border-amber-500 text-amber-100'
                      : 'bg-black/40 border-amber-950/60 text-stone-400 hover:text-amber-200 hover:border-amber-900/60'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold font-brand">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Mode Selection */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-bold text-amber-200">
              Select Game Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* AI Mode */}
              <button
                type="button"
                onClick={() => setSelectedMode('ai')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  selectedMode === 'ai'
                    ? 'bg-amber-900/70 border-amber-500 text-amber-100'
                    : 'bg-black/40 border-amber-950/60 text-stone-400 hover:text-amber-200'
                }`}
              >
                <Bot className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-xs font-bold font-brand">AI Grandmaster</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Play vs Gemini AI</span>
              </button>

              {/* Local Pass & Play */}
              <button
                type="button"
                onClick={() => setSelectedMode('local')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  selectedMode === 'local'
                    ? 'bg-amber-900/70 border-amber-500 text-amber-100'
                    : 'bg-black/40 border-amber-950/60 text-stone-400 hover:text-amber-200'
                }`}
              >
                <Gamepad2 className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-xs font-bold font-brand">Pass & Play</span>
                <span className="text-[10px] text-stone-400 mt-0.5">2 Players on 1 Screen</span>
              </button>

              {/* Online Multiplayer */}
              <button
                type="button"
                onClick={() => setSelectedMode('multiplayer')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  selectedMode === 'multiplayer'
                    ? 'bg-amber-900/70 border-amber-500 text-amber-100'
                    : 'bg-black/40 border-amber-950/60 text-stone-400 hover:text-amber-200'
                }`}
              >
                <Users className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-xs font-bold font-brand">Online Peer</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Challenge a Friend</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-brand font-bold text-sm sm:text-base bg-amber-600 hover:bg-amber-500 text-stone-950 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {challengerName ? (
                <>
                  <Swords className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
                  <span>Accept Challenge & Play</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>Start Game</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenRules}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-black/40 border border-amber-900/60 text-amber-200 hover:text-amber-100 text-xs font-bold hover:bg-amber-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>How to Play</span>
            </button>
          </div>
        </form>

        {/* Footer Cultural Motto in English */}
        <div className="mt-8 pt-4 border-t border-amber-950/40 text-center">
          <p className="text-[11px] italic text-amber-300/80 font-brand">
            Ayò Ọlọ́pọ́n is played for wisdom and enjoyment, not for conflict.
          </p>
        </div>
      </div>
    </div>
  );
};
