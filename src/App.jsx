import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  Github,
  Mail,
  Minus,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  UserRound,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import OfficeScene from './components/OfficeScene.jsx';
import CharacterSelectModal from './components/game/CharacterSelectModal.jsx';
import GameHUD from './components/game/GameHUD.jsx';
import { profile } from './data.js';
import {
  isMuted,
  playAirlockDoorSound,
  playBreachFanfare,
  playClickSound,
  playHackingBeep,
  playWhooshSound,
  toggleAmbientHum,
  toggleMute,
} from './utils/audio.js';
import { THEME_KEYS, LIGHTING_THEMES } from './components/studio/CyberAtmosphere.jsx';

const NAV_STATIONS = [
  { id: 'projects', label: 'Projects', icon: Code2, num: '1' },
  { id: 'skills', label: 'Skills', icon: BookOpen, num: '2' },
  { id: 'achievements', label: 'Awards', icon: Award, num: '3' },
  { id: 'about', label: 'About', icon: UserRound, num: '4' },
  { id: 'resume', label: 'Resume', icon: BriefcaseBusiness, num: '5' },
  { id: 'contact', label: 'Contact', icon: Mail, num: '6' },
];

export default function App() {
  // Game State Machine: 'CUSTOMIZE' | 'AIRLOCK_ENTRY' | 'EXPLORE' | 'INSPECT_STATION'
  const [gameState, setGameState] = useState('CUSTOMIZE');

  // Player customized avatar & telemetry
  const [playerData, setPlayerData] = useState({
    codename: 'MrWhiteHat',
    archetype: 'Alpha',
    archetypeName: 'Operative Alpha',
    visor: 'mono',
    accentColor: '#34d399',
    themeKey: 'CYBER_MATRIX',
  });

  const [isGateOpen, setIsGateOpen] = useState(false);
  const [activeProximity, setActiveProximity] = useState(null);
  const [unlockedStations, setUnlockedStations] = useState(new Set());
  const [mobileInput, setMobileInput] = useState({ x: 0, y: 0 });

  // Station inspect & theme state
  const [section, setSection] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [themeKey, setThemeKey] = useState('CYBER_MATRIX');
  const [muted, setAudioMuted] = useState(false);
  const [droneActive, setDroneActive] = useState(false);

  // 1. Theme Cycling
  const handleCycleTheme = useCallback(() => {
    playClickSound(1000);
    setThemeKey((prev) => {
      const idx = THEME_KEYS.indexOf(prev);
      const nextIdx = (idx + 1) % THEME_KEYS.length;
      return THEME_KEYS[nextIdx];
    });
  }, []);

  // 2. Audio Toggles
  const handleToggleMute = useCallback(() => {
    const nextMuted = toggleMute();
    setAudioMuted(nextMuted);
    if (!nextMuted) playClickSound(800);
  }, []);

  const handleToggleDrone = useCallback(() => {
    const active = toggleAmbientHum();
    setDroneActive(active);
    playClickSound(active ? 700 : 450);
  }, []);

  // 3. Game Launch from Character Customizer
  const handleStartGame = useCallback((customPlayerData) => {
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    setPlayerData(customPlayerData);
    if (customPlayerData.themeKey) {
      setThemeKey(customPlayerData.themeKey);
    }
    playAirlockDoorSound();
    setIsGateOpen(true);
    setGameState('AIRLOCK_ENTRY');
  }, []);

  // 4. Airlock Entry Walk-in Complete -> Enter Free-Roam
  const handleAirlockEntryComplete = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    setGameState('EXPLORE');
  }, []);

  // 5. Station Proximity Interaction (Triggered by [E] or Click)
  const handleStationInteract = useCallback(
    (stationId) => {
      if (stationId === 'core') {
        handleCycleTheme();
        return;
      }
      if (stationId === 'hologram_drone') {
        playBreachFanfare();
        playWhooshSound();
        setSection('about');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'about']));
        return;
      }
      if (stationId === 'server_rack') {
        playHackingBeep(1800);
        playWhooshSound();
        setSection('skills');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'skills']));
        return;
      }
      if (stationId === 'hardware_arsenal') {
        playHackingBeep(1600);
        playWhooshSound();
        setSection('skills');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'skills']));
        return;
      }
      if (stationId === 'wireshark_monitor' || stationId === 'mitre_matrix') {
        playHackingBeep(1400);
        playWhooshSound();
        setSection('projects');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'projects']));
        return;
      }
      playWhooshSound();
      setSection(stationId);
      setGameState('INSPECT_STATION');
      setUnlockedStations((prev) => new Set([...prev, stationId]));
    },
    [handleCycleTheme]
  );

  // 6. Direct selection from 3D object click or hotspot
  const handleObjectSelect = useCallback((selection) => {
    if (!selection || !selection.section) return;
    playWhooshSound();
    setSection(selection.section);
    setGameState('INSPECT_STATION');
    setUnlockedStations((prev) => new Set([...prev, selection.section]));
  }, []);

  // 7. Close Station Inspector -> Return to First-Person Walking
  const handleClose = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    playWhooshSound();
    setSection(null);
    setGameState('EXPLORE');
  }, []);

  // 8. Reset to Character Customizer / Studio Overview
  const handleResetToCustomize = useCallback(() => {
    playWhooshSound();
    setSection(null);
    setIsGateOpen(false);
    setGameState('CUSTOMIZE');
  }, []);

  // 9. Step Station (Next/Prev)
  const handleStepStation = useCallback(
    (direction) => {
      const ids = NAV_STATIONS.map((s) => s.id);
      playWhooshSound();
      if (!section) {
        const nextId = direction > 0 ? ids[0] : ids[ids.length - 1];
        setSection(nextId);
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, nextId]));
        return;
      }
      const idx = ids.indexOf(section);
      if (idx === -1) {
        setSection(ids[0]);
        setGameState('INSPECT_STATION');
        return;
      }
      let nextIdx = idx + direction;
      if (nextIdx < 0) nextIdx = ids.length - 1;
      if (nextIdx >= ids.length) nextIdx = 0;
      const targetId = ids[nextIdx];
      setSection(targetId);
      setGameState('INSPECT_STATION');
      setUnlockedStations((prev) => new Set([...prev, targetId]));
    },
    [section]
  );

  // 10. Global Keyboard Shortcut Bindings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__SET_SECTION__ = handleStationInteract;
      window.__CLOSE_SECTION__ = handleClose;
      window.__CYCLE_THEME__ = handleCycleTheme;
      window.__TOGGLE_MUTE__ = handleToggleMute;
      window.__START_GAME__ = handleStartGame;
      window.__RESET_CUSTOMIZE__ = handleResetToCustomize;
    }

    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape' || e.key === '0') {
        if (gameState === 'INSPECT_STATION') {
          handleClose();
        } else if (gameState === 'EXPLORE') {
          handleResetToCustomize();
        }
      } else if (e.key >= '1' && e.key <= '6') {
        const target = NAV_STATIONS[parseInt(e.key, 10) - 1];
        if (target) {
          handleStationInteract(target.id);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 't' || e.key === 'T') {
        handleCycleTheme();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    gameState,
    handleClose,
    handleCycleTheme,
    handleToggleMute,
    handleStartGame,
    handleResetToCustomize,
    handleStationInteract,
  ]);

  const currentTheme = LIGHTING_THEMES[themeKey] || LIGHTING_THEMES.CYBER_MATRIX;

  return (
    <div className="portfolio-container">
      {/* Pure 3D Scene Viewport with Airlock, First-Person Walking, and In-Object Displays */}
      <OfficeScene
        gameState={gameState}
        onSelect={handleObjectSelect}
        onDeselect={handleClose}
        activeSection={section}
        onHover={setHovered}
        themeKey={themeKey}
        onCycleTheme={handleCycleTheme}
        isGateOpen={isGateOpen}
        onAirlockEntryComplete={handleAirlockEntryComplete}
        onProximityChange={setActiveProximity}
        onStationInteract={handleStationInteract}
        mobileInput={mobileInput}
      />

      {/* 1. INITIAL: Character Customization & Deployment Modal */}
      {gameState === 'CUSTOMIZE' && (
        <CharacterSelectModal
          onStartGame={handleStartGame}
          currentThemeKey={themeKey}
          onSetTheme={setThemeKey}
        />
      )}

      {/* 2. AIRLOCK ENTRY CINEMATIC BANNER */}
      {gameState === 'AIRLOCK_ENTRY' && (
        <div className="airlock-cinematic-banner">
          <div className="cinematic-glitch-badge">
            <span className="cinematic-pulse-dot" />
            <span>BREACHING AIRLOCK // ENTERING STUDIO ARCHITECTURE</span>
          </div>
        </div>
      )}

      {/* 3. FREE-ROAM IN-GAME FIRST PERSON HUD */}
      {gameState === 'EXPLORE' && (
        <GameHUD
          playerData={playerData}
          activeProximity={activeProximity}
          onInteract={handleStationInteract}
          unlockedCount={unlockedStations.size}
          totalStations={6}
          onCycleTheme={handleCycleTheme}
          currentThemeName={currentTheme.name}
          muted={muted}
          onToggleMute={handleToggleMute}
          onResetView={handleResetToCustomize}
          onMobileMove={setMobileInput}
        />
      )}

      {/* 4. STATION INSPECTION HUD (When user approaches a terminal & interacts) */}
      {gameState === 'INSPECT_STATION' && (
        <header className="station-inspect-header">
          <button
            type="button"
            className="station-back-walk-btn"
            onClick={handleClose}
            title="Return to First-Person Free Roam (Esc)"
          >
            <ArrowLeft size={16} />
            <span>RETURN TO FREE ROAM [ESC]</span>
          </button>

          <div className="station-title-badge">
            <Terminal size={14} style={{ color: playerData.accentColor || '#34d399' }} />
            <span>TERMINAL ACTIVE: {section?.toUpperCase()}</span>
          </div>

          <div className="station-quick-controls">
            <button
              className="hud-action-btn"
              onClick={handleCycleTheme}
              title="Cycle Atmosphere (T)"
            >
              <Sparkles size={15} />
            </button>
            <button
              className={`hud-action-btn ${muted ? 'muted-btn' : ''}`}
              onClick={handleToggleMute}
              title={muted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </header>
      )}

      {/* 5. Minimal Top Header (Shown during CUSTOMIZE mode overview) */}
      {gameState === 'CUSTOMIZE' && (
        <header className="minimal-header">
          <div className="brand-badge">
            <span className="brand-icon">
              <ShieldCheck size={18} />
            </span>
            <div className="brand-text">
              <span className="brand-title">{profile.name}</span>
              <span className="brand-subtitle">3D INTERACTIVE WORKSPACE</span>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="hud-theme-pill"
              onClick={handleCycleTheme}
              title="Cycle Lighting Atmosphere (T)"
            >
              <Sparkles size={12} className="theme-sparkle-icon" />
              <span>{currentTheme.name.split('(')[1]?.replace(')', '') || 'Matrix'}</span>
            </button>

            <button
              className={`hud-action-btn ${muted ? 'muted-btn' : ''}`}
              onClick={handleToggleMute}
              title={muted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
              aria-label="Toggle Audio"
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              className={`hud-action-btn ${droneActive ? 'active-drone-btn' : ''}`}
              onClick={handleToggleDrone}
              title="Toggle Ambient Server Drone Hum"
              aria-label="Toggle Server Hum"
            >
              <Radio size={15} />
            </button>

            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="hud-action-btn"
              title="GitHub Profile"
              aria-label="GitHub Profile"
            >
              <Github size={15} />
            </a>
          </div>
        </header>
      )}

      {/* 6. Quick Navigation Dock (Available in INSPECT_STATION for fast cycling) */}
      {gameState === 'INSPECT_STATION' && (
        <nav className="quick-nav-dock in-station" aria-label="Quick Navigation">
          <button
            className="dock-arrow-btn"
            onClick={() => handleStepStation(-1)}
            title="Previous station"
            aria-label="Previous station"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="dock-stations-group">
            {NAV_STATIONS.map((st) => {
              const IconComponent = st.icon;
              const isActive = section === st.id;
              const isBreached = unlockedStations.has(st.id);
              return (
                <button
                  key={st.id}
                  className={`dock-pill ${isActive ? 'active-pill' : ''} ${
                    isBreached ? 'breached-pill' : ''
                  }`}
                  onClick={() => {
                    playWhooshSound();
                    setSection(st.id);
                    setUnlockedStations((prev) => new Set([...prev, st.id]));
                  }}
                  title={`Focus ${st.label} (${st.num})`}
                >
                  <IconComponent size={14} className="dock-icon" />
                  <span className="dock-label">{st.label}</span>
                  <span className="dock-key">{st.num}</span>
                </button>
              );
            })}
          </div>

          <button
            className="dock-arrow-btn"
            onClick={() => handleStepStation(1)}
            title="Next station"
            aria-label="Next station"
          >
            <ChevronRight size={14} />
          </button>
        </nav>
      )}
    </div>
  );
}
