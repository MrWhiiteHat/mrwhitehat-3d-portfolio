import React, { useState } from 'react';
import { Binary, CheckCircle2, Code2, Play, RefreshCw, ShieldAlert, Zap, KeyRound, Terminal } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'rev-anti-debug-patch';
const REVEALED_FLAG = 'FLAG{binary_patch_nop_anti_debug_bypassed}';

const ASM_INSTRUCTIONS = [
  { addr: '0x004011a0', hex: '48 83 ec 28', asm: 'sub rsp, 0x28', note: 'Allocate stack frame' },
  { addr: '0x004011a4', hex: 'e8 87 fe ff', asm: 'call <ptrace@plt>', note: 'Anti-debug PTRACE_TRACEME check' },
  { addr: '0x004011a9', hex: '48 83 f8 ff', asm: 'cmp rax, -0x1', note: 'Detect active debugger (rax == -1)' },
  { addr: '0x004011ad', hex: '74 12', asm: 'je 0x004011c1 <tamper_kill>', isTarget: true, note: 'Conditional jump to termination' },
  { addr: '0x004011af', hex: '48 8d 3d 4e', asm: 'lea rdi, [str_clearance]', note: 'Load "CLEARANCE GRANTED"' },
  { addr: '0x004011b6', hex: 'e8 95 fe ff', asm: 'call <decrypt_vault_flag>', note: 'Dispense CTF Root Flag' },
  { addr: '0x004011c1', hex: 'e8 a0 fe ff', asm: 'call <tamper_kill>', note: 'Tamper detected exit routine' },
];

