import React, { useState } from 'react';
import {
  Flag,
  CheckCircle2,
  ShieldAlert,
  Award,
  KeyRound,
  ExternalLink,
  Zap,
  Lock,
  Unlock,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

export default function CTFMissionsApp({ onOpenApp }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [flagInput, setFlagInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const challenges = (typeof ctfEngine?.getAllChallenges === 'function' ? ctfEngine.getAllChallenges() : []) || [];
  const ctfState = ctfEngine.getState();

  const categories = ['ALL', 'WEB', 'CRYPTO', 'REV', 'FORENSICS', 'PWN', 'NET', 'STEGO', 'OSINT'];

  const filtered = challenges.filter((c) => {
    if (selectedCategory === 'ALL') return true;
    return c.category.toUpperCase().includes(selectedCategory);
  });

  const handleGlobalSubmit = (e) => {
    e?.preventDefault();
    if (!flagInput.trim()) return;
    const clean = flagInput.trim();

    let matched = null;
    let result = null;

    for (const ch of challenges) {
      const res = ctfEngine.submitFlag(ch.id, clean);
      if (res.success || res.duplicate) {
        matched = ch;
        result = res;
        break;
      }
    }

    if (matched) {
      setFeedback({ success: true, text: result.message, title: matched.title, points: matched.points });
      setFlagInput('');
      playBreachFanfare();
    } else {
      setFeedback({ success: false, text: `Flag "${clean}" is invalid or does not match any challenge checksum.` });
      playZapSound();
    }
  };

  const getToolForChallenge = (chId) => {
    switch (chId) {
      case 'crypto-caesar-tumbler':
      case 'rev-duckyscript-badusb':
        return { id: 'cyberchef', name: 'CyberChef' };
      case 'forensics-pcap-exfiltration':
        return { id: 'wireshark', name: 'Wireshark' };
      case 'web-sqli-waf-bypass':
      case 'web-sidechannel-timing':
        return { id: 'burp', name: 'Burp Suite' };
      case 'pwn-stack-matrix-buffer':
      case 'rev-anti-debug-patch':
        return { id: 'ghidra', name: 'Ghidra & GDB' };
      case 'forensics-hardware-uart':
        return { id: 'logic', name: 'Logic Analyzer' };
      case 'stego-spectrogram-carrier':
      case 'stego-ceiling-vent':
        return { id: 'spectrogram', name: 'Spectrogram' };
      default:
        return { id: 'terminal', name: 'Kali Terminal' };
    }
  };

  return (
    <div className="cos-app-container select-text">
      {/* 1. Top Mission Control Header */}
      <div className="cos-app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="cos-app-title">
            <Flag size={15} style={{ color: '#10b981' }} />
            <span>CYBERSECURITY CTF MISSION CONTROL</span>
          </div>
          <span className="cos-badge cos-badge-emerald">
            {ctfState.solvedCount} / {challenges.length} MISSIONS COMPLETED
          </span>
          <span className="cos-badge cos-badge-amber">
            SCORE: {ctfState.score} PTS
          </span>
        </div>

        {/* Category Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cos-btn ${selectedCategory === cat ? 'cos-btn-primary' : ''}`}
              style={{ fontSize: '10px', padding: '2px 8px' }}
              onClick={() => {
                playClickSound(850);
                setSelectedCategory(cat);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Challenge Mission Grid */}
      <div className="cos-app-body" style={{ overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '10px' }}>
          {filtered.map((ch) => {
            const isSolved = ctfEngine.isChallengeSolved(ch.id);
            const tool = getToolForChallenge(ch.id);
            const isExpanded = expandedId === ch.id;

            return (
              <div
                key={ch.id}
                className="cos-panel"
                style={{
                  borderColor: isSolved ? 'rgba(16, 185, 129, 0.5)' : isExpanded ? 'rgba(56, 189, 248, 0.6)' : '#1e293b',
                  boxShadow: isSolved ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none',
                }}
              >
                {/* Challenge Header */}
                <div className="cos-panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="cos-badge cos-badge-cyan">{ch.category}</span>
                    <span
                      className={`cos-badge ${
                        ch.difficulty === 'EASY'
                          ? 'cos-badge-emerald'
                          : ch.difficulty === 'MEDIUM'
                          ? 'cos-badge-cyan'
                          : ch.difficulty === 'HARD'
                          ? 'cos-badge-amber'
                          : 'cos-badge-rose'
                      }`}
                    >
                      {ch.difficulty}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ color: '#fbbf24', fontSize: '11px' }}>+{ch.points} PTS</strong>
                    {isSolved ? (
                      <span className="cos-badge cos-badge-emerald">
                        <CheckCircle2 size={11} /> SOLVED
                      </span>
                    ) : (
                      <span className="cos-badge" style={{ color: '#94a3b8' }}>
                        <Lock size={10} /> ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Challenge Body */}
                <div className="cos-panel-body" style={{ gap: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#f1f5f9' }}>
                    {ch.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.45' }}>
                    {ch.description}
                  </div>

                  {/* Tool Action & Hint Toggle */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: 'auto', paddingTop: '6px', borderTop: '1px solid #1e293b' }}>
                    <button
                      type="button"
                      className="cos-btn cos-btn-primary"
                      style={{ fontSize: '10px', padding: '3px 8px' }}
                      onClick={() => onOpenApp?.(tool.id)}
                    >
                      <ExternalLink size={10} />
                      <span>Launch in {tool.name}</span>
                    </button>

                    <button
                      type="button"
                      className={`cos-btn ${isExpanded ? 'cos-btn-primary' : ''}`}
                      style={{ fontSize: '10px', padding: '3px 8px', marginLeft: 'auto' }}
                      onClick={() => {
                        playClickSound(850);
                        setExpandedId(isExpanded ? null : ch.id);
                      }}
                    >
                      <HelpCircle size={10} />
                      <span>{isExpanded ? 'Hide Guide' : '💡 How to Solve'}</span>
                      {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                    </button>
                  </div>

                  {/* Expandable Step-by-Step Solving Guide */}
                  {isExpanded && (
                    <div
                      style={{
                        background: 'rgba(3, 6, 12, 0.95)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        borderRadius: '4px',
                        padding: '10px',
                        fontSize: '11px',
                        lineHeight: '1.5',
                        color: '#cbd5e1',
                        animation: 'cosFadeIn 0.15s ease-out',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                        <Sparkles size={12} />
                        <span>STEP-BY-STEP SOLVING GUIDE</span>
                      </div>

                      <div style={{ marginBottom: '6px' }}>
                        <strong style={{ color: '#38bdf8' }}>1. Tool:</strong> Launch <strong>{tool.name}</strong> from the button above or the desktop icon.
                      </div>

                      <div style={{ marginBottom: '6px' }}>
                        <strong style={{ color: '#38bdf8' }}>2. Instructions:</strong>
                        <p style={{ color: '#94a3b8', margin: '2px 0' }}>
                          {ch.hints && ch.hints[0] ? ch.hints[0].text : 'Analyze the provided artifact in the recommended tool.'}
                        </p>
                        {ch.hints && ch.hints[1] && (
                          <p style={{ color: '#34d399', margin: '2px 0' }}>
                            <strong>Key Clue:</strong> {ch.hints[1].text}
                          </p>
                        )}
                      </div>

                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        Flag Format: <code className="cos-hint-code">FLAG&#123;...&#125;</code>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Global Flag Submitter Bar */}
      <div className="cos-flag-bar">
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>SUBMIT ANY CAPTURED FLAG:</span>
        <input
          type="text"
          className="cos-flag-input"
          placeholder="FLAG{unique_challenge_token}"
          value={flagInput}
          onChange={(e) => setFlagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGlobalSubmit(e)}
        />
        <button
          type="button"
          className="cos-flag-btn"
          onClick={handleGlobalSubmit}
        >
          SUBMIT FLAG
        </button>

        {feedback && (
          <div className={`cos-flag-feedback ${feedback.success ? 'is-success' : 'is-error'}`}>
            {feedback.success ? <CheckCircle2 size={13} /> : <Zap size={13} />}
            <span>
              {feedback.success ? `SUCCESS! [${feedback.title}] (+${feedback.points} PTS) - ${feedback.text}` : feedback.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
