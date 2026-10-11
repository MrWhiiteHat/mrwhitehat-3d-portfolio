import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playWhooshSound } from '../../utils/audio.js';
import {
  getPebbledLeatherTextures,
  getNeroMarbleTextures,
  getBrushedMetalTextures,
} from '../../utils/textures.js';
import { createTabletScreen } from '../../utils/cyberScreens.js';

export default function LoungeStation({ onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const lampLightRef = useRef();
  const tabletGlowRef = useRef();
  const plaqueGlowRef = useRef();

  // High-End Procedural PBR Textures
  const leatherCushions = useMemo(() => getPebbledLeatherTextures(2, 2, '#1a241e'), []);
  const leatherBase = useMemo(() => getPebbledLeatherTextures(3, 1, '#131a16'), []);
  const marbleTable = useMemo(() => getNeroMarbleTextures(1, 1), []);
  const brassMetal = useMemo(() => getBrushedMetalTextures(1, 2, '#ca8a04'), []);

  // Functional Biometric Security Tablet Screen
  const tabletScreen = useMemo(() => createTabletScreen(), []);
  const tabletTimer = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 0. Update Tablet Screen
    tabletTimer.current += delta;
    if (tabletTimer.current > 0.04) {
      tabletScreen.update(tabletTimer.current);
      tabletTimer.current = 0;
    }

    // Tablet pulse
    if (tabletGlowRef.current) {
      tabletGlowRef.current.intensity = 1.0 + Math.sin(time * 3) * 0.3;
    }

    // Wall Plaque Gold Rim Glow
    if (plaqueGlowRef.current) {
      plaqueGlowRef.current.intensity = (hovered ? 4.0 : 2.5) + Math.sin(time * 2.0) * 0.4;
    }
  });

  const toggleLamp = (e) => {
    e.stopPropagation();
    playClickSound(lampOn ? 450 : 650, 0.08);
    setLampOn(!lampOn);
  };

  return (
    <group position={[2.8, 0, 1.6]} name="LoungeStation">
      {/* 1. Luxury Executive Leather Couch (facing inward) */}
      <group position={[0, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
        {/* Base Cushion Platform */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.24, 0.82]} />
          <meshStandardMaterial {...leatherBase} roughness={0.55} metalness={0.12} />
        </mesh>

        {/* 3 Tufted Seat Cushions */}
        {[-0.6, 0, 0.6].map((x, i) => (
          <mesh key={`cushion-${i}`} position={[x, 0.38, 0.05]} castShadow>
            <boxGeometry args={[0.58, 0.14, 0.68]} />
            <meshStandardMaterial {...leatherCushions} roughness={0.46} metalness={0.12} />
          </mesh>
        ))}

        {/* Backrest Cushion */}
        <mesh position={[0, 0.62, -0.34]} rotation={[-0.12, 0, 0]} castShadow>
          <boxGeometry args={[1.96, 0.44, 0.2]} />
          <meshStandardMaterial {...leatherCushions} roughness={0.48} metalness={0.12} />
        </mesh>

        {/* Left & Right Armrests */}
        <mesh position={[-0.98, 0.48, 0]} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.8]} />
          <meshStandardMaterial {...leatherBase} roughness={0.55} />
        </mesh>
        <mesh position={[0.98, 0.48, 0]} castShadow>
          <boxGeometry args={[0.16, 0.36, 0.8]} />
          <meshStandardMaterial {...leatherBase} roughness={0.55} />
        </mesh>

        {/* Brushed Brass Tapered Legs */}
        {[
          [-0.92, 0.05, -0.34],
          [0.92, 0.05, -0.34],
          [-0.92, 0.05, 0.34],
          [0.92, 0.05, 0.34],
        ].map((pos, i) => (
          <mesh key={`couch-leg-${i}`} position={pos} castShadow>
            <cylinderGeometry args={[0.02, 0.015, 0.12, 12]} />
            <meshStandardMaterial {...brassMetal} metalness={0.88} roughness={0.25} />
          </mesh>
        ))}
      </group>

      {/* 2. Round Marble & Brass Coffee Table */}
      <group position={[-0.85, 0, -0.75]}>
        {/* Tabletop Marble Disc */}
        <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.04, 32]} />
          <meshStandardMaterial {...marbleTable} roughness={0.16} metalness={0.12} />
        </mesh>
        {/* Brass Rim */}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.505, 0.505, 0.038, 32]} />
          <meshStandardMaterial {...brassMetal} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Tripod Brass Legs */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
          <mesh
            key={`table-leg-${i}`}
            position={[Math.cos(angle) * 0.35, 0.18, Math.sin(angle) * 0.35]}
            rotation={[0, 0, 0.08]}
            castShadow
          >
            <cylinderGeometry args={[0.015, 0.015, 0.36, 12]} />
            <meshStandardMaterial {...brassMetal} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Digital Cyber Tablet on Table */}
        <group position={[0.05, 0.41, 0.05]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.15, 0.01]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Screen with dynamic scanning biometric clearance display */}
          <mesh position={[0, 0, 0.006]}>
            <planeGeometry args={[0.2, 0.13]} />
            <meshBasicMaterial map={tabletScreen.texture} toneMapped={false} />
          </mesh>
          <pointLight
            ref={tabletGlowRef}
            position={[0, 0, 0.06]}
            color="#38bdf8"
            intensity={1.8}
            distance={0.9}
          />
        </group>
      </group>

      {/* 3. Interactive Modern Arched Brass Floor Lamp */}
      <group
        position={[1.4, 0, 0.8]}
        onClick={toggleLamp}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Heavy Marble Base */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.06, 24]} />
          <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Tall Brass Stem */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 2.4, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Fluted Conical Lamp Shade */}
        <mesh position={[-0.2, 2.3, -0.2]} rotation={[0.4, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.12, 0.22, 0.24, 24, 1, true]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Light bulb */}
        <mesh position={[-0.2, 2.22, -0.2]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color={lampOn ? '#fbbf24' : '#453a25'} />
        </mesh>
        {/* Warm Ambient Lamp Light */}
        {lampOn && (
          <pointLight
            ref={lampLightRef}
            position={[-0.2, 2.15, -0.2]}
            color="#fbbf24"
            intensity={4.8}
            distance={4.0}
            castShadow
          />
        )}
      </group>

      {/* 4. Executive Wall Plaque (CLICKABLE HOTSPOT FOR ABOUT ME) */}
      <group
        position={[2.2, 2.2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          playWhooshSound();
          onSelect?.({ section: 'about', label: 'Office Lounge · About Me' });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          onHover?.('Office Lounge · About Me');
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
          onHover?.(null);
        }}
      >
        {/* Titanium & Brass Backing Plate */}
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.1, 0.04]} />
          <meshStandardMaterial color="#0f1511" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Gold Inset Frame */}
        <mesh position={[0, 0, 0.022]}>
          <boxGeometry args={[1.52, 1.02, 0.01]} />
          <meshStandardMaterial
            color={hovered ? '#fbbf24' : '#ca8a04'}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
        {/* Inner Emerald Plaque Plate */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.44, 0.94]} />
          <meshBasicMaterial color={hovered ? '#0e2418' : '#09140e'} />
        </mesh>
        {/* Plaque Sconce Accent Light */}
        <pointLight
          ref={plaqueGlowRef}
          position={[0, 0, 0.35]}
          color="#fbbf24"
          intensity={hovered ? 4.0 : 2.5}
          distance={2.0}
        />
      </group>
    </group>
  );
}
