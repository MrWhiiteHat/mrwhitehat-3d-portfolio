import React, { useState } from 'react';
import {
  Binary,
  Play,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Terminal,
  Code2,
  HelpCircle,
  Sparkles,
  Copy,
  Zap,
  StepForward,
  Layers,
} from 'lucide-react';
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

const DEFAULT_GDB_OUTPUT =
  'gdb-peda$ file ./vuln_server\n' +
  'Reading symbols from ./vuln_server... done (ELF 64-bit LSB executable).\n' +
  'gdb-peda$ info functions\n' +
  'All defined functions in ./vuln_server:\n' +
  '  0x00401130  main(int, char**)\n' +
  '  0x00401140  vuln()        // Reads stdin into 16-byte stack buffer via gets()\n' +
  '  0x00401155  win()         // Target secret routine: dumps root flag vault\n' +
  'gdb-peda$ checksec\n' +
  '  CANARY: Disabled  |  FORTIFY: Disabled  |  NX: Enabled  |  PIE: Disabled\n' +
  '--------------------------------------------------------------------------------\n' +
  'EXPLOIT INSTRUCTIONS:\n' +
  '1. Padding Length: Enter 24 (16 bytes buffer + 8 bytes Saved RBP)\n' +
  '2. Target Address: Enter 0x00401155 (or type "win")\n' +
  '3. Click [RUN EXPLOIT IN GDB] to hijack control flow to win()!';

