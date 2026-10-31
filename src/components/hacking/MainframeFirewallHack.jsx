import React, { useState, useEffect } from 'react';
import { CheckCircle2, Cpu, RefreshCw, Server, ShieldAlert, Zap, Terminal } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'web-sqli-waf-bypass';
const REVEALED_FLAG = 'FLAG{sqli_union_select_waf_bypassed}';

const PORTS = [
  { id: 22, name: 'PORT 22 // SSH', role: 'REMOTE_TERMINAL', initial: false, target: true },
  { id: 80, name: 'PORT 80 // HTTP', role: 'CLEAR_TEXT_WEB', initial: true, target: false },
  { id: 443, name: 'PORT 443 // HTTPS', role: 'ENCRYPTED_TUNNEL', initial: false, target: true },
  { id: 8080, name: 'PORT 8080 // PROXY', role: 'TRAFFIC_FORWARDER', initial: false, target: true },
];

export default function MainframeFirewallHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [portStates, setPortStates] = useState(() =>
    PORTS.map((p) => ({ ...p, open: p.initial }))
  );
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  useEffect(() => {
    const isMatched = portStates.every((p) => p.open === p.target);
    if (isMatched && !solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => {
        onSolved?.();
      }, 1500);
    }
  }, [portStates, solved, onSolved]);

  const togglePort = (idx) => {
    if (solved) return;
    playHackingBeep(1000 + idx * 200);
    setPortStates((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], open: !next[idx].open };
      const adjacent = (idx + 1) % next.length;
      next[adjacent] = { ...next[adjacent], open: !next[adjacent].open };
      return next;
    });
  };

  const handleReset = () => {
    playClickSound(700);
    setPortStates(PORTS.map((p) => ({ ...p, open: p.initial })));
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
    <div className="hack-puzzle-container mainframe-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Server size={14} className="hack-icon-pulse text-rose-400" />
          <span>CTF MISSION // WEB EXPLOITATION: SQLi & WAF BYPASS</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 250} PTS`}
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
          Evade the 42U Web Application Firewall rule engine. Reconfigure packet routing so <strong className="text-emerald-400">SECURE PORTS (22, 443, 8080)</strong> remain open while unencrypted <strong className="text-rose-400">PORT 80</strong> is dropped to inject comment-escaped SQL queries.
        </p>
      </div>

      {/* Port Grid */}
      <div className="ports-matrix-grid">
        {portStates.map((port, i) => {
          const isTargetMatched = port.open === port.target;

          return (
            <div
              key={port.id}
              className={`port-control-card ${port.open ? 'port-open' : 'port-closed'} ${
                isTargetMatched ? 'port-matched' : ''
              }`}
            >
              <div className="port-card-top">
                <span className="port-indicator-led" />
                <strong className="port-number">{port.name}</strong>
                <span className="port-rule-tag">
                  {port.open ? 'ROUTE_OPEN' : 'BLOCKED'}
                </span>
              </div>
              <div className="port-card-meta">
                <span>{port.role}</span>
              </div>
              <button
                type="button"
                className="port-toggle-btn"
                onClick={() => togglePort(i)}
                disabled={solved}
              >
                {port.open ? 'DROP PORT ⛔' : 'ALLOW PORT ⚡'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-transparent border-none cursor-pointer"
        >
          <RefreshCw size={11} /> Reset Filter Rules
        </button>
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
            <span className="font-bold text-emerald-300">WAF RULES EVADED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+250 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Toggling any port flips adjacent parity · Desired: 22 [OPEN], 80 [CLOSED], 443 [OPEN], 8080 [OPEN]</span>
        </div>
      )}
    </div>
  );
}
