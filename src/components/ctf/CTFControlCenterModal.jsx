import React, { useState, useEffect } from 'react';
import './ctfStyles.css';
import {
  Shield,
  Flag,
  Terminal,
  Award,
  Search,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  ExternalLink,
  HelpCircle,
  X,
  Sparkles,
  ChevronRight,
  Code,
  Zap,
  RotateCcw,
  Compass,
} from 'lucide-react';
import {
  CTF_CHALLENGES,
  CTF_CATEGORIES,
  DIFFICULTY_LEVELS,
  getChallengeById,
} from '../../utils/ctf/ctfChallenges.js';
import { ctfEngine, CTF_BADGES } from '../../utils/ctf/ctfEngine.js';
import CTFTerminal from './CTFTerminal.jsx';
import { playClickSound, playZapSound } from '../../utils/audio.js';

export default function CTFControlCenterModal({
  isOpen,
  onClose,
  onNavigateToStation = null,
  initialChallengeId = null,
}) {
  const [engineState, setEngineState] = useState(() => ctfEngine.getState());
  const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' | 'terminal' | 'badges'
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalChallenge, setActiveModalChallenge] = useState(null);
  const [flagInput, setFlagInput] = useState('');
  const [submitFeedback, setSubmitFeedback] = useState(null);
  const [quickFlagInput, setQuickFlagInput] = useState('');
  const [quickFeedback, setQuickFeedback] = useState(null);

  useEffect(() => {
    const unsubscribe = ctfEngine.subscribe((nextState) => {
      setEngineState(nextState);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initialChallengeId) {
      const ch = getChallengeById(initialChallengeId);
      if (ch) setActiveModalChallenge(ch);
    }
  }, [initialChallengeId]);

  if (!isOpen) return null;

  // Filter challenges
  const filteredChallenges = CTF_CHALLENGES.filter((ch) => {
    if (selectedCategory !== 'ALL' && ch.category !== selectedCategory) return false;
    if (selectedDifficulty !== 'ALL' && ch.difficulty !== selectedDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ch.title.toLowerCase().includes(q);
      const matchDesc = ch.shortDesc.toLowerCase().includes(q);
      const matchCat = ch.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const getRank = (score) => {
    if (score >= 2500) return { title: 'ELITE ROOT // ARCHITECT', color: '#ef4444' };
    if (score >= 1500) return { title: 'RED TEAM LEAD', color: '#f59e0b' };
    if (score >= 800) return { title: 'SECURITY ANALYST', color: '#38bdf8' };
    if (score >= 250) return { title: 'JUNIOR OPERATIVE', color: '#4ade80' };
    return { title: 'RECRUIT // GUEST', color: '#94a3b8' };
  };

  const currentRank = getRank(engineState.score);

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickFlagInput.trim()) return;

    let solvedOne = false;
    for (const ch of CTF_CHALLENGES) {
      const res = ctfEngine.submitFlag(ch.id, quickFlagInput);
      if (res.success) {
        setQuickFeedback({ success: true, text: res.message });
        setQuickFlagInput('');
        solvedOne = true;
        break;
      } else if (res.duplicate) {
        setQuickFeedback({ success: false, text: res.message });
        solvedOne = true;
        break;
      }
    }

    if (!solvedOne) {
      setQuickFeedback({
        success: false,
        text: 'INVALID FLAG: No matching challenge checksum hash found.',
      });
    }

    setTimeout(() => setQuickFeedback(null), 5000);
  };

  const handleChallengeFlagSubmit = (e) => {
    e.preventDefault();
    if (!activeModalChallenge || !flagInput.trim()) return;

    const res = ctfEngine.submitFlag(activeModalChallenge.id, flagInput);
    if (res.success) {
      setSubmitFeedback({ success: true, text: res.message });
      setFlagInput('');
    } else {
      setSubmitFeedback({ success: false, text: res.message });
    }
    setTimeout(() => setSubmitFeedback(null), 5000);
  };

  const handleUnlockHint = (challengeId, hintIdx) => {
    const res = ctfEngine.unlockHint(challengeId, hintIdx);
    if (res.success) {
      playZapSound();
    }
  };

  return (
    <div className="ctf-modal-overlay" onClick={onClose}>
      <div className="ctf-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* TOP STATUS HEADER */}
        <div className="ctf-header">
          <div className="ctf-header-left">
            <div className="ctf-title-wrap">
              <Shield size={22} className="text-emerald-400 animate-pulse" />
              <div>
                <h2 className="ctf-main-title">CYBERSECURITY CTF MISSION CONTROL</h2>
                <span className="ctf-rank-badge" style={{ color: currentRank.color }}>
                  {currentRank.title}
                </span>
              </div>
            </div>
          </div>

          <div className="ctf-header-stats">
            <div className="ctf-stat-card">
              <span className="ctf-stat-num">{engineState.score}</span>
              <span className="ctf-stat-lbl">TOTAL SCORE</span>
            </div>
            <div className="ctf-stat-card">
              <span className="ctf-stat-num">
                {engineState.solvedCount} / {engineState.totalCount}
              </span>
              <span className="ctf-stat-lbl">FLAGS CAPTURED</span>
            </div>
            <div className="ctf-stat-card">
              <span className="ctf-stat-num">{engineState.badges.length}</span>
              <span className="ctf-stat-lbl">ACHIEVEMENTS</span>
            </div>
            <button className="ctf-close-btn" onClick={onClose} aria-label="Close CTF Control">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* QUICK FLAG SUBMIT STRIP */}
        <div className="ctf-quick-strip">
          <form onSubmit={handleQuickSubmit} className="ctf-quick-form">
            <Flag size={14} className="text-emerald-400" />
            <input
              type="text"
              value={quickFlagInput}
              onChange={(e) => setQuickFlagInput(e.target.value)}
              placeholder="Paste any captured flag (e.g. FLAG{caesar_shift_...}) to claim points..."
              className="ctf-quick-input"
            />
            <button type="submit" className="ctf-quick-submit-btn">
              CLAIM FLAG ⚡
            </button>
          </form>
          {quickFeedback && (
            <div
              className={`ctf-feedback-banner ${
                quickFeedback.success ? 'feedback-ok' : 'feedback-err'
              }`}
            >
              {quickFeedback.success ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              <span>{quickFeedback.text}</span>
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="ctf-tabs-bar">
          <button
            className={`ctf-tab ${activeTab === 'challenges' ? 'active' : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            <Flag size={14} />
            <span>Missions Catalogue ({CTF_CHALLENGES.length})</span>
          </button>
          <button
            className={`ctf-tab ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveTab('terminal')}
          >
            <Terminal size={14} />
            <span>Diagnostic Terminal</span>
          </button>
          <button
            className={`ctf-tab ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            <Award size={14} />
            <span>Badges & Medals ({CTF_BADGES.length})</span>
          </button>
        </div>

        {/* TAB 1: CHALLENGES CATALOGUE */}
        {activeTab === 'challenges' && (
          <div className="ctf-body-area">
            {/* FILTER TOOLBAR */}
            <div className="ctf-filters-toolbar">
              <div className="ctf-search-box">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search challenges by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ctf-search-input"
                />
              </div>

              {/* Category Filter */}
              <div className="ctf-filter-group">
                <span className="filter-group-lbl">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="ctf-select"
                >
                  <option value="ALL">All Categories</option>
                  {Object.values(CTF_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="ctf-filter-group">
                <span className="filter-group-lbl">Difficulty:</span>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="ctf-select"
                >
                  <option value="ALL">All Difficulties</option>
                  {Object.keys(DIFFICULTY_LEVELS).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CHALLENGES GRID */}
            <div className="ctf-cards-grid">
              {filteredChallenges.map((ch) => {
                const isSolved = engineState.solvedChallenges[ch.id];
                const diffMeta = DIFFICULTY_LEVELS[ch.difficulty] || DIFFICULTY_LEVELS.EASY;

                return (
                  <div
                    key={ch.id}
                    className={`ctf-card ${isSolved ? 'card-solved' : ''}`}
                    onClick={() => setActiveModalChallenge(ch)}
                  >
                    <div className="ctf-card-header">
                      <span
                        className="ctf-diff-badge"
                        style={{ borderColor: diffMeta.color, color: diffMeta.color }}
                      >
                        {ch.difficulty}
                      </span>
                      <span className="ctf-cat-tag">{ch.category}</span>
                      <span className="ctf-pts-tag">
                        {isSolved ? `✔ +${isSolved.pointsAwarded}` : `${ch.points} PTS`}
                      </span>
                    </div>

                    <h3 className="ctf-card-title">{ch.title}</h3>
                    <p className="ctf-card-desc">{ch.shortDesc}</p>

                    <div className="ctf-card-footer">
                      <span className="ctf-location-pill">📍 Station: {ch.stationId}</span>
                      <button className="ctf-inspect-btn">
                        <span>{isSolved ? 'REVIEW' : 'START MISSION'}</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TERMINAL WORKSTATION */}
        {activeTab === 'terminal' && (
          <div className="ctf-terminal-tab-wrapper">
            <CTFTerminal />
          </div>
        )}

        {/* TAB 3: BADGES */}
        {activeTab === 'badges' && (
          <div className="ctf-badges-tab-wrapper">
            <div className="ctf-badges-grid">
              {CTF_BADGES.map((badge) => {
                const isUnlocked = engineState.badges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`ctf-badge-card ${isUnlocked ? 'badge-unlocked' : 'badge-locked'}`}
                  >
                    <div className="badge-icon-wrap">
                      <span className="badge-emoji">{badge.icon}</span>
                      {isUnlocked ? (
                        <CheckCircle2 size={16} className="badge-ok-icon text-emerald-400" />
                      ) : (
                        <Lock size={16} className="badge-lock-icon text-slate-500" />
                      )}
                    </div>
                    <h4 className="badge-name">{badge.name}</h4>
                    <p className="badge-desc">{badge.description}</p>
                    <div className="badge-status-line">
                      {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INDIVIDUAL CHALLENGE MODAL WORKSPACE */}
        {activeModalChallenge && (
          <div
            className="ctf-submodal-overlay"
            onClick={() => setActiveModalChallenge(null)}
          >
            <div
              className="ctf-submodal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="submodal-header">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="ctf-diff-badge"
                      style={{
                        borderColor:
                          DIFFICULTY_LEVELS[activeModalChallenge.difficulty]?.color,
                        color:
                          DIFFICULTY_LEVELS[activeModalChallenge.difficulty]?.color,
                      }}
                    >
                      {activeModalChallenge.difficulty}
                    </span>
                    <span className="ctf-cat-tag">{activeModalChallenge.category}</span>
                    <span className="ctf-pts-tag">{activeModalChallenge.points} PTS</span>
                  </div>
                  <h2 className="submodal-title">{activeModalChallenge.title}</h2>
                </div>
                <button
                  className="ctf-close-btn"
                  onClick={() => setActiveModalChallenge(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="submodal-body">
                {/* SCENARIO */}
                <div className="submodal-sec">
                  <h4 className="sec-heading">MISSION SCENARIO</h4>
                  <p className="sec-text">{activeModalChallenge.scenario}</p>
                </div>

                {/* OBJECTIVE */}
                <div className="submodal-sec">
                  <h4 className="sec-heading">OBJECTIVE</h4>
                  <p className="sec-text">{activeModalChallenge.objective}</p>
                </div>

                {/* STARTING ARTIFACT */}
                {activeModalChallenge.artifacts && (
                  <div className="submodal-sec">
                    <h4 className="sec-heading">STARTING ARTIFACT & TELEMETRY</h4>
                    <div className="artifact-box">
                      <pre>{activeModalChallenge.artifacts.content}</pre>
                    </div>
                    {activeModalChallenge.artifacts.commandHint && (
                      <div className="cmd-hint-box">
                        <Terminal size={12} className="text-cyan-400" />
                        <code>{activeModalChallenge.artifacts.commandHint}</code>
                      </div>
                    )}
                  </div>
                )}

                {/* HINTS SYSTEM */}
                {activeModalChallenge.hints?.length > 0 && (
                  <div className="submodal-sec">
                    <h4 className="sec-heading">INTELLIGENCE HINTS</h4>
                    <div className="hints-list">
                      {activeModalChallenge.hints.map((hint, idx) => {
                        const unlockedList =
                          engineState.unlockedHints[activeModalChallenge.id] || [];
                        const isUnlocked = unlockedList.includes(idx);

                        return (
                          <div key={idx} className="hint-card">
                            {isUnlocked ? (
                              <div className="hint-unlocked-text">
                                <Unlock size={14} className="text-amber-400" />
                                <span>{hint.text}</span>
                              </div>
                            ) : (
                              <div className="hint-locked-row">
                                <span className="hint-preview-lbl">
                                  Hint #{idx + 1} (-{hint.cost} PTS penalty)
                                </span>
                                <button
                                  className="unlock-hint-btn"
                                  onClick={() =>
                                    handleUnlockHint(activeModalChallenge.id, idx)
                                  }
                                >
                                  UNLOCK HINT
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* FLAG SUBMISSION INPUT */}
                <div className="submodal-sec flag-sec">
                  <h4 className="sec-heading">FLAG SUBMISSION</h4>
                  {engineState.solvedChallenges[activeModalChallenge.id] ? (
                    <div className="solved-banner">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <div>
                        <strong>FLAG CAPTURED!</strong>
                        <div>
                          Awarded +
                          {
                            engineState.solvedChallenges[activeModalChallenge.id]
                              .pointsAwarded
                          }{' '}
                          PTS
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleChallengeFlagSubmit} className="flag-submit-form">
                      <input
                        type="text"
                        placeholder="FLAG{unique_challenge_identifier}"
                        value={flagInput}
                        onChange={(e) => setFlagInput(e.target.value)}
                        className="flag-input-box"
                      />
                      <button type="submit" className="flag-submit-btn">
                        VERIFY FLAG ⚡
                      </button>
                    </form>
                  )}

                  {submitFeedback && (
                    <div
                      className={`ctf-feedback-banner ${
                        submitFeedback.success ? 'feedback-ok' : 'feedback-err'
                      }`}
                    >
                      {submitFeedback.success ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}
                      <span>{submitFeedback.text}</span>
                    </div>
                  )}
                </div>

                {/* SOLUTION WRITEUP (Shown upon solve) */}
                {engineState.solvedChallenges[activeModalChallenge.id] &&
                  activeModalChallenge.writeup && (
                    <div className="submodal-sec writeup-sec">
                      <h4 className="sec-heading text-emerald-400">
                        SOLUTION WRITEUP & DEFENSIVE REMEDIATION
                      </h4>
                      <div className="writeup-box">
                        <p>
                          <strong>Executive Summary:</strong>{' '}
                          {activeModalChallenge.writeup.summary}
                        </p>
                        <p>
                          <strong>Technical Exploitation:</strong>{' '}
                          {activeModalChallenge.writeup.explanation}
                        </p>
                        <p>
                          <strong>Remediation & Hardening:</strong>{' '}
                          {activeModalChallenge.writeup.remediation}
                        </p>
                      </div>
                    </div>
                  )}

                {/* TELEPORT TO 3D STATION BUTTON */}
                {onNavigateToStation && activeModalChallenge.stationId && (
                  <div className="submodal-actions-footer">
                    <button
                      className="teleport-station-btn"
                      onClick={() => {
                        const targetStation = activeModalChallenge.stationId;
                        setActiveModalChallenge(null);
                        onClose();
                        onNavigateToStation(targetStation);
                      }}
                    >
                      <Compass size={14} />
                      <span>Teleport to 3D Station ({activeModalChallenge.stationId})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
