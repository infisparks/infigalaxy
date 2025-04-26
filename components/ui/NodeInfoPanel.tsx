'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { useGraphStore } from '@/lib/store';
import NodeFullScreen from './NodeFullScreen';

export default function NodeInfoPanel() {
  const { selectedNode } = useGraphStore();
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!selectedNode) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="absolute left-6 bottom-6 bg-black/60 border border-green-500/30 backdrop-blur-md rounded-lg p-4 w-80"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-green-400">{selectedNode.label}</h2>
          <button
            onClick={() => setIsFullScreen(true)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            title="View in full screen"
          >
            <Maximize2 className="w-5 h-5 text-green-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-green-300/80">Type: {selectedNode.type}</p>
            <p className="text-green-300/80">Connections: {selectedNode.connections.length}</p>
          </div>

          {selectedNode.connections.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-green-400 mb-2">Connected to:</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {selectedNode.connections.map((conn, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-sm bg-black/40 rounded p-2"
                  >
                    <p className="text-green-300/80">{conn.target}</p>
                    <p className="text-green-400/60 text-xs">{conn.relationship}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <NodeFullScreen
        node={isFullScreen ? selectedNode : null}
        onClose={() => setIsFullScreen(false)}
      />
    </>
  );
}