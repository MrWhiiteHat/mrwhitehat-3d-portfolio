import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  Download,
  ExternalLink,
  Github,
  Mail,
  ShieldCheck,
  Sparkles,
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
};

const sectionTitles = {
  about: 'About Me',
  projects: 'Featured Projects',
  skills: 'Skills & Toolkit',
  achievements: 'Honors & Awards',
  resume: 'Resume & Experience',
  contact: 'Get In Touch',
};

export default function InfoPanel({ section, objectLabel, onClose }) {
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
                  Hi, I’m <em>{profile.name}</em>.
                </h2>
                <p className="panel-lead">{profile.intro}</p>
                <div className="detail-card">
                  <span className="detail-label">CORE FOCUS</span>
                  <strong>{profile.role}</strong>
                  <span className="muted">Based in {profile.location}</span>
                </div>
                <p className="body-copy">
                  I specialize in application security, reverse engineering, vulnerability assessments, and AI-driven automation. I treat software like a live system to explore, harden, and optimize.
                </p>
                <div className="action-row">
                  <a className="primary-link" href={profile.github} target="_blank" rel="noreferrer">
                    <Github size={15} /> Visit GitHub
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
                        <div className="tag-list">
                          {p.tags.map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                        <a href={p.link} target="_blank" rel="noreferrer" className="text-link">
                          View repository <ArrowUpRight size={14} />
                        </a>
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
                  <strong>{profile.name} - Cybersecurity & AI</strong>
                  <span className="muted">Direct PDF download</span>
                </div>
                <a className="primary-link" href={profile.resume} download>
                  <Download size={16} /> Download Resume (PDF)
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
                    <small>EMAIL</small>
                    <strong>{profile.email}</strong>
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
