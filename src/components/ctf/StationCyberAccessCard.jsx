import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Terminal,
  Activity,
  Globe,
  Binary,
  KeyRound,
  Cpu,
  Radio,
  ExternalLink,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { playClickSound, playZapSound, playBreachFanfare } from '../../utils/audio.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import './os/cyberOS.css';

const STATION_CHALLENGES = {
  projects: {
    id: 'net-lateral-pivot-ad',
    title: 'LATERAL PIVOTING & ACTIVE DIRECTORY RECON',
    category: 'NETWORK SECURITY',
    points: 350,
    tool: 'terminal',
    toolName: 'Kali Linux Terminal (Chisel & Proxychains)',
    icon: Terminal,
    desc: 'Target Domain Controller (10.10.10.5) is isolated in an internal subnet. Establish a SOCKS5 reverse proxy through DMZ Bastion and dump Active Directory NTDS.dit hashes.',
  },
  skills: {
    id: 'pwn-stack-matrix-buffer',
    title: 'STACK BUFFER OVERFLOW & RIP HIJACK',
    category: 'BINARY EXPLOITATION',
    points: 200,
    tool: 'ghidra',
    toolName: 'Ghidra & GDB Decompiler',
    icon: Binary,
    desc: 'Binary vuln_server reads input into a 16-byte stack buffer without bounds checking. Calculate the 24-byte padding offset to hijack Saved RIP to win() at 0x00401155.',
  },
  achievements: {
    id: 'web-sidechannel-timing',
    title: 'SIDE-CHANNEL TIMING ATTACK ORACLE',
    category: 'WEB EXPLOITATION',
    points: 350,
    tool: 'burp',
    toolName: 'Burp Suite HTTP Repeater',
    icon: Globe,
    desc: 'Vault token endpoint compares credentials with strcmp() inducing ~15ms delay per matching char. Probe candidate prefixes and plot latency spikes to recover the secret token.',
  },
  about: {
    id: 'crypto-caesar-tumbler',
    title: 'CIPHER DECRYPTION & FREQUENCY ANALYSIS',
    category: 'CRYPTOGRAPHY',
    points: 100,
    tool: 'cyberchef',
    toolName: 'CyberChef Cryptanalysis Suite',
    icon: KeyRound,
    desc: 'Intercepted telegram encoded with a monoalphabetic Caesar substitution cipher. Use letter frequency analysis to deduce the ROT-3 shift key and decrypt the message.',
  },
  resume: {
    id: 'forensics-hardware-uart',
    title: 'PCB TEST-PAD REVERSE ENGINEERING & UART LOGIC',
    category: 'HARDWARE FORENSICS',
    points: 150,
    tool: 'logic',
    toolName: 'PulseView Logic Analyzer',
    icon: Cpu,
    desc: 'Identify UART serial test points on the IoT PCB silkscreen (TP3 TX & TP4 GND), attach logic analyzer probes, synchronize baud rate to 115200 8-N-1, and dump bootloader firmware.',
  },
  contact: {
    id: 'stego-spectrogram-carrier',
    title: 'AUDIO SPECTROGRAM & CARRIER WATERMARK',
    category: 'STEGANOGRAPHY',
    points: 200,
    tool: 'spectrogram',
    toolName: 'SonicVisualizer Spectrogram Demodulator',
    icon: Radio,
    desc: 'Covert ultrasonic carrier detected on radio communications. Tune receiver to ~142.8 kHz and engage 15 kHz high-pass DSP filter to reconstruct the visual spectral watermark.',
  },
  operator: {
    id: 'rev-anti-debug-patch',
    title: 'BINARY PATCHING & ANTI-DEBUG BYPASS',
    category: 'REVERSE ENGINEERING',
    points: 400,
    tool: 'ghidra',
    toolName: 'Ghidra Hex Patcher',
    icon: Binary,
    desc: 'sentinel_daemon calls ptrace(PTRACE_TRACEME) and kills process if a debugger is detected. Patch conditional jump at 0x004011ad with NOP instructions (90 90) to bypass detection.',
  },
  server_rack: {
    id: 'web-sqli-waf-bypass',
    title: 'SQL INJECTION & WAF EVASION SANDBOX',
    category: 'WEB EXPLOITATION',
    points: 250,
    tool: 'burp',
    toolName: 'Burp Suite HTTP Repeater',
    icon: Globe,
    desc: 'Mainframe API authenticates operators via a dynamic SQL query. Enumerate column structure with ORDER BY, craft a 4-column UNION SELECT payload, and dump administrator credentials.',
  },
  hardware_arsenal: {
    id: 'rev-duckyscript-badusb',
    title: 'BADUSB DUCKYPAYLOAD DEOBFUSCATION',
    category: 'REVERSE ENGINEERING',
    points: 150,
    tool: 'terminal',
    toolName: 'Kali Linux Terminal (Ducky Disassembler)',
    icon: Terminal,
    desc: 'USB Rubber Ducky seized from reception desk. Disassemble DuckyScript bytecode, isolate PowerShell stager, and decode embedded Base64 payload to uncover operator clearance flag.',
  },
  wireshark_monitor: {
    id: 'forensics-pcap-exfiltration',
    title: 'PCAP PACKET ANALYZER & HTTP STREAM RECON',
    category: 'DIGITAL FORENSICS',
    points: 250,
    tool: 'wireshark',
    toolName: 'Wireshark Packet Analyzer',
    icon: Activity,
    desc: 'Network traffic captured during an insider exfiltration event. Filter HTTP/DNS traffic, reconstruct TCP conversation, decode Basic authentication header, and recover credentials.',
  },
  secret_vault: {
    id: 'pwn-heap-race-condition',
    title: 'GLIBC TCACHE POISONING & UAF WORKBENCH',
    category: 'BINARY EXPLOITATION',
    points: 500,
    tool: 'ghidra',
    toolName: 'Ghidra & GDB Heap Workbench',
    icon: Binary,
    desc: 'Vault daemon allocates 0x40-byte chunks via Glibc malloc(). Execute a Use-After-Free Tcache Poisoning attack by overwriting fd with 0x004040a0 to claim the root flag vault.',
  },
};

