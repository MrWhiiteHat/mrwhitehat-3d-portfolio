import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { NODE_TYPES, getActivePorts } from './circuitPuzzleLogic.js';
import SecretVaultRoom3D from './UltimateBetrayal3D.jsx';
import {
  playCircuitRotate,
  playSelectNode,
  playHostileShock,
  playLockRelease,
} from './easterEggAudio.js';

// Pre-allocated temporary Three.js objects for zero GC garbage collection
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _tempPos = new THREE.Vector3();
const _tempTangent = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();

// Camera vantage presets calibrated inside room bounds and beneath ceiling
export const CAMERA_VANTAGES = {
  DESK_VIEW: {
    id: 'DESK_VIEW',
    label: 'CAM 01: DESK',
    pos: [1.8, 2.0, 2.2],
    target: [0.1, 0.55, 0.5],
  },
  SERVER_WALL: {
    id: 'SERVER_WALL',
    label: 'CAM 02: SERVER WALL',
    pos: [-2.6, 2.0, 0.4],
    target: [-2.9, 2.0, -3.85],
  },
  CORNER_DRONE: {
    id: 'CORNER_DRONE',
    label: 'CAM 03: DRONE CORNER',
    pos: [-3.8, 1.8, -1.2],
    target: [-3.8, 1.7, -3.85],
  },
  ROOM_OVERVIEW: {
    id: 'ROOM_OVERVIEW',
    label: 'CAM 04: OVERVIEW',
    pos: [-1.8, 1.6, 2.0],
    target: [-1.8, 1.4, -3.85],
  },
  VAULT_CHAMBER: {
    id: 'VAULT_CHAMBER',
    label: 'CAM 05: SEATED CHAIR VIEW',
    pos: [0, 1.22, 0.85],
    target: [0, 0.82, -0.05],
  },
  VAULT_LAPTOP_FOCUS: {
    id: 'VAULT_LAPTOP_FOCUS',
    label: 'CAM 06: LAPTOP MONITOR',
    pos: [0, 0.98, 0.16],
    target: [0, 0.86, -0.14],
  },
};

/**
 * Animated Conduit Line between two 3D spatial points with Watch Dogs 2
 * directional chevron arrows synchronized to actual circuit flow topology.
 */
