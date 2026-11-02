import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CheckCircle2, Play, Zap, ArrowRight, CornerDownLeft, HelpCircle } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine, CHALLENGE_TO_STATION } from '../../../utils/ctf/ctfEngine.js';

// Virtual Filesystem (VFS) with authentic files, binaries, and configs
const VFS = {
  '/home/guest': {
    type: 'dir',
    files: ['README.txt', 'notes.txt', 'hints.txt', 'submit_flag.sh', '.bash_history', '.override'],
  },
  '/home/guest/.override': {
    type: 'file',
    content:
      '[CTOS SEC-CLEARANCE PROTOCOL]\n' +
      'Emergency Air-Gap Bypass Keyword: "white"\n' +
      'Enter keyword directly into terminal console to engage 3D physical network bypass.',
  },
  '/home/guest/.bash_history': {
    type: 'file',
    content:
      'nmap -sV 10.0.0.80\n' +
      'curl http://10.0.0.80/api/v1/accounts?username=alice\n' +
      'strings /challenges/pwn/vuln_server | grep -E "win|gets"\n' +
      'wireshark /challenges/forensics/capture_042.pcapng &\n' +
      'burp &\n' +
      'ghidra &\n' +
      'cat hints.txt',
  },
  '/home/guest/README.txt': {
    type: 'file',
    content:
      '=== MR. WHITE HAT // KALI CYBER OS BASH TERMINAL ===\n' +
      'Welcome to the CTF sandbox environment.\n' +
      'All challenges, binaries, network scripts, and forensic captures are in /challenges.\n' +
      'Type "hints" or "cat hints.txt" for step-by-step solving walkthroughs.\n' +
      'To submit a flag from the CLI, type: submit FLAG{your_flag_here}\n' +
      'Available tools: nmap, curl, strings, file, hexdump/xxd, base64, python3, gdb, ps, ping, netstat.\n' +
      'Type "help" for a full list of command line utilities.',
  },
  '/home/guest/notes.txt': {
    type: 'file',
    content:
      'OPERATIVE RECON FIELD LOG:\n' +
      '- Target Network: 10.0.0.80 on 10.0.0.0/24 subnet. Plaintext HTTP on port 80.\n' +
      '- Web Recon: Run "nmap -sV 10.0.0.80" or "curl http://10.0.0.80/api/v1/accounts?username=alice".\n' +
      '- IoT Firmware: Hardware test pads exposed on PCB silkscreen. Check serial TX/GND traces.\n' +
      '- Intercepted Telegram: Classical Caesar shift in /challenges/crypto/encrypted_telegram.txt.\n' +
      '- Sentinel Daemon: ELF binary at /challenges/reverse/sentinel_daemon contains ptrace check.\n' +
      '- Stack Server: Unbounded input buffer in /challenges/pwn/vuln_server. Buffer capacity 16B + 8B RBP.',
  },
  '/home/guest/hints.txt': {
    type: 'file',
    content:
      '=== CTF SOLVING WALKTHROUGH & INVESTIGATION REFERENCE ===\n' +
      '1. CRYPTO (Caesar): In CyberChef, add "Caesar Cipher". Peak letter H; English is E (distance = -3). Shift -3 deciphers the flag.\n' +
      '2. FORENSICS (Wireshark): Filter "http", open Packet #7 or #8, Follow TCP Stream to view token or decode base64 header.\n' +
      '3. WEB SQLi (Burp Suite): In Repeater or Intruder, query username with "\' OR 1=1--" to bypass query and extract root_sentinel clearance.\n' +
      '4. PWN STACK (Ghidra): Buffer 16B + 8B RBP = 24B padding. Target return address = 0x00401155 (win). Exploit in GDB.\n' +
      '5. REVERSING (Ghidra): Target jump at 0x004011ad terminates process. Patch opcode to "90 90" (NOP NOP) to reach flag vault.\n' +
      '6. HARDWARE (PulseView): Connect Probe CH0 to TP3 (UART_TX) and GND to TP4. Set Baud to 115200 and click Start Capture.\n' +
      '7. STEGO (Spectrogram): Set Carrier to 142.8 kHz and DSP filter to High-Pass (15 kHz) to reveal green watermark.\n' +
      'Submit flags with: submit FLAG{...}',
  },
  '/home/guest/submit_flag.sh': {
    type: 'file',
    content: '#!/bin/bash\n# Usage: submit FLAG{...}\necho "Use native \'submit <flag>\' command directly."',
  },
  '/challenges': {
    type: 'dir',
    files: ['web', 'crypto', 'pwn', 'forensics', 'reverse', 'hardware', 'stego'],
  },
  '/challenges/web': {
    type: 'dir',
    files: ['sqli_accounts.db', 'timing_auth.py', 'vuln_api.js'],
  },
  '/challenges/web/sqli_accounts.db': {
    type: 'file',
    content:
      'SQLite format 3\x00\n' +
      'CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, role TEXT, clearance TEXT);\n' +
      'INSERT INTO users VALUES (1, "alice", "Security Analyst", "L2_RESTRICTED");\n' +
      'INSERT INTO users VALUES (2, "bob", "DevOps Engineer", "L1_STANDARD");\n' +
      'INSERT INTO users VALUES (99, "root_sentinel", "SYSTEM_ADMINISTRATOR", "FLAG{sqli_union_select_waf_bypassed}");',
  },
  '/challenges/web/timing_auth.py': {
    type: 'file',
    content:
      '# Side-Channel Timing Oracle Probe Script\n' +
      'import requests, time\n' +
      'TARGET = "http://10.0.0.80/api/v1/auth/token_verify"\n' +
      '# Target flag has 41 characters. Each matching character adds ~15ms delay.\n' +
      '# Launch "burp" -> Timing Attack tab to run the automated timing chart!',
  },
  '/challenges/web/vuln_api.js': {
    type: 'file',
    content:
      '// Node.js Express Vulnerable Endpoint\n' +
      'app.get("/api/v1/accounts", (req, res) => {\n' +
      '  const query = `SELECT * FROM users WHERE username = \'${req.query.username}\'`;\n' +
      '  db.all(query, (err, rows) => res.json(rows));\n' +
      '});',
  },
  '/challenges/crypto': {
    type: 'dir',
    files: ['encrypted_telegram.txt', 'caesar_rot3.py'],
  },
  '/challenges/crypto/encrypted_telegram.txt': {
    type: 'file',
    content: 'IODJ{fdhvdu_vkliw_urw3_fohdudqfh}',
  },
  '/challenges/crypto/caesar_rot3.py': {
    type: 'file',
    content:
      '#!/usr/bin/env python3\n' +
      'ciphertext = "IODJ{fdhvdu_vkliw_urw3_fohdudqfh}"\n' +
      'plaintext = "".join(chr((ord(c) - 97 - 3) % 26 + 97) if c.islower() else c for c in ciphertext)\n' +
      'print(f"Decrypted: {plaintext}")',
  },
  '/challenges/pwn': {
    type: 'dir',
    files: ['vuln_server.c', 'vuln_server', 'exploit_template.py'],
  },
  '/challenges/pwn/vuln_server.c': {
    type: 'file',
    content:
      '#include <stdio.h>\n' +
      '#include <stdlib.h>\n' +
      '#include <string.h>\n\n' +
      'void win() {\n' +
      '    printf("[+] CONTROL FLOW HIJACKED TO win()!\\n");\n' +
      '    printf("[+] FLAG: FLAG{buffer_overflow_eip_overwritten_0x55}\\n");\n' +
      '    exit(0);\n' +
      '}\n\n' +
      'void vuln() {\n' +
      '    char buffer[16];\n' +
      '    printf("Enter payload string: ");\n' +
      '    gets(buffer); // VULNERABILITY: gets() performs no bound checks! (16B + 8B RBP = 24B to RIP)\n' +
      '}\n\n' +
      'int main(int argc, char **argv) {\n' +
      '    setvbuf(stdout, NULL, _IONBF, 0);\n' +
      '    vuln();\n' +
      '    return 0;\n' +
      '}',
  },
  '/challenges/pwn/vuln_server': {
    type: 'file',
    content:
      '\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00>\x00\x01\x00\x00\x00\x30\x11\x40\x00\x00\x00\x00\x00' +
      '\n[ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2]' +
      '\nSymbols: main=0x00401130, vuln=0x00401140, win=0x00401155\nFlag string: FLAG{buffer_overflow_eip_overwritten_0x55}',
  },
  '/challenges/pwn/exploit_template.py': {
    type: 'file',
    content:
      '#!/usr/bin/env python3\n' +
      'import struct\n' +
      'padding = b"A" * 24 # 16 bytes local buffer + 8 bytes saved RBP\n' +
      'target_win = struct.pack("<Q", 0x00401155) # win() function address\n' +
      'payload = padding + target_win\n' +
      'print(f"Payload generated ({len(payload)} bytes): {payload}")',
  },
  '/challenges/forensics': {
    type: 'dir',
    files: ['capture_042.pcapng'],
  },
  '/challenges/forensics/capture_042.pcapng': {
    type: 'file',
    content:
      '\nPCAP-NG Capture File Format v1.0\n' +
      'Section Header: Little-Endian, SnapLen: 65535\n' +
      'Interface 0: eth0 (10.0.0.0/24)\n' +
      'Total Captured Frames: 9 packets (ARP, DNS, TCP handshake, HTTP POST /api/v1/auth/login)\n' +
      'Exfiltrated Authorization: Basic YWRtaW46cGNhcF9kbnNfZXhmaWxfYmFzaWNfYXV0aF9uZXV0cmFsaXplZA==\n' +
      'Decoded Flag: FLAG{pcap_dns_exfil_basic_auth_neutralized}',
  },
  '/challenges/reverse': {
    type: 'dir',
    files: ['sentinel_daemon', 'anti_debug.c'],
  },
  '/challenges/reverse/sentinel_daemon': {
    type: 'file',
    content:
      '\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00>\x00\x01\x00\x00\x00\xa0\x11\x40\x00\x00\x00\x00\x00' +
      '\nDisassembly symbols:\n' +
      '0x004011a0: sub rsp, 0x28\n' +
      '0x004011a4: call ptrace@plt (PTRACE_TRACEME)\n' +
      '0x004011a9: cmp rax, -1\n' +
      '0x004011ad: je 0x004011c1 <tamper_kill>  <-- TARGET CONDITIONAL JUMP (74 12)\n' +
      '0x004011af: lea rdi, [str_clearance]\n' +
      '0x004011b6: call decrypt_vault_flag\n' +
      'Flag string: FLAG{binary_patch_nop_anti_debug_bypassed}',
  },
  '/challenges/reverse/anti_debug.c': {
    type: 'file',
    content:
      '#include <sys/ptrace.h>\n' +
      '#include <stdio.h>\n' +
      '#include <stdlib.h>\n\n' +
      'int check_debugger() {\n' +
      '    if (ptrace(PTRACE_TRACEME, 0, 1, 0) < 0) {\n' +
      '        printf("[-] TAMPER DETECTED! Terminating.\\n");\n' +
      '        exit(1);\n' +
      '    }\n' +
      '    return 0;\n' +
      '}',
  },
  '/challenges/hardware': {
    type: 'dir',
    files: ['uart_pinout.txt'],
  },
  '/challenges/hardware/uart_pinout.txt': {
    type: 'file',
    content:
      'SILKSCREEN PCB TEST PAD SCHEMATIC:\n' +
      'TP1: VCC (+3.3V DC)\n' +
      'TP2: SPI_MOSI\n' +
      'TP3: UART_TX  (Serial Baud: 115200 8-N-1)\n' +
      'TP4: CHASSIS_GND (0V Ground Reference)\n' +
      'Captured firmware flag: FLAG{hardware_uart_logic_baud_synced}',
  },
  '/challenges/stego': {
    type: 'dir',
    files: ['spectrogram_info.txt'],
  },
  '/challenges/stego/spectrogram_info.txt': {
    type: 'file',
    content:
      'RF ACOUSTIC STEGANOGRAPHY SPECIFICATION:\n' +
      'Carrier Frequency: 142.8 kHz\n' +
      'Modulation: Ultrasonic Frequency-Shift Keying\n' +
      'Demodulation Filter: 15 kHz High-Pass Butterworth DSP\n' +
      'Decoded Spectral Watermark: FLAG{ultrasonic_spectrogram_carrier_demodulated}',
  },
  '/etc': {
    type: 'dir',
    files: ['passwd', 'hosts', 'issue', 'os-release'],
  },
  '/etc/passwd': {
    type: 'file',
    content:
      'root:x:0:0:root:/root:/bin/bash\n' +
      'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n' +
      'guest:x:1000:1000:CTF Operative Guest,,,:/home/guest:/bin/bash\n' +
      'sentinel:x:1001:1001:Sentinel Daemon Service:/var/sentinel:/usr/sbin/nologin\n' +
      'mysql:x:107:113:MySQL Server,,,:/nonexistent:/bin/false\n' +
      'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
  },
  '/etc/hosts': {
    type: 'file',
    content:
      '127.0.0.1       localhost kali-box\n' +
      '::1             localhost ip6-localhost ip6-loopback\n' +
      '10.0.0.80       auth.corp.internal mainframe.internal\n' +
      '10.10.10.42     sentinel-gateway.corp',
  },
  '/etc/issue': {
    type: 'file',
    content: 'Kali GNU/Linux Rolling \\n \\l',
  },
  '/etc/os-release': {
    type: 'file',
    content:
      'PRETTY_NAME="Kali GNU/Linux Rolling"\n' +
      'NAME="Kali GNU/Linux"\n' +
      'VERSION_ID="2026.1"\n' +
      'ID=kali\n' +
      'ID_LIKE=debian\n' +
      'HOME_URL="https://www.kali.org/"',
  },
};

