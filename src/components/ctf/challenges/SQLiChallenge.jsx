import React, { useState } from 'react';
import { Database, ShieldAlert, CheckCircle2, Terminal, Play, Zap, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'web-sqli-waf-bypass';
const REVEALED_FLAG = 'FLAG{sqli_union_select_waf_bypassed}';

export default function SQLiChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [queryInput, setQueryInput] = useState("admin' UNION SELECT null, username, password FROM users--");
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [executedQuery, setExecutedQuery] = useState('');
  const [dbResults, setDbResults] = useState(null);
  const [wafBlocked, setWafBlocked] = useState(false);
  const [wafBlockReason, setWafBlockReason] = useState('');
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const simulateSQL = (payload) => {
    playHackingBeep(1200);
    setExecutedQuery(`SELECT id, username, email FROM accounts WHERE user_input = '${payload}';`);

    const lower = payload.toLowerCase();

    // WAF Filter Checks
    if (lower.includes('drop table') || lower.includes('drop database')) {
      setWafBlocked(true);
      setWafBlockReason('WAF ALERT: Destructive DDL statement blocked by Rule #901.');
      setDbResults(null);
      playZapSound();
      return;
    }

    setWafBlocked(false);
    setWafBlockReason('');

    // Check for successful SQLi exploit
    const isUnionSelect = lower.includes('union') && lower.includes('select');
    const isAuthBypass = lower.includes("' or '1'='1") || lower.includes("' or 1=1") || lower.includes("admin'--");

    if (isUnionSelect || isAuthBypass) {
      setDbResults([
        { id: 1, username: 'admin', role: 'root', secret: 'HASH_a48f29bc1' },
        { id: 2, username: 'operator', role: 'sentinel', secret: 'FLAG_SECRET_PART' },
        { id: 99, username: 'CTF_REWARD', role: 'SYSTEM_ROOT', secret: REVEALED_FLAG },
      ]);

      if (!solved) {
        setSolved(true);
        ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
        playBreachFanfare();
        setTimeout(() => onSolved?.(), 1600);
      }
    } else {
      setDbResults([]);
      playClickSound(300, 0.1);
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
    <div className="hack-puzzle-container sqli-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Database size={15} className="text-rose-400 hack-icon-pulse" />
          <span>WEB EXPLOITATION // SQL INJECTION & WAF EVASION SANDBOX</span>
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
          The internal 42U Mainframe API authenticates operators via a dynamic SQL query. Craft an injection string using comment termination (`--`) or `UNION SELECT` to dump confidential credentials.
        </p>
      </div>

      {/* Interactive SQL Injection Input */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 mt-2">
        <label className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
          TARGET INPUT PARAMETER: <code>$_GET['user_input']</code>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="' OR '1'='1' --"
            className="flex-1 bg-black border border-slate-700 rounded px-3 py-2 text-xs font-mono text-emerald-300 outline-none focus:border-rose-500"
          />
          <button
            type="button"
            onClick={() => simulateSQL(queryInput)}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-1.5 transition"
          >
            <Play size={13} />
            <span>EXECUTE QUERY</span>
          </button>
        </div>

        {/* Quick Payload Presets */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[10px] text-slate-500 font-mono">QUICK PAYLOADS:</span>
          {[
            "admin'--",
            "' OR '1'='1'--",
            "' UNION SELECT null, username, password FROM users--",
          ].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setQueryInput(preset);
                simulateSQL(preset);
              }}
              className="text-[10px] font-mono bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 px-2 py-0.5 rounded"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Backend Live Query Execution Output */}
      {executedQuery && (
        <div className="mt-3 p-2.5 bg-black/90 border border-cyan-500/20 rounded font-mono text-[11px]">
          <div className="text-slate-500 text-[10px] uppercase mb-1">// Backend Server Query Constructed:</div>
          <code className="text-amber-300">{executedQuery}</code>
        </div>
      )}

      {/* WAF Alert Banner */}
      {wafBlocked && (
        <div className="mt-2 p-2 bg-rose-950/80 border border-rose-500/50 rounded flex items-center gap-2 text-rose-300 text-xs font-mono">
          <ShieldAlert size={14} className="text-rose-400 flex-shrink-0" />
          <span>{wafBlockReason}</span>
        </div>
      )}

      {/* Database Results Table */}
      {dbResults && (
        <div className="mt-3 border border-slate-800 rounded bg-slate-950 overflow-hidden">
          <div className="p-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
            <span>DATABASE RESPONSE // TABLE [USERS]</span>
            <span className="text-emerald-400">{dbResults.length} RECORD(S) RETURNED</span>
          </div>
          {dbResults.length > 0 ? (
            <div className="p-2 font-mono text-xs overflow-x-auto">
              <table className="w-full text-left text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="pb-1">ID</th>
                    <th className="pb-1">USERNAME</th>
                    <th className="pb-1">ROLE</th>
                    <th className="pb-1">EXTRACTED CREDENTIAL / FLAG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {dbResults.map((r) => (
                    <tr key={r.id} className={r.id === 99 ? 'bg-emerald-950/40 text-emerald-300' : ''}>
                      <td className="py-1 text-slate-500">{r.id}</td>
                      <td className="py-1 font-bold">{r.username}</td>
                      <td className="py-1 text-cyan-400">{r.role}</td>
                      <td className="py-1 font-mono text-emerald-400">{r.secret}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">
              0 rows returned. (Authentication failed: invalid query logic).
            </div>
          )}
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
            <span className="font-bold text-emerald-300">SQL INJECTION SUCCESSFUL // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+250 CTF PTS Awarded to Profile · Mainframe Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Craft injection with UNION SELECT or OR 1=1 to bypass authentication</span>
        </div>
      )}
    </div>
  );
}
