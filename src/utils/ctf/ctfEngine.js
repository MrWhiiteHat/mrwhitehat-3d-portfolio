/**
 * Central CTF Engine
 * Handles challenge progression, flag validation, hint unlocking,
 * scoring, achievement badges, and persistent storage.
 */

import { verifyFlagHash, normalizeFlag } from './cryptoUtils.js';
import { CTF_CHALLENGES, getChallengeById } from './ctfChallenges.js';
import { playBreachFanfare, playHackingBeep, playZapSound } from '../audio.js';

const STORAGE_KEY = 'mrwhitehat_ctf_state_v1';

export const CTF_BADGES = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Captured your first CTF flag',
    icon: '🩸',
  },
  {
    id: 'crypto_breaker',
    name: 'Cipher Breaker',
    description: 'Deciphered an encrypted communication channel',
    icon: '🔐',
  },
  {
    id: 'pcap_ninja',
    name: 'Packet Ninja',
    description: 'Analyzed network traffic and neutralized malicious streams',
    icon: '🦈',
  },
  {
    id: 'buffer_overflower',
    name: 'Stack Hijacker',
    description: 'Successfully overflowed memory buffers to redirect execution',
    icon: '💣',
  },
  {
    id: 'sql_injector',
    name: 'SQL Injector',
    description: 'Bypassed firewall filters to execute structured queries',
    icon: '💉',
  },
  {
    id: 'stego_demodulator',
    name: 'Frequency Whisperer',
    description: 'Demodulated a covert audio spectrogram watermark',
    icon: '📻',
  },
  {
    id: 'lateral_router',
    name: 'Lateral Master',
    description: 'Pivoted across segmented subnets to the Domain Controller',
    icon: '🌐',
  },
  {
    id: 'osint_detective',
    name: 'OSINT Investigator',
    description: 'Tracked shadow digital footprints across public repositories',
    icon: '🕵️',
  },
  {
    id: 'elite_root',
    name: 'Elite Root Operative',
    description: 'Breached the Black Hat Vault and achieved 2000+ points',
    icon: '👑',
  },
];

class CTFEngine {
  constructor() {
    this.listeners = new Set();
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            solvedChallenges: parsed.solvedChallenges || {},
            unlockedHints: parsed.unlockedHints || {},
            submissionHistory: parsed.submissionHistory || [],
            badges: parsed.badges || [],
          };
        }
      }
    } catch (e) {
      console.warn('[CTF] Failed to load state from localStorage:', e);
    }
    return {
      solvedChallenges: {},
      unlockedHints: {},
      submissionHistory: [],
      badges: [],
    };
  }

  saveState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.warn('[CTF] Failed to save state to localStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.getState());
      } catch (err) {
        console.error('[CTF] Listener error:', err);
      }
    }
  }

  getState() {
    const solvedIds = Object.keys(this.state.solvedChallenges);
    const totalPoints = solvedIds.reduce((sum, id) => {
      const rec = this.state.solvedChallenges[id];
      return sum + (rec?.pointsAwarded || 0);
    }, 0);

    return {
      solvedChallenges: { ...this.state.solvedChallenges },
      unlockedHints: { ...this.state.unlockedHints },
      submissionHistory: [...this.state.submissionHistory],
      badges: [...this.state.badges],
      solvedCount: solvedIds.length,
      totalCount: CTF_CHALLENGES.length,
      score: totalPoints,
    };
  }

  isChallengeSolved(challengeId) {
    return Boolean(this.state.solvedChallenges[challengeId]);
  }

  getUnlockedHints(challengeId) {
    return this.state.unlockedHints[challengeId] || [];
  }

  unlockHint(challengeId, hintIndex) {
    const challenge = getChallengeById(challengeId);
    if (!challenge || !challenge.hints || !challenge.hints[hintIndex]) {
      return { success: false, message: 'Invalid hint index' };
    }

    if (!this.state.unlockedHints[challengeId]) {
      this.state.unlockedHints[challengeId] = [];
    }

    if (this.state.unlockedHints[challengeId].includes(hintIndex)) {
      return { success: true, alreadyUnlocked: true };
    }

    this.state.unlockedHints[challengeId].push(hintIndex);
    this.saveState();
    return {
      success: true,
      hint: challenge.hints[hintIndex],
    };
  }

  submitFlag(challengeId, submittedFlag) {
    const challenge = getChallengeById(challengeId);
    const normalized = normalizeFlag(submittedFlag);

    if (!challenge) {
      return {
        success: false,
        message: `Unknown challenge ID: "${challengeId}"`,
      };
    }

    if (this.isChallengeSolved(challengeId)) {
      return {
        success: false,
        duplicate: true,
        message: `Challenge "${challenge.title}" is already solved!`,
      };
    }

    const isValid = verifyFlagHash(normalized, challenge.flagHash);

    const logEntry = {
      timestamp: Date.now(),
      challengeId,
      flagPreview: normalized.length > 30 ? normalized.slice(0, 27) + '...' : normalized,
      success: isValid,
    };
    this.state.submissionHistory.unshift(logEntry);

    if (!isValid) {
      try {
        playZapSound();
      } catch (_) {}
      this.saveState();
      return {
        success: false,
        message: 'INVALID FLAG: Checksum hash does not match challenge target.',
      };
    }

    // Calculate penalty deductions for unlocked hints
    const unlockedHints = this.state.unlockedHints[challengeId] || [];
    let penalty = 0;
    unlockedHints.forEach((idx) => {
      const h = challenge.hints?.[idx];
      if (h) penalty += h.cost || 0;
    });

    const pointsAwarded = Math.max(25, challenge.points - penalty);

    this.state.solvedChallenges[challengeId] = {
      solvedAt: Date.now(),
      pointsAwarded,
      flag: normalized,
    };

    // Check Badges
    this.evaluateBadges(challenge);

    try {
      playBreachFanfare();
    } catch (_) {}

    this.saveState();

    return {
      success: true,
      challenge,
      pointsAwarded,
      message: `FLAG ACCEPTED! +${pointsAwarded} PTS awarded for "${challenge.title}".`,
    };
  }

  evaluateBadges(justSolvedChallenge) {
    const currentBadges = new Set(this.state.badges);
    const solvedList = Object.keys(this.state.solvedChallenges);
    const count = solvedList.length;

    if (count >= 1) currentBadges.add('first_blood');

    if (justSolvedChallenge.category === 'Cryptography') currentBadges.add('crypto_breaker');
    if (justSolvedChallenge.category === 'Digital Forensics') currentBadges.add('pcap_ninja');
    if (justSolvedChallenge.category === 'Binary Exploitation') currentBadges.add('buffer_overflower');
    if (justSolvedChallenge.category === 'Web Exploitation') currentBadges.add('sql_injector');
    if (justSolvedChallenge.category === 'Steganography') currentBadges.add('stego_demodulator');
    if (justSolvedChallenge.category === 'Network Security') currentBadges.add('lateral_router');
    if (justSolvedChallenge.category === 'OSINT') currentBadges.add('osint_detective');

    const totalPts = solvedList.reduce(
      (sum, id) => sum + (this.state.solvedChallenges[id]?.pointsAwarded || 0),
      0
    );
    if (totalPts >= 2000 || this.isChallengeSolved('pwn-heap-race-condition')) {
      currentBadges.add('elite_root');
    }

    this.state.badges = Array.from(currentBadges);
  }

  resetProgress() {
    this.state = {
      solvedChallenges: {},
      unlockedHints: {},
      submissionHistory: [],
      badges: [],
    };
    this.saveState();
  }
}

// Singleton Instance
export const ctfEngine = new CTFEngine();
