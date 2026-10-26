import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Code2,
  CornerDownRight,
  Eye,
  Key,
  Lock,
  Maximize2,
  Minimize2,
  Play,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Skull,
  Sparkles,
  Terminal,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import { CAMERA_VANTAGES } from './HackingCircuitScene.jsx';
import { NODE_TYPES } from './circuitPuzzleLogic.js';

export default function HackingCircuitHUD({
  currentStage,
  stageIndex,
  totalStages,
  nodeStates,
  evaluation,
  selectedNodeId,
  activeVantageId,
  timeLeft,
  isPaused,
  isVictory,
  isGameOver,
  totalElapsedSeconds,
  muted,
  isFullscreen,
  onSelectNode,
  onRotateNode,
  onResetStage,
  onSelectVantage,
  onTogglePause,
  onToggleMute,
  onToggleFullscreen,
  onExitHackerMode,
  onNextStage,
  onSelectStage,
  onAutoSolve,
  onRetryUnlimited,
  onAddExtraTime,
}) {
  const selectedNode = currentStage.nodes.find((n) => n.id === selectedNodeId);
  const isSelectedRotatable =
    selectedNode &&
    (selectedNode.type === NODE_TYPES.SWITCH_STRAIGHT ||
      selectedNode.type === NODE_TYPES.SWITCH_ELBOW ||
      selectedNode.type === NODE_TYPES.SWITCH_T ||
      (selectedNode.type === NODE_TYPES.LOCKED_ROUTER && !nodeStates[selectedNode.id]?.isLocked));

  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('0x_DEDSEC_GHOST_ROOT');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="hacker-hud-layer" style={{ pointerEvents: 'none' }}>
      {/* 1. TOP STATUS BAR */}
      <header className="hacker-hud-header" style={{ pointerEvents: 'auto' }}>
        <div className="hacker-brand">
          <div className="hacker-logo-glitch">
            <Zap size={16} className="hacker-zap-icon" />
            <span className="hacker-title-text">ctOS // NETWORK BYPASS</span>
          </div>
          <span className="hacker-stage-tag">{currentStage.title}</span>
        </div>

        {/* Stage Progress Tracker (Clickable to switch stages) */}
        <div className="hacker-stage-tracker">
          {Array.from({ length: totalStages }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`stage-step-pill ${
                i < stageIndex
                  ? 'is-completed'
                  : i === stageIndex
                  ? 'is-active'
                  : 'is-pending'
              }`}
              onClick={() => onSelectStage && onSelectStage(i)}
              title={`Switch to Stage 0${i + 1}`}
              style={{
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                padding: '4px 8px',
                fontFamily: 'inherit',
              }}
            >
              <span className="stage-step-dot" />
              <span>STAGE 0{i + 1}</span>
            </button>
          ))}
        </div>

        {/* Countdown Timer (Stage 3 - Watch Dogs 2 Style) */}
        {typeof timeLeft === 'number' && (
          <div
            className={`hacker-timer-wd2 ${
              timeLeft <= 15 ? 'is-urgent' : ''
            }`}
          >
            <span className="timer-wd2-label">Time left</span>
            <div className="timer-wd2-track">
              <div
                className="timer-wd2-fill"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (timeLeft / (currentStage.timeLimit || 180)) * 100)
                  )}%`,
                }}
              />
            </div>
            <strong className="timer-wd2-val">
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
              {String(timeLeft % 60).padStart(2, '0')}
            </strong>
            {onAddExtraTime && (
              <button
                type="button"
                className="btn-add-time"
                onClick={onAddExtraTime}
                title="Add +60 seconds bypass"
              >
                +60s
              </button>
            )}
          </div>
        )}

        {/* Quick Utility Buttons */}
        <div className="hacker-header-actions">
          {/* Instant Auto-Solve / Bypass Button */}
          {onAutoSolve && !isVictory && (
            <button
              type="button"
              className="hacker-action-btn hacker-btn-solve"
              onClick={onAutoSolve}
              title="Instant Solve / Bypass Stage [F]"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 12px',
                background: 'rgba(0, 240, 255, 0.18)',
                borderColor: '#00f0ff',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '11px',
                letterSpacing: '0.05em',
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} color="#00f0ff" />
              <span>SOLVE [F]</span>
            </button>
          )}

          <button
            type="button"
            className="hacker-action-btn"
            onClick={onResetStage}
            title="Reset Puzzle to Initial State (R)"
          >
            <RotateCcw size={15} />
            <span className="btn-key-hint">R</span>
          </button>
          <button
            type="button"
            className={`hacker-action-btn ${isPaused ? 'is-active' : ''}`}
            onClick={onTogglePause}
            title={isPaused ? 'Resume (Esc)' : 'Pause (Esc)'}
          >
            {isPaused ? <Play size={15} /> : <X size={15} />}
            <span className="btn-key-hint">ESC</span>
          </button>
          <button
            type="button"
            className={`hacker-action-btn ${muted ? 'is-muted' : ''}`}
            onClick={onToggleMute}
            title="Toggle Audio (M)"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <button
            type="button"
            className="hacker-action-btn"
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </header>

      {/* 2. OBJECTIVE BANNER (Watch Dogs 2 Style) */}
      <div className="hacker-objective-banner" style={{ pointerEvents: 'auto' }}>
        <div className="objective-tag-wd2">
          <Zap size={13} />
          <span>COMPLETE THE HACKER CHALLENGE</span>
        </div>
        <div className="objective-text">{currentStage.objective}</div>
      </div>

      {/* 3. TACTICAL 2D MINIMAP RADAR */}
      <div className="hacker-minimap-card" style={{ pointerEvents: 'auto' }}>
        <div className="minimap-header">
          <Activity size={12} className="minimap-icon" />
          <span>CIRCUIT TOPOLOGY</span>
        </div>
        <div className="minimap-radar-screen">
          <div className="radar-grid-lines" />
          {/* Synchronized 2D Minimap Circuit Connections & Directed Flow Arrows */}
          <svg
            className="minimap-connections-svg"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <marker
                id="minimap-arrow-powered"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00f0ff" />
              </marker>
              <marker
                id="minimap-arrow-dim"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" opacity="0.6" />
              </marker>
              <marker
                id="minimap-arrow-completed"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
              </marker>
            </defs>
            {currentStage.connections.map((conn, idx) => {
              const n1 = currentStage.nodes.find((n) => n.id === conn.from);
              const n2 = currentStage.nodes.find((n) => n.id === conn.to);
              if (!n1 || !n2) return null;

              const x1 = Math.min(92, Math.max(8, 50 + (n1.position[0] / 5.5) * 42));
              const y1 = Math.min(92, Math.max(8, 50 + (n1.position[2] / 5.5) * 42));
              const x2 = Math.min(92, Math.max(8, 50 + (n2.position[0] / 5.5) * 42));
              const y2 = Math.min(92, Math.max(8, 50 + (n2.position[2] / 5.5) * 42));

              const isPowered = evaluation.poweredConnectionIndices.has(idx);
              const isCompleted = evaluation.isTargetPowered;
              const flow = evaluation?.flowDirections?.get(idx);
              const isFwd = flow ? flow.forward !== false : true;

              const stroke = isCompleted ? '#10b981' : isPowered ? '#00f0ff' : '#0284c7';
              const opacity = isPowered || isCompleted ? 0.95 : 0.32;
              const marker = isCompleted
                ? 'url(#minimap-arrow-completed)'
                : isPowered
                ? 'url(#minimap-arrow-powered)'
                : 'url(#minimap-arrow-dim)';

              const sx = isFwd ? x1 : x2;
              const sy = isFwd ? y1 : y2;
              const ex = isFwd ? x2 : x1;
              const ey = isFwd ? y2 : y1;

              return (
                <line
                  key={`mini-conn-${idx}`}
                  x1={`${sx}%`}
                  y1={`${sy}%`}
                  x2={`${ex}%`}
                  y2={`${ey}%`}
                  stroke={stroke}
                  strokeWidth={isPowered || isCompleted ? '2' : '1'}
                  strokeOpacity={opacity}
                  markerEnd={marker}
                />
              );
            })}
          </svg>
          {/* Render 2D representation of nodes */}
          {currentStage.nodes.map((node) => {
            // Project 3D X/Z into 2D radar bounds
            const mapX = 50 + (node.position[0] / 5.5) * 42;
            const mapY = 50 + (node.position[2] / 5.5) * 42;
            const isPowered = evaluation.poweredNodeIds.has(node.id);
            const isSelected = selectedNodeId === node.id;
            const isTarget = node.type === NODE_TYPES.TARGET;
            const isKey = node.type === NODE_TYPES.KEY_NODE;
            const isHostile = node.type === NODE_TYPES.HOSTILE_IDS;
            const isLocked = node.type === NODE_TYPES.LOCKED_ROUTER && nodeStates[node.id]?.isLocked;

            let dotColor = '#1e3a5f';
            if (isTarget) dotColor = isPowered ? '#10b981' : '#f59e0b';
            else if (isHostile) dotColor = '#ff1744';
            else if (isLocked) dotColor = '#f43f5e';
            else if (isKey) dotColor = isPowered ? '#34d399' : '#fbbf24';
            else if (isPowered) dotColor = '#00f0ff';

            return (
              <button
                key={node.id}
                type="button"
                className={`radar-node-blip ${isSelected ? 'is-selected' : ''}`}
                style={{
                  left: `${Math.min(92, Math.max(8, mapX))}%`,
                  top: `${Math.min(92, Math.max(8, mapY))}%`,
                  backgroundColor: dotColor,
                  boxShadow: `0 0 6px ${dotColor}`,
                }}
                onClick={() => onSelectNode(node.id)}
                title={node.label}
              />
            );
          })}
        </div>
      </div>

      {/* 4. TACTICAL SURVEILLANCE CAMERA SWITCHER */}
      <div className="hacker-cam-switcher" style={{ pointerEvents: 'auto' }}>
        <div className="cam-switcher-label">
          <Camera size={12} />
          <span>VANTAGE FEED</span>
        </div>
        <div className="cam-buttons-row">
          {Object.values(CAMERA_VANTAGES).map((cam) => (
            <button
              key={cam.id}
              type="button"
              className={`cam-select-btn ${activeVantageId === cam.id ? 'is-active' : ''}`}
              onClick={() => onSelectVantage(cam.id)}
            >
              <span className="cam-dot" />
              <span>{cam.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. BOTTOM CONTEXTUAL INTERACTION CARD */}
      <footer className="hacker-hud-footer" style={{ pointerEvents: 'auto' }}>
        {selectedNode ? (
          <div className="node-control-card">
            <div className="node-control-info">
              <span className="node-control-type">
                {selectedNode.type.replace('_', ' ').toUpperCase()}
              </span>
              <strong className="node-control-title">{selectedNode.label}</strong>
              <p className="node-control-desc">{selectedNode.desc}</p>
            </div>

            <div className="node-control-actions">
              {isSelectedRotatable ? (
                <button
                  type="button"
                  className="btn-rotate-active"
                  onClick={() => onRotateNode(selectedNode.id)}
                  title="Rotate Junction 90° (E or Enter)"
                >
                  <RotateCcw size={16} />
                  <span>ROTATE 90° [E]</span>
                </button>
              ) : selectedNode.type === NODE_TYPES.LOCKED_ROUTER && nodeStates[selectedNode.id]?.isLocked ? (
                <div className="badge-locked-warning">
                  <Lock size={15} />
                  <span>DECRYPT KEY SUB-NODE FIRST</span>
                </div>
              ) : selectedNode.type === NODE_TYPES.HOSTILE_IDS ? (
                <div className="badge-hostile-warning">
                  <Skull size={15} />
                  <span>HOSTILE SENSOR // ROUTE AROUND</span>
                </div>
              ) : selectedNode.type === NODE_TYPES.TARGET ? (
                <div className="badge-target-status">
                  {evaluation.isTargetPowered ? 'CORE BREACHED ✓' : 'CONNECT POWER HERE'}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="hacker-hint-bar">
            <span>[WASD / ARROWS] FLY CAMERA</span>
            <span>•</span>
            <span>[DRAG] FREE LOOK</span>
            <span>•</span>
            <span>[CLICK NODE] SELECT</span>
            <span>•</span>
            <span>[E] ROTATE SWITCH</span>
            <span>•</span>
            <span>[F] AUTO-SOLVE</span>
            <span>•</span>
            <span>[CAM 01–04] VANTAGE</span>
            <span>•</span>
            <span>[R] RESET</span>
            <span>•</span>
            <span>[ESC] SUSPEND</span>
          </div>
        )}
      </footer>

      {/* 6. MODAL: PAUSE OVERLAY */}
      {isPaused && (
        <div className="hacker-modal-backdrop" style={{ pointerEvents: 'auto' }}>
          <div className="hacker-dialog-card">
            <div className="dialog-badge">
              <Zap size={14} />
              <span>BYPASS PAUSED</span>
            </div>
            <h2 className="dialog-title">SYSTEM SUSPENDED</h2>
            <p className="dialog-desc">
              All electrical routing and trace detection timers are frozen.
            </p>
            <div className="dialog-btn-stack">
              <button
                type="button"
                className="dialog-btn-primary"
                onClick={onTogglePause}
              >
                <Play size={16} />
                <span>RESUME BYPASS</span>
              </button>
              <button
                type="button"
                className="dialog-btn-secondary"
                onClick={() => {
                  onResetStage();
                  onTogglePause();
                }}
              >
                <RotateCcw size={16} />
                <span>RESET CURRENT STAGE (R)</span>
              </button>
              <button
                type="button"
                className="dialog-btn-danger"
                onClick={onExitHackerMode}
              >
                <X size={16} />
                <span>ABORT & RETURN TO PORTFOLIO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: STAGE VICTORY (Between Stages 1 -> 2 -> 3) */}
      {isVictory && stageIndex < totalStages - 1 && (
        <div className="hacker-modal-backdrop" style={{ pointerEvents: 'auto' }}>
          <div className="hacker-dialog-card victory-card" style={{ pointerEvents: 'auto' }}>
            <div className="dialog-badge victory-badge">
              <ShieldCheck size={14} />
              <span>SECTOR BREACHED</span>
            </div>
            <h2 className="dialog-title victory-title">SUB-GATEWAY CLEARED</h2>
            <p className="dialog-desc">
              Power grid successfully aligned. Security gateway decrypted. Advancing to the next perimeter layer...
            </p>
            <button
              type="button"
              className="dialog-btn-primary victory-next-btn"
              onClick={onNextStage}
              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
            >
              <Zap size={16} />
              <span>INITIATE STAGE 0{stageIndex + 2}</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. MODAL: STAGE 3 COUNTDOWN FAILURE */}
      {isGameOver && (
        <div className="hacker-modal-backdrop" style={{ pointerEvents: 'auto' }}>
          <div className="hacker-dialog-card danger-card">
            <div className="dialog-badge danger-badge">
              <AlertTriangle size={14} />
              <span>TRACE DETECTED</span>
            </div>
            <h2 className="dialog-title danger-title">CONNECTION SEVERED</h2>
            <p className="dialog-desc">
              CTOS intrusion countermeasures activated before the drone core was reached. The circuit has reset.
            </p>
            <div className="dialog-btn-stack">
              <button
                type="button"
                className="dialog-btn-primary"
                onClick={onResetStage}
              >
                <RotateCcw size={16} />
                <span>RETRY OVERRIDE (3:00) [R]</span>
              </button>
              {onRetryUnlimited && (
                <button
                  type="button"
                  className="dialog-btn-secondary"
                  style={{ borderColor: 'rgba(0, 240, 255, 0.45)', color: '#00f0ff' }}
                  onClick={onRetryUnlimited}
                >
                  <ShieldCheck size={16} />
                  <span>OVERRIDE WITH UNLIMITED TIME</span>
                </button>
              )}
              <button
                type="button"
                className="dialog-btn-secondary"
                onClick={onExitHackerMode}
              >
                <span>RETURN TO PORTFOLIO</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: FINAL SYSTEM OVERRIDE VICTORY */}
      {isVictory && stageIndex === totalStages - 1 && (
        <div className="hacker-modal-backdrop" style={{ pointerEvents: 'auto' }}>
          <div className="hacker-dialog-card final-victory-card">
            <div className="dialog-badge final-badge">
              <Trophy size={14} />
              <span>DEDSEC // ROOT OVERRIDE GRANTED</span>
            </div>
            <h2 className="dialog-title final-title">FACILITY ROOT COMPLETED</h2>

            <div className="hacker-clearance-badge">
              <div className="clearance-hex-icon">
                <ShieldCheck size={32} color="#10b981" />
              </div>
              <div className="clearance-details">
                <span className="clearance-rank">SECURITY CLEARANCE: LEVEL 5 ROOT</span>
                <strong className="clearance-code">0x_DEDSEC_GHOST_ROOT</strong>
                <span className="clearance-sub">PORTFOLIO EASTER EGG UNLOCKED</span>
              </div>
            </div>

            <div className="secret-transmission-box">
              <div className="transmission-header">
                <Terminal size={12} />
                <span>ENCRYPTED TRANSMISSION // MR. WHITE HAT</span>
              </div>
              <p className="transmission-text">
                "You cracked the internal CTOS mesh network across the entire studio architecture. Most visitors only see the surface—few delve into the physical conduits. Keep this clearance code. Welcome to the inner circle."
              </p>
            </div>

            <div className="final-stats-row">
              <div className="stat-chip">
                <span className="stat-label">TOTAL TIME</span>
                <strong className="stat-val">{totalElapsedSeconds.toFixed(1)}s</strong>
              </div>
              <div className="stat-chip">
                <span className="stat-label">SECTORS</span>
                <strong className="stat-val">3 / 3 COMPLETED</strong>
              </div>
              <div className="stat-chip">
                <span className="stat-label">STATUS</span>
                <strong className="stat-val" style={{ color: '#10b981' }}>UNRESTRICTED</strong>
              </div>
            </div>

            <div className="dialog-btn-stack">
              <button
                type="button"
                className="dialog-btn-primary"
                onClick={handleCopyCode}
              >
                <Code2 size={16} />
                <span>{copiedCode ? 'CLEARANCE COPIED!' : 'COPY CLEARANCE CIPHER'}</span>
              </button>
              <button
                type="button"
                className="dialog-btn-secondary"
                onClick={onExitHackerMode}
              >
                <span>RETURN TO PORTFOLIO [ROOT BADGE APPLIED]</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
