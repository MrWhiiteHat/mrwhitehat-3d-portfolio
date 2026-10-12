import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Eye,
  Flame,
  Globe,
  Lock,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  Zap,
} from 'lucide-react';
import { playClickSound, playHackingBeep, playWhooshSound } from '../../utils/audio.js';

const ARCHETYPES = [
  {
    id: 'Alpha',
    name: 'Operative Alpha',
    subtitle: 'Cyber Recon Specialist',
    icon: Shield,
    desc: 'Heavy ICE penetration, perimeter defense & firewall bypass.',
  },
  {
    id: 'Beta',
    name: 'Operative Beta',
    subtitle: 'High-Speed Infiltrator',
    icon: Zap,
    desc: 'Rapid buffer injection & hardware signal interception.',
  },
  {
    id: 'Android',
    name: 'Autonomous Android',
    subtitle: 'Synthetic Security Unit',
    icon: Cpu,
    desc: 'Quantum algorithmic parsing & automated telemetry decoding.',
  },
  {
    id: 'Phantom',
    name: 'Cyber Phantom',
    subtitle: 'Stealth Red Team Ghost',
    icon: Flame,
    desc: 'Silent lateral movement, zero-day research & evasion tactics.',
  },
  {
    id: 'Sentinel',
    name: 'Sentinel Zero',
    subtitle: 'Mainframe Defense Unit',
    icon: ShieldCheck,
    desc: 'Deep packet inspection, SIEM orchestration & cryptographic sealing.',
  },
  {
    id: 'Netrunner',
    name: 'Rogue Netrunner',
    subtitle: 'Black-ICE Breaker',
    icon: Terminal,
    desc: 'Sub-GHz radio interception, firmware reverse-engineering & SDR.',
  },
];

const VISOR_STYLES = [
  { id: 'mono', label: 'Tactical Mono-Lens' },
  { id: 'dual', label: 'Dual Hex Visor' },
  { id: 'crown', label: 'Neural Crown' },
  { id: 'shades', label: 'Stealth Shades' },
  { id: 'filter', label: 'Respirator Filter' },
  { id: 'reticle', label: 'Combat Reticle' },
];

const NEON_PALETTES = [
  { id: 'matrix', label: 'Matrix Green', color: '#34d399', themeKey: 'CYBER_MATRIX' },
  { id: 'cyan', label: 'Arctic Cyan', color: '#38bdf8', themeKey: 'STEALTH_ICE' },
  { id: 'cybernoir', label: 'Neon Noir (Red)', color: '#ff2244', themeKey: 'CYBER_NEON_NOIR' },
  { id: 'magenta', label: 'Synthwave Pink', color: '#ec4899', themeKey: 'SYNTHWAVE_NEON' },
  { id: 'amber', label: 'Warm Amber', color: '#fbbf24', themeKey: 'WARM_AMBER' },
  { id: 'violet', label: 'Void Violet', color: '#a855f7', themeKey: 'CYBER_NEON_NOIR' },
  { id: 'emerald', label: 'Electric Emerald', color: '#10b981', themeKey: 'CYBER_MATRIX' },
];

const DIVISIONS = [
  { id: 'red', name: 'Red Team', badge: 'OFFENSIVE' },
  { id: 'blue', name: 'Blue Team', badge: 'DEFENSIVE' },
  { id: 'purple', name: 'Purple Team', badge: 'HYBRID' },
  { id: 'guest', name: 'Executive Guest', badge: 'VISITOR' },
];

