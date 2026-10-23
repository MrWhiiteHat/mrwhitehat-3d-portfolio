import React, { useEffect, useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  Radio,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';
import SpeedrunTimer from '../leaderboard/SpeedrunTimer.jsx';
import { recordSolveTime } from '../../utils/speedrunLeaderboardService.js';

const TARGET_RODS = [75, 40, 90, 60];

export default function ZeroDayOverloadHack({ onSolved, onBypass, playerData }) {
  const [rods, setRods] = useState([20, 80, 30, 10]);
  const [entropy, setEntropy] = useState(15);
  const [solved, setSolved] = useState(false);

  // Check if rods are close to targets (within +- 6%)
  const isAligned = useMemo(() => {
    return rods.every((val, i) => Math.abs(val - TARGET_RODS[i]) <= 7);
  }, [rods]);

  // Handle victory
  useEffect(() => {
    if (isAligned && !solved) {
      setSolved(true);
      playBreachFanfare();
      setTimeout(() => {
        onSolved();
      }, 1200);
    }
  }, [isAligned, solved, onSolved]);

  const handleAdjust = (index, delta) => {
    if (solved) return;
    playHackingBeep(1200 + index * 180);
    setRods((prev) => {
      const next = [...prev];
      let val = next[index] + delta;
      if (val < 0) val = 0;
      if (val > 100) val = 100;
      next[index] = val;
      return next;
    });
  };

  const handleTimerFinish = (timeSec) => {
    recordSolveTime('secret_vault', timeSec, playerData);
  };

  return (
    <div className="hack-puzzle-container zero-day-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Terminal size={14} className="hack-icon-pulse text-red" />
          <span>BLACK_HAT // ZERO_DAY_CORE_OVERLOAD.sh</span>
        </div>

        <div className="hack-actions-right">
          <SpeedrunTimer
            isRunning={!solved}
            isSolved={solved}
            puzzleId="secret_vault"
            onFinish={handleTimerFinish}
          />
          <button
            className="hack-bypass-btn text-red"
            onClick={() => {
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
          Critical Zero-Day exploit detected! Calibrate all 4 reactor containment rods to their{' '}
          <strong className="hl-cyan">HARMONIC TARGETS</strong> to prevent root core overload.
        </p>
      </div>

      {/* 4 Reactor Dampener Rods */}
      <div className="reactor-rods-grid">
        {rods.map((val, idx) => {
          const target = TARGET_RODS[idx];
          const diff = Math.abs(val - target);
          const isTargetMatched = diff <= 7;

          return (
            <div
              key={idx}
              className={`rod-channel ${isTargetMatched ? 'matched' : ''}`}
            >
              <div className="rod-header">
                <span className="rod-tag">ROD_0{idx + 1}</span>
                <span className="rod-val">{val}%</span>
              </div>

              {/* Vertical Visual Fuel Rod */}
              <div className="rod-track">
                <div
                  className="rod-target-line"
                  style={{ bottom: `${target}%` }}
                  title={`Target: ${target}%`}
                >
                  <span className="target-pill">TGT {target}%</span>
                </div>
                <div
                  className="rod-fill"
                  style={{
                    height: `${val}%`,
                    backgroundColor: isTargetMatched ? '#34d399' : '#f43f5e',
                  }}
                />
              </div>

              {/* Tuning Arrow Buttons */}
              <div className="rod-controls">
                <button
                  type="button"
                  className="rod-btn"
                  onClick={() => handleAdjust(idx, 10)}
                  disabled={solved}
                >
                  ▲ +10
                </button>
                <button
                  type="button"
                  className="rod-btn"
                  onClick={() => handleAdjust(idx, -10)}
                  disabled={solved}
                >
                  ▼ -10
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {solved ? (
        <div className="hack-success-banner zero-day-success">
          <CheckCircle2 size={16} />
          <span>ZERO-DAY CONTAINED // ROOT BLACK HAT CLEARANCE GRANTED</span>
        </div>
      ) : (
        <div className="hack-hint-bar">
          <span className="live-blip" style={{ background: '#f43f5e' }} />
          <span>Adjust rods until all 4 channels align within the harmonic resonance window.</span>
        </div>
      )}
    </div>
  );
}
