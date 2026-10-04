'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Plus, Calendar, Loader2 } from 'lucide-react';
import { createInstantMeeting } from '@/lib/api';

interface DashboardActionsProps {
  onOpenJoin: () => void;
  onOpenSchedule: () => void;
  onError: (msg: string) => void;
}

export function DashboardActions({
  onOpenJoin,
  onOpenSchedule,
  onError,
}: DashboardActionsProps) {
  const router = useRouter();
  const [creatingInstant, setCreatingInstant] = useState(false);

  const handleNewMeeting = async () => {
    try {
      setCreatingInstant(true);
      const meeting = await createInstantMeeting('Instant Meeting');
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err: any) {
      onError(err?.message || 'Failed to create instant meeting.');
      setCreatingInstant(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 font-sans">
      {/* 1. New Meeting (Signature Zoom Orange) */}
      <button
        onClick={handleNewMeeting}
        disabled={creatingInstant}
        className="flex flex-col items-center justify-center p-6 bg-white hover:bg-orange-50/40 border border-[#E4E7EB] hover:border-orange-300 rounded-2xl shadow-xs transition-all duration-150 group cursor-pointer"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#F26D21] flex items-center justify-center text-white shadow-md group-hover:scale-105 group-active:scale-95 transition-transform">
          {creatingInstant ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <Video className="w-8 h-8 fill-current" />
          )}
        </div>
        <span className="mt-3.5 text-base font-bold text-gray-900 group-hover:text-[#F26D21] transition-colors">
          New Meeting
        </span>
        <span className="text-xs text-gray-500 mt-0.5">
          Start instant room
        </span>
      </button>

      {/* 2. Join Meeting (Signature Zoom Blue) */}
      <button
        onClick={onOpenJoin}
        className="flex flex-col items-center justify-center p-6 bg-white hover:bg-blue-50/40 border border-[#E4E7EB] hover:border-blue-300 rounded-2xl shadow-xs transition-all duration-150 group cursor-pointer"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#0B5CFF] flex items-center justify-center text-white shadow-md group-hover:scale-105 group-active:scale-95 transition-transform">
          <Plus className="w-8 h-8 stroke-[2.5]" />
        </div>
        <span className="mt-3.5 text-base font-bold text-gray-900 group-hover:text-[#0B5CFF] transition-colors">
          Join
        </span>
        <span className="text-xs text-gray-500 mt-0.5">
          Via ID or invite link
        </span>
      </button>

      {/* 3. Schedule Meeting (Signature Zoom Blue) */}
      <button
        onClick={onOpenSchedule}
        className="flex flex-col items-center justify-center p-6 bg-white hover:bg-blue-50/40 border border-[#E4E7EB] hover:border-blue-300 rounded-2xl shadow-xs transition-all duration-150 group cursor-pointer"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#0B5CFF] flex items-center justify-center text-white shadow-md group-hover:scale-105 group-active:scale-95 transition-transform">
          <Calendar className="w-8 h-8" />
        </div>
        <span className="mt-3.5 text-base font-bold text-gray-900 group-hover:text-[#0B5CFF] transition-colors">
          Schedule
        </span>
        <span className="text-xs text-gray-500 mt-0.5">
          Plan upcoming session
        </span>
      </button>
    </div>
  );
}
