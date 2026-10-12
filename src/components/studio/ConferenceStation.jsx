import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playBreachFanfare, playClickSound, playWhooshSound } from '../../utils/audio.js';
import {
  getWalnutWoodTextures,
  getPebbledLeatherTextures,
  getBrushedMetalTextures,
} from '../../utils/textures.js';
import { createProjectorScreen } from '../../utils/cyberScreens.js';

export default function ConferenceStation({ onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const trophyGoldRef = useRef();
  const trophyBricsGroupRef = useRef();
  const trophyBronzeRef = useRef();
  const trophySpinVel = useRef({ gold: 0, brics: 0, bronze: 0 });
  const bricsRingRef = useRef();
  const bricsStarRef = useRef();
  const beamRef = useRef();

  // High-End Procedural PBR Textures
  const walnutCredenza = useMemo(() => getWalnutWoodTextures(3, 1), []);
  const walnutTable = useMemo(() => getWalnutWoodTextures(2, 2), []);
  const chairLeather = useMemo(() => getPebbledLeatherTextures(2, 2, '#141f17'), []);
  const darkMetal = useMemo(() => getBrushedMetalTextures(1, 2, '#181818'), []);

  // Live Animated Global Cyber Attack Map Screen (throttled to 10 FPS)
  const projectorScreen = useMemo(() => createProjectorScreen(), []);
  const screenTimer = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 0. Update Projector Screen (Throttled to 10 FPS for optimal GPU pacing)
    screenTimer.current += delta;
    if (screenTimer.current > 0.1) {
      projectorScreen.update(screenTimer.current);
      screenTimer.current = 0;
    }

    // 1. Holographic Ring Spin on BRICS Trophy
    if (bricsRingRef.current) {
      bricsRingRef.current.rotation.y += delta * 1.8;
      bricsRingRef.current.rotation.x += delta * 0.9;
    }

    // 2. Floating Star Bob
    if (bricsStarRef.current) {
      bricsStarRef.current.position.y = 0.14 + Math.sin(time * 2.2) * 0.02;
      bricsStarRef.current.rotation.y += delta * 0.4;
    }

    // 3. Projector Beam Intensity Pulse
    if (beamRef.current) {
      beamRef.current.intensity = (hovered ? 5.5 : 4.0) + Math.sin(time * 2.8) * 0.5;
    }

    // 4. Smooth physics spin for trophies without React re-renders
    if (trophyGoldRef.current && trophySpinVel.current.gold > 0.01) {
      trophyGoldRef.current.rotation.y += trophySpinVel.current.gold * delta;
      trophySpinVel.current.gold *= Math.max(0, 1 - delta * 3.5);
    }
    if (trophyBricsGroupRef.current && trophySpinVel.current.brics > 0.01) {
      trophyBricsGroupRef.current.rotation.y += trophySpinVel.current.brics * delta;
      trophySpinVel.current.brics *= Math.max(0, 1 - delta * 3.5);
    }
    if (trophyBronzeRef.current && trophySpinVel.current.bronze > 0.01) {
      trophyBronzeRef.current.rotation.y += trophySpinVel.current.bronze * delta;
      trophySpinVel.current.bronze *= Math.max(0, 1 - delta * 3.5);
    }
  });

  const handleTrophyClick = (type) => (e) => {
    e.stopPropagation();
    playClickSound(1200, 0.08);
    trophySpinVel.current[type] += 12;
  };

  return (
    <group position={[-4.88, 0, -2.0]} name="ConferenceStation">
      {/* 1. Large Motorized Presentation Projector Screen (Left Wall, facing +X) */}
      <group
        position={[0, 2.15, 0]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          playWhooshSound();
          onSelect?.({ section: 'achievements', label: 'Presentation Area · Achievements' });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          onHover?.('Presentation Area · Achievements');
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
          onHover?.(null);
        }}
      >
        {/* Top Motorized Metal Housing Roll */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[3.2, 0.1, 0.12]} />
          <meshStandardMaterial {...darkMetal} roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Outer Matte Black Border Frame */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[3.08, 1.98, 0.04]} />
          <meshStandardMaterial color="#070b09" roughness={0.6} />
        </mesh>

        {/* Live Functional Global Threat Intelligence Screen */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[2.96, 1.86]} />
          <meshBasicMaterial map={projectorScreen.texture} toneMapped={false} />
        </mesh>

        {/* Ambient Projector Beam Glow */}
        <pointLight
          ref={beamRef}
          position={[0, 0, 0.5]}
          color="#38bdf8"
          intensity={hovered ? 5.0 : 3.5}
          distance={3.2}
        />
      </group>

      {/* 2. Floating Media Credenza with 3D Trophies & Awards below screen */}
      <group position={[0.25, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Media Credenza Console */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.45, 0.45]} />
          <meshStandardMaterial {...walnutCredenza} roughness={0.38} metalness={0.12} />
        </mesh>
        {/* Credenza Fluted Wood Slats Accent */}
        <mesh position={[0, 0, 0.23]}>
          <boxGeometry args={[2.74, 0.38, 0.02]} />
          <meshStandardMaterial {...walnutCredenza} roughness={0.45} />
        </mesh>

        {/* Award Trophy 1: Gold Cyber Cup (Odisha Skills 2021) */}
        <group
          ref={trophyGoldRef}
          position={[-0.8, 0.32, 0]}
          onClick={handleTrophyClick('gold')}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Marble Base */}
          <mesh castShadow>
            <boxGeometry args={[0.14, 0.08, 0.14]} />
            <meshStandardMaterial color="#1f2937" roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Gold Cup Stem & Bowl */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.03, 0.14, 16]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Subtle Trophy Light */}
          <pointLight position={[0, 0.15, 0.08]} color="#eab308" intensity={1.2} distance={0.8} />
        </group>

        {/* Award Trophy 2: Crystal Diamond Star (BRICS Hi-Tech 2026) */}
        <group
          ref={trophyBricsGroupRef}
          position={[0, 0.34, 0]}
          onClick={handleTrophyClick('brics')}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.08, 16]} />
            <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Floating Octahedron Star */}
          <mesh ref={bricsStarRef} position={[0, 0.14, 0]} castShadow>
            <octahedronGeometry args={[0.09, 0]} />
            <meshStandardMaterial
              color="#38bdf8"
              roughness={0.15}
              metalness={0.2}
              transparent
              opacity={0.75}
              emissive="#38bdf8"
              emissiveIntensity={0.6}
            />
          </mesh>
          {/* Spinning Holographic Halo Ring */}
          <group ref={bricsRingRef} position={[0, 0.14, 0]}>
            <mesh>
              <torusGeometry args={[0.13, 0.006, 8, 24]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
            </mesh>
          </group>
        </group>

        {/* Award Trophy 3: Bronze Medal Plaque (Odisha Skills 2025-2026) */}
        <group
          ref={trophyBronzeRef}
          position={[0.8, 0.32, 0]}
          onClick={handleTrophyClick('bronze')}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.14, 0.08, 0.14]} />
            <meshStandardMaterial color="#1f2937" roughness={0.2} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.09, 0]} rotation={[0.2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.065, 0.02, 16]} />
            <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      </group>

      {/* 3. Modern Conference Table & Meeting Chairs */}
      <group position={[1.8, 0, 0]}>
        {/* Conference Oval Meeting Table */}
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.06, 32]} />
          <meshStandardMaterial {...walnutTable} roughness={0.32} metalness={0.12} />
        </mesh>
        {/* Center Pedestal Base */}
        <mesh position={[0, 0.34, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.32, 0.68, 24]} />
          <meshStandardMaterial {...darkMetal} metalness={0.88} roughness={0.25} />
        </mesh>

        {/* Swivel Conference Chairs around table */}
        {[-0.95, 0.95].map((xOffset, i) => (
          <group
            key={`conf-chair-${i}`}
            position={[xOffset, 0, 0]}
            rotation={[0, i === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
          >
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[0.42, 0.08, 0.42]} />
              <meshStandardMaterial {...chairLeather} roughness={0.5} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.7, -0.18]} castShadow>
              <boxGeometry args={[0.4, 0.5, 0.05]} />
              <meshStandardMaterial {...chairLeather} roughness={0.5} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.03, 0.22, 0.4, 4]} />
              <meshStandardMaterial {...darkMetal} metalness={0.88} roughness={0.25} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
