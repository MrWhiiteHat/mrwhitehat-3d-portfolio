import React, { useState, useEffect } from 'react';
import { CheckCircle2, Database, RefreshCw, Zap } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';
import SpeedrunTimer from '../leaderboard/SpeedrunTimer.jsx';
import { recordSolveTime } from '../../utils/speedrunLeaderboardService.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'pwn-stack-matrix-buffer';
const REVEALED_FLAG = 'FLAG{buffer_overflow_eip_overwritten_0x55}';

const HEX_POOL = ['1C', 'E9', 'BD', '55', '7A'];
const TARGET_SEQ = ['1C', 'BD', '55'];

function generateSolvableMatrix() {
  const m = [];
  for (let r = 0; r < 4; r++) {
    const row = [];
    for (let c = 0; c < 4; c++) {
      row.push(HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)]);
    }
    m.push(row);
  }

  const c0 = Math.floor(Math.random() * 4);
  m[0][c0] = TARGET_SEQ[0]; // '1C'

  const r1 = 1 + Math.floor(Math.random() * 3);
  m[r1][c0] = TARGET_SEQ[1]; // 'BD'

  let c2 = Math.floor(Math.random() * 4);
  if (c2 === c0) c2 = (c0 + 1) % 4;
  m[r1][c2] = TARGET_SEQ[2]; // '55'

  const altC0 = (c0 + 2) % 4;
  m[0][altC0] = TARGET_SEQ[0];
  const altR1 = ((r1 % 3) + 1);
  m[altR1][altC0] = TARGET_SEQ[1];
  const altC2 = (altC0 + 1) % 4;
  m[altR1][altC2] = TARGET_SEQ[2];

  return m;
}

