import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { hotspots } from '../data.js';
import InObjectDisplay, { stationConfigs } from './InObjectDisplay.jsx';
import { playWhooshSound } from '../utils/audio.js';

// Handcrafted 3D Studio modules & Atmosphere
import StudioArchitecture from './studio/StudioArchitecture.jsx';
import WorkstationStation from './studio/WorkstationStation.jsx';
import ConferenceStation from './studio/ConferenceStation.jsx';
import ArchiveStation from './studio/ArchiveStation.jsx';
import ServerRackStation from './studio/ServerRackStation.jsx';
import CyberSentinelDrone from './studio/CyberSentinelDrone.jsx';
import LoungeStation from './studio/LoungeStation.jsx';
import PrinterStation from './studio/PrinterStation.jsx';
import CommsStation from './studio/CommsStation.jsx';
import DecorElements from './studio/DecorElements.jsx';
import CyberAtmosphere from './studio/CyberAtmosphere.jsx';
import StudioWallGraphicsAndCurtains from './studio/StudioWallGraphicsAndCurtains.jsx';
import FrontWallPanoramicFeature from './studio/FrontWallPanoramicFeature.jsx';
import AirConditionerUnit from './studio/AirConditionerUnit.jsx';
import VisitorWallCounter from './studio/VisitorWallCounter.jsx';
import AirlockGate from './game/AirlockGate.jsx';
import FirstPersonController from './game/FirstPersonController.jsx';

function HotspotPins({ onSelect, activeSection }) {
  const pinGroupRef = useRef();

  useFrame((state) => {
    if (!pinGroupRef.current) return;
    const time = state.clock.getElapsedTime();
    pinGroupRef.current.children.forEach((child, i) => {
      const basePos = hotspots[i]?.position || [0, 0, 0];
      child.position.y = basePos[1] + Math.sin(time * 2.4 + i * 0.9) * 0.08;
    });
  });

  if (activeSection) return null;

  return (
    <group ref={pinGroupRef} name="HotspotPins">
      {hotspots.map((h) => (
        <group key={h.id} position={h.position}>
          <Html center zIndexRange={[100, 0]}>
            <button
              className="hotspot-pin"
              onClick={(e) => {
                e.stopPropagation();
                playWhooshSound();
                onSelect({
                  section: h.id,
                  label: h.label,
                  point: new THREE.Vector3(...h.position),
                });
              }}
              title={`Open ${h.label}`}
              aria-label={`Open ${h.label}`}
            >
              <span className="hotspot-beacon" />
              <span className="hotspot-tag">
                <span className="hotspot-emoji">{h.icon}</span>
                <span className="hotspot-name">{h.label}</span>
              </span>
            </button>
          </Html>
        </group>
      ))}
    </group>
  );
}

// Hoisted temporary vectors for 60fps zero-allocation camera lerping
const _tempTarget = new THREE.Vector3();
const _tempCamDir = new THREE.Vector3();

