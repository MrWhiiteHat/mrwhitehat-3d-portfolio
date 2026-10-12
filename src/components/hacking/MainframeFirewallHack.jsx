import React, { useState, useEffect } from 'react';
import { CheckCircle2, Cpu, RefreshCw, Server, ShieldAlert, Zap } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';

const PORTS = [
  { id: 22, name: 'PORT 22 // SSH', role: 'REMOTE_TERMINAL', initial: false, target: true },
  { id: 80, name: 'PORT 80 // HTTP', role: 'CLEAR_TEXT_WEB', initial: true, target: false },
  { id: 443, name: 'PORT 443 // HTTPS', role: 'ENCRYPTED_TUNNEL', initial: false, target: true },
  { id: 8080, name: 'PORT 8080 // PROXY', role: 'TRAFFIC_FORWARDER', initial: false, target: true },
];

export default function MainframeFirewallHack({ onSolved, onBypass }) {
  const [portStates, setPortStates] = useState(() =>
    PORTS.map((p) => ({ ...p, open: p.initial }))
  );
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Check victory condition
  useEffect(() => {
    const isMatched = portStates.every((p) => p.open === p.target);
    if (isMatched && !solved) {
      setSolved(true);
      playBreachFanfare();
      setTimeout(() => {
        onSolved();
      }, 1000);
    }
  }, [portStates, solved, onSolved]);

  const togglePort = (idx) => {
    if (solved) return;
    playHackingBeep(1000 + idx * 200);
    setAttempts((prev) => prev + 1);
    setPortStates((prev) => {
      const next = [...prev];
      // Toggling a port also flips adjacent routing rule (cyber network parity mechanic)
      next[idx] = { ...next[idx], open: !next[idx].open };
      const adjacent = (idx + 1) % next.length;
      next[adjacent] = { ...next[adjacent], open: !next[adjacent].open };
      return next;
    });
  };

  const handleReset = () => {
    playClickSound(700);
    setPortStates(PORTS.map((p) => ({ ...p, open: p.initial })));
  };

  return (
    <div className="hack-puzzle-container mainframe-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Server size={14} className="hack-icon-pulse" />
          <span>MAINFRAME_OVERRIDE // 42U_FIREWALL_FILTER.sh</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge">
            {solved ? 'MAINFRAME_ROOT_ACCESS' : 'FILTER_LOCKED'}
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
          Configure the router parity rules. Toggle ports so only{' '}
          <strong style={{ color: '#4ade80' }}>SECURE PORTS (22, 443, 8080)</strong> are active while{' '}
          <strong style={{ color: '#f87171' }}>PORT 80</strong> is closed!
        </p>
      </div>

      {/* Port Grid */}
      <div className="ports-matrix-grid">
        {portStates.map((port, i) => {
          const isTargetMatched = port.open === port.target;

          return (
            <div
              key={port.id}
              className={`port-control-card ${port.open ? 'port-open' : 'port-closed'} ${
                isTargetMatched ? 'port-matched' : ''
              }`}
            >
              <div className="port-card-top">
                <span className="port-indicator-led" />
                <strong className="port-number">{port.name}</strong>
                <span className="port-rule-tag">
                  {port.open ? 'ROUTE_OPEN' : 'BLOCKED'}
                </span>
              </div>

              <div className="port-desc">{port.role}</div>

              <div className="port-target-status">
                TARGET: {port.target ? 'MUST BE OPEN' : 'MUST BE BLOCKED'}
                {isTargetMatched && <span className="target-ok-badge">✔ MATCH</span>}
              </div>

              <button
                type="button"
                className="port-toggle-btn"
                onClick={() => togglePort(i)}
                disabled={solved}
              >
                {port.open ? 'DISABLE PORT' : 'ENABLE PORT'}
              </button>
            </div>
          );
        })}
      </div>

      {solved ? (
        <div className="hack-success-banner">
          <CheckCircle2 size={16} />
          <span>FIREWALL RE-ROUTED // MAINFRAME TELEMETRY UNLOCKED</span>
        </div>
      ) : (
        <div className="hack-hint-bar" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            <span className="live-blip" />
            Switching a port dynamically cascades routing to adjacent subnet.
          </span>
          <button type="button" className="hack-retry-btn" onClick={handleReset}>
            <RefreshCw size={11} /> Reset Ports
          </button>
        </div>
      )}
    </div>
  );
}
