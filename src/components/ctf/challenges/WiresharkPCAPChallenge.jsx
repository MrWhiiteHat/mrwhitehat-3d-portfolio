import React, { useState } from 'react';
import { Activity, CheckCircle2, Filter, FileText, Search, Zap, ExternalLink, KeyRound, Terminal } from 'lucide-react';
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
    dst: 'Broadcast',
    proto: 'ARP',
    len: 42,
    info: 'Who has 10.0.0.80? Tell 192.168.1.45',
    hex: 'ff ff ff ff ff ff 00 0c 29 4f 8e 11 08 06 00 01 08 00 06 04 00 01 ...',
    details: [
      'Frame 1: 42 bytes on wire (336 bits)',
      'Ethernet II, Src: 00:0c:29:4f:8e:11, Dst: ff:ff:ff:ff:ff:ff',
      'Address Resolution Protocol (request)',
    ],
  },
  {
    no: 2,
    time: '0.001420',
    src: '10.0.0.80',
    dst: '192.168.1.45',
    proto: 'ARP',
    len: 42,
    info: '10.0.0.80 is at 00:50:56:c0:00:08',
    hex: '00 0c 29 4f 8e 11 00 50 56 c0 00 08 08 06 00 01 08 00 06 04 00 02 ...',
    details: [
      'Frame 2: 42 bytes on wire',
      'Ethernet II, Src: 00:50:56:c0:00:08, Dst: 00:0c:29:4f:8e:11',
      'Address Resolution Protocol (reply)',
    ],
  },
  {
    no: 3,
    time: '0.124801',
    src: '192.168.1.45',
    dst: '8.8.8.8:53',
    proto: 'DNS',
    len: 74,
    info: 'Standard query 0x3f1a A auth.corp.internal',
    hex: '3f 1a 01 00 00 01 00 00 00 00 00 00 04 61 75 74 68 04 63 6f 72 70 ...',
    details: [
      'Frame 3: 74 bytes on wire',
      'User Datagram Protocol, Src Port: 54122, Dst Port: 53',
      'Domain Name System (query): auth.corp.internal: type A, class IN',
    ],
  },
  {
    no: 4,
    time: '0.145120',
    src: '8.8.8.8:53',
    dst: '192.168.1.45',
    proto: 'DNS',
    len: 90,
    info: 'Standard query response 0x3f1a A 10.0.0.80',
    hex: '3f 1a 81 80 00 01 00 01 00 00 00 00 04 61 75 74 68 04 63 6f 72 70 ...',
    details: [
      'Frame 4: 90 bytes on wire',
      'Domain Name System (response): auth.corp.internal: type A, class IN, addr 10.0.0.80',
    ],
  },
  {
    no: 5,
    time: '0.248190',
    src: '185.220.101.4',
    dst: '10.0.0.80:80',
    proto: 'TCP',
    len: 66,
    info: '49821 -> 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
    hex: '00 50 56 c0 00 08 00 0c 29 4f 8e 11 08 00 45 00 00 34 8a 12 40 00 ...',
    details: [
      'Frame 5: 66 bytes on wire',
      'Transmission Control Protocol, Src Port: 49821, Dst Port: 80, Seq: 0, Flags: [SYN]',
    ],
  },
  {
    no: 6,
    time: '0.249010',
    src: '10.0.0.80:80',
    dst: '185.220.101.4',
    proto: 'TCP',
    len: 66,
    info: '80 -> 49821 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0',
    hex: '00 0c 29 4f 8e 11 00 50 56 c0 00 08 08 00 45 00 00 34 00 00 40 00 ...',
    details: [
      'Frame 6: 66 bytes on wire',
      'Transmission Control Protocol, Src Port: 80, Dst Port: 49821, Flags: [SYN, ACK]',
    ],
  },
  {
    no: 7,
    time: '0.250100',
    src: '185.220.101.4',
    dst: '10.0.0.80:80',
    proto: 'HTTP',
    len: 462,
    info: 'POST /api/v1/auth/login HTTP/1.1 (application/json)',
    hex: '50 4f 53 54 20 2f 61 70 69 2f 76 31 2f 61 75 74 68 2f 6c 6f 67 69 ... 41 75 74 68 6f 72 69 7a 61 74 69 6f 6e 3a 20 42 61 73 69 63 ...',
    details: [
      'Frame 7: 462 bytes on wire',
      'Hypertext Transfer Protocol',
      '  POST /api/v1/auth/login HTTP/1.1',
      '  Host: auth.corp.internal',
      '  User-Agent: Mozilla/5.0 (Kali Linux x86_64)',
      '  Authorization: Basic YWRtaW46cGNhcF9kbnNfZXhmaWxfYmFzaWNfYXV0aF9uZXV0cmFsaXplZA==',
      '  Content-Type: application/json',
      '  Content-Length: 32',
      '  [Payload: {"username":"admin","client":"c2"}]',
    ],
    streamContent:
      'POST /api/v1/auth/login HTTP/1.1\r\n' +
      'Host: auth.corp.internal\r\n' +
      'Authorization: Basic YWRtaW46cGNhcF9kbnNfZXhmaWxfYmFzaWNfYXV0aF9uZXV0cmFsaXplZA==\r\n' +
      'Content-Type: application/json\r\n' +
      '\r\n' +
      '{"username":"admin","client":"c2"}\r\n\r\n' +
      'HTTP/1.1 200 OK\r\n' +
      'Server: nginx/1.24\r\n' +
      'Content-Type: application/json\r\n' +
      '\r\n' +
      '{"status":"authenticated","role":"root","token":"FLAG{pcap_dns_exfil_basic_auth_neutralized}"}',
  },
  {
    no: 8,
    time: '0.252340',
    src: '10.0.0.80:80',
    dst: '185.220.101.4',
    proto: 'HTTP',
    len: 298,
    info: 'HTTP/1.1 200 OK (application/json: token="FLAG{pcap_dns_exfil_basic_auth_neutralized}")',
    hex: '48 54 54 50 2f 31 2e 31 20 32 30 30 20 4f 4b 0d 0a 53 65 72 76 65 ... 74 6f 6b 65 6e 22 3a 22 46 4c 41 47 7b ...',
    details: [
      'Frame 8: 298 bytes on wire',
      'Hypertext Transfer Protocol',
      '  HTTP/1.1 200 OK',
      '  Server: nginx/1.24',
      '  Content-Type: application/json',
      '  File Data: 78 bytes',
      '  {"status":"authenticated","role":"root","token":"FLAG{pcap_dns_exfil_basic_auth_neutralized}"}',
    ],
    streamContent: 'See Stream in Frame 7',
  },
  {
    no: 9,
    time: '0.512903',
    src: '192.168.1.18',
    dst: '10.0.0.1:22',
    proto: 'SSHv2',
    len: 98,
    info: 'Encrypted packet (len=64) SSH-2.0-OpenSSH_8.9p1',
    hex: '53 53 48 2d 32 2e 30 2d 4f 70 65 6e 53 53 48 5f 38 2e 39 70 31 ...',
    details: [
      'Frame 9: 98 bytes on wire',
      'SSH Protocol: Encrypted packet payload',
    ],
  },
];

