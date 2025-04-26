'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, Filter, X, Sliders, Trash2, Link2 } from 'lucide-react';
import { useGraphStore } from '@/lib/store';

export default function Controls() {
  const { 
    data, 
    selectNode, 
    setCameraPosition, 
    setNodeColors, 
    clearFilters,
    destroyNodesByType,
    selectedNode,
    wireMode,
    toggleWireMode
  } = useGraphStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [travelSpeed, setTravelSpeed] = useState(1);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    
    if (!term) return;

    const foundNode = data.nodes.find(node => 
      node.label.toLowerCase().includes(term.toLowerCase())
    );

    if (foundNode) {
      setIsSearching(true);
      
      const targetPos = foundNode.position as [number, number, number];
      const distance = 5;
      
      const cameraPos: [number, number, number] = [
        targetPos[0] * 1.5,
        targetPos[1] * 1.5,
        targetPos[2] + distance
      ];
      
      setCameraPosition(cameraPos);
      
      setTimeout(() => {
        selectNode(foundNode.id);
        setIsSearching(false);
      }, 1000 / travelSpeed);
    }
  }, [data.nodes, selectNode, setCameraPosition, travelSpeed]);

  const handleClearSearch = () => {
    setSearchTerm('');
    clearFilters();
  };

  const handleColorChange = (type: string, color: string) => {
    setNodeColors({ [type]: color });
  };

  const handleDestroyNodes = () => {
    if (selectedNode) {
      destroyNodesByType(selectedNode.type);
    }
  };

  return (
    <div className="absolute top-6 right-6 z-50 flex flex-col gap-4">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex items-center"
      >
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className={`
            w-64 px-4 py-2 pr-20
            bg-black/60 border border-green-500/30
            text-green-400 placeholder-green-500/50
            rounded-lg backdrop-blur-md
            focus:outline-none focus:border-green-500/60
            transition-all duration-300
            ${isSearching ? 'animate-pulse' : ''}
          `}
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-12 top-2.5 text-green-500/50 hover:text-green-500"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <Search className="absolute right-3 top-2.5 w-5 h-5 text-green-500/50" />
      </motion.div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-black/60 border border-green-500/30 rounded-lg backdrop-blur-md"
        >
          <Settings className="w-5 h-5 text-green-400" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearFilters}
          className="p-3 bg-black/60 border border-green-500/30 rounded-lg backdrop-blur-md"
        >
          <Filter className="w-5 h-5 text-green-400" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleWireMode}
          className={`p-3 border rounded-lg backdrop-blur-md transition-colors ${
            wireMode 
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-black/60 border-green-500/30 text-green-400/50'
          }`}
        >
          <Link2 className="w-5 h-5" />
        </motion.button>
        {selectedNode && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDestroyNodes}
            className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-md hover:bg-red-500/30"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </motion.button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-20 right-0 w-80 bg-black/80 border border-green-500/30 rounded-lg backdrop-blur-md p-4"
        >
          <h3 className="text-green-400 font-semibold mb-4 flex items-center">
            <Sliders className="w-4 h-4 mr-2" />
            Visualization Settings
          </h3>
          
          {/* Travel Speed */}
          <div className="mb-4">
            <label className="text-green-400/80 text-sm mb-2 block">
              Travel Speed
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={travelSpeed}
              onChange={(e) => setTravelSpeed(parseFloat(e.target.value))}
              className="w-full accent-green-500"
            />
          </div>

          {/* Node Colors */}
          <div className="space-y-2">
            <label className="text-green-400/80 text-sm block">
              Node Colors
            </label>
            {['test', 'patient', 'doctor', 'parameter'].map(type => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-green-300/60 capitalize">{type}</span>
                <input
                  type="color"
                  onChange={(e) => handleColorChange(type, e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Wire Mode Instructions */}
      {wireMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-4 right-0 bg-black/80 border border-green-500/30 rounded-lg backdrop-blur-md p-4 text-sm"
        >
          <p className="text-green-400">Wire Connection Mode Active</p>
          <p className="text-green-300/60 mt-1">
            Click two nodes to connect them with a wire
          </p>
        </motion.div>
      )}
    </div>
  );
}