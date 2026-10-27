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
  isEasterEggAvailable = false,
  onLaunchEasterEgg = null,
}) {
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
        <div className="hud-agent-card">
          <div
            className="hud-agent-avatar"
            style={{ borderColor: playerData.accentColor || '#34d399' }}
          >
            <Terminal size={14} style={{ color: playerData.accentColor || '#34d399' }} />
          </div>
          <div className="hud-agent-info">
            <div className="agent-name-row">
              <span className="agent-callsign">{playerData.codename || 'OPERATIVE'}</span>
              <span
                className="agent-status-dot"
                style={{
                  backgroundColor: playerData.accentColor || '#34d399',
                  boxShadow: `0 0 10px ${playerData.accentColor || '#34d399'}`,
                }}
              />
            </div>
            <span className="agent-archetype">{playerData.archetypeName || 'Netrunner'}</span>
          </div>
        </div>

        {/* Mission Objectives Progress Chip */}
        <div className="hud-mission-chip">
          <ShieldAlert size={14} className="mission-icon" />
          <div className="mission-text">
            <span className="mission-label">SECURITY TERMINALS BREACHED</span>
            <div className="mission-bar-wrap">
              <div
                className="mission-bar-fill"
                style={{
                  width: `${(unlockedCount / totalStations) * 100}%`,
                  backgroundColor: playerData.accentColor || '#34d399',
                }}
              />
            </div>
          </div>
          <strong className="mission-count">
            {unlockedCount} / {totalStations}
          </strong>
        </div>

        {/* Live Wall Visitor Count Pill */}
        <button
          type="button"
          className="hud-visitor-pill"
          onClick={() => {
            playClickSound(1000);
            onInteract?.('visitor_log');
          }}
          title="Open CTOS Office Security Visitor Roster & Telemetry Logs"
        >
          <Users size={13} style={{ color: playerData.accentColor || '#34d399' }} />
          <span className="visitor-pill-label">VISITOR COUNT:</span>
          <strong
            className="visitor-pill-num"
            style={{ color: playerData.accentColor || '#34d399' }}
          >
            #{visitorCount}
          </strong>
        </button>

        {/* Speedrun Leaderboard Pill */}
        <button
          type="button"
          className="hud-leaderboard-pill"
          onClick={() => {
            playClickSound(1000);
            onOpenLeaderboard?.();
          }}
          title="Open Global Speedrun Leaderboard (L)"
        >
          <Trophy size={13} style={{ color: '#fbbf24' }} />
          <span className="lb-pill-label">LEADERBOARD</span>
        </button>

        {/* 3D Hardware Gadgets Inspector Pill */}
        <button
          type="button"
          className="hud-gadgets-pill"
          onClick={() => {
            playClickSound(1000);
            onOpenGadgets?.('flipper');
          }}
          title="Inspect 3D Hardware Tools: Flipper Zero & Rubber Ducky (G)"
        >
          <Radio size={13} style={{ color: '#fb923c' }} />
          <span className="gadget-pill-label">3D GADGETS</span>
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
            <span className="recruiter-pill-label">RECRUITER DOSSIER</span>
            <span className="recruiter-pill-key">(R)</span>
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
            title="Launch Watch Dogs 2 3D Circuit Network Bypass (Hidden Easter Egg)"
          >
            <Zap size={13} style={{ color: '#00f0ff' }} />
            <span className="netrun-pill-label">NETRUN [OVERRIDE]</span>
          </button>
        )}

        {/* Quick HUD Controls */}
        <div className="hud-right-actions">
          {/* Working AC Quick Toggle */}
          <button
            type="button"
            className={`hud-action-btn ${acActive ? 'active-appliance' : 'muted-btn'}`}
            onClick={handleToggleAc}
            title={acActive ? 'Air Conditioner [18°C ❄️ ACTIVE] · Click to Toggle' : 'Air Conditioner [OFF] · Click to Turn ON'}
          >
            <Snowflake size={15} color={acActive ? '#38bdf8' : '#64748b'} />
          </button>

          {/* Ceiling Fan Quick Toggle */}
          <button
            type="button"
            className={`hud-action-btn ${fanActive ? 'active-appliance' : 'muted-btn'}`}
            onClick={handleToggleFan}
            title={fanActive ? 'Ceiling Fan [SPINNING 🌀] · Click to Turn OFF' : 'Ceiling Fan [OFF] · Click to Turn ON'}
          >
            <Fan size={15} color={fanActive ? '#34d399' : '#64748b'} />
          </button>

          {/* Overhead Crimson Neon Quick Toggle */}
          <button
            type="button"
            className={`hud-action-btn ${neonActive ? 'active-appliance' : 'muted-btn'}`}
            onClick={handleToggleNeon}
            title={neonActive ? 'Overhead Crimson Neon [ON 💡] · Click to Turn OFF' : 'Overhead Crimson Neon [OFF] · Click to Turn ON'}
          >
            <Lightbulb size={15} color={neonActive ? '#ff1744' : '#64748b'} />
          </button>

          <button
            type="button"
            className="hud-theme-pill"
            onClick={onCycleTheme}
            title="Cycle Lighting Theme (T)"
          >
            <Sparkles size={12} className="theme-sparkle-icon" />
            <span>{currentThemeName || 'Matrix'}</span>
          </button>

          <button
            type="button"
            className={`hud-action-btn ${muted ? 'muted-btn' : ''}`}
            onClick={onToggleMute}
            title={muted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <button
            type="button"
            className="hud-action-btn"
            onClick={onResetView}
            title="Overview Camera Perspective"
          >
            <RotateCcw size={15} />
          </button>

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

      {/* 5. Bottom Controls Guide Bar */}
      <footer className="hud-bottom-bar">
        <div className="game-nav-guide">
          <span className="guide-chip">W</span>
          <span>Forward</span>
          <span className="guide-sep">·</span>
          <span className="guide-chip">A</span>
          <span>Left</span>
          <span className="guide-sep">·</span>
          <span className="guide-chip">S</span>
          <span>Backward</span>
          <span className="guide-sep">·</span>
          <span className="guide-chip">D</span>
          <span>Right</span>
          <span className="guide-sep">·</span>
          <span className="guide-chip">MOUSE</span>
          <span>Look</span>
          <span className="guide-sep">·</span>
          <span className="guide-chip">CLICK / E</span>
          <span>Interact</span>
          <span className="guide-sep">·</span>
          <span className="guide-chip">SHIFT</span>
          <span>Sprint</span>
          <span className="guide-sep">·</span>
          <span className="guide-chip">F</span>
          <span>Fullscreen</span>
          <span className="guide-sep">·</span>
          <span className="guide-chip">ESC</span>
          <span>Menu</span>
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
