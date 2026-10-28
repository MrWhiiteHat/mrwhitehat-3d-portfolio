import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  BriefcaseBusiness,
  CheckCircle2,
  Cpu,
  Lock,
  Play,
  HelpCircle,
  Shield,
  Sparkles,
  Terminal,
  Zap,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { playClickSound, playHackingBeep, playWhooshSound } from '../../utils/audio.js';
import UserGuideModal from './UserGuideModal.jsx';

const CHARACTERS = [
  {
    id: 'Alpha',
    name: 'Operative Alpha',
    subtitle: 'Recon Specialist',
    icon: Shield,
    visor: 'mono',
  },
  {
    id: 'Beta',
    name: 'Operative Beta',
    subtitle: 'Infiltrator',
    icon: Zap,
    visor: 'dual',
  },
  {
    id: 'Android',
    name: 'Autonomous Android',
    subtitle: 'Security Unit',
    icon: Cpu,
    visor: 'crown',
  },
];

const COLORS = [
  { id: 'matrix', label: 'Green', color: '#34d399', themeKey: 'CYBER_MATRIX' },
  { id: 'cyan', label: 'Cyan', color: '#38bdf8', themeKey: 'STEALTH_ICE' },
  { id: 'red', label: 'Red', color: '#ff2244', themeKey: 'CYBER_NEON_NOIR' },
  { id: 'pink', label: 'Pink', color: '#ec4899', themeKey: 'SYNTHWAVE_NEON' },
  { id: 'amber', label: 'Amber', color: '#fbbf24', themeKey: 'WARM_AMBER' },
];

