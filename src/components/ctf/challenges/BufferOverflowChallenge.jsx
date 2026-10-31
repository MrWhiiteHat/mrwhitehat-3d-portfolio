import React, { useState } from 'react';
import { Cpu, Terminal, Play, CheckCircle2, ShieldAlert, Zap, AlertTriangle, Code2, KeyRound } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'pwn-stack-matrix-buffer';
const REVEALED_FLAG = 'FLAG{buffer_overflow_eip_overwritten_0x55}';

export default function BufferOverflowChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  // Real CTF: starts empty/blank, user must calculate and type
  const [paddingOffset, setPaddingOffset] = useState('');
  const [targetRip, setTargetRip] = useState('');
  const [executing, setExecuting] = useState(false);
  const [gdbOutput, setGdbOutput] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const bufferSize = 16;
  const savedRbpSize = 8;
  const requiredOffset = bufferSize + savedRbpSize; // 24 bytes

  const handleTestExploit = () => {
    if (executing) return;
    const offsetNum = parseInt(paddingOffset, 10);
    const ripClean = targetRip.trim().toLowerCase();

    if (isNaN(offsetNum) || offsetNum < 0) {
      setGdbOutput('[-] Error: Please enter a valid non-negative byte count for payload padding.');
      playZapSound();
      return;
    }

    if (!ripClean) {
      setGdbOutput('[-] Error: Target return address (Saved RIP) cannot be empty.');
      playZapSound();
      return;
    }

    setExecuting(true);
    playHackingBeep(1100);
    setGdbOutput('Starting program: ./vuln_server\nDebugger attached (gdb-peda)\nInjecting constructed payload bytes...');

    setTimeout(() => {
      const isRipWin = ripClean === '0x00401155' || ripClean === '0x401155' || ripClean === '0x55';

      if (offsetNum >= requiredOffset && isRipWin) {
        setGdbOutput(
          `[+] Payload injected: ${offsetNum} bytes padding ('A'*${offsetNum}) + return address (${targetRip})\n` +
          `[+] [0x7fffffffe018]: Overwritten Saved RIP -> 0x00401155\n` +
          `[+] Control flow hijacked! Execution successfully redirected to win()!\n` +
          `[+] Executing win(): Dumping confidential flag from root vault...\n` +
          `[+] FLAG CAPTURED: ${REVEALED_FLAG}`
        );
        playClickSound(1000);
      } else if (offsetNum < requiredOffset) {
        setGdbOutput(
          `[-] Injected ${offsetNum} bytes.\n` +
          `[-] Stack frame analysis: buffer is ${bufferSize} bytes + ${savedRbpSize} bytes Saved RBP.\n` +
          `[-] Stack not saturated (Needs ${requiredOffset} bytes total to reach Saved RIP).\n` +
          `[-] Program exited normally without hijacking control flow (exit code: 0).`
        );
        playZapSound();
      } else {
        setGdbOutput(
          `[!] Program received signal SIGSEGV, Segmentation fault.\n` +
          `[!] 0x00000000${targetRip.replace('0x', '')} in ?? ()\n` +
          `[!] Invalid memory dereference at instruction pointer.\n` +
          `[!] Inspect symbol table: 'win()' function is located at address 0x00401155.`
        );
        playZapSound();
      }
      setExecuting(false);
    }, 700);
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
    <div className="hack-puzzle-container pwn-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Cpu size={15} className="text-cyan-400 hack-icon-pulse" />
          <span>BINARY EXPLOITATION // STACK BUFFER OVERFLOW & RIP HIJACK</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 200} PTS`}
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
          The binary <code>vuln_server</code> reads standard input into a fixed stack buffer via vulnerable <code>gets()</code>. Calculate the exact padding offset to reach the Saved RIP return address, then hijack control flow to the <code>win()</code> function.
        </p>
      </div>

      {/* C Source Code & Disassembly View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        <div className="p-2.5 bg-black/90 border border-slate-800 rounded font-mono text-[11px]">
          <div className="text-cyan-400 text-[10px] uppercase mb-1 flex items-center gap-1">
            <Code2 size={12} />
            <span>VULNERABLE C SOURCE (vuln.c):</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto leading-relaxed">
{`void win() {
    // 0x00401155
    print_flag_vault();
}

void vuln() {
    char buffer[16]; // 16 bytes
    gets(buffer);    // No bounds check!
}`}
          </pre>
        </div>

        <div className="p-2.5 bg-black/90 border border-slate-800 rounded font-mono text-[11px]">
          <div className="text-amber-400 text-[10px] uppercase mb-1 flex items-center gap-1">
            <Terminal size={12} />
            <span>GDB DISASSEMBLY & SYMBOLS:</span>
          </div>
          <pre className="text-slate-300 overflow-x-auto leading-relaxed">
{`gdb-peda$ info functions
0x00401130  main
0x00401140  vuln
0x00401155  win
gdb-peda$ checksec
CANARY    : Disabled
FORTIFY   : Disabled
NX        : Enabled
PIE       : Disabled`}
          </pre>
        </div>
      </div>

      {/* Stack Frame Layout Visualizer */}
      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded mt-2 font-mono text-[11px]">
        <span className="text-[10px] text-slate-400 uppercase block mb-1.5">STACK FRAME MEMORY ARCHITECTURE (x86_64):</span>
        <div className="grid grid-cols-3 gap-1 text-center text-xs">
          <div className="p-2 bg-blue-950/40 border border-blue-600/50 rounded">
            <strong className="text-blue-300 block">buffer[16]</strong>
            <span className="text-[10px] text-slate-400">16 Bytes</span>
          </div>
          <div className="p-2 bg-purple-950/40 border border-purple-600/50 rounded">
            <strong className="text-purple-300 block">Saved RBP</strong>
            <span className="text-[10px] text-slate-400">8 Bytes</span>
          </div>
          <div className="p-2 bg-rose-950/40 border border-rose-600/50 rounded">
            <strong className="text-rose-300 block">Saved RIP</strong>
            <span className="text-[10px] text-slate-400">Target Address</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 text-center mt-1">
          Offset to Saved RIP = 16 bytes (buffer) + 8 bytes (RBP) = <strong>24 Bytes</strong>
        </div>
      </div>

      {/* Exploit Construction Inputs */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 mt-2">
        <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
          EXPLOIT PAYLOAD CONFIGURATION:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              PADDING LENGTH (BYTES TO SAVED RIP):
            </label>
            <input
              type="number"
              value={paddingOffset}
              onChange={(e) => setPaddingOffset(e.target.value)}
              placeholder="e.g. 24"
              className="w-full bg-black border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              TARGET OVERWRITE ADDRESS (SAVED RIP):
            </label>
            <input
              type="text"
              value={targetRip}
              onChange={(e) => setTargetRip(e.target.value)}
              placeholder="e.g. 0x00401155"
              className="w-full bg-black border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleTestExploit}
          disabled={executing}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 transition font-mono mt-1"
        >
          <Play size={13} />
          <span>{executing ? 'RUNNING IN GDB...' : 'RUN EXPLOIT AGAINST ./vuln_server'}</span>
        </button>
      </div>

      {/* GDB Execution Console */}
      {gdbOutput && (
        <div className="mt-3 p-2.5 bg-black border border-slate-800 rounded font-mono text-xs">
          <div className="text-slate-500 text-[10px] uppercase mb-1 flex items-center gap-1">
            <Terminal size={11} />
            <span>GDB-PEDA SESSION LOG:</span>
          </div>
          <pre className="text-emerald-300 whitespace-pre-wrap select-all overflow-x-auto leading-relaxed">
            {gdbOutput}
          </pre>
        </div>
      )}

      {/* FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT CAPTURED PWN FLAG:</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{buffer_overflow_...}"
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
            <span className="font-bold text-emerald-300">EXPLOIT SUCCESSFUL // BUFFER PWNED</span>
            <span className="text-[10px] text-emerald-400/80">+200 CTF PTS Awarded · Stack Hijack Complete</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Calculate offset: buffer size (16) + RBP (8) = 24 bytes to target RIP address 0x00401155</span>
        </div>
      )}
    </div>
  );
}
