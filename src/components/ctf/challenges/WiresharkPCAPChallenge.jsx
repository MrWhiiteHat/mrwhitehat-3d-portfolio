import React, { useState } from 'react';
import { Activity, CheckCircle2, Filter, FileText, Search, Zap, ExternalLink } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'forensics-pcap-exfiltration';
const REVEALED_FLAG = 'FLAG{pcap_dns_exfil_basic_auth_neutralized}';

const PACKETS = [
  {
    no: 1,
    time: '0.000000',
    src: '192.168.1.45',
    dst: '10.0.0.1:443',
    proto: 'TLSv1.3',
    len: 517,
    info: 'Client Hello (SNI: auth.corp.internal)',
    hex: '16 03 01 02 00 01 00 01 fc 03 03 7b 42 1a 9f ... [TLS ClientHello payload]',
    details: [
      'Frame 1: 517 bytes on wire, 517 bytes captured',
      'Ethernet II, Src: 00:0c:29:4f:8e:11, Dst: 00:50:56:c0:00:08',
      'Internet Protocol Version 4, Src: 192.168.1.45, Dst: 10.0.0.1',
      'Transport Layer Security (TLSv1.3): Handshake Protocol: Client Hello',
    ],
  },
  {
    no: 2,
    time: '0.124801',
    src: '192.168.1.102',
    dst: '8.8.8.8:53',
    proto: 'DNS',
    len: 82,
    info: 'Standard query 0x12fa A internal-repo.corp.lan',
    hex: '12 fa 01 00 00 01 00 00 00 00 00 00 0d 69 6e 74 ... [DNS Query A internal-repo]',
    details: [
      'Frame 2: 82 bytes on wire, 82 bytes captured',
      'Ethernet II, Src: 00:0c:29:4f:8e:11, Dst: 00:50:56:c0:00:08',
      'User Datagram Protocol, Src Port: 53210, Dst Port: 53',
      'Domain Name System (query): internal-repo.corp.lan: type A, class IN',
    ],
  },
  {
    no: 3,
    time: '0.248190',
    src: '185.220.101.4',
    dst: '10.0.0.80:80',
    proto: 'HTTP',
    len: 420,
    info: 'POST /api/login HTTP/1.1 (Authorization: Basic YWRtaW46U3VwZXJTZWNyZXQyMDI2IQ==)',
    hex: '50 4f 53 54 20 2f 61 70 69 2f 6c 6f 67 69 6e 20 ... [HTTP POST with Auth Header]',
    details: [
      'Frame 3: 420 bytes on wire, 420 bytes captured',
      'Internet Protocol Version 4, Src: 185.220.101.4, Dst: 10.0.0.80',
      'Hypertext Transfer Protocol:',
      '  Authorization: Basic YWRtaW46U3VwZXJTZWNyZXQyMDI2IQ== (Decoded: admin:SuperSecret2026!)',
      '  Extracted CTF Token: ' + REVEALED_FLAG,
    ],
    isTarget: true,
  },
  {
    no: 4,
    time: '0.351294',
    src: '10.0.0.80:80',
    dst: '185.220.101.4',
    proto: 'HTTP',
    len: 280,
    info: 'HTTP/1.1 200 OK (text/json: {"status": "authenticated", "role": "root"})',
    hex: '48 54 54 50 2f 31 2e 31 20 32 30 30 20 4f 4b 0d ... [HTTP 200 Response Payload]',
    details: [
      'Frame 4: 280 bytes on wire',
      'Hypertext Transfer Protocol: 200 OK',
      'Content-Type: application/json',
      'Payload: {"status": "authenticated", "role": "root", "flag": "' + REVEALED_FLAG + '"}',
    ],
    isTarget: true,
  },
  {
    no: 5,
    time: '0.512903',
    src: '192.168.1.18',
    dst: '10.0.0.1:22',
    proto: 'SSHv2',
    len: 98,
    info: 'Encrypted packet (len=64) SSH-2.0-OpenSSH_8.9p1',
    hex: '00 00 00 3c 0a 01 02 03 04 05 ... [SSH-2.0 encrypted packet]',
    details: [
      'Frame 5: 98 bytes on wire',
      'Transmission Control Protocol, Src Port: 54122, Dst Port: 22',
      'SSHv2 Encrypted packet payload',
    ],
  },
];

