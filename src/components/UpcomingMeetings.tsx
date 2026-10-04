'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Copy, Play, Trash2, Video, Check, Shield } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { format, isToday, isTomorrow } from 'date-fns';
import { parseUtcDate } from '@/lib/api';

interface UpcomingMeetingsProps {
  meetings: Meeting[];
  loading: boolean;
  onCopyInvite: (meeting: Meeting) => void;
  onDeleteMeeting: (meetingId: string) => void;
}

export function UpcomingMeetings({
  meetings,
  loading,
  onCopyInvite,
  onDeleteMeeting,
}: UpcomingMeetingsProps) {
  const formatMeetingDate = (dateString?: string) => {
    if (!dateString) return 'Starts Immediately';
    try {
      const date = parseUtcDate(dateString);
      if (!date || isNaN(date.getTime())) return dateString;
      let dayPrefix = format(date, 'MMM d, yyyy');
      if (isToday(date)) dayPrefix = 'Today';
      else if (isTomorrow(date)) dayPrefix = 'Tomorrow';

      return `${dayPrefix} at ${format(date, 'hh:mm a')}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-[#0B5CFF]" />
          <h2 className="text-base font-semibold text-gray-900">Upcoming Meetings</h2>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {meetings.length} scheduled
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded-md w-1/3" />
                  <div className="h-3 bg-gray-100 rounded-md w-1/4" />
                </div>
                <div className="h-8 bg-gray-200 rounded-md w-24" />
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0B5CFF] flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No upcoming meetings</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You have no meetings scheduled. Start an instant meeting or schedule one for later.
            </p>
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {meeting.title}
                  </h3>
                  {meeting.status === 'ACTIVE' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      In Progress
                    </span>
                  )}
                  {meeting.waiting_room_enabled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                      <Shield className="w-3 h-3 text-amber-600" />
                      Waiting Room
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {formatMeetingDate(meeting.scheduled_time)}
                  </span>
                  <span>•</span>
                  <span>{meeting.duration_minutes} mins</span>
                  <span>•</span>
                  <span className="font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                    ID: {meeting.meeting_code}
                  </span>
                </div>

                {meeting.description && (
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {meeting.description}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/meeting/${meeting.meeting_code}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0B5CFF] hover:bg-[#004FE6] rounded-lg transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {meeting.status === 'ACTIVE' ? 'Join Now' : 'Start'}
                </Link>

                <button
                  onClick={() => onCopyInvite(meeting)}
                  title="Copy Invitation Link"
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteMeeting(meeting.id)}
                  title="Delete Meeting"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
