import React, { useState, useEffect } from 'react';
import { CheckCircle2, Database, RefreshCw } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';
import SpeedrunTimer from '../leaderboard/SpeedrunTimer.jsx';
import { recordSolveTime } from '../../utils/speedrunLeaderboardService.js';

const HEX_POOL = ['1C', 'E9', 'BD', '55', '7A'];
const TARGET_SEQ = ['1C', 'BD', '55'];

/**
 * Generates a 4x4 matrix that is 100% mathematically GUARANTEED to have
 * at least 2 valid paths from row 0 to complete TARGET_SEQ ('1C' -> 'BD' -> '55').
 */
function generateSolvableMatrix() {
  const m = [];
  for (let r = 0; r < 4; r++) {
    const row = [];
    for (let c = 0; c < 4; c++) {
      row.push(HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)]);
    }
    m.push(row);
  }

  // 1. Plant Primary Guaranteed Path:
  // Step 1: Start in row 0 at random column c0
  const c0 = Math.floor(Math.random() * 4);
  m[0][c0] = TARGET_SEQ[0]; // '1C'

  // Step 2: In column c0, pick a row r1 (between 1 and 3)
  const r1 = 1 + Math.floor(Math.random() * 3);
  m[r1][c0] = TARGET_SEQ[1]; // 'BD'

  // Step 3: In row r1, pick a column c2 (different from c0)
  let c2 = Math.floor(Math.random() * 4);
  if (c2 === c0) c2 = (c0 + 1) % 4;
  m[r1][c2] = TARGET_SEQ[2]; // '55'

  // 2. Plant Alternate Second Path from a different starting column in row 0
  const altC0 = (c0 + 2) % 4;
  m[0][altC0] = TARGET_SEQ[0]; // '1C'
  const altR1 = ((r1 % 3) + 1);
  m[altR1][altC0] = TARGET_SEQ[1]; // 'BD'
  const altC2 = (altC0 + 1) % 4;
  m[altR1][altC2] = TARGET_SEQ[2]; // '55'

  return m;
}

export default function HexBufferHack({ onSolved, onBypass }) {
  const [matrix, setMatrix] = useState(generateSolvableMatrix);
  const targetSeq = TARGET_SEQ;
  // Current buffer picks (up to 5 slots for forgiving, strategic gameplay)
  const [buffer, setBuffer] = useState([]);
  // Mode: 'row' or 'col'
  const [activeMode, setActiveMode] = useState('row');
  // Current active index (starts at row 0)
  const [activeIdx, setActiveIdx] = useState(0);
  // Selected coordinates history: Array of {r, c}
  const [pickedCoords, setPickedCoords] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [invalidShake, setInvalidShake] = useState(false);

  // Compute what byte the player currently needs next in targetSeq
  const getNextNeededByte = () => {
    const bufStr = buffer.join('');
    if (bufStr.endsWith('1CBD')) return '55';
    if (bufStr.endsWith('1C')) return 'BD';
    return '1C';
  };

  const nextNeeded = getNextNeededByte();

  // Check victory / buffer status
  useEffect(() => {
    const bufferStr = buffer.join('');
    const targetStr = targetSeq.join('');
    if (bufferStr.includes(targetStr) && !solved) {
      setSolved(true);
      playBreachFanfare();
      setTimeout(() => {
        onSolved();
      }, 1000);
      return;
    }

    // 5 buffer slots give generous leeway for navigation
    if (buffer.length >= 5 && !solved) {
      setFailed(true);
      playClickSound(360, 0.15);
    }
  }, [buffer, targetSeq, solved, onSolved]);

  const handleCellClick = (r, c) => {
    if (solved || failed) return;

    // Check if cell already picked
    if (pickedCoords.some((p) => p.r === r && p.c === c)) return;

    // Validate that clicked cell is in active row or column
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

    // Switch mode
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

  return (
    <div className={`hack-puzzle-container hex-hack ${invalidShake ? 'shake-puzzle' : ''}`}>
      <div className="hack-header-bar">
        <div className="hack-title">
          <Database size={14} className="hack-icon-pulse" />
          <span>VAULT_BREACH // MEMORY_BUFFER_OVERFLOW.hex</span>
        </div>
        <div className="hack-actions-right">
          <SpeedrunTimer isRunning={!solved} isSolved={solved} puzzleId="skills" onFinish={(t) => recordSolveTime("skills", t)} />
          <span className="hack-status-badge">
            {solved ? 'BUFFER_INJECTED' : 'BUFFER_LOCKED'}
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
          Pick bytes from the highlighted <strong style={{ color: '#38bdf8' }}>{activeMode.toUpperCase()} {activeIdx + 1}</strong> to sequence{' '}
          <span className="code-seq">{targetSeq.join(' ')}</span> into the memory buffer.
        </p>
      </div>

      {/* Target & Buffer Status Bar */}
      <div className="hex-status-row">
        <div className="seq-box">
          <span className="seq-lbl">TARGET SEQUENCE:</span>
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
                      ? `Click to inject ${val} (Switches to ${activeMode === 'row' ? `COLUMN ${c + 1}` : `ROW ${r + 1}`})`
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

      {solved ? (
        <div className="hack-success-banner">
          <CheckCircle2 size={16} />
          <span>BUFFER OVERFLOW COMPLETE // VAULT UNSEALED</span>
        </div>
      ) : failed ? (
        <div className="hack-failed-banner">
          <span>BUFFER CAPACITY EXCEEDED // OVERFLOW MISMATCH</span>
          <button type="button" className="hack-retry-btn" onClick={resetPuzzle}>
            <RefreshCw size={12} /> Retry Solvable Matrix
          </button>
        </div>
      ) : (
        <div className="hack-hint-bar">
          <span className="live-blip" />
          <span>
            Active line: <strong style={{ color: '#38bdf8' }}>{activeMode.toUpperCase()} {activeIdx + 1}</strong>
            {hoveredCell ? (
              <span style={{ color: '#a5f3fc', marginLeft: '6px' }}>
                → Next will activate: {activeMode === 'row' ? `COL ${hoveredCell.c + 1}` : `ROW ${hoveredCell.r + 1}`}
              </span>
            ) : (
              <span style={{ color: '#94a3b8', marginLeft: '6px' }}>
                (Hover over a cell to preview next branch)
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