export default function CyberOSTerminal({ onOpenApp, onOpenStation, onLaunchEasterEgg }) {
  const [cwd, setCwd] = useState('/home/guest');
  const [history, setHistory] = useState([
    'Linux kali-box 6.6.9-amd64 #1 SMP PREEMPT Kali 6.6.9-1kali1 (2026-01-15) x86_64',
    ' ',
    '  ___ _   _ ___ _____ ___ ___  ___ ',
    ' | _ ) | | | _ \\ _ \\ _ \\ _ \\/ __|',
    ' | _ \\ |_| |   /  _/   /  _/\\__ \\',
    ' |___/\\___/|_|_\\_| |_|_\\_|  |___/',
    ' Kali Linux Cyber-OS CTF Terminal Workstation',
    ' Type "help" for utilities, "hints" for step-by-step CTF guide, or "submit <FLAG>"',
    ' Realistic tools installed: nmap, curl, strings, file, hexdump/xxd, base64, python3, gdb',
    ' ',
  ]);
  const [inputVal, setInputVal] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Tab completion helper
  const handleKeyDown = (e) => {
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = inputVal.trim();
      if (!current) return;

      const parts = current.split(' ');
      const knownCommands = [
        'help', 'hints', 'ls', 'cat', 'cd', 'pwd', 'clear', 'whoami', 'uname',
        'nmap', 'curl', 'strings', 'file', 'hexdump', 'xxd', 'base64', 'python3', 'python',
        'ps', 'top', 'ping', 'netstat', 'gdb', 'submit', 'open', 'wireshark', 'burp',
        'ghidra', 'cyberchef', 'logic', 'spectrogram', 'ctf'
      ];

      if (parts.length === 1) {
        const match = knownCommands.filter((c) => c.startsWith(parts[0].toLowerCase()));
        if (match.length === 1) {
          setInputVal(match[0] + ' ');
          playClickSound(1000);
        } else if (match.length > 1) {
          setHistory((prev) => [...prev, `guest@kali-box:${cwd}$ ${inputVal}`, match.join('   ')]);
          playClickSound(800);
        }
      } else {
        const lastArg = parts[parts.length - 1];
        const dirNode = VFS[cwd];
        const availableFiles = dirNode && dirNode.type === 'dir' ? dirNode.files : [];
        const matchFiles = availableFiles.filter((f) => f.startsWith(lastArg));

        if (matchFiles.length === 1) {
          parts[parts.length - 1] = matchFiles[0];
          setInputVal(parts.join(' '));
          playClickSound(1000);
        } else if (matchFiles.length > 1) {
          setHistory((prev) => [...prev, `guest@kali-box:${cwd}$ ${inputVal}`, matchFiles.join('   ')]);
          playClickSound(800);
        }
      }
    }
  };

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
    const argStr = args.join(' ');

    const newLines = [`guest@kali-box:${cwd}$ ${raw}`];

    switch (cmd) {
      case 'help':
        newLines.push(
          '=== AVAILABLE TERMINAL UTILITIES ===',
          '  help                 Display this command reference',
          '  hints                Display step-by-step CTF solving walkthroughs',
          '  ls [-la]             List directory contents with file metadata',
          '  cat <file>           Display content of target file',
          '  cd <dir>             Change working directory',
          '  pwd                  Print current working directory',
          '  clear                Clear terminal scrollback screen',
          '  whoami               Display current user identity & clearance level',
          '  uname -a             Display kernel architecture and OS release',
          '  nmap [-sV] <ip>      Network mapper & port/service scanner',
          '  curl [-I] <url>      Execute HTTP/REST requests against internal endpoints',
          '  strings <binary>     Extract printable ASCII/UTF-8 character sequences',
          '  file <target>        Determine file type, architecture, and encoding',
          '  hexdump / xxd <file> Display 16-byte canonical hex + ASCII dump',
          '  base64 [-d] <str>    Base64 encode or decode string input',
          '  python3 [-c <expr>]  Execute Python3 scripts or payload one-liners',
          '  ps / top             Report active system processes and daemons',
          '  ping <host>          Send ICMP ECHO_REQUEST packets to network host',
          '  netstat / ss         Print network connections, routing tables, listening sockets',
          '  gdb <binary>         GNU Debugger binary analyzer & disassembly probe',
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

      case 'white':
      case 'mrwhite':
      case 'mrwhitehat':
      case 'hack':
      case 'netrun':
      case 'easteregg':
      case 'easter':
      case 'bypass':
        newLines.push(
          '[*] [!] SYSTEM OVERRIDE SEQUENCE DETECTED...',
          '[*] AUTHENTICATING OPERATIVE KEY: "WHITE"...',
          '[*] CLEARANCE GRANTED // BREACHING CTOS 3D AIR-GAP MESH...',
          '[*] INITIATING 3D CIRCUIT NETWORK BYPASS...'
        );
        setTimeout(() => {
          onLaunchEasterEgg?.();
        }, 500);
        break;

      case 'hints':
      case 'hint':
        newLines.push(
          '====================================================================',
          '  💡 HOW TO SOLVE CTF CHALLENGES // STEP-BY-STEP OPERATIVE GUIDE',
          '====================================================================',
          '1. [CRYPTOGRAPHY] Operation Caesar:',
          '   - Tool: Launch "cyberchef" or run "cat /challenges/crypto/encrypted_telegram.txt".',
          '   - Action: Add "Caesar Cipher". Set Shift Key to -3 (letter H shifted back to E).',
          '   - Result: Plaintext flag recovered: FLAG{caesar_shift_rot3_clearance}',
          ' ',
          '2. [DIGITAL FORENSICS] PCAP Data Exfiltration:',
          '   - Tool: Launch "wireshark" or inspect with "strings /challenges/forensics/capture_042.pcapng".',
          '   - Action: Filter "http". Select Packet #7/#8 and Follow TCP Stream, or run "base64 -d YWRtaW46cGNhcF9kbnNfZXhmaWxfYmFzaWNfYXV0aF9uZXV0cmFsaXplZA==".',
          '   - Result: Flag: FLAG{pcap_dns_exfil_basic_auth_neutralized}',
          ' ',
          '3. [WEB EXPLOITATION] SQL Injection WAF Bypass:',
          '   - Tool: Launch "burp" -> HTTP Repeater or run:',
          '     curl "http://10.0.0.80/api/v1/accounts?username=\' OR 1=1--"',
          '   - Result: Admin record returned with: FLAG{sqli_union_select_waf_bypassed}',
          ' ',
          '4. [BINARY EXPLOITATION] Stack Buffer Overflow:',
          '   - Tool: Launch "ghidra" -> GDB Stack Buffer Overflow tab.',
          '   - Action: Buffer is 16 bytes + 8 bytes RBP = 24 bytes padding. Target = 0x00401155 (win). Click Run.',
          '   - Result: Hijacks execution to win(): FLAG{buffer_overflow_eip_overwritten_0x55}',
          ' ',
          '5. [REVERSE ENGINEERING] Anti-Debug Opcode Patching:',
          '   - Tool: Launch "ghidra" -> Ghidra Opcode Patcher tab.',
          '   - Action: In Patch Opcode, enter "90 90" (NOP NOP) to eliminate the conditional jump. Click Run.',
          '   - Result: Flag: FLAG{binary_patch_nop_anti_debug_bypassed}',
          ' ',
          '6. [HARDWARE FORENSICS] UART Silkscreen Reverse Engineering:',
          '   - Tool: Launch "logic" (PulseView).',
          '   - Action: Connect Probe CH0 to TP3 (UART_TX), Probe GND to TP4. Baud = 115200. Click Start Capture.',
          '   - Result: Serial log dumps: FLAG{hardware_uart_logic_baud_synced}',
          ' ',
          '7. [STEGANOGRAPHY] Ultrasonic Audio Demodulation:',
          '   - Tool: Launch "spectrogram" (SonicVisualizer).',
          '   - Action: Set Carrier to 142.8 kHz and select High-Pass (15 kHz) DSP filter.',
          '   - Result: Watermark revealed: FLAG{ultrasonic_spectrogram_carrier_demodulated}',
          ' ',
          'Submit from terminal: submit FLAG{...}',
          '===================================================================='
        );
        break;

      case 'whoami':
        newLines.push('guest (uid=1000 gid=1000 groups=1000(guest),27(sudo),44(video) Clearance: L2_OPERATIVE)');
        break;

      case 'uname':
        newLines.push(
          args.includes('-a')
            ? 'Linux kali-box 6.6.9-amd64 #1 SMP PREEMPT Kali 6.6.9-1kali1 (2026-01-15) x86_64 GNU/Linux'
            : 'Linux'
        );
        break;

      case 'pwd':
        newLines.push(cwd);
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'ls': {
        const isLa = args.includes('-la') || args.includes('-al') || args.includes('-l') || args.includes('-a');
        const targetPath = args.find((a) => !a.startsWith('-')) || cwd;
        const resolvedPath = targetPath.startsWith('/')
          ? targetPath
          : cwd === '/'
          ? `/${targetPath}`
          : `${cwd}/${targetPath}`;

        const targetDir = VFS[resolvedPath] || VFS[targetPath];
        if (targetDir && targetDir.type === 'dir') {
          if (isLa) {
            newLines.push('total ' + (targetDir.files.length * 4 + 8));
            newLines.push('drwxr-xr-x 4 guest guest 4096 Nov 02 20:50 .');
            newLines.push('drwxr-xr-x 8 root  root  4096 Nov 02 18:22 ..');
            targetDir.files.forEach((f) => {
              const fullF = resolvedPath === '/' ? `/${f}` : `${resolvedPath}/${f}`;
              const isSubDir = VFS[fullF]?.type === 'dir';
              const perms = isSubDir ? 'drwxr-xr-x' : f.endsWith('.sh') || f === 'vuln_server' || f === 'sentinel_daemon' ? '-rwxr-xr-x' : '-rw-r--r--';
              const size = isSubDir ? 4096 : (VFS[fullF]?.content?.length || 1024);
              newLines.push(`${perms} 1 guest guest ${size.toString().padStart(6, ' ')} Nov 02 20:50 ${f}`);
            });
          } else {
            newLines.push(targetDir.files.join('    '));
          }
        } else {
          newLines.push(`ls: cannot access '${targetPath}': No such file or directory`);
        }
        break;
      }

      case 'cd': {
        const dest = args[0] || '/home/guest';
        if (dest === '..' || dest === '../') {
          const parts = cwd.split('/').filter(Boolean);
          parts.pop();
          const newPath = '/' + parts.join('/');
          setCwd(VFS[newPath] ? newPath : '/home/guest');
        } else if (dest === '/' || VFS[dest]?.type === 'dir') {
          setCwd(dest);
        } else if (dest === '~' || dest === '/home/guest') {
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
        const fullPath = fileName.startsWith('/') ? fileName : cwd === '/' ? `/${fileName}` : `${cwd}/${fileName}`;
        const fileObj = VFS[fullPath];
        if (fileObj && fileObj.type === 'file') {
          newLines.push(fileObj.content);
        } else if (fileObj && fileObj.type === 'dir') {
          newLines.push(`cat: ${fileName}: Is a directory`);
        } else {
          newLines.push(`cat: ${fileName}: No such file or directory`);
        }
        break;
      }

      // Realistic Nmap Port Scanner
      case 'nmap':
      case 'scan': {
        const target = args.find((a) => !a.startsWith('-')) || '10.0.0.80';
        newLines.push(
          `Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-02 20:52 UTC`,
          `Nmap scan report for ${target.includes('10.0.0') ? 'mainframe.internal (10.0.0.80)' : target}`,
          `Host is up (0.00048s latency).`,
          `Not shown: 994 closed tcp ports (reset)`,
          `PORT     STATE SERVICE       VERSION`,
          `21/tcp   open  ftp           vsftpd 3.0.3 (Anonymous login disabled)`,
          `22/tcp   open  ssh           OpenSSH 9.2p1 Debian 2+deb12u2 (protocol 2.0)`,
          `80/tcp   open  http          nginx/1.24.0 (Express/SQLite3 backend: /api/v1/accounts)`,
          `443/tcp  open  ssl/https     nginx/1.24.0 (Self-signed wildcard cert)`,
          `3306/tcp open  mysql         MariaDB 10.11.3 (SQLite shadow: sqli_accounts.db)`,
          `8080/tcp open  http-proxy    CTOS Sentinel Daemon Gateway v2.4 (vuln_server: gets() stack buffer)`,
          ` `,
          `Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds`
        );
        break;
      }

      // Realistic cURL Utility
      case 'curl': {
        if (!args[0]) {
          newLines.push('curl: try \'curl --help\' for more information');
          break;
        }
        const isHeaderOnly = args.includes('-I') || args.includes('--head');
        const urlRaw = args.find((a) => !a.startsWith('-')) || args[0];
        const lowerUrl = urlRaw.toLowerCase();

        if (isHeaderOnly) {
          newLines.push(
            'HTTP/1.1 200 OK',
            'Server: nginx/1.24.0',
            'Date: Mon, 02 Nov 2026 20:52:14 GMT',
            'Content-Type: application/json; charset=utf-8',
            'Connection: keep-alive',
            'X-Powered-By: Express/SQLite3',
            'Access-Control-Allow-Origin: *'
          );
        } else if (lowerUrl.includes('or 1=1') || lowerUrl.includes('union') || lowerUrl.includes("admin'--")) {
          newLines.push(
            'HTTP/1.1 200 OK',
            'Content-Type: application/json',
            '[',
            '  {"id": 1, "username": "alice", "role": "Security Analyst", "clearance": "L2_RESTRICTED"},',
            '  {"id": 2, "username": "bob", "role": "DevOps Engineer", "clearance": "L1_STANDARD"},',
            '  {"id": 99, "username": "root_sentinel", "role": "SYSTEM_ADMINISTRATOR", "clearance": "FLAG{sqli_union_select_waf_bypassed}"}',
            ']'
          );
          playBreachFanfare();
        } else if (lowerUrl.includes('auth/login')) {
          newLines.push(
            '{"status": "authenticated", "role": "root", "token": "FLAG{pcap_dns_exfil_basic_auth_neutralized}"}'
          );
        } else if (lowerUrl.includes('accounts')) {
          newLines.push(
            '[',
            '  {"id": 1, "username": "alice", "role": "Security Analyst", "clearance": "L2_RESTRICTED"}',
            ']'
          );
        } else {
          newLines.push(
            '<!DOCTYPE html>',
            '<html><head><title>CTOS Mainframe Gateway</title></head>',
            '<body><h1>CTOS Security Gateway Node</h1><p>API endpoints available at /api/v1/accounts</p></body></html>'
          );
        }
        break;
      }

      // Strings extraction
      case 'strings': {
        if (!args[0]) {
          newLines.push('Usage: strings <filename>');
          break;
        }
        const fileName = args[0];
        const fullPath = fileName.startsWith('/') ? fileName : `${cwd}/${fileName}`;
        const targetObj = VFS[fullPath];
        if (targetObj) {
          if (fullPath.includes('vuln_server')) {
            newLines.push(
              '/lib64/ld-linux-x86-64.so.2',
              'libc.so.6',
              'gets',
              'puts',
              'printf',
              'exit',
              'win',
              'vuln',
              'main',
              'Enter payload string: ',
              '[+] CONTROL FLOW HIJACKED TO win()!',
              'FLAG{buffer_overflow_eip_overwritten_0x55}',
              'GCC: (Debian 12.2.0-14) 12.2.0'
            );
          } else if (fullPath.includes('sentinel_daemon')) {
            newLines.push(
              '/lib64/ld-linux-x86-64.so.2',
              'ptrace',
              'PTRACE_TRACEME',
              'cmp rax, -1',
              'tamper_kill',
              'decrypt_vault_flag',
              'FLAG{binary_patch_nop_anti_debug_bypassed}'
            );
          } else {
            const matches = targetObj.content.match(/[A-Za-z0-9_{}():.=\-\s]{4,}/g) || [];
            newLines.push(...matches.slice(0, 15));
          }
        } else {
          newLines.push(`strings: '${fileName}': No such file`);
        }
        break;
      }

      // File utility
      case 'file': {
        if (!args[0]) {
          newLines.push('Usage: file <path>');
          break;
        }
        const fileName = args[0];
        const fullPath = fileName.startsWith('/') ? fileName : `${cwd}/${fileName}`;
        const target = VFS[fullPath];
        if (!target) {
          newLines.push(`${fileName}: cannot open \`${fileName}\' (No such file or directory)`);
        } else if (target.type === 'dir') {
          newLines.push(`${fileName}: directory`);
        } else if (fileName.endsWith('.pcapng') || fileName.includes('capture')) {
          newLines.push(`${fileName}: pcapng capture file - version 1.0 (little-endian), snaplen 65535, 9 packets`);
        } else if (fileName.endsWith('.c') || fileName.endsWith('.py') || fileName.endsWith('.js') || fileName.endsWith('.sh')) {
          newLines.push(`${fileName}: ASCII text, with CRLF, LF line terminators`);
        } else if (fileName === 'vuln_server' || fileName === 'sentinel_daemon') {
          newLines.push(`${fileName}: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, not stripped`);
        } else {
          newLines.push(`${fileName}: ASCII text`);
        }
        break;
      }

      // Hexdump / XXD utility
      case 'hexdump':
      case 'xxd': {
        if (!args[0] && !args[1]) {
          newLines.push('Usage: hexdump -C <file>  OR  xxd <file>');
          break;
        }
        const targetFile = args.find((a) => !a.startsWith('-')) || args[0];
        const fullPath = targetFile.startsWith('/') ? targetFile : `${cwd}/${targetFile}`;
        const target = VFS[fullPath];
        if (!target || target.type !== 'file') {
          newLines.push(`hexdump: ${targetFile}: No such file or directory`);
        } else {
          const content = target.content.slice(0, 96);
          const lines = [];
          for (let i = 0; i < content.length; i += 16) {
            const chunk = content.slice(i, i + 16);
            let hex = '';
            let ascii = '';
            for (let j = 0; j < 16; j++) {
              if (j < chunk.length) {
                const code = chunk.charCodeAt(j);
                hex += code.toString(16).padStart(2, '0') + ' ';
                ascii += code >= 32 && code <= 126 ? chunk[j] : '.';
              } else {
                hex += '   ';
              }
              if (j === 7) hex += ' ';
            }
            const offset = i.toString(16).padStart(8, '0');
            lines.push(`${offset}  ${hex} |${ascii}|`);
          }
          newLines.push(...lines);
        }
        break;
      }

      // Base64 encoding / decoding
      case 'base64': {
        const isDecode = args.includes('-d') || args.includes('--decode');
        const payload = args.filter((a) => !a.startsWith('-')).join(' ');
        if (!payload) {
          newLines.push('Usage: base64 [-d] <string>');
          break;
        }
        try {
          if (isDecode) {
            const clean = payload.trim();
            const decoded = atob(clean);
            newLines.push(decoded);
            if (decoded.includes('FLAG{')) {
              playBreachFanfare();
            }
          } else {
            const encoded = btoa(payload);
            newLines.push(encoded);
          }
        } catch {
          newLines.push('base64: invalid input string');
        }
        break;
      }

      // Python3 script execution & one-liners
      case 'python':
      case 'python3': {
        if (args[0] === '-c') {
          const expr = args.slice(1).join(' ').replace(/['"]/g, '');
          if (expr.includes('A') && expr.includes('24')) {
            newLines.push('AAAAAAAAAAAAAAAAAAAAAAAA\\x55\\x11\\x40\\x00\\x00\\x00\\x00\\x00');
          } else if (expr.includes('print')) {
            const printed = expr.replace(/^print\(/, '').replace(/\)$/, '');
            newLines.push(printed);
          } else {
            newLines.push('[*] Python3 execution completed successfully (exit code: 0).');
          }
        } else if (args[0]) {
          const fileName = args[0];
          const fullPath = fileName.startsWith('/') ? fileName : `${cwd}/${fileName}`;
          if (fullPath.includes('caesar')) {
            newLines.push('Decrypted: FLAG{caesar_shift_rot3_clearance}');
          } else if (fullPath.includes('exploit')) {
            newLines.push(
              'Payload generated (32 bytes): b\'AAAAAAAAAAAAAAAAAAAAAAAA\\x55\\x11@\\x00\\x00\\x00\\x00\\x00\'',
              '[+] Exploit ready for injection into ./vuln_server'
            );
          } else {
            newLines.push(`[*] Executing script ${fileName} in virtualenv... done.`);
          }
        } else {
          newLines.push(
            'Python 3.11.8 (main, Feb 12 2026, 14:02:18) [GCC 12.2.0] on linux',
            'Type "help", "copyright", "credits" or "license" for more information.',
            'Use python3 -c "<expression>" or run scripts directly.'
          );
        }
        break;
      }

      // Process listing
      case 'ps':
      case 'top': {
        newLines.push(
          '  PID TTY          TIME CMD',
          '    1 ?        00:00:02 systemd',
          '   42 ?        00:00:00 sshd',
          '   80 ?        00:00:01 nginx',
          '  137 ?        00:00:00 sentinel_daemon',
          ' 1337 pts/0    00:00:00 bash',
          ' 3306 ?        00:00:03 mysqld',
          ' 8080 ?        00:00:00 vuln_server',
          ' 8842 pts/0    00:00:00 ps'
        );
        break;
      }

      // Ping
      case 'ping': {
        const host = args[0] || '10.0.0.80';
        newLines.push(
          `PING ${host} (${host}) 56(84) bytes of data.`,
          `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.342 ms`,
          `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.298 ms`,
          `64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.315 ms`,
          `64 bytes from ${host}: icmp_seq=4 ttl=64 time=0.320 ms`,
          `--- ${host} ping statistics ---`,
          `4 packets transmitted, 4 received, 0% packet loss, time 3004ms`,
          `rtt min/avg/max/mdev = 0.298/0.318/0.342/0.016 ms`
        );
        break;
      }

      // Netstat / Sockets
      case 'netstat':
      case 'ss': {
        newLines.push(
          'Active Internet connections (only servers)',
          'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name',
          'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      42/sshd',
          'tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      80/nginx',
          'tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      80/nginx',
          'tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN      3306/mysqld',
          'tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      8080/vuln_server'
        );
        break;
      }

      // GDB
      case 'gdb': {
        const bin = args[0] || './vuln_server';
        newLines.push(
          `GNU gdb (Debian 13.1-3) 13.1`,
          `Copyright (C) 2023 Free Software Foundation, Inc.`,
          `Reading symbols from ${bin}... done.`,
          `gdb-peda$ checksec`,
          `CANARY    : disabled`,
          `FORTIFY   : disabled`,
          `NX        : ENABLED`,
          `PIE       : disabled`,
          `RELRO     : Partial`,
          `[*] Tip: Launch "ghidra" to inspect the visual disassembly & interactive stack frame!`
        );
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
            { label: 'nmap 10.0.0.80', cmd: 'nmap 10.0.0.80' },
            { label: 'ls -la', cmd: 'ls -la' },
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
      <div className="cos-app-body" style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', lineHeight: '1.6', fontSize: '11.5px' }}>
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
            flexShrink: 0,
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
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type command ... e.g. hints, nmap, curl, ls, submit FLAG{...} (Tab to complete)"
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
