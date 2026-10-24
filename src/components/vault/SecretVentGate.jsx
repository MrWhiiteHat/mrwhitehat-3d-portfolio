import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { playAirlockDoorSound, playHackingBeep } from '../../utils/audio.js';

export default function SecretVentGate({
  unlockedCount = 0,
  totalRequired = 9,
  isBypassed = false,
  onEnterVault = null,
}) {
  const grateLeftRef = useRef();
  const grateRightRef = useRef();
  const [isOpenManual, setIsOpenManual] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isUnlocked = isBypassed || isOpenManual || unlockedCount >= totalRequired;

  useFrame((_, delta) => {
    const targetOffset = isUnlocked ? 0.58 : 0;
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
      position={[-1.15, 0.45, -4.96]}
      rotation={[0, 0, 0]}
      name="SecretVentGate"
      onClick={handleVentClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Heavy Industrial Wall Vent Frame (Low floor-level duct beside Server Rack) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.35, 0.72, 0.08]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.4} />
      </mesh>

      {/* Frame Outer Bezel with Warning Hazard Trim */}
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[1.42, 0.78, 0.02]} />
        <meshStandardMaterial
          color={isUnlocked ? '#10b981' : (hovered ? '#ef4444' : '#f59e0b')}
          roughness={0.5}
        />
      </mesh>

      {/* Internal Dark Duct Void */}
      <mesh position={[0, 0, -0.15]}>
        <boxGeometry args={[1.22, 0.62, 0.35]} />
        <meshStandardMaterial color="#050807" roughness={0.9} />
      </mesh>

      {/* Internal Crimson/Green Light Beam from inside secret crawlspace */}
      <pointLight
        position={[0, 0, 0.12]}
        color={isUnlocked ? '#10b981' : '#ef4444'}
        intensity={isUnlocked ? 8 : (hovered ? 5 : 2.5)}
        distance={2.0}
      />

      {/* 2. Sliding Left Grate Shutter */}
      <group ref={grateLeftRef} position={[0, 0, 0.02]}>
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.6, 0.62, 0.03]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.7} />
        </mesh>
        {/* Slits */}
        {[-0.2, -0.07, 0.07, 0.2].map((y, i) => (
          <mesh key={`slit-l-${i}`} position={[-0.3, y, 0.02]}>
            <boxGeometry args={[0.46, 0.03, 0.015]} />
            <meshStandardMaterial color="#090d16" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 3. Sliding Right Grate Shutter */}
      <group ref={grateRightRef} position={[0, 0, 0.02]}>
        <mesh position={[0.3, 0, 0]}>
          <boxGeometry args={[0.6, 0.62, 0.03]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.7} />
        </mesh>
        {/* Slits */}
        {[-0.2, -0.07, 0.07, 0.2].map((y, i) => (
          <mesh key={`slit-r-${i}`} position={[0.3, y, 0.02]}>
            <boxGeometry args={[0.46, 0.03, 0.015]} />
            <meshStandardMaterial color="#090d16" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* 4. Digital Security Header Plate & Status Display (Flush with upper vent casing) */}
      <mesh position={[0, 0.42, 0.03]}>
        <boxGeometry args={[1.2, 0.12, 0.025]} />
        <meshStandardMaterial color="#090d16" roughness={0.5} />
      </mesh>

      <Text
        position={[0, 0.42, 0.05]}
        fontSize={0.052}
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
        <group position={[0, 0, 0.05]}>
          {[-0.18, 0, 0.18].map((y, i) => (
            <mesh key={`laser-${i}`} position={[0, y, 0]}>
              <boxGeometry args={[1.2, 0.01, 0.01]} />
              <meshStandardMaterial color="#ef4444" emissive="#ff0000" emissiveIntensity={2.5} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
