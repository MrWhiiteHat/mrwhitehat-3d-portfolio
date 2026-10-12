import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Cpu,
  Download,
  Eye,
  Filter,
  Flame,
  Globe,
  Lock,
  Radio,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';
import { playClickSound, playHackingBeep } from '../../utils/audio.js';

const ARCHETYPE_ICONS = {
  Alpha: Shield,
  Beta: Zap,
  Android: Cpu,
  Phantom: Flame,
  Sentinel: ShieldCheck,
  Netrunner: Terminal,
};

export default function VisitorLogDisplay({
  logs = [],
  visitorCount = 1488,
  activeOperative = null,
  onClose,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      // Division or Category filter
      if (selectedFilter === 'RED' && item.division !== 'Red Team') return false;
      if (selectedFilter === 'BLUE' && item.division !== 'Blue Team') return false;
      if (selectedFilter === 'YOU' && !item.isCurrent) return false;

      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.role?.toLowerCase().includes(q) ||
        item.archetypeName?.toLowerCase().includes(q) ||
        item.division?.toLowerCase().includes(q) ||
        item.ipHash?.toLowerCase().includes(q)
      );
    });
  }, [logs, searchQuery, selectedFilter]);

  const handleCopyStamp = (entry) => {
    playClickSound(1100);
    const text = `[CTOS CLEARANCE STAMP]\nOperative: ${entry.name}\nRole: ${entry.role}\nArchetype: ${entry.archetypeName} (${entry.visor})\nDivision: ${entry.division}\nTimestamp: ${entry.timestamp}\nNode: ${entry.ipHash}\nOffice: MrWhiteHat Cyber Operations Lab`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="visitor-log-container">
      {/* 1. Header Telemetry Banner */}
      <div className="visitor-log-header">
        <div className="visitor-title-box">
          <div className="visitor-icon-chip">
            <Users size={20} />
          </div>
          <div>
            <h2 className="visitor-main-title">OFFICE VISITOR ACCESS ROSTER</h2>
            <p className="visitor-sub-title">
              VERIFIED IDENTIFICATION LOGS & CHARACTER TELEMETRY // CTOS AIRLOCK RECON
            </p>
          </div>
        </div>

        {/* Live Visitor Counter Stat Box */}
        <div className="visitor-stat-counter-box">
          <span className="stat-label">TOTAL VISITOR CLEARANCES</span>
          <strong className="stat-count-num"># {String(visitorCount).padStart(6, '0')}</strong>
          <span className="stat-live-badge">● LOGGING ONLINE</span>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="visitor-filter-bar">
        <div className="visitor-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="visitor-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search visitors by name, role, character archetype, or node..."
          />
          {searchQuery && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="visitor-filter-pills">
          <button
            type="button"
            className={`visitor-pill ${selectedFilter === 'ALL' ? 'is-active' : ''}`}
            onClick={() => {
              playClickSound(850);
              setSelectedFilter('ALL');
            }}
          >
            ALL VISITORS ({logs.length})
          </button>
          <button
            type="button"
            className={`visitor-pill ${selectedFilter === 'YOU' ? 'is-active' : ''}`}
            onClick={() => {
              playClickSound(850);
              setSelectedFilter('YOU');
            }}
          >
            ★ YOUR ENTRY
          </button>
          <button
            type="button"
            className={`visitor-pill ${selectedFilter === 'RED' ? 'is-active' : ''}`}
            onClick={() => {
              playClickSound(850);
              setSelectedFilter('RED');
            }}
          >
            RED TEAM
          </button>
          <button
            type="button"
            className={`visitor-pill ${selectedFilter === 'BLUE' ? 'is-active' : ''}`}
            onClick={() => {
              playClickSound(850);
              setSelectedFilter('BLUE');
            }}
          >
            BLUE TEAM
          </button>
        </div>
      </div>

      {/* 3. Visitors Manifest Grid / Table */}
      <div className="visitor-logs-list">
        {filteredLogs.length === 0 ? (
          <div className="visitor-empty-state">
            <ShieldAlert size={36} style={{ color: '#64748b' }} />
            <p>No operatives matched the current search criteria.</p>
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const Icon = ARCHETYPE_ICONS[entry.archetype] || Shield;
            const isCopied = copiedId === entry.id;

            return (
              <div
                key={entry.id}
                className={`visitor-entry-card ${entry.isCurrent ? 'entry-is-current' : ''}`}
                style={{
                  borderLeftColor: entry.accentColor || '#34d399',
                }}
              >
                {/* Left: Avatar Archetype Mini Badge */}
                <div
                  className="visitor-avatar-box"
                  style={{
                    borderColor: entry.accentColor || '#34d399',
                    boxShadow: `0 0 14px ${entry.accentColor || '#34d399'}30`,
                  }}
                >
                  <Icon size={22} style={{ color: entry.accentColor || '#34d399' }} />
                  <span className="avatar-arch-label">{entry.archetype}</span>
                </div>

                {/* Middle: Name, Role, & Character Customizations */}
                <div className="visitor-info-pane">
                  <div className="visitor-name-row">
                    <strong className="visitor-name">
                      {entry.name}
                    </strong>
                    {entry.isCurrent && (
                      <span className="badge-you">★ YOU (CURRENT OPERATIVE)</span>
                    )}
                    <span
                      className="badge-division"
                      style={{
                        borderColor: entry.accentColor || '#34d399',
                        color: entry.accentColor || '#34d399',
                      }}
                    >
                      {entry.division || 'Specialist'}
                    </span>
                  </div>

                  <p className="visitor-role-text">{entry.role}</p>

                  <div className="visitor-specs-chips">
                    <span className="spec-chip">
                      <strong>Archetype:</strong> {entry.archetypeName || entry.archetype}
                    </span>
                    <span className="spec-chip">
                      <strong>Optics:</strong> {entry.visor}
                    </span>
                    <span className="spec-chip">
                      <strong>Node:</strong> {entry.ipHash}
                    </span>
                    <span className="spec-chip">
                      <strong>Clearance:</strong> {entry.clearanceLevel}
                    </span>
                  </div>
                </div>

                {/* Right: Timestamp & Action */}
                <div className="visitor-time-pane">
                  <div className="time-row">
                    <Clock size={12} />
                    <span>{entry.timestamp}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-copy-stamp"
                    onClick={() => handleCopyStamp(entry)}
                    title="Copy Cryptographic Access Stamp"
                  >
                    {isCopied ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                    <span>{isCopied ? 'COPIED' : 'CLEARANCE STAMP'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer System Bar */}
      <div className="visitor-log-footer">
        <div className="footer-notice">
          <Lock size={13} style={{ color: '#10b981' }} />
          <span>
            Office access requires operative name registration. All character telemetry persisted in local cryptographic memory.
          </span>
        </div>

        <button
          type="button"
          className="btn-visitor-close"
          onClick={onClose}
        >
          RETURN TO OFFICE FREE-ROAM [ESC]
        </button>
      </div>
    </div>
  );
}
