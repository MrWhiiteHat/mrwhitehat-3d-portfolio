import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playHackingBeep } from '../../utils/audio.js';

/**
 * Autonomous Cyber Sentinel Recon Drone
 * Hovers smoothly in 3D space with spinning rotors and downward targeting laser cone.
 */
export default function CyberSentinelDrone() {
  const droneGroupRef = useRef();
  const rotorRefs = useRef([]);
  const laserRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Gentle hover bobbing and roll
    if (droneGroupRef.current) {
      droneGroupRef.current.position.y = 1.95 + Math.sin(time * 2.2) * 0.08;
      droneGroupRef.current.rotation.z = Math.sin(time * 1.5) * 0.04;
      droneGroupRef.current.rotation.x = Math.cos(time * 1.8) * 0.03;
    }

    // High-speed rotor spin
    rotorRefs.current.forEach((r, i) => {
      if (r) r.rotation.y += delta * (i % 2 === 0 ? 35 : -35);
    });

    // Scanner laser pulse
    if (laserRef.current) {
      laserRef.current.intensity = 1.8 + Math.sin(time * 4) * 0.5;
    }
  });

  const handleDroneClick = (e) => {
    e.stopPropagation();
    playHackingBeep(2100);
  };

  return (
    <group
      ref={droneGroupRef}
      position={[-3.3, 1.95, -3.6]}
      rotation={[0, 0.45, 0]}
      name="CyberSentinelDrone"
      onClick={handleDroneClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Aerodynamic Carbon Fiber Drone Core Body */}
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.08, 0.28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Upper Armor Cowling */}
      <mesh position={[0, 0.045, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.22]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* 2. Optical Sensor Lens (Front Under-chassis) */}
      <group position={[0, -0.04, 0.12]}>
        <mesh>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        {/* Downward Targeting Conical Laser Beam */}
        <pointLight
          ref={laserRef}
          position={[0, -0.1, 0.05]}
          color="#34d399"
          intensity={2.2}
          distance={2.8}
        />
        <mesh position={[0, -0.5, 0.02]} rotation={[0.08, 0, 0]}>
          <coneGeometry args={[0.22, 1.0, 16, 1, true]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.12} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 3. 4 Quad-Rotor Arms extending diagonally */}
      {[
        { x: -0.16, z: 0.16, idx: 0 },
        { x: 0.16, z: 0.16, idx: 1 },
        { x: -0.16, z: -0.16, idx: 2 },
        { x: 0.16, z: -0.16, idx: 3 },
      ].map((arm) => (
        <group key={`drone-arm-${arm.idx}`} position={[arm.x, 0, arm.z]}>
          {/* Carbon Fiber Strut */}
          <mesh>
            <boxGeometry args={[0.025, 0.015, 0.14]} />
            <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Brushless Motor Hub */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.03, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.95} />
          </mesh>
          {/* Spinning Propeller Blades */}
          <group
            ref={(el) => (rotorRefs.current[arm.idx] = el)}
            position={[0, 0.038, 0]}
          >
            <mesh>
              <boxGeometry args={[0.18, 0.003, 0.022]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
            </mesh>
          </group>
        </group>
      ))}

      {/* 4. Left & Right Carbon Landing Skids */}
      {[-0.09, 0.09].map((sx, i) => (
        <group key={`skid-${i}`} position={[sx, -0.07, 0]}>
          <mesh>
            <boxGeometry args={[0.012, 0.01, 0.24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.03, 0.06]}>
            <cylinderGeometry args={[0.004, 0.004, 0.06, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.03, -0.06]}>
            <cylinderGeometry args={[0.004, 0.004, 0.06, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
