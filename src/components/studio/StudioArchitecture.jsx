import React, { useMemo } from 'react';
import * as THREE from 'three';
import { MeshReflectorMaterial } from '@react-three/drei';
import CyberCitySkyline from './CyberCitySkyline.jsx';
import {
  getRealParquetFloorTextures,
  getRealWallWoodTextures,
  getRealDeskWoodTextures,
  getParquetFloorTextures,
  getPlasterWallTextures,
  getWalnutWoodTextures,
  getTechCarpetTextures,
  getCeilingTileTextures,
  getBrushedMetalTextures,
} from '../../utils/textures.js';
import { LIGHTING_THEMES } from './CyberAtmosphere.jsx';

export default function StudioArchitecture({ currentThemeKey = 'CYBER_NEON_NOIR' }) {
  const theme = LIGHTING_THEMES[currentThemeKey] || LIGHTING_THEMES.CYBER_NEON_NOIR;
  const parquetFloor = useMemo(() => getRealParquetFloorTextures(6, 6), []);
  const plasterWall = useMemo(() => getPlasterWallTextures(3, 2), []);
  const walnutWood = useMemo(() => getRealDeskWoodTextures(2, 2), []);
  const techCarpetWorkstation = useMemo(() => getTechCarpetTextures(4, 3, '#0f1c16'), []);
  const techCarpetLounge = useMemo(() => getTechCarpetTextures(3, 3, '#141d18'), []);
  const ceilingTiles = useMemo(() => getCeilingTileTextures(8, 8), []);
  const brushedMetal = useMemo(() => getBrushedMetalTextures(2, 2, '#18201a'), []);

  // Generate skyline building silhouettes for both back and front panoramic windows
  const buildingsBack = useMemo(() => {
    return [
      { x: 3.0, h: 2.2, w: 0.35, d: 0.3, color: '#0f172a' },
      { x: 3.4, h: 3.1, w: 0.45, d: 0.3, color: '#090e17' },
      { x: 3.9, h: 2.6, w: 0.4, d: 0.3, color: '#131f36' },
      { x: 4.4, h: 3.4, w: 0.5, d: 0.3, color: '#0a101d' },
      { x: 4.9, h: 2.0, w: 0.35, d: 0.3, color: '#111c30' },
    ];
  }, []);

  // Shared BoxGeometries for 48 acoustic wall slats (zero redundant allocations)
  const leftSlatGeom = useMemo(() => new THREE.BoxGeometry(0.02, 3.9, 0.12), []);
  const backSlatGeom = useMemo(() => new THREE.BoxGeometry(0.11, 3.9, 0.02), []);
  const rightSlatGeom = useMemo(() => new THREE.BoxGeometry(0.02, 3.9, 0.14), []);

  return (
    <group name="StudioArchitecture">
      {/* ========================================================================= */}
      {/* 1. FLOOR & CARPETS                                                        */}
      {/* ========================================================================= */}
      {/* Main Parquet Hardwood Floor Substrate */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[10.3, 0.1, 10.3]} />
        <meshStandardMaterial {...parquetFloor} roughness={0.35} metalness={0.2} />
      </mesh>

      {/* Photorealistic AAA Real-Time Floor Reflector (Reflecting Neons, Monitors, and Architecture) */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10.25, 10.25]} />
        <MeshReflectorMaterial
          blur={[250, 80]}
          resolution={typeof window !== 'undefined' && window.innerWidth < 768 ? 256 : 512}
          mirror={0.30}
          mixBlur={1.2}
          mixStrength={1.4}
          roughness={0.36}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#141a16"
          metalness={0.22}
          distortion={0.04}
          normalMap={parquetFloor.normalMap}
          normalScale={new THREE.Vector2(0.08, 0.08)}
        />
      </mesh>

      {/* Floor Border Brass / Dark Walnut Trim */}
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[10.2, 0.01, 10.2]} />
        <meshStandardMaterial {...walnutWood} />
      </mesh>

      {/* Central Designer Tech Rug under workstation */}
      <mesh position={[-0.8, 0.012, 0.6]} receiveShadow>
        <boxGeometry args={[4.4, 0.015, 3.6]} />
        <meshStandardMaterial {...techCarpetWorkstation} />
      </mesh>
      {/* Rug Emerald Border Line */}
      <mesh position={[-0.8, 0.02, 0.6]}>
        <boxGeometry args={[4.2, 0.005, 3.4]} />
        <meshStandardMaterial color="#1b4332" roughness={0.6} />
      </mesh>

      {/* Lounge Area Plush Rug */}
      <mesh position={[2.6, 0.012, 1.6]} receiveShadow>
        <boxGeometry args={[3.4, 0.015, 3.2]} />
        <meshStandardMaterial {...techCarpetLounge} />
      </mesh>

      {/* ========================================================================= */}
      {/* 2. LEFT WALL (X = -5.05, FULL HEIGHT 4.5M)                                */}
      {/* ========================================================================= */}
      <group position={[-5.05, 2.25, 0]}>
        {/* Main Solid Wall Surface */}
        <mesh receiveShadow>
          <boxGeometry args={[0.2, 4.5, 10.3]} />
          <meshStandardMaterial {...plasterWall} />
        </mesh>

        {/* Baseboard */}
        <mesh position={[0.105, -2.15, 0]}>
          <boxGeometry args={[0.03, 0.2, 10.3]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>

        {/* Top Cornice Molding */}
        <mesh position={[0.105, 2.18, 0]}>
          <boxGeometry args={[0.04, 0.14, 10.3]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>

        {/* Vertical Wood Slat Acoustic Paneling (behind presentation & awards) */}
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh
            key={`left-slat-${i}`}
            position={[0.11, 0.1, -4.5 + i * 0.25]}
            geometry={leftSlatGeom}
          >
            <meshStandardMaterial {...walnutWood} />
          </mesh>
        ))}
      </group>

      {/* ========================================================================= */}
      {/* 3. BACK WALL (Z = -5.05, FULL HEIGHT 4.5M)                                */}
      {/* ========================================================================= */}
      <group position={[0, 2.25, -5.05]}>
        {/* Left Section (Solid wall behind Bookcase) */}
        <mesh position={[-1.6, 0, 0]} receiveShadow>
          <boxGeometry args={[6.9, 4.5, 0.2]} />
          <meshStandardMaterial {...plasterWall} />
        </mesh>

        {/* Back Wall Slat Paneling behind archive */}
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh
            key={`back-slat-${i}`}
            position={[-1.2 + i * 0.22, 0.1, 0.11]}
            geometry={backSlatGeom}
          >
            <meshStandardMaterial {...walnutWood} />
          </mesh>
        ))}

        {/* Baseboard left */}
        <mesh position={[-1.6, -2.15, 0.105]}>
          <boxGeometry args={[6.9, 0.2, 0.03]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>

        {/* Top Cornice left */}
        <mesh position={[-1.6, 2.18, 0.105]}>
          <boxGeometry args={[6.9, 0.14, 0.04]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>

        {/* Back-Right Corner Wall Filler */}
        <mesh position={[4.95, 0, 0]}>
          <boxGeometry args={[0.4, 4.5, 0.2]} />
          <meshStandardMaterial {...plasterWall} />
        </mesh>

        {/* Right Section: Large Panoramic Window (Centered at X = 3.35) */}
        <group position={[3.35, 0, 0]}>
          {/* Wall Cutout Trim Top & Bottom */}
          <mesh position={[0, 2.05, 0]}>
            <boxGeometry args={[2.9, 0.4, 0.2]} />
            <meshStandardMaterial color="#18221b" roughness={0.7} />
          </mesh>
          <mesh position={[0, -2.05, 0]}>
            <boxGeometry args={[2.9, 0.4, 0.2]} />
            <meshStandardMaterial color="#18221b" roughness={0.7} />
          </mesh>

          {/* Window Outer Perimeter Frame */}
          <mesh position={[0, 1.76, 0.05]}>
            <boxGeometry args={[2.85, 0.08, 0.1]} />
            <meshStandardMaterial color="#0b100d" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -1.76, 0.05]}>
            <boxGeometry args={[2.85, 0.08, 0.1]} />
            <meshStandardMaterial color="#0b100d" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[-1.38, 0, 0.05]}>
            <boxGeometry args={[0.08, 3.6, 0.1]} />
            <meshStandardMaterial color="#0b100d" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[1.38, 0, 0.05]}>
            <boxGeometry args={[0.08, 3.6, 0.1]} />
            <meshStandardMaterial color="#0b100d" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* Window Glass Pane */}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[2.76, 3.45, 0.02]} />
            <meshStandardMaterial
              color="#93c5fd"
              transparent
              opacity={0.22}
              roughness={0.08}
              metalness={0.2}
            />
          </mesh>

          {/* Window Mullions */}
          <mesh position={[-0.45, 0, 0.07]}>
            <boxGeometry args={[0.04, 3.45, 0.04]} />
            <meshStandardMaterial color="#0b100d" metalness={0.8} />
          </mesh>
          <mesh position={[0.45, 0, 0.07]}>
            <boxGeometry args={[0.04, 3.45, 0.04]} />
            <meshStandardMaterial color="#0b100d" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <boxGeometry args={[2.76, 0.04, 0.04]} />
            <meshStandardMaterial color="#0b100d" metalness={0.8} />
          </mesh>
        </group>

        {/* Living AAA Cyberpunk Metropolis Skyline outside Window */}
        <CyberCitySkyline currentThemeKey={currentThemeKey} />
      </group>

      {/* ========================================================================= */}
      {/* 4. RIGHT WALL (X = +5.05, FULL HEIGHT 4.5M WITH ENTRANCE DOORWAY PORTAL) */}
      {/* ========================================================================= */}
      <group position={[5.05, 2.25, 0]}>
        {/* Wall Section A: Rear of Entrance Portal (Z from -5.05 to -3.8) */}
        <mesh position={[0, 0, -4.425]} receiveShadow>
          <boxGeometry args={[0.2, 4.5, 1.25]} />
          <meshStandardMaterial {...plasterWall} />
        </mesh>
        <mesh position={[-0.105, -2.15, -4.425]}>
          <boxGeometry args={[0.03, 0.2, 1.25]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>

        {/* Doorway Header Wall above Entrance (Z = -2.8, Y from 3.0 to 4.5m) */}
        <mesh position={[0, 1.5, -2.8]} receiveShadow>
          <boxGeometry args={[0.2, 1.5, 2.0]} />
          <meshStandardMaterial {...plasterWall} />
        </mesh>

        {/* Architectural Entrance Frame Jambs */}
        <mesh position={[-0.08, 0, -3.85]}>
          <boxGeometry args={[0.1, 4.5, 0.15]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>
        <mesh position={[-0.08, 0, -1.75]}>
          <boxGeometry args={[0.1, 4.5, 0.15]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>
        <mesh position={[-0.08, 0.8, -2.8]}>
          <boxGeometry args={[0.1, 0.16, 2.1]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>

        {/* Wall Section B: Front of Entrance Portal (Z from -1.8 to +5.05) */}
        <mesh position={[0, 0, 1.625]} receiveShadow>
          <boxGeometry args={[0.2, 4.5, 6.85]} />
          <meshStandardMaterial {...plasterWall} />
        </mesh>
        <mesh position={[-0.105, -2.15, 1.625]}>
          <boxGeometry args={[0.03, 0.2, 6.85]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>
        <mesh position={[-0.105, 2.18, 1.625]}>
          <boxGeometry args={[0.04, 0.14, 6.85]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>

        {/* Vertical Acoustic Walnut Wood Slats along Right Wall Lounge Area */}
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh
            key={`right-slat-${i}`}
            position={[-0.11, 0.1, 0.2 + i * 0.28]}
            geometry={rightSlatGeom}
          >
            <meshStandardMaterial {...walnutWood} />
          </mesh>
        ))}

        {/* Sleek Vertical Ambient LED Channel along Right Wall */}
        <mesh position={[-0.11, 0.1, 4.3]}>
          <boxGeometry args={[0.015, 3.8, 0.04]} />
          <meshBasicMaterial color={theme.accentColor || '#00f0ff'} />
        </mesh>
        <pointLight position={[-0.25, 0.2, 4.3]} color={theme.accentColor || '#00f0ff'} intensity={1.2} distance={2.8} />

        {/* Executive Cyber Security Wall Plaque beside Entrance */}
        <group position={[-0.11, 0.1, -1.4]}>
          <mesh>
            <boxGeometry args={[0.02, 0.8, 0.5]} />
            <meshStandardMaterial color="#0d1410" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.012, 0.25, 0]}>
            <boxGeometry args={[0.005, 0.08, 0.38]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[-0.012, -0.05, 0]}>
            <boxGeometry args={[0.005, 0.38, 0.38]} />
            <meshStandardMaterial color="#1a251e" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 5. FRONT WALL (Z = +5.05, FULL CONTINUOUS ARCHITECTURAL WALL 10.3M WIDE)  */}
      {/* ========================================================================= */}
      <group position={[0, 2.25, 5.05]}>
        {/* Continuous Solid Wall (No window cutout / no mullion bars) */}
        <mesh receiveShadow>
          <boxGeometry args={[10.3, 4.5, 0.2]} />
          <meshStandardMaterial {...plasterWall} />
        </mesh>
        {/* Continuous Bottom Architectural Baseboard */}
        <mesh position={[0, -2.15, -0.105]}>
          <boxGeometry args={[10.3, 0.2, 0.03]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>
        {/* Continuous Top Architectural Cornice Molding */}
        <mesh position={[0, 2.18, -0.105]}>
          <boxGeometry args={[10.3, 0.14, 0.04]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>
      </group>

      {/* ========================================================================= */}
      {/* 6. FULL ENCLOSED COFFERED CEILING (Y = 4.45M - PREVIOUSLY COMPLETELY MISSING) */}
      {/* ========================================================================= */}
      <group position={[0, 4.48, 0]}>
        {/* Main Ceiling Slab (Completely encloses top of room, prevents dark void) */}
        <mesh receiveShadow castShadow={false}>
          <boxGeometry args={[10.3, 0.08, 10.3]} />
          <meshStandardMaterial {...ceilingTiles} />
        </mesh>

        {/* Coffered Ceiling Structural Cross Beams (3x3 Grid of Architectural Coffers) */}
        {[-3.2, 0, 3.2].map((bx, idx) => (
          <mesh key={`ceil-beam-x-${idx}`} position={[bx, -0.06, 0]} castShadow={false}>
            <boxGeometry args={[0.22, 0.12, 10.1]} />
            <meshStandardMaterial {...brushedMetal} />
          </mesh>
        ))}
        {[-3.2, 0, 3.2].map((bz, idx) => (
          <mesh key={`ceil-beam-z-${idx}`} position={[0, -0.06, bz]} castShadow={false}>
            <boxGeometry args={[10.1, 0.12, 0.22]} />
            <meshStandardMaterial {...brushedMetal} />
          </mesh>
        ))}

        {/* Perimeter Ceiling Cornice Drop */}
        <mesh position={[0, -0.08, -5.05]}>
          <boxGeometry args={[10.3, 0.16, 0.15]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>
        <mesh position={[0, -0.08, 5.05]}>
          <boxGeometry args={[10.3, 0.16, 0.15]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>
        <mesh position={[-5.05, -0.08, 0]}>
          <boxGeometry args={[0.15, 0.16, 10.3]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>
        <mesh position={[5.05, -0.08, 0]}>
          <boxGeometry args={[0.15, 0.16, 10.3]} />
          <meshStandardMaterial {...brushedMetal} />
        </mesh>

        {/* Ambient Recessed LED Light Trough Lines inside ceiling coffers */}
        {[-1.6, 1.6].map((cx, i) =>
          [-1.6, 1.6].map((cz, j) => {
            const cofferColor =
              (i + j) % 2 === 0
                ? theme.crimsonColor || '#ff1744'
                : theme.accentColor || '#00f0ff';
            return (
              <group key={`coffer-glow-${i}-${j}`} position={[cx, -0.03, cz]}>
                <mesh position={[0, 0, -1.35]}>
                  <boxGeometry args={[2.7, 0.015, 0.02]} />
                  <meshBasicMaterial color={cofferColor} />
                </mesh>
                <mesh position={[0, 0, 1.35]}>
                  <boxGeometry args={[2.7, 0.015, 0.02]} />
                  <meshBasicMaterial color={cofferColor} />
                </mesh>
                <mesh position={[-1.35, 0, 0]}>
                  <boxGeometry args={[0.02, 0.015, 2.7]} />
                  <meshBasicMaterial color={cofferColor} />
                </mesh>
                <mesh position={[1.35, 0, 0]}>
                  <boxGeometry args={[0.02, 0.015, 2.7]} />
                  <meshBasicMaterial color={cofferColor} />
                </mesh>
              </group>
            );
          })
        )}

        {/* Center Fan Mounting Medallion */}
        <mesh position={[0, -0.04, 0]}>
          <cylinderGeometry args={[0.42, 0.45, 0.08, 32]} />
          <meshStandardMaterial color="#080c0a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Downlight Canister Bezels in Key Zones */}
        {[
          [-1.2, 0.4],    // Above Workstation
          [-1.2, -2.0],   // Above Conference
          [2.4, 1.6],     // Above Lounge
          [0.6, -4.2],    // Above Bookcase
          [-3.5, 1.2],    // Above Printer Credenza
          [4.0, -2.8],    // Above Entrance Foyer
        ].map(([lx, lz], idx) => (
          <group key={`downlight-bezel-${idx}`} position={[lx, -0.02, lz]}>
            <mesh>
              <cylinderGeometry args={[0.09, 0.09, 0.03, 16]} />
              <meshStandardMaterial color="#0a0f0c" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.016, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.005, 16]} />
              <meshBasicMaterial color="#fffbeb" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
