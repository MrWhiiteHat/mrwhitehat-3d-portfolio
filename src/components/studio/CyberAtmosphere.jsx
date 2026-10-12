import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound, playHackingBeep } from '../../utils/audio.js';

// Lighting atmosphere presets
export const LIGHTING_THEMES = {
  CYBER_NEON_NOIR: {
    id: 'CYBER_NEON_NOIR',
    name: 'Cyber Neon Noir (Red & Cyan)',
    ambient: '#040714',
    ambientIntensity: 0.9,
    dirColor: '#ff2244',
    dirIntensity: 2.6,
    windowColor: '#00f0ff',
    windowIntensity: 2.8,
    accentColor: '#00f0ff',
    accentIntensity: 22,
    crimsonColor: '#ff1744',
    crimsonIntensity: 24,
    loungeFillColor: '#f59e0b',
    coreColor: '#ff2244',
  },
  CYBER_MATRIX: {
    id: 'CYBER_MATRIX',
    name: 'Cyber Command (Matrix Green)',
    ambient: '#09150e',
    ambientIntensity: 1.8,
    dirColor: '#ffffff',
    dirIntensity: 2.8,
    windowColor: '#60a5fa',
    windowIntensity: 1.5,
    accentColor: '#34d399',
    accentIntensity: 14,
    crimsonColor: '#34d399',
    crimsonIntensity: 14,
    loungeFillColor: '#fbbf24',
    coreColor: '#55f69a',
  },
  SYNTHWAVE_NEON: {
    id: 'SYNTHWAVE_NEON',
    name: 'Night City (Synthwave Magenta)',
    ambient: '#130919',
    ambientIntensity: 2.0,
    dirColor: '#e0e7ff',
    dirIntensity: 2.4,
    windowColor: '#38bdf8',
    windowIntensity: 2.2,
    accentColor: '#ec4899',
    accentIntensity: 18,
    crimsonColor: '#f43f5e',
    crimsonIntensity: 18,
    loungeFillColor: '#a855f7',
    coreColor: '#f43f5e',
  },
  STEALTH_ICE: {
    id: 'STEALTH_ICE',
    name: 'Stealth Ops (Arctic Cyan)',
    ambient: '#060f17',
    ambientIntensity: 1.7,
    dirColor: '#f8fafc',
    dirIntensity: 2.6,
    windowColor: '#38bdf8',
    windowIntensity: 2.5,
    accentColor: '#06b6d4',
    accentIntensity: 16,
    crimsonColor: '#38bdf8',
    crimsonIntensity: 16,
    loungeFillColor: '#60a5fa',
    coreColor: '#38bdf8',
  },
  WARM_AMBER: {
    id: 'WARM_AMBER',
    name: 'Executive Suite (Warm Amber)',
    ambient: '#171109',
    ambientIntensity: 1.9,
    dirColor: '#fef3c7',
    dirIntensity: 2.8,
    windowColor: '#93c5fd',
    windowIntensity: 1.2,
    accentColor: '#f59e0b',
    accentIntensity: 15,
    crimsonColor: '#f59e0b',
    crimsonIntensity: 15,
    loungeFillColor: '#d97706',
    coreColor: '#fbbf24',
  },
};

export const THEME_KEYS = Object.keys(LIGHTING_THEMES);

