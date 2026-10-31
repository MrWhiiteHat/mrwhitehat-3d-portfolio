import React, { useState } from 'react';
import { Globe, Send, RefreshCw, KeyRound, ShieldAlert, CheckCircle2, Sliders, Database, Clock } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

const SQLI_FLAG = 'FLAG{sqli_union_select_waf_bypassed}';
const TIMING_FLAG = 'FLAG{side_channel_timing_leak_enumerated}';

export default function BurpSuiteApp() {
  const [activeTab, setActiveTab] = useState('repeater'); // 'repeater' | 'timing' | 'decoder'
  const [httpMethod, setHttpMethod] = useState('GET');
  const [urlPath, setUrlPath] = useState('/api/v1/accounts?username=alice');
  const [requestHeaders, setRequestHeaders] = useState('Host: mainframe.internal\nUser-Agent: Mozilla/5.0 (Kali Linux x86_64)\nAccept: application/json');
  const [requestBody, setRequestBody] = useState('');
  const [responseStatus, setResponseStatus] = useState('200 OK');
  const [responseHeaders, setResponseHeaders] = useState('Server: nginx/1.24.0\nContent-Type: application/json\nX-Powered-By: Express/SQLite3');
  const [responseBody, setResponseBody] = useState('[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  }\n]');
  const [responseTime, setResponseTime] = useState(24);
  const [sending, setSending] = useState(false);

  // Timing Attack State
  const [timingToken, setTimingToken] = useState('FLAG{');
  const [timingLogs, setTimingLogs] = useState([
    { candidate: 'FLAG{a', latency: 63.4, match: 5 },
    { candidate: 'FLAG{s', latency: 78.6, match: 6 },
    { candidate: 'FLAG{x', latency: 63.2, match: 5 },
  ]);

  // Decoder State
  const [decoderInput, setDecoderInput] = useState('');
  const [decoderOutput, setDecoderOutput] = useState('');

  // Flag Submission State
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleSendRepeater = () => {
    if (sending) return;
    setSending(true);
    playHackingBeep(1100);

    setTimeout(() => {
      const url = urlPath.trim();
      const lower = url.toLowerCase();

      // Check WAF rules
      if (lower.includes('drop table') || lower.includes('drop database') || lower.includes('delete from')) {
        setResponseStatus('403 Forbidden (WAF Blocked)');
        setResponseBody('{\n  "error": "WAF ALERT: Destructive DDL query blocked by Security Rule #901.",\n  "status": 403\n}');
        setResponseTime(6);
        playZapSound();
        setSending(false);
        return;
      }

      // SQLite Syntax errors: unclosed quotes
      if ((url.match(/'/g) || []).length % 2 !== 0 && !url.includes('--')) {
        setResponseStatus('500 Internal Server Error');
        setResponseBody('{\n  "error": "SQLite3::OperationalError: unrecognized token: \\"\'\\" near line 1. Syntax error: unclosed quotation mark.",\n  "status": 500\n}');
        setResponseTime(12);
        playZapSound();
        setSending(false);
        return;
      }

      // ORDER BY column count
      const orderMatch = lower.match(/order\s+by\s+(\d+)/);
      if (orderMatch) {
        const col = parseInt(orderMatch[1], 10);
        if (col > 4) {
          setResponseStatus('500 Internal Server Error');
          setResponseBody(`{\n  "error": "SQLite3::OperationalError: 1st ORDER BY term out of range - should be between 1 and 4.",\n  "status": 500\n}`);
          playZapSound();
        } else {
          setResponseStatus('200 OK');
          setResponseBody('[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  }\n]');
          playClickSound(1000);
        }
        setResponseTime(18);
        setSending(false);
        return;
      }

      // UNION SELECT injection
      if (lower.includes('union') && lower.includes('select')) {
        const afterSelect = url.slice(url.toLowerCase().indexOf('select') + 6);
        const terms = afterSelect.split('--')[0].split('from')[0].split(',');
        if (terms.length !== 4) {
          setResponseStatus('500 Internal Server Error');
          setResponseBody(`{\n  "error": "SQLite3::OperationalError: SELECTs to the left and right of UNION do not have the same number of result columns (expected 4 columns, got ${terms.length}).",\n  "status": 500\n}`);
          playZapSound();
        } else {
          setResponseStatus('200 OK');
          setResponseBody(`[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  },\n  {\n    "id": 2,\n    "username": "bob",\n    "role": "DevOps Engineer",\n    "clearance": "L1_STANDARD"\n  },\n  {\n    "id": 99,\n    "username": "root_sentinel",\n    "role": "SYSTEM_ADMINISTRATOR",\n    "clearance": "${SQLI_FLAG}"\n  }\n]`);
          playClickSound(1200);
        }
        setResponseTime(26);
        setSending(false);
        return;
      }

      // Auth bypass (' OR 1=1 --)
      if (lower.includes("' or '1'='1") || lower.includes("' or 1=1") || lower.includes("admin'--")) {
        setResponseStatus('200 OK');
        setResponseBody(`[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  },\n  {\n    "id": 99,\n    "username": "root_sentinel",\n    "role": "SYSTEM_ADMINISTRATOR",\n    "clearance": "${SQLI_FLAG}"\n  }\n]`);
        setResponseTime(22);
        playClickSound(1100);
        setSending(false);
        return;
      }

      // Default normal output
      setResponseStatus('200 OK');
      setResponseBody('[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  }\n]');
      setResponseTime(19);
      setSending(false);
    }, 350);
  };

  const handleSendTimingProbe = () => {
    playHackingBeep(1200);
    let matchCount = 0;
    for (let i = 0; i < timingToken.length; i++) {
      if (timingToken[i] === TIMING_FLAG[i]) matchCount++;
      else break;
    }
    const latency = parseFloat((3.5 + matchCount * 15.0 + (Math.random() - 0.5) * 0.8).toFixed(1));

    setTimingLogs((prev) => [
      { candidate: timingToken, latency, match: matchCount },
      ...prev.slice(0, 6),
    ]);

    if (timingToken === TIMING_FLAG) {
      playBreachFanfare();
    } else {
      playClickSound(800);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag('web-sqli-waf-bypass', manualFlag);
    const resTiming = ctfEngine.submitFlag('web-sidechannel-timing', manualFlag);

    if (res.success || res.duplicate) {
      setFlagFeedback({ success: true, text: res.message });
      playBreachFanfare();
    } else if (resTiming.success || resTiming.duplicate) {
      setFlagFeedback({ success: true, text: resTiming.message });
      playBreachFanfare();
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b10] font-mono text-xs select-text overflow-hidden">
      {/* Burp Suite Navigation Tabs */}
      <div className="flex items-center gap-1 bg-[#0f172a] border-b border-[#1e293b] px-3 pt-2">
        <span className="text-[#f97316] font-bold mr-3 flex items-center gap-1">
          <Globe size={13} />
          <span>Burp Suite Community v2026.1</span>
        </span>
        {[
          { id: 'repeater', label: 'Repeater (SQLi Sandbox)' },
          { id: 'timing', label: 'Timing Oracle (Side-Channel)' },
          { id: 'decoder', label: 'Decoder Workbench' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              playClickSound(850);
              setActiveTab(t.id);
            }}
            className={`px-3 py-1.5 rounded-t text-xs font-mono transition border-t border-x ${
              activeTab === t.id
                ? 'bg-[#070b10] text-[#f97316] border-[#38bdf8]/40 font-bold'
                : 'bg-[#1e293b]/50 text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'repeater' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Target & Send Bar */}
          <div className="flex items-center gap-2 p-2 bg-[#0c121a] border-b border-[#1e293b]">
            <select
              value={httpMethod}
              onChange={(e) => setHttpMethod(e.target.value)}
              className="cos-input py-1 text-xs font-bold text-amber-400"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
            <input
              type="text"
              value={urlPath}
              onChange={(e) => setUrlPath(e.target.value)}
              placeholder="/api/v1/accounts?username=..."
              className="cos-input flex-1 py-1 text-xs text-cyan-300"
            />
            <button
              type="button"
              onClick={handleSendRepeater}
              disabled={sending}
              className="cos-btn cos-btn-primary py-1 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Send size={12} />
              <span>{sending ? 'SENDING...' : 'SEND'}</span>
            </button>
          </div>

          {/* Split Request / Response View */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2 overflow-hidden bg-[#04070a]">
            {/* Request Pane */}
            <div className="flex flex-col bg-[#080d14] border border-[#1e293b] rounded overflow-hidden">
              <div className="p-1.5 bg-[#0f172a] text-[10px] text-slate-400 border-b border-[#1e293b] flex justify-between">
                <span>HTTP REQUEST RAW</span>
                <span>Port: 443 [HTTPS]</span>
              </div>
              <textarea
                value={requestHeaders}
                onChange={(e) => setRequestHeaders(e.target.value)}
                className="flex-1 bg-transparent p-2 text-slate-200 outline-none resize-none font-mono text-[11px] leading-relaxed"
              />
            </div>

            {/* Response Pane */}
            <div className="flex flex-col bg-[#080d14] border border-[#1e293b] rounded overflow-hidden">
              <div className="p-1.5 bg-[#0f172a] text-[10px] text-slate-400 border-b border-[#1e293b] flex justify-between items-center">
                <span>
                  HTTP RESPONSE: <strong className={responseStatus.includes('200') ? 'text-emerald-400' : 'text-rose-400'}>{responseStatus}</strong>
                </span>
                <span className="text-cyan-400">{responseTime} ms</span>
              </div>
              <pre className="flex-1 bg-transparent p-2 text-emerald-300 overflow-y-auto font-mono text-[11px] leading-relaxed select-all">
                {responseBody}
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timing' && (
        <div className="flex-1 p-3 flex flex-col space-y-3 bg-[#060a0f] overflow-y-auto">
          <div className="p-2.5 bg-[#0c131c] border border-[#1e293b] rounded">
            <span className="text-[10px] text-cyan-400 uppercase block mb-1">
              SIDE-CHANNEL TIMING ORACLE (POST /api/v2/vault/auth):
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={timingToken}
                onChange={(e) => setTimingToken(e.target.value)}
                placeholder="FLAG{side_channel_..."
                className="cos-input flex-1 py-1.5 text-xs text-amber-300"
              />
              <button
                type="button"
                onClick={handleSendTimingProbe}
                className="cos-btn cos-btn-primary py-1.5 px-4 text-xs font-bold"
              >
                PROBE LATENCY
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#080d14] border border-[#1e293b] rounded flex-1">
            <span className="text-[10px] text-slate-400 uppercase block mb-2">
              ROUND-TRIP LATENCY PROBES (Each matched character adds ~15ms):
            </span>
            <div className="space-y-2">
              {timingLogs.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <code className="w-52 text-slate-300 truncate">{item.candidate}</code>
                  <div className="flex-1 bg-black h-4 rounded overflow-hidden relative border border-slate-800">
                    <div
                      className={`h-full ${item.latency > 400 ? 'bg-emerald-500' : item.latency > 100 ? 'bg-amber-500' : 'bg-rose-500/80'}`}
                      style={{ width: `${Math.min(100, (item.latency / 600) * 100)}%` }}
                    />
                    <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white">
                      {item.latency} ms ({item.match} chars matched)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'decoder' && (
        <div className="flex-1 p-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#060a0f] overflow-y-auto">
          <div className="flex flex-col bg-[#080d14] border border-[#1e293b] rounded p-2">
            <span className="text-[10px] text-slate-400 uppercase mb-1">INPUT (URL / BASE64 / HEX):</span>
            <textarea
              value={decoderInput}
              onChange={(e) => setDecoderInput(e.target.value)}
              placeholder="Type string to encode or decode..."
              className="flex-1 bg-black border border-slate-800 rounded p-2 text-slate-200 outline-none resize-none font-mono text-xs"
            />
            <div className="flex gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    setDecoderOutput(atob(decoderInput.trim()));
                  } catch (_) {
                    setDecoderOutput('Invalid Base64 sequence.');
                  }
                }}
                className="cos-btn py-1 text-xs"
              >
                Base64 Decode
              </button>
              <button
                type="button"
                onClick={() => setDecoderOutput(decodeURIComponent(decoderInput.trim()))}
                className="cos-btn py-1 text-xs"
              >
                URL Decode
              </button>
            </div>
          </div>

          <div className="flex flex-col bg-[#080d14] border border-[#1e293b] rounded p-2">
            <span className="text-[10px] text-slate-400 uppercase mb-1">DECODED OUTPUT:</span>
            <textarea
              readOnly
              value={decoderOutput}
              className="flex-1 bg-black border border-slate-800 rounded p-2 text-emerald-400 outline-none resize-none font-mono text-xs select-all"
            />
          </div>
        </div>
      )}

      {/* Flag Submission Bar */}
      <div className="p-2.5 bg-[#0a0f16] border-t border-[#1e293b] flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 uppercase">SUBMIT RECOVERED WEB FLAG:</span>
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{sqli_... or FLAG{side_channel_...}"
            className="cos-input py-1 text-xs w-64"
          />
          <button
            type="submit"
            className="cos-btn cos-btn-success py-1 text-xs font-bold"
          >
            SUBMIT FLAG
          </button>
        </form>
      </div>

      {flagFeedback && (
        <div className={`p-2 text-xs font-mono border-t ${flagFeedback.success ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-rose-950/80 border-rose-500 text-rose-300'}`}>
          {flagFeedback.text}
        </div>
      )}
    </div>
  );
}
