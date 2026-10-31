import React, { useState } from 'react';
import { KeyRound, CheckCircle2, Zap, Play, Plus, Trash2, ArrowRight } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
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

export default function CyberChefApp() {
  const [inputText, setInputText] = useState(ENCRYPTED_TELEGRAM);
  const [recipe, setRecipe] = useState([{ id: 'caesar', name: 'Caesar Cipher', param: -3 }]);
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  // Compute live output through recipe
  let outputText = inputText;
  for (const op of recipe) {
    if (op.id === 'caesar') {
      outputText = caesarShift(outputText, op.param);
    } else if (op.id === 'from_b64') {
      try {
        outputText = atob(outputText.trim());
      } catch (_) {
        outputText = '[Error: Invalid Base64 String]';
      }
    } else if (op.id === 'to_b64') {
      outputText = btoa(outputText);
    } else if (op.id === 'rot13') {
      outputText = caesarShift(outputText, 13);
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, manualFlag);
    if (res.success || res.duplicate) {
      setFlagFeedback({ success: true, text: res.message });
      playBreachFanfare();
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b10] font-mono text-xs select-text overflow-hidden">
      {/* CyberChef Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] px-3 py-1.5 bg-[#0f172a]">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8] font-bold">CyberChef v10.5.0 // The Cyber Swiss Army Knife</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setInputText(ENCRYPTED_TELEGRAM);
            setRecipe([{ id: 'caesar', name: 'Caesar Cipher', param: -3 }]);
          }}
          className="cos-btn py-0.5 text-[10px]"
        >
          Reset Challenge Preset
        </button>
      </div>

      {/* Main 3-Column Layout: Operations | Recipe | I/O */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 p-2 bg-[#04070a] overflow-hidden">
        {/* Col 1: Operations List */}
        <div className="flex flex-col bg-[#080d14] border border-[#1e293b] rounded overflow-hidden">
          <div className="p-1.5 bg-[#0f172a] text-[10px] text-slate-400 border-b border-[#1e293b]">
            OPERATIONS PALETTE
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {[
              { id: 'caesar', name: 'Caesar Cipher (Shift)', param: -3 },
              { id: 'rot13', name: 'ROT13', param: 13 },
              { id: 'from_b64', name: 'From Base64', param: null },
              { id: 'to_b64', name: 'To Base64', param: null },
            ].map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  playClickSound(850);
                  setRecipe((prev) => [...prev, op]);
                }}
                className="w-full text-left p-1.5 bg-[#0d141f] hover:bg-[#1e293b] text-slate-300 hover:text-cyan-300 rounded text-xs transition flex justify-between items-center"
              >
                <span>{op.name}</span>
                <Plus size={11} className="text-cyan-400" />
              </button>
            ))}

            {/* Frequency Analysis Cheat Card */}
            <div className="p-2 bg-[#0e1726] border border-[#1e293b] rounded mt-2">
              <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">
                FREQUENCY ANALYSIS:
              </span>
              <div className="text-[10.5px] text-slate-300 space-y-0.5">
                <div>Cipher <strong>H</strong> (14.1%) ➔ English <strong>E</strong> (+3 shift)</div>
                <div>Cipher <strong>W</strong> (10.1%) ➔ English <strong>T</strong> (+3 shift)</div>
                <div>Cipher <strong>D</strong> (9.0%) ➔ English <strong>A</strong> (+3 shift)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Recipe Pipeline */}
        <div className="flex flex-col bg-[#080d14] border border-[#1e293b] rounded overflow-hidden">
          <div className="p-1.5 bg-[#0f172a] text-[10px] text-slate-400 border-b border-[#1e293b] flex justify-between items-center">
            <span>RECIPE PIPELINE ({recipe.length})</span>
            <button
              type="button"
              onClick={() => setRecipe([])}
              className="text-slate-500 hover:text-rose-400 text-[10px]"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
            {recipe.map((op, idx) => (
              <div key={idx} className="p-2 bg-[#0d141f] border border-[#1e293b] rounded space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300">{op.name}</span>
                  <button
                    type="button"
                    onClick={() => setRecipe((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
                {op.id === 'caesar' && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">Shift Key:</span>
                    <input
                      type="number"
                      value={op.param}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        setRecipe((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, param: val } : item))
                        );
                      }}
                      className="cos-input py-0.5 px-1.5 text-xs w-16"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Col 3 & 4: Input / Output */}
        <div className="md:col-span-2 flex flex-col gap-2 overflow-hidden">
          {/* Input Box */}
          <div className="flex-1 flex flex-col bg-[#080d14] border border-[#1e293b] rounded overflow-hidden">
            <div className="p-1.5 bg-[#0f172a] text-[10px] text-slate-400 border-b border-[#1e293b]">
              INPUT CIPHERTEXT
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent p-2 text-rose-300 outline-none resize-none font-mono text-xs leading-relaxed select-all"
            />
          </div>

          {/* Output Box */}
          <div className="flex-1 flex flex-col bg-[#080d14] border border-[#1e293b] rounded overflow-hidden">
            <div className="p-1.5 bg-[#0f172a] text-[10px] text-slate-400 border-b border-[#1e293b] flex justify-between">
              <span>OUTPUT DECRYPTED PLAINTEXT</span>
              <span className="text-emerald-400 font-bold">Auto-bake Active</span>
            </div>
            <textarea
              readOnly
              value={outputText}
              className="flex-1 bg-transparent p-2 text-emerald-400 outline-none resize-none font-mono text-xs font-bold leading-relaxed select-all"
            />
          </div>
        </div>
      </div>

      {/* Flag Submission Bar */}
      <div className="p-2.5 bg-[#0a0f16] border-t border-[#1e293b] flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 uppercase">SUBMIT DECRYPTED FLAG:</span>
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{caesar_...}"
            className="cos-input py-1 text-xs w-64"
          />
          <button
            type="submit"
            className="cos-btn cos-btn-success py-1 text-xs font-bold"
          >
            SUBMIT FLAG
          </button>
        </form>
      </div>

      {flagFeedback && (
        <div className={`p-2 text-xs font-mono border-t ${flagFeedback.success ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-rose-950/80 border-rose-500 text-rose-300'}`}>
          {flagFeedback.text}
        </div>
      )}
    </div>
  );
}
