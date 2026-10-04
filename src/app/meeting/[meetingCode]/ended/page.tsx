'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { CheckCircle2, Home, RotateCcw, Video } from 'lucide-react';

interface PageProps {
  params: Promise<{ meetingCode: string }>;
}

export default function MeetingEndedPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const meetingCode = resolvedParams.meetingCode;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="max-w-md w-full bg-[#24272C] border border-gray-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Checkmark icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Meeting Ended
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            The video conferencing session has concluded. Thank you for participating.
          </p>
          <div className="pt-2">
            <span className="inline-block text-[11px] font-mono text-gray-400 bg-[#1A1D20] px-3 py-1 rounded-full border border-gray-700/60">
              Meeting ID: {meetingCode}
            </span>
          </div>
        </div>

        <div className="pt-4 space-y-2.5 border-t border-gray-800/80">
          <Link
            href="/"
            className="w-full py-2.5 text-xs font-semibold text-white bg-[#0B5CFF] hover:bg-[#004FE6] rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            href={`/meeting/${meetingCode}`}
            className="w-full py-2.5 text-xs font-medium text-gray-300 hover:text-white bg-[#2E3238] hover:bg-[#383D45] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Rejoin Session
          </Link>
        </div>

        <p className="text-[10px] text-gray-500 pt-2">
          Zoom Video Communications, Inc.
        </p>
      </div>
    </div>
  );
}
