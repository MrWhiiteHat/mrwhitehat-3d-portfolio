import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Radio, RefreshCw, ShieldAlert, Wifi, Zap, Terminal, Code } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'rev-duckyscript-badusb';
const REVEALED_FLAG = 'FLAG{ducky_hid_injection_decoded}';

const TARGET_APS = [
  { id: 'ap1', ssid: 'CORP-GUEST-2.4G', bssid: 'A4:C3:F0:88:12:01', channel: 6, band: '2.4GHz', enc: 'WPA2-PSK' },
  { id: 'ap2', ssid: 'EXECUTIVE-SECURE-5G', bssid: 'DC:A6:32:9B:44:E2', channel: 36, band: '5.8GHz', enc: 'WPA3-SAE' },
  { id: 'ap3', ssid: 'IOT-CAMERA-BACKHAUL', bssid: 'B8:27:EB:14:8F:90', channel: 11, band: '2.4GHz', enc: 'WPA2-Enterprise' },
];

export default function HardwareArsenalHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [selectedAP, setSelectedAP] = useState(0);
  const [deauthBursting, setDeauthBursting] = useState(false);
  const [capturedPackets, setCapturedPackets] = useState(0);
  const [beaconSync, setBeaconSync] = useState(false);
  const [showDuckyInspector, setShowDuckyInspector] = useState(false);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  useEffect(() => {
    if (capturedPackets >= 4 && !solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => {
        onSolved?.();
      }, 1500);
    }
  }, [capturedPackets, solved, onSolved]);

  const handleSendDeauth = () => {
    if (solved || deauthBursting) return;
    playHackingBeep(1400);
    setDeauthBursting(true);

    setTimeout(() => {
      setDeauthBursting(false);
      setBeaconSync(true);
      playHackingBeep(1800);
      setCapturedPackets((prev) => Math.min(4, prev + 1));
    }, 600);
  };

  const handleCaptureHandshake = () => {
    if (solved) return;
    if (beaconSync) {
      playHackingBeep(2100);
      setCapturedPackets((prev) => Math.min(4, prev + 1));
      setBeaconSync(false);
    } else {
      playClickSound(350, 0.1);
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
    <div className="hack-puzzle-container hardware-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Radio size={14} className="hack-icon-pulse text-amber-400" />
          <span>CTF MISSION // REVERSE ENGINEERING: DUCKY & 802.11 INJECTION</span>
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
          Deconstruct the rogue BadUSB keystroke injector payload and deauthenticate 802.11 APs using the Hak5 hardware arsenal. Capture 4 EAPOL handshakes to dump the decrypted payload flag.
        </p>
      </div>

      {/* Target AP Selector */}
      <div className="ap-target-selector">
        <span className="section-micro-lbl text-xs text-slate-400 uppercase font-mono">TARGET ACCESS POINT:</span>
        <div className="ap-cards-row">
          {TARGET_APS.map((ap, i) => (
            <button
              type="button"
              key={ap.id}
              className={`ap-card-btn ${selectedAP === i ? 'ap-selected' : ''}`}
              onClick={() => {
                playClickSound(900);
                setSelectedAP(i);
              }}
              disabled={solved}
            >
              <div className="ap-ssid">
                <Wifi size={12} />
                <span>{ap.ssid}</span>
              </div>
              <div className="ap-meta">
                <span>{ap.band}</span>
                <span>CH {ap.channel}</span>
                <span className="ap-enc">{ap.enc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Hardware Tool Controls */}
      <div className="hardware-actions-grid">
        <button
          type="button"
          className={`hw-btn deauth-btn ${deauthBursting ? 'bursting' : ''}`}
          onClick={handleSendDeauth}
          disabled={solved || deauthBursting}
        >
          <Zap size={14} />
          <span>{deauthBursting ? 'INJECTING DEAUTH 802.11...' : 'SEND DEAUTH BURST'}</span>
        </button>

        <button
          type="button"
          className={`hw-btn capture-btn ${beaconSync ? 'beacon-pulse' : ''}`}
          onClick={handleCaptureHandshake}
          disabled={solved || !beaconSync}
        >
          <Activity size={14} />
          <span>{beaconSync ? '⚡ INTERCEPT 4-WAY HANDSHAKE' : 'WAITING FOR RE-ASSOC'}</span>
        </button>

        <button
          type="button"
          className="hw-btn ducky-btn text-xs bg-slate-800 border border-slate-700 hover:border-cyan-400 py-1.5 px-3 rounded flex items-center gap-1.5"
          onClick={() => setShowDuckyInspector(!showDuckyInspector)}
        >
          <Code size={13} className="text-cyan-400" />
          <span>{showDuckyInspector ? 'HIDE DUCKY SCRIPT' : 'INSPECT DUCKY SCRIPT'}</span>
        </button>
      </div>

      {/* DuckyScript Inspector */}
      {showDuckyInspector && (
        <div className="mt-2 p-2 bg-black/80 border border-cyan-500/30 rounded font-mono text-[11px] text-cyan-300">
          <div className="text-amber-400 font-bold mb-1">// DuckyScript Decoded Payload:</div>
          <div>REM Target: Win11 Enterprise</div>
          <div>DELAY 500</div>
          <div>STRING powershell -NoP -NonI -W Hidden -Enc SUVYIChOZXctT2...</div>
          <div className="text-emerald-400 mt-1">REM Embedded Flag: {REVEALED_FLAG}</div>
        </div>
      )}

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
            <span className="font-bold text-emerald-300">EAPOL HANDSHAKE CAPTURED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+150 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Intercept {capturedPackets}/4 Handshakes · Hak5 Pineapple & Rubber Ducky payload online</span>
        </div>
      )}
    </div>
  );
}
