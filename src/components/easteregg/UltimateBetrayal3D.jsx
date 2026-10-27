import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Award,
  ChevronRight,
  RotateCcw,
  Terminal,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  playRecordScratch,
  playSlipperWhoosh,
  playMomGong,
  playDhaniyaFanfare,
  playCorporateClick,
  playSadPunchline,
} from './easterEggAudio.js';
import { playClickSound } from '../../utils/audio.js';



/**
 * MASTER COMPONENT: SecretVaultRoom3D
 * The Standalone Dedicated 360° Underground Bunker Environment
 */
export default function SecretVaultRoom3D({
  isOpen = true,
  betrayalPhase,
  isLaptopZoomed,
  onToggleLaptopZoom,
  onPhaseChange,
  onInteractTerminal,
  onReturnToPortfolio,
  onRestartEasterEgg,
}) {
  const [isChappalLaunched, setIsChappalLaunched] = useState(false);

  return (
    <group position={[0, 0, 0]} name="SecretVaultRoom3D">
      {/* 1. Standalone 360° Bunker Room Architecture & Lighting */}
      <BunkerRoomArchitecture3D isOpen={isOpen} />

      {/* 2. Atmospheric Cyber Dust Motes Floating in Bunker */}
      <BunkerAtmosphericDust3D count={25} />

      {/* 3. The Ridiculous Discovery Desk Cluster (Centered at [0, 0, 0]) */}
      <group position={[0, 0, 0]}>
        {/* Melamine Folding Table */}
        <mesh position={[0, 0.70, 0]}>
          <boxGeometry args={[1.35, 0.04, 0.7]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
        </mesh>
        {/* Metal Tubular Legs */}
        {[-0.6, 0.6].map((lx) =>
          [-0.28, 0.28].map((lz) => (
            <mesh key={`leg-${lx}-${lz}`} position={[lx, 0.35, lz]}>
              <cylinderGeometry args={[0.016, 0.016, 0.7, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
          ))
        )}

        {/* First-Person Seated Ergonomic Office Chair */}
        {/* Player eye camera is positioned directly above seat at [0, 1.10, 0.52] */}
        <group position={[0, 0, 0.52]}>
          {/* Hydraulic Gas Lift & Base */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.44, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* 5-Star Caster Spider Base on Floor */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i * Math.PI * 2) / 5;
            return (
              <mesh
                key={`caster-leg-${i}`}
                position={[Math.sin(angle) * 0.22, 0.035, Math.cos(angle) * 0.22]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.035, 0.02, 0.24]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
            );
          })}

          {/* Ergonomic Blue Padded Seat Cushion (Under the seated player) */}
          <mesh position={[0, 0.47, 0]}>
            <boxGeometry args={[0.50, 0.08, 0.48]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
          </mesh>

          {/* Left Armrest (Framing the player's lower-left peripheral view) */}
          <group position={[-0.28, 0.66, -0.02]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.30, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.075, 0.032, 0.26]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
          </group>

          {/* Right Armrest (Framing the player's lower-right peripheral view) */}
          <group position={[0.28, 0.66, -0.02]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.30, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.075, 0.032, 0.26]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
          </group>

          {/* Chair Backrest (Positioned BEHIND the seated camera at z = 0.26 relative to chair, i.e. world z = 0.78) */}
          <mesh position={[0, 0.88, 0.26]}>
            <boxGeometry args={[0.44, 0.54, 0.045]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
          </mesh>
        </group>

        {/* Unfolded Laundry Pile on Side Stool (Sitting beside the desk on the left) */}
        <group position={[-0.85, 0, 0.22]}>
          <mesh position={[0, 0.20, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.40, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Clothes Pile (Red, Yellow, Sky Blue) */}
          <mesh position={[-0.03, 0.46, 0.02]} rotation={[0.1, 0.3, -0.1]}>
            <boxGeometry args={[0.32, 0.14, 0.28]} />
            <meshStandardMaterial color="#ef4444" roughness={0.9} />
          </mesh>
          <mesh position={[0.04, 0.53, -0.02]} rotation={[-0.2, 0.4, 0.15]}>
            <boxGeometry args={[0.26, 0.12, 0.24]} />
            <meshStandardMaterial color="#eab308" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.59, 0.03]} rotation={[0.05, -0.2, 0.1]}>
            <boxGeometry args={[0.20, 0.10, 0.20]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.9} />
          </mesh>
        </group>

        {/* 3D Laptop */}
        <HackerLaptop3D
          onInteractTerminal={onInteractTerminal}
          isInteractive={betrayalPhase === 'TERMINAL_INTERACTIVE'}
          betrayalPhase={betrayalPhase}
          isLaptopZoomed={isLaptopZoomed}
          onToggleLaptopZoom={onToggleLaptopZoom}
          onPhaseChange={onPhaseChange}
          onReturnToPortfolio={onReturnToPortfolio}
          onRestartEasterEgg={onRestartEasterEgg}
          onTriggerChappalFlight={() => setIsChappalLaunched(true)}
        />

        {/* 3D Steaming Maggi Ramen Bowl */}
        <SteamingMaggiBowl3D />

        {/* 3D Holy Bunch of Dhaniya, Mirchi & ₹10 Coin */}
        <DhaniyaBundle3D />

        {/* 3D Holographic Projector Pedestal */}
        <HolographicProjectorPedestal3D />

        {/* 3D Tactical Flying Indian Chappal (Hawai Slipper) */}
        <TacticalChappal3D
          isLaunched={isChappalLaunched}
          onHit={() => {}}
        />
      </group>
    </group>
  );
}
