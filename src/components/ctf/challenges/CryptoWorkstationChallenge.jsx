import React, { useState } from 'react';
import { KeyRound, Lock, Unlock, CheckCircle2, RefreshCw, Zap, Hash, BarChart3, AlertCircle } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'crypto-caesar-tumbler';
const ENCRYPTED_MESSAGE =
  'Khoor Rshudwlyh! Wkh vhfuhw fohdudqfh frgh wr xqorfn wkh wumrehu phfkdqlvp lv: IODJ{fdhvdu_vkliw_urw3_fohdudqfh}';

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
  const [rotShift, setRotShift] = useState(0); // Starts at 0, no shift
  const [activeTab, setActiveTab] = useState('caesar'); // 'caesar' | 'freq' | 'hash'
  const [hashInput, setHashInput] = useState('');
  const [hashResult, setHashResult] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  // Decrypt with shift backwards (-rotShift)
  const decryptedText = caesarShift(ENCRYPTED_MESSAGE, -rotShift);
  const isTargetDecrypted = rotShift === 3;

  const handleShiftChange = (newShift) => {
    setRotShift(newShift);
    playClickSound(750 + Math.abs(newShift) * 15);
  };

  const handleIdentifyHash = () => {
    playHackingBeep(1300);
    const cleaned = hashInput.trim();
    const len = cleaned.length;
    if (len === 32) setHashResult('Detected Algorithm: MD5 (128-bit hex digest)');
    else if (len === 40) setHashResult('Detected Algorithm: SHA-1 (160-bit hex digest)');
    else if (len === 64) setHashResult('Detected Algorithm: SHA-256 (256-bit cryptographic digest)');
    else if (len === 128) setHashResult('Detected Algorithm: SHA-512 (512-bit cryptographic digest)');
    else setHashResult('Unknown hash signature or unrecognized length.');
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, manualFlag);
    if (res.success || res.duplicate) {
      setSolved(true);
      setFlagFeedback({ success: true, text: res.message });
      playBreachFanfare();
      setTimeout(() => onSolved?.(), 1600);
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="hack-puzzle-container crypto-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <KeyRound size={15} className="text-amber-400 hack-icon-pulse" />
          <span>CRYPTOGRAPHY // CIPHER DECRYPTION & FREQUENCY WORKBENCH</span>
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
          Radio sensors intercepted an encrypted telegram encoded with a monoalphabetic Caesar substitution cipher. Use the decryption workbench or frequency analysis to determine the shift key, decrypt the message, and extract the flag.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 mt-2">
        <button
          type="button"
          onClick={() => setActiveTab('caesar')}
          className={`px-3 py-1 rounded text-xs font-mono transition ${activeTab === 'caesar' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
        >
          Caesar Decoder
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('freq')}
          className={`px-3 py-1 rounded text-xs font-mono transition ${activeTab === 'freq' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
        >
          Frequency Analysis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hash')}
          className={`px-3 py-1 rounded text-xs font-mono transition ${activeTab === 'hash' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
        >
          Hash Analyzer
        </button>
      </div>

      {activeTab === 'caesar' && (
        <div className="space-y-3 mt-3">
          {/* Intercepted Raw Ciphertext Box */}
          <div className="p-3 bg-black/90 border border-slate-800 rounded font-mono">
            <span className="text-[10px] text-slate-500 uppercase block mb-1">INTERCEPTED CIPHERTEXT TRANSMISSION:</span>
            <code className="text-xs text-rose-300 break-all select-all">{ENCRYPTED_MESSAGE}</code>
          </div>

          {/* Shift Slider */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300">SHIFT KEY (ROTATION):</span>
              <strong className="text-amber-400 font-bold text-sm">ROT -{rotShift} ({rotShift === 0 ? 'NO SHIFT' : `SHIFT +${rotShift}`})</strong>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={rotShift}
              onChange={(e) => handleShiftChange(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (RAW)</span>
              <span>ROT-5</span>
              <span>ROT-13</span>
              <span>25</span>
            </div>
          </div>

          {/* Live Plaintext Preview */}
          <div className={`p-3 border rounded font-mono transition ${isTargetDecrypted ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-black/90 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 uppercase block mb-1">
              LIVE DECRYPTED PLAINTEXT PREVIEW:
            </span>
            <code className={`text-xs break-all ${isTargetDecrypted ? 'text-emerald-300 font-bold select-all' : 'text-slate-300'}`}>
              {decryptedText}
            </code>
          </div>
        </div>
      )}

      {activeTab === 'freq' && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded mt-3 space-y-3 font-mono text-xs">
          <div className="text-slate-400 text-[11px]">
            In the English language, <strong>E</strong> is by far the most frequent letter (~12.7%), followed by <strong>T</strong> (~9.1%) and <strong>A</strong> (~8.2%).
          </div>
          <div className="border border-slate-800 rounded overflow-hidden">
            <table className="w-full text-left text-slate-300">
              <thead>
                <tr className="bg-slate-900 text-slate-500 text-[10px] border-b border-slate-800">
                  <th className="p-1.5">CIPHER LETTER</th>
                  <th className="p-1.5">OCCURRENCES</th>
                  <th className="p-1.5">FREQUENCY</th>
                  <th className="p-1.5">ENGLISH MATCH CANDIDATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-[11px]">
                <tr className="bg-amber-950/20 text-amber-300">
                  <td className="p-1.5 font-bold">H (h)</td>
                  <td className="p-1.5">14</td>
                  <td className="p-1.5">14.1%</td>
                  <td className="p-1.5 font-bold text-cyan-300">English 'E' (~12.7%)</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold">W (w)</td>
                  <td className="p-1.5">10</td>
                  <td className="p-1.5">10.1%</td>
                  <td className="p-1.5 text-cyan-300">English 'T' (~9.1%)</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold">D (d)</td>
                  <td className="p-1.5">9</td>
                  <td className="p-1.5">9.0%</td>
                  <td className="p-1.5 text-cyan-300">English 'A' (~8.2%)</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold">R (r)</td>
                  <td className="p-1.5">8</td>
                  <td className="p-1.5">8.1%</td>
                  <td className="p-1.5 text-cyan-300">English 'O' (~7.5%)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-2 bg-slate-900 border border-slate-700 rounded text-[11px] text-slate-300">
            💡 <strong>Frequency Analysis Tip:</strong> Compare the peak ciphertext frequency (H) against the most frequent letter in the English language (E). Calculate the alphabetical displacement to determine the decryption shift key.
          </div>
        </div>
      )}

      {activeTab === 'hash' && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded mt-3 space-y-2">
          <label className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
            HASH IDENTIFIER & LENGTH INSPECTOR:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Paste arbitrary hex hash (MD5, SHA1, SHA256)..."
              className="flex-1 bg-black border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleIdentifyHash}
              className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-3 py-1.5 rounded text-xs transition"
            >
              IDENTIFY
            </button>
          </div>
          {hashResult && (
            <div className="p-2 bg-slate-900 border border-slate-700 rounded font-mono text-xs text-amber-300">
              {hashResult}
            </div>
          )}
        </div>
      )}

      {/* MANUAL FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT DECRYPTED FLAG:</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{...}"
            className="flex-1 bg-black/60 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-4 py-1.5 rounded text-xs transition"
          >
            SUBMIT FLAG
          </button>
        </form>

        {flagFeedback && (
          <div className={`mt-2 text-xs p-2 rounded font-mono ${flagFeedback.success ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}`}>
            {flagFeedback.text}
          </div>
        )}
      </div>

      {solved ? (
        <div className="hack-success-banner mt-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-bold text-emerald-300">CIPHER BROKEN // CLEARANCE FLAG VERIFIED</span>
            <span className="text-[10px] text-emerald-400/80">+100 CTF PTS Awarded · Crypto Module Solved</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Adjust the shift until the plaintext forms coherent English words</span>
        </div>
      )}
    </div>
  );
}
