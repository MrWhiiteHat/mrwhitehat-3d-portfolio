import React, { useState } from 'react';
import { Cpu, Terminal, CheckCircle2, Play, Zap, Radio, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'forensics-hardware-uart';
const REVEALED_FLAG = 'FLAG{uart_baud_115200_logic_analyzed}';

const TEST_PADS = [
  { id: 'TP1', name: 'TP1 (VCC +3.3V)', type: 'power', desc: 'DC Power Rail (+3.3V)' },
  { id: 'TP2', name: 'TP2 (JTAG_TCK)', type: 'jtag', desc: 'JTAG Test Clock line' },
  { id: 'TP3', name: 'TP3 (UART_TX)', type: 'uart_tx', desc: 'Microcontroller Serial TX (Transmit)' },
  { id: 'TP4', name: 'TP4 (GND)', type: 'gnd', desc: 'Chassis System Ground (0V)' },
  { id: 'TP5', name: 'TP5 (UART_RX)', type: 'uart_rx', desc: 'Microcontroller Serial RX (Receive)' },
  { id: 'TP6', name: 'TP6 (RESET_N)', type: 'reset', desc: 'Active-Low Hardware Reset' },
];

export default function HardwareForensicsChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  // Real CTF: starts unassigned and standard 9600 baud
  const [probeCh0, setProbeCh0] = useState('NONE');
  const [probeGnd, setProbeGnd] = useState('NONE');
  const [selectedBaud, setSelectedBaud] = useState('9600');
  const [dumping, setDumping] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleCapture = () => {
    if (dumping) return;
    setDumping(true);
    playHackingBeep(1200);
    setConsoleOutput('Initializing 8-Channel Logic Analyzer...\nSampling test pads at 24 MHz...');

    setTimeout(() => {
      // Validate probe connections
      if (probeCh0 === 'TP1') {
        setConsoleOutput(
          `[CRITICAL ERROR] Overvoltage fault! Probe Channel 0 connected to TP1 (+3.3V VCC Rail).\n` +
          `[!] Power rail cannot transmit serial asynchronous data packets.\n` +
          `[!] Reattach Channel 0 to serial data transmit pad.`
        );
        playZapSound();
        setDumping(false);
        return;
      }

      if (probeCh0 !== 'TP3' || probeGnd !== 'TP4') {
        setConsoleOutput(
          `[ERROR] Logic Analyzer failed to acquire signal:\n` +
          `[-] Probe Channel 0 connected to: ${probeCh0}\n` +
          `[-] Ground Reference connected to: ${probeGnd}\n` +
          `[-] No asynchronous serial transitions detected. Verify probe attachments on serial transmit (TX) and ground (GND) test pads.`
        );
        playZapSound();
        setDumping(false);
        return;
      }

      // Check Baud Rate
      if (selectedBaud !== '115200') {
        setConsoleOutput(
          `[OK] Probes locked on ${probeCh0} and ${probeGnd}.\n` +
          `[FRAMING ERROR] Baud rate mismatch at ${selectedBaud} baud.\n` +
          `[!] Sampled raw byte buffer: \\xfe\\x8a\\x00\\xff\\x7e\\x1b\\x00 [GARBAGE BYTES].\n` +
          `[!] Asynchronous framing error / stop bit violation detected. Adjust baud rate setting to synchronize with microcontroller clock.`
        );
        playZapSound();
        setDumping(false);
        return;
      }

      // Correct probes + correct baud rate!
      setConsoleOutput(
        `[OK] Probes locked on TP3 (UART_TX) and TP4 (CHASSIS_GND).\n` +
        `[OK] Baud synchronization locked at 115200 8-N-1 (Sample rate: 24 MHz).\n` +
        `------------------------------------------------------------\n` +
        `U-Boot 2024.04-arm64 (May 14 2026 - 10:22:01 +0000)\n` +
        `CPU: Allwinner H616 (Quad-Core ARM Cortex-A53 @ 1.5 GHz)\n` +
        `DRAM: 2 GiB LPDDR4\n` +
        `SPI NOR Flash: W25Q128FV (16 MiB) partition /dev/mtdblock0 mounted.\n` +
        `Kernel boot cmdline: console=ttyS0,115200 earlyprintk root=/dev/mtdblock3\n` +
        `[+] Decrypting firmware storage partition...\n` +
        `[+] ROOT CLEARANCE FLAG EXTRACTED: ${REVEALED_FLAG}\n` +
        `------------------------------------------------------------`
      );
      playClickSound(1100);
      setDumping(false);
    }, 600);
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
    <div className="hack-puzzle-container hardware-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Cpu size={15} className="text-amber-400 hack-icon-pulse" />
          <span>HARDWARE FORENSICS // PCB TEST-PAD REVERSE ENGINEERING & UART LOGIC</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 150} PTS`}
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
          Hardware engineers recovered an unshielded IoT controller PCB. Identify the UART serial test points from the silkscreen designations, attach the logic analyzer probes (CH0 & GND), synchronize the UART baud rate, and dump the bootloader firmware to recover the root flag.
        </p>
      </div>

      {/* PCB Test Points Layout */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded mt-2">
        <span className="text-[10px] font-mono text-amber-400 uppercase block mb-1.5">
          PCB SILKSCREEN TEST POINTS (J1 HEADER):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-xs">
          {TEST_PADS.map((pad) => (
            <div
              key={pad.id}
              className={`p-2 rounded border ${
                pad.id === 'TP3'
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                  : pad.id === 'TP4'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-black/60 border-slate-800 text-slate-400'
              }`}
            >
              <strong className="block text-[11px]">{pad.name}</strong>
              <span className="text-[9.5px] text-slate-400">{pad.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logic Analyzer Wiring & Baud Config */}
      <div className="p-3 bg-black border border-slate-800 rounded mt-2 space-y-3 font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Probe CH0 */}
          <div>
            <label className="text-[10px] text-cyan-400 block mb-1">
              PROBE CHANNEL 0 (DATA IN):
            </label>
            <select
              value={probeCh0}
              onChange={(e) => setProbeCh0(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
            >
              <option value="NONE">-- Select Test Point --</option>
              {TEST_PADS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Probe Ground */}
          <div>
            <label className="text-[10px] text-emerald-400 block mb-1">
              GROUND LEAD (0V REFERENCE):
            </label>
            <select
              value={probeGnd}
              onChange={(e) => setProbeGnd(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-400"
            >
              <option value="NONE">-- Select Ground Point --</option>
              {TEST_PADS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Baud Rate Selector */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">
            UART ASYNCHRONOUS BAUD RATE:
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
            {['9600', '19200', '38400', '57600', '115200', '230400'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  playClickSound(850);
                  setSelectedBaud(b);
                }}
                className={`py-1 rounded text-center text-xs transition border ${
                  selectedBaud === b
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCapture}
          disabled={dumping}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-black font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 transition font-mono mt-1"
        >
          <Play size={13} />
          <span>{dumping ? 'SAMPLING BUS SIGNALS...' : 'ACQUIRE & DECODE SERIAL SIGNALS'}</span>
        </button>
      </div>

      {/* Serial Console Output */}
      {consoleOutput && (
        <div className="mt-3 p-2.5 bg-black border border-slate-800 rounded font-mono text-xs">
          <div className="text-slate-500 text-[10px] uppercase mb-1 flex items-center gap-1">
            <Terminal size={11} />
            <span>SERIAL CONSOLE (ttyS0):</span>
          </div>
          <pre className="text-emerald-300 whitespace-pre-wrap select-all overflow-x-auto leading-relaxed">
            {consoleOutput}
          </pre>
        </div>
      )}

      {/* FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT HARDWARE REVERSE ENGINEERING FLAG:</span>
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
            <span className="font-bold text-emerald-300">HARDWARE EXPLOITED // FIRMWARE DUMPED</span>
            <span className="text-[10px] text-emerald-400/80">+150 CTF PTS Awarded · UART Logic Decoded</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Inspect silk-screen markings on the PCB: attach the signal probe to serial TX, reference probe to GND, and test common embedded baud rates.</span>
        </div>
      )}
    </div>
  );
}
