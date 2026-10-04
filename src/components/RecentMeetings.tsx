'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { History, Clock, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Meeting } from '@/types/meeting';
import { getRecentMeetingsPaginated, formatUtcDate } from '@/lib/api';

interface RecentMeetingsProps {
  initialMeetings?: Meeting[];
}

export function RecentMeetings({ initialMeetings }: RecentMeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings || []);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (targetPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRecentMeetingsPaginated(targetPage, pageSize);
      setMeetings(res.items);
      setPage(res.page);
      setTotalPages(res.total_pages);
      setTotal(res.total);
    } catch (err: any) {
      console.error('Failed to load paginated history:', err);
      setError('Unable to load past meetings history.');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const handlePrev = () => {
    if (page > 1) {
      fetchPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      fetchPage(page + 1);
    }
  };

  return (
    <div className="bg-white border border-[#E4E7EB] rounded-2xl shadow-xs overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E4E7EB] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Recent Meetings History</h2>
            <p className="text-[11px] text-gray-500">Accurate start time & duration</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
          {total} past
        </span>
      </div>

      {/* Content List */}
      <div className="divide-y divide-[#F0F2F5]">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-1/3" />
                <div className="h-3 bg-gray-100 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-500">{error}</div>
        ) : meetings.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-xs">
            No past meetings recorded yet.
          </div>
        ) : (
          meetings.map((meeting) => {
            const startTimeStr = formatUtcDate(
              meeting.actual_started_at || meeting.started_at || meeting.created_at,
              'MMM d, yyyy • hh:mm a'
            );
            const duration = meeting.duration_minutes ?? meeting.actual_duration_minutes ?? 0;

            return (
              <div
                key={meeting.id}
                className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
                      {meeting.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.2 text-[10px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-full">
                      <CheckCircle className="w-2.5 h-2.5 text-gray-500" />
                      Ended
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    <span className="font-medium text-gray-700">
                      Start: {startTimeStr}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#0B5CFF]">
                      <Clock className="w-3 h-3" />
                      {duration} min duration
                    </span>
                    <span>•</span>
                    <span className="font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">
                      ID: {meeting.meeting_code}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-[#E4E7EB] bg-gray-50/60 flex items-center justify-between text-xs text-gray-600">
          <span className="font-medium text-[11px] text-gray-500">
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none text-gray-700 font-medium transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => fetchPage(pNum)}
                disabled={loading}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  pNum === page
                    ? 'bg-[#0B5CFF] text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none text-gray-700 font-medium transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
