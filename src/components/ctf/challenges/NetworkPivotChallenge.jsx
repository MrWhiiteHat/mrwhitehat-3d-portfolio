import React, { useState } from 'react';
import { Terminal, CheckCircle2, Play, Zap, Network, ShieldCheck, ArrowRight } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'net-lateral-pivot-ad';
const REVEALED_FLAG = 'FLAG{lateral_movement_chisel_pivot_established}';

export default function NetworkPivotChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [pivotStep, setPivotStep] = useState(1);
  const [terminalLog, setTerminalLog] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleStep1 = () => {
    playHackingBeep(1100);
    setPivotStep(2);
    setTerminalLog(
      `$ chisel server --port 8000 --reverse &\n` +
      `$ chisel client 172.16.50.2:8000 R:1080:socks\n` +
      `[+] SOCKS5 reverse proxy tunnel established on 127.0.0.1:1080 -> DMZ Bastion (172.16.50.2).`
    );
  };

  const handleStep2 = () => {
    playHackingBeep(1300);
    setPivotStep(3);
    setTerminalLog((prev) =>
      prev + `\n\n$ proxychains nmap -sT -Pn -p 88,389,445 10.10.10.5\n` +
      `[+] Target: Domain Controller (10.10.10.5)\n` +
      `[+] Port 88/tcp  OPEN  kerberos-sec\n` +
      `[+] Port 389/tcp OPEN  ldap\n` +
      `[+] Port 445/tcp OPEN  microsoft-ds`
    );
  };

  const handleStep3 = () => {
    playHackingBeep(1500);
    setPivotStep(4);
    setTerminalLog((prev) =>
      prev + `\n\n$ proxychains impacket-secretsdump corp.lan/administrator@10.10.10.5\n` +
      `[+] Dumping Domain Controller Active Directory NTDS.dit hashes...\n` +
      `[+] Administrator:500:aad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::\n` +
      `[+] LATERAL MOVEMENT COMPLETE! ROOT FLAG: ${REVEALED_FLAG}`
    );

    if (!solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => onSolved?.(), 1600);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, manualFlag);
    if (res.success || res.duplicate) {
      setSolved(true);
      setFlagFeedback({ success: true, text: res.message });
      setTimeout(() => onSolved?.(), 1200);
    } else {
      setFlagFeedback({ success: false, text: res.message });
    }
  };

  return (
    <div className="hack-puzzle-container network-pivot-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Network size={15} className="text-cyan-400 hack-icon-pulse" />
          <span>NETWORK SECURITY // SUBNET PIVOTING & ACTIVE DIRECTORY INFILTRATION</span>
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
          The workstation has compromised the perimeter DMZ bastion. Pivot across segmented internal subnets using a SOCKS5 Chisel reverse tunnel to compromise the corporate Domain Controller (10.10.10.5).
        </p>
      </div>

      {/* Network Topology Visualizer */}
      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs">
        <div className="text-[10px] text-cyan-400 font-bold uppercase mb-2">// Network Topology & Proxy Tunnel Route:</div>
        <div className="flex items-center justify-between gap-1 text-[11px] overflow-x-auto pb-1">
          <div className="p-2 bg-slate-900 border border-cyan-500/40 rounded text-center">
            <span className="text-slate-400 block text-[9px]">ATTACKER BOX</span>
            <strong className="text-cyan-300">192.168.1.100</strong>
          </div>
          <ArrowRight size={14} className="text-cyan-400 flex-shrink-0" />
          <div className="p-2 bg-slate-900 border border-amber-500/40 rounded text-center">
            <span className="text-slate-400 block text-[9px]">DMZ BASTION (CHISEL)</span>
            <strong className="text-amber-300">172.16.50.2</strong>
          </div>
          <ArrowRight size={14} className={pivotStep >= 2 ? 'text-emerald-400 flex-shrink-0' : 'text-slate-600 flex-shrink-0'} />
          <div className={`p-2 bg-slate-900 border rounded text-center ${pivotStep >= 2 ? 'border-emerald-500/50' : 'border-slate-800'}`}>
            <span className="text-slate-400 block text-[9px]">PROXYCHAINS TUNNEL</span>
            <strong className="text-emerald-300">127.0.0.1:1080</strong>
          </div>
          <ArrowRight size={14} className={pivotStep >= 3 ? 'text-emerald-400 flex-shrink-0' : 'text-slate-600 flex-shrink-0'} />
          <div className={`p-2 bg-slate-900 border rounded text-center ${pivotStep >= 4 ? 'border-emerald-400 bg-emerald-950/40' : 'border-slate-800'}`}>
            <span className="text-slate-400 block text-[9px]">DOMAIN CONTROLLER</span>
            <strong className="text-rose-400">10.10.10.5</strong>
          </div>
        </div>
      </div>

      {/* Interactive Lateral Steps */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleStep1}
          disabled={pivotStep !== 1 || solved}
          className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition border ${
            pivotStep === 1
              ? 'bg-cyan-600 text-black border-cyan-400'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
        >
          1. DEPLOY SOCKS5 CHISEL TUNNEL
        </button>

        <button
          type="button"
          onClick={handleStep2}
          disabled={pivotStep !== 2 || solved}
          className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition border ${
            pivotStep === 2
              ? 'bg-amber-600 text-black border-amber-400'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
        >
          2. SCAN DC ENCLAVE VIA PROXYCHAINS
        </button>

        <button
          type="button"
          onClick={handleStep3}
          disabled={pivotStep !== 3 || solved}
          className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition border ${
            pivotStep === 3
              ? 'bg-emerald-600 text-black border-emerald-400'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
        >
          3. DUMP NTDS.DIT ACTIVE DIRECTORY HASHES
        </button>
      </div>

      {/* Terminal Output */}
      {terminalLog && (
        <div className="mt-3 p-2.5 bg-black border border-cyan-500/30 rounded font-mono text-[11px] text-cyan-300 whitespace-pre-wrap">
          {terminalLog}
        </div>
      )}

      {/* MANUAL FLAG SUBMISSION STRIP */}
      <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={manualFlag}
          onChange={(e) => setManualFlag(e.target.value)}
          placeholder="Or submit flag: FLAG{...}"
          className="flex-1 bg-black/50 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-1 rounded text-xs transition"
        >
          SUBMIT
        </button>
      </form>

      {flagFeedback && (
        <div className={`mt-2 text-xs p-1.5 rounded ${flagFeedback.success ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'}`}>
          {flagFeedback.text}
        </div>
      )}

      {solved ? (
        <div className="hack-success-banner mt-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-bold text-emerald-300">ACTIVE DIRECTORY ENCLAVE BREACHED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+350 CTF PTS Awarded to Profile · Multi-Monitor Station Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Step 1: Deploy Chisel ➔ Step 2: Route Proxychains ➔ Step 3: Extract Domain Controller flag</span>
        </div>
      )}
    </div>
  );
}
