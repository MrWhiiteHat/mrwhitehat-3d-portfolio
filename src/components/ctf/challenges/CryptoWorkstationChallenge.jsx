import React, { useState } from 'react';
import { KeyRound, Lock, Unlock, CheckCircle2, RefreshCw, Zap, Hash, Sliders } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'crypto-caesar-tumbler';
const CIPHERTEXT = 'ODVVZRU_1337_FOHDUDQFH';
const REVEALED_FLAG = 'FLAG{caesar_shift_rot3_clearance}';

function caesarShift(text, shift) {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        // Uppercase
        return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        // Lowercase
        return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
      }
      return char;
    })
    .join('');
}

export default function CryptoWorkstationChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [rotShift, setRotShift] = useState(0);
  const [activeTab, setActiveTab] = useState('caesar'); // 'caesar' | 'hash'
  const [hashInput, setHashInput] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [hashResult, setHashResult] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const decryptedText = caesarShift(CIPHERTEXT, -rotShift);
  const isTargetDecrypted = rotShift === 3 || rotShift === -23;

  const handleShiftChange = (newShift) => {
    if (solved) return;
    setRotShift(newShift);
    playClickSound(750 + Math.abs(newShift) * 20);

    if (newShift === 3 || newShift === -23) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => onSolved?.(), 1600);
    }
  };

  const handleIdentifyHash = () => {
    playHackingBeep(1300);
    const len = hashInput.trim().length;
    if (len === 32) setHashResult('Detected Algorithm: MD5 (128-bit hex digest)');
    else if (len === 40) setHashResult('Detected Algorithm: SHA-1 (160-bit hex digest)');
    else if (len === 64) setHashResult('Detected Algorithm: SHA-256 (256-bit cryptographic digest) — Hash of empty string ""');
    else setHashResult('Unknown hash signature or length.');
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
    <div className="hack-puzzle-container crypto-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <KeyRound size={15} className="text-amber-400 hack-icon-pulse" />
          <span>CRYPTOGRAPHY // INTERACTIVE CIPHER ANALYZER & FREQUENCY WORKSTATION</span>
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

      <div className="hack-instructions">
        <p className="text-xs text-slate-300">
          Analyze intercepted red team communications. Adjust the alphabetical substitution rotation displacement to decrypt the biometric authorization clearance token.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 mt-2">
        <button
          type="button"
          onClick={() => setActiveTab('caesar')}
          className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${
            activeTab === 'caesar' ? 'bg-amber-600 text-black' : 'bg-slate-900 text-slate-400'
          }`}
        >
          <Sliders size={13} />
          <span>CAESAR ROTATION SLIDER</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hash')}
          className={`px-3 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${
            activeTab === 'hash' ? 'bg-cyan-600 text-black' : 'bg-slate-900 text-slate-400'
          }`}
        >
          <Hash size={13} />
          <span>HASH IDENTIFIER</span>
        </button>
      </div>

      {activeTab === 'caesar' && (
        <div className="space-y-3 mt-3">
          {/* Intercepted Ciphertext Display */}
          <div className="p-3 bg-black border border-slate-800 rounded font-mono">
            <div className="text-[10px] text-slate-500 uppercase">// Intercepted Raw Ciphertext:</div>
            <div className="text-sm font-bold text-amber-400 tracking-wider my-1">{CIPHERTEXT}</div>
            <div className="text-[10px] text-slate-500 mt-2">// Real-Time Decrypted Plaintext Output:</div>
            <div
              className={`text-sm font-bold tracking-wider my-1 transition ${
                isTargetDecrypted ? 'text-emerald-400 animate-pulse' : 'text-cyan-300'
              }`}
            >
              {decryptedText}
            </div>
          </div>

          {/* Interactive Rotation Slider */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">ROTATION DISPLACEMENT:</span>
              <strong className="text-amber-400">ROT-{rotShift} ({rotShift > 0 ? `-${rotShift}` : `+${Math.abs(rotShift)}`})</strong>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={rotShift}
              onChange={(e) => handleShiftChange(parseInt(e.target.value, 10))}
              className="w-full hack-range-input cursor-pointer"
              disabled={solved}
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-600">
              <span>ROT 0</span>
              <span>ROT 13 (ROT13)</span>
              <span>ROT 25</span>
            </div>
          </div>

          {/* Frequency Analysis Comparison */}
          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded font-mono text-[11px] text-slate-400">
            <div className="text-cyan-400 font-bold mb-1">// Letter Frequency Distribution:</div>
            <div>Observed Dominant Glyphs: D (18.1%), V (13.6%), F (9.1%)</div>
            <div className="text-slate-500 text-[10px]">
              Target Displacement: D (-3) ➔ A, V (-3) ➔ S, F (-3) ➔ C
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hash' && (
        <div className="space-y-3 mt-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
            <label className="text-xs font-mono text-cyan-400 block">INPUT HEXADECIMAL DIGEST:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className="flex-1 bg-black border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleIdentifyHash}
                className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-3 py-1.5 rounded text-xs transition"
              >
                IDENTIFY
              </button>
            </div>
            {hashResult && (
              <div className="p-2 bg-black border border-cyan-500/30 rounded font-mono text-xs text-cyan-300">
                {hashResult}
              </div>
            )}
          </div>
        </div>
      )}

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
            <span className="font-bold text-emerald-300">CIPHERTEXT DECIPHERED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+100 CTF PTS Awarded to Profile · Executive Dossier Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Adjust slider until ROT displacement uncovers English plaintext (ROT-3)</span>
        </div>
      )}
    </div>
  );
}
