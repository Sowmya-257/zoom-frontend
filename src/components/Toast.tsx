'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bg = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const Icon = type === 'error' ? AlertCircle : CheckCircle2;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg ${bg} transition-all duration-200 animate-in fade-in slide-in-from-bottom-5 text-sm font-medium`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
