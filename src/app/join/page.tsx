'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Video, LogIn, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getMeeting } from '@/lib/api';

export default function JoinPage() {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingInput.trim()) {
      setError('Please provide a valid Meeting ID or Link.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let code = meetingInput.trim();
      if (code.includes('/meeting/')) {
        code = code.split('/meeting/')[1].split('?')[0].trim();
      } else if (code.includes('/')) {
        code = code.split('/').pop()?.split('?')[0].trim() || code;
      }

      // Check with backend
      const meeting = await getMeeting(code);
      if (meeting.status === 'ENDED') {
        setError('This meeting has already ended.');
        return;
      }

      if (displayName.trim()) {
        localStorage.setItem('zoom_display_name', displayName.trim());
      }

      // Forward to meeting prejoin screen
      const nameParam = displayName.trim() ? `?name=${encodeURIComponent(displayName.trim())}` : '';
      router.push(`/meeting/${meeting.meeting_code}${nameParam}`);
    } catch (err: any) {
      setError(err?.message || 'Unable to find meeting. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-[#0B5CFF] rounded-xl flex items-center justify-center mx-auto">
              <Video className="w-6 h-6 fill-current" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Join a Meeting
            </h1>
            <p className="text-xs text-gray-500">
              Enter the meeting ID or link provided by the host.
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Meeting ID or Personal Link
              </label>
              <input
                type="text"
                value={meetingInput}
                onChange={(e) => setMeetingInput(e.target.value)}
                placeholder="e.g. 412-895-301 or meeting URL"
                className="w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Your Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent"
                required
              />
            </div>

            <div className="text-[11px] text-gray-500 leading-relaxed">
              By joining, you agree to enable camera and microphone controls during conferencing.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-semibold text-white bg-[#0B5CFF] hover:bg-[#004FE6] rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Join Meeting
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
