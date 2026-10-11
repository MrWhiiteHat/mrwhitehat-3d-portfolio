import React, { useState, useEffect } from 'react';
import { CheckCircle2, FileText, Printer, Scissors, Zap } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';

const WIRE_TYPES = [
  { id: 'ALPHA', label: 'PORT_01 // SEC_AUTH', color: '#ef4444' },
  { id: 'BETA', label: 'PORT_02 // KERNEL_MEM', color: '#38bdf8' },
  { id: 'GAMMA', label: 'PORT_03 // CERT_CHAIN', color: '#22c55e' },
  { id: 'DELTA', label: 'PORT_04 // SPOOL_DATA', color: '#eab308' },
];

export default function WireSpliceHack({ onSolved, onBypass }) {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [connectedWires, setConnectedWires] = useState({}); // { ALPHA: true, ... }
  const [solved, setSolved] = useState(false);

  // Right ports shuffled
  const rightPorts = [
    WIRE_TYPES[2], // GAMMA
    WIRE_TYPES[0], // ALPHA
    WIRE_TYPES[3], // DELTA
    WIRE_TYPES[1], // BETA
  ];

  const handleLeftClick = (id) => {
    if (solved || connectedWires[id]) return;
    playClickSound(800);
    setSelectedLeft(id);
  };

  const handleRightClick = (id) => {
    if (solved || !selectedLeft) return;

    if (selectedLeft === id) {
      // Correct connection
      playHackingBeep(1100);
      setConnectedWires((prev) => {
        const next = { ...prev, [id]: true };
        if (Object.keys(next).length === WIRE_TYPES.length) {
          setSolved(true);
          playBreachFanfare();
          setTimeout(() => {
            onSolved();
          }, 1100);
        }
        return next;
      });
      setSelectedLeft(null);
    } else {
      // Wrong connection feedback
      playClickSound(300, 0.1);
      setSelectedLeft(null);
    }
  };

  return (
    <div className="hack-puzzle-container wire-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Printer size={14} className="hack-icon-pulse" />
          <span>SPOOLER_OVERRIDE // CRYPTO_WIRE_SPLICE.raw</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge">
            {solved
              ? 'SPOOL_DISARMED'
              : `${Object.keys(connectedWires).length}/4 SPLICED`}
          </span>
          <button
            className="hack-bypass-btn"
            onClick={() => {
              playZapSound();
              onBypass();
            }}
            title="Instant Reveal"
          >
            DEV_BYPASS ⚡
          </button>
        </div>
      </div>

      <div className="hack-instructions">
        <p>
          Select an encrypted port on the <strong className="hl-green">LEFT</strong> and link it to
          its cryptographic matching terminal on the <strong className="hl-cyan">RIGHT</strong> to
          clear the print buffer.
        </p>
      </div>

      {/* Splicer Wiring Board */}
      <div className="wire-board">
        {/* Left Column of Ports */}
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
                style={{ borderColor: isConnected || isSelected ? w.color : undefined }}
                onClick={() => handleLeftClick(w.id)}
                disabled={isConnected}
              >
                <span className="port-dot" style={{ background: w.color }} />
                <span className="port-label">{w.label}</span>
                <span className="port-plug">🔌</span>
              </button>
            );
          })}
        </div>

        {/* Center Connection Indicator */}
        <div className="wire-center-nexus">
          <div className="nexus-line" />
          <span className="nexus-text">{selectedLeft ? 'WIRE PULSE READY' : 'SELECT SOURCE'}</span>
        </div>

        {/* Right Column of Ports */}
        <div className="wire-col right-col">
          {rightPorts.map((w) => {
            const isConnected = !!connectedWires[w.id];

            return (
              <button
                key={`right-${w.id}`}
                className={`wire-port ${isConnected ? 'port-connected' : ''}`}
                style={{ borderColor: isConnected ? w.color : undefined }}
                onClick={() => handleRightClick(w.id)}
                disabled={isConnected}
              >
                <span className="port-plug">⚡</span>
                <span className="port-label">{w.label}</span>
                <span className="port-dot" style={{ background: w.color }} />
              </button>
            );
          })}
        </div>
      </div>

      {solved ? (
        <div className="hack-success-banner">
          <CheckCircle2 size={16} />
          <span>SPOOLER BUFFER CLEARED // RESUME DOCUMENT PRINTING</span>
        </div>
      ) : (
        <div className="hack-hint-bar">
          <span className="live-blip" />
          <span>Match matching cryptographic protocols (Auth, Mem, Cert, Spool)</span>
        </div>
      )}
    </div>
  );
}
