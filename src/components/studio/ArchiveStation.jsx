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
