'use client';

import React from 'react';
import { X, BookOpen, ShieldAlert, Sparkles, Check } from 'lucide-react';

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
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-amber-200 hover:bg-white/5 transition-colors cursor-pointer"
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
              How to Play Ayò Ọlọ́pọ́n
            </h2>
            <p className="text-xs font-brand text-stone-400">
              Official Rules of the Count-and-Capture Board Game
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm font-brand leading-relaxed">
          
          {/* Section 1: Board & Setup */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              1. The Board & Seeds
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              The board has 12 circular hollows: 6 on your side and 6 on your opponent&apos;s side. Each hollow begins with 4 seeds (48 seeds total). Two elongated side bins store captured seeds.
            </p>
          </div>

          {/* Section 2: Sowing & Multi-Lap Skipping */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              2. Sowing Seeds Counter-Clockwise
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              On your turn, pick up all seeds from any non-empty hollow on your side and drop <strong>exactly one seed per hollow</strong> moving counter-clockwise around the board.
            </p>
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs text-amber-200/90 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Multi-Lap Rule:</strong> If a pit holds 12 or more seeds, sowing traverses a full circuit. The starting hollow is <em>always skipped</em> on every lap—no seed is ever dropped back into the hollow it was picked from on that turn.
              </span>
            </div>
          </div>

          {/* Section 3: Capturing & Backward Cascades */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              3. Capturing 2 or 3 Seeds
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              A capture triggers if your final sown seed lands on the <strong>opponent&apos;s side</strong> and brings that hollow&apos;s count to <strong>exactly 2 or 3 seeds</strong>.
            </p>
            <p className="text-stone-300 text-xs sm:text-sm">
              <strong>Cascading Backward Sweep:</strong> After capturing the landing pit, check the preceding hollow in reverse (clockwise) direction. If it is also in opponent territory and holds <strong>2 or 3 seeds</strong>, those seeds are also captured. The cascade continues backwards until a hollow has a different seed count or reaches your own territory.
            </p>
          </div>

          {/* Section 4: Anti-Starvation & Grand Slam */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-yellow-400" />
              4. Anti-Starvation & Grand Slam Rules
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              <strong>Mandatory Feeding:</strong> If your opponent has 0 seeds on their entire side, you <em>must</em> make a move that deposits seeds across the border to feed them, if such a move is possible.
            </p>
            <p className="text-stone-300 text-xs sm:text-sm">
              <strong>Grand Slam:</strong> If your legal feeding move captures all newly deposited seeds, leaving the opponent with 0 seeds, the capture stands! The opponent is starved, and all remaining seeds on the board are swept into your storehouse.
            </p>
          </div>

          {/* Section 5: Victory Conditions */}
          <div className="p-4 rounded-2xl bg-black/30 border border-amber-950/40 space-y-2">
            <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              5. Victory & Match Conclusion
            </h3>
            <ul className="list-disc list-inside text-stone-300 text-xs sm:text-sm space-y-1">
              <li><strong>Threshold Victory:</strong> The first player to capture <strong>25 or more seeds</strong> wins the match immediately.</li>
              <li><strong>Threefold Repetition:</strong> If the identical board configuration repeats 3 times, play concludes and remaining seeds on each side are awarded to that player.</li>
              <li><strong>Low-Seed Stalemate:</strong> If 3 or fewer seeds remain on the board with 10 consecutive turns without a capture, remaining seeds are swept to their home sides.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-7 pt-4 border-t border-amber-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-brand font-bold text-sm bg-ayo-secondary hover:bg-amber-500 text-stone-950 transition-colors shadow-lg cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>I Understand</span>
          </button>
        </div>
      </div>
    </div>
  );
};
