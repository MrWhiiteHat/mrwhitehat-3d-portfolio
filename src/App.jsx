import HackingCircuitAnnouncement from './components/easteregg/HackingCircuitAnnouncement.jsx';
import HackingCircuitHUD from './components/easteregg/HackingCircuitHUD.jsx';
import { STAGES, evaluateCircuit, NODE_TYPES } from './components/easteregg/circuitPuzzleLogic.js';
import {
  getCompletedStations,
  markStationCompleted,
  hasCompletedAllStations,
  isEasterEggDiscovered,
  markEasterEggDiscovered,
  isEasterEggCompleted,
  markEasterEggCompleted,
  resetEasterEggProgress,
  REQUIRED_STATIONS,
} from './components/easteregg/easterEggState.js';
import {
  playCircuitRotate,
  playCircuitPowerUp,
  playHostileShock,
  playLockRelease,
  playStageVictory,
  playFinalOverrideVictory,
  playTimerTick,
  playGlitchTransition,
} from './components/easteregg/easterEggAudio.js';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Award,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  Github,
  Mail,
  Minus,
  Plus,
  Radio,
  RotateCcw,
  Server,
  ShieldCheck,
  Skull,
  Sparkles,
  Terminal,
  Trophy,
  UserCheck,
  UserRound,
  Users,
  Volume2,
  VolumeX,
  Zap,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import OfficeScene from './components/OfficeScene.jsx';
import CharacterSelectModal from './components/game/CharacterSelectModal.jsx';
import GameHUD from './components/game/GameHUD.jsx';
import CyberLoadingScreen from './components/common/CyberLoadingScreen.jsx';
import LeaderboardModal from './components/leaderboard/LeaderboardModal.jsx';
import GadgetInspectorModal from './components/gadgets/GadgetInspectorModal.jsx';
import RecruiterDossierModal from './components/recruiter/RecruiterDossierModal.jsx';
import { profile } from './data.js';
import { useFullscreen } from './utils/useFullscreen.js';
import {
  isMuted,
  playAirlockDoorSound,
  playBreachFanfare,
  playClickSound,
  playHackingBeep,
  playWhooshSound,
  toggleAmbientHum,
  toggleMute,
} from './utils/audio.js';
import { THEME_KEYS, LIGHTING_THEMES } from './components/studio/CyberAtmosphere.jsx';
import {
  getVisitorCount,
  getVisitorLogs,
  registerNewVisitor,
  syncRemoteVisitorData,
} from './utils/visitorLogService.js';

const NAV_STATIONS = [
  { id: 'projects', label: 'Projects', icon: Code2, num: '1' },
  { id: 'skills', label: 'Skills', icon: BookOpen, num: '2' },
  { id: 'achievements', label: 'Awards', icon: Award, num: '3' },
  { id: 'about', label: 'About', icon: UserRound, num: '4' },
  { id: 'resume', label: 'Resume', icon: BriefcaseBusiness, num: '5' },
  { id: 'contact', label: 'Contact', icon: Mail, num: '6' },
  { id: 'operator', label: 'MrWhiteHat', icon: Terminal, num: '7' },
  { id: 'server_rack', label: 'Mainframe', icon: Server, num: '8' },
  { id: 'hardware_arsenal', label: 'Hardware', icon: Radio, num: '9' },
  { id: 'wireshark_monitor', label: 'Wireshark', icon: Activity, num: '0' },
  { id: 'visitor_log', label: 'Visitor Logs', icon: Users, num: 'V' },
];

export default function App() {
  // Loading & Pre-warming State
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isLoadingFinished, setIsLoadingFinished] = useState(false);

  // Game State Machine: 'CUSTOMIZE' | 'AIRLOCK_ENTRY' | 'EXPLORE' | 'INSPECT_STATION'
  const [gameState, setGameState] = useState('CUSTOMIZE');

  // Player customized avatar & telemetry
  const [playerData, setPlayerData] = useState({
    codename: 'MrWhiteHat',
    archetype: 'Alpha',
    archetypeName: 'Operative Alpha',
    visor: 'mono',
    accentColor: '#ff2244',
    themeKey: 'CYBER_NEON_NOIR',
  });

  const [isGateOpen, setIsGateOpen] = useState(false);
  const [activeProximity, setActiveProximity] = useState(null);
  const [unlockedStations, setUnlockedStations] = useState(() => new Set(getCompletedStations()));
  const mobileInputRef = useRef({ x: 0, y: 0 });
  const handleMobileMove = useCallback((pos) => {
    mobileInputRef.current = pos;
  }, []);

  // Persistent Visitor Logs & Wall Counter Telemetry
  const [visitorLogs, setVisitorLogs] = useState(() => getVisitorLogs());
  const [visitorCount, setVisitorCount] = useState(() => getVisitorCount());

  // Synchronize genuine cloud visitor count and real check-ins on mount
  useEffect(() => {
    syncRemoteVisitorData()
      .then((data) => {
        if (data) {
          if (typeof data.count === 'number') setVisitorCount(data.count);
          if (Array.isArray(data.logs) && data.logs.length > 0) setVisitorLogs(data.logs);
        }
      })
      .catch(() => {});
  }, []);

  // Station inspect & theme state
  const [section, setSection] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [themeKey, setThemeKey] = useState('CYBER_NEON_NOIR');
  const [muted, setAudioMuted] = useState(false);
  const [droneActive, setDroneActive] = useState(false);
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isGadgetInspectorOpen, setIsGadgetInspectorOpen] = useState(false);
  const [selectedGadgetId, setSelectedGadgetId] = useState('flipper');
  const [isRecruiterOpen, setIsRecruiterOpen] = useState(false);
  const stationMenuRef = useRef(null);

