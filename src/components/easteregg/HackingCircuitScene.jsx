import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { NODE_TYPES, getActivePorts } from './circuitPuzzleLogic.js';
import {
  playCircuitRotate,
  playSelectNode,
  playHostileShock,
  playLockRelease,
} from './easterEggAudio.js';

// Pre-allocated temporary Three.js objects for zero GC garbage collection
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

// Camera vantage presets calibrated inside room bounds and beneath ceiling
export const CAMERA_VANTAGES = {
  DESK_VIEW: {
    id: 'DESK_VIEW',
    label: 'CAM 01: DESK',
    pos: [1.8, 2.1, 2.4],
    target: [0.1, 0.75, 0.4],
  },
  SERVER_WALL: {
    id: 'SERVER_WALL',
    label: 'CAM 02: SERVER WALL',
    pos: [-1.2, 2.2, -0.6],
    target: [-3.6, 1.4, -2.6],
  },
  CORNER_DRONE: {
    id: 'CORNER_DRONE',
    label: 'CAM 03: DRONE CORNER',
    pos: [-1.6, 2.3, -1.8],
    target: [-3.9, 1.7, -3.9],
  },
  ROOM_OVERVIEW: {
    id: 'ROOM_OVERVIEW',
    label: 'CAM 04: OVERVIEW',
    pos: [2.8, 3.4, 2.8],
    target: [-1.4, 1.3, -1.8],
  },
};

/**
 * Animated Conduit Line between two 3D spatial points
 */
