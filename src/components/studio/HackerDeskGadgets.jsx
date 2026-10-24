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

      {/* ========================================================================= */}
      {/* 5. PROJECT 1 ASSET: MOBILE APP PEN-TEST ANDROID PHONE & RIG               */}
      {/* Represents: LLM-Based Autonomous Mobile App Security Penetration Agent   */}
      {/* ========================================================================= */}
      <group position={[0.26, 0.015, -0.15]} rotation={[0, -0.18, 0]}>
        {/* Angled CNC Aluminum Desktop Phone Stand */}
        <group position={[0, 0.025, 0]} rotation={[-0.45, 0, 0]}>
          {/* Stand Backplate */}
          <mesh position={[0, 0, -0.006]}>
            <boxGeometry args={[0.075, 0.13, 0.006]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Bottom Lip Hook */}
          <mesh position={[0, -0.065, 0.008]}>
            <boxGeometry args={[0.075, 0.01, 0.02]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>

          {/* Test Android Smartphone Body (Matte Black Bezel) */}
          <mesh castShadow position={[0, 0.005, 0.004]}>
            <boxGeometry args={[0.07, 0.145, 0.008]} />
            <meshStandardMaterial color="#0b0f14" roughness={0.25} metalness={0.85} />
          </mesh>
          {/* Live Mobile Vulnerability Triage OLED Screen */}
          <mesh position={[0, 0.005, 0.009]}>
            <planeGeometry args={[0.064, 0.136]} />
            <meshBasicMaterial color="#04202c" />
          </mesh>
          {/* Mobile Terminal Audit Trace Lines */}
          {[-0.045, -0.025, -0.005, 0.015, 0.035, 0.055].map((ly, idx) => (
            <mesh key={`phone-trace-${idx}`} position={[-0.002, ly, 0.01]}>
              <planeGeometry args={[0.054, 0.007]} />
              <meshBasicMaterial color={idx === 1 ? '#ef4444' : (idx === 4 ? '#22c55e' : '#38bdf8')} transparent opacity={0.85} />
            </mesh>
          ))}
          {/* Camera Punch-hole */}
          <mesh position={[0, 0.065, 0.009]}>
            <circleGeometry args={[0.003, 12]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>

        {/* Braided Blue USB-C Debugging Tether running to desk raceway */}
        <mesh position={[0.02, 0.005, -0.04]} rotation={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.0018, 0.0018, 0.12, 8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.5} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 6. PROJECT 2 ASSET: NEUROFLUX BCI NEURAL SENSOR HEADBAND                  */}
      {/* Represents: NeuroFlux Multimodal Real-Time Input Pipeline                 */}
      {/* ========================================================================= */}
      <group position={[-0.52, 0.018, 0.12]} rotation={[0, 0.35, 0]}>
        {/* Ergonomic Curved Carbon-Fiber Headband */}
        <mesh castShadow position={[0, 0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.075, 0.006, 12, 28, Math.PI * 0.9]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* 4 Golden EEG Dry-Contact Electrodes */}
        {[-0.05, -0.02, 0.02, 0.05].map((ex, idx) => (
          <group key={`eeg-node-${idx}`} position={[ex, 0.015, -0.035]}>
            <mesh>
              <cylinderGeometry args={[0.005, 0.005, 0.006, 12]} />
              <meshStandardMaterial color="#eab308" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Glowing Neural Telemetry Ring */}
            <mesh position={[0, 0.004, 0]}>
              <ringGeometry args={[0.005, 0.007, 12]} />
              <meshBasicMaterial color="#a855f7" />
            </mesh>
          </group>
        ))}
        {/* Central Neural Signal DSP Processing Core */}
        <mesh position={[0, 0.018, 0.04]}>
          <boxGeometry args={[0.026, 0.014, 0.022]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        <pointLight position={[0, 0.025, 0.04]} color="#a855f7" intensity={0.8} distance={0.5} />
      </group>

      {/* ========================================================================= */}
      {/* 7. PROJECT 3 ASSET: KSECURITY THREAT RADAR MINI-OLED TABLET               */}
      {/* Represents: KSecurity AI-Powered Threat Intelligence Platform             */}
      {/* ========================================================================= */}
      <group position={[0.92, 0.025, -0.16]} rotation={[-0.3, -0.4, 0]}>
        {/* Beveled Gunmetal Tablet Frame */}
        <mesh castShadow>
          <boxGeometry args={[0.13, 0.09, 0.008]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Active STIX/TAXII Threat Radar OLED Screen */}
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.12, 0.08]} />
          <meshBasicMaterial color="#082f49" />
        </mesh>
        {/* Concentric Radar Sweeper Circles */}
        <mesh position={[0, 0, 0.006]}>
          <ringGeometry args={[0.018, 0.022, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <ringGeometry args={[0.032, 0.035, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </mesh>
        {/* Blinking CVE Threat Nodes */}
        {[
          { x: 0.02, y: 0.015, c: '#ef4444' },
          { x: -0.025, y: -0.01, c: '#f59e0b' },
          { x: 0.035, y: -0.02, c: '#22c55e' },
        ].map((node, i) => (
          <mesh key={`cve-blip-${i}`} position={[node.x, node.y, 0.007]}>
            <circleGeometry args={[0.0035, 8]} />
            <meshBasicMaterial color={node.c} />
          </mesh>
        ))}
      </group>

      {/* ========================================================================= */}
      {/* 8. PROJECT 4 ASSET: KRISHIMITRA IOT EDGE AGRICULTURAL TELEMETRY NODE      */}
      {/* Represents: KrishiMitra Multimodal Agricultural AI Assistant              */}
      {/* ========================================================================= */}
      <group position={[-1.02, 0.02, 0.16]} rotation={[0, 0.15, 0]}>
        {/* Weatherproof IP67 Green Enclosure */}
        <mesh castShadow>
          <boxGeometry args={[0.065, 0.035, 0.075]} />
          <meshStandardMaterial color="#166534" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Top Solar Energy Harvester Cell */}
        <mesh position={[0, 0.018, 0]}>
          <planeGeometry args={[0.055, 0.065]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Stubby Rubber 868MHz LoRa / Soil Telemetry Antenna */}
        <mesh position={[0.022, 0.035, -0.025]}>
          <cylinderGeometry args={[0.003, 0.004, 0.05, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {/* Telemetry Status Pulse LED */}
        <mesh position={[-0.02, 0.019, 0.025]}>
          <sphereGeometry args={[0.003, 8, 8]} />
          <meshBasicMaterial color="#4ade80" />
        </mesh>
      </group>
    </group>
  );
}
