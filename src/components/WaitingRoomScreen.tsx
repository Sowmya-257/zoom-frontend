'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Loader2, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { getJoinStatus, leaveMeeting } from '@/lib/api';

interface WaitingRoomScreenProps {
  meeting: Meeting;
  displayName: string;
  identity: string;
  onAdmitted: (token: string, livekitUrl: string) => void;
}

export function WaitingRoomScreen({
  meeting,
  displayName,
  identity,
  onAdmitted,
}: WaitingRoomScreenProps) {
  const router = useRouter();
  const [removed, setRemoved] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const pollStatus = async () => {
      try {
        const res = await getJoinStatus(meeting.meeting_code, identity);
        if (isCancelled) return;

        if (res.meeting?.status === 'ENDED') {
          router.replace(`/meeting/${meeting.meeting_code}/ended`);
          return;
        }

        if (res.admission_status === 'ADMITTED' && res.token) {
          onAdmitted(res.token, res.livekit_url);
        } else if (res.admission_status === 'REMOVED') {
          setRemoved(true);
        }
      } catch (err) {
        console.error('Waiting room poll error:', err);
      }
    };

    // Poll every 1.5 seconds
    const interval = setInterval(pollStatus, 1500);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [meeting.meeting_code, identity, onAdmitted]);

  const handleLeave = async () => {
    try {
      setLeaving(true);
      await leaveMeeting(meeting.meeting_code, identity);
    } catch {
      // ignore
    } finally {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col font-sans select-none">
      {/* Zoom Top Header */}
      <header className="h-16 bg-white border-b border-[#E4E7EB] px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0B5CFF] flex items-center justify-center text-white">
            <Video className="w-4 h-4 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0B5CFF]">zoom</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">Secure Waiting Room</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-[#E4E7EB] rounded-2xl shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {removed ? (
            /* Eviction / Removal State */
            <div className="space-y-5">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-gray-900">Removed from Waiting Room</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  The host has removed you from the waiting room for this session.
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="w-full py-2.5 px-4 bg-[#0B5CFF] hover:bg-[#004FE6] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Return to Home
              </button>
            </div>
          ) : (
            /* Active Waiting State */
            <div className="space-y-6">
              {/* User Avatar with Pulse Ring */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full bg-blue-100 text-[#0B5CFF] border-2 border-blue-200 flex items-center justify-center text-2xl font-bold shadow-md">
                  {(displayName || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="absolute inset-0 rounded-full border-2 border-[#0B5CFF] animate-ping opacity-25" />
              </div>

              {/* Title & Message */}
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Please wait, the host will let you in soon.
                </h1>
                <p className="text-xs text-gray-500">
                  Signed in as <span className="font-semibold text-gray-700">{displayName}</span>
                </p>
              </div>

              {/* Meeting Info Card */}
              <div className="bg-[#F8F9FB] border border-[#E4E7EB] rounded-xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Meeting Topic:</span>
                  <span className="font-semibold text-gray-800 text-right truncate max-w-[200px]">
                    {meeting.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Meeting ID:</span>
                  <span className="font-mono font-medium text-gray-700">
                    {meeting.meeting_code}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Host:</span>
                  <span className="font-medium text-gray-700">
                    {meeting.host?.full_name || 'Alex Morgan'}
                  </span>
                </div>
              </div>

              {/* Live Status Indicator */}
              <div className="inline-flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-3.5 py-1.5 rounded-full font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0B5CFF]" />
                <span>Waiting for the host to admit you...</span>
              </div>

              {/* Leave Meeting Action */}
              <div className="pt-2">
                <button
                  onClick={handleLeave}
                  disabled={leaving}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors border border-gray-200 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {leaving ? 'Leaving...' : 'Leave Meeting'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
