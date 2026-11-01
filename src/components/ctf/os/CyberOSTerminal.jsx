import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CheckCircle2, Play, Zap, ArrowRight, CornerDownLeft, HelpCircle } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine, CHALLENGE_TO_STATION } from '../../../utils/ctf/ctfEngine.js';

// Virtual Filesystem (VFS)
const VFS = {
  '/home/guest': {
    type: 'dir',
    files: ['README.txt', 'notes.txt', 'hints.txt', 'submit_flag.sh'],
  },
  '/home/guest/README.txt': {
    type: 'file',
    content:
      '=== MR. WHITE HAT // KALI CYBER OS BASH TERMINAL ===\n' +
      'Welcome to the CTF sandbox environment.\n' +
      'All challenges, binaries, network scripts, and forensic captures are in /challenges.\n' +
      'Type "hints" or "cat hints.txt" for step-by-step solving walkthroughs.\n' +
      'To submit a flag from the CLI, type: submit FLAG{your_flag_here}\n' +
      'Type "help" for a list of available command line utilities.',
  },
  '/home/guest/notes.txt': {
    type: 'file',
    content:
      'OPERATIVE RECON FIELD LOG:\n' +
      '- Target Network: 10.0.0.0/24 subnet. Plaintext HTTP transactions exchanged on internal ports.\n' +
      '- IoT Firmware: Hardware test pads exposed on PCB silkscreen. Check serial TX/GND traces.\n' +
      '- Intercepted Telegram: Classical Caesar shift. Cross-reference cipher letter frequencies with English.\n' +
      '- Sentinel Daemon: ELF binary contains ptrace anti-debug check. Neutralize conditional jump.\n' +
      '- Stack Server: Unbounded input buffer in vuln.c. Determine buffer capacity + 64-bit RBP offset.',
  },
  '/home/guest/hints.txt': {
    type: 'file',
    content:
      '=== CTF SOLVING WALKTHROUGH & INVESTIGATION REFERENCE ===\n' +
      '1. CRYPTO (Caesar): In CyberChef, add "Caesar Cipher". Peak cipher letter is H; English is E (distance = -3). Set Shift Key to -3 to decrypt.\n' +
      '2. FORENSICS (Wireshark): Type "http" in filter bar. Open Packet #7 or #8, click [Follow TCP Stream] to view plaintext token in JSON.\n' +
      '3. WEB SQLi (Burp Suite): In URL bar, replace "alice" with "\' OR 1=1--" to bypass query and extract root_sentinel admin clearance.\n' +
      '4. PWN STACK (Ghidra): Buffer is 16 bytes, saved RBP is 8 bytes. Enter Padding = 24, Target Address = 0x00401155 (or "win"). Click Run.\n' +
      '5. REVERSING (Ghidra): Target jump at 0x004011ad terminates process. In Patch Opcode, enter "90 90", click Apply, then Run Patched Binary.\n' +
      '6. HARDWARE (PulseView): Connect Probe CH0 to TP3 (UART_TX) and GND to TP4 (GND). Set Baud Rate to 115200 and click Start Capture.\n' +
      '7. STEGO (Spectrogram): Set Carrier Frequency to 142.8 kHz and DSP Filter to High-Pass (15 kHz) to reveal green watermark text.\n' +
      'Type "submit FLAG{...}" to submit any flag directly from this terminal!',
  },
  '/home/guest/submit_flag.sh': {
    type: 'file',
    content: '#!/bin/bash\n# Usage: submit FLAG{...}\necho "Use native \'submit <flag>\' command directly."',
  },
  '/challenges': {
    type: 'dir',
    files: ['web', 'crypto', 'pwn', 'forensics', 'reverse', 'network'],
  },
  '/challenges/web': {
    type: 'dir',
    files: ['sqli_accounts.db', 'timing_auth.py'],
  },
  '/challenges/crypto': {
    type: 'dir',
    files: ['encrypted_telegram.txt'],
  },
  '/challenges/pwn': {
    type: 'dir',
    files: ['vuln_server.c', 'vuln_server'],
  },
  '/challenges/forensics': {
    type: 'dir',
    files: ['capture_042.pcapng'],
  },
};

