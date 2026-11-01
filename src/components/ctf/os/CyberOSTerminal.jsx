import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CheckCircle2, Play, Zap, ArrowRight, CornerDownLeft } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

// Virtual Filesystem (VFS)
const VFS = {
  '/home/guest': {
    type: 'dir',
    files: ['README.txt', 'notes.txt', 'submit_flag.sh'],
  },
  '/home/guest/README.txt': {
    type: 'file',
    content:
      '=== MR. WHITE HAT // CYBER OS TERMINAL ===\n' +
      'Welcome to the CTF sandbox environment.\n' +
      'All challenges, binaries, network scripts, and forensic captures are in /challenges.\n' +
      'To submit a flag from the CLI, type: submit FLAG{your_flag_here}\n' +
      'Type "help" for a list of available command line utilities.',
  },
  '/home/guest/notes.txt': {
    type: 'file',
    content:
      'OPERATIVE SCRATCHPAD:\n' +
      '- Web target: 10.0.0.80 (Vulnerable to SQLi and Basic Auth header leak)\n' +
      '- DMZ Bastion: 172.16.50.2:8000 (Chisel SOCKS5 proxy)\n' +
      '- Domain Controller: 10.10.10.5 (Active Directory)\n' +
      '- IoT MCU: UART baud rate 115200 on TP3 (TX) and TP4 (GND)\n' +
      '- Binary daemon: sentinel_daemon contains ptrace anti-debug jump at 0x004011ad',
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
  '/challenges/web/sqli_accounts.db': {
    type: 'file',
    content:
      'SQLite format 3\n' +
      'Table: accounts (id INTEGER, username TEXT, role TEXT, clearance_token TEXT)\n' +
      'Vulnerability: Parameter $_GET[\'username\'] is dynamically concatenated without parameterized queries.\n' +
      'Exploit with UNION SELECT or \' OR \'1\'=\'1\' --',
  },
  '/challenges/web/timing_auth.py': {
    type: 'file',
    content:
      '# Side-Channel Timing Leak Oracle\n' +
      '# Server: POST /api/v2/vault/auth\n' +
      '# Vulnerability: Early return strcmp() with usleep(15000) delay per matching prefix char.',
  },
  '/challenges/crypto': {
    type: 'dir',
    files: ['intercepted_telegram.enc', 'hashes.txt'],
  },
  '/challenges/crypto/intercepted_telegram.enc': {
    type: 'file',
    content:
      'IODJ{fdhvdu_vkliw_urw3_fohdudqfh}\n' +
      'Cipher: Monoalphabetic substitution (Shift = 3 forward: D->A, H->E, W->T)',
  },
  '/challenges/crypto/hashes.txt': {
    type: 'file',
    content:
      'admin: 76b4a3a695d7367c3b28b7e2a9b3d043d8a6e87f17b35bcfe8bf6fe575027581 (SHA256)\n' +
      'root:  a48f2bc0912783610928374829102837 (MD5)',
  },
  '/challenges/pwn': {
    type: 'dir',
    files: ['vuln.c', 'vuln_server', 'heap_uaf.c'],
  },
  '/challenges/pwn/vuln.c': {
    type: 'file',
    content:
      '#include <stdio.h>\n' +
      'void win() { print_flag_vault(); } // 0x00401155\n' +
      'void vuln() {\n' +
      '    char buffer[16];\n' +
      '    gets(buffer); // Stack buffer overflow: 16 bytes buf + 8 bytes RBP = 24 bytes\n' +
      '}\n' +
      'int main() { vuln(); return 0; }',
  },
  '/challenges/forensics': {
    type: 'dir',
    files: ['exfiltration.pcap', 'firmware_uart.bin'],
  },
  '/challenges/reverse': {
    type: 'dir',
    files: ['sentinel_daemon', 'inject.bin', 'duckyscript.txt'],
  },
  '/challenges/reverse/duckyscript.txt': {
    type: 'file',
    content:
      'DELAY 1500\nGUI r\nSTRING powershell -nop -w hidden\n' +
      'STRING $enc_c2 = "RkxBR3tkdWNreV9oaWRfaW5qZWN0aW9uX2RlY29kZWR9"\n' +
      'STRING [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($enc_c2))\nENTER',
  },
};

export default function CyberOSTerminal({ onOpenApp }) {
  const [cwd, setCwd] = useState('/home/guest');
  const [history, setHistory] = useState([
    'Linux mrwhitehat-box 6.6.14-kali1-amd64 #1 SMP PREEMPT_DYNAMIC x86_64',
    'The programs included with the Kali GNU/Linux system are free software.',
    'Type "help" for a list of cybersecurity tools, or "submit <FLAG>" to solve challenges.',
    '',
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (rawInput) => {
    const raw = rawInput.trim();
    if (!raw) return;

    setCmdHistory((prev) => [raw, ...prev]);
    setHistoryIdx(-1);
    setInputVal('');

    const newLines = [`guest@mrwhitehat-box:${cwd}$ ${raw}`];
    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        newLines.push(
          '=== CYBER OS CLI TOOLKIT ===',
          'Navigation:   ls, cd, pwd, cat, clear, echo, whoami, uname',
          'Inspection:   file, strings, base64 -d <str>, curl <url>',
          'Network:      nmap <target>, ping <ip>, chisel client <args>, proxychains <cmd>',
          'Forensics:    wireshark [opens Wireshark GUI], binwalk, hexdump',
          'Reversing:    ghidra [opens Ghidra GUI], gdb <file>, patch',
          'Crypto:       cyberchef [opens CyberChef GUI]',
          'CTF Engine:   submit <FLAG{...}> (submits captured flag)',
          'GUI Apps:     burp, wireshark, ghidra, cyberchef, logic, ctf'
        );
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'pwd':
        newLines.push(cwd);
        break;

      case 'whoami':
        newLines.push('guest (Clearance: L2_OPERATIVE)');
        break;

      case 'uname':
        newLines.push('Linux mrwhitehat-box 6.6.14-kali1-amd64 x86_64 GNU/Linux');
        break;

      case 'ls': {
        const targetDir = args[0]
          ? args[0].startsWith('/')
            ? args[0]
            : `${cwd}/${args[0]}`.replace(/\/+/g, '/')
          : cwd;

        const entry = VFS[targetDir];
        if (!entry) {
          newLines.push(`ls: cannot access '${args[0]}': No such file or directory`);
        } else if (entry.type === 'file') {
          newLines.push(targetDir.split('/').pop());
        } else {
          newLines.push(entry.files.join('   '));
        }
        break;
      }

      case 'cd': {
        if (!args[0] || args[0] === '~') {
          setCwd('/home/guest');
        } else if (args[0] === '..') {
          const parts = cwd.split('/').filter(Boolean);
          parts.pop();
          setCwd(parts.length === 0 ? '/' : `/${parts.join('/')}`);
        } else {
          const target = args[0].startsWith('/')
            ? args[0]
            : `${cwd}/${args[0]}`.replace(/\/+/g, '/');
          if (VFS[target] && VFS[target].type === 'dir') {
            setCwd(target);
          } else {
            newLines.push(`bash: cd: ${args[0]}: No such file or directory`);
          }
        }
        break;
      }

      case 'cat': {
        if (!args[0]) {
          newLines.push('cat: missing file operand');
        } else {
          const target = args[0].startsWith('/')
            ? args[0]
            : `${cwd}/${args[0]}`.replace(/\/+/g, '/');
          const entry = VFS[target];
          if (!entry) {
            newLines.push(`cat: ${args[0]}: No such file or directory`);
          } else if (entry.type === 'dir') {
            newLines.push(`cat: ${args[0]}: Is a directory`);
          } else {
            newLines.push(entry.content);
          }
        }
        break;
      }

      case 'submit': {
        if (!args[0]) {
          newLines.push('[-] Usage: submit FLAG{...}');
          playZapSound();
        } else {
          const flagStr = args[0].trim();
          // Find matching challenge
          const activeChallenges = (typeof ctfEngine?.getAllChallenges === "function" ? ctfEngine.getAllChallenges() : ctfEngine?.getState?.()?.challenges) || [];
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
            newLines.push(
              `[+] SUCCESS! ${feedbackMsg}`,
              `[+] Challenge '${solvedChallenge.title}' (+${solvedChallenge.points} PTS) SOLVED!`,
              `[+] Current CTF Score: ${typeof ctfEngine?.getScore === "function" ? ctfEngine.getScore() : (ctfEngine?.getState?.()?.score ?? 0)} PTS`
            );
            playBreachFanfare();
          } else {
            newLines.push(
              `[-] Verification Failed: "${flagStr}" does not match any challenge SHA-256 hash.`
            );
            playZapSound();
          }
        }
        break;
      }

      case 'base64': {
        if (args[0] === '-d' && args[1]) {
          try {
            const dec = atob(args[1].replace(/["']/g, ''));
            newLines.push(`[+] Decoded UTF-8: ${dec}`);
            playClickSound(1000);
          } catch (_) {
            newLines.push('base64: invalid input');
            playZapSound();
          }
        } else {
          newLines.push('Usage: base64 -d <encoded_string>');
        }
        break;
      }

      case 'curl': {
        const url = args[0] || '';
        if (url.includes('accounts')) {
          newLines.push(
            'HTTP/1.1 200 OK',
            'Content-Type: application/json',
            '[{"id":1,"username":"alice","role":"analyst"},{"id":99,"username":"root","clearance":"FLAG{sqli_union_select_waf_bypassed}"}]'
          );
        } else {
          newLines.push(`curl: (7) Failed to connect to ${url || 'host'}: Port 80`);
        }
        break;
      }

      case 'nmap': {
        const target = args[0] || '127.0.0.1';
        newLines.push(
          `Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-01 00:20 UTC`,
          `Nmap scan report for ${target}`,
          `Host is up (0.00031s latency).`,
          `PORT     STATE SERVICE       VERSION`,
          `22/tcp   open  ssh           OpenSSH 8.9p1`,
          `80/tcp   open  http          nginx 1.24.0 (Mainframe Web)`,
          `445/tcp  open  microsoft-ds  Active Directory (10.10.10.5)`,
          `8000/tcp open  http-alt      Chisel SOCKS5 Proxy Listener`,
          `Nmap done: 1 IP address (1 host up) scanned.`
        );
        playHackingBeep(1200);
        break;
      }

      // GUI App Launchers
      case 'wireshark':
        onOpenApp?.('wireshark');
        newLines.push('[+] Launched Wireshark Packet Analyzer (GUI)...');
        break;
      case 'burp':
      case 'burpsuite':
        onOpenApp?.('burp');
        newLines.push('[+] Launched Burp Suite Web Application Proxy (GUI)...');
        break;
      case 'ghidra':
      case 'gdb':
        onOpenApp?.('ghidra');
        newLines.push('[+] Launched Ghidra / GDB Decompiler Workstation (GUI)...');
        break;
      case 'cyberchef':
        onOpenApp?.('cyberchef');
        newLines.push('[+] Launched CyberChef Cryptanalysis Suite (GUI)...');
        break;
      case 'logic':
        onOpenApp?.('logic');
        newLines.push('[+] Launched PulseView Logic Analyzer (GUI)...');
        break;
      case 'ctf':
        onOpenApp?.('ctf');
        newLines.push('[+] Launched CTF Control Center (GUI)...');
        break;

      default:
        newLines.push(`bash: ${cmd}: command not found. Type "help" for a list of available tools.`);
        playZapSound();
    }

    setHistory((prev) => [...prev, ...newLines]);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#05080c] font-mono text-xs text-slate-200 p-3 select-text overflow-hidden">
      {/* Scrollable Output Screen */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-2 leading-relaxed">
        {history.map((line, idx) => (
          <div
            key={idx}
            className={`whitespace-pre-wrap break-all ${
              line.startsWith('guest@mrwhitehat-box')
                ? 'text-cyan-400 font-bold'
                : line.includes('[+]') || line.includes('FLAG{')
                ? 'text-emerald-400 font-bold'
                : line.includes('[-]') || line.includes('error') || line.includes('cannot')
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}
          >
            {line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Line */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCommand(inputVal);
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800 bg-[#080d14] px-2 py-1.5 rounded mt-2"
      >
        <span className="text-cyan-400 font-bold text-xs select-none">
          guest@mrwhitehat-box:{cwd}$
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
          placeholder="Type bash commands, or 'submit FLAG{...}'..."
          className="flex-1 bg-transparent border-none outline-none text-emerald-300 font-mono text-xs"
          autoFocus
        />
        <button
          type="submit"
          className="px-2.5 py-0.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-[11px] font-bold"
        >
          ENTER
        </button>
      </form>
    </div>
  );
}
