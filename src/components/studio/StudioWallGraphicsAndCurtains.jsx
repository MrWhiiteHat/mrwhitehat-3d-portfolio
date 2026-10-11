import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LIGHTING_THEMES } from './CyberAtmosphere.jsx';

export default function StudioWallGraphicsAndCurtains({ currentThemeKey = 'CYBER_MATRIX' }) {
  const theme = LIGHTING_THEMES[currentThemeKey] || LIGHTING_THEMES.CYBER_MATRIX;

  // Refs for animated elements
  const leftCurtainRef = useRef();
  const rightCurtainRef = useRef();
  const trafficLane1Ref = useRef();
  const trafficLane2Ref = useRef();
  const eqBarsRef = useRef([]);
  const hexPanelsRef = useRef([]);
  const packetDotRef = useRef();
  const rooftopBeaconRef = useRef();
  const billboardGlowRef = useRef();

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

  // Equalizer frequencies (10 bars)
  const eqData = useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => ({
      freq: 2.0 + i * 0.8,
      baseH: 0.15 + (Math.sin(i * 0.7) + 1) * 0.12,
    }));
  }, []);

  // Hexagonal LED panel cluster layout (7 hexagons)
  const hexPanels = useMemo(() => {
    const s = 0.22; // Hex radius
    const dx = s * 1.5;
    const dy = s * Math.sqrt(3) * 0.5;
    return [
      { z: 0, y: 0, delay: 0 },
      { z: dx, y: dy, delay: 0.4 },
      { z: dx, y: -dy, delay: 0.8 },
      { z: -dx, y: dy, delay: 1.2 },
      { z: -dx, y: -dy, delay: 1.6 },
      { z: 0, y: dy * 2, delay: 2.0 },
      { z: 0, y: -dy * 2, delay: 2.4 },
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

    // 3. Audio Equalizer LED Bars Animation
    eqBarsRef.current.forEach((bar, i) => {
      if (bar) {
        const d = eqData[i];
        const h = d.baseH + (Math.sin(time * d.freq) * 0.5 + 0.5) * 0.28;
        bar.scale.y = h;
      }
    });

    // 4. Hexagonal Sound Reactive LED Panels (Breathing wave)
    hexPanelsRef.current.forEach((panel, i) => {
      if (panel && panel.material) {
        const glow = 0.35 + (Math.sin(time * 2.4 + hexPanels[i].delay) * 0.5 + 0.5) * 0.65;
        panel.material.opacity = glow;
      }
    });

    // 5. Network Circuit Packet Pulse along blueprint
    if (packetDotRef.current) {
      const cycle = (time * 0.8) % 1;
      packetDotRef.current.position.y = -0.35 + cycle * 0.7;
      packetDotRef.current.position.z = Math.sin(cycle * Math.PI * 4) * 0.25;
    }

    // 6. Rooftop Beacon & Billboard Glow
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
      {/* 3. LEFT WALL: HEXAGONAL SOUND-REACTIVE LED PANELS CLUSTER */}
      {/* Location: X = -4.95, Y = 2.4, Z = 1.25                     */}
      {/* ======================================================== */}
      <group position={[-4.94, 2.35, 1.25]} rotation={[0, Math.PI / 2, 0]}>
        {/* Mounting Backplate Panel */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[1.2, 1.2, 0.015]} />
          <meshStandardMaterial color="#0b110e" roughness={0.6} />
        </mesh>

        {/* 7 Hexagonal Diffuser Plates */}
        {hexPanels.map((hex, idx) => (
          <group key={`hex-${idx}`} position={[hex.z, hex.y, 0.01]}>
            {/* Outer Hexagon Frame */}
            <mesh rotation={[0, 0, Math.PI / 6]}>
              <cylinderGeometry args={[0.2, 0.2, 0.018, 6]} />
              <meshStandardMaterial color="#14211a" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Glowing Frosted Core Plate */}
            <mesh
              ref={(el) => (hexPanelsRef.current[idx] = el)}
              position={[0, 0, 0.01]}
              rotation={[0, 0, Math.PI / 6]}
            >
              <cylinderGeometry args={[0.17, 0.17, 0.015, 6]} />
              <meshBasicMaterial color={theme.coreColor} transparent opacity={0.65} />
            </mesh>
          </group>
        ))}

        {/* Hex Cluster Ambient Point Glow */}
        <pointLight position={[0, 0, 0.2]} color={theme.coreColor} intensity={2.2} distance={3.0} />
      </group>

      {/* ======================================================== */}
      {/* 4. LEFT WALL: ILLUMINATED ZERO-TRUST NETWORK BLUEPRINT    */}
      {/* Location: X = -4.94, Y = 2.35, Z = 3.25                    */}
      {/* ======================================================== */}
      <group position={[-4.94, 2.35, 3.25]} rotation={[0, Math.PI / 2, 0]}>
        {/* Heavy Brushed Aluminum Frame */}
        <mesh>
          <boxGeometry args={[1.5, 1.1, 0.04]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.25} />
        </mesh>

        {/* Dark Back-lit Acrylic Panel */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[1.4, 1.0]} />
          <meshBasicMaterial color="#050e09" />
        </mesh>

        {/* Circuit Schematic Grid Lines */}
        {[-0.35, -0.15, 0.05, 0.25].map((gy, i) => (
          <mesh key={`grid-h-${i}`} position={[0, gy, 0.025]}>
            <planeGeometry args={[1.25, 0.005]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
          </mesh>
        ))}
        {[-0.45, -0.15, 0.15, 0.45].map((gx, i) => (
          <mesh key={`grid-v-${i}`} position={[gx, 0, 0.025]}>
            <planeGeometry args={[0.005, 0.85]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
          </mesh>
        ))}

        {/* Schematic Architecture Core Nodes */}
        {[
          { x: -0.35, y: 0.15, label: 'FIREWALL' },
          { x: 0, y: 0.15, label: 'ROUTER' },
          { x: 0.35, y: 0.15, label: 'DATABASE' },
          { x: 0, y: -0.2, label: 'CTOS_KERNEL' },
        ].map((node, i) => (
          <group key={`node-${i}`} position={[node.x, node.y, 0.026]}>
            <mesh>
              <circleGeometry args={[0.055, 16]} />
              <meshBasicMaterial color={theme.accentColor} />
            </mesh>
            <mesh position={[0, 0, 0.002]}>
              <ringGeometry args={[0.07, 0.08, 16]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
          </group>
        ))}

        {/* Animated Moving Data Packet Dot on Circuit */}
        <mesh ref={packetDotRef} position={[0, 0, 0.028]}>
          <circleGeometry args={[0.025, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Blueprint Title Header Label */}
        <mesh position={[0, 0.42, 0.025]}>
          <planeGeometry args={[0.9, 0.06]} />
          <meshBasicMaterial color="#064e3b" />
        </mesh>
      </group>

      {/* ======================================================== */}
      {/* 5. LEFT WALL: LIVE AUDIO SPECTRUM EQUALIZER LED BARS      */}
      {/* Location: X = -4.94, Y = 3.45, Z = 1.25                    */}
      {/* ======================================================== */}
      <group position={[-4.94, 3.45, 1.25]} rotation={[0, Math.PI / 2, 0]}>
        {/* Equalizer Chassis Housing */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.0, 0.45, 0.025]} />
          <meshStandardMaterial color="#0d1410" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* 10 Animated Frequency Columns */}
        {eqData.map((_, i) => {
          const xPos = -0.4 + i * 0.088;
          return (
            <group key={`eq-col-${i}`} position={[xPos, -0.15, 0.015]}>
              <mesh
                ref={(el) => (eqBarsRef.current[i] = el)}
                position={[0, 0.15, 0]}
              >
                <planeGeometry args={[0.05, 0.3]} />
                <meshBasicMaterial
                  color={i > 7 ? '#f43f5e' : i > 5 ? '#f59e0b' : theme.coreColor}
                  transparent
                  opacity={0.85}
                />
              </mesh>
            </group>
          );
        })}
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
        <pointLight
          position={[-0.15, -0.05, 0]}
          color={theme.accentColor}
          intensity={1.2}
          distance={2.5}
        />
      </group>
    </group>
  );
}
