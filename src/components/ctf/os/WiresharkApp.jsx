import React, { useState } from 'react';
import {
  Activity,
  Filter,
  Search,
  FileText,
  HelpCircle,
  Sparkles,
  Copy,
  CheckCircle2,
  Zap,
  X,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

const CHALLENGE_ID = 'forensics-pcap-exfiltration';
const FLAG_STRING = 'FLAG{pcap_dns_exfil_basic_auth_neutralized}';

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
      'Ethernet II, Src: 00:0c:29:4f:8e:11, Dst: ff:ff:ff:ff:ff:ff',
      'Address Resolution Protocol (request)',
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
    info: '49281 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
    hex: '00 50 c0 a8 00 50 c0 81 00 00 00 00 a0 02 fa f0 de 12 00 00 02 04 05 b4',
    details: [
      'Frame 5: 66 bytes on wire',
      'Transmission Control Protocol, Src Port: 49281, Dst Port: 80, Seq: 0, Len: 0',
      'Flags: 0x002 (SYN)',
    ],
  },
  {
    no: 6,
    time: '0.249010',
    src: '10.0.0.80:80',
    dst: '185.220.101.4',
    proto: 'TCP',
    len: 66,
    info: '80 → 49281 [SYN, ACK] Seq=0 Ack=1 Win=65160 Len=0',
    hex: '00 50 c0 a8 00 50 c0 81 00 00 00 01 a0 12 fe 88 de 12 00 00 02 04 05 b4',
    details: [
      'Frame 6: 66 bytes on wire',
      'Transmission Control Protocol, Src Port: 80, Dst Port: 49281, Seq: 0, Ack: 1',
      'Flags: 0x012 (SYN, ACK)',
    ],
  },
  {
    no: 7,
    time: '0.250420',
    src: '185.220.101.4',
    dst: '10.0.0.80:80',
    proto: 'HTTP',
    len: 482,
    info: 'POST /api/v1/auth/login HTTP/1.1 (application/json)',
    hex: '50 4f 53 54 20 2f 61 70 69 2f 76 31 2f 61 75 74 68 2f 6c 6f 67 69 6e 20 48 54 54 50 2f 31 2e 31 0d 0a 48 6f 73 74 3a 20 61 75 74 68 2e 63 6f 72 70 2e 69 6e 74 65 72 6e 61 6c 0d 0a 55 73 65 72 2d 41 67 65 6e 74 3a 20 4b 61 6c 69 20 4c 69 6e 75 78 20 63 55 52 4c 2f 38 2e 35 2e 30 0d 0a 41 75 74 68 6f 72 69 7a 61 74 69 6f 6e 3a 20 42 61 73 69 63 20 59 57 52 74 61 57 34 36 63 47 4e 68 63 46 39 6b 62 6e 4e 66 5a 58 68 6d 61 57 78 66 59 6d 46 7a 61 57 4e 66 59 58 56 30 61 46 39 75 5a 58 56 30 63 6d 46 73 61 57 70 6c 5a 41 3d 3d 0d 0a',
    details: [
      'Frame 7: 482 bytes on wire',
      'Hypertext Transfer Protocol',
      '  POST /api/v1/auth/login HTTP/1.1',
      '  Host: auth.corp.internal',
      '  User-Agent: Kali Linux cURL/8.5.0',
      '  Authorization: Basic YWRtaW46cGNhcF9kbnNfZXhmaWxfYmFzaWNfYXV0aF9uZXV0cmFsaXplZA==',
      '  Content-Type: application/json',
      '  Payload: {"username":"admin","client":"c2"}',
    ],
    streamContent:
      'POST /api/v1/auth/login HTTP/1.1\r\n' +
      'Host: auth.corp.internal\r\n' +
      'User-Agent: Kali Linux cURL/8.5.0\r\n' +
      'Authorization: Basic YWRtaW46cGNhcF9kbnNfZXhmaWxfYmFzaWNfYXV0aF9uZXV0cmFsaXplZA==\r\n' +
      'Content-Type: application/json\r\n' +
      'Content-Length: 32\r\n\r\n' +
      '{"username":"admin","client":"c2"}\r\n\r\n' +
      'HTTP/1.1 200 OK\r\n' +
      'Server: nginx/1.24.0\r\n' +
      'Content-Type: application/json\r\n' +
      'Content-Length: 88\r\n\r\n' +
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
    streamContent:
      'POST /api/v1/auth/login HTTP/1.1\r\n' +
      'Host: auth.corp.internal\r\n' +
      'User-Agent: Kali Linux cURL/8.5.0\r\n' +
      'Authorization: Basic YWRtaW46cGNhcF9kbnNfZXhmaWxfYmFzaWNfYXV0aF9uZXV0cmFsaXplZA==\r\n' +
      '\r\n' +
      'HTTP/1.1 200 OK\r\n' +
      '{"status":"authenticated","role":"root","token":"FLAG{pcap_dns_exfil_basic_auth_neutralized}"}',
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
      'Transmission Control Protocol, Src Port: 51221, Dst Port: 22',
      'SSHv2 Encrypted Packet',
    ],
  },
];