export default function GhidraGdbApp({ onOpenStation }) {
  const [activeTab, setActiveTab] = useState('reversing'); // 'reversing' | 'buffer'
  const [showHints, setShowHints] = useState(true);

  // Reversing State
  const [patchedOpcode, setPatchedOpcode] = useState('74 12');
  const [patchInput, setPatchInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [reversingLog, setReversingLog] = useState('Disassembly loaded: ./sentinel_daemon (x86_64 ELF).\nTarget conditional jump located at 0x004011ad: [74 12].');

  // Live Register State
  const [registers, setRegisters] = useState({
    rax: '0x0000000000000000',
    rbx: '0x00007fffffffe400',
    rcx: '0x0000000000000000',
    rdx: '0x00007fffffffe3f0',
    rsi: '0x0000000000000001',
    rdi: '0x00007fffffffe3c0',
    rbp: '0x00007fffffffe3d0',
    rsp: '0x00007fffffffe3a8',
    rip: '0x00000000004011a0',
  });

  // Buffer Overflow State
  const [paddingLength, setPaddingLength] = useState('24');
  const [targetRip, setTargetRip] = useState('0x00401155');
  const [gdbOutput, setGdbOutput] = useState(DEFAULT_GDB_OUTPUT);

  // Flag Submissions
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleApplyPatch = (custom) => {
    const code = (custom || patchInput).trim();
    if (!code) return;
    setPatchedOpcode(code);
    setPatchInput('');
    playClickSound(1000);
    setReversingLog(
      `[PATCH] Modified address 0x004011ad: 74 12 -> [${code}].\n` +
      `Byte modification committed to memory image.\n` +
      `Click 'Run Patched Binary' or 'Step' to simulate execution.`
    );
  };

  const handleStepReversing = () => {
    const nextStep = activeStep < 0 ? 0 : (activeStep + 1) % ASM_INSTRUCTIONS.length;
    setActiveStep(nextStep);
    playClickSound(1150);

    const curInstr = ASM_INSTRUCTIONS[nextStep];
    setRegisters((prev) => {
      const nextRegs = { ...prev, rip: curInstr.addr };
      if (curInstr.addr === '0x004011a4') {
        nextRegs.rax = '0xffffffffffffffff'; // ptrace returns -1 in debugged process
      } else if (curInstr.addr === '0x004011af') {
        nextRegs.rax = '0x0000000000000000';
        nextRegs.rdi = '0x0000000000402010';
      }
      return nextRegs;
    });

    if (nextStep === 3) {
      if (patchedOpcode === '90 90') {
        setReversingLog((prev) => prev + `\n[STEP 0x004011ad]: 90 90 (NOP NOP) - jump bypassed, continuing into win flow.`);
      } else {
        setReversingLog((prev) => prev + `\n[STEP 0x004011ad]: 74 12 (JE) taken! Process routed to tamper_kill.`);
        playZapSound();
      }
    }
  };

  const handleRunReversing = () => {
    if (executing) return;
    setExecuting(true);
    setActiveStep(0);
    playHackingBeep(1000);
    setReversingLog('Executing ./sentinel_daemon in sandbox...\n[0x004011a0] sub rsp, 0x28\n');

    let step = 1;
    const interval = setInterval(() => {
      setActiveStep(step);
      playClickSound(1100 + step * 50);

      if (step < ASM_INSTRUCTIONS.length) {
        setRegisters((prev) => ({
          ...prev,
          rip: ASM_INSTRUCTIONS[step].addr,
          rax: step >= 2 ? '0xffffffffffffffff' : prev.rax,
        }));
      }

      if (step === 3) {
        // At conditional jump
        if (patchedOpcode === '90 90') {
          setRegisters((prev) => ({ ...prev, rip: '0x004011af', rax: '0x0000000000000000' }));
          setReversingLog(
            (prev) =>
              prev +
              `[0x004011ad]: 90 90 (NOP NOP) executed! Anti-debug jump bypassed.\n` +
              `[0x004011af]: Executing main logic: lea rdi, [str_clearance]\n` +
              `[0x004011b6]: call <decrypt_vault_flag>\n` +
              `[+] SUCCESS: FLAG CAPTURED: ${BINARY_PATCH_FLAG}\n`
          );
          playBreachFanfare();
        } else {
          setRegisters((prev) => ({ ...prev, rip: '0x004011c1' }));
          setReversingLog(
            (prev) =>
              prev +
              `[0x004011ad]: ${patchedOpcode} executed. je taken to <tamper_kill>!\n` +
              `[!] Tamper detection triggered. Program terminated.\n` +
              `[!] Hint: Patch opcode to standard x86 NOP NOP: '90 90'`
          );
          playZapSound();
        }
      }

      step++;
      if (step > 4) {
        clearInterval(interval);
        setExecuting(false);
      }
    }, 380);
  };

  const handleTestBufferExploit = () => {
    const offset = parseInt(paddingLength, 10);
    const ripRaw = targetRip.trim();
    const ripClean = ripRaw.toLowerCase();

    if (isNaN(offset) || offset < 0) {
      setGdbOutput('[-] GDB Error: Please enter a valid number of padding bytes (e.g. 24).');
      playZapSound();
      return;
    }

    if (!ripClean) {
      setGdbOutput('[-] GDB Error: Target return address (Saved RIP) cannot be empty. Enter 0x00401155 or "win".');
      playZapSound();
      return;
    }

    playHackingBeep(1100);
    setGdbOutput('Starting program: ./vuln_server in GDB-PEDA...\nInjecting crafted buffer...');

    setTimeout(() => {
      const isRipWin =
        ripClean === '0x00401155' ||
        ripClean === '0x401155' ||
        ripClean === '401155' ||
        ripClean === '0x55' ||
        ripClean.startsWith('win') ||
        ripClean.includes('win') ||
        ripClean.includes('401155');

      const resolvedAddr = ripClean.includes('win') || ripClean === '0x55' ? '0x00401155' : ripRaw;

      if (offset >= 24 && isRipWin) {
        setRegisters({
          rax: '0x0000000000000000',
          rbx: '0x0000000000000000',
          rcx: '0x00007fffffffe390',
          rdx: '0x0000000000000020',
          rsi: '0x00007fffffffe3a0',
          rdi: '0x0000000000000001',
          rbp: '0x4141414141414141', // Smashed!
          rsp: '0x00007fffffffe3c0',
          rip: '0x0000000000401155', // Hijacked to win()!
        });

        setGdbOutput(
          `[+] Exploit payload generated: ${offset} bytes padding ('A'*${offset}) + return address (${resolvedAddr})\n` +
          `[----------------------------------registers-----------------------------------]\n` +
          `RAX: 0x0000000000000000\n` +
          `RBX: 0x0000000000000000\n` +
          `RBP: 0x4141414141414141 ('AAAAAAAA') [SMASHED]\n` +
          `RSP: 0x00007fffffffe3c0 --> 0x0000000000000000\n` +
          `RIP: 0x0000000000401155 (<win>): push rbp\n` +
          `[------------------------------------code--------------------------------------]\n` +
          `=> 0x00401155 <win>:       push   rbp\n` +
          `   0x00401156 <win+1>:     mov    rbp, rsp\n` +
          `   0x00401159 <win+4>:     lea    rdi, [rip+0xeb4] # "FLAG{buffer_overflow_eip_overwritten_0x55}"\n` +
          `   0x00401160 <win+11>:    call   puts@plt\n` +
          `[------------------------------------------------------------------------------]\n` +
          `Stopped reason: RET executed with smashed RIP\n` +
          `[+] SHELLCODE / TARGET ROUTINE EXECUTED!\n` +
          `[+] FLAG: ${BUFFER_OVERFLOW_FLAG}\n`
        );
        playBreachFanfare();
      } else {
        const segAddr = offset > 24 ? '0x4141414141414141' : '0x000000000040114a';
        setRegisters((prev) => ({
          ...prev,
          rbp: offset >= 24 ? '0x4141414141414141' : prev.rbp,
          rip: segAddr,
        }));
        setGdbOutput(
          `[-] Exploit payload failed.\n` +
          `Padding: ${offset} bytes (Expected: >= 24 bytes = 16B buffer + 8B RBP).\n` +
          `Target RIP: "${ripRaw}" (Expected: 0x00401155 or "win").\n` +
          `Program received signal SIGSEGV, Segmentation fault.\n` +
          `RIP: ${segAddr} (cannot access memory at address ${segAddr}).\n` +
          `Hint: Buffer is 16 bytes. Saved RBP is 8 bytes. Set Padding = 24 and Target = 0x00401155.`
        );
        playZapSound();
      }
    }, 300);
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    const clean = manualFlag.trim();
    if (!clean) return;

    let res = ctfEngine.submitFlag('rev-anti-debug-patch', clean);
    let targetStationId = 'secret_vault';
    let targetStationName = 'BLACK HAT VAULT';

    if (!res.success) {
      res = ctfEngine.submitFlag('pwn-stack-matrix-buffer', clean);
      targetStationId = 'skills';
      targetStationName = 'SKILLS ARCHIVE';
    }

    if (res.success || res.duplicate) {
      const stationId = res.stationId || targetStationId;
      setFlagFeedback({
        success: true,
        text: res.message,
        stationId,
        stationName: targetStationName,
      });
      playBreachFanfare();
      setTimeout(() => {
        onOpenStation?.(stationId);
      }, 1800);
    } else {
      setFlagFeedback({ success: false, text: 'Verification Failed: Flag does not match active challenge hashes.' });
      playZapSound();
    }
  };

  const parsedPad = parseInt(paddingLength, 10) || 0;

  return (
    <div className="cos-app-container select-text">
      {/* 1. Header Toolbar & Tab Switcher */}
      <div className="cos-app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="cos-app-title">
            <Binary size={15} style={{ color: '#a855f7' }} />
            <span>GHIDRA & GDB // REVERSE ENGINEERING & PWN</span>
          </div>

          <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
            <button
              type="button"
              className={`cos-btn ${activeTab === 'reversing' ? 'cos-btn-primary' : ''}`}
              onClick={() => {
                playClickSound(900);
                setActiveTab('reversing');
              }}
            >
              <Code2 size={11} />
              <span>Ghidra Opcode Patcher</span>
            </button>
            <button
              type="button"
              className={`cos-btn ${activeTab === 'buffer' ? 'cos-btn-primary' : ''}`}
              onClick={() => {
                playClickSound(900);
                setActiveTab('buffer');
              }}
            >
              <Cpu size={11} />
              <span>GDB Stack Buffer Overflow</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`cos-hint-toggle ${showHints ? 'is-active' : ''}`}
            onClick={() => setShowHints((prev) => !prev)}
            title="Toggle Reverse Engineering & Exploit Guide"
          >
            <HelpCircle size={13} />
            <span>{showHints ? 'HIDE HINTS' : '💡 HOW TO SOLVE'}</span>
          </button>
        </div>
      </div>

      {/* Live Registers Bar */}
      <div style={{ background: '#070a12', borderBottom: '1px solid #1e293b', padding: '5px 10px', display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '10.5px', fontFamily: 'monospace' }}>
        <span style={{ color: '#64748b', fontWeight: 700 }}>REGISTERS:</span>
        <span style={{ color: registers.rip.includes('401155') || registers.rip.includes('4011af') ? '#34d399' : '#38bdf8' }}>
          RIP: <strong style={{ color: '#fff' }}>{registers.rip}</strong>
        </span>
        <span style={{ color: registers.rbp.includes('414141') ? '#fb923c' : '#94a3b8' }}>
          RBP: <strong style={{ color: registers.rbp.includes('414141') ? '#fb923c' : '#cbd5e1' }}>{registers.rbp}</strong>
        </span>
        <span style={{ color: '#94a3b8' }}>
          RSP: <strong style={{ color: '#cbd5e1' }}>{registers.rsp}</strong>
        </span>
        <span style={{ color: registers.rax.includes('ffff') ? '#f87171' : '#94a3b8' }}>
          RAX: <strong style={{ color: registers.rax.includes('ffff') ? '#f87171' : '#cbd5e1' }}>{registers.rax}</strong>
        </span>
        <span style={{ color: '#94a3b8' }}>
          RDI: <strong style={{ color: '#cbd5e1' }}>{registers.rdi}</strong>
        </span>
      </div>

      {/* 2. Interactive Hint & Walkthrough Drawer */}
      {showHints && (
        <div className="cos-hint-drawer">
          <div className="cos-hint-header-bar">
            <div className="cos-hint-title">
              <Sparkles size={14} />
              <span>EXPLOIT GUIDE // {activeTab === 'reversing' ? 'BINARY PATCHING & ANTI-DEBUG' : 'STACK BUFFER OVERFLOW & RIP HIJACK'}</span>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>
              {activeTab === 'reversing' ? 'rev-anti-debug-patch · Hard · +300 PTS' : 'pwn-stack-matrix-buffer · Medium · +200 PTS'}
            </span>
          </div>

          <div className="cos-hint-grid">
            {activeTab === 'reversing' ? (
              <>
                <div className="cos-hint-card">
                  <h4>🎯 Objective</h4>
                  <p>Binary <code>./sentinel_daemon</code> detects if a debugger is attached via <code>ptrace()</code> and jumps to <code>tamper_kill</code>.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🔍 Reversing & Patching Guide</h4>
                  <p>At address <code>0x004011ad</code>, opcode <code>74 12</code> is a conditional jump (<code>je &lt;tamper_kill&gt;</code>). In x86, replacing it with <strong style={{ color: '#34d399' }}>90 90 (NOP NOP)</strong> neutralizes the jump.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🛠️ Step-by-Step Walkthrough</h4>
                  <p>1. In the Patch Opcode input below, type <code>90 90</code> and click <strong>Apply Patch</strong>.</p>
                  <p>2. Click <strong>[RUN PATCHED BINARY]</strong> to bypass termination and reveal the root flag!</p>
                </div>
              </>
            ) : (
              <>
                <div className="cos-hint-card">
                  <h4>🎯 Objective</h4>
                  <p>Program <code>vuln_server</code> reads input into a 16-byte buffer via unsafe <code>gets()</code>. Overflow the buffer and overwrite Saved RIP with the address of <code>win()</code>.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🔍 Stack Calculation Guide</h4>
                  <p>• <strong>Buffer Size:</strong> 16 bytes.<br />
                  • <strong>Saved Frame Pointer (RBP):</strong> 8 bytes.<br />
                  • <strong>Total Padding Required:</strong> 16 + 8 = <strong style={{ color: '#fbbf24' }}>24 bytes</strong>.<br />
                  • <strong>Target Function:</strong> <code>win()</code> is at <strong style={{ color: '#38bdf8' }}>0x00401155</strong>.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🛠️ Step-by-Step Walkthrough</h4>
                  <p>1. Enter Padding Length = <code>24</code>.</p>
                  <p>2. Enter Target Address = <code>0x00401155</code> (or <code>win</code>).</p>
                  <p>3. Click <strong>[RUN EXPLOIT IN GDB]</strong> to hijack execution to <code>win()</code>!</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Workspace */}
      <div className="cos-app-body">
        {activeTab === 'reversing' ? (
          /* Reversing Tab */
          <div className="cos-split-horizontal">
            {/* Disassembly Pane */}
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>X86_64 DISASSEMBLY (Ghidra Decompiler)</span>
                <span className="cos-badge cos-badge-cyan">ELF64 · PIE Disabled</span>
              </div>
              <div className="cos-panel-body" style={{ padding: '6px' }}>
                <div className="cos-table-container" style={{ border: 'none' }}>
                  <table className="cos-table">
                    <thead>
                      <tr>
                        <th style={{ width: '90px' }}>Address</th>
                        <th style={{ width: '90px' }}>Hex Opcodes</th>
                        <th>Instruction (Intel syntax)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ASM_INSTRUCTIONS.map((instr, idx) => {
                        const isCurrent = activeStep === idx;
                        const isPatchedTarget = instr.isTarget;
                        const displayHex = isPatchedTarget ? patchedOpcode : instr.hex;
                        const displayAsm = isPatchedTarget && patchedOpcode === '90 90' ? 'nop; nop' : instr.asm;

                        return (
                          <tr
                            key={idx}
                            style={{
                              background: isCurrent
                                ? 'rgba(56, 189, 248, 0.2)'
                                : isPatchedTarget
                                ? 'rgba(168, 85, 247, 0.15)'
                                : undefined,
                            }}
                          >
                            <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{instr.addr}</td>
                            <td style={{ fontFamily: 'monospace', color: isPatchedTarget ? '#a855f7' : '#38bdf8', fontWeight: isPatchedTarget ? 700 : 400 }}>
                              {displayHex}
                            </td>
                            <td>
                              <span style={{ color: isCurrent ? '#fff' : '#cbd5e1', fontWeight: isCurrent ? 700 : 400 }}>
                                {displayAsm}
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '8px' }}>
                                // {instr.note}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Patch Control Bar */}
                <div style={{ marginTop: 'auto', background: '#090e17', border: '1px solid #1e293b', borderRadius: '4px', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10.5px', color: '#a855f7', fontWeight: 700 }}>0x004011ad OP:</span>
                  <input
                    type="text"
                    className="cos-input"
                    style={{ width: '80px', textAlign: 'center', fontWeight: 700 }}
                    value={patchInput}
                    onChange={(e) => setPatchInput(e.target.value)}
                    placeholder="90 90"
                  />
                  <button
                    type="button"
                    className="cos-btn cos-btn-primary"
                    style={{ fontSize: '10px' }}
                    onClick={() => handleApplyPatch()}
                  >
                    Apply Patch
                  </button>
                  <button
                    type="button"
                    className="cos-btn"
                    style={{ fontSize: '10px' }}
                    onClick={() => handleApplyPatch('90 90')}
                  >
                    Preset: 90 90
                  </button>
                  <button
                    type="button"
                    className="cos-btn"
                    style={{ fontSize: '10px' }}
                    onClick={() => handleApplyPatch('74 12')}
                  >
                    Reset (74 12)
                  </button>
                  <button
                    type="button"
                    className="cos-btn"
                    style={{ fontSize: '10px', marginLeft: 'auto' }}
                    onClick={handleStepReversing}
                  >
                    <StepForward size={11} />
                    <span>Step [SI]</span>
                  </button>
                  <button
                    type="button"
                    className="cos-btn cos-btn-primary"
                    onClick={handleRunReversing}
                    disabled={executing}
                  >
                    <Play size={11} />
                    <span>{executing ? 'Executing...' : 'RUN PATCHED BINARY'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Execution Console */}
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>SANDBOX EXECUTION CONSOLE</span>
                {reversingLog.includes(BINARY_PATCH_FLAG) && (
                  <button
                    type="button"
                    className="cos-btn cos-btn-primary"
                    style={{ fontSize: '9.5px', padding: '1px 6px' }}
                    onClick={() => {
                      playClickSound(1000);
                      setManualFlag(BINARY_PATCH_FLAG);
                    }}
                  >
                    <Copy size={10} />
                    <span>Copy Flag</span>
                  </button>
                )}
              </div>
              <div className="cos-panel-body" style={{ padding: '6px' }}>
                <textarea
                  className={`cos-textarea ${reversingLog.includes(BINARY_PATCH_FLAG) ? 'cos-textarea-output' : ''}`}
                  readOnly
                  value={reversingLog}
                  style={{ color: reversingLog.includes(BINARY_PATCH_FLAG) ? '#34d399' : '#cbd5e1' }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Buffer Overflow Tab */
          <div className="cos-split-horizontal">
            {/* Stack Visualizer & Form */}
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>X86_64 STACK FRAME ARCHITECTURE (vuln_server)</span>
                <span className="cos-badge cos-badge-amber">OVERFLOW VISUALIZER</span>
              </div>
              <div className="cos-panel-body" style={{ gap: '8px' }}>
                {/* Visual Stack Layout Box with Dynamic Fill */}
                <div style={{ background: '#03060a', border: '1px solid #1e293b', borderRadius: '4px', padding: '10px' }}>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', marginBottom: '8px', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Memory Stack Frames (RSP ➔ RBP ➔ RIP):</span>
                    <span style={{ color: parsedPad >= 24 ? '#34d399' : '#fb923c' }}>
                      Payload: {parsedPad} / 24+ Bytes
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontFamily: 'monospace' }}>
                    {/* Buffer row */}
                    <div
                      style={{
                        background: parsedPad >= 16 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.1)',
                        border: `1px solid ${parsedPad >= 16 ? '#38bdf8' : '#0369a1'}`,
                        padding: '6px 10px',
                        borderRadius: '3px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>0x7fffffffe3a0: [ buffer[16] ]</span>
                      <strong style={{ color: '#38bdf8' }}>
                        {parsedPad >= 16 ? '16/16B FILLED (OVERFLOW!)' : `${parsedPad}/16 Bytes`}
                      </strong>
                    </div>

                    {/* Saved RBP row */}
                    <div
                      style={{
                        background: parsedPad >= 24 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.08)',
                        border: `1px solid ${parsedPad >= 24 ? '#fbbf24' : '#78350f'}`,
                        padding: '6px 10px',
                        borderRadius: '3px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>0x7fffffffe3b0: [ Saved RBP ]</span>
                      <strong style={{ color: '#fbbf24' }}>
                        {parsedPad >= 24 ? 'SMASHED (0x4141414141414141)' : 'Intact'}
                      </strong>
                    </div>

                    {/* Saved RIP row */}
                    <div
                      style={{
                        background: parsedPad >= 24 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.12)',
                        border: `1px solid ${parsedPad >= 24 ? '#34d399' : '#991b1b'}`,
                        padding: '6px 10px',
                        borderRadius: '3px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>0x7fffffffe3b8: [ Saved RIP ]</span>
                      <strong style={{ color: parsedPad >= 24 ? '#34d399' : '#f87171' }}>
                        {parsedPad >= 24 ? `OVERWRITTEN: ${targetRip || '0x00401155 <win>'}` : 'Original Return Addr'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Exploit Parameters */}
                <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginBottom: '2px', fontWeight: 700 }}>
                        Padding Length (Bytes):
                      </label>
                      <input
                        type="number"
                        className="cos-input"
                        style={{ width: '100%' }}
                        value={paddingLength}
                        onChange={(e) => setPaddingLength(e.target.value)}
                        placeholder="24"
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginBottom: '2px', fontWeight: 700 }}>
                        Target Address (Saved RIP):
                      </label>
                      <input
                        type="text"
                        className="cos-input"
                        style={{ width: '100%' }}
                        value={targetRip}
                        onChange={(e) => setTargetRip(e.target.value)}
                        placeholder="0x00401155"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="cos-btn"
                      style={{ fontSize: '10px' }}
                      onClick={() => {
                        setPaddingLength('24');
                        setTargetRip('0x00401155');
                      }}
                    >
                      Fill Exact: 24B + win()
                    </button>
                    <button
                      type="button"
                      className="cos-btn cos-btn-primary"
                      style={{ flex: 1, fontWeight: 700 }}
                      onClick={handleTestBufferExploit}
                    >
                      <Play size={11} />
                      <span>RUN EXPLOIT IN GDB</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GDB Output Console */}
            <div className="cos-panel">
              <div className="cos-panel-header">
                <span>GDB-PEDA EXECUTION LOG</span>
                {gdbOutput.includes(BUFFER_OVERFLOW_FLAG) && (
                  <button
                    type="button"
                    className="cos-btn cos-btn-primary"
                    style={{ fontSize: '9.5px', padding: '1px 6px' }}
                    onClick={() => {
                      playClickSound(1000);
                      setManualFlag(BUFFER_OVERFLOW_FLAG);
                    }}
                  >
                    <Copy size={10} />
                    <span>Copy Flag</span>
                  </button>
                )}
              </div>
              <div className="cos-panel-body" style={{ padding: '6px' }}>
                <textarea
                  className={`cos-textarea ${gdbOutput.includes(BUFFER_OVERFLOW_FLAG) ? 'cos-textarea-output' : ''}`}
                  readOnly
                  value={gdbOutput || 'GDB-PEDA ready.\nConfigure padding and target RIP, then click "RUN EXPLOIT IN GDB".'}
                  style={{ color: gdbOutput.includes(BUFFER_OVERFLOW_FLAG) ? '#34d399' : '#cbd5e1' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Flag Submitter Bar */}
      <div className="cos-flag-bar">
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>SUBMIT CAPTURED FLAG:</span>
        <input
          type="text"
          className="cos-flag-input"
          placeholder="FLAG{...}"
          value={manualFlag}
          onChange={(e) => setManualFlag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit(e)}
        />
        <button
          type="button"
          className="cos-flag-btn"
          onClick={handleManualSubmit}
        >
          SUBMIT FLAG
        </button>

        {flagFeedback && (
          <div className={`cos-flag-feedback ${flagFeedback.success ? 'is-success' : 'is-error'}`}>
            {flagFeedback.success ? <CheckCircle2 size={13} /> : <Zap size={13} />}
            <span>{flagFeedback.text}</span>
            {flagFeedback.success && flagFeedback.stationId && (
              <button
                type="button"
                className="cos-open-station-btn"
                onClick={() => onOpenStation?.(flagFeedback.stationId)}
                title="Open Unlocked 3D Station Information Dossier Now"
              >
                <span>🔓 VIEW {flagFeedback.stationName || 'STATION'} INFORMATION ➔</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
