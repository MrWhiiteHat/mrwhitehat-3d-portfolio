import React, { useState, useEffect, useRef } from 'react';
import { Activity, CheckCircle2, Radio, Send, Volume2 } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';

export default function WaveformTunerHack({ onSolved, onBypass }) {
  const [playerFreq, setPlayerFreq] = useState(2.0);
  const [playerAmp, setPlayerAmp] = useState(0.4);
  const [solved, setSolved] = useState(false);
  const [lockProgress, setLockProgress] = useState(0);

  // Hidden Target Carrier Wave parameters
  const targetFreq = 4.5;
  const targetAmp = 0.8;

  // Compute Coherence Percentage (0 to 100%)
  const freqDiff = Math.abs(playerFreq - targetFreq);
  const ampDiff = Math.abs(playerAmp - targetAmp);
  const coherence = Math.max(0, Math.min(100, Math.round(100 - freqDiff * 22 - ampDiff * 45)));

  // If coherence is above 90%, increment lock progress
  useEffect(() => {
    if (solved) return;

    if (coherence >= 90) {
      playHackingBeep(1200);
      const interval = setInterval(() => {
        setLockProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setSolved(true);
            playBreachFanfare();
            setTimeout(() => {
              onSolved();
            }, 1000);
            return 100;
          }
          return prev + 25;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setLockProgress(0);
    }
  }, [coherence, solved, onSolved]);

  // Generate SVG wave points
  const points = 60;
  const width = 360;
  const height = 110;
  const midY = height / 2;

  const targetPath = Array.from({ length: points })
    .map((_, i) => {
      const x = (i / (points - 1)) * width;
      const y = midY + Math.sin((i / 8) * targetFreq) * (targetAmp * 40);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const playerPath = Array.from({ length: points })
    .map((_, i) => {
      const x = (i / (points - 1)) * width;
      const y = midY + Math.sin((i / 8) * playerFreq) * (playerAmp * 40);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="hack-puzzle-container wave-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Radio size={14} className="hack-icon-pulse" />
          <span>SIGNAL_INTERCEPT // OSCILLOSCOPE_TUNE.rf</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge">
            {solved ? 'SIGNAL_LOCKED' : `${coherence}% COHERENCE`}
          </span>
          <button
            className="hack-bypass-btn"
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
          Adjust <strong className="hl-green">FREQUENCY</strong> and{' '}
          <strong className="hl-cyan">AMPLITUDE</strong> sliders to match the intercepted carrier
          waveform until resonance hits 100%.
        </p>
      </div>

      {/* Waveform Oscilloscope Screen */}
      <div className="oscilloscope-screen">
        <div className="screen-grid-lines" />
        <svg className="wave-svg" viewBox={`0 0 ${width} ${height}`}>
          {/* Target Reference Wave (Ghost White / Red Dotted) */}
          <path d={targetPath} className="target-wave" />
          {/* Player Tuned Wave (Neon Green) */}
          <path d={playerPath} className="player-wave" />
        </svg>

        {/* Lock Progress Indicator Overlay */}
        {lockProgress > 0 && !solved && (
          <div className="lock-hud">
            <span>SYNCHRONIZING CARRIER: {lockProgress}%</span>
            <div className="lock-bar-track">
              <div className="lock-bar-fill" style={{ width: `${lockProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Sliders Controls */}
      <div className="tuner-controls">
        <div className="control-slider-group">
          <div className="slider-label-row">
            <span>MODULATION FREQUENCY:</span>
            <strong>{playerFreq.toFixed(1)} GHz</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="8.0"
            step="0.1"
            value={playerFreq}
            onChange={(e) => setPlayerFreq(parseFloat(e.target.value))}
            className="hack-range-input"
            disabled={solved}
          />
        </div>

        <div className="control-slider-group">
          <div className="slider-label-row">
            <span>CARRIER AMPLITUDE:</span>
            <strong>{Math.round(playerAmp * 100)}%</strong>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={playerAmp}
            onChange={(e) => setPlayerAmp(parseFloat(e.target.value))}
            className="hack-range-input"
            disabled={solved}
          />
        </div>
      </div>

      {solved ? (
        <div className="hack-success-banner">
          <CheckCircle2 size={16} />
          <span>RESONANCE LOCKED // DISPATCH CHANNELS UNSEALED</span>
        </div>
      ) : (
        <div className="hack-hint-bar">
          <span className="live-blip" />
          <span>Target wave: Ghost Trace · Your wave: Neon Pulse</span>
        </div>
      )}
    </div>
  );
}
