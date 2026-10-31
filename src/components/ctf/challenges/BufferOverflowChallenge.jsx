import React, { useState } from 'react';
import { Cpu, Terminal, Play, CheckCircle2, ShieldAlert, Zap, AlertTriangle, Code2 } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'pwn-stack-matrix-buffer';
const REVEALED_FLAG = 'FLAG{buffer_overflow_eip_overwritten_0x55}';

export default function BufferOverflowChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [payloadLength, setPayloadLength] = useState(24);
  const [returnAddr, setReturnAddr] = useState('0x00401155');
  const [executing, setExecuting] = useState(false);
  const [gdbOutput, setGdbOutput] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const bufferSize = 16;
  const savedRbpSize = 8;
  const overflowOffset = bufferSize + savedRbpSize; // 24 bytes to reach RIP

  const handleTestExploit = () => {
    if (solved || executing) return;
    setExecuting(true);
    playHackingBeep(1100);
    setGdbOutput('Starting program: ./vuln_server\nInjecting crafted input buffer...');

    setTimeout(() => {
      if (payloadLength >= overflowOffset && (returnAddr === '0x00401155' || returnAddr === '0x55')) {
        setGdbOutput(
          `[+] Payload injected (${payloadLength} bytes padding + target RIP)\n` +
          `[+] [0x7fffffffe018]: Overwriting Saved RIP -> 0x00401155\n` +
          `[+] Instruction pointer redirected to win()!\n` +
          `[+] FLAG CAPTURED: ${REVEALED_FLAG}`
        );
        setExecuting(false);
        setSolved(true);
        ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
        playBreachFanfare();
        setTimeout(() => onSolved?.(), 1600);
      } else if (payloadLength < overflowOffset) {
        setGdbOutput(
          `[-] Injected ${payloadLength} bytes.\n` +
          `[-] Stack frame not fully saturated (Needs ${overflowOffset} bytes to reach Saved RIP).\n` +
          `[-] Program exited normally without hijacking control flow.`
        );
        setExecuting(false);
        playClickSound(350, 0.1);
      } else {
        setGdbOutput(
          `[!] Program received signal SIGSEGV, Segmentation fault.\n` +
          `[!] Invalid memory reference at RIP: ${returnAddr}\n` +
          `[!] Target win() address is 0x00401155.`
        );
        setExecuting(false);
        playZapSound();
      }
    }, 600);
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
          Analyze the vulnerable C source code and stack frame. Calculate the exact byte offset to overwrite the instruction pointer (Saved RIP) and divert control to <code className="text-cyan-400">win() (0x00401155)</code>.
        </p>
      </div>

      {/* C Source Code Preview */}
      <div className="p-2.5 bg-black border border-slate-800 rounded font-mono text-[11px] text-slate-300">
        <div className="text-[10px] text-slate-500 mb-1">// Vulnerable Binary Source (vuln_server.c):</div>
        <div><span className="text-purple-400">void</span> <span className="text-cyan-400">vuln</span>(<span className="text-purple-400">char</span> *input) &#123;</div>
        <div className="pl-4"><span className="text-purple-400">char</span> buffer[<span className="text-amber-400">16</span>];</div>
        <div className="pl-4 text-rose-400">strcpy(buffer, input); <span className="text-slate-500">// Vulnerability: Unbounded copy</span></div>
        <div>&#125;</div>
        <div><span className="text-purple-400">void</span> <span className="text-emerald-400">win</span>() &#123; print_flag(); &#125; <span className="text-slate-500">// Located at: 0x00401155</span></div>
      </div>

      {/* Visual Stack Layout Diagram */}
      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
        <div className="text-xs font-mono text-cyan-400 font-bold">// Visual Stack Memory Layout:</div>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
          <div className="p-2 bg-slate-900 border border-cyan-500/40 rounded">
            <span className="text-slate-400 block text-[10px]">LOCAL BUFFER</span>
            <strong className="text-cyan-300">16 Bytes</strong>
            <span className="text-[10px] text-slate-500 block">0x7fffffffe000</span>
          </div>
          <div className="p-2 bg-slate-900 border border-amber-500/40 rounded">
            <span className="text-slate-400 block text-[10px]">SAVED RBP</span>
            <strong className="text-amber-300">8 Bytes</strong>
            <span className="text-[10px] text-slate-500 block">0x7fffffffe010</span>
          </div>
          <div className="p-2 bg-slate-900 border border-rose-500/60 rounded">
            <span className="text-slate-400 block text-[10px]">SAVED RIP (RET)</span>
            <strong className="text-rose-400">8 Bytes</strong>
            <span className="text-[10px] text-slate-500 block">0x7fffffffe018</span>
          </div>
        </div>

        {/* Payload Crafting Controls */}
        <div className="pt-2 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">PADDING BYTES (OFFSET):</span>
            <strong className="text-cyan-400">{payloadLength} Bytes {payloadLength === 24 ? '(Exact Offset!)' : ''}</strong>
          </div>
          <input
            type="range"
            min="8"
            max="32"
            step="1"
            value={payloadLength}
            onChange={(e) => setPayloadLength(parseInt(e.target.value, 10))}
            className="w-full hack-range-input cursor-pointer"
            disabled={solved || executing}
          />
          <div className="flex items-center gap-2 pt-1">
            <label className="text-xs font-mono text-slate-400">OVERWRITE RIP WITH:</label>
            <input
              type="text"
              value={returnAddr}
              onChange={(e) => setReturnAddr(e.target.value)}
              className="flex-1 bg-black border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-emerald-300 outline-none focus:border-cyan-500"
              disabled={solved || executing}
            />
            <button
              type="button"
              onClick={handleTestExploit}
              disabled={solved || executing}
              className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-3 py-1 rounded text-xs flex items-center gap-1 transition"
            >
              <Play size={13} />
              <span>TEST IN GDB</span>
            </button>
          </div>
        </div>
      </div>

      {/* GDB Debugger Console Output */}
      {gdbOutput && (
        <div className="mt-3 p-2.5 bg-black border border-cyan-500/30 rounded font-mono text-[11px] text-cyan-300 whitespace-pre-wrap">
          {gdbOutput}
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
            <span className="font-bold text-emerald-300">RIP CONTROL HIJACKED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+200 CTF PTS Awarded to Profile · Skills Archive Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Buffer (16 bytes) + Saved RBP (8 bytes) = 24 bytes offset to hijack RIP</span>
        </div>
      )}
    </div>
  );
}
