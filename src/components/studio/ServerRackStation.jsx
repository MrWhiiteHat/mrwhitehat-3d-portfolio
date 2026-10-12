import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playHackingBeep } from '../../utils/audio.js';
import { createSystemHackedHoloScreen } from '../../utils/cyberScreens.js';

/**
 * 42U High-Density Enterprise Cyber Server Rack
 * Fills the blank space between Conference Area and Archives with authentic network hardware.
 */
export default function ServerRackStation() {
  const [activeBurst, setActiveBurst] = useState(false);
  const fanRef = useRef();
  const kvmGlowRef = useRef();
  const ledGroupRef = useRef();
  const breachAlarmRef = useRef();
  const holo1Ref = useRef();
  const holo2Ref = useRef();
  const holo3Ref = useRef();

  // Floating Holographic "SYSTEM HACKED" HUD Screen (from Image 2)
  const holoScreen = useMemo(() => createSystemHackedHoloScreen(), []);
  const screenTimer = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 0. Update Holographic Alert Screen (Throttled to 5 FPS for zero GPU overhead)
    screenTimer.current += delta;
    if (screenTimer.current > 0.2) {
      holoScreen.update(screenTimer.current);
      screenTimer.current = 0;
    }

    // 1. Spinning Rack Exhaust Fans at top
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * 12;
    }

    // 2. KVM Console Glow Pulse
    if (kvmGlowRef.current) {
      kvmGlowRef.current.intensity = (activeBurst ? 3.0 : 1.8) + Math.sin(time * 3.5) * 0.4;
    }

    // 3. Random blinking port activity LEDs
    if (ledGroupRef.current) {
      ledGroupRef.current.children.forEach((child, i) => {
        const rate = activeBurst ? 28 : 10;
        child.visible = Math.sin(time * rate + i * 1.7) > -0.1;
      });
    }

    // 4. Breach Alarm Strobe
    if (breachAlarmRef.current) {
      breachAlarmRef.current.intensity = (activeBurst ? 4.2 : 2.4) + Math.sin(time * 7) * 1.6;
    }

    // 5. Floating Holographic HUD Hover Sine Waves
    if (holo1Ref.current) {
      holo1Ref.current.position.y = 2.2 + Math.sin(time * 2.2) * 0.035;
      holo1Ref.current.rotation.y = 0.12 + Math.sin(time * 1.4) * 0.02;
    }
    if (holo2Ref.current) {
      holo2Ref.current.position.y = 1.65 + Math.sin(time * 2.6 + 1.2) * 0.03;
      holo2Ref.current.rotation.y = -0.16 + Math.cos(time * 1.8) * 0.02;
    }
    if (holo3Ref.current) {
      holo3Ref.current.position.y = 1.35 + Math.sin(time * 2.0 + 2.4) * 0.025;
      holo3Ref.current.rotation.y = 0.2 + Math.sin(time * 1.6) * 0.02;
    }
  });

  const handleRackClick = (e) => {
    e.stopPropagation();
    playHackingBeep(1800);
    setActiveBurst((prev) => !prev);
    if (typeof window !== 'undefined' && window.__SET_SECTION__) {
      window.__SET_SECTION__('server_rack');
    }
  };

  return (
    <group
      position={[-2.3, 0, -4.55]}
      name="ServerRackStation"
      onClick={handleRackClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* ========================================================================= */}
      {/* 1. 42U CABINET CHASSIS                                                    */}
      {/* ========================================================================= */}
      {/* Cabinet Main Shell: Width: 0.9m, Height: 2.8m, Depth: 0.85m */}
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 2.8, 0.85]} />
        <meshStandardMaterial color="#080e0c" roughness={0.35} metalness={0.85} />
      </mesh>

      {/* Internal Rack Cavity (Dark inset bay) */}
      <mesh position={[0, 1.4, 0.05]}>
        <boxGeometry args={[0.76, 2.65, 0.74]} />
        <meshStandardMaterial color="#030605" roughness={0.7} />
      </mesh>

      {/* Vertical EIA-310 Mounting Rails (Left & Right 19" rails) */}
      <mesh position={[-0.34, 1.4, 0.38]}>
        <boxGeometry args={[0.04, 2.6, 0.04]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.34, 1.4, 0.38]}>
        <boxGeometry args={[0.04, 2.6, 0.04]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Top Roof Fan Grille & Exhaust Fans */}
      <mesh position={[0, 2.81, 0]}>
        <boxGeometry args={[0.8, 0.02, 0.75]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
      </mesh>
      <group ref={fanRef} position={[0, 2.78, 0]}>
        {[-0.2, 0.2].map((fx, i) => (
          <group key={`rfan-${i}`} position={[fx, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
            <meshBasicMaterial color="#38bdf8" wireframe />
          </group>
        ))}
      </group>

      {/* ========================================================================= */}
      {/* 2. RACKMOUNT HARDWARE BLADES & SWITCHES (Bottom to Top)                   */}
      {/* ========================================================================= */}

      {/* 2A. Dual Redundant UPS Battery Units (Bottom: Y = 0.3, 0.6) */}
      {[0.28, 0.58].map((uy, idx) => (
        <group key={`ups-${idx}`} position={[0, uy, 0.36]}>
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.24, 0.06]} />
            <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* LCD Status Display */}
          <mesh position={[-0.18, 0, 0.032]}>
            <planeGeometry args={[0.14, 0.06]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          {/* Blue Power LED */}
          <mesh position={[0.22, 0, 0.032]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* 2B. 2x 2U High-Compute GPU AI / Password Hash Cracking Nodes (Y = 0.92, 1.22) */}
      {[0.92, 1.22].map((sy, idx) => (
        <group key={`server-blade-${idx}`} position={[0, sy, 0.36]}>
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.16, 0.06]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Honeycomb Air Intake Mesh */}
          <mesh position={[0, 0, 0.032]}>
            <planeGeometry args={[0.42, 0.12]} />
            <meshBasicMaterial color="#047857" transparent opacity={0.65} />
          </mesh>
          {/* Server Hot-Swap Drive Bays (4 bays) */}
          {[-0.26, -0.22, -0.18, -0.14].map((dx, i) => (
            <mesh key={`drive-${idx}-${i}`} position={[dx, 0, 0.032]}>
              <boxGeometry args={[0.032, 0.12, 0.005]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          ))}
          {/* Status LEDs */}
          <mesh position={[0.26, 0.04, 0.032]}>
            <sphereGeometry args={[0.006, 8, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <mesh position={[0.26, -0.04, 0.032]}>
            <sphereGeometry args={[0.006, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* 2C. 1U Pull-out KVM Rack Console with Mini CRT Monitor (Y = 1.48) */}
      <group position={[0, 1.48, 0.37]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.08, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Glowing KVM Diagnostic Screen */}
        <mesh position={[0, 0.02, 0.042]}>
          <planeGeometry args={[0.24, 0.06]} />
          <meshBasicMaterial color={activeBurst ? '#34d399' : '#10b981'} />
        </mesh>
        <pointLight
          ref={kvmGlowRef}
          position={[0, 0.04, 0.1]}
          color="#34d399"
          intensity={1.8}
          distance={1.5}
        />
        {/* Mini Membrane Keyboard Trackpad */}
        <mesh position={[0, -0.025, 0.042]}>
          <planeGeometry args={[0.3, 0.024]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* 2D. 48-Port High-Speed Network Core Switches (Y = 1.72, 1.9) */}
      {[1.72, 1.9].map((swY, sIdx) => (
        <group key={`switch-${sIdx}`} position={[0, swY, 0.36]}>
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.07, 0.06]} />
            <meshStandardMaterial color="#090d0b" metalness={0.8} />
          </mesh>

          {/* RJ-45 Port Clusters with active blinking packet LEDs */}
          <group ref={sIdx === 0 ? ledGroupRef : null} position={[0, 0, 0.032]}>
            {Array.from({ length: 16 }).map((_, p) => {
              const px = -0.28 + p * 0.037;
              return (
                <group key={`port-${p}`} position={[px, 0, 0]}>
                  {/* Port Jack */}
                  <mesh>
                    <boxGeometry args={[0.022, 0.024, 0.005]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                  {/* Blinking Activity LED */}
                  <mesh position={[0, 0.02, 0]}>
                    <sphereGeometry args={[0.003, 6, 6]} />
                    <meshBasicMaterial color={p % 3 === 0 ? '#38bdf8' : p % 2 === 0 ? '#4ade80' : '#f59e0b'} />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      ))}

      {/* 2E. Patch Cables (Neon Green & Cyan loops connecting ports to D-rings) */}
      {[
        { x: -0.25, c: '#4ade80' },
        { x: -0.15, c: '#38bdf8' },
        { x: -0.05, c: '#4ade80' },
        { x: 0.05, c: '#38bdf8' },
        { x: 0.15, c: '#f59e0b' },
        { x: 0.25, c: '#4ade80' },
      ].map((cable, cIdx) => {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(cable.x, 1.72, 0.39),
          new THREE.Vector3(cable.x * 0.8, 1.62, 0.46),
          new THREE.Vector3(cable.x + 0.04, 1.9, 0.39)
        );
        const tubeGeo = new THREE.TubeGeometry(curve, 10, 0.004, 6, false);
        return (
          <mesh key={`patch-cord-${cIdx}`} geometry={tubeGeo}>
            <meshStandardMaterial color={cable.c} roughness={0.3} metalness={0.2} />
          </mesh>
        );
      })}

      {/* 2F. Top 1U Firewall & Intrusion Detection Hardware (Y = 2.15, 2.35) */}
      {[2.15, 2.35].map((fy, fIdx) => (
        <group key={`firewall-${fIdx}`} position={[0, fy, 0.36]}>
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.08, 0.06]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} />
          </mesh>
          {/* Glowing Red/Cyan Security Status Bar */}
          <mesh position={[0, 0, 0.032]}>
            <planeGeometry args={[0.5, 0.015]} />
            <meshBasicMaterial color={fIdx === 0 ? '#ef4444' : '#38bdf8'} />
          </mesh>
        </group>
      ))}

      {/* ========================================================================= */}
      {/* 3. PERFORATED HEXAGONAL GLASS & MESH DOOR FRAME                           */}
      {/* ========================================================================= */}
      <group position={[0, 1.4, 0.435]}>
        {/* Left & Right Door Hinged Metal Stile */}
        <mesh position={[-0.41, 0, 0]}>
          <boxGeometry args={[0.07, 2.7, 0.02]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.41, 0, 0]}>
          <boxGeometry args={[0.07, 2.7, 0.02]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Recessed Perforated Mesh Glass Panel */}
        <mesh>
          <planeGeometry args={[0.76, 2.65]} />
          <meshStandardMaterial
            color="#04120a"
            roughness={0.25}
            metalness={0.4}
            transparent
            opacity={0.45}
          />
        </mesh>
        {/* Chrome Door Key Handle */}
        <mesh position={[0.34, 0, 0.02]}>
          <boxGeometry args={[0.03, 0.16, 0.02]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Repeating Horizontal Hazard Warning Ribbon across Glass (from Image 2) */}
        <group position={[0, 0.35, 0.015]}>
          <mesh>
            <planeGeometry args={[0.88, 0.08]} />
            <meshBasicMaterial color="#ff1744" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.002]}>
            <planeGeometry args={[0.86, 0.06]} />
            <meshBasicMaterial color="#99001a" />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 4. FLOATING TRANSLUCENT HOLOGRAPHIC HUD ALERTS (Directly from Image 2)    */}
      {/* Floating HUD windows with glowing red [!] hazard badge & breach alerts    */}
      {/* ========================================================================= */}
      {/* Holographic Alert Panel 1 (Primary Center Card) */}
      <group ref={holo1Ref} position={[0.08, 2.2, 0.72]}>
        {/* Holographic Translucent Cyan Glass Substrate */}
        <mesh>
          <boxGeometry args={[0.76, 0.46, 0.006]} />
          <meshStandardMaterial
            color="#00f5ff"
            roughness={0.15}
            metalness={0.1}
            transparent
            opacity={0.32}
          />
        </mesh>
        {/* Glowing Cyan Wireframe Frame Outline */}
        <mesh>
          <boxGeometry args={[0.765, 0.465, 0.008]} />
          <meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.7} />
        </mesh>
        {/* Live Dynamic Holographic Display Screen */}
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.74, 0.44]} />
          <meshBasicMaterial
            map={holoScreen.texture}
            transparent
            opacity={0.92}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Holographic Alert Panel 2 (Left Angled Staggered Card) */}
      <group ref={holo2Ref} position={[-0.38, 1.65, 0.82]} scale={0.82}>
        <mesh>
          <boxGeometry args={[0.76, 0.46, 0.006]} />
          <meshStandardMaterial
            color="#00f5ff"
            roughness={0.15}
            metalness={0.1}
            transparent
            opacity={0.28}
          />
        </mesh>
        <mesh>
          <boxGeometry args={[0.765, 0.465, 0.008]} />
          <meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.74, 0.44]} />
          <meshBasicMaterial
            map={holoScreen.texture}
            transparent
            opacity={0.85}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Holographic Alert Panel 3 (Right Angled Staggered Card) */}
      <group ref={holo3Ref} position={[0.42, 1.35, 0.88]} scale={0.75}>
        <mesh>
          <boxGeometry args={[0.76, 0.46, 0.006]} />
          <meshStandardMaterial
            color="#00f5ff"
            roughness={0.15}
            metalness={0.1}
            transparent
            opacity={0.25}
          />
        </mesh>
        <mesh>
          <boxGeometry args={[0.765, 0.465, 0.008]} />
          <meshBasicMaterial color="#00f5ff" wireframe transparent opacity={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.74, 0.44]} />
          <meshBasicMaterial
            map={holoScreen.texture}
            transparent
            opacity={0.8}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Flashing Red Breach Alarm Strobe Point Light */}
      <pointLight
        ref={breachAlarmRef}
        position={[0, 2.1, 0.8]}
        color="#ff1744"
        intensity={2.6}
        distance={3.2}
      />
    </group>
  );
}
