import React, { useState, useEffect, useRef } from 'react';
import { Radio, Activity, CheckCircle2, Zap, KeyRound } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

const CHALLENGE_ID = 'stego-spectrogram-carrier';
const REVEALED_FLAG = 'FLAG{stego_audio_watermark_demodulated}';

export default function SpectrogramApp() {
  const [carrierFreq, setCarrierFreq] = useState(115.0);
  const [bandpassFilter, setBandpassFilter] = useState('ALL_PASS');
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);
  const canvasRef = useRef(null);

  const targetFreq = 142.8;
  const isAligned = Math.abs(carrierFreq - targetFreq) <= 0.6 && bandpassFilter === 'HIGHPASS_15KHZ';

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

      ctx.fillStyle = '#050a08';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#0e2417';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      if (isAligned) {
        // Demodulated clear spectral watermark
        ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
        ctx.fillRect(10, 15, w - 20, h - 30);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('DEMODULATED CARRIER LOCK // 142.8 kHz [HIGHPASS_15KHZ]', 16, 35);

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('WATERMARK: ' + REVEALED_FLAG, 16, 68);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('Signal-to-Noise Ratio: 34.2 dB · Modulation: Audio FSK / Spectrogram', 16, 92);

        // Waveform
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < w; x += 4) {
          const y = 80 + Math.sin((x + offset * 2) * 0.08) * 12;
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

        for (let i = 0; i < 50; i++) {
          const rx = Math.random() * w;
          const ry = Math.random() * h;
          const rw = Math.random() * 25 + 5;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(14, 165, 233, 0.15)';
          ctx.fillRect(rx, ry, rw, 2);
        }
      }

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [isAligned, carrierFreq, bandpassFilter]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFlag.trim()) return;
    const res = ctfEngine.submitFlag(CHALLENGE_ID, manualFlag);
    if (res.success || res.duplicate) {
      setFlagFeedback({ success: true, text: res.message });
      playBreachFanfare();
    } else {
      setFlagFeedback({ success: false, text: res.message });
      playZapSound();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b10] font-mono text-xs select-text overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] px-3 py-1.5 bg-[#0f172a]">
        <span className="text-[#38bdf8] font-bold">SonicVisualizer // Audio Spectrogram & Carrier Demodulator</span>
        <span className="text-slate-400 text-[11px]">Sampling: 96 kHz 24-bit</span>
      </div>

      {/* Waterfall Canvas */}
      <div className="border-b border-[#1e293b] bg-black p-1">
        <canvas ref={canvasRef} width={640} height={140} className="w-full h-36 block rounded" />
      </div>

      {/* Controls */}
      <div className="p-3 bg-[#080d14] flex-1 flex flex-col gap-3 overflow-y-auto">
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-300">RECEIVER CARRIER FREQUENCY:</span>
            <strong className="text-cyan-400 text-sm">{carrierFreq.toFixed(1)} kHz</strong>
          </div>
          <input
            type="range"
            min="100.0"
            max="180.0"
            step="0.2"
            value={carrierFreq}
            onChange={(e) => setCarrierFreq(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
            <span>100 kHz</span>
            <span>120 kHz</span>
            <span>142.8 kHz</span>
            <span>160 kHz</span>
            <span>180 kHz</span>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">DSP ACOUSTIC FILTER:</label>
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
                onClick={() => setBandpassFilter(f.id)}
                className={`cos-btn py-1 text-xs justify-center ${bandpassFilter === f.id ? 'cos-btn-primary font-bold' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flag Submission Bar */}
      <div className="p-2.5 bg-[#0a0f16] border-t border-[#1e293b] flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 uppercase">SUBMIT DEMODULATED STEGO FLAG:</span>
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={manualFlag}
            onChange={(e) => setManualFlag(e.target.value)}
            placeholder="FLAG{stego_...}"
            className="cos-input py-1 text-xs w-64"
          />
          <button
            type="submit"
            className="cos-btn cos-btn-success py-1 text-xs font-bold"
          >
            SUBMIT FLAG
          </button>
        </form>
      </div>

      {flagFeedback && (
        <div className={`p-2 text-xs font-mono border-t ${flagFeedback.success ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300' : 'bg-rose-950/80 border-rose-500 text-rose-300'}`}>
          {flagFeedback.text}
        </div>
      )}
    </div>
  );
}
