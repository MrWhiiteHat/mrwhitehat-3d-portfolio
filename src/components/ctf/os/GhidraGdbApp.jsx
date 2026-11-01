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

export default function GhidraGdbApp() {
  const [activeTab, setActiveTab] = useState('reversing'); // 'reversing' | 'buffer'
  const [showHints, setShowHints] = useState(true);

  // Reversing State
  const [patchedOpcode, setPatchedOpcode] = useState('74 12');
  const [patchInput, setPatchInput] = useState('');
  const [executing, setExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [reversingLog, setReversingLog] = useState('Disassembly loaded: ./sentinel_daemon (x86_64 ELF).\nTarget conditional jump located at 0x004011ad: [74 12].');

  // Buffer Overflow State
  const [paddingLength, setPaddingLength] = useState('24');
  const [targetRip, setTargetRip] = useState('0x00401155');
  const [gdbOutput, setGdbOutput] = useState('');

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
      `Click 'Run Patched Binary' to simulate execution.`
    );
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

      if (step === 3) {
        // At conditional jump
        if (patchedOpcode === '90 90') {
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
    }, 400);
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
    setGdbOutput('Starting program: ./vuln_server in GDB-PEDA...\nInjecting crafted buffer...');

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
        playBreachFanfare();
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
    }, 350);
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!manualFlag.trim()) return;
    const clean = manualFlag.trim();

    let res = ctfEngine.submitFlag('rev-anti-debug-patch', clean);
    if (!res.success && !res.duplicate) {
      res = ctfEngine.submitFlag('pwn-stack-matrix-buffer', clean);
    }

    if (res.success || res.duplicate) {
      setFlagFeedback({ success: true, text: res.message });
      playBreachFanfare();
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

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
              onClick={() => setActiveTab('reversing')}
            >
              <Code2 size={11} />
              <span>Ghidra Opcode Patcher</span>
            </button>
            <button
              type="button"
              className={`cos-btn ${activeTab === 'buffer' ? 'cos-btn-primary' : ''}`}
              onClick={() => setActiveTab('buffer')}
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
                  <h4>🔍 Reversing Clue</h4>
                  <p>At address <code>0x004011ad</code>, opcode <code>74 12</code> is a conditional jump (<code>je</code>). Replacing it with <strong style={{ color: '#34d399' }}>90 90 (NOP NOP)</strong> neutralizes the check!</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🛠️ How to Solve</h4>
                  <p>1. Click <strong style={{ color: '#38bdf8' }}>[Patch to 90 90 (NOP NOP)]</strong>.</p>
                  <p>2. Click <strong style={{ color: '#34d399' }}>[RUN PATCHED BINARY]</strong>.</p>
                  <p>3. Execution falls through cleanly to <code>decrypt_vault_flag</code>, printing:</p>
                  <code className="cos-hint-code">{BINARY_PATCH_FLAG}</code>
                </div>
              </>
            ) : (
              <>
                <div className="cos-hint-card">
                  <h4>🎯 Objective</h4>
                  <p>Vulnerable program <code>vuln_server</code> uses unsafe <code>gets(buffer)</code> without bounds checking. Overwrite Saved RIP to hijack control flow to <code>win()</code>.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🔍 Stack Calculation Formula</h4>
                  <p>Buffer size = <strong style={{ color: '#38bdf8' }}>16 bytes</strong><br />
                  Saved RBP = <strong style={{ color: '#38bdf8' }}>8 bytes</strong><br />
                  Offset to Saved RIP = 16 + 8 = <strong style={{ color: '#fbbf24' }}>24 bytes</strong>.</p>
                </div>
                <div className="cos-hint-card">
                  <h4>🛠️ How to Solve</h4>
                  <p>1. Set Padding Offset to <strong style={{ color: '#38bdf8' }}>24</strong>.</p>
                  <p>2. Set Target Address to <strong style={{ color: '#38bdf8' }}>0x00401155</strong> (win() address).</p>
                  <p>3. Click <strong style={{ color: '#34d399' }}>[RUN EXPLOIT IN GDB]</strong>.</p>
                  <code className="cos-hint-code">{BUFFER_OVERFLOW_FLAG}</code>
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
                        <th>Instruction (AT&T / Intel)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ASM_INSTRUCTIONS.map((ins, idx) => {
                        const isCurrent = activeStep === idx;
                        const isPatched = ins.isTarget && patchedOpcode === '90 90';

                        return (
                          <tr
                            key={idx}
                            style={{
                              background: isCurrent ? 'rgba(168, 85, 247, 0.25)' : ins.isTarget ? 'rgba(239, 68, 68, 0.15)' : '',
                            }}
                          >
                            <td style={{ color: '#94a3b8' }}>{ins.addr}</td>
                            <td style={{ fontWeight: 700, color: ins.isTarget ? (isPatched ? '#34d399' : '#f87171') : '#cbd5e1' }}>
                              {ins.isTarget ? patchedOpcode : ins.hex}
                            </td>
                            <td>
                              <span style={{ color: isCurrent ? '#a855f7' : ins.isTarget ? (isPatched ? '#34d399' : '#f87171') : '#f1f5f9', fontWeight: ins.isTarget ? 700 : 400 }}>
                                {ins.isTarget ? (isPatched ? 'nop nop (0x004011ad)' : ins.asm) : ins.asm}
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '8px' }}>
                                // {ins.note}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Patch Control Bar */}
                <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e293b', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 700 }}>Quick Patch:</span>
                  <button
                    type="button"
                    className="cos-btn cos-btn-success"
                    onClick={() => handleApplyPatch('90 90')}
                  >
                    Patch to 90 90 (NOP NOP)
                  </button>
                  <button
                    type="button"
                    className="cos-btn"
                    onClick={() => handleApplyPatch('74 12')}
                  >
                    Reset (74 12)
                  </button>
                  <button
                    type="button"
                    className="cos-btn cos-btn-primary"
                    onClick={handleRunReversing}
                    disabled={executing}
                    style={{ marginLeft: 'auto' }}
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
                    className="cos-btn cos-btn-success"
                    style={{ fontSize: '9.5px', padding: '1px 6px' }}
                    onClick={() => {
                      playClickSound(900);
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
              </div>
              <div className="cos-panel-body">
                {/* Visual Stack Layout Box */}
                <div style={{ background: '#03060a', border: '1px solid #1e293b', borderRadius: '4px', padding: '10px' }}>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', marginBottom: '6px', fontWeight: 700 }}>
                    Memory Layout (Low to High Addresses):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', padding: '5px 8px', borderRadius: '3px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>buffer[16] (char array)</span>
                      <strong style={{ color: '#38bdf8' }}>16 Bytes</strong>
                    </div>
                    <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #fbbf24', padding: '5px 8px', borderRadius: '3px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Saved RBP (Base Pointer)</span>
                      <strong style={{ color: '#fbbf24' }}>8 Bytes</strong>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', padding: '5px 8px', borderRadius: '3px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Saved RIP (Target Return Address)</span>
                      <strong style={{ color: '#f87171' }}>Target Address</strong>
                    </div>
                  </div>
                </div>

                {/* Exploit Parameters */}
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                      Padding Length (Bytes before Saved RIP = 16 + 8):
                    </label>
                    <input
                      type="number"
                      className="cos-input"
                      style={{ width: '100%' }}
                      value={paddingLength}
                      onChange={(e) => setPaddingLength(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                      Target Address (Saved RIP ➔ win() at 0x00401155):
                    </label>
                    <input
                      type="text"
                      className="cos-input"
                      style={{ width: '100%' }}
                      value={targetRip}
                      onChange={(e) => setTargetRip(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="cos-btn cos-btn-primary"
                      style={{ flex: 1 }}
                      onClick={handleTestBufferExploit}
                    >
                      <Play size={11} />
                      <span>RUN EXPLOIT IN GDB</span>
                    </button>
                    <button
                      type="button"
                      className="cos-btn"
                      onClick={() => {
                        setPaddingLength('24');
                        setTargetRip('0x00401155');
                      }}
                    >
                      Fill 24 + win()
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
                    className="cos-btn cos-btn-success"
                    style={{ fontSize: '9.5px', padding: '1px 6px' }}
                    onClick={() => {
                      playClickSound(900);
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
          </div>
        )}
      </div>
    </div>
  );
}
