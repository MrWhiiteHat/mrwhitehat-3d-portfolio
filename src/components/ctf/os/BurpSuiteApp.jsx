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
  Crosshair,
  Code,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

const SQLI_FLAG = 'FLAG{sqli_union_select_waf_bypassed}';
const TIMING_FLAG = 'FLAG{side_channel_timing_leak_enumerated}';

const SQLI_WORDLIST = [
  'alice',
  "' OR 1=1--",
  "admin'--",
  "' UNION SELECT 1,2,3,4--",
  "bob' AND 1=2--",
  "'; DROP TABLE users;--",
  "' OR '1'='1",
];

const IDOR_WORDLIST = ['1', '2', '99', '1337', 'root_sentinel', 'guest'];

export default function BurpSuiteApp({ onOpenStation }) {
  const [activeTab, setActiveTab] = useState('repeater'); // 'repeater' | 'intruder' | 'timing' | 'decoder'
  const [showHints, setShowHints] = useState(true);

  // Repeater State
  const [repeaterMode, setRepeaterMode] = useState('params'); // 'params' | 'raw'
  const [httpMethod, setHttpMethod] = useState('GET');
  const [urlPath, setUrlPath] = useState("/api/v1/accounts?username=alice");
  const [requestHeaders, setRequestHeaders] = useState("Host: mainframe.internal\nUser-Agent: Mozilla/5.0 (Kali Linux x86_64)\nAccept: application/json");
  const [rawRequestText, setRawRequestText] = useState(
    "GET /api/v1/accounts?username=alice HTTP/1.1\nHost: mainframe.internal\nUser-Agent: Mozilla/5.0 (Kali Linux x86_64)\nAccept: application/json\n"
  );
  const [responseStatus, setResponseStatus] = useState('200 OK');
  const [responseHeaders, setResponseHeaders] = useState('Server: nginx/1.24.0\nContent-Type: application/json\nX-Powered-By: Express/SQLite3');
  const [responseBody, setResponseBody] = useState('[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  }\n]');
  const [responseTime, setResponseTime] = useState(24);
  const [sending, setSending] = useState(false);

  // Intruder State
  const [intruderTarget, setIntruderTarget] = useState('/api/v1/accounts?username=§alice§');
  const [intruderPreset, setIntruderPreset] = useState('sqli');
  const [customWordlist, setCustomWordlist] = useState(SQLI_WORDLIST.join('\n'));
  const [intruderResults, setIntruderResults] = useState([]);
  const [intruderRunning, setIntruderRunning] = useState(false);
  const [selectedIntruderRow, setSelectedIntruderRow] = useState(null);

  // Timing Attack State
  const [timingToken, setTimingToken] = useState('');
  const [timingLogs, setTimingLogs] = useState([]);
  const [timingNotice, setTimingNotice] = useState(null);

  // Decoder State
  const [decoderInput, setDecoderInput] = useState('');
  const [decoderOutput, setDecoderOutput] = useState('');

  // Flag Submission State
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  // Evaluate an HTTP request URL and produce realistic responses
  const evaluateHttpEndpoint = (targetUrl) => {
    const url = targetUrl.trim();
    const lower = url.toLowerCase();

    // SQLite Syntax errors: unclosed quotes
    if ((url.match(/'/g) || []).length % 2 !== 0 && !url.includes('--')) {
      return {
        status: '500 Internal Server Error',
        body: '{\n  "error": "SQLite3::OperationalError: unrecognized token: \\"\'\\" near line 1. Syntax error: unclosed quotation mark.",\n  "status": 500\n}',
        time: 12,
        hasFlag: false,
      };
    }

    // ORDER BY column count
    const orderMatch = lower.match(/order\s+by\s+(\d+)/);
    if (orderMatch) {
      const col = parseInt(orderMatch[1], 10);
      if (col > 4) {
        return {
          status: '500 Internal Server Error',
          body: `{\n  "error": "SQLite3::OperationalError: 1st ORDER BY term out of range - should be between 1 and 4.",\n  "status": 500\n}`,
          time: 18,
          hasFlag: false,
        };
      }
      return {
        status: '200 OK',
        body: '[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  }\n]',
        time: 18,
        hasFlag: false,
      };
    }

    // UNION SELECT injection
    if (lower.includes('union') && lower.includes('select')) {
      const afterSelect = url.slice(url.toLowerCase().indexOf('select') + 6);
      const terms = afterSelect.split('--')[0].split('from')[0].split(',');
      if (terms.length !== 4) {
        return {
          status: '500 Internal Server Error',
          body: `{\n  "error": "SQLite3::OperationalError: SELECTs to the left and right of UNION do not have the same number of result columns (expected 4 columns, got ${terms.length}).",\n  "status": 500\n}`,
          time: 26,
          hasFlag: false,
        };
      }
      return {
        status: '200 OK',
        body: `[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  },\n  {\n    "id": 2,\n    "username": "bob",\n    "role": "DevOps Engineer",\n    "clearance": "L1_STANDARD"\n  },\n  {\n    "id": 99,\n    "username": "root_sentinel",\n    "role": "SYSTEM_ADMINISTRATOR",\n    "clearance": "${SQLI_FLAG}"\n  }\n]`,
        time: 26,
        hasFlag: true,
      };
    }

    // Auth bypass (' OR 1=1 --)
    if (lower.includes("' or '1'='1") || lower.includes("' or 1=1") || lower.includes("admin'--")) {
      return {
        status: '200 OK',
        body: `[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  },\n  {\n    "id": 99,\n    "username": "root_sentinel",\n    "role": "SYSTEM_ADMINISTRATOR",\n    "clearance": "${SQLI_FLAG}"\n  }\n]`,
        time: 22,
        hasFlag: true,
      };
    }

    // Default normal query
    return {
      status: '200 OK',
      body: '[\n  {\n    "id": 1,\n    "username": "alice",\n    "role": "Security Analyst",\n    "clearance": "L2_RESTRICTED"\n  }\n]',
      time: 20,
      hasFlag: false,
    };
  };

  const handleSendRepeater = () => {
    if (sending) return;
    setSending(true);
    playHackingBeep(1100);

    let effectiveUrl = urlPath;
    if (repeaterMode === 'raw') {
      const firstLine = rawRequestText.split('\n')[0] || '';
      const parts = firstLine.trim().split(' ');
      if (parts.length >= 2) {
        effectiveUrl = parts[1];
      }
    }

    setTimeout(() => {
      const evaluated = evaluateHttpEndpoint(effectiveUrl);
      setResponseStatus(evaluated.status);
      setResponseBody(evaluated.body);
      setResponseTime(evaluated.time);
      if (evaluated.hasFlag) {
        playBreachFanfare();
      } else if (evaluated.status.startsWith('500')) {
        playZapSound();
      } else {
        playClickSound(1000);
      }
      setSending(false);
    }, 250);
  };

  const handleRunIntruder = () => {
    if (intruderRunning) return;
    const payloads = customWordlist.split('\n').map((p) => p.trim()).filter(Boolean);
    if (!payloads.length) return;

    setIntruderRunning(true);
    setIntruderResults([]);
    setSelectedIntruderRow(null);
    playHackingBeep(1200);

    let idx = 0;
    const interval = setInterval(() => {
      const payload = payloads[idx];
      const replacedUrl = intruderTarget.includes('§')
        ? intruderTarget.replace(/§.*?§/, encodeURIComponent(payload))
        : `/api/v1/accounts?username=${encodeURIComponent(payload)}`;

      const res = evaluateHttpEndpoint(replacedUrl);
      const byteLen = res.body.length;

      const item = {
        reqNo: idx + 1,
        payload,
        status: res.status.split(' ')[0],
        statusFull: res.status,
        length: byteLen,
        time: res.time + Math.floor(Math.random() * 4),
        requestUrl: replacedUrl,
        responseBody: res.body,
        hasFlag: res.hasFlag,
      };

      setIntruderResults((prev) => [...prev, item]);
      playClickSound(1050 + idx * 30);

      idx++;
      if (idx >= payloads.length) {
        clearInterval(interval);
        setIntruderRunning(false);
      }
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

    const isFullMatch = probe === TIMING_FLAG;
    if (isFullMatch) {
      setTimingNotice({
        type: 'success',
        text: '🎉 FULL TOKEN CRACKED! All 41 characters matched with maximum response latency (~670ms).',
        action: true,
      });
      playBreachFanfare();
    } else if (matches > 5) {
      setTimingNotice({
        type: 'match',
        text: `⚡ High correlation! First ${matches} characters verified by server timing delta (~${(matches * 15.2).toFixed(0)}ms).`,
      });
    } else {
      setTimingNotice(null);
    }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    let flagToSubmit = manualFlag.trim();
    if (!flagToSubmit) return;

    const challenges = ['web-sqli-waf-bypass', 'web-sidechannel-timing'];
    let result = null;
    let solvedId = null;

    for (const cid of challenges) {
      const res = ctfEngine.submitFlag(cid, flagToSubmit);
      if (res.success || res.duplicate) {
        result = res;
        solvedId = cid;
        break;
      }
    }

    if (result) {
      const stationId = result.stationId || (solvedId === 'web-sqli-waf-bypass' ? 'projects' : 'operator');
      setFlagFeedback({
        success: true,
        text: result.message,
        stationId,
        stationName: solvedId === 'web-sqli-waf-bypass' ? 'PROJECTS RACK' : 'OPERATOR STATION',
      });
      playBreachFanfare();
      setTimeout(() => {
        onOpenStation?.(stationId);
      }, 1800);
    } else {
      setFlagFeedback({ success: false, text: 'Verification Failed: Flag does not match active challenge hashes.' });
      playZapSound();
    }
  };

  return (
    <div className="cos-app-container select-text">
      {/* 1. Header Toolbar */}
      <div className="cos-app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={15} style={{ color: '#fb923c' }} />
          <span style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.05em' }}>BURP SUITE COMMUNITY v2026.1</span>

          {/* Navigation Tabs */}
          <div className="cos-app-tabs" style={{ marginLeft: '12px' }}>
            <button
              type="button"
              className={`cos-tab ${activeTab === 'repeater' ? 'is-active' : ''}`}
              onClick={() => {
                playClickSound(900);
                setActiveTab('repeater');
              }}
            >
              <Send size={11} />
              <span>Repeater</span>
            </button>
            <button
              type="button"
              className={`cos-tab ${activeTab === 'intruder' ? 'is-active' : ''}`}
              onClick={() => {
                playClickSound(900);
                setActiveTab('intruder');
              }}
            >
              <Crosshair size={11} />
              <span>Intruder (Fuzzer)</span>
            </button>
            <button
              type="button"
              className={`cos-tab ${activeTab === 'timing' ? 'is-active' : ''}`}
              onClick={() => {
                playClickSound(900);
                setActiveTab('timing');
              }}
            >
              <Clock size={11} />
              <span>Timing Oracle</span>
            </button>
            <button
              type="button"
              className={`cos-tab ${activeTab === 'decoder' ? 'is-active' : ''}`}
              onClick={() => {
                playClickSound(900);
                setActiveTab('decoder');
              }}
            >
              <KeyRound size={11} />
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
              <span>WEB EXPLOITATION GUIDE // {activeTab === 'repeater' ? 'SQL INJECTION & WAF BYPASS' : activeTab === 'intruder' ? 'HTTP INTRUDER PARAMETER FUZZER' : activeTab === 'timing' ? 'SIDE-CHANNEL TIMING ATTACK' : 'ENCODING & DECODING'}</span>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
              {activeTab === 'timing' ? 'web-sidechannel-timing · Hard · +350 PTS' : 'web-sqli-waf-bypass · Medium · +250 PTS'}
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
                  <p>Inject <code>' OR 1=1--</code> to bypass authentication and dump the users table.</p>
                  <p>Or perform <code>' UNION SELECT 1,2,3,4--</code> to map the column count.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🛠️ Step-by-Step Walkthrough</h4>
                  <p>1. In URL path, replace <code>alice</code> with: <code>' OR 1=1--</code></p>
                  <p>2. Click <strong style={{ color: '#fb923c' }}>[SEND HTTP REQUEST]</strong>.</p>
                  <p>3. Inspect the JSON response: look for user <code>root_sentinel</code> to find the admin clearance flag!</p>
                </div>
              </>
            ) : activeTab === 'intruder' ? (
              <>
                <div className="cos-hint-card">
                  <h4>🎯 Burp Suite Intruder</h4>
                  <p>Automate parameter fuzzing against targets. Markers (<code>§param§</code>) indicate where payloads are substituted.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🔍 Anomaly Detection</h4>
                  <p>Watch for anomalous HTTP response lengths (e.g. <code>1,420 bytes</code> vs <code>240 bytes</code>) indicating bypassed security barriers.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🛠️ How to Attack</h4>
                  <p>1. Select <strong>SQL Injection Wordlist</strong> preset.</p>
                  <p>2. Click <strong style={{ color: '#fb923c' }}>[START FUZZING ATTACK]</strong>.</p>
                  <p>3. Click the anomalous result row to view the leaked flag!</p>
                </div>
              </>
            ) : activeTab === 'timing' ? (
              <>
                <div className="cos-hint-card">
                  <h4>🎯 Objective</h4>
                  <p>The token verification routine uses non-constant-time <code>strcmp()</code>, adding ~15ms delay per sequentially matching character.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🔍 Timing Attack Concept</h4>
                  <p>Base latency is ~48ms. Every matching character adds ~15ms. Flag: <code>FLAG&#123;side_channel_timing_...</code></p>
                </div>
                <div className="cos-hint-card">
                  <h4>🛠️ Step-by-Step Walkthrough</h4>
                  <p>1. Enter candidate prefix into the probe input and click <strong>Send Probe</strong>.</p>
                  <p>2. Test candidate characters to monitor latency spikes, or submit cracked token directly below!</p>
                </div>
              </>
            ) : (
              <div className="cos-hint-card" style={{ gridColumn: '1 / -1' }}>
                <h4>🛠️ Decoder Workbench</h4>
                <p>Encode or decode Base64, URL-encoded strings, or Hex bytes. Useful for analyzing CTF tokens and HTTP authorization headers.</p>
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
                <span>HTTP REQUEST</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', background: '#090e17', borderRadius: '3px', padding: '1px' }}>
                    <button
                      type="button"
                      className={`cos-btn ${repeaterMode === 'params' ? 'cos-btn-primary' : ''}`}
                      style={{ fontSize: '9.5px', padding: '1px 6px' }}
                      onClick={() => setRepeaterMode('params')}
                    >
                      Params
                    </button>
                    <button
                      type="button"
                      className={`cos-btn ${repeaterMode === 'raw' ? 'cos-btn-primary' : ''}`}
                      style={{ fontSize: '9.5px', padding: '1px 6px' }}
                      onClick={() => {
                        setRawRequestText(
                          `${httpMethod} ${urlPath} HTTP/1.1\n${requestHeaders}\n`
                        );
                        setRepeaterMode('raw');
                      }}
                    >
                      Raw
                    </button>
                  </div>
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
              </div>

              {/* Request Reset Bar */}
              <div style={{ background: '#0a0f18', padding: '6px 8px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>QUICK PAYLOAD:</span>
                <button
                  type="button"
                  className="cos-btn"
                  style={{ fontSize: '10px', padding: '2px 7px' }}
                  onClick={() => {
                    playClickSound(850);
                    setUrlPath('/api/v1/accounts?username=alice');
                  }}
                >
                  alice
                </button>
                <button
                  type="button"
                  className="cos-btn"
                  style={{ fontSize: '10px', padding: '2px 7px', color: '#f59e0b' }}
                  onClick={() => {
                    playClickSound(850);
                    setUrlPath("/api/v1/accounts?username=' OR 1=1--");
                  }}
                >
                  ' OR 1=1--
                </button>
                <button
                  type="button"
                  className="cos-btn"
                  style={{ fontSize: '10px', padding: '2px 7px', color: '#38bdf8' }}
                  onClick={() => {
                    playClickSound(850);
                    setUrlPath("/api/v1/accounts?username=' UNION SELECT 1,2,3,4--");
                  }}
                >
                  UNION SELECT
                </button>
              </div>

              <div className="cos-panel-body" style={{ padding: '8px', gap: '8px' }}>
                {repeaterMode === 'params' ? (
                  <>
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

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>HEADERS:</span>
                      <textarea
                        className="cos-textarea"
                        value={requestHeaders}
                        onChange={(e) => setRequestHeaders(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>RAW HTTP REQUEST:</span>
                    <textarea
                      className="cos-textarea"
                      value={rawRequestText}
                      onChange={(e) => setRawRequestText(e.target.value)}
                      style={{ flex: 1, fontFamily: 'monospace' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Response Pane */}
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>HTTP RESPONSE</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className={`cos-badge ${
                      responseStatus.startsWith('200')
                        ? 'cos-badge-emerald'
                        : responseStatus.startsWith('500')
                        ? 'cos-badge-red'
                        : 'cos-badge-amber'
                    }`}
                  >
                    {responseStatus}
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{responseTime} ms</span>
                </div>
              </div>

              {responseBody.includes('FLAG{') && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    borderBottom: '1px solid #059669',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 700 }}>
                    🎉 FLAG DISCOVERED IN RESPONSE BODY!
                  </span>
                  <button
                    type="button"
                    className="cos-btn cos-btn-primary"
                    style={{ fontSize: '10px', padding: '2px 8px' }}
                    onClick={() => {
                      playClickSound(1000);
                      setManualFlag(SQLI_FLAG);
                    }}
                  >
                    <Copy size={11} />
                    <span>Copy to Submit Bar</span>
                  </button>
                </div>
              )}

              <div className="cos-panel-body" style={{ padding: '8px', gap: '8px' }}>
                <div style={{ height: '65px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>RESPONSE HEADERS:</span>
                  <textarea className="cos-textarea" readOnly value={responseHeaders} style={{ flex: 1, fontSize: '10px' }} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>RESPONSE BODY:</span>
                  <textarea
                    className="cos-textarea cos-textarea-output"
                    readOnly
                    value={responseBody}
                    style={{
                      flex: 1,
                      color: responseBody.includes('FLAG{') ? '#34d399' : responseStatus.startsWith('500') ? '#f87171' : '#cbd5e1',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'intruder' ? (
          /* Intruder (Fuzzer) Tab */
          <div className="cos-split-horizontal">
            {/* Left: Intruder Config & Payload Wordlist */}
            <div className="cos-panel" style={{ flex: '0 0 320px' }}>
              <div className="cos-panel-header">
                <span>INTRUDER CONFIGURATION</span>
                <span className="cos-badge cos-badge-amber">SNIPER ATTACK</span>
              </div>

              <div className="cos-panel-body" style={{ padding: '8px', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700 }}>Target URL with Payload Marker:</label>
                  <input
                    type="text"
                    className="cos-input"
                    value={intruderTarget}
                    onChange={(e) => setIntruderTarget(e.target.value)}
                    style={{ marginTop: '2px' }}
                  />
                  <span style={{ fontSize: '9.5px', color: '#64748b' }}>§payload§ markers define injection points.</span>
                </div>

                <div>
                  <label style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700 }}>Payload Set Presets:</label>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className={`cos-btn ${intruderPreset === 'sqli' ? 'cos-btn-primary' : ''}`}
                      style={{ flex: 1, fontSize: '10px' }}
                      onClick={() => {
                        setIntruderPreset('sqli');
                        setCustomWordlist(SQLI_WORDLIST.join('\n'));
                      }}
                    >
                      SQLi List
                    </button>
                    <button
                      type="button"
                      className={`cos-btn ${intruderPreset === 'idor' ? 'cos-btn-primary' : ''}`}
                      style={{ flex: 1, fontSize: '10px' }}
                      onClick={() => {
                        setIntruderPreset('idor');
                        setCustomWordlist(IDOR_WORDLIST.join('\n'));
                      }}
                    >
                      IDOR List
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700, marginBottom: '2px' }}>
                    Payload Items ({customWordlist.split('\n').filter(Boolean).length}):
                  </label>
                  <textarea
                    className="cos-textarea"
                    value={customWordlist}
                    onChange={(e) => setCustomWordlist(e.target.value)}
                    style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </div>

                <button
                  type="button"
                  className="cos-btn cos-btn-primary"
                  style={{ background: '#ea580c', borderColor: '#fb923c', padding: '6px 12px', fontWeight: 700 }}
                  onClick={handleRunIntruder}
                  disabled={intruderRunning}
                >
                  <Crosshair size={13} />
                  <span>{intruderRunning ? 'FUZZING IN PROGRESS...' : 'START FUZZING ATTACK'}</span>
                </button>
              </div>
            </div>

            {/* Right: Attack Results Table & Inspection */}
            <div className="cos-panel" style={{ flex: 1 }}>
              <div className="cos-panel-header">
                <span>INTRUDER RESULTS TABLE ({intruderResults.length} Responses)</span>
                {intruderResults.some((r) => r.hasFlag) && (
                  <span className="cos-badge cos-badge-emerald">FLAG EXTRACTED</span>
                )}
              </div>

              <div className="cos-table-container" style={{ flex: '1 1 200px', border: 'none', borderBottom: '1px solid #1e293b' }}>
                <table className="cos-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Payload</th>
                      <th style={{ width: '70px' }}>Status</th>
                      <th style={{ width: '90px' }}>Length (B)</th>
                      <th style={{ width: '70px' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intruderResults.map((res) => {
                      const isSelected = selectedIntruderRow?.reqNo === res.reqNo;
                      const isAnomaly = res.length > 500 || res.status === '500';
                      return (
                        <tr
                          key={res.reqNo}
                          onClick={() => {
                            playClickSound(1050);
                            setSelectedIntruderRow(res);
                          }}
                          className={isSelected ? 'is-selected' : ''}
                          style={{
                            cursor: 'pointer',
                            background: isAnomaly ? 'rgba(234, 88, 12, 0.12)' : undefined,
                          }}
                        >
                          <td style={{ fontWeight: 700 }}>{res.reqNo}</td>
                          <td style={{ fontFamily: 'monospace', color: res.hasFlag ? '#34d399' : '#38bdf8' }}>
                            {res.payload} {res.hasFlag ? '⚡ [BREACH]' : ''}
                          </td>
                          <td>
                            <span className={`cos-badge ${res.status === '200' ? 'cos-badge-emerald' : 'cos-badge-red'}`}>
                              {res.status}
                            </span>
                          </td>
                          <td style={{ fontWeight: isAnomaly ? 700 : 400, color: isAnomaly ? '#fb923c' : '#94a3b8' }}>
                            {res.length} B
                          </td>
                          <td style={{ color: '#94a3b8' }}>{res.time} ms</td>
                        </tr>
                      );
                    })}
                    {!intruderResults.length && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No attack results yet. Configure payloads on the left and click "START FUZZING ATTACK".
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Inspection of Selected Intruder Request/Response */}
              <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', background: '#05080e', padding: '6px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>
                    {selectedIntruderRow
                      ? `REQUEST #${selectedIntruderRow.reqNo} INSPECTION [${selectedIntruderRow.payload}]`
                      : 'SELECT A ROW ABOVE TO INSPECT RAW RESPONSE'}
                  </span>
                  {selectedIntruderRow?.hasFlag && (
                    <button
                      type="button"
                      className="cos-btn cos-btn-primary"
                      style={{ fontSize: '9.5px', padding: '1px 6px' }}
                      onClick={() => {
                        playClickSound(1000);
                        setManualFlag(SQLI_FLAG);
                      }}
                    >
                      <Copy size={10} />
                      <span>Copy Flag</span>
                    </button>
                  )}
                </div>
                <textarea
                  className="cos-textarea cos-textarea-output"
                  readOnly
                  value={
                    selectedIntruderRow
                      ? selectedIntruderRow.responseBody
                      : 'Click any row in the table above to view the HTTP response payload returned by the database.'
                  }
                  style={{
                    flex: 1,
                    fontSize: '10.5px',
                    color: selectedIntruderRow?.hasFlag ? '#34d399' : '#cbd5e1',
                  }}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'timing' ? (
          /* Timing Oracle Tab */
          <div className="cos-split-horizontal">
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>SIDE-CHANNEL TIMING PROBE</span>
                <span className="cos-badge cos-badge-amber">NON-CONSTANT TIME strcmp()</span>
              </div>
              <div className="cos-panel-body" style={{ padding: '12px', gap: '10px' }}>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                  Enter candidate token strings to measure execution duration variance against the authentication gate.
                </p>

                <form onSubmit={handleSendTimingProbe} style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="cos-input"
                    placeholder="Candidate string (e.g. FLAG{side_channel_timing_...)"
                    value={timingToken}
                    onChange={(e) => setTimingToken(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" className="cos-btn cos-btn-primary">
                    <Send size={11} />
                    <span>Send Probe</span>
                  </button>
                </form>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    'FLAG{',
                    'FLAG{s',
                    'FLAG{side_',
                    'FLAG{side_channel_',
                    'FLAG{side_channel_timing_leak_enumerated}',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="cos-btn"
                      style={{ fontSize: '10px' }}
                      onClick={() => setTimingToken(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {timingNotice && (
                  <div
                    style={{
                      background: timingNotice.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      border: `1px solid ${timingNotice.type === 'success' ? '#059669' : '#0284c7'}`,
                      borderRadius: '4px',
                      padding: '8px 10px',
                      color: timingNotice.type === 'success' ? '#34d399' : '#38bdf8',
                      fontSize: '11px',
                    }}
                  >
                    <div>{timingNotice.text}</div>
                    {timingNotice.action && (
                      <button
                        type="button"
                        className="cos-btn cos-btn-primary"
                        style={{ marginTop: '6px', fontSize: '10px' }}
                        onClick={() => {
                          playClickSound(1000);
                          setManualFlag(TIMING_FLAG);
                        }}
                      >
                        <Copy size={11} />
                        <span>Copy Cracked Token to Submit Bar</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

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
                          <span className="cos-badge cos-badge-cyan">+{(log.latency - 48.0).toFixed(1)} ms</span>
                        </td>
                      </tr>
                    ))}
                    {!timingLogs.length && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No timing probes recorded yet. Send a candidate string on the left.
                        </td>
                      </tr>
                    )}
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
