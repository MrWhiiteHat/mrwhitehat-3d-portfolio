import React, { useState } from 'react';
import {
  KeyRound,
  CheckCircle2,
  Zap,
  Play,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Copy,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { playClickSound, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

const CHALLENGE_ID = 'crypto-caesar-tumbler';
const ENCRYPTED_TELEGRAM = 'IODJ{fdhvdu_vkliw_urw3_fohdudqfh}';

function caesarShift(text, shift) {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
      }
      return char;
    })
    .join('');
}

export default function CyberChefApp({ onOpenStation }) {
  const [inputText, setInputText] = useState(ENCRYPTED_TELEGRAM);
  const [caesarShiftKey, setCaesarShiftKey] = useState(0);
  const [activeOps, setActiveOps] = useState([]);
  const [showHints, setShowHints] = useState(true);
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  // Compute live output through recipe
  let outputText = inputText;
  if (activeOps.includes('caesar')) {
    outputText = caesarShift(outputText, caesarShiftKey);
  }

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, manualFlag.trim());
    if (res.success || res.duplicate) {
      const stationId = res.stationId || 'about';
      setFlagFeedback({
        success: true,
        text: res.message,
        stationId,
        stationName: 'ABOUT DOSSIER'
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
          <KeyRound size={15} style={{ color: '#38bdf8' }} />
          <span>CYBERCHEF v10.5 // CRYPTANALYSIS WORKBENCH</span>
          <span className="cos-badge cos-badge-amber">ROT-3 CAESAR CIPHER</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`cos-hint-toggle ${showHints ? 'is-active' : ''}`}
            onClick={() => setShowHints((prev) => !prev)}
            title="Toggle Step-by-Step Solving Guide & Hints"
          >
            <HelpCircle size={13} />
            <span>{showHints ? 'HIDE HINTS' : '💡 HOW TO SOLVE'}</span>
          </button>

          <button
            type="button"
            className="cos-btn"
            onClick={() => {
              playClickSound(800);
              setInputText(ENCRYPTED_TELEGRAM);
              setCaesarShiftKey(-3);
              setActiveOps(['caesar']);
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Preset</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Hint & Walkthrough Drawer */}
      {showHints && (
        <div className="cos-hint-drawer">
          <div className="cos-hint-header-bar">
            <div className="cos-hint-title">
              <Sparkles size={14} />
              <span>CRYPTANALYSIS SOLVING GUIDE // OPERATION CAESAR</span>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Category: Cryptography · Difficulty: Easy · Reward: +100 PTS</span>
          </div>

          <div className="cos-hint-grid">
            <div className="cos-hint-card">
              <h4>🎯 Objective</h4>
              <p>The intercepted telegram uses a classical monoalphabetic substitution cipher (Caesar shift). Decrypt the ciphertext to recover the flag.</p>
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>Input Ciphertext:</span><br />
                <code className="cos-hint-code">{ENCRYPTED_TELEGRAM}</code>
              </div>
            </div>

            <div className="cos-hint-card">
              <h4>🔍 Frequency Analysis Clue</h4>
              <p>In standard English, the most frequent letter is <strong>'E'</strong> (~12.7%). In this ciphertext, the letter <strong>'H'</strong> occurs with the highest frequency (14.1%).</p>
              <p>Distance from <code>H</code> (ASCII 72) backward to <code>E</code> (ASCII 69) is <strong style={{ color: '#fbbf24' }}>-3 shifts</strong> (A ➔ X, B ➔ Y, C ➔ Z).</p>
            </div>

            <div className="cos-hint-card">
              <h4>🛠️ How to Solve</h4>
              <p>1. In the <strong>Recipe Pipeline</strong>, add the <strong>Caesar Cipher</strong> operation.</p>
              <p>2. Use frequency analysis to deduce the shift distance from cipher letter 'H' to English letter 'E'.</p>
              <p>3. Adjust the <strong>Shift Key</strong> until the decrypted output becomes legible English containing the flag!</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main 3-Column Workspace (Palette | Recipe | I/O) */}
      <div className="cos-app-body">
        <div className="cos-grid-3">
          {/* Column 1: Operations Palette */}
          <div className="cos-panel">
            <div className="cos-panel-header">
              <span>OPERATIONS PALETTE</span>
            </div>
            <div className="cos-panel-body">
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Available Ciphers
              </div>

              <div
                className="cos-op-item"
                onClick={() => {
                  playClickSound(850);
                  if (!activeOps.includes('caesar')) setActiveOps([...activeOps, 'caesar']);
                }}
              >
                <span>Caesar Cipher (Shift)</span>
                <span className="cos-badge cos-badge-cyan">Active</span>
              </div>

              <div
                className="cos-op-item"
                onClick={() => {
                  playClickSound(850);
                  setCaesarShiftKey(13);
                }}
              >
                <span>ROT13 (Preset Shift 13)</span>
                <span className="cos-badge cos-badge-amber">Shift 13</span>
              </div>

              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', margin: '8px 0 4px' }}>
                Encodings
              </div>

              <div
                className="cos-op-item"
                onClick={() => {
                  playClickSound(850);
                  try {
                    setInputText(btoa(inputText));
                  } catch (_) {}
                }}
              >
                <span>To Base64</span>
                <span className="cos-badge">Encode</span>
              </div>

              <div
                className="cos-op-item"
                onClick={() => {
                  playClickSound(850);
                  try {
                    setInputText(atob(inputText));
                  } catch (_) {}
                }}
              >
                <span>From Base64</span>
                <span className="cos-badge">Decode</span>
              </div>

              {/* Frequency Analysis Mini-Table */}
              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                  FREQUENCY ANALYSIS:
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  <div>Cipher <strong>H</strong>: 14.1% ➔ English <strong>E</strong>: 12.7%</div>
                  <div>Cipher <strong>W</strong>: 10.1% ➔ English <strong>T</strong>: 9.1%</div>
                  <div>Cipher <strong>D</strong>: 9.0% ➔ English <strong>A</strong>: 8.2%</div>
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '4px' }}>
                  Count alphabetical shift distance from cipher letter 'H' to English 'E'.
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Recipe Pipeline */}
          <div className="cos-panel">
            <div className="cos-panel-header">
              <span>RECIPE PIPELINE ({activeOps.length})</span>
              <button
                type="button"
                className="cos-btn"
                style={{ fontSize: '9.5px', padding: '1px 6px' }}
                onClick={() => {
                  setActiveOps([]);
                  setCaesarShiftKey(0);
                }}
              >
                Clear
              </button>
            </div>
            <div className="cos-panel-body">
              {activeOps.includes('caesar') ? (
                <div className="cos-recipe-card">
                  <div className="cos-recipe-header">
                    <span>1. Caesar Cipher</span>
                    <button
                      type="button"
                      className="cos-win-btn btn-close"
                      style={{ width: '18px', height: '18px' }}
                      onClick={() => setActiveOps(activeOps.filter((o) => o !== 'caesar'))}
                      title="Remove Step"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '4px' }}>
                      <span style={{ color: '#94a3b8' }}>Shift Key (Offset):</span>
                      <strong style={{ color: caesarShiftKey === -3 ? '#34d399' : '#38bdf8' }}>
                        {caesarShiftKey} {caesarShiftKey === -3 ? '(CRACKED KEY!)' : ''}
                      </strong>
                    </div>

                    <input
                      type="range"
                      min="-25"
                      max="25"
                      value={caesarShiftKey}
                      onChange={(e) => {
                        playClickSound(1100);
                        setCaesarShiftKey(parseInt(e.target.value, 10));
                      }}
                      style={{ width: '100%', accentColor: '#38bdf8' }}
                    />

                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <button
                        type="button"
                        className="cos-btn"
                        style={{ flex: 1, fontSize: '10px' }}
                        onClick={() => setCaesarShiftKey(0)}
                      >
                        Reset Shift: 0
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 10px', fontSize: '11px' }}>
                  No operations in recipe pipeline.<br />Click Caesar Cipher on the left to add.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Input & Output Panels */}
          <div className="cos-split-vertical">
            {/* Input Box */}
            <div className="cos-panel" style={{ flex: 1 }}>
              <div className="cos-panel-header">
                <span>INPUT CIPHERTEXT</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>{inputText.length} bytes</span>
              </div>
              <div className="cos-panel-body" style={{ padding: '4px' }}>
                <textarea
                  className="cos-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste encrypted string here..."
                />
              </div>
            </div>

            {/* Output Box */}
            <div className="cos-panel" style={{ flex: 1.2 }}>
              <div className="cos-panel-header">
                <span style={{ color: '#34d399' }}>OUTPUT PLAINTEXT (Auto-bake Active)</span>
              </div>
              <div className="cos-panel-body" style={{ padding: '4px' }}>
                <textarea
                  className="cos-textarea cos-textarea-output"
                  readOnly
                  value={outputText}
                />
              </div>
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
