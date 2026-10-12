import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Cpu,
  Eye,
  Flame,
  Radio,
  RefreshCw,
  Shield,
  Sparkles,
  Terminal,
  UserCheck,
  Zap,
} from 'lucide-react';
import { playClickSound, playWhooshSound } from '../../utils/audio.js';

const CODENAME_PRESETS = [
  'MrWhiteHat',
  'Sadashiba',
  'Cipher_Zero',
  'Ghost_Netrunner',
  'Valkyrie_99',
  'Neo_Spectre',
  'Apex_Phantom',
  'Zero_Day',
  'Krypton_Hex',
  'Byte_Reaper',
];

const ARCHETYPES = [
  {
    id: 'Alpha',
    name: 'Operative Alpha',
    subtitle: 'Cyber Recon Specialist',
    icon: Shield,
    desc: 'Heavy ICE penetration & firewall bypass expertise.',
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
];

const VISOR_STYLES = [
  { id: 'mono', label: 'Tactical Mono-Lens', shape: 'mono' },
  { id: 'dual', label: 'Dual Hex Visor', shape: 'dual' },
  { id: 'crown', label: 'Neural Crown', shape: 'crown' },
  { id: 'shades', label: 'Stealth Shades', shape: 'shades' },
];

const NEON_PALETTES = [
  { id: 'cybernoir', label: 'Neon Noir (Red & Cyan)', color: '#ff2244', themeKey: 'CYBER_NEON_NOIR' },
  { id: 'matrix', label: 'Matrix Green', color: '#34d399', themeKey: 'CYBER_MATRIX' },
  { id: 'cyan', label: 'Arctic Cyan', color: '#38bdf8', themeKey: 'STEALTH_ICE' },
  { id: 'magenta', label: 'Synthwave Neon', color: '#ec4899', themeKey: 'SYNTHWAVE_NEON' },
  { id: 'amber', label: 'Warm Amber', color: '#fbbf24', themeKey: 'WARM_AMBER' },
];

function HolographicAvatarPreview({ archetype, visor, accentColor }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 2.4], fov: 38 }}
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
  const [codename, setCodename] = useState('MrWhiteHat');
  const [selectedArchetype, setSelectedArchetype] = useState(ARCHETYPES[0]);
  const [selectedVisor, setSelectedVisor] = useState(VISOR_STYLES[0].id);
  const [selectedPalette, setSelectedPalette] = useState(NEON_PALETTES[0]);

  const handleRandomizeName = () => {
    playClickSound(950);
    const random = CODENAME_PRESETS[Math.floor(Math.random() * CODENAME_PRESETS.length)];
    setCodename(random);
  };

  const handleSelectPalette = (palette) => {
    playClickSound(1050);
    setSelectedPalette(palette);
    onSetTheme(palette.themeKey);
  };

  const handleLaunch = () => {
    playWhooshSound();
    playClickSound(1200);
    onStartGame({
      codename: codename.trim() || 'Operative_Zero',
      archetype: selectedArchetype.id,
      archetypeName: selectedArchetype.name,
      visor: selectedVisor,
      accentColor: selectedPalette.color,
      themeKey: selectedPalette.themeKey,
    });
  };

  return (
    <div className="char-select-overlay">
      <div className="char-select-card">
        {/* Top Terminal Header */}
        <div className="char-card-header">
          <div className="char-header-tag">
            <Terminal size={14} />
            <span>CTOS // OPERATIVE RECON DEPLOYMENT</span>
          </div>
          <span className="char-version-chip">v4.0 · 3D EXPLORATION MODE</span>
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
              <span className="badge-agent-title">IDENTIFIED OPERATIVE</span>
              <strong className="badge-agent-name" style={{ color: selectedPalette.color }}>
                {codename || 'OPERATIVE'}
              </strong>
              <span className="badge-role-tag">{selectedArchetype.subtitle}</span>
            </div>
          </div>

          {/* Right Column: Customizer Controls */}
          <div className="char-config-pane">
            {/* 1. Codename Input */}
            <div className="config-group">
              <label className="config-label">
                <span>OPERATIVE CODENAME</span>
                <span className="config-hint">Visible on room telemetry HUD</span>
              </label>
              <div className="codename-input-row">
                <input
                  type="text"
                  maxLength={18}
                  className="codename-input"
                  value={codename}
                  onChange={(e) => setCodename(e.target.value)}
                  placeholder="Enter Call-sign..."
                />
                <button
                  type="button"
                  className="btn-random-name"
                  onClick={handleRandomizeName}
                  title="Randomize Codename"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* 2. Archetype / Body Type Selection */}
            <div className="config-group">
              <label className="config-label">
                <span>OPERATIVE ARCHETYPE</span>
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

            {/* 3. Cyber Visor HUD Selection */}
            <div className="config-group">
              <label className="config-label">
                <span>OPTICAL CYBER VISOR</span>
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

            {/* 4. Neon Cyber Accent Color */}
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
            <span>WASD + Mouse-Look enabled upon airlock gate breach.</span>
          </div>

          <button
            type="button"
            className="btn-launch-game"
            onClick={handleLaunch}
            style={{
              borderColor: selectedPalette.color,
              boxShadow: `0 0 25px ${selectedPalette.color}40`,
            }}
          >
            <Sparkles size={16} />
            <span>BREACH AIRLOCK GATE & ENTER STUDIO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
