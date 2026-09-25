'use client';

import React, { useState } from 'react';
import { PeerConnectionStatus } from '@/lib/multiplayer-host';
import { X, Copy, Check, Users, RefreshCw, Radio, Share2, Swords } from 'lucide-react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionStatus: PeerConnectionStatus;
  roomId: string;
  onJoinRoom: (id: string) => void;
  onCreateRoom: () => void;
  onRequestResync: () => void;
  isHost: boolean;
  playerName?: string;
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
  playerName = 'Player',
}) => {
  const [inputRoomId, setInputRoomId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen) return null;

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}?room=${roomId}&challenger=${encodeURIComponent(playerName)}`;
    }
    return `?room=${roomId}&challenger=${encodeURIComponent(playerName)}`;
  };

  const getChallengeMessage = () => {
    return `${playerName} has challenged you to play Ayò Ọlọ́pọ́n. Accept the challenge here: ${getShareUrl()}`;
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(getShareUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyChallengeMessage = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(getChallengeMessage());
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
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
            Desynchronized
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
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-amber-200 hover:bg-white/5 transition-colors cursor-pointer"
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
              Online Multiplayer
            </h2>
            <p className="text-xs font-brand text-stone-400">
              Peer-to-Peer Realtime Match
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-amber-950/40 mb-5">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-brand text-stone-300">Connection Status:</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Room & Challenge Management */}
        <div className="space-y-5">
          {/* Challenge & Invite Section */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-brand font-bold text-amber-300/90 flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Invite Friend & Challenge</span>
            </label>

            {/* Room Code & Copy Link */}
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-amber-900/40 font-mono text-base font-bold text-amber-100 flex items-center justify-between">
                <span>{roomId}</span>
                <span className="text-[10px] text-amber-400/70 font-brand uppercase tracking-wider">
                  {isHost ? 'Host' : 'Peer'}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl font-brand font-semibold text-xs bg-ayo-bevel hover:bg-ayo-bevelHighlight text-amber-100 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
                title="Copy Invitation Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Share Challenge Message Button */}
            <button
              onClick={handleCopyChallengeMessage}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 hover:text-amber-100 hover:bg-amber-900/50 transition-colors text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>
                {copiedMessage
                  ? 'Challenge Message Copied!'
                  : `Copy Challenge: "${playerName} has challenged you to play"`}
              </span>
            </button>
            <p className="text-[11px] text-stone-400 italic text-center">
              Send this link to your opponent. Once accepted, they will land on the match screen to play with you.
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-amber-950/60" />
            <span className="flex-shrink mx-4 text-xs font-brand uppercase tracking-widest text-stone-500">
              Or Join An Existing Room
            </span>
            <div className="flex-grow border-t border-amber-950/60" />
          </div>

          {/* Join Form */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Room Code (e.g. AYO-1234)"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-amber-900/40 font-brand text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => {
                if (inputRoomId.trim()) onJoinRoom(inputRoomId.trim());
              }}
              disabled={!inputRoomId.trim()}
              className="px-5 py-2.5 rounded-xl font-brand font-bold text-sm bg-ayo-secondary hover:bg-amber-500 text-stone-950 transition-colors disabled:opacity-40 shadow-md cursor-pointer"
            >
              Join
            </button>
          </div>

          {/* New Room Creation & Resync Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onCreateRoom}
              className="text-xs font-brand text-amber-300/80 hover:text-amber-200 underline underline-offset-4 cursor-pointer"
            >
              Generate New Room Code
            </button>

            {connectionStatus === 'desynced' && (
              <button
                onClick={onRequestResync}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-brand font-bold bg-amber-900/60 text-amber-200 hover:bg-amber-800/80 border border-amber-700/50 cursor-pointer"
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
