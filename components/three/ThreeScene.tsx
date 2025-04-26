'use client';

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Billboard, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGraphStore } from '@/lib/store';
import { NodeData } from '@/lib/types';

function RopeConnection({ 
  startPos, 
  endPos,
  segments = 20
}: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  segments?: number;
}) {
  const points = useMemo(() => {
    const start = new THREE.Vector3(...startPos);
    const end = new THREE.Vector3(...endPos);
    const points = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pos = new THREE.Vector3().lerpVectors(start, end, t);
      
      // Add wave effect
      const amplitude = 2;
      const frequency = Math.PI * 2;
      pos.y += Math.sin(t * frequency) * amplitude;
      
      points.push(pos);
    }
    
    return points;
  }, [startPos, endPos, segments]);

  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(points);
  }, [points]);

  return (
    <mesh>
      <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
      <meshStandardMaterial
        color="#4a9eff"
        metalness={0.8}
        roughness={0.2}
        opacity={0.8}
        transparent
        emissive="#4a9eff"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function AnimatedConnection({ 
  startPos, 
  endPos, 
  color = '#00ff9f',
  opacity = 0.3,
  thickness = 0.08,
  speed = 1,
  strength = 1
}: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  color?: string;
  opacity?: number;
  thickness?: number;
  speed?: number;
  strength?: number;
}) {
  const [progress, setProgress] = useState(0);
  const start = useMemo(() => new THREE.Vector3(...startPos), [startPos]);
  const end = useMemo(() => new THREE.Vector3(...endPos), [endPos]);
  
  const curve = useMemo(() => {
    const points = [];
    points.push(start);
    
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y += (start.distanceTo(end) * 0.15);
    points.push(mid);
    points.push(end);
    
    return new THREE.CatmullRomCurve3(points);
  }, [start, end]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * speed;
    setProgress((Math.sin(time) + 1) / 2);
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 64, thickness, 12, false]} />
        <meshStandardMaterial
          color={color}
          opacity={opacity}
          transparent
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      
      <mesh position={curve.getPoint(progress)}>
        <sphereGeometry args={[thickness * 3, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

function ExplosionEffect({ position }: { position: [number, number, number] }) {
  const particles = useRef<THREE.Points>(null);
  const [particles1] = useState(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    const velocities = new Float32Array(1000 * 3);
    const colors = new Float32Array(1000 * 3);

    for (let i = 0; i < 1000; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize();

      velocities[i3] = velocity.x;
      velocities[i3 + 1] = velocity.y;
      velocities[i3 + 2] = velocity.z;

      colors[i3] = Math.random();
      colors[i3 + 1] = Math.random();
      colors[i3 + 2] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geometry;
  });

  useFrame((state) => {
    if (!particles.current) return;

    const positions = particles1.attributes.position.array as Float32Array;
    const velocities = particles1.attributes.velocity.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < 1000; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i3] * time * 0.5;
      positions[i3 + 1] += velocities[i3 + 1] * time * 0.5;
      positions[i3 + 2] += velocities[i3 + 2] * time * 0.5;
    }

    particles1.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particles} position={position}>
      <primitive object={particles1} />
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Node({ node, onClick, onHover }: { 
  node: NodeData; 
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const { selectedNode, hoveredNode, nodeColors, destroyingNodes } = useGraphStore();
  const isSelected = selectedNode?.id === node.id;
  const isHovered = hoveredNode?.id === node.id;
  const isDestroying = destroyingNodes.includes(node.id);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const scale = isSelected ? 1.8 : isHovered ? 1.4 : 1;
  const nodeColor = nodeColors[node.type] || node.color;
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const pulse = Math.sin(time * 2) * 0.15 + 1;
      meshRef.current.scale.setScalar(scale * pulse);

      if (isDestroying) {
        meshRef.current.scale.multiplyScalar(0.95);
      }
    }
  });

  if (isDestroying) {
    return <ExplosionEffect position={node.position as [number, number, number]} />;
  }

  return (
    <group position={node.position as [number, number, number]}>
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[node.size, 32, 32]} />
        <meshStandardMaterial
          color={nodeColor}
          transparent
          opacity={0.15}
          emissive={nodeColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      <mesh
        ref={meshRef}
        onClick={() => onClick(node.id)}
        onPointerOver={() => onHover(node.id)}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[node.size, 32, 32]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isSelected ? 1.5 : isHovered ? 1 : 0.6}
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>
      
      <Billboard>
        <Text
          position={[0, node.size * scale + 0.5, 0]}
          fontSize={0.6}
          color="#00ff9f"
          anchorX="center"
          anchorY="middle"
          fillOpacity={isSelected || isHovered ? 1 : 0.4}
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.label}
        </Text>
      </Billboard>
    </group>
  );
}

