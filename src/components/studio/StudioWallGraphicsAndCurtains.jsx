import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LIGHTING_THEMES } from './CyberAtmosphere.jsx';
import {
  createWiresharkScreen,
  createMitreAttackScreen,
  createCyberPopArtScreen,
} from '../../utils/cyberScreens.js';
import { playClickSound, playHackingBeep } from '../../utils/audio.js';

export default function StudioWallGraphicsAndCurtains({ currentThemeKey = 'CYBER_NEON_NOIR' }) {
  const theme = LIGHTING_THEMES[currentThemeKey] || LIGHTING_THEMES.CYBER_NEON_NOIR;

  // Refs for animated elements
  const leftCurtainRef = useRef();
  const rightCurtainRef = useRef();
  const trafficLane1Ref = useRef();
  const trafficLane2Ref = useRef();
  const rooftopBeaconRef = useRef();
  const billboardGlowRef = useRef();
  const [activeTool, setActiveTool] = useState(null);

  // Dynamic Live Cyber Screens (Wireshark PCAP Stream & MITRE ATT&CK Threat Radar)
  const wiresharkScreen = useMemo(() => createWiresharkScreen(), []);
  const mitreScreen = useMemo(() => createMitreAttackScreen(), []);
  const popArtScreen = useMemo(() => createCyberPopArtScreen(), []);
  const screenTimer = useRef(0);
  const screenToggle = useRef(false);

  // Traffic vehicle positions for the skyway
  const skywayVehicles1 = useMemo(() => {
    return [
      { offset: 0, speed: 0.85, color: '#38bdf8' },
      { offset: 1.2, speed: 0.95, color: '#67e8f9' },
      { offset: 2.3, speed: 0.75, color: '#38bdf8' },
      { offset: 3.4, speed: 1.05, color: '#a5f3fc' },
    ];
  }, []);

  const skywayVehicles2 = useMemo(() => {
    return [
      { offset: 0.5, speed: 0.65, color: '#f43f5e' },
      { offset: 1.8, speed: 0.8, color: '#fb923c' },
      { offset: 2.9, speed: 0.7, color: '#f43f5e' },
    ];
  }, []);

  // Skyscraper building data
  const skylineBuildings = useMemo(() => {
    return [
      { x: -1.25, h: 3.2, w: 0.55, color: '#091326', winColor: '#38bdf8', winRows: 12 },
      { x: -0.65, h: 4.1, w: 0.6, color: '#0d1b33', winColor: '#a855f7', winRows: 16, hasSpire: true },
      { x: 0.05, h: 3.6, w: 0.65, color: '#09152b', winColor: '#34d399', winRows: 14 },
      { x: 0.75, h: 4.4, w: 0.7, color: '#112242', winColor: '#38bdf8', winRows: 18, hasBillboard: true },
      { x: 1.45, h: 2.9, w: 0.6, color: '#081124', winColor: '#f59e0b', winRows: 10 },
    ];
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 0. Update Live Cyber Screens (Paced to gentle 4.5 FPS, Alternated 1-per-interval for buttery 60fps)
    screenTimer.current += delta;
    if (screenTimer.current > 0.22) {
      if (screenToggle.current) {
        wiresharkScreen.update(screenTimer.current);
      } else {
        mitreScreen.update(screenTimer.current);
      }
      screenToggle.current = !screenToggle.current;
      screenTimer.current = 0;
    }

    // 1. Curtains Gentle Breeze Flutter
    if (leftCurtainRef.current) {
      leftCurtainRef.current.rotation.z = Math.sin(time * 1.6) * 0.02;
      leftCurtainRef.current.rotation.x = Math.cos(time * 1.3) * 0.015;
    }
    if (rightCurtainRef.current) {
      rightCurtainRef.current.rotation.z = Math.sin(time * 1.6 + 0.8) * 0.02;
      rightCurtainRef.current.rotation.x = Math.cos(time * 1.3 + 0.5) * 0.015;
    }

    // 2. Skyway Hover Traffic Animation
    if (trafficLane1Ref.current) {
      trafficLane1Ref.current.children.forEach((mesh, i) => {
        const v = skywayVehicles1[i];
        if (v) {
          mesh.position.x = ((time * v.speed + v.offset) % 4.2) - 2.1;
        }
      });
    }
    if (trafficLane2Ref.current) {
      trafficLane2Ref.current.children.forEach((mesh, i) => {
        const v = skywayVehicles2[i];
        if (v) {
          mesh.position.x = 2.1 - ((time * v.speed + v.offset) % 4.2);
        }
      });
    }

    // 4. Rooftop Beacon & Billboard Glow
    if (rooftopBeaconRef.current) {
      rooftopBeaconRef.current.intensity = 1.0 + Math.sin(time * 6) * 0.8;
    }
    if (billboardGlowRef.current) {
      billboardGlowRef.current.intensity = 1.8 + Math.sin(time * 3) * 0.5;
    }
  });

  return (
    <group name="StudioWallGraphicsAndCurtains">
      {/* ======================================================== */}
      {/* 1. ARCHITECTURAL WINDOW CURTAINS (Floor-to-Ceiling)       */}
      {/* Window center is at X = 3.35, Y = 2.25, Z = -5.05         */}
      {/* ======================================================== */}
      <group position={[3.35, 0, -4.92]}>
        {/* Sleek Gunmetal & Brass Curtain Rod */}
        <mesh position={[0, 4.15, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 3.2, 16]} />
          <meshStandardMaterial color="#2d3748" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Rod Finials (Decorative Brass End Caps) */}
        <mesh position={[-1.62, 4.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.025, 0.08, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[1.62, 4.15, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.035, 0.025, 0.08, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Rod Wall Mounting Brackets */}
        {[-1.5, 0, 1.5].map((bx, idx) => (
          <mesh key={`curtain-bracket-${idx}`} position={[bx, 4.15, -0.06]}>
            <boxGeometry args={[0.03, 0.06, 0.12]} />
            <meshStandardMaterial color="#1a202c" metalness={0.8} />
          </mesh>
        ))}

        {/* Left Curtain Drape (Pleated Fabric with Tie-Back) */}
        <group ref={leftCurtainRef} position={[-1.38, 2.05, 0]}>
          {/* Main Gathered Fabric Pleats */}
          {[-0.12, -0.04, 0.04, 0.12].map((px, i) => (
            <mesh key={`l-pleat-${i}`} position={[px, 0, (i % 2) * 0.02]}>
              <boxGeometry args={[0.09, 4.1, 0.04]} />
              <meshStandardMaterial color="#0f1915" roughness={0.85} metalness={0.08} />
            </mesh>
          ))}
          {/* Left Tie-Back Brass Ring at mid-height */}
          <mesh position={[0.02, -0.5, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.015, 12, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>

        {/* Right Curtain Drape (Pleated Fabric with Tie-Back) */}
        <group ref={rightCurtainRef} position={[1.38, 2.05, 0]}>
          {/* Main Gathered Fabric Pleats */}
          {[-0.12, -0.04, 0.04, 0.12].map((px, i) => (
            <mesh key={`r-pleat-${i}`} position={[px, 0, (i % 2) * 0.02]}>
              <boxGeometry args={[0.09, 4.1, 0.04]} />
              <meshStandardMaterial color="#0f1915" roughness={0.85} metalness={0.08} />
            </mesh>
          ))}
          {/* Right Tie-Back Brass Ring at mid-height */}
          <mesh position={[-0.02, -0.5, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.015, 12, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 2. ILLUMINATED CYBER CITYSCAPE SKYLINE (Visible in Window)*/}
      {/* ======================================================== */}
      <group position={[3.35, 2.1, -5.25]}>
        {/* Window Night Neon Glow pouring into room */}
        <pointLight position={[0, 0.4, 0.45]} color="#38bdf8" intensity={4.5} distance={6.0} />
        {/* Deep Cyber Night Sky Plane */}
        <mesh position={[0, 0, -0.45]}>
          <planeGeometry args={[4.4, 4.4]} />
          <meshBasicMaterial color="#0b1b3d" />
        </mesh>

        {/* Cyberpunk Orbital Ring / Digital Moon in Night Sky */}
        <group position={[-0.8, 1.45, -0.4]}>
          <mesh>
            <circleGeometry args={[0.26, 24]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <ringGeometry args={[0.32, 0.35, 32]} />
            <meshBasicMaterial color="#67e8f9" />
          </mesh>
        </group>

        {/* Distant Stars / Constellation Dust in Night Sky */}
        {[
          [-1.5, 1.6, -0.4],
          [-0.2, 1.7, -0.4],
          [0.6, 1.85, -0.4],
          [1.1, 1.5, -0.4],
          [1.6, 1.75, -0.4],
          [-1.2, 1.1, -0.4],
          [0.2, 1.2, -0.4],
        ].map((star, idx) => (
          <mesh key={`star-${idx}`} position={star}>
            <planeGeometry args={[0.03, 0.03]} />
            <meshBasicMaterial color="#bae6fd" />
          </mesh>
        ))}

        {/* Skyscraper Silhouettes with Vivid Neon Windows */}
        {skylineBuildings.map((b, idx) => (
          <group key={`skyline-tower-${idx}`} position={[b.x, -1.8 + b.h / 2, -0.15]}>
            {/* Tower Body */}
            <mesh>
              <boxGeometry args={[b.w, b.h, 0.22]} />
              <meshBasicMaterial color={b.color} />
            </mesh>

            {/* Lit Window Matrix Grid */}
            <mesh position={[0, 0, 0.12]}>
              <planeGeometry args={[b.w * 0.82, b.h * 0.72]} />
              <meshBasicMaterial color={b.winColor} transparent opacity={0.85} />
            </mesh>

            {/* Tower Rooftop Spire with Blinking Beacon */}
            {b.hasSpire && (
              <group position={[0, b.h / 2 + 0.35, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.01, 0.02, 0.7, 8]} />
                  <meshBasicMaterial color="#475569" />
                </mesh>
                <mesh position={[0, 0.35, 0]}>
                  <sphereGeometry args={[0.035, 8, 8]} />
                  <meshBasicMaterial color="#f43f5e" />
                </mesh>
                <pointLight
                  ref={rooftopBeaconRef}
                  position={[0, 0.35, 0.1]}
                  color="#f43f5e"
                  intensity={1.2}
                  distance={2.5}
                />
              </group>
            )}

            {/* Rooftop Holographic Billboard */}
            {b.hasBillboard && (
              <group position={[0, b.h / 2 + 0.22, 0.05]}>
                <mesh>
                  <boxGeometry args={[0.55, 0.22, 0.04]} />
                  <meshBasicMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0, 0, 0.025]}>
                  <planeGeometry args={[0.5, 0.18]} />
                  <meshBasicMaterial color={theme.accentColor} transparent opacity={0.8} />
                </mesh>
                <pointLight
                  ref={billboardGlowRef}
                  position={[0, 0, 0.1]}
                  color={theme.accentColor}
                  intensity={1.8}
                  distance={3.0}
                />
              </group>
            )}
          </group>
        ))}

        {/* Skyway Hover Traffic Lane 1 (Cyan forward stream) */}
        <group ref={trafficLane1Ref} position={[0, -0.65, -0.05]}>
          {skywayVehicles1.map((v, idx) => (
            <mesh key={`veh1-${idx}`} position={[0, 0, 0]}>
              <boxGeometry args={[0.16, 0.025, 0.02]} />
              <meshBasicMaterial color={v.color} />
            </mesh>
          ))}
        </group>

        {/* Skyway Hover Traffic Lane 2 (Orange/Red reverse stream) */}
        <group ref={trafficLane2Ref} position={[0, -0.85, -0.05]}>
          {skywayVehicles2.map((v, idx) => (
            <mesh key={`veh2-${idx}`} position={[0, 0, 0]}>
              <boxGeometry args={[0.16, 0.025, 0.02]} />
              <meshBasicMaterial color={v.color} />
            </mesh>
          ))}
        </group>

        {/* Skyway Road Bridge Guide Rail */}
        <mesh position={[0, -0.75, -0.06]}>
          <boxGeometry args={[3.8, 0.015, 0.03]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 3. LEFT WALL: TACTICAL RED TEAM HARDWARE ARSENAL LAB     */}
      {/* Authentic penetration testing, RF & physical security lab */}
      {/* Location: X = -4.94, Y = 2.35, Z = 1.25                    */}
      {/* ======================================================== */}
      <group
        position={[-4.94, 2.35, 1.25]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (typeof window !== 'undefined' && window.__SET_SECTION__) {
            window.__SET_SECTION__('hardware_arsenal');
          }
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* CNC Perforated Matte Black Pegboard Backplate */}
        <mesh position={[0, 0, -0.01]} receiveShadow>
          <boxGeometry args={[1.5, 1.35, 0.02]} />
          <meshStandardMaterial color="#0c1116" roughness={0.7} metalness={0.6} />
        </mesh>

        {/* Industrial Standoff Mounting Frame */}
        <mesh position={[0, 0, -0.015]}>
          <boxGeometry args={[1.54, 1.39, 0.01]} />
          <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Glowing Edge-Lit Cyan Acrylic Perimeter Trim */}
        <mesh position={[0, 0, -0.018]}>
          <boxGeometry args={[1.56, 1.41, 0.008]} />
          <meshBasicMaterial color={theme.accentColor || '#00f0ff'} />
        </mesh>

        {/* Pegboard Corner Anodized Standoff Bolts */}
        {[
          [-0.7, -0.62],
          [0.7, -0.62],
          [-0.7, 0.62],
          [0.7, 0.62],
        ].map(([bx, by], idx) => (
          <mesh key={`standoff-${idx}`} position={[bx, by, 0.005]}>
            <cylinderGeometry args={[0.018, 0.018, 0.025, 6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
          </mesh>
        ))}

        {/* Pegboard Header Stencil Plate with Illuminated Telemetry Badge */}
        <group position={[0, 0.72, 0.008]}>
          <mesh>
            <boxGeometry args={[1.54, 0.08, 0.018]} />
            <meshStandardMaterial color="#0b1016" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.48, 0.06]} />
            <meshBasicMaterial color="#03201b" />
          </mesh>
          {/* Header Status LEDs */}
          {[
            { x: -0.66, color: '#22c55e', label: 'ARMED' },
            { x: -0.60, color: '#38bdf8', label: 'RF_SCAN' },
            { x: -0.54, color: '#f59e0b', label: 'PAYLOAD' },
          ].map((led, i) => (
            <mesh key={`hdr-led-${i}`} position={[led.x, 0, 0.012]}>
              <sphereGeometry args={[0.006, 8, 8]} />
              <meshBasicMaterial color={led.color} />
            </mesh>
          ))}
        </group>

        {/* Overhead High-CRI LED Task Light Fixture (Crisp Downward Illumination) */}
        <group position={[0, 0.82, 0.22]}>
          {/* Extruded Matte Black Lamp Housing */}
          <mesh>
            <boxGeometry args={[1.52, 0.035, 0.08]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Downward Opal Diffuser Strip */}
          <mesh position={[0, -0.018, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.48, 0.065]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Cantilever Support Arms anchored back to pegboard */}
          {[-0.6, 0.6].map((sx, idx) => (
            <mesh key={`task-arm-${idx}`} position={[sx, -0.01, -0.11]}>
              <boxGeometry args={[0.02, 0.02, 0.22]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          ))}
          {/* Focused downward task light illuminating tools & workbench */}
          <pointLight
            position={[0, -0.15, 0]}
            color="#f8fafc"
            intensity={2.2}
            distance={2.6}
            decay={2}
          />
        </group>

        {/* Dedicated Floating Hardware Technician Workbench / Lab Shelf */}
        <group position={[0, -0.87, 0.22]}>
          {/* Heavy Dark Walnut & Steel Lab Surface */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.54, 0.04, 0.44]} />
            <meshStandardMaterial color="#181310" roughness={0.35} metalness={0.3} />
          </mesh>
          {/* Front Anodized Gunmetal Chamfer Trim */}
          <mesh position={[0, 0, 0.222]}>
            <boxGeometry args={[1.54, 0.04, 0.005]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Heavy-Duty Welded Triangular Cantilever Brackets underneath */}
          {[-0.55, 0.55].map((bx, idx) => (
            <mesh key={`bench-bracket-${idx}`} position={[bx, -0.12, -0.08]}>
              <boxGeometry args={[0.03, 0.22, 0.26]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}

          {/* 1. Blue Anti-Static ESD Workstation Mat */}
          <mesh position={[0, 0.022, 0]}>
            <boxGeometry args={[1.44, 0.004, 0.38]} />
            <meshStandardMaterial color="#0284c7" roughness={0.6} />
          </mesh>
          {/* ESD Mat Gold Grounding Snap Stud */}
          <mesh position={[-0.68, 0.025, 0.16]}>
            <cylinderGeometry args={[0.008, 0.008, 0.005, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* 2. Digital Soldering / Rework Station */}
          <group position={[0.48, 0.07, 0]}>
            {/* Station Main Housing */}
            <mesh castShadow>
              <boxGeometry args={[0.16, 0.09, 0.18]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Glowing Orange 7-Segment Temperature Display (350 C) */}
            <mesh position={[0, 0.02, 0.091]}>
              <planeGeometry args={[0.07, 0.03]} />
              <meshBasicMaterial color="#ea580c" />
            </mesh>
            {/* Rotary Temp Control Knob */}
            <mesh position={[-0.04, -0.02, 0.092]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.01, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            {/* Soldering Iron Stand with Brass Sponge & Pen Wand */}
            <mesh position={[-0.14, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.035, 0.06, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Iron Pen Wand Resting in Collar */}
            <mesh position={[-0.14, 0.05, 0.02]} rotation={[0.4, 0, 0.2]}>
              <cylinderGeometry args={[0.005, 0.008, 0.16, 12]} />
              <meshStandardMaterial color="#0284c7" roughness={0.5} />
            </mesh>
          </group>

          {/* 3. Benchtop Digital Storage Oscilloscope / Spectrum Analyzer */}
          <group position={[-0.45, 0.08, 0]}>
            {/* Scope Main Frame */}
            <mesh castShadow>
              <boxGeometry args={[0.22, 0.12, 0.18]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.5} />
            </mesh>
            {/* Color LCD Screen showing live signal waveform */}
            <mesh position={[0.02, 0.01, 0.091]}>
              <planeGeometry args={[0.13, 0.08]} />
              <meshBasicMaterial color="#022c22" />
            </mesh>
            {/* Waveform Trace */}
            <mesh position={[0.02, 0.01, 0.092]}>
              <planeGeometry args={[0.11, 0.04]} />
              <meshBasicMaterial color="#22c55e" transparent opacity={0.9} />
            </mesh>
            {/* Channel Control Rotary Knobs */}
            {[-0.07, -0.07].map((kx, i) => (
              <mesh key={`scope-knob-${i}`} position={[kx, i === 0 ? 0.02 : -0.02, 0.092]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.009, 0.009, 0.008, 16]} />
                <meshStandardMaterial color="#334155" metalness={0.8} />
              </mesh>
            ))}
            {/* Dual BNC Probe Terminals */}
            {[-0.03, 0.04].map((bx, i) => (
              <mesh key={`bnc-${i}`} position={[bx, -0.04, 0.093]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.012, 12]} />
                <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
              </mesh>
            ))}
          </group>

          {/* 4. Small Component Organizer Bin & Jumper Leads */}
          <group position={[0.04, 0.04, -0.05]}>
            <mesh>
              <boxGeometry args={[0.2, 0.04, 0.12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Spare Antennas inside bin */}
            {[-0.05, 0, 0.05].map((ax, i) => (
              <mesh key={`bin-ant-${i}`} position={[ax, 0.02, 0]} rotation={[0.3 * i, 0, 0.5]}>
                <cylinderGeometry args={[0.004, 0.005, 0.1, 8]} />
                <meshStandardMaterial color="#0f172a" roughness={0.5} />
              </mesh>
            ))}
          </group>

          {/* 5. Bench ID Stencil Nameplate */}
          <mesh position={[0, -0.01, 0.223]}>
            <planeGeometry args={[0.55, 0.025]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>
        {/* TOOL A: HAK5 WIFI PINEAPPLE MARK VII                     */}
        {/* Dual-band Rogue AP, PineAP Engine & Multi-Antenna Array   */}
        {/* ======================================================== */}
        <group
          position={[0.36, 0.22, 0.03]}
          onClick={(e) => {
            e.stopPropagation();
            playHackingBeep(1600);
            setActiveTool('pineapple');
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Main Pineapple Enclosure */}
          <mesh castShadow>
            <boxGeometry args={[0.34, 0.19, 0.045]} />
            <meshStandardMaterial color="#111822" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Front Bevel Accent */}
          <mesh position={[0, 0, 0.024]}>
            <boxGeometry args={[0.32, 0.17, 0.004]} />
            <meshStandardMaterial color="#0b1016" roughness={0.3} />
          </mesh>

          {/* 4 Gold SMA Antenna Connectors along top edge */}
          {[-0.12, -0.04, 0.04, 0.12].map((ax, i) => (
            <mesh key={`sma-${i}`} position={[ax, 0.105, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.025, 12]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
            </mesh>
          ))}

          {/* 4 Articulated High-Gain Rubber Duck Antennas (Tactical Splayed Angles) */}
          {[
            { x: -0.12, rot: 0.45 },
            { x: -0.04, rot: 0.15 },
            { x: 0.04, rot: -0.15 },
            { x: 0.12, rot: -0.45 },
          ].map((ant, i) => (
            <group key={`ant-${i}`} position={[ant.x, 0.12, 0]} rotation={[0, 0, ant.rot]}>
              <mesh position={[0, 0.11, 0]} castShadow>
                <cylinderGeometry args={[0.007, 0.009, 0.22, 12]} />
                <meshStandardMaterial color="#1c2430" roughness={0.5} metalness={0.4} />
              </mesh>
              {/* Antenna Gold Base Ring */}
              <mesh position={[0, 0.015, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.01, 12]} />
                <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ))}

          {/* Dual RJ45 Gigabit Ethernet Ports at bottom edge */}
          {[-0.08, -0.01].map((rx, i) => (
            <group key={`rj45-${i}`} position={[rx, -0.1, 0]}>
              <mesh>
                <boxGeometry args={[0.045, 0.025, 0.03]} />
                <meshStandardMaterial color="#334155" metalness={0.8} />
              </mesh>
              {/* Internal Copper Pins */}
              <mesh position={[0, 0, 0.012]}>
                <boxGeometry args={[0.035, 0.015, 0.008]} />
                <meshStandardMaterial color="#d97706" metalness={0.9} />
              </mesh>
            </group>
          ))}

          {/* Status Diagnostic LEDs */}
          {[
            { x: 0.08, color: '#22c55e', label: 'PWR' },
            { x: 0.11, color: '#38bdf8', label: '2.4G' },
            { x: 0.14, color: '#a855f7', label: '5G' },
          ].map((led, i) => (
            <mesh key={`led-${i}`} position={[led.x, -0.06, 0.026]}>
              <sphereGeometry args={[0.005, 8, 8]} />
              <meshBasicMaterial color={led.color} />
            </mesh>
          ))}

          {/* Silk-screen Hak5 Logo Text */}
          <mesh position={[0, 0.02, 0.026]}>
            <planeGeometry args={[0.16, 0.035]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
        </group>

        {/* ======================================================== */}
        {/* TOOL B: FLIPPER ZERO WITH WI-FI DEVBOARD (ESP32-S2)       */}
        {/* Multi-tool device for Sub-GHz, RFID, NFC, BadUSB, GPIO    */}
        {/* ======================================================== */}
        <group
          position={[-0.38, 0.22, 0.03]}
          onClick={(e) => {
            e.stopPropagation();
            playClickSound(1400);
            setActiveTool('flipper');
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Main Flipper Ergonomic White Body */}
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.12, 0.042]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.35} metalness={0.1} />
          </mesh>
          {/* Flipper Signature Orange Silicone Bumper Shell */}
          <mesh position={[0, 0, -0.002]}>
            <boxGeometry args={[0.27, 0.128, 0.044]} />
            <meshStandardMaterial color="#ea580c" roughness={0.6} />
          </mesh>

          {/* Orange Backlit Monochrome LCD Display */}
          <mesh position={[-0.04, 0, 0.023]}>
            <boxGeometry args={[0.11, 0.07, 0.005]} />
            <meshBasicMaterial color="#f97316" />
          </mesh>

          {/* Flipper LCD Dolphin Cyber Text Mock */}
          <mesh position={[-0.04, 0, 0.027]}>
            <planeGeometry args={[0.095, 0.055]} />
            <meshBasicMaterial color="#7c2d12" transparent opacity={0.85} />
          </mesh>

          {/* 5-Way Directional D-Pad Wheel (Right side) */}
          <group position={[0.075, 0, 0.024]}>
            <mesh>
              <cylinderGeometry args={[0.028, 0.028, 0.006, 24]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.3} />
            </mesh>
            {/* Center OK Button */}
            <mesh position={[0, 0.003, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.006, 16]} />
              <meshStandardMaterial color="#ea580c" roughness={0.4} />
            </mesh>
          </group>

          {/* Back Button */}
          <mesh position={[0.075, -0.04, 0.023]}>
            <circleGeometry args={[0.009, 12]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>

          {/* Top GPIO Header Strip (18-pin slot) */}
          <mesh position={[-0.02, 0.065, 0]}>
            <boxGeometry args={[0.14, 0.012, 0.02]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} />
          </mesh>

          {/* Mounted Green ESP32 Wi-Fi Multiboard Daughterboard */}
          <group position={[-0.02, 0.11, 0]}>
            {/* Devboard Green PCB */}
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.075, 0.008]} />
              <meshStandardMaterial color="#15803d" roughness={0.4} metalness={0.2} />
            </mesh>
            {/* ESP32-S2 Shielding Can */}
            <mesh position={[-0.02, 0.01, 0.007]}>
              <boxGeometry args={[0.04, 0.04, 0.006]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Gold SMA Antenna Jack */}
            <mesh position={[0.04, 0.04, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.015, 12]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Wi-Fi Stubby Antenna */}
            <mesh position={[0.04, 0.09, 0]} castShadow>
              <cylinderGeometry args={[0.006, 0.007, 0.09, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* ======================================================== */}
        {/* TOOL C: HACKRF ONE SDR WITH PORTAPACK H2                  */}
        {/* 1MHz - 6GHz Software-Defined Radio Transceiver & Spectrum */}
        {/* ======================================================== */}
        <group
          position={[-0.38, -0.32, 0.03]}
          onClick={(e) => {
            e.stopPropagation();
            playHackingBeep(1200);
            setActiveTool('hackrf');
          }}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* PortaPack Aluminum Casing */}
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.16, 0.04]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Color LCD Screen: Live RF Waterfall Spectrum */}
          <mesh position={[-0.03, 0.01, 0.022]}>
            <boxGeometry args={[0.13, 0.11, 0.004]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          {/* RF Spectrum Waterfall Ripple Lines */}
          <mesh position={[-0.03, 0.01, 0.025]}>
            <planeGeometry args={[0.12, 0.1]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.75} />
          </mesh>

          {/* Rotary Navigation Jog Dial Wheel */}
          <group position={[0.075, 0.01, 0.023]}>
            <mesh>
              <cylinderGeometry args={[0.026, 0.026, 0.012, 24]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>

          {/* Gold SMA Antenna Mount */}
          <mesh position={[0.08, 0.09, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.02, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
          </mesh>

          {/* Chrome Telescopic Extendable Antenna */}
          <group position={[0.08, 0.1, 0]}>
            <mesh position={[0, 0.18, 0]} castShadow>
              <cylinderGeometry args={[0.005, 0.008, 0.36, 12]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Chrome Ball Tip */}
            <mesh position={[0, 0.365, 0]}>
              <sphereGeometry args={[0.009, 12, 12]} />
              <meshStandardMaterial color="#ffffff" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* ======================================================== */}
        {/* TOOL D: HAK5 USB RUBBER DUCKY & BASH BUNNY                */}
        {/* Keystroke Injection & Multi-Vector Attack Drives          */}
        {/* ======================================================== */}
        <group position={[0.36, -0.22, 0.03]}>
          {/* Precision CNC Mounting Clip Bracket */}
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[0.32, 0.12, 0.012]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>

          {/* 1. USB Rubber Ducky (Translucent Smoke Casing + Gold Plug) */}
          <group
            position={[-0.08, 0.01, 0.01]}
            onClick={(e) => {
              e.stopPropagation();
              playClickSound(1800);
              setActiveTool('ducky');
            }}
          >
            {/* Smoke Translucent Body */}
            <mesh castShadow>
              <boxGeometry args={[0.095, 0.032, 0.018]} />
              <meshStandardMaterial color="#334155" roughness={0.2} transparent opacity={0.85} />
            </mesh>
            {/* Gold USB Type-A Plug */}
            <mesh position={[0.055, 0, 0]}>
              <boxGeometry args={[0.024, 0.022, 0.01]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Payload Injection Activity LED */}
            <mesh position={[-0.025, 0, 0.01]}>
              <sphereGeometry args={[0.0035, 8, 8]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
          </group>

          {/* 2. Hak5 Bash Bunny (Matte Black with Payload Switch) */}
          <group
            position={[0.08, 0.01, 0.01]}
            onClick={(e) => {
              e.stopPropagation();
              playClickSound(1500);
              setActiveTool('bunny');
            }}
          >
            {/* Matte Black Casing */}
            <mesh castShadow>
              <boxGeometry args={[0.11, 0.035, 0.02]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Gold USB Plug */}
            <mesh position={[0.062, 0, 0]}>
              <boxGeometry args={[0.024, 0.022, 0.01]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* 3-Position Mode Switch */}
            <mesh position={[0.01, 0.018, 0]}>
              <boxGeometry args={[0.015, 0.006, 0.008]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
            {/* RGB Armed Status LED */}
            <mesh position={[-0.03, 0, 0.011]}>
              <sphereGeometry args={[0.004, 8, 8]} />
              <meshBasicMaterial color="#10b981" />
            </mesh>
          </group>
        </group>

        {/* ======================================================== */}
        {/* TOOL E: PROXMARK3 RDV4 & SALEAE LOGIC ANALYZER            */}
        {/* RFID/NFC Dual-Frequency Cloner & 8-Channel Bus Probes     */}
        {/* ======================================================== */}
        <group position={[-0.02, -0.42, 0.03]}>
          {/* Proxmark3 RDV4 Modular RFID Analysis Board */}
          <group
            position={[-0.22, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              playClickSound(950);
              setActiveTool('proxmark');
            }}
          >
            {/* Black PCB */}
            <mesh castShadow>
              <boxGeometry args={[0.15, 0.1, 0.012]} />
              <meshStandardMaterial color="#020617" roughness={0.4} />
            </mesh>
            {/* Circular Copper Antenna Coil Trace (LF 125kHz / HF 13.56MHz) */}
            <mesh position={[0, 0, 0.007]}>
              <ringGeometry args={[0.026, 0.038, 24]} />
              <meshStandardMaterial color="#d97706" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Field Detection LEDs */}
            <mesh position={[0.045, 0.03, 0.008]}>
              <sphereGeometry args={[0.003, 8, 8]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>

          {/* Saleae Logic 8 Anodized Red USB Logic Analyzer */}
          <group
            position={[0.22, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              playClickSound(1100);
              setActiveTool('saleae');
            }}
          >
            {/* Anodized CNC Aluminum Red Housing */}
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.08, 0.024]} />
              <meshStandardMaterial color="#b91c1c" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* 8-Channel Pin Header */}
            <mesh position={[-0.065, 0, 0]}>
              <boxGeometry args={[0.012, 0.05, 0.014]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            {/* 8 Rainbow Multi-Color Fly-wire Probes hanging in harness */}
            {[-0.02, -0.014, -0.008, -0.002, 0.004, 0.01, 0.016, 0.022].map((py, idx) => {
              const probeColors = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#ffffff'];
              return (
                <mesh key={`probe-${idx}`} position={[-0.09, py, 0]}>
                  <boxGeometry args={[0.035, 0.0025, 0.0025]} />
                  <meshBasicMaterial color={probeColors[idx]} />
                </mesh>
              );
            })}
          </group>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 4. LEFT WALL: MITRE ATT&CK FRAMEWORK MATRIX & CVE RADAR   */}
      {/* Location: X = -4.94, Y = 2.35, Z = 3.25                    */}
      {/* ======================================================== */}
      <group position={[-4.94, 2.35, 3.25]} rotation={[0, Math.PI / 2, 0]}>
        {/* Heavy Brushed Titanium Frame Housing */}
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.1, 0.045]} />
          <meshStandardMaterial color="#0f172a" metalness={0.88} roughness={0.2} />
        </mesh>
        {/* Frame Outer Chamfered Trim */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.46, 1.06, 0.01]} />
          <meshStandardMaterial color="#020617" roughness={0.6} />
        </mesh>

        {/* Dynamic MITRE ATT&CK & CVE Threat Screen */}
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[1.42, 1.02]} />
          <meshBasicMaterial map={mitreScreen.texture} toneMapped={false} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 5. LEFT WALL: WIRESHARK LIVE PCAP PACKET TELEMETRY MONITOR*/}
      {/* Location: X = -4.94, Y = 3.45, Z = 1.25                    */}
      {/* ======================================================== */}
      <group
        position={[-4.94, 3.45, 1.25]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (typeof window !== 'undefined' && window.__SET_SECTION__) {
            window.__SET_SECTION__('wireshark_monitor');
          }
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Industrial Ultra-Widescreen Monitor Chassis */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.42, 0.68, 0.035]} />
          <meshStandardMaterial color="#0b1016" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Screen Bezel Inset */}
        <mesh position={[0, 0, 0.016]}>
          <boxGeometry args={[1.38, 0.64, 0.008]} />
          <meshStandardMaterial color="#020617" roughness={0.8} />
        </mesh>

        {/* Live Functional Wireshark PCAP Packet Telemetry Screen */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.36, 0.62]} />
          <meshBasicMaterial map={wiresharkScreen.texture} toneMapped={false} />
        </mesh>

        {/* Monitor Status Diagnostic LEDs */}
        {[
          { x: 0.58, color: '#10b981', label: 'LINK' },
          { x: 0.61, color: '#38bdf8', label: 'ACT' },
          { x: 0.64, color: '#ef4444', label: 'ALERT' },
        ].map((led, i) => (
          <mesh key={`mon-led-${i}`} position={[led.x, -0.31, 0.02]}>
            <sphereGeometry args={[0.004, 8, 8]} />
            <meshBasicMaterial color={led.color} />
          </mesh>
        ))}
      </group>


      {/* ======================================================== */}
      {/* 4. LEFT WALL: MITRE ATT&CK FRAMEWORK MATRIX & CVE RADAR   */}
      {/* Location: X = -4.94, Y = 2.35, Z = 3.25                    */}
      {/* ======================================================== */}
      <group
        position={[-4.94, 2.35, 3.25]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          playHackingBeep(1500);
          if (typeof window !== 'undefined' && window.__SET_SECTION__) {
            window.__SET_SECTION__('wireshark_monitor');
          }
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Scissor Articulating Heavy Steel Wall Mount Bracket */}
        <group position={[0, 0, -0.035]}>
          {/* Wall Mounting Anchor Plate */}
          <mesh>
            <boxGeometry args={[0.65, 0.5, 0.02]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Dual Articulating Steel Scissor Arms */}
          {[-0.22, 0.22].map((armX, i) => (
            <mesh key={`mitre-arm-${i}`} position={[armX, 0, 0.018]}>
              <boxGeometry args={[0.04, 0.28, 0.035]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Soft Ambient Bias Backlight Halo (Eliminates pitch-black void) */}
        <pointLight
          position={[0, 0, -0.03]}
          color={theme.coreColor || '#10b981'}
          intensity={1.8}
          distance={2.4}
          decay={2}
        />

        {/* Heavy Brushed Titanium Frame Housing */}
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.1, 0.045]} />
          <meshStandardMaterial color="#0f172a" metalness={0.88} roughness={0.2} />
        </mesh>
        {/* Frame Outer Chamfered Trim */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[1.46, 1.06, 0.01]} />
          <meshStandardMaterial color="#020617" roughness={0.6} />
        </mesh>

        {/* Dynamic MITRE ATT&CK & CVE Threat Screen */}
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[1.42, 1.02]} />
          <meshBasicMaterial map={mitreScreen.texture} toneMapped={false} />
        </mesh>

        {/* Overhead Tactical Header Banner */}
        <group position={[0, 0.65, 0.01]}>
          <mesh>
            <boxGeometry args={[1.5, 0.12, 0.035]} />
            <meshStandardMaterial color="#0b1016" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.019]}>
            <planeGeometry args={[1.44, 0.08]} />
            <meshBasicMaterial color="#022c22" />
          </mesh>
          {/* Header Telemetry Status Dots */}
          {[-0.65, -0.6, -0.55, 0.55, 0.6, 0.65].map((dx, i) => (
            <mesh key={`th-dot-${i}`} position={[dx, 0, 0.02]}>
              <circleGeometry args={[0.009, 8]} />
              <meshBasicMaterial color={i < 3 ? '#10b981' : (i === 3 ? '#f59e0b' : '#38bdf8')} />
            </mesh>
          ))}
        </group>

        {/* Lower 2U Cyber Defense Bay & Fiber Patch Panel */}
        <group position={[0, -0.78, 0.12]}>
          {/* Wall-Mounted 19-inch Open Equipment Bracket */}
          <mesh>
            <boxGeometry args={[1.5, 0.22, 0.28]} />
            <meshStandardMaterial color="#0b1016" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Front 19-inch Black Anodized Rack Rails */}
          {[-0.72, 0.72].map((rx, idx) => (
            <mesh key={`rack-rail-${idx}`} position={[rx, 0, 0.14]}>
              <boxGeometry args={[0.03, 0.22, 0.02]} />
              <meshStandardMaterial color="#334155" metalness={0.95} />
            </mesh>
          ))}

          {/* 1U Cyber Threat Defense Appliance (Top Unit) */}
          <group position={[0, 0.05, 0.02]}>
            {/* Chassis */}
            <mesh>
              <boxGeometry args={[1.38, 0.08, 0.24]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Dual Honeycomb Cooling Fan Vents */}
            {[-0.5, -0.32].map((vx, i) => (
              <mesh key={`fan-vent-${i}`} position={[vx, 0, 0.122]}>
                <circleGeometry args={[0.028, 16]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
            ))}
            {/* Status OLED Display */}
            <mesh position={[0, 0.01, 0.122]}>
              <planeGeometry args={[0.22, 0.04]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
            {/* 8-Port Gigabit Ethernet Switch Array with Blinking LEDs */}
            {Array.from({ length: 8 }).map((_, i) => (
              <group key={`eth-port-${i}`} position={[0.22 + i * 0.045, 0, 0.122]}>
                <mesh>
                  <boxGeometry args={[0.025, 0.025, 0.005]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
                <mesh position={[0, 0.016, 0.002]}>
                  <sphereGeometry args={[0.003, 6, 6]} />
                  <meshBasicMaterial color={i % 2 === 0 ? '#22c55e' : '#f59e0b'} />
                </mesh>
              </group>
            ))}
          </group>

          {/* 1U High-Density Fiber Optic Patch Panel (Bottom Unit) */}
          <group position={[0, -0.05, 0.02]}>
            <mesh>
              <boxGeometry args={[1.38, 0.08, 0.24]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            {/* Array of 10 LC Duplex Fiber Couplers with Colorful Fiber Jumpers */}
            {Array.from({ length: 10 }).map((_, i) => {
              const fiberColors = ['#06b6d4', '#eab308', '#f97316', '#22c55e'];
              return (
                <group key={`fiber-coupler-${i}`} position={[-0.5 + i * 0.11, 0, 0.122]}>
                  <mesh>
                    <boxGeometry args={[0.035, 0.025, 0.008]} />
                    <meshStandardMaterial color="#475569" metalness={0.9} />
                  </mesh>
                  {/* Looping Fiber Patch Cord */}
                  <mesh position={[0, -0.03, 0.02]} rotation={[0.4, 0, 0]}>
                    <cylinderGeometry args={[0.003, 0.003, 0.06, 8]} />
                    <meshBasicMaterial color={fiberColors[i % 4]} />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 5. LEFT WALL: WIRESHARK LIVE PCAP PACKET TELEMETRY MONITOR*/}
      {/* Location: X = -4.94, Y = 3.45, Z = 1.25                    */}
      {/* ======================================================== */}
      <group
        position={[-4.94, 3.45, 1.25]}
        rotation={[0.08, Math.PI / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (typeof window !== 'undefined' && window.__SET_SECTION__) {
            window.__SET_SECTION__('wireshark_monitor');
          }
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Industrial Articulating Steel Wall Mount Bracket */}
        <group position={[0, 0, -0.03]}>
          <mesh>
            <boxGeometry args={[0.5, 0.35, 0.02]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {[-0.15, 0.15].map((mx, idx) => (
            <mesh key={`wire-bracket-${idx}`} position={[mx, 0, 0.015]}>
              <boxGeometry args={[0.035, 0.2, 0.03]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          ))}
        </group>

        {/* Ambient Cyan Bias Backlight Glow Strip */}
        <pointLight
          position={[0, 0, -0.02]}
          color="#0284c7"
          intensity={1.4}
          distance={2.0}
          decay={2}
        />

        {/* Industrial Ultra-Widescreen Monitor Chassis */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.42, 0.68, 0.035]} />
          <meshStandardMaterial color="#0b1016" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Screen Bezel Inset */}
        <mesh position={[0, 0, 0.016]}>
          <boxGeometry args={[1.38, 0.64, 0.008]} />
          <meshStandardMaterial color="#020617" roughness={0.8} />
        </mesh>

        {/* Live Functional Wireshark PCAP Packet Telemetry Screen */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.36, 0.62]} />
          <meshBasicMaterial map={wiresharkScreen.texture} toneMapped={false} />
        </mesh>

        {/* Top-Mounted Security Optical Sensor / Camera Module */}
        <group position={[0, 0.36, 0.01]}>
          <mesh>
            <boxGeometry args={[0.12, 0.03, 0.03]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.016]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Monitor Status Diagnostic LEDs */}
        {[
          { x: 0.58, color: '#10b981', label: 'LINK' },
          { x: 0.61, color: '#38bdf8', label: 'ACT' },
          { x: 0.64, color: '#ef4444', label: 'ALERT' },
        ].map((led, i) => (
          <mesh key={`mon-led-${i}`} position={[led.x, -0.31, 0.02]}>
            <sphereGeometry args={[0.004, 8, 8]} />
            <meshBasicMaterial color={led.color} />
          </mesh>
        ))}
      </group>

      {/* ======================================================== */}
      {/* 5B. INDUSTRIAL CABLE CONDUITS & INTERCONNECT TRUNKING     */}
      {/* Heavy-duty conduit runs linking systems across Left Wall  */}
      {/* ======================================================== */}
      <group position={[-4.92, 0, 0]}>
        {/* 1. Vertical Ceiling Cable Trunk to Wireshark & Arsenal */}
        <mesh position={[0, 4.05, 1.25]}>
          <boxGeometry args={[0.03, 0.5, 0.05]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* 2. Vertical Conduit between Wireshark and Hardware Pegboard */}
        <mesh position={[0, 3.06, 1.25]}>
          <boxGeometry args={[0.025, 0.22, 0.04]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        {/* 3. Vertical Ceiling Cable Trunk to MITRE Threat Radar */}
        <mesh position={[0, 3.65, 3.25]}>
          <boxGeometry args={[0.03, 1.3, 0.05]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* 4. Horizontal Interconnect Conduit Bridge between Systems */}
        <mesh position={[0, 3.06, 2.25]}>
          <boxGeometry args={[0.02, 0.025, 2.0]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Conduit Junction Boxes */}
        {[1.25, 2.25, 3.25].map((jz, idx) => (
          <mesh key={`jbox-${idx}`} position={[0.01, 3.06, jz]}>
            <boxGeometry args={[0.03, 0.06, 0.06]} />
            <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>
      {/* ======================================================== */}
      {/* 6. BACK WALL: CYBERSECURITY CERTIFICATION PLAQUES & TICKER*/}
      {/* Location: Z = -4.95, between X = -4.2 and -2.2, Y = 3.25   */}
      {/* ======================================================== */}
      <group position={[-3.2, 3.15, -4.95]}>
        {/* 3 Prestigious Framed Wall Certificates */}
        {[
          { x: -0.65, title: 'OSCP', badgeColor: '#d4af37', plateColor: '#1e293b' },
          { x: 0, title: 'BRICS_CHAMPION', badgeColor: '#34d399', plateColor: '#0f291e' },
          { x: 0.65, title: 'CISSP_ARCHITECT', badgeColor: '#38bdf8', plateColor: '#0c2340' },
        ].map((cert, idx) => (
          <group key={`cert-${idx}`} position={[cert.x, 0, 0]}>
            {/* Dark Walnut Frame */}
            <mesh>
              <boxGeometry args={[0.48, 0.36, 0.03]} />
              <meshStandardMaterial color="#1c1917" roughness={0.4} metalness={0.2} />
            </mesh>
            {/* Certificate Parchment Inset */}
            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={[0.42, 0.3]} />
              <meshBasicMaterial color={cert.plateColor} />
            </mesh>
            {/* Metallic Gold/Emerald Seal Badge */}
            <mesh position={[0, -0.06, 0.022]}>
              <circleGeometry args={[0.045, 16]} />
              <meshStandardMaterial color={cert.badgeColor} metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Certificate Header Banner */}
            <mesh position={[0, 0.08, 0.02]}>
              <planeGeometry args={[0.3, 0.03]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
            </mesh>
          </group>
        ))}

        {/* Digital Telemetry Marquee Status Ticker Bar */}
        <group position={[0, 0.38, 0]}>
          <mesh>
            <boxGeometry args={[1.9, 0.12, 0.025]} />
            <meshStandardMaterial color="#090d0b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <planeGeometry args={[1.82, 0.07]} />
            <meshBasicMaterial color="#042f2e" />
          </mesh>
          {/* Ticker Status Indicator LED Dots */}
          {[-0.8, -0.6, -0.4, 0.4, 0.6, 0.8].map((dotX, i) => (
            <mesh key={`ticker-dot-${i}`} position={[dotX, 0, 0.02]}>
              <circleGeometry args={[0.015, 8]} />
              <meshBasicMaterial color={i % 2 === 0 ? theme.coreColor : '#38bdf8'} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ======================================================== */}
      {/* 7. RIGHT LOW WALL DIVIDER: AMBIENT RECESSED LED TROUGH    */}
      {/* Location: X = 5.0, Y = 1.95, Z = 1.6                       */}
      {/* ======================================================== */}
      <group position={[5.0, 1.98, 1.6]}>
        {/* Dark Walnut Top Railing Cap */}
        <mesh>
          <boxGeometry args={[0.22, 0.04, 4.25]} />
          <meshStandardMaterial color="#1a1410" roughness={0.4} metalness={0.3} />
        </mesh>
        {/* Recessed Glowing Neon Light Channel */}
        <mesh position={[-0.08, -0.015, 0]}>
          <boxGeometry args={[0.02, 0.015, 4.15]} />
          <meshBasicMaterial color={theme.accentColor} />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 8. BACK WALL: CYBERPUNK POP-ART POSTER FRAME (Image 1)   */}
      {/* Location: X = 0.3, Y = 2.75, Z = -4.92                    */}
      {/* ======================================================== */}
      <group position={[0.3, 2.75, -4.92]}>
        {/* Gallery Anodized Black Metal Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.18, 1.48, 0.04]} />
          <meshStandardMaterial color="#0b1016" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Frame Inner Neon Pink Bevel Liner */}
        <mesh position={[0, 0, 0.018]}>
          <boxGeometry args={[1.14, 1.44, 0.01]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>

        {/* Dynamic Pop-Art Marilyn Canvas */}
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[1.12, 1.42]} />
          <meshBasicMaterial map={popArtScreen.texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
