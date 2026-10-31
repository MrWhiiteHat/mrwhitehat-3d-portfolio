import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Play, Terminal, Zap, Clock, Activity, KeyRound, BarChart2 } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'web-sidechannel-timing';
const REVEALED_FLAG = 'FLAG{side_channel_timing_leak_enumerated}';

export default function TimingAttackChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [tokenGuess, setTokenGuess] = useState('FLAG{');
  const [latencyHistory, setLatencyHistory] = useState([
    { candidate: 'FLAG{a', latency: 63.4, match: 5 },
    { candidate: 'FLAG{s', latency: 78.6, match: 6 },
    { candidate: 'FLAG{x', latency: 63.2, match: 5 },
  ]);
  const [probing, setProbing] = useState(false);
  const [apiResponse, setApiResponse] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const measureLatency = (inputStr) => {
    let matchedPrefixLen = 0;
    for (let i = 0; i < inputStr.length; i++) {
      if (inputStr[i] === REVEALED_FLAG[i]) {
        matchedPrefixLen++;
      } else {
        break;
      }
    }
    // Base 3.5ms + 15ms per matched character + slight jitter (±0.5ms)
    const jitter = (Math.random() - 0.5) * 0.8;
    const latency = 3.5 + matchedPrefixLen * 15.0 + jitter;
    return { latency: parseFloat(latency.toFixed(1)), matchedCount: matchedPrefixLen };
  };

  const handleTestProbe = () => {
    if (probing) return;
    setProbing(true);
    playHackingBeep(1200);

    setTimeout(() => {
      const { latency, matchedCount } = measureLatency(tokenGuess);
      setLatencyHistory((prev) => [
        { candidate: tokenGuess, latency, match: matchedCount },
        ...prev.slice(0, 7),
      ]);

      if (tokenGuess === REVEALED_FLAG) {
        setApiResponse(`[200 OK] Token Accepted!\nAuthentication verified against root vault.\nExtracted session flag: ${REVEALED_FLAG}`);
        playClickSound(1100);
      } else {
        setApiResponse(`[401 Unauthorized] Invalid authentication token.\nTime elapsed: ${latency}ms\nEarly exit encountered at index ${matchedCount}.`);
        playZapSound();
      }
      setProbing(false);
    }, 300);
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
    <div className="hack-puzzle-container timing-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Clock size={15} className="text-rose-400 hack-icon-pulse" />
          <span>WEB EXPLOITATION // SIDE-CHANNEL TIMING ATTACK ORACLE</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 350} PTS`}
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
          The Vault token endpoint compares credentials character-by-character using non-constant-time <code>strcmp()</code>, inducing a measurable ~15ms delay for every sequentially matching character. Probe candidate prefixes, track latency spikes, and reconstruct the secret token.
        </p>
      </div>

      {/* Target API & Input Box */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded mt-2 space-y-2">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-cyan-400 uppercase">PROBE TARGET: <code>POST /api/v2/vault/auth</code></span>
          <span className="text-slate-400">Vulnerable: <code>usleep(15000)</code> per match</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenGuess}
            onChange={(e) => setTokenGuess(e.target.value)}
            placeholder="FLAG{side_channel_..."
            className="flex-1 bg-black border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-emerald-300 outline-none focus:border-rose-500"
          />
          <button
            type="button"
            onClick={handleTestProbe}
            disabled={probing}
            className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center gap-1.5 transition font-mono"
          >
            <Play size={13} />
            <span>{probing ? 'PROBING...' : 'SEND PROBE'}</span>
          </button>
        </div>
      </div>

      {/* Latency History & Timing Graph */}
      <div className="mt-3 p-3 bg-black border border-slate-800 rounded font-mono text-xs">
        <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
          <span className="flex items-center gap-1">
            <Activity size={12} className="text-rose-400" />
            <span>SIDE-CHANNEL LATENCY MEASUREMENTS (ms):</span>
          </span>
          <span className="text-slate-500">Each correct character adds +15.0ms</span>
        </div>

        <div className="space-y-1.5">
          {latencyHistory.map((item, idx) => {
            const barWidth = Math.min(100, (item.latency / 620) * 100);
            return (
              <div key={idx} className="flex items-center gap-2 text-[11px]">
                <code className="w-48 truncate text-slate-300">{item.candidate}</code>
                <div className="flex-1 bg-slate-900 rounded h-4 overflow-hidden relative border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.latency > 500
                        ? 'bg-emerald-500'
                        : item.latency > 150
                        ? 'bg-amber-500'
                        : 'bg-rose-500/80'
                    }`}
                    style={{ width: `${Math.max(6, barWidth)}%` }}
                  />
                  <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white drop-shadow">
                    {item.latency} ms ({item.match} chars matched)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Response Log */}
      {apiResponse && (
        <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded font-mono text-xs text-slate-300 whitespace-pre-wrap select-all">
          {apiResponse}
        </div>
      )}

      {/* FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT RECONSTRUCTED TIMING FLAG:</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{side_channel_...}"
            className="flex-1 bg-black/60 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-4 py-1.5 rounded text-xs transition font-mono"
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
            <span className="font-bold text-emerald-300">SIDE-CHANNEL EXPLOITED // TIMING LEAK SOLVED</span>
            <span className="text-[10px] text-emerald-400/80">+350 CTF PTS Awarded · Oracle Cryptanalysis Complete</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Notice how correct characters take ~15ms longer to return than mismatched characters</span>
        </div>
      )}
    </div>
  );
}
