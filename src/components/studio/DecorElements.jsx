import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DecorElements() {
  const plantGroupRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Gentle plant breeze sway
    if (plantGroupRef.current) {
      plantGroupRef.current.rotation.z = Math.sin(time * 1.5) * 0.025;
      plantGroupRef.current.rotation.x = Math.cos(time * 1.2) * 0.015;
    }
  });

  return (
    <group name="DecorElements">
      {/* 1. Tall Designer Monstera Plant by the Window with Breeze Animation */}
      <group position={[2.2, 0, -4.2]}>
        {/* Fluted Ceramic Pot */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.2, 0.7, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Potting Soil */}
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 24]} />
          <meshStandardMaterial color="#1a120b" roughness={0.9} />
        </mesh>

        {/* Plant Stems and Wide Leaves - swaying in the breeze */}
        <group ref={plantGroupRef} position={[0, 0.7, 0]}>
          {[
            { pos: [0, 0.2, 0], rot: [0.2, 0.4, 0.1], s: 0.25 },
            { pos: [-0.15, 0.5, 0.1], rot: [-0.3, 0.8, -0.2], s: 0.28 },
            { pos: [0.18, 0.4, -0.1], rot: [0.4, -0.5, 0.3], s: 0.24 },
            { pos: [-0.05, 0.75, -0.05], rot: [-0.1, 0.2, 0.4], s: 0.3 },
            { pos: [0.1, 0.9, 0.1], rot: [0.2, 1.5, -0.1], s: 0.32 },
          ].map((leaf, i) => (
            <group key={`leaf-${i}`} position={leaf.pos} rotation={leaf.rot}>
              <mesh castShadow>
                <cylinderGeometry args={[0.012, 0.015, 0.6, 8]} />
                <meshStandardMaterial color="#15803d" roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <sphereGeometry args={[leaf.s, 16, 8]} />
                <meshStandardMaterial color="#166534" roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 2. Potted Plant by the Conference Room */}
      <group position={[-4.4, 0, 1.8]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.6, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.75, 0]} castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color="#14532d" roughness={0.6} />
        </mesh>
      </group>

      {/* 3. Ceiling Track Lighting Rails with Spotlights */}
      <group position={[0, 4.35, 0]}>
        {/* Longitudinal Rail 1 */}
        <mesh position={[-1.5, 0, 0]}>
          <boxGeometry args={[0.04, 0.06, 8.5]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Longitudinal Rail 2 */}
        <mesh position={[1.5, 0, 0]}>
          <boxGeometry args={[0.04, 0.06, 8.5]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Spotlights clamped to rails */}
        {[
          { pos: [-1.5, -0.08, 0.4], rot: [0.2, 0, 0.3], target: 'workstation' },
          { pos: [-1.5, -0.08, -2.0], rot: [0.4, 0, -0.5], target: 'conference' },
          { pos: [-1.5, -0.08, 2.5], rot: [-0.3, 0, 0.2], target: 'printer' },
          { pos: [1.5, -0.08, -2.5], rot: [0.3, 0, -0.2], target: 'archive' },
          { pos: [1.5, -0.08, 1.6], rot: [-0.2, 0, -0.4], target: 'lounge' },
        ].map((spot, idx) => (
          <group key={`track-spot-${idx}`} position={spot.pos} rotation={spot.rot}>
            <mesh castShadow>
              <cylinderGeometry args={[0.04, 0.06, 0.12, 16]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.065, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.01, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
