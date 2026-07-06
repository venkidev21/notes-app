import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Notebook3D, Pen3D } from './Models3D'

export const HeroCanvas: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[450px] relative">
      <Canvas
        shadows
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Key lights with cinematic styling */}
          <ambientLight intensity={0.65} />
          
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0001}
          />
          
          {/* Neon lights */}
          <pointLight position={[-4, 3, 2]} intensity={2.0} color="#a855f7" />
          <pointLight position={[4, -3, 2]} intensity={2.0} color="#06b6d4" />
          
          <group position={[0.2, 0, 0]}>
            {/* Notebook shifted left */}
            <group position={[-0.8, 0, 0]}>
              <Notebook3D float={true} />
            </group>
            
            {/* Pen hovering on the right */}
            <group position={[1.0, -0.3, 0.5]} rotation={[0.2, 0.1, 0.2]}>
              <Pen3D float={true} />
            </group>
          </group>

          {/* Controls to allow subtle manual orbit exploration */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            maxPolarAngle={Math.PI / 1.7} 
            minPolarAngle={Math.PI / 2.3}
            maxAzimuthAngle={Math.PI / 4}
            minAzimuthAngle={-Math.PI / 4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
export default HeroCanvas;
