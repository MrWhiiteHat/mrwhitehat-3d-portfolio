import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Cpu,
  Flame,
  Key,
  Lock,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Skull,
  Terminal,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';

export default function BlackHatVaultDisplay({ onOpenGadgets, onOpenLeaderboard }) {
  const [activeTab, setActiveTab] = useState('zero_days');
  const [unlockedSecretAudio, setUnlockedSecretAudio] = useState(false);

  const handleSecretGlitch = () => {
    playZapSound();
    playHackingBeep(1800);
    setUnlockedSecretAudio(true);
    setTimeout(() => setUnlockedSecretAudio(false), 3000);
  };

  return (
    <div className="black-hat-vault-terminal">
      {/* Vault Master Banner */}
      <div className="vault-banner">
        <div className="vb-left">
          <div className="skull-box" onClick={handleSecretGlitch} title="Click to trigger quantum glitch">
            <Skull size={24} className="skull-icon" />
          </div>
          <div>
            <div className="vb-kicker">LEVEL 6 // MAXIMUM CLASSIFIED RESTRICTED SECTOR</div>
            <h1 className="vb-title">THE BLACK HAT VAULT</h1>
            <span className="vb-desc">
              UNAUTHORIZED ACCESS DETECTED · WELCOME ROOT OPERATIVE · ZERO-DAY REPOSITORY ARMED
            </span>
          </div>
        </div>

        <div className="vb-right">
          <button
            type="button"
            className="vault-action-pill lb-pill"
            onClick={() => {
              playClickSound(1200);
              onOpenLeaderboard?.();
            }}
          >
            <Trophy size={14} />
            <span>Leaderboard</span>
          </button>
          <button
            type="button"
            className="vault-action-pill gadget-pill"
            onClick={() => {
              playClickSound(1200);
              onOpenGadgets?.();
            }}
          >
            <Zap size={14} />
            <span>Inspect 3D Tools</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="vault-tabs">
        <button
          type="button"
          className={`vt-tab ${activeTab === 'zero_days' ? 'active' : ''}`}
          onClick={() => {
            playClickSound(1100);
            setActiveTab('zero_days');
          }}
        >
          <ShieldAlert size={14} />
          <span>Zero-Day Exploits</span>
        </button>
        <button
          type="button"
          className={`vt-tab ${activeTab === 'arsenal' ? 'active' : ''}`}
          onClick={() => {
            playClickSound(1100);
            setActiveTab('arsenal');
          }}
        >
          <Radio size={14} />
          <span>Classified Hardware</span>
        </button>
        <button
          type="button"
          className={`vt-tab ${activeTab === 'credentials' ? 'active' : ''}`}
          onClick={() => {
            playClickSound(1100);
            setActiveTab('credentials');
          }}
        >
          <Award size={14} />
          <span>Black Hat Credentials</span>
        </button>
      </div>

      {/* Tab 1: Zero-Day Exploits */}
      {activeTab === 'zero_days' && (
        <div className="vault-content-grid">
          {[
            {
              cve: 'CVE-2026-ROOT-01',
              title: 'Kernel Memory Corruptor & Ring-0 Arbitrary Write',
              severity: 'CRITICAL 9.9',
              target: 'Linux 6.x / eBPF Kernel Memory Subsystem',
              desc: 'Exploiting eBPF verifier range tracking discrepancies to achieve arbitrary kernel read/write primitives and bypass SMEP/SMAP memory protections.',
              hash: 'SHA256: 8f4b23a9d1...f89c',
            },
            {
              cve: 'CVE-2026-SUBGHZ-02',
              title: 'Keeloq Rolling Code De-Synchronization Attack',
              severity: 'HIGH 8.8',
              target: 'Sub-GHz 433.92MHz Commercial Access Gates',
              desc: 'Signal jamming and interception technique capturing sequential counter frames to compute the manufacturer crypt-key and clone rolling gate credentials.',
              hash: 'SHA256: 3c91a0ef88...12da',
            },
            {
              cve: 'CVE-2026-BADUSB-03',
              title: 'Virtual HID Keyboard Firmware Injection & UAC Bypass',
              severity: 'HIGH 8.5',
              target: 'Windows 11 / macOS Sonoma USB Host Controllers',
              desc: 'Dual-stage DuckyScript payload executing purely in volatile RAM, bypassing AMSI and Microsoft Defender behavior heuristics.',
              hash: 'SHA256: 7e14bc5510...a41f',
            },
          ].map((item, idx) => (
            <div key={idx} className="vault-card">
              <div className="vc-top">
                <span className="vc-cve">{item.cve}</span>
                <span className="vc-sev">{item.severity}</span>
              </div>
              <h3 className="vc-title">{item.title}</h3>
              <div className="vc-target">TARGET: {item.target}</div>
              <p className="vc-desc">{item.desc}</p>
              <div className="vc-footer">
                <span className="vc-hash">{item.hash}</span>
                <span className="vc-badge">VERIFIED POC</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Classified Hardware */}
      {activeTab === 'arsenal' && (
        <div className="vault-hardware-showcase">
          <div className="vh-card">
            <div className="vh-badge">FEATURED 3D GADGET</div>
            <h3>Flipper Zero (Black Hat Custom Firmware)</h3>
            <p>
              Loaded with Unleashed / Marauder firmware, custom Sub-GHz frequency databases, RFID
              cloners, and Bluetooth beacon spam modules.
            </p>
            <button
              type="button"
              className="vh-inspect-btn"
              onClick={() => onOpenGadgets?.('flipper')}
            >
              <span>INSPECT IN 3D (360° ORBIT) 🔍</span>
            </button>
          </div>

          <div className="vh-card">
            <div className="vh-badge">FEATURED 3D GADGET</div>
            <h3>USB Rubber Ducky 3.0 (Hak5)</h3>
            <p>
              1000 WPM hardware keystroke injector with real-time OS fingerprinting, payload arming
              switch, and non-volatile storage.
            </p>
            <button
              type="button"
              className="vh-inspect-btn"
              onClick={() => onOpenGadgets?.('ducky')}
            >
              <span>INSPECT IN 3D (360° ORBIT) 🔍</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Black Hat Credentials */}
      {activeTab === 'credentials' && (
        <div className="vault-creds-container">
          <div className="cred-master-card">
            <div className="cmc-header">
              <Award size={28} className="text-yellow" />
              <div>
                <h2>CERTIFIED ROOT MASTER (BLACK HAT CLEARANCE)</h2>
                <span>ISSUED BY: CTOS CYBER SECURITY COMMAND ARCHITECTURE</span>
              </div>
            </div>
            <p className="cmc-body">
              This operative has successfully breached all security sectors of the workspace,
              penetrated the classified ventilation duct, and averted the Zero-Day Core Meltdown.
            </p>
            <div className="cmc-meta">
              <div>
                <span>STATUS:</span> <strong>PERMANENT PRIVILEGE ESCALATION</strong>
              </div>
              <div>
                <span>SECURITY CLEARANCE:</span> <strong>LEVEL 6 // ROOT</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
