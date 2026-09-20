'use client';

import React from 'react';
import { X, BookOpen, ShieldAlert, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border-2 border-ayo-bevel/80 relative text-stone-200"
        style={{
          background: 'linear-gradient(145deg, #1D110B 0%, #140905 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.9), inset 0 1px 2px rgba(255,255,255,0.08)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-amber-200 hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ayo-surfaceContainerHigh flex items-center justify-center border border-amber-900/50">
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-brand text-amber-100">
              Bí a ṣe ń tà'yò (How to Play)
            </h2>
            <p className="text-xs font-brand text-stone-400">
              The Canonical Yoruba Count-and-Capture Rules
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm font-brand leading-relaxed">
          
          {/* Section 1: Board & Setup */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. Ọpọ́n & Ọmọ Ayò (Board & Seeds)
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              The board has 12 circular hollows (<strong>Ihò</strong>), 6 on your side (<strong>Gúúsù 0–5</strong>) and 6 on your opponent&apos;s side (<strong>Àríwá 6–11</strong>). Each hollow starts with 4 seeds (48 seeds total). Two elongated bins at the board ends (<strong>Ojú-oró</strong>) store captured seeds.
            </p>
          </div>

          {/* Section 2: Sowing & Multi-Lap Skipping */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Tà (Sowing Seeds Counter-Clockwise)
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              Pick all seeds from any non-empty hollow on your side and drop <strong>exactly one seed per hollow</strong> counter-clockwise around the board.
            </p>
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200/90 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Multi-Lap Rule:</strong> If a pit holds 12 or more seeds, sowing makes a full circuit. The starting hollow is <em>always skipped</em> on every lap—no seed can ever be dropped back into its starting pit on that turn.
              </span>
            </div>
          </div>

          {/* Section 3: Capturing & Backward Cascades */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Jẹ (Capturing 2 or 3 Seeds)
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              A capture triggers if your final seed lands on the <strong>opponent&apos;s side</strong> and brings that hollow to <strong>exactly 2 or 3 seeds</strong>.
            </p>
            <p className="text-stone-300 text-xs sm:text-sm">
              <strong>Cascading Backward Scoop:</strong> After capturing the final pit, the engine sweeps backwards clockwise along adjacent opponent hollows. If any contiguous predecessor also contains <strong>2 or 3 seeds</strong>, it is also scooped until a pit with a different count or your own side is reached.
            </p>
          </div>

          {/* Section 4: Anti-Starvation & Grand Slam */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
              4. Fún ní Jẹ (Anti-Starvation) & Jẹ Tán (Grand Slam)
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              <strong>Feed to Eat:</strong> If your opponent has 0 seeds on their entire side, you <em>must</em> make a move that passes seeds across the border to feed them, if such a move exists.
            </p>
            <p className="text-stone-300 text-xs sm:text-sm">
              <strong>Grand Slam (Jẹ Tán):</strong> If your legal feeding move captures all newly fed seeds leaving the opponent with 0 seeds, the capture stands! The opponent is starved, and all remaining seeds on the board are swept into your bank.
            </p>
          </div>

          {/* Section 5: Victory Conditions */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              5. Victory & Endgames
            </h3>
            <ul className="list-disc list-inside text-stone-300 text-xs sm:text-sm space-y-1">
              <li><strong>Threshold Victory:</strong> First player to capture <strong>25 seeds</strong> wins instantly.</li>
              <li><strong>Threefold Repetition:</strong> If the identical board configuration repeats 3 times, play halts and seeds on each side are swept to that player.</li>
              <li><strong>Low-Seed Stalemate:</strong> If $\le 3$ seeds remain with 10 consecutive zero-capture turns, side seeds are swept and highest score wins.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-7 pt-4 border-t border-amber-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-brand font-bold text-sm bg-ayo-secondary hover:bg-amber-500 text-stone-950 transition-colors shadow-lg"
          >
            O ti yé mi (I Understand)
          </button>
        </div>
      </div>
    </div>
  );
};
