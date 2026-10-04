'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Loader2, Copy, Check } from 'lucide-react';
import { scheduleMeeting } from '@/lib/api';
import { Meeting } from '@/types/meeting';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: (meeting: Meeting) => void;
}

export function ScheduleModal({ isOpen, onClose, onScheduled }: ScheduleModalProps) {
  const [title, setTitle] = useState('My Scheduled Meeting');
  const [description, setDescription] = useState('');
  
  // Set default date to today and time to next hour
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const nextHour = (now.getHours() + 1) % 24;
  const defaultTime = `${String(nextHour).padStart(2, '0')}:00`;

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [duration, setDuration] = useState(30);
  const [waitingRoomEnabled, setWaitingRoomEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state
  const [scheduledMeeting, setScheduledMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a meeting title.');
      return;
    }
    if (duration < 1) {
      setError('Duration must be at least 1 minute.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse user's local date/time selection accurately into UTC ISO string
      const localDate = new Date(`${date}T${time}:00`);
      const scheduledIso = localDate.toISOString();

      const newMeeting = await scheduleMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_time: scheduledIso,
        scheduled_start_at: scheduledIso,
        duration_minutes: duration,
        waiting_room_enabled: waitingRoomEnabled,
      });

      setScheduledMeeting(newMeeting);
      onScheduled(newMeeting);
    } catch (err: any) {
      setError(err?.message || 'Failed to schedule meeting.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!scheduledMeeting) return;
    const link = `${window.location.origin}/meeting/${scheduledMeeting.meeting_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setScheduledMeeting(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-blue-100 text-[#0B5CFF]">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {scheduledMeeting ? 'Meeting Scheduled!' : 'Schedule Meeting'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {scheduledMeeting ? (
          <div className="p-6 space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <h4 className="text-lg font-semibold text-green-800 mb-2">Success!</h4>
              <p className="text-sm text-green-700">Your meeting has been scheduled.</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Meeting Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/meeting/${scheduledMeeting.meeting_code}`}
                  className="flex-1 px-3.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-[#0B5CFF] text-white rounded-lg flex items-center gap-2 hover:bg-[#004FE6] transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleClose}
                className="px-5 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Topic / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sprint Planning, Project Sync"
                className="w-full px-3.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Add agenda or notes for attendees..."
                className="w-full px-3.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={defaultDate}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B5CFF] focus:border-transparent bg-white"
                required
              />
            </div>

            {/* Security & Waiting Room */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Security
              </label>
              <label className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={waitingRoomEnabled}
                  onChange={(e) => setWaitingRoomEnabled(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#0B5CFF] focus:ring-[#0B5CFF] border-gray-300 accent-[#0B5CFF]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-gray-900 block">Enable Waiting Room</span>
                  <span className="text-gray-500 block mt-0.5">
                    Only attendees admitted by the host can join the meeting room.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
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
                Save & Schedule
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