function CameraController() {
  const { camera } = useThree();
  const { cameraPosition } = useGraphStore();
  
  useEffect(() => {
    const targetPosition = new THREE.Vector3(...cameraPosition);
    const currentPosition = camera.position.clone();
    
    const animate = () => {
      const dx = targetPosition.x - camera.position.x;
      const dy = targetPosition.y - camera.position.y;
      const dz = targetPosition.z - camera.position.z;
      
      camera.position.x += dx * 0.05;
      camera.position.y += dy * 0.05;
      camera.position.z += dz * 0.05;
      
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01 || Math.abs(dz) > 0.01) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [camera, cameraPosition]);

  return null;
}

function NodeGraph() {
  const { data, selectNode, hoverNode, wireConnections } = useGraphStore();
  
  const connections = useMemo(() => {
    const result = [];
    
    for (const node of data.nodes) {
      const startPos = node.position as [number, number, number];
      
      for (const conn of node.connections) {
        const targetNode = data.nodes.find(n => n.id === conn.target);
        if (!targetNode) continue;
        
        const endPos = targetNode.position as [number, number, number];
        
        if (node.id < targetNode.id) {
          result.push({
            start: startPos,
            end: endPos,
            relationship: conn.relationship,
            strength: conn.strength,
          });
        }
      }
    }
    
    return result;
  }, [data.nodes]);

  const wirePositions = useMemo(() => {
    return wireConnections.map(([sourceId, targetId]) => {
      const sourceNode = data.nodes.find(n => n.id === sourceId);
      const targetNode = data.nodes.find(n => n.id === targetId);
      
      if (!sourceNode || !targetNode) return null;
      
      return {
        start: sourceNode.position as [number, number, number],
        end: targetNode.position as [number, number, number]
      };
    }).filter(Boolean);
  }, [data.nodes, wireConnections]);

  return (
    <group>
      {connections.map((conn, i) => (
        <AnimatedConnection 
          key={`conn-${i}`}
          startPos={conn.start}
          endPos={conn.end}
          opacity={0.2 + conn.strength * 0.5}
          thickness={0.02 + conn.strength * 0.08}
          speed={0.5 + conn.strength}
          strength={conn.strength}
        />
      ))}
      
      {wirePositions.map((pos, i) => (
        <RopeConnection
          key={`wire-${i}`}
          startPos={pos!.start}
          endPos={pos!.end}
        />
      ))}
      
      {data.nodes.map((node) => (
        <Node 
          key={node.id} 
          node={node} 
          onClick={selectNode}
          onHover={hoverNode}
        />
      ))}
    </group>
  );
}

function ParticleField() {
  const particles = useRef<THREE.Points>(null);
  const count = 3000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 200;
      pos[i3 + 1] = (Math.random() - 0.5) * 200;
      pos[i3 + 2] = (Math.random() - 0.5) * 200;
    }
    return pos;
  }, [count]);
  
  useFrame((state) => {
    if (particles.current) {
      const time = state.clock.getElapsedTime();
      particles.current.rotation.x = time * 0.01;
      particles.current.rotation.y = time * 0.02;
      particles.current.position.y = Math.sin(time * 0.1) * 2;
    }
  });
  
  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.4}
        color="#3d7e70"
        sizeAttenuation
        transparent
        opacity={0.4}
      />
    </points>
  );
}

export default function ThreeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 100], fov: 60 }}
      style={{ 
        background: 'linear-gradient(to bottom, #000000, #041714)' 
      }}
    >
      <fog attach="fog" args={['#041714', 100, 200]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={1.2} color="#00ff9f" />
      <ParticleField />
      <Stars radius={100} depth={50} count={1500} factor={4} saturation={1} />
      <NodeGraph />
      <CameraController />
      <OrbitControls 
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={5}
        maxDistance={200}
      />
      <EffectComposer>
        <Bloom 
          intensity={0.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
        />
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  );
}