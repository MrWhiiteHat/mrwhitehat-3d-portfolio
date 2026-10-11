import React, { useState, useEffect } from 'react';
import { Binary, CheckCircle2, Cpu, Database, RefreshCw, Terminal } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';

const HEX_POOL = ['1C', 'E9', 'BD', '55', '7A'];

function generateMatrix() {
  const m = [];
  for (let r = 0; r < 4; r++) {
    const row = [];
    for (let c = 0; c < 4; c++) {
      row.push(HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)]);
    }
    m.push(row);
  }
  return m;
}

export default function HexBufferHack({ onSolved, onBypass }) {
  const [matrix, setMatrix] = useState(generateMatrix);
  // Target sequence to solve: 3 bytes
  const [targetSeq] = useState(['1C', 'BD', '55']);
  // Current buffer picks
  const [buffer, setBuffer] = useState([]);
  // Mode: 'row' or 'col'
  const [activeMode, setActiveMode] = useState('row');
  // Current active index (starts at row 0)
  const [activeIdx, setActiveIdx] = useState(0);
  // Selected coordinates history: Array of {r, c}
  const [pickedCoords, setPickedCoords] = useState([]);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);

  // Check victory / buffer status
  useEffect(() => {
    // Check if buffer contains targetSeq
    const bufferStr = buffer.join('');
    const targetStr = targetSeq.join('');
    if (bufferStr.includes(targetStr) && !solved) {
      setSolved(true);
      playBreachFanfare();
      setTimeout(() => {
        onSolved();
      }, 1100);
      return;
    }

    if (buffer.length >= 4 && !solved) {
      setFailed(true);
      playClickSound(400, 0.15);
    }
  }, [buffer, targetSeq, solved, onSolved]);

  const handleCellClick = (r, c) => {
    if (solved || failed) return;

    // Check if cell already picked
    if (pickedCoords.some((p) => p.r === r && p.c === c)) return;

    // Validate that clicked cell is in active row or column
    if (activeMode === 'row' && r !== activeIdx) return;
    if (activeMode === 'col' && c !== activeIdx) return;

    const val = matrix[r][c];
    playHackingBeep(900 + buffer.length * 150);
    setBuffer((prev) => [...prev, val]);
    setPickedCoords((prev) => [...prev, { r, c }]);

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
    setMatrix(generateMatrix());
    setBuffer([]);
    setActiveMode('row');
    setActiveIdx(0);
    setPickedCoords([]);
    setFailed(false);
  };

  return (
    <div className="hack-puzzle-container hex-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Database size={14} className="hack-icon-pulse" />
          <span>VAULT_BREACH // MEMORY_BUFFER_OVERFLOW.hex</span>
        </div>
        <div className="hack-actions-right">
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
          Select bytes from the highlighted {activeMode.toUpperCase()} to match sequence{' '}
          <span className="code-seq">{targetSeq.join(' ')}</span> into the memory buffer.
        </p>
      </div>

      {/* Target & Buffer Status Bar */}
      <div className="hex-status-row">
        <div className="seq-box">
          <span className="seq-lbl">TARGET SEQUENCE:</span>
          <div className="seq-pills">
            {targetSeq.map((hex, i) => (
              <span key={`t-${i}`} className="target-pill">
                {hex}
              </span>
            ))}
          </div>
        </div>

        <div className="buffer-box">
          <span className="seq-lbl">BUFFER:</span>
          <div className="seq-pills">
            {[0, 1, 2, 3].map((slotIdx) => (
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
      <div className="matrix-table">
        {matrix.map((row, r) => (
          <div key={`r-${r}`} className="matrix-row">
            {row.map((val, c) => {
              const isPicked = pickedCoords.some((p) => p.r === r && p.c === c);
              const isActive =
                !isPicked &&
                ((activeMode === 'row' && r === activeIdx) ||
                  (activeMode === 'col' && c === activeIdx));

              return (
                <button
                  key={`cell-${r}-${c}`}
                  className={`matrix-cell ${isActive ? 'cell-active' : ''} ${
                    isPicked ? 'cell-used' : ''
                  }`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={isPicked || !isActive}
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
          <span>BUFFER FULL // SEQUENCE MISMATCH</span>
          <button className="hack-retry-btn" onClick={resetPuzzle}>
            <RefreshCw size={12} /> Retry Matrix
          </button>
        </div>
      ) : (
        <div className="hack-hint-bar">
          <span className="live-blip" />
          <span>Active selection: {activeMode.toUpperCase()} {activeIdx + 1}</span>
        </div>
      )}
    </div>
  );
}
