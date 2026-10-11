import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { playBreachFanfare, playClickSound, playZapSound } from '../../utils/audio.js';

const TARGET_CODE = [1, 3, 3, 7]; // Classic "1337" Elite Hacker clearance code

export default function CipherDialHack({ onSolved, onBypass }) {
  const [dials, setDials] = useState([4, 1, 8, 2]);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    const isMatch = dials.every((d, i) => d === TARGET_CODE[i]);
    if (isMatch && !solved) {
      setSolved(true);
      playBreachFanfare();
      setTimeout(() => {
        onSolved();
      }, 1100);
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

  return (
    <div className="hack-puzzle-container cipher-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Lock size={14} className="hack-icon-pulse" />
          <span>DOSSIER_SECURITY // BIOMETRIC_CLEARANCE_CIPHER</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge">
            {solved ? 'CLEARANCE_GRANTED' : 'RESTRICTED_ACCESS'}
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
          Align the cryptographic tumblers using proximity sensors to match the executive
          authorization code.
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
              {/* Proximity Direction Hint */}
              <div className="wheel-hint">
                {isCorrect ? (
                  <span className="hint-ok">✔ MATCH</span>
                ) : isHigher ? (
                  <span className="hint-up">▲ HIGHER</span>
                ) : (
                  <span className="hint-down">▼ LOWER</span>
                )}
              </div>

              {/* Up Button */}
              <button
                className="dial-btn"
                onClick={() => stepDial(i, 1)}
                disabled={isCorrect || solved}
                aria-label="Increase digit"
              >
                <ChevronUp size={16} />
              </button>

              {/* Center Digit Window */}
              <div className="dial-value-display">
                <span>{digit}</span>
              </div>

              {/* Down Button */}
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

      {solved ? (
        <div className="hack-success-banner">
          <CheckCircle2 size={16} />
          <span>IDENTITY VERIFIED // DOSSIER DECRYPTED</span>
        </div>
      ) : (
        <div className="hack-hint-bar">
          <span className="live-blip" />
          <span>Proximity sensors active · Tumblers indicate high / low status</span>
        </div>
      )}
    </div>
  );
}
