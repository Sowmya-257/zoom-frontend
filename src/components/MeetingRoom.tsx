'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  isTrackReference,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
} from '@livekit/components-react';
import { Track, RoomEvent, Participant as LKParticipant } from 'livekit-client';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageSquare,
  Smile,
  PhoneOff,
  Shield,
  Info,
  ChevronUp,
  AlertCircle,
  Lock,
  Unlock,
  Clock,
  Check,
  ScreenShare,
  ScreenShareOff,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Meeting, ChatMessage, Participant as DBParticipant } from '@/types/meeting';
import { ChatPanel } from '@/components/ChatPanel';
import { ParticipantsPanel, ParticipantItem } from '@/components/ParticipantsPanel';
import { ReactionsMenu } from '@/components/ReactionsMenu';
import { Toast } from '@/components/Toast';
import {
  getMeeting,
  endMeeting,
  leaveMeeting,
  removeParticipant,
  muteAllParticipants,
  getWaitingParticipants,
  admitParticipant,
  admitAllParticipants,
  updateMeetingSecurity,
} from '@/lib/api';
import { format } from 'date-fns';

interface MeetingRoomProps {
  meeting: Meeting;
  token: string;
  livekitUrl: string;
  initialAudio: boolean;
  initialVideo: boolean;
  isHost: boolean;
  displayName: string;
}

export function MeetingRoom({
  meeting,
  token,
  livekitUrl,
  initialAudio,
  initialVideo,
  isHost,
  displayName,
}: MeetingRoomProps) {
  const router = useRouter();

  const handleDisconnected = () => {
    router.push(`/meeting/${meeting.meeting_code}/ended`);
  };

  return (
    <div className="h-screen w-screen bg-[#12161A] text-white flex flex-col overflow-hidden select-none font-sans">
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        audio={initialAudio}
        video={initialVideo}
        onDisconnected={handleDisconnected}
        className="flex-1 flex flex-col h-full overflow-hidden"
      >
        <RoomAudioRenderer />
        <MeetingRoomContent
          meeting={meeting}
          isHost={isHost}
          displayName={displayName}
        />
      </LiveKitRoom>
    </div>
  );
}

