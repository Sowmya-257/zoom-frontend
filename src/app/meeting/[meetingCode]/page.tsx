'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PreJoinScreen } from '@/components/PreJoinScreen';
import { MeetingRoom } from '@/components/MeetingRoom';
import { WaitingRoomScreen } from '@/components/WaitingRoomScreen';
import { getMeeting, joinMeeting } from '@/lib/api';
import { Meeting } from '@/types/meeting';
import { AlertCircle, ArrowLeft, Loader2, Video } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ meetingCode: string }>;
}

export default function MeetingPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nameParam = searchParams.get('name') || '';

  // Unwrap params using React `use`
  const resolvedParams = use(params);
  const meetingCode = resolvedParams.meetingCode;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Join state
  const [hasJoined, setHasJoined] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [token, setToken] = useState<string>('');
  const [livekitUrl, setLivekitUrl] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [identity, setIdentity] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [initialAudio, setInitialAudio] = useState(true);
  const [initialVideo, setInitialVideo] = useState(true);

  useEffect(() => {
    async function fetchMeetingData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMeeting(meetingCode);

        if (data.status === 'ENDED') {
          router.replace(`/meeting/${meetingCode}/ended`);
          return;
        }

        setMeeting(data);
      } catch (err: any) {
        setError(err?.message || 'Meeting not found. Please check the Meeting ID.');
      } finally {
        setLoading(false);
      }
    }

    if (meetingCode) {
      fetchMeetingData();
    }
  }, [meetingCode, router]);

  const handleJoin = async (settings: {
    displayName: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
  }) => {
    try {
      setJoining(true);
      setDisplayName(settings.displayName);
      setInitialAudio(settings.audioEnabled);
      setInitialVideo(settings.videoEnabled);

      // Call join endpoint to register participant & get status/token
      const joinRes = await joinMeeting(meetingCode, settings.displayName);
      setIdentity(joinRes.participant.identity);
      setIsHost(joinRes.participant.role === 'HOST');

      if (joinRes.admission_status === 'WAITING') {
        setIsWaiting(true);
      } else {
        setToken(joinRes.token || '');
        setLivekitUrl(joinRes.livekit_url);
        setHasJoined(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to the meeting.');
    } finally {
      setJoining(false);
    }
  };

  const handleAdmitted = (admittedToken: string, url: string) => {
    setToken(admittedToken);
    setLivekitUrl(url);
    setIsWaiting(false);
    setHasJoined(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#0B5CFF]" />
        <span className="text-sm font-medium text-gray-300">Loading meeting details...</span>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#24272C] border border-gray-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Cannot Join Meeting</h1>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              {error || 'This meeting ID is invalid or the meeting has concluded.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-white bg-[#0B5CFF] hover:bg-[#004FE6] rounded-xl transition-colors shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 1. Participant is in Waiting Room
  if (isWaiting) {
    return (
      <WaitingRoomScreen
        meeting={meeting}
        displayName={displayName}
        identity={identity}
        onAdmitted={handleAdmitted}
      />
    );
  }

  // 2. Pre-Join Screen
  if (!hasJoined) {
    return (
      <PreJoinScreen
        meeting={meeting}
        initialDisplayName={nameParam}
        onJoin={handleJoin}
        loading={joining}
      />
    );
  }

  // 3. Admitted inside Meeting Room
  return (
    <MeetingRoom
      meeting={meeting}
      token={token}
      livekitUrl={livekitUrl}
      initialAudio={initialAudio}
      initialVideo={initialVideo}
      isHost={isHost}
      displayName={displayName}
    />
  );
}
