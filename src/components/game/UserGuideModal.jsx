import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crosshair,
  Fan,
  HelpCircle,
  Laptop,
  Maximize2,
  Monitor,
  MousePointer,
  Move,
  Pause,
  Play,
  RotateCcw,
  Shield,
  ShieldCheck,
  Smartphone,
  Snowflake,
  Sparkles,
  Terminal,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { playClickSound, playWhooshSound, playHackingBeep } from '../../utils/audio.js';

const CHAPTERS = [
  {
    id: 'pc_controls',
    title: 'PC Controls & Mouse Look',
    badge: 'DESKTOP · KEYBOARD & MOUSE',
    icon: Laptop,
    duration: 9,
    summary: 'Explore freely with 1:1 first-person mouse look and snappy WASD locomotion.',
    highlights: [
      { key: 'W / A / S / D', label: 'Walk Forward / Left / Back / Right' },
      { key: 'MOUSE', label: 'Look 360° (Click 3D scene to lock pointer)' },
      { key: 'CLICK / E', label: 'Hack / Interact with nearby terminals' },
      { key: 'SHIFT', label: 'Sprint & Tactical Run' },
      { key: 'F', label: 'Toggle Full Screen mode' },
      { key: 'ESC', label: 'Release mouse pointer / Return to menu' },
    ],
    tips: 'Click anywhere inside the 3D office to lock your pointer for instant 1:1 camera aim. Press [Esc] anytime to release.',
  },
  {
    id: 'mobile_controls',
    title: 'Mobile & Tablet Touchpad',
    badge: 'SMARTPHONE · TOUCHSCREEN',
    icon: Smartphone,
    duration: 9,
    summary: 'Fluid dual-thumb mobile controls engineered for smooth 60–120 FPS performance.',
    highlights: [
      { key: 'LEFT THUMB', label: 'Virtual Analog Joystick for 360° fluid walking' },
      { key: 'RIGHT THUMB', label: 'Swipe and drag screen to look around freely' },
      { key: '⚡ HACK [E]', label: 'Tap the green action button near any station' },
      { key: '⛶ FULLSCREEN', label: 'Tap the floating top-right pill to hide address bars' },
      { key: 'MODE SWITCH', label: 'Toggle between analog Stick or WASD keypad anytime' },
    ],
    tips: 'Works in both Portrait and Landscape. Tap the top-right [ ⛶ FULLSCREEN ] button for an immersive, edge-to-edge full screen experience.',
  },
  {
    id: 'stations',
    title: '11 Interactive Cyber Stations',
    badge: 'SECURITY DOSSIERS · APPS',
    icon: Terminal,
    duration: 9,
    summary: 'Walk up to physical 3D objects across the office. A green reticle and prompt will appear.',
    highlights: [
      { key: 'PROJECTS', label: 'Workstation screens — live playable code demos' },
      { key: 'SKILLS', label: 'Archive bookcase — interactive proficiency matrix' },
      { key: 'AWARDS', label: 'Trophy showcase — CTF medals & achievements' },
      { key: 'RESUME', label: 'Laser printer tray — inspect & download verified PDF' },
      { key: 'WIRESHARK', label: 'Ultra-widescreen — live packet capture & hex dump' },
      { key: 'HARDWARE', label: 'Red-team arsenal — Proxmark3, Rubber Ducky, Alfa' },
      { key: 'MAINFRAME', label: 'Back server rack — high-density server telemetry' },
      { key: 'CONTACT', label: 'Desk intercom — email & Discord connect' },
    ],
    tips: 'When you approach any station within 3.5 meters, your center crosshair locks green. Click or press [E] to inspect the dossier.',
  },
  {
    id: 'appliances',
    title: 'Working Appliances & Themes',
    badge: 'SMART OFFICE · ATMOSPHERE',
    icon: Snowflake,
    duration: 9,
    summary: 'The studio is fully interactive. Control physical appliances and lighting atmosphere.',
    highlights: [
      { key: '❄️ AC UNIT', label: 'Working 18°C Air Conditioner on front wall — toggle on/off' },
      { key: '🌀 CEILING FAN', label: 'Rotary ceiling fan — toggle spin on/off' },
      { key: '💡 LIGHTS', label: 'Overhead crimson neon, Edison lamp & floor lamp' },
      { key: '✨ ATMOSPHERE', label: 'Press [T] or tap Theme pill to cycle 5 color atmospheres' },
      { key: '🔊 AUDIO', label: 'Toggle ambient server hum and sound effects [M]' },
    ],
    tips: 'You can toggle appliances directly from the quick top HUD buttons or walk up to them and press [E] in the 3D room.',
  },
  {
    id: 'visitor_system',
    title: 'Visitor Wall & Real Telemetry',
    badge: 'CTOS ACCESS · LIVE SYNC',
    icon: Users,
    duration: 9,
    summary: '100% real, authentic visitor tracking with live cloud counter and genuine client telemetry.',
    highlights: [
      { key: '3D WALL LED', label: 'Live 6-digit LED scoreboard on right wall shows real count' },
      { key: 'RECENT ENTRANT', label: 'Shows real visitor name, city, country flag & check-in time' },
      { key: 'ACCESS LOGS', label: 'Inspect full manifest with name/location search and filtering' },
      { key: 'YOUR TELEMETRY', label: 'Captures real hardware (OS, display resolution, CPU cores)' },
      { key: 'GLOBAL SYNC', label: 'Synchronized in real-time across users worldwide' },
    ],
    tips: 'Inspect the right wall terminal anytime by pressing [E] or clicking the visitor count pill in the top HUD.',
  },
];