function HolographicAvatarPreview({ archetype, visor, accentColor }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 2.3], fov: 38 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 3, 2]} intensity={2.0} color="#ffffff" />
      <pointLight position={[0, 0.4, 1.2]} color={accentColor} intensity={8} distance={3} />

      <group rotation={[0.08, 0, 0]}>
        {/* Stylized Cyberpunk Operative Head / Mask */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.55, 0.65, 0.55]} />
          <meshStandardMaterial color="#0b1319" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Archetype-specific antenna / ear armor */}
        {(archetype === 'Android' || archetype === 'Sentinel') && (
          <group>
            <mesh position={[-0.32, 0.22, 0]}>
              <boxGeometry args={[0.08, 0.28, 0.14]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[-0.33, 0.22, 0]}>
              <boxGeometry args={[0.02, 0.2, 0.08]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
            <mesh position={[0.32, 0.22, 0]}>
              <boxGeometry args={[0.08, 0.28, 0.14]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0.33, 0.22, 0]}>
              <boxGeometry args={[0.02, 0.2, 0.08]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
          </group>
        )}

        {/* Jaw Guard Filter */}
        <mesh position={[0, -0.15, 0.22]}>
          <boxGeometry args={[0.42, 0.24, 0.2]} />
          <meshStandardMaterial color="#030712" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Respirator Neon Grill */}
        <mesh position={[0, -0.18, 0.33]}>
          <boxGeometry args={[0.24, 0.04, 0.02]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>

        {/* Selected Visor Hologram */}
        {visor === 'mono' && (
          <mesh position={[0, 0.22, 0.29]}>
            <boxGeometry args={[0.46, 0.12, 0.04]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        )}
        {visor === 'dual' && (
          <group position={[0, 0.22, 0.29]}>
            <mesh position={[-0.14, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.04, 6]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
            <mesh position={[0.14, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.04, 6]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
          </group>
        )}
        {visor === 'crown' && (
          <group position={[0, 0.5, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.32, 0.018, 8, 24]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
            {[-0.2, 0, 0.2].map((x, i) => (
              <mesh key={i} position={[x, 0.08, 0.25]}>
                <boxGeometry args={[0.02, 0.14, 0.02]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            ))}
          </group>
        )}
        {visor === 'shades' && (
          <group position={[0, 0.22, 0.29]}>
            <mesh position={[-0.13, 0, 0]}>
              <boxGeometry args={[0.19, 0.09, 0.04]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
            <mesh position={[0.13, 0, 0]}>
              <boxGeometry args={[0.19, 0.09, 0.04]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
          </group>
        )}
        {visor === 'filter' && (
          <group position={[0, -0.05, 0.28]}>
            <mesh position={[-0.16, -0.1, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.08, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            <mesh position={[0.16, -0.1, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.08, 16]} rotation={[Math.PI / 2, 0, 0]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.25, 0.01]}>
              <boxGeometry args={[0.42, 0.08, 0.02]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
          </group>
        )}
        {visor === 'reticle' && (
          <group position={[0, 0.22, 0.3]}>
            <mesh position={[0.12, 0, 0]}>
              <ringGeometry args={[0.05, 0.065, 16]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
            <mesh position={[0.12, 0, 0]}>
              <circleGeometry args={[0.012, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.12, 0, 0]}>
              <boxGeometry args={[0.16, 0.06, 0.02]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          </group>
        )}

        {/* Operative Cyber Collar */}
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.38, 0.44, 0.35, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Collar Neon Accent Strip */}
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.385, 0.395, 0.02, 16]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>
    </Canvas>
  );
}

export default function CharacterSelectModal({ onStartGame, currentThemeKey, onSetTheme }) {
  // Empty by default: user MUST enter their own name (no suggestions)
  const [codename, setCodename] = useState('');
  const [role, setRole] = useState('Cyber Security Researcher');
  const [selectedArchetype, setSelectedArchetype] = useState(ARCHETYPES[0]);
  const [selectedVisor, setSelectedVisor] = useState(VISOR_STYLES[0].id);
  const [selectedPalette, setSelectedPalette] = useState(NEON_PALETTES[0]);
  const [selectedDivision, setSelectedDivision] = useState(DIVISIONS[0]);
  const [showError, setShowError] = useState(false);

  const isNameEntered = codename.trim().length >= 1;

  const handleSelectPalette = (palette) => {
    playClickSound(1050);
    setSelectedPalette(palette);
    onSetTheme(palette.themeKey);
  };

  const handleLaunch = () => {
    if (!isNameEntered) {
      playHackingBeep(600);
      setShowError(true);
      return;
    }
    playWhooshSound();
    playClickSound(1200);
    onStartGame({
      name: codename.trim(),
      codename: codename.trim(),
      role: role.trim() || 'Cyber Security Specialist',
      division: selectedDivision.name,
      archetype: selectedArchetype.id,
      archetypeName: selectedArchetype.name,
      visor: selectedVisor,
      accentColor: selectedPalette.color,
      themeKey: selectedPalette.themeKey,
      clearanceLevel: `LEVEL 4 // ${selectedDivision.badge}`,
    });
  };

  return (
    <div className="char-select-overlay">
      <div className="char-select-card">
        {/* Top Terminal Header */}
        <div className="char-card-header">
          <div className="char-header-tag">
            <Terminal size={14} />
            <span>CTOS SECURITY // AIRLOCK CLEARANCE & VISITOR ENROLLMENT</span>
          </div>
          <span className="char-version-chip">MANDATORY IDENTIFICATION GATE</span>
        </div>

        {/* Main Body Grid: 3D Hologram Preview (Left) & Configuration Form (Right) */}
        <div className="char-body-grid">
          {/* Left Column: 3D Hologram Avatar Preview */}
          <div className="char-preview-pane">
            <div className="preview-canvas-box">
              <HolographicAvatarPreview
                archetype={selectedArchetype.id}
                visor={selectedVisor}
                accentColor={selectedPalette.color}
              />
              <div className="preview-holo-scanline" />
            </div>

            <div className="preview-badge-footer">
              <span className="badge-agent-title">SECURITY CLEARANCE DOSSIER</span>
              <strong
                className="badge-agent-name"
                style={{ color: isNameEntered ? selectedPalette.color : '#ef4444' }}
              >
                {codename.trim() || '⚠️ UNIDENTIFIED VISITOR'}
              </strong>
              <div className="badge-sub-row">
                <span className="badge-role-tag">{selectedArchetype.subtitle}</span>
                <span className="badge-div-pill" style={{ borderColor: selectedPalette.color }}>
                  {selectedDivision.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Customizer Controls with Complete Freedom */}
          <div className="char-config-pane">
            {/* 1. Mandatory Visitor Name Input */}
            <div className={`config-group ${showError && !isNameEntered ? 'config-group-error' : ''}`}>
              <div className="config-label-row">
                <label className="config-label">
                  <span>YOUR NAME / CALLSIGN *</span>
                </label>
                {isNameEntered ? (
                  <span className="badge-validated">
                    <CheckCircle2 size={12} />
                    <span>IDENTITY VERIFIED</span>
                  </span>
                ) : (
                  <span className="badge-required">
                    <Lock size={12} />
                    <span>REQUIRED TO ENTER</span>
                  </span>
                )}
              </div>

              <div className="codename-input-row">
                <input
                  type="text"
                  maxLength={24}
                  className={`codename-input ${!isNameEntered && showError ? 'input-error-pulse' : ''}`}
                  value={codename}
                  onChange={(e) => {
                    setCodename(e.target.value);
                    if (showError && e.target.value.trim()) setShowError(false);
                  }}
                  placeholder="Type your name to gain office clearance..."
                  autoFocus
                />
              </div>

              {!isNameEntered && (
                <div className="security-notice-box">
                  <ShieldAlert size={14} className="notice-icon" />
                  <span>
                    <strong>Strict Access Policy:</strong> You must enter your name. Your visit and character will be cryptographically registered in the Wall Security Log upon entering.
                  </span>
                </div>
              )}
            </div>

            {/* 2. Custom Role / Title Designation */}
            <div className="config-group">
              <label className="config-label">
                <span>OPERATIVE ROLE / DESIGNATION</span>
                <span className="config-hint">Displayed on office visitor roster</span>
              </label>
              <input
                type="text"
                maxLength={36}
                className="codename-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Cyber Security Researcher, Recruiter, Student..."
              />
            </div>

            {/* 3. Archetype Selection (6 Cyber Character Models) */}
            <div className="config-group">
              <label className="config-label">
                <span>CHARACTER ARCHETYPE ({ARCHETYPES.length} MODELS)</span>
              </label>
              <div className="archetype-list">
                {ARCHETYPES.map((arch) => {
                  const Icon = arch.icon;
                  const isActive = selectedArchetype.id === arch.id;
                  return (
                    <button
                      key={arch.id}
                      type="button"
                      className={`archetype-chip ${isActive ? 'active-archetype' : ''}`}
                      onClick={() => {
                        playClickSound(850);
                        setSelectedArchetype(arch);
                      }}
                      style={isActive ? { borderColor: selectedPalette.color } : {}}
                    >
                      <Icon size={16} className="arch-icon" />
                      <div className="arch-details">
                        <strong className="arch-name">{arch.name}</strong>
                        <span className="arch-sub">{arch.subtitle}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Division / Team Clearance */}
            <div className="config-group">
              <label className="config-label">
                <span>SECURITY CLEARANCE DIVISION</span>
              </label>
              <div className="division-grid">
                {DIVISIONS.map((div) => {
                  const isDivActive = selectedDivision.id === div.id;
                  return (
                    <button
                      key={div.id}
                      type="button"
                      className={`division-chip ${isDivActive ? 'active-division' : ''}`}
                      onClick={() => {
                        playClickSound(920);
                        setSelectedDivision(div);
                      }}
                      style={isDivActive ? { borderColor: selectedPalette.color } : {}}
                    >
                      <span className="div-name">{div.name}</span>
                      <span className="div-badge">{div.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Cyber Visor HUD Selection */}
            <div className="config-group">
              <label className="config-label">
                <span>OPTICAL CYBER VISOR & MASK</span>
              </label>
              <div className="visor-grid">
                {VISOR_STYLES.map((v) => {
                  const isVisorActive = selectedVisor === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`visor-pill ${isVisorActive ? 'active-visor' : ''}`}
                      onClick={() => {
                        playClickSound(900);
                        setSelectedVisor(v.id);
                      }}
                      style={isVisorActive ? { borderColor: selectedPalette.color } : {}}
                    >
                      <Eye size={12} />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Neon Cyber Accent Color */}
            <div className="config-group">
              <label className="config-label">
                <span>SUIT NEON ACCENT // ATMOSPHERE</span>
              </label>
              <div className="palette-row">
                {NEON_PALETTES.map((p) => {
                  const isPalActive = selectedPalette.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`palette-swatch ${isPalActive ? 'active-swatch' : ''}`}
                      onClick={() => handleSelectPalette(p)}
                      style={{
                        borderColor: isPalActive ? p.color : 'rgba(255, 255, 255, 0.15)',
                        boxShadow: isPalActive ? `0 0 14px ${p.color}` : 'none',
                      }}
                    >
                      <span className="swatch-dot" style={{ backgroundColor: p.color }} />
                      <span className="swatch-label">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="char-card-footer">
          <div className="footer-brief">
            <span className="brief-bullet">●</span>
            {isNameEntered ? (
              <span style={{ color: '#34d399' }}>
                Clearance granted for Operative <strong>{codename.trim()}</strong>. Ready to breach airlock.
              </span>
            ) : (
              <span style={{ color: '#f87171' }}>
                Identity required. You cannot breach airlock or enter the office without providing your name.
              </span>
            )}
          </div>

          <button
            type="button"
            className={`btn-launch-game ${!isNameEntered ? 'btn-launch-disabled' : ''}`}
            onClick={handleLaunch}
            disabled={!isNameEntered}
            title={isNameEntered ? 'Breach Airlock Gate & Enter Office' : 'Name is mandatory to obtain security clearance'}
            style={{
              borderColor: isNameEntered ? selectedPalette.color : 'rgba(239, 68, 68, 0.5)',
              boxShadow: isNameEntered ? `0 0 25px ${selectedPalette.color}40` : 'none',
              cursor: isNameEntered ? 'pointer' : 'not-allowed',
              opacity: isNameEntered ? 1.0 : 0.6,
            }}
          >
            {isNameEntered ? <Sparkles size={16} /> : <Lock size={16} />}
            <span>
              {isNameEntered
                ? 'BREACH AIRLOCK GATE & ENTER OFFICE'
                : 'ENTER NAME TO OBTAIN OFFICE CLEARANCE'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
