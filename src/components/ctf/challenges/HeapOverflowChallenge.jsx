import React, { useState } from 'react';
import { Skull, CheckCircle2, Play, Zap, Flame, ShieldAlert, Cpu } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'pwn-heap-race-condition';
const REVEALED_FLAG = 'FLAG{heap_overflow_uaf_zero_day_unlocked}';

export default function HeapOverflowChallenge({ onSolved, onBypass, playerData }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [threadConcurrency, setThreadConcurrency] = useState(8);
  const [raceExecuting, setRaceExecuting] = useState(false);
  const [heapLog, setHeapLog] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleTriggerRace = () => {
    if (solved || raceExecuting) return;
    setRaceExecuting(true);
    playHackingBeep(1200);
    setHeapLog(
      `[*] Spawning ${threadConcurrency} concurrent worker threads against Vault cache...\n` +
      `[*] Allocating glibc chunk [0x40] in tcache bin [4] ...\n` +
      `[*] free(chunk_b): Pointer dangling during asynchronous flush window...`
    );

    setTimeout(() => {
      if (threadConcurrency >= 6) {
        setHeapLog(
          `[+] Heap race condition won! Thread #3 reclaimed dangling Chunk B at 0x5555557572a0!\n` +
          `[+] Metadata corrupted: Function pointer hijacked -> vault_unlock()\n` +
          `[+] ZERO-DAY HEAP OVERFLOW SUCCESSFUL!\n` +
          `[+] ROOT VAULT FLAG: ${REVEALED_FLAG}`
        );
        setRaceExecuting(false);
        setSolved(true);
        ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
        playBreachFanfare();
        setTimeout(() => onSolved?.(), 1600);
      } else {
        setHeapLog(
          `[-] Concurrency too low (${threadConcurrency} threads).\n` +
          `[-] Garbage collector zeroed chunk memory before race window could be seized.\n` +
          `[-] Increase thread concurrency (6+ threads) to saturate the allocator.`
        );
        setRaceExecuting(false);
        playZapSound();
      }
    }, 800);
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
    <div className="hack-puzzle-container heap-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Skull size={15} className="text-rose-500 hack-icon-pulse" />
          <span>BINARY EXPLOITATION // ZERO-DAY HEAP OVERFLOW & USE-AFTER-FREE OVERLOAD</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-rose-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 500} PTS`}
          </span>
          <button
            className="hack-bypass-btn text-rose-400"
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
          The Black Hat Vault memory cache suffers from a multithreaded Use-After-Free (UAF) race condition. Saturate the glibc allocator by spinning up concurrent threads to overwrite chunk metadata before zeroing occurs.
        </p>
      </div>

      {/* Glibc Heap Layout Visualizer */}
      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded font-mono text-xs space-y-2">
        <div className="text-[10px] text-rose-400 font-bold uppercase">// Glibc Heap Chunk Allocator (Tcache Bin [4]):</div>
        <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
          <div className="p-2 bg-slate-900 border border-emerald-500/40 rounded">
            <span className="text-slate-400 block text-[9px]">CHUNK A (IN USE)</span>
            <strong className="text-emerald-400">0x555555757260</strong>
            <span className="text-[9px] text-slate-500 block">Size: 0x40 | Vault Root Key</span>
          </div>
          <div className="p-2 bg-slate-900 border border-rose-500/50 rounded">
            <span className="text-rose-400 block text-[9px]">CHUNK B (FREED / DANGLING)</span>
            <strong className="text-rose-300">0x5555557572a0</strong>
            <span className="text-[9px] text-slate-500 block">Race Window: ~250ms</span>
          </div>
        </div>

        {/* Concurrency Slider */}
        <div className="pt-2 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">CONCURRENT EXPLOIT THREADS:</span>
            <strong className="text-rose-400">{threadConcurrency} Threads {threadConcurrency >= 6 ? '(Saturated!)' : ''}</strong>
          </div>
          <input
            type="range"
            min="2"
            max="16"
            step="1"
            value={threadConcurrency}
            onChange={(e) => setThreadConcurrency(parseInt(e.target.value, 10))}
            className="w-full hack-range-input cursor-pointer"
            disabled={solved || raceExecuting}
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleTriggerRace}
            disabled={solved || raceExecuting}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-1.5 transition"
          >
            <Flame size={13} />
            <span>{raceExecuting ? 'TRIGGERING RACE...' : 'INJECT CONCURRENT UAF RACE'}</span>
          </button>
        </div>
      </div>

      {/* Heap Console Log */}
      {heapLog && (
        <div className="mt-3 p-2.5 bg-black border border-rose-500/30 rounded font-mono text-[11px] text-rose-300 whitespace-pre-wrap">
          {heapLog}
        </div>
      )}

      {/* MANUAL FLAG SUBMISSION STRIP */}
      <form onSubmit={handleManualSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={manualFlag}
          onChange={(e) => setManualFlag(e.target.value)}
          placeholder="Or submit flag: FLAG{...}"
          className="flex-1 bg-black/50 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-rose-500"
        />
        <button
          type="submit"
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1 rounded text-xs transition"
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
        <div className="hack-success-banner zero-day-success mt-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-bold text-emerald-300">ZERO-DAY EXPLOIT COMPLETE // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+500 CTF PTS Awarded to Profile · Secret Vault Mainframe Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" style={{ background: '#f43f5e' }} />
          <span>Increase concurrent worker threads (6+) to seize the glibc allocation race window</span>
        </div>
      )}
    </div>
  );
}
