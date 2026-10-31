import React, { useState } from 'react';
import { Activity, Filter, Search, FileText, ArrowDown, Play, StopCircle, RefreshCw, KeyRound, ExternalLink } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

const CHALLENGE_ID = 'forensics-pcap-exfiltration';

const PACKETS = [
  {
    no: 1,
    time: '0.000000',
    src: '192.168.1.45',
    dst: 'Broadcast',
    proto: 'ARP',
    len: 42,
    info: 'Who has 10.0.0.80? Tell 192.168.1.45',
    hex: 'ff ff ff ff ff ff 00 0c 29 4f 8e 11 08 06 00 01 08 00 06 04 00 01 c0 a8 01 2d 00 00 00 00 00 00 0a 00 00 50',
    details: [
      'Frame 1: 42 bytes on wire (336 bits)',
      'Ethernet II, Src: 00:0c:29:4f:8e:11, Dst: ff:ff:ff:ff:ff:ff (Broadcast)',
      'Address Resolution Protocol (request)',
      '  Hardware type: Ethernet (1)',
      '  Protocol type: IPv4 (0x0800)',
      '  Sender IP: 192.168.1.45, Target IP: 10.0.0.80',
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
    hex: '00 0c 29 4f 8e 11 00 50 56 c0 00 08 08 06 00 01 08 00 06 04 00 02 00 50 56 c0 00 08 0a 00 00 50 00 0c 29 4f',
    details: [
      'Frame 2: 42 bytes on wire',
      'Ethernet II, Src: 00:50:56:c0:00:08, Dst: 00:0c:29:4f:8e:11',
      'Address Resolution Protocol (reply)',
      '  Sender MAC: 00:50:56:c0:00:08 is at 10.0.0.80',
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
    hex: '3f 1a 01 00 00 01 00 00 00 00 00 00 04 61 75 74 68 04 63 6f 72 70 08 69 6e 74 65 72 6e 61 6c 00 00 01 00 01',
    details: [
      'Frame 3: 74 bytes on wire',
      'Internet Protocol Version 4, Src: 192.168.1.45, Dst: 8.8.8.8',
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
    hex: '3f 1a 81 80 00 01 00 01 00 00 00 00 04 61 75 74 68 04 63 6f 72 70 08 69 6e 74 65 72 6e 61 6c 00 00 01 00 01',
    details: [
      'Frame 4: 90 bytes on wire',
      'Domain Name System (response)',
      '  auth.corp.internal: type A, class IN, addr 10.0.0.80',
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
    hex: '00 50 56 c0 00 08 00 0c 29 4f 8e 11 08 00 45 00 00 34 8a 12 40 00 40 06 c8 11 b9 dc 65 04 0a 00 00 50 c2 9d',
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
    hex: '00 0c 29 4f 8e 11 00 50 56 c0 00 08 08 00 45 00 00 34 00 00 40 00 40 06 52 24 0a 00 00 50 b9 dc 65 04 00 50',
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
    hex: '50 4f 53 54 20 2f 61 70 69 2f 76 31 2f 61 75 74 68 2f 6c 6f 67 69 6e 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 61 75 74 68 2e 63 6f 72 70 2e 69 6e 74 65 72 6e 61 6c 0d 0a 41 75 74 68 6f 72 69 7a 61 74 69 6f 6e 3a 20 42 61 73 69 63 20 59 57 52 74 61 57 34 36 63 47 4e 68 63 46 39 6b 62 6e 4e 66 5a 58 68 6d 61 57 78 66 59 6d 46 7a 61 57 4e 66 59 58 56 30 61 46 39 75 5a 58 56 30 63 6d 46 73 61 58 70 6c 5a 41 3d 3d',
    details: [
      'Frame 7: 462 bytes on wire',
      'Hypertext Transfer Protocol',
      '  POST /api/v1/auth/login HTTP/1.1',
      '  Host: auth.corp.internal',
      '  User-Agent: Kali Linux cURL/8.5.0',
      '  Authorization: Basic YWRtaW46cGNhcF9kbnNfZXhmaWxfYmFzaWNfYXV0aF9uZXV0cmFsaXplZA==',
      '  Content-Type: application/json',
      '  Content-Length: 32',
      '  Payload: {"username":"admin","client":"c2"}',
    ],
    streamContent:
      'POST /api/v1/auth/login HTTP/1.1\r\n' +
      'Host: auth.corp.internal\r\n' +
      'User-Agent: Kali Linux cURL/8.5.0\r\n' +
      'Authorization: Basic YWRtaW46cGNhcF9kbnNfZXhmaWxfYmFzaWNfYXV0aF9uZXV0cmFsaXplZA==\r\n' +
      'Content-Type: application/json\r\n' +
      'Content-Length: 32\r\n' +
      '\r\n' +
      '{"username":"admin","client":"c2"}\r\n\r\n' +
      'HTTP/1.1 200 OK\r\n' +
      'Server: nginx/1.24.0\r\n' +
      'Content-Type: application/json\r\n' +
      'Content-Length: 88\r\n' +
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
    info: 'HTTP/1.1 200 OK (application/json)',
    hex: '48 54 54 50 2f 31 2e 31 20 32 30 30 20 4f 4b 0d 0a 53 65 72 76 65 72 3a 20 6e 67 69 6e 78 2f 31 2e 32 34 2e 30 0d 0a 43 6f 6e 74 65 6e 74 2d 54 79 70 65 3a 20 61 70 70 6c 69 63 61 74 69 6f 6e 2f 6a 73 6f 6e 0d 0a 0d 0a 7b 22 73 74 61 74 75 73 22 3a 22 61 75 74 68 65 6e 74 69 63 61 74 65 64 22 2c 22 72 6f 6c 65 22 3a 22 72 6f 6f 74 22 2c 22 74 6f 6b 65 6e 22 3a 22 46 4c 41 47 7b 70 63 61 70 5f 64 6e 73 5f 65 78 66 69 6c 5f 62 61 73 69 63 5f 61 75 74 68 5f 6e 65 75 74 72 61 6c 69 7a 65 64 7d 22 7d',
    details: [
      'Frame 8: 298 bytes on wire',
      'Hypertext Transfer Protocol',
      '  HTTP/1.1 200 OK',
      '  Server: nginx/1.24.0',
      '  Content-Type: application/json',
      '  Payload: {"status":"authenticated","role":"root","token":"FLAG{pcap_dns_exfil_basic_auth_neutralized}"}',
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
    hex: '53 53 48 2d 32 2e 30 2d 4f 70 65 6e 53 53 48 5f 38 2e 39 70 31 20 55 62 75 6e 74 75 2d 33 75 62 75 6e 74 75 30 2e 31 0d 0a',
    details: [
      'Frame 9: 98 bytes on wire',
      'SSH Protocol: Encrypted handshake payload',
    ],
  },
];

export default function WiresharkApp() {
  const [filterStr, setFilterStr] = useState('');
  const [selectedPacket, setSelectedPacket] = useState(PACKETS[6]); // default HTTP POST
  const [isFollowStreamOpen, setIsFollowStreamOpen] = useState(false);
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));

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

  const handleDecodeBase64 = () => {
    try {
      const clean = base64Input.trim().replace(/^Basic\s+/i, '');
      const dec = atob(clean);
      setBase64Output(`Decoded: "${dec}"`);
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
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b10] font-mono text-xs select-text overflow-hidden">
      {/* Wireshark Toolbar */}
      <div className="cos-toolbar flex items-center justify-between border-b border-[#1e293b] px-3 py-1.5 bg-[#0f172a]">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8] font-bold flex items-center gap-1.5">
            <Activity size={14} />
            <span>Wireshark v4.2.3</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 text-[11px]">traffic_exfiltration.pcapng [9 Packets Captured]</span>
        </div>
        <span className="cos-menu-badge">PROMISCUOUS: eth0</span>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0b1017] border-b border-[#1e293b]">
        <Filter size={13} className="text-[#38bdf8]" />
        <span className="text-slate-400 text-[11px]">Apply display filter:</span>
        <input
          type="text"
          value={filterStr}
          onChange={(e) => setFilterStr(e.target.value)}
          placeholder="e.g. http, dns, tcp, 10.0.0.80..."
          className="flex-1 cos-input py-1 text-xs"
        />
        {filterStr && (
          <button
            type="button"
            onClick={() => setFilterStr('')}
            className="cos-btn py-0.5 text-[10px]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Packet List Pane */}
      <div className="flex-1 max-h-52 overflow-y-auto border-b border-[#1e293b]">
        <table className="cos-table">
          <thead>
            <tr>
              <th className="w-10">No.</th>
              <th className="w-20">Time</th>
              <th className="w-32">Source</th>
              <th className="w-32">Destination</th>
              <th className="w-16">Protocol</th>
              <th className="w-14">Length</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            {filteredPackets.map((p) => {
              const isSelected = selectedPacket?.no === p.no;
              return (
                <tr
                  key={p.no}
                  onClick={() => {
                    playClickSound(800);
                    setSelectedPacket(p);
                  }}
                  className={`cursor-pointer ${isSelected ? 'is-selected' : ''}`}
                >
                  <td className="text-slate-500">{p.no}</td>
                  <td>{p.time}</td>
                  <td className="font-mono text-cyan-300">{p.src}</td>
                  <td className="font-mono text-slate-300">{p.dst}</td>
                  <td className={`font-bold ${p.proto === 'HTTP' ? 'text-emerald-400' : p.proto === 'DNS' ? 'text-sky-400' : 'text-slate-400'}`}>
                    {p.proto}
                  </td>
                  <td>{p.len}</td>
                  <td className="truncate max-w-md">{p.info}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Packet Details & Hex Pane (Split View) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2 overflow-y-auto bg-[#04070a]">
        {/* Packet Dissection Tree */}
        <div className="p-2.5 bg-[#090e15] border border-[#1e293b] rounded flex flex-col">
          <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-[#1e293b] text-[10px] text-slate-400">
            <span>PACKET DETAILS // FRAME {selectedPacket?.no || 1}</span>
            {selectedPacket?.proto === 'HTTP' && (
              <button
                type="button"
                onClick={() => setIsFollowStreamOpen(true)}
                className="cos-btn cos-btn-primary py-0.5 text-[10px]"
              >
                <FileText size={10} />
                <span>FOLLOW TCP STREAM</span>
              </button>
            )}
          </div>
          <div className="space-y-1 text-[11px] overflow-y-auto flex-1">
            {selectedPacket?.details.map((d, i) => (
              <div key={i} className="text-slate-300 hover:text-cyan-300 select-all">
                {d}
              </div>
            ))}
          </div>
        </div>

        {/* Hex / ASCII Dump */}
        <div className="p-2.5 bg-[#090e15] border border-[#1e293b] rounded flex flex-col">
          <div className="pb-1.5 mb-1.5 border-b border-[#1e293b] text-[10px] text-slate-400">
            PACKET RAW HEX & ASCII DUMP
          </div>
          <div className="cos-hex-dump flex-1 overflow-y-auto select-all">
            {selectedPacket?.hex}
          </div>
        </div>
      </div>

      {/* Built-in Header Decoder & Flag Submitter */}
      <div className="p-2.5 bg-[#0a0f16] border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-2">
        {/* Quick Base64 Decoder */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="text-[10px] text-slate-400 uppercase">BASE64 DECODER:</span>
          <input
            type="text"
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Paste Authorization Basic token..."
            className="cos-input flex-1 py-1 text-xs"
          />
          <button
            type="button"
            onClick={handleDecodeBase64}
            className="cos-btn py-1 text-xs"
          >
            DECODE
          </button>
          {base64Output && (
            <span className="text-emerald-400 font-bold text-xs select-all">
              {base64Output}
            </span>
          )}
        </div>

        {/* Manual Flag Submission */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{pcap_...}"
            className="cos-input py-1 text-xs w-56"
          />
          <button
            type="submit"
            className="cos-btn cos-btn-success py-1 text-xs"
          >
            SUBMIT FLAG
          </button>
        </form>
      </div>

      {/* Feedback banner */}
      {flagFeedback && (
        <div className={`p-2 text-xs font-mono border-t ${flagFeedback.success ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-rose-950/80 border-rose-500 text-rose-300'}`}>
          {flagFeedback.text}
        </div>
      )}

      {/* Follow Stream Modal Window */}
      {isFollowStreamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0b1017] border border-[#38bdf8] rounded-lg max-w-xl w-full p-4 font-mono text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
              <span className="text-cyan-400 font-bold">WIRESHARK // FOLLOW TCP STREAM (HTTP RECONSTRUCTION)</span>
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
    </div>
  );
}
