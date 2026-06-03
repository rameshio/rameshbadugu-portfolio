import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';

function StarField() {
  const pointsRef = useRef();
  
  // Custom generator for spherical particle distribution
  const sphere = useMemo(() => {
    const count = 1200;
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Math to distribute points evenly in a sphere
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      const distance = 1.2 + Math.random() * 1.5; // distance from center
      
      points[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      points[i * 3 + 1] = distance * Math.sin(phi) * Math.sin(theta);
      points[i * 3 + 2] = distance * Math.cos(phi);
    }
    return points;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Drift particles slowly
      pointsRef.current.rotation.x += delta * 0.02;
      pointsRef.current.rotation.y += delta * 0.03;
      
      // Mouse interaction parallax
      const { x, y } = state.pointer;
      pointsRef.current.position.x = (x * 0.05);
      pointsRef.current.position.y = (y * 0.05);
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={pointsRef} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ef4444"
          size={0.007}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

export default function BackgroundParticles() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-[#030303]">
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_40%,rgba(3,3,3,0.85)_100%] pointer-events-none z-0" />
      <Canvas 
        camera={{ position: [0, 0, 1] }} 
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <StarField />
      </Canvas>
    </div>
  );
}
