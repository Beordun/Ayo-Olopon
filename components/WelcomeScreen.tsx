'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types/ayo';
import { Bot, Gamepad2, Users, Trophy, Play, User, Sparkles } from 'lucide-react';
import { sound } from '@/lib/audio';

interface WelcomeScreenProps {
  initialProfile?: UserProfile;
  onStartGame: (profile: UserProfile, mode: 'ai' | 'local' | 'multiplayer') => void;
  onOpenRules: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  initialProfile,
  onStartGame,
  onOpenRules,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>(
    initialProfile?.gender || ''
  );
  const [selectedMode, setSelectedMode] = useState<'ai' | 'local' | 'multiplayer'>('ai');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Jọ̀wọ́, tẹ orúkọ rẹ (Please enter your playing name).');
      return;
    }

    if (trimmedName.length > 20) {
      setError('Orúkọ rẹ kò gbọdọ̀ ju lẹ́tà 20 lọ (Name must be under 20 characters).');
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
        className="relative rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-10 border-4 border-ayo-bevel/80 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #351A0E 0%, #23120B 55%, #140905 100%)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95), inset 0 2px 4px #7A4222',
        }}
      >
        {/* Subtle decorative inner border */}
        <div className="absolute inset-2 sm:inset-3 rounded-[26px] sm:rounded-[34px] border border-amber-800/20 pointer-events-none" />

        {/* Ambient Warm Amber Glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center relative z-10 mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ayo-chassis border-2 border-ayo-bevel shadow-xl mb-3">
            <span className="text-3xl">🟤</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-amber-100 uppercase font-brand">
            Ayò Ọlọ́pọ́n
          </h1>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-amber-400/80 font-bold mt-1">
            Ẹ ǹlẹ́ o! Káàbọ̀ sí Ayò Ọlọ́pọ́n
          </p>
          <p className="text-xs text-stone-300/80 mt-1 max-w-md mx-auto">
            The revered Yoruba count-and-capture game of wisdom, foresight, and tactical intellect.
          </p>
        </div>

        {/* Profile Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Playing Name Field */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-bold text-amber-200">
              Orúkọ Rẹ <span className="text-stone-400 font-normal">(Playing Name)</span> *
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
                placeholder="e.g. Babátúndé, Yéwándé, or Kẹ́hìndé"
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-black/60 border border-amber-900/60 text-amber-100 placeholder-stone-500 font-brand text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-700 transition-all shadow-inner"
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
              Àkọ tàbí Abo <span className="text-stone-400 font-normal">(Sex / Gender)</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'male', label: 'Ọkùnrin', sub: 'Male' },
                { id: 'female', label: 'Obìnrin', sub: 'Female' },
                { id: 'other', label: 'Adàpọ̀', sub: 'Other / Prefer not' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGender(item.id as any)}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all ${
                    gender === item.id
                      ? 'bg-ayo-bevel/80 border-amber-500 text-amber-100 shadow-md scale-[1.02]'
                      : 'bg-black/40 border-amber-950/60 text-stone-400 hover:text-amber-200 hover:border-amber-900/60'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold font-brand">{item.label}</div>
                  <div className="text-[10px] text-stone-400/80">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Mode Pre-Selection */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-wider font-bold text-amber-200">
              Yan Ọ̀nà Ìṣeré <span className="text-stone-400 font-normal">(Select Game Mode)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* AI Mode */}
              <button
                type="button"
                onClick={() => setSelectedMode('ai')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  selectedMode === 'ai'
                    ? 'bg-ayo-bevel/70 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-black/40 border-amber-950/60 text-stone-400 hover:text-amber-200'
                }`}
              >
                <Bot className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-xs font-bold font-brand">Ọ̀tá Ayò (AI)</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Gemini Grandmaster</span>
              </button>

              {/* Local Pass & Play */}
              <button
                type="button"
                onClick={() => setSelectedMode('local')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  selectedMode === 'local'
                    ? 'bg-ayo-bevel/70 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500/30'
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
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  selectedMode === 'multiplayer'
                    ? 'bg-ayo-bevel/70 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-black/40 border-amber-950/60 text-stone-400 hover:text-amber-200'
                }`}
              >
                <Users className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-xs font-bold font-brand">Online Peer</span>
                <span className="text-[10px] text-stone-400 mt-0.5">WebRTC Room Sync</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl font-brand font-bold text-sm sm:text-base bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Bẹ̀rẹ̀ Ayò (Start Game)</span>
            </button>

            <button
              type="button"
              onClick={onOpenRules}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-black/40 border border-amber-900/60 text-amber-200 hover:text-amber-100 text-xs font-bold hover:bg-amber-950/40 transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Kọ́ Ìlànà (How to Play)</span>
            </button>
          </div>
        </form>

        {/* Footer Cultural Proverb */}
        <div className="mt-8 pt-4 border-t border-amber-950/40 text-center">
          <p className="text-[11px] italic text-amber-300/70 font-brand">
            &ldquo;Ayò là ń ta, a kì í ta ìjà.&rdquo; — We play Ayò for wisdom and joy, not for battle.
          </p>
        </div>
      </div>
    </div>
  );
};
