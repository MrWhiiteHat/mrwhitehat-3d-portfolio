import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const getAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanBase + cleanPath;
};

const MODEL_PATH = getAssetUrl('models/arm_chair/modern_arm_chair_01.gltf');

/**
 * Photorealistic Scanned Executive Armchair with Real Leather Cushions & Chrome Legs
 */
export default function ModernArmchairModel({
  position = [1.35, 0, 1.35],
  rotation = [0, -Math.PI / 3.2, 0],
  scale = 0.95,
}) {
  const { scene } = useGLTF(MODEL_PATH);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          if (child.material.map) {
            child.material.map.colorSpace = THREE.SRGBColorSpace;
          }
          child.material.roughness = Math.max(0.3, child.material.roughness ?? 0.5);
          child.material.needsUpdate = true;
        }
      }
    });
    return clone;
  }, [scene]);

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      name="ExecutiveLeatherArmchair"
    >
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
