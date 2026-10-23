import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { playAirlockDoorSound, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';

export default function SecretVentGate({
  unlockedCount = 0,
  totalRequired = 9,
  isBypassed = false,
  onEnterVault = null,
}) {
  const grateLeftRef = useRef();
  const grateRightRef = useRef();
  const [isOpenManual, setIsOpenManual] = useState(false);

  const isUnlocked = isBypassed || isOpenManual || unlockedCount >= totalRequired;

  useFrame((_, delta) => {
    const targetOffset = isUnlocked ? 0.72 : 0;
    if (grateLeftRef.current) {
      grateLeftRef.current.position.x = THREE.MathUtils.damp(
        grateLeftRef.current.position.x,
        -targetOffset,
        6,
        delta
      );
    }
    if (grateRightRef.current) {
      grateRightRef.current.position.x = THREE.MathUtils.damp(
        grateRightRef.current.position.x,
        targetOffset,
        6,
        delta
      );
    }
  });

  const handleVentClick = (e) => {
    e.stopPropagation();
    if (!isUnlocked) {
      playHackingBeep(650);
    } else {
      playAirlockDoorSound();
      onEnterVault?.();
    }
  };

  return (
    <group
      position={[-3.85, 0.95, -4.92]}
      rotation={[0, 0, 0]}
      onClick={handleVentClick}
    >
      {/* 1. Heavy Industrial Wall Vent Outer Frame (Dark Gunmetal) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.65, 1.25, 0.12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.65} metalness={0.6} />
      </mesh>

      {/* Subtle Top & Bottom Hazard Accent Rails */}
      <mesh position={[0, 0.6, 0.065]}>
        <boxGeometry args={[1.65, 0.04, 0.02]} />
        <meshStandardMaterial color={isUnlocked ? '#10b981' : '#ca8a04'} roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, -0.6, 0.065]}>
        <boxGeometry args={[1.65, 0.04, 0.02]} />
        <meshStandardMaterial color={isUnlocked ? '#10b981' : '#ca8a04'} roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Internal Dark Shaft Void */}
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[1.45, 1.05, 0.5]} />
        <meshStandardMaterial color="#030605" roughness={0.95} />
      </mesh>

      {/* Gentle, Ambient Shaft Backlight */}
      <pointLight
        position={[0, 0, 0.05]}
        color={isUnlocked ? '#10b981' : '#f59e0b'}
        intensity={isUnlocked ? 0.8 : 0.25}
        distance={1.6}
      />

      {/* 2. Sliding Left Grate Shutter */}
      <group ref={grateLeftRef} position={[0, 0, 0.02]}>
        <mesh position={[-0.36, 0, 0]}>
          <boxGeometry args={[0.72, 1.05, 0.05]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.6}
            metalness={0.7}
          />
        </mesh>
        {/* Slits */}
        {[-0.35, -0.18, 0, 0.18, 0.35].map((y, i) => (
          <mesh key={i} position={[-0.36, y, 0.03]}>
            <boxGeometry args={[0.55, 0.04, 0.02]} />
            <meshStandardMaterial color="#090d16" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 3. Sliding Right Grate Shutter */}
      <group ref={grateRightRef} position={[0, 0, 0.02]}>
        <mesh position={[0.36, 0, 0]}>
          <boxGeometry args={[0.72, 1.05, 0.05]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.6}
            metalness={0.7}
          />
        </mesh>
        {/* Slits */}
        {[-0.35, -0.18, 0, 0.18, 0.35].map((y, i) => (
          <mesh key={i} position={[0.36, y, 0.03]}>
            <boxGeometry args={[0.55, 0.04, 0.02]} />
            <meshStandardMaterial color="#090d16" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 4. Digital Security Pad & Status Display */}
      <mesh position={[0, 0.72, 0.04]}>
        <boxGeometry args={[1.2, 0.18, 0.05]} />
        <meshStandardMaterial color="#090d16" roughness={0.5} />
      </mesh>

      <Text
        position={[0, 0.72, 0.07]}
        fontSize={0.075}
        color={isUnlocked ? '#34d399' : '#f87171'}
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        {isUnlocked
          ? 'VAULT ACCESS GRANTED // [CLICK TO ENTER]'
          : `BLACK HAT VENT // ${unlockedCount}/${totalRequired} BREACHES`}
      </Text>

      {/* Laser Security Barrier Beams (Active when locked) */}
      {!isUnlocked && (
        <group position={[0, 0, 0.08]}>
          {[-0.35, -0.12, 0.12, 0.35].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[1.4, 0.006, 0.006]} />
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={0.8}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