// Watch Dogs 2 3D Hacking Circuit State Machine
  const [hackerStageIndex, setHackerStageIndex] = useState(0);
  const [hackerNodeStates, setHackerNodeStates] = useState({});
  const [hackerSelectedNodeId, setHackerSelectedNodeId] = useState('s1_n1');
  const [hackerActiveVantageId, setHackerActiveVantageId] = useState('DESK_VIEW');
  const [hackerTimeLeft, setHackerTimeLeft] = useState(null);
  const [hackerIsPaused, setHackerIsPaused] = useState(false);
  const [hackerIsVictory, setHackerIsVictory] = useState(false);
  const [hackerIsGameOver, setHackerIsGameOver] = useState(false);
  const [hackerTotalElapsed, setHackerTotalElapsed] = useState(0);
  const preHackerStateRef = useRef({ themeKey: 'CYBER_NEON_NOIR', gameState: 'EXPLORE' });
  const hasSeenAnnouncementRef = useRef(false);
  const prevPoweredCountRef = useRef(1);
  const prevUnlockedSetRef = useRef(new Set());

  const currentHackerStage = STAGES[hackerStageIndex] || STAGES[0];
  const hackerEvaluation = useMemo(() => {
    return evaluateCircuit(currentHackerStage, hackerNodeStates);
  }, [currentHackerStage, hackerNodeStates]);

  const initHackerStage = useCallback((stageIdx) => {
    const stage = STAGES[stageIdx] || STAGES[0];
    setHackerStageIndex(stageIdx);
    setHackerActiveVantageId(stage.cameraPreset || 'DESK_VIEW');
    const initialStates = {};
    stage.nodes.forEach((n) => {
      initialStates[n.id] = {
        rotationIndex: n.rotationIndex,
        isLocked: n.isLocked || false,
      };
    });
    setHackerNodeStates(initialStates);
    setHackerSelectedNodeId(stage.nodes[1]?.id || null);
    setHackerTimeLeft(stage.timeLimit);
    setHackerIsPaused(false);
    setHackerIsVictory(false);
    setHackerIsGameOver(false);
    prevPoweredCountRef.current = 1;
    prevUnlockedSetRef.current = new Set();
  }, []);

  const handleInvestigateEasterEgg = useCallback(() => {
    markEasterEggDiscovered();
    preHackerStateRef.current = { themeKey, gameState: 'EXPLORE' };
    setThemeKey('HACKER_NETRUN');
    initHackerStage(0);
    setHackerTotalElapsed(0);
    setGameState('HACKING');
  }, [themeKey, initHackerStage]);

  const handleSkipEasterEgg = useCallback(() => {
    markEasterEggDiscovered();
    setGameState('EXPLORE');
  }, []);

  const handleLaunchEasterEgg = useCallback(() => {
    setIsLoadingFinished(true);
    playGlitchTransition();
    preHackerStateRef.current = { themeKey, gameState: 'EXPLORE' };
    setThemeKey('HACKER_NETRUN');
    initHackerStage(0);
    setHackerTotalElapsed(0);
    setGameState('HACKING');
  }, [themeKey, initHackerStage]);

  const handleExitHackerMode = useCallback(() => {
    playGlitchTransition();
    setThemeKey(preHackerStateRef.current.themeKey || 'CYBER_NEON_NOIR');
    setGameState('EXPLORE');
    setHackerIsPaused(false);
  }, []);

  const handleRotateHackerNode = useCallback((nodeId) => {
    const stage = STAGES[hackerStageIndex];
    if (!stage) return;
    const node = stage.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const isRotatable =
      node.type === NODE_TYPES.SWITCH_STRAIGHT ||
      node.type === NODE_TYPES.SWITCH_ELBOW ||
      node.type === NODE_TYPES.SWITCH_T ||
      (node.type === NODE_TYPES.LOCKED_ROUTER && !hackerNodeStates[nodeId]?.isLocked);
    if (!isRotatable) return;

    playCircuitRotate();

    setHackerNodeStates((prev) => {
      const currentRot = prev[nodeId]?.rotationIndex !== undefined ? prev[nodeId].rotationIndex : (node.rotationIndex || 0);
      const nextRot = (currentRot + 1) % 4;
      const nextStates = {
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          rotationIndex: nextRot,
        },
      };

      const ev = evaluateCircuit(stage, nextStates);

      if (ev.poweredConnectionIndices.size > prevPoweredCountRef.current) {
        playCircuitPowerUp();
      }
      prevPoweredCountRef.current = ev.poweredConnectionIndices.size;

      ev.unlockedNodeIds.forEach((uid) => {
        if (!prevUnlockedSetRef.current.has(uid)) {
          playLockRelease();
          prevUnlockedSetRef.current.add(uid);
        }
      });

      if (ev.isHostileTriggered) {
        playHostileShock();
        if (stage.timeLimit) {
          setHackerTimeLeft((t) => (typeof t === 'number' ? Math.max(0, t - 10) : t));
        }
      }

      if (ev.isTargetPowered) {
        if (hackerStageIndex < STAGES.length - 1) {
          playStageVictory();
        } else {
          playFinalOverrideVictory();
          markEasterEggCompleted();
        }
        setHackerIsVictory(true);
      }

      return nextStates;
    });
  }, [hackerStageIndex, hackerNodeStates]);

  const handleNextHackerStage = useCallback(() => {
    if (hackerStageIndex < STAGES.length - 1) {
      initHackerStage(hackerStageIndex + 1);
    }
  }, [hackerStageIndex, initHackerStage]);

  const handleResetHackerStage = useCallback(() => {
    initHackerStage(hackerStageIndex);
  }, [hackerStageIndex, initHackerStage]);

  // Auto-trigger announcement when all stations are genuinely breached
  useEffect(() => {
    if (hasCompletedAllStations(unlockedStations) && !hasSeenAnnouncementRef.current) {
      hasSeenAnnouncementRef.current = true;
      const timer = setTimeout(() => {
        setGameState('ANNOUNCEMENT');
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [unlockedStations]);

  const handleStationBreached = useCallback((stationId) => {
    markStationCompleted(stationId);
    setUnlockedStations((prev) => {
      const next = new Set([...prev, stationId]);
      if (hasCompletedAllStations(next) && !hasSeenAnnouncementRef.current) {
        hasSeenAnnouncementRef.current = true;
        setTimeout(() => {
          setGameState('ANNOUNCEMENT');
        }, 1200);
      }
      return next;
    });
  }, []);

  // Timer & countdown for stage 3
  useEffect(() => {
    if (gameState !== 'HACKING' || hackerIsPaused || hackerIsVictory || hackerIsGameOver) {
      return;
    }

    const timer = setInterval(() => {
      setHackerTotalElapsed((prev) => prev + 1);

      if (typeof hackerTimeLeft === 'number') {
        setHackerTimeLeft((prev) => {
          if (prev <= 1) {
            playHostileShock();
            setHackerIsGameOver(true);
            return 0;
          }
          if (prev <= 11) {
            playTimerTick(true);
          } else if (prev % 5 === 0) {
            playTimerTick(false);
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, hackerIsPaused, hackerIsVictory, hackerIsGameOver, hackerTimeLeft]);

  // Hacker mode dedicated keyboard handler
  useEffect(() => {
    if (gameState !== 'HACKING') return;

    const onHackerKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        setHackerIsPaused((prev) => !prev);
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === ' ') {
        if (hackerIsVictory) {
          if (hackerStageIndex < STAGES.length - 1) {
            handleNextHackerStage();
          } else {
            handleExitHackerMode();
          }
        } else if (hackerSelectedNodeId) {
          handleRotateHackerNode(hackerSelectedNodeId);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetHackerStage();
      } else if (e.key === '1') {
        setHackerActiveVantageId('DESK_VIEW');
      } else if (e.key === '2') {
        setHackerActiveVantageId('SERVER_WALL');
      } else if (e.key === '3') {
        setHackerActiveVantageId('CORNER_DRONE');
      } else if (e.key === '4') {
        setHackerActiveVantageId('ROOM_OVERVIEW');
      }
    };

    window.addEventListener('keydown', onHackerKey);
    return () => window.removeEventListener('keydown', onHackerKey);
  }, [
    gameState,
    hackerSelectedNodeId,
    hackerIsVictory,
    hackerStageIndex,
    handleRotateHackerNode,
    handleResetHackerStage,
    handleNextHackerStage,
    handleExitHackerMode,
  ]);


  const handleOpenRecruiter = useCallback(() => {
    playClickSound(1000);
    setIsRecruiterOpen(true);
  }, []);

  const handleCloseRecruiter = useCallback(() => {
    setIsRecruiterOpen(false);
  }, []);

  const handleToggleRecruiter = useCallback(() => {
    playClickSound(900);
    setIsRecruiterOpen((prev) => !prev);
  }, []);

  const handleOpenLeaderboard = useCallback(() => {
    playClickSound(1000);
    setIsLeaderboardOpen(true);
  }, []);

  const handleCloseLeaderboard = useCallback(() => {
    setIsLeaderboardOpen(false);
  }, []);

  const handleOpenGadgets = useCallback((gadgetId = 'flipper') => {
    playClickSound(1000);
    setSelectedGadgetId(gadgetId);
    setIsGadgetInspectorOpen(true);
  }, []);

  const handleCloseGadgets = useCallback(() => {
    setIsGadgetInspectorOpen(false);
  }, []);

  // Close station dropdown on click outside or Escape
  useEffect(() => {
    if (!isStationMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (stationMenuRef.current && !stationMenuRef.current.contains(e.target)) {
        setIsStationMenuOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setIsStationMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isStationMenuOpen]);

  // Fullscreen management across PC & Phone
  const { isFullscreen, toggleFullscreen, toastMessage } = useFullscreen();

  // 1. Theme Cycling
  const handleCycleTheme = useCallback(() => {
    playClickSound(1000);
    setThemeKey((prev) => {
      const idx = THEME_KEYS.indexOf(prev);
      const nextIdx = (idx + 1) % THEME_KEYS.length;
      return THEME_KEYS[nextIdx];
    });
  }, []);

  // 2. Audio Toggles
  const handleToggleMute = useCallback(() => {
    const nextMuted = toggleMute();
    setAudioMuted(nextMuted);
    if (!nextMuted) playClickSound(800);
  }, []);

  const handleToggleDrone = useCallback(() => {
    const active = toggleAmbientHum();
    setDroneActive(active);
    playClickSound(active ? 700 : 450);
  }, []);

  // 3. Game Launch from Character Customizer
  const handleStartGame = useCallback((customPlayerData) => {
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    setPlayerData(customPlayerData);
    if (customPlayerData.themeKey) {
      setThemeKey(customPlayerData.themeKey);
    }

    // Register real visitor entry with genuine hardware and geo telemetry
    registerNewVisitor(customPlayerData)
      .then((result) => {
        if (result) {
          setVisitorLogs(result.logs);
          setVisitorCount(result.count);
        }
      })
      .catch(() => {});

    playAirlockDoorSound();
    setIsGateOpen(true);
    setGameState('AIRLOCK_ENTRY');
  }, []);

  // 4. Airlock Entry Walk-in Complete -> Enter Free-Roam
  const handleAirlockEntryComplete = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    setGameState('EXPLORE');
  }, []);

  // 5. Station Proximity Interaction (Triggered by [E] or Click)
  const handleStationInteract = useCallback(
    (stationId) => {
      // Interactive Studio Appliances (AC, Fan, Lights)
      if (stationId === 'air_conditioner') {
        window.__TOGGLE_AC__?.();
        return;
      }
      if (stationId === 'ceiling_fan') {
        window.__TOGGLE_FAN__?.();
        return;
      }
      if (stationId === 'overhead_neon') {
        window.__TOGGLE_NEON__?.();
        return;
      }
      if (stationId === 'edison_lamp') {
        window.__TOGGLE_EDISON__?.();
        return;
      }
      if (stationId === 'floor_lamp') {
        window.__TOGGLE_FLOOR_LAMP__?.();
        return;
      }

      if (stationId === 'core') {
        handleCycleTheme();
        return;
      }
      if (stationId === 'hologram_drone' || stationId === 'operator') {
        playBreachFanfare();
        playWhooshSound();
        setSection('operator');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'operator']));
        return;
      }
      if (stationId === 'server_rack') {
        playHackingBeep(1800);
        playWhooshSound();
        setSection('server_rack');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'server_rack']));
        return;
      }
      if (stationId === 'hardware_arsenal') {
        playHackingBeep(1600);
        playWhooshSound();
        setSection('hardware_arsenal');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'hardware_arsenal']));
        return;
      }
      if (stationId === 'wireshark_monitor' || stationId === 'mitre_matrix') {
        playHackingBeep(1400);
        playWhooshSound();
        setSection('wireshark_monitor');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'wireshark_monitor']));
        return;
      }
      if (stationId === 'visitor_log') {
        playHackingBeep(1300);
        playWhooshSound();
        setSection('visitor_log');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'visitor_log']));
        return;
      }
      if (stationId === 'secret_vault' || stationId === 'secret_vent') {
        playBreachFanfare();
        playWhooshSound();
        setSection('secret_vault');
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, 'secret_vault']));
        return;
      }
      playWhooshSound();
      setSection(stationId);
      setGameState('INSPECT_STATION');
      setUnlockedStations((prev) => new Set([...prev, stationId]));
    },
    [handleCycleTheme]
  );

  // 6. Direct selection from 3D object click or hotspot
  const handleObjectSelect = useCallback((selection) => {
    if (!selection || !selection.section) return;
    playWhooshSound();
    setSection(selection.section);
    setGameState('INSPECT_STATION');
    setUnlockedStations((prev) => new Set([...prev, selection.section]));
  }, []);

  // 7. Close Station Inspector -> Return to First-Person Walking
  const handleClose = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
    playWhooshSound();
    setIsStationMenuOpen(false);
    setSection(null);
    setGameState('EXPLORE');
  }, []);

  // 8. Reset to Character Customizer / Studio Overview
  const handleResetToCustomize = useCallback(() => {
    playWhooshSound();
    setIsStationMenuOpen(false);
    setSection(null);
    setIsGateOpen(false);
    setGameState('CUSTOMIZE');
  }, []);

  // 9. Step Station (Next/Prev)
  const handleStepStation = useCallback(
    (direction) => {
      const ids = NAV_STATIONS.map((s) => s.id);
      playWhooshSound();
      setIsStationMenuOpen(false);
      if (!section) {
        const nextId = direction > 0 ? ids[0] : ids[ids.length - 1];
        setSection(nextId);
        setGameState('INSPECT_STATION');
        setUnlockedStations((prev) => new Set([...prev, nextId]));
        return;
      }
      const idx = ids.indexOf(section);
      if (idx === -1) {
        setSection(ids[0]);
        setGameState('INSPECT_STATION');
        return;
      }
      let nextIdx = idx + direction;
      if (nextIdx < 0) nextIdx = ids.length - 1;
      if (nextIdx >= ids.length) nextIdx = 0;
      const targetId = ids[nextIdx];
      setSection(targetId);
      setGameState('INSPECT_STATION');
      setUnlockedStations((prev) => new Set([...prev, targetId]));
    },
    [section]
  );

  // 10. Global Keyboard Shortcut Bindings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__SET_SECTION__ = handleStationInteract;
      window.__CLOSE_SECTION__ = handleClose;
      window.__CYCLE_THEME__ = handleCycleTheme;
      window.__TOGGLE_MUTE__ = handleToggleMute;
      window.__TOGGLE_FULLSCREEN__ = toggleFullscreen;
      window.__START_GAME__ = handleStartGame;
      window.__RESET_CUSTOMIZE__ = handleResetToCustomize;
      window.__TRIGGER_HACKER_EASTER_EGG__ = () => {
        setGameState('ANNOUNCEMENT');
      };
      window.__LAUNCH_HACKER_MODE__ = handleLaunchEasterEgg;
      window.__UNLOCK_ALL_HACKS__ = () => {
        REQUIRED_STATIONS.forEach((st) => markStationCompleted(st));
        setUnlockedStations(new Set(REQUIRED_STATIONS));
        setGameState('ANNOUNCEMENT');
      };
      window.__RESET_HACKER_EASTER_EGG__ = () => {
        resetEasterEggProgress();
        setUnlockedStations(new Set());
        setGameState('EXPLORE');
      };
    }

    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (gameState === 'HACKING' || gameState === 'ANNOUNCEMENT') return;

      if (e.key === 'Escape') {
        if (isLeaderboardOpen) {
          setIsLeaderboardOpen(false);
          return;
        }
        if (isGadgetInspectorOpen) {
          setIsGadgetInspectorOpen(false);
          return;
        }
        if (isStationMenuOpen) {
          setIsStationMenuOpen(false);
          return;
        }
        if (gameState === 'INSPECT_STATION') {
          handleClose();
        } else if (gameState === 'EXPLORE') {
          handleResetToCustomize();
        }
      } else if (e.key === '[' || (e.key === 'ArrowLeft' && gameState === 'INSPECT_STATION')) {
        handleStepStation(-1);
      } else if (e.key === ']' || (e.key === 'ArrowRight' && gameState === 'INSPECT_STATION')) {
        handleStepStation(1);
      } else if (e.key >= '1' && e.key <= '9') {
        const target = NAV_STATIONS[parseInt(e.key, 10) - 1];
        if (target) {
          handleStationInteract(target.id);
        }
      } else if (e.key === '0') {
        const target = NAV_STATIONS[9];
        if (target) {
          handleStationInteract(target.id);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 't' || e.key === 'T') {
        handleCycleTheme();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'l' || e.key === 'L') {
        handleOpenLeaderboard();
      } else if (e.key === 'g' || e.key === 'G') {
        handleOpenGadgets('flipper');

      } else if (e.key === 'r' || e.key === 'R') {
        handleToggleRecruiter();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    gameState,
    isStationMenuOpen,
    handleClose,
    handleStepStation,
    handleCycleTheme,
    handleToggleMute,
    toggleFullscreen,
    handleStartGame,
    handleResetToCustomize,
    handleStationInteract,
  ]);

  const currentTheme = LIGHTING_THEMES[themeKey] || LIGHTING_THEMES.CYBER_MATRIX;
  const activeStationObj = NAV_STATIONS.find((s) => s.id === section);
  const activeStationIndex = NAV_STATIONS.findIndex((s) => s.id === section);
  const ActiveStationIcon = activeStationObj?.icon || Terminal;

  return (
    <div className="portfolio-container">
      {/* Pure 3D Scene Viewport with Airlock, First-Person Walking, and In-Object Displays */}
      <OfficeScene
        gameState={gameState}
        onSelect={handleObjectSelect}
        onDeselect={handleClose}
        activeSection={section}
        onHover={setHovered}
        onReady={() => setIsSceneReady(true)}
        themeKey={themeKey}
        onCycleTheme={handleCycleTheme}
        isGateOpen={isGateOpen}
        onAirlockEntryComplete={handleAirlockEntryComplete}
        onProximityChange={setActiveProximity}
        onStationInteract={handleStationInteract}
        mobileInputRef={mobileInputRef}
        visitorLogs={visitorLogs}
        visitorCount={visitorCount}
        playerData={playerData}
        unlockedCount={unlockedStations.size}
        onOpenGadgets={handleOpenGadgets}
        onOpenLeaderboard={handleOpenLeaderboard}
        onOpenRecruiter={handleOpenRecruiter}
        hackerModeData={{
          isActive: gameState === 'HACKING',
          currentStage: currentHackerStage,
          nodeStates: hackerNodeStates,
          evaluation: hackerEvaluation,
          selectedNodeId: hackerSelectedNodeId,
          activeVantageId: hackerActiveVantageId,
          onSelectNode: (id) => setHackerSelectedNodeId(id),
          onRotateNode: handleRotateHackerNode,
        }}
        onStationBreached={handleStationBreached}
      />

      {/* 0. HIGH-TECH CYBER PRELOADER LOADING SCREEN (Pre-loads 3D models & pre-warms shaders) */}
      {!isLoadingFinished && (
        <CyberLoadingScreen
          isSceneReady={isSceneReady}
          onFinish={() => setIsLoadingFinished(true)}
        />
      )}

      {/* Fullscreen Toast HUD Indicator */}
      {toastMessage && (
        <div className="fullscreen-hud-toast">
          <Sparkles size={13} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. INITIAL: Character Customization & Deployment Modal (Reveals only after assets & shaders are 100% ready) */}
      {gameState === 'CUSTOMIZE' && isLoadingFinished && (
        <CharacterSelectModal
          onStartGame={handleStartGame}
          currentThemeKey={themeKey}
          onSetTheme={setThemeKey}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenLeaderboard={handleOpenLeaderboard}
          onOpenGadgets={handleOpenGadgets}
          onOpenRecruiter={handleOpenRecruiter}
          isEasterEggAvailable={isEasterEggDiscovered() || hasCompletedAllStations(unlockedStations)}
          onLaunchEasterEgg={handleLaunchEasterEgg}
        />
      )}

      {/* 2. AIRLOCK ENTRY CINEMATIC BANNER */}
      {gameState === 'AIRLOCK_ENTRY' && (
        <div className="airlock-cinematic-banner">
          <div className="cinematic-glitch-badge">
            <span className="cinematic-pulse-dot" />
            <span>BREACHING AIRLOCK // ENTERING STUDIO ARCHITECTURE</span>
          </div>
        </div>
      )}

      {/* 3. FREE-ROAM IN-GAME FIRST PERSON HUD */}
      {gameState === 'EXPLORE' && (
        <GameHUD
          playerData={playerData}
          activeProximity={activeProximity}
          onInteract={handleStationInteract}
          unlockedCount={unlockedStations.size}
          totalStations={11}
          visitorCount={visitorCount}
          onCycleTheme={handleCycleTheme}
          currentThemeName={currentTheme.name}
          muted={muted}
          onToggleMute={handleToggleMute}
          onResetView={handleResetToCustomize}
          onMobileMove={handleMobileMove}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenLeaderboard={handleOpenLeaderboard}
          onOpenGadgets={handleOpenGadgets}
          onOpenRecruiter={handleOpenRecruiter}
        />
      )}

      {/* 4. STATION INSPECTION HUD (When user approaches a terminal & interacts) */}
      {gameState === 'INSPECT_STATION' && (
        <header className="station-inspect-header">
          <button
            type="button"
            className="station-back-walk-btn"
            onClick={handleClose}
            title="Return to First-Person Free Roam (Esc)"
          >
            <ArrowLeft size={16} />
            <span className="station-back-btn-text">RETURN TO FREE ROAM [ESC]</span>
          </button>

          {/* STATION NAVIGATOR: Sleek, non-intrusive station cycler & dropdown (Zero game overlap) */}
          <div className="station-nav-switcher" ref={stationMenuRef}>
            <button
              type="button"
              className="station-step-arrow-btn"
              onClick={() => {
                handleStepStation(-1);
                setIsStationMenuOpen(false);
              }}
              title="Previous Station (← or [ )"
              aria-label="Previous Station"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              className={`station-selector-trigger ${isStationMenuOpen ? 'open' : ''}`}
              onClick={() => setIsStationMenuOpen((prev) => !prev)}
              title="Click to jump to any of the 11 stations"
              aria-haspopup="listbox"
              aria-expanded={isStationMenuOpen}
            >
              <span className="station-live-dot" />
              <ActiveStationIcon size={14} className="station-trigger-icon" />
              <span className="station-trigger-title">
                {activeStationObj?.label || section?.toUpperCase()}
              </span>
              <span className="station-trigger-count">
                {activeStationIndex >= 0 ? `${activeStationIndex + 1}/${NAV_STATIONS.length}` : ''}
              </span>
              <ChevronDown
                size={13}
                className={`station-trigger-chevron ${isStationMenuOpen ? 'rotate' : ''}`}
              />
            </button>

            <button
              type="button"
              className="station-step-arrow-btn"
              onClick={() => {
                handleStepStation(1);
                setIsStationMenuOpen(false);
              }}
              title="Next Station (→ or ] )"
              aria-label="Next Station"
            >
              <ChevronRight size={16} />
            </button>

            {/* Fast Jump Matrix Dropdown */}
            {isStationMenuOpen && (
              <div className="station-nav-dropdown" role="listbox">
                <div className="station-dropdown-header">
                  <span>TERMINAL MATRIX</span>
                  <span className="station-dropdown-total">11 SECTORS</span>
                </div>
                <div className="station-dropdown-grid">
                  {NAV_STATIONS.map((st) => {
                    const IconComp = st.icon;
                    const isCurrent = section === st.id;
                    const isBreached = unlockedStations.has(st.id);
                    return (
                      <button
                        key={st.id}
                        type="button"
                        className={`station-dropdown-card ${isCurrent ? 'is-current' : ''} ${
                          isBreached ? 'is-breached' : ''
                        }`}
                        onClick={() => {
                          playWhooshSound();
                          setSection(st.id);
                          setUnlockedStations((prev) => new Set([...prev, st.id]));
                          setIsStationMenuOpen(false);
                        }}
                        role="option"
                        aria-selected={isCurrent}
                      >
                        <div className="station-card-left">
                          <span className="station-card-num">{st.num}</span>
                          <IconComp size={15} className="station-card-icon" />
                          <span className="station-card-label">{st.label}</span>
                        </div>
                        <span className="station-card-status">
                          {isCurrent ? 'ACTIVE' : isBreached ? 'BREACHED' : 'ENCRYPTED'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="station-quick-controls">
            <button
              type="button"
              className="hud-action-btn"
              onClick={handleOpenRecruiter}
              title="Open Executive Recruiter Dossier (R)"
            >
              <BriefcaseBusiness size={15} style={{ color: '#34d399' }} />
            </button>
            <button
              type="button"
              className="hud-action-btn"
              onClick={handleOpenLeaderboard}
              title="Open Speedrun Leaderboard (L)"
            >
              <Trophy size={15} style={{ color: '#fbbf24' }} />
            </button>
            <button
              type="button"
              className="hud-action-btn"
              onClick={() => handleOpenGadgets('flipper')}
              title="Inspect 3D Hardware Tools (G)"
            >
              <Radio size={15} style={{ color: '#fb923c' }} />
            </button>
            <button
              className={`hud-action-btn ${isFullscreen ? 'active-appliance' : ''}`}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Full Screen [F]' : 'Enter Full Screen [F]'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              className="hud-action-btn"
              onClick={handleCycleTheme}
              title="Cycle Atmosphere (T)"
            >
              <Sparkles size={15} />
            </button>
            <button
              className={`hud-action-btn ${muted ? 'muted-btn' : ''}`}
              onClick={handleToggleMute}
              title={muted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </header>
      )}

      {/* 5. Minimal Top Header (Shown during CUSTOMIZE mode overview) */}
      {gameState === 'CUSTOMIZE' && isLoadingFinished && (
        <header className="minimal-header">
          <div className="brand-badge">
            <span className="brand-icon">
              <ShieldCheck size={18} />
            </span>
            <div className="brand-text">
              <span className="brand-title">{profile.name}</span>
              <span className="brand-subtitle">3D INTERACTIVE WORKSPACE</span>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="hud-recruiter-pill"
              onClick={handleOpenRecruiter}
              title="Open Executive Recruiter Dossier & Fast View (R)"
            >
              <BriefcaseBusiness size={13} />
              <span>RECRUITER DOSSIER (R)</span>
            </button>
            <button
              className={`hud-action-btn ${isFullscreen ? 'active-appliance' : ''}`}
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Full Screen [F]' : 'Enter Full Screen [F]'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <button
              className="hud-theme-pill"
              onClick={handleCycleTheme}
              title="Cycle Lighting Atmosphere (T)"
            >
              <Sparkles size={12} className="theme-sparkle-icon" />
              <span>{currentTheme.name.split('(')[1]?.replace(')', '') || 'Matrix'}</span>
            </button>

            <button
              className={`hud-action-btn ${muted ? 'muted-btn' : ''}`}
              onClick={handleToggleMute}
              title={muted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
              aria-label="Toggle Audio"
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <button
              className={`hud-action-btn ${droneActive ? 'active-drone-btn' : ''}`}
              onClick={handleToggleDrone}
              title="Toggle Ambient Server Drone Hum"
              aria-label="Toggle Server Hum"
            >
              <Radio size={15} />
            </button>

            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="hud-action-btn"
              title="GitHub Profile"
              aria-label="GitHub Profile"
            >
              <Github size={15} />
            </a>
          </div>
        </header>
      )}
      {/* Global Speedrun Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={handleCloseLeaderboard}
        playerData={playerData}
      />

      {/* 3D Interactive Tactical Hardware Gadgets Inspector Modal */}
      <GadgetInspectorModal
        isOpen={isGadgetInspectorOpen}
        initialGadget={selectedGadgetId}
        onClose={handleCloseGadgets}
      />

      {/* Executive Recruiter 2D Dossier Modal */}
      <RecruiterDossierModal
        isOpen={isRecruiterOpen}
        onClose={handleCloseRecruiter}
      />

      {/* Cinematic Glitch Announcement Modal */}
      {gameState === 'ANNOUNCEMENT' && (
        <HackingCircuitAnnouncement
          onInvestigate={handleInvestigateEasterEgg}
          onSkip={handleSkipEasterEgg}
        />
      )}

      {/* Watch Dogs 2 3D Hacking Circuit 2D HUD */}
      {gameState === 'HACKING' && (
        <HackingCircuitHUD
          currentStage={currentHackerStage}
          stageIndex={hackerStageIndex}
          totalStages={STAGES.length}
          nodeStates={hackerNodeStates}
          evaluation={hackerEvaluation}
          selectedNodeId={hackerSelectedNodeId}
          activeVantageId={hackerActiveVantageId}
          timeLeft={hackerTimeLeft}
          isPaused={hackerIsPaused}
          isVictory={hackerIsVictory}
          isGameOver={hackerIsGameOver}
          totalElapsedSeconds={hackerTotalElapsed}
          muted={muted}
          isFullscreen={isFullscreen}
          onSelectNode={(id) => setHackerSelectedNodeId(id)}
          onRotateNode={handleRotateHackerNode}
          onResetStage={handleResetHackerStage}
          onSelectVantage={(vid) => setHackerActiveVantageId(vid)}
          onTogglePause={() => setHackerIsPaused((prev) => !prev)}
          onToggleMute={handleToggleMute}
          onToggleFullscreen={toggleFullscreen}
          onExitHackerMode={handleExitHackerMode}
          onNextStage={handleNextHackerStage}
        />
      )}
    </div>
  );
}
