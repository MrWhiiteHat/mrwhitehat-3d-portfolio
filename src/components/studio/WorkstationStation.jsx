import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playHackingBeep, playWhooshSound } from '../../utils/audio.js';
import {
  getWalnutWoodTextures,
  getPebbledLeatherTextures,
  getBrushedMetalTextures,
} from '../../utils/textures.js';
import { createTerminalScreen, createRadarScreen } from '../../utils/cyberScreens.js';
import HackerDeskGadgets from './HackerDeskGadgets.jsx';

export default function WorkstationStation({ onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const mugBounceRef = useRef(0);
  const fan1Ref = useRef();
  const fan2Ref = useRef();
  const steam1Ref = useRef();
  const steam2Ref = useRef();
  const steam3Ref = useRef();
  const deskLedRef = useRef();
  const mugRef = useRef();

  // High-End Procedural PBR Textures
  const walnutDesk = useMemo(() => getWalnutWoodTextures(2, 1), []);
  const chairLeather = useMemo(() => getPebbledLeatherTextures(2, 2, '#141c17'), []);
  const deskMetal = useMemo(() => getBrushedMetalTextures(1, 2, '#1c1c1c'), []);
  const chairMetal = useMemo(() => getBrushedMetalTextures(1, 1, '#888888'), []);

  // Functional Animated Cyber Screens
  const terminalScreen = useMemo(() => createTerminalScreen(), []);
  const radarScreen = useMemo(() => createRadarScreen(), []);
  const screenUpdateTimer = useRef(0);
  const screenToggle = useRef(false);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 0. Update Live PC Screens (Throttled & Alternated for optimal 60fps pacing)
    screenUpdateTimer.current += delta;
    if (screenUpdateTimer.current > 0.125) {
      if (screenToggle.current) {
        terminalScreen.update(screenUpdateTimer.current);
      } else {
        radarScreen.update(screenUpdateTimer.current);
      }
      screenToggle.current = !screenToggle.current;
      screenUpdateTimer.current = 0;
    }

    // 1. Spinning PC Fans
    if (fan1Ref.current) fan1Ref.current.rotation.z += delta * 14;
    if (fan2Ref.current) fan2Ref.current.rotation.z += delta * 14;

    // 2. Steaming Coffee Mug
    if (steam1Ref.current) {
      steam1Ref.current.position.y = 0.08 + ((time * 0.12) % 0.14);
      steam1Ref.current.scale.setScalar(0.8 + ((time * 0.12) % 0.14) * 5);
    }
    if (steam2Ref.current) {
      steam2Ref.current.position.y = 0.08 + (((time + 0.5) * 0.12) % 0.14);
      steam2Ref.current.scale.setScalar(0.8 + (((time + 0.5) * 0.12) % 0.14) * 5);
    }
    if (steam3Ref.current) {
      steam3Ref.current.position.y = 0.08 + (((time + 1.0) * 0.12) % 0.14);
      steam3Ref.current.scale.setScalar(0.8 + (((time + 1.0) * 0.12) % 0.14) * 5);
    }

    // 3. Mug Bounce animation when clicked
    if (mugRef.current && mugBounceRef.current > 0) {
      mugRef.current.position.y = 0.04 + Math.sin(mugBounceRef.current * Math.PI) * 0.03;
      mugBounceRef.current = Math.max(0, mugBounceRef.current - delta * 4);
    }

    // 4. Desk Edge LED Pulse
    if (deskLedRef.current) {
      deskLedRef.current.intensity = 1.2 + Math.sin(time * 2.2) * 0.6;
    }
  });

  const handleMugClick = (e) => {
    e.stopPropagation();
    playClickSound(1050, 0.08);
    mugBounceRef.current = 1.0;
    terminalScreen.injectCommand('curl -s https://api.coffee/brew | jq .status');
  };

  const handleKeyboardClick = (e) => {
    e.stopPropagation();
    playClickSound(850 + Math.random() * 300, 0.03);
    const cyberCommands = [
      'nmap -T4 -A -p 22,80,443,8080 192.168.1.1/24',
      'msfconsole -q -x "use exploit/multi/handler"',
      'hydra -l admin -P wordlist.txt 10.0.4.1 ssh',
      'hashcat -m 0 -a 0 hashes.txt rockyou.txt',
      'tcpdump -i eth0 -n -c 10 port 443',
      'sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT',
      './privilege_escalation.sh --target=ctos_core',
    ];
    const cmd = cyberCommands[Math.floor(Math.random() * cyberCommands.length)];
    terminalScreen.injectCommand(cmd);
  };

  return (
    <group position={[-1.2, 0, 0.4]} name="WorkstationStation">
      {/* 1. Executive Modern Desk */}
      <group position={[0, 0, 0]}>
        {/* Desk Top Surface */}
        <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.7, 0.08, 1.3]} />
          <meshStandardMaterial {...walnutDesk} roughness={0.34} metalness={0.08} />
        </mesh>

        {/* Desk Matte Black Bevel Under-frame */}
        <mesh position={[0, 0.68, 0]} castShadow>
          <boxGeometry args={[2.6, 0.04, 1.2]} />
          <meshStandardMaterial {...deskMetal} roughness={0.5} metalness={0.8} />
        </mesh>

        {/* Front Edge Glowing Neon LED Strip */}
        <mesh position={[0, 0.71, 0.64]}>
          <boxGeometry args={[2.58, 0.015, 0.015]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight
          ref={deskLedRef}
          position={[0, 0.68, 0.72]}
          color="#38bdf8"
          intensity={1.2}
          distance={1.6}
        />

        {/* Sturdy Metal Legs (4 corner posts) */}
        {[
          [-1.25, 0.35, -0.55],
          [1.25, 0.35, -0.55],
          [-1.25, 0.35, 0.55],
          [1.25, 0.35, 0.55],
        ].map((pos, i) => (
          <mesh key={`desk-leg-${i}`} position={pos} castShadow>
            <boxGeometry args={[0.07, 0.7, 0.07]} />
            <meshStandardMaterial {...deskMetal} roughness={0.3} metalness={0.9} />
          </mesh>
        ))}

        {/* Cable Raceway & Privacy Backplate */}
        <mesh position={[0, 0.45, -0.55]} castShadow>
          <boxGeometry args={[2.4, 0.4, 0.02]} />
          <meshStandardMaterial {...deskMetal} roughness={0.65} metalness={0.5} />
        </mesh>
      </group>

      {/* 2. Cyber Desk Mat & Peripherals */}
      <group position={[0, 0.785, 0.15]}>
        {/* Extra-large Cyber Desk Mat */}
        <mesh position={[-0.1, 0.002, 0]} receiveShadow>
          <boxGeometry args={[1.6, 0.005, 0.7]} />
          <meshStandardMaterial color="#0a120e" roughness={0.9} />
        </mesh>
        {/* Desk Mat Neon Border */}
        <mesh position={[-0.1, 0.003, 0]}>
          <boxGeometry args={[1.58, 0.002, 0.68]} />
          <meshStandardMaterial color="#061f14" roughness={0.7} />
        </mesh>

        {/* Interactive Mechanical Keyboard */}
        <group
          position={[-0.2, 0.015, 0.08]}
          onClick={handleKeyboardClick}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.02, 0.18]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Keycaps block with subtle RGB glow */}
          <mesh position={[0, 0.012, 0]}>
            <boxGeometry args={[0.48, 0.01, 0.16]} />
            <meshStandardMaterial color="#2d3748" roughness={0.5} />
          </mesh>
        </group>

        {/* Ergonomic Wireless Mouse */}
        <group position={[0.3, 0.015, 0.08]} onClick={handleKeyboardClick}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.025, 0.13]} />
            <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>

        {/* Interactive Steaming Coffee Mug */}
        <group
          ref={mugRef}
          position={[-0.8, 0.04, -0.15]}
          onClick={handleMugClick}
          onPointerOver={() => {
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          {/* Cup Ceramic Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.04, 0.09, 16]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.3} />
          </mesh>
          {/* Coffee liquid */}
          <mesh position={[0, 0.038, 0]}>
            <cylinderGeometry args={[0.041, 0.041, 0.01, 16]} />
            <meshStandardMaterial color="#3d2314" roughness={0.1} />
          </mesh>
          {/* Handle */}
          <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.024, 0.007, 8, 16]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>

          {/* Steaming Vapor Rings */}
          <mesh ref={steam1Ref} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.01, 0.028, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
          </mesh>
          <mesh ref={steam2Ref} position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.015, 0.035, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
          </mesh>
          <mesh ref={steam3Ref} position={[0, 0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.02, 0.042, 12]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
          </mesh>
        </group>
      </group>

      {/* Real Cyber Hacking Hardware Gadgets on Desk */}
      <HackerDeskGadgets />

      {/* 3. Dual Curved Workstation Monitors (CLICKABLE HOTSPOT FOR PROJECTS) */}
      <group
        position={[0, 0.78, -0.25]}
        onClick={(e) => {
          e.stopPropagation();
          playWhooshSound();
          onSelect?.({ section: 'projects', label: 'Workstation · Projects' });
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          onHover?.('Workstation · Projects');
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
          onHover?.(null);
        }}
      >
        {/* Heavy-Duty Dual Monitor Desk Clamp Arm */}
        <mesh position={[0, 0.18, -0.15]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.36, 16]} />
          <meshStandardMaterial color="#1c1c1c" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Horizontal Dual Mount Crossbar */}
        <mesh position={[0, 0.32, -0.1]}>
          <boxGeometry args={[1.4, 0.04, 0.05]} />
          <meshStandardMaterial color="#1c1c1c" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Left Monitor (Functional Kali Linux Terminal) - Angled slightly right */}
        <group position={[-0.56, 0.42, 0]} rotation={[0, 0.12, 0]}>
          {/* Bezel */}
          <mesh castShadow>
            <boxGeometry args={[0.96, 0.54, 0.03]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Live Dynamic Kali Terminal Screen Face */}
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.92, 0.5]} />
            <meshBasicMaterial map={terminalScreen.texture} toneMapped={false} />
          </mesh>
        </group>

        {/* Right Monitor (Functional Cyber Threat Radar & SOC Dashboard) - Angled slightly left */}
        <group position={[0.56, 0.42, 0]} rotation={[0, -0.12, 0]}>
          {/* Bezel */}
          <mesh castShadow>
            <boxGeometry args={[0.96, 0.54, 0.03]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Live Dynamic SOC Radar Screen Face */}
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.92, 0.5]} />
            <meshBasicMaterial map={radarScreen.texture} toneMapped={false} />
          </mesh>
        </group>

        {/* ======================================================== */}
        {/* NEAR-FIELD AUDIO STUDIO MONITORS (Directly from Image 1) */}
        {/* Sleek black acoustic monitors with glowing amber drivers */}
        {/* ======================================================== */}
        {/* Left Studio Monitor */}
        <group position={[-1.24, 0.22, 0.06]} rotation={[0, 0.3, 0]}>
          {/* Acoustic Foam Decoupling Stand */}
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[0.2, 0.02, 0.24]} />
            <meshStandardMaterial color="#1e1e1e" roughness={0.9} />
          </mesh>
          {/* Matte Black Acoustic Cabinet */}
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.32, 0.22]} />
            <meshStandardMaterial color="#090d0b" roughness={0.35} metalness={0.7} />
          </mesh>
          {/* Front Baffle Chamfer Plate */}
          <mesh position={[0, 0, 0.112]}>
            <boxGeometry args={[0.17, 0.31, 0.006]} />
            <meshStandardMaterial color="#111827" roughness={0.25} />
          </mesh>
          {/* 5-Inch Amber/Orange Woven Kevlar Woofer Cone */}
          <group position={[0, -0.04, 0.116]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 0.012, 24]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={0.8}
                roughness={0.3}
              />
            </mesh>
            {/* Center Dust Cap */}
            <mesh position={[0, 0, 0.008]}>
              <sphereGeometry args={[0.018, 16, 16]} />
              <meshStandardMaterial color="#0b0f14" roughness={0.2} metalness={0.8} />
            </mesh>
          </group>
          {/* 1-Inch Silk Soft Dome Tweeter */}
          <group position={[0, 0.085, 0.116]}>
            <mesh>
              <sphereGeometry args={[0.018, 16, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Tweeter Waveguide Horn Ring */}
            <mesh position={[0, 0, -0.002]}>
              <torusGeometry args={[0.026, 0.004, 8, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
          {/* Front Tuned Bass Reflex Port */}
          <mesh position={[0, -0.12, 0.116]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.01, 16]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Amber Power Status LED */}
          <mesh position={[0.065, -0.13, 0.118]}>
            <sphereGeometry args={[0.0025, 8, 8]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>

        {/* Right Studio Monitor */}
        <group position={[1.24, 0.22, 0.06]} rotation={[0, -0.3, 0]}>
          <mesh position={[0, -0.15, 0]}>
            <boxGeometry args={[0.2, 0.02, 0.24]} />
            <meshStandardMaterial color="#1e1e1e" roughness={0.9} />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.32, 0.22]} />
            <meshStandardMaterial color="#090d0b" roughness={0.35} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, 0.112]}>
            <boxGeometry args={[0.17, 0.31, 0.006]} />
            <meshStandardMaterial color="#111827" roughness={0.25} />
          </mesh>
          <group position={[0, -0.04, 0.116]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 0.012, 24]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={0.8}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0.008]}>
              <sphereGeometry args={[0.018, 16, 16]} />
              <meshStandardMaterial color="#0b0f14" roughness={0.2} metalness={0.8} />
            </mesh>
          </group>
          <group position={[0, 0.085, 0.116]}>
            <mesh>
              <sphereGeometry args={[0.018, 16, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
            </mesh>
            <mesh position={[0, 0, -0.002]}>
              <torusGeometry args={[0.026, 0.004, 8, 24]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
          <mesh position={[0, -0.12, 0.116]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.01, 16]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <mesh position={[-0.065, -0.13, 0.118]}>
            <sphereGeometry args={[0.0025, 8, 8]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        </group>
      </group>

      {/* 4. High-Performance Liquid-Cooled PC Tower (Under desk right) */}
      <group position={[0.95, 0.35, 0.1]}>
        {/* Chassis Case */}
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.52, 0.52]} />
          <meshStandardMaterial color="#090d0b" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Tempered Glass Side Window with Interior Glow */}
        <mesh position={[-0.132, 0, 0]}>
          <planeGeometry args={[0.48, 0.48]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.35} />
        </mesh>
        {/* Internal RGB Point Light */}
        <pointLight position={[-0.05, 0.05, 0]} color="#34d399" intensity={3} distance={1.0} />

        {/* Front Dual RGB Fans Spinning inside */}
        <group ref={fan1Ref} position={[-0.12, 0.12, 0.1]}>
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((ang, i) => (
            <mesh key={`f1-${i}`} rotation={[0, 0, ang]}>
              <boxGeometry args={[0.01, 0.09, 0.005]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          ))}
        </group>
        <group ref={fan2Ref} position={[-0.12, -0.12, 0.1]}>
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((ang, i) => (
            <mesh key={`f2-${i}`} rotation={[0, 0, ang]}>
              <boxGeometry args={[0.01, 0.09, 0.005]} />
              <meshBasicMaterial color="#55f69a" />
            </mesh>
          ))}
        </group>

        {/* Liquid Cooling Reservoir & Neon Tube */}
        <mesh position={[-0.05, 0, -0.08]}>
          <cylinderGeometry args={[0.025, 0.025, 0.28, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} roughness={0.1} />
        </mesh>
      </group>

      {/* 5. Ergonomic Executive Office Chair */}
      <group position={[0, 0, 0.85]} rotation={[0, Math.PI, 0]}>
        {/* 5-Star Caster Wheel Base */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.35, 0.05, 5]} />
          <meshStandardMaterial {...deskMetal} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Hydraulic Piston Lift Cylinder */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.28, 16]} />
          <meshStandardMaterial {...chairMetal} metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Contoured Seat Cushion */}
        <mesh position={[0, 0.42, 0.05]} castShadow>
          <boxGeometry args={[0.55, 0.1, 0.52]} />
          <meshStandardMaterial {...chairLeather} roughness={0.48} metalness={0.1} />
        </mesh>
        {/* High Mesh Backrest & Lumbar */}
        <mesh position={[0, 0.8, -0.18]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.65, 0.06]} />
          <meshStandardMaterial {...chairLeather} roughness={0.48} metalness={0.1} />
        </mesh>
        {/* Ergonomic Headrest */}
        <mesh position={[0, 1.18, -0.22]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.28, 0.14, 0.06]} />
          <meshStandardMaterial {...chairLeather} roughness={0.48} metalness={0.1} />
        </mesh>
        {/* Left & Right 3D Armrests */}
        <mesh position={[-0.28, 0.62, 0.05]}>
          <boxGeometry args={[0.07, 0.04, 0.28]} />
          <meshStandardMaterial {...deskMetal} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0.28, 0.62, 0.05]}>
          <boxGeometry args={[0.07, 0.04, 0.28]} />
          <meshStandardMaterial {...deskMetal} metalness={0.7} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
