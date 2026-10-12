import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  Mail,
  MessageSquare,
  PhoneCall,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRound,
  X,
} from 'lucide-react';
import { achievements, profile, projects, skills } from '../data.js';

const icons = {
  about: UserRound,
  projects: Code2,
  skills: BookOpen,
  achievements: Award,
  resume: BriefcaseBusiness,
  contact: Mail,
  operator: Terminal,
};

const sectionTitles = {
  about: 'About Me',
  projects: 'Featured Projects',
  skills: 'Skills & Toolkit',
  achievements: 'Honors & Awards',
  resume: 'Resume & Experience',
  contact: 'Get In Touch',
  operator: 'Operative Dossier (MrWhiteHat)',
};

export default function InfoPanel({ section, objectLabel, onClose }) {
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  const handleCopyDiscord = (e) => {
    e?.stopPropagation?.();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(profile.discord || 'mr.whitehat');
      setCopiedDiscord(true);
      setTimeout(() => setCopiedDiscord(false), 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const Icon = (section && icons[section]) || ShieldCheck;
  const title = (section && sectionTitles[section]) || 'Workspace Details';

  return (
    <AnimatePresence>
      {section && (
        <motion.aside
          key={section}
          className="info-panel"
          initial={{ opacity: 0, x: 48, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 48, scale: 0.98 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="panel-topline">
            <span className="panel-badge">
              <Icon size={15} />
              <span>{title.toUpperCase()}</span>
            </span>
            <button className="icon-button" onClick={onClose} aria-label="Close panel" title="Close (Esc)">
              <X size={18} />
            </button>
          </div>

          {objectLabel && (
            <div className="object-source-tag">
              <Sparkles size={12} />
              <span>Selected in 3D: <strong>{objectLabel}</strong></span>
            </div>
          )}

          <div className="panel-scroll-content">
            {section === 'about' && (
              <>
                <p className="eyebrow">IDENTITY & BACKGROUND</p>
                <h2>
                  Hi, I’m <em>{profile.name}</em> <span style={{ fontSize: '15px', color: '#fbbf24', fontStyle: 'normal' }}>({profile.alias})</span>.
                </h2>
                <p className="panel-lead">{profile.intro}</p>
                <div className="detail-card">
                  <span className="detail-label">CORE FOCUS</span>
                  <strong>{profile.role}</strong>
                  <span className="muted">Based in {profile.location}</span>
                </div>

                <div className="detail-card" style={{ marginTop: '10px' }}>
                  <span className="detail-label">ACADEMIC CREDENTIALS</span>
                  {profile.education?.map((edu) => (
                    <div key={edu.institution} style={{ marginBottom: '6px' }}>
                      <strong style={{ display: 'block', fontSize: '12px', color: '#fff' }}>{edu.degree} – {edu.field}</strong>
                      <span className="muted" style={{ fontSize: '11px' }}>{edu.institution}, {edu.location} ({edu.period})</span>
                    </div>
                  ))}
                </div>

                {profile.leadership && profile.leadership.length > 0 && (
                  <div className="detail-card" style={{ marginTop: '10px', borderColor: 'rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.05)' }}>
                    <span className="detail-label" style={{ color: '#38bdf8' }}>CAMPUS LEADERSHIP</span>
                    {profile.leadership.map((lead) => (
                      <div key={lead.organization} style={{ marginBottom: '6px' }}>
                        <strong style={{ display: 'block', fontSize: '12px', color: '#38bdf8' }}>{lead.role}</strong>
                        <span className="muted" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>{lead.organization} ({lead.period})</span>
                        <ul style={{ margin: '0 0 0 14px', padding: 0, fontSize: '11px', color: '#cbd5e1' }}>
                          <li>Conducted hands-on Web AppSec & CTF workshops for 200+ students.</li>
                          <li>Mentored student security cohorts in network forensics and system hardening.</li>
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {profile.availability && (
                  <div className="detail-card" style={{ marginTop: '10px', borderColor: 'rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.05)' }}>
                    <span className="detail-label" style={{ color: '#4ade80' }}>RECRUITER CLEARANCE // STATUS</span>
                    <strong style={{ display: 'block', fontSize: '12px', color: '#f0fdf4' }}>{profile.availability.timeframes}</strong>
                    <span className="muted" style={{ fontSize: '11px', color: '#86efac', display: 'block' }}>{profile.availability.workPreferences}</span>
                  </div>
                )}

                <p className="body-copy">
                  {profile.bio}
                </p>
                <div className="action-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <a className="primary-link" href={profile.github} target="_blank" rel="noreferrer">
                    <Github size={15} /> Visit GitHub
                  </a>
                  <a className="primary-link" href={profile.linkedin} target="_blank" rel="noreferrer" style={{ background: '#0284c7' }}>
                    <BriefcaseBusiness size={15} /> LinkedIn
                  </a>
                </div>
              </>
            )}

            {section === 'projects' && (
              <>
                <p className="eyebrow">PORTFOLIO WORK</p>
                <h2>Built to solve problems.</h2>
                <div className="panel-list">
                  {projects.map((p, i) => (
                    <article className="project-card" key={p.title}>
                      <div className="project-index">0{i + 1}</div>
                      <div className="project-main">
                        <div className="project-status">{p.status}</div>
                        <h3>{p.title}</h3>
                        <p>{p.description}</p>
                        {p.highlights && (
                          <ul style={{ margin: '8px 0 8px 16px', padding: 0, fontSize: '11px', color: '#94a3b8', lineHeight: '1.45' }}>
                            {p.highlights.map((h, hIdx) => (
                              <li key={hIdx} style={{ marginBottom: '3px' }}>{h}</li>
                            ))}
                          </ul>
                        )}
                        <div className="tag-list">
                          {p.tags.map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
                          <a href={p.link} target="_blank" rel="noreferrer" className="text-link">
                            View repository <ArrowUpRight size={14} />
                          </a>
                          {p.demoLink && (
                            <a
                              href={p.demoLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-link"
                              style={{ color: '#a78bfa', fontWeight: 600 }}
                            >
                              Launch Demo <ArrowUpRight size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {section === 'skills' && (
              <>
                <p className="eyebrow">COMPETENCIES</p>
                <h2>Skills & Toolkit.</h2>
                <div className="skill-groups">
                  {skills.map((group) => (
                    <div className="skill-group" key={group.group}>
                      <h3>{group.group}</h3>
                      <div className="tag-list">
                        {group.items.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {section === 'achievements' && (
              <>
                <p className="eyebrow">RECOGNITION</p>
                <h2>Honors & Awards.</h2>
                <div className="achievement-list">
                  {achievements.map((a, i) => (
                    <article className="achievement-card" key={`${a.title}-${i}`}>
                      <div className="achievement-icon">
                        <Award size={20} />
                      </div>
                      <div>
                        <h3>{a.title}</h3>
                        <strong>{a.detail}</strong>
                        {a.issuer && <div style={{ fontSize: '11px', color: '#fbbf24', marginTop: '2px' }}>{a.issuer}</div>}
                        <p>{a.note}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {section === 'resume' && (
              <>
                <p className="eyebrow">CURRICULUM VITAE</p>
                <h2>Resume.</h2>
                <p className="panel-lead">
                  Overview of technical capabilities, projects, security achievements, and experience.
                </p>
                <div className="detail-card">
                  <span className="detail-label">RESUME DOCUMENT</span>
                  <strong>{profile.name} ({profile.alias}) - {profile.role}</strong>
                  <span className="muted" style={{ display: 'block', marginTop: '4px' }}>
                    {profile.location} · {profile.email} · {profile.phone}
                  </span>
                </div>

                <div className="detail-card" style={{ marginTop: '10px' }}>
                  <span className="detail-label">EDUCATION</span>
                  {profile.education?.map((edu) => (
                    <div key={edu.institution} style={{ marginBottom: '6px' }}>
                      <strong style={{ display: 'block', fontSize: '12px', color: '#fff' }}>{edu.degree} – {edu.field}</strong>
                      <span className="muted" style={{ fontSize: '11px' }}>{edu.institution}, {edu.location} ({edu.period})</span>
                    </div>
                  ))}
                </div>

                <a className="primary-link" href={profile.resume} download="Sadashiba_Sarangi_Resume.pdf" style={{ marginTop: '12px' }}>
                  <Download size={16} /> Download Resume PDF ({profile.resumeFilename})
                </a>
              </>
            )}

            {section === 'contact' && (
              <>
                <p className="eyebrow">COMMUNICATION CHANNELS</p>
                <h2>Let’s connect.</h2>
                <p className="panel-lead">
                  Have a cybersecurity project, collaboration idea, or opportunity? Feel free to reach out.
                </p>
                <a className="contact-row" href={`mailto:${profile.email}`}>
                  <span className="contact-icon">
                    <Mail size={18} />
                  </span>
                  <span>
                    <small>DIRECT EMAIL</small>
                    <strong>{profile.email}</strong>
                  </span>
                  <ExternalLink size={15} />
                </a>
                <a className="contact-row" href={`tel:${profile.tel || '+918917512439'}`}>
                  <span className="contact-icon">
                    <PhoneCall size={18} />
                  </span>
                  <span>
                    <small>PHONE / WHATSAPP</small>
                    <strong>{profile.phone}</strong>
                  </span>
                  <ExternalLink size={15} />
                </a>
                <a className="contact-row" href={profile.github} target="_blank" rel="noreferrer">
                  <span className="contact-icon">
                    <Github size={18} />
                  </span>
                  <span>
                    <small>GITHUB</small>
                    <strong>{profile.github}</strong>
                  </span>
                  <ExternalLink size={15} />
                </a>
                <a className="contact-row" href={profile.linkedin} target="_blank" rel="noreferrer">
                  <span className="contact-icon">
                    <BriefcaseBusiness size={18} />
                  </span>
                  <span>
                    <small>LINKEDIN</small>
                    <strong>Connect on LinkedIn</strong>
                  </span>
                  <ExternalLink size={15} />
                </a>

                <div
                  className="contact-row"
                  onClick={handleCopyDiscord}
                  style={{ cursor: 'pointer', border: '1px solid rgba(129, 140, 248, 0.3)', background: 'rgba(99, 102, 241, 0.06)' }}
                  title="Click to copy Discord handle"
                >
                  <span className="contact-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                    <MessageSquare size={18} />
                  </span>
                  <span>
                    <small style={{ color: '#818cf8' }}>DISCORD FREQUENCY</small>
                    <strong style={{ color: '#e0e7ff' }}>@{profile.discord || 'mr.whitehat'}</strong>
                  </span>
                  {copiedDiscord ? (
                    <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 700 }}>COPIED!</span>
                  ) : (
                    <Copy size={15} style={{ color: '#818cf8' }} />
                  )}
                </div>
              </>
            )}

            {section === 'operator' && (
              <>
                <p className="eyebrow">TACTICAL IDENTITY</p>
                <h2>MrWhiteHat Operative Dossier</h2>
                <p className="panel-lead">
                  Cybersecurity specialist, AI red-teaming engineer, and campus student coordinator.
                </p>

                {/* Discord Channel Card */}
                <div className="detail-card" style={{ borderColor: 'rgba(129, 140, 248, 0.4)', background: 'rgba(99, 102, 241, 0.08)' }}>
                  <span className="detail-label" style={{ color: '#818cf8' }}>DISCORD OPS CHANNEL</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#e0e7ff' }}>@{profile.discord || 'mr.whitehat'}</strong>
                      <span className="muted" style={{ display: 'block', fontSize: '11px', color: '#a5b4fc' }}>Active for collaboration & security discussion</span>
                    </div>
                    <button
                      type="button"
                      className="primary-link"
                      onClick={handleCopyDiscord}
                      style={{ padding: '6px 12px', fontSize: '11px', background: copiedDiscord ? '#10b981' : '#6366f1' }}
                    >
                      {copiedDiscord ? <Check size={13} /> : <Copy size={13} />}
                      {copiedDiscord ? 'Copied!' : 'Copy Handle'}
                    </button>
                  </div>
                </div>

                {/* University Leadership Card */}
                {profile.leadership && profile.leadership.length > 0 && (
                  <div className="detail-card" style={{ marginTop: '10px', borderColor: 'rgba(251, 191, 36, 0.35)', background: 'rgba(251, 191, 36, 0.05)' }}>
                    <span className="detail-label" style={{ color: '#fbbf24' }}>CAMPUS CYBER SECURITY LEADERSHIP</span>
                    {profile.leadership.map((lead) => (
                      <div key={lead.organization}>
                        <strong style={{ fontSize: '13px', color: '#fbbf24', display: 'block' }}>{lead.role}</strong>
                        <span className="muted" style={{ fontSize: '11px', display: 'block', marginBottom: '6px' }}>{lead.organization} ({lead.period})</span>
                        <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                          <li>Conducted hands-on workshops for <strong>200+ students</strong> on Web AppSec (OWASP Top 10) & Linux hardening.</li>
                          <li>Mentored student CTF teams in traffic packet forensics and vulnerability remediation.</li>
                          <li>Spearheaded university participation in regional, state, and national cyber defense competitions.</li>
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recruiter Availability Card */}
                {profile.availability && (
                  <div className="detail-card" style={{ marginTop: '10px', borderColor: 'rgba(34, 197, 94, 0.4)', background: 'rgba(34, 197, 94, 0.06)' }}>
                    <span className="detail-label" style={{ color: '#4ade80' }}>RECRUITER OPPORTUNITY & CLEARANCE</span>
                    <strong style={{ fontSize: '13px', color: '#f0fdf4', display: 'block' }}>{profile.availability.timeframes}</strong>
                    <span className="muted" style={{ fontSize: '11px', color: '#86efac', display: 'block', marginBottom: '6px' }}>{profile.availability.workPreferences}</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {profile.availability.targetRoles?.map((r) => (
                        <span key={r} style={{ fontSize: '10px', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                          {r}
                        </span>
                      ))}
                    </div>
                    <a
                      className="primary-link"
                      href={`mailto:${profile.email}?subject=Opportunity%20Inquiry%20for%20Sadashiba%20Sarangi`}
                      style={{ background: '#10b981', color: '#022c22', display: 'inline-flex', padding: '7px 14px' }}
                    >
                      <Mail size={13} /> Email Recruiter Direct
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="panel-footer">
            <button className="panel-close-btn" onClick={onClose}>
              Close details
            </button>
            <span className="panel-hint">ESC to close</span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
