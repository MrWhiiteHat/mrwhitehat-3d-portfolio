import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { LIGHTING_THEMES } from './CyberAtmosphere.jsx';

/**
 * Computes asset URL based on Vite BASE_URL.
 */
const getAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanBase + cleanPath;
};

// =============================================================================
// 1. PROCEDURAL 3D GEOMETRIC FACETED WALLPAPER GEOMETRY GENERATOR
// Merged single BufferGeometry with 96 pyramidal facets (384 triangles, 1 draw call)
// All facet normal vectors tilt outward towards -Z into the room to catch dynamic lighting
// =============================================================================

function createFacetedWallpaperGeometry(width, height, cols, rows, depth) {
  const positions = [];
  const uvs = [];
  const cellW = width / cols;
  const cellH = height / rows;
  const startX = -width / 2;
  const startY = -height / 2;
  const zBase = 0;
  const zApex = -depth;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = startX + c * cellW;
      const x1 = x0 + cellW;
      const y0 = startY + r * cellH;
      const y1 = y0 + cellH;
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;

      // Bottom triangle face (tilts downwards & into room)
      positions.push(
        x0, y0, zBase,
        cx, cy, zApex,
        x1, y0, zBase
      );
      uvs.push(0, 0,  0.5, 0.5,  1, 0);

      // Right triangle face (tilts right & into room)
      positions.push(
        x1, y0, zBase,
        cx, cy, zApex,
        x1, y1, zBase
      );
      uvs.push(1, 0,  0.5, 0.5,  1, 1);

      // Top triangle face (tilts upwards & into room)
      positions.push(
        x1, y1, zBase,
        cx, cy, zApex,
        x0, y1, zBase
      );
      uvs.push(1, 1,  0.5, 0.5,  0, 1);

      // Left triangle face (tilts left & into room)
      positions.push(
        x0, y1, zBase,
        cx, cy, zApex,
        x0, y0, zBase
      );
      uvs.push(0, 1,  0.5, 0.5,  0, 0);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  return geom;
}

// =============================================================================
// 2. PROCEDURAL HIGH-RESOLUTION TEXTURE GENERATORS
// =============================================================================

