import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playWhooshSound } from '../../utils/audio.js';
import {
  getWalnutWoodTextures,
  getBrushedMetalTextures,
} from '../../utils/textures.js';

export default function ArchiveStation({ onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const [pulledBook, setPulledBook] = useState(false);
  const pulledBookRef = useRef();
  const led1Ref = useRef();
  const led2Ref = useRef();
  const led3Ref = useRef();

  // High-End Procedural PBR Textures
  const shelfWood = useMemo(() => getWalnutWoodTextures(3, 1), []);
  const uprightMetal = useMemo(() => getBrushedMetalTextures(1, 4, '#0f172a'), []);

  // Generate procedural book stacks for the shelves
  const bookShelves = useMemo(() => {
    const bookColors = ['#1d4ed8', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0284c7', '#334155'];
    const shelves = [];
    const heights = [0.6, 1.25, 1.9, 2.55];
    heights.forEach((y, shelfIdx) => {
      const items = [];
      let xCursor = -0.95;
      while (xCursor < 0.95) {
        const isBinder = (shelfIdx + xCursor) % 0.4 < 0.1;
        const width = isBinder ? 0.08 : 0.04 + Math.random() * 0.03;
        const height = isBinder ? 0.38 : 0.28 + Math.random() * 0.1;
        const depth = 0.32;
        const color = isBinder ? '#f8fafc' : bookColors[Math.floor(Math.random() * bookColors.length)];
        items.push({ x: xCursor + width / 2, y: y + height / 2, w: width, h: height, d: depth, color });
        xCursor += width + 0.015;
      }
      shelves.push(items);
    });
    return shelves;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Blinking Sentinel LEDs (Packet Telemetry simulation)
    if (led1Ref.current) {
      led1Ref.current.visible = Math.sin(time * 12) > -0.2;
    }
    if (led2Ref.current) {
      led2Ref.current.visible = Math.cos(time * 18) > 0.1;
    }
    if (led3Ref.current) {
      led3Ref.current.visible = Math.sin(time * 24 + 1.2) > -0.4;
    }

    // 2. Interactive Pulled Book Smooth Motion
    if (pulledBookRef.current) {
      const targetZ = pulledBook ? 0.09 : 0;
      pulledBookRef.current.position.z = THREE.MathUtils.lerp(
        pulledBookRef.current.position.z,
        targetZ,
        0.15
      );
    }
  });

  return (
    <group position={[0.6, 0, -4.75]} name="ArchiveStation">
      {/* 1. Tall 5-Tier Industrial Bookcase (CLICKABLE HOTSPOT FOR SKILLS) */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          playWhooshSound();
          onSelect?.({ section: 'skills', label: 'Bookshelf & Archives · Skills' });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          onHover?.('Bookshelf & Archives · Skills');
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
          onHover?.(null);
        }}
      >
        {/* Bookcase Vertical Side Uprights (Steel Frames) */}
        <mesh position={[-1.15, 1.75, 0]} castShadow>
          <boxGeometry args={[0.06, 3.5, 0.48]} />
          <meshStandardMaterial {...uprightMetal} metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[1.15, 1.75, 0]} castShadow>
          <boxGeometry args={[0.06, 3.5, 0.48]} />
          <meshStandardMaterial {...uprightMetal} metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Back Panel */}
        <mesh position={[0, 1.75, -0.22]} receiveShadow>
          <boxGeometry args={[2.34, 3.5, 0.02]} />
          <meshStandardMaterial {...shelfWood} roughness={0.65} metalness={0.05} />
        </mesh>

        {/* 5 Horizontal Solid Oak Shelves */}
        {[0.08, 0.6, 1.25, 1.9, 2.55, 3.3].map((y, i) => (
          <group key={`shelf-${i}`} position={[0, y, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.36, 0.05, 0.46]} />
              <meshStandardMaterial {...shelfWood} roughness={0.36} metalness={0.1} />
            </mesh>
            {/* Shelf Under-Glow Warm LED Strip */}
            <pointLight
              position={[0, -0.08, 0.1]}
              color="#34d399"
              intensity={hovered ? 1.4 : 0.8}
              distance={1.4}
            />
          </group>
        ))}

        {/* Procedural 3D Tech Books and Cyber Binders */}
        {bookShelves.map((shelf, sIdx) => (
          <group key={`shelf-books-${sIdx}`}>
            {shelf.map((b, bIdx) => (
              <mesh key={`book-${sIdx}-${bIdx}`} position={[b.x, b.y, 0]} castShadow>
                <boxGeometry args={[b.w, b.h, b.d]} />
                <meshStandardMaterial color={b.color} roughness={0.4} />
              </mesh>
            ))}
          </group>
        ))}

        {/* ========================================================================= */}
        {/* BESPOKE SKILLS 3D ASSETS: 4 CLASSIFIED CYBER DATABANK CARTRIDGES         */}
        {/* Represents: 4 Skill Tiers from the Skills Dossier                         */}
        {/* ========================================================================= */}
        <group position={[0, 2.06, 0]}>
          {[
            { x: -0.75, color: '#ef4444', label: '01_REVERSE_ENG', title: 'Binary & Assembly' },
            { x: -0.25, color: '#38bdf8', label: '02_WEB_CLOUD', title: 'OWASP & Cloud' },
            { x: 0.25, color: '#22c55e', label: '03_NET_RECON', title: 'Packet & RF' },
            { x: 0.75, color: '#a855f7', label: '04_AI_CRYPTO', title: 'ZeroKnowledge & AI' },
          ].map((cart, cIdx) => (
            <group key={`databank-cart-${cIdx}`} position={[cart.x, 0, 0]}>
              {/* Heavy Anodized Brushed Titanium Cartridge Chassis */}
              <mesh castShadow>
                <boxGeometry args={[0.28, 0.24, 0.36]} />
                <meshStandardMaterial color="#0b1016" roughness={0.3} metalness={0.85} />
              </mesh>
              {/* Front Beveled Faceplate */}
              <mesh position={[0, 0, 0.182]}>
                <boxGeometry args={[0.26, 0.22, 0.005]} />
                <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
              </mesh>
              {/* Categorical Glowing LED Identification Light Bar */}
              <mesh position={[0, 0.08, 0.186]}>
                <boxGeometry args={[0.22, 0.015, 0.006]} />
                <meshBasicMaterial color={cart.color} />
              </mesh>
              <pointLight position={[0, 0.08, 0.22]} color={cart.color} intensity={0.7} distance={0.6} />
              {/* Cooling Heatsink Vents on Top */}
              {[-0.08, -0.04, 0, 0.04, 0.08].map((vx, i) => (
                <mesh key={`vent-${i}`} position={[vx, 0.122, 0]}>
                  <boxGeometry args={[0.015, 0.004, 0.28]} />
                  <meshStandardMaterial color="#020617" roughness={0.9} />
                </mesh>
              ))}
              {/* Front Extraction Handle */}
              <mesh position={[0, -0.06, 0.195]}>
                <boxGeometry args={[0.12, 0.02, 0.02]} />
                <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Classified Stencil Label Inset */}
              <mesh position={[0, 0.01, 0.186]}>
                <planeGeometry args={[0.2, 0.05]} />
                <meshBasicMaterial color="#020617" />
              </mesh>
            </group>
          ))}
        </group>

        {/* ========================================================================= */}
        {/* BESPOKE SKILLS 3D ASSETS: HARDCOVER CYBERSECURITY FIELD MANUALS (Tier 1-4)*/}
        {/* ========================================================================= */}
        <group position={[0.55, 1.45, 0]}>
          {[
            { offset: -0.16, width: 0.065, color: '#1c1917', gold: '#d4af37', label: 'SHELLCODERS' },
            { offset: -0.08, width: 0.075, color: '#0f172a', gold: '#38bdf8', label: 'MALWARE_ANALYSIS' },
            { offset: 0.01, width: 0.08, color: '#142a1f', gold: '#4ade80', label: 'BLACK_HAT_PYTHON' },
            { offset: 0.11, width: 0.07, color: '#261230', gold: '#c084fc', label: 'CRYPTOGRAPHY_APPLIED' },
          ].map((bk, bIdx) => (
            <group key={`manual-${bIdx}`} position={[bk.offset, 0, 0]}>
              {/* Hardcover Book Spine */}
              <mesh castShadow>
                <boxGeometry args={[bk.width, 0.38, 0.35]} />
                <meshStandardMaterial color={bk.color} roughness={0.35} metalness={0.15} />
              </mesh>
              {/* Embossed Metallic Gold Spine Title Plate */}
              <mesh position={[0, 0, 0.176]}>
                <planeGeometry args={[bk.width * 0.8, 0.32]} />
                <meshStandardMaterial color={bk.gold} metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Spine Text Simulation Ribs */}
              {[-0.1, -0.05, 0, 0.05, 0.1].map((ry, rIdx) => (
                <mesh key={`rib-${rIdx}`} position={[0, ry, 0.177]}>
                  <boxGeometry args={[bk.width * 0.6, 0.008, 0.002]} />
                  <meshBasicMaterial color="#020617" />
                </mesh>
              ))}
            </group>
          ))}
        </group>

        {/* ========================================================================= */}
        {/* BESPOKE SKILLS 3D ASSET: MILITARY-GRADE HARDWARE KEYPAD USB CRYPTO DRIVE   */}
        {/* ========================================================================= */}
        <group position={[-0.75, 0.78, 0.1]} rotation={[0, 0.35, 0]}>
          {/* IronKey Style Anodized Blue Metal Casing */}
          <mesh castShadow>
            <boxGeometry args={[0.09, 0.02, 0.045]} />
            <meshStandardMaterial color="#0369a1" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* 10-Key PIN Keypad */}
          <mesh position={[-0.01, 0.011, 0]}>
            <planeGeometry args={[0.055, 0.035]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Hardware Lock/Unlock LEDs */}
          <mesh position={[0.03, 0.012, -0.01]}>
            <sphereGeometry args={[0.0025, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0.03, 0.012, 0.01]}>
            <sphereGeometry args={[0.0025, 8, 8]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>

        {/* Interactive Feature: "Cyber Security Dossier" pulled book on shelf level 2 */}
        <group
          ref={pulledBookRef}
          position={[-0.2, 1.45, 0]}
          onClick={(e) => {
            e.stopPropagation();
            playClickSound(1100, 0.05);
            setPulledBook(!pulledBook);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setPulledBook(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setPulledBook(false);
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.07, 0.36, 0.34]} />
            <meshStandardMaterial color="#4ade80" metalness={0.2} roughness={0.3} />
          </mesh>
          {/* Gold spine title plate */}
          <mesh position={[0, 0, 0.172]}>
            <planeGeometry args={[0.05, 0.3]} />
            <meshBasicMaterial color="#eab308" />
          </mesh>
        </group>

        {/* Top Shelf Hardware Sentinel Boxes with Blinking Packet LEDs */}
        <group position={[-0.6, 3.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.35, 0.18, 0.28]} />
            <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.5} />
          </mesh>
          {/* Blinking LEDs */}
          <mesh ref={led1Ref} position={[-0.1, 0.04, 0.142]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          <mesh ref={led2Ref} position={[0, 0.04, 0.142]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh ref={led3Ref} position={[0.1, 0.04, 0.142]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" />
          </mesh>
        </group>

        <mesh position={[0.5, 3.45, 0]} castShadow>
          <boxGeometry args={[0.28, 0.2, 0.26]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
