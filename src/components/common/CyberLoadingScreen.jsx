import React, { useEffect, useState, useRef } from 'react';
import { useProgress } from '@react-three/drei';
import { ShieldCheck, Cpu, Terminal, Zap, CheckCircle2 } from 'lucide-react';
import { playClickSound, playHackingBeep } from '../../utils/audio.js';

const SYSTEM_LOGS = [
  'INITIALIZING WEBGL 2.0 GRAPHICS ENGINE',
  'DECOMPRESSING 3D SCANNED ASSETS & GLTF BUFFERS',
  'PARSING ARCHITECTURAL GEOMETRIES & COLLISION AABBs',
  'COMPILING PBR SHADERS & NORMAL MAP CHANNELS',
  'MOUNTING 11 INTERACTIVE CYBERSECURITY TERMINALS',
  'SYNCHRONIZING SOC WORLD CLOCKS & DYNAMIC LIGHTING',
  'PRE-WARMING GPU SHADER PROGRAMS INTO VRAM',
  'ALL SYSTEMS SYNCHRONIZED // CLEARANCE GRANTED',
];

export default function CyberLoadingScreen({ isSceneReady = false, onFinish }) {
  const { active, progress, loaded, total, item } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [logIndex, setLogIndex] = useState(0);
  const finishTriggered = useRef(false);
  const soundPlayed = useRef(false);

  // Smoothly increment displayProgress towards target progress
  useEffect(() => {
    const targetProgress = Math.max(
      progress,
      isSceneReady ? 100 : (loaded > 0 && total > 0 ? (loaded / total) * 90 : 25)
    );

    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Accelerate smoothly towards target
        const diff = targetProgress - prev;
        const step = Math.max(1, Math.ceil(diff * 0.15));
        const next = Math.min(targetProgress, prev + step);
        return next;
      });
    }, 35);

    return () => clearInterval(timer);
  }, [progress, loaded, total, isSceneReady]);

  // Advance terminal logs as progress increases
  useEffect(() => {
    const targetLogIndex = Math.min(
      SYSTEM_LOGS.length - 1,
      Math.floor((displayProgress / 100) * (SYSTEM_LOGS.length - 1))
    );
    setLogIndex(targetLogIndex);
  }, [displayProgress]);

  // Handle load completion when progress hits 100% and scene is pre-warmed
  useEffect(() => {
    if (displayProgress >= 100 && isSceneReady && !finishTriggered.current) {
      finishTriggered.current = true;

      if (!soundPlayed.current) {
        soundPlayed.current = true;
        playHackingBeep(1400);
      }

      // Brief hold at 100% for smooth visual payoff, then fade out
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 400);

      const finishTimer = setTimeout(() => {
        onFinish?.();
      }, 950);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [displayProgress, isSceneReady, onFinish]);

  // Failsafe timeout so visitor is never trapped on loading screen
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (!finishTriggered.current) {
        setDisplayProgress(100);
        finishTriggered.current = true;
        if (!soundPlayed.current) {
          soundPlayed.current = true;
          playHackingBeep(1400);
        }
        setIsFading(true);
        setTimeout(() => {
          onFinish?.();
        }, 500);
      }
    }, 2800);

    return () => clearTimeout(safetyTimer);
  }, [onFinish]);

  // Format current asset filename for the ticker
  const currentAsset = item
    ? item.split('/').pop().split('?')[0]
    : 'architectural_buffers.bin';

  return (
    <div
      className={`cyber-loading-screen ${isFading ? 'fade-out' : ''}`}
      aria-label="Loading 3D Workspace"
    >
      {/* Background Matrix Grid Overlay */}
      <div className="cyber-loading-grid" />

      {/* Main Terminal Loading Container */}
      <div className="cyber-loading-card">
        {/* Top Header Badge */}
        <div className="loading-card-header">
          <div className="loading-status-badge">
            <span className="pulse-dot" />
            <span className="badge-text">KERNEL INIT // MR. WHITEHAT SECURITY LABS</span>
          </div>
          <span className="protocol-text">STAGE 01: HARDWARE ACCESS</span>
        </div>

        {/* Center Holographic Reticle Radar */}
        <div className="loading-radar-wrap">
          <div className="radar-outer-ring" />
          <div className="radar-scanner-sweep" />
          <div className="radar-center-core">
            <Cpu size={32} className="radar-cpu-icon" />
            <span className="radar-pct-number">{Math.round(displayProgress)}%</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="loading-progress-section">
          <div className="progress-labels">
            <span className="loading-caption">
              {displayProgress >= 100 ? 'SYSTEM READY' : 'PRE-LOADING 3D ARCHITECTURE & PBR SHADERS'}
            </span>
            <span className="loading-counter-text">
              {loaded > 0 ? `${loaded} / ${Math.max(total, loaded)} ASSETS` : `${Math.round(displayProgress)}%`}
            </span>
          </div>

          <div className="cyber-progress-track">
            <div
              className="cyber-progress-fill"
              style={{ width: `${displayProgress}%` }}
            >
              <div className="cyber-progress-glow-tip" />
            </div>
          </div>
        </div>

        {/* Active Asset Ticker */}
        <div className="loading-asset-ticker">
          <Terminal size={13} className="ticker-icon" />
          <span className="ticker-label">ACTIVE STREAM:</span>
          <span className="ticker-asset-name">{currentAsset}</span>
        </div>

        {/* Security Terminal Log Feed */}
        <div className="loading-log-feed">
          {SYSTEM_LOGS.slice(0, logIndex + 1).map((log, idx) => {
            const isLatest = idx === logIndex;
            return (
              <div key={idx} className={`loading-log-line ${isLatest ? 'latest-log' : ''}`}>
                <CheckCircle2 size={12} className="log-check-icon" />
                <span className="log-text">{log}</span>
              </div>
            );
          })}
        </div>

        {/* Footer Hardware Status */}
        <div className="loading-card-footer">
          <div className="footer-tech-spec">
            <span className="spec-dot green" />
            <span>GPU PIPELINE: ACCELERATED</span>
          </div>
          <div className="footer-tech-spec">
            <span className="spec-dot green" />
            <span>SHADERS: PRE-WARMED</span>
          </div>
          <div className="footer-tech-spec">
            <span className="spec-dot green" />
            <span>AUDIO: SYNTHESIZED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
