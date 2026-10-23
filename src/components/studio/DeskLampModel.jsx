import React, { useMemo, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { playClickSound } from '../../utils/audio.js';

const getAssetUrl = (path) => {
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanBase + cleanPath;
};

const MODEL_PATH = getAssetUrl('models/desk_lamp/desk_lamp_arm_01.gltf');

/**
 * Photorealistic Scanned Architectural Desk Lamp with Articulated Metal Arm and Task Light
 */
export default function DeskLampModel({
  position = [-0.94, 0.785, -0.05],
  rotation = [0, 0.55, 0],
  scale = 0.42,
}) {
  const { scene } = useGLTF(MODEL_PATH);
  const [isOn, setIsOn] = useState(true);

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
          child.material.roughness = Math.max(0.2, child.material.roughness ?? 0.35);
          child.material.metalness = Math.min(0.9, child.material.metalness ?? 0.8);
          child.material.needsUpdate = true;
        }
      }
    });
    return clone;
  }, [scene]);

  const handleToggle = (e) => {
    e.stopPropagation();
    playClickSound(isOn ? 550 : 850, 0.06);
    setIsOn((prev) => !prev);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
      name="DeskLampArchitectural"
      onClick={handleToggle}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <primitive object={clonedScene} />

      {/* Warm Task Light Emitter at Lamp Hood (Recessed, no glare) */}
      {isOn && (
        <group position={[0.22, 0.65, 0.12]}>
          {/* Soft recessed bulb mesh */}
          <mesh position={[0, -0.015, 0]}>
            <sphereGeometry args={[0.02, 12, 12]} />
            <meshStandardMaterial
              color="#fed7aa"
              emissive="#fed7aa"
              emissiveIntensity={0.5}
              roughness={0.6}
            />
          </mesh>
          <pointLight
            color="#ffedd5"
            intensity={0.6}
            distance={1.6}
            decay={2}
          />
        </group>
      )}
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
