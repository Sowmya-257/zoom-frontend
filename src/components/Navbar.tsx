'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Video,
  Calendar,
  Monitor,
  ExternalLink,
  Settings,
  LogOut,
  Shield,
  Layers,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onOpenSchedule?: () => void;
  onOpenJoin?: () => void;
  onHostMeeting?: (videoOn: boolean) => void;
  userName?: string;
  userInitial?: string;
  userPlan?: string;
}

export function Navbar({
  onOpenSchedule,
  onOpenJoin,
  onHostMeeting,
  userName = 'Sowmya Addala',
  userInitial = 'S',
  userPlan = 'Workplace Basic',
}: NavbarProps) {
  // Dropdown states
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHostOpen, setIsHostOpen] = useState(false);
  const [isWebAppOpen, setIsWebAppOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setIsProfileOpen(false);
        setIsHostOpen(false);
        setIsWebAppOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full bg-white border-b border-[#E4E7EB] font-sans select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Zoom Logo & Main Category Links */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Real Zoom Logotype */}
            <Link href="/" className="flex items-center group py-2">
              <span className="text-[26px] font-black tracking-[-0.04em] text-[#0B5CFF] group-hover:text-[#004FE6] transition-colors font-sans">
                zoom
              </span>
            </Link>

            {/* Left Nav items */}
            <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-gray-700">
              {/* Products Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setActiveMenu(activeMenu === 'products' ? null : 'products');
                    setIsHostOpen(false);
                    setIsProfileOpen(false);
                    setIsWebAppOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-md hover:text-[#0B5CFF] hover:bg-gray-50 flex items-center gap-1 transition-colors cursor-pointer ${
                    activeMenu === 'products' ? 'text-[#0B5CFF]' : ''
                  }`}
                >
                  Products
                </button>
                {activeMenu === 'products' && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Zoom Workplace
                    </div>
                    <div className="space-y-0.5">
                      <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg transition-colors">
                        <Video className="w-4 h-4 text-[#0B5CFF]" />
                        <span>Meetings & Video</span>
                      </Link>
                      <button onClick={onOpenSchedule} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg transition-colors text-left">
                        <Calendar className="w-4 h-4 text-[#0B5CFF]" />
                        <span>Zoom Scheduler</span>
                      </button>
                      <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg transition-colors">
                        <Layers className="w-4 h-4 text-[#0B5CFF]" />
                        <span>Whiteboard & Notes</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Solutions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setActiveMenu(activeMenu === 'solutions' ? null : 'solutions');
                    setIsHostOpen(false);
                    setIsProfileOpen(false);
                    setIsWebAppOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-md hover:text-[#0B5CFF] hover:bg-gray-50 flex items-center gap-1 transition-colors cursor-pointer ${
                    activeMenu === 'solutions' ? 'text-[#0B5CFF]' : ''
                  }`}
                >
                  Solutions
                </button>
                {activeMenu === 'solutions' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Industries</div>
                    <span className="block px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg cursor-pointer">Enterprise</span>
                    <span className="block px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg cursor-pointer">Education</span>
                    <span className="block px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg cursor-pointer">Healthcare</span>
                  </div>
                )}
              </div>

              {/* Resources Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setActiveMenu(activeMenu === 'resources' ? null : 'resources');
                    setIsHostOpen(false);
                    setIsProfileOpen(false);
                    setIsWebAppOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-md hover:text-[#0B5CFF] hover:bg-gray-50 flex items-center gap-1 transition-colors cursor-pointer ${
                    activeMenu === 'resources' ? 'text-[#0B5CFF]' : ''
                  }`}
                >
                  Resources
                </button>
                {activeMenu === 'resources' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                    <span className="block px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg cursor-pointer">Support & Help</span>
                    <span className="block px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg cursor-pointer">Download Client</span>
                    <span className="block px-3 py-1.5 text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg cursor-pointer">Release Notes</span>
                  </div>
                )}
              </div>

              {/* Plans & Pricing */}
              <Link
                href="/pricing"
                className="px-3 py-1.5 rounded-md hover:text-[#0B5CFF] hover:bg-gray-50 transition-colors"
              >
                Plans & Pricing
              </Link>
            </nav>
          </div>

          {/* Right: Actions (Schedule, Join, Host ∨, Web App ∨, Profile Avatar) */}
          <div className="flex items-center gap-3 sm:gap-5 text-[13px] font-medium text-gray-700">
            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {isMobileMenuOpen && (
              <div className="md:hidden absolute top-14 left-0 w-full bg-white border-b border-gray-200 shadow-lg z-50 flex flex-col py-2 px-4 animate-in fade-in slide-in-from-top-2">
                <span className="py-2.5 text-sm font-medium text-gray-800 border-b border-gray-100">Products</span>
                <span className="py-2.5 text-sm font-medium text-gray-800 border-b border-gray-100">Solutions</span>
                <span className="py-2.5 text-sm font-medium text-gray-800 border-b border-gray-100">Resources</span>
                <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 text-sm font-medium text-gray-800 hover:text-[#0B5CFF]">Plans & Pricing</Link>
              </div>
            )}

            {/* Schedule */}
            <button
              onClick={onOpenSchedule}
              className="hover:text-[#0B5CFF] transition-colors cursor-pointer py-1 font-semibold"
            >
              Schedule
            </button>

            {/* Join */}
            <button
              onClick={onOpenJoin}
              className="hover:text-[#0B5CFF] transition-colors cursor-pointer py-1 font-semibold"
            >
              Join
            </button>

            {/* Host ∨ Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsHostOpen(!isHostOpen);
                  setActiveMenu(null);
                  setIsProfileOpen(false);
                  setIsWebAppOpen(false);
                }}
                className={`flex items-center gap-1 hover:text-[#0B5CFF] py-1 cursor-pointer font-semibold transition-colors ${
                  isHostOpen ? 'text-[#0B5CFF]' : ''
                }`}
              >
                <span>Host</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {isHostOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => {
                      setIsHostOpen(false);
                      onHostMeeting?.(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg transition-colors text-left"
                  >
                    <Video className="w-3.5 h-3.5 text-gray-500" />
                    <span>With Video On</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsHostOpen(false);
                      onHostMeeting?.(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg transition-colors text-left"
                  >
                    <Video className="w-3.5 h-3.5 text-gray-400" />
                    <span>With Video Off</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsHostOpen(false);
                      onHostMeeting?.(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-[#0B5CFF] rounded-lg transition-colors text-left border-t border-gray-100 mt-1"
                  >
                    <Monitor className="w-3.5 h-3.5 text-gray-500" />
                    <span>Screen Share Only</span>
                  </button>
                </div>
              )}
            </div>

            {/* Web App ∨ Dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => {
                  setIsWebAppOpen(!isWebAppOpen);
                  setActiveMenu(null);
                  setIsProfileOpen(false);
                  setIsHostOpen(false);
                }}
                className={`flex items-center gap-1 hover:text-[#0B5CFF] py-1 cursor-pointer font-semibold transition-colors ${
                  isWebAppOpen ? 'text-[#0B5CFF]' : ''
                }`}
              >
                <span>Web App</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {isWebAppOpen && (
                <div className="absolute top-full right-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                  <div className="px-3 py-1 text-[11px] text-gray-400 font-semibold uppercase">Platform</div>
                  <div className="px-3 py-1.5 font-medium text-[#0B5CFF] bg-blue-50 rounded-lg flex items-center justify-between">
                    <span>Web Client (Active)</span>
                    <span className="text-[10px] bg-blue-200/60 px-1 rounded">Live</span>
                  </div>
                  <a
                    href="https://zoom.us/download"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg mt-1"
                  >
                    <span>Download Desktop App</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                </div>
              )}
            </div>

            {/* User Avatar Initial (Signature Zoom purple rounded box/circle 'S') */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setActiveMenu(null);
                  setIsHostOpen(false);
                  setIsWebAppOpen(false);
                }}
                className="w-8 h-8 rounded-lg bg-[#5B6BB0] hover:bg-[#4E5C9A] text-white font-semibold text-xs flex items-center justify-center shadow-xs transition-all cursor-pointer ring-2 ring-transparent hover:ring-blue-300"
                title={userName}
              >
                {userInitial}
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-[#5B6BB0] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                      <p className="text-xs text-gray-500 truncate">{userPlan}</p>
                    </div>
                  </div>

                  <div className="py-2 space-y-1 text-xs text-gray-700">
                    <div className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <span>Personal Meeting ID</span>
                      <span className="font-mono text-gray-900 font-semibold">223 609 8414</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <Settings className="w-3.5 h-3.5 text-gray-400" />
                      <span>Account Settings</span>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                      <span>Security & Privacy</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
