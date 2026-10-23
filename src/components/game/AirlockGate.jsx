import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playAirlockDoorSound } from '../../utils/audio.js';

export default function AirlockGate({ isOpen = false, onFullyOpen }) {
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();
  const steamRef = useRef();
  const statusLightRef = useRef();
  const currentOpenProgress = useRef(0);
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !soundPlayedRef.current) {
      playAirlockDoorSound();
      soundPlayedRef.current = true;
    }
  }, [isOpen]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const targetProgress = isOpen ? 1.0 : 0.0;

    // Fast, responsive pneumatic door glide (swift 0.35s opening with zero lag)
    currentOpenProgress.current = THREE.MathUtils.damp(
      currentOpenProgress.current,
      targetProgress,
      8.0,
      delta
    );

    const slideDistance = currentOpenProgress.current * 0.78;

    if (leftDoorRef.current) {
      leftDoorRef.current.position.z = -0.38 - slideDistance;
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.z = 0.38 + slideDistance;
    }

    // Overhead status light pulse
    if (statusLightRef.current) {
      if (isOpen) {
        statusLightRef.current.intensity = 2.5 + Math.sin(time * 6) * 0.4;
      } else {
        statusLightRef.current.intensity = 1.6 + Math.sin(time * 2.5) * 0.6;
      }
    }

    // Steam vent dissipation
    if (steamRef.current && isOpen && currentOpenProgress.current < 0.88) {
      steamRef.current.visible = true;
      steamRef.current.scale.setScalar(0.4 + currentOpenProgress.current * 2.5);
    } else if (steamRef.current) {
      steamRef.current.visible = false;
    }

    if (isOpen && currentOpenProgress.current > 0.95 && onFullyOpen) {
      onFullyOpen();
    }
  });

  return (
    <group position={[4.96, 0, -2.8]} name="AirlockGate">
      {/* ========================================================================= */}
      {/* 1. ENCLOSED AIRLOCK ENTRANCE VESTIBULE (Corridor extending X: 0 to 2.2)    */}
      {/* ========================================================================= */}
      <group position={[1.1, 1.5, 0]}>
        {/* Vestibule Floor Plate */}
        <mesh position={[0, -1.49, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.02, 1.9]} />
          <meshStandardMaterial color="#0c1318" roughness={0.6} metalness={0.6} />
        </mesh>
        {/* Yellow-Black Chevron Hazard Striping on Vestibule Floor */}
        <mesh position={[0, -1.48, 0]}>
          <boxGeometry args={[0.08, 0.005, 1.7]} />
          <meshStandardMaterial color="#eab308" roughness={0.4} />
        </mesh>
        <mesh position={[0.6, -1.48, 0]}>
          <boxGeometry args={[0.08, 0.005, 1.7]} />
          <meshStandardMaterial color="#eab308" roughness={0.4} />
        </mesh>

        {/* Vestibule North Wall (Z = -0.95) */}
        <mesh position={[0, 0, -0.95]} receiveShadow>
          <boxGeometry args={[2.2, 3.0, 0.08]} />
          <meshStandardMaterial color="#0e171f" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Wall Conduit Cables */}
        <mesh position={[0, -0.4, -0.9]}>
          <boxGeometry args={[2.1, 0.04, 0.04]} />
          <meshStandardMaterial color="#070c10" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.2, -0.9]}>
          <boxGeometry args={[2.1, 0.02, 0.02]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>

        {/* Vestibule South Wall (Z = +0.95) */}
        <mesh position={[0, 0, 0.95]} receiveShadow>
          <boxGeometry args={[2.2, 3.0, 0.08]} />
          <meshStandardMaterial color="#0e171f" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Security Scanner Terminal Screen on South Wall */}
        <group position={[0.2, 0, 0.9]}>
          <mesh>
            <boxGeometry args={[0.4, 0.6, 0.04]} />
            <meshStandardMaterial color="#050a0d" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.08, -0.025]}>
            <boxGeometry args={[0.32, 0.22, 0.01]} />
            <meshBasicMaterial color={isOpen ? '#22c55e' : '#38bdf8'} />
          </mesh>
          <mesh position={[0, -0.15, -0.025]}>
            <boxGeometry args={[0.28, 0.12, 0.01]} />
            <meshStandardMaterial color="#1a2733" />
          </mesh>
        </group>

        {/* Vestibule Enclosed Ceiling at Y = 3.0m */}
        <mesh position={[0, 1.5, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.08, 1.9]} />
          <meshStandardMaterial color="#0a1014" roughness={0.8} />
        </mesh>
        {/* Overhead Corridor Bulkhead Downlights */}
        <pointLight position={[0.6, 1.3, 0]} intensity={1.8} color="#e0f2fe" distance={3.5} />
        <mesh position={[0.6, 1.45, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.6]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>

        {/* Rear Security Bulkhead Door at X = 1.08 (Back of Vestibule) */}
        <group position={[1.06, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 2.9, 1.8]} />
            <meshStandardMaterial color="#111c24" roughness={0.5} metalness={0.8} />
          </mesh>
          {/* Beveled Warning Frame */}
          <mesh position={[-0.045, 0, 0]}>
            <boxGeometry args={[0.01, 2.6, 1.5]} />
            <meshStandardMaterial color="#090f14" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[-0.05, 0.6, 0]}>
            <boxGeometry args={[0.01, 0.1, 0.6]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 2. HEAVY TITANIUM OUTER BLAST DOOR FRAME (Separates Vestibule from Studio)*/}
      {/* ========================================================================= */}
      <group position={[0, 1.5, 0]}>
        {/* Top Header Beam */}
        <mesh position={[0, 1.48, 0]}>
          <boxGeometry args={[0.32, 0.28, 2.0]} />
          <meshStandardMaterial color="#0b1319" metalness={0.88} roughness={0.25} />
        </mesh>
        {/* Left Side Door Jamb */}
        <mesh position={[0, 0, -0.92]}>
          <boxGeometry args={[0.32, 2.96, 0.22]} />
          <meshStandardMaterial color="#0b1319" metalness={0.88} roughness={0.25} />
        </mesh>
        {/* Right Side Door Jamb */}
        <mesh position={[0, 0, 0.92]}>
          <boxGeometry args={[0.32, 2.96, 0.22]} />
          <meshStandardMaterial color="#0b1319" metalness={0.88} roughness={0.25} />
        </mesh>

        {/* Hazard Warning Stripe Bar */}
        <mesh position={[-0.162, 1.36, 0]}>
          <boxGeometry args={[0.01, 0.08, 1.7]} />
          <meshStandardMaterial color="#eab308" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Overhead Security Status LED Screen */}
        <mesh position={[-0.165, 1.48, 0]}>
          <boxGeometry args={[0.01, 0.12, 0.9]} />
          <meshBasicMaterial color={isOpen ? '#22c55e' : '#ef4444'} />
        </mesh>
        <pointLight
          ref={statusLightRef}
          position={[-0.25, 1.48, 0]}
          color={isOpen ? '#22c55e' : '#ef4444'}
          intensity={2.2}
          distance={4.0}
        />
      </group>

      {/* ========================================================================= */}
      {/* 3. SLIDING TITANIUM BLAST DOORS                                            */}
      {/* ========================================================================= */}
      {/* Left Sliding Blast Door Slab */}
      <group ref={leftDoorRef} position={[0, 1.45, -0.38]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.08, 2.8, 0.76]} />
          <meshStandardMaterial color="#111c24" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Reinforced Bevel Ribs */}
        <mesh position={[-0.045, 0, 0]}>
          <boxGeometry args={[0.02, 2.6, 0.64]} />
          <meshStandardMaterial color="#070c10" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* High-Tech Cyan Neon Seam Edge */}
        <mesh position={[-0.045, 0, 0.37]}>
          <boxGeometry args={[0.015, 2.7, 0.02]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Right Sliding Blast Door Slab */}
      <group ref={rightDoorRef} position={[0, 1.45, 0.38]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.08, 2.8, 0.76]} />
          <meshStandardMaterial color="#111c24" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Reinforced Bevel Ribs */}
        <mesh position={[-0.045, 0, 0]}>
          <boxGeometry args={[0.02, 2.6, 0.64]} />
          <meshStandardMaterial color="#070c10" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* High-Tech Cyan Neon Seam Edge */}
        <mesh position={[-0.045, 0, -0.37]}>
          <boxGeometry args={[0.015, 2.7, 0.02]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* 4. Floor Entrance Threshold Ramp (Connects corridor to studio floor) */}
      <mesh position={[-0.1, 0.008, 0]}>
        <boxGeometry args={[0.24, 0.016, 1.8]} />
        <meshStandardMaterial color="#eab308" roughness={0.6} />
      </mesh>

      {/* 5. Pressurized Decompression Steam Puff */}
      <group ref={steamRef} position={[-0.1, 0.2, 0]} visible={false}>
        <mesh>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
}
