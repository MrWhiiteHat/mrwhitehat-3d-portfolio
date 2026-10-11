import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, Cpu, RotateCw, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { playBreachFanfare, playHackingBeep, playZapSound } from '../../utils/audio.js';

// Directions: 0 = Top, 1 = Right, 2 = Bottom, 3 = Left
const OPPOSITE = [2, 3, 0, 1];

// Initial 3x3 node layouts: type & initial rotation (0, 1, 2, 3 * 90deg)
const INITIAL_GRID = [
  // Row 0
  { id: 0, type: 'corner', basePorts: [1, 2], rot: 1 }, // (0,0) - Source
  { id: 1, type: 'line', basePorts: [0, 2], rot: 0 },   // (0,1)
  { id: 2, type: 'corner', basePorts: [2, 3], rot: 0 }, // (0,2)
  // Row 1
  { id: 3, type: 'line', basePorts: [1, 3], rot: 0 },   // (1,0)
  { id: 4, type: 'tee', basePorts: [0, 1, 2], rot: 2 }, // (1,1)
  { id: 5, type: 'line', basePorts: [0, 2], rot: 1 },   // (1,2)
  // Row 2
  { id: 6, type: 'corner', basePorts: [0, 1], rot: 3 }, // (2,0)
  { id: 7, type: 'line', basePorts: [1, 3], rot: 1 },   // (2,1)
  { id: 8, type: 'corner', basePorts: [0, 3], rot: 2 }, // (2,2) - Target
];

function getEffectivePorts(basePorts, rot) {
  return basePorts.map((p) => (p + rot) % 4);
}

export default function NetworkCircuitHack({ onSolved, onBypass }) {
  const [nodes, setNodes] = useState(() =>
    INITIAL_GRID.map((n) => ({ ...n, rot: Math.floor(Math.random() * 4) }))
  );
  const [solved, setSolved] = useState(false);

  // Compute power flow from node 0
  const poweredNodes = useMemo(() => {
    const powered = new Set([0]);
    const queue = [0];

    while (queue.length > 0) {
      const curr = queue.shift();
      const r = Math.floor(curr / 3);
      const c = curr % 3;
      const currPorts = getEffectivePorts(nodes[curr].basePorts, nodes[curr].rot);

      // Check all 4 neighbor directions
      const neighbors = [
        { dir: 0, nr: r - 1, nc: c }, // Top
        { dir: 1, nr: r, nc: c + 1 }, // Right
        { dir: 2, nr: r + 1, nc: c }, // Bottom
        { dir: 3, nr: r, nc: c - 1 }, // Left
      ];

      for (const { dir, nr, nc } of neighbors) {
        if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
          const nextIdx = nr * 3 + nc;
          if (!powered.has(nextIdx) && currPorts.includes(dir)) {
            const nextPorts = getEffectivePorts(nodes[nextIdx].basePorts, nodes[nextIdx].rot);
            if (nextPorts.includes(OPPOSITE[dir])) {
              powered.add(nextIdx);
              queue.push(nextIdx);
            }
          }
        }
      }
    }

    return powered;
  }, [nodes]);

  // Check victory condition: Target node (8) is powered
  useEffect(() => {
    if (poweredNodes.has(8) && !solved) {
      setSolved(true);
      playBreachFanfare();
      setTimeout(() => {
        onSolved();
      }, 1100);
    }
  }, [poweredNodes, solved, onSolved]);

  const handleRotate = (idx) => {
    if (solved) return;
    playHackingBeep(850 + (nodes[idx]?.rot || 0) * 150);
    setNodes((prev) =>
      prev.map((n, i) => (i === idx ? { ...n, rot: (n.rot + 1) % 4 } : n))
    );
  };

  return (
    <div className="hack-puzzle-container circuit-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Terminal size={14} className="hack-icon-pulse" />
          <span>ctOS // NETWORK_CIRCUIT_BYPASS.sh</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge">
            {solved ? 'ACCESS_GRANTED' : 'FIREWALL_LOCKED'}
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
          Rotate network junction nodes to establish power flow from{' '}
          <strong className="hl-green">SRC [WAN_01]</strong> to{' '}
          <strong className="hl-cyan">TARGET [ROOT_KERNEL]</strong>.
        </p>
      </div>

      {/* 3x3 Circuit Nodes Grid */}
      <div className="circuit-grid">
        {nodes.map((n, idx) => {
          const isPowered = poweredNodes.has(idx);
          const isStart = idx === 0;
          const isEnd = idx === 8;

          return (
            <div
              key={n.id}
              className={`circuit-cell ${isPowered ? 'powered' : ''} ${
                isStart ? 'start-node' : ''
              } ${isEnd ? 'target-node' : ''}`}
              onClick={() => handleRotate(idx)}
              title="Click to rotate junction"
            >
              <div
                className="junction-node"
                style={{ transform: `rotate(${n.rot * 90}deg)` }}
              >
                {/* Visual Connector Pipes */}
                {n.basePorts.includes(0) && <div className="pipe pipe-top" />}
                {n.basePorts.includes(1) && <div className="pipe pipe-right" />}
                {n.basePorts.includes(2) && <div className="pipe pipe-bottom" />}
                {n.basePorts.includes(3) && <div className="pipe pipe-left" />}
                <div className="center-core">
                  {isStart ? 'SRC' : isEnd ? 'ROOT' : <RotateCw size={10} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {solved ? (
        <div className="hack-success-banner">
          <CheckCircle2 size={16} />
          <span>CIRCUIT ALIGNED // KERNEL ACCESS GRANTED</span>
        </div>
      ) : (
        <div className="hack-hint-bar">
          <span className="live-blip" />
          <span>Click junctions to rotate 90° · Align data current</span>
        </div>
      )}
    </div>
  );
}
