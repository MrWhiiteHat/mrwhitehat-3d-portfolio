import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playTelephoneTone, playWhooshSound } from '../../utils/audio.js';

export default function CommsStation({ onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const screenLightRef = useRef();
  const antennaRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Screen Frequency Pulse
    if (screenLightRef.current) {
      screenLightRef.current.intensity = (hovered ? 2.5 : 1.5) + Math.sin(time * 3.5) * 0.3;
    }

    // 2. Antenna gentle breeze oscillation
    if (antennaRef.current) {
      antennaRef.current.rotation.z = -0.15 + Math.sin(time * 2.2) * 0.04;
    }
  });

  const handleKeyClick = (key) => (e) => {
    e.stopPropagation();
    playTelephoneTone(key);
  };

  const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <group
      position={[-0.15, 0.78, 0.6]}
      rotation={[0, -0.15, 0]}
      name="CommsStation"
      onClick={(e) => {
        e.stopPropagation();
        playWhooshSound();
        onSelect?.({ section: 'contact', label: 'Refreshment & Phone · Contact' });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        onHover?.('Refreshment & Phone · Contact');
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
        onHover?.(null);
      }}
    >
      {/* 1. Angled Intercom Console Wedge Base */}
      <group position={[0, 0.05, 0]} rotation={[-Math.PI / 4.5, 0, 0]}>
        {/* Main Console Chassis */}
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.28, 0.06]} />
          <meshStandardMaterial color="#0c120e" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Digital Frequency Display Screen */}
        <mesh position={[-0.05, 0.06, 0.035]}>
          <planeGeometry args={[0.18, 0.09]} />
          <meshBasicMaterial color={hovered ? '#0a2e18' : '#051a0d'} />
        </mesh>
        {/* Active Frequency LED Beam */}
        <pointLight
          ref={screenLightRef}
          position={[-0.05, 0.06, 0.08]}
          color="#22c55e"
          intensity={1.5}
          distance={0.8}
        />

        {/* Interactive Tactile Keypad Matrix Grid */}
        <group position={[-0.05, -0.06, 0.035]}>
          {[-0.05, 0, 0.05].map((x, col) =>
            [0.03, 0, -0.03].map((y, row) => {
              const keyIdx = col * 3 + row;
              const keyNum = keypadKeys[keyIdx] || '1';

              return (
                <mesh
                  key={`btn-${col}-${row}`}
                  position={[x, y, 0.005]}
                  onClick={handleKeyClick(keyNum)}
                  onPointerOver={() => {
                    document.body.style.cursor = 'pointer';
                  }}
                  onPointerOut={() => {
                    document.body.style.cursor = 'auto';
                  }}
                >
                  <boxGeometry args={[0.032, 0.022, 0.01]} />
                  <meshStandardMaterial color="#1e2922" roughness={0.6} />
                </mesh>
              );
            })
          )}
        </group>

        {/* Telephone Handset on Right Cradle */}
        <group position={[0.11, 0, 0.045]}>
          {/* Handset Handle */}
          <mesh castShadow>
            <boxGeometry args={[0.05, 0.24, 0.035]} />
            <meshStandardMaterial color="#111813" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Earpiece */}
          <mesh position={[0, 0.09, 0.015]}>
            <boxGeometry args={[0.065, 0.05, 0.02]} />
            <meshStandardMaterial color="#18221a" roughness={0.4} />
          </mesh>
          {/* Mouthpiece */}
          <mesh position={[0, -0.09, 0.015]}>
            <boxGeometry args={[0.065, 0.05, 0.02]} />
            <meshStandardMaterial color="#18221a" roughness={0.4} />
          </mesh>
        </group>

        {/* Communication Antenna with soft oscillation */}
        <mesh
          ref={antennaRef}
          position={[-0.14, 0.15, 0]}
          rotation={[0.1, 0, -0.15]}
          castShadow
        >
          <cylinderGeometry args={[0.006, 0.01, 0.22, 12]} />
          <meshStandardMaterial color="#0a0f0b" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
