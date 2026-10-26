import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  UserCheck,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  playCorporateClick,
  playLoadingProgressBeep,
  playRejectionBuzzer,
  playSadPunchline,
} from './easterEggAudio.js';

/**
 * Betrayal Sequence Phases:
 * - 'VAULT_OPENING': Cinematic banner & instruction while 3D vault opens
 * - 'TERMINAL_INTERACTIVE': Prompt to press E / click to access computer
 * - 'CORPORATE_REJECTION': Realistic enterprise HR recruitment rejection portal
 * - 'LOADING_TROLL': Progress bar climbs to 99% and freezes for 6s with cycling HR status messages
 * - 'REJECTED_SLAM': The 99% rejection stamp drops ("The hiring manager was an AI")
 * - 'APPEAL_PENDING': 1.5s appeal submission animation
 * - 'APPEAL_REJECTED': Appeal rejected + punchline ("Anyway, thanks for testing my portfolio for free")
 * - 'FADE_BLACK': Cinematic fade to black
 * - 'FINAL_REALITY': The dark screen punchline with "Return to Portfolio" or "Do It Again?"
 */
export default function UltimateBetrayalModal({
  phase,
  onPhaseChange,
  onInteractTerminal,
  onReturnToPortfolio,
  onRestartEasterEgg,
  onSkipCinematic,
}) {
  const [loadPercent, setLoadPercent] = useState(0);
  const [statusMessageIndex, setStatusMessageIndex] = useState(0);
  const [appealStep, setAppealStep] = useState('initial'); // 'initial' | 'pending' | 'rejected' | 'punchline'
  const trollTimerRef = useRef(null);
  const messageIntervalRef = useRef(null);

  const HR_STATUS_MESSAGES = [
    'Reviewing technical qualifications...',
    'Verifying security clearance and credentials...',
    'Consulting the hiring manager...',
    'Checking your professional experience...',
    'Evaluating cultural synergy and corporate alignment...',
  ];

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      if (trollTimerRef.current) clearTimeout(trollTimerRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, []);

  // Handle the 99% loading troll sequence
  useEffect(() => {
    if (phase !== 'LOADING_TROLL') return;

    setLoadPercent(0);
    setStatusMessageIndex(0);

    // Fast climb to 99% over 1.6 seconds
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed < 300) {
        setLoadPercent(18);
        playLoadingProgressBeep();
      } else if (elapsed < 700) {
        setLoadPercent(47);
        playLoadingProgressBeep();
      } else if (elapsed < 1100) {
        setLoadPercent(82);
        playLoadingProgressBeep();
      } else if (elapsed < 1600) {
        setLoadPercent(99);
        playLoadingProgressBeep();
        clearInterval(interval);
      }
    }, 120);

    // Cycle through corporate HR status messages while stuck at 99%
    messageIntervalRef.current = setInterval(() => {
      setStatusMessageIndex((prev) => (prev + 1) % HR_STATUS_MESSAGES.length);
    }, 1200);

    // Freeze at 99% for ~6.2 seconds, then SLAM with rejection!
    trollTimerRef.current = setTimeout(() => {
      clearInterval(messageIntervalRef.current);
      playRejectionBuzzer();
      onPhaseChange('REJECTED_SLAM');
    }, 6200);

    return () => {
      clearInterval(interval);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
      if (trollTimerRef.current) clearTimeout(trollTimerRef.current);
    };
  }, [phase, onPhaseChange]);

  // Handle Appeal Submission Flow
  const handleStartAppeal = () => {
    playCorporateClick();
    setAppealStep('pending');
    onPhaseChange('APPEAL_PENDING');

    // 1.8s serious appeal verification spinner
    setTimeout(() => {
      playRejectionBuzzer();
      setAppealStep('rejected');
      onPhaseChange('APPEAL_REJECTED');

      // 1.4s later: reveal the hilarious punchline
      setTimeout(() => {
        playSadPunchline();
        setAppealStep('punchline');

        // 3.2s later: fade to black
        setTimeout(() => {
          onPhaseChange('FADE_BLACK');
          setTimeout(() => {
            onPhaseChange('FINAL_REALITY');
          }, 1200);
        }, 3200);
      }, 1400);
    }, 1800);
  };

  const handleApplyClick = () => {
    playCorporateClick();
    onPhaseChange('LOADING_TROLL');
  };

  const handleSkipLoadingTroll = () => {
    if (trollTimerRef.current) clearTimeout(trollTimerRef.current);
    if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    playRejectionBuzzer();
    onPhaseChange('REJECTED_SLAM');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        if (phase === 'TERMINAL_INTERACTIVE') {
          onInteractTerminal?.();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onInteractTerminal]);

  // -------------------------------------------------------------
  // PHASE 1: VAULT OPENING & BANNER
  // -------------------------------------------------------------
  if (phase === 'VAULT_OPENING') {
    return (
      <div className="betrayal-cinematic-banner-layer">
        <div className="betrayal-announcement-card">
          <div className="betrayal-announcement-badge">
            <Zap size={14} className="hacker-zap-icon" />
            <span>FACILITY ROOT ACCESS GRANTED</span>
          </div>
          <h2 className="betrayal-announcement-title">CLASSIFIED VAULT UNLOCKED</h2>
          <p className="betrayal-announcement-quote">
            “You have breached a system that remained inaccessible for decades. You are now authorized to access the ultimate secret.”
          </p>
          <div className="betrayal-vault-status-row">
            <span className="vault-pulse-dot" />
            <span>HYDRAULIC BULKHEAD COMPARTMENT OPENING...</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHASE 2: TERMINAL INTERACTIVE PROMPT
  // -------------------------------------------------------------
  if (phase === 'TERMINAL_INTERACTIVE') {
    return (
      <div className="betrayal-prompt-layer">
        <div className="betrayal-terminal-prompt-card" onClick={onInteractTerminal}>
          <div className="terminal-badge">
            <Terminal size={14} />
            <span>CLASSIFIED TERMINAL DETECTED</span>
          </div>
          <h3 className="terminal-prompt-heading">THE SECRET CHAMBER</h3>
          <p className="terminal-prompt-desc">
            Inside the legendary vault sits a solitary wooden folding table, an ordinary chair, and a single desktop monitor.
          </p>
          <button
            type="button"
            className="terminal-interact-btn"
            onClick={onInteractTerminal}
          >
            <Zap size={16} />
            <span>ACCESS TERMINAL [PRESS E]</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHASE 3-6: THE CORPORATE REJECTION & 99% LOADING TROLL
  // -------------------------------------------------------------
  if (
    phase === 'CORPORATE_REJECTION' ||
    phase === 'LOADING_TROLL' ||
    phase === 'REJECTED_SLAM' ||
    phase === 'APPEAL_PENDING' ||
    phase === 'APPEAL_REJECTED'
  ) {
    return (
      <div className="corporate-portal-overlay">
        <div className="corporate-window-card">
          {/* Top Corporate Browser Bar */}
          <div className="corporate-window-header">
            <div className="corporate-window-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="corporate-url-bar">
              <span className="url-lock">🔒</span>
              <span className="url-text">https://careers.global-synergy-dynamics.corp/internal/portal/applicant/ref-9411</span>
            </div>
            <div className="corporate-branding">GLOBAL SYNERGY HR</div>
          </div>

          {/* Corporate ATS Portal Header */}
          <div className="corporate-portal-nav">
            <div className="corp-logo-wrap">
              <Briefcase size={20} color="#0f766e" />
              <div>
                <strong className="corp-name">GLOBAL SYNERGY DYNAMICS CORP.</strong>
                <span className="corp-tagline">Automated Enterprise Talent Acquisition</span>
              </div>
            </div>
            <div className="corp-candidate-pill">
              <UserCheck size={14} />
              <span>CANDIDATE ID: #4792-HAX</span>
            </div>
          </div>

          {/* Main Body */}
          <div className="corporate-portal-body">
            {/* Mission Complete Heading */}
            <div className="corp-mission-header">
              <span className="corp-kicker">MISSION DE-BRIEFING // CTOS OVERRIDE</span>
              <h1 className="corp-mission-title">FINAL MISSION COMPLETE</h1>
            </div>

            {/* Congratulatory Text */}
            <div className="corp-congrats-box">
              <p className="corp-congrats-lead">
                <strong>Congratulations, Hacker.</strong>
              </p>
              <p className="corp-congrats-text">
                You've bypassed 47 security nodes, defeated an advanced AI, and infiltrated a highly classified facility.
              </p>
              <p className="corp-congrats-twist">
                Unfortunately, you have no professional experience.
              </p>
            </div>

            {/* Initial Rejection Card */}
            <div className="corp-status-card rejected-card">
              <div className="status-indicator-badge">
                <XCircle size={16} />
                <span>APPLICATION STATUS: REJECTED</span>
              </div>
              <div className="status-reason-box">
                <span className="reason-label">REASON FOR DISQUALIFICATION:</span>
                <p className="reason-text">
                  “We require 3–5 years of experience with this exact Easter egg.”
                </p>
              </div>
            </div>

            {/* 99% Loading Progress Section */}
            {phase === 'LOADING_TROLL' && (
              <div className="corp-loading-section">
                <div className="loading-header-row">
                  <div className="loading-label-group">
                    <Loader2 size={16} className="spin-icon" />
                    <span className="loading-status-text">
                      {HR_STATUS_MESSAGES[statusMessageIndex]}
                    </span>
                  </div>
                  <strong className="loading-percent-number">{loadPercent}%</strong>
                </div>

                <div className="corp-progress-bar-track">
                  <div
                    className="corp-progress-bar-fill"
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>

                <div className="loading-footer-row">
                  <span className="loading-frozen-notice">
                    {loadPercent === 99
                      ? '⚠️ System paused: Conducting mandatory multi-departmental committee review...'
                      : 'Syncing encrypted telemetry with internal hiring matrix...'}
                  </span>
                  <button
                    type="button"
                    className="btn-skip-loading"
                    onClick={handleSkipLoadingTroll}
                  >
                    Skip waiting →
                  </button>
                </div>
              </div>
            )}

            {/* Rejection Slam Section */}
            {(phase === 'REJECTED_SLAM' || phase === 'APPEAL_PENDING' || phase === 'APPEAL_REJECTED') && (
              <div className="corp-ai-rejection-alert">
                <div className="ai-rejection-stamp">
                  <ShieldAlert size={28} />
                  <div>
                    <h3 className="ai-rejection-heading">APPLICATION REJECTED.</h3>
                    <p className="ai-rejection-sub">
                      <strong>Reason:</strong> The hiring manager was an AI.
                    </p>
                  </div>
                </div>

                {/* Appeal Section */}
                {appealStep === 'initial' && (
                  <div className="appeal-action-box">
                    <p className="appeal-prompt">
                      Do you disagree with the algorithmic assessment?
                    </p>
                    <button
                      type="button"
                      className="btn-corporate-appeal"
                      onClick={handleStartAppeal}
                    >
                      <RotateCcw size={15} />
                      <span>APPEAL DECISION</span>
                    </button>
                  </div>
                )}

                {appealStep === 'pending' && (
                  <div className="appeal-pending-box">
                    <Loader2 size={18} className="spin-icon" />
                    <span>Appeal submitted successfully. Reviewing appeal under Protocol 7-B...</span>
                  </div>
                )}

                {(appealStep === 'rejected' || appealStep === 'punchline') && (
                  <div className="appeal-rejected-box">
                    <div className="appeal-rejected-header">
                      <XCircle size={18} color="#dc2626" />
                      <span>Appeal rejected. The hiring manager has reviewed your appeal.</span>
                    </div>

                    {appealStep === 'punchline' && (
                      <div className="ultimate-betrayal-punchline-card">
                        <p className="punchline-text">
                          “Anyway, thanks for testing my portfolio for free.”
                        </p>
                        <span className="punchline-signature">— Mr. White Hat 💀</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Bar (Apply button) */}
            {phase === 'CORPORATE_REJECTION' && (
              <div className="corp-action-footer">
                <button
                  type="button"
                  className="btn-corporate-apply"
                  onClick={handleApplyClick}
                >
                  <FileText size={16} />
                  <span>APPLY FOR THE POSITION</span>
                </button>
                <span className="corp-footnote">
                  Application reference code #CTOS-PORTFOLIO-2026. All decisions are final and binding.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHASE 7: FADE TO BLACK
  // -------------------------------------------------------------
  if (phase === 'FADE_BLACK') {
    return <div className="betrayal-fade-to-black is-active" />;
  }

  // -------------------------------------------------------------
  // PHASE 8: FINAL RETURN TO REALITY
  // -------------------------------------------------------------
  if (phase === 'FINAL_REALITY') {
    return (
      <div className="betrayal-reality-screen">
        <div className="reality-content-card">
          <div className="reality-icon-header">
            <span className="reality-skull">💀</span>
          </div>

          <h1 className="reality-quote-lead">
            “You explored an entire virtual universe, defeated an advanced security network, and completed a top-secret mission...
          </h1>
          <h2 className="reality-quote-punchline">
            ...to get rejected by a recruitment portal.”
          </h2>

          <div className="reality-badge-row">
            <div className="reality-chip">
              <ShieldCheck size={14} color="#10b981" />
              <span>THE ULTIMATE BETRAYAL UNLOCKED</span>
            </div>
            <div className="reality-chip">
              <CheckCircle size={14} color="#38bdf8" />
              <span>100% PORTFOLIO QA TESTER CERTIFIED</span>
            </div>
          </div>

          <div className="reality-button-group">
            <button
              type="button"
              className="btn-reality-primary"
              onClick={onReturnToPortfolio}
            >
              <span>RETURN TO PORTFOLIO</span>
            </button>
            <button
              type="button"
              className="btn-reality-secondary"
              onClick={onRestartEasterEgg}
            >
              <RotateCcw size={16} />
              <span>DO IT AGAIN? 💀</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
