import React, { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, Cpu, RotateCw, ShieldAlert, Sparkles, Terminal } from 'lucide-react';
import { playBreachFanfare, playHackingBeep, playZapSound } from '../../utils/audio.js';
import SpeedrunTimer from '../leaderboard/SpeedrunTimer.jsx';
import { recordSolveTime } from '../../utils/speedrunLeaderboardService.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'net-lateral-pivot-ad';
const REVEALED_FLAG = 'FLAG{lateral_movement_chisel_pivot_established}';

const OPPOSITE = [2, 3, 0, 1];

const INITIAL_GRID = [
  { id: 0, type: 'corner', basePorts: [1, 2], rot: 1 },
  { id: 1, type: 'line', basePorts: [0, 2], rot: 0 },
  { id: 2, type: 'corner', basePorts: [2, 3], rot: 0 },
  { id: 3, type: 'line', basePorts: [1, 3], rot: 0 },
  { id: 4, type: 'tee', basePorts: [0, 1, 2], rot: 2 },
  { id: 5, type: 'line', basePorts: [0, 2], rot: 1 },
  { id: 6, type: 'corner', basePorts: [0, 1], rot: 3 },
  { id: 7, type: 'line', basePorts: [1, 3], rot: 1 },
  { id: 8, type: 'corner', basePorts: [0, 3], rot: 2 },
];

function getEffectivePorts(basePorts, rot) {
  return basePorts.map((p) => (p + rot) % 4);
}

export default function NetworkCircuitHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [nodes, setNodes] = useState(() =>
    INITIAL_GRID.map((n) => ({ ...n, rot: Math.floor(Math.random() * 4) }))
  );
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const poweredNodes = useMemo(() => {
    const powered = new Set([0]);
    const queue = [0];

    while (queue.length > 0) {
      const curr = queue.shift();
      const r = Math.floor(curr / 3);
      const c = curr % 3;
      const currPorts = getEffectivePorts(nodes[curr].basePorts, nodes[curr].rot);

      const neighbors = [
        { dir: 0, nr: r - 1, nc: c },
        { dir: 1, nr: r, nc: c + 1 },
        { dir: 2, nr: r + 1, nc: c },
        { dir: 3, nr: r, nc: c - 1 },
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

  useEffect(() => {
    if (poweredNodes.has(8) && !solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => {
        onSolved?.();
      }, 1500);
    }
  }, [poweredNodes, solved, onSolved]);

  const handleRotate = (idx) => {
    if (solved) return;
    playHackingBeep(850 + (nodes[idx]?.rot || 0) * 150);
    setNodes((prev) =>
      prev.map((n, i) => (i === idx ? { ...n, rot: (n.rot + 1) % 4 } : n))
    );
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
    <div className="hack-puzzle-container circuit-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Terminal size={14} className="hack-icon-pulse text-cyan-400" />
          <span>CTF MISSION // NETWORK SECURITY: SUBNET PIVOTING & LATERAL TUNNEL</span>
        </div>
        <div className="hack-actions-right">
          <SpeedrunTimer isRunning={!solved} isSolved={solved} puzzleId="projects" onFinish={(t) => recordSolveTime("projects", t)} />
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 350} PTS`}
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
          Route internal subnet gateways through firewalled enclaves. Rotate routing junction nodes to establish an encrypted Chisel / SOCKS5 tunnel from <strong className="text-emerald-400">SRC [DMZ_192.168.1.100]</strong> to <strong className="text-cyan-400">DC [ROOT_10.10.10.5]</strong>.
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
              title="Click to rotate router junction"
            >
              <div
                className="junction-node"
                style={{ transform: `rotate(${n.rot * 90}deg)` }}
              >
                {n.basePorts.includes(0) && <div className="pipe pipe-top" />}
                {n.basePorts.includes(1) && <div className="pipe pipe-right" />}
                {n.basePorts.includes(2) && <div className="pipe pipe-bottom" />}
                {n.basePorts.includes(3) && <div className="pipe pipe-left" />}
                <div className="center-core">
                  {isStart ? 'SRC' : isEnd ? 'DC' : <RotateCw size={10} />}
                </div>
              </div>
            </div>
          );
        })}
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
            <span className="font-bold text-emerald-300">LATERAL MOVEMENT TUNNEL ESTABLISHED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+350 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Click junctions to rotate 90° · Connect SRC (0) to Domain Controller (8)</span>
        </div>
      )}
    </div>
  );
}
