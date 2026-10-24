import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { playTelephoneTone, playWhooshSound } from '../../utils/audio.js';
import { getWalnutWoodTextures, getBrushedMetalTextures } from '../../utils/textures.js';

/**
 * Generates an authentic illuminated LCD texture for the desk comms console
 * with encrypted channel indicators, contact status, and green audio bars.
 */
function createCommsScreenTexture() {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Dark Military Emerald LCD Matrix Base
    ctx.fillStyle = '#02180e';
    ctx.fillRect(0, 0, 256, 128);

    // Top Status Bar
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(8, 8, 240, 22);

    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText('ENC-COMMS // PGP 4096-BIT', 16, 23);

    // Main Call Target
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('CALL: MRWHITEHAT', 16, 56);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('kanhasarangi39@gmail.com', 16, 74);

    // Audio Equalizer Frequency Bars
    const bars = [14, 22, 18, 30, 24, 34, 28, 38, 20, 16, 26, 18, 12];
    bars.forEach((h, i) => {
      ctx.fillStyle = h > 28 ? '#f59e0b' : '#34d399';
      ctx.fillRect(16 + i * 16, 118 - h, 10, h);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  } catch (err) {
    console.warn('Failed to create comms texture:', err);
    return null;
  }
}

export default function CommsStation({ onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const antennaRef = useRef();
  const commsTexture = useMemo(() => createCommsScreenTexture(), []);

  // Procedural PBR Textures for dedicated reception pedestal table
  const walnutWood = useMemo(() => getWalnutWoodTextures(2, 2), []);
  const brassMetal = useMemo(() => getBrushedMetalTextures(1, 2, '#ca8a04'), []);
  const darkMetal = useMemo(() => getBrushedMetalTextures(1, 1, '#111827'), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Antenna gentle breeze oscillation
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
      position={[3.75, 0, -1.25]}
      rotation={[0, -Math.PI / 2, 0]}
      name="CommsStation"
      onClick={(e) => {
        e.stopPropagation();
        playWhooshSound();
        onSelect?.({ section: 'contact', label: 'Secure Comms Relay · Contact' });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        onHover?.('Secure Comms Relay · Contact Hotline & PGP');
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
        onHover?.(null);
      }}
    >
      {/* ========================================================================= */}
      {/* 1. DEDICATED RECEPTION PEDESTAL CONSOLE TABLE                             */}
      {/* ========================================================================= */}
      <group position={[0, 0, 0]}>
        {/* Tabletop Surface (Heavy Dark Walnut with brass rim) */}
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.92, 0.05, 0.58]} />
          <meshStandardMaterial {...walnutWood} roughness={0.35} metalness={0.12} />
        </mesh>
        {/* Brass Inset Perimeter Trim */}
        <mesh position={[0, 0.73, 0]}>
          <boxGeometry args={[0.95, 0.015, 0.61]} />
          <meshStandardMaterial {...brassMetal} metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Center Heavy Brushed Metal Pedestal Column */}
        <mesh position={[0, 0.36, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 0.72, 24]} />
          <meshStandardMaterial {...darkMetal} metalness={0.88} roughness={0.25} />
        </mesh>
        {/* Pedestal Floor Base Plate */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.28, 0.04, 24]} />
          <meshStandardMaterial {...darkMetal} metalness={0.88} roughness={0.25} />
        </mesh>
        {/* Floor Glow Ring */}
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.29, 0.32, 32]} />
          <meshBasicMaterial color={hovered ? '#34d399' : '#10b981'} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 2. ILLUMINATED RECEPTION SIGNBOARD (Wall / Pedestal Header)                */}
      {/* ========================================================================= */}
      <group position={[0, 1.25, -0.22]}>
        <mesh>
          <boxGeometry args={[0.65, 0.12, 0.03]} />
          <meshStandardMaterial color="#090d16" roughness={0.4} metalness={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.046}
          color="#34d399"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          SECURE COMMS // CONTACT HOTLINE
        </Text>
      </group>

      {/* ========================================================================= */}
      {/* 3. ANGLED INTERCOM & ENCRYPTED COMMS CONSOLE (Mounted on Tabletop)        */}
      {/* ========================================================================= */}
      <group position={[-0.12, 0.765, 0]}>
        {/* Console Wedge Housing */}
        <group position={[0, 0.05, 0]} rotation={[-Math.PI / 5, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.28, 0.06]} />
            <meshStandardMaterial color="#0c120e" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Digital Encrypted Comms Screen with Live Contact Telemetry */}
          <mesh position={[-0.05, 0.06, 0.035]}>
            <planeGeometry args={[0.18, 0.09]} />
            <meshBasicMaterial map={commsTexture} toneMapped={false} />
          </mesh>
          <pointLight position={[-0.05, 0.06, 0.08]} color="#10b981" intensity={0.9} distance={0.7} />

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

          {/* Hardware PGP Cryptographic USB Key */}
          <group position={[-0.175, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <boxGeometry args={[0.016, 0.045, 0.008]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.01, 0.005]}>
              <sphereGeometry args={[0.002, 8, 8]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
          </group>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 4. BESPOKE CONTACT ASSETS: BRASS BUSINESS CARD STAND & NFC CARDS          */}
      {/* ========================================================================= */}
      <group position={[0.24, 0.78, 0.05]} rotation={[0, -0.25, 0]}>
        {/* Brass Business Card Holder */}
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.03, 0.05]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Angled Card Slot */}
        <mesh position={[0, 0.018, -0.005]}>
          <boxGeometry args={[0.115, 0.012, 0.01]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Stack of Matte Black Metal NFC Business Cards: MRWHITEHAT */}
        <group position={[0, 0.04, 0]} rotation={[-0.2, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.096, 0.056, 0.01]} />
            <meshStandardMaterial color="#0a0e14" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Gold Microchip & Call Contact Info Inset */}
          <mesh position={[-0.025, 0.005, 0.006]}>
            <planeGeometry args={[0.018, 0.015]} />
            <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0.015, 0.005, 0.006]}>
            <planeGeometry args={[0.048, 0.018]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
