import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import RealisticTree from './RealisticTree.jsx';

/**
 * Helper to compute asset URL based on Vite BASE_URL.
 * Supports root, relative, and GitHub Pages paths.
 */
const getAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanBase + cleanPath;
};

/**
 * Photorealistic Architectural Foliage & Decor Elements
 * Uses real CC0 3D scanned models and PBR textures:
 * 1. Realistic 3D Scanned Potted Tree (Poly Haven CC0): Detailed trunk, lush scanned canopy, terracotta pot with river gravel.
 * 2. Sansevieria (Snake Plant): Variegated sword leaves with micro-ribbed normal maps and dark slate planter.
 * 3. Ceiling Track Downlights with high-CRI spotlights.
 */
export default function DecorElements() {
  const snakePlantSwayRef = useRef();
  const [textures, setTextures] = useState({});

  // ---------------------------------------------------------------------------
  // Load Real High-Resolution PBR Textures (Leaves, Ceramic) for Snake Plant
  // Batched to trigger only a single component re-render when assets are loaded.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(manager);
    const loaded = {};

    const loadTexture = (key, relativePath, setupFn) => {
      loader.load(
        getAssetUrl(relativePath),
        (tex) => {
          if (setupFn) setupFn(tex);
          loaded[key] = tex;
        },
        undefined,
        (err) => {
          console.warn(`Texture load failed for ${relativePath}:`, err);
        }
      );
    };

    // 1. Scanned Real Leaf PBR Textures (AmbientCG LeafSet024)
    loadTexture('leafColor', 'textures/plant/LeafSet024_1K-JPG_Color.jpg', (t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
    });

    loadTexture('leafNormal', 'textures/plant/LeafSet024_1K-JPG_NormalGL.jpg', (t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
    });

    loadTexture('leafRoughness', 'textures/plant/LeafSet024_1K-JPG_Roughness.jpg', (t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
    });

    // 2. White Plaster Ceramic Pot PBR (Poly Haven)
    loadTexture('potColor', 'textures/pot/pot_diff.jpg', (t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      t.colorSpace = THREE.SRGBColorSpace;
    });

    loadTexture('potNormal', 'textures/pot/pot_nor.jpg', (t) => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
    });

    manager.onLoad = () => {
      setTextures({ ...loaded });
    };
  }, []);

  // Shared High-Performance Materials for Snake Plant (Eliminates redundant allocations)
  const snakeLeafMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: textures.leafColor || null,
      normalMap: textures.leafNormal || null,
      roughnessMap: textures.leafRoughness || null,
      normalScale: new THREE.Vector2(0.7, 0.7),
      color: textures.leafColor ? '#66b278' : '#154d24',
      roughness: 0.54,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
  }, [textures.leafColor, textures.leafNormal, textures.leafRoughness]);

  const snakeGoldTrimMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.65, side: THREE.DoubleSide }),
    []
  );

  // ---------------------------------------------------------------------------
  // Procedural Sansevieria (Snake Plant) Sword Leaf Geometry
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

  // Subtle natural air conditioning breeze oscillation for snake plant
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (snakePlantSwayRef.current) {
      snakePlantSwayRef.current.rotation.z = Math.sin(time * 0.8 + 1) * 0.008;
    }
  });

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
      {/* 1. PHOTOREALISTIC ARCHITECTURAL POTTED TREE (Window Corner [2.2, 0, -4.2]) */}
      {/* ========================================================================= */}
      <RealisticTree position={[2.2, 0, -4.2]} scale={1.35} rotation={[0, -0.45, 0]} />

      {/* ========================================================================= */}
      {/* 2. ARCHITECTURAL SANSEVIERIA SNAKE PLANT (Left Conference Wall [-4.4, 0, 1.8]) */}
      {/* ========================================================================= */}
      <group position={[-4.4, 0, 1.8]}>
        {/* Modern Fluted Matte Charcoal Planter Pot */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.17, 0.56, 28]} />
          <meshStandardMaterial
            map={textures.potColor || null}
            normalMap={textures.potNormal || null}
            normalScale={[0.5, 0.5]}
            color="#1e293b"
            roughness={0.55}
            metalness={0.2}
          />
        </mesh>
        {/* Bronze Potting Lip Collar */}
        <mesh position={[0, 0.565, 0]}>
          <cylinderGeometry args={[0.224, 0.224, 0.014, 28]} />
          <meshStandardMaterial color="#b45309" metalness={0.88} roughness={0.2} />
        </mesh>
        {/* Potting Soil Bed */}
        <mesh position={[0, 0.54, 0]} receiveShadow>
          <cylinderGeometry args={[0.205, 0.205, 0.03, 28]} />
          <meshStandardMaterial color="#1a120c" roughness={0.95} />
        </mesh>

        {/* Dense Architectural Snake Plant Foliage Cluster with PBR Leaf Micro-Detail */}
        <group ref={snakePlantSwayRef} position={[0, 0.55, 0]}>
          {snakeLeaves.map((lf, idx) => (
            <group
              key={`snake-leaf-${idx}`}
              position={[0, 0, 0]}
              rotation={lf.rot}
              scale={lf.scale}
            >
              {/* Variegated Snake Plant Leaf Blade with Gold Edge Tone */}
              <mesh
                geometry={snakeLeafGeometry}
                material={snakeLeafMat}
                castShadow={idx % 3 === 0}
                receiveShadow
              />
              {/* Outer Golden Border Trim Accent */}
              <mesh
                geometry={snakeLeafGeometry}
                material={snakeGoldTrimMat}
                position={[0, 0, -0.002]}
                scale={[1.04, 1.0, 1.0]}
              />
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