export default function HexBufferHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [matrix, setMatrix] = useState(generateSolvableMatrix);
  const targetSeq = TARGET_SEQ;
  const [buffer, setBuffer] = useState([]);
  const [activeMode, setActiveMode] = useState('row');
  const [activeIdx, setActiveIdx] = useState(0);
  const [pickedCoords, setPickedCoords] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [failed, setFailed] = useState(false);
  const [invalidShake, setInvalidShake] = useState(false);
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const getNextNeededByte = () => {
    const bufStr = buffer.join('');
    if (bufStr.endsWith('1CBD')) return '55';
    if (bufStr.endsWith('1C')) return 'BD';
    return '1C';
  };

  const nextNeeded = getNextNeededByte();

  useEffect(() => {
    const bufferStr = buffer.join('');
    const targetStr = targetSeq.join('');
    if (bufferStr.includes(targetStr) && !solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => {
        onSolved?.();
      }, 1500);
      return;
    }

    if (buffer.length >= 5 && !solved) {
      setFailed(true);
      playClickSound(360, 0.15);
    }
  }, [buffer, targetSeq, solved, onSolved]);

  const handleCellClick = (r, c) => {
    if (solved || failed) return;
    if (pickedCoords.some((p) => p.r === r && p.c === c)) return;

    const isValid =
      (activeMode === 'row' && r === activeIdx) ||
      (activeMode === 'col' && c === activeIdx);

    if (!isValid) {
      playClickSound(300, 0.08);
      setInvalidShake(true);
      setTimeout(() => setInvalidShake(false), 300);
      return;
    }

    const val = matrix[r][c];
    playHackingBeep(920 + buffer.length * 160);
    setBuffer((prev) => [...prev, val]);
    setPickedCoords((prev) => [...prev, { r, c }]);
    setHoveredCell(null);

    if (activeMode === 'row') {
      setActiveMode('col');
      setActiveIdx(c);
    } else {
      setActiveMode('row');
      setActiveIdx(r);
    }
  };

  const resetPuzzle = () => {
    playClickSound(700);
    setMatrix(generateSolvableMatrix());
    setBuffer([]);
    setActiveMode('row');
    setActiveIdx(0);
    setPickedCoords([]);
    setHoveredCell(null);
    setFailed(false);
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
    <div className={`hack-puzzle-container hex-hack ${invalidShake ? 'shake-puzzle' : ''}`}>
      <div className="hack-header-bar">
        <div className="hack-title">
          <Database size={14} className="hack-icon-pulse text-cyan-400" />
          <span>CTF MISSION // BINARY EXPLOITATION: STACK OVERFLOW HIJACK</span>
        </div>
        <div className="hack-actions-right">
          <SpeedrunTimer isRunning={!solved} isSolved={solved} puzzleId="skills" onFinish={(t) => recordSolveTime("skills", t)} />
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 200} PTS`}
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
          Overflow the stack frame buffer without tripping canary values. Jump between row and column execution pointers to route memory to return address <strong className="text-cyan-400">0x55</strong> (win function).
        </p>
      </div>

      {/* Target & Buffer Status Bar */}
      <div className="hex-status-row">
        <div className="seq-box">
          <span className="seq-lbl">STACK TARGET VECTOR:</span>
          <div className="seq-pills">
            {targetSeq.map((hex, i) => {
              const isMatched =
                (i === 0 && buffer.includes('1C')) ||
                (i === 1 && buffer.join('').includes('1CBD')) ||
                (i === 2 && buffer.join('').includes('1CBD55'));
              const isCurrent = hex === nextNeeded && !isMatched;

              return (
                <span
                  key={`t-${i}`}
                  className={`target-pill ${isMatched ? 'matched-pill' : ''} ${
                    isCurrent ? 'current-needed-pill' : ''
                  }`}
                >
                  {hex}
                </span>
              );
            })}
          </div>
        </div>

        <div className="buffer-box">
          <span className="seq-lbl">BUFFER ({buffer.length}/5):</span>
          <div className="seq-pills">
            {[0, 1, 2, 3, 4].map((slotIdx) => (
              <span
                key={`b-${slotIdx}`}
                className={`buffer-pill ${buffer[slotIdx] ? 'filled' : 'empty'}`}
              >
                {buffer[slotIdx] || '__'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4x4 Code Matrix */}
      <div className={`matrix-table active-mode-${activeMode}`}>
        {matrix.map((row, r) => (
          <div
            key={`r-${r}`}
            className={`matrix-row ${activeMode === 'row' && r === activeIdx ? 'row-highlighted' : ''}`}
          >
            {row.map((val, c) => {
              const isPicked = pickedCoords.some((p) => p.r === r && p.c === c);
              const isActive =
                !isPicked &&
                ((activeMode === 'row' && r === activeIdx) ||
                  (activeMode === 'col' && c === activeIdx));
              const isHoveredFuture =
                hoveredCell &&
                !isPicked &&
                ((activeMode === 'row' && c === hoveredCell.c && r !== activeIdx) ||
                  (activeMode === 'col' && r === hoveredCell.r && c !== activeIdx));
              const isNextKey = isActive && val === nextNeeded;

              return (
                <button
                  type="button"
                  key={`cell-${r}-${c}`}
                  className={`matrix-cell ${isActive ? 'cell-active' : 'cell-dim'} ${
                    isPicked ? 'cell-used' : ''
                  } ${isNextKey ? 'cell-recommended' : ''} ${
                    isHoveredFuture ? 'cell-future-path' : ''
                  }`}
                  onClick={() => handleCellClick(r, c)}
                  onPointerEnter={() => isActive && setHoveredCell({ r, c })}
                  onPointerLeave={() => setHoveredCell(null)}
                  disabled={isPicked}
                  title={
                    isActive
                      ? `Click to inject ${val}`
                      : `Inactive (Select from active ${activeMode.toUpperCase()})`
                  }
                >
                  {isPicked ? '··' : val}
                </button>
              );
            })}
          </div>
        ))}
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
            <span className="font-bold text-emerald-300">INSTRUCTION POINTER OVERWRITTEN // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+200 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : failed ? (
        <div className="hack-failed-banner mt-2">
          <span>BUFFER CAPACITY EXCEEDED // OVERFLOW MISMATCH</span>
          <button type="button" className="hack-retry-btn" onClick={resetPuzzle}>
            <RefreshCw size={12} /> Retry Solvable Matrix
          </button>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>
            Active vector: <strong style={{ color: '#38bdf8' }}>{activeMode.toUpperCase()} {activeIdx + 1}</strong>
            {hoveredCell && (
              <span style={{ color: '#a5f3fc', marginLeft: '6px' }}>
                → Next branch: {activeMode === 'row' ? `COL ${hoveredCell.c + 1}` : `ROW ${hoveredCell.r + 1}`}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
