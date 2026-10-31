import React, { useState } from 'react';
import { Binary, Play, RefreshCw, KeyRound, CheckCircle2, ShieldAlert, Cpu, Terminal, Code2 } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

const BINARY_PATCH_FLAG = 'FLAG{binary_patch_nop_anti_debug_bypassed}';
const BUFFER_OVERFLOW_FLAG = 'FLAG{buffer_overflow_eip_overwritten_0x55}';

const ASM_INSTRUCTIONS = [
  { addr: '0x004011a0', hex: '48 83 ec 28', asm: 'sub rsp, 0x28', note: 'Allocate stack frame' },
  { addr: '0x004011a4', hex: 'e8 87 fe ff', asm: 'call <ptrace@plt>', note: 'Anti-debug PTRACE_TRACEME check' },
  { addr: '0x004011a9', hex: '48 83 f8 ff', asm: 'cmp rax, -0x1', note: 'Detect active debugger (rax == -1)' },
  { addr: '0x004011ad', hex: '74 12', asm: 'je 0x004011c1 <tamper_kill>', isTarget: true, note: 'Conditional jump to termination' },
  { addr: '0x004011af', hex: '48 8d 3d 4e', asm: 'lea rdi, [str_clearance]', note: 'Load "CLEARANCE GRANTED"' },
  { addr: '0x004011b6', hex: 'e8 95 fe ff', asm: 'call <decrypt_vault_flag>', note: 'Dispense CTF Root Flag' },
  { addr: '0x004011c1', hex: 'e8 a0 fe ff', asm: 'call <tamper_kill>', note: 'Tamper detected exit routine' },
];

