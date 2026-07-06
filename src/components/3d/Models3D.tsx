import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSettingsStore } from '../../store/useSettingsStore'


// Helper to apply slow floating animation and mouse parallax rotation
const useFloatingAndParallax = (
  ref: React.RefObject<THREE.Group | THREE.Mesh | null>,
  floatIntensity: number = 0.15,
  floatSpeed: number = 1.5,
  parallaxIntensity: number = 0.4,
  enabled: boolean = true
) => {
  const parallaxSetting = useSettingsStore((state) => state.parallax);

  useFrame((state) => {
    if (!enabled || !ref.current) return;
    const time = state.clock.getElapsedTime();
    
    // Floating movement
    ref.current.position.y = Math.sin(time * floatSpeed) * floatIntensity;
    
    // Parallax mouse rotation (eco mode disables it to save layout compute)
    const activeIntensity = parallaxSetting === 'eco' ? 0.0 : parallaxIntensity;
    const targetRotX = state.pointer.y * -activeIntensity;
    const targetRotY = state.pointer.x * activeIntensity;
    
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetRotX, 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotY, 0.1);
  });
};

export const Notebook3D: React.FC<{ float?: boolean }> = ({ float = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFloatingAndParallax(groupRef, 0.12, 1.2, 0.3, float);

  return (
    <group ref={groupRef} rotation={[0.2, -0.4, 0.1]}>
      {/* Front Cover */}
      <mesh position={[0, 0, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 2.7, 0.08]} />
        <meshPhysicalMaterial
          color="#3b0764" // Deep purple leather
          roughness={0.7}
          metalness={0.1}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          bumpScale={0.05}
        />
      </mesh>

      {/* Pages Layer (stacked look) */}
      <mesh position={[0.04, 0, 0.015]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 2.6, 0.1]} />
        <meshPhysicalMaterial
          color="#fdfbf7" // Off-white cream paper
          roughness={0.8}
          metalness={0.0}
        />
      </mesh>

      {/* Back Cover */}
      <mesh position={[0, 0, -0.07]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 2.7, 0.08]} />
        <meshPhysicalMaterial
          color="#1e0b36" // Slightly darker back cover
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Spiral Rings (Torus items on the left side) */}
      {Array.from({ length: 9 }).map((_, idx) => {
        const yPos = 1.1 - idx * 0.275;
        return (
          <mesh key={idx} position={[-1.02, yPos, 0.01]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.09, 0.02, 12, 24, Math.PI * 1.5]} />
            <meshPhysicalMaterial
              color="#fbbf24" // Polished gold
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        );
      })}

      {/* Bookmark Ribbon */}
      <mesh position={[0.1, -1.5, 0.035]} rotation={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[0.15, 0.6, 0.01]} />
        <meshPhysicalMaterial
          color="#ec4899" // Pink bookmark ribbon
          roughness={0.5}
        />
      </mesh>
    </group>
  );
};

export const Pen3D: React.FC<{ float?: boolean }> = ({ float = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFloatingAndParallax(groupRef, 0.1, 1.8, 0.5, float);

  return (
    <group ref={groupRef} rotation={[0.4, 0.2, 1.2]}>
      {/* Pen Shaft */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 1.8, 16]} />
        <meshPhysicalMaterial
          color="#0f172a" // Matte slate body
          roughness={0.4}
          metalness={0.7}
          clearcoat={0.5}
        />
      </mesh>

      {/* Grip Segment */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.072, 0.072, 0.4, 16]} />
        <meshPhysicalMaterial
          color="#6366f1" // Indigo grip
          roughness={0.9}
        />
      </mesh>

      {/* Glowing Trim Ring */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.03, 16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* Stylus Tip */}
      <mesh position={[0, -1.0, 0]} castShadow>
        <coneGeometry args={[0.07, 0.2, 16]} />
        <meshPhysicalMaterial
          color="#e2e8f0" // Silver tip
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Stylus End / Eraser */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshPhysicalMaterial
          color="#06b6d4" // Glass cyber cap
          roughness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>

      {/* Clip */}
      <mesh position={[0.09, 0.6, 0]} rotation={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[0.02, 0.5, 0.04]} />
        <meshPhysicalMaterial
          color="#fbbf24" // Golden clip
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
};

export const Pin3D: React.FC<{ active?: boolean }> = ({ active = false }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    if (!active) {
      // Gentle floating when unpinned
      groupRef.current.position.y = Math.sin(time * 2.0) * 0.05;
      groupRef.current.rotation.z = Math.sin(time * 1.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0.2, -0.3]}>
      {/* Pin Needle */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.002, 0.8, 8]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Pin Body (Translucent Plastic) */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.1, 0.35, 16]} />
        <meshPhysicalMaterial
          color="#ec4899" // Hot pink glass pin
          transmission={0.85}
          opacity={0.9}
          thickness={0.4}
          roughness={0.15}
          clearcoat={1.0}
        />
      </mesh>

      {/* Pin Head Bulb */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <sphereGeometry args={[0.17, 16, 16]} />
        <meshPhysicalMaterial
          color="#ec4899"
          transmission={0.85}
          opacity={0.9}
          thickness={0.4}
          roughness={0.15}
          clearcoat={1.0}
        />
      </mesh>
    </group>
  );
};

