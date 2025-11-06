import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Neon particle field with multiple colors
function NeonParticles() {
  const points1 = useRef();
  const points2 = useRef();
  const points3 = useRef();
  const particleCount = 800;

  const createParticles = () => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      velocities[i * 3] = (Math.random() - 0.5) * 0.03;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.03;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.03;
    }

    return { positions, velocities };
  };

  const particles1 = useMemo(() => createParticles(), []);
  const particles2 = useMemo(() => createParticles(), []);
  const particles3 = useMemo(() => createParticles(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Update cyan particles
    if (points1.current) {
      const positions = points1.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particles1.velocities[i * 3];
        positions[i * 3 + 1] += particles1.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles1.velocities[i * 3 + 2];

        if (Math.abs(positions[i * 3]) > 30) particles1.velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 30) particles1.velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 30) particles1.velocities[i * 3 + 2] *= -1;
      }
      points1.current.geometry.attributes.position.needsUpdate = true;
      points1.current.material.opacity = 0.6 + Math.sin(time * 2) * 0.2;
    }

    // Update magenta particles
    if (points2.current) {
      const positions = points2.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particles2.velocities[i * 3];
        positions[i * 3 + 1] += particles2.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles2.velocities[i * 3 + 2];

        if (Math.abs(positions[i * 3]) > 30) particles2.velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 30) particles2.velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 30) particles2.velocities[i * 3 + 2] *= -1;
      }
      points2.current.geometry.attributes.position.needsUpdate = true;
      points2.current.material.opacity = 0.6 + Math.sin(time * 2 + 2) * 0.2;
    }

    // Update green particles
    if (points3.current) {
      const positions = points3.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particles3.velocities[i * 3];
        positions[i * 3 + 1] += particles3.velocities[i * 3 + 1];
        positions[i * 3 + 2] += particles3.velocities[i * 3 + 2];

        if (Math.abs(positions[i * 3]) > 30) particles3.velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 30) particles3.velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 30) particles3.velocities[i * 3 + 2] *= -1;
      }
      points3.current.geometry.attributes.position.needsUpdate = true;
      points3.current.material.opacity = 0.6 + Math.sin(time * 2 + 4) * 0.2;
    }
  });

  return (
    <>
      {/* Cyan particles */}
      <points ref={points1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particles1.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#00ffff"
          sizeAttenuation
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Magenta particles */}
      <points ref={points2}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particles2.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#ff00ff"
          sizeAttenuation
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Green particles */}
      <points ref={points3}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particles3.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#39ff14"
          sizeAttenuation
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

// Cyberpunk geometric grid cube
function CyberCube() {
  const mesh = useRef();
  const edges = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current && edges.current) {
      mesh.current.rotation.x = time * 0.2;
      mesh.current.rotation.y = time * 0.3;
      edges.current.rotation.x = time * 0.2;
      edges.current.rotation.y = time * 0.3;

      // Pulsing effect
      const scale = 1 + Math.sin(time * 1.5) * 0.1;
      mesh.current.scale.set(scale, scale, scale);
      edges.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0, 0, -8]}>
      <mesh ref={mesh}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial
          color="#00ffff"
          wireframe
          emissive="#00ffff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.3}
        />
      </mesh>
      <lineSegments ref={edges}>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(3, 3, 3)]} />
        <lineBasicMaterial attach="material" color="#ff00ff" linewidth={2} />
      </lineSegments>
    </group>
  );
}

// Digital grid plane
function GridPlane() {
  const mesh = useRef();

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = -5 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
    }
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[50, 50, 20, 20]} />
      <meshBasicMaterial
        color="#00ffff"
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

// Rotating rings
function NeonRings() {
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (ring1.current) {
      ring1.current.rotation.x = time * 0.5;
      ring1.current.rotation.y = time * 0.3;
    }
    if (ring2.current) {
      ring2.current.rotation.x = -time * 0.4;
      ring2.current.rotation.z = time * 0.2;
    }
    if (ring3.current) {
      ring3.current.rotation.y = time * 0.6;
      ring3.current.rotation.z = -time * 0.3;
    }
  });

  return (
    <group position={[0, 0, -12]}>
      <mesh ref={ring1}>
        <torusGeometry args={[4, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[3.5, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[3, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#39ff14"
          emissive="#39ff14"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

export default function CyberpunkBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <color attach="background" args={['#0a0e27']} />
        <fog attach="fog" args={['#0a0e27', 5, 50]} />

        {/* Neon lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />
        <pointLight position={[0, 10, -10]} intensity={0.8} color="#39ff14" />

        {/* Cyberpunk stars with cyan tint */}
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          fade
          speed={1}
          saturation={1}
          color="#00ffff"
        />

        {/* Neon particle fields */}
        <NeonParticles />

        {/* Geometric elements */}
        <CyberCube />
        <GridPlane />
        <NeonRings />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
