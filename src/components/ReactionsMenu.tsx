'use client';

import React from 'react';

interface ReactionsMenuProps {
  isOpen: boolean;
  onSelectReaction: (emoji: string) => void;
}

const REACTIONS = ['👍', '👏', '❤️', '🎉', '😂', '✋'];

export function ReactionsMenu({ isOpen, onSelectReaction }: ReactionsMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#24272C] border border-gray-700/80 rounded-full px-3 py-2 flex items-center gap-2 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelectReaction(emoji)}
          className="text-xl p-1.5 hover:scale-125 transition-transform cursor-pointer"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
