import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Activity,
  CheckCircle2,
  Zap,
  KeyRound,
  HelpCircle,
  Sparkles,
  Copy,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

const CHALLENGE_ID = 'stego-spectrogram-carrier';
const REVEALED_FLAG = 'FLAG{stego_audio_watermark_demodulated}';

export default function SpectrogramApp({ onOpenStation }) {
  const [carrierFreq, setCarrierFreq] = useState(115.0);
  const [bandpassFilter, setBandpassFilter] = useState('ALL_PASS');
  const [showHints, setShowHints] = useState(true);
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);
  const canvasRef = useRef(null);

  const targetFreq = 142.8;
  const isAligned = Math.abs(carrierFreq - targetFreq) <= 0.8 && bandpassFilter === 'HIGHPASS_15KHZ';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let offset = 0;

    const render = () => {
      offset += 1;
      const w = canvas.width;
      const h = canvas.height;

      // Dark spectral background
      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, w, h);

      // Noise floor
      for (let y = 0; y < h; y += 4) {
        for (let x = 0; x < w; x += 12) {
          const rand = Math.random();
          if (rand > 0.85) {
            ctx.fillStyle = `rgba(14, 165, 233, ${rand * 0.25})`;
            ctx.fillRect(x, y, 8, 3);
          }
        }
      }

      // Carrier frequency line
      const lineY = Math.round(((200.0 - carrierFreq) / 200.0) * h);
      ctx.strokeStyle = isAligned ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(w, lineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // If tuned, draw FFT spectrogram visual glyphs
      if (isAligned) {
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 15px monospace';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10;
        ctx.fillText('>>> SPECTRAL WATERMARK DEMODULATED <<<', 35, lineY - 24);
        ctx.fillText(REVEALED_FLAG, 35, lineY - 6);
        ctx.shadowBlur = 0;

        // Spectral heatmap waves
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        for (let x = 0; x < w; x += 8) {
          const waveHeight = Math.sin((x + offset * 3) * 0.05) * 12 + 16;
          ctx.fillRect(x, lineY + 6, 5, waveHeight);
        }
      } else {
        ctx.fillStyle = '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText(`Carrier: ${carrierFreq.toFixed(1)} kHz (Tuning...)`, 15, 22);
      }

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [carrierFreq, isAligned]);

  const handleTunePreset = () => {
    playClickSound(1000);
    setCarrierFreq(142.8);
    setBandpassFilter('HIGHPASS_15KHZ');
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, manualFlag.trim());
    if (res.success || res.duplicate) {
      const stationId = res.stationId || 'contact';
      setFlagFeedback({
        success: true,
        text: res.message,
        stationId,
        stationName: 'CONTACT TERMINAL'
      });
      playBreachFanfare();
      setTimeout(() => {
        onOpenStation?.(stationId);
      }, 1800);
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="cos-app-container select-text">
      {/* 1. Header Toolbar */}
      <div className="cos-app-header">
        <div className="cos-app-title">
          <Radio size={15} style={{ color: '#ec4899' }} />
          <span>SONICVISUALIZER // AUDIO STEGANOGRAPHY SPECTROGRAM</span>
          <span className={`cos-badge ${isAligned ? 'cos-badge-emerald' : 'cos-badge-rose'}`}>
            {isAligned ? 'CARRIER DEMODULATED' : 'CARRIER UNTUNED'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`cos-hint-toggle ${showHints ? 'is-active' : ''}`}
            onClick={() => setShowHints((prev) => !prev)}
            title="Toggle Steganography Guide & Hints"
          >
            <HelpCircle size={13} />
            <span>{showHints ? 'HIDE HINTS' : '💡 HOW TO SOLVE'}</span>
          </button>

          <button
            type="button"
            className="cos-btn"
            onClick={() => {
              playClickSound(800);
              setCarrierFreq(115.0);
              setBandpassFilter('ALL_PASS');
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Receiver</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Hint & Walkthrough Drawer */}
      {showHints && (
        <div className="cos-hint-drawer">
          <div className="cos-hint-header-bar">
            <div className="cos-hint-title">
              <Sparkles size={14} />
              <span>STEGANOGRAPHY GUIDE // ULTRASONIC CARRIER DEMODULATION</span>
            </div>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>Category: Steganography · Difficulty: Medium · Reward: +200 PTS</span>
          </div>

          <div className="cos-hint-grid">
            <div className="cos-hint-card">
              <h4>🎯 Objective</h4>
              <p>An inaudible ultrasonic audio signal conceals an encrypted textual watermark in the high-frequency spectrum.</p>
            </div>

            <div className="cos-hint-card">
              <h4>🔍 Steganography Clues</h4>
              <p>• The covert carrier frequency sits at <strong style={{ color: '#38bdf8' }}>~142.8 kHz</strong>.<br />
              • Audible background noise drowns the watermark unless the <strong style={{ color: '#ec4899' }}>15 kHz High-Pass DSP filter</strong> is engaged.</p>
            </div>

            <div className="cos-hint-card">
              <h4>🛠️ How to Solve</h4>
              <p>1. Tune the Carrier Frequency slider to <strong style={{ color: '#34d399' }}>142.8 kHz</strong> (or click Auto-Tune).</p>
              <p>2. Select Filter: <strong style={{ color: '#34d399' }}>15 kHz High-Pass DSP</strong>.</p>
              <p>3. Watch the waterfall visualizer reconstruct the flag:</p>
              <code className="cos-hint-code">{REVEALED_FLAG}</code>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace: Tuning Controls (Left) | Spectrogram Waterfall Canvas (Right) */}
      <div className="cos-app-body">
        <div className="cos-split-horizontal">
          {/* Left: Demodulation Controls */}
          <div className="cos-panel" style={{ flex: 0.9 }}>
            <div className="cos-panel-header">
              <span>RF / DSP RECEIVER CONTROLS</span>
            </div>
            <div className="cos-panel-body" style={{ gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Carrier Frequency:</span>
                  <strong style={{ color: isAligned ? '#34d399' : '#38bdf8' }}>
                    {carrierFreq.toFixed(1)} kHz
                  </strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="0.2"
                  value={carrierFreq}
                  onChange={(e) => {
                    playClickSound(1200);
                    setCarrierFreq(parseFloat(e.target.value));
                  }}
                  style={{ width: '100%', accentColor: '#ec4899' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748b' }}>
                  <span>0 kHz (Audio)</span>
                  <span style={{ color: '#fbbf24' }}>142.8 kHz (Target)</span>
                  <span>200 kHz (Ultrasonic)</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  DSP Bandpass Filter:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={`cos-btn ${bandpassFilter === 'ALL_PASS' ? 'cos-btn-primary' : ''}`}
                    style={{ flex: 1, fontSize: '10px' }}
                    onClick={() => {
                      playClickSound(850);
                      setBandpassFilter('ALL_PASS');
                    }}
                  >
                    All-Pass (Raw)
                  </button>
                  <button
                    type="button"
                    className={`cos-btn ${bandpassFilter === 'HIGHPASS_15KHZ' ? 'cos-btn-primary' : ''}`}
                    style={{ flex: 1.2, fontSize: '10px', borderColor: '#34d399', color: bandpassFilter === 'HIGHPASS_15KHZ' ? '#fff' : '#34d399' }}
                    onClick={() => {
                      playClickSound(950);
                      setBandpassFilter('HIGHPASS_15KHZ');
                    }}
                  >
                    15 kHz High-Pass
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
                <button
                  type="button"
                  className="cos-btn cos-btn-success"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleTunePreset}
                >
                  <Sparkles size={12} />
                  <span>Auto-Tune to 142.8 kHz + High-Pass</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Spectrogram Waterfall Canvas */}
          <div className="cos-panel" style={{ flex: 1.3 }}>
            <div className="cos-panel-header">
              <span>WATERFALL FFT SPECTRAL HEATMAP (2D FFT)</span>
              {isAligned && (
                <button
                  type="button"
                  className="cos-btn cos-btn-success"
                  style={{ fontSize: '9.5px', padding: '1px 6px' }}
                  onClick={() => {
                    playClickSound(900);
                    setManualFlag(REVEALED_FLAG);
                  }}
                >
                  <Copy size={10} />
                  <span>Copy Flag</span>
                </button>
              )}
            </div>
            <div className="cos-panel-body" style={{ padding: '0', background: '#000', overflow: 'hidden' }}>
              <canvas
                ref={canvasRef}
                width={500}
                height={260}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Flag Submitter Bar */}
      <div className="cos-flag-bar">
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>SUBMIT CAPTURED FLAG:</span>
        <input
          type="text"
          className="cos-flag-input"
          placeholder="FLAG{...}"
          value={manualFlag}
          onChange={(e) => setManualFlag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit(e)}
        />
        <button
          type="button"
          className="cos-flag-btn"
          onClick={handleManualSubmit}
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
