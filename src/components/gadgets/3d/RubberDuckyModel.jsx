import React, { useRef, useState } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { playClickSound, playZapSound } from '../../../utils/audio.js';

export default function RubberDuckyModel({
  wireframe = false,
  onModeToggle = null,
}) {
  const [isArmed, setIsArmed] = useState(true);
  const [btnPressed, setBtnPressed] = useState(false);

  const toggleArm = () => {
    playZapSound();
    playClickSound(1400);
    setBtnPressed(true);
    setTimeout(() => setBtnPressed(false), 200);
    const nextState = !isArmed;
    setIsArmed(nextState);
    onModeToggle?.(nextState ? 'ARMED' : 'STORAGE');
  };

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Translucent Frosted Case */}
      <RoundedBox args={[1.3, 3.2, 0.45]} radius={0.12} smoothness={6}>
        <meshPhysicalMaterial
          color="#1e293b"
          roughness={0.2}
          transmission={0.65}
          thickness={0.5}
          ior={1.45}
          wireframe={wireframe}
        />
      </RoundedBox>

      {/* 2. Internal High-Density Green PCB Board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.1, 2.9, 0.08]} />
        <meshStandardMaterial color="#065f46" roughness={0.4} metalness={0.2} />
      </mesh>

      {/* PCB Gold Copper Signal Traces */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-0.35 + i * 0.12, 0.2, 0.05]}>
          <planeGeometry args={[0.03, 1.4]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* 3. Quad-Core 32-bit Microcontroller SoC (Black Epoxy IC with Pins) */}
      <mesh position={[0, 0.35, 0.09]}>
        <boxGeometry args={[0.65, 0.65, 0.06]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* IC White Laser Etch Markings */}
      <Text
        position={[0, 0.35, 0.13]}
        fontSize={0.075}
        color="#f8fafc"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        HAK5 // DUCKY 3.0
      </Text>

      {/* IC Pins Array (Left & Right) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <React.Fragment key={i}>
          <mesh position={[-0.37, 0.15 + i * 0.08, 0.07]}>
            <boxGeometry args={[0.07, 0.03, 0.02]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
          <mesh position={[0.37, 0.15 + i * 0.08, 0.07]}>
            <boxGeometry args={[0.07, 0.03, 0.02]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
        </React.Fragment>
      ))}

      {/* 4. Interactive Physical Arming Switch / Push Button (Clickable!) */}
      <group
        position={[0, -0.65, 0.1]}
        onClick={(e) => {
          e.stopPropagation();
          toggleArm();
        }}
      >
        {/* Switch Housing */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.42, 0.42, 0.08]} />
          <meshStandardMaterial color="#334155" roughness={0.3} />
        </mesh>

        {/* Tactile Button Cap */}
        <mesh position={[0, 0, btnPressed ? 0.02 : 0.06]}>
          <cylinderGeometry args={[0.14, 0.14, 0.07, 16]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color={isArmed ? '#ef4444' : '#22c55e'}
            emissive={isArmed ? '#dc2626' : '#16a34a'}
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Mode Status Label */}
      <Text
        position={[0, -1.05, 0.1]}
        fontSize={0.085}
        color={isArmed ? '#f87171' : '#4ade80'}
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        {isArmed ? 'ARMED // ATTACK' : 'STORAGE MODE'}
      </Text>

      {/* 5. Dual-Color Activity Blinker LED */}
      <mesh position={[0.35, -0.2, 0.09]}>
        <cylinderGeometry args={[0.06, 0.06, 0.06, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial
          color={isArmed ? '#ff0033' : '#00ff66'}
          emissive={isArmed ? '#ff0033' : '#00ff66'}
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* 6. Gold Plated USB-A Plug (Top) */}
      <group position={[0, 1.95, 0]}>
        {/* Metal Outer Shell */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.95, 0.85, 0.32]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Hollow Internal Socket Insert */}
        <mesh position={[0, 0.05, -0.04]}>
          <boxGeometry args={[0.82, 0.72, 0.18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>

        {/* 4 Gold Connector Contact Pins */}
        {[-0.26, -0.09, 0.09, 0.26].map((x, i) => (
          <mesh key={i} position={[x, 0.12, 0.03]}>
            <boxGeometry args={[0.06, 0.45, 0.02]} />
            <meshStandardMaterial color="#fbbf24" metalness={1.0} roughness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
