import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playAcBeep, playClickSound } from '../../utils/audio.js';

export default function AirConditionerUnit({ onSelect, onHover }) {
  const [isOn, setIsOn] = useState(true);
  const [temperature, setTemperature] = useState(18); // 18C, 20C, 22C, 24C
  const [hovered, setHovered] = useState(false);

  const louverRef = useRef();
  const rotorRef = useRef();
  const mistRef = useRef();
  const flapAngle = useRef(0.55);
  const rotorSpeed = useRef(0);
  const mistSkip = useRef(0);

  // 16 Drifting Cold Air / Frost Vapor Motes
  const mistData = useMemo(() => {
    const count = 16;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 1.1; // Across louver width
      positions[i * 3 + 1] = -0.15 - Math.random() * 0.9;  // Drifting down
      positions[i * 3 + 2] = 0.15 + Math.random() * 0.7;   // Drifting forward out
      speeds[i] = 0.4 + Math.random() * 0.5;
    }
    return { positions, speeds, count };
  }, []);

  // Global window controls so UI buttons, first-person controller, or console can interact
  useEffect(() => {
    window.__TOGGLE_AC__ = () => {
      toggleAc();
    };
    window.__SET_AC_TEMP__ = (t) => {
      setTemperature(t);
      playAcBeep(true);
    };
    window.__AC_STATE__ = { isOn, temperature };
    return () => {
      delete window.__TOGGLE_AC__;
      delete window.__SET_AC_TEMP__;
      delete window.__AC_STATE__;
    };
  }, [isOn, temperature]);

  const toggleAc = () => {
    const nextState = !isOn;
    setIsOn(nextState);
    playAcBeep(nextState);
  };

  const cycleTemp = (e) => {
    e.stopPropagation();
    if (!isOn) {
      setIsOn(true);
      playAcBeep(true);
      return;
    }
    // Cycle 18 -> 20 -> 22 -> 24 -> 18
    const temps = [18, 20, 22, 24];
    const nextIdx = (temps.indexOf(temperature) + 1) % temps.length;
    setTemperature(temps[nextIdx]);
    playAcBeep(true);
  };

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // 1. Motorized Swing Louver Flap Dynamics
    // When ON: Flap opens and gently oscillates. When OFF: Closes flush against housing.
    const targetFlap = isOn ? 0.55 + Math.sin(time * 1.5) * 0.12 : 0.0;
    flapAngle.current = THREE.MathUtils.damp(flapAngle.current, targetFlap, 4.0, delta);
    if (louverRef.current) {
      louverRef.current.rotation.x = flapAngle.current;
    }

    // 2. Internal Cross-Flow Fan Rotor
    const targetRotor = isOn ? 14.0 : 0.0;
    rotorSpeed.current = THREE.MathUtils.damp(rotorSpeed.current, targetRotor, 2.5, delta);
    if (rotorRef.current) {
      rotorRef.current.rotation.x += delta * rotorSpeed.current;
    }

    // 3. Cold Vapor Mist Particles Animation (drifting downward and outward)
    if (mistRef.current && isOn) {
      mistSkip.current = (mistSkip.current + 1) % 2;
      if (mistSkip.current === 0) {
        const posAttr = mistRef.current.geometry.attributes.position;
        const arr = posAttr.array;
        const count = mistData.count;

        for (let i = 0; i < count; i++) {
          arr[i * 3 + 1] -= delta * 2 * mistData.speeds[i]; // fall down
          arr[i * 3 + 2] += delta * 2 * (mistData.speeds[i] * 0.6); // drift out
          if (arr[i * 3 + 1] < -1.4) {
            arr[i * 3 + 0] = (Math.random() - 0.5) * 1.1;
            arr[i * 3 + 1] = -0.15;
            arr[i * 3 + 2] = 0.15;
          }
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group
      position={[-4.90, 3.75, -2.0]}
      rotation={[0, Math.PI / 2, 0]}
      name="AirConditionerUnit"
      onClick={cycleTemp}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
        onHover?.(`Smart Inverter AC [${isOn ? `${temperature}°C ❄️ ACTIVE` : 'OFF - STANDBY'}] · Click to Toggle`);
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
        onHover?.(null);
      }}
    >
      {/* 1. Main Aerodynamic Split AC Housing (Obsidian Graphite finish) */}
      <mesh position={[0, 0, 0.12]} castShadow receiveShadow>
        <boxGeometry args={[1.36, 0.38, 0.24]} />
        <meshStandardMaterial
          color={hovered ? '#1e293b' : '#0b1118'}
          metalness={0.88}
          roughness={0.25}
        />
      </mesh>

      {/* 2. Beveled Metallic Front Fascia Plate */}
      <mesh position={[0, 0, 0.245]}>
        <boxGeometry args={[1.32, 0.35, 0.015]} />
        <meshStandardMaterial
          color={hovered ? '#334155' : '#141c26'}
          metalness={0.92}
          roughness={0.2}
        />
      </mesh>

      {/* 3. Sleek Chrome Trim Accent Line across bottom */}
      <mesh position={[0, -0.14, 0.255]}>
        <boxGeometry args={[1.32, 0.012, 0.008]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.96} roughness={0.1} />
      </mesh>

      {/* 4. Top Suction Air Intake Grille & Louver Slats */}
      <group position={[0, 0.185, 0.12]}>
        <mesh>
          <boxGeometry args={[1.26, 0.01, 0.18]} />
          <meshStandardMaterial color="#020617" roughness={0.7} />
        </mesh>
        {/* 6 Intake Louver Ribs */}
        {[-0.06, -0.035, -0.01, 0.015, 0.04, 0.065].map((zOffset, idx) => (
          <mesh key={`intake-rib-${idx}`} position={[0, 0.006, zOffset]}>
            <boxGeometry args={[1.24, 0.004, 0.012]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* 5. Bottom Air Discharge Vent Chute */}
      <mesh position={[0, -0.165, 0.13]}>
        <boxGeometry args={[1.24, 0.04, 0.16]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* 6. Internal Cross-Flow Fan Drum (Spins inside discharge vent) */}
      <group position={[0, -0.16, 0.12]}>
        <mesh ref={rotorRef} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.026, 0.026, 1.2, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* 7. Motorized Bottom Airflow Discharge Louver / Flap */}
      <group ref={louverRef} position={[0, -0.18, 0.22]}>
        <mesh position={[0, -0.01, 0.045]}>
          <boxGeometry args={[1.24, 0.014, 0.09]} />
          <meshStandardMaterial
            color={hovered ? '#475569' : '#1e293b'}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        {/* Louver Front Metallic Edge */}
        <mesh position={[0, -0.01, 0.09]}>
          <boxGeometry args={[1.24, 0.016, 0.006]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.9} />
        </mesh>
      </group>

      {/* 8. Front Digital LED Climate Matrix Display (Right side of fascia) */}
      <group position={[0.44, 0.02, 0.255]}>
        {/* Dark Screen Inset Bezel */}
        <mesh>
          <planeGeometry args={[0.26, 0.14]} />
          <meshBasicMaterial color="#020617" />
        </mesh>

        {isOn ? (
          <>
            {/* Glowing Digital Temperature Readout */}
            <mesh position={[-0.03, 0.01, 0.002]}>
              <planeGeometry args={[0.12, 0.08]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
            </mesh>
            {/* Temperature Degree Text Indicator Symbol */}
            <mesh position={[0.05, 0.028, 0.003]}>
              <ringGeometry args={[0.008, 0.012, 12]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0.075, 0.01, 0.003]}>
              <boxGeometry args={[0.016, 0.032, 0.001]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>

            {/* Glowing Snowflake ❄️ Cooling Icon */}
            <group position={[-0.08, 0.01, 0.003]}>
              <mesh>
                <boxGeometry args={[0.028, 0.004, 0.001]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 3]}>
                <boxGeometry args={[0.028, 0.004, 0.001]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
              <mesh rotation={[0, 0, -Math.PI / 3]}>
                <boxGeometry args={[0.028, 0.004, 0.001]} />
                <meshBasicMaterial color="#38bdf8" />
              </mesh>
            </group>

            {/* 3 Fan Speed Stepped Bars */}
            {[
              { x: -0.04, h: 0.01 },
              { x: -0.02, h: 0.016 },
              { x: 0.0, h: 0.022 },
            ].map((bar, i) => (
              <mesh key={`bar-${i}`} position={[bar.x, -0.038, 0.003]}>
                <boxGeometry args={[0.012, bar.h, 0.001]} />
                <meshBasicMaterial color="#00f5ff" />
              </mesh>
            ))}

            {/* Smart Eco Green Inverter LED dot */}
            <mesh position={[0.08, -0.038, 0.003]}>
              <circleGeometry args={[0.006, 12]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
          </>
        ) : (
          /* Standby State: Amber/Red Status LED Dot */
          <group position={[0, 0, 0.003]}>
            <mesh position={[0, 0, 0]}>
              <circleGeometry args={[0.008, 12]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0.04, 0, 0]}>
              <boxGeometry args={[0.04, 0.006, 0.001]} />
              <meshBasicMaterial color="#475569" />
            </mesh>
          </group>
        )}
      </group>

      {/* 9. Brand & Model Metallic Stencil (Left side of fascia) */}
      <mesh position={[-0.42, 0.03, 0.255]}>
        <planeGeometry args={[0.28, 0.04]} />
        <meshBasicMaterial color="#334155" />
      </mesh>

      {/* 10. Cold Vapor Airflow Particle Stream (drifting into studio when ON) */}
      {isOn && (
        <points ref={mistRef} position={[0, -0.15, 0.2]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={mistData.count}
              array={mistData.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.055}
            color="#67e8f9"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* 11. Soft Frost Cyan Downward Wash Light (illuminates studio below when active) */}
      {isOn && (
        <pointLight
          position={[0, -0.35, 0.35]}
          color="#38bdf8"
          intensity={1.8}
          distance={3.8}
          decay={2}
        />
      )}
    </group>
  );
}
