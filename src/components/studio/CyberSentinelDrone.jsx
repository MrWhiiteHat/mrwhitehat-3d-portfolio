import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playBreachFanfare, playHackingBeep } from '../../utils/audio.js';
import mrWhiteHatImg from '../../assets/mrwhitehat-hologram.jpg';

/**
 * Autonomous Cyber Sentinel Recon Drone with Exact Hologram Projection
 * Projects a high-tech, luminous hologram of MrWhiteHat with biometric HUD elements,
 * volumetric projector cone, animated laser scanline, and interactive audio feedback.
 */
export default function CyberSentinelDrone() {
  const droneGroupRef = useRef();
  const rotorRefs = useRef([]);
  const laserRef = useRef();
  const scanlineRef = useRef();
  const haloRing1Ref = useRef();
  const haloRing2Ref = useRef();
  const hologramMeshRef = useRef();
  const [scanPulse, setScanPulse] = useState(false);

  // Load the exact user photo texture
  const hologramTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(mrWhiteHatImg);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    return tex;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Gentle autonomous hover bobbing and stabilization roll
    if (droneGroupRef.current) {
      droneGroupRef.current.position.y = 2.38 + Math.sin(time * 2.0) * 0.06;
      droneGroupRef.current.rotation.z = Math.sin(time * 1.4) * 0.03;
      droneGroupRef.current.rotation.x = Math.cos(time * 1.6) * 0.02;
    }

    // 2. High-speed rotor spin (contra-rotating blades)
    rotorRefs.current.forEach((r, i) => {
      if (r) r.rotation.y += delta * (i % 2 === 0 ? 38 : -38);
    });

    // 3. Projector lens intensity pulse
    if (laserRef.current) {
      laserRef.current.intensity = (scanPulse ? 5.0 : 3.2) + Math.sin(time * 4) * 0.5;
    }

    // 4. Oscillating Laser Scanline moving up and down the hologram face
    if (scanlineRef.current) {
      scanlineRef.current.position.y = -0.72 + Math.sin(time * 2.8) * 0.48;
    }

    // 5. Rotating Holographic Halo Rings
    if (haloRing1Ref.current) {
      haloRing1Ref.current.rotation.z += delta * 1.2;
    }
    if (haloRing2Ref.current) {
      haloRing2Ref.current.rotation.z -= delta * 1.6;
    }

    // 6. Hologram Subtle Float & Glitch Flicker
    if (hologramMeshRef.current) {
      const flicker = 0.9 + Math.sin(time * 15) * 0.04 + (Math.random() > 0.98 ? -0.15 : 0);
      hologramMeshRef.current.material.opacity = scanPulse ? 1.0 : flicker;
    }
  });

  const handleDroneClick = (e) => {
    e.stopPropagation();
    playBreachFanfare();
    setScanPulse(true);
    setTimeout(() => setScanPulse(false), 900);
  };

  return (
    <group
      ref={droneGroupRef}
      position={[-1.7, 2.38, -1.8]}
      rotation={[0, 0.42, 0]}
      name="CyberSentinelDrone"
      onClick={handleDroneClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* ========================================================================= */}
      {/* 1. AERODYNAMIC CARBON FIBER DRONE CHASSIS                                 */}
      {/* ========================================================================= */}
      <mesh castShadow>
        <boxGeometry args={[0.26, 0.08, 0.32]} />
        <meshStandardMaterial color="#0b1118" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Upper Armor Cowling */}
      <mesh position={[0, 0.046, 0]}>
        <boxGeometry args={[0.18, 0.02, 0.24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* 4 Quad-Rotor Arms extending diagonally */}
      {[
        { x: -0.18, z: 0.18, idx: 0 },
        { x: 0.18, z: 0.18, idx: 1 },
        { x: -0.18, z: -0.18, idx: 2 },
        { x: 0.18, z: -0.18, idx: 3 },
      ].map((arm) => (
        <group key={`drone-arm-${arm.idx}`} position={[arm.x, 0, arm.z]}>
          {/* Carbon Fiber Strut */}
          <mesh>
            <boxGeometry args={[0.028, 0.016, 0.16]} />
            <meshStandardMaterial color="#080c10" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Brushless Motor Hub */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.032, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.95} />
          </mesh>
          {/* Spinning Propeller Blades */}
          <group
            ref={(el) => (rotorRefs.current[arm.idx] = el)}
            position={[0, 0.04, 0]}
          >
            <mesh>
              <boxGeometry args={[0.22, 0.003, 0.024]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Left & Right Carbon Landing Skids */}
      {[-0.1, 0.1].map((sx, i) => (
        <group key={`skid-${i}`} position={[sx, -0.075, 0]}>
          <mesh>
            <boxGeometry args={[0.014, 0.01, 0.28]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.035, 0.08]}>
            <cylinderGeometry args={[0.004, 0.004, 0.07, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 0.035, -0.08]}>
            <cylinderGeometry args={[0.004, 0.004, 0.07, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      ))}

      {/* ========================================================================= */}
      {/* 2. OPTICAL HOLOGRAM PROJECTOR EMITTER                                     */}
      {/* ========================================================================= */}
      <group position={[0, -0.05, 0.08]}>
        {/* Projector Lens Housing */}
        <mesh>
          <cylinderGeometry args={[0.042, 0.035, 0.03, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Glowing Projector Lens */}
        <mesh position={[0, -0.018, 0]}>
          <sphereGeometry args={[0.036, 16, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        {/* Powerful Hologram Light Source */}
        <pointLight
          ref={laserRef}
          position={[0, -0.15, 0]}
          color="#38bdf8"
          intensity={3.2}
          distance={3.8}
        />

        {/* Volumetric Holographic Light Cone connecting lens to the hologram */}
        <mesh position={[0, -0.32, 0.08]} rotation={[0.12, 0, 0]}>
          <coneGeometry args={[0.55, 0.62, 24, 1, true]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={scanPulse ? 0.28 : 0.12}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 3. EXACT HOLOGRAM OF MR. WHITE HAT                                        */}
      {/* ========================================================================= */}
      <group position={[0, 0, 0]}>
        {/* Main Hologram Portrait Mesh (Exact Photo) */}
        <mesh
          ref={hologramMeshRef}
          position={[0, -0.74, 0.22]}
          rotation={[-0.08, 0, 0]}
        >
          <planeGeometry args={[0.85, 1.1]} />
          <meshBasicMaterial
            map={hologramTexture}
            transparent
            opacity={0.92}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Hologram Backlit Illumination Plane (Provides glowing cyan aura behind photo) */}
        <mesh position={[0, -0.74, 0.215]} rotation={[-0.08, 0, 0]}>
          <planeGeometry args={[0.87, 1.12]} />
          <meshBasicMaterial
            color="#0ea5e9"
            transparent
            opacity={scanPulse ? 0.45 : 0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Animated Horizontal Laser Scanline (Sweeps across the face) */}
        <group ref={scanlineRef} position={[0, -0.72, 0.23]} rotation={[-0.08, 0, 0]}>
          <mesh>
            <planeGeometry args={[0.9, 0.008]} />
            <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[0.9, 0.024]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* ======================================================================= */}
        {/* 4. CYBERNETIC BIOMETRIC HUD FRAMES & BRACKETS                           */}
        {/* ======================================================================= */}
        <group position={[0, -0.74, 0.225]} rotation={[-0.08, 0, 0]}>
          {/* Top-Left Corner Bracket */}
          <group position={[-0.43, 0.55, 0]}>
            <mesh position={[0.04, 0, 0]}>
              <boxGeometry args={[0.08, 0.008, 0.002]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.008, 0.08, 0.002]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>

          {/* Top-Right Corner Bracket */}
          <group position={[0.43, 0.55, 0]}>
            <mesh position={[-0.04, 0, 0]}>
              <boxGeometry args={[0.08, 0.008, 0.002]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.008, 0.08, 0.002]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>

          {/* Bottom-Left Corner Bracket */}
          <group position={[-0.43, -0.55, 0]}>
            <mesh position={[0.04, 0, 0]}>
              <boxGeometry args={[0.08, 0.008, 0.002]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.008, 0.08, 0.002]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>

          {/* Bottom-Right Corner Bracket */}
          <group position={[0.43, -0.55, 0]}>
            <mesh position={[-0.04, 0, 0]}>
              <boxGeometry args={[0.08, 0.008, 0.002]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.008, 0.08, 0.002]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>

          {/* Top Holographic Header Tag Bar */}
          <group position={[0, 0.62, 0]}>
            <mesh>
              <boxGeometry args={[0.76, 0.065, 0.004]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, 0, 0.004]}>
              <boxGeometry args={[0.74, 0.055, 0.002]} />
              <meshBasicMaterial color="#0369a1" />
            </mesh>
            {/* Pulsing Status Dot */}
            <mesh position={[-0.32, 0, 0.006]}>
              <circleGeometry args={[0.015, 12]} />
              <meshBasicMaterial color="#4ade80" />
            </mesh>
          </group>

          {/* Bottom Biometric Clearance Status Bar */}
          <group position={[0, -0.62, 0]}>
            <mesh>
              <boxGeometry args={[0.82, 0.07, 0.004]} />
              <meshBasicMaterial color="#0c4a6e" transparent opacity={0.88} />
            </mesh>
            {/* Status Indicator LED Nodes */}
            {[-0.34, -0.26, 0.26, 0.34].map((lx, i) => (
              <mesh key={`hud-led-${i}`} position={[lx, 0, 0.006]}>
                <circleGeometry args={[0.012, 10]} />
                <meshBasicMaterial color={i < 2 ? '#38bdf8' : '#34d399'} />
              </mesh>
            ))}
          </group>
        </group>

        {/* 5. Spinning Circular Holographic Halo Rings at base of hologram */}
        <group position={[0, -1.32, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh ref={haloRing1Ref}>
            <ringGeometry args={[0.48, 0.52, 32]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh ref={haloRing2Ref}>
            <ringGeometry args={[0.56, 0.58, 24]} />
            <meshBasicMaterial
              color="#34d399"
              transparent
              opacity={0.45}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
