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
  playPressureCookerWhistle,
  playSarcasticTrombone,
  playDramaticVineBoom,
  playMomSlipperSmack,
  playRejectionBuzzer,
  playHostileShock,
  playCashRegister,
  playConcreteThud,
  playMemeSwitchSound,
  playLockRelease,
} from './easterEggAudio.js';
import {
  playMomInitialCall,
  playMomRetortFirewall,
  playMomRetortBlinkit,
  playMomRetortMirchi,
  playMomRetortLinkedIn,
  playMomRetortBulk,
  playNarratorPunchline,
  playMomScoldingReplay,
  playIconRootAudio,
  playIconFirewallAudio,
  playIconDhaniyaAudio,
  playIconMaggiAudio,
  playIconMemesAudio,
  playIconSharmaAudio,
  playIconDictAudio,
  playCertOfficialReading,
  playCertStatHack,
  playCertStatRespect,
  playCertStatCoriander,
  playCertStatMirchi,
  playCertStatSabzi,
  playCertStatChappal,
  stopAllSpeech,
} from './sarcasticVoiceEngine.js';
import { playClickSound } from '../../utils/audio.js';

// Pre-allocated single geometries & materials for 60FPS lock & zero memory churn
const _sharedDustGeo = new THREE.SphereGeometry(0.012, 6, 6);
const _sharedDustMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.35 });

const _sharedSteamGeo = new THREE.SphereGeometry(1, 8, 8);
const _sharedSteamMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.25, depthWrite: false });

/**
 * 3D Floating Dust Motes in the Bunker Air (60FPS Optimized)
 */
function BunkerAtmosphericDust3D({ count = 25 }) {
  const pointsRef = useRef();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveCount = isMobile ? 12 : count;

  const particles = useMemo(() => {
    return Array.from({ length: effectiveCount }).map(() => ({
      x: (Math.random() - 0.5) * 5.5,
      y: 0.4 + Math.random() * 2.5,
      z: (Math.random() - 0.5) * 5.5,
      speedY: 0.02 + Math.random() * 0.03,
      swirl: Math.random() * Math.PI * 2,
    }));
  }, [effectiveCount]);

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
        <mesh
          key={`dust-${i}`}
          position={[p.x, p.y, p.z]}
          geometry={_sharedDustGeo}
          material={_sharedDustMat}
        />
      ))}
    </group>
  );
}

/**
 * 3D Animated Steam Particles rising from the hot Maggi noodles bowl
 */
