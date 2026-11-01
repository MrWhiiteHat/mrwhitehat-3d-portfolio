import React, { useState } from 'react';
import { Terminal, CheckCircle2, Play, Zap, Network, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'net-lateral-pivot-ad';
const REVEALED_FLAG = 'FLAG{lateral_movement_chisel_pivot_established}';

export default function NetworkPivotChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [cmdInput, setCmdInput] = useState('');
  const [isTunnelUp, setIsTunnelUp] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([
    'Kali Linux 2026.2 (x86_64) - Network Penetration Suite',
    'Local IP: 192.168.1.5/24 | Gateway: 192.168.1.1',
    'Type "help" for available pivot & enumeration tools.',
  ]);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleExecuteCommand = (commandToRun) => {
    const raw = (commandToRun || cmdInput).trim();
    if (!raw) return;
    setCmdInput('');
    playClickSound(950);

    const cmd = raw.toLowerCase();
    const newLines = [`kali@recon-box:~$ ${raw}`];

    if (cmd === 'help' || cmd === '?') {
      newLines.push(
        'Available Pivot & Discovery Commands:',
        '  ping <ip>                Test ICMP reachability to target host',
        '  nmap <ip>                Scan TCP ports on target host',
        '  chisel client <args>     Establish SOCKS5 reverse proxy tunnel to DMZ',
        '  proxychains nmap <args>  Scan internal network through SOCKS5 tunnel',
        '  proxychains secretsdump  Extract Active Directory NTDS.dit credentials',
        '  clear                    Clear terminal screen'
      );
    } else if (cmd === 'clear') {
      setTerminalHistory([]);
      return;
    } else if (cmd.startsWith('ping 10.10.10.5') || cmd.startsWith('ping 10.10.10')) {
      newLines.push(
        'PING 10.10.10.5 (10.10.10.5) 56(84) bytes of data.',
        'From 192.168.1.1 icmp_seq=1 Destination Host Unreachable',
        'From 192.168.1.1 icmp_seq=2 Destination Host Unreachable',
        '--- 10.10.10.5 ping statistics ---',
        '2 packets transmitted, 0 received, 100% packet loss (Subnet 10.10.10.0/24 isolated behind DMZ).'
      );
    } else if (cmd.includes('nmap') && cmd.includes('172.16.50.2') && !cmd.includes('proxychains')) {
      newLines.push(
        'Starting Nmap 7.94 ( https://nmap.org )',
        'Nmap scan report for dmz-bastion.corp.lan (172.16.50.2)',
        'Host is up (0.00042s latency).',
        'PORT     STATE SERVICE VERSION',
        '22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu',
        '80/tcp   open  http    nginx 1.24.0',
        '8000/tcp open  http    Chisel SOCKS5 Tunnel Listener (v1.9.1)',
        'Nmap done: 1 IP address (1 host up) scanned in 0.28 seconds.'
      );
    } else if (cmd.includes('chisel client') && cmd.includes('8000')) {
      setIsTunnelUp(true);
      newLines.push(
        '2026/10/31 23:59:10 client: Connecting to ws://172.16.50.2:8000',
        '2026/10/31 23:59:11 client: Fingerprint 8a:42:19:bc:de:71:00',
        '2026/10/31 23:59:11 client: Connected (Latency 0.3ms)',
        '[+] SOCKS5 reverse proxy established: 127.0.0.1:1080 <-> DMZ Bastion (172.16.50.2)',
        '[+] Internal route to 10.10.10.0/24 now accessible via "proxychains".'
      );
      playHackingBeep(1200);
    } else if (cmd.includes('proxychains') && cmd.includes('nmap')) {
      if (!isTunnelUp) {
        newLines.push(
          '|S-chain|--<>-127.0.0.1:1080--<><>-10.10.10.5:445--<><>-FAILED (connection refused)',
          '[ERROR] Proxychains cannot connect to 127.0.0.1:1080. Start Chisel tunnel first!'
        );
        playZapSound();
      } else {
        newLines.push(
          '[ProxyChains-3.1] Dynamic chain  ...  127.0.0.1:1080  ...  10.10.10.5:445  ...  OK',
          'Nmap scan report for dc01.corp.lan (10.10.10.5)',
          'PORT    STATE SERVICE',
          '88/tcp  open  kerberos-sec',
          '389/tcp open  ldap',
          '445/tcp open  microsoft-ds (Active Directory Domain Controller)'
        );
        playClickSound(1000);
      }
    } else if (cmd.includes('secretsdump') || (cmd.includes('impacket') && cmd.includes('secretsdump'))) {
      if (!isTunnelUp) {
        newLines.push(
          '[ERROR] No route to host 10.10.10.5. Establish Chisel SOCKS proxy and use "proxychains secretsdump.py"!'
        );
        playZapSound();
      } else {
        newLines.push(
          '[*] [ProxyChains] Pivoting through SOCKS5 proxy 127.0.0.1:1080 -> 10.10.10.5:445',
          '[*] Dumping Active Directory Domain Controller NTDS.dit password hashes...',
          '[*] Domain: CORP.LAN (Forest: corp.lan)',
          '----------------------------------------------------------------------',
          'Administrator:500:aad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::',
          'Guest:501:aad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::',
          'krbtgt:502:aad3b435b51404ee:b8f9e1029c4d8e7a6b5c4d3e2f1a0b9c:::',
          `ROOT_CLEARANCE_FLAG: ${REVEALED_FLAG}`,
          '----------------------------------------------------------------------',
          '[*] Successfully extracted 4 hashes. Active Directory compromised!'
        );
        playClickSound(1200);
      }
    } else {
      newLines.push(
        `bash: ${raw.split(' ')[0]}: command not found. Type "help" for valid commands.`
      );
      playZapSound();
    }

    setTerminalHistory((prev) => [...prev, ...newLines]);
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
    <div className="hack-puzzle-container net-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Network size={15} className="text-cyan-400 hack-icon-pulse" />
          <span>NETWORK SECURITY // LATERAL PIVOTING & ACTIVE DIRECTORY RECON</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 350} PTS`}
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
          The Domain Controller (<code>10.10.10.5</code>) is isolated in an internal subnet inaccessible directly from your Kali attack host (<code>192.168.1.5</code>). Establish a SOCKS5 reverse proxy through the dual-homed DMZ Bastion (<code>172.16.50.2:8000</code>), pivot your tools with Proxychains, and dump the Active Directory NTDS.dit hashes.
        </p>
      </div>

      {/* Network Topology Visualizer */}
      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded mt-2 font-mono text-[11px]">
        <span className="text-[10px] text-slate-400 uppercase block mb-1">SUBNET TOPOLOGY:</span>
        <div className="flex flex-wrap items-center justify-between gap-1 text-center">
          <div className="p-2 bg-black border border-slate-700 rounded flex-1 min-w-[120px]">
            <strong className="text-rose-400 block text-xs">Attacker (Kali)</strong>
            <span className="text-[10px] text-slate-400">192.168.1.5</span>
          </div>
          <span className="text-slate-500 font-bold">➔</span>
          <div className={`p-2 border rounded flex-1 min-w-[140px] ${isTunnelUp ? 'bg-emerald-950/40 border-emerald-500' : 'bg-black border-slate-700'}`}>
            <strong className="text-amber-400 block text-xs">DMZ Bastion</strong>
            <span className="text-[10px] text-slate-400">172.16.50.2 :8000</span>
            <span className={`block text-[9px] mt-0.5 ${isTunnelUp ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {isTunnelUp ? '● SOCKS5 PROXY ACTIVE' : '○ Chisel Server Waiting'}
            </span>
          </div>
          <span className="text-slate-500 font-bold">➔</span>
          <div className="p-2 bg-black border border-slate-700 rounded flex-1 min-w-[130px]">
            <strong className="text-cyan-400 block text-xs">Target DC01</strong>
            <span className="text-[10px] text-slate-400">10.10.10.5 (SMB/Kerberos)</span>
          </div>
        </div>
      </div>

      {/* Network Architecture Summary */}
      <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-slate-400 bg-slate-950 p-2 border border-slate-800 rounded flex-wrap">
        <span className="text-cyan-400 font-bold">PIVOT PATH:</span>
        <span>Local (192.168.1.5) ➔ Bastion (172.16.50.2:8000 Chisel) ➔ DC01 (10.10.10.5:445 Active Directory)</span>
        <span className="text-slate-500 ml-auto">Type "help" in terminal for command syntax</span>
      </div>

      {/* Interactive Terminal Window */}
      <div className="mt-2 border border-slate-800 rounded bg-black font-mono text-xs overflow-hidden">
        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
          <span>KALI PIVOT CONSOLE // BASH SESSION</span>
          <span>SOCKS5: {isTunnelUp ? '127.0.0.1:1080 (ESTABLISHED)' : 'DISCONNECTED'}</span>
        </div>
        <div className="p-3 max-h-56 overflow-y-auto space-y-1 text-slate-300">
          {terminalHistory.map((line, idx) => (
            <div
              key={idx}
              className={`leading-relaxed whitespace-pre-wrap select-all ${
                line.includes('FLAG{')
                  ? 'text-emerald-300 font-bold'
                  : line.startsWith('kali@recon-box')
                  ? 'text-cyan-300'
                  : line.includes('ERROR') || line.includes('FAILED')
                  ? 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {line}
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteCommand();
          }}
          className="flex border-t border-slate-800 bg-slate-950 p-2 gap-2"
        >
          <span className="text-cyan-400 text-xs font-mono py-1">kali@recon-box:~$</span>
          <input
            type="text"
            value={cmdInput}
            onChange={(e) => setCmdInput(e.target.value)}
            placeholder="Type command (e.g. chisel client, proxychains secretsdump)..."
            className="flex-1 bg-transparent text-xs font-mono text-emerald-300 outline-none"
          />
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-3 py-1 rounded text-xs transition"
          >
            ENTER
          </button>
        </form>
      </div>

      {/* FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT LATERAL PIVOT FLAG:</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{...}"
            className="flex-1 bg-black/60 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-4 py-1.5 rounded text-xs transition font-mono"
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
            <span className="font-bold text-emerald-300">ACTIVE DIRECTORY COMPROMISED // PIVOT ROOT GRANTED</span>
            <span className="text-[10px] text-emerald-400/80">+350 CTF PTS Awarded · Chisel SOCKS5 Lateral Solved</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Connect Chisel SOCKS5 proxy to DMZ (8000), then dump NTDS hashes with Proxychains</span>
        </div>
      )}
    </div>
  );
}
