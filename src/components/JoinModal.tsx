'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { getMeeting } from '@/lib/api';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinModal({ isOpen, onClose }: JoinModalProps) {
  const router = useRouter();
  const [meetingInput, setMeetingInput] = useState('');
  const [displayName, setDisplayName] = useState('Guest User');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingInput.trim()) {
      setError('Please enter a Meeting ID or Meeting Link.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Extract code if URL was provided
      let code = meetingInput.trim();
      if (code.includes('/meeting/')) {
        code = code.split('/meeting/')[1].split('?')[0].trim();
      } else if (code.includes('/')) {
        code = code.split('/').pop()?.split('?')[0].trim() || code;
      }

      // Validate meeting exists in backend
      const meeting = await getMeeting(code);
      if (meeting.status === 'ENDED') {
        setError('This meeting has already ended.');
        return;
      }

      // Save display name for pre-join
      if (displayName.trim()) {
        localStorage.setItem('zoom_display_name', displayName.trim());
      }

      onClose();
      router.push(`/meeting/${meeting.meeting_code}`);
    } catch (err: any) {
      setError(err?.message || 'Meeting not found. Please verify the Meeting ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-100 text-[#0B5CFF]">
              <LogIn className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Join a Meeting</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Meeting ID or Personal Link Name
            </label>
            <input
              type="text"
              value={meetingInput}
              onChange={(e) => setMeetingInput(e.target.value)}
              placeholder="e.g. 123-456-789 or paste invite link"
              className="w-full px-3.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent transition-all"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name for attendees"
              className="w-full px-3.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="pt-2 text-xs text-gray-500">
            By clicking &ldquo;Join&rdquo;, you agree to our Terms of Service and Privacy Statement.
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#0B5CFF] hover:bg-[#004FE6] rounded-lg transition-colors disabled:opacity-50 shadow-xs"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Join Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
