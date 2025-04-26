'use client';

import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
      <div className="relative w-20 h-20">
        <Activity
          className="w-20 h-20 text-green-500 animate-pulse"
          strokeWidth={1}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-t-2 border-green-500 animate-spin"></div>
      </div>
      
      <div className="mt-8 space-y-4 text-center">
        <h2 className="text-xl font-bold text-green-400 tracking-wider">Loading Neural Network</h2>
        <p className="text-green-500/60 max-w-md mx-auto text-sm">
          Initializing visualization environment and connecting neural nodes...
        </p>
        
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className={cn(
                "w-2 h-2 rounded-full bg-green-500",
                "animate-bounce",
                i === 1 && "animation-delay-200",
                i === 2 && "animation-delay-400"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}