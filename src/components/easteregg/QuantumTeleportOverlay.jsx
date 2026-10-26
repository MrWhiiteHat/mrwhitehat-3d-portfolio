import React, { useEffect, useState } from 'react';
import { Radio, Sparkles, Terminal, Zap } from 'lucide-react';

/**
 * QuantumTeleportOverlay
 * High-tech cinematic sci-fi teleportation / quantum warp sequence
 * Triggered when transitioning between the studio and the classified secret bunker.
 */
export default function QuantumTeleportOverlay({
  isActive = false,
  title = 'QUANTUM TUNNELING INITIATED // AIR-GAP SECTOR',
  message = 'WARPING TO CLASSIFIED UNDERGROUND FACILITY...',
  subMessage = 'COORDINATES: LAT 37.7749° N, LONG 122.4194° W • ELEVATION: -42.8M (SUB-LEVEL 03)',
}) {
  const [teleportPhase, setTeleportPhase] = useState('idle'); // 'idle' | 'charging' | 'flash' | 'dissolving'

  useEffect(() => {
    if (isActive) {
      setTeleportPhase('charging');
      const t1 = setTimeout(() => setTeleportPhase('flash'), 350);
      const t2 = setTimeout(() => setTeleportPhase('dissolving'), 750);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setTeleportPhase('idle');
    }
  }, [isActive]);

  if (!isActive && teleportPhase === 'idle') return null;

  return (
    <div className={`quantum-teleport-overlay ${teleportPhase}`}>
      {/* 1. Hyperspace Cyber Rings */}
      <div className="teleport-warp-rings">
        <span className="warp-ring ring-1" />
        <span className="warp-ring ring-2" />
        <span className="warp-ring ring-3" />
        <span className="warp-ring ring-4" />
      </div>

      {/* 2. Quantum Particle Glitch Scanlines */}
      <div className="teleport-scanlines" />
      <div className="teleport-noise-layer" />

      {/* 3. Central Telemetry HUD Card */}
      <div className="teleport-hud-card">
        <div className="teleport-status-pill">
          <Zap size={14} className="teleport-zap-pulse" />
          <span>{title}</span>
        </div>

        <h2 className="teleport-main-message">{message}</h2>
        <p className="teleport-coordinates-sub">{subMessage}</p>

        {/* Dynamic Telemetry Hex Indicators */}
        <div className="teleport-hex-readouts">
          <div className="hex-metric">
            <span className="metric-lbl">FLUX DENSITY</span>
            <strong className="metric-val">99.87 TeV</strong>
          </div>
          <div className="hex-metric">
            <span className="metric-lbl">AIR-GAP BYPASS</span>
            <strong className="metric-val" style={{ color: '#00f0ff' }}>100% SECURE</strong>
          </div>
          <div className="hex-metric">
            <span className="metric-lbl">TIMELINE DRIFT</span>
            <strong className="metric-val" style={{ color: '#22c55e' }}>0.000 ms</strong>
          </div>
        </div>

        {/* Warp Stream Progress Bar */}
        <div className="teleport-progress-track">
          <div className="teleport-progress-fill" />
        </div>
      </div>
    </div>
  );
}