function CameraDirector({
  gameState,
  activeSection,
  controlsRef,
  onAirlockEntryComplete,
}) {
  const { camera } = useThree();
  const desired = useRef(null);
  const isAnimating = useRef(false);
  const airlockStarted = useRef(false);
  const currentGazeTarget = useRef(new THREE.Vector3(0, 1.1, 0));

  const defaultCam = useMemo(() => new THREE.Vector3(10.2, 8.2, 10.2), []);
  const defaultTarget = useMemo(() => new THREE.Vector3(0, 1.1, 0), []);
  const airlockProgress = useRef(0);

  useEffect(() => {
    if (gameState === 'AIRLOCK_ENTRY') {
      // Position camera inside the enclosed airlock vestibule looking at the entrance doors
      camera.position.set(5.75, 1.68, -2.8);
      camera.lookAt(-0.5, 1.6, -0.6);
      currentGazeTarget.current.set(-0.5, 1.6, -0.6);

      desired.current = {
        startCamera: new THREE.Vector3(5.75, 1.68, -2.8),
        endCamera: new THREE.Vector3(3.4, 1.68, -2.6),
        startTarget: new THREE.Vector3(-0.5, 1.6, -0.6),
        endTarget: new THREE.Vector3(-0.5, 1.6, 0.4),
      };
      airlockProgress.current = 0;
      isAnimating.current = true;
      airlockStarted.current = true;
    } else if (gameState === 'INSPECT_STATION' && activeSection && stationConfigs[activeSection]) {
      const config = stationConfigs[activeSection];
      // Compute where camera is currently gazing so rotation interpolates continuously
      camera.getWorldDirection(_tempCamDir);
      currentGazeTarget.current.copy(camera.position).addScaledVector(_tempCamDir, 3.0);

      desired.current = {
        camera: new THREE.Vector3(...config.camPos),
        target: new THREE.Vector3(...config.camTarget),
      };
      isAnimating.current = true;
    } else if (gameState === 'EXPLORE') {
      isAnimating.current = false;
      desired.current = null;
    } else {
      camera.getWorldDirection(_tempCamDir);
      currentGazeTarget.current.copy(camera.position).addScaledVector(_tempCamDir, 4.0);
      desired.current = { camera: defaultCam.clone(), target: defaultTarget.clone() };
      isAnimating.current = true;
    }
  }, [gameState, activeSection, defaultCam, defaultTarget, camera, controlsRef]);

  useFrame((state, delta) => {
    if (gameState === 'EXPLORE') return;
    const clampedDelta = Math.min(delta, 0.033);

    // 1. Cinematic Airlock Walk-in Sequence
    if (gameState === 'AIRLOCK_ENTRY' && desired.current?.startCamera) {
      airlockProgress.current += clampedDelta / 2.6;
      const t = Math.min(1.0, airlockProgress.current);
      // Smoothstep easing (accelerates smoothly, glides in, decelerates to walk position)
      const ease = t * t * (3 - 2 * t);

      camera.position.lerpVectors(desired.current.startCamera, desired.current.endCamera, ease);
      camera.position.y = 1.68 + Math.sin(t * Math.PI * 4) * 0.02;

      _tempTarget.lerpVectors(
        desired.current.startTarget,
        desired.current.endTarget,
        ease
      );
      camera.lookAt(_tempTarget);

      if (t >= 1.0 && airlockStarted.current) {
        airlockStarted.current = false;
        isAnimating.current = false;
        camera.position.copy(desired.current.endCamera);
        camera.position.y = 1.68;
        onAirlockEntryComplete?.();
      }
      return;
    }

    // 2. Station Zoom or Overview lerp with continuous simultaneous gaze interpolation
    if (isAnimating.current && desired.current?.camera) {
      const speedFactor = -5.5;
      const alpha = 1 - Math.exp(speedFactor * clampedDelta);
      camera.position.lerp(desired.current.camera, alpha);

      if (gameState === 'CUSTOMIZE' && controlsRef.current) {
        controlsRef.current.target.lerp(desired.current.target, alpha);
        controlsRef.current.update();
      } else if (desired.current.target) {
        currentGazeTarget.current.lerp(desired.current.target, alpha);
        camera.lookAt(currentGazeTarget.current);
      }

      const distCam = camera.position.distanceTo(desired.current.camera);
      if (distCam < 0.025) {
        camera.position.copy(desired.current.camera);
        if (gameState === 'CUSTOMIZE' && controlsRef.current) {
          controlsRef.current.target.copy(desired.current.target);
          controlsRef.current.update();
        } else if (desired.current.target) {
          currentGazeTarget.current.copy(desired.current.target);
          camera.lookAt(desired.current.target);
        }
        isAnimating.current = false;
      }
    } else if (gameState === 'CUSTOMIZE' && !isAnimating.current) {
      if (controlsRef.current) controlsRef.current.update();
    }
  });

  return null;
}

