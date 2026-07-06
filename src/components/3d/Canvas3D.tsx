import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  Mug3D, 
  Folder3D, 
  LightBulb3D, 
  PaperClip3D, 
  Calendar3D, 
  Pin3D,
  Notebook3D,
  Pen3D
} from './Models3D'

interface Canvas3DProps {
  model: 'mug' | 'folder' | 'bulb' | 'paperclip' | 'calendar' | 'pin' | 'notebook' | 'pen';
  className?: string;
  isOpen?: boolean; // For folders
}

export const Canvas3D: React.FC<Canvas3DProps> = ({ model, className = 'w-24 h-24', isOpen = false }) => {
  const renderModel = () => {
    switch (model) {
      case 'mug':
        return <Mug3D />;
      case 'folder':
        return <Folder3D isOpen={isOpen} />;
      case 'bulb':
        return <LightBulb3D />;
      case 'paperclip':
        return <PaperClip3D />;
      case 'calendar':
        return <Calendar3D />;
      case 'pin':
        return <Pin3D active={false} />;
      case 'notebook':
        return <Notebook3D float={true} />;
      case 'pen':
        return <Pen3D float={true} />;
      default:
        return null;
    }
  };

  // Adjust camera distance based on target model scale
  const getCameraPosition = (): [number, number, number] => {
    switch (model) {
      case 'paperclip':
        return [0, 0, 1.8];
      case 'pin':
        return [0, 0, 2.0];
      case 'notebook':
        return [0, 0, 3.2];
      default:
        return [0, 0, 2.4];
    }
  };

  return (
    <div className={`${className} relative`}>
      <Canvas
        camera={{ position: getCameraPosition(), fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 4, 2]} intensity={1.2} />
          <pointLight position={[-2, 1, 1]} intensity={0.8} color="#a855f7" />
          <pointLight position={[2, -1, 1]} intensity={0.8} color="#06b6d4" />
          
          <group position={[0, 0, 0]}>
            {renderModel()}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Canvas3D;
