'use client';

import React, { useState } from 'react';
import { PeerConnectionStatus } from '@/lib/multiplayer-host';
import { X, Copy, Check, Users, RefreshCw, Radio } from 'lucide-react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionStatus: PeerConnectionStatus;
  roomId: string;
  onJoinRoom: (id: string) => void;
  onCreateRoom: () => void;
  onRequestResync: () => void;
  isHost: boolean;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  connectionStatus,
  roomId,
  onJoinRoom,
  onCreateRoom,
  onRequestResync,
  isHost,
}) => {
  const [inputRoomId, setInputRoomId] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}?room=${roomId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-brand bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-brand bg-amber-950/80 text-amber-400 border border-amber-800/50">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Connecting...
          </span>
        );
      case 'reconnecting':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-brand bg-yellow-950/80 text-yellow-400 border border-yellow-800/50">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Reconnecting (15s grace)...
          </span>
        );
      case 'desynced':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-brand bg-red-950/80 text-red-400 border border-red-800/50">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Desynced
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-brand bg-stone-900 text-stone-400 border border-stone-800">
            Disconnected
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-7 border-2 border-ayo-bevel/80 relative overflow-hidden text-stone-200"
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ayo-surfaceContainerHigh flex items-center justify-center border border-amber-900/50">
            <Users className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-brand text-amber-100">
              Multiplayer Arena
            </h2>
            <p className="text-xs font-brand text-stone-400">
              Authoritative Host P2P Network
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-amber-950/40 mb-6">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-brand text-stone-300">Status:</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Room Management */}
        <div className="space-y-5">
          {/* Current Room Section */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-brand font-bold text-amber-300/80">
              Current Room Code {isHost && '(Host: South)'}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-amber-900/40 font-mono text-base font-bold text-amber-100 flex items-center">
                {roomId}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl font-brand font-semibold text-xs bg-ayo-bevel hover:bg-ayo-bevelHighlight text-amber-100 transition-colors flex items-center gap-1.5 shadow-md"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Invite'}
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-amber-950/60" />
            <span className="flex-shrink mx-4 text-xs font-brand uppercase tracking-widest text-stone-500">
              Or Join Peer
            </span>
            <div className="flex-grow border-t border-amber-950/60" />
          </div>

          {/* Join Form */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter 6-char Room Code"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-amber-900/40 font-brand text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => {
                if (inputRoomId.trim()) onJoinRoom(inputRoomId.trim());
              }}
              disabled={!inputRoomId.trim()}
              className="px-5 py-2.5 rounded-xl font-brand font-bold text-sm bg-ayo-secondary hover:bg-amber-500 text-stone-950 transition-colors disabled:opacity-40 shadow-md"
            >
              Join
            </button>
          </div>

          {/* New Room Creation & Resync Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onCreateRoom}
              className="text-xs font-brand text-amber-300/80 hover:text-amber-200 underline underline-offset-4"
            >
              Generate New Room
            </button>

            {connectionStatus === 'desynced' && (
              <button
                onClick={onRequestResync}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-brand font-bold bg-amber-900/60 text-amber-200 hover:bg-amber-800/80 border border-amber-700/50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resync Board
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