function createEmblemTexture() {
  if (typeof document === 'undefined') return null;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Background dark obsidian brushed radial gradient
  const bgGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 250);
  bgGrad.addColorStop(0, '#131b2e');
  bgGrad.addColorStop(0.7, '#0a0f1d');
  bgGrad.addColorStop(1, '#040711');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 250, 0, Math.PI * 2);
  ctx.fill();

  // Outer gold & cyan concentric rings
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 235, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 222, 0, Math.PI * 2);
  ctx.stroke();

  // Compass tick marks around ring
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 72; i++) {
    const angle = (i * Math.PI * 2) / 72;
    const len = i % 6 === 0 ? 12 : 5;
    const r1 = 222;
    const r2 = r1 - len;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.stroke();
  }

  // Inner geometric hex grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
  ctx.lineWidth = 1;
  for (let r = 55; r <= 180; r += 45) {
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const rad = (a * Math.PI) / 3;
      const x = cx + r * Math.cos(rad);
      const y = cy + r * Math.sin(rad);
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Tactical Crosshair Lines
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 150, cy); ctx.lineTo(cx - 75, cy);
  ctx.moveTo(cx + 75, cy); ctx.lineTo(cx + 150, cy);
  ctx.moveTo(cx, cy - 150); ctx.lineTo(cx, cy - 75);
  ctx.moveTo(cx, cy + 75); ctx.lineTo(cx, cy + 150);
  ctx.stroke();

  // Center Shield / Crest Icon
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 55);
  ctx.lineTo(cx + 42, cy - 35);
  ctx.lineTo(cx + 36, cy + 18);
  ctx.lineTo(cx, cy + 55);
  ctx.lineTo(cx - 36, cy + 18);
  ctx.lineTo(cx - 42, cy - 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White Hat / Terminal Symbol inside Shield
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 30px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('>_', cx, cy - 5);

  // High-End Typography
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 15px -apple-system, sans-serif';
  ctx.fillText('MR. WHITEHAT', cx, cy + 110);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('OFFENSIVE SECURITY // VULN RESEARCH', cx, cy + 130);

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('NODE 0x7F // OPERATIONAL', cx, cy + 148);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createPlaqueTexture(type) {
  if (typeof document === 'undefined') return null;
  const w = 512;
  const h = 340;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (type === 'defcon') {
    // DEF CON Black Badge Award
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, w, h);

    // Gold PCB Border & Corner Nodes
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    ctx.fillStyle = '#eab308';
    [[24, 24], [w - 24, 24], [24, h - 24], [w - 24, h - 24]].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Gold PCB trace lines
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(36, 60); ctx.lineTo(120, 60); ctx.lineTo(140, 40);
    ctx.moveTo(w - 36, 60); ctx.lineTo(w - 120, 60); ctx.lineTo(w - 140, 40);
    ctx.moveTo(36, h - 60); ctx.lineTo(120, h - 60); ctx.lineTo(140, h - 40);
    ctx.stroke();

    // Emblem & Text
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEF CON CTF', w / 2, 85);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, sans-serif';
    ctx.fillText('BLACK BADGE HONOREE', w / 2, 125);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText('AWARDED FOR EXCEPTIONAL RED TEAM EXPLOIT DEV', w / 2, 160);
    ctx.fillText('LIFETIME INVITATION // LAS VEGAS, NEVADA', w / 2, 185);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillText('[ STATUS: VERIFIED WINNER #0x7F ]', w / 2, 235);

    // Cryptographic Seal
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.strokeRect(w / 2 - 110, 260, 220, 42);
    ctx.fillStyle = '#facc15';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('SHA256: 8a7c...4f9b01dc', w / 2, 286);
  } else if (type === 'oscp') {
    // Offensive Security Certified Professional
    ctx.fillStyle = '#080c18';
    ctx.fillRect(0, 0, w, h);

    // Crimson & White Security Border
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFENSIVE SECURITY', w / 2, 70);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 30px -apple-system, sans-serif';
    ctx.fillText('OSCP CERTIFIED', w / 2, 115);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px -apple-system, sans-serif';
    ctx.fillText('PENETRATION TESTING WITH KALI LINUX (PWK)', w / 2, 155);
    ctx.fillText('CREDENTIAL ID: OSCP-8921-WHITEHAT', w / 2, 185);

    // Wax Seal Graphic
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(w / 2, 248, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('OFFSEC', w / 2, 245);
    ctx.fillText('VERIFIED', w / 2, 260);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px monospace';
    ctx.fillText('OFFICIAL ACCREDITATION // 24-HOUR PRACTICAL EXAM', w / 2, 310);
  } else {
    // Bug Bounty Hall of Fame
    ctx.fillStyle = '#091322';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, w - 36, h - 36);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GLOBAL BUG BOUNTY', w / 2, 75);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.fillText('HALL OF FAME', w / 2, 115);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px -apple-system, sans-serif';
    ctx.fillText('RANKED IN TOP 0.1% WORLDWIDE SECURITY RESEARCHERS', w / 2, 160);
    ctx.fillText('RESPONSIBLE DISCLOSURE TO GOOGLE, APPLE, META, MICROSOFT', w / 2, 185);

    ctx.fillStyle = '#0ea5e9';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillText('TOTAL CVEs DOCUMENTED: 14 CRITICAL / 28 HIGH', w / 2, 230);

    // Medal Ribbon
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(w / 2 - 30, 255, 60, 24);
    ctx.fillStyle = '#e0f2fe';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('ELITE', w / 2, 272);

    ctx.fillStyle = '#475569';
    ctx.font = '11px monospace';
    ctx.fillText('SECURITY RESEARCH HONORS AWARD', w / 2, 312);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// =============================================================================
// SUB-COMPONENT: REALISTIC SHELF PLANT (potted_plant_02.glb)
// =============================================================================

function ConsolePlant({ position = [4.15, 0.88, 4.9], scale = 0.52 }) {
  const modelUrl = getAssetUrl('models/potted_plant_02.glb');
  const { scene } = useGLTF(modelUrl);
  const foliageRef = useRef();

  const { plantRoot, leavesNode } = useMemo(() => {
    const clone = scene.clone(true);
    const leaves = clone.getObjectByName('potted_plant_02_leaves');

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.shadowSide = THREE.DoubleSide;
        }
      }
    });

    return { plantRoot: clone, leavesNode: leaves };
  }, [scene]);

  foliageRef.current = leavesNode;

  // Gentle organic breeze sway on the leaves only (pot stays dead-still on shelf)
  useFrame((state) => {
    if (foliageRef.current) {
      const time = state.clock.getElapsedTime();
      foliageRef.current.rotation.z = Math.sin(time * 0.9 + 1.2) * 0.012;
      foliageRef.current.rotation.x = Math.cos(time * 0.75 + 0.5) * 0.008;
    }
  });

  return (
    <primitive object={plantRoot} position={position} scale={scale} />
  );
}

