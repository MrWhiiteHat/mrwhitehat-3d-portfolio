import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playHackingBeep } from '../../utils/audio.js';

/**
 * High-Detail Cyber Security & Hardware Hacking Gadgets
 * Includes Flipper Zero, Hak5 Wi-Fi Pineapple, Raspberry Pi 5 Lab, and Hardware Tokens.
 */
export default function HackerDeskGadgets() {
  const [flipperActive, setFlipperActive] = useState(false);
  const pineappleLed1Ref = useRef();
  const pineappleLed2Ref = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Wi-Fi Pineapple Packet Activity LEDs
    if (pineappleLed1Ref.current) {
      pineappleLed1Ref.current.visible = Math.sin(time * 16) > 0;
    }
    if (pineappleLed2Ref.current) {
      pineappleLed2Ref.current.visible = Math.cos(time * 22) > -0.2;
    }
  });

  const handleFlipperClick = (e) => {
    e.stopPropagation();
    playHackingBeep(1600);
    setFlipperActive((prev) => !prev);
  };

  return (
    <group position={[0, 0.785, 0.15]} name="HackerDeskGadgets">
      {/* ========================================================================= */}
      {/* 1. FLIPPER ZERO MULTI-TOOL (Right side of desk mat)                       */}
      {/* ========================================================================= */}
      <group
        position={[0.55, 0.015, -0.12]}
        rotation={[0, -0.25, 0]}
        onClick={handleFlipperClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Main White Body Shell */}
        <mesh castShadow>
          <boxGeometry args={[0.07, 0.024, 0.14]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Orange Accent Front Bezel Frame */}
        <mesh position={[0, 0.0125, -0.01]}>
          <boxGeometry args={[0.062, 0.002, 0.11]} />
          <meshStandardMaterial color="#f97316" roughness={0.35} />
        </mesh>

        {/* Orange Backlit LCD Screen */}
        <mesh position={[-0.005, 0.014, -0.02]}>
          <planeGeometry args={[0.046, 0.052]} />
          <meshBasicMaterial color={flipperActive ? '#ff8c00' : '#ea580c'} />
        </mesh>

        {/* Flipper Dolphin Silhouette on LCD Screen */}
        <mesh position={[-0.005, 0.0145, -0.02]}>
          <boxGeometry args={[0.028, 0.001, 0.024]} />
          <meshBasicMaterial color="#451a03" />
        </mesh>

        {/* Circular Direction D-Pad (Black) */}
        <group position={[0, 0.014, 0.032]}>
          <mesh>
            <cylinderGeometry args={[0.014, 0.014, 0.004, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          {/* Center OK Button */}
          <mesh position={[0, 0.003, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.003, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.4} />
          </mesh>
        </group>

        {/* Back Button */}
        <mesh position={[0.018, 0.014, 0.052]}>
          <boxGeometry args={[0.008, 0.003, 0.008]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* GPIO Pin Header on Top Edge */}
        <mesh position={[0, 0.008, -0.068]}>
          <boxGeometry args={[0.055, 0.008, 0.006]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
        {/* Gold GPIO Pins */}
        {[-0.02, -0.01, 0, 0.01, 0.02].map((gx, idx) => (
          <mesh key={`flipper-gpio-${idx}`} position={[gx, 0.013, -0.068]}>
            <cylinderGeometry args={[0.001, 0.001, 0.004, 6]} />
            <meshStandardMaterial color="#eab308" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* ========================================================================= */}
      {/* 2. HAK5 WI-FI PINEAPPLE (Left side of monitors)                           */}
      {/* ========================================================================= */}
      <group position={[-1.15, 0.02, -0.15]} rotation={[0, 0.35, 0]}>
        {/* Router Base Chassis */}
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.032, 0.16]} />
          <meshStandardMaterial color="#0b0f14" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Cooling Ribs Top */}
        <mesh position={[0, 0.017, 0]}>
          <boxGeometry args={[0.09, 0.003, 0.13]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Dual High-Gain Articulated Dipole Antennas in V-Shape */}
        {/* Left Antenna */}
        <group position={[-0.04, 0.016, -0.08]} rotation={[-0.2, 0, -0.3]}>
          {/* Brass SMA Connector Nut */}
          <mesh>
            <cylinderGeometry args={[0.006, 0.006, 0.012, 12]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Main Antenna Mast */}
          <mesh position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.004, 0.005, 0.18, 12]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
          </mesh>
        </group>

        {/* Right Antenna */}
        <group position={[0.04, 0.016, -0.08]} rotation={[-0.2, 0, 0.3]}>
          <mesh>
            <cylinderGeometry args={[0.006, 0.006, 0.012, 12]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.004, 0.005, 0.18, 12]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
          </mesh>
        </group>

        {/* Front Signal Activity LEDs */}
        <mesh position={[-0.03, 0.005, 0.081]} ref={pineappleLed1Ref}>
          <sphereGeometry args={[0.0025, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0, 0.005, 0.081]} ref={pineappleLed2Ref}>
          <sphereGeometry args={[0.0025, 8, 8]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
        <mesh position={[0.03, 0.005, 0.081]}>
          <sphereGeometry args={[0.0025, 8, 8]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 3. HARDWARE HACKING LAB: RASPBERRY PI 5 & MINI BREADBOARD                 */}
      {/* ========================================================================= */}
      <group position={[-0.88, 0.01, 0.18]} rotation={[0, -0.15, 0]}>
        {/* Raspberry Pi Green PCB Board */}
        <mesh position={[0, 0.005, 0]} castShadow>
          <boxGeometry args={[0.085, 0.004, 0.056]} />
          <meshStandardMaterial color="#15803d" roughness={0.4} />
        </mesh>

        {/* Silver Broadcom BCM2712 SoC Chip with Laser Engraving */}
        <mesh position={[-0.01, 0.008, 0]}>
          <boxGeometry args={[0.018, 0.003, 0.018]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Dual Silver Micro-HDMI Ports */}
        <mesh position={[0.02, 0.007, -0.027]}>
          <boxGeometry args={[0.014, 0.004, 0.006]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>

        {/* Quad USB-A & Ethernet Stack */}
        <mesh position={[0.038, 0.012, 0.01]}>
          <boxGeometry args={[0.016, 0.014, 0.028]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>

        {/* 40-Pin GPIO Header */}
        <mesh position={[-0.01, 0.009, 0.023]}>
          <boxGeometry args={[0.052, 0.005, 0.006]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Adjacent White Mini Solderless Breadboard */}
        <group position={[0, 0, 0.065]}>
          <mesh position={[0, 0.005, 0]}>
            <boxGeometry args={[0.08, 0.007, 0.045]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
          </mesh>

          {/* Tie-Point Pin Grid Dots */}
          {[-0.025, -0.01, 0.005, 0.02].map((bx, i) => (
            <mesh key={`bb-pin-${i}`} position={[bx, 0.009, 0]}>
              <boxGeometry args={[0.003, 0.001, 0.025]} />
              <meshBasicMaterial color="#64748b" />
            </mesh>
          ))}

          {/* Active Pulsing Neo-Pixel RGB LED */}
          <mesh position={[0.015, 0.012, 0]}>
            <sphereGeometry args={[0.004, 12, 12]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>

          {/* Jumper Wires connecting RPi to Breadboard (Arched colored tubes) */}
          {[
            { color: '#ef4444', x1: -0.01, z1: -0.042, x2: -0.015, z2: 0, h: 0.022 },
            { color: '#3b82f6', x1: 0, z1: -0.042, x2: 0, z2: 0.01, h: 0.028 },
            { color: '#eab308', x1: 0.01, z1: -0.042, x2: 0.015, z2: -0.01, h: 0.024 },
          ].map((wire, wIdx) => {
            const curve = new THREE.QuadraticBezierCurve3(
              new THREE.Vector3(wire.x1, 0.01, wire.z1),
              new THREE.Vector3((wire.x1 + wire.x2) / 2, wire.h, (wire.z1 + wire.z2) / 2),
              new THREE.Vector3(wire.x2, 0.01, wire.z2)
            );
            const tubeGeo = new THREE.TubeGeometry(curve, 8, 0.0012, 6, false);
            return (
              <mesh key={`jumper-wire-${wIdx}`} geometry={tubeGeo}>
                <meshStandardMaterial color={wire.color} roughness={0.4} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 4. RFID ACCESS BADGE & LANYARD ON DESK                                    */}
      {/* ========================================================================= */}
      <group position={[0.72, 0.008, 0.08]} rotation={[0, 0.45, 0]}>
        {/* PVC Card Badge */}
        <mesh position={[0, 0.002, 0]} castShadow>
          <boxGeometry args={[0.086, 0.002, 0.054]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        {/* ID Photo Area */}
        <mesh position={[-0.02, 0.0035, 0]}>
          <planeGeometry args={[0.028, 0.034]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Black Lanyard Strap */}
        <mesh position={[0.06, 0.002, 0]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[0.08, 0.001, 0.012]} />
          <meshStandardMaterial color="#0284c7" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
