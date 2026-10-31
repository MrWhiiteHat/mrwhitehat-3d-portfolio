import React, { useState, useEffect } from 'react';
import { Radio, Activity, CheckCircle2, Zap, Sliders, Eye } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'stego-spectrogram-carrier';
const REVEALED_FLAG = 'FLAG{stego_audio_watermark_demodulated}';

export default function StegoAnalyzerChallenge({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [carrierFreq, setCarrierFreq] = useState(130.0);
  const [bandpassFilter, setBandpassFilter] = useState('ALL_PASS');
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const targetFreq = 142.8;
  const isAligned = Math.abs(carrierFreq - targetFreq) <= 0.6 && bandpassFilter === 'BANDPASS_15KHZ';

  useEffect(() => {
    if (isAligned && !solved) {
      setSolved(true);
      ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
      playBreachFanfare();
      setTimeout(() => onSolved?.(), 1600);
    }
  }, [isAligned, solved, onSolved]);

  const handleFreqChange = (val) => {
    if (solved) return;
    setCarrierFreq(val);
    playClickSound(800 + (val - 120) * 10);
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
          Tune the software-defined radio receiver. Set carrier frequency to the harmonic peak (~142.8 MHz) and apply the 15 kHz Bandpass filter to decode the visual spectrogram waterfall image.
        </p>
      </div>

      {/* Spectrogram Waterfall Simulation Canvas */}
      <div className="mt-3 p-4 bg-black border border-slate-800 rounded font-mono relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]">
        <div className="absolute top-1 left-2 text-[10px] text-slate-500 uppercase">
          // FFT Spectrogram Waterfall (Time vs Frequency):
        </div>

        {isAligned ? (
          <div className="text-center space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest block font-bold">
              [+] DEMODULATED VISUAL WATERMARK DETECTED:
            </span>
            <div className="text-lg font-bold text-emerald-300 tracking-wider animate-pulse border border-emerald-500/50 bg-emerald-950/60 px-4 py-2 rounded">
              {REVEALED_FLAG}
            </div>
            <span className="text-[10px] text-slate-400">142.850 MHz · 15 kHz FFT Waterfall Resolved</span>
          </div>
        ) : (
          <div className="text-center text-slate-600 space-y-2">
            <div className="font-mono text-xs tracking-widest text-slate-500">
              ~~~ ~~~ ~~~ NOISE FLOOR / UNRESOLVED RF CARRIER ~~~ ~~~ ~~~
            </div>
            <div className="text-[11px] text-slate-400">
              Current Carrier: <strong className="text-cyan-400">{carrierFreq.toFixed(1)} MHz</strong> · Filter: <strong className="text-amber-400">{bandpassFilter}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Radio Tuning Controls */}
      <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">CARRIER FREQUENCY (MHz):</span>
            <strong className="text-cyan-400">{carrierFreq.toFixed(1)} MHz (Target: ~142.8 MHz)</strong>
          </div>
          <input
            type="range"
            min="120.0"
            max="160.0"
            step="0.2"
            value={carrierFreq}
            onChange={(e) => handleFreqChange(parseFloat(e.target.value))}
            className="w-full hack-range-input cursor-pointer"
            disabled={solved}
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-mono text-slate-400">BANDPASS FILTER:</span>
          {['ALL_PASS', 'LOW_PASS_5KHZ', 'BANDPASS_15KHZ', 'HIGH_PASS_30KHZ'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => {
                setBandpassFilter(filter);
                playHackingBeep(1200);
              }}
              className={`text-[10px] font-mono px-2.5 py-1 rounded transition border ${
                bandpassFilter === filter
                  ? 'bg-cyan-600 text-black font-bold border-cyan-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

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
            <span className="font-bold text-emerald-300">SPECTROGRAM DEMODULATED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+200 CTF PTS Awarded to Profile · Secure Comms Unlocked</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Tune to 142.8 MHz and enable BANDPASS 15KHZ to render the spectrogram watermark</span>
        </div>
      )}
    </div>
  );
}
