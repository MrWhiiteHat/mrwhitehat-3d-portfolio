import React, { useState, useEffect, useRef } from 'react';
import { Radio, Activity, CheckCircle2, Zap, Sliders, Eye, KeyRound } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'stego-spectrogram-carrier';
const REVEALED_FLAG = 'FLAG{stego_audio_watermark_demodulated}';

export default function StegoAnalyzerChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [carrierFreq, setCarrierFreq] = useState(112.5); // Starts untuned
  const [bandpassFilter, setBandpassFilter] = useState('ALL_PASS');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);
  const canvasRef = useRef(null);

  const targetFreq = 142.8;
  const isAligned = Math.abs(carrierFreq - targetFreq) <= 0.6 && bandpassFilter === 'HIGHPASS_15KHZ';

  // Live Canvas Spectrogram Waterfall Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let offset = 0;

    const render = () => {
      offset += 1;
      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = '#050a08';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = '#0e2417';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isAligned) {
        // Demodulated clear spectral watermark
        ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
        ctx.fillRect(10, 20, width - 20, height - 40);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('DEMODULATED CARRIER LOCK // 142.8 kHz [HIGHPASS_15KHZ]', 16, 38);

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('WATERMARK: ' + REVEALED_FLAG, 16, 70);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('Signal-to-Noise Ratio: 34.2 dB · Modulation: Audio FSK/Spectrogram', 16, 95);

        // Audio waveform lines
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const y = 80 + Math.sin((x + offset * 2) * 0.08) * 12 + Math.cos((x) * 0.03) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Untuned noisy spectrogram
        ctx.fillStyle = '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText(`CARRIER: ${carrierFreq.toFixed(1)} kHz | FILTER: ${bandpassFilter}`, 16, 25);
        ctx.fillText('STATUS: CARRIER DESYNCHRONIZED // STATIC NOISE', 16, 45);

        // Rolling noisy scanlines
        for (let i = 0; i < 60; i++) {
          const rx = Math.random() * width;
          const ry = Math.random() * height;
          const rw = Math.random() * 25 + 5;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(14, 165, 233, 0.15)';
          ctx.fillRect(rx, ry, rw, 2);
        }
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isAligned, carrierFreq, bandpassFilter]);

  const handleFreqChange = (val) => {
    setCarrierFreq(val);
    playClickSound(800 + (val - 100) * 8);
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
    <div className="hack-puzzle-container stego-challenge">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Radio size={15} className="text-cyan-400 hack-icon-pulse" />
          <span>STEGANOGRAPHY // AUDIO SPECTROGRAM & CARRIER WATERMARK WORKSTATION</span>
        </div>
        <div className="hack-actions-right">
          <span className="hack-status-badge text-emerald-400">
            {solved ? '✔ FLAG CAPTURED' : `${challenge?.points || 200} PTS`}
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
          Audio forensic units detected a covert ultrasonic carrier hidden inside the office radio transmissions. Sweep the demodulator receiver across the ultrasonic spectrum (above 140 kHz) and apply high-pass DSP filtering to isolate the watermark from background noise.
        </p>
      </div>

      {/* DSP Controls Box */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded mt-2 space-y-3">
        {/* Carrier Frequency Slider */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300">RECEIVER CARRIER FREQUENCY:</span>
            <strong className="text-cyan-400 font-bold text-sm">{carrierFreq.toFixed(1)} kHz</strong>
          </div>
          <input
            type="range"
            min="100.0"
            max="180.0"
            step="0.2"
            value={carrierFreq}
            onChange={(e) => handleFreqChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>100.0 kHz</span>
            <span>120.0 kHz</span>
            <span>140.0 kHz</span>
            <span>160.0 kHz</span>
            <span>180.0 kHz</span>
          </div>
        </div>

        {/* DSP Bandpass Filter Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 block">
            DIGITAL SIGNAL PROCESSOR (DSP) ACOUSTIC FILTER:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'ALL_PASS', label: 'All-Pass (Raw)' },
              { id: 'LOWPASS_5KHZ', label: 'Low-Pass 5kHz' },
              { id: 'NOTCH_10KHZ', label: 'Notch 10kHz' },
              { id: 'HIGHPASS_15KHZ', label: 'High-Pass 15kHz' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playClickSound(950);
                  setBandpassFilter(f.id);
                }}
                className={`px-2 py-1.5 rounded text-xs font-mono transition border ${
                  bandpassFilter === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold'
                    : 'bg-black border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Spectrogram Waterfall Canvas */}
      <div className="mt-3 border border-slate-800 rounded bg-black overflow-hidden p-1">
        <canvas
          ref={canvasRef}
          width={560}
          height={120}
          className="w-full h-32 block rounded"
        />
      </div>

      {/* FLAG SUBMISSION FORM */}
      <div className="mt-4 pt-3 border-t border-slate-800">
        <label className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} />
          <span>SUBMIT EXTRACTED STEGO FLAG:</span>
        </label>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{...}"
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
            <span className="font-bold text-emerald-300">STEGANOGRAPHY DECODED // CARRIER LOCKED</span>
            <span className="text-[10px] text-emerald-400/80">+200 CTF PTS Awarded · Audio Watermark Solved</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Tune carrier to ~142.8 kHz and select High-Pass 15kHz filter to resolve the watermark</span>
        </div>
      )}
    </div>
  );
}