// =============================================================================
// MAIN COMPONENT: FRONT WALL 3D WALLPAPER FEATURE & OPERATIVE INSTALLATION
// =============================================================================

export default function FrontWallPanoramicFeature({ currentThemeKey = 'CYBER_NEON_NOIR' }) {
  const theme = LIGHTING_THEMES[currentThemeKey] || LIGHTING_THEMES.CYBER_NEON_NOIR;

  // World Clocks second hands refs
  const clockRefs = [useRef(), useRef(), useRef(), useRef()];
  const [digitalTimes, setDigitalTimes] = useState(['--:--:--', '--:--:--', '--:--:--', '--:--:--']);

  // Procedural 3D Faceted Wallpaper Geometry (5.2m wide, 3.6m high, 12x8 grid, 0.055m depth)
  const facetedGeometry = useMemo(() => {
    return createFacetedWallpaperGeometry(5.2, 3.6, 12, 8, 0.055);
  }, []);

  // Textures
  const emblemTex = useMemo(() => createEmblemTexture(), []);
  const defconTex = useMemo(() => createPlaqueTexture('defcon'), []);
  const oscpTex = useMemo(() => createPlaqueTexture('oscp'), []);
  const bountyTex = useMemo(() => createPlaqueTexture('bounty'), []);

  // Wallpaper Facet Material (Tactical deep midnight satin finish, catching specular highlights)
  const wallpaperMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#131c2c',
      roughness: 0.38,
      metalness: 0.65,
    });
  }, []);

  // Border Frame Material (Brushed titanium/obsidian trim)
  const frameMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.25,
      metalness: 0.88,
    });
  }, []);

  // World Timezone Math: [UTC (0), SFO (-7), LON (+1), TYO (+9)]
  const timezoneOffsets = [0, -7, 1, 9];
  const timezoneLabels = ['UTC / ZULU', 'SFO (PST)', 'LON (GMT)', 'TYO (JST)'];

  useFrame(() => {
    // Update Live Clock Second Hands
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;

    timezoneOffsets.forEach((offset, idx) => {
      const targetTime = new Date(utcMs + 3600000 * offset);
      const sec = targetTime.getSeconds() + targetTime.getMilliseconds() / 1000;
      const ref = clockRefs[idx]?.current;
      if (ref) {
        ref.rotation.z = -sec * ((Math.PI * 2) / 60);
      }
    });
  });

  // Periodic digital time refresh (paced at 1 Hz)
  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const times = timezoneOffsets.map((offset) => {
        const d = new Date(utcMs + 3600000 * offset);
        return d.toTimeString().split(' ')[0];
      });
      setDigitalTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <group name="FrontWallFeature" position={[0, 0, 5.05]}>
      {/* ========================================================================= */}
      {/* 1. LUXURY 3D GEOMETRIC FACETED WALLPAPER FEATURE WALL (Center 5.2m x 3.6m)*/}
      {/* Centered at X = 0.6, Y = 2.25. Facets project out into the room.          */}
      {/* ========================================================================= */}
      <group position={[0.6, 2.25, -0.105]}>
        {/* Recessed Backing Panel Base */}
        <mesh position={[0, 0, 0.005]} receiveShadow>
          <boxGeometry args={[5.24, 3.64, 0.01]} />
          <meshStandardMaterial color="#080c14" roughness={0.8} />
        </mesh>

        {/* Physical 3D Faceted Wallpaper Mesh (12 x 8 Interlocking Diamond Pyramids) */}
        <mesh
          geometry={facetedGeometry}
          material={wallpaperMaterial}
          castShadow
          receiveShadow
        />

        {/* Outer Architectural Perimeter Metal Trim */}
        {/* Top Border */}
        <mesh position={[0, 1.83, -0.03]}>
          <boxGeometry args={[5.32, 0.06, 0.07]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
        {/* Bottom Border */}
        <mesh position={[0, -1.83, -0.03]}>
          <boxGeometry args={[5.32, 0.06, 0.07]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
        {/* Left Border */}
        <mesh position={[-2.63, 0, -0.03]}>
          <boxGeometry args={[0.06, 3.72, 0.07]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
        {/* Right Border */}
        <mesh position={[2.63, 0, -0.03]}>
          <boxGeometry args={[0.06, 3.72, 0.07]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>

        {/* Concealed Top Architectural LED Cove Lighting washing down over facets */}
        <mesh position={[0, 1.78, -0.035]}>
          <boxGeometry args={[5.16, 0.015, 0.02]} />
          <meshBasicMaterial color={theme.accentColor || '#38bdf8'} />
        </mesh>
        <pointLight
          position={[0, 1.6, -0.22]}
          color={theme.accentColor || '#38bdf8'}
          intensity={1.8}
          distance={3.6}
        />

        {/* Concealed Bottom Architectural LED Cove Lighting washing up over facets */}
        <mesh position={[0, -1.78, -0.035]}>
          <boxGeometry args={[5.16, 0.015, 0.02]} />
          <meshBasicMaterial color={theme.accentColor || '#38bdf8'} />
        </mesh>
        <pointLight
          position={[0, -1.6, -0.22]}
          color={theme.accentColor || '#38bdf8'}
          intensity={1.2}
          distance={3.2}
        />

        {/* --- FLOATING EXECUTIVE CYBER COMMAND EMBLEM MEDALLION --- */}
        <group position={[0, 0, -0.075]}>
          {/* Backlit Halo Glow Casting on 3D Facets */}
          <pointLight
            position={[0, 0, -0.05]}
            color={theme.accentColor || '#00f0ff'}
            intensity={1.4}
            distance={2.0}
          />

          {/* Stepped Brushed Obsidian Mount Base */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.68, 0.72, 0.03, 64]} />
            <meshStandardMaterial color="#0b101d" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Brushed Brass Outer Bezel Torus Ring */}
          <mesh position={[0, 0, -0.018]}>
            <torusGeometry args={[0.67, 0.024, 16, 64]} />
            <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.22} />
          </mesh>

          {/* Inner Accent Glowing Ring */}
          <mesh position={[0, 0, -0.02]}>
            <ringGeometry args={[0.635, 0.648, 64]} />
            <meshBasicMaterial color={theme.accentColor || '#38bdf8'} />
          </mesh>

          {/* High-Resolution Emblem Face Disc */}
          <mesh position={[0, 0, -0.022]} rotation={[0, 0, 0]}>
            <circleGeometry args={[0.63, 64]} />
            <meshStandardMaterial
              map={emblemTex}
              roughness={0.18}
              metalness={0.5}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 2. LEFT WALL: SOC GLOBAL OPERATIONS WORLD CLOCKS & HALL OF FAME           */}
      {/* Centered at X = -3.525, Y = 2.25, Z = 0 (Against front wall, facing room) */}
      {/* ========================================================================= */}
      <group position={[-3.525, 2.25, -0.08]}>
        {/* Designer Fluted Acoustic Walnut Slat Backdrop (11 Slats) */}
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={`front-slat-${i}`} position={[-1.25 + i * 0.25, 0, 0]}>
            <boxGeometry args={[0.09, 4.0, 0.02]} />
            <meshStandardMaterial color="#2d1c13" roughness={0.75} metalness={0.08} />
          </mesh>
        ))}

        {/* --- GLOBAL TIMEZONE OPERATIONS CLOCKS (SOC World Clock Matrix) --- */}
        <group position={[0, 0.72, -0.02]}>
          {/* Header Panel */}
          <mesh position={[0, 0.58, 0]}>
            <boxGeometry args={[2.7, 0.22, 0.02]} />
            <meshStandardMaterial color="#0a0f1d" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Cyan Glow Accent Line */}
          <mesh position={[0, 0.68, 0.012]}>
            <boxGeometry args={[2.64, 0.01, 0.005]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>

          {/* 4 Synchronized World Timezone Clocks: [UTC, SFO, LON, TYO] */}
          {timezoneLabels.map((lbl, idx) => {
            const cx = -1.0 + idx * 0.67;
            return (
              <group key={`soc-clock-${idx}`} position={[cx, 0, 0]}>
                {/* Clock Outer Brushed Titanium Bezel */}
                <mesh>
                  <cylinderGeometry args={[0.26, 0.26, 0.025, 32]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Dark Midnight Glass Clock Dial */}
                <mesh position={[0, 0, -0.014]} rotation={[Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.23, 32]} />
                  <meshStandardMaterial color="#060913" roughness={0.15} metalness={0.4} />
                </mesh>

                {/* 12 Hour Dial Ticks */}
                {Array.from({ length: 12 }).map((_, h) => {
                  const angle = (h * Math.PI) / 6;
                  const tx = Math.sin(angle) * 0.19;
                  const ty = Math.cos(angle) * 0.19;
                  return (
                    <mesh key={`tick-${h}`} position={[tx, ty, -0.018]}>
                      <boxGeometry args={[0.012, 0.03, 0.005]} />
                      <meshBasicMaterial color={h % 3 === 0 ? '#38bdf8' : '#64748b'} />
                    </mesh>
                  );
                })}

                {/* Live Rotating Second Hand */}
                <group ref={clockRefs[idx]} position={[0, 0, -0.02]}>
                  <mesh position={[0, 0.08, 0]}>
                    <boxGeometry args={[0.005, 0.16, 0.004]} />
                    <meshBasicMaterial color="#ff1744" />
                  </mesh>
                  {/* Center Brass Pivot Pin */}
                  <mesh>
                    <cylinderGeometry args={[0.012, 0.012, 0.01, 16]} />
                    <meshStandardMaterial color="#facc15" metalness={0.9} />
                  </mesh>
                </group>

                {/* City Timezone Label & Online Status LED */}
                <mesh position={[0, -0.32, 0]}>
                  <boxGeometry args={[0.54, 0.09, 0.015]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.4} />
                </mesh>
                {/* Active Sync Status Green LED */}
                <mesh position={[-0.21, -0.32, -0.01]}>
                  <sphereGeometry args={[0.014, 8, 8]} />
                  <meshBasicMaterial color="#22c55e" />
                </mesh>

                {/* Digital Time Badge */}
                <mesh position={[0, -0.42, 0]}>
                  <boxGeometry args={[0.48, 0.07, 0.015]} />
                  <meshStandardMaterial color="#050811" roughness={0.3} />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* --- OPERATIVE CREDENTIALS & HALL OF FAME GALLERY --- */}
        <group position={[0, -0.85, -0.02]}>
          {/* Header Plaque */}
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[2.7, 0.14, 0.02]} />
            <meshStandardMaterial color="#0b101c" roughness={0.3} metalness={0.8} />
          </mesh>

          {/* 3 Museum-Grade Framed Credential Plaques */}
          {[
            { x: -0.9, tex: defconTex, title: 'DEF CON Black Badge', color: '#eab308' },
            { x: 0.0, tex: oscpTex, title: 'OSCP Certified', color: '#ef4444' },
            { x: 0.9, tex: bountyTex, title: 'Bug Bounty Hall of Fame', color: '#38bdf8' },
          ].map((item, idx) => (
            <group key={`plaque-${idx}`} position={[item.x, 0, 0]}>
              {/* Brushed Aluminum Outer Frame */}
              <mesh>
                <boxGeometry args={[0.78, 0.54, 0.03]} />
                <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
              </mesh>

              {/* Framed Graphic Artwork Face */}
              <mesh position={[0, 0, -0.018]}>
                <planeGeometry args={[0.72, 0.48]} />
                <meshBasicMaterial map={item.tex} />
              </mesh>

              {/* Museum Anti-Reflective Glare Glass Cover */}
              <mesh position={[0, 0, -0.02]}>
                <planeGeometry args={[0.74, 0.50]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.12}
                  roughness={0.05}
                  metalness={0.1}
                />
              </mesh>

              {/* Miniature Museum Gallery Light Fixture mounted above */}
              <group position={[0, 0.32, -0.06]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.012, 0.012, 0.28, 12]} />
                  <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
                </mesh>
                {/* Gallery Hood Spotlight */}
                <mesh position={[0, -0.02, 0]}>
                  <boxGeometry args={[0.26, 0.025, 0.05]} />
                  <meshStandardMaterial color="#d4af37" metalness={0.9} />
                </mesh>
              </group>
            </group>
          ))}
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 3. RIGHT WALL: LOUNGE CONSOLE, PHOTOREALISTIC PLANT & SOUND ART          */}
      {/* Centered at X = 4.125, Y = 2.25, Z = 0 (Under the golden pendant lamp)    */}
      {/* ========================================================================= */}
      <group position={[4.125, 0, -0.08]}>
        {/* Floating Executive American Walnut Console Shelf */}
        <group position={[0, 0.82, -0.22]}>
          {/* Main Solid Walnut Shelf Surface */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.045, 0.45]} />
            <meshStandardMaterial color="#3b2316" roughness={0.72} metalness={0.08} />
          </mesh>

          {/* Brushed Brass Cantilever Support Brackets */}
          {[-0.55, 0.55].map((bx, idx) => (
            <mesh key={`shelf-bracket-${idx}`} position={[bx, -0.12, 0.12]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[0.035, 0.28, 0.025]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}

          {/* Photorealistic Scanned Potted Plant (potted_plant_02.glb) on Console */}
          <group position={[-0.32, 0.025, 0]}>
            <ConsolePlant scale={0.55} />
          </group>

          {/* Minimalist Executive Smoked Glass & Brass Desk Hourglass */}
          <group position={[0.38, 0.14, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.24, 16]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.35}
                roughness={0.1}
                transmission={0.8}
              />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.015, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.015, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* Backlit Geometric Cyber Soundwave Acoustic Wall Relief Art */}
        <group position={[0, 2.25, -0.04]}>
          {/* Dark Charcoal Relief Backing Panel */}
          <mesh receiveShadow>
            <boxGeometry args={[1.5, 1.8, 0.03]} />
            <meshStandardMaterial color="#0c121e" roughness={0.8} metalness={0.2} />
          </mesh>

          {/* 3 Floating Acoustic Wave Slabs with Warm Golden Backlighting */}
          {[-0.42, 0.0, 0.42].map((ax, idx) => (
            <mesh key={`art-panel-${idx}`} position={[ax, 0, -0.03]}>
              <boxGeometry args={[0.34, 1.5, 0.03]} />
              <meshStandardMaterial color="#1a2538" roughness={0.5} metalness={0.4} />
            </mesh>
          ))}

          {/* Soft Backlit Accent Glow behind Art Panel */}
          <pointLight
            position={[0, 0, -0.12]}
            color={theme.warmAccent || '#f59e0b'}
            intensity={1.2}
            distance={2.4}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload(getAssetUrl('models/potted_plant_02.glb'));