function SteamParticles3D({ count = 12 }) {
  const particlesRef = useRef([]);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const effectiveCount = isMobile ? 6 : count;

  const particles = useMemo(() => {
    return Array.from({ length: effectiveCount }).map(() => ({
      x: (Math.random() - 0.5) * 0.08,
      y: 0.04 + Math.random() * 0.16,
      z: (Math.random() - 0.5) * 0.08,
      speedY: 0.06 + Math.random() * 0.07,
      swirlSpeed: 1.5 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      scale: 0.012 + Math.random() * 0.015,
    }));
  }, [effectiveCount]);

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
          geometry={_sharedSteamGeo}
          material={_sharedSteamMat}
        />
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
 * Displays a realistic cyber OS desktop with shortcut icons, taskbar, centered application window,
 * interactive desktop apps, and peak sarcasm voice acting!
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
  isExpandedView = false,
  onToggleExpandedView,
}) {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [momRetortText, setMomRetortText] = useState('');
  const [roastStep, setRoastStep] = useState('initial'); // 'initial' | 'mom_retort' | 'slipper' | 'narrator'
  const [activeDesktopApp, setActiveDesktopApp] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [memeIndex, setMemeIndex] = useState(0);

  // Dedicated handlers for opening desktop shortcut apps with bespoke audio & voice line
  const handleOpenDesktopApp = (appId) => {
    stopAllSpeech();
    setActiveDesktopApp(appId);

    switch (appId) {
      case 'root':
        playRejectionBuzzer();
        playIconRootAudio();
        break;
      case 'firewall':
        playHostileShock();
        playIconFirewallAudio();
        break;
      case 'dhaniya':
        playCashRegister();
        playIconDhaniyaAudio();
        break;
      case 'maggi':
        playConcreteThud();
        playIconMaggiAudio();
        break;
      case 'memes':
        playDramaticVineBoom();
        playIconMemesAudio();
        break;
      case 'sharma':
        playSarcasticTrombone();
        playIconSharmaAudio();
        break;
      case 'dictionary':
        playLockRelease();
        playIconDictAudio();
        break;
      default:
        playCorporateClick();
        break;
    }
  };

  const replayAppVoice = (appId) => {
    stopAllSpeech();
    switch (appId) {
      case 'root':
        playRejectionBuzzer();
        playIconRootAudio();
        break;
      case 'firewall':
        playHostileShock();
        playIconFirewallAudio();
        break;
      case 'dhaniya':
        playCashRegister();
        playIconDhaniyaAudio();
        break;
      case 'maggi':
        playConcreteThud();
        playIconMaggiAudio();
        break;
      case 'memes':
        playDramaticVineBoom();
        playIconMemesAudio();
        break;
      case 'sharma':
        playSarcasticTrombone();
        playIconSharmaAudio();
        break;
      case 'dictionary':
        playLockRelease();
        playIconDictAudio();
        break;
      default:
        break;
    }
  };
  const dialogueSpokenRef = useRef(false);

  const MEME_COLLECTION = [
    {
      title: "EXPECTATION VS REALITY",
      top: "WHEN YOU SPEND 3 HOURS INFILTRATING A CLASSIFIED FACILITY",
      expected: "🕶️ What you thought: Hollywood cyber ghost sipping black coffee in the dark",
      reality: "🩴 What actually happened: Mother chasing you around dining table with Hawai slipper",
      punchline: "TASK FAILED: ₹10 Coriander Not Secured"
    },
    {
      title: "CYBERSECURITY SEVERITY MATRIX",
      top: "THREAT LEVEL ASSESSMENT AT HOME",
      expected: "🟢 Level 1: Foreign state-sponsored DDoS (Ignored)",
      reality: "🔴 Level 99: Mom shouting your legal full name from the kitchen (IMMEDIATE CARDIAC ARREST)",
      punchline: "Encryption Bypassed by 100dB Voice Decibels"
    },
    {
      title: "THE SACRED DHANIYA PROTOCOL",
      top: "THE 4 PILLARS OF INDIAN GROCERY ARBITRAGE",
      expected: "Step 1: Hand ₹10 note with cyber precision\nStep 2: Demand fresh cilantro",
      reality: "Step 3: Stare into vendor's soul until 4 FREE GREEN CHILLIES are deposited\nStep 4: Return victorious",
      punchline: "If you pay for mirchi, family disownment is automatic"
    },
    {
      title: "COLD MAGGI FORENSIC LOG",
      top: "THERMODYNAMICS OF HACKER NOODLES",
      expected: "Minute 0: Warm, spicy, aromatic comfort food",
      reality: "Minute 25: Solidified into reinforced titanium brick that bent your stainless steel fork",
      punchline: "Now classified as Military-Grade Ballistic Armor"
    },
    {
      title: "SHARMA JI KA BETA BENCHMARK",
      top: "COMPARATIVE PERFORMANCE REVIEW",
      expected: "Sharma Ji's Son: Cracked Google, woke up at 4 AM, brought ₹10 dhaniya + 6 free chillies",
      reality: "You: Rotated 14 glowing laser lines in dark room, cold Maggi on desk, grounded for 3 weeks",
      punchline: "Mother's Rating: F- (Extreme Disappointment)"
    }
  ];

  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  // When Entering MOM_REVEAL, start domestic panic sequence with real human voice!
  useEffect(() => {
    if (phase === 'MOM_REVEAL' && !dialogueSpokenRef.current) {
      dialogueSpokenRef.current = true;
      playPressureCookerWhistle();
      setTimeout(() => {
        playRecordScratch();
        playMomGong();
        playMomInitialCall();
      }, 500);
    }
  }, [phase]);

  const handlePlayerChoice = (choiceKey, playerText, momRetort) => {
    playCorporateClick();
    setSelectedResponse(playerText);
    setMomRetortText(momRetort);
    setRoastStep('mom_retort');

    // Callback after Mom finishes her authentic human retort
    const onMomDone = () => {
      setRoastStep('slipper');
      onTriggerChappalFlight?.();
      playSlipperWhoosh();

      setTimeout(() => {
        setRoastStep('narrator');
        playDramaticVineBoom();
        setTimeout(() => {
          playNarratorPunchline(() => {
            playSarcasticTrombone();
          });
        }, 400);
      }, 1600);
    };

    if (choiceKey === 'firewall') {
      playMomRetortFirewall(onMomDone);
    } else if (choiceKey === 'blinkit') {
      playMomRetortBlinkit(onMomDone);
    } else if (choiceKey === 'mirchi') {
      playMomRetortMirchi(onMomDone);
    } else if (choiceKey === 'linkedin') {
      playMomRetortLinkedIn(onMomDone);
    } else if (choiceKey === 'bulk') {
      playMomRetortBulk(onMomDone);
    } else {
      onMomDone();
    }
  };

  const certSpokenRef = useRef(false);

  useEffect(() => {
    if (phase === 'CERTIFICATE_ROAST' && !certSpokenRef.current) {
      certSpokenRef.current = true;
      playDhaniyaFanfare();
      setTimeout(() => {
        playCertOfficialReading();
      }, 600);
    }
  }, [phase]);

  const handleProceedToCertificate = () => {
    stopAllSpeech();
    playDhaniyaFanfare();
    onPhaseChange?.('CERTIFICATE_ROAST');
    setTimeout(() => {
      playCertOfficialReading();
    }, 600);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyExcuseToClipboard = () => {
    const excuse = "OFFICIAL EXCUSE LETTER FOR MOM:\n\"Dear Mom, I was not wasting time playing with glowing cubes. I was securing our residential IP subnet from rogue cyber adversaries. Please accept this Certificate of Errand Disobedience in lieu of the ₹10 coriander.\"";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(excuse);
      showToast("📋 Excuse letter copied to clipboard! Show it to Mom!");
    } else {
      showToast("📋 Excuse letter: Show this screen to Mom!");
    }
    playCorporateClick();
  };

  const getWindowTitle = () => {
    switch (phase) {
      case 'VAULT_OPENING':
        return 'ctOS_Bootloader.exe // Air-Gap Secure Link';
      case 'TERMINAL_INTERACTIVE':
        return 'Sanctum_Console.exe // Session Active';
      case 'MOM_REVEAL':
        return '⚠️ Domestic_Intercom.exe [HIGH PRIORITY OVERRIDE]';
      case 'CERTIFICATE_ROAST':
        return 'Official_Evaluation_Report.pdf - Errand Disobedience';
      default:
        return 'ctOS_Terminal.exe';
    }
  };

  return (
    <div
      className="laptop-desktop-environment"
      onWheel={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* 1. INTERACTIVE DESKTOP SHORTCUT ICONS ON LEFT (VOICED) */}
      <div className="desktop-shortcuts-column">
        <div
          className={`desktop-icon-item ${activeDesktopApp === 'root' ? 'active' : ''}`}
          onClick={() => handleOpenDesktopApp('root')}
          title="Click to inspect Root privileges (Voiced by Mom)"
        >
          <span className="icon-glyph">📁</span>
          <span className="icon-name">System_Root</span>
        </div>
        <div
          className={`desktop-icon-item ${activeDesktopApp === 'firewall' ? 'active' : ''}`}
          onClick={() => handleOpenDesktopApp('firewall')}
          title="Click to view Neural Firewall stats (Voiced by Mom)"
        >
          <span className="icon-glyph">🛡️</span>
          <span className="icon-name">Neural_Firewall</span>
        </div>
        <div
          className={`desktop-icon-item ${activeDesktopApp === 'dhaniya' ? 'active' : ''}`}
          onClick={() => handleOpenDesktopApp('dhaniya')}
          title="Click to view Dhaniya budget spreadsheet (Voiced by Mom)"
        >
          <span className="icon-glyph">🌿</span>
          <span className="icon-name">Dhaniya_₹10.xlsx</span>
        </div>
        <div
          className={`desktop-icon-item ${activeDesktopApp === 'maggi' ? 'active' : ''}`}
          onClick={() => handleOpenDesktopApp('maggi')}
          title="Click to view Cold Maggi forensics (Voiced by Mom)"
        >
          <span className="icon-glyph">🍜</span>
          <span className="icon-name">Cold_Maggi.log</span>
        </div>
        <div
          className={`desktop-icon-item ${activeDesktopApp === 'memes' ? 'active' : ''}`}
          onClick={() => handleOpenDesktopApp('memes')}
          title="Click to view Hilarious Sarcasm Memes (Voiced by Narrator)"
        >
          <span className="icon-glyph">🖼️</span>
          <span className="icon-name">Desi_Memes.exe</span>
        </div>
        <div
          className={`desktop-icon-item ${activeDesktopApp === 'sharma' ? 'active' : ''}`}
          onClick={() => handleOpenDesktopApp('sharma')}
          title="Click to view Sharma Ji Ka Beta comparison report (Voiced by Mom)"
        >
          <span className="icon-glyph">📉</span>
          <span className="icon-name">Sharma_Beta.pdf</span>
        </div>
        <div
          className={`desktop-icon-item ${activeDesktopApp === 'dictionary' ? 'active' : ''}`}
          onClick={() => handleOpenDesktopApp('dictionary')}
          title="Click to view Decrypted Indian Mom Dictionary (Voiced by Narrator)"
        >
          <span className="icon-glyph">📖</span>
          <span className="icon-name">Mom_Dict.txt</span>
        </div>
      </div>

      {/* 2. OPTIONAL DESKTOP APP MODAL POPUP (When shortcut icon is clicked) */}
      {activeDesktopApp && (
        <div className="desktop-app-modal-overlay">
          <div className="desktop-app-modal-window">
            <div className="modal-titlebar">
              <span>
                {activeDesktopApp === 'root' && '📁 System_Root // Security Audit'}
                {activeDesktopApp === 'firewall' && '🛡️ Neural_Firewall // Vulnerability Scan'}
                {activeDesktopApp === 'dhaniya' && '🌿 Dhaniya_₹10.xlsx - Microsoft CyberSheet'}
                {activeDesktopApp === 'maggi' && '🍜 Cold_Maggi.log // Forensic Incident'}
                {activeDesktopApp === 'memes' && '🖼️ Desi_Memes.exe // Sarcasm Meme Vault'}
                {activeDesktopApp === 'sharma' && '📉 Sharma_Beta.pdf // Performance Audit'}
                {activeDesktopApp === 'dictionary' && '📖 Mom_Dict.txt // Decrypted Mom Dictionary'}
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="modal-replay-voice-btn"
                  onClick={() => replayAppVoice(activeDesktopApp)}
                  title="Replay Voice Audio"
                >
                  🔊 Listen
                </button>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => {
                    stopAllSpeech();
                    setActiveDesktopApp(null);
                  }}
                  title="Close Window"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="modal-content-body">
              {activeDesktopApp === 'root' && (
                <div className="modal-app-text">
                  <strong style={{ color: '#ef4444' }}>[ ACCESS DENIED: INSUFFICIENT DOMESTIC RANK ]</strong>
                  <p>
                    Root user: <code style={{ color: '#38bdf8' }}>player@cyberdeck</code> (Rank: Errand Boy)<br />
                    True Root Authority: <strong style={{ color: '#fbbf24' }}>MOTHER (UID: 000, Root of the Universe)</strong>
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '9px' }}>
                    Note: Executing <code>sudo go_to_market</code> is mandatory.
                    Attempting to override with <code>--force</code> will spawn an additional flying chappal.
                  </p>
                </div>
              )}

              {activeDesktopApp === 'firewall' && (
                <div className="modal-app-text">
                  <strong style={{ color: '#22c55e' }}>[ NEURAL FIREWALL v9.4 STATUS: ONLINE ]</strong>
                  <p>
                    • Pentagon Brute-force: <span style={{ color: '#22c55e' }}>BLOCKED (100%)</span><br />
                    • Dark Web Malware: <span style={{ color: '#22c55e' }}>BLOCKED (100%)</span><br />
                    • Mom shouting from kitchen: <span style={{ color: '#ef4444', fontWeight: 'bold' }}>PENETRATED (Bypasses 3 walls, 2 doors, and Bose noise-canceling headphones)</span>
                  </p>
                </div>
              )}

              {activeDesktopApp === 'dhaniya' && (
                <div className="modal-sheet-table">
                  <table style={{ width: '100%', fontSize: '8.5px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#38bdf8' }}>
                        <th style={{ padding: '3px', border: '1px solid #334155' }}>ITEM</th>
                        <th style={{ padding: '3px', border: '1px solid #334155' }}>BUDGET</th>
                        <th style={{ padding: '3px', border: '1px solid #334155' }}>FREE MIRCHI</th>
                        <th style={{ padding: '3px', border: '1px solid #334155' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '3px', border: '1px solid #334155' }}>Coriander (Dhaniya)</td>
                        <td style={{ padding: '3px', border: '1px solid #334155' }}>₹10.00</td>
                        <td style={{ padding: '3px', border: '1px solid #334155', color: '#22c55e' }}>4 pieces (Mandatory)</td>
                        <td style={{ padding: '3px', border: '1px solid #334155', color: '#ef4444' }}>UNFULFILLED</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '3px', border: '1px solid #334155' }}>Family Respect</td>
                        <td style={{ padding: '3px', border: '1px solid #334155' }}>PRICELESS</td>
                        <td style={{ padding: '3px', border: '1px solid #334155' }}>N/A</td>
                        <td style={{ padding: '3px', border: '1px solid #334155', color: '#ef4444' }}>-9,999 PTS</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: '5px', color: '#fbbf24', fontSize: '8px' }}>
                    Formula Bar: <code>=IF(MIRCHI_FREE=FALSE, "DISOWNED", "DINNER_SERVED")</code>
                  </div>
                </div>
              )}

              {activeDesktopApp === 'maggi' && (
                <div className="modal-app-text" style={{ fontFamily: 'monospace', fontSize: '8.5px' }}>
                  <p style={{ margin: '2px 0', color: '#64748b' }}>[13:30:00] Maggi cooked. Steam aromatic and warm.</p>
                  <p style={{ margin: '2px 0', color: '#38bdf8' }}>[13:32:15] Player: "Let me just solve this one last 3D circuit."</p>
                  <p style={{ margin: '2px 0', color: '#fbbf24' }}>[13:45:00] Player still rotating laser mirrors.</p>
                  <p style={{ margin: '2px 0', color: '#ef4444' }}>[14:02:10] CRITICAL: Maggi noodles have calcified into reinforced concrete. Fork stuck permanently.</p>
                </div>
              )}

              {/* HILARIOUS SARCASM MEME VIEWER MODAL */}
              {activeDesktopApp === 'memes' && (
                <div className="meme-modal-container">
                  <div className="meme-card-frame">
                    <span className="meme-category-badge">🔥 VIRAL DESI HACKER MEME #{memeIndex + 1} OF 5</span>
                    <h3 className="meme-headline">{MEME_COLLECTION[memeIndex].top}</h3>
                    <div className="meme-split-box">
                      <div className="meme-split-side left">
                        <span className="split-label">EXPECTATION</span>
                        <p>{MEME_COLLECTION[memeIndex].expected}</p>
                      </div>
                      <div className="meme-split-divider">VS</div>
                      <div className="meme-split-side right">
                        <span className="split-label">REALITY</span>
                        <p>{MEME_COLLECTION[memeIndex].reality}</p>
                      </div>
                    </div>
                    <div className="meme-bottom-punchline">
                      💀 {MEME_COLLECTION[memeIndex].punchline} 🩴
                    </div>
                  </div>
                  <div className="meme-nav-controls">
                    <button
                      type="button"
                      className="meme-nav-btn"
                      onClick={() => {
                        playMemeSwitchSound();
                        setMemeIndex((prev) => (prev > 0 ? prev - 1 : MEME_COLLECTION.length - 1));
                      }}
                    >
                      ◀ PREVIOUS MEME
                    </button>
                    <span className="meme-counter">{memeIndex + 1} / {MEME_COLLECTION.length}</span>
                    <button
                      type="button"
                      className="meme-nav-btn primary"
                      onClick={() => {
                        playMemeSwitchSound();
                        setMemeIndex((prev) => (prev + 1) % MEME_COLLECTION.length);
                      }}
                    >
                      NEXT MEME ▶
                    </button>
                  </div>
                </div>
              )}

              {/* SHARMA JI KA BETA COMPARISON REPORT */}
              {activeDesktopApp === 'sharma' && (
                <div className="modal-app-text" style={{ fontSize: '9px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '6px' }}>
                    <strong style={{ color: '#fbbf24' }}>📋 PERFORMANCE BENCHMARK AUDIT (CONFIDENTIAL)</strong>
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>GRADE: DISOWNMENT</span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#38bdf8' }}>
                        <th style={{ padding: '3px', textAlign: 'left' }}>METRIC</th>
                        <th style={{ padding: '3px', color: '#4ade80' }}>SHARMA JI'S SON</th>
                        <th style={{ padding: '3px', color: '#f87171' }}>YOU (THE "HACKER")</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '3px' }}>Morning Wakeup</td>
                        <td style={{ padding: '3px', color: '#4ade80' }}>4:30 AM (Brahma Muhurta)</td>
                        <td style={{ padding: '3px', color: '#f87171' }}>1:45 PM (After 14 alarms)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '3px' }}>Grocery Execution</td>
                        <td style={{ padding: '3px', color: '#4ade80' }}>Gets ₹10 dhaniya + 5 free mirchi + lemon</td>
                        <td style={{ padding: '3px', color: '#f87171' }}>Forgot coriander, buys ₹250 cold coffee</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '3px' }}>Career Achievement</td>
                        <td style={{ padding: '3px', color: '#4ade80' }}>Senior Staff Engineer @ Google</td>
                        <td style={{ padding: '3px', color: '#f87171' }}>Rotates 3D laser switches in a bunker</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '3px' }}>Household Utility</td>
                        <td style={{ padding: '3px', color: '#4ade80' }}>Repairs microwave, AC & family honor</td>
                        <td style={{ padding: '3px', color: '#f87171' }}>Solidifies Maggi noodles into concrete</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: '6px', padding: '4px', background: 'rgba(239, 68, 68, 0.15)', borderLeft: '2px solid #ef4444', color: '#fca5a5' }}>
                    AUDITOR VERDICT: "We recommend trading this child for 2 bunches of fresh coriander and a pressure cooker gasket."
                  </div>
                </div>
              )}

              {/* INDIAN MOM DICTIONARY */}
              {activeDesktopApp === 'dictionary' && (
                <div className="modal-app-text" style={{ fontSize: '9px' }}>
                  <strong style={{ color: '#38bdf8' }}>📖 DECRYPTED INDIAN MOM VOCABULARY DATABASE</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px' }}>
                    <div className="dict-entry">
                      <strong style={{ color: '#fbbf24' }}>“Bas 2 minute ruko”</strong>
                      <span style={{ color: '#cbd5e1' }}> → Actual Duration: 45 to 90 minutes. Do not leave the room.</span>
                    </div>
                    <div className="dict-entry">
                      <strong style={{ color: '#fbbf24' }}>“Kuch nahi chahiye market se”</strong>
                      <span style={{ color: '#cbd5e1' }}> → Trap detected. If you do not return with ginger, garlic and coriander, dinner is canceled.</span>
                    </div>
                    <div className="dict-entry">
                      <strong style={{ color: '#fbbf24' }}>“Yeh sab uss computer ki wajah se hai”</strong>
                      <span style={{ color: '#cbd5e1' }}> → Universal Root Cause: Explains global inflation, bad wifi, headaches, and burned dal.</span>
                    </div>
                    <div className="dict-entry">
                      <strong style={{ color: '#fbbf24' }}>“Apne baap se bolo”</strong>
                      <span style={{ color: '#cbd5e1' }}> → High Court appeal rejected. Matter referred to Chief Justice of the Household.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. CENTERED APPLICATION WINDOW IN LAPTOP DISPLAY */}
      <div className="desktop-window-frame">
        {/* Window Titlebar */}
        <div className="window-titlebar">
          <div className="window-titlebar-left">
            <span className="window-app-icon">⚡</span>
            <span className="window-title-text">{getWindowTitle()}</span>
          </div>
          <div className="window-controls">
            {phase === 'CERTIFICATE_ROAST' && (
              <button
                type="button"
                className="modal-replay-voice-btn"
                style={{ marginRight: '6px' }}
                onClick={() => {
                  stopAllSpeech();
                  playDhaniyaFanfare();
                  setTimeout(() => playCertOfficialReading(), 400);
                }}
                title="Play Official BBC Narrator Certificate Evaluation"
              >
                🔊 Read Evaluation
              </button>
            )}
            <span className="win-btn win-min">―</span>
            <span className="win-btn win-max">◻</span>
            <span className="win-btn win-close">✕</span>
          </div>
        </div>

        {/* Window Content Body */}
        <div className="window-body">
          {/* PHASE 1: BOOTLOADER / VAULT OPENING */}
          {phase === 'VAULT_OPENING' && (
            <div className="window-boot-panel">
              <div className="panel-badge amber">
                <Zap size={13} />
                <span>AIR-GAP HARDWARE INTERFACE DETECTED</span>
              </div>
              <pre className="terminal-code-block">
{`> ctOS SECURE BOOTLOADER v4.9.2
> INFILTRATION LEVEL: DEEPEST SANCTUM (SUB-LEVEL 03)
> HARDWARE TERMINAL: DETECTED & AIR-GAP LINKED
> DECRYPTING LOCAL HARDWARE SESSION...
> ACCESSING CLASSIFIED FACILITY DATA...
> [ OK ] ROOT PRIVILEGES GRANTED.`}
              </pre>
              <div className="boot-progress-bar">
                <div className="boot-progress-fill" />
              </div>
            </div>
          )}

          {/* PHASE 2: TERMINAL INTERACTIVE PROMPT */}
          {phase === 'TERMINAL_INTERACTIVE' && (
            <div className="window-interactive-panel" onClick={onInteractTerminal}>
              <div className="panel-badge green">
                <Terminal size={13} />
                <span>SANCTUM ACCESS GRANTED</span>
              </div>
              <h2 className="panel-title">THE ULTIMATE SECRET</h2>
              <p className="panel-desc">
                You bypassed 47 security nodes, rotated high-voltage lasers, and breached the legendary vault.
                Behind the impenetrable titanium doors sits an unmade bed, unfolded laundry, cold Maggi noodles...
                and this very computer.
              </p>
              <button
                type="button"
                className="panel-action-btn green-pulse"
                onClick={(e) => {
                  e.stopPropagation();
                  onInteractTerminal?.();
                }}
              >
                <Zap size={14} />
                <span>ACCESS CLASSIFIED REVELATION [CLICK HERE OR PRESS E]</span>
              </button>
            </div>
          )}

          {/* PHASE 3: MOM CALLING & PEAK SARCASM REALITY CHECK */}
          {phase === 'MOM_REVEAL' && (
            <div className="window-dialogue-panel">
              <div className="dialogue-alert-strip">
                <div className="alert-strip-badge">
                  <Volume2 size={13} className="strip-pulse-icon" />
                  <span>⚠️ INCOMING HIGH-PRIORITY TRANSMISSION // KITCHEN INTERCOM</span>
                </div>
                <div className="strip-audio-eq">
                  <span className="eq-bar bar-1" />
                  <span className="eq-bar bar-2" />
                  <span className="eq-bar bar-3" />
                  <span className="eq-bar bar-4" />
                </div>
              </div>

              {/* Mom's Speech Bubble */}
              <div className="mom-speech-bubble">
                <div className="speaker-header">
                  <span className="speaker-avatar">👵🏽</span>
                  <strong>MOM (SHOUTING FROM THE KITCHEN):</strong>
                </div>
                <p className="speaker-text">
                  “AREY NALAYAK OYE HERO! Dal poori jal gayi stove pe aur pressure cooker seetiyan maar raha hai! Stop clicking click-click like a maniac in your fake Matrix! Go to the market and bring ₹10 DHANIYA right now! Aur sun... agar sabzi-wale se free green chillies (mirchi) nahi li, toh ghar ke andar kadam mat rakhna!”
                </p>
              </div>

              {/* Step 1: Initial Response Choices */}
              {roastStep === 'initial' && (
                <div className="dialogue-options-group">
                  <span className="options-label">TRANSMIT YOUR RESPONSE:</span>
                  <div className="options-stack">
                    <button
                      type="button"
                      className="dialogue-option-chip"
                      onClick={() =>
                        handlePlayerChoice(
                          'firewall',
                          '“Mom, wait! I literally just bypassed a military-grade neural firewall!”',
                          "“Military firewall?! Arey wah, Nalayak! Last week you couldn't even fix bathroom ka door latch! Go get the dhaniya before I disconnect your Wi-Fi router forever!”",
                          [
                            { text: "Military firewall?! Arey wah, Nalayak!", pitch: 1.45, rate: 1.15, pauseAfter: 200 },
                            { text: "Last week you couldn't even fix bathroom ka door! Go get the dhaniya before I disconnect your Wi-Fi router forever!", pitch: 1.25, rate: 1.15 }
                          ]
                        )
                      }
                    >
                      <ChevronRight size={14} />
                      <span>“Mom, wait! I literally just bypassed a military-grade neural firewall!”</span>
                    </button>

                    <button
                      type="button"
                      className="dialogue-option-chip"
                      onClick={() =>
                        handlePlayerChoice(
                          'blinkit',
                          '“Can’t we just order it on Blinkit or Zepto in 8 minutes?!”',
                          '“Blinkit?! ₹40 delivery fee for ₹10 dhaniya?! Kya main yahan paise ka ped uga rahi hoon?! Wear your slippers and RUN!”',
                          [
                            { text: "Blinkit?!", pitch: 1.5, rate: 1.15, pauseAfter: 200 },
                            { text: "Forty rupees delivery fee for ten rupees dhaniya?! Kya main yahan paise ka ped uga rahi hoon?! Put on your slippers and run!", pitch: 1.3, rate: 1.2 }
                          ]
                        )
                      }
                    >
                      <ChevronRight size={14} />
                      <span>“Can’t we just order it on Blinkit or Zepto in 8 minutes?!”</span>
                    </button>

                    <button
                      type="button"
                      className="dialogue-option-chip"
                      onClick={() =>
                        handlePlayerChoice(
                          'mirchi',
                          '“What if the sabzi-wala refuses to give free mirchi? Do I negotiate?!”',
                          "“Negotiate?! Agar ek mirchi ke bhi paise diye na, family WhatsApp group se nikaal dungi! Stare into his soul until he surrenders free chillies! Now move!”",
                          [
                            { text: "Negotiate?!", pitch: 1.45, rate: 1.2, pauseAfter: 180 },
                            { text: "Agar ek mirchi ke bhi paise diye na, family WhatsApp group se nikaal dungi! Stare into his soul until he gives free mirchi! Now move!", pitch: 1.25, rate: 1.15 }
                          ]
                        )
                      }
                    >
                      <ChevronRight size={14} />
                      <span>“What if the sabzi-wala refuses free mirchi? Do I negotiate?!”</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Mom's Instant Voiced Sarcastic Retort */}
              {roastStep === 'mom_retort' && (
                <div className="mom-retort-bubble">
                  <div className="retort-header">
                    <span className="threat-emoji">👵🏽💥</span>
                    <strong>MOM'S IMMEDIATE RETORT:</strong>
                  </div>
                  <p className="retort-text">{momRetortText}</p>
                  <div className="retort-progress-bar">
                    <div className="retort-progress-fill" />
                  </div>
                </div>
              )}

              {/* Step 3: Supersonic Flying Chappal Warning */}
              {roastStep === 'slipper' && (
                <div className="slipper-threat-banner">
                  <span className="threat-emoji">🩴💨</span>
                  <div>
                    <strong className="threat-title">TACTICAL FLYING CHAPPAL LAUNCHED</strong>
                    <span className="threat-sub">
                      Velocity: Mach 3.4 • Heat-Seeking Trajectory • Target: Back of Your Head
                    </span>
                  </div>
                </div>
              )}

              {/* Step 4: Sarcastic Narrator Reality Check */}
              {roastStep === 'narrator' && (
                <div className="narrator-reality-panel">
                  <div className="panel-badge amber">
                    <Terminal size={11} />
                    <span>NARRATOR // DEADPAN REALITY CHECK</span>
                  </div>
                  <p className="narrator-quote-text">
                    “You rotated 14 high-voltage laser nodes. You bypassed quantum firewalls. You spent 20 minutes feeling like an untouchable cyber god...<br />
                    <strong style={{ color: '#fef08a' }}>
                      ...and yet, your mother just dismantled your entire clandestine operation with one single Hawaiian slipper and a demand for ₹10 coriander. The dal is ruined. The chappal is supersonic.
                    </strong>”
                  </p>
                  <button
                    type="button"
                    className="panel-action-btn amber-glow"
                    onClick={handleProceedToCertificate}
                  >
                    <Award size={14} />
                    <span>VIEW OFFICIAL HOLOGRAPHIC EVALUATION 📜</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PHASE 4: OFFICIAL CERTIFICATE OF ERRAND DISOBEDIENCE */}
          {phase === 'CERTIFICATE_ROAST' && (
            <div className="certificate-document-panel">
              <div className="cert-doc-header">
                <span className="cert-crest">🌿🩴🌿</span>
                <span className="cert-dept">
                  DEPARTMENT OF DOMESTIC HOUSEHOLD OPERATIONS & CYBER ARBITRAGE
                </span>
                <h1 className="cert-title">CERTIFICATE OF ERRAND DISOBEDIENCE</h1>
                <span className="cert-subtitle">
                  FOR DISTINGUISHED CYBER PROCRASTINATION UNDER EXTREME CIRCUMSTANCES
                </span>
                <button
                  type="button"
                  className="cert-listen-badge-btn"
                  onClick={() => {
                    stopAllSpeech();
                    playDhaniyaFanfare();
                    setTimeout(() => playCertOfficialReading(), 400);
                  }}
                  title="Play Official BBC Narrator Certificate Evaluation"
                >
                  🔊 PLAY OFFICIAL EVALUATION (BBC NARRATOR)
                </button>
              </div>

              <div className="cert-recipient-tag">
                AWARDED TO: THE "ELITE HACKER" WHO FORGOT THE DHANIYA
              </div>

              <p className="cert-citation-text">
                For spending 20 minutes rotating 3D laser switches and feeling like Mr. Robot...
                while completely neglecting a 5-minute grocery trip to buy fresh coriander.
              </p>

              <div className="cert-stats-grid">
                <div
                  className="stat-card clickable-stat"
                  onClick={() => {
                    stopAllSpeech();
                    playHostileShock();
                    playCertStatHack();
                  }}
                  title="Click to hear Hacking Aptitude assessment"
                >
                  <span className="stat-lbl">HACKING APTITUDE 🔊</span>
                  <strong className="stat-num" style={{ color: '#00f0ff' }}>LEVEL 99 CYBER GHOST</strong>
                </div>
                <div
                  className="stat-card clickable-stat"
                  onClick={() => {
                    stopAllSpeech();
                    playRejectionBuzzer();
                    playCertStatRespect();
                  }}
                  title="Click to hear Mother's Approval rating"
                >
                  <span className="stat-lbl">MOTHER'S APPROVAL 🔊</span>
                  <strong className="stat-num" style={{ color: '#ef4444' }}>-9,999 RESPECT</strong>
                </div>
                <div
                  className="stat-card clickable-stat"
                  onClick={() => {
                    stopAllSpeech();
                    playCashRegister();
                    playCertStatCoriander();
                  }}
                  title="Click to hear Coriander audit"
                >
                  <span className="stat-lbl">CORIANDER SECURED 🔊</span>
                  <strong className="stat-num" style={{ color: '#f59e0b' }}>0 / 1 BUNCH</strong>
                </div>
                <div
                  className="stat-card clickable-stat"
                  onClick={() => {
                    stopAllSpeech();
                    playSarcasticTrombone();
                    playCertStatMirchi();
                  }}
                  title="Click to hear Mirchi negotiation failure"
                >
                  <span className="stat-lbl">FREE GREEN CHILLIES 🔊</span>
                  <strong className="stat-num" style={{ color: '#ef4444' }}>0 / 4 MIRCHI</strong>
                </div>
                <div
                  className="stat-card clickable-stat"
                  onClick={() => {
                    stopAllSpeech();
                    playPressureCookerWhistle();
                    playCertStatSabzi();
                  }}
                  title="Click to hear Sabzi forensic status"
                >
                  <span className="stat-lbl">SABZI STATUS 🔊</span>
                  <strong className="stat-num" style={{ color: '#ef4444' }}>BURNED TO ASH</strong>
                </div>
                <div
                  className="stat-card clickable-stat"
                  onClick={() => {
                    stopAllSpeech();
                    onTriggerChappalFlight?.();
                    playSlipperWhoosh();
                    playCertStatChappal();
                  }}
                  title="Click to hear Chappal threat radar"
                >
                  <span className="stat-lbl">CHAPPAL THREAT LEVEL 🔊</span>
                  <strong className="stat-num" style={{ color: '#dc2626' }}>DEFCON 1 (INBOUND)</strong>
                </div>
              </div>

              {/* MISSION SARCASM MEME OF THE YEAR CARD */}
              <div className="cert-meme-showcase-box">
                <div className="cert-meme-top-bar">
                  <span className="cert-meme-badge">🏆 MISSION SARCASM MEME #{memeIndex + 1}</span>
                  <button
                    type="button"
                    className="cert-meme-shuffle-btn"
                    onClick={() => {
                      playMemeSwitchSound();
                      setMemeIndex((prev) => (prev + 1) % MEME_COLLECTION.length);
                    }}
                    title="Shuffle to next sarcastic meme"
                  >
                    🔄 SHUFFLE MEME ({memeIndex + 1}/5)
                  </button>
                </div>
                <div className="cert-meme-body">
                  <strong className="cert-meme-text-top">{MEME_COLLECTION[memeIndex].top}</strong>
                  <div className="cert-meme-visual-split">
                    <div className="cert-meme-col exp">
                      <span className="tag">EXPECTATION</span>
                      <p>{MEME_COLLECTION[memeIndex].expected}</p>
                    </div>
                    <div className="cert-meme-col real">
                      <span className="tag">REALITY</span>
                      <p>{MEME_COLLECTION[memeIndex].reality}</p>
                    </div>
                  </div>
                  <span className="cert-meme-text-bottom">💀 {MEME_COLLECTION[memeIndex].punchline} 🩴</span>
                </div>
              </div>

              {/* Interactive Sarcastic Audio Soundboard */}
              <div className="cert-soundboard-strip">
                <span className="soundboard-lbl">INTERACTIVE DOMESTIC SOUNDBOARD:</span>
                <div className="soundboard-buttons">
                  <button
                    type="button"
                    className="soundboard-btn"
                    onClick={() => {
                      playPressureCookerWhistle();
                      playMomScoldingReplay();
                    }}
                  >
                    👵🏽 Arey Nalayak! (Replay Scolding)
                  </button>
                  <button
                    type="button"
                    className="soundboard-btn"
                    onClick={() => {
                      onTriggerChappalFlight?.();
                      playSlipperWhoosh();
                    }}
                  >
                    🩴 Launch Chappal & Belan Air Raid
                  </button>
                  <button
                    type="button"
                    className="soundboard-btn"
                    onClick={() => playPressureCookerWhistle()}
                  >
                    💨 Cooker Whistle
                  </button>
                  <button
                    type="button"
                    className="soundboard-btn"
                    onClick={() => playSarcasticTrombone()}
                  >
                    🎺 Sarcastic Trombone
                  </button>
                  <button
                    type="button"
                    className="soundboard-btn"
                    onClick={() => {
                      playCashRegister();
                      playIconDhaniyaAudio();
                    }}
                  >
                    🌿 ₹10 Dhaniya + Free Mirchi
                  </button>
                  <button
                    type="button"
                    className="soundboard-btn"
                    onClick={() => {
                      playSarcasticTrombone();
                      playIconSharmaAudio();
                    }}
                  >
                    📉 Sharma Ji Ka Beta Roast
                  </button>
                  <button
                    type="button"
                    className="soundboard-btn"
                    onClick={copyExcuseToClipboard}
                  >
                    📋 Copy Excuse Letter
                  </button>
                </div>
              </div>

              {toastMessage && (
                <div className="cert-toast-banner">
                  {toastMessage}
                </div>
              )}

              <div className="cert-stamp-badge">
                <span>CERTIFIED DHANIYA PROCRASTINATOR • AUTHORIZED BY MOM 🩴</span>
              </div>

              <div className="cert-buttons-row">
                <button
                  type="button"
                  className="panel-action-btn green-pulse"
                  onClick={() => {
                    playClickSound(1200);
                    onReturnToPortfolio?.();
                  }}
                >
                  <span>RETURN TO PORTFOLIO (BEFORE THE CHAPPAL HITS 🩴)</span>
                </button>
                <button
                  type="button"
                  className="panel-action-btn secondary"
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
          )}
        </div>
      </div>

      {/* 4. DESKTOP BOTTOM TASKBAR */}
      <div className="desktop-taskbar">
        <div className="taskbar-start-btn">
          <span>💀</span>
          <strong>ctOS</strong>
        </div>
        <div className="taskbar-open-item">
          <span className="taskbar-dot" />
          <span>{getWindowTitle()}</span>
        </div>
        <div className="taskbar-tray">
          {onToggleExpandedView && (
            <button
              type="button"
              className="taskbar-zoom-btn expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpandedView();
              }}
              title={isExpandedView ? "Return to 3D Room" : "Expand to Clean Fullscreen View (Touch / Mobile Friendly)"}
            >
              {isExpandedView ? "🖥️ 3D ROOM" : "📱 EXPAND OS"}
            </button>
          )}
          <button
            type="button"
            className="taskbar-zoom-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleZoom?.();
            }}
            title={isZoomed ? "Step back to chair view (Esc)" : "Zoom in on laptop monitor (Z)"}
          >
            {isZoomed ? "🪑 VIEW ROOM (ESC)" : "🔍 ZOOM (Z)"}
          </button>
          <span className="tray-item hide-on-mobile">AIR-GAPPED</span>
          <span className="tray-item hide-on-mobile">⚡ 100%</span>
          <span className="tray-clock">13:37</span>
        </div>
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
  isExpandedView = false,
  onToggleExpandedView,
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
          <boxGeometry args={[0.45, 0.31, 0.014]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Top Bezel Webcam */}
        <mesh position={[0, 0.292, 0.008]}>
          <circleGeometry args={[0.003, 12]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.012, 0.292, 0.008]}>
          <circleGeometry args={[0.0015, 8]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>

        {/* Display Backing Surface */}
        <mesh position={[0, 0.15, 0.008]}>
          <planeGeometry args={[0.40, 0.26]} />
          <meshStandardMaterial
            color="#020617"
            roughness={0.2}
          />
        </mesh>

        {/* Interactive In-Screen OS Desktop Rendered Directly on Laptop Monitor */}
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
                isExpandedView={isExpandedView}
                onToggleExpandedView={onToggleExpandedView}
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

/**
 * 3D Indian Hawkins / Prestige Style Pressure Cooker on the Desk
 * Complete with Bakelite handle, safety valve, and animated steam whistle!
 */
function PressureCooker3D({ isWhistling = false }) {
  const whistleRef = useRef();
  const steamRef = useRef([]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    // Jiggle whistle valve violently when whistling
    if (whistleRef.current) {
      if (isWhistling) {
        whistleRef.current.position.y = 0.17 + Math.sin(time * 35) * 0.006;
        whistleRef.current.rotation.z = Math.sin(time * 40) * 0.08;
      } else {
        whistleRef.current.position.y = 0.17;
        whistleRef.current.rotation.z = 0;
      }
    }

    // Steam particles rising from the whistle nozzle
    steamRef.current.forEach((m, i) => {
      if (!m) return;
      if (isWhistling) {
        m.visible = true;
        m.position.y += delta * (0.35 + (i % 3) * 0.1);
        m.position.x += Math.sin(time * 8 + i) * delta * 0.05;
        if (m.position.y > 0.42) {
          m.position.y = 0.18;
          m.position.x = 0;
        }
        const life = 1 - (m.position.y - 0.18) / 0.24;
        m.scale.setScalar(0.015 * (1 + (1 - life) * 2));
        if (m.material) m.material.opacity = Math.max(0, life * 0.5);
      } else {
        m.visible = false;
      }
    });
  });

  return (
    <group position={[0.48, 0.74, -0.06]}>
      {/* Aluminum Pot Body */}
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.075, 0.072, 0.15, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.25} />
      </mesh>

      {/* Bakelite Side Handle (Black) */}
      <group position={[0, 0.11, 0.075]}>
        <mesh position={[0, 0, 0.05]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.024, 0.02, 0.10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      </group>

      {/* Curved Lid */}
      <mesh position={[0, 0.152, 0]}>
        <cylinderGeometry args={[0.078, 0.075, 0.012, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Black Lid Handle */}
      <mesh position={[0, 0.158, 0.04]}>
        <boxGeometry args={[0.022, 0.012, 0.07]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Center Steam Pipe / Vent Weight Tube */}
      <mesh position={[0, 0.162, -0.01]}>
        <cylinderGeometry args={[0.005, 0.005, 0.016, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>

      {/* Metallic Whistle / Seeti (Weight Valve) */}
      <group ref={whistleRef} position={[0, 0.17, -0.01]}>
        <mesh>
          <cylinderGeometry args={[0.01, 0.01, 0.022, 12]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.011, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.005, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
      </group>

      {/* Steam Particles Emitter */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={`cooker-steam-${i}`}
          ref={(el) => (steamRef.current[i] = el)}
          position={[0, 0.18 + i * 0.04, -0.01]}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} />
        </mesh>
      ))}

      {/* Safety Red Valve Dot */}
      <mesh position={[0.035, 0.158, 0.01]}>
        <cylinderGeometry args={[0.004, 0.004, 0.005, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

/**
 * 3D Tactical Indian Belan (Rolling Pin) Supersonic Projectile
 * Flies in tight tactical formation alongside the Hawaiian Slipper!
 */
function TacticalBelan3D({ isLaunched }) {
  const groupRef = useRef();
  const flightProgress = useRef(0);

  const startPos = useMemo(() => new THREE.Vector3(0.55, 1.95, -0.9), []);
  const midPos = useMemo(() => new THREE.Vector3(0.25, 1.35, 0.05), []);
  const endPos = useMemo(() => new THREE.Vector3(0.12, 1.10, 0.62), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (!groupRef.current) return;

    if (!isLaunched) {
      flightProgress.current = 0;
      groupRef.current.position.set(
        startPos.x + Math.sin(time * 2.2) * 0.03,
        startPos.y + Math.cos(time * 2.7) * 0.03,
        startPos.z
      );
      groupRef.current.rotation.set(0.4, 0.6, Math.sin(time * 1.5) * 0.2);
    } else {
      flightProgress.current = Math.min(1.0, flightProgress.current + delta * 1.35);
      const t = flightProgress.current;

      const x = (1 - t) * (1 - t) * startPos.x + 2 * (1 - t) * t * midPos.x + t * t * endPos.x;
      const y = (1 - t) * (1 - t) * startPos.y + 2 * (1 - t) * t * midPos.y + t * t * endPos.y;
      const z = (1 - t) * (1 - t) * startPos.z + 2 * (1 - t) * t * midPos.z + t * t * endPos.z;

      groupRef.current.position.set(x, y, z);
      // High-speed axial rolling pin spin
      groupRef.current.rotation.x += delta * 36;
      groupRef.current.rotation.y += delta * 24;
      groupRef.current.rotation.z += delta * 30;
    }
  });

  return (
    <group ref={groupRef} position={[0.55, 1.95, -0.9]}>
      {/* Central Rolling Barrel (Classic Sheesham Wood) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 0.22, 16]} />
        <meshStandardMaterial color="#854d0e" roughness={0.45} />
      </mesh>

      {/* Left Tapered Handle */}
      <mesh position={[-0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.007, 0.012, 0.06, 12]} />
        <meshStandardMaterial color="#713f12" roughness={0.4} />
      </mesh>
      {/* Left Handle Knob */}
      <mesh position={[-0.175, 0, 0]}>
        <sphereGeometry args={[0.009, 12, 12]} />
        <meshStandardMaterial color="#581c87" roughness={0.5} />
      </mesh>

      {/* Right Tapered Handle */}
      <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.007, 0.06, 12]} />
        <meshStandardMaterial color="#713f12" roughness={0.4} />
      </mesh>
      {/* Right Handle Knob */}
      <mesh position={[0.175, 0, 0]}>
        <sphereGeometry args={[0.009, 12, 12]} />
        <meshStandardMaterial color="#581c87" roughness={0.5} />
      </mesh>
    </group>
  );
}

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
  const [isExpandedOS, setIsExpandedOS] = useState(false);

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
          isExpandedView={isExpandedOS}
          onToggleExpandedView={() => setIsExpandedOS((p) => !p)}
        />

        {/* 100% User-Friendly Mobile & Desktop Clean Fullscreen Overlay */}
        {isExpandedOS && (
          <Html
            fullscreen
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999999,
              pointerEvents: 'auto',
            }}
          >
            <div className="laptop-os-expanded-viewport">
              <div className="expanded-os-toolbar">
                <div className="expanded-os-brand">
                  <span className="expanded-pulse-dot" />
                  <strong>⚡ ctOS DIRECT TERMINAL INTERFACE</strong>
                  <span className="expanded-os-subtag">[MOBILE & DESKTOP OPTIMIZED]</span>
                </div>
                <div className="expanded-os-actions">
                  <button
                    type="button"
                    className="expanded-mode-toggle-btn"
                    onClick={() => {
                      playCorporateClick();
                      setIsExpandedOS(false);
                    }}
                  >
                    🖥️ Return to 3D Bunker
                  </button>
                </div>
              </div>
              <div className="expanded-os-content-wrap">
                <LaptopScreenOS
                  phase={betrayalPhase}
                  isZoomed={isLaptopZoomed}
                  onToggleZoom={onToggleLaptopZoom}
                  onPhaseChange={onPhaseChange}
                  onInteractTerminal={onInteractTerminal}
                  onReturnToPortfolio={onReturnToPortfolio}
                  onRestartEasterEgg={onRestartEasterEgg}
                  onTriggerChappalFlight={() => setIsChappalLaunched(true)}
                  isExpandedView={true}
                  onToggleExpandedView={() => setIsExpandedOS(false)}
                />
              </div>
            </div>
          </Html>
        )}

        {/* Floating Quick Toggle Pill for Touch Screens */}
        {!isExpandedOS && betrayalPhase && betrayalPhase !== 'NONE' && (
          <Html
            style={{
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 900,
              pointerEvents: 'auto',
            }}
          >
            <button
              type="button"
              className="mobile-fullscreen-os-float-btn"
              onClick={() => {
                playCorporateClick();
                setIsExpandedOS(true);
              }}
              title="Switch to Clean Direct Screen View (Recommended for Mobile Touchscreens)"
            >
              📱 {typeof window !== 'undefined' && window.innerWidth < 768 ? 'TAP FOR TOUCH OS' : 'EXPAND OS VIEW'}
            </button>
          </Html>
        )}

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
