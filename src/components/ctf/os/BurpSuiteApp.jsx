import React, { useState } from 'react';
import {
  Globe,
  Send,
  RefreshCw,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Database,
  Clock,
  HelpCircle,
  Sparkles,
  Copy,
  Zap,
  Layers,
} from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

const SQLI_FLAG = 'FLAG{sqli_union_select_waf_bypassed}';
const TIMING_FLAG = 'FLAG{side_channel_timing_leak_enumerated}';

export default function BurpSuiteApp({ onOpenStation }) {
  const [activeTab, setActiveTab] = useState('repeater'); // 'repeater' | 'timing' | 'decoder'
  const [showHints, setShowHints] = useState(true);

  // Repeater State
  const [httpMethod, setHttpMethod] = useState('GET');
  const [urlPath, setUrlPath] = useState("/api/v1/accounts?username=alice");
  const [requestHeaders, setRequestHeaders] = useState("Host: mainframe.internal\nUser-Agent: Mozilla/5.0 (Kali Linux x86_64)\nAccept: application/json");
  const [responseStatus, setResponseStatus] = useState('200 OK');
  const [responseHeaders, setResponseHeaders] = useState('Server: nginx/1.24.0\nContent-Type: application/json\nX-Powered-By: Express/SQLite3');
  const [responseBody, setResponseBody] = useState('[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  }\n]');
  const [responseTime, setResponseTime] = useState(24);
  const [sending, setSending] = useState(false);

  // Timing Attack State
  const [timingToken, setTimingToken] = useState('');
  const [timingLogs, setTimingLogs] = useState([]);

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

      // Default normal query
      setResponseStatus('200 OK');
      setResponseBody('[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  }\n]');
      setResponseTime(20);
      playClickSound(950);
      setSending(false);
    }, 280);
  };

  const handleSendTimingProbe = (e) => {
    e?.preventDefault();
    if (!timingToken.trim()) return;
    const probe = timingToken.trim();

    let matches = 0;
    for (let i = 0; i < probe.length; i++) {
      if (i < TIMING_FLAG.length && probe[i] === TIMING_FLAG[i]) {
        matches++;
      } else {
        break;
      }
    }

    const latency = (48.0 + matches * 15.2 + (Math.random() * 1.8 - 0.9)).toFixed(1);
    setTimingLogs((prev) => [{ candidate: probe, latency: parseFloat(latency), match: matches }, ...prev.slice(0, 9)]);
    playHackingBeep(matches > 5 ? 1200 : 900);
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!manualFlag.trim()) return;
    const clean = manualFlag.trim();

    let res = ctfEngine.submitFlag('web-sqli-waf-bypass', clean);
    let targetStationId = 'server_rack';
    let targetStationName = 'SERVER RACK MAINFRAME';

    if (!res.success) {
      res = ctfEngine.submitFlag('web-sidechannel-timing', clean);
      targetStationId = 'achievements';
      targetStationName = 'AWARDS / PROJECTOR';
    }

    if (res.success) {
      const stationId = res.stationId || targetStationId;
      setFlagFeedback({
        success: true,
        text: res.message,
        stationId,
        stationName: targetStationName
      });
      playBreachFanfare();
      setTimeout(() => {
        onOpenStation?.(stationId);
      }, 1800);
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="cos-app-container select-text">
      {/* 1. Top Header & Tab Navigation */}
      <div className="cos-app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="cos-app-title">
            <Globe size={15} style={{ color: '#fb923c' }} />
            <span>BURP SUITE COMMUNITY v2026.1 // WEB EXPLOITATION</span>
          </div>

          <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
            <button
              type="button"
              className={`cos-btn ${activeTab === 'repeater' ? 'cos-btn-primary' : ''}`}
              onClick={() => setActiveTab('repeater')}
            >
              <Database size={11} />
              <span>HTTP Repeater (SQLi)</span>
            </button>
            <button
              type="button"
              className={`cos-btn ${activeTab === 'timing' ? 'cos-btn-primary' : ''}`}
              onClick={() => setActiveTab('timing')}
            >
              <Clock size={11} />
              <span>Timing Oracle</span>
            </button>
            <button
              type="button"
              className={`cos-btn ${activeTab === 'decoder' ? 'cos-btn-primary' : ''}`}
              onClick={() => setActiveTab('decoder')}
            >
              <Layers size={11} />
              <span>Decoder</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`cos-hint-toggle ${showHints ? 'is-active' : ''}`}
            onClick={() => setShowHints((prev) => !prev)}
            title="Toggle Web Security Exploit Guide & Hints"
          >
            <HelpCircle size={13} />
            <span>{showHints ? 'HIDE HINTS' : '💡 HOW TO SOLVE'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Hint & Walkthrough Drawer */}
      {showHints && (
        <div className="cos-hint-drawer">
          <div className="cos-hint-header-bar">
            <div className="cos-hint-title">
              <Sparkles size={14} />
              <span>WEB EXPLOITATION GUIDE // {activeTab === 'repeater' ? 'SQL INJECTION & WAF BYPASS' : activeTab === 'timing' ? 'SIDE-CHANNEL TIMING ATTACK' : 'ENCODING & DECODING'}</span>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
              {activeTab === 'repeater' ? 'web-sqli-waf-bypass · Medium · +250 PTS' : 'web-sidechannel-timing · Hard · +350 PTS'}
            </span>
          </div>

          <div className="cos-hint-grid">
            {activeTab === 'repeater' ? (
              <>
                <div className="cos-hint-card">
                  <h4>🎯 Objective</h4>
                  <p>The endpoint <code>/api/v1/accounts?username=alice</code> concatenates input into an unsanitized SQLite query without parameterization.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🔍 SQLi Attack Guide</h4>
                  <p>The backend executes: <code>SELECT ... WHERE username = '&#123;input&#125;'</code>.</p>
                  <p>Inject a quote (<code>'</code>) to escape the string, an <code>OR 1=1</code> clause to make the condition always true, and comment dashes (<code>--</code>) to ignore trailing SQL.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🛠️ Step-by-Step Walkthrough</h4>
                  <p>1. In the URL path, replace <code>alice</code> with: <code>' OR 1=1--</code> (or <code>' UNION SELECT 1,2,3,4--</code>).</p>
                  <p>2. Click <strong style={{ color: '#fb923c' }}>[SEND HTTP REQUEST]</strong>.</p>
                  <p>3. Inspect the JSON response on the right: look for user <code>root_sentinel</code> to find the admin clearance flag, then copy and submit it below!</p>
                </div>
              </>
            ) : activeTab === 'timing' ? (
              <>
                <div className="cos-hint-card">
                  <h4>🎯 Objective</h4>
                  <p>The token verification routine uses non-constant-time <code>strcmp()</code>, adding a measurable ~15ms delay per sequentially matching character.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🔍 Timing Attack Concept</h4>
                  <p>Base latency is ~48ms. When probing candidate characters, every correct letter adds an extra ~15ms delay. The flag starts with: <code>FLAG&#123;side_channel_timing_...</code></p>
                </div>
                <div className="cos-hint-card">
                  <h4>🛠️ Step-by-Step Walkthrough</h4>
                  <p>1. Enter candidate prefix <code>FLAG&#123;</code> into the probe input and click <strong>Send Probe</strong>.</p>
                  <p>2. Test candidate characters (e.g. <code>FLAG&#123;s</code>). Notice that correct characters cause a distinct latency spike (~78ms vs ~63ms)!</p>
                  <p>3. Reconstruct the full flag prefix or submit <code>FLAG&#123;side_channel_timing_leak_enumerated&#125;</code> in the flag bar below.</p>
                </div>
              </>
            ) : (
              <div className="cos-hint-card" style={{ gridColumn: '1 / -1' }}>
                <h4>🛠️ Decoder Workbench</h4>
                <p>Use the Decoder to encode or decode Base64, URL-encoded strings, or Hex bytes. Useful for analyzing CTF tokens and HTTP authorization headers.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Tab Contents */}
      <div className="cos-app-body">
        {activeTab === 'repeater' ? (
          /* Repeater Tab */
          <div className="cos-split-horizontal">
            {/* Left: Request Pane */}
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>HTTP REQUEST (Raw Socket)</span>
                <button
                  type="button"
                  className="cos-btn cos-btn-primary"
                  style={{ background: '#ea580c', borderColor: '#fb923c' }}
                  onClick={handleSendRepeater}
                  disabled={sending}
                >
                  <Send size={11} />
                  <span>{sending ? 'Sending...' : 'SEND REQUEST'}</span>
                </button>
              </div>

              {/* Request Reset Bar */}
              <div style={{ background: '#0a0f18', padding: '6px 8px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>ENDPOINT:</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>/api/v1/accounts?username=...</span>
                <button
                  type="button"
                  className="cos-btn"
                  style={{ fontSize: '10px', padding: '2px 7px', marginLeft: 'auto' }}
                  onClick={() => {
                    playClickSound(850);
                    setUrlPath('/api/v1/accounts?username=alice');
                  }}
                  title="Reset query path to default"
                >
                  Reset: alice
                </button>
              </div>

              <div className="cos-panel-body" style={{ padding: '8px', gap: '8px' }}>
                {/* Method & URL */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    className="cos-input"
                    style={{ width: '80px', color: '#fb923c', fontWeight: 700 }}
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value)}
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                  </select>
                  <input
                    type="text"
                    className="cos-input"
                    style={{ flex: 1 }}
                    value={urlPath}
                    onChange={(e) => setUrlPath(e.target.value)}
                  />
                </div>

                {/* Headers */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>HEADERS:</span>
                  <textarea
                    className="cos-textarea"
                    value={requestHeaders}
                    onChange={(e) => setRequestHeaders(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Response Pane */}
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>HTTP RESPONSE ({responseTime} ms)</span>
                <span className={`cos-badge ${responseStatus.startsWith('200') ? 'cos-badge-emerald' : 'cos-badge-rose'}`}>
                  {responseStatus}
                </span>
              </div>
              <div className="cos-panel-body" style={{ padding: '8px', gap: '8px' }}>
                <div style={{ height: '70px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>HEADERS:</span>
                  <textarea
                    className="cos-textarea"
                    style={{ height: '50px', flex: 'none', color: '#94a3b8' }}
                    readOnly
                    value={responseHeaders}
                  />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>BODY (JSON Payload):</span>
                  </div>
                  <textarea
                    className={`cos-textarea ${responseBody.includes(SQLI_FLAG) ? 'cos-textarea-output' : ''}`}
                    style={{ flex: 1, color: responseBody.includes(SQLI_FLAG) ? '#34d399' : '#cbd5e1' }}
                    readOnly
                    value={responseBody}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'timing' ? (
          /* Timing Attack Tab */
          <div className="cos-split-horizontal">
            {/* Probe Controls */}
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>SIDE-CHANNEL TIMING ATTACK PROBE</span>
              </div>
              <div className="cos-panel-body">
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Target Endpoint: <code>POST /api/v2/vault/authVulnerable</code><br />
                  Non-constant-time <code>strcmp()</code> delay: <strong>~15.0 ms per matching character</strong>.
                </p>

                <form onSubmit={handleSendTimingProbe} style={{ marginTop: '8px' }}>
                  <label style={{ fontSize: '10.5px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    Candidate Prefix Probe:
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      className="cos-input"
                      style={{ flex: 1 }}
                      value={timingToken}
                      onChange={(e) => setTimingToken(e.target.value)}
                      placeholder="Enter candidate prefix (e.g. FLAG{...)"
                    />
                    <button type="submit" className="cos-btn cos-btn-primary">
                      <Send size={11} />
                      <span>Send Probe</span>
                    </button>
                  </div>
                </form>

                <div style={{ marginTop: '12px', fontSize: '10.5px', color: '#64748b' }}>
                  <span>Probing strategy: Append candidate characters to matching prefix. Watch for latency spikes (~+15ms).</span>
                </div>
              </div>
            </div>

            {/* Timing Latency Log */}
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>TIMING MEASUREMENT LOGS (ms)</span>
              </div>
              <div className="cos-table-container" style={{ flex: 1, border: 'none' }}>
                <table className="cos-table">
                  <thead>
                    <tr>
                      <th>Candidate Probe</th>
                      <th>Latency (ms)</th>
                      <th>Delta from Baseline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timingLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'inherit', color: '#38bdf8' }}>{log.candidate}</td>
                        <td style={{ fontWeight: 700, color: log.latency > 100 ? '#34d399' : '#fbbf24' }}>
                          {log.latency} ms
                        </td>
                        <td>
                          <span className="cos-badge cos-badge-cyan">+{(log.latency - 3.5).toFixed(1)} ms</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Decoder Tab */
          <div className="cos-split-horizontal">
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>INPUT DATA</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    className="cos-btn"
                    style={{ fontSize: '10px' }}
                    onClick={() => {
                      try {
                        setDecoderOutput(btoa(decoderInput));
                      } catch (_) {
                        setDecoderOutput('[Error: Invalid string for Base64]');
                      }
                    }}
                  >
                    Base64 Encode
                  </button>
                  <button
                    type="button"
                    className="cos-btn"
                    style={{ fontSize: '10px' }}
                    onClick={() => {
                      try {
                        setDecoderOutput(atob(decoderInput));
                      } catch (_) {
                        setDecoderOutput('[Error: Invalid Base64]');
                      }
                    }}
                  >
                    Base64 Decode
                  </button>
                  <button
                    type="button"
                    className="cos-btn"
                    style={{ fontSize: '10px' }}
                    onClick={() => setDecoderOutput(decodeURIComponent(decoderInput))}
                  >
                    URL Decode
                  </button>
                </div>
              </div>
              <div className="cos-panel-body" style={{ padding: '4px' }}>
                <textarea
                  className="cos-textarea"
                  value={decoderInput}
                  onChange={(e) => setDecoderInput(e.target.value)}
                  placeholder="Enter text to encode or decode..."
                />
              </div>
            </div>

            <div className="cos-panel">
              <div className="cos-panel-header">
                <span style={{ color: '#34d399' }}>DECODED OUTPUT</span>
                <button
                  type="button"
                  className="cos-btn"
                  style={{ fontSize: '10px' }}
                  onClick={() => {
                    playClickSound(900);
                    setManualFlag(decoderOutput.trim());
                  }}
                >
                  <Copy size={11} />
                  <span>Use As Flag</span>
                </button>
              </div>
              <div className="cos-panel-body" style={{ padding: '4px' }}>
                <textarea
                  className="cos-textarea cos-textarea-output"
                  readOnly
                  value={decoderOutput}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Flag Submitter Bar */}
      <div className="cos-flag-bar">
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>SUBMIT CAPTURED FLAG:</span>
        <input
          type="text"
          className="cos-flag-input"
          placeholder="FLAG{...}"
          value={manualFlag}
          onChange={(e) => setManualFlag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit(e)}
        />
        <button
          type="button"
          className="cos-flag-btn"
          onClick={handleManualSubmit}
        >
          SUBMIT FLAG
        </button>

        {flagFeedback && (
          <div className={`cos-flag-feedback ${flagFeedback.success ? 'is-success' : 'is-error'}`}>
            {flagFeedback.success ? <CheckCircle2 size={13} /> : <Zap size={13} />}
            <span>{flagFeedback.text}</span>
            {flagFeedback.success && flagFeedback.stationId && (
              <button
                type="button"
                className="cos-open-station-btn"
                onClick={() => onOpenStation?.(flagFeedback.stationId)}
                title="Open Unlocked 3D Station Information Dossier Now"
              >
                <span>🔓 VIEW {flagFeedback.stationName || 'STATION'} INFORMATION ➔</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
