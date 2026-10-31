import React, { useState } from 'react';
import { Skull, CheckCircle2, Play, Zap, Flame, ShieldAlert, Cpu, KeyRound, Plus, Trash2, Edit3, Eye } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'pwn-heap-race-condition';
const REVEALED_FLAG = 'FLAG{heap_overflow_uaf_zero_day_unlocked}';
const TARGET_VAULT_ADDR = '0x004040a0';

export default function HeapOverflowChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [chunks, setChunks] = useState([
    { id: 0, addr: '0x5555557572a0', size: '0x40', status: 'ALLOCATED', fd: 'NULL', data: 'session_token_alpha' },
  ]);
  const [tcacheBin, setTcacheBin] = useState([]);
  const [editChunkId, setEditChunkId] = useState(0);
  const [editPayload, setEditPayload] = useState('');
  const [heapLog, setHeapLog] = useState(
    'GLIBC 2.31 Heap Memory Allocator Initialized.\nTarget Vault Flag Descriptor address: 0x004040a0\nType commands or use heap actions below.'
  );
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  // Malloc Operation
  const handleMalloc = () => {
    playClickSound(900);
    if (chunks.length >= 5) {
      setHeapLog((prev) => prev + '\n[-] Allocator limit reached: maximum 5 chunks.');
      return;
    }

    if (tcacheBin.length > 0) {
      // Pop from tcache
      const popped = tcacheBin[0];
      const newTcache = tcacheBin.slice(1);
      setTcacheBin(newTcache);

      const isPoisoned = popped.targetAddr && popped.targetAddr === TARGET_VAULT_ADDR;
      const newChunk = {
        id: chunks.length,
        addr: isPoisoned ? TARGET_VAULT_ADDR : popped.addr,
        size: '0x40',
        status: 'ALLOCATED',
        fd: 'NULL',
        data: isPoisoned ? REVEALED_FLAG : 'new_worker_note',
      };

      setChunks((prev) => [...prev, newChunk]);
      setHeapLog(
        (prev) =>
          prev +
          `\n[+] malloc(0x40): Reclaimed chunk from tcache bin [0x50] at ${newChunk.addr}!` +
          (isPoisoned ? `\n[🔥] TCACHE POISONING SUCCESSFUL! Target descriptor hijacked at ${TARGET_VAULT_ADDR}!` : '')
      );
      playHackingBeep(1200);
    } else {
      const nextId = chunks.length;
      const baseAddr = 0x5555557572a0 + nextId * 0x50;
      const newChunk = {
        id: nextId,
        addr: '0x' + baseAddr.toString(16),
        size: '0x40',
        status: 'ALLOCATED',
        fd: 'NULL',
        data: `note_${nextId}`,
      };
      setChunks((prev) => [...prev, newChunk]);
      setHeapLog((prev) => prev + `\n[+] malloc(0x40) -> Allocated new chunk #${nextId} at ${newChunk.addr}.`);
    }
  };

  // Free Operation (Vulnerable: doesn't nullify chunk pointer)
  const handleFree = (chunkId) => {
    playClickSound(850);
    const target = chunks.find((c) => c.id === chunkId);
    if (!target) return;

    if (target.status === 'FREED') {
      setHeapLog((prev) => prev + `\n[!] Double free detected on chunk #${chunkId}!`);
      playZapSound();
      return;
    }

    // Mark as freed and push to tcache
    setChunks((prev) =>
      prev.map((c) => (c.id === chunkId ? { ...c, status: 'FREED IN TCACHE', fd: 'NULL' } : c))
    );
    setTcacheBin((prev) => [{ chunkId, addr: target.addr, targetAddr: null }, ...prev]);
    setHeapLog(
      (prev) =>
        prev +
        `\n[+] free(chunk_${chunkId}): Placed into tcache [0x50] (fd -> NULL).\n` +
        `[*] WARNING: Pointer not zeroed! Chunk #${chunkId} remains writable via Use-After-Free.`
    );
  };

  // Edit Operation (Vulnerable UAF write)
  const handleEdit = () => {
    playClickSound(950);
    const target = chunks.find((c) => c.id === editChunkId);
    if (!target) return;

    const payload = editPayload.trim();
    if (!payload) return;

    const isFreed = target.status.includes('FREED');

    setChunks((prev) =>
      prev.map((c) =>
        c.id === editChunkId
          ? {
              ...c,
              fd: isFreed ? payload : c.fd,
              data: payload,
            }
          : c
      )
    );

    // If chunk was freed in tcache, update its forward pointer!
    if (isFreed) {
      setTcacheBin((prev) =>
        prev.map((t) => (t.chunkId === editChunkId ? { ...t, targetAddr: payload } : t))
      );
      setHeapLog(
        (prev) =>
          prev +
          `\n[!] USE-AFTER-FREE WRITE on freed Chunk #${editChunkId}!\n` +
          `[!] Tcache forward pointer (fd) overwritten -> ${payload}.\n` +
          (payload.toLowerCase() === TARGET_VAULT_ADDR
            ? `[+] Tcache poisoned with target vault descriptor (0x004040a0)! Call malloc() twice to claim it.`
            : `[*] Tcache fd updated to custom address ${payload}.`)
      );
      playHackingBeep(1300);
    } else {
      setHeapLog((prev) => prev + `\n[+] edit(chunk_${editChunkId}): User data updated to "${payload}".`);
    }
  };

  // View / Print Chunk
  const handleView = (chunkId) => {
    playClickSound(900);
    const target = chunks.find((c) => c.id === chunkId);
    if (!target) return;

    if (target.addr === TARGET_VAULT_ADDR || target.data.includes('FLAG{')) {
      setHeapLog(
        (prev) =>
          prev +
          `\n------------------------------------------------------------\n` +
          `[+] read(chunk_${chunkId}) at ${target.addr}:\n` +
          `[+] VAULT ROOT FLAG RECOVERED: ${REVEALED_FLAG}\n` +
          `------------------------------------------------------------`
      );
      playBreachFanfare();
    } else {
      setHeapLog((prev) => prev + `\n[+] read(chunk_${chunkId}) at ${target.addr}: "${target.data}"`);
    }
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
    <div className="hack-puzzle-container heap-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Skull size={15} className="text-rose-500 hack-icon-pulse" />
          <span>BINARY EXPLOITATION // GLIBC TCACHE POISONING & UAF WORKBENCH</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 500} PTS`}
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
          The Vault Daemon allocates 0x40-byte chunks via Glibc 2.31 <code>malloc()</code>. Because <code>free()</code> leaves dangling pointers without zeroing memory, perform a <strong>Tcache Poisoning</strong> attack: free a chunk, use Use-After-Free to overwrite its forward pointer (<code>fd</code>) to <code>0x004040a0</code>, and malloc twice to inspect the root flag descriptor.
        </p>
      </div>

      {/* Heap Memory Table Visualizer */}
      <div className="mt-2 border border-slate-800 rounded bg-slate-950 overflow-hidden font-mono text-xs">
        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
          <span>HEAP CHUNKS MAP (GLIBC 2.31 ARENA)</span>
          <span className="text-cyan-400">TARGET VAULT: {TARGET_VAULT_ADDR}</span>
        </div>
        <div className="max-h-40 overflow-y-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-black text-[10px] text-slate-500 border-b border-slate-800">
              <tr>
                <th className="p-1.5">ID</th>
                <th className="p-1.5">ADDRESS</th>
                <th className="p-1.5">SIZE</th>
                <th className="p-1.5">STATUS</th>
                <th className="p-1.5">FORWARD PTR (FD)</th>
                <th className="p-1.5">DATA</th>
                <th className="p-1.5">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {chunks.map((c) => (
                <tr
                  key={c.id}
                  className={c.addr === TARGET_VAULT_ADDR ? 'bg-emerald-950/40 text-emerald-300' : 'text-slate-300'}
                >
                  <td className="p-1.5 font-bold">#{c.id}</td>
                  <td className="p-1.5 font-mono text-cyan-400">{c.addr}</td>
                  <td className="p-1.5">{c.size}</td>
                  <td className="p-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        c.status.includes('FREED')
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-1.5 font-mono text-amber-400">{c.fd}</td>
                  <td className="p-1.5 truncate max-w-[120px] select-all">{c.data}</td>
                  <td className="p-1.5 flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleView(c.id)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px]"
                      title="Read chunk data"
                    >
                      View
                    </button>
                    {!c.status.includes('FREED') && (
                      <button
                        type="button"
                        onClick={() => handleFree(c.id)}
                        className="px-2 py-0.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded text-[10px]"
                        title="Free chunk into tcache"
                      >
                        Free
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Heap Interactive Operations Bar */}
      <div className="p-3 bg-black border border-slate-800 rounded mt-2 font-mono text-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Malloc Button */}
          <button
            type="button"
            onClick={handleMalloc}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition text-xs"
          >
            <Plus size={13} />
            <span>MALLOC(0x40)</span>
          </button>

          {/* UAF Edit / Overwrite Form */}
          <div className="flex items-center gap-1.5 flex-1 min-w-[280px]">
            <span className="text-[10px] text-slate-400">EDIT CHUNK:</span>
            <select
              value={editChunkId}
              onChange={(e) => setEditChunkId(parseInt(e.target.value, 10))}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
            >
              {chunks.map((c) => (
                <option key={c.id} value={c.id}>
                  Chunk #{c.id} ({c.status})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={editPayload}
              onChange={(e) => setEditPayload(e.target.value)}
              placeholder="e.g. 0x004040a0 (target fd)"
              className="flex-1 bg-slate-900 border border-slate-700 text-cyan-300 rounded px-2.5 py-1 text-xs outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={handleEdit}
              className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-3 py-1 rounded text-xs transition"
            >
              WRITE
            </button>
          </div>
        </div>

        {/* Quick Target Address Pill */}
        <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1">
          <span>Target Descriptor Address:</span>
          <button
            type="button"
            onClick={() => setEditPayload(TARGET_VAULT_ADDR)}
            className="text-cyan-400 hover:underline font-mono"
          >
            0x004040a0 (click to copy into payload)
          </button>
        </div>
      </div>

      {/* Glibc Heap Debugger Console */}
      <div className="mt-2 p-2.5 bg-black border border-slate-800 rounded font-mono text-xs">
        <div className="text-slate-500 text-[10px] uppercase mb-1 flex items-center gap-1">
          <Terminal size={11} />
          <span>HEAP CONSOLE (GLIBC LOG):</span>
        </div>
        <pre className="text-slate-300 whitespace-pre-wrap select-all overflow-x-auto max-h-32 leading-relaxed">
          {heapLog}
        </pre>
      </div>

      {/* FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT ZERO-DAY HEAP OVERFLOW FLAG:</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{heap_overflow_...}"
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
            <span className="font-bold text-emerald-300">HEAP CORRUPTED // ROOT ZERO-DAY UNLOCKED</span>
            <span className="text-[10px] text-emerald-400/80">+500 CTF PTS Awarded · Tcache Poisoning Master</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Free Chunk 0, write 0x004040a0 into it via UAF, then malloc twice to retrieve the flag vault</span>
        </div>
      )}
    </div>
  );
}
