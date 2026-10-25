import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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
const _camDir = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

// Camera vantage presets
export const CAMERA_VANTAGES = {
  DESK_VIEW: {
    id: 'DESK_VIEW',
    label: 'CAM 01: DESK',
    pos: [2.2, 2.3, 2.4],
    target: [-0.6, 0.8, 0.4],
  },
  SERVER_WALL: {
    id: 'SERVER_WALL',
    label: 'CAM 02: SERVER WALL',
    pos: [-1.4, 2.5, -0.4],
    target: [-3.8, 1.5, -2.6],
  },
  CORNER_DRONE: {
    id: 'CORNER_DRONE',
    label: 'CAM 03: DRONE CORNER',
    pos: [-1.2, 2.6, -1.6],
    target: [-3.8, 1.9, -3.8],
  },
  ROOM_OVERVIEW: {
    id: 'ROOM_OVERVIEW',
    label: 'CAM 04: OVERVIEW',
    pos: [1.5, 4.8, 2.2],
    target: [-1.8, 1.4, -2.2],
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
    // Lerp pulse between from and to
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
        <cylinderGeometry args={[0.024, 0.024, length, 8]} />
        <meshStandardMaterial
          color={conduitColor}
          emissive={conduitColor}
          emissiveIntensity={isPowered || isCompleted ? 1.6 : 0.2}
          transparent
          opacity={conduitOpacity}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Core Glowing Wire */}
      <mesh position={curve?.midpoint} rotation={orientation}>
        <cylinderGeometry args={[0.008, 0.008, length, 6]} />
        <meshBasicMaterial
          color={isCompleted ? '#a7f3d0' : isPowered ? '#e0f7ff' : '#061a29'}
          transparent
          opacity={isPowered || isCompleted ? 0.9 : 0.3}
        />
      </mesh>

      {/* Traveling Data Pulse Particle */}
      {(isPowered || isCompleted) && (
        <mesh ref={pulseMeshRef} position={from}>
          <sphereGeometry args={[0.048, 8, 8]} />
          <meshBasicMaterial
            color={isCompleted ? '#6ee7b7' : '#ffffff'}
            transparent
            opacity={0.85}
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
  const [pulseScale, setPulseScale] = useState(1);

  // Smooth visual rotation animation when switch turns
  useEffect(() => {
    targetRotationY.current = (node.rotationIndex || 0) * (Math.PI / 2);
  }, [node.rotationIndex]);

  useFrame((state, delta) => {
    if (meshGroupRef.current) {
      // Smoothly rotate switch puck to target angle
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
            <ringGeometry args={[0.22, 0.25, 24]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <octahedronGeometry args={[0.04, 0]} />
            <meshBasicMaterial color="#ffffff" />
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
              <cylinderGeometry args={[0.16, 0.17, 0.05, 24]} />
              <meshStandardMaterial
                color="#0f172a"
                roughness={0.3}
                metalness={0.9}
              />
            </mesh>

            {/* Glowing Face Plate */}
            <mesh position={[0, 0.028, 0]}>
              <cylinderGeometry args={[0.145, 0.145, 0.015, 24]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={isPowered ? 1.8 : isLocked ? 1.2 : 0.4}
                roughness={0.2}
              />
            </mesh>

            {/* Circuit Port Direction Markers */}
            {(node.basePorts || [0, 2]).map((port) => {
              const angle = (port * Math.PI) / 2;
              return (
                <mesh
                  key={port}
                  position={[Math.sin(angle) * 0.11, 0.038, Math.cos(angle) * 0.11]}
                  rotation={[0, angle, 0]}
                >
                  <boxGeometry args={[0.035, 0.012, 0.065]} />
                  <meshBasicMaterial
                    color={isPowered ? '#ffffff' : '#94a3b8'}
                  />
                </mesh>
              );
            })}

            {/* Locked Padlock Hologram */}
            {isLocked && (
              <group position={[0, 0.12, 0]}>
                <mesh>
                  <boxGeometry args={[0.09, 0.08, 0.04]} />
                  <meshStandardMaterial
                    color="#ff1744"
                    emissive="#ff1744"
                    emissiveIntensity={2.0}
                  />
                </mesh>
                <mesh position={[0, 0.06, 0]}>
                  <torusGeometry args={[0.035, 0.012, 8, 16, Math.PI]} />
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
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial
                color="#00f0ff"
                emissive="#00f0ff"
                emissiveIntensity={2.5}
                roughness={0.1}
              />
            </mesh>
            <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
              <torusGeometry args={[0.22, 0.018, 8, 24]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
          </group>
        )}

        {/* Target Objective Gateway Node */}
        {node.type === NODE_TYPES.TARGET && (
          <group>
            <mesh>
              <cylinderGeometry args={[0.22, 0.22, 0.08, 6]} />
              <meshStandardMaterial
                color={isTargetPowered ? '#10b981' : '#f59e0b'}
                emissive={isTargetPowered ? '#10b981' : '#f59e0b'}
                emissiveIntensity={isTargetPowered ? 3.0 : 1.4}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
              <ringGeometry args={[0.12, 0.15, 6]} />
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
            <mesh position={[0, 0.08, 0]}>
              <octahedronGeometry args={[0.14, 0]} />
              <meshStandardMaterial
                color={isPowered ? '#34d399' : '#fbbf24'}
                emissive={isPowered ? '#34d399' : '#fbbf24'}
                emissiveIntensity={isPowered ? 2.4 : 1.2}
                wireframe={!isPowered}
              />
            </mesh>
          </group>
        )}

        {/* Hostile IDS Alarm Node */}
        {node.type === NODE_TYPES.HOSTILE_IDS && (
          <group>
            <mesh position={[0, 0.08, 0]}>
              <octahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial
                color="#ff1744"
                emissive="#ff1744"
                emissiveIntensity={2.5}
              />
            </mesh>
          </group>
        )}

        {/* Invisible generous raycast hit volume */}
        <mesh>
          <sphereGeometry args={[0.32, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>

      {/* Floating 3D Label & Action Prompt */}
      {(isSelected || isHovered) && (
        <Html
          position={[0, 0.38, 0]}
          center
          distanceFactor={6}
          style={{ pointerEvents: 'none' }}
        >
          <div className="circuit-3d-node-badge">
            <span className="node-badge-type">
              {node.type.replace('_', ' ').toUpperCase()}
            </span>
            <strong className="node-badge-title">{node.label}</strong>
            {node.type.startsWith('switch') && (
              <span className="node-badge-hint">[CLICK] OR [E] TO ROTATE</span>
            )}
            {node.isLocked && (
              <span className="node-badge-locked">🔒 LOCKED // KEY REQUIRED</span>
            )}
            {node.type === NODE_TYPES.HOSTILE_IDS && (
              <span className="node-badge-danger">⚠️ HOSTILE // AVOID</span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Camera Director for Hacker Mode: smoothly lerps to vantage presets
 */
function HackerCameraDirector({ activeVantageId }) {
  const { camera } = useThree();
  const vantage = CAMERA_VANTAGES[activeVantageId] || CAMERA_VANTAGES.DESK_VIEW;

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.033);
    const speed = -4.5;
    const alpha = 1 - Math.exp(speed * clampedDelta);

    _v1.set(...vantage.pos);
    _lookTarget.set(...vantage.target);

    camera.position.lerp(_v1, alpha);
    camera.getWorldDirection(_camDir);
    _v2.copy(camera.position).addScaledVector(_camDir, 2.0);
    _v2.lerp(_lookTarget, alpha);
    camera.lookAt(_v2);
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
}) {
  const { isTargetPowered, poweredNodeIds, poweredConnectionIndices, isHostileTriggered } = evaluation;

  return (
    <group name="HackingCircuit3D">
      {/* Tactical Camera Vantage Interpolator */}
      <HackerCameraDirector activeVantageId={activeVantageId} />

      {/* Dynamic Cyber Illumination for Circuit */}
      <ambientLight intensity={0.4} color="#040d1a" />
      <directionalLight
        position={[4, 8, 4]}
        intensity={1.2}
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
