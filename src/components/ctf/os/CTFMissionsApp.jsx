import React, { useState } from 'react';
import { Flag, CheckCircle2, ShieldAlert, Award, KeyRound, ExternalLink, Zap, Lock, Unlock } from 'lucide-react';
import { playClickSound, playHackingBeep, playZapSound, playBreachFanfare } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

export default function CTFMissionsApp({ onOpenApp }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [flagInput, setFlagInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const challenges = (typeof ctfEngine?.getAllChallenges === "function" ? ctfEngine.getAllChallenges() : []) || [];
  const ctfState = ctfEngine.getState();

  const categories = ['ALL', 'WEB', 'CRYPTO', 'REV', 'FORENSICS', 'PWN', 'NET', 'STEGO', 'OSINT'];

  const filtered = challenges.filter((c) => {
    if (selectedCategory === 'ALL') return true;
    return c.category.toUpperCase().includes(selectedCategory);
  });

  const handleGlobalSubmit = (e) => {
    e.preventDefault();
    if (!flagInput.trim()) return;
    const clean = flagInput.trim();

    // Check all challenges
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
      setFeedback({ success: false, text: `Flag "${clean}" is invalid or does not match any challenge hash.` });
      playZapSound();
    }
  };

  const getToolForChallenge = (chId) => {
    if (chId.includes('pcap')) return 'wireshark';
    if (chId.includes('sqli') || chId.includes('timing')) return 'burp';
    if (chId.includes('stack') || chId.includes('patch')) return 'ghidra';
    if (chId.includes('caesar')) return 'cyberchef';
    if (chId.includes('uart')) return 'logic';
    if (chId.includes('stego')) return 'spectrogram';
    return 'terminal';
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070b10] font-mono text-xs select-text overflow-hidden">
      {/* Header & Stats Strip */}
      <div className="p-3 bg-[#0d141f] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flag size={16} className="text-emerald-400" />
          <strong className="text-slate-100 text-sm">CTF MISSION CONTROL // OPERATIVE BRIEFING</strong>
        </div>
        <div className="flex items-center gap-3">
          <div className="cos-score-pill">
            <span>SCORE:</span>
            <strong className="text-emerald-300">{ctfState.score} PTS</strong>
          </div>
          <span className="text-slate-400">
            SOLVED: <strong>{ctfState.solvedChallenges.length} / {challenges.length}</strong>
          </span>
        </div>
      </div>

      {/* Global Flag Submitter Bar */}
      <div className="p-2.5 bg-[#080d14] border-b border-[#1e293b] flex items-center justify-between gap-2">
        <span className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1">
          <KeyRound size={12} />
          <span>GLOBAL FLAG VERIFIER:</span>
        </span>
        <form onSubmit={handleGlobalSubmit} className="flex items-center gap-2 flex-1 max-w-lg">
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            placeholder="Submit any captured flag: FLAG{...}"
            className="cos-input py-1 text-xs flex-1 text-emerald-300"
          />
          <button
            type="submit"
            className="cos-btn cos-btn-success py-1 text-xs font-bold"
          >
            VERIFY FLAG
          </button>
        </form>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-2 px-3 text-xs font-mono border-b ${feedback.success ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-rose-950 border-rose-500 text-rose-300'}`}>
          {feedback.text}
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="p-2 bg-[#090e15] border-b border-[#1e293b] flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] text-slate-500 mr-1">CATEGORY:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              playClickSound(850);
              setSelectedCategory(cat);
            }}
            className={`px-2 py-0.5 rounded text-[10px] transition ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-[#04070a]">
        {filtered.map((ch) => {
          const isSolved = ctfEngine.isChallengeSolved(ch.id);
          const isExpanded = expandedId === ch.id;
          const tool = getToolForChallenge(ch.id);

          return (
            <div
              key={ch.id}
              className={`p-3 rounded border transition ${
                isSolved
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                  : 'bg-[#080d14] border-[#1e293b] text-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {ch.category}
                    </span>
                    <span
                      className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                        ch.difficulty === 'EASY'
                          ? 'bg-emerald-950 text-emerald-400'
                          : ch.difficulty === 'MEDIUM'
                          ? 'bg-sky-950 text-sky-400'
                          : ch.difficulty === 'HARD'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {ch.difficulty}
                    </span>
                  </div>
                  <strong className="block text-xs mt-1 text-slate-100">{ch.title}</strong>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400">{ch.points} PTS</span>
                  {isSolved && (
                    <span className="block text-[9.5px] text-emerald-400 font-bold">✔ SOLVED</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                {ch.description}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => onOpenApp?.(tool)}
                  className="cos-btn cos-btn-primary py-0.5 text-[10.5px] font-bold flex items-center gap-1"
                >
                  <ExternalLink size={10} />
                  <span>LAUNCH {tool.toUpperCase()}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : ch.id)}
                  className="text-slate-400 hover:text-cyan-300 text-[10.5px]"
                >
                  {isExpanded ? 'Hide Details' : 'View Mission Clues'}
                </button>
              </div>

              {/* Expanded Details / Writeup */}
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] space-y-1.5">
                  <div className="text-slate-300">
                    <strong className="text-cyan-400">Objective:</strong> {ch.objective}
                  </div>
                  <div className="text-slate-400">
                    <strong className="text-amber-400">Starting Artifact:</strong> <code>{ch.startingArtifact}</code>
                  </div>
                  {isSolved && ch.solution && (
                    <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded mt-1">
                      <strong className="text-emerald-400 block mb-0.5">TECHNICAL WRITEUP:</strong>
                      <p className="text-slate-300 text-[10.5px] leading-relaxed">{ch.solution}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
