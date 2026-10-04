import React from 'react';
import { Navbar } from '@/components/Navbar';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FA] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Plans & Pricing</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl text-center">
          Choose the right plan for your team. From basic meetings to enterprise webinars, we have you covered.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {/* Basic Plan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Basic</h2>
            <p className="text-gray-500 mb-4">For personal meetings</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">Free</div>
            <ul className="text-sm text-gray-600 space-y-3 mb-8 flex-1">
              <li>✓ Meetings up to 40 minutes</li>
              <li>✓ 100 Attendees per meeting</li>
              <li>✓ Basic Whiteboard</li>
            </ul>
            <button className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 transition-colors">
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-[#0B5CFF] flex flex-col relative">
            <div className="absolute top-0 right-0 bg-[#0B5CFF] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
              RECOMMENDED
            </div>
            <h2 className="text-2xl font-semibold text-[#0B5CFF] mb-2">Pro</h2>
            <p className="text-gray-500 mb-4">For small teams</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">$14<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <ul className="text-sm text-gray-600 space-y-3 mb-8 flex-1">
              <li>✓ Unlimited meeting duration</li>
              <li>✓ 100 Attendees per meeting</li>
              <li>✓ 5GB Cloud Recording</li>
              <li>✓ Premium Apps</li>
            </ul>
            <button className="w-full py-2 px-4 rounded-lg bg-[#0B5CFF] text-white font-semibold hover:bg-[#004FE6] transition-colors">
              Upgrade to Pro
            </button>
          </div>

          {/* Business Plan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Business</h2>
            <p className="text-gray-500 mb-4">For small and medium businesses</p>
            <div className="text-4xl font-bold text-gray-900 mb-6">$19<span className="text-lg text-gray-500 font-normal">/mo</span></div>
            <ul className="text-sm text-gray-600 space-y-3 mb-8 flex-1">
              <li>✓ Unlimited meeting duration</li>
              <li>✓ 300 Attendees per meeting</li>
              <li>✓ SSO & Managed Domains</li>
              <li>✓ Company Branding</li>
            </ul>
            <button className="w-full py-2 px-4 rounded-lg bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
