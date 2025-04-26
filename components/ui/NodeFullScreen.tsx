'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import { NodeData } from '@/lib/types';

interface NodeFullScreenProps {
  node: NodeData | null;
  onClose: () => void;
}

function AnimatedNode({ node }: { node: NodeData }) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const count = 1000;
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const radius = 5;
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);
    
    positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = radius * Math.cos(theta);
    
    const color = new THREE.Color(node.color || '#ffffff');
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      if (particlesRef.current) {
        particlesRef.current.rotation.y -= 0.002;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Node */}
      <mesh scale={[3, 3, 3]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Orbiting Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.8}
        />
      </points>

      {/* Node Label */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Text
          position={[0, 2, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {node.label}
        </Text>
      </Billboard>
    </group>
  );
}

function DataDisplay({ node }: { node: NodeData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [node]);

  return (
    <div 
      ref={containerRef}
      className="absolute right-0 top-0 w-1/3 h-full bg-black/80 backdrop-blur-lg p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-green-400">{node.label}</h2>
        <div className="space-y-4">
          <div className="bg-black/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-300 mb-2">Details</h3>
            <div className="space-y-2 text-green-100/80">
              <p>Type: {node.type}</p>
              <p>ID: {node.id}</p>
              <p>Size: {node.size}</p>
            </div>
          </div>

          {node.connections.length > 0 && (
            <div className="bg-black/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-300 mb-2">Connections</h3>
              <div className="space-y-2">
                {node.connections.map((conn, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-black/30 rounded p-2 text-sm text-green-100/80"
                  >
                    <p>Target: {conn.target}</p>
                    <p>Relationship: {conn.relationship}</p>
                    <p>Strength: {(conn.strength * 100).toFixed(0)}%</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function NodeFullScreen({ node, onClose }: NodeFullScreenProps) {
  if (!node) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6 text-green-400" />
        </button>

        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <AnimatedNode node={node} />
        </Canvas>

        <DataDisplay node={node} />
      </motion.div>
    </AnimatePresence>
  );
}