function CircuitConduit({
  from,
  to,
  waypoints,
  isPowered,
  isHostile,
  isCompleted,
  flowDirection,
}) {
  const pulseMeshRef = useRef();
  const arrowForwardGroupRef = useRef();
  const arrowReverseGroupRef = useRef();

  const { length, orientation, midpoint, dir, curve } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const distance = start.distanceTo(end);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const d = new THREE.Vector3().subVectors(end, start).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, d);
    const rot = new THREE.Euler().setFromQuaternion(quat);

    let c = null;
    if (waypoints && waypoints.length > 0) {
      const pts = [
        start,
        ...waypoints.map((wp) => new THREE.Vector3(...wp)),
        end,
      ];
      c = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2);
    }

    return {
      length: distance,
      midpoint: mid,
      orientation: rot,
      dir: d,
      curve: c,
    };
  }, [from, to, waypoints]);

  // Arrow counts and base offsets along centerline
  const arrowOffsets = useMemo(() => {
    if (length < 0.7) return [0.5];
    if (length < 1.7) return [0.35, 0.65];
    return [0.25, 0.50, 0.75];
  }, [length]);

  const isFlowing = isPowered || isCompleted;
  const isForward = flowDirection ? flowDirection.forward !== false : true;
  const isBidirectional = flowDirection ? Boolean(flowDirection.bidirectional) : false;

  const arrowColor = isCompleted
    ? '#10b981'
    : isHostile
    ? '#ff1744'
    : isPowered
    ? '#00f0ff'
    : '#00c8ff';

  const conduitColor = isCompleted
    ? '#10b981'
    : isHostile
    ? '#ff1744'
    : isPowered
    ? '#00f0ff'
    : '#0088cc';

  // Animate traveling signal pulses & directional arrows along the centerline
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Traveling Data Pulse Particle
    if (pulseMeshRef.current && isFlowing) {
      const pCycle = (time * 1.8) % 1.0;
      const t = isForward ? pCycle : 1.0 - pCycle;
      if (curve) {
        pulseMeshRef.current.position.copy(curve.getPointAt(t));
      } else {
        _v1.set(...from);
        _v2.set(...to);
        pulseMeshRef.current.position.lerpVectors(_v1, _v2, t);
      }
    }

    // 2. Animate Forward Arrow Chevrons
    if (arrowForwardGroupRef.current) {
      const speed = isFlowing ? 0.32 : 0;
      const cycle = (time * speed) % 1.0;

      arrowForwardGroupRef.current.children.forEach((child, i) => {
        const baseT = arrowOffsets[i] || 0.5;
        let t = isFlowing ? (baseT + cycle) % 1.0 : baseT;
        if (!isForward && !isBidirectional) {
          t = 1.0 - t;
        }

        let pt, tangent;
        if (curve) {
          pt = curve.getPointAt(t);
          tangent = curve.getTangentAt(t).normalize();
        } else {
          _v1.set(...from);
          _v2.set(...to);
          pt = _tempPos.lerpVectors(_v1, _v2, t);
          tangent = dir;
        }

        if (!isForward && !isBidirectional) {
          _tempTangent.copy(tangent).negate();
        } else {
          _tempTangent.copy(tangent);
        }

        child.position.copy(pt);
        _tempQuat.setFromUnitVectors(_up, _tempTangent);
        child.quaternion.copy(_tempQuat);

        const edgeFade = isFlowing ? Math.sin(t * Math.PI) : 1.0;
        const scale = (isFlowing ? 1.0 : 0.85) * (0.35 + 0.65 * edgeFade);
        child.scale.set(scale, scale, scale);
      });
    }

    // 3. Animate Reverse Arrow Chevrons (only for valid bidirectional paths)
    if (arrowReverseGroupRef.current && isBidirectional) {
      const speed = isFlowing ? 0.32 : 0;
      const cycle = (time * speed) % 1.0;

      arrowReverseGroupRef.current.children.forEach((child, i) => {
        const baseT = arrowOffsets[i] || 0.5;
        let t = isFlowing ? 1.0 - ((baseT + cycle) % 1.0) : 1.0 - baseT;

        let pt, tangent;
        if (curve) {
          pt = curve.getPointAt(t);
          tangent = curve.getTangentAt(t).normalize().negate();
        } else {
          _v1.set(...from);
          _v2.set(...to);
          pt = _tempPos.lerpVectors(_v1, _v2, t);
          tangent = _tempTangent.copy(dir).negate();
        }

        child.position.copy(pt);
        _tempQuat.setFromUnitVectors(_up, tangent);
        child.quaternion.copy(_tempQuat);

        const edgeFade = isFlowing ? Math.sin(t * Math.PI) : 1.0;
        const scale = (isFlowing ? 1.0 : 0.85) * (0.35 + 0.65 * edgeFade);
        child.scale.set(scale, scale, scale);
      });
    }
  });

  return (
    <group>
      {/* Outer Glow Tube */}
      <mesh position={midpoint} rotation={orientation}>
        <cylinderGeometry args={[0.024, 0.024, length, 8]} />
        <meshStandardMaterial
          color={conduitColor}
          emissive={conduitColor}
          emissiveIntensity={isPowered || isCompleted ? 3.5 : 0.9}
          transparent
          opacity={isPowered || isCompleted ? 0.95 : 0.45}
          roughness={0.15}
          metalness={0.85}
        />
      </mesh>

      {/* Core Laser Wire */}
      <mesh position={midpoint} rotation={orientation}>
        <cylinderGeometry args={[0.009, 0.009, length, 6]} />
        <meshBasicMaterial
          color={isCompleted ? '#a7f3d0' : isHostile ? '#ff8a80' : isPowered ? '#ffffff' : '#38bdf8'}
          transparent
          opacity={isPowered || isCompleted ? 1.0 : 0.6}
        />
      </mesh>

      {/* 3D Directional Circuit Arrows (Forward / Dominant Flow) */}
      <group ref={arrowForwardGroupRef}>
        {arrowOffsets.map((_, idx) => (
          <group key={`arrow-fwd-${idx}`}>
            {/* Diamond 3D Arrowhead */}
            <mesh>
              <coneGeometry args={[0.075, 0.17, 4]} />
              <meshStandardMaterial
                color={arrowColor}
                emissive={arrowColor}
                emissiveIntensity={isFlowing ? 3.8 : 0.5}
                transparent
                opacity={isFlowing ? 0.95 : 0.32}
                roughness={0.2}
              />
            </mesh>
            {/* Trailing Chevron Collar Wing */}
            <mesh position={[0, -0.055, 0]} rotation={[0, Math.PI / 4, 0]}>
              <ringGeometry args={[0.045, 0.08, 4]} />
              <meshBasicMaterial
                color={arrowColor}
                transparent
                opacity={isFlowing ? 0.85 : 0.25}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* 3D Directional Circuit Arrows (Reverse / Bidirectional Flow) */}
      {isBidirectional && (
        <group ref={arrowReverseGroupRef}>
          {arrowOffsets.map((_, idx) => (
            <group key={`arrow-rev-${idx}`}>
              <mesh>
                <coneGeometry args={[0.075, 0.17, 4]} />
                <meshStandardMaterial
                  color={arrowColor}
                  emissive={arrowColor}
                  emissiveIntensity={isFlowing ? 3.8 : 0.5}
                  transparent
                  opacity={isFlowing ? 0.95 : 0.32}
                  roughness={0.2}
                />
              </mesh>
              <mesh position={[0, -0.055, 0]} rotation={[0, Math.PI / 4, 0]}>
                <ringGeometry args={[0.045, 0.08, 4]} />
                <meshBasicMaterial
                  color={arrowColor}
                  transparent
                  opacity={isFlowing ? 0.85 : 0.25}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Traveling Data Pulse Particle */}
      {isFlowing && (
        <mesh ref={pulseMeshRef} position={from}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshBasicMaterial
            color={isCompleted ? '#6ee7b7' : isHostile ? '#ff8a80' : '#ffffff'}
            transparent
            opacity={0.95}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * 3D Interactive Node Component (Watch Dogs 2 NetHack aesthetic)
 */
/**
 * 3D Interactive Node Component (Watch Dogs 2 NetHack aesthetic)
 * Fully synchronized with conduit flow and neighbor node arrow directions.
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
  const diamondLockRef = useRef();
  const hostileAuraRef = useRef();
  const targetWaypointRef = useRef();
  const isWallZ = node.orientation === 'wall_z';
  const targetRotation = useRef((node.rotationIndex || 0) * (Math.PI / 2));

  // Local state for instant, rock-solid cursor and hover feedback
  const [isLocalHovered, setIsLocalHovered] = useState(false);
  const downPosRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTriggerTimeRef = useRef(0);

  // Restore cursor on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  // Smooth visual rotation animation when switch turns
  useEffect(() => {
    targetRotation.current = (node.rotationIndex || 0) * (Math.PI / 2);
  }, [node.rotationIndex]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (meshGroupRef.current) {
      if (isWallZ) {
        meshGroupRef.current.rotation.z = THREE.MathUtils.damp(
          meshGroupRef.current.rotation.z,
          -targetRotation.current,
          14,
          delta
        );
      } else {
        meshGroupRef.current.rotation.y = THREE.MathUtils.damp(
          meshGroupRef.current.rotation.y,
          targetRotation.current,
          14,
          delta
        );
      }
    }

    // Watch Dogs 2 Rotating Diamond Lock Animation
    if (diamondLockRef.current) {
      diamondLockRef.current.rotation.z += delta * 0.75;
      if (isWallZ) {
        diamondLockRef.current.position.z = 0.32 + Math.sin(time * 2.4) * 0.02;
      } else {
        diamondLockRef.current.position.y = 0.32 + Math.sin(time * 2.4) * 0.02;
      }
    }

    // Watch Dogs 2 Hostile Red Radial Aura Pulse
    if (hostileAuraRef.current) {
      const pulse = 0.4 + Math.sin(time * 3.8) * 0.18;
      hostileAuraRef.current.material.opacity = pulse;
      const s = 1.0 + Math.sin(time * 3.8) * 0.06;
      hostileAuraRef.current.scale.set(s, s, s);
    }

    // Watch Dogs 2 Objective Waypoint Beacon Animation
    if (targetWaypointRef.current) {
      targetWaypointRef.current.rotation.z += delta * 0.6;
      if (isWallZ) {
        targetWaypointRef.current.position.z = 0.36 + Math.sin(time * 2.2) * 0.025;
      } else {
        targetWaypointRef.current.position.y = 0.36 + Math.sin(time * 2.2) * 0.025;
      }
    }
  });

  const triggerNodeAction = () => {
    const now = Date.now();
    if (now - lastTriggerTimeRef.current < 260) return; // Debounce rapid double-triggers
    lastTriggerTimeRef.current = now;

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

  const handlePointerDown = (e) => {
    e.stopPropagation();
    downPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    const dx = e.clientX - downPosRef.current.x;
    const dy = e.clientY - downPosRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const duration = Date.now() - downPosRef.current.time;

    // Movement tolerance: up to 20px leeway and held for <600ms distinguishes click from drag
    if (dist < 20 && duration < 600) {
      triggerNodeAction();
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setIsLocalHovered(true);
    document.body.style.cursor = 'pointer';
    playSelectNode();
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setIsLocalHovered(false);
    document.body.style.cursor = 'default';
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
    : '#0088cc';

  const portArrowColor = isTargetPowered
    ? '#10b981'
    : isHostile
    ? '#ff1744'
    : isPowered
    ? '#00f0ff'
    : '#00a3e0';

  return (
    <group position={node.position}>
      {/* 1. Watch Dogs 2 Selection Square Reticle Bracket */}
      {(isSelected || isHovered || isLocalHovered) && (
        <group>
          {/* Outer Square Reticle Frame */}
          <mesh
            rotation={isWallZ ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}
            position={isWallZ ? [0, 0, 0.015] : [0, 0.015, 0]}
          >
            <ringGeometry args={[0.30, 0.33, 4]} />
            <meshBasicMaterial
              color={isHostile ? '#ff1744' : isTargetPowered ? '#10b981' : '#ffffff'}
              transparent
              opacity={0.95}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Corner Tick Marks */}
          {[-0.27, 0.27].map((tx) =>
            [-0.27, 0.27].map((tyz) => (
              <mesh
                key={`tick-${tx}-${tyz}`}
                position={isWallZ ? [tx, tyz, 0.02] : [tx, 0.02, tyz]}
              >
                <boxGeometry
                  args={isWallZ ? [0.05, 0.05, 0.012] : [0.05, 0.012, 0.05]}
                />
                <meshBasicMaterial color="#00f0ff" />
              </mesh>
            ))
          )}

          {/* Floating Waypoint Pip */}
          <mesh position={isWallZ ? [0, 0, 0.48] : [0, 0.48, 0]}>
            <octahedronGeometry args={[0.05, 0]} />
            <meshBasicMaterial color={isHostile ? '#ff1744' : '#ffffff'} />
          </mesh>
        </group>
      )}

      {/* 2. Main Interactive Node Body */}
      <group
        ref={meshGroupRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* SWITCH PUCKS (Straight, Elbow, T-Junction, Unlocked Router) */}
        {(node.type === NODE_TYPES.SWITCH_STRAIGHT ||
          node.type === NODE_TYPES.SWITCH_ELBOW ||
          node.type === NODE_TYPES.SWITCH_T ||
          node.type === NODE_TYPES.LOCKED_ROUTER) && (
          <group>
            {/* Dark Base Hub Disc */}
            <mesh
              position={isWallZ ? [0, 0, 0.02] : [0, 0.02, 0]}
              rotation={isWallZ ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
            >
              <cylinderGeometry args={[0.22, 0.24, 0.045, 32]} />
              <meshStandardMaterial
                color="#040a16"
                roughness={0.25}
                metalness={0.9}
              />
            </mesh>

            {/* Glowing White/Cyan Outer Rim */}
            <mesh
              position={isWallZ ? [0, 0, 0.044] : [0, 0.044, 0]}
              rotation={isWallZ ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}
            >
              <ringGeometry args={[0.20, 0.23, 32]} />
              <meshBasicMaterial
                color={isPowered ? '#00f0ff' : '#ffffff'}
                transparent
                opacity={0.95}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Glowing Face Plate */}
            <mesh
              position={isWallZ ? [0, 0, 0.04] : [0, 0.04, 0]}
              rotation={isWallZ ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
            >
              <cylinderGeometry args={[0.18, 0.18, 0.012, 32]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={isPowered ? 3.0 : isLocked ? 1.5 : 0.8}
                roughness={0.15}
              />
            </mesh>

            {/* DIRECTIONAL CIRCUIT PORT ARROWS & CHEVRONS */}
            {(node.basePorts || [0, 2]).map((port) => {
              if (isWallZ) {
                // Wall Z plane: 0=Up(+Y), 1=Right(+X), 2=Down(-Y), 3=Left(-X)
                const angle = (-port * Math.PI) / 2;
                return (
                  <group key={port} rotation={[0, 0, angle]}>
                    {/* Neon Centerline Runner */}
                    <mesh position={[0, 0.09, 0.048]}>
                      <boxGeometry args={[0.035, 0.12, 0.016]} />
                      <meshStandardMaterial
                        color={portArrowColor}
                        emissive={portArrowColor}
                        emissiveIntensity={isPowered ? 3.5 : 0.6}
                        roughness={0.2}
                        transparent
                        opacity={isPowered ? 0.95 : 0.45}
                      />
                    </mesh>

                    {/* Sharp 3D Directional Arrowhead pointing radially outward */}
                    <mesh position={[0, 0.17, 0.052]} rotation={[0, 0, 0]}>
                      <coneGeometry args={[0.048, 0.085, 4]} />
                      <meshStandardMaterial
                        color={isPowered ? '#ffffff' : '#38bdf8'}
                        emissive={portArrowColor}
                        emissiveIntensity={isPowered ? 4.5 : 0.8}
                        roughness={0.15}
                        transparent
                        opacity={isPowered ? 1.0 : 0.55}
                      />
                    </mesh>

                    {/* Outer Chevron Wing Ring */}
                    <mesh position={[0, 0.14, 0.048]} rotation={[0, 0, 0]}>
                      <ringGeometry args={[0.035, 0.055, 3]} />
                      <meshBasicMaterial
                        color={portArrowColor}
                        transparent
                        opacity={isPowered ? 0.85 : 0.35}
                        side={THREE.DoubleSide}
                      />
                    </mesh>
                  </group>
                );
              }

              // Horizontal (Floor / Table): 0=North(+Z), 1=East(+X), 2=South(-Z), 3=West(-X)
              const angle = (port * Math.PI) / 2;
              return (
                <group key={port} rotation={[0, angle, 0]}>
                  {/* Neon Centerline Runner */}
                  <mesh position={[0, 0.048, 0.09]}>
                    <boxGeometry args={[0.035, 0.016, 0.12]} />
                    <meshStandardMaterial
                      color={portArrowColor}
                      emissive={portArrowColor}
                      emissiveIntensity={isPowered ? 3.5 : 0.6}
                      roughness={0.2}
                      transparent
                      opacity={isPowered ? 0.95 : 0.45}
                    />
                  </mesh>

                  {/* Sharp 3D Directional Arrowhead pointing radially outward */}
                  <mesh position={[0, 0.052, 0.17]} rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.048, 0.085, 4]} />
                    <meshStandardMaterial
                      color={isPowered ? '#ffffff' : '#38bdf8'}
                      emissive={portArrowColor}
                      emissiveIntensity={isPowered ? 4.5 : 0.8}
                      roughness={0.15}
                      transparent
                      opacity={isPowered ? 1.0 : 0.55}
                    />
                  </mesh>

                  {/* Outer Chevron Wing Ring */}
                  <mesh position={[0, 0.048, 0.14]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.035, 0.055, 3]} />
                    <meshBasicMaterial
                      color={portArrowColor}
                      transparent
                      opacity={isPowered ? 0.85 : 0.35}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        )}

        {/* 3. Watch Dogs 2 Iconic Holographic Rotating Diamond Lock */}
        {isLocked && (
          <group
            ref={diamondLockRef}
            position={isWallZ ? [0, 0, 0.32] : [0, 0.32, 0]}
          >
            {/* Outer Diamond Frame */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <ringGeometry args={[0.26, 0.30, 4]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.95}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Inner Diamond Frame */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <ringGeometry args={[0.19, 0.22, 4]} />
              <meshBasicMaterial
                color="#00f0ff"
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Padlock Hologram in Center */}
            <group position={[0, -0.018, 0.01]}>
              <mesh position={[0, -0.025, 0]}>
                <boxGeometry args={[0.10, 0.09, 0.025]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0.035, 0]}>
                <torusGeometry args={[0.036, 0.012, 8, 16, Math.PI]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>

            {/* Soft Lock Threat Aura */}
            <mesh position={[0, 0, -0.015]}>
              <circleGeometry args={[0.28, 24]} />
              <meshBasicMaterial
                color="#ff1744"
                transparent
                opacity={0.25}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* 4. Watch Dogs 2 Hostile IDS Alarm (Diffused Red Radial Aura Halo) */}
        {node.type === NODE_TYPES.HOSTILE_IDS && (
          <group>
            {/* Large Diffused Red Radial Glow Aura Halo on surface */}
            <mesh
              ref={hostileAuraRef}
              rotation={isWallZ ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}
              position={isWallZ ? [0, 0, 0.005] : [0, 0.005, 0]}
            >
              <ringGeometry args={[0.06, 0.72, 32]} />
              <meshBasicMaterial
                color="#ff1744"
                transparent
                opacity={0.45}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Pulsing Outer Warning Ring */}
            <mesh
              rotation={isWallZ ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}
              position={isWallZ ? [0, 0, 0.008] : [0, 0.008, 0]}
            >
              <ringGeometry args={[0.68, 0.72, 32]} />
              <meshBasicMaterial
                color="#ff1744"
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Central Red Threat Core Puck */}
            <mesh
              position={isWallZ ? [0, 0, 0.04] : [0, 0.04, 0]}
              rotation={isWallZ ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
            >
              <cylinderGeometry args={[0.16, 0.18, 0.05, 24]} />
              <meshStandardMaterial
                color="#ff1744"
                emissive="#ff1744"
                emissiveIntensity={3.5}
              />
            </mesh>

            {/* Threat Diamond Marker */}
            <mesh position={isWallZ ? [0, 0, 0.24] : [0, 0.24, 0]}>
              <octahedronGeometry args={[0.09, 0]} />
              <meshStandardMaterial
                color="#ff1744"
                emissive="#ff1744"
                emissiveIntensity={3.8}
              />
            </mesh>

            {/* Hostile Sensor Tripwire Port Arrow */}
            {(node.basePorts || [1]).map((port) => {
              if (isWallZ) {
                const angle = (-port * Math.PI) / 2;
                return (
                  <group key={`hostile-arrow-${port}`} rotation={[0, 0, angle]}>
                    <mesh position={[0, 0.20, 0.048]} rotation={[Math.PI, 0, 0]}>
                      <coneGeometry args={[0.048, 0.09, 4]} />
                      <meshStandardMaterial
                        color="#ff1744"
                        emissive="#ff1744"
                        emissiveIntensity={4.2}
                      />
                    </mesh>
                  </group>
                );
              }
              const angle = (port * Math.PI) / 2;
              return (
                <group key={`hostile-arrow-${port}`} rotation={[0, angle, 0]}>
                  <mesh position={[0, 0.048, 0.20]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.048, 0.09, 4]} />
                    <meshStandardMaterial
                      color="#ff1744"
                      emissive="#ff1744"
                      emissiveIntensity={4.2}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        )}

        {/* 5. Watch Dogs 2 Target Gateway (Orange Waypoint Diamond Beacon) */}
        {node.type === NODE_TYPES.TARGET && (
          <group>
            {/* Base Gateway Cylinder */}
            <mesh
              position={isWallZ ? [0, 0, 0.04] : [0, 0.04, 0]}
              rotation={isWallZ ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
            >
              <cylinderGeometry args={[0.24, 0.26, 0.07, 6]} />
              <meshStandardMaterial
                color={isTargetPowered ? '#10b981' : '#f59e0b'}
                emissive={isTargetPowered ? '#10b981' : '#f59e0b'}
                emissiveIntensity={isTargetPowered ? 3.8 : 2.4}
              />
            </mesh>

            {/* Floating Waypoint Diamond Marker */}
            <group
              ref={targetWaypointRef}
              position={isWallZ ? [0, 0, 0.36] : [0, 0.36, 0]}
            >
              <mesh rotation={[0, 0, Math.PI / 4]}>
                <ringGeometry args={[0.20, 0.24, 4]} />
                <meshBasicMaterial
                  color={isTargetPowered ? '#10b981' : '#f59e0b'}
                  transparent
                  opacity={0.95}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.28, 0.32, 32]} />
                <meshBasicMaterial
                  color={isTargetPowered ? '#10b981' : '#f59e0b'}
                  transparent
                  opacity={0.75}
                  side={THREE.DoubleSide}
                />
              </mesh>
              <mesh>
                <octahedronGeometry args={[0.06, 0]} />
                <meshBasicMaterial color={isTargetPowered ? '#ffffff' : '#fed7aa'} />
              </mesh>
            </group>

            {/* Target Incoming Receiving Port Arrow */}
            {(node.basePorts || [2]).map((port) => {
              if (isWallZ) {
                const angle = (-port * Math.PI) / 2;
                return (
                  <group key={`tgt-arrow-${port}`} rotation={[0, 0, angle]}>
                    {/* Inward pointing arrowhead toward gateway */}
                    <mesh position={[0, 0.22, 0.048]} rotation={[Math.PI, 0, 0]}>
                      <coneGeometry args={[0.055, 0.10, 4]} />
                      <meshStandardMaterial
                        color={isTargetPowered ? '#ffffff' : '#fed7aa'}
                        emissive={isTargetPowered ? '#10b981' : '#f59e0b'}
                        emissiveIntensity={isTargetPowered ? 4.5 : 2.5}
                      />
                    </mesh>
                  </group>
                );
              }
              const angle = (port * Math.PI) / 2;
              return (
                <group key={`tgt-arrow-${port}`} rotation={[0, angle, 0]}>
                  {/* Inward pointing arrowhead toward gateway */}
                  <mesh position={[0, 0.048, 0.22]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.055, 0.10, 4]} />
                    <meshStandardMaterial
                      color={isTargetPowered ? '#ffffff' : '#fed7aa'}
                      emissive={isTargetPowered ? '#10b981' : '#f59e0b'}
                      emissiveIntensity={isTargetPowered ? 4.5 : 2.5}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        )}

        {/* 6. Source Energy Injector Node */}
        {node.type === NODE_TYPES.SOURCE && (
          <group>
            <mesh position={[0, 0.08, 0]}>
              <sphereGeometry args={[0.17, 20, 20]} />
              <meshStandardMaterial
                color="#00f0ff"
                emissive="#00f0ff"
                emissiveIntensity={3.4}
                roughness={0.1}
              />
            </mesh>
            <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]} position={[0, 0.08, 0]}>
              <torusGeometry args={[0.28, 0.024, 8, 24]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
            </mesh>

            {/* Outgoing Carrier Signal Arrow */}
            {(node.basePorts || [3]).map((port) => {
              const angle = (port * Math.PI) / 2;
              return (
                <group key={`src-arrow-${port}`} rotation={[0, angle, 0]}>
                  <mesh position={[0, 0.048, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.055, 0.10, 4]} />
                    <meshStandardMaterial
                      color="#ffffff"
                      emissive="#00f0ff"
                      emissiveIntensity={4.8}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        )}

        {/* 7. Key / Sub-routine Decryption Node */}
        {node.type === NODE_TYPES.KEY_NODE && (
          <group>
            <mesh position={isWallZ ? [0, 0, 0.14] : [0, 0.14, 0]}>
              <octahedronGeometry args={[0.18, 0]} />
              <meshStandardMaterial
                color={isPowered ? '#34d399' : '#fbbf24'}
                emissive={isPowered ? '#34d399' : '#fbbf24'}
                emissiveIntensity={isPowered ? 3.2 : 1.6}
                wireframe={!isPowered}
              />
            </mesh>
            <mesh
              rotation={isWallZ ? [0, 0, 0] : [Math.PI / 2, 0, 0]}
              position={isWallZ ? [0, 0, 0.14] : [0, 0.14, 0]}
            >
              <ringGeometry args={[0.24, 0.28, 6]} />
              <meshBasicMaterial
                color={isPowered ? '#34d399' : '#fbbf24'}
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Key Sub-Routine Input Receiving Arrow */}
            {(node.basePorts || [0]).map((port) => {
              if (isWallZ) {
                const angle = (-port * Math.PI) / 2;
                return (
                  <group key={`key-arrow-${port}`} rotation={[0, 0, angle]}>
                    <mesh position={[0, 0.22, 0.048]} rotation={[Math.PI, 0, 0]}>
                      <coneGeometry args={[0.045, 0.08, 4]} />
                      <meshStandardMaterial
                        color={isPowered ? '#ffffff' : '#fde68a'}
                        emissive={isPowered ? '#34d399' : '#fbbf24'}
                        emissiveIntensity={isPowered ? 4.0 : 1.8}
                      />
                    </mesh>
                  </group>
                );
              }
              const angle = (port * Math.PI) / 2;
              return (
                <group key={`key-arrow-${port}`} rotation={[0, angle, 0]}>
                  <mesh position={[0, 0.048, 0.22]} rotation={[-Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.045, 0.08, 4]} />
                    <meshStandardMaterial
                      color={isPowered ? '#ffffff' : '#fde68a'}
                      emissive={isPowered ? '#34d399' : '#fbbf24'}
                      emissiveIntensity={isPowered ? 4.0 : 1.8}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        )}

        {/* Generous invisible raycast hit cylinder volume */}
        <mesh
          position={isWallZ ? [0, 0, 0.16] : [0, 0.16, 0]}
          rotation={isWallZ ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
        >
          <cylinderGeometry args={[0.55, 0.55, 0.50, 24]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

const _flyForward = new THREE.Vector3();
const _flyRight = new THREE.Vector3();
const _flyMoveDelta = new THREE.Vector3();

/**
 * Camera Director for Hacker Mode:
 * - Smoothly glides to chosen camera vantage presets when selected
 * - Yields complete free control to the player:
 *   - WASD / Arrow keys for full 3D room flight
 *   - Space / PageUp to elevate, Shift / C / PageDown to descend
 *   - Left-click drag or single-finger touch for free 360° orbit look
 *   - Right-click or two-finger drag for screen-space pan
 *   - Scroll wheel / pinch for zooming
 */
function HackerCameraDirector({ activeVantageId, controlsRef }) {
  const { camera, gl } = useThree();
  const isTransitioning = useRef(true);
  const targetCamPos = useRef(new THREE.Vector3());
  const targetCamLook = useRef(new THREE.Vector3());
  const lastVantageRef = useRef(null);

  // Active keyboard state for smooth flight
  const keysDown = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    fast: false,
  });

  // Trigger smooth glide whenever activeVantageId changes
  useEffect(() => {
    if (lastVantageRef.current !== activeVantageId) {
      lastVantageRef.current = activeVantageId;
      const v = CAMERA_VANTAGES[activeVantageId] || CAMERA_VANTAGES.DESK_VIEW;
      targetCamPos.current.set(...v.pos);
      targetCamLook.current.set(...v.target);
      isTransitioning.current = true;

      // Failsafe timer so camera is never stuck in flight mode
      const timer = setTimeout(() => {
        if (isTransitioning.current) {
          isTransitioning.current = false;
          if (controlsRef?.current) {
            controlsRef.current.target.copy(targetCamLook.current);
            controlsRef.current.update();
          }
        }
      }, 850);

      return () => clearTimeout(timer);
    }
  }, [activeVantageId, controlsRef]);

  // Cancel flight transition immediately on any player input
  useEffect(() => {
    const dom = gl?.domElement;
    if (!dom) return;

    const stopFlight = () => {
      if (activeVantageId === 'VAULT_CHAMBER' || activeVantageId === 'VAULT_LAPTOP_FOCUS') return;
      isTransitioning.current = false;
    };

    dom.addEventListener('pointerdown', stopFlight);
    dom.addEventListener('wheel', stopFlight, { passive: true });
    dom.addEventListener('touchstart', stopFlight, { passive: true });

    return () => {
      dom.removeEventListener('pointerdown', stopFlight);
      dom.removeEventListener('wheel', stopFlight);
      dom.removeEventListener('touchstart', stopFlight);
    };
  }, [gl]);

  // Keyboard navigation listener (WASD / Arrows / Space / Shift / C)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      let handled = false;

      if (k === 'w' || e.key === 'ArrowUp') {
        keysDown.current.forward = true;
        handled = true;
      }
      if (k === 's' || e.key === 'ArrowDown') {
        keysDown.current.backward = true;
        handled = true;
      }
      if (k === 'a' || e.key === 'ArrowLeft') {
        keysDown.current.left = true;
        handled = true;
      }
      if (k === 'd' || e.key === 'ArrowRight') {
        keysDown.current.right = true;
        handled = true;
      }
      if (e.key === ' ' || k === 'pageup') {
        keysDown.current.up = true;
        handled = true;
      }
      if (k === 'c' || k === 'pagedown') {
        keysDown.current.down = true;
        handled = true;
      }
      if (e.shiftKey) {
        keysDown.current.fast = true;
      }

      if (handled) {
        isTransitioning.current = false;
      }
    };

    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') keysDown.current.forward = false;
      if (k === 's' || e.key === 'ArrowDown') keysDown.current.backward = false;
      if (k === 'a' || e.key === 'ArrowLeft') keysDown.current.left = false;
      if (k === 'd' || e.key === 'ArrowRight') keysDown.current.right = false;
      if (e.key === ' ' || k === 'pageup') keysDown.current.up = false;
      if (k === 'c' || k === 'pagedown') keysDown.current.down = false;
      if (!e.shiftKey) {
        keysDown.current.fast = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.04);

    // 1. Process automated glide to preset vantage point
    if (isTransitioning.current) {
      const alpha = 1 - Math.exp(-6.5 * clampedDelta);
      camera.position.lerp(targetCamPos.current, alpha);

      if (controlsRef?.current) {
        controlsRef.current.target.lerp(targetCamLook.current, alpha);
        controlsRef.current.update();
      } else {
        camera.lookAt(targetCamLook.current);
      }

      const distPos = camera.position.distanceTo(targetCamPos.current);
      const distTarget = controlsRef?.current
        ? controlsRef.current.target.distanceTo(targetCamLook.current)
        : 0;

      if (distPos < 0.05 && distTarget < 0.05) {
        camera.position.copy(targetCamPos.current);
        if (controlsRef?.current) {
          controlsRef.current.target.copy(targetCamLook.current);
          controlsRef.current.update();
        }
        isTransitioning.current = false;
      }
      return;
    }

    // 2. Free flight camera movement via WASD / Arrows (disabled in seated bunker chamber)
    if (activeVantageId === 'VAULT_CHAMBER' || activeVantageId === 'VAULT_LAPTOP_FOCUS') return;

    const k = keysDown.current;
    if (k.forward || k.backward || k.left || k.right || k.up || k.down) {
      // Calculate horizontal forward vector from current camera rotation
      _flyForward.set(0, 0, -1).applyQuaternion(camera.quaternion);
      _flyForward.y = 0;
      if (_flyForward.lengthSq() > 0.0001) {
        _flyForward.normalize();
      } else {
        _flyForward.set(0, 0, -1);
      }

      // Calculate horizontal right vector
      _flyRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
      _flyRight.y = 0;
      if (_flyRight.lengthSq() > 0.0001) {
        _flyRight.normalize();
      } else {
        _flyRight.set(1, 0, 0);
      }

      _flyMoveDelta.set(0, 0, 0);
      if (k.forward) _flyMoveDelta.add(_flyForward);
      if (k.backward) _flyMoveDelta.sub(_flyForward);
      if (k.right) _flyMoveDelta.add(_flyRight);
      if (k.left) _flyMoveDelta.sub(_flyRight);
      if (k.up) _flyMoveDelta.y += 1.0;
      if (k.down) _flyMoveDelta.y -= 1.0;

      if (_flyMoveDelta.lengthSq() > 0) {
        const speed = k.fast ? 5.2 : 3.2;
        _flyMoveDelta.normalize().multiplyScalar(speed * clampedDelta);

        camera.position.add(_flyMoveDelta);
        // Generous room bounds so player can fly anywhere inside studio
        camera.position.x = Math.max(-4.8, Math.min(4.8, camera.position.x));
        camera.position.y = Math.max(0.3, Math.min(5.5, camera.position.y));
        camera.position.z = Math.max(-4.8, Math.min(4.8, camera.position.z));

        if (controlsRef?.current) {
          controlsRef.current.target.add(_flyMoveDelta);
          controlsRef.current.target.x = Math.max(-4.8, Math.min(4.8, controlsRef.current.target.x));
          controlsRef.current.target.y = Math.max(0.1, Math.min(4.8, controlsRef.current.target.y));
          controlsRef.current.target.z = Math.max(-4.8, Math.min(4.8, controlsRef.current.target.z));
        }
      }
    }

    // 3. Keep OrbitControls synced every frame for mouse and touch dragging
    if (controlsRef?.current) {
      controlsRef.current.update();
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
  isVaultOpen = false,
  betrayalPhase = 'NONE',
  isLaptopZoomed = false,
  onToggleLaptopZoom,
  onPhaseChange,
  onInteractTerminal,
  onReturnToPortfolio,
  onRestartEasterEgg,
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

      {/* 1. When in Secret Bunker Mode: Render the Standalone Dedicated 360° Bunker World */}
      {betrayalPhase && betrayalPhase !== 'NONE' ? (
        <SecretVaultRoom3D
          isOpen={isVaultOpen}
          isLaptopZoomed={isLaptopZoomed}
          onToggleLaptopZoom={onToggleLaptopZoom}
          betrayalPhase={betrayalPhase}
          onPhaseChange={onPhaseChange}
          onInteractTerminal={onInteractTerminal}
          onReturnToPortfolio={onReturnToPortfolio}
          onRestartEasterEgg={onRestartEasterEgg}
        />
      ) : (
        <>
          {/* 2. When in Circuit Puzzle Mode: Render Conduits with Directional Flow Arrows */}
          {currentStage.connections.map((conn, idx) => {
            const fromNode = currentStage.nodes.find((n) => n.id === conn.from);
            const toNode = currentStage.nodes.find((n) => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const isPowered = poweredConnectionIndices.has(idx);
            const isHostile =
              fromNode.type === NODE_TYPES.HOSTILE_IDS ||
              toNode.type === NODE_TYPES.HOSTILE_IDS;
            const flowDirection = evaluation?.flowDirections?.get(idx);

            return (
              <CircuitConduit
                key={`${conn.from}-${conn.to}-${idx}`}
                from={fromNode.position}
                to={toNode.position}
                waypoints={conn.waypoints}
                isPowered={isPowered}
                isHostile={isHostile && isPowered}
                isCompleted={isTargetPowered}
                flowDirection={flowDirection}
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
        </>
      )}
    </group>
  );
}