function MeetingRoomContent({
  meeting,
  isHost,
  displayName,
}: {
  meeting: Meeting;
  isHost: boolean;
  displayName: string;
}) {
  const router = useRouter();
  const room = useRoomContext();
  const participants = useParticipants();
  const { localParticipant, isScreenShareEnabled } = useLocalParticipant();

  // Fullscreen state and ref for screen share container
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = () => {
    if (!screenContainerRef.current) return;
    if (!document.fullscreenElement) {
      screenContainerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    
    // Suppress known LiveKit DataChannel abort errors to prevent Next.js dev overlay crashes
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('DataChannel error on lossy: User-Initiated Abort')) return;
      originalConsoleError.apply(console, args);
    };

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      console.error = originalConsoleError;
    };
  }, []);

  // Panels & modals state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isReactionsOpen, setIsReactionsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Security flags state
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(meeting.waiting_room_enabled);
  const [isLocked, setIsLocked] = useState(meeting.is_locked);
  const [waitingList, setWaitingList] = useState<ParticipantItem[]>([]);

  // Messages and reactions
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [floatingReaction, setFloatingReaction] = useState<{ id: string; emoji: string; sender: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Elapsed duration timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Subscribe to camera tracks and screen share tracks
  const cameraTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false }
  );

  const screenTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false }
  );

  // Host: Poll waiting participants
  useEffect(() => {
    if (!isHost) return;

    let isCancelled = false;
    const fetchWaiting = async () => {
      try {
        const data = await getWaitingParticipants(meeting.meeting_code);
        if (isCancelled) return;
        const mapped: ParticipantItem[] = data.map((p) => ({
          identity: p.identity,
          name: p.display_name,
          isLocal: false,
          isHost: false,
          isMuted: p.is_muted,
          isVideoOff: p.is_video_off,
          admissionStatus: p.admission_status,
        }));
        setWaitingList(mapped);
      } catch (err) {
        console.error('Failed to load waiting participants:', err);
      }
    };

    fetchWaiting();
    const interval = setInterval(fetchWaiting, 2000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isHost, meeting.meeting_code]);

  // Handle incoming LiveKit data messages (chat, reactions, host mute_all, removal)
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array, participant?: LKParticipant) => {
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);

        if (data.type === 'chat') {
          setMessages((prev) => [
            ...prev,
            {
              id: data.id || String(Date.now()),
              sender: data.sender || participant?.name || 'Participant',
              identity: data.identity || participant?.identity || '',
              text: data.text,
              timestamp: data.timestamp || format(new Date(), 'hh:mm a'),
              isSelf: false,
            },
          ]);
        } else if (data.type === 'reaction') {
          setFloatingReaction({
            id: String(Date.now()),
            emoji: data.emoji,
            sender: data.sender || participant?.name || 'Someone',
          });
          setTimeout(() => setFloatingReaction(null), 3000);
        } else if (data.type === 'mute_all') {
          if (!isHost && localParticipant) {
            localParticipant.setMicrophoneEnabled(false);
            setToast({ message: 'The host has muted all participants.', type: 'info' });
          }
        } else if (data.type === 'removed') {
          if (localParticipant && data.targetIdentity === localParticipant.identity) {
            setToast({ message: 'You have been removed from the meeting by the host.', type: 'error' });
            setTimeout(() => {
              room.disconnect();
              router.push(`/meeting/${meeting.meeting_code}/ended`);
            }, 800);
          }
        } else if (data.type === 'meeting_ended') {
          setToast({
            message: data.message || 'The host has ended the meeting for all participants.',
            type: 'info',
          });
          setTimeout(() => {
            if (room) {
              room.disconnect();
            }
            router.push(`/meeting/${meeting.meeting_code}/ended`);
          }, 600);
        }
      } catch (err) {
        console.error('Failed to parse received data packet:', err);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, localParticipant, isHost, meeting.meeting_code, router]);

  // Participant: Monitor meeting status from backend so if host ends meeting, attendees exit immediately
  useEffect(() => {
    if (isHost) return;

    let isCancelled = false;
    const checkMeetingStatus = async () => {
      try {
        const currentMeeting = await getMeeting(meeting.meeting_code);
        if (isCancelled) return;
        if (currentMeeting.status === 'ENDED') {
          setToast({ message: 'The host has ended the meeting.', type: 'info' });
          setTimeout(() => {
            if (room) room.disconnect();
            router.push(`/meeting/${meeting.meeting_code}/ended`);
          }, 400);
        }
      } catch {
        // Ignore transient errors
      }
    };

    const interval = setInterval(checkMeetingStatus, 2500);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isHost, meeting.meeting_code, room, router]);

  // Send text message via LiveKit data channel
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!room || !localParticipant) return;
      const now = format(new Date(), 'hh:mm a');
      const payload = {
        type: 'chat',
        id: String(Date.now()),
        text,
        sender: displayName,
        identity: localParticipant.identity,
        timestamp: now,
      };

      try {
        const encoded = new TextEncoder().encode(JSON.stringify(payload));
        await localParticipant.publishData(encoded, { reliable: true });

        setMessages((prev) => [
          ...prev,
          {
            id: payload.id,
            sender: displayName,
            identity: localParticipant.identity,
            text,
            timestamp: now,
            isSelf: true,
          },
        ]);
      } catch (err) {
        console.error('Failed to send chat message:', err);
      }
    },
    [room, localParticipant, displayName]
  );

  // Send reaction via LiveKit data channel
  const handleSendReaction = useCallback(
    async (emoji: string) => {
      if (!room || !localParticipant) return;
      const payload = {
        type: 'reaction',
        emoji,
        sender: displayName,
      };
      try {
        const encoded = new TextEncoder().encode(JSON.stringify(payload));
        await localParticipant.publishData(encoded, { reliable: true });

        setFloatingReaction({
          id: String(Date.now()),
          emoji,
          sender: 'You',
        });
        setTimeout(() => setFloatingReaction(null), 3000);
        setIsReactionsOpen(false);
      } catch (err) {
        console.error('Failed to send reaction:', err);
      }
    },
    [room, localParticipant, displayName]
  );

  // Screen Share toggle
  const toggleScreenShare = useCallback(async () => {
    if (!localParticipant) return;
    try {
      const nextState = !isScreenShareEnabled;
      await localParticipant.setScreenShareEnabled(nextState, {
        audio: true,
      });
      if (nextState) {
        setToast({ message: 'Screen sharing started.', type: 'success' });
      } else {
        setToast({ message: 'Screen sharing stopped.', type: 'info' });
      }
    } catch (err: unknown) {
      console.error('Failed to toggle screen share:', err);
      const errStr = String(err);
      if (
        !errStr.includes('Permission denied') &&
        !errStr.includes('cancelled') &&
        !errStr.includes('AbortError') &&
        !errStr.includes('NotAllowedError')
      ) {
        setToast({
          message: 'Unable to start screen sharing. Please check permissions.',
          type: 'error',
        });
      }
    }
  }, [localParticipant, isScreenShareEnabled]);

  // Host: Mute All Participants
  const handleMuteAll = async () => {
    if (!room || !localParticipant || !isHost) return;
    try {
      // 1. Broadcast real-time mute packet to all peers in room
      const payload = { type: 'mute_all' };
      const encoded = new TextEncoder().encode(JSON.stringify(payload));
      await localParticipant.publishData(encoded, { reliable: true });

      // 2. Persist in database so subsequent joiners are also muted
      await muteAllParticipants(meeting.meeting_code);

      setToast({ message: 'All participants have been muted.', type: 'info' });
    } catch (err) {
      console.error('Failed to mute all:', err);
      setToast({ message: 'Failed to mute all participants.', type: 'error' });
    }
  };

  // Host: Admit single waiting participant
  const handleAdmit = async (identity: string) => {
    try {
      await admitParticipant(meeting.meeting_code, identity);
      setWaitingList((prev) => prev.filter((p) => p.identity !== identity));
      setToast({ message: 'Participant admitted into meeting.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to admit participant.', type: 'error' });
    }
  };

  // Host: Admit all waiting participants
  const handleAdmitAll = async () => {
    try {
      await admitAllParticipants(meeting.meeting_code);
      setWaitingList([]);
      setToast({ message: 'All waiting participants admitted.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to admit all participants.', type: 'error' });
    }
  };

  // Host: Remove waiting participant
  const handleRemoveWaiting = async (identity: string) => {
    try {
      await removeParticipant(meeting.meeting_code, identity);
      setWaitingList((prev) => prev.filter((p) => p.identity !== identity));
      setToast({ message: 'Participant removed from waiting room.', type: 'info' });
    } catch {
      setToast({ message: 'Failed to remove participant.', type: 'error' });
    }
  };

  // Host: Remove connected participant
  const handleRemoveParticipant = async (identity: string) => {
    if (!room || !localParticipant || !isHost) return;
    try {
      const payload = { type: 'removed', targetIdentity: identity };
      const encoded = new TextEncoder().encode(JSON.stringify(payload));
      await localParticipant.publishData(encoded, { reliable: true });

      await removeParticipant(meeting.meeting_code, identity);
      setToast({ message: 'Participant removed from meeting.', type: 'info' });
    } catch {
      setToast({ message: 'Failed to remove participant.', type: 'error' });
    }
  };

  // Host: Toggle Waiting Room
  const toggleWaitingRoom = async () => {
    const nextVal = !waitingRoomEnabled;
    try {
      await updateMeetingSecurity(meeting.meeting_code, { waiting_room_enabled: nextVal });
      setWaitingRoomEnabled(nextVal);
      setToast({
        message: nextVal ? 'Waiting Room enabled.' : 'Waiting Room disabled.',
        type: 'info',
      });
    } catch {
      setToast({ message: 'Failed to update security settings.', type: 'error' });
    }
  };

  // Host: Toggle Lock Meeting
  const toggleLockMeeting = async () => {
    const nextVal = !isLocked;
    try {
      await updateMeetingSecurity(meeting.meeting_code, { is_locked: nextVal });
      setIsLocked(nextVal);
      setToast({
        message: nextVal ? 'Meeting is now locked. No new participants can join.' : 'Meeting is now unlocked.',
        type: 'info',
      });
    } catch {
      setToast({ message: 'Failed to update security settings.', type: 'error' });
    }
  };

  // Leave / End meeting
  const handleLeaveOrEnd = async (endForAll = false) => {
    try {
      if (endForAll && isHost) {
        // 1. Broadcast real-time meeting_ended packet to all connected peers
        if (room && localParticipant) {
          try {
            const payload = {
              type: 'meeting_ended',
              message: 'The host has ended the meeting for all participants.',
              hostName: displayName,
            };
            const encoded = new TextEncoder().encode(JSON.stringify(payload));
            await localParticipant.publishData(encoded, { reliable: true });
          } catch (pubErr) {
            console.warn('Could not broadcast meeting_ended packet:', pubErr);
          }
        }

        // 2. Call backend to update DB status to ENDED and delete room on LiveKit
        await endMeeting(meeting.meeting_code);
      } else if (localParticipant) {
        await leaveMeeting(meeting.meeting_code, localParticipant.identity);
      }
    } catch (err) {
      console.error('Error during meeting exit:', err);
    } finally {
      if (room) {
        room.disconnect();
      }
      router.push(`/meeting/${meeting.meeting_code}/ended`);
    }
  };

  // Map participant list for panel
  const participantItems: ParticipantItem[] = participants.map((p) => {
    const isMe = p === localParticipant;
    return {
      identity: p.identity,
      name: p.name || p.identity,
      isLocal: isMe,
      isHost: p.identity === meeting.host_id || (isMe && isHost),
      isMuted: !p.isMicrophoneEnabled,
      isVideoOff: !p.isCameraEnabled,
      isScreenSharing: p.isScreenShareEnabled,
    };
  });

  // Screen share active selection
  const activeScreenTrack =
    screenTracks.find((t) => t.participant === localParticipant) || screenTracks[0];
  const isMyScreenShare = activeScreenTrack?.participant === localParticipant;

  // Dynamic grid column calculation
  const numVideos = Math.max(cameraTracks.length, 1);
  const gridCols =
    numVideos === 1
      ? 'grid-cols-1'
      : numVideos === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : numVideos <= 4
      ? 'grid-cols-2'
      : numVideos <= 6
      ? 'grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-3 lg:grid-cols-4';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#12161A] text-white relative overflow-hidden font-sans">
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Header Bar */}
      <header className="h-12 bg-[#1A1D21] border-b border-gray-800/80 px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
            <Shield className="w-3.5 h-3.5" />
            <span className="font-medium hidden sm:inline">End-to-End Encrypted</span>
          </div>
          <h1 className="text-xs sm:text-sm font-semibold text-gray-200 truncate max-w-[200px] sm:max-w-md">
            {meeting.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5 bg-[#24272C] px-2.5 py-1 rounded font-mono text-gray-300">
            <Clock className="w-3 h-3 text-[#0B5CFF]" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
          <div className="hidden sm:block text-gray-500">
            ID: <span className="font-mono text-gray-300">{meeting.meeting_code}</span>
          </div>
        </div>
      </header>

      {/* Main Video Viewport & Side Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {screenTracks.length > 0 && activeScreenTrack ? (
            /* Stage Mode: Screen Share Dominant with Participant Video Strip */
            <div className="w-full h-full max-w-7xl mx-auto flex flex-col gap-3 min-h-0">
              {/* Participant Camera Video Filmstrip */}
              {cameraTracks.length > 0 && (
                <div className="h-28 sm:h-32 shrink-0 flex items-center gap-2.5 overflow-x-auto px-1 py-1 scrollbar-thin scrollbar-thumb-gray-700">
                  {cameraTracks.map((trackRef) => {
                    const p = trackRef.participant;
                    const isSpeaking = p.isSpeaking;
                    const isAudioMuted = !p.isMicrophoneEnabled;
                    const isMe = p === localParticipant;

                    return (
                      <div
                        key={`${p.identity}-${trackRef.source}`}
                        className={`relative h-full aspect-video min-w-[140px] sm:min-w-[170px] bg-[#24272C] rounded-lg overflow-hidden border transition-all duration-150 flex items-center justify-center shrink-0 shadow-md ${
                          isSpeaking ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-gray-800'
                        }`}
                      >
                        {isTrackReference(trackRef) && !trackRef.publication.isMuted && trackRef.publication.track ? (
                          <VideoTrack
                            trackRef={trackRef}
                            className={`w-full h-full object-cover ${isMe ? 'transform scale-x-[-1]' : ''}`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1B1E22]">
                            <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center text-sm font-bold shadow-xs">
                              {(p.name || displayName || 'U').charAt(0).toUpperCase()}
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                          <div className="flex items-center gap-1 bg-black/75 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] text-white font-medium truncate max-w-full">
                            {isAudioMuted ? (
                              <MicOff className="w-2.5 h-2.5 text-red-500 shrink-0" />
                            ) : (
                              <Mic className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[100px]">{p.name || p.identity} {isMe ? '(You)' : ''}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Screen Share Stage Viewport */}
              <div
                ref={screenContainerRef}
                className="relative flex-1 w-full min-h-0 bg-black rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center shadow-2xl group"
              >
                {/* Zoom Floating Status Pill */}
                <div
                  className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md transition-all duration-200 border text-xs font-semibold select-none ${
                    isMyScreenShare
                      ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300'
                      : 'bg-[#1A1D21]/90 border-gray-700 text-gray-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="flex items-center gap-1.5">
                    <ScreenShare className="w-3.5 h-3.5 text-emerald-400" />
                    {isMyScreenShare
                      ? 'You are sharing your screen'
                      : `Viewing ${(activeScreenTrack.participant.name || activeScreenTrack.participant.identity)}'s screen`}
                  </span>
                  {isMyScreenShare && (
                    <button
                      onClick={toggleScreenShare}
                      className="ml-2 px-2.5 py-0.5 bg-[#E53935] hover:bg-[#D32F2F] text-white text-[11px] font-bold rounded-full transition-colors cursor-pointer shadow-xs"
                    >
                      Stop Share
                    </button>
                  )}
                </div>

                {/* Active Screen Share Video */}
                {isTrackReference(activeScreenTrack) && activeScreenTrack.publication?.track ? (
                  <VideoTrack
                    trackRef={activeScreenTrack}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 text-gray-400">
                    <ScreenShare className="w-12 h-12 text-emerald-400 mb-2 animate-pulse" />
                    <p className="text-sm font-medium">Connecting to screen share stream...</p>
                  </div>
                )}

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullScreen}
                  title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
                  className="absolute bottom-3 right-3 z-20 p-2 bg-black/70 hover:bg-black/90 text-gray-300 hover:text-white rounded-lg border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            /* Standard Grid View (No screen shared) */
            <div
              className={`w-full h-full max-w-6xl mx-auto grid ${gridCols} gap-3 sm:gap-4 auto-rows-fr items-center justify-center`}
            >
              {cameraTracks.length === 0 ? (
                <div className="col-span-full h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#24272C] flex items-center justify-center text-gray-400 mb-3">
                    <Users className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-gray-300">Connecting to conference room...</p>
                </div>
              ) : (
                cameraTracks.map((trackRef) => {
                  const p = trackRef.participant;
                  const isSpeaking = p.isSpeaking;
                  const isAudioMuted = !p.isMicrophoneEnabled;
                  const isMe = p === localParticipant;

                  return (
                    <div
                      key={`${p.identity}-${trackRef.source}`}
                      className={`relative w-full h-full min-h-[180px] bg-[#24272C] rounded-xl overflow-hidden border transition-all duration-150 flex items-center justify-center shadow-lg ${
                        isSpeaking ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-gray-800'
                      }`}
                    >
                      {/* Video Stream or Avatar */}
                      {isTrackReference(trackRef) && !trackRef.publication.isMuted && trackRef.publication.track ? (
                        <VideoTrack
                          trackRef={trackRef}
                          className={`w-full h-full object-cover ${isMe ? 'transform scale-x-[-1]' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#1B1E22]">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center text-xl sm:text-2xl font-bold shadow-md">
                            {(p.name || displayName || 'U').charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}

                      {/* Participant Name & Mic Status Badge */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs text-white font-medium">
                          {isAudioMuted ? (
                            <MicOff className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          ) : (
                            <Mic className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[120px] sm:max-w-[180px]">
                            {p.name || p.identity} {isMe ? '(You)' : ''}
                          </span>
                          {(p.identity === meeting.host_id || (isMe && isHost)) && (
                            <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1 py-0.2 rounded font-semibold ml-0.5">
                              Host
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Side Panels */}
        <ParticipantsPanel
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          participants={participantItems}
          waitingParticipants={waitingList}
          isCurrentUserHost={isHost}
          onMuteAll={handleMuteAll}
          onRemoveParticipant={handleRemoveParticipant}
          onAdmit={handleAdmit}
          onAdmitAll={handleAdmitAll}
          onRemoveWaiting={handleRemoveWaiting}
        />

        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Floating Reaction Animation */}
      {floatingReaction && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-300">
          <span className="text-6xl drop-shadow-xl">{floatingReaction.emoji}</span>
          <span className="text-xs font-semibold text-white bg-black/70 px-2 py-0.5 rounded-full mt-1">
            {floatingReaction.sender}
          </span>
        </div>
      )}

      {/* Reactions Menu Popover */}
      <ReactionsMenu
        isOpen={isReactionsOpen}
        onSelectReaction={handleSendReaction}
      />

      {/* Security Host Popover */}
      {isSecurityOpen && isHost && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 sm:left-48 sm:translate-x-0 z-40 bg-[#1A1D21] border border-gray-700/80 rounded-xl shadow-2xl p-3 w-64 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="text-xs font-semibold text-gray-300 pb-2 border-b border-gray-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#0B5CFF]" /> Host Security
            </span>
            <button
              onClick={() => setIsSecurityOpen(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/60 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-200">Lock Meeting</span>
            </div>
            <input
              type="checkbox"
              checked={isLocked}
              onChange={toggleLockMeeting}
              className="rounded accent-[#0B5CFF]"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/60 cursor-pointer transition-colors">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-200">Enable Waiting Room</span>
            </div>
            <input
              type="checkbox"
              checked={waitingRoomEnabled}
              onChange={toggleWaitingRoom}
              className="rounded accent-[#0B5CFF]"
            />
          </label>
        </div>
      )}

      {/* Zoom Bottom Toolbar */}
      <footer id="meeting-controls-bar" className="h-[72px] min-h-[72px] bg-[#1A1D21] border-t border-gray-800/80 z-30 shrink-0 w-full overflow-x-auto">
        <div className="flex items-center justify-between min-w-max w-full h-full px-2 sm:px-6 gap-4">
          {/* Left: Audio & Video Media Toggles */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mic Button */}
          <button
            onClick={() => {
              if (localParticipant) {
                localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
              }
            }}
            className={`flex flex-col items-center justify-center w-12 sm:w-16 h-12 sm:h-14 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
              localParticipant?.isMicrophoneEnabled ? 'text-gray-200' : 'text-red-400'
            }`}
          >
            {localParticipant?.isMicrophoneEnabled ? (
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200" />
            ) : (
              <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            )}
            <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 sm:mt-1">
              {localParticipant?.isMicrophoneEnabled ? 'Mute' : 'Unmute'}
            </span>
          </button>

          {/* Camera Button */}
          <button
            onClick={() => {
              if (localParticipant) {
                localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
              }
            }}
            className={`flex flex-col items-center justify-center w-12 sm:w-16 h-12 sm:h-14 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
              localParticipant?.isCameraEnabled ? 'text-gray-200' : 'text-red-400'
            }`}
          >
            {localParticipant?.isCameraEnabled ? (
              <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200" />
            ) : (
              <VideoOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            )}
            <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 sm:mt-1 truncate max-w-[48px] sm:max-w-none">
              {localParticipant?.isCameraEnabled ? 'Stop Video' : 'Start Video'}
            </span>
          </button>
        </div>

        {/* Center: Collaboration Tools (Security, Participants, Chat, Reactions) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Security (Host Only) */}
          {isHost && (
            <button
              onClick={() => setIsSecurityOpen(!isSecurityOpen)}
              className={`flex flex-col items-center justify-center w-12 sm:w-16 h-12 sm:h-14 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
                isSecurityOpen ? 'bg-gray-800 text-white' : 'text-gray-300'
              }`}
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#0B5CFF]" />
              <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 sm:mt-1">
                Security
              </span>
            </button>
          )}

          {/* Participants with Waiting Room indicator */}
          <button
            onClick={() => {
              setIsParticipantsOpen(!isParticipantsOpen);
              if (isChatOpen) setIsChatOpen(false);
            }}
            className={`relative flex flex-col items-center justify-center w-12 sm:w-20 h-12 sm:h-14 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
              isParticipantsOpen ? 'bg-gray-800 text-white' : 'text-gray-300'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 sm:mt-1 truncate max-w-[48px] sm:max-w-none">
              People
            </span>
            <span className="absolute top-1 sm:top-1.5 right-1 sm:right-3 bg-gray-700 text-gray-200 text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 rounded-full">
              {participants.length}
            </span>
            {waitingList.length > 0 && isHost && (
              <span className="absolute top-1 left-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#1A1D21] animate-pulse" />
            )}
          </button>

          {/* Screen Share Button (Iconic Zoom Green / Red when sharing) */}
          <button
            id="share-screen-btn"
            onClick={toggleScreenShare}
            className={`flex flex-col items-center justify-center w-14 sm:w-20 h-12 sm:h-14 rounded-lg transition-all cursor-pointer ${
              isScreenShareEnabled
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
            }`}
            title={isScreenShareEnabled ? 'Stop Share' : 'Share Screen'}
          >
            {isScreenShareEnabled ? (
              <ScreenShareOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
            ) : (
              <ScreenShare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            )}
            <span className="text-[9px] sm:text-[11px] font-semibold mt-0.5 sm:mt-1 truncate max-w-[56px] sm:max-w-none">
              {isScreenShareEnabled ? 'Stop Share' : 'Share'}
            </span>
          </button>

          {/* Chat */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              if (isParticipantsOpen) setIsParticipantsOpen(false);
            }}
            className={`relative flex flex-col items-center justify-center w-12 sm:w-16 h-12 sm:h-14 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
              isChatOpen ? 'bg-gray-800 text-white' : 'text-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 sm:mt-1">
              Chat
            </span>
            {messages.length > 0 && !isChatOpen && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#0B5CFF]" />
            )}
          </button>

          {/* Reactions */}
          <button
            onClick={() => setIsReactionsOpen(!isReactionsOpen)}
            className={`flex flex-col items-center justify-center w-12 sm:w-16 h-12 sm:h-14 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
              isReactionsOpen ? 'bg-gray-800 text-white' : 'text-gray-300'
            }`}
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[11px] font-medium mt-0.5 sm:mt-1">
              Reactions
            </span>
          </button>
        </div>

        {/* Right: End / Leave Button in Zoom Red */}
        <div className="flex items-center shrink-0">
          <button
            id="end-leave-meeting-btn"
            onClick={() => setShowEndModal(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#E53935] hover:bg-[#D32F2F] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isHost ? 'End' : 'Leave'}</span>
          </button>
        </div>
        </div>
      </footer>

      {/* End / Leave Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#1E2125] border border-gray-700/80 rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <PhoneOff className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {isHost ? 'End or Leave Meeting' : 'Leave Meeting'}
              </h3>
              <p className="text-xs text-gray-400">
                {isHost
                  ? 'As a host, you can end the meeting for everyone, or just leave and keep the room open.'
                  : 'Are you sure you want to leave this meeting?'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {isHost ? (
                <>
                  <button
                    id="confirm-end-for-all-btn"
                    onClick={() => handleLeaveOrEnd(true)}
                    className="w-full py-2.5 px-4 bg-[#E53935] hover:bg-[#D32F2F] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    End Meeting for All
                  </button>
                  <button
                    onClick={() => handleLeaveOrEnd(false)}
                    className="w-full py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Leave Meeting
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleLeaveOrEnd(false)}
                  className="w-full py-2.5 px-4 bg-[#E53935] hover:bg-[#D32F2F] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Leave Meeting
                </button>
              )}

              <button
                onClick={() => setShowEndModal(false)}
                className="w-full py-2 px-4 text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
