import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Radio, RefreshCw, ShieldAlert, Wifi, Zap } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';

const TARGET_APS = [
  { id: 'ap1', ssid: 'CORP-GUEST-2.4G', bssid: 'A4:C3:F0:88:12:01', channel: 6, band: '2.4GHz', enc: 'WPA2-PSK' },
  { id: 'ap2', ssid: 'EXECUTIVE-SECURE-5G', bssid: 'DC:A6:32:9B:44:E2', channel: 36, band: '5.8GHz', enc: 'WPA3-SAE' },
  { id: 'ap3', ssid: 'IOT-CAMERA-BACKHAUL', bssid: 'B8:27:EB:14:8F:90', channel: 11, band: '2.4GHz', enc: 'WPA2-Enterprise' },
];

export default function HardwareArsenalHack({ onSolved, onBypass }) {
  const [selectedAP, setSelectedAP] = useState(0);
  const [deauthBursting, setDeauthBursting] = useState(false);
  const [capturedPackets, setCapturedPackets] = useState(0);
  const [beaconSync, setBeaconSync] = useState(false);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    if (capturedPackets >= 4 && !solved) {
      setSolved(true);
      playBreachFanfare();
      setTimeout(() => {
        onSolved();
      }, 1000);
    }
  }, [capturedPackets, solved, onSolved]);

  const handleSendDeauth = () => {
    if (solved || deauthBursting) return;
    playHackingBeep(1400);
    setDeauthBursting(true);

    // Simulate sending 802.11 deauthentication frames
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

  return (
    <div className="hack-puzzle-container hardware-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Wifi size={14} className="hack-icon-pulse" />
          <span>HAK5_PINEAPPLE // RF_DEAUTH_HANDSHAKE_SNIFFER.air</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge">
            {solved ? 'WPA2_EAPOL_CRACKED' : `${capturedPackets}/4 HANDSHAKES`}
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
          Simulate a <strong style={{ color: '#38bdf8' }}>Hak5 WiFi Pineapple Mark VII</strong> injection. Send a deauth burst to force re-association, then lock the intercepted <strong style={{ color: '#4ade80' }}>4-Way EAPOL Handshake</strong>!
        </p>
      </div>

      {/* Target AP Selector */}
      <div className="ap-target-selector">
        <span className="section-micro-lbl">SELECT ADVERSARY TARGET AP:</span>
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
                <span>{ap.bssid}</span>
                <span className="ap-ch">CH {ap.channel} ({ap.band})</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Capture HUD & Handshake Progress */}
      <div className="handshake-hud-box">
        <div className="handshake-status-bar">
          <span className="hs-label">EAPOL 4-WAY HANDSHAKE FRAMES:</span>
          <div className="hs-pills-row">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={`step-${step}`}
                className={`hs-step-pill ${capturedPackets >= step ? 'hs-captured' : ''}`}
              >
                FRAME {step}/4 {capturedPackets >= step ? '✔' : '...'}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="injection-action-buttons">
          <button
            type="button"
            className={`inject-btn deauth-btn ${deauthBursting ? 'bursting' : ''}`}
            onClick={handleSendDeauth}
            disabled={solved || deauthBursting}
          >
            <Radio size={14} />
            <span>{deauthBursting ? 'TRANSMITTING DEAUTH FRAMES...' : '1. SEND DEAUTH BURST (IEEE 802.11)'}</span>
          </button>

          <button
            type="button"
            className={`inject-btn capture-btn ${beaconSync ? 'sync-ready' : ''}`}
            onClick={handleCaptureHandshake}
            disabled={solved || !beaconSync}
          >
            <Activity size={14} />
            <span>
              {beaconSync ? '2. SNIFF EAPOL KEY EXCHANGE NOW! ⚡' : '2. WAITING FOR RE-ASSOCIATION BEACON...'}
            </span>
          </button>
        </div>
      </div>

      {solved ? (
        <div className="hack-success-banner">
          <CheckCircle2 size={16} />
          <span>4-WAY HANDSHAKE RECORDED // HARDWARE ARSENAL SPECS UNLOCKED</span>
        </div>
      ) : (
        <div className="hack-hint-bar">
          <span className="live-blip" />
          <span>
            {beaconSync
              ? 'Target device re-connecting! Click SNIFF EAPOL KEY EXCHANGE immediately!'
              : 'Click SEND DEAUTH BURST to disassociate the client.'}
          </span>
        </div>
      )}
    </div>
  );
}
