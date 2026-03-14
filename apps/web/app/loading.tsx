'use client';

import { Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 animate-pulse">EUProjectHub</p>
          <div className="h-1 w-24 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-indigo-500 w-1/3 animate-[shimmer_1.5s_infinite]" 
                 style={{ 
                   backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                   backgroundSize: '200% 100%'
                 }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
