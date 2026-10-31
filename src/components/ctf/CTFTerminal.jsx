import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Sparkles, X, Trash2 } from 'lucide-react';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { CTF_CHALLENGES } from '../../utils/ctf/ctfChallenges.js';

// Simulated virtual filesystem for forensic investigation
const VFS = {
  '/': ['bin', 'etc', 'home', 'mnt', 'opt', 'var'],
  '/home/mrwhitehat': ['notes.txt', 'staging_payload.b64', 'scan_network.sh'],
  '/opt/challenges': [
    'caesar_tumbler.bin',
    'sentinel_daemon.elf',
    'vault_cache.dump',
    'traffic_ids.pcap',
  ],
  '/mnt/usb_ducky': ['inject.bin', 'readme.nfo', 'flag.txt'],
  '/var/log': ['auth.log', 'syslog', 'hvac_telemetry.log'],
};

const FILE_CONTENTS = {
  '/home/mrwhitehat/notes.txt':
    'OPERATIONAL SECURITY DIRECTIVE:\n- All CTF flags adhere to standard format: FLAG{...}\n- Use "flag <FLAG>" or the Flag Submission Bar to submit.\n- Inspect physical artifacts at stations across the 3D office workspace.',
  '/home/mrwhitehat/staging_payload.b64':
    'SUVYIChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vMTkyLjE2OC4xLjQ1Ojg0NDMvcGF5bG9hZC5wczEnKQ==',
  '/mnt/usb_ducky/flag.txt': 'FLAG{physical_access_usb_ducky_recovered}',
  '/mnt/usb_ducky/readme.nfo':
    'USB Rubber Ducky v2 firmware loaded.\nTarget payload: Windows PowerShell staging agent.',
  '/var/log/hvac_telemetry.log':
    '[SENSOR-04] Ambient: 21.4C | Acoustic carrier: FLAG{hvac_acoustic_sidechannel_exfiltrated}',
  '/var/log/auth.log':
    'May 14 10:22:01 workstation sshd[1042]: Accepted publickey for mrwhitehat from 192.168.1.18 port 48122 ssh2',
};

