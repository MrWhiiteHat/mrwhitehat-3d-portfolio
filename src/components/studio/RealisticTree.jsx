import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Computes asset URL accounting for Vite BASE_URL (e.g. GitHub Pages).
 */
const getAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanBase + cleanPath;
};

const MODEL_PATH = getAssetUrl('models/realistic_tree.glb');

/**
 * Realistic architectural potted tree (scanned PBR foliage, bark stem, and terracotta pot).
 * The heavy terracotta pot and soil pebbles remain 100% stationary on the floor.
 * Only the living leafy canopy and upper branches gently sway in the room air breeze.
 */
export default function RealisticTree({
  position = [2.2, 0, -4.2],
  scale = 1.35,
  rotation = [0, -0.45, 0],
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const foliagePivotRef = useRef();
  const leavesRef = useRef();

  // Separate stationary base (pot + soil pebbles) from living swaying foliage (stem + leaves)
  const { treeRoot, foliagePivot, leavesMesh } = useMemo(() => {
    const clone = scene.clone(true);

    // Extract individual mesh components from the scanned asset
    const potMesh = clone.getObjectByName('potted_plant_01_pot');
    const pebblesMesh = clone.getObjectByName('potted_plant_01_pebbles');
    const stemMesh = clone.getObjectByName('potted_plant_01_stem');
    const leaves = clone.getObjectByName('potted_plant_01_leaves');

    // Configure PBR materials and shadow fidelity
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.shadowSide = THREE.DoubleSide;
          if (child.material.map) {
            child.material.map.colorSpace = THREE.SRGBColorSpace;
          }
          child.material.roughness = Math.min(child.material.roughness ?? 0.65, 0.85);
          child.material.needsUpdate = true;
        }
      }
    });

    // 1. Stationary Base: Pot & Pebbles (Anchored to floor, ZERO movement)
    const stationaryBase = new THREE.Group();
    stationaryBase.name = 'TreeStationaryBase';
    if (potMesh) stationaryBase.add(potMesh);
    if (pebblesMesh) stationaryBase.add(pebblesMesh);

    // 2. Dynamic Foliage: Trunk Stem & Leaf Canopy
    // Pivots precisely at the soil level (Y = 0.52) so trunk base stays stationary while foliage sways
    const foliagePivotGroup = new THREE.Group();
    foliagePivotGroup.name = 'TreeFoliagePivot';
    foliagePivotGroup.position.set(0, 0.52, 0);

    const foliageInner = new THREE.Group();
    foliageInner.position.set(0, -0.52, 0);
    if (stemMesh) foliageInner.add(stemMesh);
    if (leaves) foliageInner.add(leaves);
    foliagePivotGroup.add(foliageInner);

    // 3. Combined Tree Root
    const root = new THREE.Group();
    root.name = 'RealisticTreeRoot';
    root.add(stationaryBase);
    root.add(foliagePivotGroup);

    return {
      treeRoot: root,
      foliagePivot: foliagePivotGroup,
      leavesMesh: leaves,
    };
  }, [scene]);

  // Keep refs synchronized
  foliagePivotRef.current = foliagePivot;
  leavesRef.current = leavesMesh;

  // Silky-smooth natural air breeze oscillation — ONLY on the foliage!
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Primary branch sway pivoting at soil line (pot stays completely motionless)
    if (foliagePivotRef.current) {
      foliagePivotRef.current.rotation.z =
        Math.sin(time * 0.85) * 0.012 + Math.sin(time * 1.9) * 0.003;
      foliagePivotRef.current.rotation.x = Math.cos(time * 0.7) * 0.008;
    }

    // Secondary subtle organic leaf flutter
    if (leavesRef.current) {
      leavesRef.current.rotation.y = Math.sin(time * 1.3) * 0.005;
    }
  });

  return (
    <group position={position}>
      {/* Modern architectural floor saucer base (stationary on floor) */}
      <mesh position={[0, 0.008, 0]} receiveShadow>
        <cylinderGeometry args={[0.34, 0.36, 0.016, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Photorealistic Tree (Stationary Pot & Soil + Gentle Swaying Plant Canopy) */}
      <primitive
        object={treeRoot}
        position={[0, 0.016, 0]}
        scale={scale}
        rotation={rotation}
      />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
