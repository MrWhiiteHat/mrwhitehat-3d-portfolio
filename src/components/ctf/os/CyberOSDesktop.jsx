import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Activity,
  Globe,
  Binary,
  KeyRound,
  Cpu,
  Radio,
  Flag,
  BriefcaseBusiness,
  LogOut,
  Maximize2,
  Minimize2,
  X,
  Minus,
  Sparkles,
  Wifi,
  Clock,
  Shield,
  FileText,
  Zap,
} from 'lucide-react';
import { playClickSound, playWhooshSound, playZapSound } from '../../../utils/audio.js';
import { ctfEngine } from '../../../utils/ctf/ctfEngine.js';

import CyberOSTerminal from './CyberOSTerminal.jsx';
import WiresharkApp from './WiresharkApp.jsx';
import BurpSuiteApp from './BurpSuiteApp.jsx';
import GhidraGdbApp from './GhidraGdbApp.jsx';
import CyberChefApp from './CyberChefApp.jsx';
import LogicAnalyzerApp from './LogicAnalyzerApp.jsx';
import SpectrogramApp from './SpectrogramApp.jsx';
import CTFMissionsApp from './CTFMissionsApp.jsx';

import './cyberOS.css';

// App Registry Definitions
const APP_REGISTRY = {
  terminal: {
    id: 'terminal',
    title: 'Kali Bash Terminal',
    icon: Terminal,
    category: 'System Tools',
    defaultSize: { w: 720, h: 480 },
    defaultPos: { x: 80, y: 60 },
  },
  wireshark: {
    id: 'wireshark',
    title: 'Wireshark Packet Analyzer',
    icon: Activity,
    category: 'Digital Forensics',
    defaultSize: { w: 840, h: 540 },
    defaultPos: { x: 120, y: 70 },
  },
  burp: {
    id: 'burp',
    title: 'Burp Suite Community v2026.1',
    icon: Globe,
    category: 'Web Exploitation',
    defaultSize: { w: 820, h: 520 },
    defaultPos: { x: 140, y: 80 },
  },
  ghidra: {
    id: 'ghidra',
    title: 'Ghidra & GDB Decompiler',
    icon: Binary,
    category: 'Reverse Engineering',
    defaultSize: { w: 820, h: 520 },
    defaultPos: { x: 160, y: 90 },
  },
  cyberchef: {
    id: 'cyberchef',
    title: 'CyberChef Cryptanalysis',
    icon: KeyRound,
    category: 'Cryptography',
    defaultSize: { w: 800, h: 500 },
    defaultPos: { x: 130, y: 75 },
  },
  logic: {
    id: 'logic',
    title: 'PulseView Logic Analyzer',
    icon: Cpu,
    category: 'Hardware Forensics',
    defaultSize: { w: 780, h: 490 },
    defaultPos: { x: 150, y: 85 },
  },
  spectrogram: {
    id: 'spectrogram',
    title: 'SonicVisualizer Audio Stego',
    icon: Radio,
    category: 'Steganography',
    defaultSize: { w: 740, h: 470 },
    defaultPos: { x: 170, y: 95 },
  },
  ctf: {
    id: 'ctf',
    title: 'CTF Mission Control Center',
    icon: Flag,
    category: 'Challenge Dashboard',
    defaultSize: { w: 840, h: 550 },
    defaultPos: { x: 100, y: 50 },
  },
};

