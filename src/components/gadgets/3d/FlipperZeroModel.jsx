import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { playClickSound, playHackingBeep } from '../../../utils/audio.js';

export const FLIPPER_APPS = [
  {
    id: 'subghz',
    title: 'SUB-GHZ RX/TX',
    freq: '433.92 MHz',
    status: 'HOPPING · RSSI -42dBm',
    icon: '📡',
    desc: 'Keeloq & rolling code analyzer. Capturing RF remotes & garage gate telemetry.',
  },
  {
    id: 'rfid',
    title: '125 kHz RFID',
    freq: 'EM4100 / HID Prox',
    status: 'TAG CLONED: [0x7A_9F_01]',
    icon: '💳',
    desc: 'LF RFID transceiver. Emulating physical security door badges and access fobs.',
  },
  {
    id: 'badusb',
    title: 'BAD-USB DUCKY',
    freq: 'USB HID 1000 WPM',
    status: 'PAYLOAD: reverse_shell.ps1',
    icon: '⚡',
    desc: 'Human Interface Device emulation injecting memory-resident staging scripts.',
  },
  {
    id: 'infrared',
    title: 'INFRARED REMOTE',
    freq: '38 kHz Carrier',
    status: 'UNIVERSAL POWER OFF',
    icon: '🔴',
    desc: 'IR transmitter transmitting TV-B-Gone & projector brute force codes.',
  },
  {
    id: 'dolphin',
    title: 'CYBER DOLPHIN',
    freq: 'MOOD: EXTREMELY HAPPY',
    status: 'LEVEL 42 // ROOT MASTER',
    icon: '🐬',
    desc: 'Tamagotchi cyber companion fed by hacking wireless and RF protocols.',
  },
];

