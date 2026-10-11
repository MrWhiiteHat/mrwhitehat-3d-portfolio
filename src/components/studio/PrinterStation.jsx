import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playHackingBeep, playWhooshSound } from '../../utils/audio.js';

export default function PrinterStation({ onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const [paperOffset, setPaperOffset] = useState(0);
  const paperRef = useRef();
  const ledRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Status LED pulse
    if (ledRef.current) {
      ledRef.current.intensity = (hovered ? 3.0 : 1.5) + Math.sin(time * 4) * 0.4;
    }

    // 2. Paper slide animation
    if (paperRef.current) {
      const targetY = 0.21 + (hovered ? 0.05 : 0) + paperOffset;
      paperRef.current.position.y = THREE.MathUtils.lerp(
        paperRef.current.position.y,
        targetY,
        0.1
      );
    }
  });

  const handlePrintTest = (e) => {
    e.stopPropagation();
    playHackingBeep(520);
    setPaperOffset((prev) => (prev > 0.06 ? 0 : prev + 0.04));
  };

  return (
    <group position={[-3.6, 0, 0.8]} name="PrinterStation">
      {/* 1. Dedicated Credenza / Storage Cabinet */}
      <group position={[0, 0.42, 0]}>
        {/* Main Cabinet Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.84, 0.65]} />
          <meshStandardMaterial color="#1a1410" roughness={0.4} metalness={0.15} />
        </mesh>
        {/* Dual Cabinet Doors with Brass Gap Line */}
        <mesh position={[0, 0, 0.33]}>
          <boxGeometry args={[1.16, 0.78, 0.02]} />
          <meshStandardMaterial color="#241a14" roughness={0.5} />
        </mesh>
        {/* Modern Brass Pull Handles */}
        <mesh position={[-0.08, 0.05, 0.35]}>
          <boxGeometry args={[0.02, 0.14, 0.02]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.08, 0.05, 0.35]}>
          <boxGeometry args={[0.02, 0.14, 0.02]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Metal Legs */}
        {[
          [-0.52, -0.45, -0.26],
          [0.52, -0.45, -0.26],
          [-0.52, -0.45, 0.26],
          [0.52, -0.45, 0.26],
        ].map((pos, i) => (
          <mesh key={`cred-leg-${i}`} position={pos} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.12, 12]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* 2. High-Tech Laser Printer (CLICKABLE HOTSPOT FOR RESUME) */}
      <group
        position={[0, 0.88, 0]}
        onClick={(e) => {
          e.stopPropagation();
          playWhooshSound();
          onSelect?.({ section: 'resume', label: 'Printer Station · Resume' });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          onHover?.('Printer Station · Resume');
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
          onHover?.(null);
        }}
      >
        {/* Lower Main Chassis */}
        <mesh position={[0, 0.14, 0]} castShadow>
          <boxGeometry args={[0.62, 0.28, 0.48]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.25} metalness={0.1} />
        </mesh>

        {/* Charcoal Upper Scanner Lid & Feeder */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.6, 0.06, 0.46]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Control Screen LCD Panel */}
        <mesh position={[-0.18, 0.25, 0.245]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.16, 0.09, 0.02]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Glowing Green Status LED */}
        <mesh position={[0.2, 0.25, 0.245]}>
          <sphereGeometry args={[0.014, 12, 12]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <pointLight
          ref={ledRef}
          position={[0.2, 0.25, 0.28]}
          color="#10b981"
          intensity={1.5}
          distance={0.8}
        />

        {/* Paper Output Slot Tray */}
        <mesh position={[0, 0.16, 0.22]} rotation={[-0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.34, 0.015, 0.24]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
        </mesh>

        {/* Printed A4 Document emerging from slot - with interactive slide */}
        <mesh
          ref={paperRef}
          position={[0, 0.21, 0.28]}
          rotation={[-Math.PI / 3.4, 0, 0]}
          castShadow
          onClick={handlePrintTest}
        >
          <planeGeometry args={[0.28, 0.36]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>

        {/* Side Stack of Fresh Printing Paper */}
        <mesh position={[0.42, 0.05, 0]} castShadow>
          <boxGeometry args={[0.22, 0.1, 0.3]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
