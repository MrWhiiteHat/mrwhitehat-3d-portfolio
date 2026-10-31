import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Play, CheckCircle2, Zap, KeyRound, Terminal, AlertTriangle } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

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

export default function LogicAnalyzerApp() {
  const [probeCh0, setProbeCh0] = useState('TP3'); // Connect to TP3 (TX)
  const [probeGnd, setProbeGnd] = useState('TP4'); // Connect to TP4 (GND)
  const [selectedBaud, setSelectedBaud] = useState('115200');
  const [sampling, setSampling] = useState(false);
  const [serialConsole, setSerialConsole] = useState('');
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);
  const canvasRef = useRef(null);

  // Digital Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let offset = 0;

    const draw = () => {
      offset += 2;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#050a0f';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#0e1726';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Draw Channel 0: UART TX Waveform
      ctx.strokeStyle = probeCh0 === 'TP3' ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < w; x += 10) {
        const bit = Math.sin((x + offset) * 0.05) > 0 ? 30 : 65;
        if (x === 0) ctx.moveTo(x, bit);
        else ctx.lineTo(x, bit);
      }
      ctx.stroke();

      // Label
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`CH0: [${probeCh0}] UART_TX (24 MS/s)`, 10, 20);

      // Draw Channel 1: Ground / Noise
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < w; x += 10) {
        const bit = 110;
        if (x === 0) ctx.moveTo(x, bit);
        else ctx.lineTo(x, bit);
      }
      ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.fillText(`GND: [${probeGnd}] 0V Reference`, 10, 100);

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, [probeCh0, probeGnd]);

  const handleCapture = () => {
    setSampling(true);
    playHackingBeep(1200);
    setSerialConsole('Probing digital logic bus at 24 MHz...');

    setTimeout(() => {
      if (probeCh0 === 'TP1') {
        setSerialConsole('[CRITICAL] Probe connected to TP1 (+3.3V Power Rail). DC line cannot transmit serial data.');
        playZapSound();
        setSampling(false);
        return;
      }

      if (probeCh0 !== 'TP3' || probeGnd !== 'TP4') {
        setSerialConsole(`[ERROR] Signal desynchronized. Connect CH0 to UART_TX (TP3) and GND to TP4.`);
        playZapSound();
        setSampling(false);
        return;
      }

      if (selectedBaud !== '115200') {
        setSerialConsole(`[FRAMING ERROR] Baud rate mismatch at ${selectedBaud} baud. Received garbage bytes: \\xfe\\x8a\\x00\\xff. Select 115200 8-N-1.`);
        playZapSound();
        setSampling(false);
        return;
      }

      // Success!
      setSerialConsole(
        `[OK] Clock synchronization locked at 115200 baud (8-N-1).\n` +
        `U-Boot 2024.04-arm64 (May 14 2026 - 10:22:01 +0000)\n` +
        `CPU: Allwinner H616 (Quad-Core ARM Cortex-A53)\n` +
        `SPI NOR Flash: W25Q128 (16MB) partition /dev/mtdblock0 mounted.\n` +
        `[+] Decrypting bootloader environment variables...\n` +
        `[+] ROOT CLEARANCE FLAG: ${REVEALED_FLAG}`
      );
      playClickSound(1200);
      setSampling(false);
    }, 500);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, manualFlag);
    if (res.success || res.duplicate) {
      setFlagFeedback({ success: true, text: res.message });
      playBreachFanfare();
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b10] font-mono text-xs select-text overflow-hidden">
      {/* PulseView Toolbar */}
      <div className="flex items-center justify-between border-b border-[#1e293b] px-3 py-1.5 bg-[#0f172a]">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8] font-bold">PulseView // Logic Analyzer & Protocol Decoder</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 text-[11px]">8 Channels @ 24 MS/s</span>
        </div>
        <button
          type="button"
          onClick={handleCapture}
          disabled={sampling}
          className="cos-btn cos-btn-primary py-0.5 text-xs font-bold"
        >
          {sampling ? 'ACQUIRING...' : 'RUN ACQUISITION'}
        </button>
      </div>

      {/* Logic Waveforms Canvas */}
      <div className="border-b border-[#1e293b] bg-black p-1">
        <canvas ref={canvasRef} width={640} height={130} className="w-full h-32 block rounded" />
      </div>

      {/* Decoder & Pinout Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-[#04070a] overflow-y-auto flex-1">
        {/* Test Points Mapping */}
        <div className="p-2.5 bg-[#080d14] border border-[#1e293b] rounded space-y-2">
          <span className="text-[10px] text-cyan-400 uppercase font-bold block">
            PCB PROBE ATTACHMENTS (J1 HEADER):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">PROBE CH0 (DATA):</label>
              <select
                value={probeCh0}
                onChange={(e) => setProbeCh0(e.target.value)}
                className="cos-input w-full py-1 text-xs"
              >
                {TEST_PADS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">GROUND LEAD:</label>
              <select
                value={probeGnd}
                onChange={(e) => setProbeGnd(e.target.value)}
                className="cos-input w-full py-1 text-xs"
              >
                {TEST_PADS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">UART PROTOCOL BAUD RATE:</label>
            <div className="grid grid-cols-3 gap-1">
              {['9600', '38400', '115200'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBaud(b)}
                  className={`cos-btn py-1 text-center justify-center ${selectedBaud === b ? 'cos-btn-primary font-bold' : ''}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decoded Serial Console */}
        <div className="p-2.5 bg-[#080d14] border border-[#1e293b] rounded flex flex-col">
          <div className="text-[10px] text-slate-400 uppercase pb-1 mb-1 border-b border-[#1e293b]">
            UART DECODER OUTPUT (ASCII / ttyS0)
          </div>
          <pre className="flex-1 bg-black p-2 rounded text-emerald-300 text-[11px] overflow-y-auto leading-relaxed select-all">
            {serialConsole || 'Awaiting logic trigger acquisition...'}
          </pre>
        </div>
      </div>

      {/* Flag Submission Bar */}
      <div className="p-2.5 bg-[#0a0f16] border-t border-[#1e293b] flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 uppercase">SUBMIT HARDWARE FORENSICS FLAG:</span>
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{uart_...}"
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
