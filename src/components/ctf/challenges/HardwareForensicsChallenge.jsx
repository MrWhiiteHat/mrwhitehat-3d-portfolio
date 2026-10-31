import React, { useState } from 'react';
import { Cpu, Terminal, CheckCircle2, Play, Zap, Radio, RefreshCw } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'forensics-hardware-uart';
const REVEALED_FLAG = 'FLAG{uart_baud_115200_logic_analyzed}';

const PINS = [
  { id: 'TX', name: 'TP2: UART_TX (Data Out)', targetProbe: 'RX_CH0' },
  { id: 'RX', name: 'TP3: UART_RX (Data In)', targetProbe: 'TX_CH1' },
  { id: 'GND', name: 'TP4: CHASSIS_GND (0V)', targetProbe: 'GND_REF' },
  { id: 'VCC', name: 'TP1: POWER_VCC (+3.3V)', targetProbe: 'VCC_LINE' },
];

export default function HardwareForensicsChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [selectedBaud, setSelectedBaud] = useState('115200');
  const [connectedProbes, setConnectedProbes] = useState({
    TX: true,
    RX: true,
    GND: true,
    VCC: true,
  });
  const [dumping, setDumping] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleCaptureFirmware = () => {
    if (solved || dumping) return;
    setDumping(true);
    playHackingBeep(1200);
    setConsoleOutput('Connecting Logic Analyzer to UART header...\nProbing serial lines 8-N-1 at ' + selectedBaud + ' baud...');

    setTimeout(() => {
      if (selectedBaud === '115200') {
        setConsoleOutput(
          `[OK] Baud synchronization locked at 115200.\n` +
          `[+] U-Boot 2024.04-arm (May 14 2026 - 10:22:01 +0000)\n` +
          `[+] CPU: Allwinner H616 Quad-Core ARM Cortex-A53\n` +
          `[+] SPI Flash: W25Q128FV (16MB) partition /dev/mtdblock0 mounted.\n` +
          `[+] DUMPING FIRMWARE PARTITION...\n` +
          `[+] EXTRACTED CLEARANCE FLAG: ${REVEALED_FLAG}`
        );
        setDumping(false);
        setSolved(true);
        ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
        playBreachFanfare();
        setTimeout(() => onSolved?.(), 1600);
      } else {
        setConsoleOutput(
          `[ERROR] Framing error detected at ${selectedBaud} baud.\n` +
          `[!] Garbage bits received: 0#@\n` +
          `[!] UART clock drift: Select standard embedded baud rate (115200).`
        );
        setDumping(false);
        playZapSound();
      }
    }, 700);
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
    <div className="hack-puzzle-container hardware-forensics-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Cpu size={15} className="text-emerald-400 hack-icon-pulse" />
          <span>HARDWARE FORENSICS // UART SERIAL PINOUT & SPI FLASH DUMPER</span>
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
          The rogue printer SoC exposed unpopulated 4-pin UART debug headers. Align logic analyzer channels and select the matching baud rate (115200 8-N-1) to dump SPI flash memory.
        </p>
      </div>

      {/* PCB Schematic & Probes Layout */}
      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
        <div className="text-xs font-mono text-cyan-400 font-bold">// Logic Analyzer Probes Configuration:</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
          {PINS.map((pin) => (
            <div key={pin.id} className="p-2 bg-slate-900 border border-emerald-500/40 rounded">
              <span className="text-emerald-400 block text-[10px]">CONNECTED ✔</span>
              <strong className="text-slate-200">{pin.id}</strong>
              <span className="text-[10px] text-slate-500 block truncate">{pin.name}</span>
            </div>
          ))}
        </div>

        {/* Baud Rate Selector */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-xs font-mono text-slate-400">UART BAUD RATE:</span>
          {['9600', '38400', '57600', '115200'].map((baud) => (
            <button
              key={baud}
              type="button"
              onClick={() => {
                setSelectedBaud(baud);
                playClickSound(850);
              }}
              className={`text-xs font-mono px-3 py-1 rounded transition border ${
                selectedBaud === baud
                  ? 'bg-emerald-600 text-black font-bold border-emerald-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
              }`}
            >
              {baud}
            </button>
          ))}

          <button
            type="button"
            onClick={handleCaptureFirmware}
            disabled={solved || dumping}
            className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-1 rounded text-xs flex items-center gap-1 transition"
          >
            <Play size={13} />
            <span>{dumping ? 'CAPTURING...' : 'CAPTURE FIRMWARE'}</span>
          </button>
        </div>
      </div>

      {/* Serial Console Output */}
      {consoleOutput && (
        <div className="mt-3 p-2.5 bg-black border border-emerald-500/30 rounded font-mono text-[11px] text-emerald-300 whitespace-pre-wrap">
          {consoleOutput}
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
            <span className="font-bold text-emerald-300">FLASH PARTITION DUMPED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+150 CTF PTS Awarded to Profile · Credenza Printer Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Select standard embedded Linux baud rate: 115200 and click "CAPTURE FIRMWARE"</span>
        </div>
      )}
    </div>
  );
}
