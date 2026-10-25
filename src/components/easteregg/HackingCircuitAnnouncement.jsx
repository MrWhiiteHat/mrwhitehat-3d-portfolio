import React, { useEffect } from 'react';
import { Eye, ShieldAlert, Sparkles, Terminal, X, Zap } from 'lucide-react';
import { playGlitchTransition } from './easterEggAudio.js';

export default function HackingCircuitAnnouncement({
  onInvestigate,
  onSkip,
}) {
  useEffect(() => {
    playGlitchTransition();
  }, []);

  return (
    <div className="hacker-announcement-overlay" role="dialog" aria-modal="true">
      <div className="hacker-announcement-card">
        {/* Animated Scanline Glitch Overlay */}
        <div className="announcement-scanlines" />

        <div className="announcement-header">
          <div className="announcement-alert-badge">
            <span className="announcement-pulse-dot" />
            <ShieldAlert size={14} className="announcement-badge-icon" />
            <span>UNAUTHORIZED BROADCAST DETECTED</span>
          </div>
          <button
            type="button"
            className="announcement-close-btn"
            onClick={onSkip}
            title="Skip & Return to Portfolio (Esc)"
            aria-label="Skip"
          >
            <X size={16} />
          </button>
        </div>

        <div className="announcement-content">
          <h2 className="announcement-title">
            <span className="glitch-word" data-text="SYSTEM OVERRIDE DETECTED">
              SYSTEM OVERRIDE DETECTED
            </span>
          </h2>

          <div className="announcement-subtitle">
            An encrypted signal has been discovered.
          </div>

          <div className="announcement-body-box">
            <div className="body-box-header">
              <Terminal size={12} />
              <span>CTOS PHYSICAL MESH FREQUENCY // UNMASKED</span>
            </div>
            <p className="body-box-text">
              By breaching all facility sectors, an encrypted network routing
              circuit has been exposed across the studio geometry. Tracing this
              3D signal initiates an interactive physical network bypass.
            </p>
          </div>
        </div>

        <div className="announcement-actions">
          <button
            type="button"
            className="announcement-btn-investigate"
            onClick={onInvestigate}
          >
            <Zap size={16} />
            <span>INVESTIGATE</span>
          </button>

          <button
            type="button"
            className="announcement-btn-skip"
            onClick={onSkip}
          >
            <span>SKIP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