export default function CyberOSDesktop({
  isOpen,
  onClose,
  initialApp = 'ctf',
  onOpenRecruiter = null,
  onOpenStation = null,
  onLaunchEasterEgg = null,
}) {
  const [openWindows, setOpenWindows] = useState({});
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isCrtEnabled, setIsCrtEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [ctfScore, setCtfScore] = useState(0);

  // Sync clock and CTF score
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
      const score = typeof ctfEngine?.getScore === 'function'
        ? ctfEngine.getScore()
        : (ctfEngine?.getState?.()?.score ?? 0);
      setCtfScore(score);
    };
    update();
    const timer = setInterval(update, 1000);
    const unsubscribe = ctfEngine?.subscribe?.((state) => {
      if (state && typeof state.score === 'number') {
        setCtfScore(state.score);
      }
    });
    return () => {
      clearInterval(timer);
      unsubscribe?.();
    };
  }, []);

  // Launch initial app when desktop opens
  useEffect(() => {
    if (isOpen) {
      const appToOpen = initialApp || 'ctf';
      openApp(appToOpen);
    }
  }, [isOpen, initialApp]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        // If start menu is open, close it first
        if (isStartMenuOpen) {
          setIsStartMenuOpen(false);
        } else if (Object.keys(openWindows).length === 0) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isStartMenuOpen, openWindows, onClose]);

  if (!isOpen) return null;

  const openApp = (appId) => {
    playClickSound(950);
    if (appId === 'netrun') {
      onClose?.();
      onLaunchEasterEgg?.();
      return;
    }
    const meta = APP_REGISTRY[appId] || APP_REGISTRY.terminal;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 850;

    setOpenWindows((prev) => {
      if (prev[appId]) {
        // Un-minimize if minimized
        return {
          ...prev,
          [appId]: { ...prev[appId], isMinimized: false, zIndex: Date.now() },
        };
      }
      return {
        ...prev,
        [appId]: {
          ...meta,
          isMinimized: false,
          isMaximized: isMobile,
          zIndex: Date.now(),
        },
      };
    });
    setActiveWindowId(appId);
    setIsStartMenuOpen(false);
  };

  const closeWindow = (appId) => {
    playClickSound(800);
    setOpenWindows((prev) => {
      const copy = { ...prev };
      delete copy[appId];
      return copy;
    });
    if (activeWindowId === appId) {
      const remaining = Object.keys(openWindows).filter((id) => id !== appId);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  const toggleMinimize = (appId) => {
    playClickSound(750);
    setOpenWindows((prev) => {
      if (!prev[appId]) return prev;
      const isMin = !prev[appId].isMinimized;
      return {
        ...prev,
        [appId]: { ...prev[appId], isMinimized: isMin },
      };
    });
    if (activeWindowId === appId) {
      setActiveWindowId(null);
    }
  };

  const toggleMaximize = (appId) => {
    playClickSound(800);
    setOpenWindows((prev) => {
      if (!prev[appId]) return prev;
      return {
        ...prev,
        [appId]: { ...prev[appId], isMaximized: !prev[appId].isMaximized },
      };
    });
  };

  const bringToFront = (appId) => {
    setActiveWindowId(appId);
    setOpenWindows((prev) => {
      if (!prev[appId]) return prev;
      return {
        ...prev,
        [appId]: { ...prev[appId], isMinimized: false, zIndex: Date.now() },
      };
    });
  };

  const renderAppContent = (appId) => {
    switch (appId) {
      case 'terminal':
        return (
          <CyberOSTerminal
            onOpenApp={openApp}
            onOpenStation={onOpenStation}
            onLaunchEasterEgg={() => {
              onClose?.();
              onLaunchEasterEgg?.();
            }}
          />
        );
      case 'wireshark':
        return <WiresharkApp onOpenStation={onOpenStation} />;
      case 'burp':
        return <BurpSuiteApp onOpenStation={onOpenStation} />;
      case 'ghidra':
        return <GhidraGdbApp onOpenStation={onOpenStation} />;
      case 'cyberchef':
        return <CyberChefApp onOpenStation={onOpenStation} />;
      case 'logic':
        return <LogicAnalyzerApp onOpenStation={onOpenStation} />;
      case 'spectrogram':
        return <SpectrogramApp onOpenStation={onOpenStation} />;
      case 'ctf':
        return <CTFMissionsApp onOpenApp={openApp} onOpenStation={onOpenStation} />;
      default:
        return (
          <CyberOSTerminal
            onOpenApp={openApp}
            onOpenStation={onOpenStation}
            onLaunchEasterEgg={() => {
              onClose?.();
              onLaunchEasterEgg?.();
            }}
          />
        );
    }
  };

  return (
    <div className="cos-desktop" onClick={() => isStartMenuOpen && setIsStartMenuOpen(false)}>
      {/* Optional CRT Scanlines */}
      {isCrtEnabled && <div className="cos-crt-scanlines" />}

      {/* Wallpaper Centerpiece */}
      <div className="cos-wallpaper-watermark">
        <h1>KALI // CYBER-OS</h1>
        <span>ADVANCED OFFENSIVE SECURITY & CTF PLAYGROUND</span>
      </div>

      {/* 1. TOP TASKBAR / PANEL */}
      <header className="cos-taskbar">
        {/* Left Side: Start Button & Active Task Tabs */}
        <div className="cos-taskbar-left">
          <button
            type="button"
            className="cos-start-btn"
            onClick={(e) => {
              e.stopPropagation();
              playClickSound(900);
              setIsStartMenuOpen((prev) => !prev);
            }}
            title="Applications Menu (Kali Security Tools)"
          >
            <Shield size={14} className="text-cyan-400" />
            <span>APPLICATIONS</span>
          </button>

          {/* Active Windows Switcher Tabs */}
          <div className="cos-taskbar-tasks">
            {Object.values(openWindows).map((win) => {
              const Icon = win.icon;
              const isActive = activeWindowId === win.id && !win.isMinimized;
              return (
                <button
                  key={win.id}
                  type="button"
                  onClick={() => {
                    if (win.isMinimized) bringToFront(win.id);
                    else if (activeWindowId === win.id) toggleMinimize(win.id);
                    else bringToFront(win.id);
                  }}
                  className={`cos-task-tab ${isActive ? 'is-active' : ''}`}
                >
                  <Icon size={12} />
                  <span>{win.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Score, Recruiter Dossier, Clock, Exit */}
        <div className="cos-taskbar-right">
          {/* CTF Score Pill */}
          <div className="cos-score-pill" title="Total CTF Points Scored">
            <Flag size={12} />
            <span>{ctfScore} PTS</span>
          </div>

          {/* Network Telemetry */}
          <div className="cos-hud-metric hidden sm:flex" title="Primary Network Interface">
            <Wifi size={12} className="text-cyan-400" />
            <span>eth0: 192.168.1.45</span>
          </div>

          {/* CRT Scanline Toggle */}
          <button
            type="button"
            className="cos-btn py-0.5 text-[10px] hidden md:inline-flex"
            onClick={() => setIsCrtEnabled((prev) => !prev)}
            title="Toggle Retro CRT Scanlines"
          >
            <span>CRT {isCrtEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Clock */}
          <div className="cos-hud-metric hidden md:flex" title="System Local Time">
            <Clock size={12} className="text-slate-400" />
            <span>{currentTime || '00:00:00'}</span>
          </div>

          {/* Recruiter Fast View Shortcut */}
          {onOpenRecruiter && (
            <button
              type="button"
              className="cos-recruiter-btn"
              onClick={() => {
                playClickSound(1000);
                onOpenRecruiter();
              }}
              title="Recruiter Fast View (Instant 2D Dossier, Projects & Resume)"
            >
              <BriefcaseBusiness size={12} />
              <span className="hidden sm:inline">RECRUITER DOSSIER</span>
              <span className="sm:hidden">DOSSIER</span>
            </button>
          )}

          {/* Exit to 3D Office */}
          <button
            type="button"
            className="cos-exit-btn"
            onClick={() => {
              playWhooshSound();
              onClose();
            }}
            title="Return to 3D Office Free Roam (ESC)"
          >
            <LogOut size={12} />
            <span>EXIT 3D</span>
          </button>
        </div>
      </header>

      {/* 2. START MENU DROPDOWN */}
      {isStartMenuOpen && (
        <div className="cos-start-menu" onClick={(e) => e.stopPropagation()}>
          <div className="cos-menu-header">
            <Shield size={16} />
            <span>KALI CYBER OS // SECURITY SUITE</span>
          </div>

          <div className="cos-menu-section-title">Core Applications</div>
          {Object.values(APP_REGISTRY).map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                className="cos-menu-item"
                onClick={() => openApp(app.id)}
              >
                <div className="cos-menu-item-left">
                  <Icon size={14} className="text-cyan-400" />
                  <span>{app.title}</span>
                </div>
                <span className="cos-menu-badge">{app.category}</span>
              </div>
            );
          })}

          <div className="border-t border-slate-800 my-1 pt-1" />

          {onOpenRecruiter && (
            <div
              className="cos-menu-item"
              onClick={() => {
                setIsStartMenuOpen(false);
                onOpenRecruiter();
              }}
            >
              <div className="cos-menu-item-left text-amber-300">
                <BriefcaseBusiness size={14} />
                <span>Executive Recruiter Dossier.pdf</span>
              </div>
              <span className="cos-menu-badge">Portfolio</span>
            </div>
          )}

          <div
            className="cos-menu-item text-rose-400"
            onClick={() => {
              setIsStartMenuOpen(false);
              onClose();
            }}
          >
            <div className="cos-menu-item-left">
              <LogOut size={14} />
              <span>Return to 3D Studio Office</span>
            </div>
            <span className="text-[9.5px]">ESC</span>
          </div>
        </div>
      )}

      {/* 3. DESKTOP AREA & ICONS */}
      <main className="cos-desktop-area">
        <div className="cos-desktop-icons">
          {Object.values(APP_REGISTRY).map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                className="cos-desktop-icon"
                onClick={() => openApp(app.id)}
                title={`Launch ${app.title}`}
              >
                <div className="cos-icon-graphic">
                  <Icon size={22} className="text-cyan-400" />
                </div>
                <span className="cos-icon-label">{app.title.split(' ')[0]}</span>
              </div>
            );
          })}

          {onOpenRecruiter && (
            <div
              className="cos-desktop-icon"
              onClick={() => {
                playClickSound(1000);
                onOpenRecruiter();
              }}
              title="Open Recruiter Dossier & Projects"
            >
              <div className="cos-icon-graphic" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                <BriefcaseBusiness size={22} className="text-amber-400" />
              </div>
              <span className="cos-icon-label">Recruiter Dossier</span>
            </div>
          )}
        </div>

        {/* 4. ACTIVE FLOATING WINDOWS */}
        {Object.values(openWindows).map((win) => {
          if (win.isMinimized) return null;
          const Icon = win.icon;
          const isActive = activeWindowId === win.id;

          return (
            <div
              key={win.id}
              onClick={() => bringToFront(win.id)}
              className={`cos-window ${isActive ? 'is-active-window' : ''} ${win.isMaximized ? 'is-maximized' : ''}`}
              style={{
                width: win.isMaximized ? '100%' : `${Math.min(win.defaultSize.w, typeof window !== 'undefined' ? window.innerWidth - 40 : 800)}px`,
                height: win.isMaximized ? '100%' : `${Math.min(win.defaultSize.h, typeof window !== 'undefined' ? window.innerHeight - 80 : 520)}px`,
                left: win.isMaximized ? 0 : `${Math.max(12, win.defaultPos.x)}px`,
                top: win.isMaximized ? 0 : `${Math.max(8, win.defaultPos.y)}px`,
                zIndex: win.zIndex,
              }}
            >
              {/* Window Titlebar */}
              <div className="cos-titlebar" onDoubleClick={() => toggleMaximize(win.id)}>
                <div className="cos-titlebar-title">
                  <Icon size={14} className="text-cyan-400" />
                  <span>{win.title}</span>
                </div>

                {/* Window Action Controls */}
                <div className="cos-titlebar-controls" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="cos-win-btn"
                    onClick={() => toggleMinimize(win.id)}
                    title="Minimize"
                  >
                    <Minus size={11} />
                  </button>
                  <button
                    type="button"
                    className="cos-win-btn"
                    onClick={() => toggleMaximize(win.id)}
                    title={win.isMaximized ? 'Restore' : 'Maximize'}
                  >
                    {win.isMaximized ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
                  </button>
                  <button
                    type="button"
                    className="cos-win-btn btn-close"
                    onClick={() => closeWindow(win.id)}
                    title="Close Window"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>

              {/* Window Body Container */}
              <div className="cos-window-body">
                {renderAppContent(win.id)}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