export default function WiresharkPCAPChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [filterStr, setFilterStr] = useState('');
  const [selectedPacket, setSelectedPacket] = useState(PACKETS[0]);
  const [isFollowStreamOpen, setIsFollowStreamOpen] = useState(false);
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const filteredPackets = PACKETS.filter((p) => {
    if (!filterStr.trim()) return true;
    const f = filterStr.trim().toLowerCase();
    return (
      p.proto.toLowerCase().includes(f) ||
      p.src.toLowerCase().includes(f) ||
      p.dst.toLowerCase().includes(f) ||
      p.info.toLowerCase().includes(f)
    );
  });

  const handlePacketClick = (p) => {
    playClickSound(850);
    setSelectedPacket(p);
  };

  const handleDecodeBase64 = () => {
    try {
      const clean = base64Input.trim().replace(/^Basic\s+/i, '');
      const dec = atob(clean);
      setBase64Output(`Decoded string: "${dec}"`);
      playClickSound(1000);
    } catch (_) {
      setBase64Output('Error: Invalid base64 sequence.');
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
    <div className="hack-puzzle-container pcap-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Activity size={15} className="text-cyan-400 hack-icon-pulse" />
          <span>DIGITAL FORENSICS // PCAP PACKET ANALYZER & HTTP STREAM RECON</span>
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
          Security sensors captured suspicious network traffic during an exfiltration event. Use the packet display filter to isolate HTTP/DNS conversations, reconstruct the TCP session, decode the HTTP Basic authentication header, and recover the flag.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 items-center bg-slate-950 p-2 border border-slate-800 rounded mt-2">
        <Filter size={13} className="text-cyan-400 flex-shrink-0" />
        <input
          type="text"
          value={filterStr}
          onChange={(e) => setFilterStr(e.target.value)}
          placeholder="Apply display filter (e.g. http, dns, 10.0.0.80)..."
          className="flex-1 bg-black border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-500"
        />
        {filterStr && (
          <button
            type="button"
            onClick={() => setFilterStr('')}
            className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 border border-slate-700 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Packet List Pane */}
      <div className="mt-2 border border-slate-800 rounded bg-slate-950 overflow-hidden font-mono text-xs">
        <div className="max-h-44 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400">
              <tr>
                <th className="p-1.5 w-10">NO.</th>
                <th className="p-1.5 w-16">TIME</th>
                <th className="p-1.5 w-28">SOURCE</th>
                <th className="p-1.5 w-28">DESTINATION</th>
                <th className="p-1.5 w-16">PROTO</th>
                <th className="p-1.5 w-12">LEN</th>
                <th className="p-1.5">INFO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-[11px]">
              {filteredPackets.map((p) => {
                const isSelected = selectedPacket?.no === p.no;
                return (
                  <tr
                    key={p.no}
                    onClick={() => handlePacketClick(p)}
                    className={`cursor-pointer transition hover:bg-cyan-950/30 ${
                      isSelected
                        ? 'bg-cyan-900/40 text-cyan-200 font-semibold'
                        : p.proto === 'HTTP'
                        ? 'text-emerald-300'
                        : p.proto === 'DNS'
                        ? 'text-sky-300'
                        : 'text-slate-400'
                    }`}
                  >
                    <td className="p-1.5 text-slate-500">{p.no}</td>
                    <td className="p-1.5">{p.time}</td>
                    <td className="p-1.5">{p.src}</td>
                    <td className="p-1.5">{p.dst}</td>
                    <td className="p-1.5 font-bold">{p.proto}</td>
                    <td className="p-1.5">{p.len}</td>
                    <td className="p-1.5 truncate max-w-xs">{p.info}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Packet Inspection Details Pane */}
      {selectedPacket && (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Packet Details Tree */}
          <div className="p-2.5 bg-black border border-slate-800 rounded font-mono text-xs">
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
              <span>FRAME {selectedPacket.no} DISSECTION TREE</span>
              {selectedPacket.proto === 'HTTP' && (
                <button
                  type="button"
                  onClick={() => setIsFollowStreamOpen(true)}
                  className="bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 transition"
                >
                  <FileText size={10} />
                  <span>FOLLOW TCP STREAM</span>
                </button>
              )}
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              {selectedPacket.details.map((line, idx) => (
                <div key={idx} className="truncate select-all hover:text-cyan-300">
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Hex / ASCII Dump */}
          <div className="p-2.5 bg-black border border-slate-800 rounded font-mono text-xs">
            <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1.5">
              PACKET HEX BYTES DUMP
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed break-all select-all">
              {selectedPacket.hex}
            </div>
          </div>
        </div>
      )}

      {/* Built-in Base64 Quick Inspector */}
      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded mt-2">
        <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
          HEADER DECODER WORKBENCH (BASE64):
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Paste Base64 header value (e.g. YWRtaW46cGNhcF9k...)"
            className="flex-1 bg-black border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={handleDecodeBase64}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-600 px-3 py-1 rounded text-xs font-mono transition"
          >
            DECODE
          </button>
        </div>
        {base64Output && (
          <div className="mt-1.5 text-xs font-mono text-emerald-400 select-all p-1 bg-black/60 rounded">
            {base64Output}
          </div>
        )}
      </div>

      {/* Follow Stream Modal */}
      {isFollowStreamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-emerald-500/50 rounded-lg max-w-xl w-full p-4 font-mono text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
              <span className="text-emerald-400 font-bold">WIRESHARK // FOLLOW TCP STREAM (HTTP)</span>
              <button
                type="button"
                onClick={() => setIsFollowStreamOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <pre className="p-3 bg-black border border-slate-800 rounded text-slate-200 max-h-80 overflow-y-auto leading-relaxed select-all">
              {PACKETS.find((p) => p.streamContent)?.streamContent || 'No stream available.'}
            </pre>
          </div>
        </div>
      )}

      {/* FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT EXTRACTED FORENSICS FLAG:</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{pcap_...}"
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
            <span className="font-bold text-emerald-300">PCAP INVESTIGATION COMPLETE // FLAG VERIFIED</span>
            <span className="text-[10px] text-emerald-400/80">+250 CTF PTS Awarded · Basic Auth Exfil Solved</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Filter by "http", inspect the POST authorization header or follow the TCP stream</span>
        </div>
      )}
    </div>
  );
}
