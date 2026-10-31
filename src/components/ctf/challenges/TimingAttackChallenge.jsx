import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Play, Terminal, Zap, Clock, Activity } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'web-sidechannel-timing';
const REVEALED_FLAG = 'FLAG{side_channel_timing_leak_enumerated}';

export default function TimingAttackChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [tokenGuess, setTokenGuess] = useState('FLAG{');
  const [latencyHistory, setLatencyHistory] = useState([
    { candidate: 'A', latency: 3.2, match: false },
    { candidate: 'E', latency: 3.1, match: false },
    { candidate: 'F', latency: 15.4, match: true },
  ]);
  const [runningSweep, setRunningSweep] = useState(false);
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
    // Base 3ms + 12.3ms per matched character
    const latency = 3.1 + matchedPrefixLen * 12.3 + (Math.random() * 0.4 - 0.2);
    return { latency: parseFloat(latency.toFixed(2)), matchedCount: matchedPrefixLen };
  };

  const handleTestProbe = () => {
    playHackingBeep(1200);
    const { latency, matchedCount } = measureLatency(tokenGuess);
    setLatencyHistory((prev) => [
      { candidate: tokenGuess, latency, match: matchedCount > 0 },
      ...prev.slice(0, 5),
    ]);

    if (tokenGuess === REVEALED_FLAG && !solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => onSolved?.(), 1600);
    }
  };

  const handleRunAutomatedSweep = () => {
    if (solved || runningSweep) return;
    setRunningSweep(true);
    playHackingBeep(1000);

    let progress = 'FLAG{';
    const target = REVEALED_FLAG;
    let idx = 5;

    const interval = setInterval(() => {
      if (idx < target.length) {
        progress += target[idx];
        setTokenGuess(progress);
        playClickSound(800 + idx * 25);
        const { latency } = measureLatency(progress);
        setLatencyHistory((prev) => [
          { candidate: progress.slice(-4), latency, match: true },
          ...prev.slice(0, 5),
        ]);
        idx++;
      } else {
        clearInterval(interval);
        setRunningSweep(false);
        setSolved(true);
        ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
        playBreachFanfare();
        setTimeout(() => onSolved?.(), 1600);
      }
    }, 120);
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
    <div className="hack-puzzle-container timing-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Clock size={15} className="text-amber-400 hack-icon-pulse" />
          <span>SIDE-CHANNEL ATTACK // TIME-BASED TOKEN LEAK ORACLE</span>
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
          The certification authorization endpoint validates secret keys using standard non-constant-time <code>strcmp()</code>, terminating on first mismatch. Measure microsecond latency spikes to enumerate the secret token.
        </p>
      </div>

      {/* Interactive Timing Probe Console */}
      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
        <label className="text-xs font-mono text-cyan-400 block uppercase">
          API PROBE TARGET: <code>POST /api/v1/auth/verify_key</code>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenGuess}
            onChange={(e) => setTokenGuess(e.target.value)}
            className="flex-1 bg-black border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-emerald-300 outline-none focus:border-amber-500"
            disabled={solved || runningSweep}
          />
          <button
            type="button"
            onClick={handleTestProbe}
            disabled={solved || runningSweep}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded text-xs transition border border-slate-700"
          >
            PROBE DELTA
          </button>
          <button
            type="button"
            onClick={handleRunAutomatedSweep}
            disabled={solved || runningSweep}
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 transition"
          >
            <Play size={13} />
            <span>{runningSweep ? 'SWEEPING...' : 'RUN TIMING SWEEP'}</span>
          </button>
        </div>
      </div>

      {/* Latency Measurement Bar Chart */}
      <div className="mt-3 p-3 bg-black border border-slate-800 rounded font-mono text-xs space-y-2">
        <div className="text-[10px] text-slate-500 uppercase flex justify-between">
          <span>// Measured Response Latencies (Microsecond Precision):</span>
          <span className="text-amber-400">Baseline: 3.1ms | Match Delta: +12.3ms/char</span>
        </div>
        <div className="space-y-1.5">
          {latencyHistory.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px]">
              <span className="w-20 text-slate-400 truncate">{item.candidate}</span>
              <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    item.latency > 10 ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                  style={{ width: `${Math.min(100, (item.latency / 60) * 100)}%` }}
                />
              </div>
              <span className={`w-16 text-right font-bold ${item.latency > 10 ? 'text-amber-400' : 'text-slate-500'}`}>
                {item.latency} ms
              </span>
            </div>
          ))}
        </div>
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
            <span className="font-bold text-emerald-300">SIDE-CHANNEL ENUMERATION COMPLETE // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+350 CTF PTS Awarded to Profile · Auditorium Projector Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Notice how correct characters take ~12.3ms longer to return than mismatched characters</span>
        </div>
      )}
    </div>
  );
}
