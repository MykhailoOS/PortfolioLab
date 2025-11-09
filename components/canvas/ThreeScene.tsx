import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// FIX: The `extend(THREE)` call is deprecated and was causing a TypeScript error.
// With modern versions of `@react-three/fiber`, core components are automatically
// available as JSX elements, so this call is no longer necessary.

const ParticleSystem = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const count = 500;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.max(1.5, Math.cos(t) * 5);
      
      tempObject.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      tempObject.scale.set(s, s, s);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
     <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial color="#7c3aed" roughness={0.5} />
    </instancedMesh>
  );
};


const SceneContent = () => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if(groupRef.current){
            groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
            groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <ambientLight intensity={0.2} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <pointLight position={[-5, -5, -5]} intensity={0.5} color="#7c3aed" />

            <Icosahedron args={[2.5, 1]} position={[0,0,0]}>
                <meshStandardMaterial 
                    color="#1f2937" 
                    wireframe={true}
                    roughness={0.2} 
                    metalness={0.8} 
                />
            </Icosahedron>
            <ParticleSystem />
        </group>
    );
};

const ThreeScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
