import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Github,
  Globe,
  GraduationCap,
  Layers,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  PhoneCall,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { achievements, profile, projects, skills } from '../../data.js';
import { playClickSound, playWhooshSound } from '../../utils/audio.js';
import mrWhiteHatPhoto from '../../assets/mrwhitehat-hologram.jpg';

export default function RecruiterDossierModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('projects');
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      playClickSound(1100, 0.04);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleTabChange = (tabId) => {
    playClickSound(850, 0.03);
    setActiveTab(tabId);
  };

  return (
    <div
      className="recruiter-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Executive Recruiter Dossier"
    >
      <div
        className="recruiter-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Operational Header */}
        <div className="recruiter-modal-header">
          <div className="recruiter-badge-tag">
            <span className="recruiter-pulse-dot" />
            <span>EXECUTIVE DOSSIER // RECRUITER FAST VIEW</span>
          </div>

          <button
            type="button"
            className="recruiter-close-btn"
            onClick={() => {
              playWhooshSound();
              onClose();
            }}
            title="Close Dossier (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Candidate Profile Summary Banner */}
        <div className="recruiter-candidate-card">
          <div className="recruiter-photo-wrap">
            <img
              src={mrWhiteHatPhoto}
              alt="Sadashiba Sarangi (MrWhiteHat)"
              className="recruiter-avatar-img"
            />
            <div className="recruiter-photo-badge">
              <ShieldCheck size={14} />
            </div>
          </div>

          <div className="recruiter-candidate-meta">
            <div className="recruiter-name-row">
              <h1 className="recruiter-candidate-name">{profile.displayName}</h1>
              <span className="recruiter-avail-badge">
                <span className="avail-pulse" />
                {profile.availability.status}
              </span>
            </div>

            <p className="recruiter-candidate-role">{profile.role}</p>

            <div className="recruiter-location-row">
              <span className="loc-item">
                <MapPin size={13} />
                {profile.location}
              </span>
              <span className="loc-sep">·</span>
              <span className="loc-item">
                <GraduationCap size={13} />
                B.Tech in CS & IT (CGU)
              </span>
              <span className="loc-sep">·</span>
              <span className="loc-item">
                <Award size={13} />
                2x State Cyber Bronze Medalist
              </span>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="recruiter-actions-toolbar">
            <a
              href={profile.resume}
              download={profile.resumeFilename}
              className="recruiter-action-btn primary"
              onClick={() => playClickSound(1050)}
              title="Download Sadashiba Sarangi Verified Resume PDF"
            >
              <Download size={14} />
              <span>DOWNLOAD RESUME PDF</span>
            </a>

            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="recruiter-action-btn"
              onClick={() => playClickSound(850)}
            >
              <Github size={14} />
              <span>GITHUB</span>
              <ExternalLink size={11} className="ext-icon" />
            </a>

            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="recruiter-action-btn"
              onClick={() => playClickSound(850)}
            >
              <Linkedin size={14} />
              <span>LINKEDIN</span>
              <ExternalLink size={11} className="ext-icon" />
            </a>

            <button
              type="button"
              className="recruiter-action-btn"
              onClick={() => handleCopy(profile.email, 'email')}
              title="Copy Email Address"
            >
              {copiedKey === 'email' ? <Check size={14} color="#34d399" /> : <Mail size={14} />}
              <span>{copiedKey === 'email' ? 'EMAIL COPIED' : 'EMAIL'}</span>
            </button>
          </div>
        </div>

        {/* Helpful Recruiter Tip Bar */}
        <div className="recruiter-tip-bar">
          <span className="recruiter-tip-badge">💡 RECRUITER TIP</span>
          <span className="recruiter-tip-text">
            Fast evaluation mode · Download the 1-Click PDF Resume or press <strong>[Esc]</strong> to return to the interactive 3D studio anytime.
          </span>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="recruiter-tabs-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'projects'}
            className={`recruiter-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => handleTabChange('projects')}
          >
            <Code2 size={15} />
            <span>FEATURED PROJECTS ({projects.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'skills'}
            className={`recruiter-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => handleTabChange('skills')}
          >
            <BookOpen size={15} />
            <span>SKILLS & TOOLKIT</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'awards'}
            className={`recruiter-tab-btn ${activeTab === 'awards' ? 'active' : ''}`}
            onClick={() => handleTabChange('awards')}
          >
            <Award size={15} />
            <span>HONORS & AWARDS</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'education'}
            className={`recruiter-tab-btn ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => handleTabChange('education')}
          >
            <GraduationCap size={15} />
            <span>EDUCATION & LEADERSHIP</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'contact'}
            className={`recruiter-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => handleTabChange('contact')}
          >
            <Mail size={15} />
            <span>CONTACT & COMMS</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="recruiter-modal-body">
          {/* TAB 1: FEATURED PROJECTS */}
          {activeTab === 'projects' && (
            <div className="recruiter-projects-grid">
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="recruiter-project-card">
                  <div className="recruiter-proj-header">
                    <div>
                      <div className="recruiter-proj-meta">
                        <span className="proj-status-tag">{proj.status}</span>
                        <span className="proj-period">{proj.period}</span>
                      </div>
                      <h3 className="recruiter-proj-title">{proj.title}</h3>
                    </div>

                    <div className="recruiter-proj-links">
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="proj-link-pill"
                          title="View Source Code on GitHub"
                        >
                          <Github size={13} />
                          <span>SOURCE CODE</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                      {proj.demoLink && (
                        <a
                          href={proj.demoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="proj-link-pill demo"
                          title="Open Live Deployed Application"
                        >
                          <Globe size={13} />
                          <span>LIVE DEMO</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="recruiter-proj-short">{proj.short}</p>

                  {/* Problem & Solution Architecture */}
                  {proj.problem && proj.solution && (
                    <div className="recruiter-proj-architecture">
                      <div className="arch-block">
                        <strong className="arch-label problem">PROBLEM:</strong>
                        <p className="arch-text">{proj.problem}</p>
                      </div>
                      <div className="arch-block">
                        <strong className="arch-label solution">ENGINEERED SOLUTION:</strong>
                        <p className="arch-text">{proj.solution}</p>
                      </div>
                    </div>
                  )}

                  {/* Bullet Highlights */}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="recruiter-proj-bullets">
                      {proj.highlights.slice(0, 3).map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  )}

                  {/* Tech Tags */}
                  <div className="recruiter-tags-row">
                    {proj.tags.map((tag) => (
                      <span key={tag} className="recruiter-tech-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SKILLS & TOOLKIT */}
          {activeTab === 'skills' && (
            <div className="recruiter-skills-grid">
              {skills.map((grp) => (
                <div key={grp.group} className="recruiter-skill-group">
                  <div className="skill-group-title">
                    <Shield size={16} className="grp-icon" />
                    <h4>{grp.group}</h4>
                  </div>
                  <div className="skill-chips-wrap">
                    {grp.items.map((item) => (
                      <span key={item} className="skill-item-chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: HONORS & AWARDS */}
          {activeTab === 'awards' && (
            <div className="recruiter-awards-list">
              {achievements.map((ach, idx) => (
                <div key={idx} className="recruiter-award-card">
                  <div className="award-icon-box">
                    <Award size={24} color="#fbbf24" />
                  </div>
                  <div className="award-info">
                    <div className="award-header-row">
                      <h4 className="award-title">{ach.title}</h4>
                      <span className="award-year-tag">{ach.year}</span>
                    </div>
                    <span className="award-issuer">{ach.issuer}</span>
                    <p className="award-detail">{ach.detail}</p>
                    <p className="award-note">{ach.note}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: EDUCATION & CAMPUS LEADERSHIP */}
          {activeTab === 'education' && (
            <div className="recruiter-edu-layout">
              {/* Academic Timeline */}
              <div className="recruiter-edu-col">
                <h3 className="section-col-title">
                  <GraduationCap size={16} />
                  <span>ACADEMIC BACKGROUND</span>
                </h3>
                <div className="edu-cards-wrap">
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="edu-card">
                      <span className="edu-period-badge">{edu.period}</span>
                      <h4 className="edu-degree">{edu.degree} · {edu.field}</h4>
                      <span className="edu-institution">{edu.institution}</span>
                      <span className="edu-loc">{edu.location}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leadership & Coordination */}
              <div className="recruiter-edu-col">
                <h3 className="section-col-title">
                  <Users size={16} />
                  <span>LEADERSHIP & MENTORSHIP</span>
                </h3>
                {profile.leadership?.map((lead, idx) => (
                  <div key={idx} className="leadership-card">
                    <span className="lead-badge">{lead.badge}</span>
                    <h4 className="lead-role">{lead.role}</h4>
                    <span className="lead-org">{lead.organization}</span>
                    <span className="lead-period">{lead.period}</span>
                    <ul className="lead-highlights">
                      {lead.highlights.map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DIRECT CONTACT & COMMS */}
          {activeTab === 'contact' && (
            <div className="recruiter-contact-layout">
              <div className="recruiter-contact-meta-box">
                <h3 className="contact-box-title">DIRECT OPERATIONAL COMMS</h3>
                <p className="contact-box-sub">
                  Reach out for AppSec engineering roles, security research collaboration, or technical discussions.
                </p>

                <div className="contact-rows-grid">
                  <a href={`mailto:${profile.email}`} className="contact-channel-card">
                    <div className="channel-icon-wrap">
                      <Mail size={18} color="#34d399" />
                    </div>
                    <div>
                      <strong className="channel-label">PRIMARY EMAIL</strong>
                      <span className="channel-val">{profile.email}</span>
                    </div>
                  </a>

                  <a href={`tel:${profile.tel || '+918917512439'}`} className="contact-channel-card">
                    <div className="channel-icon-wrap">
                      <PhoneCall size={18} color="#38bdf8" />
                    </div>
                    <div>
                      <strong className="channel-label">PHONE / WHATSAPP</strong>
                      <span className="channel-val">{profile.phone}</span>
                    </div>
                  </a>

                  <div
                    className="contact-channel-card clickable"
                    onClick={() => handleCopy(profile.discord, 'discord')}
                  >
                    <div className="channel-icon-wrap">
                      <MessageSquare size={18} color="#a855f7" />
                    </div>
                    <div>
                      <strong className="channel-label">DISCORD HANDLE</strong>
                      <span className="channel-val">
                        {copiedKey === 'discord' ? 'COPIED TO CLIPBOARD' : profile.discord}
                      </span>
                    </div>
                  </div>

                  <a href={profile.github} target="_blank" rel="noreferrer" className="contact-channel-card">
                    <div className="channel-icon-wrap">
                      <Github size={18} color="#f8fafc" />
                    </div>
                    <div>
                      <strong className="channel-label">GITHUB REPOSITORIES</strong>
                      <span className="channel-val">github.com/MrWhiiteHat</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Verified Clearance / Target Roles Banner */}
              <div className="recruiter-target-roles-banner">
                <div className="target-roles-header">
                  <Zap size={16} color="#fbbf24" />
                  <strong>IMMEDIATE AVAILABILITY // TARGET ENGAGEMENTS</strong>
                </div>
                <div className="target-roles-tags">
                  {profile.availability.targetRoles.map((role) => (
                    <span key={role} className="target-role-chip">
                      {role}
                    </span>
                  ))}
                </div>
                <p className="work-pref-text">
                  Work Mode: <strong>{profile.availability.workPreferences}</strong> · Timeline: <strong>{profile.availability.timeframes}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Operational Bar */}
        <div className="recruiter-modal-footer">
          <div className="footer-left-info">
            <Terminal size={13} color="#34d399" />
            <span>MRWHITEHAT // CYBERSECURITY ARCHITECTURE & PRODUCTION AI ENGINEERING</span>
          </div>

          <div className="footer-right-buttons">
            <button
              type="button"
              className="recruiter-footer-close-btn"
              onClick={onClose}
            >
              RETURN TO 3D STUDIO [ESC]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