export default function WiresharkPCAPChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [selectedPacket, setSelectedPacket] = useState(PACKETS[2]); // Default to frame 3
  const [filterText, setFilterText] = useState('');
  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const filteredPackets = PACKETS.filter((p) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      p.proto.toLowerCase().includes(q) ||
      p.info.toLowerCase().includes(q) ||
      p.src.toLowerCase().includes(q) ||
      p.dst.toLowerCase().includes(q)
    );
  });

  const handlePacketSelect = (pkt) => {
    playClickSound(800);
    setSelectedPacket(pkt);
  };

  const handleFollowTCPStream = () => {
    playHackingBeep(1400);
    setStreamModalOpen(true);
    if (!solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => onSolved?.(), 1600);
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
    <div className="hack-puzzle-container pcap-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Activity size={15} className="text-cyan-400 hack-icon-pulse" />
          <span>DIGITAL FORENSICS // WIRESHARK LIVE PCAP ANALYZER</span>
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
          Inspect captured PCAP frames. Apply display filters (e.g. <code>http</code>) to detect unencrypted HTTP Basic Auth credentials and reconstruct the exfiltrated TCP conversation stream.
        </p>
      </div>

      {/* Wireshark Filter Bar */}
      <div className="flex gap-2 items-center bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 mt-2">
        <Filter size={13} className="text-cyan-400 flex-shrink-0" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Apply a display filter ... (e.g. 'http', 'dns', '185.220')"
          className="flex-1 bg-transparent text-xs font-mono text-emerald-300 outline-none"
        />
        <div className="flex gap-1">
          {['http', 'dns', 'all'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterText(f === 'all' ? '' : f)}
              className="text-[10px] font-mono bg-black/60 border border-slate-700 hover:border-cyan-400 text-slate-300 px-2 py-0.5 rounded"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Pane 1: Packet List */}
      <div className="mt-2 border border-slate-800 rounded bg-black overflow-hidden font-mono text-[11px]">
        <div className="grid grid-cols-12 gap-1 p-1.5 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-bold">
          <span className="col-span-1">NO.</span>
          <span className="col-span-2">TIME</span>
          <span className="col-span-2">SOURCE</span>
          <span className="col-span-2">DESTINATION</span>
          <span className="col-span-1">PROTO</span>
          <span className="col-span-4">INFO</span>
        </div>
        <div className="divide-y divide-slate-900/60 max-h-36 overflow-y-auto">
          {filteredPackets.map((pkt) => {
            const isSelected = selectedPacket.no === pkt.no;
            return (
              <div
                key={pkt.no}
                onClick={() => handlePacketSelect(pkt)}
                className={`grid grid-cols-12 gap-1 p-1.5 cursor-pointer transition ${
                  isSelected ? 'bg-cyan-950/80 text-cyan-200 font-bold' : 'text-slate-300 hover:bg-slate-900/50'
                }`}
              >
                <span className="col-span-1 text-slate-500">{pkt.no}</span>
                <span className="col-span-2 text-slate-400">{pkt.time}</span>
                <span className="col-span-2 text-cyan-400 truncate">{pkt.src}</span>
                <span className="col-span-2 text-slate-300 truncate">{pkt.dst}</span>
                <span className="col-span-1 font-bold text-amber-400">{pkt.proto}</span>
                <span className="col-span-4 truncate text-slate-200">{pkt.info}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pane 2: Packet Details Tree & Follow Stream Button */}
      {selectedPacket && (
        <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] space-y-1">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-1">
            <span className="text-slate-400 text-[10px] uppercase">// Frame {selectedPacket.no} Dissection Tree:</span>
            {selectedPacket.proto === 'HTTP' && (
              <button
                type="button"
                onClick={handleFollowTCPStream}
                className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition"
              >
                <FileText size={11} />
                <span>FOLLOW TCP STREAM</span>
              </button>
            )}
          </div>
          {selectedPacket.details.map((line, idx) => (
            <div key={idx} className={line.includes('FLAG') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Pane 3: Hex & ASCII Dump */}
      {selectedPacket && (
        <div className="mt-2 p-2 bg-black border border-slate-900 rounded font-mono text-[10px] text-slate-400">
          <div className="text-slate-600 mb-0.5">// Raw Hex Dump:</div>
          <code className="text-cyan-400/90">{selectedPacket.hex}</code>
        </div>
      )}

      {/* Reconstructed TCP Stream Modal */}
      {streamModalOpen && (
        <div className="mt-3 p-3 bg-black border border-emerald-500/50 rounded font-mono text-xs text-emerald-300 space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase border-b border-emerald-900 pb-1">
            <span>RECONSTRUCTED TCP STREAM // HTTP CONVERSATION</span>
            <button
              type="button"
              onClick={() => setStreamModalOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="text-cyan-300">
            POST /api/login HTTP/1.1<br />
            Host: 10.0.0.80<br />
            Authorization: Basic YWRtaW46U3VwZXJTZWNyZXQyMDI2IQ==<br />
            User-Agent: Mozilla/5.0 (Kali Linux x86_64)<br />
            <br />
            HTTP/1.1 200 OK<br />
            Content-Type: application/json<br />
            &#123; "status": "authenticated", "role": "root", "flag": "{REVEALED_FLAG}" &#125;
          </div>
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
            <span className="font-bold text-emerald-300">CREDENTIALS RECONSTRUCTED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+250 CTF PTS Awarded to Profile · Wireshark Terminal Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Click on HTTP Frame 3 or 4 and select "FOLLOW TCP STREAM" to inspect credentials</span>
        </div>
      )}
    </div>
  );
}
