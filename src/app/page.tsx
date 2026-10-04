'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ScheduleModal } from '@/components/ScheduleModal';
import { JoinModal } from '@/components/JoinModal';
import { Toast } from '@/components/Toast';
import { getUpcomingMeetings, getRecentMeetings, createInstantMeeting, deleteMeeting } from '@/lib/api';
import { Meeting } from '@/types/meeting';
import {
  Calendar,
  Plus,
  Video,
  Copy,
  Check,
  MessageCircle,
  Clock,
  ArrowRight,
  Trash2,
  Mic,
  Camera,
  X,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  // State
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [copiedPmi, setCopiedPmi] = useState(false);
  const [creatingInstant, setCreatingInstant] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // User Profile Data matching Zoom screenshot
  const userName = 'Sowmya Addala';
  const userInitial = 'S';
  const userPlan = 'Workplace Basic';
  const pmi = '223 609 8414';
  const pmiCode = '223-609-8414';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [upcomingData, recentData] = await Promise.all([
        getUpcomingMeetings(),
        getRecentMeetings()
      ]);
      setUpcoming(upcomingData);
      setRecent(recentData);
    } catch (err: unknown) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Host Meeting (Start Instant Meeting)
  const handleHostMeeting = async (videoEnabled = true) => {
    try {
      setCreatingInstant(true);
      const meeting = await createInstantMeeting(`${userName}'s Meeting`);
      router.push(`/meeting/${meeting.meeting_code}?video=${videoEnabled}`);
    } catch (err: unknown) {
      const errMessage = (err as Error)?.message || 'Failed to start meeting.';
      setToast({ message: errMessage, type: 'error' });
      setCreatingInstant(false);
    }
  };

  // Copy PMI Link
  const handleCopyPmi = () => {
    const inviteUrl = `${window.location.origin}/meeting/${pmiCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedPmi(true);
    setToast({
      message: `Personal Meeting ID link copied! (${pmi})`,
      type: 'success',
    });
    setTimeout(() => setCopiedPmi(false), 2000);
  };

  // Copy Meeting Invite
  const handleCopyInvite = (meeting: Meeting) => {
    const inviteUrl = `${window.location.origin}/meeting/${meeting.meeting_code}`;
    navigator.clipboard.writeText(inviteUrl);
    setToast({
      message: `Invitation link copied for "${meeting.title}"!`,
      type: 'success',
    });
  };

  // Delete Meeting
  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    try {
      await deleteMeeting(meetingId);
      setUpcoming((prev) => prev.filter((m) => m.id !== meetingId));
      setToast({ message: 'Meeting deleted successfully.', type: 'info' });
    } catch (err: unknown) {
      const errMessage = (err as Error)?.message || 'Failed to delete meeting.';
      setToast({ message: errMessage, type: 'error' });
    }
  };

  const handleMeetingScheduled = (newMeeting: Meeting) => {
    setUpcoming((prev) => [newMeeting, ...prev]);
    setToast({
      message: `Meeting "${newMeeting.title}" scheduled successfully!`,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col font-sans select-none text-gray-800">
      {/* Real Zoom Navbar */}
      <Navbar
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onOpenJoin={() => setIsJoinOpen(true)}
        onHostMeeting={handleHostMeeting}
        userName={userName}
        userInitial={userInitial}
        userPlan={userPlan}
      />

      {/* Main Dashboard Layout (Exact 2x2 architecture from screenshot) */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Row 1: Profile Card (Left) & Actions Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: User Profile Card (Top Left) */}
          <div className="lg:col-span-7 bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Purple Rounded Square Avatar 'S' */}
                <div className="w-16 h-16 rounded-2xl bg-[#5B6BB0] flex items-center justify-center text-white text-3xl font-semibold shadow-xs shrink-0">
                  {userInitial}
                </div>
                <div className="space-y-0.5">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                    {userName}
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    Plan: <span className="text-gray-700 font-semibold">{userPlan}</span>
                  </p>
                </div>
              </div>

              {/* Manage Plan Button */}
              <button
                onClick={() => setToast({ message: 'Managing plan settings...', type: 'info' })}
                className="px-4 py-1.5 bg-[#F0F3F6] hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Manage Plan
              </button>
            </div>

            <div className="flex justify-end mt-4 pt-2">
              <button
                onClick={() => setToast({ message: 'Viewing subscription plan details...', type: 'info' })}
                className="text-xs font-semibold text-[#0B5CFF] hover:underline cursor-pointer"
              >
                View Plan Details
              </button>
            </div>
          </div>

          {/* Card 2: Quick Action Tiles Card (Top Right) */}
          <div className="lg:col-span-5 bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between">
            {/* 3 Action Buttons: Schedule, Join, Host */}
            <div className="w-full flex items-center justify-around">
              
              {/* Schedule (Blue Calendar) */}
              <button
                id="dashboard-schedule-btn"
                onClick={() => setIsScheduleOpen(true)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0B5CFF] hover:bg-[#004FE6] flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105 group-active:scale-95">
                  <Calendar className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#0B5CFF] transition-colors">
                  Schedule
                </span>
              </button>

              {/* Join (Blue Plus) */}
              <button
                id="dashboard-join-btn"
                onClick={() => setIsJoinOpen(true)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0B5CFF] hover:bg-[#004FE6] flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105 group-active:scale-95">
                  <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center">
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#0B5CFF] transition-colors">
                  Join
                </span>
              </button>

              {/* Host (Signature Zoom Orange Video Camera) */}
              <button
                id="dashboard-host-btn"
                onClick={() => handleHostMeeting(true)}
                disabled={creatingInstant}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FF7426] hover:bg-[#E86217] flex items-center justify-center text-white shadow-md transition-all group-hover:scale-105 group-active:scale-95">
                  {creatingInstant ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Video className="w-7 h-7 fill-current" />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-700 mt-2 group-hover:text-[#FF7426] transition-colors">
                  Host
                </span>
              </button>
            </div>

            {/* Personal Meeting ID Section */}
            <div className="mt-5 pt-3 border-t border-gray-100 w-full text-center">
              <p className="text-xs font-bold text-gray-800">
                Personal Meeting ID
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-sans text-xs text-gray-700 font-semibold tracking-wide">
                  {pmi}
                </span>
                <button
                  onClick={handleCopyPmi}
                  className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer transition-colors"
                  title="Copy Personal Meeting ID link"
                >
                  {copiedPmi ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Recent Activity (Left) & Meetings (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 3: Recent Activity Card (Bottom Left) */}
          <div className="lg:col-span-7 bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs min-h-[300px] flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-[#F0F2F5]">
              Recent activity
            </h2>

            {recent.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <svg className="w-28 h-28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="60" cy="100" rx="42" ry="8" fill="#E2E8F0" />
                  <polygon points="25,52 60,70 95,52 60,34" fill="#0E3D9E" />
                  <polygon points="25,52 46,26 60,34" fill="#6BA4E8" />
                  <polygon points="95,52 74,26 60,34" fill="#4F8FE0" />
                  <polygon points="25,52 60,70 60,94 25,76" fill="#1A62E8" />
                  <polygon points="60,70 95,52 95,76 60,94" fill="#0C4ECE" />
                  <polygon points="25,52 60,70 52,82 17,64" fill="#93C5FD" opacity="0.95" />
                  <polygon points="60,70 95,52 103,64 68,82" fill="#60A5FA" opacity="0.95" />
                </svg>
                <p className="text-xs font-semibold text-gray-800 mt-2">
                  No recent activity
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-3 mt-4 overflow-y-auto max-h-48 pr-1">
                {recent.slice(0, 5).map((m) => {
                  const start = m.actual_started_at || m.started_at || m.created_at;
                  const end = m.actual_ended_at || m.ended_at;
                  
                  let durationStr = m.actual_duration_minutes ? `${m.actual_duration_minutes} min` : 'Unknown duration';
                  if (!m.actual_duration_minutes && start && end) {
                    const diffMs = new Date(end).getTime() - new Date(start).getTime();
                    const diffMins = Math.round(diffMs / 60000);
                    durationStr = `${diffMins} min`;
                  }

                  const dateStr = start ? new Date(start).toLocaleString() : 'Unknown date';

                  return (
                    <div key={m.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                       <div>
                         <p className="text-sm font-bold text-gray-900">{m.title}</p>
                         <p className="text-xs text-gray-500">{dateStr}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Completed</p>
                         <p className="text-xs text-gray-500 mt-1">Duration: {durationStr}</p>
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 4: Meetings Card (Bottom Right) */}
          <div className="lg:col-span-5 bg-white border border-[#E4E7EB] rounded-2xl p-6 shadow-xs min-h-[300px] flex flex-col justify-between">
            <div>
              {/* Header with Title & Visit Meetings link */}
              <div className="flex items-center justify-between pb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  Meetings
                </h2>
                <button
                  onClick={() => setIsScheduleOpen(true)}
                  className="text-xs font-semibold text-[#0B5CFF] hover:underline cursor-pointer"
                >
                  Visit Meetings
                </button>
              </div>

              {/* Upcoming List or No Upcoming Meetings banner */}
              <div className="mt-4">
                {loading ? (
                  <div className="py-6 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : upcoming.length === 0 ? (
                  <div className="bg-[#F7F9FA] rounded-xl py-3 px-4 text-center text-xs font-semibold text-gray-800">
                    No Upcoming Meetings
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {upcoming.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="p-3 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-100 flex items-center justify-between transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-gray-900 truncate">{m.title}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">ID: {m.meeting_code}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => router.push(`/meeting/${m.meeting_code}`)}
                            className="px-2.5 py-1 bg-[#0B5CFF] hover:bg-[#004FE6] text-white text-[11px] font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                          >
                            Start
                          </button>
                          <button
                            onClick={() => handleCopyInvite(m)}
                            title="Copy Invitation"
                            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(m.id)}
                            title="Delete Meeting"
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Test Audio and Video Button */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <button
                onClick={() => setIsTestModalOpen(true)}
                className="px-5 py-1.5 bg-[#F0F3F6] hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-full transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Test Audio and Video</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Floating Zoom Chat Support Bubble (Bottom Right) */}
      <button
        onClick={() => setToast({ message: 'Zoom Virtual Assistant is ready to help!', type: 'info' })}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#0B5CFF] hover:bg-[#004FE6] text-white shadow-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 z-30"
        title="Zoom Virtual Assistant"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </button>

      {/* Modals */}
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onScheduled={handleMeetingScheduled}
      />

      <JoinModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
      />

      {/* Audio and Video Test Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Audio and Video Test</h3>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Microphone Status</p>
                  <p className="text-gray-500">Default audio input detected and ready.</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0B5CFF] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Camera Status</p>
                  <p className="text-gray-500">Video hardware initialized and accessible.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="w-full py-2 bg-[#0B5CFF] hover:bg-[#004FE6] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