function HolographicAvatarPreview({ characterId, accentColor }) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.25) : 1]}
      camera={{ position: [0, 0.2, 2.3], fov: 38 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ powerPreference: 'low-power', antialias: true, alpha: true, stencil: false }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 3, 2]} intensity={2.0} color="#ffffff" />
      <pointLight position={[0, 0.4, 1.2]} color={accentColor} intensity={8} distance={3} />

      <group rotation={[0.08, 0, 0]}>
        {/* Cyberpunk Operative Head / Helmet */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.55, 0.65, 0.55]} />
          <meshStandardMaterial color="#0b1319" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Android Ear Comm Armor */}
        {characterId === 'Android' && (
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

        {/* Jaw Guard */}
        <mesh position={[0, -0.15, 0.22]}>
          <boxGeometry args={[0.42, 0.24, 0.2]} />
          <meshStandardMaterial color="#030712" roughness={0.5} metalness={0.8} />
        </mesh>

        {/* Respirator Neon Grill */}
        <mesh position={[0, -0.18, 0.33]}>
          <boxGeometry args={[0.24, 0.04, 0.02]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>

        {/* Character Visor Optics */}
        {characterId === 'Alpha' && (
          <mesh position={[0, 0.22, 0.29]}>
            <boxGeometry args={[0.46, 0.12, 0.04]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        )}
        {characterId === 'Beta' && (
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
        {characterId === 'Android' && (
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

        {/* Collar & Accent */}
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.38, 0.44, 0.35, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.385, 0.395, 0.02, 16]} />
          <meshBasicMaterial color={accentColor} />
        </mesh>
      </group>
    </Canvas>
  );
}

export default function CharacterSelectModal({
  onStartGame,
  currentThemeKey,
  onSetTheme,
  isFullscreen,
  onToggleFullscreen,
  onOpenLeaderboard = null,
  onOpenGadgets = null,
  onOpenRecruiter = null,
}) {
  // Empty by default: user must enter their name (no presets/suggestions)
  const [name, setName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [showError, setShowError] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const isNameEntered = name.trim().length >= 1;

  const handleSelectColor = (col) => {
    playClickSound(1050);
    setSelectedColor(col);
    onSetTheme(col.themeKey);
  };

  const [autoFullscreen, setAutoFullscreen] = useState(true);

  const handleLaunch = (customName) => {
    const finalName = (customName || name).trim() || 'Guest Operative';
    playWhooshSound();
    playClickSound(1200);
    if (autoFullscreen && !isFullscreen && onToggleFullscreen) {
      try {
        onToggleFullscreen();
      } catch (err) {}
    }
    onStartGame({
      name: finalName,
      codename: finalName,
      archetype: selectedCharacter.id,
      archetypeName: selectedCharacter.name,
      visor: selectedCharacter.visor,
      accentColor: selectedColor.color,
      themeKey: selectedColor.themeKey,
    });
  };

  return (
    <div className="char-select-overlay">
      <div className="char-select-card simple-card">
        {/* Clean Header */}
        <div className="char-card-header">
          <div className="char-header-tag">
            <Terminal size={14} />
            <span>TERMINAL // 3D WORKSPACE VISITOR CLEARANCE</span>
          </div>
          <div className="char-header-right">
            <button
              type="button"
              className={`char-fullscreen-toggle-btn ${isFullscreen ? 'is-active' : ''}`}
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
              aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN'}</span>
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="char-body-grid">
          {/* Left Column: 3D Character Preview */}
          <div className="char-preview-pane">
            <div className="preview-canvas-box">
              <HolographicAvatarPreview
                characterId={selectedCharacter.id}
                accentColor={selectedColor.color}
              />
              <div className="preview-holo-scanline" />
            </div>

            <div className="preview-badge-footer">
              <span className="badge-agent-title">3D AVATAR PREVIEW</span>
              <strong
                className="badge-agent-name"
                style={{ color: selectedColor.color }}
              >
                {selectedCharacter.name}
              </strong>
              <span className="badge-role-tag">{selectedCharacter.subtitle}</span>
            </div>
          </div>

          {/* Right Column: Clean Simple Controls */}
          <div className="char-config-pane">
            {/* 1. Name Input (Friendly with Quick Guest Option) */}
            <div className="config-group">
              <div className="config-label-row">
                <label className="config-label">
                  <span>YOUR NAME</span>
                </label>
                <button
                  type="button"
                  className="quick-guest-btn"
                  onClick={() => {
                    playClickSound(950);
                    setName('Guest Operative');
                  }}
                  title="Fill default guest operative name"
                >
                  ⚡ Quick Guest
                </button>
              </div>

              <input
                type="text"
                maxLength={20}
                className="codename-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name or click Enter..."
                autoFocus
              />
            </div>

            {/* 2. Choose Character (3 Simple Cards) */}
            <div className="config-group">
              <label className="config-label">
                <span>CHOOSE CHARACTER</span>
              </label>
              <div className="archetype-list">
                {CHARACTERS.map((char) => {
                  const Icon = char.icon;
                  const isActive = selectedCharacter.id === char.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      className={`archetype-chip ${isActive ? 'active-archetype' : ''}`}
                      onClick={() => {
                        playClickSound(850);
                        setSelectedCharacter(char);
                      }}
                      style={isActive ? { borderColor: selectedColor.color } : {}}
                    >
                      <Icon size={16} className="arch-icon" />
                      <div className="arch-details">
                        <strong className="arch-name">{char.name}</strong>
                        <span className="arch-sub">{char.subtitle}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Choose Accent Color */}
            <div className="config-group">
              <label className="config-label">
                <span>SUIT COLOR</span>
              </label>
              <div className="palette-row simple-palette-row">
                {COLORS.map((col) => {
                  const isActive = selectedColor.id === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      className={`palette-swatch ${isActive ? 'active-swatch' : ''}`}
                      onClick={() => handleSelectColor(col)}
                      style={{
                        borderColor: isActive ? col.color : 'rgba(255, 255, 255, 0.15)',
                        boxShadow: isActive ? `0 0 14px ${col.color}` : 'none',
                      }}
                    >
                      <span className="swatch-dot" style={{ backgroundColor: col.color }} />
                      <span className="swatch-label">{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Controls Cheat Sheet for PC & Mobile */}
            <div className="quick-controls-card">
              <div className="quick-controls-header">
                <span>🎮 HOW TO EXPLORE</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="controls-auto-tag">{typeof window !== 'undefined' && window.innerWidth < 768 ? 'MOBILE TOUCH' : 'PC KEYBOARD & MOUSE'}</span>
                  <button
                    type="button"
                    className="ctrl-tutorial-link-btn"
                    onClick={() => {
                      playClickSound(900);
                      setShowGuide(true);
                    }}
                    title="Watch animated controls & features tutorial"
                  >
                    <Play size={10} fill="currentColor" />
                    <span>TUTORIAL</span>
                  </button>
                </div>
              </div>
              <div className="quick-controls-grid">
                {typeof window !== 'undefined' && window.innerWidth < 768 ? (
                  <>
                    <div className="ctrl-badge-item">🕹️ <strong>Joystick:</strong> Walk 360°</div>
                    <div className="ctrl-badge-item">👆 <strong>Drag Screen:</strong> Look Around</div>
                    <div className="ctrl-badge-item">⚡ <strong>Tap Station:</strong> Inspect & Hack</div>
                    <div className="ctrl-badge-item">💼 <strong>Recruiter:</strong> Instant 2D Dossier</div>
                  </>
                ) : (
                  <>
                    <div className="ctrl-badge-item">⌨️ <strong>W A S D:</strong> Walk & Move</div>
                    <div className="ctrl-badge-item">🖱️ <strong>Mouse:</strong> Look 360° (Click to lock)</div>
                    <div className="ctrl-badge-item">⚡ <strong>E / Click:</strong> Inspect & Hack</div>
                    <div className="ctrl-badge-item">💼 <strong>Key R:</strong> Instant Recruiter Dossier</div>
                  </>
                )}
              </div>
              <div className="quick-controls-footer-tip">
                <span>💡 <strong>Tip:</strong> Press [F] anytime for Fullscreen · [Esc] unlocks mouse · Keys [1-9] jump stations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Simple Footer */}
        <div className="char-card-footer">
          {onOpenRecruiter && (
            <button
              type="button"
              className="btn-recruiter-quick"
              onClick={() => {
                playClickSound(1000);
                onOpenRecruiter();
              }}
              title="Recruiter Fast View: Instant 2D Dossier, Projects & Resume"
              style={{ marginRight: 'auto' }}
            >
              <BriefcaseBusiness size={14} />
              <span>2D RECRUITER DOSSIER</span>
            </button>
          )}
          <div className="footer-brief">
            <label className="footer-fullscreen-tip-toggle" title="Automatically requests fullscreen when entering the office for smooth 60 FPS">
              <input
                type="checkbox"
                checked={autoFullscreen}
                onChange={(e) => setAutoFullscreen(e.target.checked)}
                className="footer-fs-checkbox"
              />
              <span className="footer-fs-text">
                💡 Launch in <strong>Fullscreen [F]</strong> (60 FPS)
              </span>
            </label>
          </div>

          <button
            type="button"
            className="btn-launch-game"
            onClick={() => handleLaunch()}
            style={{
              borderColor: selectedColor.color,
              boxShadow: `0 0 25px ${selectedColor.color}40`,
              cursor: 'pointer',
            }}
          >
            <Sparkles size={16} />
            <span>{isNameEntered ? `ENTER AS ${name.trim().toUpperCase()}` : '⚡ ENTER 3D OFFICE'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Video-Style User Guide Modal */}
      <UserGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </div>
  );
}
