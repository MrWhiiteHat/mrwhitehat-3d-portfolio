import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  Crosshair,
  Footprints,
  Play,
  Radio,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import { playClickSound, playWhooshSound } from '../../utils/audio.js';

export default function GameHUD({
  playerData,
  activeProximity,
  onInteract,
  unlockedCount = 0,
  totalStations = 6,
  onCycleTheme,
  currentThemeName,
  muted,
  onToggleMute,
  onResetView,
  onMobileMove,
}) {
  const [touchActive, setTouchActive] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Real-time key state for on-screen tactical WASD feedback
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

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setTouchActive(true);
  };

  const handleTouchMove = (e) => {
    if (!touchActive) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const maxDist = 42;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);

    const nx = (Math.cos(angle) * clampedDist) / maxDist;
    const ny = (Math.sin(angle) * clampedDist) / maxDist;

    setStickPos({ x: nx * 32, y: ny * 32 });
    onMobileMove?.({ x: nx, y: ny });
  };

  const handleTouchEnd = () => {
    setTouchActive(false);
    setStickPos({ x: 0, y: 0 });
    onMobileMove?.({ x: 0, y: 0 });
  };

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

        {/* Quick HUD Controls */}
        <div className="hud-right-actions">
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
        </div>
      </header>

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

      {/* 4. Tactical WASD Locomotion Pad (Visual Feedback & Touch/Click Controls) */}
      <div className="hud-wasd-widget" pointerEvents="auto">
        <div className="wasd-widget-header">
          <Footprints size={12} className="wasd-header-icon" />
          <span>WASD LOCOMOTION</span>
        </div>
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
          <span className="guide-chip">ESC</span>
          <span>Menu</span>
        </div>
      </footer>

      {/* 5. Mobile Touch Joystick & Quick Action Button */}
      <div
        className="hud-mobile-joystick-zone"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="joystick-base">
          <div
            className="joystick-thumb"
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
              backgroundColor: playerData.accentColor || '#34d399',
            }}
          />
        </div>
      </div>

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
