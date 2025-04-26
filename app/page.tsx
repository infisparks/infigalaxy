'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Controls from '@/components/ui/Controls';
import NodeInfoPanel from '@/components/ui/NodeInfoPanel';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Activity } from 'lucide-react';
import { useGraphStore } from '@/lib/store';

// Dynamically import Three.js components to avoid SSR issues
const ThreeScene = dynamic(() => import('@/components/three/ThreeScene'), {
  ssr: false,
  loading: () => <LoadingScreen />
});

export default function Home() {
  const { isLoading, fetchData } = useGraphStore();
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {/* Header with title */}
          <div className="absolute top-6 left-6 z-50">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-green-500" />
              <h1 className="text-2xl font-bold text-white tracking-wider">
                Infi<span className="text-green-500">Galaxy</span>
              </h1>
            </div>
            <p className="text-green-400/70 text-sm mt-1">
              Interactive Medical Data Explorer
            </p>
          </div>
          
          {/* 3D Visualization */}
          <ThreeScene />
          
          {/* UI Controls */}
          <Controls />
          <NodeInfoPanel />
          
          {/* Instructions overlay */}
          <div className="absolute bottom-6 right-6 bg-black/60 border border-green-500/30 backdrop-blur-md text-white p-3 rounded-lg text-xs max-w-xs opacity-70 transition-opacity hover:opacity-100">
            <p className="text-green-400 font-medium mb-1">Navigation Controls:</p>
            <ul className="text-green-300/80 space-y-1">
              <li>• Left-click + drag: Rotate view</li>
              <li>• Scroll: Zoom in/out</li>
              <li>• Right-click + drag: Pan view</li>
              <li>• Click node: View details</li>
            </ul>
          </div>
        </>
      )}
    </main>
  );
}