export default function CyberOSTerminal({ onOpenApp, onOpenStation }) {
  const [cwd, setCwd] = useState('/home/guest');
  const [history, setHistory] = useState([
    'Linux kali-box 6.6.9-amd64 #1 SMP PREEMPT Kali 6.6.9-1kali1 (2026-01-15) x86_64',
    ' ',
    '  ___ _   _ ___ _____ ___ ___  ___ ',
    ' | _ ) | | | _ \\ _ \\ _ \\ _ \\/ __|',
    ' | _ \\ |_| |   /  _/   /  _/\\__ \\',
    ' |___/\\___/|_|_\\_| |_|_\\_|  |___/',
    ' Kali Linux Cyber-OS CTF Terminal Workstation',
    ' Type "help" for commands, "hints" for step-by-step CTF guide, or "submit <FLAG>"',
    ' ',
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setHistory((prev) => [...prev, `guest@kali-box:${cwd}$ `]);
      return;
    }

    setCmdHistory((prev) => [trimmed, ...prev]);
    setHistoryIdx(-1);
    setInputVal('');
    playClickSound(1050);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newLines = [`guest@kali-box:${cwd}$ ${raw}`];

    switch (cmd) {
      case 'help':
        newLines.push(
          '=== AVAILABLE TERMINAL UTILITIES ===',
          '  help                 Display this command reference',
          '  hints                Display step-by-step hints and how to solve each challenge',
          '  ls [-la]             List files in current working directory',
          '  cat <file>           Display content of target file',
          '  cd <dir>             Change working directory',
          '  pwd                  Print current working directory',
          '  clear                Clear terminal scrollback screen',
          '  whoami               Display current user identity & clearance level',
          '  uname -a             Display kernel architecture and OS release',
          '  submit <FLAG{...}>   Verify and submit captured CTF flag to scoring engine',
          ' ',
          '=== GUI SUITE LAUNCHERS ===',
          '  wireshark            Launch Wireshark Packet Analyzer GUI',
          '  burp                 Launch Burp Suite Web Exploitation GUI',
          '  ghidra               Launch Ghidra Decompiler & GDB Debugger GUI',
          '  cyberchef            Launch CyberChef Cryptanalysis Suite GUI',
          '  logic                Launch PulseView Hardware Logic Analyzer GUI',
          '  spectrogram          Launch SonicVisualizer Audio Stego GUI',
          '  ctf                  Launch CTF Mission Control Center GUI'
        );
        break;

      case 'hints':
      case 'hint':
        newLines.push(
          '====================================================================',
          '  💡 HOW TO SOLVE CTF CHALLENGES // STEP-BY-STEP OPERATIVE GUIDE',
          '====================================================================',
          '1. [CRYPTOGRAPHY] Operation Caesar:',
          '   - Tool: Launch "cyberchef" from the terminal or Applications menu.',
          '   - Action: Add "Caesar Cipher" to recipe. Set Shift Key to -3 (letter H shifted back to E).',
          '   - Result: Output box deciphers the plaintext containing the flag!',
          ' ',
          '2. [DIGITAL FORENSICS] PCAP Data Exfiltration:',
          '   - Tool: Launch "wireshark".',
          '   - Action: Click [http] filter button. Select Packet #7 or #8. Click [Follow TCP Stream].',
          '   - Result: Inspect JSON response body for the "token" value.',
          ' ',
          '3. [WEB EXPLOITATION] SQL Injection WAF Bypass:',
          '   - Tool: Launch "burp" -> HTTP Repeater.',
          '   - Action: Replace "alice" with "\' OR 1=1--" in the URL and click [SEND REQUEST].',
          '   - Result: Admin account (root_sentinel) clearance record contains the flag!',
          ' ',
          '4. [BINARY EXPLOITATION] Stack Buffer Overflow:',
          '   - Tool: Launch "ghidra" -> GDB Stack Buffer Overflow tab.',
          '   - Action: Enter Padding = 24 (16 bytes buffer + 8 bytes RBP) and Target Address = 0x00401155 (or "win").',
          '   - Result: Click [RUN EXPLOIT IN GDB] to hijack execution to win() and dump the flag!',
          ' ',
          '5. [REVERSE ENGINEERING] Anti-Debug Opcode Patching:',
          '   - Tool: Launch "ghidra" -> Ghidra Opcode Patcher tab.',
          '   - Action: Type "90 90" into Patch Opcode, click [Apply Patch], then click [RUN PATCHED BINARY].',
          '   - Result: Bypass anti-debug ptrace check to call decrypt_vault_flag()!',
          ' ',
          '6. [HARDWARE FORENSICS] UART Silkscreen Reverse Engineering:',
          '   - Tool: Launch "logic" (PulseView).',
          '   - Action: Connect Probe CH0 to TP3 (UART_TX), Probe GND to TP4 (GND), set Baud to 115200.',
          '   - Result: Click [START CAPTURE] to dump the bootloader firmware flag in the serial console!',
          ' ',
          '7. [STEGANOGRAPHY] Ultrasonic Audio Demodulation:',
          '   - Tool: Launch "spectrogram" (SonicVisualizer).',
          '   - Action: Tune Carrier Frequency to 142.8 kHz and select High-Pass (15 kHz) DSP filter.',
          '   - Result: Waterfall canvas demodulates the hidden green spectral watermark!',
          ' ',
          'Format: All flags adhere to standard syntax: FLAG{...}',
          'Submit from terminal: submit FLAG{...}',
          '===================================================================='
        );
        break;

      case 'whoami':
        newLines.push('guest (Clearance: L2_OPERATIVE · Shell: /bin/bash)');
        break;

      case 'uname':
        newLines.push('Linux kali-box 6.6.9-amd64 #1 SMP PREEMPT Kali 6.6.9-1kali1 (2026-01-15) x86_64 GNU/Linux');
        break;

      case 'pwd':
        newLines.push(cwd);
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'ls': {
        const targetDir = VFS[cwd];
        if (targetDir && targetDir.type === 'dir') {
          newLines.push(targetDir.files.join('    '));
        } else {
          newLines.push('Error reading directory.');
        }
        break;
      }

      case 'cd': {
        const dest = args[0] || '/home/guest';
        if (dest === '..' || dest === '../') {
          setCwd('/home/guest');
        } else if (dest === '/' || dest === '/challenges' || dest.startsWith('/challenges/')) {
          if (VFS[dest]) {
            setCwd(dest);
          } else {
            newLines.push(`bash: cd: ${dest}: No such file or directory`);
          }
        } else if (dest === '/home/guest' || dest === '~') {
          setCwd('/home/guest');
        } else {
          const combined = cwd === '/' ? `/${dest}` : `${cwd}/${dest}`;
          if (VFS[combined] && VFS[combined].type === 'dir') {
            setCwd(combined);
          } else {
            newLines.push(`bash: cd: ${dest}: No such file or directory`);
          }
        }
        break;
      }

      case 'cat': {
        if (!args[0]) {
          newLines.push('Usage: cat <filename>');
          break;
        }
        const fileName = args[0];
        const fullPath = fileName.startsWith('/') ? fileName : `${cwd}/${fileName}`;
        const fileObj = VFS[fullPath];
        if (fileObj && fileObj.type === 'file') {
          newLines.push(fileObj.content);
        } else {
          newLines.push(`cat: ${fileName}: No such file or directory`);
        }
        break;
      }

      case 'submit': {
        if (!args[0]) {
          newLines.push('[-] Usage: submit FLAG{...}');
          playZapSound();
        } else {
          const flagStr = args[0].trim();
          const activeChallenges = (typeof ctfEngine?.getAllChallenges === 'function' ? ctfEngine.getAllChallenges() : []) || [];
          let solvedChallenge = null;
          let feedbackMsg = '';

          for (const ch of activeChallenges) {
            const res = ctfEngine.submitFlag(ch.id, flagStr);
            if (res.success) {
              solvedChallenge = ch;
              feedbackMsg = res.message;
              break;
            }
          }

          if (solvedChallenge) {
            const stationId = CHALLENGE_TO_STATION[solvedChallenge.id] || solvedChallenge.stationId;
            const curScore = typeof ctfEngine?.getScore === 'function' ? ctfEngine.getScore() : (ctfEngine?.getState?.()?.score ?? 0);
            newLines.push(
              `[+] SUCCESS! ${feedbackMsg}`,
              `[+] Challenge '${solvedChallenge.title}' (+${solvedChallenge.points} PTS) SOLVED!`,
              stationId ? `[+] 🔓 STATION UNLOCKED: ${stationId.toUpperCase().replace('_', ' ')}` : '',
              stationId ? `[+] Opening 3D station information window in 2s...` : '',
              `[+] Current CTF Score: ${curScore} PTS`
            );
            playBreachFanfare();
            if (stationId) {
              setTimeout(() => onOpenStation?.(stationId), 2000);
            }
          } else {
            newLines.push(`[-] Verification Failed: "${flagStr}" does not match any challenge SHA-256 hash.`);
            playZapSound();
          }
        }
        break;
      }

      case 'open':
      case 'dossier': {
        const target = args[0]?.toLowerCase().trim();
        if (!target) {
          newLines.push('Usage: open <station_id> (e.g. projects, skills, about, resume, wireshark, server_rack, operator, contact)');
        } else {
          const mapping = {
            wireshark: 'wireshark_monitor',
            network: 'wireshark_monitor',
            projects: 'projects',
            skills: 'skills',
            about: 'about',
            resume: 'resume',
            contact: 'contact',
            operator: 'operator',
            server: 'server_rack',
            server_rack: 'server_rack',
            hardware: 'hardware_arsenal',
            vault: 'secret_vault',
            visitor: 'visitor_log',
          };
          const resolved = mapping[target] || target;
          newLines.push(`[*] Opening 3D station information dossier for: ${resolved.toUpperCase()}...`);
          onOpenStation?.(resolved);
        }
        break;
      }

      // GUI suite launches
      case 'wireshark':
        onOpenApp?.('wireshark');
        newLines.push('[*] Launching Wireshark Packet Analyzer GUI in workspace...');
        break;
      case 'burp':
      case 'burpsuite':
        onOpenApp?.('burp');
        newLines.push('[*] Launching Burp Suite Community v2026.1 in workspace...');
        break;
      case 'ghidra':
      case 'gdb':
        onOpenApp?.('ghidra');
        newLines.push('[*] Launching Ghidra Decompiler & GDB Debugger in workspace...');
        break;
      case 'cyberchef':
        onOpenApp?.('cyberchef');
        newLines.push('[*] Launching CyberChef Cryptanalysis Suite in workspace...');
        break;
      case 'logic':
      case 'pulseview':
        onOpenApp?.('logic');
        newLines.push('[*] Launching PulseView Logic Analyzer in workspace...');
        break;
      case 'spectrogram':
      case 'sonicvisualizer':
        onOpenApp?.('spectrogram');
        newLines.push('[*] Launching SonicVisualizer Audio Stego in workspace...');
        break;
      case 'ctf':
        onOpenApp?.('ctf');
        newLines.push('[*] Launching CTF Mission Control Center in workspace...');
        break;

      default:
        newLines.push(`bash: ${cmd}: command not found. Type "help" or "hints" for assistance.`);
        break;
    }

    setHistory((prev) => [...prev, ...newLines]);
  };

  return (
    <div className="cos-app-container select-text" style={{ background: '#04070a' }}>
      {/* 1. Header Toolbar with Quick Action Chips */}
      <div className="cos-app-header">
        <div className="cos-app-title">
          <Terminal size={15} style={{ color: '#00f0ff' }} />
          <span>KALI LINUX BASH // /bin/bash</span>
          <span className="cos-badge cos-badge-cyan">{cwd}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { label: '💡 hints', cmd: 'hints' },
            { label: 'ls -la', cmd: 'ls' },
            { label: 'cat notes.txt', cmd: 'cat notes.txt' },
            { label: 'clear', cmd: 'clear' },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="cos-btn"
              style={{ fontSize: '10px', padding: '2px 8px' }}
              onClick={() => handleCommand(chip.cmd)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Terminal Screen & Scrollback */}
      <div className="cos-app-body" style={{ padding: '10px' }}>
        <div style={{ flex: 1, overflowY: 'auto', lineHeight: '1.6', fontSize: '11.5px' }}>
          {history.map((line, idx) => (
            <div
              key={idx}
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                color: line.startsWith('guest@kali-box')
                  ? '#00f0ff'
                  : line.includes('[+]') || line.includes('FLAG{') || line.includes('SUCCESS')
                  ? '#34d399'
                  : line.includes('[-]') || line.includes('Error') || line.includes('not found')
                  ? '#f87171'
                  : line.includes('===') || line.includes('💡')
                  ? '#fbbf24'
                  : '#cbd5e1',
                fontWeight:
                  line.startsWith('guest@kali-box') || line.includes('[+]') || line.includes('===')
                    ? 700
                    : 400,
              }}
            >
              {line}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 3. Input Prompt Line */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(inputVal);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            background: '#090e17',
            border: '1px solid #1e293b',
            borderRadius: '4px',
            marginTop: '6px',
          }}
        >
          <span style={{ color: '#00f0ff', fontWeight: 800, fontSize: '11px', userSelect: 'none' }}>
            guest@kali-box:{cwd}$
          </span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (cmdHistory.length > 0) {
                  const nextIdx = Math.min(cmdHistory.length - 1, historyIdx + 1);
                  setHistoryIdx(nextIdx);
                  setInputVal(cmdHistory[nextIdx]);
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIdx > 0) {
                  const nextIdx = historyIdx - 1;
                  setHistoryIdx(nextIdx);
                  setInputVal(cmdHistory[nextIdx]);
                } else if (historyIdx === 0) {
                  setHistoryIdx(-1);
                  setInputVal('');
                }
              }
            }}
            placeholder="Type command ... e.g. hints, help, ls, submit FLAG{...}"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#38bdf8',
              fontFamily: 'inherit',
              fontSize: '11.5px',
            }}
            autoFocus
          />
          <button type="submit" className="cos-btn cos-btn-primary" style={{ fontSize: '10px', padding: '2px 8px' }}>
            <CornerDownLeft size={10} />
            <span>Enter</span>
          </button>
        </form>
      </div>
    </div>
  );
}