function CircuitConduit({
  from,
  to,
  isPowered,
  isHostile,
  isCompleted,
}) {
  const lineMeshRef = useRef();
  const pulseMeshRef = useRef();

  const { curve, length, orientation } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const distance = start.distanceTo(end);
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    // Compute rotation to align cylinder with start->end
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const rot = new THREE.Euler().setFromQuaternion(quat);

    return {
      length: distance,
      midpoint,
      orientation: rot,
    };
  }, [from, to]);

  // Animate traveling power pulses along energized conduits
  useFrame((state) => {
    if (!pulseMeshRef.current || (!isPowered && !isCompleted)) return;
    const time = state.clock.getElapsedTime();
    const cycle = (time * 1.8) % 1.0;
    _v1.set(...from);
    _v2.set(...to);
    pulseMeshRef.current.position.lerpVectors(_v1, _v2, cycle);
  });

  const conduitColor = isCompleted
    ? '#10b981'
    : isHostile
    ? '#ff1744'
    : isPowered
    ? '#00f0ff'
    : '#0c2438';

  const conduitOpacity = isPowered || isCompleted ? 0.95 : 0.45;

  return (
    <group>
      {/* Outer Glow Tube */}
      <mesh position={curve?.midpoint} rotation={orientation}>
        <cylinderGeometry args={[0.034, 0.034, length, 8]} />
        <meshStandardMaterial
          color={conduitColor}
          emissive={conduitColor}
          emissiveIntensity={isPowered || isCompleted ? 2.4 : 0.25}
          transparent
          opacity={conduitOpacity}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Core Glowing Wire */}
      <mesh position={curve?.midpoint} rotation={orientation}>
        <cylinderGeometry args={[0.012, 0.012, length, 6]} />
        <meshBasicMaterial
          color={isCompleted ? '#a7f3d0' : isPowered ? '#e0f7ff' : '#061a29'}
          transparent
          opacity={isPowered || isCompleted ? 0.95 : 0.35}
        />
      </mesh>

      {/* Traveling Data Pulse Particle */}
      {(isPowered || isCompleted) && (
        <mesh ref={pulseMeshRef} position={from}>
          <sphereGeometry args={[0.065, 8, 8]} />
          <meshBasicMaterial
            color={isCompleted ? '#6ee7b7' : '#ffffff'}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * 3D Interactive Node Component
 */
function CircuitNode({
  node,
  isPowered,
  isSelected,
  isHovered,
  isTargetPowered,
  onSelect,
  onRotate,
}) {
  const meshGroupRef = useRef();
  const targetRotationY = useRef((node.rotationIndex || 0) * (Math.PI / 2));

  // Smooth visual rotation animation when switch turns
  useEffect(() => {
    targetRotationY.current = (node.rotationIndex || 0) * (Math.PI / 2);
  }, [node.rotationIndex]);

  useFrame((state, delta) => {
    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.y = THREE.MathUtils.damp(
        meshGroupRef.current.rotation.y,
        targetRotationY.current,
        14,
        delta
      );
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect?.(node.id);
    if (
      node.type === NODE_TYPES.SWITCH_STRAIGHT ||
      node.type === NODE_TYPES.SWITCH_ELBOW ||
      node.type === NODE_TYPES.SWITCH_T ||
      (node.type === NODE_TYPES.LOCKED_ROUTER && !node.isLocked)
    ) {
      onRotate?.(node.id);
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    playSelectNode();
    onSelect?.(node.id, false);
  };

  // Node Color Logic
  const isObjective = node.type === NODE_TYPES.TARGET;
  const isKey = node.type === NODE_TYPES.KEY_NODE;
  const isHostile = node.type === NODE_TYPES.HOSTILE_IDS;
  const isLocked = node.type === NODE_TYPES.LOCKED_ROUTER && node.isLocked;

  const nodeColor = isTargetPowered
    ? '#10b981'
    : isHostile
    ? '#ff1744'
    : isLocked
    ? '#f43f5e'
    : isKey
    ? isPowered
      ? '#34d399'
      : '#fbbf24'
    : isObjective
    ? '#f59e0b'
    : isPowered
    ? '#00f0ff'
    : '#1e3a5f';

  return (
    <group position={node.position}>
      {/* Selection Holographic Reticle Bracket */}
      {(isSelected || isHovered) && (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.26, 0.30, 32]} />
            <meshBasicMaterial
              color={isHostile ? '#ff1744' : isTargetPowered ? '#10b981' : '#00f0ff'}
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <octahedronGeometry args={[0.06, 0]} />
            <meshBasicMaterial
              color={isHostile ? '#ff1744' : isTargetPowered ? '#10b981' : '#ffffff'}
            />
          </mesh>
        </group>
      )}

      {/* Main Interactive Node Body */}
      <group
        ref={meshGroupRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
      >
        {/* Switch Puck (Straight, Elbow, T-Junction, or Unlocked Router) */}
        {(node.type === NODE_TYPES.SWITCH_STRAIGHT ||
          node.type === NODE_TYPES.SWITCH_ELBOW ||
          node.type === NODE_TYPES.SWITCH_T ||
          node.type === NODE_TYPES.LOCKED_ROUTER) && (
          <group>
            {/* Outer Cyber Rim */}
            <mesh>
              <cylinderGeometry args={[0.18, 0.19, 0.06, 24]} />
              <meshStandardMaterial
                color="#090d16"
                roughness={0.25}
                metalness={0.9}
              />
            </mesh>

            {/* Glowing Face Plate */}
            <mesh position={[0, 0.034, 0]}>
              <cylinderGeometry args={[0.16, 0.16, 0.015, 24]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={isPowered ? 2.5 : isLocked ? 1.4 : 0.5}
                roughness={0.2}
              />
            </mesh>

            {/* Circuit Port Direction Markers */}
            {(node.basePorts || [0, 2]).map((port) => {
              const angle = (port * Math.PI) / 2;
              return (
                <mesh
                  key={port}
                  position={[Math.sin(angle) * 0.12, 0.046, Math.cos(angle) * 0.12]}
                  rotation={[0, angle, 0]}
                >
                  <boxGeometry args={[0.045, 0.014, 0.075]} />
                  <meshBasicMaterial
                    color={isPowered ? '#ffffff' : '#94a3b8'}
                  />
                </mesh>
              );
            })}

            {/* Locked Padlock Hologram */}
            {isLocked && (
              <group position={[0, 0.14, 0]}>
                <mesh>
                  <boxGeometry args={[0.11, 0.09, 0.045]} />
                  <meshStandardMaterial
                    color="#ff1744"
                    emissive="#ff1744"
                    emissiveIntensity={2.4}
                  />
                </mesh>
                <mesh position={[0, 0.07, 0]}>
                  <torusGeometry args={[0.04, 0.014, 8, 16, Math.PI]} />
                  <meshStandardMaterial color="#ffffff" />
                </mesh>
              </group>
            )}
          </group>
        )}

        {/* Source Energy Injector Node */}
        {node.type === NODE_TYPES.SOURCE && (
          <group>
            <mesh>
              <sphereGeometry args={[0.16, 20, 20]} />
              <meshStandardMaterial
                color="#00f0ff"
                emissive="#00f0ff"
                emissiveIntensity={3.0}
                roughness={0.1}
              />
            </mesh>
            <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
              <torusGeometry args={[0.26, 0.022, 8, 24]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
            </mesh>
          </group>
        )}

        {/* Target Objective Gateway Node */}
        {node.type === NODE_TYPES.TARGET && (
          <group>
            <mesh>
              <cylinderGeometry args={[0.25, 0.25, 0.09, 6]} />
              <meshStandardMaterial
                color={isTargetPowered ? '#10b981' : '#f59e0b'}
                emissive={isTargetPowered ? '#10b981' : '#f59e0b'}
                emissiveIntensity={isTargetPowered ? 3.5 : 1.8}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
              <ringGeometry args={[0.14, 0.18, 6]} />
              <meshBasicMaterial
                color={isTargetPowered ? '#ffffff' : '#fed7aa'}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* Key / Sub-routine Decryption Node */}
        {node.type === NODE_TYPES.KEY_NODE && (
          <group>
            <mesh position={[0, 0.1, 0]}>
              <octahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial
                color={isPowered ? '#34d399' : '#fbbf24'}
                emissive={isPowered ? '#34d399' : '#fbbf24'}
                emissiveIntensity={isPowered ? 2.8 : 1.4}
                wireframe={!isPowered}
              />
            </mesh>
          </group>
        )}

        {/* Hostile IDS Alarm Node */}
        {node.type === NODE_TYPES.HOSTILE_IDS && (
          <group>
            <mesh position={[0, 0.1, 0]}>
              <octahedronGeometry args={[0.18, 0]} />
              <meshStandardMaterial
                color="#ff1744"
                emissive="#ff1744"
                emissiveIntensity={3.0}
              />
            </mesh>
          </group>
        )}

        {/* Large invisible raycast hit volume for effortless clicking/tapping */}
        <mesh>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Camera Director for Hacker Mode: smoothly lerps to vantage presets,
 * then yields 100% control to OrbitControls for free mouse/touch orbiting.
 */
function HackerCameraDirector({ activeVantageId, controlsRef }) {
  const { camera, gl } = useThree();
  const isTransitioning = useRef(true);
  const targetCamPos = useRef(new THREE.Vector3());
  const targetCamLook = useRef(new THREE.Vector3());

  // Trigger smooth flight whenever vantage preset changes
  useEffect(() => {
    const v = CAMERA_VANTAGES[activeVantageId] || CAMERA_VANTAGES.DESK_VIEW;
    targetCamPos.current.set(...v.pos);
    targetCamLook.current.set(...v.target);
    isTransitioning.current = true;
  }, [activeVantageId]);

  // Cancel auto-flight if user manually starts dragging or zooming
  useEffect(() => {
    const dom = gl?.domElement;
    if (!dom) return;

    const stopAutoFlight = () => {
      isTransitioning.current = false;
    };

    dom.addEventListener('pointerdown', stopAutoFlight);
    dom.addEventListener('wheel', stopAutoFlight, { passive: true });
    dom.addEventListener('touchstart', stopAutoFlight, { passive: true });

    return () => {
      dom.removeEventListener('pointerdown', stopAutoFlight);
      dom.removeEventListener('wheel', stopAutoFlight);
      dom.removeEventListener('touchstart', stopAutoFlight);
    };
  }, [gl]);

  useFrame((state, delta) => {
    if (!isTransitioning.current) {
      if (controlsRef?.current) {
        controlsRef.current.update();
      }
      return;
    }

    const clampedDelta = Math.min(delta, 0.033);
    const alpha = 1 - Math.exp(-5.5 * clampedDelta);

    camera.position.lerp(targetCamPos.current, alpha);

    if (controlsRef?.current) {
      controlsRef.current.target.lerp(targetCamLook.current, alpha);
      controlsRef.current.update();
    } else {
      camera.lookAt(targetCamLook.current);
    }

    // Check if close enough to hand over complete control to player
    const distPos = camera.position.distanceTo(targetCamPos.current);
    const distTarget = controlsRef?.current
      ? controlsRef.current.target.distanceTo(targetCamLook.current)
      : 0;

    if (distPos < 0.04 && distTarget < 0.04) {
      camera.position.copy(targetCamPos.current);
      if (controlsRef?.current) {
        controlsRef.current.target.copy(targetCamLook.current);
        controlsRef.current.update();
      }
      isTransitioning.current = false;
    }
  });

  return null;
}

/**
 * Main 3D Hacking Circuit Component (R3F)
 */
export default function HackingCircuitScene({
  currentStage,
  nodeStates,
  evaluation,
  selectedNodeId,
  activeVantageId,
  onSelectNode,
  onRotateNode,
  controlsRef,
}) {
  const { isTargetPowered, poweredNodeIds, poweredConnectionIndices } = evaluation;

  return (
    <group name="HackingCircuit3D">
      {/* Tactical Camera Vantage Interpolator */}
      <HackerCameraDirector activeVantageId={activeVantageId} controlsRef={controlsRef} />

      {/* Dynamic Cyber Illumination for Circuit */}
      <ambientLight intensity={0.5} color="#040d1a" />
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.4}
        color="#00f0ff"
      />

      {/* Render 3D Circuit Conduits */}
      {currentStage.connections.map((conn, idx) => {
        const fromNode = currentStage.nodes.find((n) => n.id === conn.from);
        const toNode = currentStage.nodes.find((n) => n.id === conn.to);
        if (!fromNode || !toNode) return null;

        const isPowered = poweredConnectionIndices.has(idx);
        const isHostile =
          fromNode.type === NODE_TYPES.HOSTILE_IDS ||
          toNode.type === NODE_TYPES.HOSTILE_IDS;

        return (
          <CircuitConduit
            key={`${conn.from}-${conn.to}-${idx}`}
            from={fromNode.position}
            to={toNode.position}
            isPowered={isPowered}
            isHostile={isHostile && isPowered}
            isCompleted={isTargetPowered}
          />
        );
      })}

      {/* Render 3D Circuit Nodes */}
      {currentStage.nodes.map((node) => {
        const state = nodeStates[node.id] || {};
        const isPowered = poweredNodeIds.has(node.id);
        const isSelected = selectedNodeId === node.id;

        return (
          <CircuitNode
            key={node.id}
            node={{
              ...node,
              rotationIndex: state.rotationIndex !== undefined ? state.rotationIndex : node.rotationIndex,
              isLocked: state.isLocked !== undefined ? state.isLocked : node.isLocked,
            }}
            isPowered={isPowered}
            isSelected={isSelected}
            isTargetPowered={isTargetPowered}
            onSelect={onSelectNode}
            onRotate={onRotateNode}
          />
        );
      })}
    </group>
  );
}
