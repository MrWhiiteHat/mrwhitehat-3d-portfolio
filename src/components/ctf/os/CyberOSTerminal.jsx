import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CheckCircle2, Play, Zap, ArrowRight, CornerDownLeft, HelpCircle } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

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
      'OPERATIVE SCRATCHPAD:\n' +
      '- Web target: 10.0.0.80 (Vulnerable to SQLi and Basic Auth header leak in Packet #7)\n' +
      '- IoT MCU: UART baud rate 115200 on TP3 (TX) and TP4 (GND)\n' +
      '- Ciphertext: IODJ{fdhvdu_vkliw_urw3_fohdudqfh} (ROT-3 Caesar shift: -3)\n' +
      '- Binary daemon: sentinel_daemon contains ptrace anti-debug jump at 0x004011ad (patch: 90 90)\n' +
      '- Stack buffer: vuln_server 16-byte buffer + 8-byte RBP = 24 bytes padding to reach 0x00401155 (win())',
  },
  '/home/guest/hints.txt': {
    type: 'file',
    content:
      '=== CTF SOLVING CHEAT SHEET & QUICK HINTS ===\n' +
      '1. CRYPTO (Caesar): Shift key is -3 (or ROT-23). In CyberChef, set Shift to -3.\n' +
      '2. FORENSICS (Wireshark): Filter by "http". Inspect Packet #7 / #8 or Follow TCP Stream.\n' +
      '3. WEB (Burp Suite SQLi): Inject "\' OR 1=1--" or "\' UNION SELECT 1,2,3,4--" into username.\n' +
      '4. PWN (Buffer Overflow): Padding offset = 24 bytes, Target RIP = 0x00401155 (win).\n' +
      '5. REVERSING (Ghidra): Patch conditional jump "74 12" to "90 90" (NOP NOP).\n' +
      '6. HARDWARE (PulseView): Connect CH0 to TP3 (TX), GND to TP4, set 115200 baud.\n' +
      '7. STEGO (Spectrogram): Tune carrier to 142.8 kHz and activate 15 kHz High-Pass filter.\n' +
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

export default function CyberOSTerminal({ onOpenApp }) {
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
          '  💡 HOW TO SOLVE CTF CHALLENGES // STEP-BY-STEP QUICK GUIDE',
          '====================================================================',
          '1. [CRYPTOGRAPHY] Operation Caesar:',
          '   - Target: IODJ{fdhvdu_vkliw_urw3_fohdudqfh}',
          '   - Shift: -3 (or ROT-23). Launch "cyberchef", set Shift to -3.',
          '   - Decrypted Flag: FLAG{caesar_shift_rot3_clearance}',
          ' ',
          '2. [DIGITAL FORENSICS] PCAP Data Exfiltration:',
          '   - Target: capture_042.pcapng',
          '   - Filter by "http". Inspect Packet #7 (POST login) or Packet #8 (200 OK).',
          '   - Follow TCP Stream to extract: FLAG{pcap_dns_exfil_basic_auth_neutralized}',
          ' ',
          '3. [WEB EXPLOITATION] SQL Injection WAF Bypass:',
          '   - Target: /api/v1/accounts?username=alice',
          '   - Inject payload: \' OR 1=1-- or \' UNION SELECT 1,2,3,4--',
          '   - Resulting Flag: FLAG{sqli_union_select_waf_bypassed}',
          ' ',
          '4. [BINARY EXPLOITATION] Stack Buffer Overflow:',
          '   - Buffer size = 16 bytes, Saved RBP = 8 bytes -> Padding = 24 bytes.',
          '   - Target Saved RIP = 0x00401155 (win() address).',
          '   - Hijacked Flag: FLAG{buffer_overflow_eip_overwritten_0x55}',
          ' ',
          '5. [REVERSE ENGINEERING] Anti-Debug Opcode Patching:',
          '   - At 0x004011ad, conditional jump is "74 12" (je).',
          '   - Patch with "90 90" (NOP NOP) to neutralize ptrace() detection.',
          '   - Bypassed Flag: FLAG{binary_patch_nop_anti_debug_bypassed}',
          ' ',
          '6. [HARDWARE FORENSICS] UART Silkscreen Reverse Engineering:',
          '   - Connect probe CH0 to TP3 (UART_TX) and GND to TP4 (GND).',
          '   - Synchronize baud rate to 115200 (8-N-1) to dump bootloader firmware.',
          '   - Decoded Flag: FLAG{uart_baud_115200_logic_analyzed}',
          ' ',
          '7. [STEGANOGRAPHY] Ultrasonic Audio Demodulation:',
          '   - Tune carrier frequency to 142.8 kHz and activate 15 kHz High-Pass filter.',
          '   - Reconstructed Flag: FLAG{stego_audio_watermark_demodulated}',
          ' ',
          'To submit any captured flag right now: type "submit FLAG{...}"',
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
            if (res.success || res.duplicate) {
              solvedChallenge = ch;
              feedbackMsg = res.message;
              break;
            }
          }

          if (solvedChallenge) {
            const curScore = typeof ctfEngine?.getScore === 'function' ? ctfEngine.getScore() : (ctfEngine?.getState?.()?.score ?? 0);
            newLines.push(
              `[+] SUCCESS! ${feedbackMsg}`,
              `[+] Challenge '${solvedChallenge.title}' (+${solvedChallenge.points} PTS) SOLVED!`,
              `[+] Current CTF Score: ${curScore} PTS`
            );
            playBreachFanfare();
          } else {
            newLines.push(`[-] Verification Failed: "${flagStr}" does not match any challenge SHA-256 hash.`);
            playZapSound();
          }
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
