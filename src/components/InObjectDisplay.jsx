import { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import {
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  FolderGit2,
  Github,
  Globe,
  Layers,
  Lock,
  Mail,
  PhoneCall,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  Unlock,
  UserCheck,
  UserRound,
  Zap,
} from 'lucide-react';
import { achievements, profile, projects, skills } from '../data.js';
import NetworkCircuitHack from './hacking/NetworkCircuitHack.jsx';
import HexBufferHack from './hacking/HexBufferHack.jsx';
import TimingScannerHack from './hacking/TimingScannerHack.jsx';
import WaveformTunerHack from './hacking/WaveformTunerHack.jsx';
import WireSpliceHack from './hacking/WireSpliceHack.jsx';
import CipherDialHack from './hacking/CipherDialHack.jsx';

export const STATION_ORDER = ['projects', 'skills', 'achievements', 'about', 'resume', 'contact'];

export const stationConfigs = {
  achievements: {
    // Auditorium Projector Screen on Left Wall
    position: [-4.86, 2.15, -2.0],
    rotation: [0, Math.PI / 2, 0],
    camPos: [-2.10, 2.15, -2.0],
    camTarget: [-4.86, 2.15, -2.0],
    title: 'Auditorium Projector',
    icon: Award,
    distanceFactor: 1.25,
    lightColor: '#4ade80',
    lightIntensity: 22,
    lightPos: [0, 0, 0.55],
  },
  projects: {
    // Dual-Monitor Workstation on Executive Desk
    position: [-1.2, 1.20, 0.15],
    rotation: [-0.05, 0, 0],
    camPos: [-1.2, 1.42, 1.70],
    camTarget: [-1.2, 1.15, 0.15],
    title: 'Dual-Monitor Workstation',
    icon: Code2,
    distanceFactor: 0.72,
    lightColor: '#38bdf8',
    lightIntensity: 18,
    lightPos: [0, 0, 0.45],
  },
  skills: {
    // Cyber Security Archive Bookcase on Back Wall
    position: [0.6, 1.90, -4.70],
    rotation: [0, 0, 0],
    camPos: [0.6, 1.90, -2.50],
    camTarget: [0.6, 1.90, -4.70],
    title: 'Archive Bookcase',
    icon: BookOpen,
    distanceFactor: 0.65,
    lightColor: '#34d399',
    lightIntensity: 15,
    lightPos: [0, 0, 0.35],
  },
  about: {
    // Executive Wall Plaque above Lounge Sofa on Right Wall
    position: [4.95, 2.20, 1.6],
    rotation: [0, -Math.PI / 2, 0],
    camPos: [2.20, 2.20, 1.6],
    camTarget: [4.95, 2.20, 1.6],
    title: 'Executive Wall Plaque',
    icon: UserRound,
    distanceFactor: 0.65,
    lightColor: '#fbbf24',
    lightIntensity: 14,
    lightPos: [0, 0, 0.35],
  },
  resume: {
    // Laser-Printed Document on Credenza Printer
    position: [-3.6, 1.05, 1.05],
    rotation: [-Math.PI / 3.4, 0, 0],
    camPos: [-3.6, 1.60, 2.00],
    camTarget: [-3.6, 1.00, 1.05],
    title: 'Laser Printer Output Tray',
    icon: BriefcaseBusiness,
    distanceFactor: 0.60,
    lightColor: '#10b981',
    lightIntensity: 10,
    lightPos: [0, 0.15, 0.25],
  },
  contact: {
    // Intercom Console on Desk
    position: [-0.15, 0.86, 0.65],
    rotation: [-Math.PI / 4.5, 0, 0],
    camPos: [-0.15, 1.35, 1.65],
    camTarget: [-0.15, 0.86, 0.65],
    title: 'Desk Intercom Console',
    icon: Mail,
    distanceFactor: 0.55,
    lightColor: '#22c55e',
    lightIntensity: 14,
    lightPos: [0, 0.1, 0.3],
  },
};

export default function InObjectDisplay({ activeSection, onClose, onNavigate }) {
  const [selectedProject, setSelectedProject] = useState(0);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');

  // Track unlocked state per station
  const [unlockedStations, setUnlockedStations] = useState({
    projects: false,
    skills: false,
    achievements: false,
    about: false,
    resume: false,
    contact: false,
  });

  // Track active breach transition animation
  const [breachingSection, setBreachingSection] = useState(null);

  const triggerUnlock = (sectionKey) => {
    setBreachingSection(sectionKey);
    setTimeout(() => {
      setUnlockedStations((prev) => ({ ...prev, [sectionKey]: true }));
      setBreachingSection(null);
    }, 1100);
  };

  const relockStation = (sectionKey) => {
    setUnlockedStations((prev) => ({ ...prev, [sectionKey]: false }));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__UNLOCK_ALL_HACKS__ = () => {
        setUnlockedStations({
          projects: true,
          skills: true,
          achievements: true,
          about: true,
          resume: true,
          contact: true,
        });
      };
      window.__RELOCK_ALL_HACKS__ = () => {
        setUnlockedStations({
          projects: false,
          skills: false,
          achievements: false,
          about: false,
          resume: false,
          contact: false,
        });
      };
      window.__UNLOCK_CURRENT__ = () => {
        if (activeSection) triggerUnlock(activeSection);
      };
    }
  }, [activeSection]);

  if (!activeSection) return null;
  const config = stationConfigs[activeSection];
  if (!config) return null;

  const isUnlocked = !!unlockedStations[activeSection];
  const isBreaching = breachingSection === activeSection;

  const currentIndex = STATION_ORDER.indexOf(activeSection);
  const prevSection =
    currentIndex > 0 ? STATION_ORDER[currentIndex - 1] : STATION_ORDER[STATION_ORDER.length - 1];
  const nextSection =
    currentIndex < STATION_ORDER.length - 1 ? STATION_ORDER[currentIndex + 1] : STATION_ORDER[0];

  return (
    <group position={config.position} rotation={config.rotation}>
      {/* Dynamic Three.js Point Light illuminating surrounding 3D office geometry */}
      <pointLight
        color={config.lightColor}
        intensity={config.lightIntensity}
        distance={2.8}
        position={config.lightPos || [0, 0, 0.4]}
      />

      <Html
        center
        transform
        distanceFactor={config.distanceFactor || 0.75}
        position={[0, 0, 0]}
        zIndexRange={[200, 0]}
      >
        <div
          className={`physical-object-medium physical-${activeSection}`}
          onWheel={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Universal Object Physical Status Bar */}
          <div className="obj-status-bar">
            <div className="obj-status-left">
              <span
                className={`obj-beacon-led ${
                  isUnlocked ? 'beacon-unlocked' : 'beacon-locked'
                }`}
              />
              <span className="obj-device-label">{config.title.toUpperCase()}</span>
              {isUnlocked ? (
                <span className="obj-sec-tag unlocked">
                  <ShieldCheck size={11} />
                  <span>UNLOCKED // CTOS BREACHED</span>
                </span>
              ) : (
                <span className="obj-sec-tag locked">
                  <ShieldAlert size={11} />
                  <span>ENCRYPTED // HACK TO ACCESS</span>
                </span>
              )}
            </div>

            <div className="obj-status-actions">
              {isUnlocked && (
                <button
                  className="obj-relock-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    relockStation(activeSection);
                  }}
                  title="Re-lock this station to play the hacking puzzle again"
                >
                  <Lock size={10} />
                  <span>Re-lock 🔒</span>
                </button>
              )}
              <button
                className="obj-step-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(prevSection);
                }}
                title="Previous object in office (←)"
                aria-label="Previous object"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="obj-step-index">
                {currentIndex + 1}/{STATION_ORDER.length}
              </span>
              <button
                className="obj-step-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate?.(nextSection);
                }}
                title="Next object in office (→)"
                aria-label="Next object"
              >
                <ChevronRight size={13} />
              </button>
              <button
                className="obj-exit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                title="Step back to full office view (Esc)"
              >
                <span>Back</span>
                <RotateCcw size={11} />
              </button>
            </div>
          </div>

          {/* HACKING PUZZLE / BREACH ANIMATION / UNLOCKED CONTENT */}
          {isBreaching ? (
            <div className="hack-breach-overlay">
              <div className="breach-card">
                <div className="breach-glitch-badge">
                  <Zap size={14} className="breach-zap-icon" />
                  <span>ctOS // INTRUSION_EXPLOIT_DEPLOYED</span>
                </div>
                <h2 className="breach-title">ACCESS GRANTED</h2>
                <p className="breach-desc">
                  Kernel memory injected · Decrypting physical station storage...
                </p>
                <div className="breach-progress-bar">
                  <div className="breach-progress-fill" />
                </div>
                <div className="breach-status-line">
                  <span className="breach-code">0x7FFF_LOAD_STATION // SUCCESS</span>
                  <span className="breach-pct">100%</span>
                </div>
              </div>
            </div>
          ) : !isUnlocked ? (
            <div className="station-hack-wrapper">
              {activeSection === 'projects' && (
                <NetworkCircuitHack
                  onSolved={() => triggerUnlock('projects')}
                  onBypass={() => triggerUnlock('projects')}
                />
              )}
              {activeSection === 'skills' && (
                <HexBufferHack
                  onSolved={() => triggerUnlock('skills')}
                  onBypass={() => triggerUnlock('skills')}
                />
              )}
              {activeSection === 'achievements' && (
                <TimingScannerHack
                  onSolved={() => triggerUnlock('achievements')}
                  onBypass={() => triggerUnlock('achievements')}
                />
              )}
              {activeSection === 'about' && (
                <CipherDialHack
                  onSolved={() => triggerUnlock('about')}
                  onBypass={() => triggerUnlock('about')}
                />
              )}
              {activeSection === 'resume' && (
                <WireSpliceHack
                  onSolved={() => triggerUnlock('resume')}
                  onBypass={() => triggerUnlock('resume')}
                />
              )}
              {activeSection === 'contact' && (
                <WaveformTunerHack
                  onSolved={() => triggerUnlock('contact')}
                  onBypass={() => triggerUnlock('contact')}
                />
              )}
            </div>
          ) : (
            <>

          {/* 1. DUAL MONITORS WORKSTATION (Projects) */}
          {activeSection === 'projects' && (
            <div className="dual-monitors-rig">
              {/* Monitor 1: Terminal & Repository Index */}
              <div className="monitor-frame monitor-left">
                <div className="monitor-bezel-header">
                  <div className="traffic-lights">
                    <span className="tl-red" />
                    <span className="tl-yellow" />
                    <span className="tl-green" />
                  </div>
                  <span className="bezel-title">terminal — zsh · ~/projects</span>
                  <Terminal size={12} className="bezel-icon" />
                </div>
                <div className="monitor-screen-body terminal-body">
                  <div className="term-prompt">
                    <span className="term-user">mrwhitehat@workstation</span>
                    <span className="term-path">~/code</span>
                    <span className="term-cmd">ls -la --projects</span>
                  </div>

                  <div className="term-repo-list">
                    {projects.map((p, idx) => {
                      const isSelected = selectedProject === idx;
                      return (
                        <div
                          key={p.title}
                          className={`term-repo-row ${isSelected ? 'active-row' : ''}`}
                          onClick={() => setSelectedProject(idx)}
                        >
                          <span className="row-prefix">{isSelected ? '▶ [LOAD]' : '  [FILE]'}</span>
                          <span className="row-name">{p.title}</span>
                          <span className="row-tag">{p.status}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="term-footer-stat">
                    <span className="term-cursor">█</span>
                    <span>3 active repositories · 0 fatal errors</span>
                  </div>
                </div>
              </div>

              {/* Monitor 2: Live Code Inspector & GitHub Dispatch */}
              <div className="monitor-frame monitor-right">
                <div className="monitor-bezel-header">
                  <div className="traffic-lights">
                    <span className="tl-red" />
                    <span className="tl-yellow" />
                    <span className="tl-green" />
                  </div>
                  <span className="bezel-title">inspector.rs — {projects[selectedProject]?.title}</span>
                  <Code2 size={12} className="bezel-icon" />
                </div>

                <div className="monitor-screen-body ide-body">
                  <div className="ide-meta-bar">
                    <span className="ide-status-badge">
                      <span className="badge-dot" />
                      {projects[selectedProject]?.status}
                    </span>
                    <span className="ide-file-type">Rust / TypeScript Kernel</span>
                  </div>

                  <h3 className="ide-project-title">{projects[selectedProject]?.title}</h3>
                  <p className="ide-project-summary">{projects[selectedProject]?.short}</p>
                  <p className="ide-project-desc">{projects[selectedProject]?.description}</p>

                  <div className="ide-stack-wrap">
                    <span className="stack-header">STACK SPECIFICATION:</span>
                    <div className="ide-stack-pills">
                      {projects[selectedProject]?.tags.map((t) => (
                        <span key={t} className="ide-pill">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="ide-actions-row">
                    <a
                      href={projects[selectedProject]?.link}
                      target="_blank"
                      rel="noreferrer"
                      className="ide-github-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github size={13} />
                      <span>Open GitHub Repository</span>
                      <ArrowUpRight size={12} />
                    </a>
                    <button
                      className="ide-next-btn"
                      onClick={() =>
                        setSelectedProject((prev) => (prev + 1) % projects.length)
                      }
                      title="Next Project"
                    >
                      <span>Next Spec</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROJECTOR SCREEN (Achievements & Awards) */}
          {activeSection === 'achievements' && (
            <div className="projector-cloth-slide">
              <div className="projector-slide-top">
                <div className="slide-badge">
                  <Sparkles size={12} />
                  <span>PRESENTATION SLIDE // AWARDS & DEFENSE BRIEFING</span>
                </div>
                <span className="slide-counter">
                  SLIDE 0{selectedSlide + 1} / 0{achievements.length}
                </span>
              </div>

              <div className="projector-slide-content">
                <div className="slide-hero-left">
                  <div className="slide-trophy-hologram">
                    <Trophy size={42} />
                    <span className="holo-ring" />
                  </div>
                  <div className="slide-award-class">VERIFIED MERIT</div>
                </div>

                <div className="slide-hero-right">
                  <span className="slide-year-tag">
                    {achievements[selectedSlide]?.detail}
                  </span>
                  <h2 className="slide-award-title">{achievements[selectedSlide]?.title}</h2>
                  <p className="slide-award-desc">{achievements[selectedSlide]?.note}</p>

                  <div className="slide-bullet-list">
                    <div className="bullet-point">
                      <span className="bullet-dot" />
                      <span>National & International competitive cybersecurity track</span>
                    </div>
                    <div className="bullet-point">
                      <span className="bullet-dot" />
                      <span>Live blue/red team infrastructure operations</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projector Slide Selector Tabs */}
              <div className="projector-slide-nav">
                {achievements.map((item, idx) => (
                  <button
                    key={`${item.title}-${idx}`}
                    className={`slide-tab-pill ${selectedSlide === idx ? 'active-slide' : ''}`}
                    onClick={() => setSelectedSlide(idx)}
                  >
                    <span className="tab-num">0{idx + 1}</span>
                    <span className="tab-title">{item.title.split('—')[0].trim()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. ARCHIVE BOOKCASE (Skills Matrix) */}
          {activeSection === 'skills' && (
            <div className="archive-bookcase-board">
              <div className="board-top-banner">
                <div className="board-title-group">
                  <Layers size={14} className="board-icon" />
                  <div>
                    <span className="board-subtitle">ARCHIVE DATABASE // SHELF INDEX</span>
                    <h3 className="board-title">Technical Competency Dossier</h3>
                  </div>
                </div>

                <div className="filter-chips">
                  {['All', ...skills.map((s) => s.group)].map((cat) => (
                    <button
                      key={cat}
                      className={`filter-chip ${selectedSkillFilter === cat ? 'active-chip' : ''}`}
                      onClick={() => setSelectedSkillFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="board-catalogue-grid">
                {skills
                  .filter((g) => selectedSkillFilter === 'All' || g.group === selectedSkillFilter)
                  .map((group) => (
                    <div key={group.group} className="shelf-drawer-card">
                      <div className="drawer-handle">
                        <span className="drawer-metal-strip" />
                        <span className="drawer-category">{group.group.toUpperCase()}</span>
                      </div>
                      <div className="drawer-items-list">
                        {group.items.map((it) => (
                          <div key={it} className="drawer-skill-row">
                            <span className="skill-dot" />
                            <span className="skill-name">{it}</span>
                            <span className="skill-level">VERIFIED</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 4. EXECUTIVE LOUNGE WALL PLAQUE (About Me) */}
          {activeSection === 'about' && (
            <div className="executive-wall-plaque">
              <div className="plaque-crest-row">
                <div className="plaque-crest-icon">
                  <ShieldCheck size={28} />
                </div>
                <div className="plaque-crest-text">
                  <span className="crest-label">OFFICE OF CYBER DEFENSE & APPLIED AI</span>
                  <h2 className="plaque-name">{profile.name}</h2>
                  <span className="plaque-role">{profile.role}</span>
                </div>
              </div>

              <div className="plaque-divider" />

              <div className="plaque-stats-grid">
                <div className="plaque-stat-cell">
                  <span className="stat-label">CLEARANCE / ROLE</span>
                  <strong className="stat-value">Security Researcher</strong>
                </div>
                <div className="plaque-stat-cell">
                  <span className="stat-label">LOCATION</span>
                  <strong className="stat-value">{profile.location}</strong>
                </div>
                <div className="plaque-stat-cell">
                  <span className="stat-label">SPECIALTY</span>
                  <strong className="stat-value">Mobile Sec & AI</strong>
                </div>
                <div className="plaque-stat-cell">
                  <span className="stat-label">STATUS</span>
                  <strong className="stat-value live-val">AVAILABLE FOR WORK</strong>
                </div>
              </div>

              <p className="plaque-bio-text">{profile.intro}</p>

              <div className="plaque-action-row">
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="plaque-cta-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={14} />
                  <span>Inspect GitHub Profile</span>
                  <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          )}

          {/* 5. LASER PRINTER OUTPUT TRAY (Resume) */}
          {activeSection === 'resume' && (
            <div className="printer-paper-sheet">
              <div className="paper-watermark">CONFIDENTIAL // VERIFIED</div>

              <div className="paper-header">
                <div className="paper-header-left">
                  <span className="doc-num">DOC-CV-2026 // A4 LASER PRINT</span>
                  <h2 className="doc-title">{profile.name}</h2>
                  <span className="doc-subtitle">{profile.role}</span>
                </div>
                <div className="paper-stamp">OFFICIAL CV</div>
              </div>

              <div className="paper-rule" />

              <div className="paper-body-content">
                <div className="paper-section">
                  <h4 className="paper-heading">EXECUTIVE SUMMARY</h4>
                  <p className="paper-text">{profile.intro}</p>
                </div>

                <div className="paper-section">
                  <h4 className="paper-heading">CORE SECURITY CAPABILITIES</h4>
                  <div className="paper-tag-cloud">
                    <span>Mobile App Sec</span>
                    <span>Static Analysis</span>
                    <span>Reverse Engineering</span>
                    <span>Burp Suite</span>
                    <span>Python</span>
                    <span>PyTorch</span>
                    <span>FastAPI</span>
                    <span>Docker</span>
                  </div>
                </div>

                <div className="paper-section">
                  <h4 className="paper-heading">RECOGNITIONS</h4>
                  <p className="paper-text">
                    • Bronze Medalist — Odisha Skills Cybersecurity (2021, 2025–2026)
                    <br />• BRICS Hi-Tech International Future Skills Participant (2026)
                  </p>
                </div>
              </div>

              <div className="paper-tearoff-tray">
                <a
                  href={profile.resume}
                  download
                  className="paper-download-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={14} />
                  <span>Download Laser-Printed PDF Document</span>
                </a>
              </div>
            </div>
          )}

          {/* 6. DESK TELEPHONE / COMMS CONSOLE (Contact) */}
          {activeSection === 'contact' && (
            <div className="desktop-comms-console">
              <div className="console-hud-top">
                <div className="console-frequency">
                  <span className="freq-blip" />
                  <span className="freq-code">FREQ: 142.850 MHz // SECURE RELAY</span>
                </div>
                <span className="console-enc">AES-256 ENCRYPTED</span>
              </div>

              <div className="console-main-grid">
                <div className="console-left-channels">
                  <a
                    href={`mailto:${profile.email}`}
                    className="console-channel-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="channel-icon-wrap">
                      <Mail size={16} />
                    </div>
                    <div className="channel-info">
                      <span className="ch-tag">CHANNEL 01 · DIRECT MAIL</span>
                      <strong className="ch-val">{profile.email}</strong>
                    </div>
                    <Send size={12} className="ch-arrow" />
                  </a>

                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="console-channel-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="channel-icon-wrap">
                      <Github size={16} />
                    </div>
                    <div className="channel-info">
                      <span className="ch-tag">CHANNEL 02 · GITHUB PORTAL</span>
                      <strong className="ch-val">github.com/MrWhiiteHat</strong>
                    </div>
                    <ExternalLink size={12} className="ch-arrow" />
                  </a>

                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="console-channel-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="channel-icon-wrap">
                      <BriefcaseBusiness size={16} />
                    </div>
                    <div className="channel-info">
                      <span className="ch-tag">CHANNEL 03 · PROFESSIONAL LINK</span>
                      <strong className="ch-val">LinkedIn Network</strong>
                    </div>
                    <ExternalLink size={12} className="ch-arrow" />
                  </a>
                </div>

                <div className="console-numpad-side">
                  <div className="numpad-screen">
                    <span className="np-label">STATUS</span>
                    <span className="np-val">LINE 1 READY</span>
                  </div>
                  <div className="numpad-keys">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
                      <span key={k} className="np-key">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </Html>
  </group>
);
}
