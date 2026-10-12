import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural Realistic Executive Foliage & Decor Elements
 * Replaces primitive spheres with botanical, architectural office plants:
 * 1. Tall Fiddle Leaf Fig (Ficus Lyrata) tree in Scandinavian wooden cross-stand ceramic pot.
 * 2. Architectural Variegated Snake Plant (Sansevieria) in ribbed fluted planter by conference room.
 * 3. Ceiling Track Lighting rails with focused downlights.
 */
export default function DecorElements() {
  const treeSwayRef = useRef();
  const snakePlantSwayRef = useRef();

  // ---------------------------------------------------------------------------
  // 1. Procedural Ficus Lyrata (Fiddle Leaf Fig) Leaf Blade Geometry
  // Features organic violin/paddle silhouette, central V-crease midrib, and natural gravity arch.
  // ---------------------------------------------------------------------------
  const fiddleLeafGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.28, 0.58, 12, 16);
    const pos = geom.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Normalized vertical factor from base (0) to tip (1)
      const t = (y + 0.29) / 0.58;

      // Natural fiddle leaf contour: narrow petiole base -> broad middle lobe -> gentle waist -> rounded crest tip
      const baseWidth = Math.sin(Math.pow(t, 0.65) * Math.PI);
      const waistFactor = 1.05 + 0.22 * Math.sin(t * Math.PI * 2.2 - 0.4);
      const widthFactor = baseWidth * waistFactor;

      pos.setX(i, x * Math.max(0.12, widthFactor));

      // Natural V-crease down the midrib (x = 0)
      const midribCrease = Math.abs(x) * 0.32;

      // Natural downward gravity bow/droop towards the tip
      const droop = Math.pow(t, 2.0) * 0.16;

      // Subtle organic leaf edge ripple
      const ripple = Math.sin(t * 14 + x * 12) * 0.009 * Math.sin(t * Math.PI);

      pos.setZ(i, -midribCrease - droop + ripple);
    }

    geom.computeVertexNormals();
    // Shift origin to the base of the leaf so it pivots at the petiole stem attachment
    geom.translate(0, 0.29, 0);
    return geom;
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Procedural Sansevieria (Snake Plant) Sword Leaf Geometry
  // Tall, upright, gently cupped blade that tapers to an architectural pointed tip.
  // ---------------------------------------------------------------------------
  const snakeLeafGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.12, 0.85, 8, 18);
    const pos = geom.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const t = (y + 0.425) / 0.85;

      // Sword taper profile: widens from base, stays erect, sharp taper in top 15%
      const widthFactor = t < 0.82 ? Math.sin(t * 1.35) * 1.15 : (1 - t) * 6.5;
      pos.setX(i, x * Math.max(0.08, widthFactor));

      // Organic cupped cross-section + subtle helical twist
      const cup = x * x * 3.8;
      const twist = Math.sin(t * Math.PI * 0.7) * 0.035;

      pos.setZ(i, -cup + twist);
    }

    geom.computeVertexNormals();
    geom.translate(0, 0.425, 0);
    return geom;
  }, []);

  // Subtle natural air conditioning breeze oscillation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (treeSwayRef.current) {
      treeSwayRef.current.rotation.z = Math.sin(time * 1.1) * 0.016 + Math.sin(time * 2.3) * 0.005;
      treeSwayRef.current.rotation.x = Math.cos(time * 0.9) * 0.012;
    }
    if (snakePlantSwayRef.current) {
      snakePlantSwayRef.current.rotation.z = Math.sin(time * 0.8 + 1) * 0.008;
    }
  });

  // Botanical Leaf Cluster distribution for the Fiddle Leaf Fig tree
  const treeLeaves = useMemo(
    () => [
      // --- Lower Tier: Mature, broader leaves drooping outward ---
      { pos: [-0.08, 0.85, 0.12], rot: [0.65, 0.3, -0.4], s: 1.15, color: '#16381d' },
      { pos: [0.12, 0.90, -0.09], rot: [0.60, 2.1, 0.3], s: 1.12, color: '#183c20' },
      { pos: [-0.14, 0.98, -0.11], rot: [0.75, -1.4, -0.2], s: 1.18, color: '#15361b' },
      { pos: [0.15, 1.05, 0.14], rot: [0.55, -2.8, 0.4], s: 1.10, color: '#1a4122' },
      { pos: [-0.04, 1.12, 0.18], rot: [0.70, 0.8, -0.3], s: 1.14, color: '#173a1e' },
      { pos: [0.16, 1.18, -0.15], rot: [0.65, -0.6, 0.35], s: 1.12, color: '#193f21' },

      // --- Mid Tier: Main spreading canopy ---
      { pos: [-0.18, 1.28, 0.08], rot: [0.45, 0.5, -0.35], s: 1.05, color: '#1e4b27' },
      { pos: [0.18, 1.34, 0.12], rot: [0.40, -1.8, 0.25], s: 1.08, color: '#1c4725' },
      { pos: [-0.12, 1.42, -0.16], rot: [0.50, 2.6, -0.3], s: 1.02, color: '#20502a' },
      { pos: [0.14, 1.48, -0.18], rot: [0.42, -0.9, 0.28], s: 1.06, color: '#1f4e29' },
      { pos: [-0.22, 1.55, 0.04], rot: [0.38, 1.2, -0.4], s: 1.00, color: '#22552d' },
      { pos: [0.08, 1.62, 0.22], rot: [0.44, -2.4, 0.3], s: 0.98, color: '#21532c' },
      { pos: [-0.10, 1.68, 0.18], rot: [0.35, 0.2, -0.25], s: 0.96, color: '#24592f' },
      { pos: [0.20, 1.72, -0.06], rot: [0.40, -1.3, 0.32], s: 0.95, color: '#23572e' },

      // --- Upper Tier: Fresh upright canopy ---
      { pos: [-0.14, 1.82, -0.10], rot: [0.28, 2.2, -0.2], s: 0.90, color: '#276234' },
      { pos: [0.12, 1.88, 0.14], rot: [0.25, -2.7, 0.22], s: 0.88, color: '#296737' },
      { pos: [-0.08, 1.95, 0.12], rot: [0.30, 0.9, -0.18], s: 0.85, color: '#2c6d3a' },
      { pos: [0.10, 2.02, -0.12], rot: [0.22, -0.5, 0.2], s: 0.82, color: '#2e723d' },

      // --- Crown: Tender emerging apical leaves ---
      { pos: [-0.04, 2.12, 0.04], rot: [0.18, 0.4, -0.1], s: 0.76, color: '#327d42' },
      { pos: [0.05, 2.18, -0.04], rot: [0.15, -1.6, 0.12], s: 0.72, color: '#368648' },
      { pos: [0.01, 2.26, 0.02], rot: [0.08, 1.1, 0.05], s: 0.65, color: '#3b924e' },
    ],
    []
  );

  // Snake Plant upright sword leaves arrangement
  const snakeLeaves = useMemo(
    () => [
      // Outer ring (shorter, outward flair)
      { rot: [0.18, 0.0, 0.12], h: 0.55, scale: [0.9, 0.7, 0.9] },
      { rot: [0.15, 0.8, -0.1], h: 0.58, scale: [0.92, 0.75, 0.92] },
      { rot: [-0.12, 1.6, 0.16], h: 0.52, scale: [0.88, 0.68, 0.88] },
      { rot: [-0.16, 2.3, -0.14], h: 0.60, scale: [0.95, 0.78, 0.95] },
      { rot: [0.14, 3.1, 0.1], h: 0.54, scale: [0.9, 0.72, 0.9] },
      { rot: [0.16, 3.9, -0.15], h: 0.56, scale: [0.92, 0.74, 0.92] },
      { rot: [-0.15, 4.7, 0.12], h: 0.50, scale: [0.85, 0.65, 0.85] },
      { rot: [-0.12, 5.5, -0.1], h: 0.58, scale: [0.92, 0.76, 0.92] },

      // Mid ring (taller, more upright)
      { rot: [0.08, 0.4, 0.06], h: 0.72, scale: [1.0, 0.95, 1.0] },
      { rot: [-0.07, 1.9, 0.08], h: 0.76, scale: [1.02, 1.0, 1.02] },
      { rot: [0.09, 3.5, -0.07], h: 0.70, scale: [0.98, 0.92, 0.98] },
      { rot: [-0.08, 5.1, -0.06], h: 0.74, scale: [1.0, 0.97, 1.0] },

      // Center focal upright spikes (tallest apex)
      { rot: [0.03, 1.1, 0.02], h: 0.88, scale: [1.05, 1.15, 1.05] },
      { rot: [-0.02, 2.7, -0.03], h: 0.92, scale: [1.08, 1.22, 1.08] },
      { rot: [0.04, 4.3, 0.01], h: 0.86, scale: [1.04, 1.12, 1.04] },
    ],
    []
  );

  return (
    <group name="DecorElements">
      {/* ========================================================================= */}
      {/* 1. LUXURY FIDDLE LEAF FIG TREE (Back Right Window Corner, [2.2, 0, -4.2]) */}
      {/* ========================================================================= */}
      <group position={[2.2, 0, -4.2]}>
        {/* --- SCANDINAVIAN SOLID WALNUT WOODEN CROSS-STAND --- */}
        <group position={[0, 0, 0]}>
          {/* 4 Wooden Stand Legs */}
          {[
            [-0.24, -0.24],
            [0.24, -0.24],
            [-0.24, 0.24],
            [0.24, 0.24],
          ].map(([lx, lz], idx) => (
            <mesh key={`leg-${idx}`} position={[lx, 0.22, lz]} castShadow receiveShadow>
              <boxGeometry args={[0.032, 0.44, 0.032]} />
              <meshStandardMaterial color="#2d1c13" roughness={0.75} metalness={0.05} />
            </mesh>
          ))}
          {/* Cross Support Rails */}
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.51, 0.028, 0.032]} />
            <meshStandardMaterial color="#2d1c13" roughness={0.75} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.032, 0.028, 0.51]} />
            <meshStandardMaterial color="#2d1c13" roughness={0.75} metalness={0.05} />
          </mesh>
        </group>

        {/* --- ARCHITECTURAL FLUTED MATTE CERAMIC PLANTER POT --- */}
        <group position={[0, 0.23, 0]}>
          {/* Pot Main Cylindrical Shell */}
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.26, 0.22, 0.56, 32]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.85} metalness={0.02} />
          </mesh>
          {/* Brass Lip Inset Ring */}
          <mesh position={[0, 0.565, 0]}>
            <cylinderGeometry args={[0.262, 0.262, 0.015, 32]} />
            <meshStandardMaterial color="#d97706" metalness={0.88} roughness={0.22} />
          </mesh>
          {/* Rich Dark Organic Potting Soil */}
          <mesh position={[0, 0.54, 0]} receiveShadow>
            <cylinderGeometry args={[0.245, 0.245, 0.04, 32]} />
            <meshStandardMaterial color="#1c140e" roughness={0.96} />
          </mesh>

          {/* Decorative Natural White/Grey River Pebbles on Soil */}
          {[
            [-0.12, 0.08, 0.022],
            [0.14, -0.06, 0.025],
            [-0.05, -0.15, 0.02],
            [0.08, 0.13, 0.024],
            [-0.15, -0.07, 0.021],
            [0.02, 0.17, 0.023],
          ].map(([px, pz, pr], idx) => (
            <mesh key={`pebble-${idx}`} position={[px, 0.565, pz]} castShadow>
              <sphereGeometry args={[pr, 10, 8]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#e2e8f0' : '#94a3b8'}
                roughness={0.6}
              />
            </mesh>
          ))}
        </group>

        {/* --- LIVING SWAYING BOTANICAL CANOPY --- */}
        <group ref={treeSwayRef} position={[0, 0.77, 0]}>
          {/* Realistic Woody Tree Trunk & Branches */}
          {/* Lower Main Trunk */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.038, 0.56, 12]} />
            <meshStandardMaterial color="#423023" roughness={0.95} metalness={0.02} />
          </mesh>
          {/* Mid Trunk (slight organic tilt toward window light) */}
          <mesh position={[0.02, 0.74, -0.03]} rotation={[-0.08, 0.2, 0.06]} castShadow>
            <cylinderGeometry args={[0.022, 0.028, 0.45, 12]} />
            <meshStandardMaterial color="#423023" roughness={0.95} metalness={0.02} />
          </mesh>
          {/* Left Branch Limb */}
          <mesh position={[-0.06, 1.05, 0.04]} rotation={[0.22, 0.4, -0.28]} castShadow>
            <cylinderGeometry args={[0.014, 0.020, 0.38, 10]} />
            <meshStandardMaterial color="#473628" roughness={0.92} metalness={0.02} />
          </mesh>
          {/* Right Branch Limb */}
          <mesh position={[0.07, 1.15, -0.05]} rotation={[-0.25, -0.5, 0.32]} castShadow>
            <cylinderGeometry args={[0.012, 0.018, 0.42, 10]} />
            <meshStandardMaterial color="#473628" roughness={0.92} metalness={0.02} />
          </mesh>
          {/* Upper Central Spire */}
          <mesh position={[0.01, 1.35, 0.01]} rotation={[0.05, 0.1, -0.04]} castShadow>
            <cylinderGeometry args={[0.009, 0.014, 0.46, 10]} />
            <meshStandardMaterial color="#4c3b2d" roughness={0.92} metalness={0.02} />
          </mesh>

          {/* 21 Detailed Fiddle Leaf Fig Blades with Petioles */}
          {treeLeaves.map((leaf, idx) => (
            <group key={`ficus-leaf-${idx}`} position={leaf.pos} rotation={leaf.rot} scale={leaf.s}>
              {/* Petiole (Leaf Stem) connecting to branch */}
              <mesh position={[0, -0.04, 0]} rotation={[0.1, 0, 0]} castShadow>
                <cylinderGeometry args={[0.004, 0.006, 0.12, 8]} />
                <meshStandardMaterial color="#3a5832" roughness={0.7} />
              </mesh>

              {/* Realistic Curved Fiddle Leaf Blade */}
              <mesh geometry={fiddleLeafGeometry} castShadow receiveShadow>
                <meshStandardMaterial
                  color={leaf.color}
                  roughness={0.62}
                  metalness={0.04}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Raised Midrib Central Spine */}
              <mesh position={[0, 0.28, 0.004]} castShadow>
                <cylinderGeometry args={[0.0025, 0.004, 0.54, 6]} />
                <meshStandardMaterial color="#4a7c45" roughness={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 2. ARCHITECTURAL SANSEVIERIA SNAKE PLANT (Left Conference Wall [-4.4, 0, 1.8]) */}
      {/* ========================================================================= */}
      <group position={[-4.4, 0, 1.8]}>
        {/* Modern Fluted Matte Charcoal Planter Pot */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.17, 0.56, 28]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.25} />
        </mesh>
        {/* Bronze Potting Lip Collar */}
        <mesh position={[0, 0.565, 0]}>
          <cylinderGeometry args={[0.224, 0.224, 0.014, 28]} />
          <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Potting Soil Bed */}
        <mesh position={[0, 0.54, 0]} receiveShadow>
          <cylinderGeometry args={[0.205, 0.205, 0.03, 28]} />
          <meshStandardMaterial color="#1a120c" roughness={0.95} />
        </mesh>

        {/* Dense Architectural Snake Plant Foliage Cluster */}
        <group ref={snakePlantSwayRef} position={[0, 0.55, 0]}>
          {snakeLeaves.map((lf, idx) => (
            <group
              key={`snake-leaf-${idx}`}
              position={[0, 0, 0]}
              rotation={lf.rot}
              scale={lf.scale}
            >
              {/* Variegated Snake Plant Leaf Blade with Gold Edge Tone */}
              <mesh geometry={snakeLeafGeometry} castShadow receiveShadow>
                <meshStandardMaterial
                  color="#154d24"
                  roughness={0.55}
                  metalness={0.06}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Outer Golden Border Trim Accent */}
              <mesh
                geometry={snakeLeafGeometry}
                position={[0, 0, -0.002]}
                scale={[1.04, 1.0, 1.0]}
              >
                <meshStandardMaterial
                  color="#eab308"
                  roughness={0.65}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* ========================================================================= */}
      {/* 3. CEILING TRACK LIGHTING RAILS WITH ARCHITECTURAL SPOTLIGHTS             */}
      {/* ========================================================================= */}
      <group position={[0, 4.35, 0]}>
        {/* Longitudinal Rail 1 */}
        <mesh position={[-1.5, 0, 0]}>
          <boxGeometry args={[0.04, 0.06, 8.5]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Longitudinal Rail 2 */}
        <mesh position={[1.5, 0, 0]}>
          <boxGeometry args={[0.04, 0.06, 8.5]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Spotlights clamped to rails */}
        {[
          { pos: [-1.5, -0.08, 0.4], rot: [0.2, 0, 0.3], target: 'workstation' },
          { pos: [-1.5, -0.08, -2.0], rot: [0.4, 0, -0.5], target: 'conference' },
          { pos: [-1.5, -0.08, 2.5], rot: [-0.3, 0, 0.2], target: 'printer' },
          { pos: [1.5, -0.08, -2.5], rot: [0.3, 0, -0.2], target: 'archive' },
          { pos: [1.5, -0.08, 1.6], rot: [-0.2, 0, -0.4], target: 'lounge' },
        ].map((spot, idx) => (
          <group key={`track-spot-${idx}`} position={spot.pos} rotation={spot.rot}>
            <mesh castShadow>
              <cylinderGeometry args={[0.04, 0.06, 0.12, 16]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.065, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.01, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
