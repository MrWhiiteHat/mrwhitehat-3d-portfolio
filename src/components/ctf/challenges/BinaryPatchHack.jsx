import React, { useState } from 'react';
import { Binary, CheckCircle2, Code2, Play, RefreshCw, ShieldAlert, Zap } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'rev-anti-debug-patch';
const REVEALED_FLAG = 'FLAG{binary_patch_nop_anti_debug_bypassed}';

const ASM_INSTRUCTIONS = [
  { addr: '0x004011a0', hex: '48 83 ec 28', asm: 'sub    rsp, 0x28', note: 'Allocate stack frame' },
  { addr: '0x004011a4', hex: 'e8 87 fe ff', asm: 'call   <ptrace@plt>', note: 'Anti-debug PTRACE_TRACEME check' },
  { addr: '0x004011a9', hex: '48 83 f8 ff', asm: 'cmp    rax, -0x1', note: 'Detect active debugger' },
  { addr: '0x004011ad', hex: '74 12', asm: 'je     0x004011c1 <tamper_exit>', isTarget: true, note: 'Conditional jump to termination' },
  { addr: '0x004011af', hex: '48 8d 3d 4e', asm: 'lea    rdi, [str_clearance]', note: 'Load "CLEARANCE GRANTED"' },
  { addr: '0x004011b6', hex: 'e8 95 fe ff', asm: 'call   <grant_root_flag>', note: 'Dispense CTF Root Flag' },
  { addr: '0x004011c1', hex: 'e8 a0 fe ff', asm: 'call   <tamper_exit>', note: 'Tamper detected exit routine' },
];

export default function BinaryPatchHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [patchedOpcode, setPatchedOpcode] = useState('74 12'); // '74 12' (original) or '90 90' (NOP NOP) or 'eb 12' (JMP)
  const [executing, setExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [executionLog, setExecutionLog] = useState('');
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleApplyPatch = (opcode) => {
    if (solved || executing) return;
    playClickSound(850);
    setPatchedOpcode(opcode);
    setExecutionLog(`Patched opcode at 0x004011ad to [${opcode}]. Ready for binary execution.`);
  };

  const handleRunExecution = () => {
    if (solved || executing) return;
    setExecuting(true);
    setExecutionLog('Spawning sandboxed process ./sentinel_daemon ...\nDebugger attached via ptrace.');
    playHackingBeep(1000);

    let step = 0;
    const interval = setInterval(() => {
      setActiveStep(step);
      playHackingBeep(1100 + step * 120);

      if (step === 2) {
        setExecutionLog((prev) => prev + '\n[rax = -1] -> Debugger detected by anti-debug routine.');
      }

      if (step === 3) {
        if (patchedOpcode === '90 90') {
          setExecutionLog((prev) => prev + '\n[0x004011ad] -> Opcode 90 90 (NOP NOP): No jump taken! Fallthrough to flag dispenser.');
        } else if (patchedOpcode === '74 12') {
          clearInterval(interval);
          setExecuting(false);
          setActiveStep(-1);
          playZapSound();
          setExecutionLog((prev) => prev + '\n[0x004011ad] -> je taken: PROCESS TERMINATED BY TAMPER EXIT!\nPatch instruction with NOP NOP to bypass.');
          return;
        }
      }

      if (step === 5) {
        clearInterval(interval);
        setExecuting(false);
        setSolved(true);
        ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
        playBreachFanfare();
        setExecutionLog((prev) => prev + `\n[SUCCESS] grant_root_flag executed! Flag: ${REVEALED_FLAG}`);
        setTimeout(() => {
          onSolved?.();
        }, 1500);
      }

      step++;
    }, 450);
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
    <div className="hack-puzzle-container binary-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Binary size={14} className="hack-icon-pulse text-amber-400" />
          <span>CTF MISSION // REVERSE ENGINEERING: BINARY PATCHING & ANTI-DEBUG</span>
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
          Decompile the Sentinel defense daemon. Overwrite the anti-debugging conditional jump (`74 12` / `JE`) at address `0x004011ad` with `90 90` (`NOP NOP`) to force execution into `grant_root_flag`.
        </p>
      </div>

      {/* Disassembly View */}
      <div className="p-3 bg-black/80 border border-slate-700/60 rounded font-mono text-[11px] overflow-x-auto space-y-1">
        {ASM_INSTRUCTIONS.map((inst, idx) => {
          const isCurrentActive = activeStep === idx;
          const isTargetLine = inst.isTarget;

          return (
            <div
              key={inst.addr}
              className={`flex items-center gap-3 px-2 py-1 rounded transition ${
                isCurrentActive
                  ? 'bg-cyan-950/80 text-cyan-200 border-l-2 border-cyan-400'
                  : isTargetLine
                  ? 'bg-amber-950/30 text-amber-300'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-slate-500 w-20">{inst.addr}</span>
              <span className="text-slate-300 w-24">
                {isTargetLine ? patchedOpcode : inst.hex}
              </span>
              <span className="font-bold flex-1 text-slate-100">
                {isTargetLine
                  ? patchedOpcode === '90 90'
                    ? 'nop    nop (PATCHED)'
                    : inst.asm
                  : inst.asm}
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                ; {inst.note}
              </span>
            </div>
          );
        })}
      </div>

      {/* Opcode Patch Selector */}
      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span>PATCH 0x004011ad:</span>
          <button
            type="button"
            className={`px-2 py-1 rounded text-xs font-mono font-bold transition border ${
              patchedOpcode === '90 90'
                ? 'bg-emerald-600 text-black border-emerald-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500'
            }`}
            onClick={() => handleApplyPatch('90 90')}
            disabled={solved || executing}
          >
            NOP NOP (0x90 0x90) ✔
          </button>
          <button
            type="button"
            className={`px-2 py-1 rounded text-xs font-mono transition border ${
              patchedOpcode === '74 12'
                ? 'bg-rose-900/60 text-rose-300 border-rose-500'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            onClick={() => handleApplyPatch('74 12')}
            disabled={solved || executing}
          >
            JE (0x74 0x12) [Original]
          </button>
        </div>

        <button
          type="button"
          onClick={handleRunExecution}
          disabled={solved || executing}
          className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-3 py-1.5 rounded text-xs transition"
        >
          <Play size={13} />
          <span>{executing ? 'STEPPING IN DEBUGGER...' : 'EXECUTE BINARY'}</span>
        </button>
      </div>

      {/* Execution Console Output */}
      {executionLog && (
        <div className="mt-2 p-2 bg-black border border-cyan-500/20 rounded font-mono text-[10px] text-cyan-300 whitespace-pre-wrap max-h-24 overflow-y-auto">
          {executionLog}
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
            <span className="font-bold text-emerald-300">ANTI-DEBUG JUMP PATCHED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+400 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Select "NOP NOP" to patch out conditional branch at 0x004011ad, then click "EXECUTE BINARY"</span>
        </div>
      )}
    </div>
  );
}
