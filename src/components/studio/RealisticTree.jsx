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
 * Positioned by default near the panoramic corner window with subtle HVAC breeze animation.
 */
export default function RealisticTree({
  position = [2.2, 0, -4.2],
  scale = 1.35,
  rotation = [0, -0.45, 0],
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const treeSwayRef = useRef();

  // Clone scene to avoid mutating cached GLTF instances and configure PBR materials & shadows
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
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
    return clone;
  }, [scene]);

  // Subtle living wind sway from HVAC air breeze
  useFrame((state) => {
    if (treeSwayRef.current) {
      const time = state.clock.getElapsedTime();
      treeSwayRef.current.rotation.z = Math.sin(time * 0.95) * 0.012 + Math.sin(time * 2.2) * 0.004;
      treeSwayRef.current.rotation.x = Math.cos(time * 0.8) * 0.008;
    }
  });

  return (
    <group position={position}>
      {/* Modern architectural floor saucer base */}
      <mesh position={[0, 0.008, 0]} receiveShadow>
        <cylinderGeometry args={[0.34, 0.36, 0.016, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Photorealistic Tree Model with Soft Sway */}
      <group ref={treeSwayRef} position={[0, 0.016, 0]}>
        <primitive object={clonedScene} scale={scale} rotation={rotation} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
