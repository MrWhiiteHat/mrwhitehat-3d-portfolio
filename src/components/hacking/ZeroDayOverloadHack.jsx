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
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'pwn-heap-race-condition';
const REVEALED_FLAG = 'FLAG{heap_overflow_uaf_zero_day_unlocked}';

const TARGET_RODS = [75, 40, 90, 60];

export default function ZeroDayOverloadHack({ onSolved, onBypass, playerData }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [rods, setRods] = useState([20, 80, 30, 10]);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const isAligned = useMemo(() => {
    return rods.every((val, i) => Math.abs(val - TARGET_RODS[i]) <= 7);
  }, [rods]);

  useEffect(() => {
    if (isAligned && !solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => {
        onSolved?.();
      }, 1500);
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

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, manualFlag);
    if (res.success || res.duplicate) {
      setSolved(true);
      setFlagFeedback({ success: true, text: res.message });
      setTimeout(() => onSolved?.(), 1200);
    } else {
      setFlagFeedback({ success: false, text: res.message });
    }
  };

  return (
    <div className="hack-puzzle-container zero-day-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Terminal size={14} className="hack-icon-pulse text-red-500" />
          <span>CTF MISSION // BINARY EXPLOITATION: ZERO-DAY HEAP OVERFLOW & UAF</span>
        </div>

        <div className="hack-actions-right">
          <SpeedrunTimer
            isRunning={!solved}
            isSolved={solved}
            puzzleId="secret_vault"
            onFinish={handleTimerFinish}
          />
          <span className="hack-status-badge text-rose-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 500} PTS`}
          </span>
          <button
            className="hack-bypass-btn text-red-400"
            onClick={() => {
              playZapSound();
              onBypass();
            }}
            title="Recruiter Fast View"
          >
            RECRUITER BYPASS ⚡
          </button>
        </div>
      </div>

      <div className="hack-instructions">
        <p className="text-xs text-slate-300">
          Exploit multithreaded Use-After-Free heap race conditions in the Black Hat Vault cache. Calibrate all 4 memory allocator bins to harmonic targets before thread locks synchronize.
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
                <span className="rod-tag">TCACHE_0{idx + 1}</span>
                <span className="rod-val">{val}%</span>
              </div>

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

      {/* MANUAL FLAG SUBMISSION STRIP */}
      <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={manualFlag}
          onChange={(e) => setManualFlag(e.target.value)}
          placeholder="Or submit flag: FLAG{...}"
          className="flex-1 bg-black/50 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-rose-500"
        />
        <button
          type="submit"
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded text-xs transition"
        >
          SUBMIT
        </button>
      </form>

      {flagFeedback && (
        <div className={`mt-2 text-xs p-1.5 rounded ${flagFeedback.success ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
          {flagFeedback.text}
        </div>
      )}

      {solved ? (
        <div className="hack-success-banner zero-day-success mt-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-bold text-emerald-300">HEAP EXPLOIT SATURATED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+500 CTF PTS Awarded to Profile · Vault Unsealed</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" style={{ background: '#f43f5e' }} />
          <span>Tune memory bins within target windows: 75%, 40%, 90%, 60% to overwrite chunk metadata</span>
        </div>
      )}
    </div>
  );
}