export default function FlipperZeroModel({
  wireframe = false,
  onAppChange = null,
}) {
  const groupRef = useRef();
  const [activeAppIdx, setActiveAppIdx] = useState(0);
  const [pressedBtn, setPressedBtn] = useState(null);

  const activeApp = FLIPPER_APPS[activeAppIdx];

  const handlePress = (direction) => {
    playHackingBeep(1100 + Math.random() * 400);
    setPressedBtn(direction);
    setTimeout(() => setPressedBtn(null), 180);

    let nextIdx = activeAppIdx;
    if (direction === 'RIGHT' || direction === 'DOWN') {
      nextIdx = (activeAppIdx + 1) % FLIPPER_APPS.length;
    } else if (direction === 'LEFT' || direction === 'UP') {
      nextIdx = (activeAppIdx - 1 + FLIPPER_APPS.length) % FLIPPER_APPS.length;
    } else if (direction === 'OK') {
      playClickSound(1800);
    }

    setActiveAppIdx(nextIdx);
    onAppChange?.(FLIPPER_APPS[nextIdx]);
  };

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 1. Main Ergonomic Flipper Body (Matte White Polycarbonate) */}
      <RoundedBox args={[3.2, 1.4, 0.55]} radius={0.16} smoothness={8}>
        <meshStandardMaterial
          color="#f4f6f8"
          roughness={0.25}
          metalness={0.08}
          wireframe={wireframe}
        />
      </RoundedBox>

      {/* 2. Side Rubber Bumper Grips */}
      <mesh position={[-1.55, 0, 0]}>
        <boxGeometry args={[0.08, 1.1, 0.48]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.8} />
      </mesh>
      <mesh position={[1.55, 0, 0]}>
        <boxGeometry args={[0.08, 1.1, 0.48]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.8} />
      </mesh>

      {/* 3. Orange Retro Backlit LCD Display */}
      <mesh position={[-0.52, 0.05, 0.28]}>
        <planeGeometry args={[1.65, 0.95]} />
        <meshStandardMaterial
          color="#ff7700"
          emissive="#ff5500"
          emissiveIntensity={0.85}
          roughness={0.2}
          wireframe={wireframe}
        />
      </mesh>

      {/* Screen Bezel Inset */}
      <mesh position={[-0.52, 0.05, 0.278]}>
        <planeGeometry args={[1.72, 1.02]} />
        <meshStandardMaterial color="#1a1c1e" roughness={0.5} />
      </mesh>

      {/* Screen Content: Live Text via Drei */}
      <group position={[-0.52, 0.05, 0.29]}>
        {/* App Title Bar */}
        <Text
          position={[0, 0.32, 0]}
          fontSize={0.11}
          color="#111111"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          {`${activeApp.icon} ${activeApp.title}`}
        </Text>

        {/* Frequency / Protocol parameter */}
        <Text
          position={[0, 0.12, 0]}
          fontSize={0.13}
          color="#000000"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          {activeApp.freq}
        </Text>

        {/* Live Status readout */}
        <Text
          position={[0, -0.08, 0]}
          fontSize={0.085}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
        >
          {activeApp.status}
        </Text>

        {/* Bottom Navigation Hint */}
        <Text
          position={[0, -0.32, 0]}
          fontSize={0.065}
          color="#334155"
          anchorX="center"
          anchorY="middle"
        >
          [◀ D-PAD ▶ TO CYCLE APPS]
        </Text>
      </group>

      {/* 4. Clickable 5-Way Directional D-Pad (Right Side) */}
      <group position={[0.88, 0.05, 0.28]}>
        {/* D-Pad Base Ring */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.04, 32]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#2d3748" roughness={0.4} />
        </mesh>

        {/* Center OK Button */}
        <mesh
          position={[0, 0, pressedBtn === 'OK' ? 0.01 : 0.04]}
          onClick={(e) => {
            e.stopPropagation();
            handlePress('OK');
          }}
        >
          <cylinderGeometry args={[0.18, 0.18, 0.05, 24]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial
            color={pressedBtn === 'OK' ? '#f97316' : '#ff7a00'}
            emissive={pressedBtn === 'OK' ? '#ff5500' : '#000000'}
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* UP Button */}
        <mesh
          position={[0, 0.32, pressedBtn === 'UP' ? 0.01 : 0.035]}
          onClick={(e) => {
            e.stopPropagation();
            handlePress('UP');
          }}
        >
          <boxGeometry args={[0.22, 0.16, 0.04]} />
          <meshStandardMaterial color={pressedBtn === 'UP' ? '#38bdf8' : '#e2e8f0'} roughness={0.3} />
        </mesh>

        {/* DOWN Button */}
        <mesh
          position={[0, -0.32, pressedBtn === 'DOWN' ? 0.01 : 0.035]}
          onClick={(e) => {
            e.stopPropagation();
            handlePress('DOWN');
          }}
        >
          <boxGeometry args={[0.22, 0.16, 0.04]} />
          <meshStandardMaterial color={pressedBtn === 'DOWN' ? '#38bdf8' : '#e2e8f0'} roughness={0.3} />
        </mesh>

        {/* LEFT Button */}
        <mesh
          position={[-0.32, 0, pressedBtn === 'LEFT' ? 0.01 : 0.035]}
          onClick={(e) => {
            e.stopPropagation();
            handlePress('LEFT');
          }}
        >
          <boxGeometry args={[0.16, 0.22, 0.04]} />
          <meshStandardMaterial color={pressedBtn === 'LEFT' ? '#38bdf8' : '#e2e8f0'} roughness={0.3} />
        </mesh>

        {/* RIGHT Button */}
        <mesh
          position={[0.32, 0, pressedBtn === 'RIGHT' ? 0.01 : 0.035]}
          onClick={(e) => {
            e.stopPropagation();
            handlePress('RIGHT');
          }}
        >
          <boxGeometry args={[0.16, 0.22, 0.04]} />
          <meshStandardMaterial color={pressedBtn === 'RIGHT' ? '#38bdf8' : '#e2e8f0'} roughness={0.3} />
        </mesh>
      </group>

      {/* 5. Back Button (Bottom Right) */}
      <mesh
        position={[1.25, -0.42, pressedBtn === 'BACK' ? 0.26 : 0.28]}
        onClick={(e) => {
          e.stopPropagation();
          handlePress('BACK');
        }}
      >
        <circleGeometry args={[0.09, 16]} />
        <meshStandardMaterial color={pressedBtn === 'BACK' ? '#ef4444' : '#64748b'} />
      </mesh>

      {/* 6. Top Hardware Elements: GPIO Pins Header, IR Window, Power Button */}
      <mesh position={[0, 0.71, 0]}>
        <boxGeometry args={[2.0, 0.05, 0.22]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* GPIO Pin Array (18 Pins) */}
      {Array.from({ length: 9 }).map((_, i) => (
        <group key={i} position={[-0.8 + i * 0.2, 0.74, 0]}>
          <mesh position={[0, 0, 0.04]}>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, -0.04]}>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Infrared Dark Acrylic Blaster Window */}
      <mesh position={[1.35, 0.71, 0]}>
        <boxGeometry args={[0.35, 0.04, 0.25]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.1} metalness={0.5} transparent opacity={0.85} />
      </mesh>

      {/* 7. Bottom Hardware: USB-C Port & Lanyard Loop */}
      <mesh position={[-1.15, -0.71, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
      <mesh position={[1.35, -0.71, 0]}>
        <torusGeometry args={[0.08, 0.025, 8, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
    </group>
  );
}
