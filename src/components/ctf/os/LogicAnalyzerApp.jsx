import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Play,
  CheckCircle2,
  Zap,
  KeyRound,
  Terminal,
  HelpCircle,
  Sparkles,
  Copy,
  Radio,
  Sliders,
} from 'lucide-react';
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

export default function LogicAnalyzerApp({ onOpenStation }) {
  const [probeCh0, setProbeCh0] = useState('TP3'); // Connect to TP3 (TX)
  const [probeGnd, setProbeGnd] = useState('TP4'); // Connect to TP4 (GND)
  const [selectedBaud, setSelectedBaud] = useState('115200');
  const [sampling, setSampling] = useState(false);
  const [serialConsole, setSerialConsole] = useState('');
  const [showHints, setShowHints] = useState(true);
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);
  const canvasRef = useRef(null);

  // Digital Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let offset = 0;

    const render = () => {
      ctx.fillStyle = '#03060a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // CH0: Signal trace
      ctx.strokeStyle = probeCh0 === 'TP3' ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      let y = 35;
      for (let x = 0; x < canvas.width; x += 15) {
        const bit = ((x + offset) * 7) % 40 > 20 ? 1 : 0;
        const curY = bit === 1 ? 15 : 45;
        if (x === 0) ctx.moveTo(x, curY);
        else {
          ctx.lineTo(x, curY);
          ctx.lineTo(x + 15, curY);
        }
      }
      ctx.stroke();

      // CH1: Clock trace
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 10) {
        const bit = ((x + offset) / 10) % 2 === 0 ? 1 : 0;
        const curY = bit === 1 ? 65 : 85;
        if (x === 0) ctx.moveTo(x, curY);
        else {
          ctx.lineTo(x, curY);
          ctx.lineTo(x + 10, curY);
        }
      }
      ctx.stroke();

      offset = (offset + 1) % 60;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [probeCh0]);

  const handleCapture = () => {
    if (sampling) return;
    setSampling(true);
    playHackingBeep(1100);
    setSerialConsole('Capturing digital logic stream from physical probes...');

    setTimeout(() => {
      const isTxCorrect = probeCh0 === 'TP3';
      const isGndCorrect = probeGnd === 'TP4';
      const isBaudCorrect = selectedBaud === '115200';

      if (isTxCorrect && isGndCorrect && isBaudCorrect) {
        setSerialConsole(
          `[+] Logic analyzer probe CH0 -> TP3 (UART_TX) [ATTACHED]\n` +
          `[+] Ground probe GND -> TP4 (SYSTEM_GND) [LOCKED]\n` +
          `[+] Baud rate synchronized: 115200 baud, 8-N-1\n` +
          `--------------------------------------------------\n` +
          `[BOOT] MR_WHITEHAT SECURE IOT BOOTLOADER v2.4.1\n` +
          `[BOOT] Initializing cryptographic coprocessor...\n` +
          `[BOOT] Silicon revision: STM32F4-SECURE-REV2\n` +
          `[BOOT] Dumping hardware diagnostic token:\n` +
          `[+] FLAG CAPTURED: ${REVEALED_FLAG}\n` +
          `--------------------------------------------------\n` +
          `[BOOT] Bootloader locked. System halted.`
        );
        playBreachFanfare();
      } else if (!isTxCorrect) {
        setSerialConsole(
          `[-] Probe CH0 is attached to ${probeCh0}. No UART asynchronous serial frame detected.\n` +
          `[-] Inspect the silkscreen: TP3 is labeled UART_TX.`
        );
        playZapSound();
      } else if (!isGndCorrect) {
        setSerialConsole(
          `[-] Ground probe attached to ${probeGnd}. Floating ground reference detected. Attach GND to TP4.`
        );
        playZapSound();
      } else {
        setSerialConsole(
          `[!] Framing Error: Baud rate mismatch (${selectedBaud} baud).\n` +
          `[!] Received corrupt garbage bytes: 0xff 0x00 0x7e 0x8a 0xc3.\n` +
          `[!] Synchronize UART baud to standard IoT 115200 baud.`
        );
        playZapSound();
      }
      setSampling(false);
    }, 450);
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, manualFlag.trim());
    if (res.success || res.duplicate) {
      const stationId = res.stationId || 'resume';
      setFlagFeedback({
        success: true,
        text: res.message,
        stationId,
        stationName: 'RESUME DOSSIER'
      });
      playBreachFanfare();
      setTimeout(() => {
        onOpenStation?.(stationId);
      }, 1800);
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="cos-app-container select-text">
      {/* 1. Header Toolbar */}
      <div className="cos-app-header">
        <div className="cos-app-title">
          <Cpu size={15} style={{ color: '#00f0ff' }} />
          <span>PULSEVIEW // HARDWARE LOGIC ANALYZER & UART DECODER</span>
          <span className="cos-badge cos-badge-cyan">24MHz 8-Channel USB</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`cos-hint-toggle ${showHints ? 'is-active' : ''}`}
            onClick={() => setShowHints((prev) => !prev)}
            title="Toggle Hardware Forensics Guide & Hints"
          >
            <HelpCircle size={13} />
            <span>{showHints ? 'HIDE HINTS' : '💡 HOW TO SOLVE'}</span>
          </button>

          <button
            type="button"
            className="cos-btn cos-btn-primary"
            onClick={handleCapture}
            disabled={sampling}
          >
            <Play size={11} />
            <span>{sampling ? 'Capturing...' : 'START CAPTURE'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Hint & Walkthrough Drawer */}
      {showHints && (
        <div className="cos-hint-drawer">
          <div className="cos-hint-header-bar">
            <div className="cos-hint-title">
              <Sparkles size={14} />
              <span>HARDWARE FORENSICS GUIDE // UART PROTOCOL REVERSE ENGINEERING</span>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Category: Hardware Forensics · Difficulty: Easy · Reward: +150 PTS</span>
          </div>

          <div className="cos-hint-grid">
            <div className="cos-hint-card">
              <h4>🎯 Objective</h4>
              <p>Reverse engineer the test points on the target IoT device PCB to intercept serial bootloader communication.</p>
            </div>

            <div className="cos-hint-card">
              <h4>🔍 Pinout Clues</h4>
              <p>• <strong>TP3</strong>: Labeled <code>UART_TX</code> on silkscreen (microcontroller transmit line).<br />
              • <strong>TP4</strong>: System ground (<code>GND</code>, 0V reference).<br />
              • Standard embedded baud rate: <strong style={{ color: '#38bdf8' }}>115200 (8-N-1)</strong>.</p>
            </div>

            <div className="cos-hint-card">
              <h4>🛠️ How to Solve</h4>
              <p>1. Connect <strong>Channel 0</strong> to <strong style={{ color: '#38bdf8' }}>TP3 (UART_TX)</strong>.</p>
              <p>2. Connect <strong>Ground</strong> to <strong style={{ color: '#38bdf8' }}>TP4 (GND)</strong>.</p>
              <p>3. Set Baud Rate to <strong style={{ color: '#34d399' }}>115200</strong>.</p>
              <p>4. Click <strong style={{ color: '#34d399' }}>[START CAPTURE]</strong> to dump bootloader firmware and copy flag:</p>
              <code className="cos-hint-code">{REVEALED_FLAG}</code>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Split View: Hardware Test-Pad Board & Waveforms (Left) | Serial Console (Right) */}
      <div className="cos-app-body">
        <div className="cos-split-horizontal">
          {/* Left Pane: PCB Test-Pads & Probe Settings */}
          <div className="cos-panel">
            <div className="cos-panel-header">
              <span>PHYSICAL PCB TEST-PAD SILKSCREEN & PROBES</span>
            </div>
            <div className="cos-panel-body" style={{ gap: '10px' }}>
              {/* Probe Setup Selectors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>
                    Probe CH0 (Signal):
                  </label>
                  <select
                    className="cos-input"
                    style={{ width: '100%' }}
                    value={probeCh0}
                    onChange={(e) => setProbeCh0(e.target.value)}
                  >
                    {TEST_PADS.map((pad) => (
                      <option key={pad.id} value={pad.id}>
                        {pad.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>
                    Probe GND (Reference):
                  </label>
                  <select
                    className="cos-input"
                    style={{ width: '100%' }}
                    value={probeGnd}
                    onChange={(e) => setProbeGnd(e.target.value)}
                  >
                    {TEST_PADS.map((pad) => (
                      <option key={pad.id} value={pad.id}>
                        {pad.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Baud Rate Synchronizer */}
              <div>
                <label style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>
                  UART Baud Rate:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['9600', '19200', '57600', '115200'].map((baud) => (
                    <button
                      key={baud}
                      type="button"
                      className={`cos-btn ${selectedBaud === baud ? 'cos-btn-primary' : ''}`}
                      style={{ flex: 1, fontSize: '10.5px' }}
                      onClick={() => {
                        playClickSound(850);
                        setSelectedBaud(baud);
                      }}
                    >
                      {baud}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Waveform Canvas */}
              <div style={{ marginTop: 'auto', border: '1px solid #1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#0a0f18', padding: '4px 8px', fontSize: '10px', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>
                  CH0: {probeCh0} (TX) · CH1: CLK (Synchronized)
                </div>
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={100}
                  style={{ width: '100%', height: '100px', display: 'block' }}
                />
              </div>
            </div>
          </div>

          {/* Right Pane: Serial Bootloader Console */}
          <div className="cos-panel">
            <div className="cos-panel-header">
              <span>DECODED UART SERIAL STREAM (115200 8-N-1)</span>
              {serialConsole.includes(REVEALED_FLAG) && (
                <button
                  type="button"
                  className="cos-btn cos-btn-success"
                  style={{ fontSize: '9.5px', padding: '1px 6px' }}
                  onClick={() => {
                    playClickSound(900);
                    setManualFlag(REVEALED_FLAG);
                  }}
                >
                  <Copy size={10} />
                  <span>Copy Flag</span>
                </button>
              )}
            </div>
            <div className="cos-panel-body" style={{ padding: '6px' }}>
              <textarea
                className={`cos-textarea ${serialConsole.includes(REVEALED_FLAG) ? 'cos-textarea-output' : ''}`}
                readOnly
                value={serialConsole || 'UART decoder idle.\nConnect CH0 to TP3 (TX), GND to TP4, select 115200 baud, and click START CAPTURE.'}
                style={{ color: serialConsole.includes(REVEALED_FLAG) ? '#34d399' : '#cbd5e1' }}
              />
            </div>
          </div>
        </div>
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
