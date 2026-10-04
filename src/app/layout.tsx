import type { Metadata } from 'next';
import '@livekit/components-styles';
import './globals.css';

export const metadata: Metadata = {
  title: 'Zoom Video Conferencing | Scaler Fullstack Platform',
  description: 'Enterprise video conferencing, meetings, chat, and real-time screen sharing platform built with Next.js, FastAPI, and LiveKit WebRTC.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans bg-[#F7F9FA]">
        {children}
      </body>
    </html>
  );
}
