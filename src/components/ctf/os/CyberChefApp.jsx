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
  ArrowDown,
  ArrowUp,
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
        return String.fromCharCode(((code - 65 + shift + 260) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift + 260) % 26) + 97);
      }
      return char;
    })
    .join('');
}

function xorCipher(text, key) {
  if (!key) return text;
  return text
    .split('')
    .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length)))
    .join('');
}

function fromHex(hex) {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  let str = '';
  for (let i = 0; i < clean.length; i += 2) {
    str += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
  }
  return str;
}

function toHex(str) {
  return str
    .split('')
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join(' ');
}

export default function CyberChefApp({ onOpenStation }) {
  const [inputText, setInputText] = useState(ENCRYPTED_TELEGRAM);
  const [recipe, setRecipe] = useState([
    { id: 'op-1', type: 'caesar', label: 'Caesar Cipher', shift: 0 },
  ]);
  const [showHints, setShowHints] = useState(true);
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  // Compute live output through sequential chained recipe
  let outputText = inputText;
  for (const op of recipe) {
    try {
      if (op.type === 'caesar') {
        outputText = caesarShift(outputText, op.shift || 0);
      } else if (op.type === 'rot13') {
        outputText = caesarShift(outputText, 13);
      } else if (op.type === 'from_base64') {
        outputText = atob(outputText.trim());
      } else if (op.type === 'to_base64') {
        outputText = btoa(outputText);
      } else if (op.type === 'from_hex') {
        outputText = fromHex(outputText);
      } else if (op.type === 'to_hex') {
        outputText = toHex(outputText);
      } else if (op.type === 'url_decode') {
        outputText = decodeURIComponent(outputText);
      } else if (op.type === 'url_encode') {
        outputText = encodeURIComponent(outputText);
      } else if (op.type === 'xor') {
        outputText = xorCipher(outputText, op.key || 'secret');
      } else if (op.type === 'reverse') {
        outputText = outputText.split('').reverse().join('');
      }
    } catch {
      outputText = `[Error executing operation: ${op.label}]`;
      break;
    }
  }

  const addOperation = (type, label, defaultProps = {}) => {
    playClickSound(950);
    const newOp = {
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      label,
      ...defaultProps,
    };
    setRecipe((prev) => [...prev, newOp]);
  };

  const removeOperation = (id) => {
    playClickSound(800);
    setRecipe((prev) => prev.filter((o) => o.id !== id));
  };

  const updateOpProp = (id, prop, val) => {
    setRecipe((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [prop]: val } : o))
    );
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    let flagToSubmit = manualFlag.trim();
    if (!flagToSubmit && outputText.includes('FLAG{')) {
      const match = outputText.match(/FLAG\{[^}]+\}/);
      if (match) {
        flagToSubmit = match[0];
        setManualFlag(flagToSubmit);
      }
    }
    if (!flagToSubmit) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, flagToSubmit);
    if (res.success || res.duplicate) {
      const stationId = res.stationId || 'about';
      setFlagFeedback({
        success: true,
        text: res.message,
        stationId,
        stationName: 'ABOUT DOSSIER',
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
          <span className="cos-badge cos-badge-amber">CHAINED RECIPE PIPELINE</span>
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
              setRecipe([{ id: 'op-1', type: 'caesar', label: 'Caesar Cipher', shift: -3 }]);
            }}
          >
            <RotateCcw size={12} />
            <span>Load Cracked Preset (-3)</span>
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
              <p>Distance from <code>H</code> backward to <code>E</code> is <strong style={{ color: '#fbbf24' }}>-3 letters</strong> (H ➔ G ➔ F ➔ E).</p>
            </div>

            <div className="cos-hint-card">
              <h4>🛠️ Step-by-Step Walkthrough</h4>
              <p>1. In the <strong>Operations Palette</strong> on the left, click <strong>Caesar Cipher</strong>.</p>
              <p>2. In the <strong>Recipe Pipeline</strong>, drag the <strong>Shift Key</strong> slider to <strong style={{ color: '#38bdf8' }}>-3</strong>.</p>
              <p>3. Notice the <strong>Output Plaintext</strong> box immediately deciphers the secret message into readable English!</p>
              <p>4. Locate the decrypted flag inside the text, copy it, and paste it into the submit box below.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main 3-Column Workspace (Palette | Recipe | I/O) */}
      <div className="cos-app-body">
        <div className="cos-grid-3">
          {/* Column 1: Operations Palette */}
          <div className="cos-panel" style={{ flex: '0 0 240px' }}>
            <div className="cos-panel-header">
              <span>OPERATIONS PALETTE</span>
            </div>
            <div className="cos-panel-body" style={{ gap: '3px' }}>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 700 }}>
                Ciphers
              </div>

              <div
                className="cos-op-item"
                onClick={() => addOperation('caesar', 'Caesar Cipher', { shift: -3 })}
              >
                <span>Caesar Cipher (Shift)</span>
                <span className="cos-badge cos-badge-cyan">+Add</span>
              </div>

              <div
                className="cos-op-item"
                onClick={() => addOperation('rot13', 'ROT13', { shift: 13 })}
              >
                <span>ROT13</span>
                <span className="cos-badge cos-badge-amber">+Add</span>
              </div>

              <div
                className="cos-op-item"
                onClick={() => addOperation('xor', 'XOR Cipher', { key: '1337' })}
              >
                <span>XOR</span>
                <span className="cos-badge">+Add</span>
              </div>

              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', margin: '6px 0 2px', fontWeight: 700 }}>
                Data Formats & Encodings
              </div>

              <div
                className="cos-op-item"
                onClick={() => addOperation('from_base64', 'From Base64')}
              >
                <span>From Base64 (Decode)</span>
                <span className="cos-badge cos-badge-emerald">+Add</span>
              </div>

              <div
                className="cos-op-item"
                onClick={() => addOperation('to_base64', 'To Base64')}
              >
                <span>To Base64 (Encode)</span>
                <span className="cos-badge">+Add</span>
              </div>

              <div
                className="cos-op-item"
                onClick={() => addOperation('from_hex', 'From Hex')}
              >
                <span>From Hex</span>
                <span className="cos-badge">+Add</span>
              </div>

              <div
                className="cos-op-item"
                onClick={() => addOperation('to_hex', 'To Hex')}
              >
                <span>To Hex</span>
                <span className="cos-badge">+Add</span>
              </div>

              <div
                className="cos-op-item"
                onClick={() => addOperation('url_decode', 'URL Decode')}
              >
                <span>URL Decode</span>
                <span className="cos-badge">+Add</span>
              </div>

              <div
                className="cos-op-item"
                onClick={() => addOperation('reverse', 'Reverse')}
              >
                <span>Reverse String</span>
                <span className="cos-badge">+Add</span>
              </div>

              {/* Frequency Analysis Mini-Table */}
              <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #1e293b' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginBottom: '2px' }}>
                  FREQUENCY ANALYSIS:
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: '1.5' }}>
                  <div>Cipher <strong>H</strong>: 14.1% ➔ English <strong>E</strong>: 12.7%</div>
                  <div>Shift required: <strong>-3 letters</strong></div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Recipe Pipeline */}
          <div className="cos-panel" style={{ flex: '0 0 260px' }}>
            <div className="cos-panel-header">
              <span>RECIPE PIPELINE ({recipe.length})</span>
              <button
                type="button"
                className="cos-btn"
                style={{ fontSize: '9.5px', padding: '1px 6px' }}
                onClick={() => {
                  playClickSound(800);
                  setRecipe([]);
                }}
              >
                Clear All
              </button>
            </div>
            <div className="cos-panel-body" style={{ gap: '6px' }}>
              {recipe.map((op, idx) => (
                <div key={op.id} className="cos-recipe-card">
                  <div className="cos-recipe-header">
                    <span style={{ fontWeight: 700 }}>{idx + 1}. {op.label}</span>
                    <button
                      type="button"
                      className="cos-win-btn btn-close"
                      style={{ width: '18px', height: '18px' }}
                      onClick={() => removeOperation(op.id)}
                      title="Remove Step"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>

                  {op.type === 'caesar' && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '2px' }}>
                        <span style={{ color: '#94a3b8' }}>Shift Key (Offset):</span>
                        <strong style={{ color: op.shift === -3 ? '#34d399' : '#38bdf8' }}>
                          {op.shift} {op.shift === -3 ? '(CRACKED KEY!)' : ''}
                        </strong>
                      </div>

                      <input
                        type="range"
                        min="-25"
                        max="25"
                        value={op.shift || 0}
                        onChange={(e) => {
                          playClickSound(1100);
                          updateOpProp(op.id, 'shift', parseInt(e.target.value, 10));
                        }}
                        style={{ width: '100%', accentColor: '#38bdf8' }}
                      />

                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        <button
                          type="button"
                          className="cos-btn"
                          style={{ flex: 1, fontSize: '9.5px' }}
                          onClick={() => updateOpProp(op.id, 'shift', -3)}
                        >
                          Shift -3
                        </button>
                        <button
                          type="button"
                          className="cos-btn"
                          style={{ flex: 1, fontSize: '9.5px' }}
                          onClick={() => updateOpProp(op.id, 'shift', 0)}
                        >
                          Shift 0
                        </button>
                      </div>
                    </div>
                  )}

                  {op.type === 'xor' && (
                    <div style={{ marginTop: '6px' }}>
                      <label style={{ fontSize: '10px', color: '#94a3b8' }}>XOR Key:</label>
                      <input
                        type="text"
                        className="cos-input"
                        value={op.key || ''}
                        onChange={(e) => updateOpProp(op.id, 'key', e.target.value)}
                        style={{ width: '100%', fontSize: '10.5px', marginTop: '2px' }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {!recipe.length && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 10px', fontSize: '11px' }}>
                  No operations in recipe pipeline.<br />Click any operation on the left to add.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Input & Output Panels */}
          <div className="cos-split-vertical" style={{ flex: 1 }}>
            {/* Input Box */}
            <div className="cos-panel" style={{ flex: 1 }}>
              <div className="cos-panel-header">
                <span>INPUT CIPHERTEXT</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="cos-btn"
                    style={{ fontSize: '9.5px', padding: '1px 6px' }}
                    onClick={() => setInputText(ENCRYPTED_TELEGRAM)}
                  >
                    Telegram Preset
                  </button>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{inputText.length} bytes</span>
                </div>
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
              <div className="cos-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#34d399' }}>OUTPUT PLAINTEXT (Auto-bake Active)</span>
                {outputText.includes('FLAG{') && (
                  <button
                    type="button"
                    className="cos-btn cos-btn-primary"
                    style={{ padding: '2px 8px', fontSize: '9.5px', height: 'auto' }}
                    onClick={() => {
                      const match = outputText.match(/FLAG\{[^}]+\}/);
                      if (match) {
                        setManualFlag(match[0]);
                        playClickSound(1000);
                      }
                    }}
                    title="Copy decrypted flag directly to submit bar"
                  >
                    📋 Copy Flag to Submit Bar
                  </button>
                )}
              </div>
              <div className="cos-panel-body" style={{ padding: '4px' }}>
                <textarea
                  className="cos-textarea cos-textarea-output"
                  readOnly
                  value={outputText}
                  style={{ color: outputText.includes('FLAG{') ? '#34d399' : '#cbd5e1' }}
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
