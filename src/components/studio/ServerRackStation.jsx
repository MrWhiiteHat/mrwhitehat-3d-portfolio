import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playHackingBeep } from '../../utils/audio.js';

/**
 * 42U High-Density Enterprise Cyber Server Rack
 * Fills the blank space between Conference Area and Archives with authentic network hardware.
 */
export default function ServerRackStation() {
  const [activeBurst, setActiveBurst] = useState(false);
  const fanRef = useRef();
  const kvmGlowRef = useRef();
  const ledGroupRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

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
          <meshPhysicalMaterial
            color="#04120a"
            transmission={0.65}
            roughness={0.2}
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
      </group>
    </group>
  );
}
