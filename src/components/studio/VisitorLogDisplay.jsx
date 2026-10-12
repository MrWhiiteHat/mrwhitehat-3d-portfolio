import React from 'react';
import {
  Clock,
  Cpu,
  Shield,
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
  visitorCount = 1488,
  onClose,
}) {
  return (
    <div className="visitor-log-container simple-visitor-container">
      {/* 1. Header */}
      <div className="visitor-log-header">
        <div className="visitor-title-box">
          <div className="visitor-icon-chip">
            <Users size={18} />
          </div>
          <div>
            <h2 className="visitor-main-title">VISITOR LOG</h2>
            <p className="visitor-sub-title">People who visited the 3D office</p>
          </div>
        </div>

        <div className="visitor-stat-counter-box">
          <span className="stat-label">TOTAL VISITORS</span>
          <strong className="stat-count-num">#{visitorCount}</strong>
        </div>
      </div>

      {/* 2. Simple Visitor Cards List */}
      <div className="visitor-logs-list simple-logs-list">
        {logs.map((entry) => {
          const Icon = ARCHETYPE_ICONS[entry.archetype] || Shield;

          return (
            <div
              key={entry.id}
              className={`visitor-entry-card ${entry.isCurrent ? 'entry-is-current' : ''}`}
              style={{
                borderLeftColor: entry.accentColor || '#34d399',
              }}
            >
              {/* Avatar Icon */}
              <div
                className="visitor-avatar-box"
                style={{
                  borderColor: entry.accentColor || '#34d399',
                }}
              >
                <Icon size={18} style={{ color: entry.accentColor || '#34d399' }} />
              </div>

              {/* Name & Character */}
              <div className="visitor-info-pane">
                <div className="visitor-name-row">
                  <strong className="visitor-name">{entry.name}</strong>
                  {entry.isCurrent && (
                    <span className="badge-you">★ YOU</span>
                  )}
                </div>
                <span className="visitor-role-text">
                  {entry.archetypeName || entry.archetype || 'Operative'}
                </span>
              </div>

              {/* Time */}
              <div className="visitor-time-pane">
                <div className="time-row">
                  <Clock size={11} />
                  <span>{entry.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Footer */}
      <div className="visitor-log-footer">
        <span className="footer-notice">
          Showing verified office visitors
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
