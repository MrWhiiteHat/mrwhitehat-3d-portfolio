import React, { useState, useEffect, useRef } from 'react';
import { Award, CheckCircle2, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';

const TIERS = [
  { tier: 1, label: 'PORT_8080 // PERIMETER', targetStart: 80, targetEnd: 160, speed: 2.2 },
  { tier: 2, label: 'TLS_TUNNEL // HANDSHAKE', targetStart: 200, targetEnd: 270, speed: 3.1 },
  { tier: 3, label: 'ROOT_AIRGAP // OVERRIDE', targetStart: 310, targetEnd: 360, speed: 4.2 },
];

export default function TimingScannerHack({ onSolved, onBypass }) {
  const [currentTierIdx, setCurrentTierIdx] = useState(0);
  const [needleAngle, setNeedleAngle] = useState(0);
  const [solved, setSolved] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);

  const currentTier = TIERS[currentTierIdx] || TIERS[0];

  // Rotate needle smoothly
  useEffect(() => {
    if (solved) return;

    const animate = (time) => {
      if (lastTimeRef.current != null) {
        const delta = (time - lastTimeRef.current) / 1000;
        setNeedleAngle((prev) => (prev + currentTier.speed * 85 * delta) % 360);
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [currentTier.speed, solved]);

  const handleInject = () => {
    if (solved) return;

    // Check if needleAngle is within targetStart and targetEnd
    const angle = needleAngle;
    const { targetStart, targetEnd } = currentTier;
    const isHit = angle >= targetStart && angle <= targetEnd;

    if (isHit) {
      if (currentTierIdx >= TIERS.length - 1) {
        setSolved(true);
        playBreachFanfare();
        setTimeout(() => {
          onSolved();
        }, 1100);
      } else {
        playHackingBeep(1100 + currentTierIdx * 250);
        setCurrentTierIdx((prev) => prev + 1);
      }
    } else {
      playClickSound(320, 0.12);
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 350);
    }
  };

  return (
    <div
      className={`hack-puzzle-container timing-hack ${errorFlash ? 'flash-error' : ''}`}
      onClick={handleInject}
    >
      <div className="hack-header-bar">
        <div className="hack-title">
          <ShieldAlert size={14} className="hack-icon-pulse" />
          <span>FIREWALL_BREACH // RADAR_INTRUSION.exe</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge">
            {solved ? 'AIRGAP_BREACHED' : `TIER_${currentTierIdx + 1}/3`}
          </span>
          <button
            className="hack-bypass-btn"
            onClick={(e) => {
              e.stopPropagation();
              playZapSound();
              onBypass();
            }}
            title="Instant Reveal"
          >
            DEV_BYPASS ⚡
          </button>
        </div>
      </div>

      <div className="hack-instructions">
        <p>
          Hit <strong className="hl-green">[INJECT PAYLOAD]</strong> or click anywhere when the
          scanning radar aligns inside the <span className="hl-green">GREEN TARGET SECTOR</span>.
        </p>
      </div>

      {/* Circular Radar Port Display */}
      <div className="radar-stage">
        <div className="radar-circle">
          {/* Target Arc Sector Ring */}
          <svg className="radar-svg" viewBox="0 0 200 200">
            {/* Background Circle */}
            <circle cx="100" cy="100" r="85" className="radar-bg-circle" />
            <circle cx="100" cy="100" r="55" className="radar-inner-circle" />
            <circle cx="100" cy="100" r="25" className="radar-center-circle" />

            {/* Target Green Sector Arc */}
            <circle
              cx="100"
              cy="100"
              r="85"
              className="radar-target-arc"
              style={{
                strokeDasharray: `${((currentTier.targetEnd - currentTier.targetStart) / 360) * 534} 534`,
                strokeDashoffset: `${-(currentTier.targetStart / 360) * 534}`,
              }}
            />
          </svg>

          {/* Rotating Scanning Laser Needle */}
          <div
            className="radar-needle"
            style={{ transform: `rotate(${needleAngle}deg)` }}
          >
            <div className="needle-line" />
            <div className="needle-sensor" />
          </div>

          {/* Center Breached Tiers Status */}
          <div className="radar-center-hud">
            <span className="tier-tag">TIER {currentTierIdx + 1}</span>
            <span className="tier-status">{currentTier.label.split('//')[0]}</span>
          </div>
        </div>

        {/* Tiers Progress Pips */}
        <div className="tier-progress-row">
          {TIERS.map((t, idx) => (
            <div
              key={t.tier}
              className={`tier-pip ${
                idx < currentTierIdx ? 'pip-passed' : idx === currentTierIdx ? 'pip-active' : ''
              }`}
            >
              <span>0{t.tier}</span>
              <small>{idx < currentTierIdx ? 'BYPASSED' : idx === currentTierIdx ? 'SCANNING' : 'LOCKED'}</small>
            </div>
          ))}
        </div>
      </div>

      {solved ? (
        <div className="hack-success-banner">
          <CheckCircle2 size={16} />
          <span>AIRGAP OVERRIDDEN // PROJECTOR BEAM READY</span>
        </div>
      ) : (
        <button
          className="hack-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleInject();
          }}
        >
          <Zap size={14} />
          <span>INJECT EXPLOIT AT WINDOW (CLICK / SPACE)</span>
        </button>
      )}
    </div>
  );
}
