import React from 'react';
import { Environment } from '@react-three/drei';
import { LIGHTING_THEMES } from './CyberAtmosphere.jsx';

/**
 * CyberEnvironmentRig:
 * Bakes a 360-degree Image-Based Lighting (IBL) environment cubemap directly in GPU memory on frame 1.
 * ZERO external network calls, zero 403 CDN errors, zero loading stalls!
 * Provides realistic metallic specular reflections for all hardware, furniture, and architecture.
 */
export default function CyberEnvironmentRig({ currentThemeKey = 'CYBER_NEON_NOIR' }) {
  const theme = LIGHTING_THEMES[currentThemeKey] || LIGHTING_THEMES.CYBER_NEON_NOIR;

  return (
    <Environment frames={1} resolution={256} environmentIntensity={0.85}>
      <group name="VirtualEnvironmentLightDome">
        {/* Overhead Soft Diffuse Sky / Studio Light Bank */}
        <mesh position={[0, 6, 0]} scale={[14, 1, 14]}>
          <boxGeometry />
          <meshBasicMaterial color={theme.hemiSky || '#223249'} />
        </mesh>

        {/* Key Directional Cyber Light Bank */}
        <mesh position={[8, 4, 8]} scale={[2, 4, 6]}>
          <boxGeometry />
          <meshBasicMaterial color={theme.dirColor || '#ff2244'} />
        </mesh>

        {/* Window Cyan Ambient Fill Emitter */}
        <mesh position={[-8, 3, -6]} scale={[1, 5, 8]}>
          <boxGeometry />
          <meshBasicMaterial color={theme.windowColor || '#00f0ff'} />
        </mesh>

        {/* Left Wall Crimson / Accent Light Strip */}
        <mesh position={[-8, 2.5, 4]} scale={[1, 4, 8]}>
          <boxGeometry />
          <meshBasicMaterial color={theme.crimsonColor || '#ff1744'} />
        </mesh>

        {/* Right Wall Warm Gold / Lounge Fill Panel */}
        <mesh position={[8, 2.5, -4]} scale={[1, 4, 8]}>
          <boxGeometry />
          <meshBasicMaterial color={theme.loungeFillColor || '#f59e0b'} />
        </mesh>

        {/* Floor Absorption Plane */}
        <mesh position={[0, -2, 0]} scale={[16, 1, 16]}>
          <boxGeometry />
          <meshBasicMaterial color="#050807" />
        </mesh>
      </group>
    </Environment>
  );
}