export default function CTFTerminal({ onFlagSolved, onClose = null }) {
  const [history, setHistory] = useState([
    {
      type: 'system',
      text: 'MrWhiteHat Cyber Command Terminal v3.8 [Linux x86_64]\nType "help" for a list of cybersecurity diagnostic tools.\n',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdIndex, setCmdIndex] = useState(-1);
  const [cmdHistory, setCmdHistory] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmdStr) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [trimmed, ...prev]);
    setCmdIndex(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const logEntry = (text, type = 'output') => {
      setHistory((prev) => [...prev, { type: 'input', text: `$ ${trimmed}` }, { type, text }]);
    };

    switch (cmd) {
      case 'help':
        logEntry(
          `AVAILABLE CTF COMMANDS:
  help                    - Display this diagnostic tool list
  ls [path]               - List directory files (/opt/challenges, /mnt/usb_ducky, ...)
  cat <file>              - Inspect contents of artifact files
  grep <term> <file>      - Search file contents for string
  strings <file>          - Extract human-readable strings from artifacts
  base64 -d <encoded>     - Decode base64 payloads
  curl <url>              - Send simulated HTTP request (e.g. http://hvac.internal/telemetry)
  nmap <target>           - Scan network host for open ports
  flag <FLAG{...}>        - Submit flag directly to CTF engine
  score                   - View your CTF progress and points
  clear                   - Clear screen`,
          'info'
        );
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'ls': {
        const targetDir = args[0] || '/home/mrwhitehat';
        if (VFS[targetDir]) {
          logEntry(VFS[targetDir].join('   '), 'output');
        } else if (targetDir === '/') {
          logEntry(VFS['/'].join('   '), 'output');
        } else {
          logEntry(`ls: cannot access '${targetDir}': No such file or directory`, 'error');
        }
        break;
      }

      case 'cat': {
        const path = args[0];
        if (!path) {
          logEntry('usage: cat <filepath>', 'error');
        } else if (FILE_CONTENTS[path]) {
          logEntry(FILE_CONTENTS[path], 'output');
        } else {
          logEntry(`cat: ${path}: No such file or directory`, 'error');
        }
        break;
      }

      case 'base64': {
        if (args[0] === '-d' && args[1]) {
          try {
            const decoded = atob(args[1]);
            logEntry(decoded, 'success');
          } catch (_) {
            logEntry('base64: invalid input string', 'error');
          }
        } else {
          logEntry('usage: base64 -d <base64_string>', 'error');
        }
        break;
      }

      case 'strings': {
        const file = args[0];
        if (file?.includes('ducky') || file?.includes('usb')) {
          logEntry('FLAG{physical_access_usb_ducky_recovered}\nDUCKY_FIRMWARE_V2\nWIN_PAYLOAD', 'success');
        } else if (file?.includes('caesar') || file?.includes('tumbler')) {
          logEntry('ODVVZRU_1337_FOHDUDQFH\nROT3_SEPARATION_DETECTED', 'output');
        } else {
          logEntry(`strings: reading ${file || 'input'}: 0 strings found`, 'output');
        }
        break;
      }

      case 'grep': {
        const term = args[0];
        const file = args[1];
        if (!term || !file) {
          logEntry('usage: grep <term> <file>', 'error');
        } else if (FILE_CONTENTS[file]) {
          const lines = FILE_CONTENTS[file]
            .split('\n')
            .filter((l) => l.toLowerCase().includes(term.toLowerCase()));
          logEntry(lines.length > 0 ? lines.join('\n') : `(no matches for "${term}")`, 'output');
        } else {
          logEntry(`grep: ${file}: No such file or directory`, 'error');
        }
        break;
      }

      case 'curl': {
        const url = args[0] || '';
        if (url.includes('hvac.internal') || url.includes('telemetry')) {
          logEntry(
            `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\n  "system": "BAS-Vent-04",\n  "status": "ONLINE",\n  "acoustic_stream": "FLAG{hvac_acoustic_sidechannel_exfiltrated}"\n}`,
            'success'
          );
        } else if (url.includes('mainframe.internal') || url.includes('auth')) {
          logEntry(
            `HTTP/1.1 200 OK\nServer: Mainframe-Custom/1.0\n\n{"error": "WAF_BLOCKED", "message": "Standard SQL keywords prohibited. Try comment evasion."}`,
            'output'
          );
        } else {
          logEntry(`curl: (7) Failed to connect to ${url || 'target'}: Connection refused`, 'error');
        }
        break;
      }

      case 'nmap': {
        const target = args[0] || '127.0.0.1';
        logEntry(
          `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for ${target}\nHost is up (0.00042s latency).\nNot shown: 996 closed tcp ports\nPORT     STATE SERVICE       VERSION\n22/tcp   open  ssh           OpenSSH 8.9p1\n80/tcp   open  http          Nginx 1.24\n443/tcp  open  ssl/https     Cloudflare\n8000/tcp open  http-alt      Chisel SOCKS5 Proxy\n\nNmap done: 1 IP address scanned.`,
          'output'
        );
        break;
      }

      case 'flag': {
        const flagAttempt = args[0];
        if (!flagAttempt) {
          logEntry('usage: flag <FLAG{...}>', 'error');
          break;
        }

        let solvedOne = false;
        for (const ch of CTF_CHALLENGES) {
          const res = ctfEngine.submitFlag(ch.id, flagAttempt);
          if (res.success) {
            logEntry(
              `🏆 [CTF ENGINE] ${res.message}\nCategory: ${res.challenge.category} | Difficulty: ${res.challenge.difficulty}`,
              'success'
            );
            solvedOne = true;
            onFlagSolved?.(res);
            break;
          } else if (res.duplicate) {
            logEntry(`ℹ️ [CTF ENGINE] ${res.message}`, 'info');
            solvedOne = true;
            break;
          }
        }

        if (!solvedOne) {
          logEntry('❌ [CTF ENGINE] INVALID FLAG. Hash verification failed.', 'error');
        }
        break;
      }

      case 'score': {
        const st = ctfEngine.getState();
        logEntry(
          `CTF OPERATIVE TELEMETRY:\n  Score: ${st.score} PTS\n  Challenges Solved: ${st.solvedCount} / ${st.totalCount}\n  Badges Unlocked: ${st.badges.length}\n  Status: ${st.score > 1500 ? 'ELITE ROOT' : st.score > 500 ? 'SPECIALIST' : 'RECRUIT'}`,
          'info'
        );
        break;
      }

      default:
        logEntry(`command not found: ${cmd}. Type "help" for command directory.`, 'error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0 && cmdIndex < cmdHistory.length - 1) {
        const nextIdx = cmdIndex + 1;
        setCmdIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdIndex > 0) {
        const nextIdx = cmdIndex - 1;
        setCmdIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      } else if (cmdIndex === 0) {
        setCmdIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div className="ctf-terminal-box">
      <div className="ctf-term-bar">
        <div className="ctf-term-title">
          <TerminalIcon size={14} className="text-cyan-400" />
          <span>sh // mrwhitehat@grid-console:~</span>
        </div>
        <div className="ctf-term-actions">
          <button
            className="ctf-term-btn"
            onClick={() => setHistory([])}
            title="Clear output"
          >
            <Trash2 size={12} />
          </button>
          {onClose && (
            <button
              className="ctf-term-btn"
              onClick={onClose}
              title="Close terminal"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="ctf-term-output">
        {history.map((h, i) => (
          <div key={i} className={`ctf-line ctf-line-${h.type}`}>
            <pre>{h.text}</pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="ctf-term-input-row">
        <span className="ctf-prompt">mrwhitehat@ctf:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type 'help', 'ls /mnt/usb_ducky', 'curl ...', 'flag FLAG{...}'"
          className="ctf-cmd-input"
          autoFocus
          spellCheck={false}
        />
        <button
          className="ctf-send-btn"
          onClick={() => {
            executeCommand(inputVal);
            setInputVal('');
          }}
          aria-label="Send command"
        >
          <CornerDownLeft size={14} />
        </button>
      </div>

      {/* Mobile Quick Action Buttons */}
      <div className="ctf-quick-actions">
        {['help', 'ls /mnt/usb_ducky', 'cat /mnt/usb_ducky/flag.txt', 'curl http://hvac.internal/telemetry', 'score', 'clear'].map(
          (btnCmd) => (
            <button
              key={btnCmd}
              type="button"
              className="ctf-quick-btn"
              onClick={() => executeCommand(btnCmd)}
            >
              {btnCmd}
            </button>
          )
        )}
      </div>
    </div>
  );
}
