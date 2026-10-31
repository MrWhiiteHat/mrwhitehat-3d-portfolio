import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Lock, ShieldCheck, Flag, KeyRound, Sparkles } from 'lucide-react';
import { playBreachFanfare, playClickSound, playZapSound } from '../../utils/audio.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const TARGET_CODE = [1, 3, 3, 7]; // "1337" Elite Clearance Pin
const CHALLENGE_ID = 'crypto-caesar-tumbler';
const REVEALED_FLAG = 'FLAG{caesar_shift_rot3_clearance}';

export default function CipherDialHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [dials, setDials] = useState([4, 1, 8, 2]);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  useEffect(() => {
    const isMatch = dials.every((d, i) => d === TARGET_CODE[i]);
    if (isMatch && !solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => {
        onSolved?.();
      }, 1500);
    }
  }, [dials, solved, onSolved]);

  const stepDial = (index, delta) => {
    if (solved) return;
    playClickSound(800 + dials[index] * 50, 0.04);
    setDials((prev) => {
      const next = [...prev];
      let val = next[index] + delta;
      if (val < 0) val = 9;
      if (val > 9) val = 0;
      next[index] = val;
      return next;
    });
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
    <div className="hack-puzzle-container cipher-hack">
      {/* CTF MISSION HEADER */}
      <div className="hack-header-bar">
        <div className="hack-title">
          <Lock size={14} className="hack-icon-pulse text-amber-400" />
          <span>CTF MISSION // CRYPTOGRAPHY: ROT3 SHIFT CIPHER</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 100} PTS`}
          </span>
          <button
            className="hack-bypass-btn"
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

      {/* MISSION BRIEFING & CIPHERTEXT ARTIFACT */}
      <div className="hack-instructions">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound size={13} className="text-cyan-400" />
          <strong className="text-cyan-300">Intercepted Red Team Ciphertext:</strong>
        </div>
        <div className="p-2 bg-black/60 rounded border border-cyan-500/20 font-mono text-xs text-amber-300 mb-2">
          ODVVZRU_1337_FOHDUDQFH
        </div>
        <p className="text-xs text-slate-300">
          Decipher the Caesar rotation (ROT+3) to match the clearance frequency, or align the 4-digit biometric tumblers.
        </p>
      </div>

      {/* 4 Cipher Wheels */}
      <div className="dials-row">
        {dials.map((digit, i) => {
          const isCorrect = digit === TARGET_CODE[i];
          const isHigher = digit < TARGET_CODE[i];

          return (
            <div
              key={`dial-${i}`}
              className={`cipher-wheel ${isCorrect ? 'wheel-locked' : ''}`}
            >
              <div className="wheel-hint">
                {isCorrect ? (
                  <span className="hint-ok">✔ MATCH</span>
                ) : isHigher ? (
                  <span className="hint-up">▲ HIGHER</span>
                ) : (
                  <span className="hint-down">▼ LOWER</span>
                )}
              </div>

              <button
                className="dial-btn"
                onClick={() => stepDial(i, 1)}
                disabled={isCorrect || solved}
                aria-label="Increase digit"
              >
                <ChevronUp size={16} />
              </button>

              <div className="dial-value-display">
                <span>{digit}</span>
              </div>

              <button
                className="dial-btn"
                onClick={() => stepDial(i, -1)}
                disabled={isCorrect || solved}
                aria-label="Decrease digit"
              >
                <ChevronDown size={16} />
              </button>
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
            <span className="font-bold text-emerald-300">CLEARANCE GRANTED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+100 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Proximity tumblers active · Caesar shift frequency locks at 1-3-3-7</span>
        </div>
      )}
    </div>
  );
}
