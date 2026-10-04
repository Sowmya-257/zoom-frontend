'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { ChatMessage } from '@/types/meeting';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function ChatPanel({ isOpen, onClose, messages, onSendMessage }: ChatPanelProps) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <aside className="w-80 sm:w-96 bg-[#1A1D21] border-l border-gray-800 flex flex-col h-full z-20 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#0B5CFF]" />
          <h2 className="text-sm font-semibold text-white">Meeting Chat</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-10 h-10 rounded-full bg-gray-800/80 text-gray-400 flex items-center justify-center mb-2">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-gray-400">No messages yet</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Messages sent here are visible to everyone in the meeting.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-300">
                  {msg.isSelf ? 'You' : msg.sender}
                </span>
                <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
              </div>
              <div
                className={`px-3 py-2 rounded-xl text-xs max-w-[85%] break-words ${
                  msg.isSelf
                    ? 'bg-[#0B5CFF] text-white rounded-tr-xs'
                    : 'bg-[#2A2E35] text-gray-200 rounded-tl-xs'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 bg-[#16181B]">
        <div className="relative flex items-center">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type message to everyone..."
            className="w-full pl-3 pr-10 py-2 text-xs bg-[#24272C] text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0B5CFF] focus:border-transparent placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="absolute right-1.5 p-1.5 text-[#0B5CFF] hover:text-[#004FE6] disabled:text-gray-600 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </aside>
  );
}
