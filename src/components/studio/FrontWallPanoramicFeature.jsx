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
// PROCEDURAL HIGH-RESOLUTION TEXTURE GENERATORS (Generated once & cached)
// =============================================================================

function createSkyscraperTexture() {
  if (typeof document === 'undefined') return { map: null, emissive: null };
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = size;
  emissiveCanvas.height = size;
  const emCtx = emissiveCanvas.getContext('2d');

  // Dark architectural facade
  ctx.fillStyle = '#080d1a';
  ctx.fillRect(0, 0, size, size);
  emCtx.fillStyle = '#000000';
  emCtx.fillRect(0, 0, size, size);

  const cols = 24;
  const rows = 32;
  const colW = size / cols;
  const rowH = size / rows;
  const winW = colW * 0.72;
  const winH = rowH * 0.62;

  // Window color palette (Warm office lights, cool tech white, cyber cyan, amber)
  const windowPalette = ['#fef08a', '#fde047', '#f8fafc', '#e2e8f0', '#38bdf8', '#67e8f9'];

  // Seeded deterministic window layout
  let seed = 42;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let r = 0; r < rows; r++) {
    // Floor structural slab band
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, r * rowH, size, 2);

    for (let c = 0; c < cols; c++) {
      const isLit = pseudoRandom() > 0.32;
      const x = c * colW + (colW - winW) / 2;
      const y = r * rowH + (rowH - winH) / 2;

      if (isLit) {
        const colorIdx = Math.floor(pseudoRandom() * windowPalette.length);
        const winColor = windowPalette[colorIdx];
        const brightness = 0.65 + pseudoRandom() * 0.35;

        ctx.fillStyle = winColor;
        ctx.globalAlpha = brightness;
        ctx.fillRect(x, y, winW, winH);

        emCtx.fillStyle = winColor;
        emCtx.globalAlpha = brightness * 0.9;
        emCtx.fillRect(x, y, winW, winH);
      } else {
        // Dark reflective interior window
        ctx.fillStyle = '#0f172a';
        ctx.globalAlpha = 0.85;
        ctx.fillRect(x, y, winW, winH);
      }
    }
  }

  ctx.globalAlpha = 1.0;
  emCtx.globalAlpha = 1.0;

  const map = new THREE.CanvasTexture(canvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 4);
  map.colorSpace = THREE.SRGBColorSpace;

  const emissive = new THREE.CanvasTexture(emissiveCanvas);
  emissive.wrapS = THREE.RepeatWrapping;
  emissive.wrapT = THREE.RepeatWrapping;
  emissive.repeat.set(2, 4);

  return { map, emissive };
}

