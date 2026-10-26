import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import {
  playRecordScratch,
  playSlipperWhoosh,
  playMomGong,
  playDhaniyaFanfare,
  playCorporateClick,
  playSadPunchline,
} from './easterEggAudio.js';

/**
 * Text-to-speech helper with safe fallback
 */
function speakDialogue(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    // Prefer Indian English voice if available in system
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(
      (v) => v.lang.includes('en-IN') || v.name.includes('India')
    );
    if (indVoice) utterance.voice = indVoice;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}

/**
 * The Ultimate Betrayal 💀
 * "The 4th-Wall Reality Check / Mom Calling & Coriander Errand"
 */
export default function UltimateBetrayalModal({
  phase,
  onPhaseChange,
  onInteractTerminal,
  onReturnToPortfolio,
  onRestartEasterEgg,
}) {
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [roastStep, setRoastStep] = useState('initial'); // 'initial' | 'slipper' | 'narrator'
  const dialogueSpokenRef = useRef(false);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // When Mom Reveal triggers, play scratch & speak dialogue
  useEffect(() => {
    if (phase === 'MOM_REVEAL' && !dialogueSpokenRef.current) {
      dialogueSpokenRef.current = true;
      playRecordScratch();
      setTimeout(() => {
        playMomGong();
        speakDialogue(
          'Oye hero! Stop clicking random lines on computer and pretending to be in Matrix! Go to market and bring 10 rupees dhaniya right now!'
        );
      }, 350);
    }
  }, [phase]);

  // Handle player dialogue selection
  const handlePlayerChoice = (choiceText) => {
    playCorporateClick();
    setSelectedResponse(choiceText);
    setRoastStep('slipper');
    playSlipperWhoosh();

    setTimeout(() => {
      setRoastStep('narrator');
      playSadPunchline();
    }, 1400);
  };

  const handleProceedToCertificate = () => {
    playDhaniyaFanfare();
    onPhaseChange('CERTIFICATE_ROAST');
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
            <span>CORE MAINFRAME BREACHED</span>
          </div>
          <h2 className="betrayal-announcement-title">THE VEIL IS LIFTED</h2>
          <p className="betrayal-announcement-quote">
            “You have breached a system that remained inaccessible for decades. Decrypting the true identity of the Master Architect...”
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
          <div className="terminal-badge" style={{ color: '#22c55e' }}>
            <Terminal size={14} />
            <span>ANOMALOUS SANCTUM DETECTED</span>
          </div>
          <h3 className="terminal-prompt-heading">THE INNER SANCTUM</h3>
          <p className="terminal-prompt-desc">
            Inside the legendary vault sits an unmade bed, a pile of laundry, cold Maggi noodles, and an eerie silence.
          </p>
          <button
            type="button"
            className="terminal-interact-btn"
            style={{
              background: 'linear-gradient(135deg, #15803d, #166534)',
              borderColor: '#22c55e',
              boxShadow: '0 0 25px rgba(34, 197, 94, 0.45)',
            }}
            onClick={onInteractTerminal}
          >
            <Zap size={16} />
            <span>CONFRONT REALITY [PRESS E]</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHASE 3-4: MOM CALLING & DEADPAN CINEMATIC ROAST
  // -------------------------------------------------------------
  if (phase === 'MOM_REVEAL') {
    return (
      <div className="mom-cinematic-overlay">
        {/* Hollywood Cinematic Letterbox Bars */}
        <div className="cinematic-bar bar-top" />
        <div className="cinematic-bar bar-bottom" />

        <div className="mom-dialogue-stage">
          {/* Audio Indicator */}
          <div className="mom-audio-indicator">
            <Volume2 size={15} color="#ef4444" className="pulse-icon" />
            <span>INCOMING HIGH-PRIORITY TRANSMISSION // KITCHEN INTERCOM</span>
          </div>

          {/* Mom's Shouting Dialogue Card */}
          <div className="mom-shout-card">
            <div className="mom-speaker-badge">
              <span className="mom-avatar">👵🏽</span>
              <strong className="mom-name">MOM (SHOUTING FROM THE KITCHEN):</strong>
            </div>

            <p className="mom-shout-text">
              “OYE HERO! Stop clicking the mouse like a maniac and pretending to be in Matrix! The dal is boiling on the stove! Go to the market and bring ₹10 DHANIYA (Coriander) right now! And don't forget to ask for extra free green chillies (mirchi)!”
            </p>
          </div>

          {/* Step 1: Interactive Player Responses */}
          {roastStep === 'initial' && (
            <div className="player-response-section">
              <span className="player-prompt-label">SELECT YOUR RESPONSE:</span>
              <div className="player-choices-stack">
                <button
                  type="button"
                  className="player-choice-btn"
                  onClick={() =>
                    handlePlayerChoice(
                      'Mom, wait! I literally just bypassed a military-grade neural firewall!'
                    )
                  }
                >
                  <ChevronRight size={16} />
                  <span>“Mom, wait! I literally just bypassed a military-grade neural firewall!”</span>
                </button>

                <button
                  type="button"
                  className="player-choice-btn"
                  onClick={() =>
                    handlePlayerChoice(
                      'Can I finish this Easter egg first? I’m almost at the secret ending!'
                    )
                  }
                >
                  <ChevronRight size={16} />
                  <span>“Can I finish this Easter egg first? I’m almost at the secret ending!”</span>
                </button>

                <button
                  type="button"
                  className="player-choice-btn"
                  onClick={() =>
                    handlePlayerChoice(
                      'Did you say ₹10 or ₹20 dhaniya? And what if the vendor charges for mirchi?'
                    )
                  }
                >
                  <ChevronRight size={16} />
                  <span>“Did you say ₹10 or ₹20 dhaniya? And what if the vendor charges for mirchi?”</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Flying Slipper Alert */}
          {roastStep === 'slipper' && (
            <div className="flying-slipper-alert">
              <span className="slipper-emoji">🩴💨</span>
              <div className="slipper-alert-text">
                <strong>TACTICAL FLYING CHAPPAL LAUNCHED</strong>
                <span>Velocity: Mach 3.4 • Heat-Seeking Guidance • Target: Back of Your Head</span>
              </div>
            </div>
          )}

          {/* Step 3: Deadpan Hollywood Narrator Roast */}
          {roastStep === 'narrator' && (
            <div className="narrator-roast-card">
              <div className="narrator-badge">
                <Terminal size={14} />
                <span>NARRATOR // DEADPAN REALITY CHECK</span>
              </div>

              <blockquote className="narrator-quote">
                “You rotated 14 high-voltage spatial conduits.<br />
                You calculated complex Manhattan network topologies.<br />
                You spent 15 minutes feeling like an untouchable cyber ghost operative...<br /><br />
                <strong style={{ color: '#fef08a' }}>
                  ...and yet, you still haven't bought the coriander. The dal is ruined. The chappal has achieved supersonic speed.
                </strong>”
              </blockquote>

              <div className="narrator-action-row">
                <button
                  type="button"
                  className="btn-view-certificate"
                  onClick={handleProceedToCertificate}
                >
                  <Award size={18} />
                  <span>VIEW OFFICIAL PERFORMANCE EVALUATION</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHASE 5: THE SARCASM CERTIFICATE OF CORIANDER PROCUREMENT
  // -------------------------------------------------------------
  if (phase === 'CERTIFICATE_ROAST') {
    return (
      <div className="certificate-modal-overlay">
        <div className="certificate-frame-card">
          {/* Certificate Header Banner */}
          <div className="certificate-top-banner">
            <span className="cert-crest">🌿🩴🌿</span>
            <span className="cert-dept">
              DEPARTMENT OF DOMESTIC HOUSEHOLD OPERATIONS & CYBER ERBITRAGE
            </span>
            <h1 className="cert-main-title">
              CERTIFICATE OF ERRAND DISOBEDIENCE
            </h1>
            <span className="cert-sub">
              FOR DISTINGUISHED CYBER PROCRASTINATION UNDER EXTREME CIRCUMSTANCES
            </span>
          </div>

          {/* Main Certificate Body */}
          <div className="certificate-body">
            <p className="cert-intro">This highly un-prestigious recognition is formally awarded to:</p>

            <div className="cert-recipient-name">
              THE "ELITE HACKER" WHO FORGOT THE DHANIYA
            </div>

            <p className="cert-citation">
              For spending fifteen consecutive minutes rotating three-dimensional laser switches,
              bypassing fictional cTOS military servers, and feeling like Mr. Robot...
              while completely neglecting a simple five-minute grocery trip to buy fresh coriander.
            </p>

            {/* Hilarious Stats Grid */}
            <div className="cert-stats-grid">
              <div className="cert-stat-box">
                <span className="stat-label">HACKING APTITUDE</span>
                <strong className="stat-val" style={{ color: '#00f0ff' }}>LEVEL 99 CYBER GHOST</strong>
              </div>

              <div className="cert-stat-box">
                <span className="stat-label">MOTHER'S APPROVAL</span>
                <strong className="stat-val" style={{ color: '#ef4444' }}>-9,999 RESPECT</strong>
              </div>

              <div className="cert-stat-box">
                <span className="stat-label">CORIANDER SECURED</span>
                <strong className="stat-val" style={{ color: '#f59e0b' }}>0 / 1 BUNCH</strong>
              </div>

              <div className="cert-stat-box">
                <span className="stat-label">FREE GREEN CHILLIES</span>
                <strong className="stat-val" style={{ color: '#ef4444' }}>0 / 4 MIRCHI</strong>
              </div>

              <div className="cert-stat-box">
                <span className="stat-label">SABZI STATUS</span>
                <strong className="stat-val" style={{ color: '#ef4444' }}>BURNED TO ASH</strong>
              </div>

              <div className="cert-stat-box">
                <span className="stat-label">CHAPPAL THREAT LEVEL</span>
                <strong className="stat-val" style={{ color: '#dc2626' }}>DEFCON 1 (INBOUND)</strong>
              </div>
            </div>

            {/* Official Rubber Stamp */}
            <div className="cert-rubber-stamp">
              <span>CERTIFIED DHANIYA PROCRASTINATOR</span>
              <small>AUTHORIZED BY MOM 🩴</small>
            </div>

            {/* Signature Row */}
            <div className="cert-signature-row">
              <div className="cert-signature">
                <span className="sig-line">Mr. White Hat 💀</span>
                <span className="sig-role">Lead Portfolio Developer & Survivor</span>
              </div>
              <div className="cert-signature">
                <span className="sig-line">Mummy Ji 🩴</span>
                <span className="sig-role">Supreme Kitchen Commander</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="cert-action-footer">
            <button
              type="button"
              className="btn-cert-primary"
              onClick={onReturnToPortfolio}
            >
              <span>RETURN TO PORTFOLIO (BEFORE THE CHAPPAL HITS 🩴)</span>
            </button>
            <button
              type="button"
              className="btn-cert-secondary"
              onClick={onRestartEasterEgg}
            >
              <RotateCcw size={16} />
              <span>DO IT AGAIN? (RISK MOTHER'S WRATH)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
