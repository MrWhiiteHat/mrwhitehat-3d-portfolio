import { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import {
  Activity,
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  FolderGit2,
  Github,
  Globe,
  GraduationCap,
  HardDrive,
  Layers,
  Lock,
  Mail,
  MessageSquare,
  PhoneCall,
  Radio,
  RotateCcw,
  Send,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  Unlock,
  UserCheck,
  UserRound,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';
import { achievements, profile, projects, skills } from '../data.js';
import NetworkCircuitHack from './hacking/NetworkCircuitHack.jsx';
import HexBufferHack from './hacking/HexBufferHack.jsx';
import TimingScannerHack from './hacking/TimingScannerHack.jsx';
import WaveformTunerHack from './hacking/WaveformTunerHack.jsx';
import WireSpliceHack from './hacking/WireSpliceHack.jsx';
import CipherDialHack from './hacking/CipherDialHack.jsx';
import MainframeFirewallHack from './hacking/MainframeFirewallHack.jsx';
import HardwareArsenalHack from './hacking/HardwareArsenalHack.jsx';
import PacketSnifferHack from './hacking/PacketSnifferHack.jsx';
import VisitorLogDisplay from './studio/VisitorLogDisplay.jsx';

export const STATION_ORDER = [
  'projects',
  'skills',
  'achievements',
  'about',
  'resume',
  'contact',
  'operator',
  'server_rack',
  'hardware_arsenal',
  'wireshark_monitor',
  'visitor_log',
];

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
  operator: {
    // Cyber Sentinel Drone & Hologram Operator on Back-Left Wall
    position: [-3.35, 1.60, -3.85],
    rotation: [0, 0.65, 0],
    camPos: [-1.75, 1.70, -2.35],
    camTarget: [-3.35, 1.60, -3.85],
    title: 'Operative Terminal // MrWhiteHat',
    icon: Terminal,
    distanceFactor: 0.70,
    lightColor: '#38bdf8',
    lightIntensity: 22,
    lightPos: [0, 0, 0.45],
  },
  server_rack: {
    // 42U Mainframe Server Rack between Conference & Archive
    position: [-2.3, 1.40, -4.20],
    rotation: [0, 0, 0],
    camPos: [-2.3, 1.55, -2.60],
    camTarget: [-2.3, 1.40, -4.20],
    title: '42U Mainframe Server Rack',
    icon: Server,
    distanceFactor: 0.70,
    lightColor: '#ef4444',
    lightIntensity: 22,
    lightPos: [0, 0, 0.45],
  },
  hardware_arsenal: {
    // Tactical Red Team Hardware Arsenal Pegboard on Left Wall
    position: [-4.88, 2.35, 1.25],
    rotation: [0, Math.PI / 2, 0],
    camPos: [-2.85, 2.35, 1.25],
    camTarget: [-4.88, 2.35, 1.25],
    title: 'Tactical Red Team Hardware Arsenal',
    icon: Radio,
    distanceFactor: 0.70,
    lightColor: '#f97316',
    lightIntensity: 20,
    lightPos: [0, 0, 0.45],
  },
  wireshark_monitor: {
    // Wireshark Live PCAP Analyzer on Left Wall
    position: [-4.88, 3.45, 1.25],
    rotation: [0, Math.PI / 2, 0],
    camPos: [-2.85, 3.45, 1.25],
    camTarget: [-4.88, 3.45, 1.25],
    title: 'Wireshark Monitor // Live PCAP Analyzer',
    icon: Activity,
    distanceFactor: 0.75,
    lightColor: '#06b6d4',
    lightIntensity: 22,
    lightPos: [0, 0, 0.45],
  },
  visitor_log: {
    // Visitor Count & Access Roster Terminal on Right Wall next to entrance
    position: [4.94, 2.25, -0.4],
    rotation: [0, -Math.PI / 2, 0],
    camPos: [2.5, 2.25, -0.4],
    camTarget: [4.94, 2.25, -0.4],
    title: 'CTOS Security Visitor Access Terminal',
    icon: Users,
    distanceFactor: 0.75,
    lightColor: '#34d399',
    lightIntensity: 22,
    lightPos: [0, 0, 0.45],
  },
};

export default function InObjectDisplay({
  activeSection,
  onClose,
  onNavigate,
  visitorLogs = [],
  visitorCount = 1,
  playerData = null,
}) {
  const [selectedProject, setSelectedProject] = useState(0);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('All');
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  const handleCopyDiscord = (e) => {
    e?.stopPropagation?.();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(profile.discord || 'mr.whitehat');
      setCopiedDiscord(true);
      setTimeout(() => setCopiedDiscord(false), 2000);
    }
  };

  // Track unlocked state per station
  const [unlockedStations, setUnlockedStations] = useState({
    projects: false,
    skills: false,
    achievements: false,
    about: false,
    resume: false,
    contact: false,
    operator: false,
    server_rack: false,
    hardware_arsenal: false,
    wireshark_monitor: false,
    visitor_log: true,
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
          operator: true,
          server_rack: true,
          hardware_arsenal: true,
          wireshark_monitor: true,
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
          operator: false,
          server_rack: false,
          hardware_arsenal: false,
          wireshark_monitor: false,
        });
      };
      window.__UNLOCK_CURRENT__ = () => {
        if (activeSection) triggerUnlock(activeSection);
      };
    }
  }, [activeSection]);

  const config = activeSection ? stationConfigs[activeSection] : null;
  // Keep a station light mounted even when no station is open: adding or removing a light
  // changes the scene's light count, which recompiles every lit material (a visible freeze).
  if (!config) return <pointLight intensity={0} distance={2.8} />;

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
              {activeSection === 'operator' && (
                <TimingScannerHack
                  onSolved={() => triggerUnlock('operator')}
                  onBypass={() => triggerUnlock('operator')}
                />
              )}
              {activeSection === 'server_rack' && (
                <MainframeFirewallHack
                  onSolved={() => triggerUnlock('server_rack')}
                  onBypass={() => triggerUnlock('server_rack')}
                />
              )}
              {activeSection === 'hardware_arsenal' && (
                <HardwareArsenalHack
                  onSolved={() => triggerUnlock('hardware_arsenal')}
                  onBypass={() => triggerUnlock('hardware_arsenal')}
                />
              )}
              {activeSection === 'wireshark_monitor' && (
                <PacketSnifferHack
                  onSolved={() => triggerUnlock('wireshark_monitor')}
                  onBypass={() => triggerUnlock('wireshark_monitor')}
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

                  {projects[selectedProject]?.highlights && (
                    <div className="ide-highlights-box" style={{ marginTop: '8px', marginBottom: '8px' }}>
                      <span className="stack-header" style={{ color: '#38bdf8' }}>KEY ARCHITECTURE & PERFORMANCE SIGNALS:</span>
                      <ul style={{ margin: '4px 0 0 14px', padding: 0, fontSize: '9px', color: '#cbd5e1', lineHeight: '1.45' }}>
                        {projects[selectedProject].highlights.map((h, hIdx) => (
                          <li key={hIdx} style={{ marginBottom: '2px' }}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

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
                      <span>Open Repository</span>
                      <ArrowUpRight size={12} />
                    </a>
                    {projects[selectedProject]?.demoLink && (
                      <a
                        href={projects[selectedProject].demoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="ide-github-btn"
                        style={{ background: '#7c3aed', color: '#ffffff' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe size={13} />
                        <span>Launch Demo</span>
                        <ArrowUpRight size={12} />
                      </a>
                    )}
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
                  <span className="crest-label">OFFICE OF CYBER DEFENSE & APPLIED AI // DOSSIER</span>
                  <h2 className="plaque-name">{profile.name} <span style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>({profile.alias})</span></h2>
                  <span className="plaque-role">{profile.role}</span>
                </div>
              </div>

              <div className="plaque-divider" />

              <div className="plaque-stats-grid">
                <div className="plaque-stat-cell">
                  <span className="stat-label">CLEARANCE / ROLE</span>
                  <strong className="stat-value">AppSec & AI Engineer</strong>
                </div>
                <div className="plaque-stat-cell">
                  <span className="stat-label">LOCATION</span>
                  <strong className="stat-value">{profile.location}</strong>
                </div>
                <div className="plaque-stat-cell">
                  <span className="stat-label">SPECIALTY</span>
                  <strong className="stat-value">Android Pen Testing & RAG</strong>
                </div>
                <div className="plaque-stat-cell">
                  <span className="stat-label">STATUS</span>
                  <strong className="stat-value live-val">AVAILABLE FOR WORK</strong>
                </div>
              </div>

              <p className="plaque-bio-text">{profile.intro}</p>

              {/* Education Credentials */}
              <div className="plaque-edu-box" style={{ background: 'rgba(251, 191, 36, 0.05)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '6px', padding: '8px 10px' }}>
                <span className="stat-label" style={{ marginBottom: '4px' }}>ACADEMIC CREDENTIALS & DEGREES</span>
                {profile.education?.map((edu) => (
                  <div key={edu.institution} style={{ marginBottom: '4px', fontSize: '9.5px', color: '#cbd5e1' }}>
                    <strong style={{ color: '#fbbf24' }}>{edu.degree} – {edu.field}</strong>
                    <div style={{ color: '#94a3b8', fontSize: '8.5px' }}>{edu.institution}, {edu.location} ({edu.period}) · {edu.status}</div>
                  </div>
                ))}
              </div>

              {/* University Cyber Club Leadership & Mentorship */}
              {profile.leadership && profile.leadership.length > 0 && (
                <div className="plaque-edu-box" style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '6px', padding: '8px 10px', marginTop: '6px' }}>
                  <span className="stat-label" style={{ marginBottom: '4px', color: '#38bdf8' }}>CAMPUS LEADERSHIP & STUDENT COORDINATION</span>
                  {profile.leadership.map((lead) => (
                    <div key={lead.organization} style={{ fontSize: '9.5px', color: '#cbd5e1' }}>
                      <strong style={{ color: '#38bdf8' }}>{lead.role}</strong>
                      <div style={{ color: '#94a3b8', fontSize: '8.5px', marginBottom: '3px' }}>{lead.organization} ({lead.period})</div>
                      <div style={{ fontSize: '8.5px', color: '#cbd5e1', lineHeight: '1.4' }}>
                        • Organized and led cybersecurity workshops for 200+ students covering Web AppSec (OWASP Top 10) & Linux hardening.
                        <br />• Mentored student CTF teams in traffic packet forensics and vulnerability remediation.
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recruiter Mobility & Opportunity Clearance */}
              {profile.availability && (
                <div style={{ background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', padding: '7px 10px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div>
                    <span style={{ fontSize: '7.5px', letterSpacing: '0.8px', color: '#4ade80', fontWeight: 700, display: 'block' }}>RECRUITER STATUS // CAREER AVAILABILITY</span>
                    <strong style={{ fontSize: '10px', color: '#f0fdf4' }}>{profile.availability.timeframes}</strong>
                    <div style={{ fontSize: '8px', color: '#86efac' }}>{profile.availability.workPreferences}</div>
                  </div>
                  <span style={{ fontSize: '8px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.4)', fontWeight: 600 }}>
                    AppSec · PenTest · AI Security
                  </span>
                </div>
              )}

              <div className="plaque-action-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="plaque-cta-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github size={13} />
                  <span>GitHub Profile</span>
                  <ArrowUpRight size={11} />
                </a>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="plaque-cta-btn"
                  style={{ background: '#0284c7', color: '#ffffff' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <BriefcaseBusiness size={13} />
                  <span>LinkedIn Network</span>
                  <ArrowUpRight size={11} />
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="plaque-cta-btn"
                  style={{ background: '#10b981', color: '#022c22' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail size={13} />
                  <span>Email Direct</span>
                  <Send size={11} />
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
                  <h2 className="doc-title">{profile.name} <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>({profile.alias})</span></h2>
                  <span className="doc-subtitle">{profile.role}</span>
                  <div style={{ fontSize: '9px', color: '#475569', marginTop: '3px' }}>
                    {profile.location} · {profile.email} · {profile.phone}
                  </div>
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
                  <h4 className="paper-heading">ACADEMIC BACKGROUND & DEGREES</h4>
                  {profile.education?.map((edu) => (
                    <div key={edu.institution} style={{ marginBottom: '4px' }}>
                      <strong style={{ fontSize: '10px', color: '#0f172a' }}>{edu.degree} – {edu.field}</strong>
                      <div style={{ fontSize: '8.5px', color: '#64748b' }}>{edu.institution}, {edu.location} ({edu.period}) · {edu.status}</div>
                    </div>
                  ))}
                </div>

                <div className="paper-section">
                  <h4 className="paper-heading">CORE SECURITY & AI CAPABILITIES</h4>
                  <div className="paper-tag-cloud">
                    <span>Mobile App Sec (Android)</span>
                    <span>Frida & ADB Hooking</span>
                    <span>OWASP Mobile Top 10</span>
                    <span>VAPT & Static Analysis</span>
                    <span>Burp Suite & Wireshark</span>
                    <span>Python & FastAPI</span>
                    <span>Local LLMs (Ollama / Qwen 2.5)</span>
                    <span>RAG (Hybrid BM25 + TF-IDF)</span>
                    <span>Next.js 14 & React 18</span>
                    <span>Docker & CI/CD</span>
                  </div>
                </div>

                <div className="paper-section">
                  <h4 className="paper-heading">HONORS & RECOGNITIONS</h4>
                  <p className="paper-text">
                    • 3rd Position (Bronze Medal) — Odisha Skills Competition (Cyber Security · 2025–2026)
                    <br />• 3rd Position (Bronze Medal) — Odisha Skills Competition (Cyber Security · 2020–2021)
                    <br />• BRICS Hi-Tech International Future Skills Development Session (2026)
                  </p>
                </div>
              </div>

              <div className="paper-tearoff-tray">
                <a
                  href={profile.resume}
                  download="Sadashiba_Sarangi_Resume.pdf"
                  className="paper-download-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={14} />
                  <span>Download Laser-Printed PDF Document ({profile.resumeFilename})</span>
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
                      <span className="ch-tag">CHANNEL 01 · DIRECT EMAIL</span>
                      <strong className="ch-val">{profile.email}</strong>
                    </div>
                    <Send size={12} className="ch-arrow" />
                  </a>

                  <a
                    href={`tel:${profile.tel || '+918917512439'}`}
                    className="console-channel-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="channel-icon-wrap">
                      <PhoneCall size={16} />
                    </div>
                    <div className="channel-info">
                      <span className="ch-tag">CHANNEL 02 · SECURE VOICE / WHATSAPP</span>
                      <strong className="ch-val">{profile.phone}</strong>
                    </div>
                    <ExternalLink size={12} className="ch-arrow" />
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
                      <span className="ch-tag">CHANNEL 03 · GITHUB REPOSITORIES</span>
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
                      <span className="ch-tag">CHANNEL 04 · PROFESSIONAL LINKEDIN</span>
                      <strong className="ch-val">linkedin.com/in/sadashiba-sarangi</strong>
                    </div>
                    <ExternalLink size={12} className="ch-arrow" />
                  </a>

                  <div
                    className="console-channel-btn console-channel-discord"
                    onClick={handleCopyDiscord}
                    style={{ cursor: 'pointer', border: '1px solid rgba(129, 140, 248, 0.4)', background: 'rgba(99, 102, 241, 0.08)' }}
                    title="Click to copy Discord handle"
                  >
                    <div className="channel-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#a5b4fc' }}>
                      <MessageSquare size={16} />
                    </div>
                    <div className="channel-info">
                      <span className="ch-tag" style={{ color: '#818cf8' }}>CHANNEL 05 · DISCORD OPS RELAY</span>
                      <strong className="ch-val" style={{ color: '#e0e7ff' }}>@{profile.discord || 'mr.whitehat'}</strong>
                    </div>
                    {copiedDiscord ? (
                      <span style={{ fontSize: '9px', color: '#4ade80', fontWeight: 800, padding: '2px 6px', background: 'rgba(74, 222, 128, 0.15)', borderRadius: '4px' }}>COPIED!</span>
                    ) : (
                      <Copy size={12} className="ch-arrow" style={{ color: '#818cf8' }} />
                    )}
                  </div>
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

          {/* 7. MRWHITEHAT // OPERATIVE HOLOGRAPHIC DOSSIER */}
          {activeSection === 'operator' && (
            <div className="operative-dossier-terminal">
              <div className="operative-hud-header">
                <div className="operative-callsign-box">
                  <div className="callsign-radar-blip" />
                  <div>
                    <span className="callsign-level">SEC-CLEARANCE LEVEL 5 // ACTIVE CYBER OPERATIVE</span>
                    <h2 className="callsign-title">
                      CALLSIGN: <span className="callsign-highlight">MrWhiteHat</span>
                    </h2>
                    <span className="callsign-legal">
                      OPERATIVE: {profile.name} · {profile.location}
                    </span>
                  </div>
                </div>
                <div className="operative-badge-pill">
                  <Terminal size={14} />
                  <span>RED TEAM / APPSEC / AI SECURITY</span>
                </div>
              </div>

              <div className="operative-grid-layout">
                {/* A. DISCORD OPS CHANNEL CARD */}
                <div className="operative-card discord-ops-card">
                  <div className="card-top-tag">
                    <MessageSquare size={13} style={{ color: '#818cf8' }} />
                    <span style={{ color: '#818cf8' }}>CHANNEL // DISCORD FREQUENCY</span>
                    <span className="live-status-pill">ACTIVE RELAY</span>
                  </div>
                  <div className="discord-user-display">
                    <div className="discord-avatar-ring">
                      <span className="discord-glyph">🎮</span>
                    </div>
                    <div className="discord-user-meta">
                      <span className="discord-tag-label">VERIFIED DISCORD HANDLE</span>
                      <strong className="discord-username">@{profile.discord || 'mr.whitehat'}</strong>
                      <span className="discord-subtext">Direct messaging, technical collaboration & CTF coordination</span>
                    </div>
                  </div>
                  <div className="discord-actions-group">
                    <button
                      type="button"
                      className={`discord-copy-btn ${copiedDiscord ? 'copied' : ''}`}
                      onClick={handleCopyDiscord}
                      title="Copy Discord username"
                    >
                      {copiedDiscord ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedDiscord ? 'Handle Copied!' : 'Copy Discord Username'}</span>
                    </button>
                    <a
                      href={profile.discordUrl || 'https://discord.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="discord-link-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Open Discord</span>
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>

                {/* B. UNIVERSITY CYBER CLUB LEADERSHIP CARD */}
                <div className="operative-card leadership-ops-card">
                  <div className="card-top-tag">
                    <GraduationCap size={13} style={{ color: '#fbbf24' }} />
                    <span style={{ color: '#fbbf24' }}>UNIVERSITY LEADERSHIP // STUDENT COORDINATOR</span>
                    <span className="cgu-tag">CGU BHUBANESWAR</span>
                  </div>
                  <div className="leadership-content-block">
                    <h3 className="leadership-title">
                      Cyber Security Club Tech Lead & Student Coordinator
                    </h3>
                    <div className="leadership-org">
                      C.V. Raman Global University (CGU) · 2023 – Present
                    </div>
                    <ul className="leadership-points">
                      <li>
                        <span className="lead-bullet" />
                        <span>Organized and led hands-on cybersecurity workshops for <strong>200+ students</strong> covering Web Application Penetration Testing (OWASP Top 10), Network Forensics, and Linux privilege escalation.</span>
                      </li>
                      <li>
                        <span className="lead-bullet" />
                        <span>Mentored student cohorts in CTF challenges, traffic packet forensics with Wireshark, secure coding practices, and vulnerability assessment.</span>
                      </li>
                      <li>
                        <span className="lead-bullet" />
                        <span>Spearheaded university participation in regional, state, and national cybersecurity competitions and defense simulations.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* C. RECRUITER CLEARANCE & CAREER AVAILABILITY CARD */}
                <div className="operative-card recruiter-ops-card">
                  <div className="card-top-tag">
                    <BriefcaseBusiness size={13} style={{ color: '#4ade80' }} />
                    <span style={{ color: '#4ade80' }}>RECRUITER BRIEFING // CAREER CLEARANCE</span>
                    <span className="recruiter-status-pill">AVAILABLE FOR HIRE</span>
                  </div>
                  <div className="recruiter-content-block">
                    <div className="recruiter-role-list">
                      <span className="recruiter-spec-badge">AppSec Engineer</span>
                      <span className="recruiter-spec-badge">Penetration Tester</span>
                      <span className="recruiter-spec-badge">Security Software Dev</span>
                      <span className="recruiter-spec-badge">AI Red Teaming</span>
                    </div>
                    <div className="recruiter-details-row">
                      <div className="recruiter-item">
                        <span className="r-label">AVAILABILITY TIMEFRAME</span>
                        <strong className="r-value">Summer 2025 & 2026 Internships / Full-Time</strong>
                      </div>
                      <div className="recruiter-item">
                        <span className="r-label">MOBILITY & WORK MODE</span>
                        <strong className="r-value">Remote · Hybrid · On-site (India & Global)</strong>
                      </div>
                    </div>
                    <div className="recruiter-cta-row">
                      <a
                        href={`mailto:${profile.email}?subject=Opportunity%20Inquiry%20for%20Sadashiba%20Sarangi`}
                        className="recruiter-cta-email"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail size={13} />
                        <span>Contact Directly ({profile.email})</span>
                        <Send size={11} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="operative-bottom-manifesto">
                <Shield size={13} style={{ color: '#38bdf8' }} />
                <span>
                  <strong>OPERATIVE MISSION:</strong> Proactive defense through adversarial mindset. Engineering autonomous security pipelines, reverse-engineering mobile attack surfaces, and building privacy-preserving resilient architectures.
                </span>
              </div>
            </div>
          )}

          {/* 8. 42U MAINFRAME SERVER RACK DOSSIER */}
          {activeSection === 'server_rack' && (
            <div className="mainframe-dossier-terminal">
              <div className="operative-hud-header mainframe-hud-header">
                <div className="operative-callsign-box">
                  <div className="callsign-radar-blip blip-red" />
                  <div>
                    <span className="callsign-level">42U HARDENED BARE-METAL INFRASTRUCTURE // HIGH DENSITY</span>
                    <h2 className="callsign-title">
                      CLUSTER: <span className="callsign-highlight" style={{ color: '#f87171' }}>SENTINEL-NODE-01</span>
                    </h2>
                    <span className="callsign-legal">
                      ORCHESTRATION: PROXMOX VE 8.1 · KUBERNETES · WAZUH SIEM · SURICATA IDS
                    </span>
                  </div>
                </div>
                <div className="operative-badge-pill" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)' }}>
                  <Server size={14} style={{ color: '#f87171' }} />
                  <span style={{ color: '#fca5a5' }}>UPTIME: 412d 14h (99.98%)</span>
                </div>
              </div>

              <div className="mainframe-metrics-row">
                <div className="m-metric-chip">
                  <span className="mm-lbl">CPU UTILIZATION</span>
                  <strong className="mm-val" style={{ color: '#4ade80' }}>18.4% (32 CORES)</strong>
                </div>
                <div className="m-metric-chip">
                  <span className="mm-lbl">ECC RAM POOL</span>
                  <strong className="mm-val" style={{ color: '#38bdf8' }}>48.2 GB / 128 GB</strong>
                </div>
                <div className="m-metric-chip">
                  <span className="mm-lbl">STORAGE ZFS RAID10</span>
                  <strong className="mm-val" style={{ color: '#fbbf24' }}>3.8 TB / 16.0 TB</strong>
                </div>
                <div className="m-metric-chip">
                  <span className="mm-lbl">SFP+ 10GbE UPLINK</span>
                  <strong className="mm-val" style={{ color: '#f472b6' }}>4.8 Gbps TX / 1.2 Gbps RX</strong>
                </div>
              </div>

              <div className="operative-grid-layout">
                {/* 1. Proxmox & K8s Cluster */}
                <div className="operative-card">
                  <div className="card-top-tag">
                    <Cpu size={13} style={{ color: '#38bdf8' }} />
                    <span style={{ color: '#38bdf8' }}>VIRTUALIZATION & CONTAINERS // PROXMOX VE</span>
                    <span className="live-status-pill">32 INSTANCES</span>
                  </div>
                  <div className="cluster-nodes-list">
                    <div className="c-node-item">
                      <span className="c-dot" />
                      <div className="c-node-info">
                        <strong>pve-node-alpha (Core Hypervisor)</strong>
                        <span>Dual Xeon E5-2690 v4 · 64GB RAM · Debian Hardened Kernel 6.5</span>
                      </div>
                      <span className="c-node-badge">PROD</span>
                    </div>
                    <div className="c-node-item">
                      <span className="c-dot" />
                      <div className="c-node-info">
                        <strong>k8s-cyber-grid (Worker Cluster)</strong>
                        <span>Falco Kernel Runtime Security · Cilium eBPF Network Mesh</span>
                      </div>
                      <span className="c-node-badge">ACTIVE</span>
                    </div>
                    <div className="c-node-item">
                      <span className="c-dot" />
                      <div className="c-node-info">
                        <strong>honeynet-dmz-sentinel (Deception Network)</strong>
                        <span>Cowrie SSH Traps + Dionaea Malware Emulation sandbox</span>
                      </div>
                      <span className="c-node-badge">TRAP</span>
                    </div>
                  </div>
                </div>

                {/* 2. SIEM & Threat Defense Services */}
                <div className="operative-card">
                  <div className="card-top-tag">
                    <ShieldAlert size={13} style={{ color: '#f87171' }} />
                    <span style={{ color: '#f87171' }}>SECURITY OPERATIONS // WAZUH SIEM & IDS</span>
                    <span className="live-status-pill" style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>SURICATA ACTIVE</span>
                  </div>
                  <div className="cluster-nodes-list">
                    <div className="c-node-item">
                      <span className="c-dot" style={{ background: '#f87171' }} />
                      <div className="c-node-info">
                        <strong>Wazuh SIEM Manager + OpenSearch</strong>
                        <span>1.2M events/day · Real-time PCI-DSS / HIPAA rule matching</span>
                      </div>
                    </div>
                    <div className="c-node-item">
                      <span className="c-dot" style={{ background: '#f87171' }} />
                      <div className="c-node-info">
                        <strong>Suricata Deep Packet Inspection IDS/IPS</strong>
                        <span>EmergingThreats rule signatures + automated IP null-routing</span>
                      </div>
                    </div>
                    <div className="c-node-item">
                      <span className="c-dot" style={{ background: '#f87171' }} />
                      <div className="c-node-info">
                        <strong>Vaultwarden KMS & Zero-Trust Mesh</strong>
                        <span>WireGuard & Tailscale encrypted transit mesh between microservices</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. TACTICAL RED TEAM HARDWARE ARSENAL DOSSIER */}
          {activeSection === 'hardware_arsenal' && (
            <div className="arsenal-dossier-terminal">
              <div className="operative-hud-header arsenal-hud-header">
                <div className="operative-callsign-box">
                  <div className="callsign-radar-blip blip-orange" />
                  <div>
                    <span className="callsign-level">PHYSICAL OFFENSIVE CYBER GEAR // TACTICAL FIELD ARSENAL</span>
                    <h2 className="callsign-title">
                      ARSENAL: <span className="callsign-highlight" style={{ color: '#fb923c' }}>HAK5 & RF PEN-TEST SUITE</span>
                    </h2>
                    <span className="callsign-legal">
                      FIELD READINESS: SUB-GHZ · 802.11 DUAL-BAND · NFC/RFID · HARDWARE KEYLOGGING
                    </span>
                  </div>
                </div>
                <div className="operative-badge-pill" style={{ borderColor: 'rgba(249, 115, 22, 0.4)', background: 'rgba(249, 115, 22, 0.1)' }}>
                  <Radio size={14} style={{ color: '#fb923c' }} />
                  <span style={{ color: '#fdba74' }}>6 TOOLS ARMED & MOUNTED</span>
                </div>
              </div>

              <div className="arsenal-tools-showcase">
                {[
                  {
                    name: 'Hak5 WiFi Pineapple Mark VII',
                    tag: '802.11ac / PineAP Suite',
                    color: '#fb923c',
                    desc: 'Rogue AP deployment, automated Karma attack, EAPOL handshake harvesting, and passive Wi-Fi reconnaissance across 2.4/5GHz spectrum.',
                    specs: 'Dual Band · PineAP Engine · Enterprise WPA3 Recon · USB-C Tether',
                    cmd: 'pineap --karma --deauth --handshakes-auto /loot/pcap',
                  },
                  {
                    name: 'Flipper Zero + ESP32 Marauder',
                    tag: 'Sub-GHz / BadUSB / NFC',
                    color: '#38bdf8',
                    desc: 'Multi-tool device for researching radio protocols, access control systems, hardware debugging, Sub-GHz replay (300-928 MHz), and BadUSB Ducky payloads.',
                    specs: 'CC1101 Transceiver · 125kHz RFID · 13.56MHz NFC · BadUSB Emulation',
                    cmd: 'flipper-cli subghz tx_raw --freq 433920000 /ext/gate_key.sub',
                  },
                  {
                    name: 'Proxmark3 RDV4.01',
                    tag: 'RFID / NFC Deep Research',
                    color: '#a855f7',
                    desc: 'The gold standard in RFID/NFC security auditing. Supports FPGA-driven high/low frequency sniffing, cloning, emulation, and cryptographic cracking of MIFARE & HID iCLASS.',
                    specs: 'LF (125/134 kHz) · HF (13.56 MHz) · FPGA Signal Processing · Dual Antennas',
                    cmd: 'hf mf autopwn --dump /root/loot/mifare_classic_dump.bin',
                  },
                  {
                    name: 'Alfa AWUS036ACM 802.11ac Adapter',
                    tag: 'Packet Injection Adapter',
                    color: '#4ade80',
                    desc: 'High-gain dual-band Wi-Fi network interface card with high TX power. Optimized for monitor mode, beacon frame injection, and aircrack-ng operations.',
                    specs: 'MediaTek MT7612U · 2x RP-SMA 5dBi Antennas · Monitor Mode Verified',
                    cmd: 'airmon-ng start wlan0 && airodump-ng wlan0mon --channel 6',
                  },
                  {
                    name: 'USB Rubber Ducky (DuckyScript 3.0)',
                    tag: 'HID Keystroke Injector',
                    color: '#facc15',
                    desc: 'Disguised USB flash drive operating as a 1000 WPM virtual human keyboard. Stages memory-only PowerShell payloads, circumvents UAC, and exfiltrates target credentials.',
                    specs: 'Quad-Core 32-bit SoC · Arming Switch · MicroSD Loot Storage · OS Fingerprinting',
                    cmd: 'STRING powershell -ep bypass -w hidden -c "IEX (New-Object Net.WebClient)..."',
                  },
                  {
                    name: 'Great Scott Gadgets Ubertooth One',
                    tag: '2.4 GHz Bluetooth Sniffer',
                    color: '#f43f5e',
                    desc: 'Open source 2.4 GHz wireless development platform suitable for Bluetooth experimentation. Sniffs BLE advertisements and hops through piconet frequency channels.',
                    specs: 'LPC175x ARM Cortex-M3 · CC2591 RF Front End · Wireshark BLE Plugin',
                    cmd: 'ubertooth-btle -f -c /tmp/ble_traffic_dump.pcap',
                  },
                ].map((tool, idx) => (
                  <div key={idx} className="arsenal-tool-card">
                    <div className="at-card-header">
                      <span className="at-card-title">{tool.name}</span>
                      <span className="at-card-tag" style={{ color: tool.color, borderColor: tool.color }}>{tool.tag}</span>
                    </div>
                    <p className="at-card-desc">{tool.desc}</p>
                    <div className="at-card-specs">
                      <span className="at-spec-label">SPECS:</span> {tool.specs}
                    </div>
                    <div className="at-card-cmd">
                      <code>$ {tool.cmd}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. INDUSTRIAL ULTRA-WIDESCREEN WIRESHARK MONITOR DOSSIER */}
          {activeSection === 'wireshark_monitor' && (
            <div className="pcap-dossier-terminal">
              <div className="operative-hud-header pcap-hud-header">
                <div className="operative-callsign-box">
                  <div className="callsign-radar-blip blip-cyan" />
                  <div>
                    <span className="callsign-level">INDUSTRIAL ULTRA-WIDESCREEN TELEMETRY // REAL-TIME PCAP</span>
                    <h2 className="callsign-title">
                      INTERFACE: <span className="callsign-highlight" style={{ color: '#06b6d4' }}>eth0 // PROMISCUOUS_SNIFF</span>
                    </h2>
                    <span className="callsign-legal">
                      DEEP PACKET INSPECTION · FLOW ANOMALY HEURISTICS · WIRESHARK 4.2 ENGINE
                    </span>
                  </div>
                </div>
                <div className="operative-badge-pill" style={{ borderColor: 'rgba(6, 182, 212, 0.4)', background: 'rgba(6, 182, 212, 0.1)' }}>
                  <Activity size={14} style={{ color: '#06b6d4' }} />
                  <span style={{ color: '#67e8f9' }}>PCAP STREAM: LIVE (0 DROPPED)</span>
                </div>
              </div>

              <div className="pcap-live-stream-table">
                <div className="pcap-table-header">
                  <span className="col-time">TIME</span>
                  <span className="col-proto">PROTO</span>
                  <span className="col-src">SOURCE</span>
                  <span className="col-dst">DESTINATION</span>
                  <span className="col-len">LEN</span>
                  <span className="col-info">INFO SUMMARY</span>
                </div>
                <div className="pcap-stream-body">
                  {[
                    { time: '0.000000', proto: 'TLSv1.3', src: '192.168.1.105', dst: '142.250.190.46:443', len: '517', info: 'Client Hello, SNI=api.github.com, Cipher=TLS_AES_256_GCM_SHA384' },
                    { time: '0.001240', proto: 'DNS', src: '192.168.1.105', dst: '1.1.1.1:53', len: '78', info: 'Standard query 0x8a1b A auth.mrwhitehat.dev' },
                    { time: '0.001890', proto: 'DNS', src: '1.1.1.1:53', dst: '192.168.1.105', len: '94', info: 'Standard query response 0x8a1b A 104.21.72.18' },
                    { time: '0.004120', proto: 'SSHv2', src: '192.168.1.42', dst: '192.168.1.10:22', len: '108', info: 'Encrypted packet (len=76) [SSH_MSG_CHANNEL_DATA]' },
                    { time: '0.008450', proto: 'HTTP/2', src: '192.168.1.105', dst: '172.217.16.206:443', len: '184', info: 'HEADERS frame: status=200 OK, path=/v1/security/telemetry' },
                    { time: '0.012300', proto: 'TCP', src: '192.168.1.105:51240', dst: '10.0.0.1:443', len: '66', info: '51240 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0' },
                    { time: '0.015600', proto: 'ARP', src: 'Intel_4c:89:12', dst: 'Broadcast', len: '42', info: 'Who has 192.168.1.1? Tell 192.168.1.105' },
                    { time: '0.019800', proto: 'ICMP', src: '192.168.1.105', dst: '8.8.8.8', len: '98', info: 'Echo (ping) request id=0x0001, seq=1/256, ttl=64' },
                  ].map((pkt, i) => (
                    <div key={i} className={`pcap-stream-row ${pkt.proto.toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
                      <span className="col-time">{pkt.time}</span>
                      <span className={`col-proto proto-tag ${pkt.proto.toLowerCase().replace(/[^a-z0-9]/g, '')}`}>{pkt.proto}</span>
                      <span className="col-src">{pkt.src}</span>
                      <span className="col-dst">{pkt.dst}</span>
                      <span className="col-len">{pkt.len}</span>
                      <span className="col-info">{pkt.info}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pcap-hex-inspection-drawer">
                <div className="hex-header">
                  <Terminal size={12} style={{ color: '#06b6d4' }} />
                  <span>SELECTED FRAME DUMP // PACKET #1 [TLS 1.3 CLIENT HELLO]</span>
                </div>
                <pre className="hex-dump-code">
{`0000   00 50 56 c0 00 08 00 0c 29 3b 1a 4e 08 00 45 00   .PV.....);.N..E.
0010   02 05 a1 2c 40 00 40 06 c3 89 c0 a8 01 69 8e fa   ...,@.@......i..
0020   be 2e c8 28 01 bb 4c 19 82 e1 9f 74 12 a0 80 18   ...(..L....t....
0030   01 f5 3d 7a 00 00 01 01 08 0a 41 db 8a 22 00 00   ..=z......A.."..
0040   16 03 01 01 cd 01 00 01 c9 03 03 82 a7 df 91 1b   ................
0050   68 e4 9f 53 2a 12 b4 89 2a 3f 8c 47 18 9b c3 40   h..S*...*?.G...@`}
                </pre>
              </div>
            </div>
          )}

          {/* 11. CTOS SECURITY VISITOR MANIFEST & ACCESS ROSTER */}
          {activeSection === 'visitor_log' && (
            <VisitorLogDisplay
              logs={visitorLogs}
              visitorCount={visitorCount}
              activeOperative={playerData}
              onClose={onClose}
            />
          )}
          </>
        )}
      </div>
    </Html>
  </group>
);
}
