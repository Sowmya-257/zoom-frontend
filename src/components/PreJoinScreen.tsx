'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Settings, AlertTriangle, ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { Meeting } from '@/types/meeting';

interface PreJoinScreenProps {
  meeting: Meeting;
  initialDisplayName?: string;
  onJoin: (settings: {
    displayName: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
  }) => void;
  loading: boolean;
}

export function PreJoinScreen({
  meeting,
  initialDisplayName = '',
  onJoin,
  loading,
}: PreJoinScreenProps) {
  const [displayName, setDisplayName] = useState(
    initialDisplayName || (typeof window !== 'undefined' ? localStorage.getItem('zoom_display_name') || '' : '')
  );
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize media devices preview
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isCancelled = false;

    async function initPreview() {
      try {
        setPermissionError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn('Media preview permission note:', err?.message || err);
        // If both denied or no device, try audio only or handle error smoothly
        setPermissionError(
          'Camera or microphone access was restricted. You can still join the meeting in listen/view mode.'
        );
        setVideoEnabled(false);
        setAudioEnabled(false);
      }
    }

    initPreview();

    return () => {
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Update track enabled states when toggled
  const toggleVideo = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
      }
    }
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
      }
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    // Persist name in local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem('zoom_display_name', displayName.trim());
    }

    // Stop local preview tracks before handing over to LiveKit room
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    onJoin({
      displayName: displayName.trim(),
      audioEnabled,
      videoEnabled,
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#24272C] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-700/60 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#0B5CFF]">
              Ready to Join
            </span>
            <h1 className="text-xl font-bold text-white mt-0.5">
              {meeting.title}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Meeting ID: <span className="font-mono text-gray-300">{meeting.meeting_code}</span>
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>

        {permissionError && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Video Preview Box */}
        <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-200 ${
              videoEnabled && mediaStream ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Placeholder when camera is off */}
          {(!videoEnabled || !mediaStream) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#181B1F]">
              <div className="w-20 h-20 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center text-2xl font-bold">
                {displayName.trim() ? displayName.trim().charAt(0).toUpperCase() : 'Z'}
              </div>
              <span className="text-xs text-gray-400 mt-3 font-medium">Camera is off</span>
            </div>
          )}

          {/* Floating In-Preview Controls */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-3 rounded-full backdrop-blur-md transition-all ${
                audioEnabled
                  ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
              }`}
              title={audioEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={toggleVideo}
              className={`p-3 rounded-full backdrop-blur-md transition-all ${
                videoEnabled
                  ? 'bg-gray-800/80 hover:bg-gray-700/80 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
              }`}
              title={videoEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Name input and Join Button */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Enter your name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex, Sarah"
              className="w-full px-4 py-2.5 text-sm bg-[#181B1F] text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent placeholder-gray-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="w-full py-3 text-sm font-semibold text-white bg-[#0B5CFF] hover:bg-[#004FE6] rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting to Room...
              </>
            ) : (
              'Join Meeting'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