export const Mug3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFloatingAndParallax(groupRef, 0.08, 1.4, 0.35);

  return (
    <group ref={groupRef} rotation={[0.2, -0.5, 0]}>
      {/* Mug Body */}
      <mesh position={[0, -0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.0, 24]} />
        <meshPhysicalMaterial
          color="#a855f7" // Purple ceramic
          roughness={0.2}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Coffee Fluid inside */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.02, 24]} />
        <meshPhysicalMaterial
          color="#5c3f30" // Coffee brown
          roughness={0.1}
        />
      </mesh>

      {/* Mug Handle */}
      <mesh position={[0.48, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.28, 0.08, 12, 24]} />
        <meshPhysicalMaterial
          color="#a855f7"
          roughness={0.2}
          clearcoat={0.9}
        />
      </mesh>
    </group>
  );
};

export const Folder3D: React.FC<{ isOpen?: boolean }> = ({ isOpen = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const frontRef = useRef<THREE.Mesh>(null);

  useFloatingAndParallax(groupRef, 0.08, 1.1, 0.3);

  useFrame(() => {
    if (!frontRef.current) return;
    const targetAngle = isOpen ? -0.45 : 0;
    frontRef.current.rotation.x = THREE.MathUtils.lerp(frontRef.current.rotation.x, targetAngle, 0.1);
  });

  return (
    <group ref={groupRef} rotation={[0.1, -0.3, 0]}>
      {/* Folder Back Pane */}
      <mesh position={[0, 0, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.1, 0.05]} />
        <meshPhysicalMaterial
          color="#0284c7" // Cyber blue folder
          roughness={0.4}
          metalness={0.3}
          clearcoat={0.5}
        />
      </mesh>

      {/* Folder Tab */}
      <mesh position={[-0.45, 0.63, -0.05]} castShadow>
        <boxGeometry args={[0.5, 0.18, 0.05]} />
        <meshPhysicalMaterial
          color="#0284c7"
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Paper Sheet Inside */}
      <mesh position={[0, isOpen ? 0.25 : 0.05, -0.01]} castShadow>
        <boxGeometry args={[1.35, 1.0, 0.02]} />
        <meshPhysicalMaterial
          color="#06b6d4" // Glowing cyan documentation glass
          transmission={0.8}
          roughness={0.2}
          thickness={0.5}
        />
      </mesh>

      {/* Folder Front Pane (hinged at bottom) */}
      <group position={[0, -0.5, 0.04]}>
        <mesh ref={frontRef} position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.5, 1.0, 0.04]} />
          <meshPhysicalMaterial
            color="#0369a1" // Slightly darker front pane
            roughness={0.4}
            metalness={0.3}
            clearcoat={0.5}
          />
        </mesh>
      </group>
    </group>
  );
};

export const Calendar3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFloatingAndParallax(groupRef, 0.07, 1.3, 0.25);

  return (
    <group ref={groupRef} rotation={[0.2, -0.4, 0.05]}>
      {/* Calendar Base Triangular block */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.15, 0.8]} />
        <meshPhysicalMaterial
          color="#1e1b4b" // Deep indigo base
          roughness={0.7}
        />
      </mesh>

      {/* Backboard */}
      <mesh position={[0, 0.1, -0.15]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.1, 0.9, 0.06]} />
        <meshPhysicalMaterial
          color="#312e81"
          roughness={0.5}
          clearcoat={0.3}
        />
      </mesh>

      {/* Calendar Sheets */}
      <mesh position={[0, 0.08, -0.08]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.95, 0.75, 0.05]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.9}
        />
      </mesh>

      {/* Spiral Binder Rings on top */}
      {Array.from({ length: 4 }).map((_, i) => {
        const xPos = -0.375 + i * 0.25;
        return (
          <mesh key={i} position={[xPos, 0.52, -0.1]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <torusGeometry args={[0.06, 0.015, 8, 16]} />
            <meshPhysicalMaterial
              color="#fbbf24"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export const LightBulb3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFloatingAndParallax(groupRef, 0.09, 1.6, 0.4);

  return (
    <group ref={groupRef} rotation={[0.1, -0.2, 0.15]}>
      {/* Metal Screw Base */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.35, 12]} />
        <meshPhysicalMaterial
          color="#cbd5e1"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>
      
      {/* Contact Point */}
      <mesh position={[0, -0.7, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#334155" />
      </mesh>

      {/* Glowing Filament Post inside */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      {/* Glowing Filament Ring */}
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.08, 0.012, 8, 16]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      {/* Bulb Outer Glass */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshPhysicalMaterial
          color="#fbbf24"
          transmission={0.9}
          opacity={0.8}
          thickness={0.5}
          roughness={0.1}
          clearcoat={1.0}
        />
      </mesh>
    </group>
  );
};

export const PaperClip3D: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  useFloatingAndParallax(groupRef, 0.06, 2.0, 0.55);

  return (
    <group ref={groupRef} rotation={[0.4, 0.4, 0.3]}>
      {/* Inner loop */}
      <mesh position={[0, 0.1, 0.005]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.15, 0.025, 8, 16, Math.PI]} />
        <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.15, -0.15, 0.005]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.15, -0.05, 0.005]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
        <meshPhysicalMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Outer loop */}
      <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.25, 0.025, 8, 16, Math.PI]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.25, 0.1, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.25, -0.1, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <torusGeometry args={[0.25, 0.025, 8, 16, Math.PI]} />
        <meshPhysicalMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
};
