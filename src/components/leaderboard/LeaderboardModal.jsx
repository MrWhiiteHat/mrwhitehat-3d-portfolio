import React, { useState, useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Filter,
  Flame,
  Globe,
  Medal,
  ShieldCheck,
  Timer,
  Trophy,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import { getLeaderboard, getPersonalBests, PUZZLES } from '../../utils/speedrunLeaderboardService.js';
import { playClickSound } from '../../utils/audio.js';

export default function LeaderboardModal({ isOpen, onClose, playerData }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const personalBests = useMemo(() => getPersonalBests(), [isOpen]);
  const entries = useMemo(() => getLeaderboard(selectedPuzzle), [selectedPuzzle, isOpen]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.codename.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q) ||
        e.puzzleId.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="leaderboard-backdrop" onClick={onClose}>
      <div
        className="leaderboard-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="lb-header">
          <div className="lb-header-title">
            <div className="lb-icon-box">
              <Trophy size={18} className="lb-trophy-icon" />
            </div>
            <div>
              <div className="lb-tag">GLOBAL BREACH TELEMETRY // CTOS SECURE</div>
              <h2 className="lb-headline">SPEEDRUN HALL OF FAME</h2>
            </div>
          </div>

          <button
            type="button"
            className="lb-close-btn"
            onClick={() => {
              playClickSound(1000);
              onClose();
            }}
            title="Close Leaderboard (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Puzzle Category Filter Tabs */}
        <div className="lb-tabs-bar">
          <button
            type="button"
            className={`lb-tab ${selectedPuzzle === 'all' ? 'active' : ''}`}
            onClick={() => {
              playClickSound(1200);
              setSelectedPuzzle('all');
            }}
          >
            <Globe size={13} />
            <span>All Sectors</span>
          </button>
          {PUZZLES.map((p) => {
            const pb = personalBests[p.id];
            return (
              <button
                key={p.id}
                type="button"
                className={`lb-tab ${selectedPuzzle === p.id ? 'active' : ''}`}
                onClick={() => {
                  playClickSound(1200);
                  setSelectedPuzzle(p.id);
                }}
              >
                <span>{p.name}</span>
                {pb && <span className="lb-tab-pb">{pb.toFixed(1)}s</span>}
              </button>
            );
          })}
        </div>

        {/* Top 3 Podium Highlights (If showing a specific puzzle or overall) */}
        <div className="lb-podium-row">
          {filteredEntries.slice(0, 3).map((entry, idx) => {
            const podiumRank = idx + 1;
            const rankLabel = podiumRank === 1 ? '1ST' : podiumRank === 2 ? '2ND' : '3RD';
            const medalClass = podiumRank === 1 ? 'gold' : podiumRank === 2 ? 'silver' : 'bronze';

            return (
              <div key={entry.id || idx} className={`lb-podium-card ${medalClass}`}>
                <div className="podium-badge">{rankLabel}</div>
                <div className="podium-flag">{entry.flag || '🌐'}</div>
                <div className="podium-name">{entry.codename}</div>
                <div className="podium-time">{entry.timeSec.toFixed(2)}s</div>
                <div className="podium-meta">
                  <span className="podium-archetype">{entry.archetype}</span>
                  <span className="podium-sector">
                    {PUZZLES.find((p) => p.id === entry.puzzleId)?.name || entry.puzzleId}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Statistics Bar */}
        <div className="lb-subbar">
          <div className="lb-search-wrap">
            <input
              type="text"
              placeholder="Search operative or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="lb-search-input"
            />
          </div>
          <div className="lb-total-count">
            <span>VERIFIED RUNS:</span> <strong>{filteredEntries.length}</strong>
          </div>
        </div>

        {/* Full Records Table */}
        <div className="lb-table-wrapper">
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>OPERATIVE</th>
                <th>SECTOR PUZZLE</th>
                <th>SOLVE TIME</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((row, i) => {
                const isPersonal = row.isPersonalRun || row.codename === playerData?.codename;
                const isTop3 = i < 3;
                return (
                  <tr key={row.id || i} className={`${isPersonal ? 'personal-row' : ''}`}>
                    <td className="col-rank">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </td>
                    <td className="col-op">
                      <span className="op-flag">{row.flag || '🌐'}</span>
                      <strong className="op-name">{row.codename}</strong>
                      {isPersonal && <span className="you-pill">YOU</span>}
                    </td>
                    <td className="col-sector">
                      {PUZZLES.find((p) => p.id === row.puzzleId)?.name || row.puzzleId}
                    </td>
                    <td className="col-time">
                      <span className="time-val">{row.timeSec.toFixed(2)}s</span>
                    </td>
                    <td className="col-badge">
                      <span className={`rank-pill ${row.rankBadge?.toLowerCase()}`}>
                        {row.rankBadge || 'VERIFIED'}
                      </span>
                    </td>
                    <td className="col-date">{row.timestamp}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="lb-footer">
          <div className="lb-footer-left">
            <Zap size={13} className="text-amber" />
            <span>Solve any terminal puzzle in first-person free roam to log your speedrun time.</span>
          </div>
          <button type="button" className="lb-btn-primary" onClick={onClose}>
            CONTINUE WORKSPACE EXPLORATION
          </button>
        </div>
      </div>
    </div>
  );
}