export default function UserGuideModal({ isOpen, onClose, onEnterOffice }) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const currentChapter = CHAPTERS[activeChapterIndex];

  // Auto-play timer simulating a video timeline
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const intervalMs = 100;
    const totalMs = currentChapter.duration * 1000;
    const stepPercent = (intervalMs / totalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next chapter
          setActiveChapterIndex((idx) => {
            const nextIdx = (idx + 1) % CHAPTERS.length;
            return nextIdx;
          });
          return 0;
        }
        return prev + stepPercent;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentChapter, activeChapterIndex]);

  const handleSelectChapter = (index) => {
    playClickSound(1000);
    setActiveChapterIndex(index);
    setProgress(0);
  };

  const handleTogglePlay = () => {
    playClickSound(800);
    setIsPlaying((prev) => !prev);
  };

  const handlePrev = () => {
    playWhooshSound();
    setActiveChapterIndex((prev) => (prev > 0 ? prev - 1 : CHAPTERS.length - 1));
    setProgress(0);
  };

  const handleNext = () => {
    playWhooshSound();
    setActiveChapterIndex((prev) => (prev < CHAPTERS.length - 1 ? prev + 1 : 0));
    setProgress(0);
  };

  if (!isOpen) return null;

  const ChapterIcon = currentChapter.icon;

  return (
    <div className="user-guide-overlay" onClick={onClose}>
      <div
        className="user-guide-card video-style-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. TOP VIDEO HEADER */}
        <div className="ug-header">
          <div className="ug-header-tag">
            <div className="ug-live-dot" />
            <Terminal size={14} />
            <span>OPERATIONAL BRIEFING // HOW TO EXPLORE & PLAY</span>
          </div>

          <div className="ug-header-actions">
            <button
              type="button"
              className={`ug-play-toggle-btn ${isPlaying ? 'is-playing' : ''}`}
              onClick={handleTogglePlay}
              title={isPlaying ? 'Pause Auto-Play' : 'Play Video Tour'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} fill="currentColor" />}
              <span>{isPlaying ? 'AUTO PLAYING' : 'PAUSED'}</span>
            </button>

            <button
              type="button"
              className="ug-close-btn"
              onClick={() => {
                playClickSound(700);
                onClose();
              }}
              title="Close Guide (Esc)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* 2. SIMULATED VIDEO PLAYER SCREEN */}
        <div className="ug-player-screen">
          {/* Top Video Status Overlay */}
          <div className="ug-video-hud-overlay">
            <div className="ug-rec-badge">
              <span className="ug-rec-dot" />
              <span>REC 1080P // SIMULATED 3D FEED</span>
            </div>
            <div className="ug-chapter-indicator">
              <span>CHAPTER 0{activeChapterIndex + 1} / 0{CHAPTERS.length}</span>
              <strong className="ug-chapter-chip">{currentChapter.badge}</strong>
            </div>
          </div>

          {/* Interactive Visual Stage depending on selected Chapter */}
          <div className="ug-visual-stage">
            {/* Chapter 1: PC Controls Visualizer */}
            {currentChapter.id === 'pc_controls' && (
              <div className="ug-sim-pc-scene">
                <div className="ug-keys-cluster">
                  <div className="ug-wasd-row-top">
                    <div className="ug-sim-key ug-key-w is-lit">
                      <span>W</span>
                      <small>FORWARD</small>
                    </div>
                  </div>
                  <div className="ug-wasd-row-mid">
                    <div className="ug-sim-key ug-key-a is-lit">
                      <span>A</span>
                      <small>LEFT</small>
                    </div>
                    <div className="ug-sim-key ug-key-s">
                      <span>S</span>
                      <small>BACK</small>
                    </div>
                    <div className="ug-sim-key ug-key-d is-lit">
                      <span>D</span>
                      <small>RIGHT</small>
                    </div>
                  </div>
                  <div className="ug-keys-row-bottom">
                    <div className="ug-sim-key ug-key-shift is-lit">
                      <span>SHIFT</span>
                      <small>SPRINT</small>
                    </div>
                    <div className="ug-sim-key ug-key-e is-action">
                      <span>E</span>
                      <small>HACK</small>
                    </div>
                    <div className="ug-sim-key ug-key-f">
                      <span>F</span>
                      <small>FULLSCREEN</small>
                    </div>
                  </div>
                </div>

                <div className="ug-mouse-sim-box">
                  <div className="ug-mouse-icon-wrap">
                    <MousePointer size={24} className="ug-mouse-cursor-pulse" />
                    <div className="ug-mouse-reticle">
                      <Crosshair size={32} />
                    </div>
                  </div>
                  <span className="ug-sim-label">360° POINTER-LOCK LOOK</span>
                  <small className="ug-sim-sublabel">Click anywhere in 3D to lock mouse aim</small>
                </div>
              </div>
            )}

            {/* Chapter 2: Mobile Controls Visualizer */}
            {currentChapter.id === 'mobile_controls' && (
              <div className="ug-sim-mobile-scene">
                <div className="ug-phone-mockup">
                  <div className="ug-phone-notch" />

                  {/* Left Touch Joystick */}
                  <div className="ug-phone-left-touch">
                    <div className="ug-mock-stick-base">
                      <div className="ug-mock-stick-knob is-animated-stick" />
                    </div>
                    <span className="ug-touch-hint">LEFT THUMB · 360° JOYSTICK</span>
                  </div>

                  {/* Center HUD crosshair */}
                  <div className="ug-phone-center-aim">
                    <div className="ug-mini-crosshair" />
                  </div>

                  {/* Right Touch Look & Actions */}
                  <div className="ug-phone-right-touch">
                    <div className="ug-swipe-arrow-indicator">
                      <span>⇄ SWIPE TO LOOK</span>
                    </div>
                    <div className="ug-mock-hack-btn">
                      <Zap size={14} />
                      <span>HACK [E]</span>
                    </div>
                    <span className="ug-touch-hint">RIGHT THUMB · AIM & INTERACT</span>
                  </div>

                  <div className="ug-phone-fs-pill">
                    <Maximize2 size={10} />
                    <span>FULLSCREEN</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 3: Stations Visualizer */}
            {currentChapter.id === 'stations' && (
              <div className="ug-sim-stations-scene">
                <div className="ug-station-radar-grid">
                  <div className="ug-radar-sweep" />
                  <div className="ug-station-blip blip-active" style={{ top: '25%', left: '30%' }}>
                    <span>PROJECTS</span>
                  </div>
                  <div className="ug-station-blip" style={{ top: '65%', left: '20%' }}>
                    <span>WIRESHARK</span>
                  </div>
                  <div className="ug-station-blip" style={{ top: '35%', right: '25%' }}>
                    <span>VISITOR LOG</span>
                  </div>
                  <div className="ug-station-blip" style={{ bottom: '20%', right: '35%' }}>
                    <span>ARSENAL</span>
                  </div>
                  <div className="ug-center-operative-dot" />
                </div>

                <div className="ug-prompt-demo-card">
                  <div className="ug-demo-prompt-keys">
                    <span>CLICK</span>
                    <span className="ug-sep">/</span>
                    <span className="ug-key-badge">E</span>
                  </div>
                  <div className="ug-demo-prompt-text">
                    <strong>APPROACH TERMINAL TO 3.5M</strong>
                    <small>Dossier inspect opens with real code, specs & live tools</small>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 4: Appliances & Themes */}
            {currentChapter.id === 'appliances' && (
              <div className="ug-sim-appliances-scene">
                <div className="ug-appliance-showcase-grid">
                  <div className="ug-appliance-card is-ac">
                    <div className="ug-app-icon">
                      <Snowflake size={22} className="ug-snow-spin" />
                    </div>
                    <strong>AIR CONDITIONER</strong>
                    <span>18°C ❄️ Cool Air Breeze Toggle</span>
                  </div>

                  <div className="ug-appliance-card is-fan">
                    <div className="ug-app-icon">
                      <Fan size={22} className="ug-fan-spin" />
                    </div>
                    <strong>CEILING FAN</strong>
                    <span>Spinning Aerodynamic Blade</span>
                  </div>

                  <div className="ug-appliance-card is-theme">
                    <div className="ug-app-icon">
                      <Sparkles size={22} />
                    </div>
                    <strong>ATMOSPHERE [T]</strong>
                    <span>5 Lighting Modes (Matrix, Neon, Ice...)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chapter 5: Real Visitor Manifest */}
            {currentChapter.id === 'visitor_system' && (
              <div className="ug-sim-visitor-scene">
                <div className="ug-wall-scoreboard-mock">
                  <span className="ug-wall-title">TOTAL VERIFIED VISITORS</span>
                  <strong className="ug-wall-num"># 000008</strong>
                  <div className="ug-wall-entrant-row">
                    <span className="ug-entrant-tag">RECENT:</span>
                    <strong className="ug-entrant-name">YOU (CURRENT SESSION)</strong>
                    <span className="ug-entrant-geo">🇮🇳 VERIFIED LOCATION & HARDWARE</span>
                  </div>
                </div>
                <div className="ug-telemetry-badge-row">
                  <span className="ug-badge-item">📍 Real Geolocation</span>
                  <span className="ug-badge-item">💻 Device & Resolution</span>
                  <span className="ug-badge-item">⚡ CPU Cores & Memory</span>
                </div>
              </div>
            )}
          </div>

          {/* Video Timeline Scrubber Bar */}
          <div className="ug-timeline-bar-wrap" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
            setProgress(pct);
          }}>
            <div className="ug-timeline-bar-track">
              <div className="ug-timeline-bar-fill" style={{ width: `${progress}%` }} />
              <div className="ug-timeline-knob" style={{ left: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* 3. CHAPTER DETAILS PANE */}
        <div className="ug-details-pane">
          <div className="ug-details-title-row">
            <div className="ug-title-icon-box">
              <ChapterIcon size={18} />
            </div>
            <div>
              <h3 className="ug-chapter-title">{currentChapter.title}</h3>
              <p className="ug-chapter-summary">{currentChapter.summary}</p>
            </div>
          </div>

          {/* Key Bindings / Highlights Grid */}
          <div className="ug-highlights-grid">
            {currentChapter.highlights.map((item, idx) => (
              <div key={idx} className="ug-highlight-chip">
                <span className="ug-key-tag">{item.key}</span>
                <span className="ug-key-desc">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Tactical Pro-Tip */}
          <div className="ug-pro-tip-box">
            <span className="ug-tip-bullet">PRO TIP:</span>
            <span>{currentChapter.tips}</span>
          </div>
        </div>

        {/* 4. CHAPTER SELECTOR TABS & ACTION FOOTER */}
        <div className="ug-footer">
          {/* Chapter Selector Tabs */}
          <div className="ug-chapter-tabs">
            {CHAPTERS.map((ch, idx) => {
              const Icon = ch.icon;
              const isActive = activeChapterIndex === idx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  className={`ug-tab-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleSelectChapter(idx)}
                >
                  <Icon size={13} />
                  <span>0{idx + 1}. {ch.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Controls & Launch Button */}
          <div className="ug-footer-actions">
            <div className="ug-stepper-btns">
              <button
                type="button"
                className="ug-step-btn"
                onClick={handlePrev}
                title="Previous Chapter"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="ug-step-btn"
                onClick={handleNext}
                title="Next Chapter"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              type="button"
              className="ug-launch-btn"
              onClick={() => {
                playClickSound(1200);
                onClose();
                onEnterOffice?.();
              }}
            >
              <Sparkles size={15} />
              <span>GOT IT · READY TO ENTER OFFICE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