export default function GhidraGdbApp() {
  const [activeTab, setActiveTab] = useState('reversing'); // 'reversing' | 'buffer'
  // Reversing State
  const [patchedOpcode, setPatchedOpcode] = useState('74 12');
  const [patchInput, setPatchInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [reversingLog, setReversingLog] = useState('Disassembly loaded: ./sentinel_daemon (x86_64 ELF).\nTarget conditional jump located at 0x004011ad: [74 12].');

  // Buffer Overflow State
  const [paddingLength, setPaddingLength] = useState('');
  const [targetRip, setTargetRip] = useState('');
  const [gdbOutput, setGdbOutput] = useState('');

  // Flag Submissions
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleApplyPatch = () => {
    const clean = patchInput.trim().toUpperCase();
    if (!clean) return;
    playClickSound(850);
    setPatchedOpcode(clean);
    setReversingLog((prev) => prev + `\n[*] Instruction at 0x004011ad patched: [74 12] ➔ [${clean}].`);
  };

  const handleRunReversing = () => {
    if (executing) return;
    setExecuting(true);
    setReversingLog('[*] Spawning sandboxed process ./sentinel_daemon ...\n[*] GDB debugger attached via ptrace.\n');
    playHackingBeep(1000);

    let step = 0;
    const interval = setInterval(() => {
      setActiveStep(step);
      playHackingBeep(1100 + step * 90);

      if (step === 2) {
        setReversingLog((prev) => prev + '[0x004011a9]: cmp rax, -1 ➔ rax = -1 (Debugger actively detected! ZF=1).\n');
      }

      if (step === 3) {
        if (patchedOpcode === '90 90' || patchedOpcode === '9090') {
          setReversingLog(
            (prev) =>
              prev +
              '[0x004011ad]: Opcode 90 90 (NOP NOP) ➔ No jump taken! Fallthrough to 0x004011af.\n' +
              '[+] Anti-debug check neutralized! Executing decrypt_vault_flag()...\n' +
              `[+] ROOT CLEARANCE GRANTED: ${BINARY_PATCH_FLAG}\n`
          );
          clearInterval(interval);
          setExecuting(false);
          setActiveStep(5);
          playClickSound(1200);
        } else if (patchedOpcode === '74 12' || patchedOpcode === '7412') {
          clearInterval(interval);
          setExecuting(false);
          setActiveStep(-1);
          playZapSound();
          setReversingLog(
            (prev) =>
              prev +
              '[0x004011ad]: Opcode 74 12 (JE) taken! Jumped to 0x004011c1 <tamper_kill>!\n' +
              '[!] PROCESS TERMINATED BY TAMPER EXIT (SIGKILL).\n' +
              '[*] Tip: Patch instruction at 0x004011ad with NOPs (90 90) to prevent the jump.'
          );
        } else {
          clearInterval(interval);
          setExecuting(false);
          setActiveStep(-1);
          playZapSound();
          setReversingLog(
            (prev) =>
              prev +
              `[0x004011ad]: Invalid or non-fallthrough opcode [${patchedOpcode}].\n` +
              `[!] SIGILL: Illegal instruction. Use standard x86 NOP NOP opcode (90 90).`
          );
        }
      }

      step++;
      if (step > 4) {
        clearInterval(interval);
        setExecuting(false);
      }
    }, 450);
  };

  const handleTestBufferExploit = () => {
    const offset = parseInt(paddingLength, 10);
    const rip = targetRip.trim().toLowerCase();

    if (isNaN(offset) || offset < 0) {
      setGdbOutput('[-] Error: Please enter a valid byte count for padding offset.');
      playZapSound();
      return;
    }

    if (!rip) {
      setGdbOutput('[-] Error: Target return address (Saved RIP) cannot be empty.');
      playZapSound();
      return;
    }

    playHackingBeep(1100);
    setGdbOutput('Starting program: ./vuln_server\nInjecting crafted buffer in gdb-peda...');

    setTimeout(() => {
      const isRipWin = rip === '0x00401155' || rip === '0x401155' || rip === '0x55';

      if (offset >= 24 && isRipWin) {
        setGdbOutput(
          `[+] Injected ${offset} bytes padding ('A'*${offset}) + return address (${targetRip})\n` +
          `[+] [0x7fffffffe018]: Overwritten Saved RIP -> 0x00401155\n` +
          `[+] Control flow hijacked! Execution successfully redirected to win()!\n` +
          `[+] Executing win(): Dumping confidential flag from root vault...\n` +
          `[+] FLAG CAPTURED: ${BUFFER_OVERFLOW_FLAG}`
        );
        playClickSound(1000);
      } else if (offset < 24) {
        setGdbOutput(
          `[-] Injected ${offset} bytes.\n` +
          `[-] Stack frame: buffer (16 bytes) + Saved RBP (8 bytes) = 24 bytes required.\n` +
          `[-] Stack not saturated. Program exited normally with code 0.`
        );
        playZapSound();
      } else {
        setGdbOutput(
          `[!] Program received signal SIGSEGV, Segmentation fault.\n` +
          `[!] 0x00000000${targetRip.replace('0x', '')} in ?? ()\n` +
          `[!] Invalid memory reference. Target win() function address is 0x00401155.`
        );
        playZapSound();
      }
    }, 600);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFlag.trim()) return;
    const resPatch = ctfEngine.submitFlag('rev-anti-debug-patch', manualFlag);
    const resBuffer = ctfEngine.submitFlag('pwn-stack-matrix-buffer', manualFlag);

    if (resPatch.success || resPatch.duplicate) {
      setFlagFeedback({ success: true, text: resPatch.message });
      playBreachFanfare();
    } else if (resBuffer.success || resBuffer.duplicate) {
      setFlagFeedback({ success: true, text: resBuffer.message });
      playBreachFanfare();
    } else {
      setFlagFeedback({ success: false, text: resPatch.message });
      playZapSound();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b10] font-mono text-xs select-text overflow-hidden">
      {/* Ghidra / GDB Navigation */}
      <div className="flex items-center gap-1 bg-[#0f172a] border-b border-[#1e293b] px-3 pt-2">
        <span className="text-[#38bdf8] font-bold mr-3 flex items-center gap-1">
          <Binary size={13} />
          <span>Ghidra / GDB Decompiler v11.0</span>
        </span>
        {[
          { id: 'reversing', label: 'Disassembly & Hex Patching (sentinel_daemon)' },
          { id: 'buffer', label: 'GDB Stack Frame Analyzer (vuln_server)' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              playClickSound(850);
              setActiveTab(t.id);
            }}
            className={`px-3 py-1.5 rounded-t text-xs font-mono transition border-t border-x ${
              activeTab === t.id
                ? 'bg-[#070b10] text-[#38bdf8] border-[#38bdf8]/40 font-bold'
                : 'bg-[#1e293b]/50 text-slate-400 border-transparent hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'reversing' && (
        <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2 bg-[#04070a]">
          {/* Disassembly Table */}
          <div className="flex-1 border border-[#1e293b] rounded bg-[#090e15] overflow-y-auto">
            <table className="cos-table text-[11px]">
              <thead>
                <tr>
                  <th className="w-28">Address</th>
                  <th className="w-28">Opcode</th>
                  <th className="w-48">Instruction</th>
                  <th>Analysis Notes</th>
                </tr>
              </thead>
              <tbody>
                {ASM_INSTRUCTIONS.map((inst, idx) => {
                  const isActive = activeStep === idx;
                  const isTarget = inst.isTarget;
                  return (
                    <tr
                      key={inst.addr}
                      className={
                        isActive
                          ? 'is-selected'
                          : isTarget
                          ? 'bg-amber-950/20 text-amber-300 font-semibold'
                          : ''
                      }
                    >
                      <td className="font-mono text-slate-500">{inst.addr}</td>
                      <td className="font-mono text-cyan-300">
                        {isTarget ? (
                          <span className="underline font-bold text-amber-400">
                            {patchedOpcode}
                          </span>
                        ) : (
                          inst.hex
                        )}
                      </td>
                      <td className="font-bold">
                        {isTarget && (patchedOpcode === '90 90' || patchedOpcode === '9090')
                          ? 'nop nop'
                          : inst.asm}
                      </td>
                      <td className="text-slate-400 text-[10px]">{inst.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Hex Patcher Controls */}
          <div className="p-2.5 bg-[#0a0f16] border border-[#1e293b] rounded flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <span className="text-[10px] text-slate-400 uppercase">PATCH OPCODE AT 0x004011ad:</span>
              <input
                type="text"
                value={patchInput}
                onChange={(e) => setPatchInput(e.target.value)}
                placeholder="e.g. 90 90 (NOP NOP)"
                className="cos-input py-1 text-xs w-44"
              />
              <button
                type="button"
                onClick={handleApplyPatch}
                className="cos-btn py-1 text-xs"
              >
                APPLY PATCH
              </button>
            </div>
            <button
              type="button"
              onClick={handleRunReversing}
              disabled={executing}
              className="cos-btn cos-btn-primary py-1 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <Play size={12} />
              <span>{executing ? 'STEPPING IN GDB...' : 'RUN ./sentinel_daemon'}</span>
            </button>
          </div>

          {/* Stepper Log */}
          <div className="p-2 bg-black border border-[#1e293b] rounded h-28 overflow-y-auto font-mono text-xs select-all text-emerald-300">
            {reversingLog}
          </div>
        </div>
      )}

      {activeTab === 'buffer' && (
        <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2 bg-[#04070a]">
          {/* C Source & Stack Layout Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1 overflow-hidden">
            <div className="p-2 bg-[#080d14] border border-[#1e293b] rounded flex flex-col">
              <span className="text-[10px] text-cyan-400 uppercase mb-1 flex items-center gap-1">
                <Code2 size={11} />
                <span>VULNERABLE C SOURCE (vuln.c):</span>
              </span>
              <pre className="text-slate-300 text-[11px] overflow-y-auto leading-relaxed flex-1">
{`void win() {
    print_flag_vault(); // Address: 0x00401155
}

void vuln() {
    char buffer[16]; // 16 bytes buffer
    gets(buffer);    // Unchecked stack write!
}`}
              </pre>
            </div>

            <div className="p-2 bg-[#080d14] border border-[#1e293b] rounded flex flex-col">
              <span className="text-[10px] text-amber-400 uppercase mb-1 flex items-center gap-1">
                <Cpu size={11} />
                <span>STACK ARCHITECTURE (Offset Calculation):</span>
              </span>
              <div className="grid grid-cols-3 gap-1 text-center text-xs mt-1 mb-2">
                <div className="p-1.5 bg-blue-950/40 border border-blue-600/50 rounded">
                  <span className="block font-bold text-blue-300">buffer[16]</span>
                  <span className="text-[9.5px] text-slate-400">16 Bytes</span>
                </div>
                <div className="p-1.5 bg-purple-950/40 border border-purple-600/50 rounded">
                  <span className="block font-bold text-purple-300">Saved RBP</span>
                  <span className="text-[9.5px] text-slate-400">8 Bytes</span>
                </div>
                <div className="p-1.5 bg-rose-950/40 border border-rose-600/50 rounded">
                  <span className="block font-bold text-rose-300">Saved RIP</span>
                  <span className="text-[9.5px] text-slate-400">Target Address</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 text-center">
                Offset to RIP = 16 (buffer) + 8 (RBP) = <strong>24 Bytes</strong>
              </span>
            </div>
          </div>

          {/* Buffer Exploit Controls */}
          <div className="p-2.5 bg-[#0a0f16] border border-[#1e293b] rounded flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <input
                type="number"
                value={paddingLength}
                onChange={(e) => setPaddingLength(e.target.value)}
                placeholder="Padding bytes (e.g. 24)"
                className="cos-input py-1 text-xs w-36"
              />
              <input
                type="text"
                value={targetRip}
                onChange={(e) => setTargetRip(e.target.value)}
                placeholder="Target RIP (0x00401155)"
                className="cos-input py-1 text-xs w-44"
              />
              <button
                type="button"
                onClick={handleTestBufferExploit}
                className="cos-btn cos-btn-primary py-1 px-4 text-xs font-bold"
              >
                TEST EXPLOIT
              </button>
            </div>
          </div>

          {/* GDB Output */}
          <pre className="p-2 bg-black border border-[#1e293b] rounded h-28 overflow-y-auto font-mono text-xs select-all text-emerald-300 whitespace-pre-wrap leading-relaxed">
            {gdbOutput || 'GDB Session waiting for exploit execution...'}
          </pre>
        </div>
      )}

      {/* Flag Submission Bar */}
      <div className="p-2.5 bg-[#0a0f16] border-t border-[#1e293b] flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 uppercase">SUBMIT REVERSE / PWN FLAG:</span>
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{binary_patch_... or FLAG{buffer_overflow_...}"
            className="cos-input py-1 text-xs w-64"
          />
          <button
            type="submit"
            className="cos-btn cos-btn-success py-1 text-xs font-bold"
          >
            SUBMIT FLAG
          </button>
        </form>
      </div>

      {flagFeedback && (
        <div className={`p-2 text-xs font-mono border-t ${flagFeedback.success ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-rose-950/80 border-rose-500 text-rose-300'}`}>
          {flagFeedback.text}
        </div>
      )}
    </div>
  );
}
