import React, { useState, useEffect, useMemo } from 'react';
import { Activity, CheckCircle2, Radio, Send, Volume2, Zap } from 'lucide-react';
import { playBreachFanfare, playClickSound, playHackingBeep, playZapSound } from '../../utils/audio.js';
import { ctfEngine } from '../../utils/ctf/ctfEngine.js';
import { getChallengeById } from '../../utils/ctf/ctfChallenges.js';

const CHALLENGE_ID = 'stego-spectrogram-carrier';
const REVEALED_FLAG = 'FLAG{stego_audio_watermark_demodulated}';

export default function WaveformTunerHack({ onSolved, onBypass }) {
  const challenge = getChallengeById(CHALLENGE_ID);
  const [playerFreq, setPlayerFreq] = useState(2.0);
  const [playerAmp, setPlayerAmp] = useState(0.4);
  const [solved, setSolved] = useState(() => ctfEngine.isChallengeSolved(CHALLENGE_ID));
  const [lockProgress, setLockProgress] = useState(0);
  const [manualFlag, setManualFlag] = useState('');
  const [flagFeedback, setFlagFeedback] = useState(null);

  const targetFreq = 4.5;
  const targetAmp = 0.8;

  const freqDiff = Math.abs(playerFreq - targetFreq);
  const ampDiff = Math.abs(playerAmp - targetAmp);
  const coherence = Math.max(0, Math.min(100, Math.round(100 - freqDiff * 22 - ampDiff * 45)));

  useEffect(() => {
    if (solved) return;

    if (coherence >= 90) {
      playHackingBeep(1200);
      const interval = setInterval(() => {
        setLockProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setSolved(true);
            ctfEngine.submitFlag(CHALLENGE_ID, REVEALED_FLAG);
            playBreachFanfare();
            setTimeout(() => {
              onSolved?.();
            }, 1500);
            return 100;
          }
          return prev + 25;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setLockProgress(0);
    }
  }, [coherence, solved, onSolved]);

  const points = 60;
  const width = 360;
  const height = 110;
  const midY = height / 2;

  const targetPath = useMemo(() => {
    return Array.from({ length: points })
      .map((_, i) => {
        const x = (i / (points - 1)) * width;
        const y = midY + Math.sin((i / 8) * targetFreq) * (targetAmp * 40);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [points, width, height, midY, targetFreq, targetAmp]);

  const playerPath = useMemo(() => {
    return Array.from({ length: points })
      .map((_, i) => {
        const x = (i / (points - 1)) * width;
        const y = midY + Math.sin((i / 8) * playerFreq) * (playerAmp * 40);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [points, width, height, midY, playerFreq, playerAmp]);

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
    <div className="hack-puzzle-container wave-hack">
      <div className="hack-header-bar">
        <div className="hack-title">
          <Radio size={14} className="hack-icon-pulse text-cyan-400" />
          <span>CTF MISSION // STEGANOGRAPHY: AUDIO SPECTROGRAM DEMODULATION</span>
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
          Demodulate the hidden frequency carrier on the emergency relay. Tune <strong className="text-emerald-400">FREQUENCY</strong> and{' '}
          <strong className="text-cyan-400">AMPLITUDE</strong> to align the oscilloscope phase to extract the concealed watermark flag.
        </p>
      </div>

      {/* Waveform Oscilloscope Screen */}
      <div className="oscilloscope-screen">
        <div className="screen-grid-lines" />
        <svg className="wave-svg" viewBox={`0 0 ${width} ${height}`}>
          <path d={targetPath} className="target-wave" />
          <path d={playerPath} className="player-wave" />
        </svg>

        {lockProgress > 0 && !solved && (
          <div className="lock-hud">
            <span>SYNCHRONIZING CARRIER: {lockProgress}%</span>
            <div className="lock-bar-track">
              <div className="lock-bar-fill" style={{ width: `${lockProgress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Sliders Controls */}
      <div className="tuner-controls">
        <div className="control-slider-group">
          <div className="slider-label-row">
            <span>MODULATION FREQUENCY:</span>
            <strong>{playerFreq.toFixed(1)} GHz</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="8.0"
            step="0.1"
            value={playerFreq}
            onChange={(e) => setPlayerFreq(parseFloat(e.target.value))}
            className="hack-range-input"
            disabled={solved}
          />
        </div>

        <div className="control-slider-group">
          <div className="slider-label-row">
            <span>CARRIER AMPLITUDE:</span>
            <strong>{Math.round(playerAmp * 100)}%</strong>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={playerAmp}
            onChange={(e) => setPlayerAmp(parseFloat(e.target.value))}
            className="hack-range-input"
            disabled={solved}
          />
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
            <span className="font-bold text-emerald-300">CARRIER WATERMARK DEMODULATED // {REVEALED_FLAG}</span>
            <span className="text-[10px] text-emerald-400/80">+200 CTF PTS Awarded to Profile</span>
          </div>
        </div>
      ) : (
        <div className="hack-hint-bar mt-2">
          <span className="live-blip" />
          <span>Target wave: Ghost Trace · Coherence: {coherence}% · Locks at 90%+</span>
        </div>
      )}
    </div>
  );
}
