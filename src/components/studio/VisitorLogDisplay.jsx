import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Cpu,
  Globe,
  Laptop,
  MapPin,
  Monitor,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Zap,
} from 'lucide-react';
import { playClickSound } from '../../utils/audio.js';

const ARCHETYPE_ICONS = {
  Alpha: Shield,
  Beta: Zap,
  Android: Cpu,
};

export default function VisitorLogDisplay({
  logs = [],
  visitorCount = 1,
  onClose,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'MINE'

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (filterType === 'MINE') {
      result = result.filter((l) => l.isCurrent);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          l.country?.toLowerCase().includes(q) ||
          l.os?.toLowerCase().includes(q) ||
          l.browser?.toLowerCase().includes(q) ||
          l.sessionNode?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, filterType, searchTerm]);

  return (
    <div className="visitor-log-container simple-visitor-container">
      {/* 1. Header */}
      <div className="visitor-log-header">
        <div className="visitor-title-box">
          <div className="visitor-icon-chip">
            <Users size={18} />
          </div>
          <div>
            <div className="visitor-badge-row">
              <span className="stat-live-badge">● LIVE TELEMETRY ENGINE</span>
              <span className="stat-live-badge" style={{ color: '#34d399' }}>
                VERIFIED REAL RECORDS
              </span>
            </div>
            <h2 className="visitor-main-title">CTOS VISITOR ACCESS LOG</h2>
            <p className="visitor-sub-title">
              Real-time authentic check-ins with genuine hardware & geolocation telemetry
            </p>
          </div>
        </div>

        <div className="visitor-stat-counter-box">
          <span className="stat-label">TOTAL VERIFIED VISITORS</span>
          <strong className="stat-count-num">
            #{String(visitorCount).padStart(6, '0')}
          </strong>
          <span className="stat-live-badge">GLOBAL NETWORK SYNC</span>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="visitor-filter-bar" style={{ margin: '14px 0 10px' }}>
        <div className="visitor-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="visitor-search-input"
            placeholder="Search by Operative Name, City, Country, or Device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="visitor-filter-pills">
          <button
            type="button"
            className={`visitor-pill ${filterType === 'ALL' ? 'is-active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            ALL VISITORS ({logs.length})
          </button>
          <button
            type="button"
            className={`visitor-pill ${filterType === 'MINE' ? 'is-active' : ''}`}
            onClick={() => setFilterType('MINE')}
          >
            ★ YOUR CHECK-IN
          </button>
        </div>
      </div>

      {/* 3. Real Visitor Cards List */}
      <div className="visitor-logs-list simple-logs-list">
        {filteredLogs.length === 0 ? (
          <div
            className="visitor-empty-state"
            style={{ padding: '36px 20px', textAlign: 'center' }}
          >
            <Terminal size={24} style={{ color: '#64748b', margin: '0 auto 10px' }} />
            <h4
              style={{
                fontFamily: 'var(--mono)',
                color: '#94a3b8',
                fontSize: '13px',
              }}
            >
              NO MATCHING OPERATIVE RECORDS FOUND
            </h4>
            <p
              style={{
                fontFamily: 'var(--mono)',
                color: '#64748b',
                fontSize: '11px',
                marginTop: '4px',
              }}
            >
              No verified check-ins matched &quot;{searchTerm}&quot;
            </p>
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const Icon = ARCHETYPE_ICONS[entry.archetype] || Shield;
            const accent = entry.accentColor || '#34d399';

            return (
              <div
                key={entry.id}
                className={`visitor-entry-card ${entry.isCurrent ? 'entry-is-current' : ''}`}
                style={{
                  borderLeftColor: accent,
                }}
              >
                {/* Avatar Icon */}
                <div
                  className="visitor-avatar-box"
                  style={{
                    borderColor: accent,
                    boxShadow: `0 0 12px ${accent}30`,
                  }}
                >
                  <Icon size={20} style={{ color: accent }} />
                  <span className="avatar-arch-label">{entry.archetype || 'UNIT'}</span>
                </div>

                {/* Main Identity & Real Telemetry */}
                <div className="visitor-info-pane">
                  <div className="visitor-name-row">
                    <strong className="visitor-name">{entry.name}</strong>

                    {entry.isCurrent && (
                      <span className="badge-you">★ YOU (CURRENT SESSION)</span>
                    )}

                    {entry.isFounder && (
                      <span
                        className="badge-division"
                        style={{
                          borderColor: '#f59e0b',
                          color: '#fbbf24',
                          background: 'rgba(245, 158, 11, 0.15)',
                        }}
                      >
                        ★ CREATOR // SECURITY LEAD
                      </span>
                    )}

                    <span
                      className="badge-division"
                      style={{ borderColor: `${accent}60`, color: accent }}
                    >
                      {entry.clearance || 'LEVEL 4 // CLEARED ✓'}
                    </span>
                  </div>

                  <span className="visitor-role-text">
                    {entry.archetypeName || entry.archetype || 'Operative'}
                  </span>

                  {/* Real Technical Telemetry Chips */}
                  <div className="visitor-specs-chips">
                    {/* Real Location */}
                    {(entry.city || entry.country) && (
                      <div className="spec-chip">
                        <MapPin size={10} style={{ color: '#38bdf8' }} />
                        <span>
                          {entry.flag || '📍'} {entry.city || 'Local Terminal'},{' '}
                          {entry.country || 'Global'}
                        </span>
                      </div>
                    )}

                    {/* Real OS & Browser */}
                    {entry.os && (
                      <div className="spec-chip">
                        <Laptop size={10} style={{ color: '#a78bfa' }} />
                        <span>
                          {entry.os} · {entry.browser || 'Browser'}
                        </span>
                      </div>
                    )}

                    {/* Real Display */}
                    {entry.resolution && (
                      <div className="spec-chip">
                        <Monitor size={10} style={{ color: '#34d399' }} />
                        <span>{entry.resolution}</span>
                      </div>
                    )}

                    {/* Real Hardware specs if available */}
                    {entry.cores && (
                      <div className="spec-chip">
                        <Cpu size={10} style={{ color: '#fbbf24' }} />
                        <span>
                          {entry.cores}
                          {entry.memory ? ` · ${entry.memory}` : ''}
                        </span>
                      </div>
                    )}

                    {/* Session Node */}
                    {entry.sessionNode && (
                      <div className="spec-chip" style={{ color: '#64748b' }}>
                        <Terminal size={10} />
                        <span>{entry.sessionNode}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp & Verification */}
                <div className="visitor-time-pane">
                  <div className="time-row">
                    <Clock size={11} />
                    <span>{entry.timestamp}</span>
                  </div>
                  <div
                    className="time-row"
                    style={{ color: '#10b981', fontSize: '8px', fontWeight: 'bold' }}
                  >
                    <ShieldCheck size={11} />
                    <span>AUTHENTICATED</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer */}
      <div className="visitor-log-footer">
        <span className="footer-notice">
          Showing authentic verified visitors · Cloud counter & real client telemetry synchronized
        </span>

        <button
          type="button"
          className="btn-visitor-close"
          onClick={() => {
            playClickSound(800);
            onClose();
          }}
        >
          CLOSE [ESC]
        </button>
      </div>
    </div>
  );
}
