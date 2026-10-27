import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  Award,
  ChevronRight,
  RotateCcw,
  Terminal,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  playRecordScratch,
  playSlipperWhoosh,
  playMomGong,
  playDhaniyaFanfare,
  playCorporateClick,
  playSadPunchline,
} from './easterEggAudio.js';
import { playClickSound } from '../../utils/audio.js';

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
 * 3D Floating Dust Motes in the Bunker Air
 */
function BunkerAtmosphericDust3D({ count = 25 }) {
  const pointsRef = useRef();

  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 5.5,
      y: 0.4 + Math.random() * 2.5,
      z: (Math.random() - 0.5) * 5.5,
      speedY: 0.02 + Math.random() * 0.03,
      swirl: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (!pointsRef.current) return;
    particles.forEach((p, i) => {
      p.y += p.speedY * delta;
      if (p.y > 3.0) p.y = 0.4;
      const mesh = pointsRef.current.children[i];
      if (mesh) {
        mesh.position.set(
          p.x + Math.sin(time * 0.5 + p.swirl) * 0.08,
          p.y,
          p.z + Math.cos(time * 0.5 + p.swirl) * 0.08
        );
      }
    });
  });

  return (
    <group ref={pointsRef}>
      {particles.map((p, i) => (
        <mesh key={`dust-${i}`} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * 3D Animated Steam Particles rising from the hot Maggi noodles bowl
 */
function SteamParticles3D({ count = 12 }) {
  const particlesRef = useRef([]);

  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
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
    <group position={[0.35, 0.74, 0.05]}>
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
 * Launches in a supersonic 3D arc trajectory toward camera when Mom is provoked!
 */
function TacticalChappal3D({ isLaunched, onHit }) {
  const groupRef = useRef();
  const trailRef = useRef();
  const flightProgress = useRef(0);
  const hasTriggeredHit = useRef(false);

  // Trajectory points: from rear ceiling of bunker -> swoops over table -> towards player camera!
  const startPos = useMemo(() => new THREE.Vector3(0.45, 1.85, -1.0), []);
  const midPos = useMemo(() => new THREE.Vector3(0.18, 1.25, 0.0), []);
  const endPos = useMemo(() => new THREE.Vector3(-0.05, 1.08, 0.65), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    if (!isLaunched) {
      // Idle hovering menace near ceiling
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
      flightProgress.current = Math.min(1.0, flightProgress.current + delta * 1.35);
      const t = flightProgress.current;

      const x = (1 - t) * (1 - t) * startPos.x + 2 * (1 - t) * t * midPos.x + t * t * endPos.x;
      const y = (1 - t) * (1 - t) * startPos.y + 2 * (1 - t) * t * midPos.y + t * t * endPos.y;
      const z = (1 - t) * (1 - t) * startPos.z + 2 * (1 - t) * t * midPos.z + t * t * endPos.z;

      groupRef.current.position.set(x, y, z);
      groupRef.current.rotation.x += delta * 26;
      groupRef.current.rotation.y += delta * 20;
      groupRef.current.rotation.z += delta * 34;

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
    <group ref={groupRef} position={[0.4, 1.8, -0.6]}>
      {/* Slipper Rubber Sole (Classic Blue & White Hawai) */}
      <mesh position={[0, -0.006, 0]}>
        <boxGeometry args={[0.095, 0.012, 0.22]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[0.092, 0.01, 0.218]} />
        <meshStandardMaterial color="#0284c7" roughness={0.5} />
      </mesh>

      {/* Classic Blue Y-Strap */}
      <group position={[0, 0.016, 0.02]}>
        <mesh position={[-0.026, 0.014, -0.03]} rotation={[0.4, -0.3, 0]}>
          <boxGeometry args={[0.015, 0.006, 0.09]} />
          <meshStandardMaterial color="#0369a1" roughness={0.4} />
        </mesh>
        <mesh position={[0.026, 0.014, -0.03]} rotation={[0.4, 0.3, 0]}>
          <boxGeometry args={[0.015, 0.006, 0.09]} />
          <meshStandardMaterial color="#0369a1" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.012, 0.045]}>
          <cylinderGeometry args={[0.004, 0.004, 0.025, 8]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
      </group>

      {/* Aerodynamic Supersonic Slipstream Trail */}
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
    <group position={[-0.38, 0.745, 0.08]}>
      {/* Bundled Green Stems */}
      <mesh rotation={[0, 0.3, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.016, 0.16, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.6} />
      </mesh>

      {/* Red Rubber Band */}
      <mesh position={[0.02, 0, 0]} rotation={[0, 0.3, Math.PI / 2]}>
        <torusGeometry args={[0.018, 0.004, 8, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </mesh>

      {/* Leaf Clusters */}
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

      {/* Fresh Indian Green Chillies (Mirchi) 🌶️ */}
      <group position={[0.12, 0.008, 0.04]} rotation={[0, 0.6, 0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.008, 0.09, 8]} />
          <meshStandardMaterial color="#15803d" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0, -0.048]} rotation={[0.3, 0, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.018, 6]} />
          <meshStandardMaterial color="#166534" />
        </mesh>
      </group>

      <group position={[0.13, 0.008, -0.03]} rotation={[0, -0.4, -0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.007, 0.08, 8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>

      {/* Golden ₹10 Coin on the Desk */}
      <group position={[0.02, 0.005, 0.12]} rotation={[-Math.PI / 2, 0, 0.4]}>
        <mesh>
          <cylinderGeometry args={[0.028, 0.028, 0.004, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} roughness={0.2} />
        </mesh>
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
    <group position={[0.35, 0.74, 0.05]}>
      {/* Ceramic Bowl */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.05, 0.075, 18]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.038, 0]}>
        <torusGeometry args={[0.08, 0.004, 8, 24]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.028, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.015, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.5} />
      </mesh>
      {[-0.03, 0.02, -0.01].map((ox, i) => (
        <mesh key={`fleck-${i}`} position={[ox, 0.037, ox * 0.7]}>
          <cylinderGeometry args={[0.004, 0.004, 0.002, 6]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
      ))}
      {/* Fork */}
      <group position={[0.02, 0.075, 0]} rotation={[0.4, 0, -0.2]}>
        <mesh>
          <boxGeometry args={[0.008, 0.13, 0.003]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
      <SteamParticles3D count={10} />
    </group>
  );
}

/**
 * In-Screen Laptop Operating System & Terminal Display
 * Embedded directly onto the 3D laptop monitor using @react-three/drei <Html transform center>
 * Distance factor 0.2105 maps a 760px x 494px viewport onto the 0.40m x 0.26m display plane!
 */
function LaptopScreenOS({
  phase,
  isZoomed,
  onToggleZoom,
  onPhaseChange,
  onInteractTerminal,
  onReturnToPortfolio,
  onRestartEasterEgg,
  onTriggerChappalFlight,
}) {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [roastStep, setRoastStep] = useState('initial'); // 'initial' | 'slipper' | 'narrator'
  const dialogueSpokenRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  return (
    <div
      className="laptop-screen-viewport"
      onWheel={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* 1. TOP OS DESKTOP STATUS BAR */}
      <div className="laptop-os-topbar">
        <div className="os-topbar-left">
          <span className="os-led-green" />
          <span className="os-title">ctOS AIR-GAP WORKSTATION // ROOT_TERMINAL</span>
        </div>
        <div className="os-topbar-right">
          <button
            type="button"
            className="os-zoom-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleZoom?.();
            }}
            title={isZoomed ? "Step back to chair view (Esc)" : "Zoom in on laptop monitor (Z)"}
          >
            {isZoomed ? "🪑 VIEW ROOM (ESC)" : "🔍 ZOOM SCREEN (Z)"}
          </button>
          <span className="os-status-item">AIR-GAPPED</span>
          <span className="os-status-item">⚡ 100%</span>
        </div>
      </div>

      {/* 2. LAPTOP SCREEN CONTENT AREA */}
      <div className="laptop-os-content">
        {/* PHASE 1: BOOTLOADER / VAULT OPENING */}
        {phase === 'VAULT_OPENING' && (
          <div className="laptop-boot-view">
            <div className="laptop-boot-header">
              <Zap size={14} className="os-pulse-icon" />
              <span>AIR-GAP HARDWARE INTERFACE INITIALIZED</span>
            </div>
            <pre className="laptop-boot-terminal">
{`> ctOS SECURE BOOTLOADER v4.9.2
> INFILTRATION LEVEL: DEEPEST SANCTUM (SUB-LEVEL 03)
> AIR-GAPPED HARDWARE TERMINAL: DETECTED & LINKED
> DECRYPTING LOCAL TERMINAL SESSION...
> ACCESSING THE ULTIMATE CORPORATE / FACILITY CLASSIFIED SECRETS...
> [ OK ] ROOT PRIVILEGES GRANTED. SESSION ACTIVE.`}
            </pre>
            <div className="laptop-boot-progress-bar">
              <div className="laptop-boot-progress-fill" />
            </div>
          </div>
        )}

        {/* PHASE 2: TERMINAL INTERACTIVE PROMPT */}
        {phase === 'TERMINAL_INTERACTIVE' && (
          <div className="laptop-interactive-view" onClick={onInteractTerminal}>
            <div className="laptop-sanctum-banner">
              <Terminal size={14} />
              <span>CLASSIFIED SANCTUM BREACH CONFIRMED</span>
            </div>
            <h2 className="laptop-screen-title">THE ULTIMATE SECRET</h2>
            <p className="laptop-screen-desc">
              You bypassed 47 security nodes, rotated high-voltage lasers, and reached the legendary vault.
              Behind the impenetrable titanium doors sits an unmade bed, laundry, cold Maggi noodles...
              and this very computer.
            </p>
            <button
              type="button"
              className="laptop-screen-action-btn green-pulse"
              onClick={(e) => {
                e.stopPropagation();
                onInteractTerminal?.();
              }}
            >
              <Zap size={15} />
              <span>ACCESS CLASSIFIED REVELATION [CLICK HERE OR PRESS E]</span>
            </button>
            <div className="laptop-zoom-hint">
              <span>Tip: Click 🔍 ZOOM SCREEN button or press Z to focus up close</span>
            </div>
          </div>
        )}

        {/* PHASE 3: MOM CALLING & DEADPAN REALITY CHECK */}
        {phase === 'MOM_REVEAL' && (
          <div className="laptop-dialogue-view">
            <div className="laptop-alert-bar">
              <div className="laptop-alert-badge">
                <Volume2 size={13} className="os-pulse-icon" />
                <span>INCOMING HIGH-PRIORITY TRANSMISSION // KITCHEN INTERCOM</span>
              </div>
              <div className="laptop-audio-eq">
                <span className="eq-bar bar-1" />
                <span className="eq-bar bar-2" />
                <span className="eq-bar bar-3" />
                <span className="eq-bar bar-4" />
              </div>
            </div>

            <div className="laptop-mom-shout-card">
              <div className="laptop-speaker-label">
                <span className="speaker-avatar">👵🏽</span>
                <strong>MOM (SHOUTING FROM THE KITCHEN):</strong>
              </div>
              <p className="laptop-mom-shout-text">
                “OYE HERO! Stop clicking the mouse like a maniac and pretending to be in Matrix! The dal is boiling on the stove! Go to the market and bring ₹10 DHANIYA (Coriander) right now! And don't forget to ask for extra free green chillies (mirchi)!”
              </p>
            </div>

            {roastStep === 'initial' && (
              <div className="laptop-choices-section">
                <span className="laptop-choice-heading">TRANSMIT YOUR RESPONSE:</span>
                <div className="laptop-choices-list">
                  <button
                    type="button"
                    className="laptop-choice-btn"
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
                    className="laptop-choice-btn"
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
                    className="laptop-choice-btn"
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

            {roastStep === 'slipper' && (
              <div className="laptop-slipper-alert">
                <span className="laptop-slipper-emoji">🩴💨</span>
                <div>
                  <strong className="laptop-slipper-title">TACTICAL FLYING CHAPPAL LAUNCHED</strong>
                  <span className="laptop-slipper-sub">
                    Velocity: Mach 3.4 • Heat-Seeking Guidance • Target: Back of Your Head
                  </span>
                </div>
              </div>
            )}

            {roastStep === 'narrator' && (
              <div className="laptop-narrator-card">
                <div className="laptop-narrator-badge">
                  <Terminal size={11} />
                  <span>NARRATOR // DEADPAN REALITY CHECK</span>
                </div>
                <p className="laptop-narrator-quote">
                  “You rotated 14 high-voltage conduits. You calculated Manhattan network topologies.
                  You spent 15 minutes feeling like an untouchable cyber ghost...<br />
                  <strong style={{ color: '#fef08a' }}>
                    ...and yet, you still haven't bought the coriander. The dal is ruined. The chappal is supersonic.
                  </strong>”
                </p>
                <button
                  type="button"
                  className="laptop-screen-action-btn amber-glow"
                  onClick={handleProceedToCertificate}
                >
                  <Award size={14} />
                  <span>VIEW OFFICIAL HOLOGRAPHIC EVALUATION 📜</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* PHASE 4: OFFICIAL CERTIFICATE */}
        {phase === 'CERTIFICATE_ROAST' && (
          <div className="laptop-certificate-view">
            <div className="laptop-cert-header">
              <span className="laptop-cert-crest">🌿🩴🌿</span>
              <span className="laptop-cert-dept">
                DEPARTMENT OF DOMESTIC HOUSEHOLD OPERATIONS & CYBER ARBITRAGE
              </span>
              <h1 className="laptop-cert-title">CERTIFICATE OF ERRAND DISOBEDIENCE</h1>
              <span className="laptop-cert-sub">
                FOR DISTINGUISHED CYBER PROCRASTINATION UNDER EXTREME CIRCUMSTANCES
              </span>
            </div>

            <div className="laptop-cert-recipient">
              AWARDED TO: THE "ELITE HACKER" WHO FORGOT THE DHANIYA
            </div>

            <p className="laptop-cert-body">
              For spending 15 minutes rotating 3D laser switches and feeling like Mr. Robot...
              while completely neglecting a 5-minute grocery trip to buy fresh coriander.
            </p>

            <div className="laptop-cert-grid">
              <div className="laptop-stat-cell">
                <span className="stat-label">HACKING APTITUDE</span>
                <strong className="stat-val" style={{ color: '#00f0ff' }}>LEVEL 99 CYBER GHOST</strong>
              </div>
              <div className="laptop-stat-cell">
                <span className="stat-label">MOTHER'S APPROVAL</span>
                <strong className="stat-val" style={{ color: '#ef4444' }}>-9,999 RESPECT</strong>
              </div>
              <div className="laptop-stat-cell">
                <span className="stat-label">CORIANDER SECURED</span>
                <strong className="stat-val" style={{ color: '#f59e0b' }}>0 / 1 BUNCH</strong>
              </div>
              <div className="laptop-stat-cell">
                <span className="stat-label">FREE GREEN CHILLIES</span>
                <strong className="stat-val" style={{ color: '#ef4444' }}>0 / 4 MIRCHI</strong>
              </div>
              <div className="laptop-stat-cell">
                <span className="stat-label">SABZI STATUS</span>
                <strong className="stat-val" style={{ color: '#ef4444' }}>BURNED TO ASH</strong>
              </div>
              <div className="laptop-stat-cell">
                <span className="stat-label">CHAPPAL THREAT LEVEL</span>
                <strong className="stat-val" style={{ color: '#dc2626' }}>DEFCON 1 (INBOUND)</strong>
              </div>
            </div>

            <div className="laptop-cert-footer">
              <div className="laptop-cert-stamp">
                <span>CERTIFIED DHANIYA PROCRASTINATOR • AUTHORIZED BY MOM 🩴</span>
              </div>
              <div className="laptop-cert-actions">
                <button
                  type="button"
                  className="laptop-screen-action-btn green-pulse"
                  onClick={() => {
                    playClickSound(1200);
                    onReturnToPortfolio?.();
                  }}
                >
                  <span>RETURN TO PORTFOLIO (BEFORE THE CHAPPAL HITS 🩴)</span>
                </button>
                <button
                  type="button"
                  className="laptop-screen-action-btn secondary"
                  onClick={() => {
                    playClickSound(1000);
                    onRestartEasterEgg?.();
                  }}
                >
                  <RotateCcw size={13} />
                  <span>DO IT AGAIN? (RISK MOTHER'S WRATH)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 3D Gaming / Hacker Laptop with Backlit Keyboard & Glowing Screen
 * Hosts the interactive LaptopScreenOS directly on its display plane
 */
function HackerLaptop3D({
  onInteractTerminal,
  isInteractive = false,
  betrayalPhase,
  isLaptopZoomed,
  onToggleLaptopZoom,
  onPhaseChange,
  onReturnToPortfolio,
  onRestartEasterEgg,
  onTriggerChappalFlight,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={[0, 0.73, 0]}
      onClick={(e) => {
        if (isInteractive) {
          e.stopPropagation();
          onInteractTerminal?.();
        } else if (betrayalPhase && betrayalPhase !== 'NONE' && !isLaptopZoomed) {
          e.stopPropagation();
          onToggleLaptopZoom?.();
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Laptop Base */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.44, 0.018, 0.3]} />
        <meshStandardMaterial
          color={hovered ? '#1e293b' : '#0f172a'}
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      {/* Backlit Keyboard Deck */}
      <mesh position={[0, 0.02, -0.015]}>
        <planeGeometry args={[0.36, 0.15]} />
        <meshStandardMaterial
          color="#0284c7"
          emissive="#00f0ff"
          emissiveIntensity={1.8}
          roughness={0.3}
        />
      </mesh>

      {/* Trackpad */}
      <mesh position={[0, 0.02, 0.09]}>
        <planeGeometry args={[0.13, 0.075]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Open Screen Lid (Angled at 115°) */}
      <group position={[0, 0.02, -0.145]} rotation={[-0.38, 0, 0]}>
        {/* Outer Bezel Lid */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.44, 0.3, 0.014]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Display Backing Surface */}
        <mesh position={[0, 0.15, 0.008]}>
          <planeGeometry args={[0.4, 0.26]} />
          <meshStandardMaterial
            color="#020617"
            roughness={0.2}
          />
        </mesh>

        {/* Interactive In-Screen OS Rendered Directly on Laptop Monitor */}
        {betrayalPhase && betrayalPhase !== 'NONE' && (
          <group position={[0, 0.15, 0.012]}>
            <Html
              transform
              center
              distanceFactor={0.2105}
              position={[0, 0, 0]}
              zIndexRange={[250, 0]}
            >
              <LaptopScreenOS
                phase={betrayalPhase}
                isZoomed={isLaptopZoomed}
                onToggleZoom={onToggleLaptopZoom}
                onPhaseChange={onPhaseChange}
                onInteractTerminal={onInteractTerminal}
                onReturnToPortfolio={onReturnToPortfolio}
                onRestartEasterEgg={onRestartEasterEgg}
                onTriggerChappalFlight={onTriggerChappalFlight}
              />
            </Html>
          </group>
        )}
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
    <group position={[0, 0.74, -0.18]}>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.014, 8, 32]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={2.5}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.009, 8, 24]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={2.2}
        />
      </mesh>
      {/* Upward Volumetric Hologram Cone */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.4, 0.14, 0.8, 16, 1, true]} />
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
 * Complete Standalone 360° Underground Bunker Architecture
 */
function BunkerRoomArchitecture3D({ isOpen }) {
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();
  const wheelRef = useRef();
  const fanRef = useRef();
  const ledRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    // Armored blast door slide
    const targetLeft = isOpen ? -1.45 : -0.55;
    const targetRight = isOpen ? 1.45 : 0.55;

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
    if (fanRef.current) {
      fanRef.current.rotation.z += delta * 4;
    }
    if (ledRef.current) {
      ledRef.current.visible = Math.sin(time * 8) > 0;
    }
  });

  return (
    <group name="BunkerRoomArchitecture">
      {/* 1. Heavy Industrial Floor Plate */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.0, 7.0]} />
        <meshStandardMaterial color="#080e1a" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* Floor Hazard Safety Stripes (Black & Yellow Perimeter) */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.9, 3.2, 4]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Recessed Sub-floor Emerald Green Vents */}
      {[-1.6, -0.8, 0.8, 1.6].map((vx, idx) => (
        <group key={`vent-${idx}`} position={[vx, 0.005, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.25, 4.2]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.25} />
          </mesh>
          <pointLight
            position={[0, 0.08, 0]}
            color="#10b981"
            distance={1.6}
            intensity={0.6}
          />
        </group>
      ))}

      {/* 2. Reinforced Concrete Bunker Bulkheads (4 Walls) */}
      {/* Back Wall with Vault Door (z = -3.2) */}
      <group position={[0, 1.6, -3.2]}>
        {/* Wall Slab */}
        <mesh>
          <boxGeometry args={[7.0, 3.2, 0.2]} />
          <meshStandardMaterial color="#070c18" roughness={0.85} metalness={0.3} />
        </mesh>
        {/* Vault Frame */}
        <mesh position={[0, 0, 0.11]}>
          <boxGeometry args={[3.2, 2.6, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Sliding Blast Doors */}
        <mesh ref={leftDoorRef} position={[-0.55, 0, 0.15]}>
          <boxGeometry args={[1.3, 2.4, 0.1]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh ref={rightDoorRef} position={[0.55, 0, 0.15]}>
          <boxGeometry args={[1.3, 2.4, 0.1]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Rotary Locking Wheel */}
        <group ref={wheelRef} position={[0, 0, 0.22]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.26, 0.04, 16, 32]} />
            <meshStandardMaterial
              color={isOpen ? '#f59e0b' : '#64748b'}
              emissive={isOpen ? '#f59e0b' : '#000000'}
              emissiveIntensity={isOpen ? 1.8 : 0}
              metalness={0.9}
            />
          </mesh>
        </group>
        {/* Golden Light Spill from Vault Breach */}
        <pointLight
          position={[0, 0, 0.4]}
          color="#fbbf24"
          distance={6.5}
          intensity={isOpen ? 4.5 : 0}
        />
      </group>

      {/* Left Wall with Server Racks (x = -3.2) */}
      <group position={[-3.2, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[7.0, 3.2, 0.2]} />
          <meshStandardMaterial color="#070c18" roughness={0.85} metalness={0.3} />
        </mesh>
        {/* Server Cabinets */}
        {[-1.5, 0, 1.5].map((sx, idx) => (
          <group key={`srv-${idx}`} position={[sx, 0, 0.15]}>
            <mesh>
              <boxGeometry args={[1.1, 2.5, 0.35]} />
              <meshStandardMaterial color="#0b111e" roughness={0.4} metalness={0.85} />
            </mesh>
            {/* Blinking LEDs */}
            <mesh position={[0.4, 0.8, 0.18]} ref={idx === 0 ? ledRef : undefined}>
              <boxGeometry args={[0.04, 0.04, 0.02]} />
              <meshBasicMaterial color="#00f0ff" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Right Wall with Industrial Vent & Pipes (x = 3.2) */}
      <group position={[3.2, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[7.0, 3.2, 0.2]} />
          <meshStandardMaterial color="#070c18" roughness={0.85} metalness={0.3} />
        </mesh>
        {/* Large Industrial Vent Fan */}
        <group position={[0, 0.4, 0.15]}>
          <mesh>
            <cylinderGeometry args={[0.65, 0.65, 0.15, 24]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} />
          </mesh>
          {/* Fan Blades */}
          <group ref={fanRef} position={[0, 0, 0.09]}>
            {[0, 1, 2, 3].map((b) => (
              <mesh key={`blade-${b}`} rotation={[0, 0, (b * Math.PI) / 2]}>
                <boxGeometry args={[0.16, 1.1, 0.015]} />
                <meshStandardMaterial color="#64748b" metalness={0.9} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* Front Wall (z = 3.2) */}
      <group position={[0, 1.6, 3.2]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <boxGeometry args={[7.0, 3.2, 0.2]} />
          <meshStandardMaterial color="#070c18" roughness={0.85} metalness={0.3} />
        </mesh>
      </group>

      {/* 3. High Industrial Ceiling & I-Beams (y = 3.2) */}
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.0, 7.0]} />
        <meshStandardMaterial color="#050a14" roughness={0.9} metalness={0.2} />
      </mesh>
      {/* Structural I-Beams */}
      {[-1.8, 0, 1.8].map((bx, idx) => (
        <mesh key={`beam-${idx}`} position={[bx, 3.12, 0]}>
          <boxGeometry args={[0.18, 0.16, 6.8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} />
        </mesh>
      ))}

      {/* 4. Overhead Industrial Hanging Cage Bulb */}
      <group position={[0, 2.3, 0]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.9, 6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#fef08a"
            emissiveIntensity={4.8}
          />
        </mesh>
        {/* Wire Cage */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.12, 8, 1, true]} />
          <meshBasicMaterial color="#eab308" wireframe />
        </mesh>
        {/* Dedicated Tungsten Point Light on the Table */}
        <pointLight
          position={[0, -0.05, 0]}
          color="#fef08a"
          intensity={3.2}
          distance={6.0}
        />
      </group>
    </group>
  );
}

/**
 * MASTER COMPONENT: SecretVaultRoom3D
 * The Standalone Dedicated 360° Underground Bunker Environment
 */
export default function SecretVaultRoom3D({
  isOpen = true,
  betrayalPhase,
  isLaptopZoomed = false,
  onToggleLaptopZoom,
  onPhaseChange,
  onInteractTerminal,
  onReturnToPortfolio,
  onRestartEasterEgg,
}) {
  const [isChappalLaunched, setIsChappalLaunched] = useState(false);

  return (
    <group position={[0, 0, 0]} name="SecretVaultRoom3D">
      {/* 1. Standalone 360° Bunker Room Architecture & Lighting */}
      <BunkerRoomArchitecture3D isOpen={isOpen} />

      {/* 2. Atmospheric Cyber Dust Motes Floating in Bunker */}
      <BunkerAtmosphericDust3D count={25} />

      {/* 3. The Ridiculous Discovery Desk Cluster (Centered at [0, 0, 0]) */}
      <group position={[0, 0, 0]}>
        {/* Melamine Folding Table */}
        <mesh position={[0, 0.70, 0]}>
          <boxGeometry args={[1.35, 0.04, 0.7]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
        </mesh>
        {/* Metal Tubular Legs */}
        {[-0.6, 0.6].map((lx) =>
          [-0.28, 0.28].map((lz) => (
            <mesh key={`leg-${lx}-${lz}`} position={[lx, 0.35, lz]}>
              <cylinderGeometry args={[0.016, 0.016, 0.7, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} />
            </mesh>
          ))
        )}

        {/* First-Person Seated Ergonomic Office Chair */}
        {/* Player eye camera is positioned directly above seat at [0, 1.10, 0.52] */}
        <group position={[0, 0, 0.52]}>
          {/* Hydraulic Gas Lift & Base */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.024, 0.024, 0.44, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* 5-Star Caster Spider Base on Floor */}
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i * Math.PI * 2) / 5;
            return (
              <mesh
                key={`caster-leg-${i}`}
                position={[Math.sin(angle) * 0.22, 0.035, Math.cos(angle) * 0.22]}
                rotation={[0, angle, 0]}
              >
                <boxGeometry args={[0.035, 0.02, 0.24]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
            );
          })}

          {/* Ergonomic Blue Padded Seat Cushion (Under the seated player) */}
          <mesh position={[0, 0.47, 0]}>
            <boxGeometry args={[0.50, 0.08, 0.48]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
          </mesh>

          {/* Left Armrest (Framing the player's lower-left peripheral view) */}
          <group position={[-0.28, 0.66, -0.02]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.30, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.075, 0.032, 0.26]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
          </group>

          {/* Right Armrest (Framing the player's lower-right peripheral view) */}
          <group position={[0.28, 0.66, -0.02]}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.014, 0.014, 0.30, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.075, 0.032, 0.26]} />
              <meshStandardMaterial color="#0f172a" roughness={0.5} />
            </mesh>
          </group>

          {/* Chair Backrest (Positioned BEHIND the seated camera at z = 0.26 relative to chair, i.e. world z = 0.78) */}
          <mesh position={[0, 0.88, 0.26]}>
            <boxGeometry args={[0.44, 0.54, 0.045]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.8} />
          </mesh>
        </group>

        {/* Unfolded Laundry Pile on Side Stool (Sitting beside the desk on the left) */}
        <group position={[-0.85, 0, 0.22]}>
          <mesh position={[0, 0.20, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.40, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Clothes Pile (Red, Yellow, Sky Blue) */}
          <mesh position={[-0.03, 0.46, 0.02]} rotation={[0.1, 0.3, -0.1]}>
            <boxGeometry args={[0.32, 0.14, 0.28]} />
            <meshStandardMaterial color="#ef4444" roughness={0.9} />
          </mesh>
          <mesh position={[0.04, 0.53, -0.02]} rotation={[-0.2, 0.4, 0.15]}>
            <boxGeometry args={[0.26, 0.12, 0.24]} />
            <meshStandardMaterial color="#eab308" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.59, 0.03]} rotation={[0.05, -0.2, 0.1]}>
            <boxGeometry args={[0.20, 0.10, 0.20]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.9} />
          </mesh>
        </group>

        {/* 3D Laptop */}
        <HackerLaptop3D
          onInteractTerminal={onInteractTerminal}
          isInteractive={betrayalPhase === 'TERMINAL_INTERACTIVE'}
          betrayalPhase={betrayalPhase}
          isLaptopZoomed={isLaptopZoomed}
          onToggleLaptopZoom={onToggleLaptopZoom}
          onPhaseChange={onPhaseChange}
          onReturnToPortfolio={onReturnToPortfolio}
          onRestartEasterEgg={onRestartEasterEgg}
          onTriggerChappalFlight={() => setIsChappalLaunched(true)}
        />

        {/* 3D Steaming Maggi Ramen Bowl */}
        <SteamingMaggiBowl3D />

        {/* 3D Holy Bunch of Dhaniya, Mirchi & ₹10 Coin */}
        <DhaniyaBundle3D />

        {/* 3D Holographic Projector Pedestal */}
        <HolographicProjectorPedestal3D />

        {/* 3D Tactical Flying Indian Chappal (Hawai Slipper) */}
        <TacticalChappal3D
          isLaunched={isChappalLaunched}
          onHit={() => {}}
        />

        {/* Interactive In-Screen OS rendered directly on laptop monitor above */}
      </group>
    </group>
  );
}
