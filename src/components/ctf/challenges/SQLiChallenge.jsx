import React, { useState } from 'react';
import { Database, ShieldAlert, CheckCircle2, Terminal, Play, Zap, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'web-sqli-waf-bypass';
const REVEALED_FLAG = 'FLAG{sqli_union_select_waf_bypassed}';

export default function SQLiChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  // Real CTF: starts with an authentic lookup, NOT pre-filled exploit
  const [queryInput, setQueryInput] = useState('alice');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [executedQuery, setExecutedQuery] = useState('');
  const [dbResults, setDbResults] = useState(null);
  const [dbError, setDbError] = useState('');
  const [wafBlocked, setWafBlocked] = useState(false);
  const [wafBlockReason, setWafBlockReason] = useState('');
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const simulateSQL = (payload) => {
    playHackingBeep(1200);
    const sanitized = payload.trim();
    setExecutedQuery(`SELECT id, username, role, clearance_token FROM accounts WHERE username = '${sanitized}';`);
    setDbError('');
    setWafBlocked(false);
    setWafBlockReason('');

    const lower = sanitized.toLowerCase();

    // WAF Filter Checks: blocks destructive statements
    if (lower.includes('drop table') || lower.includes('drop database') || lower.includes('delete from')) {
      setWafBlocked(true);
      setWafBlockReason('WAF ALERT: Destructive DDL/DML statement intercepted by Rule #901.');
      setDbResults(null);
      playZapSound();
      return;
    }

    // Realistic SQL Syntax & Logic Parser:
    // 1. Unclosed quotes test
    if ((sanitized.match(/'/g) || []).length % 2 !== 0 && !sanitized.includes('--')) {
      setDbError("SQLite3::OperationalError: unrecognized token: \"'\" near line 1. Syntax error: unclosed quotation mark.");
      setDbResults(null);
      playZapSound();
      return;
    }

    // 2. ORDER BY column count enumeration
    const orderMatch = lower.match(/order\s+by\s+(\d+)/);
    if (orderMatch) {
      const colNum = parseInt(orderMatch[1], 10);
      if (colNum > 4) {
        setDbError(`SQLite3::OperationalError: 1st ORDER BY term out of range - should be between 1 and 4.`);
        setDbResults(null);
        playZapSound();
        return;
      } else {
        setDbResults([
          { id: 1, username: 'alice', role: 'Security Analyst', clearance: 'L2_RESTRICTED' },
        ]);
        return;
      }
    }

    // 3. UNION SELECT column count check
    if (lower.includes('union') && lower.includes('select')) {
      // Count comma separated terms after SELECT
      const afterSelect = sanitized.slice(sanitized.toLowerCase().indexOf('select') + 6);
      const terms = afterSelect.split('--')[0].split('from')[0].split(',');
      if (terms.length !== 4) {
        setDbError(`SQLite3::OperationalError: SELECTs to the left and right of UNION do not have the same number of result columns (expected 4 columns, got ${terms.length}).`);
        setDbResults(null);
        playZapSound();
        return;
      }

      // Valid UNION injection! Returns database dump
      setDbResults([
        { id: 1, username: 'alice', role: 'Security Analyst', clearance: 'L2_RESTRICTED' },
        { id: 2, username: 'bob', role: 'DevOps Engineer', clearance: 'L1_STANDARD' },
        { id: 99, username: 'root_sentinel', role: 'SYSTEM_ADMINISTRATOR', clearance: REVEALED_FLAG },
      ]);
      playClickSound(950);
      return;
    }

    // 4. Authentication Bypass (OR 1=1 or OR ''='')
    if (lower.includes("' or '1'='1") || lower.includes("' or 1=1") || lower.includes("' or ''='") || lower.includes("admin'--")) {
      setDbResults([
        { id: 1, username: 'alice', role: 'Security Analyst', clearance: 'L2_RESTRICTED' },
        { id: 2, username: 'bob', role: 'DevOps Engineer', clearance: 'L1_STANDARD' },
        { id: 99, username: 'root_sentinel', role: 'SYSTEM_ADMINISTRATOR', clearance: REVEALED_FLAG },
      ]);
      playClickSound(950);
      return;
    }

    // Normal lookup
    if (lower === 'alice') {
      setDbResults([
        { id: 1, username: 'alice', role: 'Security Analyst', clearance: 'L2_RESTRICTED' },
      ]);
    } else if (lower === 'bob') {
      setDbResults([
        { id: 2, username: 'bob', role: 'DevOps Engineer', clearance: 'L1_STANDARD' },
      ]);
    } else {
      setDbResults([]);
    }
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
          The internal 42U Mainframe API authenticates operators via a dynamic SQL query. Enumerate column structure using <code>ORDER BY</code> or craft a 4-column <code>UNION SELECT</code> payload to extract the administrator's clearance token.
        </p>
      </div>

      {/* Interactive SQL Injection Input */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 mt-2">
        <label className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
          TARGET INPUT PARAMETER: <code>GET /api/v1/accounts?username=</code>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="e.g. alice' OR '1'='1'-- or ' UNION SELECT 1,2,3,4--"
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
      </div>

      {/* Backend Live Query Execution Output */}
      {executedQuery && (
        <div className="mt-3 p-2.5 bg-black/90 border border-cyan-500/20 rounded font-mono text-[11px]">
          <div className="text-slate-500 text-[10px] uppercase mb-1">// Backend Server Query Executed:</div>
          <code className="text-amber-300 break-all">{executedQuery}</code>
        </div>
      )}

      {/* SQL Error Banner */}
      {dbError && (
        <div className="mt-2 p-2 bg-amber-950/80 border border-amber-500/50 rounded flex items-center gap-2 text-amber-300 text-xs font-mono">
          <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
          <span>{dbError}</span>
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
            <span>DATABASE RESPONSE // TABLE [ACCOUNTS]</span>
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
                    <th className="pb-1">CLEARANCE TOKEN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {dbResults.map((r) => (
                    <tr key={r.id} className={r.id === 99 ? 'bg-emerald-950/40 text-emerald-300' : ''}>
                      <td className="py-1 text-slate-500">{r.id}</td>
                      <td className="py-1 font-bold">{r.username}</td>
                      <td className="py-1 text-cyan-400">{r.role}</td>
                      <td className="py-1 font-mono text-emerald-400 select-all">{r.clearance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">
              0 rows returned. (No matching accounts found for query).
            </div>
          )}
        </div>
      )}

      {/* FLAG SUBMISSION STRIP */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT EXTRACTED CLEARANCE FLAG:</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="Paste captured flag: FLAG{...}"
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
            <span className="font-bold text-emerald-300">CHALLENGE COMPLETE // FLAG ACCEPTED</span>
            <span className="text-[10px] text-emerald-400/80">+250 CTF PTS Awarded to Profile · Mainframe Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Tip: Test quotes, enumerate column counts with ORDER BY 1,2,3,4, then inject UNION SELECT</span>
        </div>
      )}
    </div>
  );
}
