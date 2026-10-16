import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playWhooshSound } from '../../utils/audio.js';
import {
  getPebbledLeatherTextures,
  getNeroMarbleTextures,
  getBrushedMetalTextures,
} from '../../utils/textures.js';
import { createTabletScreen, createAboutDossierScreen } from '../../utils/cyberScreens.js';
import mrWhiteHatImg from '../../assets/mrwhitehat-hologram.jpg';

export default function LoungeStation({ onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const plaqueGlowRef = useRef();
  const cipherRingRef = useRef();

  // High-End Procedural PBR Textures
  const leatherCushions = useMemo(() => getPebbledLeatherTextures(2, 2, '#1a241e'), []);
  const leatherBase = useMemo(() => getPebbledLeatherTextures(3, 1, '#131a16'), []);
  const marbleTable = useMemo(() => getNeroMarbleTextures(1, 1), []);
  const brassMetal = useMemo(() => getBrushedMetalTextures(1, 2, '#ca8a04'), []);

  // Functional Biometric Security Tablet Screen & Executive Dossier Plaque Screen
  const tabletScreen = useMemo(() => createTabletScreen(), []);
  const tabletTimer = useRef(0);
  const dossierScreen = useMemo(() => createAboutDossierScreen(mrWhiteHatImg), []);

  const toggleLamp = (e) => {
    e?.stopPropagation?.();
    playClickSound(lampOn ? 450 : 650, 0.08);
    setLampOn((prev) => !prev);
  };

  useEffect(() => {
    window.__TOGGLE_FLOOR_LAMP__ = toggleLamp;
    window.__FLOOR_LAMP_STATE__ = lampOn;
    return () => {
      delete window.__TOGGLE_FLOOR_LAMP__;
      delete window.__FLOOR_LAMP_STATE__;
    };
  }, [lampOn]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 0. Update Tablet Screen (Paced to 6 FPS for optimal GPU performance)
    tabletTimer.current += delta;
    if (tabletTimer.current > 0.16) {
      tabletScreen.update(tabletTimer.current);
      tabletTimer.current = 0;
    }

    // 1. Silky smooth 60fps 3D Cipher Rings (rotates on GPU with ZERO canvas overhead)
    if (cipherRingRef.current) {
      cipherRingRef.current.children[0].rotation.z += delta * 1.6;
      cipherRingRef.current.children[1].rotation.z -= delta * 2.4;
    }

    // Wall Plaque Gold Rim Glow
    if (plaqueGlowRef.current) {
      plaqueGlowRef.current.intensity = (hovered ? 4.0 : 2.5) + Math.sin(time * 2.0) * 0.4;
    }
  });

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
        {/* Warm Ambient Lamp Light (dimmed rather than unmounted so the scene's light count never changes) */}
        <pointLight
          position={[-0.2, 2.15, -0.2]}
          color="#fbbf24"
          intensity={lampOn ? 4.8 : 0}
          distance={4.0}
        />
      </group>

      {/* 4. Executive Cyber Security Dossier Plaque (ABOUT ME HOTSPOT) */}
      {/* Positioned at X = 2.05 in LoungeStation coords (world X = 4.85), clearly in front of walnut slats (X = 4.94) */}
      <group
        position={[2.05, 2.15, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          playWhooshSound();
          onSelect?.({ section: 'about', label: 'Executive Lounge · About Me' });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          onHover?.('Executive Lounge · About Me Dossier');
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
          onHover?.(null);
        }}
      >
        {/* 4 Brushed Gold Architectural Standoff Wall Mounts (Anchored into walnut slats behind) */}
        {[
          [-0.72, 0.52],
          [0.72, 0.52],
          [-0.72, -0.52],
          [0.72, -0.52],
        ].map(([sx, sy], idx) => (
          <mesh key={`standoff-${idx}`} position={[sx, sy, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.12, 16]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.92} roughness={0.2} />
          </mesh>
        ))}

        {/* Heavy Aerospace Titanium Chassis Frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.62, 1.12, 0.04]} />
          <meshStandardMaterial
            color={hovered ? '#141e17' : '#0b120d'}
            roughness={0.25}
            metalness={0.85}
          />
        </mesh>

        {/* Beveled Gold Outer Accent Trim Rim */}
        <mesh position={[0, 0, 0.021]}>
          <boxGeometry args={[1.56, 1.06, 0.01]} />
          <meshStandardMaterial
            color={hovered ? '#f59e0b' : '#b45309'}
            metalness={0.94}
            roughness={0.15}
          />
        </mesh>

        {/* Dark Emerald Inset Bezel */}
        <mesh position={[0, 0, 0.026]}>
          <boxGeometry args={[1.52, 1.02, 0.005]} />
          <meshBasicMaterial color="#020d06" />
        </mesh>

        {/* Functional High-Res Cyber Security Operative Dossier Screen Face */}
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.48, 0.98]} />
          <meshBasicMaterial map={dossierScreen.texture} toneMapped={false} />
        </mesh>

        {/* 3D Cryptographic Hologram Cipher Rings (Zero canvas cost, pure GPU 60fps rotation) */}
        <group ref={cipherRingRef} position={[0.61, 0.38, 0.033]}>
          <mesh>
            <ringGeometry args={[0.038, 0.044, 24, 1, 0, Math.PI * 1.45]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.026, 0.031, 20, 1, 0, Math.PI * 1.65]} />
            <meshBasicMaterial color="#fbbf24" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.001]}>
            <circleGeometry args={[0.006, 12]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>

        {/* Top Overhead Linear Architectural Sconce Fixture */}
        <group position={[0, 0.62, 0.06]}>
          {/* Brass Mounting Arm */}
          <mesh position={[0, -0.02, -0.04]}>
            <boxGeometry args={[0.04, 0.02, 0.08]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.9} />
          </mesh>
          {/* Horizontal Sconce Bar */}
          <mesh castShadow>
            <boxGeometry args={[1.35, 0.03, 0.04]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Downward Warm LED Diffuser Lens */}
          <mesh position={[0, -0.016, 0]}>
            <boxGeometry args={[1.3, 0.005, 0.03]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        </group>

        {/* Bottom Biometric Clearance Touch Sensor Pad */}
        <group position={[0, -0.52, 0.032]}>
          <mesh>
            <boxGeometry args={[0.26, 0.035, 0.008]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>
          {/* Glowing Fingerprint Contact Line */}
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[0.22, 0.008, 0.002]} />
            <meshBasicMaterial color={hovered ? '#22c55e' : '#38bdf8'} />
          </mesh>
        </group>

        {/* Warm Ambient Plaque Sconce Wash Light */}
        <pointLight
          ref={plaqueGlowRef}
          position={[0, 0.35, 0.45]}
          color="#fbbf24"
          intensity={hovered ? 5.0 : 3.2}
          distance={2.8}
          decay={2}
        />
      </group>
    </group>
  );
}
