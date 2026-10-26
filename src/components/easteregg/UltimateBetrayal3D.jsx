import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Award,
  ChevronRight,
  Flame,
  RotateCcw,
  Sparkles,
  Terminal,
  Volume2,
  Zap,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import {
  playRecordScratch,
  playSlipperWhoosh,
  playMomGong,
  playDhaniyaFanfare,
  playCorporateClick,
  playSadPunchline,
} from './easterEggAudio.js';
import { playClickSound, playHackingBeep } from '../../utils/audio.js';

/**
 * Text-to-speech helper with safe fallback
 */
function speakDialogue(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(
      (v) => v.lang.includes('en-IN') || v.name.includes('India')
    );
    if (indVoice) utterance.voice = indVoice;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}

/**
 * 3D Animated Steam Particles rising from the hot Maggi noodles bowl
 */
function SteamParticles3D({ count = 12 }) {
  const particlesRef = useRef([]);

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      x: (Math.random() - 0.5) * 0.08,
      y: 0.04 + Math.random() * 0.16,
      z: (Math.random() - 0.5) * 0.08,
      speedY: 0.06 + Math.random() * 0.07,
      swirlSpeed: 1.5 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      scale: 0.012 + Math.random() * 0.015,
    }));
  }, [count]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    particlesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = particles[i];
      p.y += p.speedY * delta;
      p.x += Math.sin(time * p.swirlSpeed + p.phase) * delta * 0.02;
      p.z += Math.cos(time * p.swirlSpeed + p.phase) * delta * 0.02;

      // Reset when particle floats too high
      if (p.y > 0.28) {
        p.y = 0.04;
        p.x = (Math.random() - 0.5) * 0.08;
        p.z = (Math.random() - 0.5) * 0.08;
      }

      mesh.position.set(p.x, p.y, p.z);
      const life = 1 - (p.y - 0.04) / 0.24;
      mesh.scale.setScalar(p.scale * (1 + (1 - life) * 1.5));
      if (mesh.material) {
        mesh.material.opacity = Math.max(0, life * 0.35);
      }
    });
  });

  return (
    <group position={[0.3, 0.04, 0.05]}>
      {particles.map((_, i) => (
        <mesh
          key={`steam-${i}`}
          ref={(el) => (particlesRef.current[i] = el)}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.25}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 3D Tactical Flying Indian Chappal (Hawai Slipper) 🩴
 * Features supersonic ballistic arc trajectory flight towards camera when launched!
 */
function TacticalChappal3D({ isLaunched, onHit }) {
  const groupRef = useRef();
  const trailRef = useRef();
  const flightProgress = useRef(0);
  const hasTriggeredHit = useRef(false);

  // Predefined ballistic trajectory points in 3D world space
  // From vault back ceiling -> swoops through vault doorway -> passes in front of camera
  const startPos = useMemo(() => new THREE.Vector3(0.35, 0.95, 0.2), []);
  const midPos = useMemo(() => new THREE.Vector3(0.1, 0.7, 1.2), []);
  const endPos = useMemo(() => new THREE.Vector3(-0.05, 0.55, 2.3), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    if (!isLaunched) {
      // Idle hovering menace near the ceiling
      flightProgress.current = 0;
      hasTriggeredHit.current = false;
      groupRef.current.position.set(
        startPos.x + Math.sin(time * 2.5) * 0.04,
        startPos.y + Math.cos(time * 3) * 0.03,
        startPos.z
      );
      groupRef.current.rotation.set(
        0.6 + Math.sin(time * 2) * 0.15,
        0.8 + Math.cos(time * 1.8) * 0.15,
        -0.4
      );
    } else {
      // Supersonic Flight Mode (Mach 3.4)
      flightProgress.current = Math.min(1.0, flightProgress.current + delta * 1.25);
      const t = flightProgress.current;

      // Quadratic Bezier interpolation
      const x = (1 - t) * (1 - t) * startPos.x + 2 * (1 - t) * t * midPos.x + t * t * endPos.x;
      const y = (1 - t) * (1 - t) * startPos.y + 2 * (1 - t) * t * midPos.y + t * t * endPos.y;
      const z = (1 - t) * (1 - t) * startPos.z + 2 * (1 - t) * t * midPos.z + t * t * endPos.z;

      groupRef.current.position.set(x, y, z);

      // Rapid multi-axis tumble
      groupRef.current.rotation.x += delta * 24;
      groupRef.current.rotation.y += delta * 18;
      groupRef.current.rotation.z += delta * 32;

      // Dynamic trail visibility
      if (trailRef.current) {
        trailRef.current.scale.set(1, 1, 1 + t * 4);
      }

      if (t >= 0.95 && !hasTriggeredHit.current) {
        hasTriggeredHit.current = true;
        onHit?.();
      }
    }
  });

  return (
    <group ref={groupRef} position={[0.35, 0.95, 0.2]}>
      {/* 1. Slipper Rubber Sole (Classic Blue & White Hawai) */}
      {/* White Base Layer */}
      <mesh position={[0, -0.006, 0]}>
        <boxGeometry args={[0.095, 0.012, 0.22]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      {/* Blue Top Footbed Layer */}
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[0.092, 0.01, 0.218]} />
        <meshStandardMaterial color="#0284c7" roughness={0.5} />
      </mesh>

      {/* 2. Classic Y-Strap (Blue Rubber) */}
      <group position={[0, 0.016, 0.02]}>
        {/* Left Strap */}
        <mesh position={[-0.026, 0.014, -0.03]} rotation={[0.4, -0.3, 0]}>
          <boxGeometry args={[0.015, 0.006, 0.09]} />
          <meshStandardMaterial color="#0369a1" roughness={0.4} />
        </mesh>
        {/* Right Strap */}
        <mesh position={[0.026, 0.014, -0.03]} rotation={[0.4, 0.3, 0]}>
          <boxGeometry args={[0.015, 0.006, 0.09]} />
          <meshStandardMaterial color="#0369a1" roughness={0.4} />
        </mesh>
        {/* Center Toe Post */}
        <mesh position={[0, 0.012, 0.045]}>
          <cylinderGeometry args={[0.004, 0.004, 0.025, 8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>

      {/* 3. Aerodynamic Supersonic Slipstream Trail */}
      {isLaunched && (
        <mesh ref={trailRef} position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.001, 0.35, 8]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * 3D Holy Bunch of Fresh Dhaniya (Coriander), Mirchi & ₹10 Coin
 */
function DhaniyaBundle3D() {
  return (
    <group position={[-0.38, 0.025, 0.12]}>
      {/* 1. Bundled Green Stems */}
      <mesh rotation={[0, 0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.016, 0.16, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.6} />
      </mesh>

      {/* Red Rubber Band Binding the Stems */}
      <mesh position={[0.02, 0, 0]} rotation={[0, 0.3, Math.PI / 2]}>
        <torusGeometry args={[0.018, 0.004, 8, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>

      {/* 2. Ruffled Leaf Foliage Clusters */}
      {[
        [-0.06, 0.025, 0.02, 0.04],
        [-0.02, 0.035, 0.05, 0.045],
        [0.03, 0.028, 0.03, 0.038],
        [-0.04, 0.02, -0.03, 0.035],
        [0.01, 0.032, -0.02, 0.042],
        [-0.08, 0.018, 0.04, 0.032],
      ].map(([x, y, z, r], idx) => (
        <group key={`leaf-cluster-${idx}`} position={[x, y, z]}>
          <mesh>
            <sphereGeometry args={[r, 7, 7]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#15803d"
              emissiveIntensity={0.5}
              roughness={0.7}
            />
          </mesh>
        </group>
      ))}

      {/* 3. Fresh Indian Green Chillies (Mirchi) 🌶️ */}
      <group position={[0.12, 0.008, 0.04]} rotation={[0, 0.6, 0.1]}>
        {/* Chilli 1 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.008, 0.09, 8]} />
          <meshStandardMaterial color="#15803d" roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Chilli 1 Stem */}
        <mesh position={[0, 0, -0.048]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.018, 6]} />
          <meshStandardMaterial color="#166534" />
        </mesh>
      </group>

      <group position={[0.13, 0.008, -0.03]} rotation={[0, -0.4, -0.1]}>
        {/* Chilli 2 */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.007, 0.08, 8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {/* 4. Golden ₹10 Coin on the Desk */}
      <group position={[0.02, 0.005, 0.12]} rotation={[-Math.PI / 2, 0, 0.4]}>
        {/* Outer Brass Ring */}
        <mesh>
          <cylinderGeometry args={[0.028, 0.028, 0.004, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Inner Silver Core */}
        <mesh position={[0, 0.0025, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.0042, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 3D Steaming Maggi Ramen Bowl with Fork
 */
function SteamingMaggiBowl3D() {
  return (
    <group position={[0.3, 0.035, 0.05]}>
      {/* Ceramic Bowl */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.05, 0.075, 18]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
      </mesh>
      {/* Dark Ceramic Rim Accent */}
      <mesh position={[0, 0.038, 0]}>
        <torusGeometry args={[0.08, 0.004, 8, 24]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} />
      </mesh>
      {/* Hot Yellow Noodles with Broth Inside */}
      <mesh position={[0, 0.028, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.015, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
      </mesh>
      {/* Green Scallop Herb Flecks on Noodles */}
      {[-0.03, 0.02, -0.01].map((ox, i) => (
        <mesh key={`fleck-${i}`} position={[ox, 0.037, ox * 0.7]}>
          <cylinderGeometry args={[0.004, 0.004, 0.002, 6]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      ))}
      {/* Stainless Steel Fork Stuck In at an Angle */}
      <group position={[0.02, 0.075, 0]} rotation={[0.4, 0, -0.2]}>
        <mesh>
          <boxGeometry args={[0.008, 0.13, 0.003]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      {/* 3D Animated Steam Puffs */}
      <SteamParticles3D count={10} />
    </group>
  );
}

/**
 * 3D Gaming / Hacker Laptop with Backlit Keyboard & Glowing Screen
 */
function HackerLaptop3D({ onInteractTerminal, isInteractive = false }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={[-0.08, 0.018, 0.02]}
      onClick={(e) => {
        if (isInteractive) {
          e.stopPropagation();
          onInteractTerminal?.();
        }
      }}
      onPointerOver={(e) => {
        if (isInteractive) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        if (isInteractive) {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }
      }}
    >
      {/* 1. Laptop Base Chassis */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.42, 0.016, 0.28]} />
        <meshStandardMaterial
          color={hovered ? '#1e293b' : '#0f172a'}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Backlit Keyboard Deck (Glowing Cyan Chiclet Keys) */}
      <mesh position={[0, 0.019, -0.01]}>
        <planeGeometry args={[0.34, 0.14]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#00f0ff"
          emissiveIntensity={1.8}
          roughness={0.3}
        />
      </mesh>

      {/* Illuminated Trackpad */}
      <mesh position={[0, 0.019, 0.085]}>
        <planeGeometry args={[0.12, 0.07]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 2. Open Laptop Screen Lid (Angled at 115°) */}
      <group position={[0, 0.018, -0.138]} rotation={[-0.38, 0, 0]}>
        {/* Screen Outer Bezel */}
        <mesh position={[0, 0.145, 0]}>
          <boxGeometry args={[0.42, 0.28, 0.014]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Glowing LCD Display */}
        <mesh position={[0, 0.145, 0.008]}>
          <planeGeometry args={[0.38, 0.24]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={hovered ? 3.6 : 2.6}
            roughness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * 3D Holographic Projector Pedestal on the Desk
 */
function HolographicProjectorPedestal3D() {
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 1.2;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 1.8;
  });

  return (
    <group position={[0, 0.02, -0.05]}>
      {/* Outer Emitter Ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.012, 8, 32]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={2.5}
        />
      </mesh>
      {/* Inner Concentric Amber Ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.008, 8, 24]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={2.2}
        />
      </mesh>
      {/* Volumetric Upward Hologram Beam Cone */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.35, 0.12, 0.7, 16, 1, true]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Complete 3D Secret Vault Interior Chamber Architecture
 */
function SecretChamberArchitecture3D() {
  return (
    <group position={[0, 0, -0.75]}>
      {/* Chamber Deep Room Cavity Walls */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 2.3, 1.8]} />
        <meshStandardMaterial
          color="#070c18"
          roughness={0.8}
          metalness={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Industrial Floor Grates with Green Under-glow */}
      <mesh position={[0, -1.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.45, 1.75]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Floor Grate Glowing Slats */}
      {[-0.6, -0.2, 0.2, 0.6].map((gx, idx) => (
        <mesh
          key={`grate-${idx}`}
          position={[gx, -1.135, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.15, 1.6]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.25} />
        </mesh>
      ))}

      {/* Recessed Vertical Neon Wall Seams */}
      {[-1.24, 1.24].map((wx, idx) => (
        <mesh
          key={`wall-seam-${idx}`}
          position={[wx, 0, -0.2]}
          rotation={[0, idx === 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          <planeGeometry args={[0.04, 2.1]} />
          <meshBasicMaterial color="#00f0ff" />
        </mesh>
      ))}

      {/* Dangling Overhead Industrial Bulb with Wire Cage */}
      <group position={[0, 1.05, 0]}>
        {/* Cord */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.12, 6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Glowing Filament Bulb */}
        <mesh position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#fef08a"
            emissiveIntensity={4.2}
          />
        </mesh>
        {/* Local Point Light Illuminating Desk */}
        <pointLight
          position={[0, -0.05, 0]}
          color="#fef08a"
          intensity={2.8}
          distance={3.5}
        />
      </group>
    </group>
  );
}

/**
 * In-World 3D Holographic UI System
 * Embedded directly in 3D world space using @react-three/drei <Html transform center>
 */
function HolographicDisplay3D({
  phase,
  onPhaseChange,
  onInteractTerminal,
  onReturnToPortfolio,
  onRestartEasterEgg,
  onTriggerChappalFlight,
}) {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [roastStep, setRoastStep] = useState('initial'); // 'initial' | 'slipper' | 'narrator'
  const dialogueSpokenRef = useRef(false);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // When Mom Reveal triggers, play scratch & speak dialogue
  useEffect(() => {
    if (phase === 'MOM_REVEAL' && !dialogueSpokenRef.current) {
      dialogueSpokenRef.current = true;
      playRecordScratch();
      setTimeout(() => {
        playMomGong();
        speakDialogue(
          'Oye hero! Stop clicking random lines on computer and pretending to be in Matrix! Go to market and bring 10 rupees dhaniya right now!'
        );
      }, 350);
    }
  }, [phase]);

  // Handle player dialogue selection
  const handlePlayerChoice = (choiceText) => {
    playCorporateClick();
    setSelectedResponse(choiceText);
    setRoastStep('slipper');
    onTriggerChappalFlight?.();
    playSlipperWhoosh();

    setTimeout(() => {
      setRoastStep('narrator');
      playSadPunchline();
    }, 1400);
  };

  const handleProceedToCertificate = () => {
    playDhaniyaFanfare();
    onPhaseChange?.('CERTIFICATE_ROAST');
  };

  // Keyboard shortcut listener (E or Enter)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        if (phase === 'TERMINAL_INTERACTIVE') {
          onInteractTerminal?.();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onInteractTerminal]);

  return (
    <group position={[0, 0.52, 0.08]} rotation={[0, 0, 0]}>
      <Html
        center
        transform
        distanceFactor={0.72}
        position={[0, 0, 0]}
        zIndexRange={[300, 0]}
      >
        <div
          className="holographic-vault-interface"
          onWheel={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* ============================================================== */}
          {/* PHASE 1: BREACH ANNOUNCEMENT BANNER                            */}
          {/* ============================================================== */}
          {phase === 'VAULT_OPENING' && (
            <div className="holo-banner-card">
              <div className="holo-badge amber">
                <Zap size={13} />
                <span>SECTOR 06 // VAULT BULKHEAD BREACHED</span>
              </div>
              <h2 className="holo-title-lg">THE VEIL IS LIFTED</h2>
              <p className="holo-quote">
                “You have breached a system that remained inaccessible for decades. Decrypting the true identity of the Master Architect...”
              </p>
              <div className="holo-status-row">
                <span className="holo-pulse-dot" />
                <span>HYDRAULIC BULKHEAD COMPARTMENT OPENING...</span>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PHASE 2: TERMINAL INTERACTIVE PROMPT                           */}
          {/* ============================================================== */}
          {phase === 'TERMINAL_INTERACTIVE' && (
            <div className="holo-prompt-card" onClick={onInteractTerminal}>
              <div className="holo-badge green">
                <Terminal size={13} />
                <span>ANOMALOUS SANCTUM DETECTED</span>
              </div>
              <h3 className="holo-heading">THE INNER SANCTUM</h3>
              <p className="holo-desc">
                Inside the legendary vault sits an unmade bed, a pile of laundry, cold Maggi noodles, and an eerie silence.
              </p>
              <button
                type="button"
                className="holo-action-btn green-glow"
                onClick={onInteractTerminal}
              >
                <Zap size={15} />
                <span>CONFRONT REALITY [CLICK OR PRESS E]</span>
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* PHASE 3: MOM CALLING & DEADPAN REALITY CHECK                  */}
          {/* ============================================================== */}
          {phase === 'MOM_REVEAL' && (
            <div className="holo-dialogue-card">
              {/* Header with Live Audio Equalizer */}
              <div className="holo-header-row">
                <div className="holo-badge red">
                  <Volume2 size={13} className="holo-pulse-icon" />
                  <span>INCOMING HIGH-PRIORITY TRANSMISSION // KITCHEN INTERCOM</span>
                </div>
                {/* Cyber Audio Equalizer Waves */}
                <div className="holo-audio-eq">
                  <span className="eq-bar bar-1" />
                  <span className="eq-bar bar-2" />
                  <span className="eq-bar bar-3" />
                  <span className="eq-bar bar-4" />
                </div>
              </div>

              {/* Mom's Shouting Dialogue Card */}
              <div className="holo-shout-box">
                <div className="holo-speaker-tag">
                  <span className="speaker-avatar">👵🏽</span>
                  <strong>MOM (SHOUTING FROM THE KITCHEN):</strong>
                </div>
                <p className="holo-shout-text">
                  “OYE HERO! Stop clicking the mouse like a maniac and pretending to be in Matrix! The dal is boiling on the stove! Go to the market and bring ₹10 DHANIYA (Coriander) right now! And don't forget to ask for extra free green chillies (mirchi)!”
                </p>
              </div>

              {/* Step 1: Interactive Player Responses */}
              {roastStep === 'initial' && (
                <div className="holo-choices-box">
                  <span className="holo-choice-label">TRANSMIT YOUR RESPONSE:</span>
                  <div className="holo-choices-stack">
                    <button
                      type="button"
                      className="holo-choice-chip"
                      onClick={() =>
                        handlePlayerChoice(
                          'Mom, wait! I literally just bypassed a military-grade neural firewall!'
                        )
                      }
                    >
                      <ChevronRight size={14} />
                      <span>“Mom, wait! I literally just bypassed a military-grade neural firewall!”</span>
                    </button>

                    <button
                      type="button"
                      className="holo-choice-chip"
                      onClick={() =>
                        handlePlayerChoice(
                          'Can I finish this Easter egg first? I’m almost at the secret ending!'
                        )
                      }
                    >
                      <ChevronRight size={14} />
                      <span>“Can I finish this Easter egg first? I’m almost at the secret ending!”</span>
                    </button>

                    <button
                      type="button"
                      className="holo-choice-chip"
                      onClick={() =>
                        handlePlayerChoice(
                          'Did you say ₹10 or ₹20 dhaniya? And what if the vendor charges for mirchi?'
                        )
                      }
                    >
                      <ChevronRight size={14} />
                      <span>“Did you say ₹10 or ₹20 dhaniya? And what if the vendor charges for mirchi?”</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Supersonic Chappal Inbound Alert */}
              {roastStep === 'slipper' && (
                <div className="holo-slipper-alert">
                  <span className="holo-slipper-icon">🩴💨</span>
                  <div>
                    <strong className="holo-slipper-title">
                      TACTICAL FLYING CHAPPAL LAUNCHED
                    </strong>
                    <span className="holo-slipper-sub">
                      Velocity: Mach 3.4 • Heat-Seeking Guidance • Target: Back of Your Head
                    </span>
                  </div>
                </div>
              )}

              {/* Step 3: Deadpan Narrator Reality Check */}
              {roastStep === 'narrator' && (
                <div className="holo-narrator-box">
                  <div className="holo-badge amber">
                    <Terminal size={12} />
                    <span>NARRATOR // DEADPAN REALITY CHECK</span>
                  </div>
                  <blockquote className="holo-narrator-quote">
                    “You rotated 14 high-voltage spatial conduits.<br />
                    You calculated complex Manhattan network topologies.<br />
                    You spent 15 minutes feeling like an untouchable cyber ghost operative...<br /><br />
                    <strong style={{ color: '#fef08a' }}>
                      ...and yet, you still haven't bought the coriander. The dal is ruined. The chappal has achieved supersonic speed.
                    </strong>”
                  </blockquote>

                  <div className="holo-narrator-footer">
                    <button
                      type="button"
                      className="holo-action-btn amber-glow"
                      onClick={handleProceedToCertificate}
                    >
                      <Award size={16} />
                      <span>VIEW OFFICIAL HOLOGRAPHIC EVALUATION 📜</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* PHASE 4: 3D HOLOGRAPHIC CERTIFICATE OF ERRAND DISOBEDIENCE      */}
          {/* ============================================================== */}
          {phase === 'CERTIFICATE_ROAST' && (
            <div className="holo-certificate-plaque">
              {/* Certificate Header Banner */}
              <div className="holo-cert-top">
                <span className="holo-cert-crest">🌿🩴🌿</span>
                <span className="holo-cert-dept">
                  DEPARTMENT OF DOMESTIC HOUSEHOLD OPERATIONS & CYBER ARBITRAGE
                </span>
                <h1 className="holo-cert-title">
                  CERTIFICATE OF ERRAND DISOBEDIENCE
                </h1>
                <span className="holo-cert-sub">
                  FOR DISTINGUISHED CYBER PROCRASTINATION UNDER EXTREME CIRCUMSTANCES
                </span>
              </div>

              {/* Certificate Body */}
              <div className="holo-cert-body">
                <p className="holo-cert-intro">
                  This highly un-prestigious recognition is formally awarded to:
                </p>

                <div className="holo-cert-recipient">
                  THE "ELITE HACKER" WHO FORGOT THE DHANIYA
                </div>

                <p className="holo-cert-citation">
                  For spending fifteen consecutive minutes rotating three-dimensional laser switches,
                  bypassing fictional cTOS military servers, and feeling like Mr. Robot...
                  while completely neglecting a simple five-minute grocery trip to buy fresh coriander.
                </p>

                {/* 6-Card Cyber Stat Matrix */}
                <div className="holo-cert-grid">
                  <div className="holo-stat-tile">
                    <span className="stat-label">HACKING APTITUDE</span>
                    <strong className="stat-val" style={{ color: '#00f0ff' }}>
                      LEVEL 99 CYBER GHOST
                    </strong>
                  </div>

                  <div className="holo-stat-tile">
                    <span className="stat-label">MOTHER'S APPROVAL</span>
                    <strong className="stat-val" style={{ color: '#ef4444' }}>
                      -9,999 RESPECT
                    </strong>
                  </div>

                  <div className="holo-stat-tile">
                    <span className="stat-label">CORIANDER SECURED</span>
                    <strong className="stat-val" style={{ color: '#f59e0b' }}>
                      0 / 1 BUNCH
                    </strong>
                  </div>

                  <div className="holo-stat-tile">
                    <span className="stat-label">FREE GREEN CHILLIES</span>
                    <strong className="stat-val" style={{ color: '#ef4444' }}>
                      0 / 4 MIRCHI
                    </strong>
                  </div>

                  <div className="holo-stat-tile">
                    <span className="stat-label">SABZI STATUS</span>
                    <strong className="stat-val" style={{ color: '#ef4444' }}>
                      BURNED TO ASH
                    </strong>
                  </div>

                  <div className="holo-stat-tile">
                    <span className="stat-label">CHAPPAL THREAT LEVEL</span>
                    <strong className="stat-val" style={{ color: '#dc2626' }}>
                      DEFCON 1 (INBOUND)
                    </strong>
                  </div>
                </div>

                {/* Rubber Stamp of Disapproval */}
                <div className="holo-cert-stamp">
                  <span>CERTIFIED DHANIYA PROCRASTINATOR</span>
                  <small>AUTHORIZED BY MOM 🩴</small>
                </div>

                {/* Signatures */}
                <div className="holo-cert-signatures">
                  <div className="holo-sig-block">
                    <span className="sig-name">Mr. White Hat 💀</span>
                    <span className="sig-role">Lead Portfolio Developer & Survivor</span>
                  </div>
                  <div className="holo-sig-block">
                    <span className="sig-name">Mummy Ji 🩴</span>
                    <span className="sig-role">Supreme Kitchen Commander</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="holo-cert-actions">
                <button
                  type="button"
                  className="holo-action-btn green-glow"
                  onClick={() => {
                    playClickSound(1200);
                    onReturnToPortfolio?.();
                  }}
                >
                  <span>RETURN TO PORTFOLIO (BEFORE THE CHAPPAL HITS 🩴)</span>
                </button>
                <button
                  type="button"
                  className="holo-action-btn secondary"
                  onClick={() => {
                    playClickSound(1000);
                    onRestartEasterEgg?.();
                  }}
                >
                  <RotateCcw size={15} />
                  <span>DO IT AGAIN? (RISK MOTHER'S WRATH)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

/**
 * MASTER COMPONENT: SecretVaultRoom3D
 * Replaces old 2D modal with full in-world 3D scene & spatial holographic display!
 */
export default function SecretVaultRoom3D({
  isOpen,
  betrayalPhase,
  onPhaseChange,
  onInteractTerminal,
  onReturnToPortfolio,
  onRestartEasterEgg,
}) {
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();
  const wheelRef = useRef();
  const goldenLightRef = useRef();
  const [isChappalLaunched, setIsChappalLaunched] = useState(false);

  // Door opening animation
  useFrame((_, delta) => {
    const targetLeft = isOpen ? -1.35 : -0.52;
    const targetRight = isOpen ? 1.35 : 0.52;

    if (leftDoorRef.current) {
      leftDoorRef.current.position.x = THREE.MathUtils.damp(
        leftDoorRef.current.position.x,
        targetLeft,
        2.5,
        delta
      );
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.position.x = THREE.MathUtils.damp(
        rightDoorRef.current.position.x,
        targetRight,
        2.5,
        delta
      );
    }
    if (wheelRef.current && isOpen) {
      wheelRef.current.rotation.z += delta * 1.5;
    }
    if (goldenLightRef.current) {
      const targetIntensity = isOpen ? 4.5 : 0;
      goldenLightRef.current.intensity = THREE.MathUtils.damp(
        goldenLightRef.current.intensity,
        targetIntensity,
        3.0,
        delta
      );
    }
  });

  return (
    <group position={[-1.8, 1.4, -3.92]} name="SecretVaultRoom3D">
      {/* 1. Outer Steel Bulkhead Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.5, 2.3, 0.12]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.4}
          metalness={0.85}
        />
      </mesh>

      {/* Frame Chamfer Border with Hazard Stripes */}
      <mesh position={[0, 1.15, 0.07]}>
        <boxGeometry args={[2.5, 0.12, 0.05]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, -1.15, 0.07]}>
        <boxGeometry args={[2.5, 0.12, 0.05]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 2. Dual Armored Blast Doors */}
      {/* Left Blast Door */}
      <mesh ref={leftDoorRef} position={[-0.52, 0, 0.02]}>
        <boxGeometry args={[1.05, 2.0, 0.1]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Right Blast Door */}
      <mesh ref={rightDoorRef} position={[0.52, 0, 0.02]}>
        <boxGeometry args={[1.05, 2.0, 0.1]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Central Rotary Locking Wheel */}
      <group ref={wheelRef} position={[0, 0, 0.09]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.035, 16, 32]} />
          <meshStandardMaterial
            color={isOpen ? '#f59e0b' : '#64748b'}
            emissive={isOpen ? '#f59e0b' : '#000000'}
            emissiveIntensity={isOpen ? 1.5 : 0}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* 3. Golden Volumetric Light Spill */}
      <pointLight
        ref={goldenLightRef}
        position={[0, 0.2, -0.4]}
        color="#fbbf24"
        distance={6.5}
        intensity={0}
      />
      {isOpen && (
        <mesh position={[0, -1.0, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 2.0]} />
          <meshBasicMaterial
            color="#fbbf24"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 4. THE 3D INTERIOR VAULT CHAMBER ASSETS (Only revealed when open) */}
      {isOpen && (
        <>
          {/* Chamber Walls, Floor Grates & Overhead Bulb */}
          <SecretChamberArchitecture3D />

          {/* The Ridiculous Discovery Desk Cluster */}
          <group position={[0, -0.45, -0.7]}>
            {/* Folding Table */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.25, 0.038, 0.65]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
            {/* 4 Tubular Metal Folding Legs */}
            {[-0.56, 0.56].map((lx) =>
              [-0.26, 0.26].map((lz) => (
                <mesh key={`leg-${lx}-${lz}`} position={[lx, -0.28, lz]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.54, 8]} />
                  <meshStandardMaterial color="#64748b" metalness={0.8} />
                </mesh>
              ))
            )}

            {/* Chair with Unfolded Clothes Pile */}
            <group position={[0, -0.15, 0.42]}>
              {/* 5-Star Wheeled Base Stem */}
              <mesh position={[0, -0.25, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.32, 8]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} />
              </mesh>
              {/* Blue Seat Cushion */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.44, 0.05, 0.42]} />
                <meshStandardMaterial color="#1e40af" roughness={0.9} />
              </mesh>
              {/* Blue Backrest */}
              <mesh position={[0, 0.24, 0.2]}>
                <boxGeometry args={[0.4, 0.38, 0.04]} />
                <meshStandardMaterial color="#1e40af" roughness={0.9} />
              </mesh>
              {/* Laundry Clothes Pile */}
              <mesh position={[-0.06, 0.12, 0.04]} rotation={[0.1, 0.2, -0.1]}>
                <boxGeometry args={[0.34, 0.16, 0.28]} />
                <meshStandardMaterial color="#ef4444" roughness={0.9} />
              </mesh>
              <mesh position={[0.08, 0.18, 0.08]} rotation={[-0.2, 0.3, 0.1]}>
                <boxGeometry args={[0.26, 0.12, 0.22]} />
                <meshStandardMaterial color="#eab308" roughness={0.9} />
              </mesh>
            </group>

            {/* Laptop 3D Model */}
            <HackerLaptop3D
              onInteractTerminal={onInteractTerminal}
              isInteractive={betrayalPhase === 'TERMINAL_INTERACTIVE'}
            />

            {/* Steaming Maggi Bowl 3D */}
            <SteamingMaggiBowl3D />

            {/* Holy Bunch of Dhaniya, Mirchi & ₹10 Coin 3D */}
            <DhaniyaBundle3D />

            {/* Holographic Projector Pedestal 3D */}
            <HolographicProjectorPedestal3D />

            {/* Tactical Flying Indian Chappal (Hawai Slipper) 3D */}
            <TacticalChappal3D
              isLaunched={isChappalLaunched}
              onHit={() => {}}
            />

            {/* IN-WORLD 3D HOLOGRAPHIC UI (Replaces flat 2D screen takeovers!) */}
            {betrayalPhase && betrayalPhase !== 'NONE' && (
              <HolographicDisplay3D
                phase={betrayalPhase}
                onPhaseChange={onPhaseChange}
                onInteractTerminal={onInteractTerminal}
                onReturnToPortfolio={onReturnToPortfolio}
                onRestartEasterEgg={onRestartEasterEgg}
                onTriggerChappalFlight={() => setIsChappalLaunched(true)}
              />
            )}
          </group>
        </>
      )}
    </group>
  );
}