function createNightSkyTexture() {
  if (typeof document === 'undefined') return null;
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  // Midnight vertical atmospheric sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.0, '#020409');
  grad.addColorStop(0.5, '#070f1e');
  grad.addColorStop(0.85, '#0c1b33');
  grad.addColorStop(1.0, '#16284a'); // City light pollution horizon glow
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Distant stars & constellations
  let seed = 1337;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 280; i++) {
    const sx = rnd() * w;
    const sy = rnd() * (h * 0.72);
    const r = rnd() > 0.92 ? 1.4 : 0.8;
    ctx.globalAlpha = 0.35 + rnd() * 0.65;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

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
// MAIN COMPONENT: FRONT WALL OPERATIVE & SKYLINE FEATURE
// =============================================================================

export default function FrontWallPanoramicFeature({ currentThemeKey = 'CYBER_NEON_NOIR' }) {
  const theme = LIGHTING_THEMES[currentThemeKey] || LIGHTING_THEMES.CYBER_NEON_NOIR;

  // Curtains sway refs
  const curtainLeftRef = useRef();
  const curtainRightRef = useRef();

  // Traffic lanes
  const trafficLane1Ref = useRef();
  const trafficLane2Ref = useRef();

  // Aviation warning beacons
  const beaconLightRef = useRef();

  // World Clocks second hands refs
  const clockRefs = [useRef(), useRef(), useRef(), useRef()];
  const [digitalTimes, setDigitalTimes] = useState(['--:--:--', '--:--:--', '--:--:--', '--:--:--']);

  // Skyscraper textures & Night sky
  const { map: bldgMap, emissive: bldgEmissive } = useMemo(() => createSkyscraperTexture(), []);
  const nightSkyTexture = useMemo(() => createNightSkyTexture(), []);

  // Framed Plaque textures
  const defconTex = useMemo(() => createPlaqueTexture('defcon'), []);
  const oscpTex = useMemo(() => createPlaqueTexture('oscp'), []);
  const bountyTex = useMemo(() => createPlaqueTexture('bounty'), []);

  // Shared Materials
  const skyscraperMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: bldgMap,
      emissiveMap: bldgEmissive,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.95,
      roughness: 0.25,
      metalness: 0.75,
      color: '#0d1527',
    });
  }, [bldgMap, bldgEmissive]);

  const glassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#93c5fd',
      transparent: true,
      opacity: 0.18,
      roughness: 0.06,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.52,
    });
  }, []);

  // 10 Detailed Skyscraper Building Configurations visible through 5.2m Window
  const skyscrapers = useMemo(() => {
    return [
      // Foreground Layer (Z = 6.0 to 6.8) - Prominent office towers
      { x: -1.75, z: 6.2, w: 0.95, d: 0.85, h: 5.8, hasBeacon: true, beaconColor: '#ef4444' },
      { x: -0.85, z: 6.6, w: 0.85, d: 0.8, h: 6.8, hasSpire: true, spireH: 1.2, hasBeacon: true },
      { x: 0.05, z: 5.9, w: 1.05, d: 0.9, h: 5.2, hasHelipad: true },
      { x: 0.95, z: 6.7, w: 0.9, d: 0.85, h: 7.2, hasSpire: true, spireH: 1.5, hasBeacon: true },
      { x: 1.85, z: 6.1, w: 1.0, d: 0.9, h: 5.5, hasCrown: true },
      { x: 2.75, z: 6.5, w: 0.9, d: 0.8, h: 6.1, hasBeacon: true },

      // Midground & Background Layer (Z = 7.8 to 9.2) - Dense urban skyline depth
      { x: -2.3, z: 8.2, w: 1.1, d: 0.9, h: 6.0 },
      { x: -1.25, z: 8.8, w: 1.2, d: 1.0, h: 7.5, hasBeacon: true },
      { x: -0.35, z: 8.0, w: 1.0, d: 0.9, h: 5.6 },
      { x: 0.55, z: 9.0, w: 1.3, d: 1.0, h: 7.8, hasBeacon: true },
      { x: 1.45, z: 8.3, w: 1.1, d: 0.9, h: 6.4 },
      { x: 2.35, z: 8.9, w: 1.2, d: 1.0, h: 6.9, hasBeacon: true },
      { x: 3.25, z: 8.4, w: 1.0, d: 0.85, h: 5.7 },
    ];
  }, []);

  // Moving hover vehicles in aerial skyway
  const vehicles1 = useMemo(() => [
    { offset: 0.0, speed: 0.95, color: '#38bdf8' },
    { offset: 2.2, speed: 0.85, color: '#67e8f9' },
    { offset: 4.5, speed: 1.05, color: '#a5f3fc' },
  ], []);

  const vehicles2 = useMemo(() => [
    { offset: 1.0, speed: 0.75, color: '#f43f5e' },
    { offset: 3.5, speed: 0.88, color: '#fb923c' },
  ], []);

  // Real-time Clock Hands & World Timezone Math
  // Clocks: [UTC (0), SFO (-7), LON (+1), TYO (+9)]
  const timezoneOffsets = [0, -7, 1, 9];
  const timezoneLabels = ['UTC / ZULU', 'SFO (PST)', 'LON (GMT)', 'TYO (JST)'];

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Blinking Aviation Beacons on Skyscraper Pinnacles
    if (beaconLightRef.current) {
      beaconLightRef.current.intensity = Math.sin(time * 3.5) > 0.2 ? 2.5 : 0.2;
    }

    // 2. Curtains Soft Breeze Sway
    if (curtainLeftRef.current) {
      curtainLeftRef.current.rotation.z = Math.sin(time * 1.4) * 0.015;
    }
    if (curtainRightRef.current) {
      curtainRightRef.current.rotation.z = Math.sin(time * 1.4 + 0.8) * 0.015;
    }

    // 3. Aerial Hover Traffic Motion
    if (trafficLane1Ref.current) {
      trafficLane1Ref.current.children.forEach((mesh, i) => {
        const v = vehicles1[i];
        if (v) {
          mesh.position.x = ((time * v.speed + v.offset) % 7.4) - 3.7;
        }
      });
    }
    if (trafficLane2Ref.current) {
      trafficLane2Ref.current.children.forEach((mesh, i) => {
        const v = vehicles2[i];
        if (v) {
          mesh.position.x = 3.7 - ((time * v.speed + v.offset) % 7.4);
        }
      });
    }

    // 4. Update Live Clock Second Hands
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
    <group name="FrontWallPanoramicFeature" position={[0, 0, 5.05]}>
      {/* ========================================================================= */}
      {/* 1. PHOTOREALISTIC ILLUMINATED NIGHT METROPOLIS (Outside the Window)      */}
      {/* ========================================================================= */}
      <group position={[0, 0, 0.4]}>
        {/* Deep Atmospheric Starry Sky Backdrop */}
        <mesh position={[0.6, 2.8, 11.5]}>
          <planeGeometry args={[26, 14]} />
          <meshBasicMaterial map={nightSkyTexture} />
        </mesh>

        {/* City Horizon Atmospheric Light Glow Plane */}
        <mesh position={[0.6, 0.8, 10.0]}>
          <planeGeometry args={[22, 5]} />
          <meshBasicMaterial
            color="#1e3a8a"
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Pulsing Aviation Warning Light System on Skyscraper Towers */}
        <pointLight
          ref={beaconLightRef}
          position={[0.95, 5.7, 6.7]}
          color="#ff1744"
          intensity={2.0}
          distance={10}
        />

        {/* 13 Multi-Tier Skyscraper Towers with Real Lit Window Grids */}
        {skyscrapers.map((b, i) => (
          <group key={`sky-tower-${i}`} position={[b.x, b.h * 0.5 - 1.2, b.z]}>
            {/* Main Skyscraper Monolith */}
            <mesh material={skyscraperMaterial} castShadow={false} receiveShadow={false}>
              <boxGeometry args={[b.w, b.h, b.d]} />
            </mesh>

            {/* Architectural Penthouse Crown Setback */}
            {b.hasCrown && (
              <mesh position={[0, b.h * 0.5 + 0.35, 0]}>
                <boxGeometry args={[b.w * 0.72, 0.7, b.d * 0.72]} />
                <meshStandardMaterial
                  color="#1e293b"
                  emissive="#38bdf8"
                  emissiveIntensity={0.6}
                  metalness={0.9}
                />
              </mesh>
            )}

            {/* Communications Antenna Spire */}
            {b.hasSpire && (
              <group position={[0, b.h * 0.5, 0]}>
                <mesh position={[0, (b.spireH || 1.2) * 0.5, 0]}>
                  <cylinderGeometry args={[0.015, 0.04, b.spireH || 1.2, 8]} />
                  <meshStandardMaterial color="#64748b" metalness={0.9} />
                </mesh>
                {/* Red Glowing Beacon Bulb on tip */}
                <mesh position={[0, b.spireH || 1.2, 0]}>
                  <sphereGeometry args={[0.045, 8, 8]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
              </group>
            )}

            {/* Rooftop Helipad with Glowing Perimeter Ring */}
            {b.hasHelipad && (
              <group position={[0, b.h * 0.5 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <mesh>
                  <circleGeometry args={[0.34, 24]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.8} />
                </mesh>
                {/* Glowing Yellow Helipad Perimeter */}
                <mesh position={[0, 0, 0.005]}>
                  <ringGeometry args={[0.31, 0.34, 24]} />
                  <meshBasicMaterial color="#facc15" />
                </mesh>
              </group>
            )}

            {/* Glowing Rooftop Obstruction Beacons */}
            {b.hasBeacon && !b.hasSpire && (
              <mesh position={[0, b.h * 0.5 + 0.06, 0]}>
                <sphereGeometry args={[0.035, 8, 8]} />
                <meshBasicMaterial color={b.beaconColor || '#ef4444'} />
              </mesh>
            )}
          </group>
        ))}

        {/* Aerial Skyway Transit Hover Traffic (Forward Lane) */}
        <group ref={trafficLane1Ref} position={[0.6, 2.5, 5.4]}>
          {vehicles1.map((v, i) => (
            <mesh key={`traffic-1-${i}`} position={[0, 0, 0]}>
              <boxGeometry args={[0.18, 0.04, 0.06]} />
              <meshBasicMaterial color={v.color} />
            </mesh>
          ))}
        </group>

        {/* Aerial Skyway Transit Hover Traffic (Reverse Lane) */}
        <group ref={trafficLane2Ref} position={[0.6, 3.2, 5.6]}>
          {vehicles2.map((v, i) => (
            <mesh key={`traffic-2-${i}`} position={[0, 0, 0]}>
              <boxGeometry args={[0.18, 0.04, 0.06]} />
              <meshBasicMaterial color={v.color} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 2. ARCHITECTURAL MOTORIZED DRAPERY & WINDOW COVE LIGHTING                */}
      {/* ========================================================================= */}
      <group position={[0.6, 2.25, 0]}>
        {/* Recessed Architectural Curtain Pelmet / Valance Box along ceiling */}
        <mesh position={[0, 2.12, -0.1]}>
          <boxGeometry args={[5.35, 0.16, 0.18]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.4} />
        </mesh>

        {/* Concealed Ambient LED Trough Lighting washing down over window */}
        <mesh position={[0, 2.03, -0.08]}>
          <boxGeometry args={[5.1, 0.015, 0.02]} />
          <meshBasicMaterial color={theme.accentColor || '#38bdf8'} />
        </mesh>

        {/* Left Drapery (High-End Pleated Dark Slate Fabric) */}
        <group ref={curtainLeftRef} position={[-2.42, 0, -0.06]}>
          {[-0.14, -0.07, 0.0, 0.07, 0.14].map((px, i) => (
            <mesh key={`curt-l-${i}`} position={[px, 0, (i % 2) * 0.018]}>
              <boxGeometry args={[0.08, 4.0, 0.035]} />
              <meshStandardMaterial color="#0f1623" roughness={0.88} metalness={0.05} />
            </mesh>
          ))}
        </group>

        {/* Right Drapery (High-End Pleated Dark Slate Fabric) */}
        <group ref={curtainRightRef} position={[2.42, 0, -0.06]}>
          {[-0.14, -0.07, 0.0, 0.07, 0.14].map((px, i) => (
            <mesh key={`curt-r-${i}`} position={[px, 0, (i % 2) * 0.018]}>
              <boxGeometry args={[0.08, 4.0, 0.035]} />
              <meshStandardMaterial color="#0f1623" roughness={0.88} metalness={0.05} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 3. LEFT WALL: SOC GLOBAL OPERATIONS WORLD CLOCKS & HALL OF FAME           */}
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
      {/* 4. RIGHT WALL: LOUNGE CONSOLE, PHOTOREALISTIC PLANT & SOUND ART          */}
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