export default function WiresharkApp({ onOpenStation }) {
  const [filterStr, setFilterStr] = useState('');
  const [selectedPacketNo, setSelectedPacketNo] = useState(7);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [flagInput, setFlagInput] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);
  const [hoveredByteIdx, setHoveredByteIdx] = useState(null);

  const filteredPackets = PACKETS.filter((p) => {
    if (!filterStr.trim()) return true;
    const f = filterStr.toLowerCase().trim();
    if (f === 'http') return p.proto === 'HTTP';
    if (f === 'dns') return p.proto === 'DNS';
    if (f === 'tcp') return p.proto === 'TCP' || p.proto === 'HTTP';
    if (f === 'arp') return p.proto === 'ARP';
    if (f.includes('port == 80') || f === '80') return p.info.includes('80') || p.src.includes(':80') || p.dst.includes(':80');
    if (f.includes('contains "flag"') || f.includes('flag')) return p.no === 7 || p.no === 8;
    if (f.includes('post')) return p.info.includes('POST');
    return (
      p.proto.toLowerCase().includes(f) ||
      p.src.toLowerCase().includes(f) ||
      p.dst.toLowerCase().includes(f) ||
      p.info.toLowerCase().includes(f)
    );
  });

  const selectedPacket = PACKETS.find((p) => p.no === selectedPacketNo) || PACKETS[0];

  const handleFlagSubmit = (e) => {
    e?.preventDefault();
    if (!flagInput.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, flagInput.trim());
    if (res.success || res.duplicate) {
      const stationId = res.stationId || 'wireshark_monitor';
      setFlagFeedback({
        success: true,
        text: res.message,
        stationId,
        stationName: 'WIRESHARK MONITOR',
      });
      playBreachFanfare();
      setTimeout(() => {
        onOpenStation?.(stationId);
      }, 1800);
    } else {
      setFlagFeedback({ success: false, text: 'Verification Failed: Flag does not match active challenge hashes.' });
      playZapSound();
    }
  };

  // Convert raw hex string to structured 16-byte rows
  const rawBytes = (selectedPacket.hex || '').split(' ').filter(Boolean);
  const hexRows = [];
  for (let i = 0; i < rawBytes.length; i += 16) {
    hexRows.push({
      offset: i.toString(16).padStart(4, '0'),
      startIdx: i,
      bytes: rawBytes.slice(i, i + 16),
    });
  }

  const activeByte = hoveredByteIdx !== null && hoveredByteIdx < rawBytes.length ? rawBytes[hoveredByteIdx] : null;
  const activeChar = activeByte ? String.fromCharCode(parseInt(activeByte, 16)) : null;

  return (
    <div className="cos-app-container select-text">
      {/* 1. Wireshark Top Toolbar & Filter */}
      <div className="cos-app-header">
        <div className="cos-app-title">
          <Activity size={15} style={{ color: '#38bdf8' }} />
          <span>WIRESHARK v4.2 // PACKET CAPTURE FORENSICS</span>
          <span className="cos-badge cos-badge-cyan">capture_042.pcapng (9 Packets)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`cos-hint-toggle ${showHints ? 'is-active' : ''}`}
            onClick={() => setShowHints((prev) => !prev)}
            title="Toggle Forensic Investigation Guide & Hints"
          >
            <HelpCircle size={13} />
            <span>{showHints ? 'HIDE HINTS' : '💡 HOW TO SOLVE'}</span>
          </button>

          <button
            type="button"
            className="cos-btn cos-btn-primary"
            onClick={() => {
              playClickSound(950);
              setShowStreamModal(true);
            }}
          >
            <FileText size={12} />
            <span>Follow TCP Stream</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#090e17', padding: '6px 12px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={13} style={{ color: '#94a3b8' }} />
        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>Display Filter:</span>
        <input
          type="text"
          className="cos-input"
          style={{ flex: 1, padding: '3px 8px', fontSize: '11px' }}
          placeholder="Apply a display filter ... e.g. http, tcp.port == 80, frame contains 'FLAG'"
          value={filterStr}
          onChange={(e) => setFilterStr(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '4px' }}>
          {['http', 'dns', 'tcp', 'arp'].map((proto) => (
            <button
              key={proto}
              type="button"
              className={`cos-btn ${filterStr === proto ? 'cos-btn-primary' : ''}`}
              style={{ fontSize: '10px', padding: '2px 7px' }}
              onClick={() => {
                playClickSound(850);
                setFilterStr(filterStr === proto ? '' : proto);
              }}
            >
              {proto}
            </button>
          ))}
          {filterStr && (
            <button
              type="button"
              className="cos-btn"
              style={{ fontSize: '10px', padding: '2px 7px' }}
              onClick={() => setFilterStr('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Hint & Walkthrough Drawer */}
      {showHints && (
        <div className="cos-hint-drawer">
          <div className="cos-hint-header-bar">
            <div className="cos-hint-title">
              <Sparkles size={14} />
              <span>DIGITAL FORENSICS INVESTIGATION GUIDE // PCAP ANALYSIS</span>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Category: Forensics · Difficulty: Medium · Reward: +200 PTS</span>
          </div>

          <div className="cos-hint-grid">
            <div className="cos-hint-card">
              <h4>🎯 Objective</h4>
              <p>A rogue operative transmitted an unauthorized POST request to the authentication gateway. Inspect the network traffic dump to extract the exfiltrated credential token.</p>
            </div>

            <div className="cos-hint-card">
              <h4>🔍 Wireshark Filter & Streams</h4>
              <p>Filter by <code>http</code> to isolate plaintext HTTP requests. Notice Packet #7 and #8 exchange credentials.</p>
              <p>Click <strong style={{ color: '#38bdf8' }}>Follow TCP Stream</strong> to view the entire request and JSON response.</p>
            </div>

            <div className="cos-hint-card">
              <h4>🛠️ Step-by-Step Walkthrough</h4>
              <p>1. Type <code>http</code> into the filter bar or click the <strong>http</strong> button.</p>
              <p>2. Select Packet #7 (POST) or #8 (200 OK).</p>
              <p>3. In the Dissection Tree or Follow TCP Stream window, find <code>token</code> in the response body.</p>
              <p>4. Copy the flag into the submit bar below and claim +200 PTS!</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Packet Table & Details */}
      <div className="cos-app-body" style={{ gap: '6px' }}>
        {/* Packet List Pane */}
        <div className="cos-panel" style={{ flex: '1 1 180px', minHeight: '140px' }}>
          <div className="cos-table-container" style={{ border: 'none', height: '100%' }}>
            <table className="cos-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>No.</th>
                  <th style={{ width: '75px' }}>Time</th>
                  <th style={{ width: '130px' }}>Source</th>
                  <th style={{ width: '130px' }}>Destination</th>
                  <th style={{ width: '65px' }}>Protocol</th>
                  <th style={{ width: '55px' }}>Length</th>
                  <th>Info</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackets.map((pkt) => {
                  const isSelected = pkt.no === selectedPacket.no;
                  const isHttp = pkt.proto === 'HTTP';
                  const isDns = pkt.proto === 'DNS';

                  return (
                    <tr
                      key={pkt.no}
                      onClick={() => {
                        playClickSound(1050);
                        setSelectedPacketNo(pkt.no);
                      }}
                      className={isSelected ? 'is-selected' : ''}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(56, 189, 248, 0.2)' : isHttp ? 'rgba(52, 211, 153, 0.08)' : undefined,
                      }}
                    >
                      <td style={{ fontWeight: 700 }}>{pkt.no}</td>
                      <td style={{ color: '#94a3b8' }}>{pkt.time}</td>
                      <td style={{ color: isSelected ? '#fff' : '#38bdf8' }}>{pkt.src}</td>
                      <td style={{ color: isSelected ? '#fff' : '#cbd5e1' }}>{pkt.dst}</td>
                      <td>
                        <span className={`cos-badge ${isHttp ? 'cos-badge-emerald' : isDns ? 'cos-badge-cyan' : ''}`}>
                          {pkt.proto}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8' }}>{pkt.len}</td>
                      <td style={{ color: isHttp ? '#34d399' : '#cbd5e1', fontWeight: isHttp ? 600 : 400 }}>
                        {pkt.info}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Split: Dissection Tree (Left) | Interactive Hex Dump (Right) */}
        <div className="cos-split-horizontal" style={{ flex: '1 1 200px', minHeight: '150px' }}>
          {/* Packet Details Tree */}
          <div className="cos-panel" style={{ flex: 1 }}>
            <div className="cos-panel-header">
              <span>PACKET #{selectedPacket.no} DISSECTION TREE</span>
              <span className="cos-badge cos-badge-cyan">{selectedPacket.proto}</span>
            </div>
            <div className="cos-panel-body" style={{ fontSize: '11px', lineHeight: '1.6' }}>
              {selectedPacket.details ? (
                selectedPacket.details.map((detail, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '2px 4px',
                      color: detail.includes('FLAG{') || detail.includes('Authorization:') ? '#34d399' : '#cbd5e1',
                      fontWeight: detail.includes('FLAG{') ? 700 : 400,
                      background: detail.includes('FLAG{') ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      borderRadius: '3px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{detail}</span>
                    {detail.includes('FLAG{') && (
                      <button
                        type="button"
                        className="cos-btn cos-btn-primary"
                        style={{ fontSize: '9px', padding: '1px 6px' }}
                        onClick={() => {
                          playClickSound(1000);
                          setFlagInput(FLAG_STRING);
                        }}
                      >
                        <Copy size={10} />
                        <span>Copy Flag</span>
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b' }}>No dissection available for this packet.</div>
              )}
            </div>
          </div>

          {/* Interactive Hex & ASCII View */}
          <div className="cos-panel" style={{ flex: 1 }}>
            <div className="cos-panel-header">
              <span>PACKET RAW BYTES (HEX & ASCII)</span>
              {activeByte && (
                <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>
                  Offset: 0x{hoveredByteIdx.toString(16).padStart(4, '0')} · Hex: 0x{activeByte} · ASCII: '{activeChar}'
                </span>
              )}
            </div>
            <div className="cos-panel-body" style={{ padding: '6px', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.5' }}>
              <div style={{ overflowY: 'auto', maxHeight: '100%' }}>
                {hexRows.map((row, rIdx) => {
                  const leftBytes = row.bytes.slice(0, 8);
                  const rightBytes = row.bytes.slice(8, 16);

                  return (
                    <div key={rIdx} style={{ display: 'flex', gap: '12px', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#64748b', userSelect: 'none' }}>{row.offset}</span>

                      {/* Hex bytes block */}
                      <span style={{ color: '#94a3b8' }}>
                        {leftBytes.map((b, bIdx) => {
                          const absIdx = row.startIdx + bIdx;
                          const isHovered = hoveredByteIdx === absIdx;
                          return (
                            <span
                              key={bIdx}
                              onMouseEnter={() => setHoveredByteIdx(absIdx)}
                              onMouseLeave={() => setHoveredByteIdx(null)}
                              style={{
                                color: isHovered ? '#fff' : '#38bdf8',
                                background: isHovered ? '#0284c7' : 'transparent',
                                padding: '0 2px',
                                borderRadius: '2px',
                                cursor: 'crosshair',
                                display: 'inline-block',
                                minWidth: '20px',
                              }}
                            >
                              {b}
                            </span>
                          );
                        })}
                        {'  '}
                        {rightBytes.map((b, bIdx) => {
                          const absIdx = row.startIdx + 8 + bIdx;
                          const isHovered = hoveredByteIdx === absIdx;
                          return (
                            <span
                              key={bIdx}
                              onMouseEnter={() => setHoveredByteIdx(absIdx)}
                              onMouseLeave={() => setHoveredByteIdx(null)}
                              style={{
                                color: isHovered ? '#fff' : '#38bdf8',
                                background: isHovered ? '#0284c7' : 'transparent',
                                padding: '0 2px',
                                borderRadius: '2px',
                                cursor: 'crosshair',
                                display: 'inline-block',
                                minWidth: '20px',
                              }}
                            >
                              {b}
                            </span>
                          );
                        })}
                      </span>

                      {/* ASCII Representation */}
                      <span style={{ color: '#34d399', marginLeft: 'auto', borderLeft: '1px solid #1e293b', paddingLeft: '8px' }}>
                        {row.bytes.map((b, bIdx) => {
                          const absIdx = row.startIdx + bIdx;
                          const code = parseInt(b, 16);
                          const ch = code >= 32 && code <= 126 ? String.fromCharCode(code) : '.';
                          const isHovered = hoveredByteIdx === absIdx;
                          return (
                            <span
                              key={bIdx}
                              onMouseEnter={() => setHoveredByteIdx(absIdx)}
                              onMouseLeave={() => setHoveredByteIdx(null)}
                              style={{
                                background: isHovered ? '#059669' : 'transparent',
                                color: isHovered ? '#fff' : '#34d399',
                                fontWeight: isHovered ? 700 : 400,
                              }}
                            >
                              {ch}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Follow TCP Stream Modal Popup */}
      {showStreamModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowStreamModal(false)}
        >
          <div
            className="cos-panel"
            style={{
              width: '90%',
              maxWidth: '680px',
              maxHeight: '85%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(56, 189, 248, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cos-panel-header">
              <span style={{ color: '#38bdf8' }}>FOLLOW TCP STREAM (Stream Index: 0 · 185.220.101.4 ↔ 10.0.0.80)</span>
              <button
                type="button"
                className="cos-win-btn btn-close"
                onClick={() => setShowStreamModal(false)}
              >
                <X size={11} />
              </button>
            </div>

            <div className="cos-panel-body" style={{ padding: '12px' }}>
              <div style={{ fontSize: '10.5px', color: '#94a3b8', marginBottom: '8px' }}>
                Reconstructed full bidirectional TCP conversation stream:
              </div>
              <pre
                style={{
                  background: '#03060a',
                  border: '1px solid #1e293b',
                  borderRadius: '4px',
                  padding: '12px',
                  color: '#34d399',
                  fontFamily: 'inherit',
                  fontSize: '11px',
                  lineHeight: '1.5',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  userSelect: 'all',
                }}
              >
                {PACKETS[6]?.streamContent || 'No stream data available.'}
              </pre>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="cos-btn cos-btn-primary"
                  onClick={() => {
                    playClickSound(1000);
                    setFlagInput(FLAG_STRING);
                    setShowStreamModal(false);
                  }}
                >
                  <Copy size={11} />
                  <span>Copy Flag & Close</span>
                </button>
                <button
                  type="button"
                  className="cos-btn"
                  onClick={() => setShowStreamModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Flag Submitter Bar */}
      <div className="cos-flag-bar">
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>SUBMIT CAPTURED FLAG:</span>
        <input
          type="text"
          className="cos-flag-input"
          placeholder="FLAG{...}"
          value={flagInput}
          onChange={(e) => setFlagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFlagSubmit(e)}
        />
        <button
          type="button"
          className="cos-flag-btn"
          onClick={handleFlagSubmit}
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