export default function BinaryPatchHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  // Real CTF: starts with original unmodified opcode '74 12'
  const [patchedOpcode, setPatchedOpcode] = useState('74 12');
  const [customInput, setCustomInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [executionLog, setExecutionLog] = useState(
    'Disassembly loaded: ./sentinel_daemon (ELF 64-bit LSB executable).\nTarget address 0x004011ad contains anti-debug conditional jump [74 12].'
  );
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleApplyCustomPatch = () => {
    const clean = customInput.trim().toUpperCase();
    if (!clean) return;
    playClickSound(850);
    setPatchedOpcode(clean);
    setExecutionLog((prev) => prev + `\n[*] Memory patched at 0x004011ad: [74 12] ➔ [${clean}].`);
  };

  const handleRunExecution = () => {
    if (executing) return;
    setExecuting(true);
    setExecutionLog(
      '[*] Spawning sandboxed process ./sentinel_daemon ...\n[*] GDB debugger attached via ptrace.\n'
    );
    playHackingBeep(1000);

    let step = 0;
    const interval = setInterval(() => {
      setActiveStep(step);
      playHackingBeep(1100 + step * 100);

      if (step === 2) {
        setExecutionLog((prev) => prev + '[0x004011a9]: cmp rax, -1 ➔ rax = -1 (Debugger actively detected! ZF=1).\n');
      }

      if (step === 3) {
        if (patchedOpcode === '90 90' || patchedOpcode === '9090') {
          setExecutionLog(
            (prev) =>
              prev +
              '[0x004011ad]: Opcode 90 90 (NOP NOP) ➔ No jump taken! Fallthrough to 0x004011af.\n' +
              '[+] Anti-debug check neutralized! Executing decrypt_vault_flag()...\n' +
              `[+] ROOT CLEARANCE GRANTED: ${REVEALED_FLAG}\n`
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
          setExecutionLog(
            (prev) =>
              prev +
              '[0x004011ad]: Opcode 74 12 (JE) taken! Jumped to 0x004011c1 <tamper_kill>!\n' +
              '[!] PROCESS TERMINATED BY TAMPER EXIT (SIGKILL).\n' +
              '[*] Tip: Neutralize the conditional branch at 0x004011ad with x86 no-operation instructions so execution falls through.'
          );
        } else {
          clearInterval(interval);
          setExecuting(false);
          setActiveStep(-1);
          playZapSound();
          setExecutionLog(
            (prev) =>
              prev +
              `[0x004011ad]: Invalid or non-fallthrough opcode [${patchedOpcode}].\n` +
              `[!] SIGILL: Illegal instruction. Enter valid 2-byte x86 opcodes (e.g. no-operation instructions).`
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
    <div className="hack-puzzle-container binary-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Binary size={15} className="text-cyan-400 hack-icon-pulse" />
          <span>REVERSE ENGINEERING // BINARY PATCHING & ANTI-DEBUG BYPASS</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 400} PTS`}
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
          The <code>sentinel_daemon</code> executable calls <code>ptrace(PTRACE_TRACEME)</code> and jumps to <code>tamper_kill</code> if a debugger is detected. Inspect the disassembled instructions, patch the conditional jump at <code>0x004011ad</code> with NOP instructions (<code>90 90</code>), and step through execution to trigger the flag routine.
        </p>
      </div>

      {/* Disassembly View */}
      <div className="mt-2 border border-slate-800 rounded bg-slate-950 overflow-hidden font-mono text-xs">
        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
          <span>GHIDRA / IDA DISASSEMBLY (x86_64)</span>
          <span className="text-cyan-400">TARGET: 0x004011ad</span>
        </div>
        <div className="max-h-48 overflow-y-auto">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-black text-[10px] text-slate-500 border-b border-slate-800">
              <tr>
                <th className="p-1.5">ADDRESS</th>
                <th className="p-1.5">OPCODE BYTES</th>
                <th className="p-1.5">INSTRUCTION</th>
                <th className="p-1.5">ANALYSIS NOTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {ASM_INSTRUCTIONS.map((inst, idx) => {
                const isActive = activeStep === idx;
                const isTarget = inst.isTarget;
                return (
                  <tr
                    key={inst.addr}
                    className={`transition ${
                      isActive
                        ? 'bg-cyan-900/40 text-cyan-200 font-bold'
                        : isTarget
                        ? 'bg-amber-950/20 text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    <td className="p-1.5 font-mono text-slate-500">{inst.addr}</td>
                    <td className="p-1.5 font-mono text-cyan-400">
                      {isTarget ? (
                        <span className="font-bold underline text-amber-400">
                          {patchedOpcode}
                        </span>
                      ) : (
                        inst.hex
                      )}
                    </td>
                    <td className="p-1.5 font-bold">
                      {isTarget && (patchedOpcode === '90 90' || patchedOpcode === '9090')
                        ? 'nop nop'
                        : inst.asm}
                    </td>
                    <td className="p-1.5 text-slate-400 text-[10px]">{inst.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hex Patching Workbench */}
      <div className="p-3 bg-black border border-slate-800 rounded mt-2 font-mono text-xs space-y-2">
        <label className="text-[10px] text-cyan-400 uppercase block">
          HEX INSTRUCTION PATCHER (TARGET: 0x004011ad):
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Type replacement hex opcode (e.g. 2-byte hex)..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-amber-300 outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="button"
            onClick={handleApplyCustomPatch}
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-3 py-1.5 rounded text-xs transition"
          >
            APPLY PATCH
          </button>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
          <span>Active Opcode at 0x004011ad: <strong className="text-amber-400">{patchedOpcode}</strong></span>
          <span className="text-slate-400 text-[10px]">Replace JE jump with NOPs to fall through</span>
        </div>

        <button
          type="button"
          onClick={handleRunExecution}
          disabled={executing}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-black font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 transition font-mono mt-1"
        >
          <Play size={13} />
          <span>{executing ? 'STEPPING THROUGH EXECUTION...' : 'RUN SANDBOXED BINARY (./sentinel_daemon)'}</span>
        </button>
      </div>

      {/* Execution Debugger Console */}
      <div className="mt-2 p-2.5 bg-black border border-slate-800 rounded font-mono text-xs">
        <div className="text-slate-500 text-[10px] uppercase mb-1 flex items-center gap-1">
          <Terminal size={11} />
          <span>GDB EXECUTION STEPPER:</span>
        </div>
        <pre className="text-emerald-300 whitespace-pre-wrap select-all overflow-x-auto max-h-32 leading-relaxed">
          {executionLog}
        </pre>
      </div>

      {/* FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT BINARY REVERSE ENGINEERING FLAG:</span>
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
            <span className="font-bold text-emerald-300">BINARY PATCHED // ANTI-DEBUG BYPASSED</span>
            <span className="text-[10px] text-emerald-400/80">+400 CTF PTS Awarded · Ptrace Check Neutralized</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Inspect the jump instruction at 0x004011ad: patch with x86 no-operation bytes to allow execution to reach the flag routine.</span>
        </div>
      )}
    </div>
  );
}
