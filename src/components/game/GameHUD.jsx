import React, { useEffect, useRef, useState } from 'react';
import {
  BriefcaseBusiness,
  Compass,
  Crosshair,
  Footprints,
  Play,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  Fan,
  Lightbulb,
  Sparkles,
  Terminal,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Zap,
  Maximize2,
  Minimize2,
  HelpCircle,
  Sliders,
  X,
} from 'lucide-react';
import { playClickSound, playWhooshSound } from '../../utils/audio.js';

export default function GameHUD({
  playerData,
  activeProximity,
  onInteract,
  unlockedCount = 0,
  totalStations = 6,
  visitorCount = 1,
  onCycleTheme,
  currentThemeName,
  muted,
  onToggleMute,
  onResetView,
  onMobileMove,
  isFullscreen,
  onToggleFullscreen,
  onOpenLeaderboard = null,
  onOpenGadgets = null,
  onOpenRecruiter = null,
  onOpenGuide = null,
  stations = [],
  unlockedStations = new Set(),
  isEasterEggAvailable = false,
  onLaunchEasterEgg = null,
}) {
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || window.innerWidth <= 1024);
  const [showOnScreenControls, setShowOnScreenControls] = useState(() => isTouchDevice);
  const [isRoomFxOpen, setIsRoomFxOpen] = useState(false);
  const [showFsTip, setShowFsTip] = useState(true);

  // Auto-hide the tip after 12 seconds so it never overstays its welcome
  useEffect(() => {
    if (!isFullscreen && showFsTip) {
      const timer = setTimeout(() => {
        setShowFsTip(false);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen, showFsTip]);

  // Cycling in-game pro-tips for free roam
  const HUD_TIPS = [
    '💡 TIP: Walk up to any terminal and press [E] or Click to inspect & hack',
    '💡 TIP: Press [1 - 9] on your keyboard to instantly teleport to any station',
    '💡 TIP: Press [F] anytime for immersive 60 FPS Fullscreen mode',
    '💡 TIP: Click 3D Gadgets on the hacker desk to inspect the Flipper Zero in 3D',
    '💡 TIP: Press [R] anytime for the Executive 2D Recruiter Dossier',
    '💡 TIP: Adjust the real Air Conditioner ❄️ and Fan 🌀 in Studio FX anytime',
  ];
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % HUD_TIPS.length);
    }, 9000);
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    if (!isRoomFxOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest || !e.target.closest('.hud-room-fx-wrapper')) {
        setIsRoomFxOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [isRoomFxOpen]);
  // Locomotion Mode: 'joystick' on mobile/touch, 'wasd' on desktop (switchable anytime)
  const [controlMode, setControlMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024 || 'ontouchstart' in window ? 'joystick' : 'wasd';
    }
    return 'wasd';
  });

  const joystickBaseRef = useRef(null);
  const stickKnobRef = useRef(null);
  const activeTouchId = useRef(null);
  const isMouseDownRef = useRef(false);

  // Appliance state trackers
  const [acActive, setAcActive] = useState(true);
  const [fanActive, setFanActive] = useState(true);
  const [neonActive, setNeonActive] = useState(true);

  const handleToggleAc = () => {
    window.__TOGGLE_AC__?.();
    setAcActive((prev) => !prev);
  };

  const handleToggleFan = () => {
    window.__TOGGLE_FAN__?.();
    setFanActive((prev) => !prev);
  };

  const handleToggleNeon = () => {
    window.__TOGGLE_NEON__?.();
    setNeonActive((prev) => !prev);
  };

  // Real-time key state for on-screen tactical WASD feedback (Physical keyboard always active!)
  const [pressedKeys, setPressedKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';
      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp') {
        setPressedKeys((prev) => (prev.w ? prev : { ...prev, w: true }));
      }
      if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft') {
        setPressedKeys((prev) => (prev.a ? prev : { ...prev, a: true }));
      }
      if (code === 'KeyS' || key === 's' || code === 'ArrowDown') {
        setPressedKeys((prev) => (prev.s ? prev : { ...prev, s: true }));
      }
      if (code === 'KeyD' || key === 'd' || code === 'ArrowRight') {
        setPressedKeys((prev) => (prev.d ? prev : { ...prev, d: true }));
      }
    };

    const handleKeyUp = (e) => {
      const code = e.code;
      const key = e.key ? e.key.toLowerCase() : '';
      if (code === 'KeyW' || key === 'w' || code === 'ArrowUp') {
        setPressedKeys((prev) => (!prev.w ? prev : { ...prev, w: false }));
      }
      if (code === 'KeyA' || key === 'a' || code === 'ArrowLeft') {
        setPressedKeys((prev) => (!prev.a ? prev : { ...prev, a: false }));
      }
      if (code === 'KeyS' || key === 's' || code === 'ArrowDown') {
        setPressedKeys((prev) => (!prev.s ? prev : { ...prev, s: false }));
      }
      if (code === 'KeyD' || key === 'd' || code === 'ArrowRight') {
        setPressedKeys((prev) => (!prev.d ? prev : { ...prev, d: false }));
      }
    };

    const handleBlur = () => {
      setPressedKeys({ w: false, a: false, s: false, d: false });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handleVirtualKey = (dir, isDown) => {
    setPressedKeys((prev) => ({ ...prev, [dir]: isDown }));
    if (isDown) {
      if (dir === 'w') onMobileMove?.({ x: 0, y: -1 });
      if (dir === 's') onMobileMove?.({ x: 0, y: 1 });
      if (dir === 'a') onMobileMove?.({ x: -1, y: 0 });
      if (dir === 'd') onMobileMove?.({ x: 1, y: 0 });
    } else {
      onMobileMove?.({ x: 0, y: 0 });
    }
  };

  const cachedCenterRef = useRef(null);

  // High-Precision Analog Joystick Calculations (Zero React re-renders & 0 DOM layout reflows on move)
  const cacheJoystickCenter = () => {
    if (!joystickBaseRef.current) return null;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      maxRadius: Math.max(28, rect.width / 2 - 12), // ~48px usable travel
    };
    cachedCenterRef.current = center;
    return center;
  };

  const resetJoystick = () => {
    cachedCenterRef.current = null;
    if (stickKnobRef.current) {
      stickKnobRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
    }
    onMobileMove?.({ x: 0, y: 0 });
  };

  const updateJoystick = (clientX, clientY) => {
    const center = cachedCenterRef.current || cacheJoystickCenter();
    if (!center) return;

    const dx = clientX - center.x;
    const dy = clientY - center.y;
    const dist = Math.hypot(dx, dy);
    const deadzone = 4;

    if (dist < deadzone) {
      if (stickKnobRef.current) {
        stickKnobRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
      }
      onMobileMove?.({ x: 0, y: 0 });
      return;
    }

    const clampedDist = Math.min(dist, center.maxRadius);
    const nx = dx / dist;
    const ny = dy / dist;
    const power = clampedDist / center.maxRadius;

    if (stickKnobRef.current) {
      stickKnobRef.current.style.transform = `translate3d(${nx * clampedDist}px, ${ny * clampedDist}px, 0px)`;
    }
    onMobileMove?.({ x: nx * power, y: ny * power });
  };

  const handleJoystickTouchStart = (e) => {
    e.stopPropagation();
    cacheJoystickCenter();
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e) => {
    e.stopPropagation();
    if (activeTouchId.current === null) return;
    let touch = null;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId.current) {
        touch = e.changedTouches[i];
        break;
      }
    }
    if (!touch) return;
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchEnd = (e) => {
    e.stopPropagation();
    activeTouchId.current = null;
    resetJoystick();
  };

  // Mouse interaction for testing on desktop
  const handleJoystickMouseDown = (e) => {
    e.stopPropagation();
    cacheJoystickCenter();
    isMouseDownRef.current = true;
    updateJoystick(e.clientX, e.clientY);
  };

  useEffect(() => {
    const onWindowMouseMove = (e) => {
      if (isMouseDownRef.current) {
        updateJoystick(e.clientX, e.clientY);
      }
    };
    const onWindowMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        resetJoystick();
      }
    };
    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [onMobileMove]);

  return (
    <div className="game-hud-layer" pointerEvents="none">

      {/* 1. Top Operative Identity & Mission Telemetry */}
      <header className="hud-top-bar">
        {/* Left Section: Compact Operative Identity & Breach Progress */}
        <div className="hud-left-group">
          <div className="hud-agent-card">
            <div
              className="hud-agent-avatar"
              style={{ borderColor: playerData.accentColor || '#34d399' }}
            >
              <Terminal size={13} style={{ color: playerData.accentColor || '#34d399' }} />
            </div>
            <div className="hud-agent-info">
              <div className="agent-name-row">
                <span className="agent-callsign">{playerData.codename || 'OPERATIVE'}</span>
                <span
                  className="agent-status-dot"
                  style={{
                    backgroundColor: playerData.accentColor || '#34d399',
                    boxShadow: `0 0 8px ${playerData.accentColor || '#34d399'}`,
                  }}
                />
              </div>
              <div className="agent-progress-row">
                <span className="agent-breach-label">BREACHED:</span>
                <strong
                  className="agent-breach-count"
                  style={{ color: playerData.accentColor || '#34d399' }}
                >
                  {unlockedCount} / {totalStations}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Center Section: Core 1-Click Quick Actions */}
        <div className="hud-center-group">
          {/* 1-Click Fast Station Matrix Directory */}
          <button
            type="button"
            className="hud-stations-pill"
            onClick={() => {
              playClickSound(1000);
              setIsStationMenuOpen((prev) => !prev);
            }}
            title="Direct Station Jump Matrix (1-Click Teleport / Inspect all 11 stations)"
          >
            <Terminal size={13} style={{ color: '#00f0ff' }} />
            <span className="stations-pill-label">⚡ STATIONS ({stations?.length || 11})</span>
          </button>

          {/* Executive Recruiter 2D Dossier Pill */}
          {onOpenRecruiter && (
            <button
              type="button"
              className="hud-recruiter-pill"
              onClick={() => {
                playClickSound(1000);
                onOpenRecruiter();
              }}
              title="Open Executive Recruiter Dossier & Fast View (R)"
            >
              <BriefcaseBusiness size={13} style={{ color: '#34d399' }} />
              <span className="recruiter-pill-label">RECRUITER</span>
              <span className="recruiter-pill-key">(R)</span>
            </button>
          )}

          {/* Speedrun Leaderboard Pill */}
          {onOpenLeaderboard && (
            <button
              type="button"
              className="hud-leaderboard-pill"
              onClick={() => {
                playClickSound(1000);
                onOpenLeaderboard();
              }}
              title="Open Global Speedrun Leaderboard (L)"
            >
              <Trophy size={13} style={{ color: '#fbbf24' }} />
              <span className="lb-pill-label">LEADERBOARD</span>
            </button>
          )}

          {/* Discreet Watch Dogs 2 Netrun Easter Egg Pill */}
          {isEasterEggAvailable && (
            <button
              type="button"
              className="hud-netrun-pill"
              onClick={() => {
                playClickSound(1200);
                onLaunchEasterEgg?.();
              }}
              title="Launch Watch Dogs 2 3D Circuit Network Bypass"
            >
              <Zap size={13} style={{ color: '#00f0ff' }} />
              <span className="netrun-pill-label">NETRUN</span>
            </button>
          )}
        </div>

        {/* Right Section: Utilities & Studio Controls */}
        <div className="hud-right-actions">
          {/* Lighting Theme Switcher */}
          <button
            type="button"
            className="hud-theme-pill"
            onClick={onCycleTheme}
            title="Cycle Lighting Theme (T)"
          >
            <Sparkles size={12} className="theme-sparkle-icon" />
            <span>{currentThemeName || 'Matrix'}</span>
          </button>

          {/* Consolidated Studio Environment Dropdown (AC, Fan, Neon, Reset Camera) */}
          <div className="hud-room-fx-wrapper" style={{ position: 'relative' }}>
            <button
              type="button"
              className={`hud-action-btn ${isRoomFxOpen ? 'active-appliance' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsRoomFxOpen((prev) => !prev);
              }}
              title="Studio Environment Controls (AC, Fan, Neon, Camera Reset)"
            >
              <Sliders size={15} color="#34d399" />
            </button>

            {isRoomFxOpen && (
              <div className="hud-room-fx-menu" onClick={(e) => e.stopPropagation()}>
                <div className="fx-menu-title">STUDIO ENVIRONMENT</div>
                <button
                  type="button"
                  className={`fx-menu-item ${acActive ? 'is-active' : ''}`}
                  onClick={handleToggleAc}
                >
                  <Snowflake size={14} color={acActive ? '#38bdf8' : '#64748b'} />
                  <span>Air Conditioner [{acActive ? '18°C ❄️' : 'OFF'}]</span>
                </button>
                <button
                  type="button"
                  className={`fx-menu-item ${fanActive ? 'is-active' : ''}`}
                  onClick={handleToggleFan}
                >
                  <Fan size={14} color={fanActive ? '#34d399' : '#64748b'} />
                  <span>Ceiling Fan [{fanActive ? 'ON 🌀' : 'OFF'}]</span>
                </button>
                <button
                  type="button"
                  className={`fx-menu-item ${neonActive ? 'is-active' : ''}`}
                  onClick={handleToggleNeon}
                >
                  <Lightbulb size={14} color={neonActive ? '#ff1744' : '#64748b'} />
                  <span>Overhead Neon [{neonActive ? 'ON 💡' : 'OFF'}]</span>
                </button>
                <button
                  type="button"
                  className="fx-menu-item"
                  onClick={() => {
                    onResetView?.();
                    setIsRoomFxOpen(false);
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset Camera View</span>
                </button>
                <button
                  type="button"
                  className={`fx-menu-item ${showOnScreenControls ? 'is-active' : ''}`}
                  onClick={() => setShowOnScreenControls((prev) => !prev)}
                >
                  <Compass size={14} />
                  <span>Touch D-Pad [{showOnScreenControls ? 'ON' : 'OFF'}]</span>
                </button>
              </div>
            )}
          </div>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            className={`hud-action-btn ${muted ? 'muted-btn' : ''}`}
            onClick={onToggleMute}
            title={muted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Interactive How To Play Guide Icon */}
          {onOpenGuide && (
            <button
              type="button"
              className="hud-action-btn"
              onClick={() => {
                playClickSound(950);
                onOpenGuide();
              }}
              title="Controls & How to Play Guide (H)"
            >
              <HelpCircle size={15} color="#fbbf24" />
            </button>
          )}

          {/* Fullscreen Option for PC & Mobile */}
          <button
            type="button"
            className={`hud-action-btn ${isFullscreen ? 'active-appliance' : ''}`}
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen [F]' : 'Enter Full Screen [F]'}
            aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* Floating Fullscreen Experience Tip (Shown when in windowed mode, auto-dismissible) */}
      {!isFullscreen && showFsTip && (
        <div className="hud-floating-fs-tip">
          <div className="fs-tip-main">
            <span className="fs-tip-icon">💡</span>
            <span className="fs-tip-desc">
              <strong>Tip:</strong> Press <strong>[F]</strong> or click Fullscreen for buttery 60 FPS & full immersion
            </span>
          </div>
          <div className="fs-tip-btn-group">
            <button
              type="button"
              className="fs-tip-enter-btn"
              onClick={() => {
                onToggleFullscreen?.();
                setShowFsTip(false);
              }}
              title="Enter Fullscreen Mode (F)"
            >
              <Maximize2 size={12} />
              <span>GO FULLSCREEN</span>
            </button>
            <button
              type="button"
              className="fs-tip-dismiss-btn"
              onClick={() => setShowFsTip(false)}
              title="Dismiss tip"
              aria-label="Dismiss tip"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* 1-Click Fast Station Matrix Quick Jump Drawer */}
      {isStationMenuOpen && (
        <div className="hud-fast-station-overlay" onClick={() => setIsStationMenuOpen(false)}>
          <div className="hud-fast-station-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="station-drawer-header">
              <div className="drawer-title-left">
                <Terminal size={16} color="#00f0ff" />
                <span>TERMINAL MATRIX // DIRECT ACCESS</span>
                <span className="drawer-subtag">1-TAP FAST INSPECT</span>
                <span className="drawer-visitor-badge">CTOS VISITOR #{visitorCount}</span>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsStationMenuOpen(false)}
                aria-label="Close stations matrix"
              >
                <X size={16} />
              </button>
            </div>
            <div className="station-drawer-tip-bar">
              <span className="drawer-tip-badge">💡 PRO TIP</span>
              <span className="drawer-tip-text">
                Click any station to teleport & inspect · You can also press keys <strong>[1 - 9]</strong> on your keyboard anytime during free-roam!
              </span>
            </div>
            <div className="station-drawer-grid">
              {(stations || []).map((st) => {
                const IconComp = st.icon || Terminal;
                const isBreached = unlockedStations?.has?.(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`station-drawer-card ${isBreached ? 'is-breached' : ''}`}
                    onClick={() => {
                      playWhooshSound();
                      setIsStationMenuOpen(false);
                      onInteract(st.id);
                    }}
                  >
                    <div className="drawer-card-top">
                      <span className="drawer-card-num">{st.num}</span>
                      <IconComp size={16} className="drawer-card-icon" />
                      <strong className="drawer-card-name">{st.label}</strong>
                    </div>
                    <div className="drawer-card-bottom">
                      <span className="drawer-card-action">JUMP & INSPECT ▶</span>
                      <span className="drawer-card-status">{isBreached ? 'BREACHED' : 'ENCRYPTED'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Floating Fullscreen Pill for Mobile Touchscreens */}
      <button
        type="button"
        className={`hud-mobile-fullscreen-pill ${isFullscreen ? 'is-active' : ''}`}
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
      >
        {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        <span>{isFullscreen ? 'WINDOWED' : 'FULLSCREEN'}</span>
      </button>

      {/* 2. Center Dynamic Crosshair / Reticle */}
      <div className={`hud-crosshair-wrap ${activeProximity ? 'crosshair-targeted' : ''}`}>
        <div
          className="hud-crosshair-center"
          style={{
            borderColor: activeProximity ? '#22c55e' : (playerData.accentColor || '#34d399'),
            backgroundColor: activeProximity ? '#22c55e' : 'transparent',
            boxShadow: activeProximity ? '0 0 12px #22c55e' : 'none',
          }}
        />
        <div className="hud-reticle-tick tick-top" />
        <div className="hud-reticle-tick tick-bottom" />
        <div className="hud-reticle-tick tick-left" />
        <div className="hud-reticle-tick tick-right" />
        {activeProximity && (
          <div className="hud-reticle-click-hint">
            <span>[CLICK]</span>
          </div>
        )}
      </div>

      {/* 3. Interactive Proximity Prompt (Appears when aiming at or near an object) */}
      {activeProximity && (
        <div className="hud-proximity-prompt">
          <button
            type="button"
            className="proximity-action-btn"
            onClick={() => {
              playClickSound(1100);
              onInteract(activeProximity.id);
            }}
            style={{
              borderColor: playerData.accentColor || '#34d399',
              boxShadow: `0 0 26px ${playerData.accentColor || '#34d399'}60`,
            }}
          >
            <div className="prompt-input-keys">
              <span className="prompt-mouse-badge">CLICK</span>
              <span className="prompt-or-sep">/</span>
              <span className="prompt-key-badge">E</span>
            </div>
            <div className="prompt-details">
              <span className="prompt-station-name">{activeProximity.title.toUpperCase()}</span>
              <strong
                className="prompt-action-text"
                style={{ color: playerData.accentColor || '#34d399' }}
              >
                {activeProximity.action}
              </strong>
            </div>
            <Zap size={16} className="prompt-zap-icon" />
          </button>
        </div>
      )}

      {/* 4. Tactical Locomotion Controller (Virtual Analog Joystick for Mobile + Tactical WASD Keypad) */}
      {showOnScreenControls && (
<div className="hud-locomotion-widget" pointerEvents="auto">
        <div className="locomotion-header">
          <div className="locomotion-title">
            <Compass size={12} className="locomotion-icon" style={{ color: playerData.accentColor || '#34d399' }} />
            <span>LOCOMOTION</span>
          </div>
          {/* Mode Switcher Tabs */}
          <div className="locomotion-mode-tabs">
            <button
              type="button"
              className={`locomotion-tab-btn ${controlMode === 'joystick' ? 'is-active' : ''}`}
              onClick={() => {
                setControlMode('joystick');
                resetJoystick();
              }}
              title="Virtual Analog Joystick (Touch/Mobile)"
            >
              🕹️ STICK
            </button>
            <button
              type="button"
              className={`locomotion-tab-btn ${controlMode === 'wasd' ? 'is-active' : ''}`}
              onClick={() => {
                setControlMode('wasd');
                resetJoystick();
              }}
              title="WASD Directional Keypad"
            >
              ⌨️ WASD
            </button>
          </div>
        </div>

        {controlMode === 'joystick' ? (
          /* High-Precision Cyber Virtual Analog Joystick */
          <div
            className="hud-joystick-pad"
            ref={joystickBaseRef}
            style={{ touchAction: 'none' }}
            onTouchStart={handleJoystickTouchStart}
            onTouchMove={handleJoystickTouchMove}
            onTouchEnd={handleJoystickTouchEnd}
            onTouchCancel={handleJoystickTouchEnd}
            onMouseDown={handleJoystickMouseDown}
          >
            {/* Cardinal Reticle Indicators */}
            <span className="joy-cardinal joy-n">▲ FWD</span>
            <span className="joy-cardinal joy-w">◄ LEFT</span>
            <span className="joy-cardinal joy-e">RIGHT ►</span>
            <span className="joy-cardinal joy-s">▼ BACK</span>

            {/* Concentric Guide Rings */}
            <div className="joy-ring-inner" />
            <div className="joy-cross-h" />
            <div className="joy-cross-v" />

            {/* Glowing Movable Thumb Puck (Direct Hardware GPU Transform) */}
            <div
              ref={stickKnobRef}
              className="joy-thumb-knob"
              style={{
                borderColor: playerData.accentColor || '#34d399',
                boxShadow: `0 0 16px ${playerData.accentColor || '#34d399'}60, inset 0 0 8px rgba(0,0,0,0.8)`,
              }}
            >
              {/* Concentric Thumb Grip Ring */}
              <div className="joy-thumb-grip" />
              {/* Glowing Center Core */}
              <div
                className="joy-thumb-core"
                style={{
                  backgroundColor: playerData.accentColor || '#34d399',
                  boxShadow: `0 0 8px ${playerData.accentColor || '#34d399'}`,
                }}
              />
            </div>
          </div>
        ) : (
          /* Tactical WASD Keypad */
          <div className="wasd-keypad">
            <div className="wasd-keypad-row">
              <button
                type="button"
                className={`wasd-hud-btn wasd-btn-w ${pressedKeys.w ? 'is-active' : ''}`}
                onMouseDown={() => handleVirtualKey('w', true)}
                onMouseUp={() => handleVirtualKey('w', false)}
                onMouseLeave={() => handleVirtualKey('w', false)}
                onTouchStart={(e) => { e.preventDefault(); handleVirtualKey('w', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handleVirtualKey('w', false); }}
                title="W = Forward"
                style={{
                  borderColor: pressedKeys.w ? (playerData.accentColor || '#34d399') : undefined,
                  boxShadow: pressedKeys.w ? `0 0 14px ${playerData.accentColor || '#34d399'}` : undefined,
                  color: pressedKeys.w ? (playerData.accentColor || '#34d399') : undefined,
                }}
              >
                <span className="wasd-hud-letter">W</span>
                <span className="wasd-hud-tag">FWD</span>
              </button>
            </div>
            <div className="wasd-keypad-row">
              <button
                type="button"
                className={`wasd-hud-btn wasd-btn-a ${pressedKeys.a ? 'is-active' : ''}`}
                onMouseDown={() => handleVirtualKey('a', true)}
                onMouseUp={() => handleVirtualKey('a', false)}
                onMouseLeave={() => handleVirtualKey('a', false)}
                onTouchStart={(e) => { e.preventDefault(); handleVirtualKey('a', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handleVirtualKey('a', false); }}
                title="A = Left"
                style={{
                  borderColor: pressedKeys.a ? (playerData.accentColor || '#34d399') : undefined,
                  boxShadow: pressedKeys.a ? `0 0 14px ${playerData.accentColor || '#34d399'}` : undefined,
                  color: pressedKeys.a ? (playerData.accentColor || '#34d399') : undefined,
                }}
              >
                <span className="wasd-hud-letter">A</span>
                <span className="wasd-hud-tag">LEFT</span>
              </button>
              <button
                type="button"
                className={`wasd-hud-btn wasd-btn-s ${pressedKeys.s ? 'is-active' : ''}`}
                onMouseDown={() => handleVirtualKey('s', true)}
                onMouseUp={() => handleVirtualKey('s', false)}
                onMouseLeave={() => handleVirtualKey('s', false)}
                onTouchStart={(e) => { e.preventDefault(); handleVirtualKey('s', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handleVirtualKey('s', false); }}
                title="S = Backward"
                style={{
                  borderColor: pressedKeys.s ? (playerData.accentColor || '#34d399') : undefined,
                  boxShadow: pressedKeys.s ? `0 0 14px ${playerData.accentColor || '#34d399'}` : undefined,
                  color: pressedKeys.s ? (playerData.accentColor || '#34d399') : undefined,
                }}
              >
                <span className="wasd-hud-letter">S</span>
                <span className="wasd-hud-tag">BACK</span>
              </button>
              <button
                type="button"
                className={`wasd-hud-btn wasd-btn-d ${pressedKeys.d ? 'is-active' : ''}`}
                onMouseDown={() => handleVirtualKey('d', true)}
                onMouseUp={() => handleVirtualKey('d', false)}
                onMouseLeave={() => handleVirtualKey('d', false)}
                onTouchStart={(e) => { e.preventDefault(); handleVirtualKey('d', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handleVirtualKey('d', false); }}
                title="D = Right"
                style={{
                  borderColor: pressedKeys.d ? (playerData.accentColor || '#34d399') : undefined,
                  boxShadow: pressedKeys.d ? `0 0 14px ${playerData.accentColor || '#34d399'}` : undefined,
                  color: pressedKeys.d ? (playerData.accentColor || '#34d399') : undefined,
                }}
              >
                <span className="wasd-hud-letter">D</span>
                <span className="wasd-hud-tag">RIGHT</span>
              </button>
            </div>
          </div>
        )}
      </div>

      )}

      {/* 5. Device-Adaptive Bottom Controls Guide Bar */}
      <footer className="hud-bottom-bar">
        <div className="game-nav-guide">
          {isTouchDevice ? (
            <>
              <span className="guide-chip">🕹️</span>
              <span>Joystick Walk</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">👆</span>
              <span>Drag Look</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">⚡</span>
              <span>Tap Stations</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">💼</span>
              <span>Recruiter (R)</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">⛶</span>
              <span>Fullscreen</span>
            </>
          ) : (
            <>
              <span className="guide-chip">W A S D</span>
              <span>Walk</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">MOUSE</span>
              <span>Look 360°</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">E / CLICK</span>
              <span>Interact</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">SHIFT</span>
              <span>Sprint</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">R</span>
              <span>Recruiter</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">F</span>
              <span>Fullscreen</span>
              <span className="guide-sep">·</span>
              <span className="guide-chip">ESC</span>
              <span>Menu</span>
            </>
          )}
        </div>
        <div className="hud-rotating-tip">
          <span>{HUD_TIPS[currentTipIndex]}</span>
        </div>
      </footer>


      {activeProximity && (
        <button
          type="button"
          className="hud-mobile-interact-btn"
          onClick={() => {
            playClickSound(1100);
            onInteract(activeProximity.id);
          }}
          style={{
            backgroundColor: playerData.accentColor || '#34d399',
          }}
        >
          <Zap size={22} color="#050d08" />
          <span>HACK [E]</span>
        </button>
      )}
    </div>
  );
}
