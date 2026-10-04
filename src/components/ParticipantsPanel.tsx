'use client';

import React, { useState } from 'react';
import {
  X,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Shield,
  UserX,
  Search,
  UserCheck,
  Check,
  Clock,
  ScreenShare,
} from 'lucide-react';

export interface ParticipantItem {
  identity: string;
  name: string;
  isLocal: boolean;
  isHost: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing?: boolean;
  admissionStatus?: 'ADMITTED' | 'WAITING' | 'REMOVED';
  waitingSince?: string;
}

interface ParticipantsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: ParticipantItem[];
  waitingParticipants?: ParticipantItem[];
  isCurrentUserHost: boolean;
  onMuteAll?: () => void;
  onRemoveParticipant?: (identity: string) => void;
  onAdmit?: (identity: string) => void;
  onAdmitAll?: () => void;
  onRemoveWaiting?: (identity: string) => void;
}

export function ParticipantsPanel({
  isOpen,
  onClose,
  participants,
  waitingParticipants = [],
  isCurrentUserHost,
  onMuteAll,
  onRemoveParticipant,
  onAdmit,
  onAdmitAll,
  onRemoveWaiting,
}: ParticipantsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredActive = participants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWaiting = waitingParticipants.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCount = participants.length + waitingParticipants.length;

  return (
    <aside className="w-80 sm:w-96 bg-[#1A1D21] border-l border-gray-800 flex flex-col h-full z-20 transition-all duration-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0B5CFF]" />
          <h2 className="text-sm font-semibold text-white">
            Participants ({totalCount})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search box */}
      <div className="p-3 border-b border-gray-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Find a participant..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#24272C] text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0B5CFF] focus:border-transparent placeholder-gray-500"
          />
        </div>
      </div>

      {/* Scrollable list containing Waiting Room + In Meeting */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* Waiting Room Section (Host Only) */}
        {isCurrentUserHost && waitingParticipants.length > 0 && (
          <div className="bg-[#24272C]/90 border border-amber-500/30 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">
                  Waiting Room ({waitingParticipants.length})
                </span>
              </div>
              {onAdmitAll && waitingParticipants.length > 1 && (
                <button
                  onClick={onAdmitAll}
                  className="text-[11px] font-semibold text-[#0B5CFF] hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Admit All
                </button>
              )}
            </div>

            <div className="space-y-1">
              {filteredWaiting.map((wp) => (
                <div
                  key={wp.identity}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#1B1E22] hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-xs flex items-center justify-center shrink-0">
                      {wp.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gray-200 truncate max-w-[120px]">
                      {wp.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onAdmit && (
                      <button
                        onClick={() => onAdmit(wp.identity)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#0B5CFF] hover:bg-[#004FE6] rounded-md transition-colors shadow-xs"
                      >
                        Admit
                      </button>
                    )}
                    {onRemoveWaiting && (
                      <button
                        onClick={() => onRemoveWaiting(wp.identity)}
                        title="Remove from waiting room"
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In the Meeting Section Header */}
        <div>
          <div className="px-2 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            In the Meeting ({participants.length})
          </div>

          <div className="space-y-0.5 mt-1">
            {filteredActive.map((participant) => (
              <div
                key={participant.identity}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 font-semibold text-xs flex items-center justify-center shrink-0">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-200 truncate">
                        {participant.name}
                      </span>
                      {participant.isLocal && (
                        <span className="text-[10px] text-gray-400">(Me)</span>
                      )}
                      {participant.isHost && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-semibold bg-blue-500/20 text-blue-300 rounded">
                          <Shield className="w-2.5 h-2.5" /> Host
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Media status & Host actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {participant.isScreenSharing && (
                    <ScreenShare className="w-3.5 h-3.5 text-emerald-400" />
                  )}

                  {participant.isMuted ? (
                    <MicOff className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <Mic className="w-3.5 h-3.5 text-emerald-500" />
                  )}

                  {participant.isVideoOff ? (
                    <VideoOff className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <Video className="w-3.5 h-3.5 text-gray-400" />
                  )}

                  {/* Host remove action (cannot remove self) */}
                  {isCurrentUserHost && !participant.isLocal && onRemoveParticipant && (
                    <button
                      onClick={() => onRemoveParticipant(participant.identity)}
                      title="Remove participant"
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Host Controls Footer */}
      {isCurrentUserHost && (
        <div className="p-3 border-t border-gray-800 bg-[#16181B] flex items-center justify-between gap-2">
          <button
            onClick={onMuteAll}
            className="flex-1 py-1.5 px-3 text-xs font-semibold text-gray-200 bg-[#2A2E35] hover:bg-[#343942] rounded-lg transition-colors border border-gray-700/60"
          >
            Mute All
          </button>
        </div>
      )}
    </aside>
  );
}
