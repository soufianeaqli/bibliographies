import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, OrbitControls, Float } from '@react-three/drei';

function Books() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, -5]}>
      {/* Simulation d'étagères circulaires ou flottantes */}
      {Array.from({ length: 40 }).map((_, i) => {
        const radius = 6 + Math.random() * 4;
        const angle = (i / 40) * Math.PI * 2;
        const height = (Math.random() - 0.5) * 10;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <Float
            key={i}
            speed={1 + Math.random() * 2}
            rotationIntensity={0.5}
            floatIntensity={1}
            floatingRange={[-0.5, 0.5]}
          >
            <mesh position={[x, height, z]} rotation={[0, -angle, 0]}>
              <boxGeometry args={[0.3, 1.2, 0.8]} />
              <meshStandardMaterial 
                color={Math.random() > 0.5 ? '#D4AF37' : '#2C261A'} 
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

export default function ThreeDLibrary() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 0]} fov={60} />
        <OrbitControls 
           enableZoom={false} 
           enablePan={false}
           maxPolarAngle={Math.PI / 2 + 0.1}
           minPolarAngle={Math.PI / 2 - 0.1}
           autoRotate
           autoRotateSpeed={0.5}
        />
        
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#D4AF37" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ffffff" />
        
        <Books />

        <Environment preset="night" />
        <fog attach="fog" args={['#0E0C0A', 5, 20]} />
      </Canvas>
    </div>
  );
}
