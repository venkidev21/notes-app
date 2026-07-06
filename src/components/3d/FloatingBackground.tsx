import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSettingsStore } from '../../store/useSettingsStore'

interface ParticleProps {
  count: number;
}

const FloatingParticles: React.FC<ParticleProps> = ({ count }) => {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 15; // X
      temp[i * 3 + 1] = (Math.random() - 0.5) * 15; // Y
      temp[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    // Slowly float particles up and wave them
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Float upward
      positions[idx + 1] += 0.002 * Math.sin(time + idx) + 0.0015;
      // Side wobble
      positions[idx] += 0.001 * Math.cos(time * 0.5 + idx);
      
      // Reset if offscreen
      if (positions[idx + 1] > 6) {
        positions[idx + 1] = -6;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a855f7"
        size={0.045}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const GlowingBlob: React.FC<{ color: string; speed: number; scale: number; position: [number, number, number] }> = ({ color, speed, scale, position }) => {
  const blobRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!blobRef.current) return;
    const time = state.clock.getElapsedTime() * speed;
    
    // Slow orbits and distortions
    blobRef.current.position.x = position[0] + Math.sin(time) * 1.5;
    blobRef.current.position.y = position[1] + Math.cos(time * 1.2) * 1.2;
    blobRef.current.scale.setScalar(scale + Math.sin(time * 2) * 0.15 * scale);
  });

  return (
    <mesh ref={blobRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent={true}
        opacity={0.07}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export const FloatingBackground: React.FC = () => {
  const renderQuality = useSettingsStore((state) => state.renderQuality);

  return (
    <div className="fixed inset-0 -z-20 w-full h-full overflow-hidden bg-[#05050f] pointer-events-none">
      {/* Background radial gradient layers */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-900/15 via-indigo-900/5 to-transparent blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-900/15 via-cyan-900/5 to-transparent blur-[120px] animate-glow-pulse" />
      <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full bg-indigo-950/10 blur-[140px] animate-glow-pulse" />

      {/* ThreeJS R3F Scene for blobs & dust */}
      {renderQuality === 'webgl' && (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <ambientLight intensity={0.4} />
          
          {/* Soft floating blobs */}
          <GlowingBlob color="#8b5cf6" speed={0.15} scale={1.8} position={[-2.5, 1.5, -2]} />
          <GlowingBlob color="#3b82f6" speed={0.12} scale={2.2} position={[2.8, -1.8, -3]} />
          <GlowingBlob color="#06b6d4" speed={0.08} scale={1.5} position={[-1.5, -2, -1]} />
          
          {/* Particles */}
          <FloatingParticles count={150} />
        </Canvas>
      )}
    </div>
  );
};