// Smart Shadow Controller: Updates static shadows only when theme or scene state changes, saving ~35% GPU cycles
function ShadowController({ themeKey, isGateOpen, gameState }) {
  const { gl } = useThree();
  useEffect(() => {
    if (gl?.shadowMap) {
      gl.shadowMap.autoUpdate = false;
      gl.shadowMap.needsUpdate = true;
      const timer = setTimeout(() => {
        if (gl?.shadowMap) gl.shadowMap.needsUpdate = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [gl, themeKey, isGateOpen, gameState]);
  return null;
}

// Pre-compiles all scene shaders into GPU VRAM to eliminate first-interaction stutter
function ScenePrewarmer({ onSceneReady }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (gl && scene && camera) {
      try {
        gl.compile(scene, camera);
      } catch (err) {
        console.warn('Shader prewarm notice:', err);
      }
      onSceneReady?.();
    }
  }, [gl, scene, camera, onSceneReady]);
  return null;
}

function SceneContents({
  gameState = 'EXPLORE',
  onSelect,
  onDeselect,
  activeSection,
  onHover,
  controlsRef,
  themeKey,
  onCycleTheme,
  isGateOpen,
  onAirlockEntryComplete,
  onProximityChange,
  onStationInteract,
  mobileInput,
  mobileInputRef,
  visitorLogs = [],
  visitorCount = 1,
  playerData = null,
  onReady = null,
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__ZOOM_IN__ = () => {
        if (controlsRef.current && gameState === 'CUSTOMIZE') {
          controlsRef.current.dollyIn(1.22);
          controlsRef.current.update();
        }
      };
      window.__ZOOM_OUT__ = () => {
        if (controlsRef.current && gameState === 'CUSTOMIZE') {
          controlsRef.current.dollyOut(1.22);
          controlsRef.current.update();
        }
      };
    }
  }, [controlsRef, gameState]);

  return (
    <>
      <color attach="background" args={['#070a08']} />
      <ShadowController themeKey={themeKey} isGateOpen={isGateOpen} gameState={gameState} />
      <ScenePrewarmer onSceneReady={onReady} />

      {/* Dynamic Cyber Atmosphere: Lights, Motes, Ceiling Fan, Clock, Hologram Core */}
      <CyberAtmosphere currentThemeKey={themeKey} onCycleTheme={onCycleTheme} />

      {/* Handcrafted 3D Studio Architecture & Stations */}
      <group name="CyberCommandStudio">
        <StudioArchitecture currentThemeKey={themeKey} />
        <WorkstationStation onSelect={onSelect} onHover={onHover} />
        <ConferenceStation onSelect={onSelect} onHover={onHover} />
        <ArchiveStation onSelect={onSelect} onHover={onHover} />
        <ServerRackStation />
        <CyberSentinelDrone onSelect={onSelect} onHover={onHover} />
        <LoungeStation onSelect={onSelect} onHover={onHover} />
        <PrinterStation onSelect={onSelect} onHover={onHover} />
        <CommsStation onSelect={onSelect} onHover={onHover} />
        <Suspense fallback={null}>
          <DecorElements />
        </Suspense>
        <StudioWallGraphicsAndCurtains currentThemeKey={themeKey} />
        <Suspense fallback={null}>
          <FrontWallPanoramicFeature currentThemeKey={themeKey} />
        </Suspense>
        <AirConditionerUnit onSelect={onSelect} onHover={onHover} />

        {/* 3D Wall-Mounted Visitor Counter & Roster Terminal */}
        <VisitorWallCounter
          visitorCount={visitorCount}
          latestVisitor={visitorLogs[0] || null}
          currentThemeKey={themeKey}
          onSelect={onSelect}
          onHover={onHover}
        />

        {/* Animated Cyber Airlock Entrance Gate */}
        <AirlockGate isOpen={isGateOpen} />

        {/* First Person Walking Controller & Physics */}
        <FirstPersonController
          isActive={gameState === 'EXPLORE'}
          onProximityChange={onProximityChange}
          onInteract={onStationInteract}
          mobileInput={mobileInput}
          mobileInputRef={mobileInputRef}
        />

        {/* 3D Hotspot Pins (only in legacy Overview mode) */}
        {gameState === 'OVERVIEW' && (
          <HotspotPins onSelect={onSelect} activeSection={activeSection} />
        )}

        {/* Interactive In-Object Displays */}
        <InObjectDisplay
          activeSection={activeSection}
          onClose={onDeselect}
          onNavigate={(sec) => {
            playWhooshSound();
            onSelect({ section: sec });
          }}
          visitorLogs={visitorLogs}
          visitorCount={visitorCount}
          playerData={playerData}
        />

        {/* Studio Floor Contact Shadows - Baked once upon mount for 60fps performance */}
        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={0.65}
          scale={12}
          blur={1.8}
          far={5}
          frames={1}
        />
      </group>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={gameState === 'CUSTOMIZE'}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.65}
        zoomSpeed={0.75}
        panSpeed={0.65}
        enablePan={true}
        screenSpacePanning={true}
        minDistance={2.0}
        maxDistance={22}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.05}
      />
      <CameraDirector
        gameState={gameState}
        activeSection={activeSection}
        controlsRef={controlsRef}
        onAirlockEntryComplete={onAirlockEntryComplete}
      />
    </>
  );
}

export default function OfficeScene({
  gameState = 'EXPLORE',
  onSelect,
  onDeselect,
  activeSection,
  onHover,
  onReady,
  themeKey,
  onCycleTheme,
  isGateOpen,
  onAirlockEntryComplete,
  onProximityChange,
  onStationInteract,
  mobileInput,
  mobileInputRef,
  visitorLogs = [],
  visitorCount = 1,
  playerData = null,
}) {
  const controlsRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onReady?.();
    if (typeof window !== 'undefined') {
      window.THREE = THREE;
      window.__STUDIO_READY__ = true;
    }
  }, [onReady]);

  return (
    <div className="canvas-wrap">
      {failed ? (
        <div className="scene-fallback">
          <strong>3D workspace unavailable</strong>
          <p>WebGL encountered an issue initializing.</p>
        </div>
      ) : null}
      <Canvas
        shadows
        frameloop="always"
        performance={{ min: 0.5 }}
        dpr={[
          1,
          typeof window !== 'undefined'
            ? Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.25 : 1.5)
            : 1.25,
        ]}
        gl={{
          powerPreference: 'high-performance',
          antialias: true,
          stencil: false,
          depth: true,
          alpha: false,
          precision: 'highp',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.shadowMap.autoUpdate = false;
          gl.shadowMap.needsUpdate = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.15;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        camera={{ position: [10.2, 8.2, 10.2], fov: 34, near: 0.1, far: 100 }}
        onError={() => setFailed(true)}
      >
        <Suspense fallback={null}>
          <SceneContents
            gameState={gameState}
            onSelect={onSelect}
            onDeselect={onDeselect}
            activeSection={activeSection}
            onHover={onHover}
            controlsRef={controlsRef}
            themeKey={themeKey}
            onCycleTheme={onCycleTheme}
            isGateOpen={isGateOpen}
            onAirlockEntryComplete={onAirlockEntryComplete}
            onProximityChange={onProximityChange}
            onStationInteract={onStationInteract}
            mobileInput={mobileInput}
            mobileInputRef={mobileInputRef}
            visitorLogs={visitorLogs}
            visitorCount={visitorCount}
            playerData={playerData}
            onReady={onReady}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
