import React, { useState, useEffect, useRef } from 'react';
import { Award, CheckCircle2, ShieldAlert, Sparkles, Zap, Terminal } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'web-sidechannel-timing';
const REVEALED_FLAG = 'FLAG{side_channel_timing_leak_enumerated}';

const TIERS = [
  { tier: 1, label: 'BYTE 0 // TIME DELTA: 12.4ms', targetStart: 80, targetEnd: 160, speed: 2.2 },
  { tier: 2, label: 'BYTE 1 // TIME DELTA: 24.8ms', targetStart: 200, targetEnd: 270, speed: 3.1 },
  { tier: 3, label: 'BYTE 2 // TIME DELTA: 37.1ms', targetStart: 310, targetEnd: 360, speed: 4.2 },
];

export default function TimingScannerHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [currentTierIdx, setCurrentTierIdx] = useState(0);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [errorFlash, setErrorFlash] = useState(false);
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const needleRef = useRef(null);
  const needleAngleRef = useRef(0);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const currentTierRef = useRef(TIERS[0]);

  const currentTier = TIERS[currentTierIdx] || TIERS[0];
  currentTierRef.current = currentTier;

  useEffect(() => {
    if (solved) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const animate = (time) => {
      if (lastTimeRef.current != null) {
        const delta = Math.min(0.05, (time - lastTimeRef.current) / 1000);
        needleAngleRef.current = (needleAngleRef.current + currentTierRef.current.speed * 85 * delta) % 360;

        if (needleRef.current) {
          needleRef.current.style.transform = `rotate(${needleAngleRef.current.toFixed(1)}deg)`;
        }
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [solved, currentTierIdx]);

  const handleInject = () => {
    if (solved) return;

    const angle = needleAngleRef.current;
    const { targetStart, targetEnd } = currentTierRef.current;
    const isHit = angle >= targetStart && angle <= targetEnd;

    if (isHit) {
      if (currentTierIdx >= TIERS.length - 1) {
        setSolved(true);
        ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
        playBreachFanfare();
        setTimeout(() => {
          onSolved?.();
        }, 1500);
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
    <div
      className={`hack-puzzle-container timing-hack ${errorFlash ? 'flash-error' : ''}`}
      onClick={handleInject}
    >
      <div className="hack-header-bar">
        <div className="hack-title">
          <ShieldAlert size={14} className="hack-icon-pulse text-amber-400" />
          <span>CTF MISSION // WEB EXPLOITATION: SIDE-CHANNEL TIMING ATTACK</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 350} PTS`}
          </span>
          <button
            className="hack-bypass-btn"
            onClick={(e) => {
              e.stopPropagation();
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
          Exploit `strcmp` microsecond side-channel latency differences. Click or tap inside the <strong className="text-emerald-400">GREEN RESONANCE GATE</strong> to pinpoint and leak the secret authorization token bytes.
        </p>
      </div>

      {/* Circular Radar Port Display */}
      <div className="radar-stage">
        <div className="radar-circle">
          <svg className="radar-svg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="85" className="radar-bg-circle" />
            <circle cx="100" cy="100" r="55" className="radar-inner-circle" />
            <circle cx="100" cy="100" r="25" className="radar-center-circle" />

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

          <div
            className="radar-needle"
            ref={needleRef}
            style={{ transform: 'rotate(0deg)', willChange: 'transform' }}
          >
            <div className="needle-line" />
            <div className="needle-sensor" />
          </div>

          <div className="radar-center-hud">
            <span className="tier-tag">GATE {currentTierIdx + 1}/3</span>
            <span className="tier-status">{currentTier.label.split('//')[0]}</span>
          </div>
        </div>

        <div className="tier-progress-row">
          {TIERS.map((t, idx) => (
            <div
              key={t.tier}
              className={`tier-pip ${
                idx < currentTierIdx ? 'pip-passed' : idx === currentTierIdx ? 'pip-active' : ''
              }`}
            >
              <span>0{t.tier}</span>
              <small>{idx < currentTierIdx ? 'EXTRACTED' : idx === currentTierIdx ? 'SAMPLING' : 'WAITING'}</small>
            </div>
          ))}
        </div>
      </div>

      {/* MANUAL FLAG SUBMISSION STRIP */}
      <form
        onSubmit={handleManualSubmit}
        className="mt-3 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={manualFlag}
          onChange={(e) => setManualFlag(e.target.value)}
          placeholder="Or submit flag: FLAG{...}"
          className="flex-1 bg-black/50 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-1 rounded text-xs transition"
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
        <div className="hack-success-banner mt-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-bold text-emerald-300">SIDE-CHANNEL EXPLOITED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+350 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : (
        <button
          className="hack-action-btn mt-3"
          onClick={(e) => {
            e.stopPropagation();
            handleInject();
          }}
        >
          <Zap size={14} />
          <span>SAMPLE LATENCY WINDOW (CLICK / TAP)</span>
        </button>
      )}
    </div>
  );
}
