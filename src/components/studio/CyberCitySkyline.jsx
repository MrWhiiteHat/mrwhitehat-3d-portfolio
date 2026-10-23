import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural AAA Cyberpunk Metropolis Skyline
 * Visible outside the rear and side panoramic windows.
 * Features:
 * - 16 unique corporate megatowers with glowing architectural window bands
 * - Pulsing rooftop red aviation hazard beacons
 * - Animated flying autonomous vehicle (AV/Spinner) traffic streams with light trails
 * - Atmospheric neon city horizon haze
 */
export default function CyberCitySkyline({ currentThemeKey = 'CYBER_NEON_NOIR' }) {
  const beaconGroupRef = useRef();
  const trafficGroupRef = useRef();
  const avTraffic = useRef([
    { x: -6, y: 1.8, z: -10, speed: 2.4, color: '#38bdf8', len: 0.8 },
    { x: -2, y: 2.6, z: -12, speed: -1.8, color: '#f59e0b', len: 0.9 },
    { x: 3, y: 3.2, z: -14, speed: 3.2, color: '#06b6d4', len: 1.1 },
    { x: 1, y: 1.4, z: -9, speed: -2.1, color: '#ef4444', len: 0.7 },
  ]);

  // Generate stylized cyberpunk megatowers with procedural window grids
  const towers = useMemo(() => {
    return [
      // Close cluster outside back-right window (X: 2.2 to 5.2, Z: -7 to -12)
      { x: 2.6, y: 0.8, z: -7.5, w: 0.65, h: 4.8, d: 0.65, color: '#090f17', winColor: '#38bdf8' },
      { x: 3.4, y: 1.4, z: -8.8, w: 0.85, h: 5.6, d: 0.85, color: '#070b12', winColor: '#fbbf24' },
      { x: 4.2, y: 0.9, z: -7.8, w: 0.75, h: 4.9, d: 0.75, color: '#0a121c', winColor: '#34d399' },
      { x: 4.9, y: 1.6, z: -9.5, w: 0.95, h: 6.2, d: 0.95, color: '#05080e', winColor: '#38bdf8' },
      { x: 2.1, y: 0.5, z: -9.2, w: 0.7, h: 4.2, d: 0.7, color: '#090e18', winColor: '#f43f5e' },
      { x: 3.9, y: 2.2, z: -11.5, w: 1.2, h: 7.4, d: 1.2, color: '#04070b', winColor: '#38bdf8' },

      // Midground corporate arcologies
      { x: 1.2, y: 1.0, z: -11.0, w: 1.1, h: 5.2, d: 1.1, color: '#060a12', winColor: '#fbbf24' },
      { x: 5.8, y: 1.5, z: -12.5, w: 1.4, h: 6.8, d: 1.4, color: '#04060a', winColor: '#06b6d4' },
      { x: 0.2, y: 0.8, z: -13.0, w: 1.0, h: 4.6, d: 1.0, color: '#070d17', winColor: '#34d399' },
      { x: 7.0, y: 1.8, z: -14.0, w: 1.6, h: 7.2, d: 1.6, color: '#030508', winColor: '#f43f5e' },

      // Distant backdrop monolithic towers
      { x: 3.0, y: 3.0, z: -18.0, w: 2.2, h: 9.5, d: 2.2, color: '#020306', winColor: '#38bdf8' },
      { x: -1.5, y: 2.5, z: -16.0, w: 1.8, h: 8.5, d: 1.8, color: '#03050a', winColor: '#fbbf24' },
      { x: 6.5, y: 2.8, z: -19.0, w: 2.0, h: 9.0, d: 2.0, color: '#020407', winColor: '#06b6d4' },
    ];
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Synchronized flashing of aviation obstruction beacons on tower spires
    if (beaconGroupRef.current) {
      const beaconIntensity = Math.sin(time * 3.5) > 0.4 ? 1.0 : 0.05;
      beaconGroupRef.current.children.forEach((child) => {
        if (child.material) {
          child.material.opacity = beaconIntensity;
        }
      });
    }

    // 2. Animate flying vehicles across the metropolis
    if (trafficGroupRef.current) {
      trafficGroupRef.current.children.forEach((mesh, idx) => {
        const av = avTraffic.current[idx];
        if (!av) return;
        av.x += av.speed * delta;
        if (av.speed > 0 && av.x > 10) av.x = -8;
        if (av.speed < 0 && av.x < -8) av.x = 10;
        mesh.position.x = av.x;
      });
    }
  });

  return (
    <group name="CyberCitySkyline">
      {/* 1. Atmospheric Horizon Base Fog / Neon Glow Plane */}
      <mesh position={[3.5, 0.4, -13]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 18]} />
        <meshBasicMaterial
          color="#031b26"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 2. Megatowers Array */}
      {towers.map((t, idx) => (
        <group key={`tower-${idx}`} position={[t.x, t.y, t.z]}>
          {/* Main Tower Mass */}
          <mesh position={[0, t.h / 2, 0]}>
            <boxGeometry args={[t.w, t.h, t.d]} />
            <meshStandardMaterial
              color={t.color}
              roughness={0.4}
              metalness={0.8}
            />
          </mesh>

          {/* Illuminated Office Window Ribbons */}
          {Array.from({ length: 6 }).map((_, fIdx) => (
            <mesh
              key={`win-${fIdx}`}
              position={[0, 0.6 + fIdx * (t.h / 7), t.d / 2 + 0.005]}
            >
              <planeGeometry args={[t.w * 0.85, 0.12]} />
              <meshBasicMaterial
                color={t.winColor}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))}

          {/* Rooftop Antenna Communication Mast */}
          <mesh position={[0, t.h + 0.35, 0]}>
            <cylinderGeometry args={[0.015, 0.03, 0.7, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* 3. Flashing Red Aviation Warning Beacons on Rooftops */}
      <group ref={beaconGroupRef}>
        {towers.map((t, idx) => (
          <mesh
            key={`beacon-${idx}`}
            position={[t.x, t.y + t.h + 0.72, t.z]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#ff1744" transparent opacity={1} />
          </mesh>
        ))}
      </group>

      {/* 4. Autonomous Flying Vehicle Traffic Streams (AV Trails) */}
      <group ref={trafficGroupRef}>
        {avTraffic.current.map((av, idx) => (
          <mesh
            key={`av-${idx}`}
            position={[av.x, av.y, av.z]}
            rotation={[0, av.speed > 0 ? 0 : Math.PI, 0]}
          >
            <boxGeometry args={[av.len, 0.04, 0.06]} />
            <meshBasicMaterial color={av.color} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