export default function CyberAtmosphere({ currentThemeKey = 'CYBER_NEON_NOIR', onCycleTheme }) {
  const fanRef = useRef();
  const secondHandRef = useRef();
  const minuteHandRef = useRef();
  const hourHandRef = useRef();
  const holoCoreRef = useRef();
  const holoOuterRingRef = useRef();
  const [hoveredCore, setHoveredCore] = useState(false);

  const theme = LIGHTING_THEMES[currentThemeKey] || LIGHTING_THEMES.CYBER_MATRIX;

  // 1. Floating Cyber Ambient Particles (90 data motes)
  const particleData = useMemo(() => {
    const count = 55;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Spread across room dimensions: X: -5 to +5, Y: 0.5 to 4.2, Z: -5 to +5
      positions[i * 3 + 0] = (Math.random() - 0.5) * 9.5;
      positions[i * 3 + 1] = 0.4 + Math.random() * 3.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 9.5;

      speeds[i] = 0.15 + Math.random() * 0.25;
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return { positions, speeds, offsets, count };
  }, []);

  const particlesRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Rotate Ceiling Fan smoothly
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * 2.8;
    }

    // Real-time Clock Hands
    const now = new Date();
    const sec = now.getSeconds() + now.getMilliseconds() / 1000;
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;

    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = -sec * ((Math.PI * 2) / 60);
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = -min * ((Math.PI * 2) / 60);
    }
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z = -hr * ((Math.PI * 2) / 12);
    }

    // Floating Interactive Hologram Core (Bobs and spins)
    if (holoCoreRef.current) {
      const coreSpeed = hoveredCore ? 3.5 : 1.2;
      holoCoreRef.current.rotation.y += delta * coreSpeed;
      holoCoreRef.current.rotation.x += delta * (coreSpeed * 0.6);
      holoCoreRef.current.position.y = 1.08 + Math.sin(time * 2.4) * 0.05;

      const scaleTarget = hoveredCore ? 1.25 : 1.0;
      const currentScale = holoCoreRef.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, scaleTarget, 0.1);
      holoCoreRef.current.scale.setScalar(newScale);
    }
    if (holoOuterRingRef.current) {
      holoOuterRingRef.current.rotation.z -= delta * 1.5;
      holoOuterRingRef.current.rotation.y += delta * 0.8;
    }

    // Cyber ambient motes drift smoothly via group motion (zero CPU buffer upload!)
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.03;
      particlesRef.current.position.y = Math.sin(time * 0.2) * 0.1;
    }
  });

  return (
    <group name="CyberAtmosphere">
      {/* 1. Dynamic Atmosphere Lighting - Optimized Shadow Map */}
      <ambientLight color={theme.ambient} intensity={theme.ambientIntensity} />
      <directionalLight
        position={[9, 14, 8]}
        intensity={theme.dirIntensity}
        color={theme.dirColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
        shadow-camera-near={2}
        shadow-camera-far={26}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <directionalLight
        position={[-8, 9, -8]}
        intensity={theme.windowIntensity}
        color={theme.windowColor}
      />

      {/* 2. Floating Cyber Ambient Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleData.count}
            array={particleData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color={theme.coreColor}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* 3. Modern Industrial Ceiling Fan in center of studio */}
      <group position={[0, 4.38, 0]}>
        {/* Ceiling Mount Downrod */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.4, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Motor Hub Housing */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 0.12, 24]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Subtle Under-hub Status Ring */}
        <mesh position={[0, -0.062, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.14, 24]} />
          <meshBasicMaterial color={theme.coreColor} transparent opacity={0.6} />
        </mesh>

        {/* 4 Rotating Aerodynamic Carbon Fiber Blades */}
        <group ref={fanRef} position={[0, -0.02, 0]}>
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
            <group key={`blade-${i}`} rotation={[0, angle, 0]}>
              <mesh position={[0.7, 0, 0]} rotation={[0.1, 0, 0]}>
                <boxGeometry args={[1.2, 0.015, 0.14]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* 4. Real-time Animated Clock on Back Wall */}
      <group position={[-3.2, 3.4, -4.92]}>
        {/* Outer Ring */}
        <mesh castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.03, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Clock Face */}
        <mesh position={[0, 0, 0.018]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.62, 0.62]} />
          <meshBasicMaterial color="#08100b" />
        </mesh>
        {/* Center Pivot Pin */}
        <mesh position={[0, 0, 0.028]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} />
        </mesh>

        {/* Hour Hand */}
        <group ref={hourHandRef} position={[0, 0, 0.024]}>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.018, 0.16, 0.005]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Minute Hand */}
        <group ref={minuteHandRef} position={[0, 0, 0.025]}>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.014, 0.24, 0.005]} />
            <meshBasicMaterial color="#79f2aa" />
          </mesh>
        </group>

        {/* Second Hand (Smooth sweep) */}
        <group ref={secondHandRef} position={[0, 0, 0.027]}>
          <mesh position={[0, 0.13, 0]}>
            <boxGeometry args={[0.006, 0.28, 0.003]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      </group>

      {/* 5. Interactive Holographic Cyber Core on Coffee Table */}
      <group
        position={[1.95, 0, 0.85]}
        onClick={(e) => {
          e.stopPropagation();
          playHackingBeep(1400);
          onCycleTheme?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setHoveredCore(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          setHoveredCore(false);
        }}
      >
        {/* Pedestal Stand Base */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.12, 0.04, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Hologram Projector Emitter Lens */}
        <mesh position={[0, 0.81, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 24]} />
          <meshBasicMaterial color={theme.coreColor} />
        </mesh>

        {/* Floating Holographic Geometric Core */}
        <group ref={holoCoreRef} position={[0, 1.08, 0]}>
          {/* Inner Polyhedron */}
          <mesh>
            <octahedronGeometry args={[0.11, 0]} />
            <meshStandardMaterial
              color={theme.coreColor}
              emissive={theme.coreColor}
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.2}
              transparent
              opacity={0.7}
            />
          </mesh>
          {/* Wireframe Holographic Outer Shell */}
          <mesh>
            <icosahedronGeometry args={[0.14, 0]} />
            <meshBasicMaterial color={theme.coreColor} wireframe transparent opacity={0.65} />
          </mesh>
        </group>

        {/* Spinning Orbital Ring */}
        <group ref={holoOuterRingRef} position={[0, 1.08, 0]}>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.19, 0.005, 8, 32]} />
            <meshBasicMaterial color={theme.coreColor} transparent opacity={0.5} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 6. OVERHEAD HORIZONTAL CRIMSON NEON FIXTURE (Directly from Image 1)       */}
      {/* Industrial high-output neon light bar above workstation casting red glow  */}
      {/* ========================================================================= */}
      <group position={[-1.2, 3.75, 0.2]}>
        {/* Ceiling Suspension Rods / Brackets dropping from 4.45m down to 3.75m */}
        {[-0.85, 0.85].map((sx, idx) => (
          <group key={`neon-hang-${idx}`} position={[sx, 0.35, 0]}>
            <mesh>
              <cylinderGeometry args={[0.012, 0.012, 0.7, 12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Ceiling Flange Anchor Plate */}
            <mesh position={[0, 0.34, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.02, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Heavy Industrial Dark Housing Casing */}
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[2.2, 0.12, 0.24]} />
          <meshStandardMaterial color="#0b1016" metalness={0.92} roughness={0.25} />
        </mesh>
        {/* Top Channel Heat-Sink Fins */}
        <mesh position={[0, 0.105, 0]}>
          <boxGeometry args={[2.1, 0.02, 0.18]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Interior Mirror Reflector Hood */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.16, 0.06, 0.22]} />
          <meshStandardMaterial color="#2d0a12" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* 3 Parallel Glowing Crimson Neon Tubes */}
        {[-0.065, 0, 0.065].map((tz, i) => (
          <group key={`crimson-tube-${i}`} position={[0, -0.03, tz]}>
            {/* Tubular Glass Rod */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 2.08, 16]} />
              <meshStandardMaterial
                color={theme.crimsonColor || '#ff1744'}
                emissive={theme.crimsonColor || '#ff1744'}
                emissiveIntensity={3.6}
                roughness={0.1}
                toneMapped={false}
              />
            </mesh>
            {/* End Socket Caps (Left and Right) */}
            <mesh position={[-1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.026, 0.026, 0.04, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            <mesh position={[1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.026, 0.026, 0.04, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Dedicated Downward High-Intensity Crimson Wash Light */}
        <pointLight
          position={[0, -0.3, 0]}
          color={theme.crimsonColor || '#ff1744'}
          intensity={theme.crimsonIntensity || 24}
          distance={8.5}
          decay={2}
        />
      </group>

      {/* ========================================================================= */}
      {/* 7. VINTAGE SUSPENDED EDISON PENDANT LAMP (Directly from Image 1)          */}
      {/* Hanging industrial dome shade with warm amber glowing Edison filament     */}
      {/* ========================================================================= */}
      <group position={[-0.2, 2.75, 0.6]}>
        {/* Slender Black Braided Suspension Cord from Ceiling (4.45m down to 2.95m) */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 1.5, 8]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
        </mesh>
        {/* Ceiling Rosette Canopy */}
        <mesh position={[0, 1.7, 0]}>
          <cylinderGeometry args={[0.045, 0.055, 0.02, 16]} />
          <meshStandardMaterial color="#1c1917" metalness={0.8} />
        </mesh>

        {/* Antique Brass Fixture Socket */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.038, 0.042, 0.08, 16]} />
          <meshStandardMaterial color="#b48324" metalness={0.92} roughness={0.2} />
        </mesh>
        {/* Brass Cord Grip Knurled Nut */}
        <mesh position={[0, 0.23, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.03, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Industrial Dark Metal Flared Cone Reflector Shade */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.07, 0.26, 0.14, 24, 1, true]} />
          <meshStandardMaterial color="#1a202c" metalness={0.85} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
        {/* Shade Brass Rim Accent */}
        <mesh position={[0, 0.03, 0]}>
          <torusGeometry args={[0.26, 0.006, 8, 24]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
        </mesh>

        {/* Amber Tinted Glass Edison Teardrop Bulb */}
        <mesh position={[0, 0.01, 0]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            transparent
            opacity={0.65}
            roughness={0.2}
          />
        </mesh>

        {/* Glowing Incandescent Zig-Zag Filament Mesh */}
        <mesh position={[0, 0.01, 0]}>
          <torusGeometry args={[0.022, 0.004, 8, 16]} />
          <meshBasicMaterial color="#ffbe3b" toneMapped={false} />
        </mesh>

        {/* Warm Amber Downward Pool of Light */}
        <pointLight
          position={[0, -0.15, 0]}
          color={theme.loungeFillColor || '#f59e0b'}
          intensity={8.5}
          distance={5.2}
          decay={2}
        />
      </group>

      {/* ========================================================================= */}
      {/* 8. HORIZONTAL ELECTRIC CYAN LED STRIP BARS (Directly from Image 1)        */}
      {/* Mounted on the wall/shelves casting crisp electric cyan rim glow          */}
      {/* ========================================================================= */}
      <group position={[1.9, 3.3, -4.92]}>
        {/* Dual Horizontal Neon Runner Strips */}
        {[-0.18, 0.18].map((sy, idx) => (
          <group key={`cyan-strip-${idx}`} position={[0, sy, 0]}>
            {/* Sleek Aluminum Mounting Track Bar */}
            <mesh>
              <boxGeometry args={[2.8, 0.04, 0.025]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Diffused Neon Cyan Strip Lens */}
            <mesh position={[0, 0, 0.014]}>
              <boxGeometry args={[2.76, 0.024, 0.008]} />
              <meshStandardMaterial
                color={theme.accentColor || '#00f0ff'}
                emissive={theme.accentColor || '#00f0ff'}
                emissiveIntensity={3.2}
                roughness={0.15}
                toneMapped={false}
              />
            </mesh>
            {/* Aluminum End Caps */}
            {[-1.4, 1.4].map((ex, ci) => (
              <mesh key={`cap-${ci}`} position={[ex, 0, 0.005]}>
                <boxGeometry args={[0.02, 0.046, 0.03]} />
                <meshStandardMaterial color="#334155" metalness={0.9} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Crisp Electric Cyan Wash Point Light */}
        <pointLight
          position={[0, 0, 0.25]}
          color={theme.accentColor || '#00f0ff'}
          intensity={14}
          distance={6.5}
          decay={2}
        />
      </group>
    </group>
  );
}
