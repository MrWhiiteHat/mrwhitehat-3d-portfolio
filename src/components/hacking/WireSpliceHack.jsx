import React, { useState, useEffect } from 'react';
import { CheckCircle2, Cpu, Zap, Flag, Terminal } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'forensics-hardware-uart';
const REVEALED_FLAG = 'FLAG{uart_baud_115200_logic_analyzed}';

const WIRE_TYPES = [
  { id: 'TX', label: 'SOC_TX (Data Out)', target: 'RX', color: '#ef4444' },
  { id: 'RX', label: 'SOC_RX (Data In)', target: 'TX', color: '#38bdf8' },
  { id: 'GND', label: 'CHASSIS_GND (0V)', target: 'GND', color: '#22c55e' },
  { id: 'VCC', label: 'VCC_LINE (+3.3V)', target: 'VCC', color: '#eab308' },
];

const RIGHT_TARGETS = [
  { id: 'RX', label: 'ANALYZER_RX (Probe 1)', matchId: 'TX' },
  { id: 'VCC', label: 'ANALYZER_VCC (Reference)', matchId: 'VCC' },
  { id: 'TX', label: 'ANALYZER_TX (Probe 2)', matchId: 'RX' },
  { id: 'GND', label: 'ANALYZER_GND (Ground)', matchId: 'GND' },
];

export default function WireSpliceHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [connectedWires, setConnectedWires] = useState({});
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleLeftClick = (id) => {
    if (solved || connectedWires[id]) return;
    playClickSound(800);
    setSelectedLeft(id);
  };

  const handleRightClick = (target) => {
    if (solved || !selectedLeft) return;

    if (target.matchId === selectedLeft) {
      playHackingBeep(1100);
      setConnectedWires((prev) => {
        const next = { ...prev, [selectedLeft]: true };
        if (Object.keys(next).length === WIRE_TYPES.length) {
          setSolved(true);
          ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
          playBreachFanfare();
          setTimeout(() => {
            onSolved?.();
          }, 1500);
        }
        return next;
      });
      setSelectedLeft(null);
    } else {
      playClickSound(300, 0.1);
      setSelectedLeft(null);
    }
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
    <div className="hack-puzzle-container wire-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Cpu size={14} className="hack-icon-pulse text-cyan-400" />
          <span>CTF MISSION // FORENSICS: UART PINOUT & MEMORY DUMP</span>
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
          Bridge the SoC serial pins on the <strong className="text-emerald-400">LEFT</strong> to the logic analyzer channels on the <strong className="text-cyan-400">RIGHT</strong> (TX to RX, RX to TX, GND to GND, VCC to VCC) at 115200 baud to dump SPI flash.
        </p>
      </div>

      {/* Splicer Wiring Board */}
      <div className="wire-board">
        <div className="wire-col left-col">
          {WIRE_TYPES.map((w) => {
            const isConnected = !!connectedWires[w.id];
            const isSelected = selectedLeft === w.id;

            return (
              <button
                key={`left-${w.id}`}
                className={`wire-port ${isSelected ? 'port-selected' : ''} ${
                  isConnected ? 'port-connected' : ''
                }`}
                onClick={() => handleLeftClick(w.id)}
                disabled={isConnected || solved}
                style={{ borderColor: isSelected ? w.color : undefined }}
              >
                <span className="wire-pin" style={{ background: w.color }} />
                <span className="wire-label">{w.label}</span>
                {isConnected && <CheckCircle2 size={12} className="wire-check" />}
              </button>
            );
          })}
        </div>

        <div className="wire-col right-col">
          {RIGHT_TARGETS.map((target, idx) => {
            const isConnected = !!connectedWires[target.matchId];

            return (
              <button
                key={`right-${idx}`}
                className={`wire-port right-port ${
                  isConnected ? 'port-connected' : ''
                }`}
                onClick={() => handleRightClick(target)}
                disabled={isConnected || solved || !selectedLeft}
              >
                {isConnected && <CheckCircle2 size={12} className="wire-check" />}
                <span className="wire-label">{target.label}</span>
                <span className="wire-pin right-pin" />
              </button>
            );
          })}
        </div>
      </div>

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
            <span className="font-bold text-emerald-300">FLASH DUMP EXFILTRATED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+150 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Logic Analyzer baud rate: 115200 8-N-1 · TX bridges to RX · GND to GND</span>
        </div>
      )}
    </div>
  );
}