export default function StationCyberAccessCard({ sectionKey, onLaunchOS, onBypass, onSolved }) {
  const challenge = STATION_CHALLENGES[sectionKey] || STATION_CHALLENGES.projects;
  const ToolIcon = challenge.icon;
  const [flagInput, setFlagInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const isAlreadySolved = ctfEngine.isChallengeSolved(challenge.id);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!flagInput.trim()) return;
    const res = ctfEngine.submitFlag(challenge.id, flagInput.trim());

    if (res.success) {
      setFeedback({ success: true, text: res.message });
      playBreachFanfare();
      setTimeout(() => {
        onSolved?.();
      }, 450);
    } else {
      setFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="station-cyber-access-card">
      {/* Header Strip */}
      <div className="scac-header-strip">
        <span className="scac-category-tag">{challenge.category}</span>
        {isAlreadySolved ? (
          <span
            className="scac-points-tag"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              borderColor: 'rgba(74, 222, 128, 0.4)',
            }}
          >
            ✓ SOLVED (REPLAY ACTIVE)
          </span>
        ) : (
          <span className="scac-points-tag">+{challenge.points} CTF PTS</span>
        )}
      </div>

      {/* Challenge Title & Objective */}
      <div className="scac-title">{challenge.title}</div>
      <p className="scac-desc">{challenge.desc}</p>

      {/* Required Cyber OS Tool Pill */}
      <div className="scac-tool-box">
        <div className="scac-tool-icon">
          <ToolIcon size={18} />
        </div>
        <div className="scac-tool-info">
          <span className="scac-tool-label">Required Cyber OS Tool:</span>
          <span className="scac-tool-name">{challenge.toolName}</span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="scac-actions-row">
        <button
          type="button"
          className="scac-launch-os-btn"
          onClick={() => {
            playClickSound(1100);
            onLaunchOS?.(challenge.tool);
          }}
          title="Open complete Kali Cyber OS Desktop with required tool"
        >
          <ExternalLink size={14} />
          <span>LAUNCH IN KALI CYBER OS</span>
        </button>

        <button
          type="button"
          className="scac-bypass-btn"
          onClick={() => {
            playClickSound(900);
            onBypass?.();
          }}
          title="Recruiter Fast View: Instant Portfolio Dossier & Resume"
        >
          <Zap size={13} />
          <span>RECRUITER BYPASS</span>
        </button>
      </div>

      {/* Quick In-Place Flag Submitter */}
      <div className="scac-quick-submit">
        <span className="scac-qs-label">Already solved this challenge? Submit flag:</span>
        <form onSubmit={handleQuickSubmit} className="scac-qs-form">
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            placeholder="FLAG{...}"
            className="scac-qs-input font-mono"
          />
          <button type="submit" className="scac-qs-btn font-mono">
            SUBMIT
          </button>
        </form>

        {feedback && (
          <div className={`scac-feedback font-mono ${feedback.success ? 'is-success' : 'is-error'}`}>
            {feedback.text}
          </div>
        )}

        {isAlreadySolved && (
          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              className="scac-launch-os-btn"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                borderColor: '#34d399',
                color: '#ffffff',
                fontWeight: 700,
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
              onClick={() => onSolved?.()}
            >
              <CheckCircle2 size={16} />
              <span>ACCESS GRANTED // VIEW STATION INFORMATION</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
